/* =============================================================================
   THE OMAN TRIP PLANNER — rule-based itinerary engine
   -----------------------------------------------------------------------------
   Takes: days, interests, fitness, vehicle, month, pace, swim, kids, base.
   Returns: a day-by-day plan with drive legs, timings, warnings and misses.

   It never invents a place. Every stop comes out of content.js, so whatever you
   add there becomes plannable automatically.

   HOW IT THINKS
   1. FILTER   — throw out anything the traveller physically can't do
                 (no 4×4 → no 4×4 spots; can't swim → no swim-only spots).
   2. SCORE    — rank what's left by interest match, season, and fitness fit.
   3. CLUSTER  — group by region so you don't drive Muscat→Sur→Nizwa→Sur.
   4. ROUTE    — walk the trip day by day with a real clock and a real drive
                 budget, relocating base overnight when the drive justifies it.
   5. RETURN   — always get them back to their departure city in time.
   ========================================================================== */

const Planner = (() => {

  const PACE = {
    chill:    { hours: 6.5,  label: "Chill",    note: "One thing a day, long lunches." },
    balanced: { hours: 9,    label: "Balanced", note: "A main event plus a couple of stops." },
    packed:   { hours: 11,   label: "Packed",   note: "Up early, in bed late." }
  };

  const HOP = 0.5;            // hours: driving between two spots in one region
  const DAY_START = 8;        // 08:00
  const MAX_DRIVE_IN_DAY = 4; // hours of driving before a day stops being a holiday

  /* ---------------------------------------------------------------- helpers */
  function drive(a, b) {
    if (a === b) return 0;
    const D = window.OMAN_DATA.driveMatrix;
    return (D[a + "|" + b] ?? D[b + "|" + a] ?? 180) / 60; // hours
  }

  function fmt(h) {
    const hh = Math.floor(h) % 24;
    const mm = Math.round((h - Math.floor(h)) * 60);
    const m = mm === 60 ? 0 : mm;
    const H = mm === 60 ? hh + 1 : hh;
    return String(H).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function dur(h) {
    if (h >= 1) {
      const m = Math.round((h % 1) * 60);
      return Math.floor(h) + "h" + (m ? " " + m + "m" : "");
    }
    return Math.round(h * 60) + "m";
  }

  /* ------------------------------------------------------------------ score */
  function score(spot, p) {
    let s = 0;

    // interest overlap — the biggest driver
    const hits = spot.tags.filter(t => p.interests.includes(t)).length;
    if (p.interests.length) {
      s += (hits / Math.min(spot.tags.length, p.interests.length)) * 5;
      if (hits === 0) s -= 2;   // not what they came for
    }

    // season: prefer spots in their best months, but only mildly punish the
    // rest — a summer trip should still get Wadi Shab, just at first light
    s += !spot.months || spot.months.includes(p.month) ? 2 : -1;

    // fitness fit — punish too hard, mildly punish way-too-easy for athletes
    const gap = spot.fitness - p.fitness;
    if (gap > 0) s -= gap * 2.2;
    else if (gap < -2) s -= 0.5;

    // guided-only stuff is a bigger ask
    if (spot.guide === "required") s -= 0.4;

    // a small nudge toward the things that are actually famous / worth it
    if (spot.free) s += 0.3;

    return s;
  }

  /* Can this spot be reached from the trip's base without a flight?
     Fly-in regions (Salalah, Musandam) are only reachable when they ARE the
     base — and from a fly-in base, everywhere else is a flight away too. */
  function inReach(spot, p) {
    const R = window.OMAN_DATA.regions;
    if ((R[p.base] || {}).fly) return spot.region === p.base;
    const reg = R[spot.region];
    return !(reg && reg.fly && spot.region !== p.base);
  }

  /* ----------------------------------------------------------------- filter */
  function eligible(spot, p) {
    if (spot.cat === "food") return false;              // food is a stop, not a day
    // Salalah and Musandam are separate flights, not day trips from Muscat.
    // Routing them in would produce a beautiful, impossible itinerary.
    if (!inReach(spot, p)) return false;
    if (spot.needs4x4 && !p.has4x4) return false;
    if (spot.swim && !p.canSwim) return false;
    if (p.kids && !spot.kidOk) return false;
    if (spot.fitness > p.fitness + 1) return false;     // hard gate: 1 level of stretch max
    // `months` is the spot's BEST season, not availability — locals do these
    // year-round by starting at dawn. Off-best spots stay routable; they get a
    // 🌡️ go-early note and the day starts earlier instead (see isHot/build).
    return true;
  }

  /* A spot outside its best months this trip = plan around the heat. */
  const isHot = (spot, p) => !!(spot.months && !spot.months.includes(p.month));

  /* [10,11,12,1,2,3,4] → "Oct–Apr". Falls back to listing when the months
     aren't one contiguous (calendar-circular) run. */
  const MON = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function monthsLabel(months) {
    if (!months || !months.length || months.length >= 12) return "year-round";
    const set = new Set(months);
    // a contiguous circular run has exactly one month whose predecessor is absent
    const starts = months.filter(m => !set.has(m === 1 ? 12 : m - 1));
    if (starts.length === 1) {
      const start = starts[0];
      const end = months.find(m => !set.has(m === 12 ? 1 : m + 1));
      return `${MON[start]}–${MON[end]}`;
    }
    return months.map(m => MON[m]).join(", ");
  }

  /* ------------------------------------------------------------------- plan */
  function build(p) {
    const D = window.OMAN_DATA;
    const all = D.spots.filter(s => s.cat !== "food");

    const dropped = { vehicle: [], swim: [], fitness: [], kids: [] };
    all.forEach(s => {
      if (s.needs4x4 && !p.has4x4) dropped.vehicle.push(s.name);
      else if (s.swim && !p.canSwim) dropped.swim.push(s.name);
      else if (p.kids && !s.kidOk) dropped.kids.push(s.name);
      else if (s.fitness > p.fitness + 1) dropped.fitness.push(s.name);
    });

    const pool = all
      .filter(s => eligible(s, p))
      .map(s => ({ spot: s, sc: score(s, p) }))
      .sort((a, b) => b.sc - a.sc);

    const budget = PACE[p.pace].hours;
    const home = p.base;
    let base = home;
    const used = new Set();
    const days = [];

    // How much more is left to see in a region? Used to justify relocating —
    // you don't move hotels for one spot, you move for a cluster.
    const depth = (region) =>
      pool.filter(c => !used.has(c.spot.id) && c.spot.region === region).length;

    // In the hot months the day shifts around the heat — which way depends on
    // the traveller. "early" is how locals do it: the wadi at first light,
    // shade and coffee at midday. "late" keeps the mornings slow and pushes
    // the hot stuff toward late afternoon instead. Salalah is the exception:
    // khareef summers are cool, drizzly and 25°C.
    const summer = [5, 6, 7, 8, 9].includes(p.month) && p.base !== "dhofar";
    const lateBird = summer && p.heatStyle === "late";
    const dayStart = summer ? (lateBird ? 9 : 6.5) : DAY_START;

    for (let d = 1; d <= p.days; d++) {
      const isLast = d === p.days;
      const daysLeft = p.days - d;
      const day = { n: d, base, legs: [], spots: [], driveHours: 0, note: "" };
      let clock = dayStart;

      /* ---- build the candidate list, distance-aware -------------------------
         Three ways to spend a day:
           roundtrip — drive out, do it, sleep in the same bed
           relocate  — drive out, do it, sleep the other side (bag comes too)
           last      — on the final day you MUST finish at the departure city,
                       so the only valid stops are ones you can route *through*
                       on the way home. This is what stops the planner sending
                       you Sur → Bidiyah → Sur → Muscat like an idiot.
      */
      const cands = [];
      for (const c of pool) {
        if (used.has(c.spot.id)) continue;
        const r = c.spot.hours;
        const reg = c.spot.region;
        const out = drive(base, reg);
        const homeward = drive(reg, home);

        // Hard visiting window (e.g. the Grand Mosque's 8–11am door): skip any
        // day where the drive out can't land inside it.
        const win = c.spot.visitWindow;
        if (win && Math.max(dayStart + out, win[0]) + r > win[1]) continue;

        if (isLast) {
          const cost = out + r + homeward;
          if (cost > budget) continue;
          if (c.spot.overnight) continue;                    // can't sleep out, we fly
          cands.push({ ...c, out, homeward, mode: "last", driveCost: out + homeward, total: cost });
        } else {
          if (!c.spot.overnight) {
            const rt = out * 2 + r;
            if (rt <= budget && out * 2 <= MAX_DRIVE_IN_DAY) {
              cands.push({ ...c, out, mode: "roundtrip", driveCost: out * 2, total: rt });
            }
          }
          const ow = out + r;
          if (ow <= budget && out <= MAX_DRIVE_IN_DAY && daysLeft >= 1) {
            cands.push({
              ...c, out,
              mode: c.spot.overnight ? "overnight" : "relocate",
              driveCost: out, total: ow
            });
          }
        }
      }

      // Effective score: what it's worth, minus what the driving costs you,
      // minus the friction of packing your bag, plus the pull of a region
      // that has more good things waiting in it.
      cands.forEach(c => {
        const moving = (c.mode === "relocate" || c.mode === "overnight") && c.spot.region !== base;
        c.eff = c.sc
              - 0.85 * c.driveCost
              - (moving ? 1.1 : 0)
              + 0.45 * Math.max(0, depth(c.spot.region) - 1);
      });
      cands.sort((a, b) => b.eff - a.eff);

      const anchor = cands[0];

      if (!anchor) {
        // Nothing left worth driving to. If we're camped out in the regions,
        // drift back toward the departure city — never strand someone out east
        // with a flight to catch.
        day.free = true;
        if (base !== home) {
          const back = drive(base, home);
          day.legs.push({
            type: "drive", t: clock, dur: back,
            title: `Drive back to ${D.regions[home].base}`,
            note: "Nothing new out this way — head back and take it easy."
          });
          clock += back;
          day.driveHours += back;
          base = home;
          day.end = clock;
        }
        day.note = "Free day around " + D.regions[home].base +
                   " — go back to the one you loved, find a beach, drink karak, do nothing. " +
                   "Every good Oman trip has one of these.";
        day.stayIn = D.regions[home].base;
        day.stayRegion = home;
        days.push(day);
        continue;
      }

      const reg = anchor.spot.region;
      let left = budget;

      /* ---- drive out --------------------------------------------------------- */
      if (anchor.out > 0) {
        day.legs.push({
          type: "drive", t: clock, dur: anchor.out,
          title: `Drive ${D.regions[base].base} → ${D.regions[reg].base}`,
          note: anchor.mode === "roundtrip" ? "There and back today — no bag needed."
              : anchor.mode === "last"      ? "Heading home the scenic way."
              : "You'll sleep this side tonight — bring the bag."
        });
        clock += anchor.out;
        day.driveHours += anchor.out;
        left -= anchor.out;
      }

      /* ---- pick the day's spots, THEN lay them out ------------------------------
         Selection: the anchor plus every same-region spot that fits the budget
         (reserving whatever driving still has to happen — home, or back to bed).
         Layout: heat-flagged spots take the earliest, coolest slots.            */
      const reserve = anchor.mode === "roundtrip" ? anchor.out
                    : anchor.mode === "last"      ? anchor.homeward
                    : 0;

      const picks = [anchor.spot];
      used.add(anchor.spot.id);
      left -= anchor.spot.hours;

      if (anchor.mode !== "overnight") {
        for (const c of pool) {
          if (used.has(c.spot.id)) continue;
          if (c.spot.region !== reg) continue;
          if (c.spot.overnight) continue;
          const cost = HOP + c.spot.hours;
          if (cost + reserve > left) continue;
          picks.push(c.spot);
          left -= cost;
          used.add(c.spot.id);
        }
      }

      // Layout order: fixed visiting windows first (they're immovable), then
      // heat-flagged spots take the coolest slots — first thing for the dawn
      // crowd, last thing for the late risers. The sort is stable, so score
      // order survives within each group.
      const heatSlot = s => (isHot(s, p) ? 1 : 0) * (lateBird ? -1 : 1);
      picks.sort((a, b) =>
        ((b.visitWindow ? 2 : 0) + heatSlot(b)) -
        ((a.visitWindow ? 2 : 0) + heatSlot(a)));

      let placed = 0;
      let lunchDone = false;
      picks.forEach(s => {
        // A hard visiting window (Grand Mosque 8–11am): wait for the doors if
        // we're early, and if the day can no longer fit it, put it back in the
        // pool for another day rather than scheduling a slot that can't happen.
        const win = s.visitWindow;
        if (win) {
          const start = Math.max(clock, win[0]);
          if (start + s.hours > win[1]) { used.delete(s.id); return; }
          if (start - clock >= 0.5) {
            day.legs.push({ type: "note", icon: "☕", t: clock, title: "Slow breakfast", note: `Visitor doors open at ${fmt(win[0])} — no rush this morning.` });
          }
          clock = start;
        }

        if (placed > 0) {
          day.legs.push({ type: "drive", t: clock, dur: HOP, title: "Short hop", note: "Same area — barely a drive." });
          clock += HOP;
          day.driveHours += HOP;
        }

        // A real lunch once the clock crosses midday — a food spot from the
        // guide when today's region has one, honest street-food advice when
        // it doesn't. (Skipped on the flight-home day; that one runs tight.)
        if (!lunchDone && placed > 0 && clock >= 12 && !isLast) {
          lunchDone = true;
          const f = lunchSpot(p, reg, used);
          if (f) {
            day.legs.push({ type: "spot", t: clock, dur: 1, spot: f, title: "Lunch — " + f.name, note: f.tagline });
            day.spots.push(f);
            used.add(f.id);
            clock += 1;
          } else {
            day.legs.push({ type: "note", icon: "🍽️", t: clock, title: "Lunch break", note: `Shawarma, grilled chicken or karak in ${D.regions[reg].base} — cheap, everywhere, exactly right.` });
            clock += 0.75;
          }
        }

        addSpot(day, s, clock, isHot(s, p), win ? `🕌 Visitor window ${fmt(win[0])}–${fmt(win[1])} — this slot is fixed. Closed Fridays.` : null);
        clock += s.hours;
        placed++;
      });

      /* ---- where do we sleep? -------------------------------------------------- */
      if (anchor.mode === "overnight") {
        day.legs.push({ type: "sleep", t: clock, title: "Night in the dunes", note: "Dinner, stars, no signal. This is the bit people remember." });
        base = reg;
        day.stayIn = D.regions[reg].base;
        day.stayRegion = reg;

      } else if (anchor.mode === "relocate") {
        base = reg;
        day.stayIn = D.regions[reg].base;
        day.stayRegion = reg;
        day.legs.push({ type: "sleep", t: clock, title: "Stay in " + D.regions[reg].base, note: "Closer to tomorrow this way." });

      } else if (anchor.mode === "last") {
        if (anchor.homeward > 0) {
          day.legs.push({
            type: "drive", t: clock, dur: anchor.homeward,
            title: `Drive back to ${D.regions[home].base}`, note: "Home in time for the flight."
          });
          clock += anchor.homeward;
          day.driveHours += anchor.homeward;
        }
        base = home;
        day.stayIn = D.regions[home].base;
        day.stayRegion = home;

      } else { // roundtrip
        if (anchor.out > 0) {
          day.legs.push({
            type: "drive", t: clock, dur: anchor.out,
            title: `Drive back to ${D.regions[base].base}`, note: ""
          });
          clock += anchor.out;
          day.driveHours += anchor.out;
        }
        day.stayIn = D.regions[base].base;
        day.stayRegion = base;
      }

      /* ---- the evening -------------------------------------------------------
         Souq at dusk, a sunset café, a proper dinner — whatever's good where
         tonight's bed is. This is what makes a day read like a holiday, not a
         spreadsheet row. Skipped in the dunes (the dunes ARE the evening) and
         on the flight-home day. */
      if (!isLast && anchor.mode !== "overnight" && day.stayRegion) {
        const evT = Math.max(clock, 17.5);
        if (evT <= 20) {
          const ev = eveningSpot(p, day.stayRegion, used);
          if (ev) {
            day.legs.push({ type: "spot", t: evT, dur: ev.hours, spot: ev, title: "Evening — " + ev.name, note: ev.tagline });
            day.spots.push(ev);
            used.add(ev.id);
            clock = evT + ev.hours;
          }
        }
      }

      day.end = clock;
      days.push(day);
    }

    /* ---- the honest upsell: what they didn't have time for -------------------- */
    const missed = pool
      .filter(c => !used.has(c.spot.id) && c.sc > 1)
      .slice(0, 8)
      .map(c => c.spot);

    /* ---- warnings -------------------------------------------------------------- */
    const warnings = [];
    const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

    if ([6,7,8].includes(p.month) && p.base !== "dhofar") {
      warnings.push(p.heatStyle === "late"
        ? `${MONTHS[p.month]} is brutally hot inland, so this plan runs on your late clock: slow mornings, the hottest spots pushed to the end of the day, and midday for shade, food and AC. Drink more than you think you need.`
        : `${MONTHS[p.month]} is brutally hot inland, so this plan runs on the summer clock: days start at 06:30, the hottest spots get the earliest slots, and midday is for shade, food and AC. Drink more than you think you need.`);
    }
    if (p.base === "dhofar" && [6,7,8,9].includes(p.month)) {
      warnings.push(`🌿 Khareef: expect drizzle, fog and green hillsides — pack a light rain layer and patience for the traffic near the waterfalls. The mountain viewpoints (Jabal Samhan) sit inside the fog in July–August; save them for a clear morning.`);
    }
    const heatTimed = [];
    days.forEach(d => d.spots.forEach(s => { if (isHot(s, p) && s.region !== "dhofar") heatTimed.push(s.name); }));
    if (heatTimed.length) {
      warnings.push(`🌡️ ${MONTHS[p.month]} isn't the best month for ${heatTimed.slice(0,3).join(", ")}${heatTimed.length>3 ? ` and ${heatTimed.length-3} more` : ""} — still absolutely doable, just go at first light or after 4pm. Each one is marked in the plan.`);
    }
    if (!p.has4x4 && dropped.vehicle.length) {
      warnings.push(`Without a 4×4 you lose ${dropped.vehicle.length} spot${dropped.vehicle.length>1?"s":""} (${dropped.vehicle.slice(0,3).join(", ")}). Worth the upgrade if the budget stretches.`);
    }
    if (!p.canSwim && dropped.swim.length) {
      warnings.push(`Most Omani wadis are swim-in. Skipping the water rules out ${dropped.swim.length} of them — the coast and the culture days still work beautifully.`);
    }

    const freeDays = days.filter(d => d.free).length;
    if (freeDays >= 2) {
      warnings.push(`You've got ${freeDays} more days than there are spots that fit your filters. Loosen a filter (a 4×4 opens the most), or use the time properly — Salalah, Musandam, or a second run at your favourite.`);
    }

    days.forEach(d => {
      if (d.driveHours > MAX_DRIVE_IN_DAY) {
        warnings.push(`Day ${d.n} is ${dur(d.driveHours)} behind the wheel. That's a driving day with a swim in it — go in knowing that.`);
      }
    });

    const flyOut = all.filter(s => !inReach(s, p));
    if (flyOut.length) {
      const names = flyOut.map(s => s.name);
      const listed = names.slice(0, 4).join(", ") + (names.length > 4 ? ` and ${names.length - 4} more` : "");
      warnings.push(p.base === "dhofar"
        ? `Not routed: ${listed} — they're up north. This plan stays around Salalah; the north is its own trip.`
        : `Not routed: ${listed}. Salalah and Musandam need their own flight — they're in the guide, but they're a separate trip, not a day out of Muscat.`);
    }


    // Anything with a hard, narrow opening window needs flagging by name —
    // the plan gives a time, and the traveller will believe it.
    const tight = [];
    days.forEach(d => d.spots.forEach(s => {
      if (s.closedFridays) tight.push(`${s.name} (day ${d.n})`);
    }));
    if (tight.length) {
      warnings.push(`🕌 ${tight.join(", ")}: visitor hours are 8–11am only, and it's closed on Fridays and public holidays. If your day lands on a Friday, swap it — that's a three-hour window with no second chance.`);
    }

    if (days.some(d => d.spots.some(s => s.cat === "wadis"))) {
      warnings.push("⚠️ Flash floods are the real danger in a wadi. If rain is forecast anywhere upstream, don't go in. No photo is worth it.");
    }

    return {
      days, missed, warnings, dropped,
      totalDrive: days.reduce((a, d) => a + d.driveHours, 0),
      totalSpots: days.reduce((a, d) => a + d.spots.length, 0),
      pace: PACE[p.pace],
      prefs: p
    };
  }

  /* A real lunch stop: an unused food spot in today's region. */
  function lunchSpot(p, region, used) {
    return window.OMAN_DATA.spots.find(s =>
      s.cat === "food" && s.region === region && !used.has(s.id) &&
      (!p.kids || s.kidOk) && s.hours <= 2);
  }

  /* Something good for the evening where tonight's bed is: a dinner spot from
     the guide, the souq at dusk, a sunset café. Low effort by design — nobody
     wants a fitness-4 activity at 6pm. */
  function eveningSpot(p, region, used) {
    const D = window.OMAN_DATA;
    let best = null, bestSc = -Infinity;
    D.spots.forEach(s => {
      if (used.has(s.id) || s.region !== region || s.overnight) return;
      if (s.hours > 2.5 || s.fitness > 2 || s.swim) return;
      if (p.kids && !s.kidOk) return;
      if (s.needs4x4 && !p.has4x4) return;
      if (s.visitWindow) return;                       // morning-window places aren't evenings
      const fits = s.cat === "food" || s.tags.some(t => ["sunset", "culture", "shopping"].includes(t));
      if (!fits) return;
      const sc = score(s, p);
      if (sc > bestSc) { bestSc = sc; best = s; }
    });
    return best;
  }

  function addSpot(day, spot, clock, hot, fixNote) {
    day.legs.push({
      type: "spot", t: clock, dur: spot.hours,
      spot, title: spot.name, note: spot.tagline,
      fixNote: fixNote || null,
      // Dhofar runs on the opposite calendar: off-months mean "not green",
      // not "dangerously hot" — different advice entirely.
      heatNote: hot ? (spot.region === "dhofar"
        ? `🌿 Greenest ${monthsLabel(spot.months)} (khareef) — beautiful outside it too, just not green.`
        : `🌡️ Best ${monthsLabel(spot.months)} — this month go at first light or after 4pm, and skip the midday hours.`) : null
    });
    day.spots.push(spot);
  }

  return { build, PACE, fmt, dur, monthsLabel, isHot };
})();

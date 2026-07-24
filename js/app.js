/* =============================================================================
   APP — routing, rendering, the paywall veil, the planner UI, the About page
   ========================================================================== */
(() => {
  const D = window.OMAN_DATA;
  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  /* Every affiliate link goes out the door wearing your name tag — utm_* and
     your personal ref code from meta.affRef, so the operator's dashboard (and
     your commission) can attribute the click. Skips params that are empty and
     leaves whatever the URL already carries untouched. */
  function affLink(url) {
    if (!url) return url;
    const ref = (D.meta.affRef || {});
    try {
      const u = new URL(url);
      ["utm_source", "utm_medium", "ref"].forEach(k => {
        if (ref[k] && !u.searchParams.has(k)) u.searchParams.set(k, ref[k]);
      });
      return u.toString();
    } catch { return url; }
  }

  /* "Use code HUSSAIN10 — 10% off" chip, rendered after affiliate buttons
     once a code exists in meta.affRef. Empty code = empty string. */
  function discountChip() {
    const ref = (D.meta.affRef || {});
    if (!ref.discountCode) return "";
    return `<span class="discount-chip">🎟️ ${esc(ref.discountLabel || "Discount with code")} <strong>${esc(ref.discountCode)}</strong></span>`;
  }

  const view = $("#view");
  let query = "";

  /* Wipe the view. Explicit node removal rather than innerHTML = "" — it also
     drops the event handlers, so nothing from the last render can survive into
     the next one. Every render* function starts here. */
  function clearView() {
    while (view.firstChild) view.removeChild(view.firstChild);
    view.innerHTML = "";
  }

  /* ------------------------------------------------------------------ toast */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.hidden = true), 2600);
  }

  /* ------------------------------------------------------------------ items
     A tab declares which spot categories it contains (`cats`). Explore holds
     six of them; Salalah holds one. The type chips do the rest. */
  function itemsFor(tabId) {
    const meta = D.categories.find(c => c.id === tabId) || {};
    const cats = meta.cats || [tabId];
    const list = tabId === "itineraries" ? D.itineraries : D.spots.filter(s => cats.includes(s.cat));
    if (!query) return list;
    const q = query.toLowerCase();
    // Locked items are excluded from search — matching by name would confirm
    // what's behind the paywall ("Mibam" → 1 locked result = the name leaked).
    return list.filter(s =>
      isUnlocked(s) &&
      (s.name + " " + s.tagline + " " + (s.blurb || "") + " " + (s.sub || "") +
       " " + (s.type || "") + " " + (s.tags || []).join(" "))
        .toLowerCase().includes(q)
    );
  }

  /* --------------------------------------------------------- filtering
     TWO levels, on purpose:

     GROUP  the broad bucket — Wadis, Beaches, Mountains, Experiences, Food,
            Shopping. This is what the FILTER CHIPS are: six of them, not twenty.
            A spot's group is its `cat`, unless it carries an explicit `group`
            (the Salalah spots do — they're all cat:"salalah", but a beach in
            Dhofar is still a beach).

     TYPE   the fine sub-tag — Canyon, Waterfall, Mall, Souq, Coffee, Fort…
            It is NOT a filter chip. It's the little chip ON the card, telling
            you what kind of thing this particular one is.                     */
  let typeFilter = null;              // holds a GROUP id; null = "All"

  const GROUPS = {
    wadis:       { label: "Wadis",       icon: "💧" },
    beaches:     { label: "Beaches",     icon: "🏖️" },
    mountains:   { label: "Mountains",   icon: "⛰️" },
    experiences: { label: "Experiences", icon: "⭐" },
    food:        { label: "Food",        icon: "🍽️" },
    shopping:    { label: "Shopping",    icon: "🛍️" },
    salalah:     { label: "Salalah",     icon: "🌴" },
    itineraries: { label: "Itineraries", icon: "🗺️" }
  };

  const groupOf = item => item.group || item.cat || "itineraries";
  const groupLabel = g => (GROUPS[g] ? GROUPS[g].icon + " " + GROUPS[g].label : g);

  const TYPE_ICON = {
    "Beach": "🏖️", "Mountain": "⛰️", "Wadi": "💧", "Waterfall": "🌊", "Canyon": "🧗",
    "Cave": "🕳️", "Spring": "🌿", "Viewpoint": "👁️", "Village": "🏡", "Fort": "🏰",
    "Museum": "🏛️", "Ruins": "🏺", "Mosque": "🕌", "Souq": "🛍️", "Mall": "🏬",
    "Shop": "🛒", "Desert": "🐪", "Snorkel": "🐠", "Boat trip": "⛵",
    "Swim spot": "🏊", "Wildlife": "🐢", "Nature": "🌳", "Hike": "🥾", "Dam": "🏞️",
    "Coffee": "☕", "Omani food": "🍲", "Dinner": "🍽️", "Sweets": "🍬"
  };
  const typeChipLabel = t => (TYPE_ICON[t] ? TYPE_ICON[t] + " " : "") + t;

  /* The GROUPS present in a tab, in the order they're declared above (so the
     chips always read Wadis → Beaches → Mountains → Experiences → Food →
     Shopping, never a jumble that reshuffles as spots are added). */
  function typesIn(items) {
    const counts = new Map();
    items.forEach(i => {
      const g = groupOf(i);
      counts.set(g, (counts.get(g) || 0) + 1);
    });
    const order = Object.keys(GROUPS);
    return [...counts.entries()]
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([t, n]) => ({ type: t, n }));
  }

  /* List ⇄ Map. The map isn't a tab any more — it's a view of the tab you're on,
     showing exactly the spots you've filtered to. */
  let viewMode = "list";

  function viewSwitch(onChange) {
    const w = el("div", "viewswitch");
    [["list", "☰", "List"], ["map", "📍", "Map"]].forEach(([mode, icon, label]) => {
      const b = el("button", "vs" + (viewMode === mode ? " on" : ""), `${icon} <span>${label}</span>`);
      b.type = "button";
      b.setAttribute("aria-pressed", viewMode === mode ? "true" : "false");
      b.onclick = () => {
        if (viewMode === mode) return;
        viewMode = mode;
        if (window.Analytics) Analytics.track("view_mode", { mode: mode });
        onChange();
      };
      w.appendChild(b);
    });
    return w;
  }

  /* The filter row. Hidden when a tab has fewer than two types (nothing to
     filter) — no point showing "All / Wadi" on a single-type tab. */
  function typeFilterRow(items, onChange) {
    const types = typesIn(items);
    if (types.length < 2) return null;

    const row = el("div", "typefilter");
    const mk = (label, value, count) => {
      const b = el("button", "tfchip" + (typeFilter === value ? " on" : ""),
        `${esc(label)} <span class="tfn">${count}</span>`);
      b.type = "button";
      b.setAttribute("aria-pressed", typeFilter === value ? "true" : "false");
      b.onclick = () => {
        typeFilter = (typeFilter === value) ? null : value;   // tap again = clear
        if (window.Analytics && value) Analytics.track("type_filter", { group: value || "all" });
        onChange();
      };
      return b;
    };
    row.appendChild(mk("All", null, items.length));
    types.forEach(t => row.appendChild(mk(groupLabel(t.type), t.type, t.n)));
    return row;
  }

  /* ------------------------------------------------------------------ steps
     Nobody reads a wall of text on a phone at 6am. Any field that can be a
     paragraph can instead be an ARRAY of short lines, and it renders as a
     numbered step list. Strings still work — they just render as one line.
        gettingThere: ["Drive the coast road east, ~1h20 from Muscat.",
                       "Park at the free lot by the bridge.",
                       "Take the boat across — 1 OMR return."]                */
  function steps(v, cls) {
    if (Array.isArray(v)) {
      if (!v.length) return "";
      return `<ol class="${cls || "steplist"}">` +
             v.map(s => `<li>${esc(s)}</li>`).join("") + `</ol>`;
    }
    return `<p class="body">${esc(v)}</p>`;
  }

  /* Same idea, but bulleted and unnumbered — for "what you'll do" style lists
     and the tab intros, where order doesn't matter. */
  function bullets(v, cls) {
    if (Array.isArray(v)) {
      if (!v.length) return "";
      return `<ul class="${cls || "bulletlist"}">` +
             v.map(s => `<li>${esc(s)}</li>`).join("") + `</ul>`;
    }
    return `<p class="body">${esc(v)}</p>`;
  }

  /* One product now: a key unlocks everything. */
  const isUnlocked = item => item.free || Unlock.hasBundle();

  /* Locked items render as anonymous "hidden spot" cards — no name, photo,
     location or stats until purchase. The names still exist in the shipped
     data files (accepted trade-off of the static paywall), but nothing in
     the UI reveals them. */
  const SINGULAR = { wadis: "wadi", beaches: "beach", mountains: "mountain spot",
                     salalah: "Salalah spot", experiences: "experience",
                     food: "food spot", shopping: "shop", itineraries: "itinerary" };
  const singularOf = item => SINGULAR[item.cat || "itineraries"] || "spot";

  /* ------------------------------------------------------------- price block
     ONE product. One price, one key, everything. */
  const lockedCount = () => D.spots.filter(s => !s.free).length +
                            (D.itineraries || []).filter(i => !i.free).length;

  function priceBlock(_cat, compact) {
    const w = el("div", "pricebox one" + (compact ? " compact" : ""));
    w.innerHTML = `
      <div class="price-opt best">
        <div class="price-badge">One payment · updates free forever</div>
        <div class="price-opt-head">
          <span class="price-name">Exploring Oman — the full guide</span>
          <span class="price-tag">${D.meta.bundlePrice}</span>
        </div>
        <ul class="bulletlist">
          <li>All <strong>${lockedCount()}</strong> locked spots — the remote wadis, the empty beaches, the mountain villages, the south.</li>
          <li>Every itinerary: 3-day, 5-day and the 7-day loop.</li>
          <li><strong>The trip Planner</strong> — a route built around your days, pace and fitness.</li>
          <li>New spots and re-checked prices every month. Free, forever. No subscription.</li>
        </ul>
        <a class="btn-buy gold" href="${D.meta.buyLinks.bundle}" target="_blank" rel="noopener">Get the full guide — ${D.meta.bundlePrice}</a>
        <p class="price-fine">One key. Works on any phone — paste it again if you switch.</p>
      </div>`;

    // Social proof — meta.testimonials, curated by hand. Compact contexts
    // (the unlock modal) get one; full price blocks get up to three.
    const quotes = (D.meta.testimonials || []).slice(0, compact ? 1 : 3);
    if (quotes.length) {
      const t = el("div", "testimonials");
      quotes.forEach(q => t.appendChild(el("blockquote", "testi",
        `“${esc(q.text)}”${q.by ? `<cite>— ${esc(q.by)}</cite>` : ""}`)));
      w.appendChild(t);
    }
    return w;
  }

  /* ------------------------------------------------------------------- tabs */
  function renderTabs(active) {
    const tabs = $("#tabs");
    tabs.innerHTML = "";
    D.categories.forEach(c => {
      const b = el("button", "tab", `<span class="t-icon">${c.icon}</span>${esc(c.label)}`);
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(c.id === active));
      b.onclick = () => (location.hash = "#/" + c.id);
      tabs.appendChild(b);
    });
    // The tab bar wraps now (every tab visible at once), so there's nothing to
    // scroll into view — and scrollIntoView here would jog the whole page.
  }

  function renderUnlockBtn() {
    const b = $("#unlockBtn");
    if (Unlock.hasBundle()) { b.textContent = "✓ Full access"; b.className = "pill pill-unlocked"; }
    else if (Unlock.isAnythingOwned()) { b.textContent = "✓ " + Unlock.grants().length + " unlocked"; b.className = "pill pill-unlocked"; }
    else { b.textContent = "Unlock"; b.className = "pill pill-ghost"; }
  }

  /* ----------------------------------------------------------- living line
     One small line in the header, above the tabs, on every screen. It used to
     be a fat banner repeated inside each tab — this says the same thing in a
     tenth of the space. */
  function renderLivingLine() {
    const l = $("#livingLine");
    if (!l) return;
    l.innerHTML =
      `<span class="pulse"></span>` +
      `<span class="ll-main"><strong>Living guide</strong> · updated ${esc(D.meta.lastUpdated)}</span>` +
      `<span class="ll-sub">Buy once · updates free forever</span>`;
  }

  // Short area names for the card tag — the full labels in D.regions are too
  // long for a chip.
  const REGION_SHORT = {
    "muscat": "Muscat", "batinah": "Batinah", "coast-east": "East coast",
    "sharqiyah": "Sharqiyah", "dakhiliyah": "Nizwa side", "rustaq": "Rustaq loop",
    "musandam": "Musandam", "dhofar": "Salalah"
  };

  /* ------------------------------------------------------------------- card */
  function card(item, lockNum) {
    const unlocked = isUnlocked(item);
    const c = el("article", "card" + (unlocked ? "" : " locked"));

    const media = el("div", "card-media");
    if (unlocked) {
      if (item.img) media.style.backgroundImage = `url("${item.img}")`;
      else media.textContent = "📷 " + item.name;
    } else {
      media.classList.add("card-media-locked");
      media.innerHTML = `<span class="lock-pill">🔒 In the guide</span>`;
    }
    c.appendChild(media);

    const body = el("div", "card-body");

    // Photo-forward card: when there's a real photo, the name, tagline and
    // chips sit ON the image over a dark scrim — the feed reads like a
    // travel app, not a document. No photo (or locked) = classic layout.
    const photoCard = unlocked && !!item.img;

    const kick = el("div", "card-kicker" + (photoCard ? " on-photo" : ""));
    kick.appendChild(el("span", "chip " + (unlocked ? "chip-free" : "chip-lock"),
      unlocked ? (item.free ? "Free preview" : "✓ Unlocked") : "🔒 Locked"));
    // What kind of place this is — shown on locked cards too (it says what
    // you're buying without giving away which spot it is).
    if (item.type) kick.appendChild(el("span", "chip chip-type", esc(typeChipLabel(item.type))));
    // WHERE it is — the area tag (Muscat, Nizwa side, East coast…). Explore
    // mixes the whole north, so cards say their area. Hidden on the Salalah
    // tab (everything there is Dhofar — the tag would just repeat).
    if (item.region && item.region !== "dhofar" && REGION_SHORT[item.region])
      kick.appendChild(el("span", "chip chip-region", "📍 " + REGION_SHORT[item.region]));
    // 🎬 chip = I filmed a reel here; the button to watch it is in the detail sheet.
    if (item.insta) kick.appendChild(el("span", "chip chip-reel", "🎬 Reel"));
    if (unlocked) {
      if (item.sub && item.sub !== item.type) kick.appendChild(el("span", "chip", esc(item.sub)));
      if (item.stats && /Hard/.test(item.stats.Difficulty || "")) kick.appendChild(el("span", "chip chip-hard", "Hard"));
      if (item.guide === "required") kick.appendChild(el("span", "chip", "Guide required"));
      if (item.needs4x4) kick.appendChild(el("span", "chip", "4×4"));
      if (item.months && !item.months.includes(new Date().getMonth() + 1))
        kick.appendChild(el("span", "chip chip-season", item.region === "dhofar"
          ? `🌿 Khareef ${Planner.monthsLabel(item.months)}`
          : `🌡️ Best ${Planner.monthsLabel(item.months)}`));
    }
    if (photoCard) {
      media.classList.add("card-media-photo");
      const ov = el("div", "card-overlay");
      ov.appendChild(kick);
      ov.appendChild(el("h3", "ov-title", esc(item.name)));
      ov.appendChild(el("p", "ov-tag", esc(item.tagline)));
      media.appendChild(ov);
      // Photo cards are IMAGE + overlay only — short and scannable. All the
      // stats and text live in the detail sheet, one tap away.
    } else {
      body.appendChild(kick);
      if (unlocked) {
        body.appendChild(el("h3", null, esc(item.name)));
        body.appendChild(el("p", "tagline", esc(item.tagline)));
        // (blurb + stats live in the sheet — cards stay short)
      } else {
        // Compact locked card: one strip, one line, one button. The full
        // sales pitch lives in the price block ONCE per tab, not on all 40+
        // locked cards — that's what made the feed feel endless.
        const row = el("div", "lock-row");
        row.appendChild(el("span", "lock-row-txt",
          `Hidden ${singularOf(item)}${lockNum ? " #" + lockNum : ""} · in the paid guide`));
        const go = el("button", "lock-row-btn", `Unlock ${D.meta.bundlePrice}`);
        go.onclick = e => { e.stopPropagation(); openUnlock(); };
        row.appendChild(go);
        body.appendChild(row);
      }
    }

    if (unlocked) {
      c.style.cursor = "pointer";
      c.onclick = () => openSheet(item);
    } else {
      c.style.cursor = "pointer";
      c.onclick = () => openUnlock();
    }

    if (body.hasChildNodes()) c.appendChild(body);
    return c;
  }

  /* ------------------------------------------------------------------ sheet */
  function openSheet(item) {
    const b = $("#sheetBody");
    const prem = Unlock.detail(item.id) || {};
    const aff = D.meta.affiliates;

    const isItin = !item.cat || item.cat === "itineraries";
    const days = item.days || prem.days;

    let h = "";
    h += `<div class="sheet-hero"${item.img ? ` style="background-image:url('${item.img}')"` : ""}>` +
         `${item.img ? "" : "📷 " + esc(item.name)}` +
         `${item.img && item.imgCredit ? `<span class="imgcredit">${esc(item.imgCredit)}</span>` : ""}</div>`;
    h += `<div class="sheet-inner">`;
    h += `<h2>${esc(item.name)}</h2><p class="tagline">${esc(item.tagline)}</p>`;
    if (item.type) h += `<div class="card-kicker"><span class="chip chip-type">${esc(typeChipLabel(item.type))}</span></div>`;
    if (item.blurb) h += `<p class="body">${esc(item.blurb)}</p>`;

    if (item.stats) {
      h += `<div class="statgrid">` + Object.entries(item.stats).map(([k, v]) =>
        `<div class="s"><div class="lab">${esc(k)}</div><div class="val">${esc(v)}</div></div>`).join("") + `</div>`;
    }

    if (item.months && !item.months.includes(new Date().getMonth() + 1)) {
      h += item.region === "dhofar"
        ? `<div class="heatnote">🌿 <strong>Greenest ${esc(Planner.monthsLabel(item.months))} — the khareef.</strong> Lovely outside it too: sunny, calm and quiet. Just don't expect the waterfalls.</div>`
        : `<div class="heatnote">🌡️ <strong>Best ${esc(Planner.monthsLabel(item.months))}.</strong> Doable now too — go at first light or after 4pm, skip the midday hours, and carry more water than feels reasonable.</div>`;
    }

    if (item.mapUrl) {
      h += `<a class="mapbtn" href="${item.mapUrl}" target="_blank" rel="noopener">📍 Open in Google Maps</a>`;
    }

    // My reel(s) from this spot — `insta` on the spot is a URL or array of URLs.
    if (item.insta) {
      const reels = Array.isArray(item.insta) ? item.insta : [item.insta];
      h += `<div class="instarow">` + reels.map((u, i) =>
        `<a class="instabtn" data-spot="${esc(item.id)}" href="${u}" target="_blank" rel="noopener">🎬 Watch my reel${reels.length > 1 ? " " + (i + 1) : ""} on Instagram</a>`
      ).join("") + `</div>`;
    }

    if (isItin && days) {
      days.forEach(d => {
        h += `<h3 class="sec">${esc(d.title)}</h3><p class="body">${esc(d.body)}</p>`;
        if (d.spots && d.spots.length) {
          // Only pin spots the reader has access to — a free itinerary must
          // not reveal the names of locked spots.
          const pins = d.spots.map(id => D.spots.find(s => s.id === id)).filter(Boolean).filter(isUnlocked);
          if (pins.length) {
            h += `<div class="pinrow">` + pins.map(s =>
              `<a class="pin" href="${s.mapUrl}" target="_blank" rel="noopener">📍 ${esc(s.name)}</a>`).join("") + `</div>`;
          }
        }
      });
      if (aff.hotel) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.hotel)}" target="_blank" rel="noopener">Book the stays on this route →</a>`;
      if (aff.car) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.car)}" target="_blank" rel="noopener">Rent a car →</a>`;

    } else {
      const gettingThere = item.gettingThere || prem.gettingThere;
      const whatYoullDo  = item.whatYoullDo  || prem.whatYoullDo;
      const tips         = item.tips         || prem.tips;
      const guideNote    = prem.guideNote;

      // Extra photos, dealt out between the sections below — one after
      // "Getting there", one after "What you'll do", the rest after the tips.
      // gallery entries: "path.jpg" or { src, credit, caption }.
      const gal = [...(item.gallery || []), ...(prem.gallery || [])]
        .map(g => (typeof g === "string" ? { src: g } : g))
        .filter(g => g.src);
      const nextFig = () => {
        const g = gal.shift();
        if (!g) return "";
        return `<figure class="sheet-fig"><img src="${g.src}" loading="lazy" alt="${esc(g.caption || item.name)}">` +
               `${g.caption ? `<figcaption>${esc(g.caption)}${g.credit ? ` <span class="imgcredit">${esc(g.credit)}</span>` : ""}</figcaption>`
                            : g.credit ? `<figcaption><span class="imgcredit">${esc(g.credit)}</span></figcaption>` : ""}</figure>`;
      };

      // Hike / swim times, called out
      if (item.hikeTime || item.swimTime) {
        h += `<div class="timebox">`;
        if (item.hikeTime) h += `<div class="tb"><span class="tb-i">🥾</span><div><strong>Hiking</strong><span>${esc(item.hikeTime)}</span></div></div>`;
        if (item.swimTime) h += `<div class="tb"><span class="tb-i">💧</span><div><strong>Swimming</strong><span>${esc(item.swimTime)}</span></div></div>`;
        h += `</div>`;
      }

      if (gettingThere) h += `<h3 class="sec">Getting there</h3>${steps(gettingThere)}` + nextFig();
      if (whatYoullDo)  h += `<h3 class="sec">What you'll do</h3>${bullets(whatYoullDo)}` + nextFig();

      // Spot-specific booking link — THE tour for THIS place (a Wadi Shab boat
      // + hike tour, the Daymaniyat snorkel boat…). Set per spot as
      // aff: { url, label } in content.js or premium.js; beats the generic
      // tours link because it's exactly what the reader is looking at.
      const spotAff = item.aff || prem.aff;
      if (spotAff && spotAff.url) {
        h += `<a class="affbtn aff-primary" data-spot="${esc(item.id)}" href="${affLink(spotAff.url)}" target="_blank" rel="noopener">${esc(spotAff.label || "Book this trip →")}</a>` + discountChip();
      }

      // The packing list
      if (item.bring) {
        h += `<h3 class="sec">What to bring</h3><div class="bringbox">`;
        if (item.bring.essential && item.bring.essential.length) {
          h += `<div class="bring-col"><div class="bring-h must">Don't leave without</div><ul>` +
               item.bring.essential.map(x => `<li>${esc(x)}</li>`).join("") + `</ul></div>`;
        }
        if (item.bring.optional && item.bring.optional.length) {
          h += `<div class="bring-col"><div class="bring-h nice">Nice to have</div><ul>` +
               item.bring.optional.map(x => `<li>${esc(x)}</li>`).join("") + `</ul></div>`;
        }
        h += `</div>`;
        if (aff.gear) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.gear)}" target="_blank" rel="noopener">My exact gear list →</a>`;
      }

      if (tips && tips.length) {
        h += `<div class="tipbox"><strong>My insider tips</strong><ul>` +
             tips.map(t => `<li>${esc(t)}</li>`).join("") + `</ul></div>`;
      }
      while (gal.length) h += nextFig();   // whatever's left, in a row at the end
      if (guideNote) {
        h += `<div class="guidebox"><strong>🧭 Go with a guide</strong><p>${esc(guideNote)}</p>`;
        const guideLink = aff.guide || aff.tours;
        if (guideLink) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(guideLink)}" target="_blank" rel="noopener">Book a guided trip →</a>` + discountChip();
        h += `</div>`;
      }
      if (item.needs4x4 && aff.car) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.car)}" target="_blank" rel="noopener">You'll need a 4×4 — rent one →</a>`;
      if (aff.esim) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.esim)}" target="_blank" rel="noopener">Get an Oman eSIM (maps off-grid) →</a>`;
    }

    // Traveller tips — reader feedback that Hussain has verified and chosen
    // to publish (spot.travellerTips = [{text, by}]). Curation IS the
    // moderation: nothing appears here without passing through him.
    if (item.travellerTips && item.travellerTips.length) {
      h += `<h3 class="sec">💬 Traveller tips — verified by me</h3>`;
      item.travellerTips.forEach(t => {
        h += `<div class="ttip"><p>${esc(t.text)}</p>${t.by ? `<span class="ttip-by">— ${esc(t.by)}</span>` : ""}</div>`;
      });
    }

    if (item.needsFirstHand) {
      h += `<div class="verifynote warn">⚠️ Public info on this one is thin and inconsistent. Confirm access and water levels locally before you commit a day to it.</div>`;
    } else if (item.verify) {
      h += `<div class="verifynote">ℹ️ Times, fees and access details are researched from public sources and change often — confirm on the day.</div>`;
    }

    // Their own posted review, rendered right on the spot — so posting
    // FEELS like posting. (Everyone else still only sees curated tips.)
    const myBlock = r =>
      `<div class="myreview">
         <div class="myreview-head">
           <span class="myreview-stars">${"★".repeat(Math.min(5, r.stars || 0))}${"☆".repeat(5 - Math.min(5, r.stars || 0))}</span>
           <span class="myreview-name">Your review${r.name ? " — " + esc(r.name) : ""}</span>
         </div>
         ${r.tip ? `<p>${esc(r.tip)}</p>` : ""}
         <p class="myreview-note">Sent to Hussain — the best reviews get published in the guide, with credit.</p>
       </div>`;

    // Feedback — stars + an optional written review. Private by default: it
    // lands in Supabase (or, until the backend is configured, opens an email
    // draft to meta.email). Hussain publishes the best ones, with credit.
    if (!isItin) {
      let done = false;
      try { done = !!localStorage.getItem("oman_reviewed_" + item.id); } catch {}
      let savedName = "";
      try { savedName = localStorage.getItem("oman_reviewer_name") || ""; } catch {}
      let mine = null;
      try { mine = JSON.parse(localStorage.getItem("oman_review_" + item.id) || "null"); } catch {}
      if (mine) done = true;
      h += done
        ? (mine ? myBlock(mine) : `<div class="ratebox thanks">✅ Shukran — your review helps the next traveller.</div>`)
        : `<div class="ratebox" id="ratebox">
             <p class="rate-q">Been here? Rate it</p>
             <div class="stars" id="stars">
               ${[1,2,3,4,5].map(n => `<button type="button" class="star" data-n="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}
             </div>
             <input class="rate-name" id="rateName" maxlength="60"
               value="${esc(savedName)}" placeholder="Your name (shown if your review gets published)">
             <textarea class="rate-tip" id="rateTip" maxlength="500" rows="2"
               placeholder="Your review or a tip for the next traveller (optional)"></textarea>
             <button type="button" class="rate-send" id="rateSend" hidden>Post review</button>
           </div>`;
    }
    h += `</div>`;

    b.innerHTML = h;

    // wire the review box (if present)
    const rb = b.querySelector("#ratebox");
    if (rb) {
      let stars = 0;
      const send = rb.querySelector("#rateSend");
      const starBtns = [...rb.querySelectorAll(".star")];
      starBtns.forEach(btn => btn.onclick = () => {
        stars = +btn.dataset.n;
        starBtns.forEach(x => x.classList.toggle("on", +x.dataset.n <= stars));
        send.hidden = false;
      });
      send.onclick = () => {
        const name = rb.querySelector("#rateName").value.trim();
        const tipText = rb.querySelector("#rateTip").value.trim();
        try { if (name) localStorage.setItem("oman_reviewer_name", name); } catch {}
        if (window.Analytics && Analytics.enabled) {
          Analytics.review(item.id, { stars: stars, name: name, tip: tipText });
        } else {
          // No backend yet — open a prefilled email instead, so reviews
          // work from day one and nothing is silently lost.
          const bodyTxt = `Spot: ${item.name}\nStars: ${stars}/5\nName: ${name || "-"}\nReview: ${tipText || "-"}`;
          location.href = "mailto:" + (D.meta.email || "") +
            "?subject=" + encodeURIComponent("Review — " + item.name + " (" + stars + "/5)") +
            "&body=" + encodeURIComponent(bodyTxt);
        }
        const rec = { stars: stars, name: name, tip: tipText };
        try {
          localStorage.setItem("oman_reviewed_" + item.id, "1");
          localStorage.setItem("oman_review_" + item.id, JSON.stringify(rec));
        } catch {}
        rb.outerHTML = myBlock(rec);
      };
    }
    $("#sheet").hidden = false;
    $("#sheetBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    $("#sheet").scrollTop = 0;
    if (window.Analytics) Analytics.track("spot", { id: item.id, cat: item.cat || "itineraries" });
  }

  function closeSheet() {
    $("#sheet").hidden = true;
    $("#sheetBackdrop").hidden = true;
    document.body.style.overflow = "";
  }

  /* ----------------------------------------------------------------- unlock */
  function openUnlock() {
    const b = $("#modalBody");
    if (Unlock.isAnythingOwned()) {
      b.innerHTML = `
        <h2>You're unlocked ✓</h2>
        <p>Access: <strong>${Unlock.hasBundle() ? "the full pack — everything, including the Planner" : Unlock.grants().join(", ")}</strong>.</p>
        <p class="hint">Your key is stored on this device only. Installing the app on another phone? Just paste the key again.</p>
        <button class="btn-full" id="doneBtn">Done</button>
        <button class="btn-full" id="signoutBtn" style="background:transparent;color:var(--danger);margin-top:4px">Remove key from this device</button>`;
      b.querySelector("#doneBtn").onclick = closeModal;
      b.querySelector("#signoutBtn").onclick = () => {
        Unlock.reset(); closeModal(); renderUnlockBtn(); route(); toast("Key removed");
      };
    } else {
      b.innerHTML = `
        <h2>Unlock the full guide</h2>
        <p>Bought on Gumroad? Paste the licence key from your receipt email. It's yours for good — same key on a new phone, and every monthly update lands automatically.</p>
        <div class="field">
          <label for="keyIn">Licence key</label>
          <input id="keyIn" placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" autocapitalize="characters" spellcheck="false">
        </div>
        <button class="btn-full" id="verifyBtn">Unlock</button>
        <div id="msg"></div>
        <div id="pricehere" style="margin-top:20px"></div>`;

      b.querySelector("#pricehere").appendChild(priceBlock("wadis", true));

      const input = b.querySelector("#keyIn");
      const btn = b.querySelector("#verifyBtn");
      const msg = b.querySelector("#msg");

      const go = async () => {
        btn.disabled = true; btn.textContent = "Checking…"; msg.innerHTML = "";
        const r = await Unlock.verify(input.value);
        btn.disabled = false; btn.textContent = "Unlock";
        if (r.ok) {
          if (window.Analytics) Analytics.track("unlock", { grants: r.grants });
          msg.innerHTML = `<div class="msg ok">Unlocked. Everything's open.</div>`;
          renderUnlockBtn();
          setTimeout(() => { closeModal(); route(); toast("Unlocked — enjoy 🇴🇲"); }, 700);
        } else {
          msg.innerHTML = `<div class="msg err">${esc(r.error)}</div>`;
        }
      };
      btn.onclick = go;
      input.onkeydown = e => { if (e.key === "Enter") go(); };
      setTimeout(() => input.focus(), 80);
    }
    $("#modalBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    $("#modalBackdrop").hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------------------------------------------------------------- category */
  function renderCategory(cat) {
    const meta = D.categories.find(c => c.id === cat);
    const items = itemsFor(cat);

    clearView();

    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, esc(meta.label)));
    head.appendChild(el("p", null, esc(meta.blurb)));
    // The tab explainer — what a wadi even is, why Salalah is its own trip…
    // String = one line. Array = a tight bullet list (preferred: no walls of text).
    if (meta.intro) head.appendChild(el("div", "cat-intro", bullets(meta.intro, "intro-list")));
    view.appendChild(head);

    if (!items.length) {
      view.appendChild(el("div", "empty", `<div class="big">🏜️</div><p>Nothing matches "${esc(query)}".</p>`));
      return;
    }

    /* ---- the control bar: filter chips + list/map switch ------------------ */
    const bar = el("div", "filterbar");
    const row = typeFilterRow(items, () => renderCategory(cat));
    if (row) bar.appendChild(row);
    bar.appendChild(viewSwitch(() => renderCategory(cat)));
    const sBtn = el("button", "icon-btn fb-search", "🔍");
    sBtn.type = "button"; sBtn.setAttribute("aria-label", "Search");
    sBtn.onclick = () => window.__toggleSearch && window.__toggleSearch();
    bar.appendChild(sBtn);
    view.appendChild(bar);

    const shown = typeFilter ? items.filter(i => groupOf(i) === typeFilter) : items;

    if (!shown.length) {
      view.appendChild(el("div", "empty",
        `<div class="big">🤷</div><p>Nothing in ${esc(groupLabel(typeFilter))} yet.</p>`));
      return;
    }

    /* ---- map view -------------------------------------------------------- */
    if (viewMode === "map") {
      view.appendChild(mapPanel(shown));
      return;
    }

    /* ---- list view ------------------------------------------------------- */
    let lockN = 0;
    const addCards = (list, parent) =>
      list.forEach(i => parent.appendChild(card(i, isUnlocked(i) ? 0 : ++lockN)));

    // Unfiltered and long? Break it into type sections with headers — a 50-card
    // flat scroll is a wall. One chip tapped = one clean grid, no headers.
    if (!typeFilter && !query && shown.length > 12) {
      typesIn(shown).forEach(t => {
        const grp = shown.filter(i => groupOf(i) === t.type);
        const h = el("div", "group-head");
        h.innerHTML = `<h2>${esc(groupLabel(t.type))}</h2><span class="group-n">${t.n}</span>`;
        h.onclick = () => { typeFilter = t.type; renderCategory(cat); };
        view.appendChild(h);
        const g = el("div", "grid");
        addCards(grp, g);
        view.appendChild(g);
      });
    } else {
      const grid = el("div", "grid");
      addCards(shown, grid);
      view.appendChild(grid);
    }

    const lockedShown = shown.filter(i => !isUnlocked(i)).length;
    if (lockedShown && !Unlock.hasBundle()) {
      const h = el("div", "section-head");
      h.innerHTML = `<h2>${lockedShown} locked here 🔒</h2>` +
        `<p>One payment unlocks all ${lockedCount()} locked spots in the guide, the itineraries and the Planner — and every update after that.</p>`;
      view.appendChild(h);
      view.appendChild(priceBlock(cat));
    }
  }

  /* ------------------------------------------------------------------- about */
  function renderAbout(append) {
    const m = D.meta;
    if (!append) clearView();          // the More tab appends About under the map
    const w = el("div", "about");
    w.innerHTML = `
      <div class="about-hero">
        ${m.aboutPhoto
          ? `<img class="about-avatar about-photo" src="${esc(m.aboutPhoto)}" alt="Hussain">`
          : `<div class="about-avatar about-photo-empty" title="Drop your photo into assets/ and set meta.aboutPhoto in content.js">📷<small>your photo</small></div>`}
        <h1>Marhaba — I'm Hussain.</h1>
        <p class="about-sub">${esc(m.creatorLine)}</p>
      </div>

      <div class="about-badges">
        <span class="badge">🪪 Licensed Oman tour guide</span>
        <span class="badge">🎥 1M+ views of this stuff</span>
        <span class="badge">📍 Every spot has a map pin</span>
        <span class="badge">🔄 Updated monthly, free forever</span>
      </div>

      <div class="about-body">
        <ul class="bulletlist">
          <li>Omani content creator and licensed tour guide.</li>
          <li>Years spent chasing waterfalls, swimming canyons and hiking the quiet corners — filming all of it.</li>
          <li>My wadi videos have been watched over a million times.</li>
        </ul>
        <p class="pull">“Where is this, and how do I get there?”</p>
        <ul class="bulletlist">
          <li>That's the question I get every single day. This app is the answer.</li>
          <li>Every wadi, beach and hidden corner I'd send a friend to.</li>
          <li>Map pins, drive times, hike and swim times, honest difficulty notes.</li>
        </ul>

        <h3>Why an app and not a PDF</h3>
        <ul class="bulletlist">
          <li>Oman changes: fees go up, roads wash out, a two-hour wadi becomes a four-hour one.</li>
          <li>A PDF is out of date the day you download it.</li>
          <li>This is updated every month.</li>
          <li>Buy it once and every update after that is free, forever — including tabs that don't exist yet.</li>
        </ul>

        <h3>One ask</h3>
        <ul class="bulletlist">
          <li>Take your rubbish out with you.</li>
          <li>Dress modestly at the village wadis.</li>
          <li>Don't touch the coral or the turtles.</li>
          <li>Leave it as beautiful as you found it. Shukran. 🤍</li>
        </ul>
      </div>

      <div class="about-contact">
        <h3>Get in touch</h3>
        <a class="contact-row" href="${m.instagram}" target="_blank" rel="noopener">
          <span class="ci">📸</span>
          <span><strong>${esc(m.instagramHandle)}</strong><small>Reels, new spots, and DMs are open</small></span>
          <span class="carr">→</span>
        </a>
        <a class="contact-row" href="mailto:${esc(m.email)}">
          <span class="ci">✉️</span>
          <span><strong>${esc(m.email)}</strong><small>Guiding enquiries, collabs, or if a licence key won't work</small></span>
          <span class="carr">→</span>
        </a>
      </div>

      <div class="about-tag">
        Been somewhere from this guide? Tag <strong>${esc(m.instagramHandle)}</strong> — I repost my favourites. See you out there. 🇴🇲
      </div>`;

    // Email list — appears only once meta.backend is configured (see
    // delivery/BACKEND-SETUP.md); with no backend there's nowhere to save it.
    if (window.Analytics && Analytics.enabled) {
      const sub = el("div", "about-subscribe");
      sub.innerHTML = `
        <h3>📬 New spots, monthly</h3>
        <p>One email when the guide updates — new spots, road conditions, season notes. No spam, ever.</p>
        <div class="subrow">
          <input type="email" id="subEmail" placeholder="you@email.com" autocomplete="email">
          <button class="pill" id="subBtn">Sign me up</button>
        </div>
        <div id="subMsg"></div>`;
      sub.querySelector("#subBtn").onclick = async () => {
        const em = sub.querySelector("#subEmail").value.trim();
        const msg = sub.querySelector("#subMsg");
        if (!/^\S+@\S+\.\S+$/.test(em)) { msg.innerHTML = `<div class="msg err">That doesn't look like an email.</div>`; return; }
        const r = await Analytics.subscribe(em);
        msg.innerHTML = r.ok ? `<div class="msg ok">You're on the list. 🇴🇲</div>`
                             : `<div class="msg err">Couldn't sign you up — try again in a bit.</div>`;
      };
      w.appendChild(sub);
    }

    // "What's new" — the receipts behind the buy-once-updated-forever promise.
    if (m.changelog && m.changelog.length) {
      const log = el("div", "about-changelog");
      log.innerHTML = `<h3>🔄 What's new</h3>` + m.changelog.map(e =>
        `<div class="log-entry"><div class="log-date">${esc(e.date)}</div><ul>` +
        e.items.map(i => `<li>${esc(i)}</li>`).join("") + `</ul></div>`).join("");
      w.appendChild(log);
    }

    // Photo credits — attribution for the CC-licensed images (legally required
    // for CC BY / CC BY-SA; collected here rather than stamped on every card).
    // Locked spots' photos aren't displayed, so they aren't credited either —
    // crediting them would leak the names.
    const credited = [...D.spots, ...(D.itineraries || [])].filter(s => s.img && s.imgCredit && isUnlocked(s));
    if (credited.length) {
      const cr = el("div", "about-credits");
      cr.innerHTML = `<h3>📷 Photo credits</h3><p class="credits-note">Photos from Wikimedia Commons under free licences, gratefully used:</p>` +
        `<ul>` + credited.map(s => `<li><strong>${esc(s.name)}</strong> — ${esc(s.imgCredit.replace(/^Photo: /, ""))}</li>`).join("") + `</ul>`;
      w.appendChild(cr);
    }
    view.appendChild(w);

    if (!Unlock.hasBundle()) {
      const h = el("div", "section-head");
      h.innerHTML = `<h2>Support the guide</h2><p>It's how the monthly updates keep coming.</p>`;
      view.appendChild(h);
      view.appendChild(priceBlock(null));
    }
  }

  /* ----------------------------------------------------------------- planner */
  const prefs = {
    days: 5, month: new Date().getMonth() + 1, pace: "balanced",
    interests: ["swimming", "hiking", "culture"],
    fitness: 3, has4x4: true, canSwim: true, kids: false, base: "muscat",
    heatStyle: "early"
  };

  function renderPlanner() {
    clearView();
    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, "🧭 Build my Oman trip"));
    head.appendChild(el("p", null, "Tell me what you like and how long you've got. I'll route it — real drive times, sensible days, every stop pinned in Google Maps, and nothing that puts you in a wadi you shouldn't be in."));
    view.appendChild(head);

    // The Planner is paid: no form, no teaser, no free Day 1. Non-buyers see the
    // pitch, the price, and the hand-built itineraries underneath.
    if (!Unlock.hasBundle()) {
      const p = el("div", "promo");
      p.innerHTML = `
        <h3>🔒 The Planner is part of the full guide</h3>
        <ul class="bulletlist">
          <li>Days clustered by region, so you never backtrack.</li>
          <li>Real drive times between every stop.</li>
          <li>Heat-smart start times — 06:30 in summer, hot spots in the cool hours.</li>
          <li>Every stop pinned in Google Maps, and the whole route drawn on one map.</li>
        </ul>`;
      view.appendChild(p);
      view.appendChild(priceBlock(null, true));

      const kb = el("button", "btn-key", "I have a key");
      kb.style.marginTop = "12px";
      kb.onclick = openUnlock;
      view.appendChild(kb);
      renderItinerarySection();
      return;
    }

    const form = el("div");

    /* ---- DAYS: the first and most important question ---------------------- */
    const dq = el("div", "q days-q");
    dq.innerHTML = `<h3>How many days have you got?</h3><p class="qsub">Count arrival and departure days — they're half days, and the planner knows it.</p>`;
    const quick = el("div", "opts days-quick");
    const dayOut = el("div", "rangeval big", prefs.days + " days");
    const setDays = n => {
      prefs.days = n;
      dayOut.textContent = n + (n === 1 ? " day" : " days");
      range.value = n;
      quick.querySelectorAll(".opt").forEach(o => o.setAttribute("aria-pressed", String(+o.dataset.d === n)));
    };
    [3, 5, 7, 10, 14].forEach(n => {
      const o = el("button", "opt", n + " days");
      o.dataset.d = n;
      o.onclick = () => setDays(n);
      quick.appendChild(o);
    });
    const rangeWrap = el("div", "rangewrap");
    const range = el("input"); range.type = "range"; range.min = 1; range.max = 21; range.value = prefs.days;
    range.oninput = () => setDays(+range.value);
    rangeWrap.appendChild(range);
    rangeWrap.appendChild(dayOut);
    dq.appendChild(quick);
    dq.appendChild(rangeWrap);
    form.appendChild(dq);
    setDays(prefs.days);

    // month
    form.appendChild(question("When are you coming?", "Season decides half of what's even possible.", w => {
      const M = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const sel = el("select");
      M.forEach((m, i) => { const o = el("option", null, m); o.value = i + 1; if (i + 1 === prefs.month) o.selected = true; sel.appendChild(o); });
      sel.onchange = () => (prefs.month = +sel.value);
      const f = el("div", "field"); f.appendChild(sel);
      w.appendChild(f);
    }));

    // heat style — only bites May–Sep up north, but it's cheap to always ask
    form.appendChild(question("If it's hot, how do you want to play it?", "Matters most May–September up north. The planner shifts your whole clock around this.", w => {
      const o = el("div", "opts");
      [["early", "🌅 Dawn starts — beat the heat"], ["late", "🌇 Slow mornings — hot stuff late"]].forEach(([k, label]) => {
        const b = el("button", "opt", label);
        b.setAttribute("aria-pressed", String(prefs.heatStyle === k));
        b.onclick = () => {
          prefs.heatStyle = k;
          o.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
        };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    // base — Salalah is 1,000km from Muscat, so it's a different trip entirely
    form.appendChild(question("Where are you based?", "Muscat covers the north. Salalah is its own trip — you fly between them.", w => {
      const o = el("div", "opts");
      [["muscat", "🏙️ Muscat & the north"], ["dhofar", "🌴 Salalah & Dhofar"]].forEach(([k, label]) => {
        const b = el("button", "opt", label);
        b.setAttribute("aria-pressed", String(prefs.base === k));
        b.onclick = () => {
          prefs.base = k;
          o.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
        };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    // interests
    form.appendChild(question("What are you here for?", "Pick as many as you like.", w => {
      const o = el("div", "opts");
      D.interests.forEach(i => {
        const b = el("button", "opt", `${i.icon} ${esc(i.label)}`);
        b.setAttribute("aria-pressed", String(prefs.interests.includes(i.id)));
        b.onclick = () => {
          const on = prefs.interests.includes(i.id);
          prefs.interests = on ? prefs.interests.filter(x => x !== i.id) : [...prefs.interests, i.id];
          b.setAttribute("aria-pressed", String(!on));
        };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    // fitness
    form.appendChild(question("How hard do you want it?", "Be honest — Oman punishes optimism.", w => {
      const L = [
        [1, "Easy — walk-in only"],
        [2, "Light — a bit of a walk"],
        [3, "Moderate — scrambling & swims"],
        [4, "Hard — long days"],
        [5, "Send it — canyoning, abseils"]
      ];
      const o = el("div", "opts");
      L.forEach(([v, label]) => {
        const b = el("button", "opt", esc(label));
        b.setAttribute("aria-pressed", String(prefs.fitness === v));
        b.onclick = () => {
          prefs.fitness = v;
          o.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
        };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    // pace
    form.appendChild(question("What pace?", "", w => {
      const o = el("div", "opts");
      Object.entries(Planner.PACE).forEach(([k, v]) => {
        const b = el("button", "opt", `${esc(v.label)} — ${esc(v.note)}`);
        b.setAttribute("aria-pressed", String(prefs.pace === k));
        b.onclick = () => {
          prefs.pace = k;
          o.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
        };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    // logistics
    form.appendChild(question("Logistics", "These change what's even possible.", w => {
      const o = el("div", "opts");
      [["has4x4","🚙 I'll have a 4×4"],["canSwim","🏊 Happy to swim"],["kids","👶 Travelling with kids"]].forEach(([k, label]) => {
        const b = el("button", "opt", esc(label));
        b.setAttribute("aria-pressed", String(prefs[k]));
        b.onclick = () => { prefs[k] = !prefs[k]; b.setAttribute("aria-pressed", String(prefs[k])); };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    const go = el("button", "btn-full", "Build my trip →");
    go.onclick = () => {
      if (window.Analytics) Analytics.track("plan", { days: prefs.days, pace: prefs.pace, base: prefs.base, month: prefs.month, heatStyle: prefs.heatStyle, interests: prefs.interests });
      renderPlan(Planner.build(prefs));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    form.appendChild(go);
    view.appendChild(form);
    renderItinerarySection();
  }

  /* The hand-built routes, shown under the planner on the Plan tab. */
  function renderItinerarySection() {
    const items = D.itineraries || [];
    if (!items.length) return;

    const h = el("div", "section-head");
    h.innerHTML = `<h2>Or follow one of mine 🗺️</h2>` +
      `<p>Fixed routes, day by day — where to go, in what order, where to sleep.</p>`;
    view.appendChild(h);

    const grid = el("div", "grid");
    let lockN = 0;
    items.forEach(i => grid.appendChild(card(i, isUnlocked(i) ? 0 : ++lockN)));
    view.appendChild(grid);
  }

  function question(title, sub, fill) {
    const q = el("div", "q");
    q.appendChild(el("h3", null, esc(title)));
    if (sub) q.appendChild(el("p", "qsub", esc(sub)));
    fill(q);
    return q;
  }

  /* --------------------------------------------------- google maps day route
     A real multi-waypoint directions URL: base → stop → stop → tonight's bed. */
  function dayRouteUrl(day) {
    const R = D.regions;
    const pts = [R[day.base].base + ", Oman"];
    day.spots.forEach(s => pts.push(s.coords ? s.coords.join(",") : s.name + ", Oman"));
    if (pts.length < 2) return null;
    const end = day.stayIn ? day.stayIn + ", Oman" : pts[0];

    const origin = encodeURIComponent(pts[0]);
    const destination = encodeURIComponent(end);
    const waypoints = pts.slice(1).map(encodeURIComponent).join("%7C");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
  }

  function dayCard(d) {
    const c = el("div", "plan-day");
    const head = el("div", "plan-day-head");
    head.innerHTML = `<strong>Day ${d.n}</strong><span>${d.stayIn ? "🌙 " + esc(d.stayIn) : ""}${d.driveHours ? " · 🚗 " + Planner.dur(d.driveHours) : ""}</span>`;
    c.appendChild(head);

    const body = el("div", "plan-day-body");
    if (d.note) body.appendChild(el("p", "leg-note", esc(d.note)));

    d.legs.forEach(l => {
      const leg = el("div", "leg" + (l.type === "drive" ? " drive" : ""));
      leg.appendChild(el("div", "leg-time", Planner.fmt(l.t)));
      const main = el("div", "leg-main");
      const icon = l.type === "drive" ? "🚗 " : l.type === "sleep" ? "🌙 "
                 : l.type === "note"  ? (l.icon || "☕") + " " : "📍 ";
      main.appendChild(el("strong", null, icon + esc(l.title) + (l.dur && l.type === "drive" ? ` · ${Planner.dur(l.dur)}` : "")));
      if (l.note) main.appendChild(el("div", "leg-note", esc(l.note)));
      if (l.fixNote) main.appendChild(el("div", "leg-note heat", esc(l.fixNote)));
      if (l.heatNote) main.appendChild(el("div", "leg-note heat", esc(l.heatNote)));

      if (l.spot) {
        const meta = el("div", "leg-meta");
        if (l.spot.hikeTime) meta.appendChild(el("span", "meta", "🥾 " + esc(l.spot.hikeTime.split("—")[0].trim())));
        if (l.spot.swimTime) meta.appendChild(el("span", "meta", "💧 " + esc(l.spot.swimTime.split("—")[0].split(".")[0].trim())));
        if (meta.children.length) main.appendChild(meta);

        const a = el("a", "pin", "📍 Open in Maps");
        a.href = l.spot.mapUrl; a.target = "_blank"; a.rel = "noopener";
        main.appendChild(a);
      }
      leg.appendChild(main);
      body.appendChild(leg);
    });

    const url = dayRouteUrl(d);
    if (url) {
      const r = el("a", "routebtn", "🗺️ Open the whole day's route in Google Maps");
      r.href = url; r.target = "_blank"; r.rel = "noopener";
      body.appendChild(r);
    }

    c.appendChild(body);
    return c;
  }

  function renderPlan(plan) {
    // Bundle-only, no exceptions — belt and braces on top of renderPlanner's
    // gate, in case a future code path calls this directly.
    if (!Unlock.hasBundle()) { renderPlanner(); return; }
    clearView();

    const back = el("button", "pill pill-ghost", "← Change my answers");
    back.style.marginBottom = "16px";
    back.onclick = renderPlanner;
    view.appendChild(back);

    const sum = el("div", "plan-summary");
    sum.innerHTML = `
      <h2>Your ${plan.prefs.days}-day Oman</h2>
      <p><strong>${plan.totalSpots}</strong> stops · <strong>${Planner.dur(plan.totalDrive)}</strong> total driving · ${esc(plan.pace.label.toLowerCase())} pace${plan.prefs.has4x4 ? " · 4×4" : " · 2WD"}</p>`;
    view.appendChild(sum);

    // Change the length right here — no round trip through the form. Rebuilds
    // the whole plan from scratch every time, so days can never pile up.
    const dayctl = el("div", "dayctl");
    const minus = el("button", "dayctl-b", "−");
    const plus  = el("button", "dayctl-b", "+");
    const label = el("div", "dayctl-n", plan.prefs.days + (plan.prefs.days === 1 ? " day" : " days"));
    const rebuild = n => {
      prefs.days = Math.max(1, Math.min(21, n));
      renderPlan(Planner.build(prefs));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    minus.onclick = () => rebuild(prefs.days - 1);
    plus.onclick  = () => rebuild(prefs.days + 1);
    dayctl.appendChild(minus);
    dayctl.appendChild(label);
    dayctl.appendChild(plus);
    view.appendChild(dayctl);

    plan.warnings.forEach(w => view.appendChild(el("div", "plan-warn", esc(w))));

    plan.days.forEach(d => view.appendChild(dayCard(d)));
    if (plan.totalSpots) view.appendChild(routeMap(plan));

    if (plan.missed.length) {
      const m = el("div", "promo");
      m.innerHTML = `
        <h3>You didn't have time for…</h3>
        <p>${plan.missed.map(s => esc(s.name)).join(" · ")}. Add a day, or come back — they're not going anywhere.</p>`;
      view.appendChild(m);
    }

    if (Unlock.hasBundle()) {
      const acts = el("div", "plan-actions");
      const pr = el("button", "pill", "🖨️ Save as PDF");
      pr.onclick = () => window.print();
      const cp = el("button", "pill pill-ghost", "📋 Copy plan");
      cp.onclick = () => navigator.clipboard.writeText(planText(plan))
        .then(() => toast("Plan copied"), () => toast("Couldn't copy"));
      acts.appendChild(pr); acts.appendChild(cp);
      view.appendChild(acts);

      // Print-only attribution — every shared PDF carries the store with it.
      const foot = el("div", "print-footer");
      foot.textContent = `Built with the Exploring Oman app · ${D.meta.creator} · ${D.meta.storeUrl || D.meta.instagram}`;
      view.appendChild(foot);
    }

    const aff = D.meta.affiliates;
    if (aff.car || aff.hotel || aff.esim) {
      const box = el("div", "guidebox");
      box.innerHTML = `<strong>Sort the basics</strong><p>You'll want a car, a bed and working maps.</p>`;
      if (aff.car)   box.innerHTML += `<a class="affbtn" href="${aff.car}" target="_blank" rel="noopener">Rent a ${plan.prefs.has4x4 ? "4×4" : "car"} →</a>`;
      if (aff.hotel) box.innerHTML += `<a class="affbtn" href="${aff.hotel}" target="_blank" rel="noopener">Book the stays →</a>`;
      if (aff.esim)  box.innerHTML += `<a class="affbtn" href="${aff.esim}" target="_blank" rel="noopener">Get an eSIM →</a>`;
      view.appendChild(box);
    }
  }

  function planText(plan) {
    let t = `MY ${plan.prefs.days}-DAY OMAN TRIP\nvia ${D.meta.creator}\n\n`;
    plan.days.forEach(d => {
      t += `DAY ${d.n}${d.stayIn ? " — sleep in " + d.stayIn : ""}\n`;
      d.legs.forEach(l => {
        t += `  ${Planner.fmt(l.t)}  ${l.type === "drive" ? "Drive: " : ""}${l.title}${l.heatNote ? "  (go early — heat)" : ""}\n`;
        if (l.spot) t += `          ${l.spot.mapUrl}\n`;
      });
      const u = dayRouteUrl(d);
      if (u) t += `  Full day route: ${u}\n`;
      t += "\n";
    });
    if (plan.warnings.length) t += "NOTES\n" + plan.warnings.map(w => "  - " + w).join("\n") + "\n";
    t += `\n—\nBuilt with the Exploring Oman app by ${D.meta.creator}\n${D.meta.storeUrl || D.meta.instagram}\n`;
    return t;
  }

  /* -------------------------------------------------------------------- map */
  // Leaflet is loaded on demand from a CDN the first time the Map tab opens —
  // the app shell stays dependency-free and the tab degrades to a pin list
  // when there's no connection.
  let leafletLoading = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoading) return leafletLoading;
    leafletLoading = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = () => resolve(window.L);
      s.onerror = () => { leafletLoading = null; reject(new Error("Leaflet failed to load")); };
      document.head.appendChild(s);
    });
    return leafletLoading;
  }

  const CAT_COLORS = { wadis: "#0d8abc", beaches: "#d97706", mountains: "#0f766e",
                       salalah: "#16a34a", experiences: "#7c3aed", food: "#dc2626",
                       shopping: "#be185d" };

  /* The map is no longer a tab of its own — it's a VIEW of whatever tab you're
     on. mapPanel() takes the spots that tab is showing (already type-filtered)
     and returns the panel. Locked spots stay OFF it: even an unnamed pin gives
     the location away, and the location is exactly what's being sold. */
  function mapPanel(spots) {
    const box = el("div", "mappanel");
    const shown = spots.filter(s => s.coords && isUnlocked(s));
    const hiddenCount = spots.filter(s => !isUnlocked(s)).length;

    if (hiddenCount) {
      const note = el("div", "promo");
      note.innerHTML = `<p>🔒 <strong>${hiddenCount} more pins</strong> appear here when you unlock — the spots most visitors never find.</p>`;
      box.appendChild(note);
    }

    const wrap = el("div", "mapwrap", `<div class="map-loading">Loading the map…</div>`);
    box.appendChild(wrap);

    loadLeaflet().then(L => {
      wrap.innerHTML = "";
      const map = L.map(wrap).setView([22.7, 58.0], 7);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const bounds = [];
      shown.forEach(s => {
        const mk = L.circleMarker(s.coords, {
          radius: 8, weight: 2, color: "#fff",
          fillColor: CAT_COLORS[s.cat] || "#666",
          fillOpacity: 0.95
        }).addTo(map);
        bounds.push(s.coords);

        const pop = document.createElement("div");
        pop.className = "map-pop";
        pop.innerHTML = `<strong>${esc(s.name)}</strong><p>${esc(s.tagline)}</p>`;
        const btn = document.createElement("button");
        btn.className = "pin";
        btn.textContent = "Details →";
        btn.onclick = () => { map.closePopup(); openSheet(s); };
        pop.appendChild(btn);
        mk.bindPopup(pop);
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 11 });
    }).catch(() => {
      wrap.innerHTML = "";
      wrap.classList.add("mapwrap-fallback");
      wrap.appendChild(el("p", "map-loading",
        "The map needs an internet connection the first time it loads. Every pin still works:"));
      const list = el("div", "pinrow");
      shown.filter(s => s.mapUrl).forEach(s => {
        const a = el("a", "pin", "📍 " + esc(s.name));
        a.href = s.mapUrl; a.target = "_blank"; a.rel = "noopener";
        list.appendChild(a);
      });
      wrap.appendChild(list);
    });

    return box;
  }

  /* Legacy #/map — kept so old links land somewhere sensible. */
  function renderMap() {
    clearView();
    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, "📍 The map"));
    head.appendChild(el("p", null, "Every unlocked spot in the guide. Tap a pin."));
    view.appendChild(head);
    view.appendChild(mapPanel(D.spots));
  }

  /* ------------------------------------------------------------------- info
     The free "read this before you land" tab: rules, pro tips, transport
     ranked best→worst, money, emergencies. All content lives in D.info in
     content.js; items with an `affiliate` key get the matching link from
     meta.affiliates once it's set. */
  function renderInfo() {
    const info = D.info || {};
    const aff = D.meta.affiliates;
    clearView();

    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, "ℹ️ Before you land"));
    head.appendChild(el("p", null, esc(info.intro || "")));
    view.appendChild(head);

    (info.sections || []).forEach(sec => {
      const s = el("div", "info-sec");
      s.appendChild(el("h2", null, `${sec.icon || ""} ${esc(sec.title)}`));
      (sec.items || []).forEach((it, i) => {
        const row = el("div", "info-item");
        row.innerHTML =
          (sec.ranked ? `<span class="rank">${i + 1}</span>` : "") +
          `<div class="info-body"><strong>${esc(it.name)}</strong><p>${esc(it.text)}</p></div>`;
        const link = it.affiliate && aff[it.affiliate];
        if (link) {
          const a = el("a", "affbtn", esc(it.affLabel || "Link →"));
          a.href = affLink(link); a.target = "_blank"; a.rel = "noopener";
          a.dataset.spot = "info";
          row.querySelector(".info-body").appendChild(a);
        }
        s.appendChild(row);
      });
      view.appendChild(s);
    });
  }

  /* ------------------------------------------------------------ route map ---
     The whole itinerary on one map: numbered stops in visit order, one colour
     per day, lines base → stops → tonight's bed. Straight lines on purpose —
     it's an overview; the per-day Google Maps button has the turn-by-turn.   */
  const DAY_COLORS = ["#0d8abc", "#d97706", "#7c3aed", "#dc2626", "#0f766e", "#4338ca", "#b45309", "#be185d"];

  function routeMap(plan) {
    const box = el("div", "plan-mapbox");
    box.appendChild(el("h3", "sec", "🗺️ The whole route"));

    /* One day at a time, or all of them. With every day drawn at once the pins
       pile on top of each other and the numbers run 1…14 across the trip, which
       tells you nothing. Pick a day and you get THAT day: stops numbered 1, 2,
       3, the map zoomed to it, and the other days faded into the background. */
    let sel = null;                       // null = all days
    const chips = el("div", "typefilter dayfilter");
    const mkChip = (label, value, col) => {
      const b = el("button", "tfchip daychip" + (sel === value ? " on" : ""),
        (col ? `<span class="daydot" style="background:${col}"></span>` : "") + esc(label));
      b.type = "button";
      b.onclick = () => { sel = (sel === value) ? null : value; draw(); };
      return b;
    };
    const rebuildChips = () => {
      chips.innerHTML = "";
      chips.appendChild(mkChip("All days", null, null));
      plan.days.forEach((d, i) => {
        if (!d.spots.length) return;
        chips.appendChild(mkChip("Day " + d.n, i, DAY_COLORS[i % DAY_COLORS.length]));
      });
    };
    rebuildChips();
    box.appendChild(chips);

    const wrap = el("div", "mapwrap planmap", `<div class="map-loading">Drawing your route…</div>`);
    box.appendChild(wrap);
    box.appendChild(el("p", "map-note",
      "Straight lines, not roads — use each day's Google Maps button for turn-by-turn."));

    let map = null;

    const draw = () => {
      rebuildChips();
      if (!map || !window.L) return;
      const L = window.L;

      // clear everything except the tiles
      map.eachLayer(l => { if (!(l instanceof L.TileLayer)) map.removeLayer(l); });

      const bounds = [];
      plan.days.forEach((d, i) => {
        const isSel = sel === null || sel === i;
        const faded = sel !== null && sel !== i;
        const col = DAY_COLORS[i % DAY_COLORS.length];
        const pts = [];
        const from = D.regions[d.base];
        if (from && from.coords) pts.push(from.coords);

        let n = 0;                        // numbering restarts each day
        d.spots.forEach(s => {
          if (!s.coords) return;
          n++;
          pts.push(s.coords);
          if (faded) return;              // other days: line only, no pins
          L.marker(s.coords, {
            icon: L.divIcon({
              className: "route-num",
              html: `<span style="background:${col}">${n}</span>`,
              iconSize: [28, 28], iconAnchor: [14, 14]
            }),
            zIndexOffset: isSel ? 500 : 0
          }).addTo(map).bindPopup(
            `<strong>Day ${d.n} · stop ${n}</strong><br>${esc(s.name)}` +
            (s.mapUrl ? `<br><a href="${s.mapUrl}" target="_blank" rel="noopener">Open in Google Maps →</a>` : "")
          );
          if (isSel) bounds.push(s.coords);
        });

        const to = D.regions[d.stayRegion];
        if (to && to.coords) pts.push(to.coords);
        if (pts.length > 1) {
          L.polyline(pts, {
            color: col, weight: faded ? 2 : 4,
            opacity: faded ? 0.18 : 0.85,
            dashArray: faded ? "4 6" : null
          }).addTo(map);
        }
        if (isSel) pts.forEach(pt => bounds.push(pt));
      });

      const home = D.regions[plan.prefs.base];
      if (home && home.coords) {
        L.marker(home.coords, {
          icon: L.divIcon({ className: "route-num route-home", html: "<span>🏠</span>", iconSize: [28, 28], iconAnchor: [14, 14] })
        }).addTo(map).bindPopup("Start & finish: " + esc(home.base));
        if (sel === null) bounds.push(home.coords);
      }
      if (bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: sel === null ? 10 : 12 });
    };

    loadLeaflet().then(L => {
      wrap.innerHTML = "";
      map = L.map(wrap);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      draw();
    }).catch(() => {
      wrap.innerHTML = "";
      wrap.classList.add("mapwrap-fallback");
      wrap.appendChild(el("p", "map-loading",
        "The route map needs an internet connection — the day-by-day Google Maps links above still work."));
    });
    return box;
  }

  /* ------------------------------------------------------------------ router
     Five tabs. Old bookmarks (#/wadis, #/beaches, #/map…) still work — they're
     redirected to the tab that now contains them. */
  const LEGACY = {
    wadis: "explore", beaches: "explore", mountains: "explore",
    experiences: "explore", food: "explore", shopping: "explore",
    itineraries: "plan", planner: "plan", more: "about"
    // #/map still resolves: renderMap() is kept for old links.
  };

  let lastCat = null;
  function route() {
    let cat = location.hash.replace("#/", "") || "explore";
    if (!D.categories.find(c => c.id === cat) && LEGACY[cat]) cat = LEGACY[cat];
    const known = D.categories.find(c => c.id === cat) ? cat : "explore";
    if (known !== lastCat) { typeFilter = null; viewMode = "list"; lastCat = known; }  // fresh tab
    renderTabs(known);
    renderUnlockBtn();
    const meta = D.categories.find(c => c.id === known);
    if (meta.special === "planner") renderPlanner();
    else if (meta.special === "map") renderMap();
    else if (meta.special === "info") renderInfo();
    else if (meta.special === "about") renderAbout();
    else renderCategory(known);
    window.scrollTo(0, 0);
  }

  /* -------------------------------------------------------------------- wire */
  $("#unlockBtn").onclick = openUnlock;
  $("#sheetClose").onclick = closeSheet;
  $("#sheetBackdrop").onclick = closeSheet;
  $("#modalClose").onclick = closeModal;
  $("#modalBackdrop").onclick = e => { if (e.target === $("#modalBackdrop")) closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); closeModal(); } });

  // The search toggle lives in the filter bar now (down with the content,
  // not up in the top bar) — see renderCategory. This stays a function so
  // anything can open search.
  window.__toggleSearch = () => {
    const sb = $("#searchbar");
    sb.hidden = !sb.hidden;
    if (!sb.hidden) $("#searchInput").focus();
  };
  $("#searchClose").onclick = () => {
    $("#searchbar").hidden = true;
    $("#searchInput").value = ""; query = ""; route();
  };
  $("#searchInput").oninput = e => {
    query = e.target.value.trim();
    typeFilter = null;                       // searching clears the type filter
    const cat = location.hash.replace("#/", "") || "wadis";
    const meta = D.categories.find(c => c.id === cat);
    if (meta && !meta.special) renderCategory(cat);
  };

  window.addEventListener("hashchange", route);
  $("#brandSub").textContent = D.meta.creator;
  renderLivingLine();

  Unlock.init().finally(route);
})();

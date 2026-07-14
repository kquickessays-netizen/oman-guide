/* =============================================================================
   APP — routing, rendering, the paywall veil, the planner UI, the About page
   ========================================================================== */
(() => {
  const D = window.OMAN_DATA;
  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

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

  /* ------------------------------------------------------------------ items */
  function itemsFor(cat) {
    const list = cat === "itineraries" ? D.itineraries : D.spots.filter(s => s.cat === cat);
    if (!query) return list;
    const q = query.toLowerCase();
    // Locked items are excluded from search — matching by name would confirm
    // what's behind the paywall ("Mibam" → 1 locked result = the name leaked).
    return list.filter(s =>
      isUnlocked(s) &&
      (s.name + " " + s.tagline + " " + (s.blurb || "") + " " + (s.sub || "") + " " + (s.tags || []).join(" "))
        .toLowerCase().includes(q)
    );
  }

  const isUnlocked = item => item.free || Unlock.has(item.cat || "itineraries");

  /* Locked items render as anonymous "hidden spot" cards — no name, photo,
     location or stats until purchase. The names still exist in the shipped
     data files (accepted trade-off of the static paywall), but nothing in
     the UI reveals them. */
  const SINGULAR = { wadis: "wadi", beaches: "beach", experiences: "experience",
                     food: "food spot", shopping: "shop", itineraries: "itinerary" };
  const singularOf = item => SINGULAR[item.cat || "itineraries"] || "spot";

  /* ------------------------------------------------------------- price block
     Every locked thing shows BOTH doors: this guide, or the whole pack.       */
  function priceBlock(cat, compact) {
    const catLabel = (D.categories.find(c => c.id === cat) || {}).label || "this guide";
    const single = D.meta.buyLinks[cat] || D.meta.buyLinks.bundle;
    const à_la_carte = D.categories.filter(c => !c.special).length * D.meta.singlePriceNum;
    const saving = à_la_carte - D.meta.bundlePriceNum;

    const w = el("div", "pricebox" + (compact ? " compact" : ""));
    w.innerHTML = `
      <div class="price-opt">
        <div class="price-opt-head">
          <span class="price-name">${esc(catLabel)} guide</span>
          <span class="price-tag">${D.meta.singlePrice}</span>
        </div>
        <p>Just this one. Every spot in the ${esc(catLabel.toLowerCase())} tab, unlocked.</p>
        <a class="btn-buy" href="${single}" target="_blank" rel="noopener">Get the ${esc(catLabel)} guide — ${D.meta.singlePrice}</a>
      </div>
      <div class="price-or">or</div>
      <div class="price-opt best">
        <div class="price-badge">Best value · saves $${saving}</div>
        <div class="price-opt-head">
          <span class="price-name">Complete Oman Pack</span>
          <span class="price-tag">${D.meta.bundlePrice}</span>
        </div>
        <p>Every tab — wadis, beaches, experiences, food, itineraries — <strong>plus the trip Planner</strong>. Updated free, forever.</p>
        <a class="btn-buy gold" href="${D.meta.buyLinks.bundle}" target="_blank" rel="noopener">Get everything — ${D.meta.bundlePrice}</a>
      </div>`;
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
    const sel = tabs.querySelector('[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  function renderUnlockBtn() {
    const b = $("#unlockBtn");
    if (Unlock.hasBundle()) { b.textContent = "✓ Full access"; b.className = "pill pill-unlocked"; }
    else if (Unlock.isAnythingOwned()) { b.textContent = "✓ " + Unlock.grants().length + " unlocked"; b.className = "pill pill-unlocked"; }
    else { b.textContent = "Unlock"; b.className = "pill pill-ghost"; }
  }

  /* --------------------------------------------------------- living banner */
  function livingBanner() {
    const b = el("div", "living");
    b.innerHTML = `
      <span class="pulse"></span>
      <div>
        <strong>This is a living guide, not a PDF.</strong>
        ${esc(D.meta.updateNote)}
        <span class="living-date">Last updated ${esc(D.meta.lastUpdated)}</span>
      </div>`;
    return b;
  }

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
      media.textContent = "🔒";
    }
    c.appendChild(media);

    const body = el("div", "card-body");

    const kick = el("div", "card-kicker");
    kick.appendChild(el("span", "chip " + (unlocked ? "chip-free" : "chip-lock"),
      unlocked ? (item.free ? "Free preview" : "✓ Unlocked") : "🔒 Locked"));
    if (unlocked) {
      if (item.sub) kick.appendChild(el("span", "chip", esc(item.sub)));
      if (item.stats && /Hard/.test(item.stats.Difficulty || "")) kick.appendChild(el("span", "chip chip-hard", "Hard"));
      if (item.guide === "required") kick.appendChild(el("span", "chip", "Guide required"));
      if (item.needs4x4) kick.appendChild(el("span", "chip", "4×4"));
      if (item.months && !item.months.includes(new Date().getMonth() + 1))
        kick.appendChild(el("span", "chip chip-season", `🌡️ Best ${Planner.monthsLabel(item.months)}`));
    }
    body.appendChild(kick);

    if (unlocked) {
      body.appendChild(el("h3", null, esc(item.name)));
      body.appendChild(el("p", "tagline", esc(item.tagline)));
      if (item.blurb) body.appendChild(el("p", "blurb", esc(item.blurb)));

      if (item.stats) {
        const mr = el("div", "metarow");
        Object.entries(item.stats).slice(0, 3).forEach(([k, v]) =>
          mr.appendChild(el("span", "meta", `${esc(k)}: <strong>${esc(v)}</strong>`)));
        body.appendChild(mr);
      }
    } else {
      body.appendChild(el("h3", null, `Hidden ${singularOf(item)}${lockNum ? " #" + lockNum : ""}`));
      body.appendChild(el("p", "tagline", "Unlock to reveal this one."));
    }

    if (unlocked) {
      c.style.cursor = "pointer";
      c.onclick = () => openSheet(item);
    } else {
      const veil = el("div", "lock-veil");
      veil.appendChild(el("p", null,
        "🔒 The name, photo, exact location, full write-up, hike &amp; swim times, my packing list and insider tips are in the paid guide."));
      const acts = el("div", "lock-actions");

      const buy = el("a", "btn-buy", `This guide — ${D.meta.singlePrice}`);
      buy.href = D.meta.buyLinks[item.cat || "itineraries"] || D.meta.buyLinks.bundle;
      buy.target = "_blank"; buy.rel = "noopener";
      buy.onclick = e => e.stopPropagation();

      const bundle = el("a", "btn-buy gold", `Whole bundle — ${D.meta.bundlePrice}`);
      bundle.href = D.meta.buyLinks.bundle;
      bundle.target = "_blank"; bundle.rel = "noopener";
      bundle.onclick = e => e.stopPropagation();

      const kb = el("button", "btn-key", "I have a key");
      kb.onclick = e => { e.stopPropagation(); openUnlock(); };

      acts.appendChild(buy); acts.appendChild(bundle); acts.appendChild(kb);
      veil.appendChild(acts);
      body.appendChild(veil);
    }

    c.appendChild(body);
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
    if (item.blurb) h += `<p class="body">${esc(item.blurb)}</p>`;

    if (item.stats) {
      h += `<div class="statgrid">` + Object.entries(item.stats).map(([k, v]) =>
        `<div class="s"><div class="lab">${esc(k)}</div><div class="val">${esc(v)}</div></div>`).join("") + `</div>`;
    }

    if (item.months && !item.months.includes(new Date().getMonth() + 1)) {
      h += `<div class="heatnote">🌡️ <strong>Best ${esc(Planner.monthsLabel(item.months))}.</strong> Doable now too — go at first light or after 4pm, skip the midday hours, and carry more water than feels reasonable.</div>`;
    }

    if (item.mapUrl) {
      h += `<a class="mapbtn" href="${item.mapUrl}" target="_blank" rel="noopener">📍 Open in Google Maps</a>`;
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
      if (aff.hotel) h += `<a class="affbtn" href="${aff.hotel}" target="_blank" rel="noopener">Book the stays on this route →</a>`;
      if (aff.car) h += `<a class="affbtn" href="${aff.car}" target="_blank" rel="noopener">Rent a car →</a>`;

    } else {
      const gettingThere = item.gettingThere || prem.gettingThere;
      const whatYoullDo  = item.whatYoullDo  || prem.whatYoullDo;
      const tips         = item.tips         || prem.tips;
      const guideNote    = prem.guideNote;

      // Hike / swim times, called out
      if (item.hikeTime || item.swimTime) {
        h += `<div class="timebox">`;
        if (item.hikeTime) h += `<div class="tb"><span class="tb-i">🥾</span><div><strong>Hiking</strong><span>${esc(item.hikeTime)}</span></div></div>`;
        if (item.swimTime) h += `<div class="tb"><span class="tb-i">💧</span><div><strong>Swimming</strong><span>${esc(item.swimTime)}</span></div></div>`;
        h += `</div>`;
      }

      if (gettingThere) h += `<h3 class="sec">Getting there</h3><p class="body">${esc(gettingThere)}</p>`;
      if (whatYoullDo)  h += `<h3 class="sec">What you'll do</h3><p class="body">${esc(whatYoullDo)}</p>`;

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
        if (aff.gear) h += `<a class="affbtn" href="${aff.gear}" target="_blank" rel="noopener">My exact gear list →</a>`;
      }

      if (tips && tips.length) {
        h += `<div class="tipbox"><strong>My insider tips</strong><ul>` +
             tips.map(t => `<li>${esc(t)}</li>`).join("") + `</ul></div>`;
      }
      if (guideNote) {
        h += `<div class="guidebox"><strong>🧭 Go with a guide</strong><p>${esc(guideNote)}</p>`;
        if (aff.guide) h += `<a class="affbtn" href="${aff.guide}" target="_blank" rel="noopener">Book a guided trip →</a>`;
        h += `</div>`;
      }
      if (item.needs4x4 && aff.car) h += `<a class="affbtn" href="${aff.car}" target="_blank" rel="noopener">You'll need a 4×4 — rent one →</a>`;
      if (aff.esim) h += `<a class="affbtn" href="${aff.esim}" target="_blank" rel="noopener">Get an Oman eSIM (maps off-grid) →</a>`;
    }

    if (item.needsFirstHand) {
      h += `<div class="verifynote warn">⚠️ Public info on this one is thin and inconsistent. Confirm access and water levels locally before you commit a day to it.</div>`;
    } else if (item.verify) {
      h += `<div class="verifynote">ℹ️ Times, fees and access details are researched from public sources and change often — confirm on the day.</div>`;
    }
    h += `</div>`;

    b.innerHTML = h;
    $("#sheet").hidden = false;
    $("#sheetBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    $("#sheet").scrollTop = 0;
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
        <p>Bought on Gumroad? Paste the licence key from your receipt email.</p>
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
    view.appendChild(livingBanner());

    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, esc(meta.label)));
    head.appendChild(el("p", null, esc(meta.blurb)));
    view.appendChild(head);

    if (!items.length) {
      view.appendChild(el("div", "empty", `<div class="big">🏜️</div><p>Nothing matches "${esc(query)}".</p>`));
      return;
    }

    const grid = el("div", "grid");
    let lockN = 0;
    items.forEach(i => grid.appendChild(card(i, isUnlocked(i) ? 0 : ++lockN)));
    view.appendChild(grid);

    const lockedCount = items.filter(i => !isUnlocked(i)).length;
    if (lockedCount && !Unlock.hasBundle()) {
      const h = el("div", "section-head");
      h.innerHTML = `<h2>${lockedCount} more in this guide 🔒</h2><p>Two ways in — pick whichever suits.</p>`;
      view.appendChild(h);
      view.appendChild(priceBlock(cat));
    }
  }

  /* ------------------------------------------------------------------- about */
  function renderAbout() {
    const m = D.meta;
    clearView();
    const w = el("div", "about");
    w.innerHTML = `
      <div class="about-hero">
        <div class="about-avatar">🇴🇲</div>
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
        <p>I'm an Omani content creator and a licensed tour guide, and I've spent years chasing waterfalls, swimming through canyons and hiking into the quiet corners of this country — filming all of it. My wadi videos have been watched over a million times, and the question I get more than any other is always the same:</p>
        <p class="pull">“Where is this, and how do I get there?”</p>
        <p>This app is my answer. Every wadi, beach and hidden corner I'd send a friend to, with the maps, the drive times, the hike and swim times, and the honest difficulty notes — so you can actually go, and go safely.</p>

        <h3>Why an app and not a PDF</h3>
        <p>Because Oman changes. Entry fees go up, roads wash out in a flood, a wadi that took two hours last winter takes four this one. A PDF is out of date the day you download it. This gets updated every month, and if you've bought it, you get every update free, forever. That's the whole point.</p>

        <h3>One ask</h3>
        <p>Respect these places. Take your rubbish out, dress modestly at the village wadis, don't touch the coral or the turtles, and leave it all as beautiful as you found it. Shukran. 🤍</p>
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
      h.innerHTML = `<h2>Support the guide</h2><p>It's how the updates keep coming.</p>`;
      view.appendChild(h);
      view.appendChild(priceBlock("wadis"));
    }
  }

  /* ----------------------------------------------------------------- planner */
  const prefs = {
    days: 5, month: new Date().getMonth() + 1, pace: "balanced",
    interests: ["swimming", "hiking", "culture"],
    fitness: 3, has4x4: true, canSwim: true, kids: false, base: "muscat"
  };

  function renderPlanner() {
    clearView();
    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, "🧭 Build my Oman trip"));
    head.appendChild(el("p", null, "Tell me what you like and how long you've got. I'll route it — real drive times, sensible days, every stop pinned in Google Maps, and nothing that puts you in a wadi you shouldn't be in."));
    view.appendChild(head);

    // The Planner is bundle-only: no form, no teaser, no free Day 1. Non-buyers
    // see the pitch and the single door in — the Complete Oman Pack.
    if (!Unlock.hasBundle()) {
      const p = el("div", "promo");
      p.innerHTML = `
        <h3>🔒 The Planner comes with the Complete Oman Pack</h3>
        <p>It builds your whole trip: days clustered by region so you never backtrack, real drive times, heat-smart start times, every stop pinned in Google Maps and the full route drawn on one map. It's not sold separately — it's included with the pack, along with every guide in the app.</p>`;
      view.appendChild(p);

      const w = el("div", "pricebox compact");
      w.innerHTML = `
        <div class="price-opt best">
          <div class="price-badge">Includes the Planner</div>
          <div class="price-opt-head">
            <span class="price-name">Complete Oman Pack</span>
            <span class="price-tag">${D.meta.bundlePrice}</span>
          </div>
          <p>Every tab — wadis, beaches, experiences, food, shopping, itineraries — <strong>plus the trip Planner</strong>. Updated free, forever.</p>
          <a class="btn-buy gold" href="${D.meta.buyLinks.bundle}" target="_blank" rel="noopener">Get everything — ${D.meta.bundlePrice}</a>
        </div>`;
      view.appendChild(w);

      const kb = el("button", "btn-key", "I have a key");
      kb.style.marginTop = "12px";
      kb.onclick = openUnlock;
      view.appendChild(kb);
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
      renderPlan(Planner.build(prefs));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    form.appendChild(go);
    view.appendChild(form);
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
      const icon = l.type === "drive" ? "🚗 " : l.type === "sleep" ? "🌙 " : "📍 ";
      main.appendChild(el("strong", null, icon + esc(l.title) + (l.dur && l.type === "drive" ? ` · ${Planner.dur(l.dur)}` : "")));
      if (l.note) main.appendChild(el("div", "leg-note", esc(l.note)));
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

  const CAT_COLORS = { wadis: "#0d8abc", beaches: "#d97706", experiences: "#7c3aed", food: "#dc2626" };

  function renderMap() {
    clearView();
    // Locked spots stay OFF the map — even an unnamed pin gives the location
    // away, and the location is exactly what's being sold.
    const hiddenCount = D.spots.filter(s => !isUnlocked(s)).length;

    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, "📍 The map"));
    head.appendChild(el("p", null, hiddenCount
      ? "Your unlocked spots, on one map. Tap a pin."
      : "Every spot in the guide, on one map. Tap a pin."));
    view.appendChild(head);

    const legend = el("div", "map-legend");
    D.categories.filter(c => !c.special && c.id !== "itineraries").forEach(c => {
      legend.appendChild(el("span", "map-key",
        `<span class="dot" style="background:${CAT_COLORS[c.id] || "#666"}"></span>${esc(c.label)}`));
    });
    view.appendChild(legend);

    if (hiddenCount) {
      const note = el("div", "promo");
      note.innerHTML = `<p>🔒 <strong>${hiddenCount} more pins</strong> appear here when you unlock — the hidden wadis, beaches and spots most visitors never find.</p>`;
      view.appendChild(note);
    }

    const wrap = el("div", "mapwrap", `<div class="map-loading">Loading the map…</div>`);
    view.appendChild(wrap);

    loadLeaflet().then(L => {
      wrap.innerHTML = "";
      const map = L.map(wrap).setView([22.7, 58.0], 7);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      D.spots.filter(s => s.coords && isUnlocked(s)).forEach(s => {
        const mk = L.circleMarker(s.coords, {
          radius: 8, weight: 2, color: "#fff",
          fillColor: CAT_COLORS[s.cat] || "#666",
          fillOpacity: 0.95
        }).addTo(map);

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
    }).catch(() => {
      wrap.innerHTML = "";
      wrap.classList.add("mapwrap-fallback");
      wrap.appendChild(el("p", "map-loading",
        "The map needs an internet connection the first time it loads. Every pin still works:"));
      const list = el("div", "pinrow");
      D.spots.filter(s => s.mapUrl && isUnlocked(s)).forEach(s => {
        const a = el("a", "pin", "📍 " + esc(s.name));
        a.href = s.mapUrl; a.target = "_blank"; a.rel = "noopener";
        list.appendChild(a);
      });
      wrap.appendChild(list);
    });
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
    view.appendChild(livingBanner());

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
          a.href = link; a.target = "_blank"; a.rel = "noopener";
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

    const legend = el("div", "map-legend");
    plan.days.forEach((d, i) => {
      if (!d.spots.length) return;
      legend.appendChild(el("span", "map-key",
        `<span class="dot" style="background:${DAY_COLORS[i % DAY_COLORS.length]}"></span>Day ${d.n}`));
    });
    box.appendChild(legend);

    const wrap = el("div", "mapwrap planmap", `<div class="map-loading">Drawing your route…</div>`);
    box.appendChild(wrap);
    box.appendChild(el("p", "map-note",
      "Straight lines, not roads — use each day's Google Maps button for turn-by-turn."));

    loadLeaflet().then(L => {
      wrap.innerHTML = "";
      const map = L.map(wrap);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const bounds = [];
      let n = 0;
      plan.days.forEach((d, i) => {
        const col = DAY_COLORS[i % DAY_COLORS.length];
        const pts = [];
        const from = D.regions[d.base];
        if (from && from.coords) pts.push(from.coords);
        d.spots.forEach(s => {
          if (!s.coords) return;
          n++;
          pts.push(s.coords);
          L.marker(s.coords, {
            icon: L.divIcon({ className: "route-num", html: `<span style="background:${col}">${n}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] })
          }).addTo(map).bindPopup(`<strong>Day ${d.n} · stop ${n}</strong><br>${esc(s.name)}`);
        });
        const to = D.regions[d.stayRegion];
        if (to && to.coords) pts.push(to.coords);
        if (pts.length > 1) L.polyline(pts, { color: col, weight: 3, opacity: 0.8 }).addTo(map);
        pts.forEach(pt => bounds.push(pt));
      });

      const home = D.regions[plan.prefs.base];
      if (home && home.coords) {
        L.marker(home.coords, {
          icon: L.divIcon({ className: "route-num route-home", html: "<span>🏠</span>", iconSize: [26, 26], iconAnchor: [13, 13] })
        }).addTo(map).bindPopup("Start & finish: " + esc(home.base));
        bounds.push(home.coords);
      }
      if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });
    }).catch(() => {
      wrap.innerHTML = "";
      wrap.classList.add("mapwrap-fallback");
      wrap.appendChild(el("p", "map-loading",
        "The route map needs an internet connection — the day-by-day Google Maps links above still work."));
    });
    return box;
  }

  /* ------------------------------------------------------------------ router */
  function route() {
    const cat = location.hash.replace("#/", "") || "wadis";
    const known = D.categories.find(c => c.id === cat) ? cat : "wadis";
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
  $("#modalBackdrop").onclick = e => { if (e.target === $("#modalBackdrop")) closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); closeModal(); } });

  $("#searchBtn").onclick = () => {
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
    const cat = location.hash.replace("#/", "") || "wadis";
    const meta = D.categories.find(c => c.id === cat);
    if (meta && !meta.special) renderCategory(cat);
  };

  window.addEventListener("hashchange", route);
  $("#brandSub").textContent = D.meta.creator;

  Unlock.init().finally(route);
})();

/* =============================================================================
   APP, routing, rendering, the paywall veil, the planner UI, the About page
   ========================================================================== */
(() => {
  const D = window.OMAN_DATA;
  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  /* Every affiliate link goes out the door wearing your name tag, utm_* and
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

  /* "Use code HUSSAIN10, 10% off" chip, rendered after affiliate buttons
     once a code exists in meta.affRef. Empty code = empty string. */
  function discountChip() {
    const ref = (D.meta.affRef || {});
    if (!ref.discountCode) return "";
    return `<span class="discount-chip">🎟️ ${esc(ref.discountLabel || "Discount with code")} <strong>${esc(ref.discountCode)}</strong></span>`;
  }

  const view = $("#view");
  let query = "";        // trimmed, what actually filters the list
  let queryRaw = "";     // exactly what's in the box, spaces and all

  /* Wipe the view. Explicit node removal rather than innerHTML = "", it also
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
    // Locked items are excluded from search, matching by name would confirm
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

     GROUP  the broad bucket, Wadis, Beaches, Mountains, Experiences, Food,
            Shopping. This is what the FILTER CHIPS are: six of them, not twenty.
            A spot's group is its `cat`, unless it carries an explicit `group`
            (the Salalah spots do, they're all cat:"salalah", but a beach in
            Dhofar is still a beach).

     TYPE   the fine sub-tag, Canyon, Waterfall, Mall, Souq, Coffee, Fort…
            It is NOT a filter chip. It's the little chip ON the card, telling
            you what kind of thing this particular one is.                     */
  let typeFilter = null;              // holds a GROUP id; null = "All"

  const GROUPS = {
    wadis:       { label: "Wadis", icon: "💧" },
    beaches:     { label: "Beaches", icon: "🏖️" },
    mountains:   { label: "Mountains", icon: "⛰️" },
    experiences: { label: "Experiences", icon: "⭐" },
    food:        { label: "Food", icon: "🍽️" },
    shopping:    { label: "Shopping", icon: "🛍️" },
    salalah:     { label: "Salalah", icon: "🌴" },
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

  /* List ⇄ Map. The map isn't a tab any more, it's a view of the tab you're on,
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

  /* ------------------------------------------------------------- filter panel
     ONE button, not a row of chips plus two mystery icons. The button carries a
     count of what's on; tapping it drops a panel with everything that filters
     this tab, the type of place, and the refinements (season, 4×4, kids,
     saved). Nothing else on the page filters anything, so there is nowhere else
     to look. Closed by default; opens itself if a filter is already on, because
     a filtered list with no visible reason why is how you lose people. */
  let filterOpen = false;

  const SMART_KEYS = ["todo", "been", "saved", "season", "no4x4", "kids"];
  function activeFilterCount() {
    return (typeFilter ? 1 : 0) + SMART_KEYS.filter(k => smart[k]).length;
  }

  function filterControls(items, onChange) {
    const types = typesIn(items);
    const nActive = activeFilterCount();

    const wrap = el("div", "filterwrap");

    /* --- the row: one filter button + the list/map switch ------------------ */
    const bar = el("div", "filterbar");
    const btn = el("button", "filterbtn" + (nActive ? " on" : ""));
    btn.type = "button";
    btn.setAttribute("aria-expanded", String(filterOpen));
    btn.innerHTML =
      `<span class="fb-ico" aria-hidden="true"><i></i><i></i><i></i></span>` +
      `<span class="fb-label">Filter</span>` +
      (nActive ? `<span class="fb-count">${nActive}</span>` : "") +
      `<span class="fb-caret" aria-hidden="true">⌄</span>`;
    bar.appendChild(btn);
    bar.appendChild(viewSwitch(onChange));
    wrap.appendChild(bar);

    /* --- the panel -------------------------------------------------------- */
    const panel = el("div", "filterpanel");
    panel.hidden = !filterOpen;
    btn.classList.toggle("open", filterOpen);
    btn.onclick = () => {
      filterOpen = !filterOpen;
      panel.hidden = !filterOpen;
      btn.classList.toggle("open", filterOpen);
      btn.setAttribute("aria-expanded", String(filterOpen));
    };

    const section = (title, kids) => {
      const s = el("div", "fp-sec");
      s.innerHTML = `<div class="fp-h">${title}</div>`;
      const row = el("div", "fp-row");
      kids.forEach(k => row.appendChild(k));
      s.appendChild(row);
      return s;
    };

    // What kind of place. "All" is a chip like any other so there's always
    // exactly one lit, no ambiguous empty state.
    if (types.length > 1) {
      const mk = (label, value, count) => {
        const b = el("button", "fchip" + (typeFilter === value ? " on" : ""),
          `<span>${esc(label)}</span><span class="fchip-n">${count}</span>`);
        b.type = "button";
        b.setAttribute("aria-pressed", typeFilter === value ? "true" : "false");
        b.onclick = () => {
          typeFilter = (typeFilter === value) ? null : value;   // tap again = clear
          if (window.Analytics && value) Analytics.track("type_filter", { group: value || "all" });
          onChange();
        };
        return b;
      };
      const chips = [mk("All", null, items.length)];
      types.forEach(t => chips.push(mk(groupLabel(t.type), t.type, t.n)));
      panel.appendChild(section("What kind of place", chips));
    }

    // Refinements. Each one is hidden when it would filter nothing on this tab
    //, a "No 4×4" toggle on a tab where nothing needs a 4×4 is a dead control.
    // "Still to go" is the one that turns 101 spots into a to-do list, so it
    // leads. It and "Been there" are opposites, turning one on turns the
    // other off, because both at once is always an empty list.
    const nBeen = Store.been().length;
    const defs = [
      ["todo", "◎", "Still to go", nBeen > 0],
      ["been", "✓", "Been there", nBeen > 0],
      ["saved", "♥", "Saved", Store.saved().length > 0],
      ["season", "🌡️", "In season now", items.some(i => !inSeason(i))],
      ["no4x4", "🚗", "No 4×4 needed", items.some(i => i.needs4x4)],
      ["kids", "👨‍👩‍👧", "Kids OK", items.some(i => i.kidOk === false)]
    ].filter(d => d[3]);

    if (defs.length) {
      const toggles = defs.map(([key, icon, label]) => {
        const b = el("button", "ftog" + (smart[key] ? " on" : ""),
          `<span class="ftog-i">${icon}</span><span>${esc(label)}</span>` +
          `<span class="ftog-box" aria-hidden="true"></span>`);
        b.type = "button";
        b.setAttribute("aria-pressed", smart[key] ? "true" : "false");
        b.onclick = () => {
          smart[key] = !smart[key];
          if (smart[key] && key === "todo") smart.been = false;
          if (smart[key] && key === "been") smart.todo = false;
          onChange();
        };
        return b;
      });
      panel.appendChild(section("Refine", toggles));
    }

    if (nActive) {
      const clear = el("button", "fp-clear", `Clear ${nActive} filter${nActive > 1 ? "s" : ""}`);
      clear.type = "button";
      clear.onclick = () => {
        typeFilter = null;
        Object.keys(smart).forEach(k => smart[k] = false);
        onChange();
      };
      panel.appendChild(clear);
    }

    if (panel.children.length) wrap.appendChild(panel);
    else btn.disabled = true;
    return wrap;
  }

  /* ------------------------------------------------------------------ steps
     Nobody reads a wall of text on a phone at 6am. Any field that can be a
     paragraph can instead be an ARRAY of short lines, and it renders as a
     numbered step list. Strings still work, they just render as one line.
        gettingThere: ["Drive the coast road east, ~1h20 from Muscat.",
                       "Park at the free lot by the bridge.",
                       "Take the boat across, 1 OMR return."]                */
  function steps(v, cls) {
    if (Array.isArray(v)) {
      if (!v.length) return "";
      return `<ol class="${cls || "steplist"}">` +
             v.map(s => `<li>${esc(s)}</li>`).join("") + `</ol>`;
    }
    return `<p class="body">${esc(v)}</p>`;
  }

  /* Same idea, but bulleted and unnumbered, for "what you'll do" style lists
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

  /* ------------------------------------------------------- saved & been-there
     Two id-lists in localStorage. No login: the phone remembers. Saved feeds
     the ♥ filter; Been-there is the explorer's checklist ("23 of 87"). */
  const Store = (() => {
    const read = k => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
    const toggle = (k, id) => {
      const v = read(k); const i = v.indexOf(id);
      i >= 0 ? v.splice(i, 1) : v.push(id);
      write(k, v); return i < 0;
    };
    return {
      saved:    () => read("oman_saved"),
      been:     () => read("oman_been"),
      isSaved:  id => read("oman_saved").includes(id),
      isBeen:   id => read("oman_been").includes(id),
      toggleSaved: id => { const on = toggle("oman_saved", id); if (window.Analytics) Analytics.track("save", { id: id, on: on }); return on; },
      toggleBeen:  id => { const on = toggle("oman_been", id);  if (window.Analytics) Analytics.track("been", { id: id, on: on }); return on; }
    };
  })();

  // Smart filters (session state): season / no-4×4 / kids / saved.
  const smart = { season: false, no4x4: false, kids: false, saved: false,
                  todo: false, been: false };
  const inSeason = i => !i.months || i.months.includes(new Date().getMonth() + 1);
  const smartPass = i =>
    (!smart.season || inSeason(i)) &&
    (!smart.no4x4 || !i.needs4x4) &&
    (!smart.kids || i.kidOk !== false) &&
    (!smart.saved || Store.isSaved(i.id)) &&
    (!smart.todo || !Store.isBeen(i.id)) &&
    (!smart.been || Store.isBeen(i.id));

  /* Locked items render as anonymous "hidden spot" cards, no name, photo,
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
          <span class="price-name">Exploring Oman: the full guide</span>
          <span class="price-tag">${D.meta.bundlePrice}</span>
        </div>
        <ul class="bulletlist">
          <li>All <strong>${lockedCount()}</strong> locked spots, the remote wadis, the empty beaches, the mountain villages, the south.</li>
          <li>Every itinerary: 3-day, 5-day and the 7-day loop.</li>
          <li><strong>The trip Planner</strong>, a route built around your days, pace and fitness.</li>
          <li>New spots and re-checked prices every month. Free, forever. No subscription.</li>
        </ul>
        <a class="btn-buy gold" href="${D.meta.buyLinks.bundle}" target="_blank" rel="noopener">Get the full guide, ${D.meta.bundlePrice}</a>
        <p class="price-fine">One key. Works on any phone, paste it again if you switch.</p>
      </div>`;

    // Social proof, meta.testimonials, curated by hand. Compact contexts
    // (the unlock modal) get one; full price blocks get up to three.
    const quotes = (D.meta.testimonials || []).slice(0, compact ? 1 : 3);
    if (quotes.length) {
      const t = el("div", "testimonials");
      quotes.forEach(q => t.appendChild(el("blockquote", "testi",
        `“${esc(q.text)}”${q.by ? `<cite>, ${esc(q.by)}</cite>` : ""}`)));
      w.appendChild(t);
    }
    return w;
  }

  /* ----------------------------------------------------------- free launch
     While meta.freeLaunch is true the guide is fully open. Instead of buy
     buttons, the ask is an EMAIL: join the founding-explorer list before the
     paywall lands in October. One box, reused everywhere. */
  function launchBox() {
    const w = el("div", "launchbox");
    w.innerHTML = `
      <div class="launch-badge">🎁 Launch season, the whole guide is free</div>
      <p>Every spot, every itinerary and the trip Planner, open for everyone while I launch,
         all through the khareef. <strong>In October it becomes a paid guide</strong> for the winter season.</p>
      <p class="launch-ask">Leave your email and you're a <strong>founding explorer</strong>, you'll get the
         updates and the best deal when the paid version lands.</p>
      <div class="subrow">
        <input type="email" id="lbEmail" placeholder="you@email.com" autocomplete="email">
        <button class="pill" id="lbBtn">Count me in</button>
      </div>
      <div id="lbMsg"></div>`;
    w.querySelector("#lbBtn").onclick = async () => {
      const em = w.querySelector("#lbEmail").value.trim();
      const msg = w.querySelector("#lbMsg");
      if (!/^\S+@\S+\.\S+$/.test(em)) { msg.innerHTML = `<div class="msg err">That doesn't look like an email.</div>`; return; }
      const r = await Analytics.subscribe(em);
      msg.innerHTML = r.ok ? `<div class="msg ok">You're in, founding explorer. 🇴🇲</div>`
                           : `<div class="msg err">Couldn't sign you up, try again in a bit.</div>`;
    };
    return w;
  }

  /* ------------------------------------------------------- plan-my-trip form
     "Book me": travellers leave their details and what they're planning;
     Hussain gets the lead (Supabase `bookings`, or an email until the
     backend is on) and contacts them to plan the trip personally. */
  function bookBox() {
    const w = el("div", "bookbox");
    w.innerHTML = `
      <h3>🤝 Want me to plan it for you?</h3>
      <p>Tell me your dates and what you want to see. I'll send back a route, and
         answer whatever you ask before you book anything.</p>
      <div class="bookgrid">
        <input id="bkName" maxlength="80" placeholder="Your name">
        <input id="bkContact" maxlength="120" placeholder="Email or WhatsApp number">
        <input id="bkDates" maxlength="80" placeholder="When? (e.g. 12–19 Dec, or 'flexible')">
        <input id="bkGroup" maxlength="40" placeholder="Who's coming? (e.g. couple, family of 5)">
      </div>
      <textarea id="bkNote" maxlength="1000" rows="3" placeholder="What do you want from the trip? Wadis, desert, culture, kids along, fitness level, budget…"></textarea>
      <button type="button" class="rate-send" id="bkSend">Request my trip plan</button>
      <p class="book-fine">I reply personally, usually within 48 hours.</p>
      <div id="bkMsg"></div>`;
    w.querySelector("#bkSend").onclick = async () => {
      const val = id => w.querySelector(id).value.trim();
      const data = { name: val("#bkName"), contact: val("#bkContact"),
                     dates: val("#bkDates"), group: val("#bkGroup"), note: val("#bkNote") };
      const msg = w.querySelector("#bkMsg");
      if (!data.name || !data.contact) {
        msg.innerHTML = `<div class="msg err">I need at least your name and a way to reach you.</div>`;
        return;
      }
      if (window.Analytics) Analytics.track("book_click", {});
      if (window.Analytics && Analytics.enabled) {
        const r = await Analytics.book(data);
        msg.innerHTML = r.ok
          ? `<div class="msg ok">Got it, ${esc(data.name)}, I'll be in touch soon. 🇴🇲</div>`
          : `<div class="msg err">Couldn't send, check your connection and try again.</div>`;
        if (r.ok) w.querySelector("#bkSend").disabled = true;
      } else {
        const bodyTxt = `Name: ${data.name}\nContact: ${data.contact}\nDates: ${data.dates || "-"}\nGroup: ${data.group || "-"}\nNotes: ${data.note || "-"}`;
        location.href = "mailto:" + (D.meta.email || "") +
          "?subject=" + encodeURIComponent("Plan my trip, " + data.name) +
          "&body=" + encodeURIComponent(bodyTxt);
        msg.innerHTML = `<div class="msg ok">Opening your email app, hit send and it's with me.</div>`;
      }
    };
    return w;
  }

  /* ------------------------------------------------------------------- tabs */
  function renderTabs(active) {
    const tabs = $("#tabs");
    tabs.innerHTML = "";
    D.categories.forEach(c => {
      const soon = c.id === "salalah" && D.meta.salalahComingSoon;
      const b = el("button", "tab" + (soon ? " tab-dim" : ""),
        `<span class="t-icon">${c.icon}</span>${esc(c.label)}` +
        (soon ? `<i class="tab-soon">soon</i>` : ""));
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(c.id === active));
      b.onclick = () => (location.hash = "#/" + c.id);
      tabs.appendChild(b);
    });
    // The tab bar wraps now (every tab visible at once), so there's nothing to
    // scroll into view, and scrollIntoView here would jog the whole page.
  }

  function renderUnlockBtn() {
    const b = $("#unlockBtn");
    if (D.meta.freeLaunch) { b.textContent = "🎁 Free launch"; b.className = "pill pill-unlocked"; return; }
    if (Unlock.hasBundle()) { b.textContent = "✓ Full access"; b.className = "pill pill-unlocked"; }
    else if (Unlock.isAnythingOwned()) { b.textContent = "✓ " + Unlock.grants().length + " unlocked"; b.className = "pill pill-unlocked"; }
    else { b.textContent = "Unlock"; b.className = "pill pill-ghost"; }
  }

  /* ----------------------------------------------------------- living line
     One small line in the header, above the tabs, on every screen. It used to
     be a fat banner repeated inside each tab, this says the same thing in a
     tenth of the space. */
  /* The living-guide strip used to be its own full-width row under the brand.
     It cost 28px of every screen on every tab to repeat one fact, so the fact
     moved into the brand sub-line instead and the row is gone (.livingline is
     display:none). Kept as a function so anything still calling it is safe. */
  function renderLivingLine() {
    const l = $("#livingLine");
    if (l) l.innerHTML = "";
  }

  // Short area names for the card tag, the full labels in D.regions are too
  // long for a chip.
  const REGION_SHORT = {
    "muscat": "Muscat", "batinah": "Batinah", "coast-east": "East coast",
    "sharqiyah": "Sharqiyah", "dakhiliyah": "Nizwa side", "rustaq": "Rustaq loop",
    "musandam": "Musandam", "dhofar": "Salalah"
  };

  /* AllTrails-style compact stat line: colour-coded difficulty · time · 4×4.
     One glance answers "can I do this one?" without opening the sheet. */
  function statLine(item, onPhoto) {
    const bits = [];
    const d = item.stats && item.stats.Difficulty;
    if (d) {
      const cls = /hard/i.test(d) ? "sl-hard" : /moder/i.test(d) ? "sl-mod" : "sl-easy";
      bits.push(`<span class="sl-dot ${cls}"></span>${esc(String(d).split(", ")[0].split("(")[0].trim())}`);
    }
    const t = item.stats && (item.stats["Time needed"] || item.stats["Time"]);
    if (t) bits.push("⏱ " + esc(String(t).split("(")[0].trim()));
    if (item.needs4x4) bits.push("🚙 4×4");
    return bits.length
      ? `<p class="statline${onPhoto ? " on-photo" : ""}">${bits.join(`<span class="sl-sep">·</span>`)}</p>`
      : "";
  }

  /* ------------------------------------------------------------------- card */
  function card(item, lockNum) {
    const unlocked = isUnlocked(item);
    const c = el("article", "card" + (unlocked ? "" : " locked"));

    const media = el("div", "card-media");
    if (unlocked) {
      // A real <img loading="lazy">, NOT a CSS background-image. Backgrounds
      // cannot lazy-load, so opening Explore used to fetch all 71 card photos
      // at once and everything else (the banner included) starved behind
      // them. With lazy imgs the browser only fetches what's near the screen.
      if (item.img) {
        const im = new Image();
        im.src = item.img; im.alt = item.name;
        im.loading = "lazy"; im.decoding = "async";
        im.className = "card-img";
        media.appendChild(im);
      } else media.textContent = "📷 " + item.name;
    } else {
      media.classList.add("card-media-locked");
      media.innerHTML = `<span class="lock-pill">🔒 In the guide</span>`;
    }
    c.appendChild(media);

    const body = el("div", "card-body");

    // Photo-forward card: when there's a real photo, the name, tagline and
    // chips sit ON the image over a dark scrim, the feed reads like a
    // travel app, not a document. No photo (or locked) = classic layout.
    const photoCard = unlocked && !!item.img;

    // CARD chips: identification only, what it is, where it is, reel or not.
    // Everything else (difficulty, 4×4, guide, season, sub-label) lives in
    // the detail sheet: important tags outside, the rest inside.
    const kick = el("div", "card-kicker" + (photoCard ? " on-photo" : ""));
    if (item.type) kick.appendChild(el("span", "chip chip-type", esc(typeChipLabel(item.type))));
    if (item.region && item.region !== "dhofar" && REGION_SHORT[item.region])
      kick.appendChild(el("span", "chip chip-region", "📍 " + REGION_SHORT[item.region]));
    if (item.insta) kick.appendChild(el("span", "chip chip-reel", "🎬 Reel"));
    if (photoCard) {
      media.classList.add("card-media-photo");
      const ov = el("div", "card-overlay");
      ov.appendChild(kick);
      ov.appendChild(el("h3", "ov-title", esc(item.name)));
      ov.appendChild(el("p", "ov-tag", esc(item.tagline)));
      const sl = statLine(item, true);
      if (sl) ov.insertAdjacentHTML("beforeend", sl);
      media.appendChild(ov);
      // Photo cards are IMAGE + overlay only, short and scannable. All the
      // stats and text live in the detail sheet, one tap away.
    } else {
      body.appendChild(kick);
      if (unlocked) {
        body.appendChild(el("h3", null, esc(item.name)));
        body.appendChild(el("p", "tagline", esc(item.tagline)));
        const sl = statLine(item);
        if (sl) body.insertAdjacentHTML("beforeend", sl);
        // (blurb + full stats live in the sheet, cards stay short)
      } else {
        // Compact locked card: one strip, one line, one button. The full
        // sales pitch lives in the price block ONCE per tab, not on all 40+
        // locked cards, that's what made the feed feel endless.
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
      // ♥ save, top-right of the card, works without opening the sheet.
      const heart = el("button", "save-heart" + (Store.isSaved(item.id) ? " on" : ""), "♥");
      heart.setAttribute("aria-label", "Save " + item.name);
      heart.onclick = e => {
        e.stopPropagation();
        heart.classList.toggle("on", Store.toggleSaved(item.id));
      };
      media.appendChild(heart);
      // ✓ been-here, right under the heart: tick a place off from the feed
      // without opening it. The passive "✓ Been" badge stays on the LEFT.
      const bn = el("button", "been-check" + (Store.isBeen(item.id) ? " on" : ""), "✓");
      bn.setAttribute("aria-label", (Store.isBeen(item.id) ? "Been here, tap to undo: " : "Mark as been here: ") + item.name);
      bn.onclick = e => {
        e.stopPropagation();
        const on = Store.toggleBeen(item.id);
        applyRankTheme();
        renderHud();
        // Rebuild just this card, so the left badge appears/disappears without
        // re-rendering the whole list (which would flicker every photo).
        c.replaceWith(card(item, lockNum));
        if (on) celebrate(Store.been().length); else toast("Unmarked");
      };
      media.appendChild(bn);
      if (Store.isBeen(item.id)) media.appendChild(el("span", "been-badge", "✓ Been"));
      // Rexby-style value badge: flag genuinely seasonal spots that are good
      // RIGHT NOW (year-round spots don't get one, it would mean nothing).
      else if (item.img && item.months && item.months.length < 12 && inSeason(item))
        media.appendChild(el("span", "season-badge", "🌡️ In season"));
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
    // Every photo the spot has, in one list: the hero first, then the gallery.
    // They all live in the hero SLIDER now, not dealt out into the folds where
    // nobody found them.
    const slides = [];
    if (item.img) slides.push({ src: item.img, credit: item.imgCredit || "" });
    [...(item.gallery || []), ...(prem.gallery || [])].forEach(g => {
      const o = typeof g === "string" ? { src: g } : g;
      if (o.src) slides.push({ src: o.src, credit: o.credit || "" });
    });

    const factIcon = k => {
      if (/difficult/i.test(k)) return "🧗";
      if (/time|hours/i.test(k)) return "⏱️";
      if (/hike/i.test(k)) return "🥾";
      if (/swim/i.test(k)) return "💧";
      if (/vehicle|4×4/i.test(k)) return "🚙";
      if (/season|best time|closed|depth|altitude/i.test(k)) return "🗓️";
      if (/entry|fee|price/i.test(k)) return "🎫";
      if (/best for/i.test(k)) return "⭐";
      if (/guide/i.test(k)) return "🧭";
      return "▪️";
    };

    /* ---- 1 · THE POSTER -----------------------------------------------------
       The photo was 240px of decoration carrying nothing but a credit line.
       It's the header now: name, tagline and chips print ON it over a scrim,
       which buys back ~80px and makes the sheet open like a place card. */
    let chips = "";
    if (item.type) chips += `<span class="chip chip-type">${esc(typeChipLabel(item.type))}</span>`;
    if (item.sub && item.sub !== item.type) chips += `<span class="chip">${esc(item.sub)}</span>`;
    if (item.stats && /Hard/.test(item.stats.Difficulty || "")) chips += `<span class="chip chip-hard">Hard</span>`;
    if (item.needs4x4) chips += `<span class="chip">4×4</span>`;
    if (item.guide === "required") chips += `<span class="chip">Guide required</span>`;
    if (item.months && !item.months.includes(new Date().getMonth() + 1))
      chips += `<span class="chip chip-season">${item.region === "dhofar"
        ? "🌿 Khareef " + esc(Planner.monthsLabel(item.months))
        : "🌡️ Best " + esc(Planner.monthsLabel(item.months))}</span>`;

    /* The hero is a SLIDER: swipe, or tap the photo, and it advances through
       every photo the spot has. Taller than the old single poster, with dots
       and a counter so it's obvious there's more than one. The name and chips
       stay pinned over the slides; the credit swaps with each photo. */
    h += `<div class="sheet-hero poster${slides.length ? " gal" : " no-photo"}">
      ${slides.length ? `<div class="gal-track">${slides.map((g, i) =>
          `<div class="gal-slide"><img src="${g.src}"${i ? ` loading="lazy"` : ""} alt="${esc(item.name)}, photo ${i + 1}"></div>`).join("")}
        </div>` : ""}
      ${slides.length > 1 ? `<div class="gal-dots">${slides.map((_, i) =>
          `<i${i ? "" : ` class="on"`}></i>`).join("")}</div>
        <span class="gal-n"><b>1</b>/${slides.length}</span>
        <button type="button" class="gal-arw gal-prev" aria-label="Previous photo">‹</button>
        <button type="button" class="gal-arw gal-next" aria-label="Next photo">›</button>` : ""}
      ${slides.length && slides[0].credit ? `<span class="imgcredit gal-credit">${esc(slides[0].credit)}</span>` : ""}
      <div class="poster-txt">
        ${chips ? `<div class="card-kicker on-photo">${chips}</div>` : ""}
        <h2>${esc(item.name)}</h2>
      </div>
    </div>`;

    h += `<div class="sheet-inner">`;

    // What the place actually is, first, you read the description, then the
    // verdict on whether to go. Plain paragraph: the old 3-line clamp put a
    // "more" link on blurbs that were already under three lines, so it
    // collapsed nothing and just looked broken.
    if (item.blurb) h += `<p class="lede">${esc(item.blurb)}</p>`;

    /* ---- 2 · CAN I GO TODAY? -----------------------------------------------
       This replaces the old red flash-flood paragraph. A wall of warning gets
       skimmed; a verdict gets read. So the app answers the actual question
       with everything it KNOWS, season, heat, vehicle, whether a guide is
       required, as a green / amber / red call.

       What it does NOT know is the weather, and it must never imply it does.
       So for anything wadi-shaped the one thing the reader has to check
       themselves is called out on its own line, always visible, never folded.
       That line is the difference between a guide and a liability. Leave it. */
    if (!isItin) {
      const isWadi = item.cat === "wadis" || item.group === "wadis" ||
                     /Wadi|Canyon|Waterfall|Sinkhole|Spring/i.test(item.type || "");
      const outOfSeason = item.months && !item.months.includes(new Date().getMonth() + 1);
      const dhofar = item.region === "dhofar";

      let level = "go", verdict = "Good to go today", sub = "";
      if (item.guide === "required") {
        level = "stop";
        verdict = "Not on your own";
        sub = "This one needs a guide with the right kit. Don't walk in.";
      } else if (outOfSeason && dhofar) {
        level = "care";
        verdict = "Open, but it's not the green season";
        sub = `The khareef runs ${esc(Planner.monthsLabel(item.months))}. Outside it: sunny, quiet, and no waterfalls.`;
      } else if (outOfSeason) {
        level = "care";
        verdict = "Doable, but it's hot right now";
        sub = `Best ${esc(Planner.monthsLabel(item.months))}. Go at first light or after 4pm, and carry more water than feels reasonable.`;
      } else {
        sub = item.months ? `In season now (best ${esc(Planner.monthsLabel(item.months))}).` : "Fine to go any time of year.";
      }

      // 4×4, swimming and the guide are NOT repeated here, every spot that
      // needs one already carries it in the spec table below (checked across
      // all 101). Saying it twice on one screen is what made this box feel
      // like a lecture. The only thing left in here is the one fact the table
      // cannot hold, because it changes with the weather.
      //
      // SAFETY SITS ON TOP. The verdict underneath is the app's opinion, given
      // what it knows; the band above it is the thing it cannot know and the
      // reader must check. Order matters, read the risk, then the verdict.
      h += `<div class="gonogo g-${level}">
        ${isWadi ? `<div class="gg-safety">
            <span class="gs-i" aria-hidden="true">⚠️</span>
            <p><strong>Safety precaution:</strong> check if it's rained in the mountains
               lately. If yes, don't go in.</p>
          </div>` : ""}
        <div class="gg-head"><span class="gg-dot" aria-hidden="true"></span>
          <div><strong>${verdict}</strong>${sub ? `<span>${sub}</span>` : ""}</div>
        </div>
      </div>`;
    }

    // The season note used to live here as its own fold. It's part of the
    // go/no-go verdict above now, it was answering the same question twice.

    /* ---- 3 · THE FACTS -----------------------------------------------------
       Every stat visible, no dropdown. Hiding "Hike / Swim / Vehicle" behind a
       tap put the three most physical facts about a place, how far you walk,
       whether you swim, what car you need, one interaction away from someone
       deciding whether to drive two hours. They're all on screen now, in a
       two-column grid so they read as a spec block and not a list.
       The old separate hike/swim "timebox" is merged in: it printed the same
       two numbers a second time, in a taller box. */
    if (item.stats) {
      const stats = Object.assign({}, item.stats);
      if (item.hikeTime) stats["Hike"] = item.hikeTime;   // the richer string wins
      if (item.swimTime) stats["Swim"] = item.swimTime;
      // The guide flag used to only exist as a bullet in the verdict box. 12 of
      // the 16 spots that carry one had no guide row at all, so pulling the
      // bullets out would have lost the fact, it lives in the table now.
      // (4×4 and swimming needed no such rescue: every spot that requires them
      // already spells it out in Vehicle / Swim.)
      if (item.guide && !Object.keys(stats).some(k => /guide/i.test(k))) {
        stats["Guide"] = item.guide === "required" ? "Required" : "Recommended";
      }
      // Fixed reading order: how hard, how long, how far you walk, do you swim,
      // what it costs, when to come, what car, whether you need a guide.
      const rank = k => /difficult/i.test(k) ? 0 : /time needed|hours/i.test(k) ? 1
        : /hike/i.test(k) ? 2 : /swim/i.test(k) ? 3 : /entry|fee|price/i.test(k) ? 4
        : /season|best time/i.test(k) ? 5 : /guide/i.test(k) ? 7 : 6;
      const rows = Object.entries(stats).sort((a, b) => rank(a[0]) - rank(b[0]));
      const dot = v => /hard/i.test(v) ? "sl-hard" : /moder/i.test(v) ? "sl-mod" : "sl-easy";

      h += `<div class="specs">` + rows.map(([k, v], i) => {
        // An odd last cell spans both columns, so there's never a half-empty row.
        const wide = rows.length % 2 === 1 && i === rows.length - 1;
        const isDiff = /difficult/i.test(k);
        // Anything that's a hard requirement reads as one, wherever it appears.
        const must = /^required$/i.test(v) || /4×4 (only|required)|required/i.test(v);
        return `<div class="spec${wide ? " spec-wide" : ""}">
            <span class="sk">${factIcon(k)} ${esc(k)}</span>
            <span class="sv${must ? " sv-must" : ""}">${isDiff ? `<i class="sl-dot ${dot(v)}"></i>` : ""}${esc(v)}</span>
          </div>`;
      }).join("") + `</div>`;
    }

    // Maps / Save / Been / Share are the DOCK now, see the end of this
    // function. They sit stuck to the bottom of the sheet so they're reachable
    // without scrolling back up. Itineraries have no dock, so they keep the
    // plain button here.
    if (isItin && item.mapUrl) {
      h += `<a class="mapbtn" href="${item.mapUrl}" target="_blank" rel="noopener">📍 Open in Google Maps</a>`;
    }

    // ONE reel per place. `insta` may still be an ARRAY in content.js, some
    // spots have three or four, but only the first is shown. Two identical
    // buttons reading "My reel 1" and "My reel 2" asked the reader to choose
    // without telling them what they were choosing between.
    // >>> To change which reel a spot shows, move it to the front of that
    //     spot's insta array in content.js. Nothing else to edit. <<<
    if (item.insta) {
      const reel = Array.isArray(item.insta) ? item.insta[0] : item.insta;
      if (reel) {
        h += `<div class="instarow">` +
             `<a class="instabtn" data-spot="${esc(item.id)}" href="${reel}" target="_blank" rel="noopener">🎬 Watch my reel on Instagram</a>` +
             `</div>`;
      }
    }

    if (isItin && days) {
      days.forEach(d => {
        h += `<h3 class="sec">${esc(d.title)}</h3><p class="body">${esc(d.body)}</p>`;
        if (d.spots && d.spots.length) {
          // Only pin spots the reader has access to, a free itinerary must
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

      // Every photo lives in the hero slider now. The old scheme dealt them
      // one-by-one into the folds and a "More photos" fold at the bottom,
      // where nobody found them.

      // Hike and swim times are DIALS now (see above), they used to be
      // printed a second time here in a 155px box of their own.

      // Spot-specific booking link, THE tour for THIS place (a Wadi Shab boat
      // + hike tour, the Daymaniyat snorkel boat…). Set per spot as
      // aff: { url, label } in content.js or premium.js; beats the generic
      // tours link because it's exactly what the reader is looking at.
      const spotAff = item.aff || prem.aff;
      if (spotAff && spotAff.url) {
        h += `<a class="affbtn aff-primary" data-spot="${esc(item.id)}" href="${affLink(spotAff.url)}" target="_blank" rel="noopener">${esc(spotAff.label || "Book this trip →")}</a>` + discountChip();
      }

      // The packing list, built here so the drawer below can hold it.
      let bb = "";
      if (item.bring) {
        bb = `<div class="bringbox">`;
        if (item.bring.essential && item.bring.essential.length) {
          bb += `<div class="bring-col"><div class="bring-h must">Don't leave without</div><ul>` +
                item.bring.essential.map(x => `<li>${esc(x)}</li>`).join("") + `</ul></div>`;
        }
        if (item.bring.optional && item.bring.optional.length) {
          bb += `<div class="bring-col"><div class="bring-h nice">Nice to have</div><ul>` +
                item.bring.optional.map(x => `<li>${esc(x)}</li>`).join("") + `</ul></div>`;
        }
        bb += `</div>`;
        if (aff.gear) bb += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.gear)}" target="_blank" rel="noopener">My exact gear list →</a>`;
      }

      /* ---- 4 · THE DRAWER --------------------------------------------------
         Four separate cards, one of them open by default and 391px tall, 
         become one index card of shut rows. Each row says what's inside it
         ("Getting there · 4 steps"), so nothing has to be opened to be
         understood, and the sheet arrives short. */
      const bringN = ((item.bring && item.bring.essential) || []).length +
                     ((item.bring && item.bring.optional)  || []).length;
      const count = (v, one, many) => {
        const n = Array.isArray(v) ? v.length : (v ? 1 : 0);
        return n ? n + " " + (n === 1 ? one : many) : "";
      };
      const dsec = (icon, title, hint, inner) => inner
        ? `<details class="dsec"><summary>
             <span class="ds-i" aria-hidden="true">${icon}</span>
             <span class="ds-t">${title}</span>
             ${hint ? `<span class="ds-n">${hint}</span>` : ""}
           </summary><div class="fold-body">${inner}</div></details>` : "";

      const drawer =
        dsec("🚗", "Getting there", count(gettingThere, "step", "steps"),
             gettingThere ? steps(gettingThere) : "") +
        dsec("🥾", "What you'll do", count(whatYoullDo, "thing", "things"),
             whatYoullDo ? bullets(whatYoullDo) : "") +
        dsec("🎒", "What to bring", bringN ? bringN + " items" : "", bb) +
        dsec("💡", "My insider tips", count(tips, "tip", "tips"),
             tips && tips.length ? `<div class="tipbox no-frame"><ul>` +
               tips.map(t => `<li>${esc(t)}</li>`).join("") + `</ul></div>` : "");
      if (drawer) h += `<div class="drawer">${drawer}</div>`;

      if (guideNote) {
        h += `<div class="guidebox"><strong>🧭 Go with a guide</strong><p>${esc(guideNote)}</p>`;
        const guideLink = aff.guide || aff.tours;
        if (guideLink) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(guideLink)}" target="_blank" rel="noopener">Book a guided trip →</a>` + discountChip();
        h += `</div>`;
      }
      if (item.needs4x4 && aff.car) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.car)}" target="_blank" rel="noopener">You'll need a 4×4, rent one →</a>`;
      if (aff.esim) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.esim)}" target="_blank" rel="noopener">Get an Oman eSIM (maps off-grid) →</a>`;
    }

    // Traveller tips, reader feedback that Hussain has verified and chosen
    // to publish (spot.travellerTips = [{text, by}]). Curation IS the
    // moderation: nothing appears here without passing through him.
    if (item.travellerTips && item.travellerTips.length) {
      h += `<h3 class="sec">💬 Traveller tips, verified by me</h3>`;
      item.travellerTips.forEach(t => {
        h += `<div class="ttip"><p>${esc(t.text)}</p>${t.by ? `<span class="ttip-by">, ${esc(t.by)}</span>` : ""}</div>`;
      });
    }

    if (item.needsFirstHand) {
      h += `<div class="verifynote warn">⚠️ Public info on this one is thin and inconsistent. Confirm access and water levels locally before you commit a day to it.</div>`;
    } else if (item.verify) {
      h += `<div class="verifynote thin">ℹ️ Times, fees and access details are researched from public sources and change often, confirm on the day.</div>`;
    }

    // Their own posted review, rendered right on the spot, so posting
    // FEELS like posting. (Everyone else still only sees curated tips.)
    const myBlock = r =>
      `<div class="myreview">
         <div class="myreview-head">
           <span class="myreview-stars">${"★".repeat(Math.min(5, r.stars || 0))}${"☆".repeat(5 - Math.min(5, r.stars || 0))}</span>
           <span class="myreview-name">Your review${r.name ? ", " + esc(r.name) : ""}</span>
         </div>
         ${r.tip ? `<p>${esc(r.tip)}</p>` : ""}
         <p class="myreview-note">Sent to Hussain, the best reviews get published in the guide, with credit.</p>
       </div>`;

    // Feedback, stars + an optional written review. Private by default: it
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
      // The stars ARE the control, tap one and you've rated. The name and
      // the write-up appear only after that first tap, because asking someone
      // to fill a form before they've said whether they liked it is backwards.
      h += done
        ? (mine ? myBlock(mine) : `<div class="ratebox thanks">✅ Shukran, your review helps the next traveller.</div>`)
        : `<div class="ratebox" id="ratebox">
             <p class="rate-q">Been here? Rate it</p>
             <div class="stars" id="stars">
               ${[1,2,3,4,5].map(n => `<button type="button" class="star" data-n="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}
             </div>
             <div class="rate-more" id="rateMore" hidden>
               <input class="rate-name" id="rateName" maxlength="60"
                 value="${esc(savedName)}" placeholder="Your name (shown if your review gets published)">
               <textarea class="rate-tip" id="rateTip" maxlength="500" rows="3"
                 placeholder="What made it that? A tip for whoever goes next."></textarea>
               <button type="button" class="rate-send" id="rateSend">Post review</button>
             </div>
           </div>`;
    }

    /* ---- 5 · THE DOCK ------------------------------------------------------
       Maps and Save were 89px of buttons halfway down a 2,400px sheet. They're
       stuck to the bottom of it now, so the two things a person actually does
       here are reachable from anywhere in the page without scrolling back. */
    if (!isItin) {
      const wa = "https://wa.me/?text=" + encodeURIComponent(
        `${item.name}, ${item.tagline}\n📍 ${item.mapUrl || ""}\nFrom the Exploring Oman guide by @hussain_explores:\n${D.meta.storeUrl || D.meta.instagram}`);
      h += `<div class="dockbar">
        <button type="button" class="dock-ico${Store.isSaved(item.id) ? " on" : ""}" id="actSave"
          aria-label="Save this spot">${Store.isSaved(item.id) ? "♥" : "♡"}</button>
        <button type="button" class="dock-ico${Store.isBeen(item.id) ? " on" : ""}" id="actBeen"
          aria-label="Mark as been here">✓</button>
        ${item.mapUrl ? `<a class="dock-go" href="${item.mapUrl}" target="_blank" rel="noopener">📍 Google Maps</a>` : `<span class="dock-go dock-go-off">No pin yet</span>`}
        <a class="dock-ico dock-wa" href="${wa}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">📲</a>
      </div>`;
    }
    h += `</div>`;

    b.innerHTML = h;

    /* ---- the photo slider -------------------------------------------------
       Swipe moves it natively (scroll-snap). A TAP on the photo advances to
       the next one, wrapping at the end, with a guard so the tap that ends a
       swipe doesn't also advance it. Dots, the counter and the credit follow
       whichever slide is in view. */
    {
      const hero = b.querySelector(".sheet-hero.gal");
      const track = b.querySelector(".gal-track");
      if (hero && track && slides.length > 1) {
        const dots = [...hero.querySelectorAll(".gal-dots i")];
        const num = hero.querySelector(".gal-n b");
        const cred = hero.querySelector(".gal-credit");
        let ix = 0;
        const shown = () => Math.round(track.scrollLeft / track.clientWidth);
        const paint = i => {
          ix = i;
          dots.forEach((d, j) => d.classList.toggle("on", j === i));
          if (num) num.textContent = i + 1;
          if (cred) cred.textContent = slides[i].credit || "";
        };
        track.addEventListener("scroll", () => {
          const i = shown();
          if (i !== ix && i >= 0 && i < slides.length) paint(i);
        }, { passive: true });
        // The arrows are the visible affordance: swiping is invisible until
        // you already know it's there. They're <button>s, so the tap-anywhere
        // handler below ignores them (it skips a,button) and they can't
        // double-fire.
        const go = step => {
          const next = (ix + step + slides.length) % slides.length;
          paint(next);
          track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
        };
        const prev = hero.querySelector(".gal-prev");
        const nxt = hero.querySelector(".gal-next");
        if (prev) prev.onclick = () => go(-1);
        if (nxt) nxt.onclick = () => go(1);

        let downX = 0;
        hero.addEventListener("pointerdown", e => { downX = e.clientX; });
        hero.addEventListener("click", e => {
          if (e.target.closest("a,button")) return;      // never hijack a link
          if (Math.abs(e.clientX - downX) > 10) return;  // that was a swipe
          // Advance from the PAINTED index, not scrollLeft: mid-animation the
          // scroll position lags, so two quick taps would both compute the
          // same "next" and the slider would stall on fast tapping.
          const next = (ix + 1) % slides.length;
          paint(next);
          track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
        });
      }
    }

    // wire save / been-there
    // The dock buttons are glyphs, so their STATE lives in the .on class and
    // the aria-label, not in the label text, which no longer changes.
    const sv = b.querySelector("#actSave");
    if (sv) sv.onclick = () => {
      const on = Store.toggleSaved(item.id);
      sv.textContent = on ? "♥" : "♡";
      sv.classList.toggle("on", on);
      sv.setAttribute("aria-label", on ? "Saved, tap to unsave" : "Save this spot");
      toast(on ? "♥ Saved" : "Removed from saved");
      refreshBehind();                       // the ♥ on the card behind, live
    };
    const bn = b.querySelector("#actBeen");
    if (bn) bn.onclick = () => {
      const on = Store.toggleBeen(item.id);
      bn.classList.toggle("on", on);
      bn.setAttribute("aria-label", on ? "Been here, tap to undo" : "Mark as been here");
      // Ticking one off is the moment the rank moves, and the moment a review
      // is worth asking for. Open the fold rather than just scrolling to it.
      // No scrollIntoView here. It used to drag the sheet down to the review
      // box on every tick, which read as the app running away from you. The
      // stars are where they are; whoever wants to rate will find them.
      applyRankTheme();                      // the whole app's accent, live
      renderHud();                           // the banner HUD, live
      refreshBehind();                       // the rank ring and the ✓ badges
      if (on) celebrate(Store.been().length); else toast("Unmarked");
    };

    // wire the review box (if present)
    const rb = b.querySelector("#ratebox");
    if (rb) {
      let stars = 0;
      const send = rb.querySelector("#rateSend");
      const more = rb.querySelector("#rateMore");
      const starBtns = [...rb.querySelectorAll(".star")];
      starBtns.forEach(btn => btn.onclick = () => {
        const first = !stars;
        stars = +btn.dataset.n;
        starBtns.forEach(x => x.classList.toggle("on", +x.dataset.n <= stars));
        rb.querySelector(".rate-q").textContent =
          ["", "Not worth it", "It was OK", "Good", "Really good", "One of the best"][stars];
        if (more) more.hidden = false;
        // Only pull focus on the first tap, otherwise changing your mind from
        // 4 stars to 3 yanks the keyboard up mid-thought.
        if (first) setTimeout(() => { const t = rb.querySelector("#rateTip"); if (t) t.focus(); }, 120);
      });
      send.onclick = () => {
        const name = rb.querySelector("#rateName").value.trim();
        const tipText = rb.querySelector("#rateTip").value.trim();
        try { if (name) localStorage.setItem("oman_reviewer_name", name); } catch {}
        if (window.Analytics && Analytics.enabled) {
          Analytics.review(item.id, { stars: stars, name: name, tip: tipText });
        } else {
          // No backend yet, open a prefilled email instead, so reviews
          // work from day one and nothing is silently lost.
          const bodyTxt = `Spot: ${item.name}\nStars: ${stars}/5\nName: ${name || "-"}\nReview: ${tipText || "-"}`;
          location.href = "mailto:" + (D.meta.email || "") +
            "?subject=" + encodeURIComponent("Review, " + item.name + " (" + stars + "/5)") +
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
    if (D.meta.freeLaunch) {
      b.innerHTML = `
        <h2>🎁 It's all free right now</h2>
        <p>Launch season: every spot, every itinerary and the Planner are open for everyone.
           In October the guide becomes paid, founding explorers get the best deal.</p>
        <div id="lbHere"></div>
        <button class="btn-full" id="doneBtn" style="margin-top:12px">Keep exploring →</button>`;
      b.querySelector("#lbHere").appendChild(launchBox());
      b.querySelector("#doneBtn").onclick = closeModal;
      $("#modalBackdrop").hidden = false;
      return;
    }
    if (Unlock.isAnythingOwned()) {
      b.innerHTML = `
        <h2>You're unlocked ✓</h2>
        <p>Access: <strong>${Unlock.hasBundle() ? "the full pack, everything, including the Planner" : Unlock.grants().join(", ")}</strong>.</p>
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
        <p>Bought on Gumroad? Paste the licence key from your receipt email. It's yours for good, same key on a new phone, and every monthly update lands automatically.</p>
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
          setTimeout(() => { closeModal(); route(); toast("Unlocked, enjoy 🇴🇲"); }, 700);
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
  /* ------------------------------------------------------------- rank badge
     The explorer's scoreboard. It used to be a full-width progress bar under
     the filters; now it's a ring that rides beside the page title, so it costs
     no vertical space and reads as something you EARN rather than something
     loading. The rank is the reward, the fraction is the mechanic.
     Plain words on purpose, no fantasy titles, nothing pseudo-Arabian. */
  const RANKS = [
    [101, "Done it all"], [75, "Old hand"], [50, "Local"], [30, "Regular"],
    [15, "Explorer"], [5, "Wanderer"], [1, "Visitor"], [0, "Just landed"]
  ];
  const rankIx  = n => { const i = RANKS.findIndex(r => n >= r[0]); return i < 0 ? RANKS.length - 1 : i; };
  const rankFor = n => RANKS[rankIx(n)][1];
  const nextRank = n => { const r = [...RANKS].reverse().find(r => r[0] > n); return r || null; };

  /* THE APP'S COLOUR IS YOUR RANK. Every accent in the stylesheet comes off
     --water / --water-dark / --water-soft, so re-pointing those three at the
     current rank's palette re-skins the whole thing, tabs, buttons, chips,
     the dock, the filter panel. Eight ranks, eight palettes: you can tell how
     far someone is into Oman by the colour of their app.
     Called on boot and on every rank change. */
  /* Indexed to match RANKS (0 = Done it all … 7 = Just landed). The ladder has
     to CLIMB, teal, blue, green, gold, copper, crimson, purple. An earlier
     version put Explorer back on the starting teal, so ranking up looked like
     ranking down. Read it bottom-up. */
  const RANK_SKIN = [
    /* Done it all */ ["#7a4bd0", "#5c33a8", "#efe6ff"],
    /* Old hand    */ ["#b3241f", "#8a1a16", "#fce8e7"],
    /* Local       */ ["#b8551f", "#8e3f14", "#fdeee4"],
    /* Regular     */ ["#c8892f", "#96631d", "#fdf3e2"],
    /* Explorer    */ ["#1d7a4e", "#12603c", "#e2f4ea"],
    /* Wanderer    */ ["#1d6fa5", "#14567f", "#e4f0f9"],
    /* Visitor     */ ["#0d5c63", "#08454b", "#e3f1f1"],
    /* Just landed */ ["#0d5c63", "#08454b", "#e3f1f1"]
  ];
  function applyRankTheme() {
    const ix = rankIx(Store.been().length);
    const [c, dark, soft] = RANK_SKIN[ix] || RANK_SKIN[RANK_SKIN.length - 1];
    const r = document.documentElement;
    r.style.setProperty("--water", c);
    r.style.setProperty("--water-dark", dark);
    r.style.setProperty("--water-soft", soft);
    // The rank's reach beyond buttons: --wash tints the top of every page,
    // and the banner's colour-grade layer reads --water directly, so the
    // SAME photo is teal-graded for a beginner and gold/crimson/purple as
    // you climb. data-rank drives the per-rank page texture in CSS.
    r.style.setProperty("--wash", soft);
    // Pre-computed rgba glows for the banner grade: color-mix() inside a
    // pseudo-element gradient resolved to transparent in testing, so the
    // mixing happens here where it can't fail.
    const rgb = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    r.style.setProperty("--rank-glow", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.46)`);
    r.style.setProperty("--rank-glow-2", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.30)`);
    r.style.setProperty("--rank-dot", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.10)`);
    r.style.setProperty("--rank-tint", `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.34)`);
    r.dataset.rank = String(RANKS.length - 1 - ix);   // 0 = just landed, 7 = done
    // The status bar above the banner photo stays photo-dark regardless of
    // rank: the rank shows in the UI accents and the page wash, not by
    // painting the clock a different colour.
    const themeTag = document.querySelector('meta[name="theme-color"]');
    if (themeTag) themeTag.setAttribute("content", "#062a2e");
  }

  /* Crossing a rank is the only moment in this app worth interrupting someone
     for, so it takes the whole screen: the app re-skins to the new rank's
     colour underneath, a medal slams in, rays and confetti fire, and the old
     title crosses out into the new one. Every other tick just gets a toast, 
     if this fired on all 101 it would stop meaning anything. */
  function celebrate(been) {
    const total = D.spots.length;
    const ix = rankIx(been);
    const wasIx = rankIx(been - 1);
    if (ix === wasIx) {                       // no rank change, quiet toast
      const nx = nextRank(been);
      toast(nx ? `✓ ${been} of ${total} · ${nx[0] - been} more to ${nx[1]}`
                : `✓ ${been} of ${total} explored`);
      return;
    }

    const name = RANKS[ix][1];
    const was = RANKS[wasIx][1];
    const nx = nextRank(been);
    const [c, dark] = RANK_SKIN[ix] || RANK_SKIN[0];
    const wrap = el("div", "rankup");
    wrap.style.setProperty("--ru", c);
    wrap.style.setProperty("--ru-dark", dark);
    const CONFETTI = 26;
    wrap.innerHTML = `
      <div class="ru-sky" aria-hidden="true">${
        Array.from({ length: CONFETTI }, (_, i) =>
          `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 90}ms;--r:${(i % 5) * 72}deg;--s:${
            0.6 + (i % 4) * 0.22};--c:${["var(--ru)", "var(--ru-dark)", "#c8892f", "#fff"][i % 4]}"></i>`
        ).join("")}</div>
      <div class="ru-card" role="status">
        <div class="ru-rings" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="ru-burst" aria-hidden="true">${
          Array.from({ length: 18 }, (_, i) => `<i style="--a:${i * 20}deg;--d:${(i % 6) * 40}ms"></i>`).join("")}</div>
        <div class="ru-medal"><span>${been}</span></div>
        <div class="ru-kicker">Rank up</div>
        <div class="ru-name">${esc(name)}</div>
        <div class="ru-from"><s>${esc(was)}</s> → <b>${esc(name)}</b></div>
        <div class="ru-sub">${been} of ${total} explored${
          nx ? ` · ${nx[0] - been} more to ${esc(nx[1])}` : ", the whole guide"}</div>
        <button type="button" class="ru-go">Keep exploring</button>
      </div>`;
    document.body.appendChild(wrap);
    applyRankTheme();                          // re-skin the app underneath
    document.body.classList.add("tier-flash");
    setTimeout(() => document.body.classList.remove("tier-flash"), 700);
    const close = () => {
      wrap.classList.add("out");
      setTimeout(() => wrap.remove(), 340);
    };
    wrap.onclick = close;
    const t = setTimeout(close, 4200);
    wrap.querySelector(".ru-go").onclick = e => { e.stopPropagation(); clearTimeout(t); close(); };
    if (navigator.vibrate) { try { navigator.vibrate([18, 50, 26, 50, 46]); } catch {} }
    if (window.Analytics) Analytics.track("rank_up", { rank: name, been: been });
  }

  function rankBadge() {
    const been = Store.been().length;
    const total = D.spots.length;
    const ix = rankIx(been);
    const floor = RANKS[ix][0];
    const next = nextRank(been);

    // THE WHOLE TRICK: the ring fills the CURRENT RANK BAND, not all 101.
    // Filled against 101, ticking off a wadi moves the line by 1% and it looks
    // like nothing happened. Between Wanderer (5) and Explorer (15) the same
    // tick moves a tenth of the ring. That is the difference between a game
    // and a loading bar, and it costs one line of arithmetic.
    const pct = next
      ? Math.round((been - floor) / (next[0] - floor) * 100)
      : 100;

    // NB: not ".empty", that's the global no-results block, 50px of padding.
    const w = el("div", "rankbadge" + (been ? "" : " rb-zero"));
    w.style.setProperty("--pct", Math.max(0, Math.min(100, pct)));
    // Tier drives the metal: teal, then gold once you're a Local, then both
    // at the top. Something visibly changes when you cross a rank.
    w.dataset.tier = ix <= 1 ? "3" : ix <= 3 ? "2" : "1";
    w.setAttribute("title", next
      ? `${been} of ${total} explored · ${rankFor(been)}, ${next[0] - been} more to reach ${next[1]}`
      : `${been} of ${total} explored, every spot in the guide`);
    w.innerHTML =
      `<span class="rb-ring"><span class="rb-core">${been}</span></span>` +
      `<span class="rb-txt"><strong>${esc(rankFor(been))}</strong>` +
      `<small>${next ? (next[0] - been) + " to " + esc(next[1]) : `all ${total} done`}</small></span>`;
    return w;
  }

  /* The HUD in the banner. The rank used to sit beside the Explore title,
     which meant it vanished on every other tab. Up here it's always on, it
     makes the banner carry something that CHANGES as you travel, and the
     progress bar under it fills toward the next rank rather than toward 101
     (see rankBadge for why that matters). */
  function renderHud() {
    const h = $("#topHud");
    if (!h) return;
    const been = Store.been().length;
    const total = D.spots.length;
    const ix = rankIx(been);
    const floor = RANKS[ix][0];
    const next = nextRank(been);
    const pct = next ? Math.round((been - floor) / (next[0] - floor) * 100) : 100;
    h.innerHTML =
      `<span class="hud-ring" style="--pct:${Math.max(0, Math.min(100, pct))}"><b>${been}</b></span>` +
      `<span class="hud-txt">` +
        `<strong>${esc(rankFor(been))}</strong>` +
        `<small>${next ? `${next[0] - been} more to ${esc(next[1])}` : `all ${total} explored`}</small>` +
      `</span>` +
      `<span class="hud-bar"><i style="width:${Math.max(3, Math.min(100, pct))}%"></i></span>`;
    h.dataset.tier = ix <= 1 ? "3" : ix <= 3 ? "2" : "1";
  }

  function renderCategory(cat) {
    const meta = D.categories.find(c => c.id === cat);
    const items = itemsFor(cat);

    clearView();

    // Title row. The explorer's rank rides alongside the h1 rather than under
    // it, so the scoreboard costs no vertical space at all.
    const head = el("div", "cat-head");
    const titlerow = el("div", "cat-titlerow");
    titlerow.appendChild(el("h1", null, esc(meta.label)));
    // The rank moved into the banner HUD (renderHud), where it shows on every
    // tab instead of only this one.
    head.appendChild(titlerow);
    // Intro text only where it earns its place, Salalah's "this is a separate
    // trip, you fly" is real planning information. Explore's was a description
    // of the filter chips sitting directly underneath it, so it's gone.
    if (meta.intro) {
      const lines = Array.isArray(meta.intro) ? meta.intro : [meta.intro];
      const intro = el("div", "cat-intro");
      intro.innerHTML = bullets(lines, "intro-list");
      head.appendChild(intro);
    }
    view.appendChild(head);

    // Search sits where the intro paragraph used to, it looks like the field
    // it opens, so there's no icon to decode.
    // A real field, not a button that opens a second field somewhere else.
    // You tap it, the keyboard comes up, and the list filters as you type.
    const sBox = el("div", "searchcue" + (query ? " on" : ""));
    sBox.innerHTML =
      `<span class="sc-i" aria-hidden="true">🔍</span>` +
      `<input type="search" class="sc-input" id="catSearch" autocomplete="off"
              placeholder="Search wadis, beaches, spots…" value="${esc(queryRaw)}">` +
      `<button type="button" class="sc-clear" aria-label="Clear search"${query ? "" : " hidden"}>✕</button>`;
    const sInput = sBox.querySelector("#catSearch");
    // The field shows queryRaw, the FILTER uses the trimmed copy. Keeping one
    // trimmed string for both meant every re-render wrote the trimmed value
    // back into the box, so a trailing space vanished the instant you typed it
    // and the space bar looked broken.
    sInput.oninput = () => {
      const pos = sInput.selectionStart;
      queryRaw = sInput.value;
      query = queryRaw.trim();
      typeFilter = null;                        // searching clears the type filter
      renderCategory(cat);
      const again = $("#catSearch");
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch {} }
    };
    sBox.querySelector(".sc-clear").onclick = () => {
      query = ""; queryRaw = ""; renderCategory(cat);
      const again = $("#catSearch"); if (again) again.focus();
    };
    view.appendChild(sBox);

    if (!items.length) {
      view.appendChild(el("div", "empty", `<div class="big">🏜️</div><p>Nothing matches "${esc(query)}".</p>`));
      return;
    }

    // The filter bar sits in the page and scrolls away with it. No sticky, no
    // scroll listener: a control that follows you down the page is a control
    // in the way. Any listener from an older build is torn down here.
    if (window.__fwScroll) {
      window.removeEventListener("scroll", window.__fwScroll);
      window.__fwScroll = null;
    }
    view.appendChild(filterControls(items, () => renderCategory(cat)));

    const shown = (typeFilter ? items.filter(i => groupOf(i) === typeFilter) : items).filter(smartPass);

    if (!shown.length) {
      // An empty list is usually a filter, not a gap in the guide, say which.
      // And "Still to go" coming back empty isn't an error, it's the finish line.
      let msg = `<div class="big">🤷</div><p>Nothing in ${esc(groupLabel(typeFilter))} yet.</p>`;
      if (smart.todo) {
        msg = `<div class="big">🏁</div><p><strong>You've been to all of them.</strong><br>` +
              `Every spot${typeFilter ? " in " + esc(groupLabel(typeFilter)) : ""} on this tab is ticked off.</p>`;
      } else if (activeFilterCount()) {
        msg = `<div class="big">🤷</div><p>Nothing matches those filters.</p>`;
      }
      const box = el("div", "empty", msg);
      if (activeFilterCount()) {
        const b = el("button", "pill", "Clear filters");
        b.type = "button";
        b.onclick = () => {
          typeFilter = null;
          Object.keys(smart).forEach(k => smart[k] = false);
          renderCategory(cat);
        };
        box.appendChild(b);
      }
      view.appendChild(box);
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

    // Unfiltered and long? Break it into type sections with headers, a 50-card
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
    if (D.meta.freeLaunch) {
      view.appendChild(launchBox());
    } else if (lockedShown && !Unlock.hasBundle()) {
      const h = el("div", "section-head");
      h.innerHTML = `<h2>${lockedShown} locked here 🔒</h2>` +
        `<p>One payment unlocks all ${lockedCount()} locked spots in the guide, the itineraries and the Planner, and every update after that.</p>`;
      view.appendChild(h);
      view.appendChild(priceBlock(cat));
    }
  }

  /* ------------------------------------------------------------------- about
     PAGE ORDER, deliberate, don't shuffle it:
       hook → proof badges → one paragraph → what's new (folded) →
       price → plan-my-trip → email list → GET IN TOUCH (last) → credits (folded)
     The asks live at the bottom because nobody trusts an ask they meet before
     they've been given a reason. Everything above them is that reason, and it
     is deliberately SHORT: a line that only restates a badge, or that could
     appear on any travel site, has been cut. Keep cutting. */
  function renderAbout(append) {
    const m = D.meta;
    if (!append) clearView();          // the More tab appends About under the map
    const spotCount = D.spots.length;
    const w = el("div", "about");
    w.innerHTML = `
      <div class="about-hero${m.aboutPhoto ? " has-photo" : ""}">
        ${m.aboutPhoto
          ? `<div class="about-poster">
               <img class="about-photo" src="${esc(m.aboutPhoto)}" alt="Hussain, licensed Oman tour guide">
             </div>
             <div class="ah-txt">
               <h1 class="about-hook"><q>${esc(m.aboutHook)}</q></h1>
               <p class="about-sub">${esc(m.aboutSub)}</p>
               <p class="about-byline">Hussain · ${esc(m.instagramHandle)}</p>
             </div>`
          : `<div class="about-avatar about-photo-empty" title="Drop your photo into assets/ and set meta.aboutPhoto in content.js">📷<small>your photo</small></div>
             <h1 class="about-hook"><q>${esc(m.aboutHook)}</q></h1>
             <p class="about-sub">${esc(m.aboutSub)}</p>
             <p class="about-byline">Hussain · ${esc(m.instagramHandle)}</p>`}
      </div>

      <div class="about-badges">
        <span class="badge">🪪 Licensed Oman tour guide</span>
        <span class="badge">🎥 1M+ views on my wadi reels</span>
        <span class="badge">📍 ${spotCount} spots, every one pinned</span>
        <span class="badge">🔄 Updated monthly, free forever</span>
      </div>

      <div class="about-body">
        <p>${spotCount} spots. For each one: the drive, the walk in, the entry fee,
           the shoes, the right month, and whether I'd tell you to skip it.</p>
        <p>Oman changes. Fees go up, roads wash out, a two-hour wadi becomes a
           four-hour one. That's why this is an app and not a PDF.</p>
      </div>`;

    // "What's new", the receipts behind the updated-monthly promise. Folded,
    // newest month only; the history sits one tap deeper. Keep the top entry to
    // EIGHT items (see the note above meta.changelog in content.js).
    if (m.changelog && m.changelog.length) {
      const [latest, ...older] = m.changelog;
      const log = el("div", "about-changelog");
      log.innerHTML = `
        <details class="fold">
          <summary>🔄 What's new · ${esc(latest.date)}</summary>
          <div class="fold-body">
            <ul class="bulletlist">${latest.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
            ${older.length ? `
              <details class="fold fold-sub">
                <summary>Everything before that</summary>
                <div class="fold-body">
                  ${older.map(e => `<div class="log-entry"><div class="log-date">${esc(e.date)}</div>` +
                      `<ul class="bulletlist">${e.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}
                </div>
              </details>` : ""}
          </div>
        </details>`;
      w.appendChild(log);
    }

    // If the photo file isn't there yet (meta.aboutPhoto is set before the
    // file is dropped in), fall back to the placeholder circle instead of a
    // giant broken-image poster at the top of the page — and put the byline
    // back, since with no photo there's nowhere else it appears.
    const av = w.querySelector(".about-photo");
    if (av) av.onerror = () => {
      const poster = w.querySelector(".about-poster");
      if (poster) poster.outerHTML =
        `<div class="about-avatar about-photo-empty" title="Save your photo as app/${esc(D.meta.aboutPhoto)}">📷<small>your photo</small></div>`;
      const sub = w.querySelector(".about-sub");
      if (sub && !w.querySelector(".about-byline")) {
        const by = el("p", "about-byline", `Hussain · ${esc(D.meta.instagramHandle)}`);
        sub.after(by);
      }
      w.querySelector(".about-hero").classList.remove("has-photo");
    };
    view.appendChild(w);

    // --- the asks, in order of how much they cost the reader -----------------
    if (!Unlock.hasBundle()) {
      const h = el("div", "section-head");
      h.innerHTML = `<h2>Support the guide</h2><p>It's how the monthly updates keep coming.</p>`;
      view.appendChild(h);
      view.appendChild(priceBlock(null));
    }

    const foot = el("div", "about");

    // The "Want me to plan it for you?" form used to sit here too. It lives on
    // the Plan tab, which is where someone thinking about a route already is, 
    // a second copy on About was 523px of the same form asking again.

    // Email list, appears only once meta.backend is configured (see
    // delivery/BACKEND-SETUP.md); with no backend there's nowhere to save it.
    if (window.Analytics && Analytics.enabled) {
      const sub = el("div", "about-subscribe");
      sub.innerHTML = `
        <h3>📬 New spots, monthly</h3>
        <p>One email when the guide updates. No spam, ever.</p>
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
                             : `<div class="msg err">Couldn't sign you up, try again in a bit.</div>`;
      };
      foot.appendChild(sub);
    }

    // Get in touch, LAST, as asked. It's the thing people scroll to the bottom
    // looking for, so it should be the thing at the bottom.
    const contact = el("div", "about-contact");
    contact.innerHTML = `
      <h3>Get in touch</h3>
      <a class="contact-row" href="${m.instagram}" target="_blank" rel="noopener">
        <span class="ci">📸</span>
        <span><strong>${esc(m.instagramHandle)}</strong><small>Reels, new spots, DMs open</small></span>
        <span class="carr">→</span>
      </a>
      <a class="contact-row" href="mailto:${esc(m.email)}">
        <span class="ci">✉️</span>
        <span><strong>${esc(m.email)}</strong><small>Guiding, collabs, or a licence key that won't work</small></span>
        <span class="carr">→</span>
      </a>
      <div class="about-tag">
        Been somewhere from this guide? Tag <strong>${esc(m.instagramHandle)}</strong>, I repost my favourites. 🇴🇲
      </div>`;
    foot.appendChild(contact);

    // Photo credits, attribution for the CC-licensed images (legally required
    // for CC BY / CC BY-SA). Folded shut at the very bottom: the licence is
    // satisfied by it being present and reachable, not by it being loud.
    // Locked spots' photos aren't displayed, so they aren't credited either, 
    // crediting them would leak the names.
    const credited = [...D.spots, ...(D.itineraries || [])].filter(s => s.img && s.imgCredit && isUnlocked(s));
    if (credited.length) {
      const cr = el("div", "about-credits");
      cr.innerHTML = `
        <details class="fold fold-quiet">
          <summary>📷 Photo credits (${credited.length})</summary>
          <div class="fold-body">
            <p class="credits-note">Photos from Wikimedia Commons under free licences, gratefully used.</p>
            <ul>${credited.map(s => `<li><strong>${esc(s.name)}</strong>, ${esc(s.imgCredit.replace(/^Photo: /, ""))}</li>`).join("")}</ul>
          </div>
        </details>`;
      foot.appendChild(cr);
    }

    view.appendChild(foot);
  }

  /* ----------------------------------------------------------------- planner */
  const prefs = {
    days: 5, month: new Date().getMonth() + 1, pace: "balanced",
    interests: ["swimming", "hiking", "culture"],
    fitness: 3, has4x4: true, canSwim: true, kids: false, base: "muscat",
    heatStyle: "early"
  };

  /* -------------------------------------------------------------- coming soon
     The Salalah tab while meta.salalahComingSoon is on. The spots stay in
     content.js, ready, this is a curtain, not a demolition. */
  function renderComingSoon(meta) {
    clearView();
    const n = D.spots.filter(s => s.cat === "salalah").length;
    const w = el("div", "soon");
    w.innerHTML = `
      <div class="soon-card">
        <div class="soon-art" aria-hidden="true">🌴</div>
        <h1>Salalah</h1>
        <div class="soon-pill">Coming soon</div>
        <p>The Dhofar guide, the khareef season, Wadi Darbat, the frankincense
           coast and the empty beaches west. ${n ? n + " spots, " : ""}being
           checked and finished now.</p>
        <p class="soon-sub">It lands as a free update, nothing to re-buy, nothing to do.</p>
      </div>`;
    view.appendChild(w);
  }

  function renderPlanner() {
    clearView();
    const head = el("div", "cat-head");
    head.appendChild(el("h1", null, "Plan"));
    view.appendChild(head);

    // READY-MADE ROUTES FIRST, then Hussain's personal-planning offer right
    // under them, the human answer next to the finished routes, and the
    // build-your-own machinery last.
    renderItinerarySection(true);
    view.appendChild(bookBox());

    // The Planner is locked while meta.plannerLocked is on (and, once that's
    // lifted, for anyone without a key). This is the flagship of the paid
    // guide, so the locked state is a showcase, not an apology: dark card,
    // the compass, what it does, when it opens. During free launch there is
    // no buy button, because the Gumroad link isn't live yet and a locked
    // pitch with a dead buy button is worse than a locked pitch.
    if (D.meta.plannerLocked || !Unlock.hasBundle()) {
      const p = el("div", "lockcard");
      p.innerHTML = `
        <div class="lock-art" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="24" cy="24" r="19"/>
            <path d="M31 17l-4.5 11L15 32.5 19.5 21z" fill="currentColor" opacity=".25"/>
            <path d="M31 17l-4.5 11L15 32.5 19.5 21z"/>
            <path d="M24 3v4M24 41v4M3 24h4M41 24h4" opacity=".6"/>
          </svg>
          <span class="lock-pad">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" stroke="none"/>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
            </svg>
          </span>
        </div>
        <h2>Build your own trip</h2>
        <div class="lock-pill">Part of the full guide</div>
        <p class="lock-lead">Answer four questions and it builds your route:
           day by day, in driving order, around your pace.</p>
        <ul class="lock-feats">
          <li>Days clustered by region, so you never backtrack</li>
          <li>Real drive times between every stop</li>
          <li>Heat-smart starts: 06:30 in summer, hot spots in the cool hours</li>
          <li>Every stop pinned in Google Maps, the whole route on one map</li>
        </ul>
        <p class="lock-when">Opens in October, when the full guide launches.</p>`;
      view.appendChild(p);
      if (!D.meta.freeLaunch) {
        view.appendChild(priceBlock(null, true));
        const kb = el("button", "btn-key", "I have a key");
        kb.style.marginTop = "12px";
        kb.onclick = openUnlock;
        view.appendChild(kb);
      }
      return;
    }

    const bh = el("div", "section-head");
    bh.innerHTML = `<h2>Or build your own 🧭</h2>` +
      `<p>Four questions. Real drive times, sensible days, every stop pinned.</p>`;
    view.appendChild(bh);

    const form = el("div");
    // The four questions that change the shape of the trip stay on screen.
    // The four that only tune it go in here, folded, eight full-width cards
    // stacked was most of why this tab scrolled forever.
    const fine = el("div", "fine-body");

    /* ---- DAYS: the first and most important question ---------------------- */
    const dq = el("div", "q days-q");
    dq.innerHTML = `<h3>How many days have you got?</h3><p class="qsub">Count arrival and departure days, they're half days, and the planner knows it.</p>`;
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

    // heat style, only bites May–Sep up north, but it's cheap to always ask
    fine.appendChild(question("If it's hot, how do you want to play it?", "Matters most May–September up north.", w => {
      const o = el("div", "opts");
      [["early", "🌅 Dawn starts, beat the heat"], ["late", "🌇 Slow mornings, hot stuff late"]].forEach(([k, label]) => {
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

    // base, Salalah is 1,000km from Muscat, so it's a different trip entirely
    form.appendChild(question("Where are you based?", "Muscat covers the north. Salalah is its own trip, you fly between them.", w => {
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
    fine.appendChild(question("How hard do you want it?", "Be honest, Oman punishes optimism.", w => {
      const L = [
        [1, "Easy, walk-in only"],
        [2, "Light, a bit of a walk"],
        [3, "Moderate, scrambling & swims"],
        [4, "Hard, long days"],
        [5, "Send it, canyoning, abseils"]
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
    fine.appendChild(question("What pace?", "", w => {
      const o = el("div", "opts");
      Object.entries(Planner.PACE).forEach(([k, v]) => {
        const b = el("button", "opt", `${esc(v.label)}, ${esc(v.note)}`);
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
    fine.appendChild(question("Logistics", "These change what's even possible.", w => {
      const o = el("div", "opts");
      [["has4x4","🚙 I'll have a 4×4"],["canSwim","🏊 Happy to swim"],["kids","👶 Travelling with kids"]].forEach(([k, label]) => {
        const b = el("button", "opt", esc(label));
        b.setAttribute("aria-pressed", String(prefs[k]));
        b.onclick = () => { prefs[k] = !prefs[k]; b.setAttribute("aria-pressed", String(prefs[k])); };
        o.appendChild(b);
      });
      w.appendChild(o);
    }));

    const fold = el("details", "fold planner-fine");
    fold.innerHTML = `<summary>Fine tuning: heat, fitness, pace, logistics</summary>`;
    const fb = el("div", "fold-body");
    fb.appendChild(fine);
    fold.appendChild(fb);
    form.appendChild(fold);

    const go = el("button", "btn-full", "Build my trip →");
    go.onclick = () => {
      if (window.Analytics) Analytics.track("plan", { days: prefs.days, pace: prefs.pace, base: prefs.base, month: prefs.month, heatStyle: prefs.heatStyle, interests: prefs.interests });
      renderPlan(Planner.build(prefs));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    form.appendChild(go);
    view.appendChild(form);
    // bookBox is up under the itineraries now, no second copy down here.
  }

  /* The hand-built routes, shown under the planner on the Plan tab. */
  /* The ready-made routes now open the Plan tab instead of sitting under the
     form. Most people want a trip, not a trip-planning exercise, offering the
     finished thing first and the builder second matches that. `lead` switches
     the heading between the two positions. */
  function renderItinerarySection(lead) {
    const items = D.itineraries || [];
    if (!items.length) return;

    const h = el("div", "section-head");
    h.innerHTML = lead
      ? `<h2>Follow one of mine 🗺️</h2><p>Fixed routes, day by day, where to go, in what order, where to sleep.</p>`
      : `<h2>Or follow one of mine 🗺️</h2><p>Fixed routes, day by day.</p>`;
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
        if (l.spot.hikeTime) meta.appendChild(el("span", "meta", "🥾 " + esc(l.spot.hikeTime.split(", ")[0].trim())));
        if (l.spot.swimTime) meta.appendChild(el("span", "meta", "💧 " + esc(l.spot.swimTime.split(", ")[0].split(".")[0].trim())));
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
    // Bundle-only, no exceptions, belt and braces on top of renderPlanner's
    // gate, in case a future code path calls this directly.
    if (!Unlock.hasBundle()) { renderPlanner(); return; }
    clearView();

    const back = el("button", "pill pill-ghost", "← Change my answers");
    back.style.marginBottom = "16px";
    back.onclick = renderPlanner;
    view.appendChild(back);

    // WhatsApp is how the Gulf shares plans. Two sends, two purposes:
    // the plan to a travel buddy, and the safety copy to family, where
    // you're going and when you'll be back. Both carry the store link.
    {
      const shareRow = el("div", "plan-sharerow");
      const planTxt = () => planText(plan).slice(0, 3500);
      const wa1 = el("a", "pill", "📲 WhatsApp the plan");
      wa1.href = "https://wa.me/?text=" + encodeURIComponent(planTxt());
      wa1.target = "_blank"; wa1.rel = "noopener";
      const wa2 = el("a", "pill pill-ghost", "🛟 Send to family (safety copy)");
      wa2.href = "https://wa.me/?text=" + encodeURIComponent(
        "My Oman trip plan, so you know where I am:\n\n" + planTxt() +
        "\nIf I'm not reachable by the evening of the last day, this was my route.");
      wa2.target = "_blank"; wa2.rel = "noopener";
      shareRow.appendChild(wa1); shareRow.appendChild(wa2);
      view.appendChild(shareRow);
    }

    const sum = el("div", "plan-summary");
    sum.innerHTML = `
      <h2>Your ${plan.prefs.days}-day Oman</h2>
      <p><strong>${plan.totalSpots}</strong> stops · <strong>${Planner.dur(plan.totalDrive)}</strong> total driving · ${esc(plan.pace.label.toLowerCase())} pace${plan.prefs.has4x4 ? " · 4×4" : " · 2WD"}</p>`;
    view.appendChild(sum);

    // Change the length right here, no round trip through the form. Rebuilds
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
        <p>${plan.missed.map(s => esc(s.name)).join(" · ")}. Add a day, or come back, they're not going anywhere.</p>`;
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

      // Print-only attribution, every shared PDF carries the store with it.
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
      t += `DAY ${d.n}${d.stayIn ? ", sleep in " + d.stayIn : ""}\n`;
      d.legs.forEach(l => {
        t += `  ${Planner.fmt(l.t)}  ${l.type === "drive" ? "Drive: " : ""}${l.title}${l.heatNote ? "  (go early, heat)" : ""}\n`;
        if (l.spot) t += `          ${l.spot.mapUrl}\n`;
      });
      const u = dayRouteUrl(d);
      if (u) t += `  Full day route: ${u}\n`;
      t += "\n";
    });
    if (plan.warnings.length) t += "NOTES\n" + plan.warnings.map(w => "  - " + w).join("\n") + "\n";
    t += `\n, \nBuilt with the Exploring Oman app by ${D.meta.creator}\n${D.meta.storeUrl || D.meta.instagram}\n`;
    return t;
  }

  /* -------------------------------------------------------------------- map */
  // Leaflet is loaded on demand from a CDN the first time the Map tab opens, 
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

  /* The map is no longer a tab of its own, it's a VIEW of whatever tab you're
     on. mapPanel() takes the spots that tab is showing (already type-filtered)
     and returns the panel. Locked spots stay OFF it: even an unnamed pin gives
     the location away, and the location is exactly what's being sold. */
  function mapPanel(spots) {
    const box = el("div", "mappanel");
    const shown = spots.filter(s => s.coords && isUnlocked(s));
    const hiddenCount = spots.filter(s => !isUnlocked(s)).length;

    if (hiddenCount) {
      const note = el("div", "promo");
      note.innerHTML = `<p>🔒 <strong>${hiddenCount} more pins</strong> appear here when you unlock, the spots most visitors never find.</p>`;
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

  /* Legacy #/map, kept so old links land somewhere sensible. */
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
  /* ------------------------------------------------------------- info icons
     Inline SVG, one drawing per item, no icon appears twice on the page.
     They inherit currentColor, so they re-tint with the rank theme. The Info
     tab must work in a wadi with no signal, which is why these are drawn here
     rather than fetched from anywhere. */
  const II = {
    dress: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="9" r="4.5"/><path d="M14 21a10 10 0 0 1 20 0v8H14z"/><path d="M17 29v10M31 29v10M17 39h5M26 39h5"/></svg>`,
    alcohol: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 9h26L24 24z"/><path d="M24 24v13M17 37h14M17 13h14" opacity=".5"/></svg>`,
    drone: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="19" y="20" width="10" height="8" rx="2"/><path d="M19 22l-7-6M29 22l7-6M19 26l-7 6M29 26l7 6"/><path d="M7 14h10M31 14h10M7 34h10M31 34h10"/></svg>`,
    camera: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17h8l3-4h10l3 4h6v19H6z"/><circle cx="21" cy="26" r="6"/><path d="M35 6h8v7h-3.5l-3 3v-3H35z"/></svg>`,
    weekend: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="36" height="32" rx="4"/><path d="M6 20h36M16 6v8M32 6v8"/><rect x="25" y="26" width="12" height="10" rx="2" fill="currentColor" opacity=".22" stroke="none"/><path d="M25 26h12v10H25z"/></svg>`,
    rubbish: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h14l3 5v15H14V27z"/><path d="M20 22c0-3.5 8-3.5 8 0"/><path d="M24 4v9M20.5 9.5L24 13l3.5-3.5"/></svg>`,
    signal: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40h5v-8H8zM19 40h5V21h-5zM30 40h5V13h-5z"/><path d="M41 40h1V8" opacity=".4"/></svg>`,
    sim: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6h17l9 9v27H11z"/><rect x="17" y="22" width="14" height="13" rx="2"/><path d="M17 27h14M24 22v13"/></svg>`,
    esim: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="4" width="22" height="40" rx="4"/><path d="M20 38h8"/><path d="M18 17a8.5 8.5 0 0 1 12 0M21.5 21.5a3.6 3.6 0 0 1 5 0" opacity=".8"/></svg>`,
    nosignal: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="8" width="16" height="32" rx="3"/><path d="M22 36h4"/><path d="M17 17a10 10 0 0 1 14 0" opacity=".45"/><path d="M12 6l24 24" stroke-width="3.2"/></svg>`,
    otaxi: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="5" width="20" height="38" rx="4"/><path d="M22 39h4"/><path d="M18 27l2-5h8l2 5v4h-2v-2h-8v2h-2z"/><circle cx="24" cy="13" r="2.6"/></svg>`,
    talabat: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="5" width="20" height="38" rx="4"/><path d="M22 39h4"/><path d="M19 20h10l-1 11h-8z"/><path d="M21 20c0-4 6-4 6 0"/></svg>`,
    cardcash: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="29" height="20" rx="3"/><path d="M5 18h29"/><circle cx="35" cy="33" r="8"/><path d="M35 29.5v7M31.5 33h7"/></svg>`,
    rentcar: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 29l3-9h20l3 9v7h-4v-3H10v3H6z"/><circle cx="12" cy="31" r="2.4"/><circle cx="26" cy="31" r="2.4"/><circle cx="38" cy="12" r="5"/><path d="M38 17v9M38 22h5"/></svg>`,
    citytaxi: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 31l3-9h30l3 9v7h-4v-3H10v3H6z"/><circle cx="14" cy="33" r="2.4"/><circle cx="34" cy="33" r="2.4"/><rect x="19" y="14" width="10" height="6" rx="1.5"/></svg>`,
    guidecar: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="5"/><path d="M24 8v11M11.5 31l8.2-4.6M36.5 31l-8.2-4.6"/></svg>`,
    bus: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="7" width="30" height="29" rx="4"/><path d="M9 24h30M15 36v4M33 36v4"/><circle cx="16" cy="30" r="1.6" fill="currentColor"/><circle cx="32" cy="30" r="1.6" fill="currentColor"/></svg>`,
    streettaxi: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 33l3-8h20l3 8v6h-4v-3H10v3H6z"/><circle cx="13" cy="35" r="2.2"/><circle cx="25" cy="35" r="2.2"/><path d="M36 9a5 5 0 0 1 5 5c0 3-3 3.6-4 5.4-.5.8-.6 1.6-.6 2.6" stroke-width="2.2"/><path d="M36.5 27h.01" stroke-width="3.4"/></svg>`,
    flood: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5l19 33H5z"/><path d="M17 30c2.4-2.2 4.6-2.2 7 0s4.6 2.2 7 0" stroke-width="2.2"/><path d="M24 15v7" stroke-width="3"/></svg>`,
    phone: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6h8l4 10-5 3a20 20 0 0 0 8 8l3-5 10 4v8a4 4 0 0 1-4 4C21 38 10 27 10 10a4 4 0 0 1 4-4z"/></svg>`,
    visa: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="5" width="28" height="38" rx="4"/><circle cx="24" cy="19" r="6"/><path d="M16 33h16M16 38h10"/><path d="M20.5 19l2.5 2.5 4.5-4.5" stroke-width="2.2"/></svg>`
  };

  /* ----------------------------------------------------------------- info
     Six sections, six different drawings, signs for the rules, a coverage
     chart for the networks, app chips, a best-to-worst ladder, big numerals
     for money, a phone panel for emergencies. One rendering system per kind
     of information, not one box repeated 23 times.

     Every item keeps its full `text`; tapping anything opens it in the
     section's shared detail panel. Nothing is more than one tap deep. */
  function renderInfo() {
    const info = D.info || {};
    const aff = D.meta.affiliates;
    clearView();

    // No page title, no intro, no tap hint, no key-facts strip. All four were
    // preamble about the page rather than the page itself, and they pushed the
    // first real thing (visas) below the fold. It opens on "Before you fly"
    // now. The tap cues live on the elements themselves; 9999 is still one tap
    // away in "If something goes wrong", where you'd look for it.

    (info.sections || []).forEach(sec => {
      const s = el("section", "isec isec-" + (sec.layout || "plain"));
      s.appendChild(el("h2", "isec-h", esc(sec.title)));

      // One shared detail panel per section, tap an element, its full text
      // opens here; tap again to close. Kills the 23 chevron-boxes.
      const xp = el("div", "xp");
      xp.hidden = true;
      let openIx = -1;
      const sync = () => s.querySelectorAll("[data-xi]").forEach(n =>
        n.classList.toggle("on", !xp.hidden && +n.dataset.xi === openIx));
      const openItem = i => {
        if (openIx === i && !xp.hidden) { xp.hidden = true; openIx = -1; sync(); return; }
        openIx = i;
        const it = sec.items[i];
        xp.innerHTML = `<strong>${esc(it.name)}</strong><p>${esc(it.text)}</p>`;
        const link = it.affiliate && aff[it.affiliate];
        if (link) {
          const a = el("a", "affbtn", esc(it.affLabel || "Link →"));
          a.href = affLink(link); a.target = "_blank"; a.rel = "noopener"; a.dataset.spot = "info";
          xp.appendChild(a);
        }
        // Plain external links too (the official eVisa portal), same button,
        // no affiliate plumbing.
        if (it.link) {
          const a = el("a", "affbtn", esc(it.linkLabel || "Open →"));
          a.href = it.link; a.target = "_blank"; a.rel = "noopener";
          xp.appendChild(a);
        }
        // MOVE the panel to sit directly under whatever was tapped. It used to
        // live at the bottom of the section, so tapping the first of six
        // road-signs opened the text far below, sometimes off-screen entirely.
        //
        // In a grid the panel can't go straight after the tile or it would
        // break the row: it goes after the LAST tile of that tile's row and
        // spans the full width, so the grid stays intact and the panel still
        // appears immediately beneath the thing you tapped.
        const el2 = s.querySelector(`[data-xi="${i}"]`);
        const grid = el2 && el2.closest(".sign-grid, .stat-grid");
        if (grid) {
          const kids = [...grid.children].filter(k => k !== xp);
          const perRow = Math.max(1, Math.round(grid.clientWidth / (kids[0].offsetWidth || 1)));
          const rowEnd = Math.min(kids.length - 1, Math.floor(kids.indexOf(el2) / perRow) * perRow + perRow - 1);
          kids[rowEnd].after(xp);
        } else if (el2) {
          el2.after(xp);                    // list rows: straight underneath
        }
        xp.hidden = false; sync();
        // If it opened above the fold or off the bottom, bring it into view.
        requestAnimationFrame(() => {
          const r = xp.getBoundingClientRect();
          if (r.bottom > innerHeight - 8 || r.top < 60) {
            xp.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      };
      const wire = root => root.querySelectorAll("[data-xi]").forEach(n =>
        n.onclick = () => openItem(+n.dataset.xi));

      if (sec.layout === "signs") {
        // Pictogram road-signs. Red ring + slash = prohibited; teal = advisory.
        const g = el("div", "sign-grid");
        g.innerHTML = sec.items.map((it, i) =>
          `<button type="button" class="sign" data-xi="${i}" aria-label="${esc(it.name)}">
             <span class="sign-ic${it.no ? " sign-forbid" : ""}">${II[it.icon] || ""}</span>
             <strong>${esc(it.name)}</strong>
           </button>`).join("");
        wire(g); s.appendChild(g);

      } else if (sec.layout === "connect") {
        const card = el("div", "concard");
        card.innerHTML =
          `<button type="button" class="bars" data-xi="0" aria-label="Network coverage compared">` +
            (sec.bars || []).map(b =>
              `<span class="bar-row"><span class="bar-l">${esc(b.label)}</span>` +
              `<span class="bar-t"><i style="--w:${b.pct}%"></i></span>` +
              `<span class="bar-n">${esc(b.note)}</span></span>`).join("") +
          `</button>` +
          sec.items.slice(1).map((it, j) =>
            `<button type="button" class="irow" data-xi="${j + 1}">
               <span class="irow-ic">${II[it.icon] || ""}</span>
               <span class="irow-t"><strong>${esc(it.name)}</strong><small>${esc(it.short)}</small></span>
               <span class="irow-c">›</span>
             </button>`).join("");
        wire(card); s.appendChild(card);

      } else if (sec.layout === "apps") {
        // Rows with an external link (the eVisa portal) trade the chevron for
        // a solid pill, the loudest "this is a button" signal on the page.
        const card = el("div", "concard");
        card.innerHTML = sec.items.map((it, i) =>
          `<button type="button" class="irow" data-xi="${i}">
             <span class="irow-ic app-ic">${II[it.icon] || ""}</span>
             <span class="irow-t"><strong>${esc(it.name)}</strong><small>${esc(it.short)}</small></span>
             ${it.link ? `<span class="irow-pill">${esc(it.pill || "Check")} ↗</span>`
                       : `<span class="irow-c">›</span>`}
           </button>`).join("");
        wire(card); s.appendChild(card);

      } else if (sec.layout === "ranked") {
        // The ladder: rank number, a bar that shrinks and fades as the option
        // gets worse, and the reason on the row.
        const card = el("div", "concard");
        card.innerHTML = sec.items.map((it, i) =>
          `<button type="button" class="lad" data-xi="${i}">
             <span class="lad-n">${i + 1}</span>
             <span class="irow-ic">${II[it.icon] || ""}</span>
             <span class="irow-t"><strong>${esc(it.name)}</strong><small>${esc(it.short)}</small>
               <span class="lad-bar"><i style="--w:${100 - i * 17}%;--o:${(1 - i * 0.16).toFixed(2)}"></i></span>
             </span>
             <span class="irow-c">›</span>
           </button>`).join("");
        wire(card); s.appendChild(card);

      } else if (sec.layout === "stats") {
        // The item's name rides on the tile, a bare "0" with no label read
        // as a mystery number rather than "tipping: none expected".
        const g = el("div", "stat-grid");
        g.innerHTML = sec.items.map((it, i) =>
          `<button type="button" class="stat" data-xi="${i}">
             <em>${esc(it.name)}</em>
             <strong>${esc(it.big)}</strong><span>${esc(it.sub)}</span>
           </button>`).join("");
        wire(g); s.appendChild(g);

      } else if (sec.layout === "sos") {
        const card = el("div", "soscard");
        card.innerHTML = sec.items.map((it, i) => it.tel
          ? `<a class="sos-call" href="tel:${esc(it.name)}">
               <span class="irow-ic">${II.phone}</span>
               <span class="irow-t"><strong>${esc(it.name)}</strong><small>${esc(it.short)} Tap to call.</small></span>
             </a>`
          : `<button type="button" class="irow sos-row" data-xi="${i}">
               <span class="irow-ic">${II[it.icon] || ""}</span>
               <span class="irow-t"><strong>${esc(it.name)}</strong><small>${esc(it.short)}</small></span>
               <span class="irow-c">›</span>
             </button>`).join("");
        wire(card); s.appendChild(card);

      } else {
        // Unknown layout, plain tappable rows, so a future section never breaks.
        const card = el("div", "concard");
        card.innerHTML = sec.items.map((it, i) =>
          `<button type="button" class="irow" data-xi="${i}">
             <span class="irow-t"><strong>${esc(it.name)}</strong><small>${esc(it.short || "")}</small></span>
             <span class="irow-c">›</span>
           </button>`).join("");
        wire(card); s.appendChild(card);
      }

      s.appendChild(xp);
      view.appendChild(s);
    });
  }

  /* ------------------------------------------------------------ route map ---
     The whole itinerary on one map: numbered stops in visit order, one colour
     per day, lines base → stops → tonight's bed. Straight lines on purpose, 
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
      "Straight lines, not roads, use each day's Google Maps button for turn-by-turn."));

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
        "The route map needs an internet connection, the day-by-day Google Maps links above still work."));
    });
    return box;
  }

  /* ------------------------------------------------------------------ router
     Five tabs. Old bookmarks (#/wadis, #/beaches, #/map…) still work, they're
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
    applyRankTheme();       // keep the skin in step with the rank, on every page
    renderHud();
    renderTabs(known);
    renderUnlockBtn();
    const meta = D.categories.find(c => c.id === known);
    if (known === "salalah" && D.meta.salalahComingSoon) renderComingSoon(meta);
    else if (meta.special === "planner") renderPlanner();
    else if (meta.special === "map") renderMap();
    else if (meta.special === "info") renderInfo();
    else if (meta.special === "about") renderAbout();
    else renderCategory(known);
    window.scrollTo(0, 0);
  }

  /* Re-draw the page UNDER the sheet, without scrolling it or closing anything.
     Saving a spot or ticking "been here" changes the rank ring and the card
     badges behind the sheet; before this, none of that appeared until you
     reloaded. The sheet lives outside #view, so redrawing the view is safe.
     Exposed on window because openSheet's handlers need it. */
  function refreshBehind() {
    if (!lastCat) return;
    const y = window.scrollY;
    const meta = D.categories.find(c => c.id === lastCat);
    if (!meta || meta.special) return;      // planner/map/info/about don't list spots
    applyRankTheme();
    renderCategory(lastCat);
    window.scrollTo(0, y);
  }
  window.__refreshBehind = refreshBehind;

  /* -------------------------------------------------------------------- wire */
  $("#unlockBtn").onclick = openUnlock;
  $("#sheetClose").onclick = closeSheet;
  $("#sheetBackdrop").onclick = closeSheet;
  $("#modalClose").onclick = closeModal;
  $("#modalBackdrop").onclick = e => { if (e.target === $("#modalBackdrop")) closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); closeModal(); } });

  // The old pop-up search bar. The tab pages have a real field of their own
  // now (.searchcue in renderCategory), so this only exists for anything that
  // still calls __toggleSearch. It keeps both query copies in step.
  window.__toggleSearch = () => {
    const sb = $("#searchbar");
    sb.hidden = !sb.hidden;
    if (!sb.hidden) $("#searchInput").focus();
  };
  $("#searchClose").onclick = () => {
    $("#searchbar").hidden = true;
    $("#searchInput").value = ""; query = ""; queryRaw = ""; route();
  };
  $("#searchInput").oninput = e => {
    queryRaw = e.target.value;
    query = queryRaw.trim();
    typeFilter = null;                       // searching clears the type filter
    const cat = location.hash.replace("#/", "") || "wadis";
    const meta = D.categories.find(c => c.id === cat);
    if (meta && !meta.special) renderCategory(cat);
  };

  window.addEventListener("hashchange", route);
  // Handle + the update date on one line: the "living guide" proof without a
  // 28px strip of its own.
  $("#brandSub").innerHTML =
    `${esc(D.meta.creator)}<i class="bs-dot">·</i>Updated ${esc(D.meta.lastUpdated)}`;
  renderLivingLine();
  applyRankTheme();      // paint the app in the returning traveller's rank colour

  Unlock.init().finally(route);
})();

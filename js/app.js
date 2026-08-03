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
    const nBeen = beenSpotCount();
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

  /* ------------------------------------------------------------ who sees what
     Three products, so "is this unlocked?" is no longer one question.

       free: true          everyone, always (the shop window)
       freeLaunch / "*"    the Full Kit, or the free-launch season: everything
       "basic"             every locked SPOT, plus the plans named in
                           meta.basicItineraries (the 3-day)
       "itin:<id>"         that one plan, bought on its own for $2.99

     Order matters: the cheap, specific grants are checked last, so a Full Kit
     holder never falls through to a per-plan check. */
  /* Is this one of the three paid routes being held back for the trial?
     The free 1-day plan is never caught by this: item.free short-circuits
     above it in isUnlocked, and the check below is belt and braces. */
  const isHeldPlan = item =>
    !!D.meta.plansLocked && (item.cat || "") === "itineraries" && item.free !== true;

  // The date those plans open, for every line of copy that names it.
  const plansOpenDate = () => D.meta.plansOpen || "October";

  function isUnlocked(item) {
    if (item.free) return true;
    /* HARD LOCK, and it is deliberately ABOVE the bundle check so that
       freeLaunch, a Full Kit key and a per-plan key all fail to open it.
       "Locked for everyone until the date" has to mean everyone, or the
       date means nothing. One flag in content.js reopens all three. */
    if (isHeldPlan(item)) return false;
    if (Unlock.hasBundle()) return true;               // "*" or free launch
    if ((item.cat || "") === "itineraries") {
      if (Unlock.hasGrant("itin:*")) return true;      // the $7 plans bundle
      if (Unlock.hasGrant("itin:" + item.id)) return true;
      return Unlock.hasGrant("basic") &&
             (D.meta.basicItineraries || []).indexOf(item.id) !== -1;
    }
    return Unlock.hasGrant("basic");                    // every locked spot
  }

  /* What it costs to open THIS thing, the smallest price that works. A plan
     is $2.99 on its own; everything else needs the Guide. */
  const priceFor = item =>
    (item.cat || "") === "itineraries" ? D.meta.itineraryPrice : D.meta.bundlePrice;

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

  // Rank counts SPOTS only. Itinerary cards carry ✓ too, and their ids land
  // in the same oman_been list; without this filter, ticking a trip inflated
  // the explorer rank ("done 4 of 101" after ticking four plans).
  const beenSpotCount = () => Store.been().filter(id => D.spots.some(s => s.id === id)).length;

  // Smart filters (session state): season / no-4×4 / kids / saved.
  const smart = { season: false, no4x4: false, kids: false, saved: false,
                  todo: false, been: false };
  const inSeason = i => !i.months || i.months.includes(new Date().getMonth() + 1);
  const smartPass = i =>
    (!smart.season || inSeason(i)) &&
    (!smart.no4x4 || !i.needs4x4) &&
    // Strict === true, not !== false: a spot added later without the flag
    // considered must NOT quietly appear under a parent's kids filter.
    (!smart.kids || i.kidOk === true) &&
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
          <li>All <strong>${D.spots.filter(s => !s.free).length}</strong> locked spots: wadis, beaches, mountain villages and the south.</li>
          <li>The ${(D.meta.basicItineraries || []).map(id => {
                const p = (D.itineraries || []).find(x => x.id === id);
                return p ? p.name.replace(/^The\s+/i, "") : id;
              }).join(" and the ")}, hour by hour, with the costs receipt.</li>
          <li>New spots and re-checked prices every month. No subscription.</li>
          <li>The big routes and the trip Planner are in
              <strong>${esc((D.meta.tiers && D.meta.tiers.premium && D.meta.tiers.premium.name) || "the Full Kit")}</strong>,
              ${esc((D.meta.tiers && D.meta.tiers.premium && D.meta.tiers.premium.price) || "$19.99")}.</li>
        </ul>
        <a class="btn-buy gold" href="${buyUrl("basic") || buyUrl("bundle") || "#/shop"}"${buyUrl("basic") || buyUrl("bundle") ? ` target="_blank" rel="noopener"` : ""}>Get the Guide, ${D.meta.bundlePrice}</a>
        <p class="price-fine">One key. Works on any phone, paste it again if you switch.</p>
        <p class="price-trust">🔒 Secure checkout through Gumroad, they handle the payment, I never see your card.
           Not what you expected? Email me within 14 days and I'll refund it, no argument.</p>
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

  /* ------------------------------------------------------------ the bundle
     "What exactly am I buying?" had no home. The price block lists bullets,
     but nowhere showed the product as a THING with contents. This is that
     page-within-a-page: what's in the box, itemised, with the free sample
     called out so the reader knows the paid tier looks identical.

     Not a cart. There is one product, one price, one key, and Gumroad is the
     checkout. A cart would add three steps and zero value. */
  function bundleBox() {
    const spots = D.spots.length;
    const locked = lockedCount();
    // Only the LOCKED plans are part of the purchase; the 1-day and 3-day are
    // free samples, and counting them would be a claim the reader can disprove
    // in two taps. Name them instead of counting them, it sells better and it
    // stays true when the free/paid split changes.
    const paidPlans = (D.itineraries || []).filter(i => !i.free);
    const planNames = paidPlans.map(i => i.name.replace(/^The\s+/i, "")).join(" and ");
    const w = el("div", "bundle");
    w.innerHTML = `
      <div class="bn-head">
        <div>
          <h2>The full guide</h2>
          <p class="bn-sub">Everything below, one payment, yours forever.</p>
        </div>
        <div class="bn-price">
          <b>${esc(D.meta.bundlePrice)}</b>
          <small>one time</small>
        </div>
      </div>

      <div class="bn-items">
        <div class="bn-item">
          <span class="bn-ic" aria-hidden="true">📍</span>
          <span><strong>${locked} locked spots</strong>
            <small>The remote wadis, the empty beaches, the mountain villages and the south.
                   ${spots - locked} more stay free either way.</small></span>
        </div>
        <div class="bn-item">
          <span class="bn-ic" aria-hidden="true">🗺️</span>
          <span><strong>${esc(planNames)}</strong>
            <small>Hour by hour, every stop tappable, each with a costs receipt at the
                   bottom. The 1-day plan stays free, it's the sample.</small></span>
        </div>
        <div class="bn-item">
          <span class="bn-ic" aria-hidden="true">🧭</span>
          <span><strong>The trip Planner</strong>
            <small>Answer four questions, get your own route built around your days,
                   pace and vehicle.</small></span>
        </div>
        <div class="bn-item">
          <span class="bn-ic" aria-hidden="true">🔄</span>
          <span><strong>Every future update</strong>
            <small>New spots and re-checked prices monthly, Salalah when it lands.
                   No subscription, nothing to renew.</small></span>
        </div>
        <div class="bn-item">
          <span class="bn-ic" aria-hidden="true">📶</span>
          <span><strong>Works with no signal</strong>
            <small>Install it once and the whole guide, photos included, works in a
                   wadi with no bars.</small></span>
        </div>
      </div>

      <div class="bn-sample">
        <strong>Try before you pay.</strong> The Perfect Oman Day above is free and
        complete: same timeline, same map, same receipt as the paid routes. What you
        see there is exactly what you get.
      </div>`;

    // Social proof, from meta.testimonials only. Renders nothing when the
    // array is empty, which is correct: an empty quote block is worse than
    // no quote block, and inventing one is not an option.
    const quotes = (D.meta.testimonials || []).slice(0, 3);
    if (quotes.length) {
      const t = el("div", "bn-quotes");
      t.innerHTML = quotes.map(q =>
        `<blockquote class="bn-q">“${esc(q.text)}”${q.by ? `<cite>${esc(q.by)}</cite>` : ""}</blockquote>`
      ).join("");
      w.appendChild(t);
    }

    if (D.meta.freeLaunch) {
      const note = el("p", "bn-launch",
        "🎁 Right now it's all free. In October it becomes a paid guide, and the email list gets the founding price.");
      w.appendChild(note);
    } else {
      const buy = el("a", "btn-buy gold", `Get the full guide, ${esc(D.meta.bundlePrice)}`);
      buy.href = D.meta.buyLinks.bundle; buy.target = "_blank"; buy.rel = "noopener";
      w.appendChild(buy);
      w.appendChild(el("p", "price-trust",
        "🔒 Secure checkout through Gumroad, they handle the payment, I never see your card. Not what you expected? Email me within 14 days and I'll refund it."));
    }
    return w;
  }

  /* ========================================================== TRIP CAPTURE
     THE most important twelve lines in the app.

     An email address on its own tells you nothing: it is a stranger who
     liked a photo. An email with WHEN THEY ARE COMING is a customer with a
     deadline, and the difference decides whether October is a launch or a
     shrug. Somebody flying in six weeks wants the guide today. Somebody
     idly scrolling in Berlin wants a reminder in the spring. Same address,
     opposite emails, and you cannot tell them apart without this.

     Two taps: a month and a trip length. Neither is required, because a
     required field is a wall and half the point is getting the address at
     all, but both are ONE TAP and pre-set to the likeliest answer, so most
     people leave them filled in.

     Reused everywhere something is locked or not yet sellable, so the ask is
     identical in every corner of the app: the shop, the unlock modal, the
     Salalah curtain, the sticky bar and every $2.99 plan. */

  // The next 15 months, starting this one. A traveller planning further out
  // than that is not a lead, they're a daydream.
  function tripMonths() {
    const M = ["January","February","March","April","May","June","July",
               "August","September","October","November","December"];
    const now = new Date();
    const out = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      out.push({ v: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"),
                 label: M[d.getMonth()] + " " + d.getFullYear() });
    }
    return out;
  }

  /* opts: { title, lead, cta, done, source, compact } */
  function tripCapture(opts) {
    opts = opts || {};
    const w = el("div", "capture" + (opts.compact ? " capture-compact" : ""));
    const months = tripMonths();
    w.innerHTML = `
      ${opts.title ? `<h3 class="cap-title">${esc(opts.title)}</h3>` : ""}
      ${opts.lead ? `<p class="cap-lead">${opts.lead}</p>` : ""}
      <label class="cap-q" for="capWhen">When are you coming?</label>
      <div class="cap-row">
        <select id="capWhen" class="cap-sel">
          ${months.map(m => `<option value="${m.v}">${esc(m.label)}</option>`).join("")}
          <option value="unsure">Not decided yet</option>
        </select>
      </div>
      <span class="cap-q">How long?</span>
      <div class="cap-chips" id="capDays">
        ${[["3","A long weekend"],["5","About 5 days"],["7","A week"],["10","10 days or more"]]
          .map(([v, l], i) => `<button type="button" class="cap-chip" data-v="${v}" aria-pressed="${i === 1}">${esc(l)}</button>`).join("")}
      </div>
      <div class="subrow cap-send">
        <input type="email" id="capEmail" placeholder="you@email.com" autocomplete="email" inputmode="email">
        <button class="pill" id="capBtn">${esc(opts.cta || "Send it to me")}</button>
      </div>
      <div id="capMsg"></div>
      <p class="cap-fine">${opts.fine || (D.meta.freeLaunch
        ? `No spam, no list swapping. One email when the routes open, timed to your trip.`
        : `No spam, no list swapping. One email when it lands, and the founding price when it does.`)}</p>`;

    let days = "5";
    const chips = w.querySelectorAll(".cap-chip");
    chips.forEach(c => c.onclick = () => {
      days = c.dataset.v;
      chips.forEach(x => x.setAttribute("aria-pressed", String(x === c)));
    });

    const send = async () => {
      const em = w.querySelector("#capEmail").value.trim();
      const msg = w.querySelector("#capMsg");
      if (!/^\S+@\S+\.\S+$/.test(em)) {
        msg.innerHTML = `<div class="msg err">That doesn't look like an email.</div>`;
        return;
      }
      const when = w.querySelector("#capWhen").value;
      const btn = w.querySelector("#capBtn");
      btn.disabled = true; btn.textContent = "Sending…";
      const trip = { trip_month: when, trip_days: days, source: opts.source || "shop" };
      // Always log the intent as an event too. Events take any shape, so the
      // dates survive even on a database that predates the trip columns.
      if (window.Analytics) Analytics.track("trip_intent", trip);
      const r = await Analytics.subscribe(em, trip);
      btn.disabled = false; btn.textContent = opts.cta || "Send it to me";
      if (r.ok) {
        const m = months.find(x => x.v === when);
        msg.innerHTML = `<div class="msg ok">${esc(opts.done ||
          (m ? "You're on the list. I'll have this with you well before " + m.label + ". 🇴🇲"
             : "You're on the list. 🇴🇲"))}</div>`;
        w.querySelector(".cap-send").hidden = true;
      } else {
        msg.innerHTML = `<div class="msg err">Couldn't sign you up, try again in a bit.</div>`;
      }
    };
    w.querySelector("#capBtn").onclick = send;
    w.querySelector("#capEmail").onkeydown = e => { if (e.key === "Enter") send(); };
    return w;
  }

  /* ----------------------------------------------------------- free launch
     While meta.freeLaunch is true the guide is fully open. Instead of buy
     buttons, the ask is an EMAIL AND A DATE: join the founding-explorer list
     before the paywall lands in October. One box, reused everywhere. */
  /* This copy has to match what the app actually does, because a reader
     checks it against the very next screen. It used to promise "every
     itinerary and the trip Planner", both of which are held back now: one
     sentence of overclaim costs more trust than the plans were ever going
     to earn. Places free, routes dated, Planner named as later. */
  function launchBox() {
    const w = el("div", "launchbox");
    w.innerHTML = `
      <div class="launch-badge">🎁 Free trial, every place in the guide</div>
      <p>All ${D.spots.length} places, free, with the maps, the costs and the logistics.
         <strong>The full routes open on ${esc(plansOpenDate())}</strong>, and the trip
         Planner with them.</p>`;
    w.appendChild(tripCapture({
      lead: "Tell me when you're coming and I'll send you the routes the day they open, " +
            "timed to your trip.",
      cta: "Send it to me",
      done: "You're on the list. 🇴🇲",
      source: "launch"
    }));
    return w;
  }

  /* ================================================= plan my trip for me
     PRODUCT THREE, and the only one nobody can copy: a real Omani guide who
     answers. An app can be rebuilt in a weekend; you cannot.

     It is priced by GROUP SIZE, because a route for two and a route for
     eight are not the same job. Pick a size, the price changes, and the
     WhatsApp message is pre-written with the size and the dates already in
     it, so the traveller's first message is a brief instead of "hi".

     While a tier's `price` is "" (they ship empty on purpose, the prices are
     Hussain's to set) the card says he'll quote on WhatsApp, and every
     button still works. Fill in meta.planService.tiers[].price and the
     numbers appear here, on the shop and on the sticky bar. */

  // "+968 7921 8186" → wa.me link with the message already typed.
  function waLink(text) {
    const num = (D.meta.planService && D.meta.planService.whatsapp || "").replace(/\D/g, "");
    if (!num) return null;
    return "https://wa.me/" + num + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  function bookBox(opts) {
    opts = opts || {};
    const svc = D.meta.planService || {};
    const tiers = svc.tiers || [];
    const w = el("div", "bookbox");
    let tier = tiers[0] || null;

    /* MONEY IS ALL-OR-NOTHING HERE. If not one tier carries a price, the
       price chip and the whole "Your price" line come out of the DOM rather
       than degrading to "quote" / "I'll quote you". A row of chips reading
       quote · quote · quote still frames the next tap as a transaction, and
       during the free trial it is not one: they pick a size, they message,
       it gets agreed like people do. Put any price back in content.js and
       every piece of this returns on its own. */
    const anyPrice = tiers.some(t => t && t.price);

    const priceLine = t =>
      t && t.price ? `<b class="bk-price">${esc(t.price)}</b>`
                   : `<b class="bk-price bk-quote">I'll quote you</b>`;

    w.innerHTML = `
      <h3>🤝 Want me to plan it for you?</h3>
      <p>Tell me your dates and what you want, and I'll send back a real route:
         the order, the drives, where to sleep, what it costs. Then I answer
         whatever you ask before you book anything.</p>

      ${tiers.length ? `
      <span class="bk-q">Who's coming?</span>
      <div class="bk-tiers" id="bkTiers">
        ${tiers.map((t, i) => `
          <button type="button" class="bk-tier" data-i="${i}" aria-pressed="${i === 0}">
            <span class="bk-t-label">${esc(t.label)}</span>
            <span class="bk-t-sub">${esc(t.sub || "")}</span>
            ${anyPrice ? `<span class="bk-t-price">${t.price ? esc(t.price) : "quote"}</span>` : ""}
          </button>`).join("")}
      </div>` : ""}

      <div class="bookgrid">
        <input id="bkName" maxlength="80" placeholder="Your name">
        <input id="bkContact" maxlength="120" placeholder="Email or WhatsApp number">
        <input id="bkDates" maxlength="80" placeholder="When? (e.g. 12–19 Dec, or 'flexible')">
        <input id="bkGroup" maxlength="40" placeholder="How many of you?">
      </div>
      <textarea id="bkNote" maxlength="1000" rows="3" placeholder="What do you want from the trip? Wadis, desert, culture, kids along, fitness level, budget…"></textarea>

      <div class="bk-actions">
        ${waLink("") ? `<a class="bk-wa" id="bkWa" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.76 1.45 5.32L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.03-5.1-2.9-6.96A9.75 9.75 0 0 0 12.04 2Zm5.76 13.9c-.24.68-1.42 1.32-1.95 1.36-.5.05-.98.24-3.3-.69-2.78-1.1-4.55-3.95-4.69-4.13-.13-.19-1.12-1.5-1.12-2.86 0-1.36.71-2.03.96-2.3.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.1.19-.14.31-.28.47-.14.17-.3.37-.42.5-.14.14-.29.29-.12.57.16.28.73 1.2 1.56 1.95 1.08.96 1.98 1.26 2.26 1.4.28.14.45.12.61-.07.17-.19.7-.81.89-1.09.19-.28.37-.23.62-.14.25.09 1.65.78 1.93.92.28.14.47.21.54.33.07.11.07.66-.17 1.34Z"/></svg>
          <span id="bkWaTxt">Plan my trip for me</span>
        </a>` : ""}
        <button type="button" class="rate-send" id="bkSend">Or send it as a form</button>
      </div>
      <p class="book-fine">I reply personally, ${esc(svc.replyTime || "usually within 48 hours")}.
         ${svc.whatsappLabel ? esc(svc.whatsappLabel) : ""}</p>
      ${anyPrice && tiers.length ? `<div class="bk-priceline">Your price: ${priceLine(tier)}
        <small id="bkPriceSub">${esc(tier && tier.sub || "")}</small></div>` : ""}
      <div id="bkMsg"></div>`;

    const val = id => { const n = w.querySelector(id); return n ? n.value.trim() : ""; };

    /* The WhatsApp message writes itself from whatever they've typed. An
       empty first message gets a slow reply; a brief gets a fast one. */
    const waText = () => {
      const bits = ["Hi Hussain, I'd like you to plan my Oman trip."];
      if (tier) bits.push("Group: " + tier.label + (tier.sub ? " (" + tier.sub + ")" : ""));
      if (val("#bkDates")) bits.push("Dates: " + val("#bkDates"));
      if (val("#bkGroup")) bits.push("How many: " + val("#bkGroup"));
      if (val("#bkNote")) bits.push("What we want: " + val("#bkNote"));
      bits.push("(from exploresoman.com)");
      return bits.join("\n");
    };
    const syncWa = () => {
      const a = w.querySelector("#bkWa");
      if (a) a.href = waLink(waText()) || "#";
    };

    const tierRow = w.querySelector("#bkTiers");
    if (tierRow) {
      tierRow.querySelectorAll(".bk-tier").forEach(b => b.onclick = () => {
        tier = tiers[+b.dataset.i];
        tierRow.querySelectorAll(".bk-tier").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        const pl = w.querySelector(".bk-priceline");
        if (pl) pl.innerHTML = `Your price: ${priceLine(tier)}<small>${esc(tier.sub || "")}</small>`;
        syncWa();
      });
    }
    w.querySelectorAll("input,textarea").forEach(i => i.addEventListener("input", syncWa));
    syncWa();
    if (w.querySelector("#bkWa")) {
      w.querySelector("#bkWa").addEventListener("click", () => {
        if (window.Analytics) Analytics.track("whatsapp_click", { tier: tier && tier.id, source: opts.source || "plan" });
      });
    }

    w.querySelector("#bkSend").onclick = async () => {
      const data = { name: val("#bkName"), contact: val("#bkContact"),
                     dates: val("#bkDates"),
                     group: (tier ? tier.label + " · " : "") + val("#bkGroup"),
                     note: val("#bkNote") };
      const msg = w.querySelector("#bkMsg");
      if (!data.name || !data.contact) {
        msg.innerHTML = `<div class="msg err">I need at least your name and a way to reach you.</div>`;
        return;
      }
      if (window.Analytics) Analytics.track("book_click", { tier: tier && tier.id, source: opts.source || "plan" });
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
  /* ONE ICON LANGUAGE. The Info tab had a hand-drawn line set while the tab
     bar and dock used raw emoji, so the app spoke two visual dialects. Emoji
     also render differently on every device and can't take the rank tint.
     These are drawn to the same rules as the Info set: 48-box, currentColor,
     2.4 stroke, round caps. Keyed by category id, with the emoji in
     content.js kept as the fallback for anything unmapped. */
  const NAV_ICONS = {
    info: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="18"/><path d="M24 21.5v12"/><circle cx="24" cy="15.5" r="1.9" fill="currentColor" stroke="none"/></svg>`,
    explore: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="18"/><path d="M31.5 16.5l-4.7 11.3-11.3 4.7 4.7-11.3z" fill="currentColor" fill-opacity=".18"/><path d="M31.5 16.5l-4.7 11.3-11.3 4.7 4.7-11.3z"/></svg>`,
    salalah: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 20v20"/><path d="M24 20c-5-4-11-3.5-14 1 4-1.5 8.5-.5 11 2"/><path d="M24 20c5-4 11-3.5 14 1-4-1.5-8.5-.5-11 2"/><path d="M24 20c-2-5.5.5-10.5 5-12-1 4.5-2 8-2.5 10"/></svg>`,
    plan: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13l12-5 12 5 12-5v27l-12 5-12-5-12 5z"/><path d="M18 8v27M30 13v27" opacity=".6"/></svg>`,
    about: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="17" r="7.5"/><path d="M9 40c2.6-8 8.2-12 15-12s12.4 4 15 12"/></svg>`
  };

  function renderTabs(active) {
    const tabs = $("#tabs");
    tabs.innerHTML = "";
    D.categories.forEach(c => {
      const soon = c.id === "salalah" && D.meta.salalahComingSoon;
      const ico = NAV_ICONS[c.id] || c.icon;
      const b = el("button", "tab" + (soon ? " tab-dim" : ""),
        `<span class="t-icon">${ico}</span>${esc(c.label)}` +
        (soon ? `<i class="tab-soon">soon</i>` : ""));
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(c.id === active));
      b.onclick = () => (location.hash = "#/" + c.id);
      tabs.appendChild(b);
    });
    // The tab bar wraps now (every tab visible at once), so there's nothing to
    // scroll into view, and scrollIntoView here would jog the whole page.
  }

  /* The update bar. index.html sets __omanShowUpdate once a new build is
     installed and waiting; tapping hands over to it and the page reloads. */
  window.__omanShowUpdate = () => {
    if ($("#updateBar")) return;
    const u = el("div", "updatebar");
    u.id = "updateBar";
    u.innerHTML = `<span>A newer version of the guide is ready.</span>
                   <button type="button" class="ub-go">Update</button>`;
    u.querySelector(".ub-go").onclick = () => {
      u.querySelector(".ub-go").textContent = "Updating…";
      if (window.__omanUpdateReady) window.__omanUpdateReady();
    };
    document.body.appendChild(u);
  };

  function renderUnlockBtn() {
    const b = $("#unlockBtn");
    /* The top-right slot is the only always-visible action in the app, so it
       has to ASK for something, and it has to ask the RIGHT thing.

       It used to say "Get it free →" on a site where everything is already
       free, which is a download button for something the reader already has:
       it announced a state instead of opening a door. What the app actually
       wants from a stranger is not a click, it is a TRIP: who they are and
       when they're coming. So the always-visible button asks exactly that,
       and lands on the shop, where all three products and the date capture
       live. Once someone owns something, it goes back to reporting that. */
    if (Unlock.isAnythingOwned() && !D.meta.freeLaunch) {
      b.textContent = "✓ " + (Unlock.tierName() || "Unlocked");
      b.className = "pill pill-unlocked";
      return;
    }
    b.textContent = "Planning a trip? →";
    b.className = "pill pill-cta";
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
      /* A locked card used to be an empty grey box, which reads as a broken
         image rather than as withheld treasure. Blur the real photo instead:
         it shows there IS something there and it looks deliberate. The image
         is decorative (aria-hidden) and the name is never exposed, so nothing
         leaks; the blur is heavy enough that no detail survives it. */
      media.classList.add("card-media-locked");
      /* A HELD PLAN IS A DIFFERENT KIND OF LOCKED, so it gets a different
         picture. A locked SPOT hides its name, so it must also hide its
         photo (see below). A held plan announces its name on purpose, so
         there is nothing left for the filename to leak and it can blur its
         OWN photo: the reader sees the actual route they're waiting for,
         out of focus, with the date it clears. */
      const held = isHeldPlan(item);
      const bg = new Image();
      if (held && item.img) {
        bg.src = item.img;
        bg.loading = "lazy";
      } else {
        /* Deliberately the BANNER, not this spot's own photo. Using item.img
           would put "assets/wadis/wadi-mibam.jpg" in the DOM, handing over the
           name that the locked card exists to withhold. The banner is already
           preloaded and cached, so this costs no bytes, and blurred behind a
           scrim it reads as "there is something here" rather than as a broken
           image, which is the whole point. */
        bg.src = "assets/banner.jpg";
      }
      bg.alt = "";
      bg.setAttribute("aria-hidden", "true");
      bg.decoding = "async";
      bg.className = "lock-blur";
      media.appendChild(bg);
      media.insertAdjacentHTML("beforeend", held
        ? `<span class="lock-pill">🔒 Opens ${esc(plansOpenDate())}</span>`
        : `<span class="lock-pill">🔒 In the guide</span>`);
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

    /* THE SHAPE OF THE PAID GUIDE, WITHOUT WITHHOLDING ANYTHING.

       While meta.freeLaunch is on, everything opens, which is right when
       there is no checkout to send anyone to. The cost is that the paid
       guide becomes invisible again: 138 identical open cards, and no
       reason to want the thing you are about to start selling.

       So a spot that WILL be paid says so, and says it as a gift rather
       than a wall. It disappears the instant freeLaunch goes false, because
       then the real lock is doing the job.

       SPOTS GET THE ICON ONLY. On a photo card the kicker already carries a
       type, a region and often a reel badge; a fourth chip reading "Free
       right now" pushed the row into the ♥ and ✓ buttons and turned the
       card into a bag of labels. An open padlock says the same thing in a
       tenth of the width, and the sheet spells it out for anyone curious.

       PLANS GET THE WORDS. There are four of them, not a hundred, they sit
       in a roomier grid, and a plan is the thing most likely to be bought
       on its own, so the one place worth spending the width is there. */
    /* `unlocked` is part of the test now. Without it a held plan wore BOTH
       "🔓 Free right now" and "🔒 Opens October 1st" on the same card, which
       is the app calling itself a liar in two chips an inch apart. Free
       right now can only be said about something that is, in fact, open. */
    if (D.meta.freeLaunch && item.free === false && unlocked) {
      const isPlan = (item.cat || "") === "itineraries";
      const c = el("span", "chip chip-freenow" + (isPlan ? "" : " chip-icon"),
        isPlan ? "🔓 Free right now" : "🔓");
      c.title = "Part of the paid guide, open to everyone during launch";
      c.setAttribute("aria-label", "Part of the paid guide, free right now");
      kick.appendChild(c);
    }
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
        /* Compact locked card: one strip, one line, one button. The full
           sales pitch lives in the shop ONCE, not on all 40+ locked cards,
           that's what made the feed feel endless.

           The PRICE is the item's own cheapest route in, not the bundle's:
           a plan says $2.99, a spot says $9.99. Quoting $9.99 on a $2.99
           plan is the difference between an impulse and a decision. */
        const row = el("div", "lock-row");
        const isPlan = (item.cat || "") === "itineraries";
        const held = isHeldPlan(item);

        /* A HELD PLAN KEEPS ITS NAME AND ITS LINE. Everywhere else a lock
           withholds the identity, because the identity is the product. Here
           the identity is the ANNOUNCEMENT: three named routes, visibly
           coming, on a date. An anonymous "hidden itinerary #2" would hide
           the only part worth waiting for. */
        if (held) {
          body.appendChild(el("h3", null, esc(item.name)));
          body.appendChild(el("p", "tagline", esc(item.tagline)));
        }

        row.appendChild(el("span", "lock-row-txt",
          held ? `Full route, hour by hour` :
          isPlan ? `Full plan, hour by hour` :
          `Hidden ${singularOf(item)}${lockNum ? " #" + lockNum : ""} · in the paid guide`));

        /* No price on a held plan: during the trial there is nothing to buy
           and no checkout to send anyone to. The ask is the date, and only
           the date. */
        const go = el("button", "lock-row-btn",
          held ? `Opens ${plansOpenDate()}` : `Unlock ${priceFor(item)}`);
        go.onclick = e => {
          e.stopPropagation();
          if (held) {
            if (window.Analytics) Analytics.track("held_plan_click", { id: item.id });
            openCapture(item.name, {
              title: item.name,
              lead: `<b>${esc(item.name)}</b> opens on <b>${esc(plansOpenDate())}</b>. ` +
                    `Tell me when you're travelling and I'll send it to you the day it does.`,
              cta: "Send it to me when it opens",
              source: "held-plan:" + item.id
            });
          } else location.hash = "#/shop";
        };
        row.appendChild(go);
        body.appendChild(row);
      }
    }

    if (unlocked) {
      c.style.cursor = "pointer";
      c.onclick = () => openSheet(item);
      /* KEYBOARD ACCESS. This was an <article onclick> with no tabindex and no
         key handler, which meant the entire catalogue, all 138 spots, could be
         seen but not opened by anyone navigating with a keyboard or a switch.
         A div that behaves like a button has to say so and has to answer to
         both Enter and Space, which is what a real <button> would do. */
      c.tabIndex = 0;
      c.setAttribute("role", "button");
      c.setAttribute("aria-label", `${item.name}. ${item.tagline || ""}`);
      c.onkeydown = e => {
        if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
        if (e.target !== c) return;        // let the ♥ and ✓ handle their own keys
        e.preventDefault();                // Space must not scroll the page
        openSheet(item);
      };
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
        refreshRankStrip();     // the scoreboard is in the page now, not the header
        // Rebuild just this card, so the left badge appears/disappears without
        // re-rendering the whole list (which would flicker every photo).
        c.replaceWith(card(item, lockNum));
        if (on) celebrate(beenSpotCount()); else toast("Unmarked");
      };
      media.appendChild(bn);
      if (Store.isBeen(item.id)) media.appendChild(el("span", "been-badge", "✓ Been"));
      // Rexby-style value badge: flag genuinely seasonal spots that are good
      // RIGHT NOW (year-round spots don't get one, it would mean nothing).
      else if (item.img && item.months && item.months.length < 12 && inSeason(item))
        media.appendChild(el("span", "season-badge", "🌡️ In season"));
    } else {
      /* A held plan must not open the KEY modal. There is no key that opens
         it, by design, so "paste your licence" is a door onto a wall, and
         its label quotes a price at a reader during a trial where nothing
         is for sale. Same destination as its own button: the date. */
      const held = isHeldPlan(item);
      const act = held
        ? () => openCapture(item.name, {
            title: item.name,
            lead: `<b>${esc(item.name)}</b> opens on <b>${esc(plansOpenDate())}</b>. ` +
                  `Tell me when you're travelling and I'll send it to you the day it does.`,
            cta: "Send it to me when it opens",
            source: "held-plan:" + item.id
          })
        : () => openUnlock();
      c.style.cursor = "pointer";
      c.onclick = act;
      c.tabIndex = 0;
      c.setAttribute("role", "button");
      c.setAttribute("aria-label", held
        ? `${item.name}. Opens ${plansOpenDate()}.`
        : `Locked ${singularOf(item)}, unlock for ${D.meta.bundlePrice}`);
      c.onkeydown = e => {
        if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
        if (e.target !== c) return;
        e.preventDefault();
        act();
      };
    }

    if (body.hasChildNodes()) c.appendChild(body);
    return c;
  }

  /* Every stop in a plan, in order, as one Google Maps directions link.
     Day one's first stop is the origin, the last stop of the last day is the
     destination, everything between is a waypoint. Maps caps the URL well
     above what any of these plans need, but the slice keeps a future 14-day
     monster from silently producing a link that 414s. Locked spots are
     skipped: a free plan must never leak a paid pin. */
  function itineraryRouteUrl(item) {
    const days = item.route || [];
    if (!days.length) return null;
    const pts = [];
    days.forEach(d => (d.stops || []).forEach(st => {
      const s = st.spot && D.spots.find(x => x.id === st.spot);
      if (s && isUnlocked(s) && s.coords) pts.push(s.coords.join(","));
      else if (s && isUnlocked(s)) pts.push(s.name + ", Oman");
    }));
    const uniq = pts.filter((p, i) => pts.indexOf(p) === i).slice(0, 12);
    if (uniq.length < 2) return null;
    return "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(uniq[0]) +
      "&destination=" + encodeURIComponent(uniq[uniq.length - 1]) +
      (uniq.length > 2 ? "&waypoints=" + uniq.slice(1, -1).map(encodeURIComponent).join("%7C") : "") +
      "&travelmode=driving";
  }

  /* ------------------------------------------------------------------ sheet */
  function openSheet(item) {
    /* THE LAST GATE, and the one that makes "locked for everyone" true.
       card() already refuses to open a held plan, but a sheet is reachable
       from more than a card: search, the overview map, the shop's own plan
       row, a shared #link and anything added later. Guarding the single
       door they all pass through is worth more than guarding each caller. */
    if (isHeldPlan(item)) {
      if (window.Analytics) Analytics.track("held_plan_blocked", { id: item.id });
      openCapture(item.name, {
        title: item.name,
        lead: `<b>${esc(item.name)}</b> opens on <b>${esc(plansOpenDate())}</b>. ` +
              `Tell me when you're travelling and I'll send it to you the day it does.`,
        cta: "Send it to me when it opens",
        source: "held-plan:" + item.id
      });
      return;
    }
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

    /* Maps / Save / Been / Share are the DOCK, at the end of this function.
       Itineraries used to ALSO get a plain Maps button here, so a plan with
       a pin offered the same link twice, forty lines apart. The dock has it. */

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

    if (isItin && item.route) {
      /* ---- the hour-by-hour format -------------------------------------
         Three pieces, in reading order:
           the strip    one chip per day, the whole trip's shape in a glance
           day cards    <details>, day 1 open, each a timed rail of stops
           the receipt  what the trip costs, the thing nobody else publishes
         Times sit in a fixed column so the eye can run straight down them.
         A stop with `spot` gets a 📍 that opens the same Google Maps pin as
         the spot sheet; locked spots are filtered so nothing leaks. */
      const R = item.route;
      // Money strings arrive as bare numbers ("3.0", "~25"). Print them with
      // the currency once, everywhere, so nobody has to infer that 3.0 means
      // rials. Strings already carrying OMR (or words) pass through.
      const fmtOMR = v => {
        if (!v) return "";
        if (/OMR|free/i.test(v)) return v;
        const m = String(v).match(/^([~≈]?)\s*([\d.]+)(.*)$/);
        return m ? `${m[1]}OMR ${m[2].replace(/\.0$/, "")}${m[3]}` : v;
      };
      const done = new Set((() => { try { return JSON.parse(localStorage.getItem("oman_trip_" + item.id) || "[]"); } catch { return []; } })());
      let lastOpen = null;
      try { const v = localStorage.getItem("oman_tripday_" + item.id); if (v !== null) lastOpen = +v; } catch {}
      // Open where the traveller actually is: the day they last had open, else
      // the first day not yet ticked off, else day 1.
      let openIx = (lastOpen !== null && lastOpen >= 0 && lastOpen < R.length) ? lastOpen
                 : R.findIndex((_, i) => !done.has(i));
      if (openIx < 0) openIx = 0;

      // The whole trip on one small map, numbered stops, a colour per day.
      // Filled in after insert (Leaflet loads on demand); offline it folds
      // into a one-line note, the day route buttons still work.
      h += `<div class="mapwrap itinmap" data-itinmap><div class="map-loading">Drawing the route…</div></div>`;

      if (R.length > 1) {
        h += `<div class="trip-strip">` + R.map((d, i) =>
          `<button type="button" class="tday${done.has(i) ? " done" : ""}" data-td="${i}">
             <b>Day ${i + 1}</b><span aria-hidden="true">${d.chip || "📍"}</span><small>${esc(d.sub || "")}</small>
           </button>`).join("") + `</div>`;
      }
      const spotOf = id => { const s = id && D.spots.find(x => x.id === id); return (s && isUnlocked(s)) ? s : null; };
      // One tap that drives the whole day: origin = wherever the phone is,
      // waypoints = the day's stops in order, destination = the last stop.
      const dayDriveUrl = d => {
        const pts = d.stops.map(s => spotOf(s.spot)).filter(Boolean).map(s => s.coords.join(","));
        if (!pts.length) return null;
        const dest = pts.pop();
        return `https://www.google.com/maps/dir/?api=1&destination=${dest}` +
               (pts.length ? `&waypoints=${pts.join("%7C")}` : "") + `&travelmode=driving`;
      };
      h += R.map((d, i) => `
        <details class="trip-day"${i === openIx ? " open" : ""} data-tdd="${i}">
          <summary>
            <span class="td-n${done.has(i) ? " done" : ""}">${done.has(i) ? "✓" : (R.length > 1 ? i + 1 : d.chip || "1")}</span>
            <span class="td-t"><strong>${esc(d.name)}</strong>${d.sub ? `<small>${esc(d.sub)}</small>` : ""}</span>
            <span class="td-chips">${d.drive ? `<span class="td-drive">🚗 ${esc(d.drive)}</span>` : ""}${d.cost ? `<span class="td-cost">${esc(d.cost)}</span>` : ""}</span>
          </summary>
          <div class="td-body">
            ${d.stops.map(s => {
              // A stop that maps to a spot gets TWO taps: the name opens the
              // spot's own sheet (all its info, photos, tips), the 📍 opens
              // Google Maps. Locked spots render as plain text, nothing leaks.
              const sp = spotOf(s.spot);
              const title = sp
                ? `<button type="button" class="ts-link" data-spot="${esc(sp.id)}">${s.icon ? s.icon + " " : ""}${esc(s.title)}</button>`
                : `<span class="ts-title">${s.icon ? s.icon + " " : ""}${esc(s.title)}</span>`;
              const pin = sp && sp.mapUrl
                ? ` <a class="ts-pin" href="${sp.mapUrl}" target="_blank" rel="noopener" aria-label="Open in Google Maps">📍</a>` : "";
              return `<div class="ts${s.hl ? " hl" : ""}">
                <span class="ts-t">${esc(s.t || "")}</span>
                <span class="ts-rail" aria-hidden="true"></span>
                <span class="ts-main">
                  <span class="ts-titlerow">${title}${pin}</span>
                  ${s.note ? `<span class="ts-note">${esc(s.note)}</span>` : ""}
                </span>
                ${s.omr ? `<span class="ts-omr">${esc(fmtOMR(s.omr))}</span>` : `<span class="ts-omr free"></span>`}
              </div>`;
            }).join("")}
            ${dayDriveUrl(d) ? `<a class="routego" href="${dayDriveUrl(d)}" target="_blank" rel="noopener">🧭 Drive this day, every stop in one route</a>` : ""}
            ${d.sleep ? `<div class="ts-sleep">🌙 ${esc(d.sleep)}</div>` : ""}
            ${d.swap ? `<div class="ts-swap">🔀 ${esc(d.swap)}</div>` : ""}
            <button type="button" class="td-done${done.has(i) ? " on" : ""}" data-tdone="${i}">
              ${done.has(i) ? "✓ Day done, tap to undo" : "Did this day? Tick it off"}
            </button>
          </div>
        </details>`).join("");
      const rc = item.receipt;
      if (rc) {
        h += `<div class="receipt">
          <div class="rc-head"><span>🧾 What this trip actually costs</span>${rc.checked ? `<span class="rc-chk">prices checked ${esc(rc.checked)}</span>` : ""}</div>
          ${rc.rows.map(r => `<div class="rc-row"><span>${esc(r[0])}</span><i></i><b>${esc(fmtOMR(r[1]))}</b></div>`).join("")}
          ${rc.splits ? `<div class="rc-splits">` + rc.splits.map(s =>
            `<div class="rc-split"><b>${esc(s[1])}</b><span>${esc(s[0])}</span></div>`).join("") + `</div>` : ""}
          ${rc.note ? `<p class="rc-note">${esc(rc.note)}</p>` : ""}
        </div>`;
        /* The moment of highest intent in the whole app: someone has just read
           a complete free plan, costs and all, and liked it. Until now that
           moment had no ask at all. Only on the FREE plans, and never to
           someone who already owns the guide. */
        if (item.free && !Unlock.hasBundle()) {
          const others = (D.itineraries || []).filter(i => !i.free);
          if (others.length) {
            h += `<div class="afterplan">
              <strong>Liked this one?</strong>
              <p>The ${others.map(i => esc(i.name.replace(/^The\s+/i, ""))).join(" and the ")} work
                 exactly like this: same timeline, same tappable stops, same receipt at the bottom.</p>
              ${D.meta.freeLaunch
                ? `<span class="ap-note">🎁 Free right now, everything is unlocked during launch.</span>`
                : `<button type="button" class="btn-full ap-buy">Unlock them, ${esc(D.meta.bundlePrice)}</button>`}
            </div>`;
          }
        }
      }
      if (aff.hotel) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.hotel)}" target="_blank" rel="noopener">Book the stays on this route →</a>`;
      if (aff.car) h += `<a class="affbtn" data-spot="${esc(item.id)}" href="${affLink(aff.car)}" target="_blank" rel="noopener">Rent a car →</a>`;

    } else if (isItin && days) {
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

    /* THE MAINTENANCE PROMISE, not a liability disclaimer.

       This used to read "researched from public sources and change often,
       confirm on the day", which is honest and reads like "I googled it".
       On the one line that is supposed to prove a licensed local guide
       wrote this, it handed the reader a reason to doubt every number
       above it. The facts have not changed. Who is standing behind them
       has. A promise to fix it beats an apology for maybe being wrong. */
    const checked = item.checked || D.meta.lastUpdated;
    if (item.needsFirstHand) {
      h += `<div class="verifynote warn">⚠️ Public info on this one is thin and inconsistent. Confirm access and water levels locally before you commit a day to it.</div>`;
    } else {
      h += `<div class="verifynote thin">🔄 <b>Checked ${esc(checked)}.</b> I re-check these monthly. If a fee has moved or a road has washed out, tell me and I'll fix it that week.</div>`;
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
       here are reachable from anywhere in the page without scrolling back.
       Itineraries dock too now (share is how the plans travel between
       friends); their middle slot shares the PLAN, not a map pin. Their ✓
       marks the whole trip done, and rank maths ignores it (beenSpotCount). */
    {
      const waText = isItin
        ? `${item.name}, ${item.tagline}\n${(item.route || []).length || ""} day plan from the Exploring Oman guide by @hussain_explores:\n${D.meta.storeUrl || D.meta.instagram}`
        : `${item.name}, ${item.tagline}\n📍 ${item.mapUrl || ""}\nFrom the Exploring Oman guide by @hussain_explores:\n${D.meta.storeUrl || D.meta.instagram}`;
      const wa = "https://wa.me/?text=" + encodeURIComponent(waText);

      /* THE LOUD BUTTON IS MAPS, on every sheet that can have one.

         It is the moment the guide stops being reading and starts being
         useful: the reader is standing up and going. It is also the single
         cleanest intent signal in the whole app, worth more than any scroll
         depth, so it should be the easiest thing on the screen to hit.

         For a PLAN, the useful pin is not one place, it is the whole day in
         driving order. Building that from the plan's own stops replaces what
         used to sit here for plans with no mapUrl: a second "Send this plan"
         button, right next to the share icon that already sent the plan. */
      const itinRoute = isItin ? itineraryRouteUrl(item) : null;
      const goHref = itinRoute || item.mapUrl;
      const goLabel = itinRoute ? "📍 Open the route" : "📍 Google Maps";
      const mid = goHref
        ? `<a class="dock-go" href="${goHref}" target="_blank" rel="noopener">${goLabel}</a>`
        : `<span class="dock-go dock-go-off">No pin yet</span>`;
      const I = {
        heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S3.5 15 3.5 8.9A4.9 4.9 0 0 1 12 5.6a4.9 4.9 0 0 1 8.5 3.3c0 6.1-8.5 11.6-8.5 11.6z"/></svg>`,
        tick:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.8l4.8 4.7L19.5 6.8"/></svg>`,
        pin:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5s7-6.4 7-11.5a7 7 0 1 0-14 0c0 5.1 7 11.5 7 11.5z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
        send:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10.5 13.5"/><path d="M21 3l-6.8 18-3.7-7.5L3 9.8z"/></svg>`
      };
      h += `<div class="dockbar">
        <button type="button" class="dock-ico${Store.isSaved(item.id) ? " on" : ""}" id="actSave"
          aria-label="Save this ${isItin ? "plan" : "spot"}">${I.heart}</button>
        <button type="button" class="dock-ico${Store.isBeen(item.id) ? " on" : ""}" id="actBeen"
          aria-label="Mark as ${isItin ? "trip done" : "been here"}">${I.tick}</button>
        ${mid.replace("📍 ", I.pin).replace("📲 ", I.send)}
        <a class="dock-ico dock-wa" href="${wa}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${I.send}</a>
      </div>`;
    }
    h += `</div>`;

    b.innerHTML = h;

    const apBuy = b.querySelector(".ap-buy");
    if (apBuy) apBuy.onclick = openUnlock;

    // Trip strip: a chip opens its day card and brings it into view. The
    // strip lives in normal flow (nothing sticky), so this is pure jump.
    b.querySelectorAll(".tday").forEach(btn => btn.onclick = () => {
      const dd = b.querySelector(`.trip-day[data-tdd="${btn.dataset.td}"]`);
      if (!dd) return;
      dd.open = true;
      dd.scrollIntoView({ block: "start", behavior: "smooth" });
    });

    // Timeline stop names open the spot's own sheet; closing it comes back
    // here (see sheetReturn in closeSheet).
    b.querySelectorAll(".ts-link").forEach(btn => btn.onclick = () => {
      const s = D.spots.find(x => x.id === btn.dataset.spot);
      if (!s || !isUnlocked(s)) return;
      sheetReturn = { item, scroll: $("#sheet").scrollTop };
      openSheet(s);
      $("#sheet").scrollTop = 0;
    });

    if (isItin && item.route) {
      // Tick a day off; the strip chip, the day number and the button all
      // reflect it, and the next open lands on the first unticked day.
      const doneKey = "oman_trip_" + item.id;
      b.querySelectorAll(".td-done").forEach(btn => btn.onclick = () => {
        const i = +btn.dataset.tdone;
        let arr; try { arr = JSON.parse(localStorage.getItem(doneKey) || "[]"); } catch { arr = []; }
        const on = !arr.includes(i);
        arr = on ? [...arr, i] : arr.filter(x => x !== i);
        try { localStorage.setItem(doneKey, JSON.stringify(arr)); } catch {}
        btn.classList.toggle("on", on);
        btn.textContent = on ? "✓ Day done, tap to undo" : "Did this day? Tick it off";
        const chip = b.querySelector(`.tday[data-td="${i}"]`);
        if (chip) chip.classList.toggle("done", on);
        const n = b.querySelector(`.trip-day[data-tdd="${i}"] .td-n`);
        if (n) { n.classList.toggle("done", on); n.textContent = on ? "✓" : (item.route.length > 1 ? i + 1 : (item.route[i].chip || "1")); }
        if (window.Analytics) Analytics.track("tripday", { id: item.id, day: i, on: on });
      });
      // Remember which day the traveller had open, per plan, on this phone.
      b.querySelectorAll(".trip-day").forEach(dd => dd.addEventListener("toggle", () => {
        if (dd.open) { try { localStorage.setItem("oman_tripday_" + item.id, dd.dataset.tdd); } catch {} }
      }));
      buildItinMap(item, b);
    }

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
      // Do NOT rewrite textContent here: the dock icons are inline SVG now and
      // assigning text would delete the drawing. Filled vs outline is CSS.
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
      if (on) celebrate(beenSpotCount()); else toast("Unmarked");
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
    barVisible(false);
    noteSheetOpened();            // three of these and the app has earned its ask
    $("#sheet").scrollTop = 0;
    if (window.Analytics) Analytics.track("spot", { id: item.id, cat: item.cat || "itineraries" });
  }

  // When a spot sheet was opened from a tap inside an itinerary timeline,
  // closing it returns to the itinerary (same scroll position) instead of
  // dumping the reader back on the tab. One level deep on purpose.
  let sheetReturn = null;

  function closeSheet() {
    if (sheetReturn) {
      const r = sheetReturn; sheetReturn = null;
      openSheet(r.item);
      $("#sheet").scrollTop = r.scroll || 0;
      return;
    }
    $("#sheet").hidden = true;
    $("#sheetBackdrop").hidden = true;
    document.body.style.overflow = "";
    barVisible(true);
    // The ask waits for a clear screen, so a sheet closing is its cue.
    setTimeout(maybeAsk, 350);
  }

  /* ----------------------------------------------------------------- unlock */
  function openUnlock() {
    const b = $("#modalBody");
    if (D.meta.freeLaunch) {
      b.innerHTML = `
        <h2>🎁 It's all free right now</h2>
        <div id="lbHere"></div>
        <button class="btn-full" id="doneBtn" style="margin-top:12px">Keep exploring →</button>`;
      b.querySelector("#lbHere").appendChild(launchBox());
      b.querySelector("#doneBtn").onclick = closeModal;
      $("#modalBackdrop").hidden = false;
      document.body.style.overflow = "hidden";
      barVisible(false);
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
        <button class="btn-key" id="noKeyBtn" style="margin-top:14px;width:100%">I don't have one yet, show me the guide</button>`;

      /* No price block and no email box in here. Someone who tapped "I have
         a key" is telling you they already paid; selling to them again is
         answering a question they didn't ask. One link out for the person
         who tapped it by mistake, and nothing else. */
      b.querySelector("#noKeyBtn").onclick = () => { closeModal(); location.hash = "#/shop"; };

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
    barVisible(false);
  }

  function closeModal() {
    $("#modalBackdrop").hidden = true;
    document.body.style.overflow = "";
    barVisible(true);
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
    const ix = rankIx(beenSpotCount());
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
    if (hudQuiet()) {                         // ranks turned off, never confetti
      toast(`✓ ${been} of ${total} visited`);
      return;
    }
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
    const been = beenSpotCount();
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
  /* The rank game delights some readers and irritates others ("I don't need a
     rank to walk into a wadi"). It is off by nothing and on by default, but a
     long-press on the HUD turns the whole game down to a quiet counter, and
     that choice sticks on this phone. Quiet mode also suppresses the
     rank-up confetti, see celebrate(). */
  const hudQuiet = () => { try { return localStorage.getItem("oman_hud_quiet") === "1"; } catch { return false; } };

  /* ============================================== WHERE THE RANK LIVES NOW
     The explorer HUD, the ring, the rank name and the "1 more to Visitor"
     bar, used to sit in the header on EVERY tab. It was the first thing a
     stranger saw and it read as a loyalty-card counter reading zero: it
     asked them to care about a score before they cared about Oman, and it
     occupied the most valuable strip in the app to do it.

     The feature itself is good, and it is NOT deleted. Ticking off where
     you've been is genuinely fun and the rank-up celebration lands. It is
     simply moved to the two places a score makes sense:

       · Explore, inline at the top, where the ✓ buttons actually are, and
         only once you have ticked something. At zero it says nothing.
       · About, where "how far have I got" is a fair question to ask.

     It scrolls away with the page in both, so it is never a control that
     follows you. renderHud() now only clears the header slot. */
  function renderHud() {
    const h = $("#topHud");
    if (h) { h.innerHTML = ""; h.classList.add("hud-off"); }
  }

  /* Ticking a place from the feed changes the score, and the score is in the
     PAGE now rather than the header, so it has to be re-drawn in place: the
     first ever tick has to create the strip (there was nothing to update),
     and un-ticking the last one has to remove it again. Without this, the
     scoreboard only appeared on the next full render, which felt broken at
     exactly the moment it was meant to feel rewarding. */
  function refreshRankStrip() {
    const head = $(".cat-head");
    if (!head) return;
    const cur = head.querySelector(".rankstrip");
    const next = rankStrip();
    if (cur && next) cur.replaceWith(next);
    else if (cur && !next) cur.remove();
    else if (next) head.appendChild(next);
  }

  /* The same scoreboard, as an inline block for Explore and About. */
  function rankStrip() {
    const been = beenSpotCount();
    // Nothing to score yet: a counter reading zero is not a reward, it is a
    // chore list. It appears the moment they tick their first place.
    if (!been) return null;

    const h = el("div", "hud rankstrip");
    const total = D.spots.length;
    const ix = rankIx(been);
    const floor = RANKS[ix][0];
    const next = nextRank(been);
    const pct = next ? Math.round((been - floor) / (next[0] - floor) * 100) : 100;
    const quiet = hudQuiet();

    h.classList.toggle("hud-quiet", quiet);
    /* A visible switch, not a secret. The toggle used to be a 550ms long-press
       with nothing on screen to suggest it existed, so nobody who disliked the
       rank game could find their way out of it. */
    const swap = `<button type="button" class="hud-swap" aria-label="${
      quiet ? "Show explorer ranks" : "Just count places instead of ranks"}"
      title="${quiet ? "Show explorer ranks" : "Just count places instead"}">${
      quiet ? "Ranks" : "Count"}</button>`;
    h.innerHTML = (quiet
      ? `<span class="hud-count"><b>${been}</b> of ${total} places visited</span>`
      : `<span class="hud-ring" style="--pct:${Math.max(0, Math.min(100, pct))}"><b>${been}</b></span>` +
        `<span class="hud-txt">` +
          `<strong>${esc(rankFor(been))}</strong>` +
          `<small>${next ? `${next[0] - been} more to ${esc(next[1])}` : `all ${total} explored`}</small>` +
        `</span>` +
        `<span class="hud-bar"><i style="width:${Math.max(3, Math.min(100, pct))}%"></i></span>`
      ) + swap;
    h.dataset.tier = quiet ? "0" : (ix <= 1 ? "3" : ix <= 3 ? "2" : "1");

    const flip = e => {
      if (e) e.stopPropagation();
      try { localStorage.setItem("oman_hud_quiet", hudQuiet() ? "0" : "1"); } catch {}
      const fresh = rankStrip();
      if (fresh) h.replaceWith(fresh);
      toast(hudQuiet() ? "Ranks off, just a count of places now" : "Explorer ranks back on");
    };
    h.querySelector(".hud-swap").onclick = flip;
    h.oncontextmenu = e => { e.preventDefault(); flip(); };
    return h;
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
    head.appendChild(titlerow);

    // ONE line saying what this actually is. A stranger landing on Explore saw
    // photo cards and had to open a sheet, or find the About tab (the last
    // one), before learning what the app does. This is the value proposition,
    // above the fold, on the tab everyone lands on. Explore only: the other
    // tabs are self-evident once you are inside the app.
    if (cat === "explore") {
      head.appendChild(el("p", "cat-vp",
        `${D.spots.length} places across Oman, from a licensed guide. For each one: the drive, ` +
        `the walk in, the entry fee, the right month, and whether I'd tell you to skip it.`));

      /* WHAT THE PADLOCK MEANS. The chip on a paid-but-currently-open card
         is deliberately just 🔓, because the worded version ran the kicker
         row under the ♥ and ✓. That solved the crowding and created a
         mystery: an unexplained icon on 53 cards, with a tooltip that only
         exists for people using a mouse. One line, once, at the top of the
         only tab it appears on, and the icon becomes shorthand instead of a
         puzzle. It goes away with the launch, same as the chip. */
      if (D.meta.freeLaunch && D.spots.some(s => s.free === false)) {
        const key = el("p", "vp-key");
        key.innerHTML = `<span class="chip chip-freenow chip-icon">🔓</span>
          <span>marks the ${D.spots.filter(s => s.free === false).length} places that become
          part of the paid guide. They're open to everyone while it launches.</span>`;
        head.appendChild(key);
      }
      // The scoreboard belongs where the ✓ buttons are, and nowhere else.
      // Silent until they have ticked something, and it scrolls away.
      const strip = rankStrip();
      if (strip) head.appendChild(strip);
    }

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

    /* GROUPED BY REGION, NOT BY TYPE.

       The sections used to read Wadis 16 · Beaches 15 · Mountains 12 ·
       Experiences 46, which answers "what kinds of things exist in Oman".
       Nobody plans that way. A trip is a place and a number of days: "I'm
       in Muscat for two days, then driving to Nizwa." Sorted by region, the
       first screen answers that directly, and the type chips in the filter
       row are still one tap away for anyone who really does want every wadi
       in the country at once.

       Region order is the driving order out of Muscat, not the alphabet, so
       scrolling the page is roughly scrolling the trip. */
    const REGION_ORDER = ["muscat", "coast-east", "rustaq", "dakhiliyah",
                          "sharqiyah", "batinah", "musandam", "dhofar"];
    if (!typeFilter && !query && shown.length > 12) {
      /* A heading over one card is a heading that costs more than it earns,
         so a region only gets its own section once it has THREE. Thin ones,
         plus anything with no region at all, fall into one honest bucket at
         the end rather than vanishing from the list. */
      const MIN = 3;
      const seen = REGION_ORDER.filter(r => shown.filter(i => i.region === r).length >= MIN);
      const rest = shown.filter(i => seen.indexOf(i.region) === -1);
      seen.forEach(r => {
        const grp = shown.filter(i => i.region === r);
        const h = el("div", "group-head");
        h.innerHTML = `<h2>${esc((D.regions[r] && D.regions[r].label) || REGION_SHORT[r] || r)}</h2>` +
                      `<span class="group-n">${grp.length}</span>`;
        view.appendChild(h);
        const g = el("div", "grid");
        addCards(grp, g);
        view.appendChild(g);
      });
      if (rest.length) {
        const h = el("div", "group-head");
        h.innerHTML = `<h2>Further afield</h2><span class="group-n">${rest.length}</span>`;
        view.appendChild(h);
        const g = el("div", "grid");
        addCards(rest, g);
        view.appendChild(g);
      }
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
      h.innerHTML = `<h2>${lockedShown} locked here 🔒</h2>`;
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
        <p>For every spot: the drive, the walk in, the entry fee,
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
    // giant broken-image poster at the top of the page, and put the byline
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
      h.innerHTML = `<h2>Get the full guide</h2>`;
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
        <p>One email when the guide updates.</p>
        <div class="subrow">
          <input type="email" id="subEmail" placeholder="you@email.com" autocomplete="email">
          <button class="pill" id="subBtn">Send me the new spots</button>
        </div>
        <div id="subMsg"></div>`;
      sub.querySelector("#subBtn").onclick = async () => {
        const em = sub.querySelector("#subEmail").value.trim();
        const msg = sub.querySelector("#subMsg");
        if (!/^\S+@\S+\.\S+$/.test(em)) { msg.innerHTML = `<div class="msg err">That doesn't look like an email.</div>`; return; }
        const r = await Analytics.subscribe(em, { source: "about" });
        msg.innerHTML = r.ok ? `<div class="msg ok">You're on the list. 🇴🇲</div>`
                             : `<div class="msg err">Couldn't sign you up, try again in a bit.</div>`;
      };
      foot.appendChild(sub);
    }

    // The scoreboard, here rather than in the header: "how far have I got"
    // is a fair question on the About tab and an interruption everywhere else.
    const strip = rankStrip();
    if (strip) {
      const rh = el("div", "section-head");
      rh.innerHTML = `<h3 style="margin-bottom:8px">Where you've been</h3>`;
      foot.appendChild(rh);
      foot.appendChild(strip);
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

    /* A footer. There wasn't one anywhere in the app, which is fine for a free
       hobby site and disqualifying for one that takes payments in October:
       people look for terms, refunds and a real contact before they buy.
       Deliberately tiny and plain, it is reassurance, not navigation. */
    const legal = el("div", "sitefoot");
    legal.innerHTML = `
      <div class="sf-row">
        <a href="mailto:${esc(m.email)}">Contact</a>
        <span>·</span>
        <button type="button" class="sf-link" data-legal="key">I have a key</button>
        <span>·</span>
        <button type="button" class="sf-link" data-legal="terms">Terms</button>
        <span>·</span>
        <button type="button" class="sf-link" data-legal="privacy">Privacy</button>
        <span>·</span>
        <button type="button" class="sf-link" data-legal="refund">Refunds</button>
      </div>
      <p class="sf-fine">Exploring Oman, a guide by Hussain, licensed Omani tour guide.
         Prices in Omani rial unless stated. Updated ${esc(m.lastUpdated || "monthly")}.</p>
      <div class="sf-body" hidden></div>`;
    const LEGAL = {
      terms: `<h4>Terms, in plain English</h4>
        <p>This is a travel guide, not a booking service. I don't sell tours, tickets or
        accommodation, and I'm not the operator for anything listed here.</p>
        <p>Everything is researched and re-checked monthly, but roads wash out, fees change
        and opening hours move. Confirm anything time-critical or safety-critical yourself
        on the day. <strong>Wadis flood. If it has rained upstream, don't go in.</strong>
        You travel at your own risk and are responsible for your own judgement.</p>
        <p>Buying the guide gives you a personal licence to use it on your own devices.
        Please don't republish or resell the content.</p>`,
      privacy: `<h4>Privacy</h4>
        <p>Your saved spots, been-there ticks and rank live in your own browser and are
        never sent anywhere. Clearing your browser data clears them.</p>
        <p>If you give me your email, it's used to tell you when the guide updates, and
        nothing else. No selling, no sharing, no list swaps. Reply to any email and I'll
        delete you on the spot.</p>
        <p>Payments are handled by Gumroad; your card details go to them, never to me.</p>`,
      refund: `<h4>Refunds</h4>
        <p>If the guide isn't what you expected, email me within 14 days and I'll refund
        you. No form, no argument, no "what went wrong" interrogation.</p>
        <p>One payment, no subscription, nothing to cancel. Updates are included forever.</p>`
    };
    legal.querySelectorAll(".sf-link").forEach(b => b.onclick = () => {
      const body = legal.querySelector(".sf-body");
      const key = b.dataset.legal;
      if (key === "key") return openUnlock();          // not a legal panel, a door
      if (!body.hidden && body.dataset.open === key) { body.hidden = true; return; }
      body.innerHTML = LEGAL[key];
      body.dataset.open = key;
      body.hidden = false;
      body.scrollIntoView({ block: "nearest" });
    });
    foot.appendChild(legal);

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
            <p class="credits-note">Photos from Wikimedia Commons under free licences.</p>
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

    /* THE CURTAIN HAS TO SELL, NOT APOLOGISE.

       It used to be a palm-tree emoji, the word "Salalah", a grey
       "coming soon" pill and one sentence. A reader who tapped that tab has
       just told you the single most specific thing they will ever tell you:
       they are thinking about the south. Answering with a shrug wastes the
       best-qualified visitor on the site.

       So: the COUNT is the hook and it goes big, the names do the selling
       (nobody wants "a Dhofar guide", they want Wadi Darbat and Fazayah),
       and the number is COUNTED from the data so it can never drift. Add
       five spots and this page says 35 by itself. */
    const salalah = D.spots.filter(s => s.cat === "salalah");
    const n = salalah.length;
    const T = D.meta.tiers || {};

    // Named, because a name is a picture and a category is not. Six is the
    // most that still reads as a taste rather than a list.
    const HERO = ["wadi-darbat", "fazayah-beach", "tawi-atair", "jabal-samhan",
                  "mughsail", "wadi-dawkah", "khor-rori", "ayn-khor"];
    const heroes = HERO.map(id => salalah.find(s => s.id === id)).filter(Boolean).slice(0, 6);

    const w = el("div", "soon");
    w.innerHTML = `
      <div class="soon-card">
        <div class="soon-count">
          <b>${n}+</b><span>spots</span>
          <i class="soon-palm" aria-hidden="true">🌴</i>
        </div>
        <h1>Salalah &amp; Dhofar</h1>
        <p class="soon-lead">Late June to September the khareef turns the whole coast green.
           The rest of the year, empty beaches and the frankincense coast.</p>

        ${heroes.length ? `<div class="soon-heroes">${heroes.map(s =>
          `<div class="sh"><b>${esc(s.name)}</b><small>${esc(s.tagline || "")}</small></div>`).join("")}</div>` : ""}

        <!-- "Own either one" is a purchase instruction, and during the trial
             there is nothing to own: no checkout, no prices on the site, and
             the products it names are not explained anywhere any more. The
             trial version states the two facts a reader on this tab actually
             needs: the guide is free today, and the south is coming. -->
        <div class="soon-deliver">
          ${D.meta.freeLaunch
            ? `<b>🎁 The rest of the guide is free right now.</b>
               <span>All ${D.spots.length - n} places outside Dhofar, open, nothing to enter.</span>`
            : `<b>🔑 Inside ${esc((T.basic && T.basic.name) || "The Guide")} and
               ${esc((T.premium && T.premium.name) || "The Full Kit")}.</b>
               <span>Own either one and Dhofar appears, nothing to re-buy.</span>`}
        </div>
      </div>`;
    view.appendChild(w);
    // A dead end that harvests nothing is a wasted tab. Anyone who taps Salalah
    // has told you exactly what they want; the email box already exists as a
    // component, so ask them here rather than showing a curtain and a shrug.
    if (window.Analytics) {
      // Same ask as everywhere else, dates included. Anyone tapping Salalah
      // has already told you what they want; the khareef is a six-week
      // window, so WHEN they're coming decides whether this email is worth
      // sending at all.
      const cap = el("div", "soon-capture");
      cap.appendChild(tripCapture({
        title: "Want it the day it lands?",
        lead: "The khareef is a six-week window and it is the reason to come south. " +
              "Tell me when you're going and I'll have Dhofar with you before it.",
        cta: "Tell me when it lands",
        done: "Done. You'll hear from me when Salalah lands. 🌴",
        source: "salalah"
      }));
      view.appendChild(cap);
    }
  }

  /* ============================================================== THE SHOP
     #/shop. Everything that costs money, in one place, in one order.

     Why a screen and not a sixth tab: the bottom bar already carries five,
     which is the most a phone can hold without the labels turning to mush,
     and a shop tab would compete with Plan for the same thumb. This is
     reached from the header button, the sticky bar and every lock in the
     app, which between them are far more entrances than a tab would be.

     Three products, cheapest first, because a ladder only works upward:
       $2.99  one plan          →  $9.99  the Guide  →  $19.99  the Full Kit
     and then the one thing no download can do: me, on WhatsApp.

     HONESTY RULE, and it is not optional: while meta.freeLaunch is on the
     whole guide really is free, so this screen says so at the top and every
     price is labelled as what it becomes in October. Showing a price for
     something a reader can already have for nothing is how you lose them. */

  // A live Gumroad link, or null while the permalink is still a placeholder.
  function buyUrl(name) {
    const u = (D.meta.buyLinks || {})[name] || "";
    return /^https?:/i.test(u) && !/\/l\/YOUR-/i.test(u) ? u : null;
  }

  function productCard(o) {
    const c = el("div", "prod" + (o.cls ? " " + o.cls : ""));
    c.innerHTML = `
      <div class="prod-head">
        <div class="prod-name">
          <h3>${esc(o.name)}</h3>
          ${o.badge ? `<span class="prod-badge${o.badgeCls ? " " + o.badgeCls : ""}">${esc(o.badge)}</span>` : ""}
        </div>
        <div class="prod-price"><b>${esc(o.price)}</b><small>${esc(o.priceSub || "one time")}</small></div>
      </div>
      ${o.lead ? `<p class="prod-lead">${esc(o.lead)}</p>` : ""}
      <ul class="prod-list">${(o.items || []).map(i => `<li>${i}</li>`).join("")}</ul>
      ${(o.nots || []).length ? `<ul class="prod-list prod-nots">${o.nots.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}
      <div class="prod-action"></div>
      ${o.fine ? `<p class="prod-fine">${o.fine}</p>` : ""}`;
    const slot = c.querySelector(".prod-action");

    if (o.url) {
      const a = el("a", "btn-buy gold", o.cta);
      a.href = o.url; a.target = "_blank"; a.rel = "noopener";
      slot.appendChild(a);
    } else {
      // Not sellable yet. The button opens the date capture right here
      // rather than going nowhere, so the reader's interest is caught at
      // the exact moment they had it.
      const b = el("button", "btn-buy gold", o.cta);
      const box = el("div", "prod-capture");
      box.hidden = true;
      b.onclick = () => {
        if (window.Analytics) Analytics.track("product_click", { product: o.track || o.name });
        if (!box.children.length) {
          box.appendChild(tripCapture({
            lead: o.captureLead || "Tell me when you're coming and I'll email you the moment it opens, at the founding price.",
            cta: o.captureCta || "Give me the Full Kit first",
            source: o.track || "shop"
          }));
        }
        box.hidden = false;
        b.hidden = true;
        const inp = box.querySelector("#capEmail");
        if (inp) inp.focus({ preventScroll: true });
      };
      slot.appendChild(b);
      slot.appendChild(box);
    }
    return c;
  }

  /* The shop, compressed to one card. Lives at the foot of the Plan tab and
     anywhere else that needs to point at the prices without becoming a price
     list itself. Three rows, three numbers, one tap. */
  function shopTeaser() {
    const m = D.meta, T = m.tiers || {};
    const b = T.basic || {}, p = T.premium || {};
    const w = el("div", "shopteaser");

    /* TRIAL: no numbers on the landing screen. This block exists to point at
       the prices, and during the trial there are none to point at, so it
       points at the only ask there is. Four dollar amounts under a banner
       reading "everything is free" is the fastest way to make a reader stop
       believing the banner. */
    if (m.freeLaunch) {
      w.innerHTML = `
        <h3>Planning a trip?</h3>
        <div class="st-rows">
          <div class="st-row"><b>Free</b><span>All ${D.spots.length} places, the whole guide, right now</span></div>
          <div class="st-row"><b>${esc(plansOpenDate())}</b><span>The full routes, hour by hour, open then</span></div>
          <div class="st-row st-svc"><b>You</b><span>I plan the whole trip with you, on WhatsApp</span></div>
        </div>
        <button type="button" class="btn-full st-go">Tell me when you're coming →</button>`;
      w.querySelector(".st-go").onclick = () => (location.hash = "#/shop");
      return w;
    }

    w.innerHTML = `
      <h3>Four ways to get it</h3>
      <div class="st-rows">
        <div class="st-row"><b>${esc(m.itineraryPrice)}</b><span>One plan on its own</span></div>
        <div class="st-row"><b>${esc(m.plansBundlePrice)}</b><span>All three plans${(() => {
          // same arithmetic as the shop, same rule: derived, never typed
          const s = m.itineraryPriceNum || 0, b = m.plansBundlePriceNum || 0;
          if (!s || !b || s * 3 <= b) return " together";
          const x = b - s * 2;
          const money = v => "$" + (Math.abs(v % 1) < 0.005 ? v.toFixed(0) : v.toFixed(2));
          return x <= 0.005 ? ", the third one free" : ", the third one for " + money(x);
        })()}</span></div>
        <div class="st-row"><b>${esc(b.price || m.bundlePrice)}</b><span>${esc(b.name || "The Guide")}, every locked spot and Salalah</span></div>
        <div class="st-row"><b>${esc(p.price || "$19.99")}</b><span>${esc(p.name || "The Full Kit")}, the big routes and the Planner</span></div>
        <div class="st-row st-svc"><b>You</b><span>I plan the whole trip with you, on WhatsApp</span></div>
      </div>
      <button type="button" class="btn-full st-go">Show me what's in each →</button>`;
    w.querySelector(".st-go").onclick = () => (location.hash = "#/shop");
    return w;
  }

  function renderShop() {
    clearView();
    const m = D.meta;
    const T = m.tiers || {};
    const basic = T.basic || {}, prem = T.premium || {};
    const locked = D.spots.filter(s => !s.free).length;
    const freeSpots = D.spots.length - locked;
    const plans = D.itineraries || [];
    const paidPlans = plans.filter(p => !p.free);
    const inBasic = m.basicItineraries || [];
    const nameOf = id => { const p = plans.find(x => x.id === id); return p ? p.name.replace(/^The\s+/i, "") : id; };

    /* ===================================================== THE TRIAL SCREEN
       During the free trial this screen is NOT a shop, and the button that
       reaches it says "Planning a trip?", not "Buy". A price list is an
       answer to a question nobody asked yet: there is no checkout to send
       anyone to, every spot is already free, and the three routes that do
       cost money are not on sale until they open. Four product cards in
       that state are four ways to say "not yet" to someone who arrived
       willing to say yes to something.

       So the room holds exactly two things: the one question worth asking a
       stranger (WHEN ARE YOU COMING?), and the one thing that is genuinely
       available today (Hussain himself, on WhatsApp).

       The whole shop is still below, untouched, and comes back the moment
       meta.freeLaunch goes false. Nothing here is deleted, it is deferred. */
    if (m.freeLaunch) {
      const th = el("div", "cat-head shop-head");
      th.innerHTML = `<h1>Planning a trip?</h1>
        <p class="shop-sub">Tell me when you're coming and I'll make sure you have
           everything you need before you fly.</p>`;
      view.appendChild(th);

      view.appendChild(el("div", "shop-free",
        `<strong>🎁 The whole guide is free right now.</strong> All
         ${D.spots.length} places, nothing to pay and nothing to enter.
         The ${paidPlans.length} full routes open on
         <strong>${esc(plansOpenDate())}</strong>.`));

      view.appendChild(tripCapture({
        lead: `Leave your dates and I'll send the ${paidPlans.length} routes the day they open, ` +
              `and tell you anything that changes before your trip.`,
        cta: "Send it to me",
        done: "You're on the list. 🇴🇲",
        source: "trial-ask"
      }));

      // The three routes, named, so the date has something attached to it.
      if (paidPlans.length) {
        const soon = el("div", "prod");
        soon.innerHTML = `<div class="prod-head"><div class="prod-name">
            <h3>Opening ${esc(plansOpenDate())}</h3></div></div>
          <ul class="prod-list">${paidPlans.map(p =>
            `<li><b>${esc(p.name.replace(/^The\s+/i, ""))}</b>, ${esc(p.tagline || "")}</li>`).join("")}</ul>`;
        view.appendChild(soon);
      }

      view.appendChild(el("div", "shop-or", "or, the thing an app can't do"));
      view.appendChild(bookBox({ source: "trial" }));

      const tout = el("div", "shop-exit");
      const tback = el("button", "btn-full", "← Take me back to the places");
      tback.onclick = () => (location.hash = "#/explore");
      tout.appendChild(tback);
      const tplan = el("button", "pill pill-ghost", "Show me the free 1-day plan");
      tplan.onclick = () => {
        const f = plans.find(p => p.free);
        if (f) openSheet(f); else location.hash = "#/plan";
      };
      tout.appendChild(tplan);
      view.appendChild(tout);
      return;
    }

    const head = el("div", "cat-head shop-head");
    head.innerHTML = `<h1>Get the guide</h1>
      <p class="shop-sub">Four ways to use this, from one day plan to a route I write for you by hand.</p>`;
    view.appendChild(head);

    /* ---- 1. the Guide, $9.99, live ------------------------------------- */
    view.appendChild(productCard({
      name: basic.name || "The Guide",
      price: basic.price || m.bundlePrice,
      badge: "Most people want this",
      badgeCls: "best",
      track: "basic",
      lead: "The whole country, unlocked. The one to buy if you're coming once and want to get it right.",
      items: [
        `<b>All ${locked} locked spots.</b> The remote wadis, the empty beaches, the mountain villages. ${freeSpots} more stay free either way.`,
        `<b>Salalah and Dhofar included.</b> The khareef coast, Wadi Darbat, the frankincense trail and the empty beaches west, the day the tab opens. No second purchase.`,
        `<b>${esc(nameOf("escape-3day"))}</b>, hour by hour, with the costs receipt.`,
        `<b>Every future update.</b> New spots and re-checked prices monthly. No subscription, nothing to renew.`,
        `<b>Works with no signal.</b> Install it once and the whole guide, photos included, opens in a wadi with no bars.`
      ],
      // Name EVERY route to the thing being withheld. This used to offer two
      // ways in and there are three, so it quietly hid the cheapest one.
      nots: paidPlans.filter(p => inBasic.indexOf(p.id) === -1)
        .map(p => `Not included: <b>${esc(p.name.replace(/^The\s+/i, ""))}</b>. ` +
                  `${esc(m.itineraryPrice)} on its own, ${esc(m.plansBundlePrice)} with the other two, or in the Full Kit.`),
      url: buyUrl("basic") || buyUrl("bundle"),
      cta: (buyUrl("basic") || buyUrl("bundle")) ? `Get the Guide, ${basic.price}`
           : m.freeLaunch ? "Lock my founding price" : "Tell me when it opens",
      captureLead: "Checkout is being switched on. Tell me when you're coming and I'll send you the key myself, at the founding price, before you fly.",
      fine: "One key. Works on any phone, paste it again if you switch."
    }));

    /* ---- 2. the Full Kit, $19.99, October ------------------------------ */
    view.appendChild(productCard({
      name: prem.name || "The Full Kit",
      price: prem.price,
      badge: "Opens " + (prem.opens || "October"),
      badgeCls: "soon",
      cls: "prod-prem",
      track: "premium",
      lead: "Everything in the Guide, plus the two big routes and the machine that builds your own.",
      items: [
        `<b>Everything in ${esc(basic.name || "the Guide")}</b>, Salalah included.`,
        ...paidPlans.filter(p => inBasic.indexOf(p.id) === -1)
          .map(p => `<b>${esc(p.name.replace(/^The\s+/i, ""))}</b>, ${esc(p.tagline || "")}`),
        `<b>The trip Planner.</b> Answer four questions and it builds your route: days clustered by region so you never backtrack, real drive times, heat-smart starts, every stop pinned.`,
        `<b>Every future update</b>, same as the Guide. One payment, nothing to renew.`
      ],
      url: buyUrl("premium"),
      cta: buyUrl("premium") ? `Get the Full Kit, ${prem.price}` : `Give me the Full Kit first`,
      captureLead: "Leave your dates and you get the Full Kit first, at the founding price.",
      fine: "One payment, no subscription. Every update after it is free."
    }));

    /* ---- 3. the plans: all three, or one at a time ----------------------
       THE BADGE IS COMPUTED, NEVER TYPED. It was hardcoded "Cheaper than
       two" while the bundle was $7 against $5.98 for two singles, which was
       simply false, and false in the one place on the site where a reader
       is deciding whether to trust a number. A claim about two prices has
       to be derived from those two prices or it becomes a lie the first
       time either one moves.

       So: it reads "3 for the price of two" only while that is
       arithmetically true, and otherwise states the real saving against
       buying them one at a time. If there is no saving it says nothing at
       all, which is the correct thing for a bundle that isn't one. */
    {
      const box = el("div", "prod prod-singles");
      const bundleUrl = buyUrl("itin-all");
      const ownsAll = !m.freeLaunch && paidPlans.every(p => isUnlocked(p));

      /* THE HOOK IS "THE THIRD ONE FOR A DOLLAR", and it is arithmetic, not
         a slogan. "Save $1.98" compares against $8.97, a number almost
         nobody was ever going to pay: buying three plans one at a time is
         not a thing people do. The decision a reader is actually making is
         "I want two of these", and against two singles the bundle costs a
         dollar. Same money, a comparison they are really running.

         Everything below is derived from the two prices, so no wording here
         can outlive a price change:
           extra <= 0   the third is free, say so
           extra small  name it: "3rd plan for $1"
           no saving    say nothing, because there is nothing to say */
      const single = m.itineraryPriceNum || 0;
      const bundle = m.plansBundlePriceNum || 0;
      const n = paidPlans.length || 3;
      const twoCost = single * 2;
      const extra = bundle - twoCost;          // what the LAST plan costs you
      const saved = single * n - bundle;
      const money = v => "$" + (Math.abs(v % 1) < 0.005 ? v.toFixed(0) : v.toFixed(2));

      let badge = "", leadTail = "";
      if (single && bundle && saved > 0) {
        if (extra <= 0.005) {
          badge = `${n} for the price of two`;
          leadTail = ` Two on their own already cost ${money(twoCost)}, so the third is free.`;
        } else {
          badge = `3rd plan for ${money(extra)}`;
          leadTail = ` Two on their own cost ${money(twoCost)}. The third one is ${money(extra)}.`;
        }
      }

      box.innerHTML = `
        <div class="prod-head">
          <div class="prod-name">
            <h3>${esc((T.plans && T.plans.name) || "All three plans")}</h3>
            ${badge ? `<span class="prod-badge best">${esc(badge)}</span>` : ""}
          </div>
          <div class="prod-price"><b>${esc(m.plansBundlePrice)}</b><small>all three</small></div>
        </div>
        <p class="prod-lead">Every paid route: the 3-day, the 5-day and the 7-day, hour by hour,
           each with its costs receipt.${leadTail}</p>
        <div class="prod-action" id="plansAct"></div>`;

      const act = box.querySelector("#plansAct");
      if (ownsAll) {
        act.appendChild(el("p", "prod-fine", "✓ You already have all three."));
      } else if (bundleUrl) {
        const a = el("a", "btn-buy gold", `Give me all three, ${m.plansBundlePrice}`);
        a.href = bundleUrl; a.target = "_blank"; a.rel = "noopener";
        act.appendChild(a);
      } else {
        const b = el("button", "btn-buy gold", `Give me all three, ${m.plansBundlePrice}`);
        b.onclick = () => {
          if (window.Analytics) Analytics.track("product_click", { product: "itin-all" });
          openCapture(null, {
            title: "All three plans, " + m.plansBundlePrice,
            lead: "Checkout is being switched on. Tell me when you're coming and I'll send the three routes before you fly, at the founding price.",
            cta: "Send me all three",
            source: "plans-bundle"
          });
        };
        act.appendChild(b);
      }

      box.appendChild(el("div", "shop-or", `or one on its own, ${m.itineraryPrice}`));
      const row = el("div", "single-row");
      /* "Yours" means BOUGHT, not "open because everything is open this
         month". During the free launch every plan is readable, and tagging
         them all ✓ yours on a screen headed $2.99 each reads as a bug. They
         show their price and open on tap, which is the honest version of
         both facts at once. */
      const owns = p => !m.freeLaunch && isUnlocked(p);
      paidPlans.forEach(p => {
        const url = buyUrl("itin-" + p.id);
        const open = isUnlocked(p);                    // readable right now
        const toShop = !open && !!url;                 // send them to checkout
        const b = el(toShop ? "a" : "button", "single" + (owns(p) ? " single-own" : ""));
        b.innerHTML = `<b>${esc(p.name.replace(/^The\s+/i, ""))}</b>
                       <small>${esc((p.stats && p.stats.Days ? p.stats.Days + " days · " : "") + (p.tagline || ""))}</small>
                       <span class="single-price">${owns(p) ? "✓ yours" : m.freeLaunch ? "free now" : esc(m.itineraryPrice)}</span>`;
        if (toShop) {
          b.href = url; b.target = "_blank"; b.rel = "noopener";
        } else if (open) {
          b.onclick = () => openSheet(p);
        } else {
          b.onclick = () => { if (window.Analytics) Analytics.track("product_click", { product: "itin:" + p.id }); openCapture(p.name); };
        }
        row.appendChild(b);
      });
      box.appendChild(row);
      const freePlan = plans.find(p => p.free);
      if (freePlan) {
        const s = el("p", "prod-fine",
          `<b>${esc(freePlan.name)}</b> is free and always will be: same timeline, same map, same receipt as the paid ones. Read it before you spend anything.`);
        s.style.cursor = "pointer";
        s.onclick = () => openSheet(freePlan);
        box.appendChild(s);
      }
      view.appendChild(box);
    }

    /* ---- 4. plan my trip for me ---------------------------------------- */
    view.appendChild(el("div", "shop-or", "or, the thing an app can't do"));
    view.appendChild(bookBox({ source: "shop" }));

    /* ---- 5. the key, and the way out -----------------------------------
       No email box down here. Three products, a WhatsApp and a service is
       already four asks; a fifth one, at the bottom, aimed at the reader
       who has just declined all four, reads as pleading. The gated ask
       catches them elsewhere.

       And an EXIT. A shop with no door out is a trap: the reader who
       decides "not today" has to hunt the bottom bar for a way back to the
       thing they were enjoying. That is the moment they close the tab. */
    const kb = el("button", "btn-key", "I already have my key");
    kb.onclick = openUnlock;
    view.appendChild(kb);

    const out = el("div", "shop-exit");
    out.innerHTML = `<p>Not today? Nothing here expires, and
      ${D.spots.filter(s => s.free).length} places stay free either way.</p>`;
    const back = el("button", "btn-full", "← Take me back to the places");
    back.onclick = () => (location.hash = "#/explore");
    out.appendChild(back);
    const plan = el("button", "pill pill-ghost", "Show me the free 1-day plan");
    plan.onclick = () => {
      const f = (D.itineraries || []).find(p => p.free);
      if (f) openSheet(f); else location.hash = "#/plan";
    };
    out.appendChild(plan);
    view.appendChild(out);
  }

  /* The date capture as a modal, for the places that have no room for it:
     a $2.99 plan tile, a lock row, and the one earned interruption. */
  function openCapture(what, o) {
    o = o || {};
    const b = $("#modalBody");
    b.innerHTML = "";
    b.appendChild(el("h2", null, esc(o.title || what || "Tell me when you're coming")));
    b.appendChild(tripCapture({
      lead: o.lead || ((what ? "<b>" + esc(what) + "</b> is part of the paid guide. " : "") +
            "Leave your dates and you get it first, at the founding price."),
      cta: o.cta || "Save my founding price",
      source: o.source || (what ? "capture-modal" : "earned-ask")
    }));
    const done = el("button", "btn-full", "Keep exploring →");
    done.style.marginTop = "12px";
    done.onclick = closeModal;
    b.appendChild(done);
    $("#modalBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    barVisible(false);
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
        <div class="lock-pill">${D.meta.freeLaunch ? `Opens ${esc(plansOpenDate())}` : "Part of the full guide"}</div>
        <p class="lock-lead">Answer four questions and it builds your route:
           day by day, in driving order, around your pace.</p>
        <ul class="lock-feats">
          <li>Days clustered by region, so you never backtrack</li>
          <li>Real drive times between every stop</li>
          <li>Heat-smart starts: 06:30 in summer, hot spots in the cool hours</li>
          <li>Every stop pinned in Google Maps, the whole route on one map</li>
        </ul>
        <!-- "Part of the Full Kit" names a product that, during the trial,
             is not on sale and is no longer explained anywhere: the shop is
             a date capture now. An orphan product name is worse than a plain
             date, so while the trial runs it says the date, same as the
             three routes, and the product name returns with the shop. -->
        <p class="lock-when">${D.meta.freeLaunch
          ? `Opens ${esc(plansOpenDate())}, with the routes.`
          : "Part of the Full Kit."}</p>

        <!-- A locked feature nobody can sample is just a promise. This is one
             real day of real output from the Planner, so the reader can judge
             the thing instead of taking the bullet points on faith. -->
        <div class="lock-demo">
          <div class="ld-head">A day it built, for real</div>
          <div class="ld-meta">3 days · March · wadis + culture · no 4×4 · moderate pace</div>
          <div class="ld-day">
            <div class="ld-row"><span>07:40</span><b>Leave Muscat</b><i>Route 17 east</i></div>
            <div class="ld-row"><span>09:10</span><b>Bimmah Sinkhole</b><i>1 hr, before the coaches</i></div>
            <div class="ld-row hot"><span>10:45</span><b>Wadi Shab</b><i>3 hrs · moved earlier, March heat</i></div>
            <div class="ld-row"><span>14:20</span><b>Lunch, Tiwi</b><i>on the route, not a detour</i></div>
            <div class="ld-row"><span>16:00</span><b>Fins Beach</b><i>sunset side of the road</i></div>
            <div class="ld-row sleep"><span>🌙</span><b>Sleep near Sur</b><i>tomorrow starts east</i></div>
          </div>
          <p class="ld-note">It picked the order, the times and the bed, then checked the
             drive between each one. Change any answer and the whole day rebuilds.</p>
        </div>`;
      view.appendChild(p);
      // Plan is the LANDING screen now, so it must not also be the shop: a
      // stranger's first impression cannot be a price list. One line, three
      // prices, one tap through to the room where they're explained.
      view.appendChild(shopTeaser());
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
    fine.appendChild(question("Logistics", "4×4 and swimming decide half the list.", w => {
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

    // itin-grid centres its tracks: with four plans in a three-up row the
    // fourth was stranded hard against the left edge instead of sitting under
    // the middle of the row above.
    const grid = el("div", "grid itin-grid");
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
        <p>${plan.missed.map(s => esc(s.name)).join(" · ")}. Add a day, or catch them next trip.</p>`;
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
      box.innerHTML = `<strong>Sort the basics</strong>`;
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
      note.innerHTML = `<p>🔒 <strong>${hiddenCount} more pins</strong> appear here when you unlock.</p>`;
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
    visa: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="5" width="28" height="38" rx="4"/><circle cx="24" cy="19" r="6"/><path d="M16 33h16M16 38h10"/><path d="M20.5 19l2.5 2.5 4.5-4.5" stroke-width="2.2"/></svg>`,
    plane: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5c1.9 0 3 2.6 3 7.2V19l14 8.4v3.9l-14-4.1v8.3l4.2 3.4V43L24 40.6 16.8 43v-4.1l4.2-3.4v-8.3l-14 4.1v-3.9L21 19v-6.8C21 7.6 22.1 5 24 5z"/></svg>`,
    idp: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="40" height="26" rx="4"/><circle cx="16" cy="21.5" r="4.2"/><path d="M9.5 31.5c1.5-3.1 3.8-4.6 6.5-4.6s5 1.5 6.5 4.6"/><path d="M29 19h10M29 24.5h10M29 30h6.5"/></svg>`,
    border: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 41V15"/><circle cx="10" cy="10.5" r="3.4"/><path d="M14 19.5l28-6.6v7.2l-28 6.6z"/><path d="M21 17.9l1.7 5.9M28 16.2l1.7 5.9M35 14.6l1.7 5.9" opacity=".55"/></svg>`
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

  /* The itinerary overview map: every day's stops joined in visit order, one
     colour per day, numbered dots, straight lines on purpose (the 🧭 button
     on each day has the turn-by-turn). Leaflet loads on demand; offline the
     box collapses to one quiet line and nothing else breaks. */
  function buildItinMap(item, root) {
    const wrap = root.querySelector("[data-itinmap]");
    if (!wrap) return;
    const days = item.route.map((d, i) => ({
      color: DAY_COLORS[i % DAY_COLORS.length],
      pts: d.stops.map(s => {
        const sp = s.spot && D.spots.find(x => x.id === s.spot);
        return (sp && isUnlocked(sp) && sp.coords) ? { c: sp.coords, name: sp.name } : null;
      }).filter(Boolean)
    })).filter(d => d.pts.length);
    if (!days.length) { wrap.remove(); return; }
    loadLeaflet().then(L => {
      wrap.innerHTML = "";
      const map = L.map(wrap, { scrollWheelZoom: false, zoomControl: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      const bounds = [];
      let n = 0;
      days.forEach(d => {
        if (d.pts.length > 1) L.polyline(d.pts.map(p => p.c), { color: d.color, weight: 3, opacity: .7 }).addTo(map);
        d.pts.forEach(p => {
          n++;
          L.marker(p.c, { icon: L.divIcon({ className: "itin-dot", html: `<span style="background:${d.color}">${n}</span>`, iconSize: [22, 22], iconAnchor: [11, 11] }) })
            .addTo(map).bindPopup(esc(p.name));
          bounds.push(p.c);
        });
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [26, 26], maxZoom: 12 });
    }).catch(() => {
      wrap.classList.add("mapwrap-fallback");
      wrap.innerHTML = `<p class="map-loading">The map loads online. Each day's 🧭 route button below still works.</p>`;
    });
  }

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

  /* WHERE A STRANGER LANDS. It used to be Explore, which opens on 138 cards:
     impressive, and the wrong answer to the question they actually arrived
     with. Nobody's first thought is "show me a hundred and thirty-eight
     things"; it is "I have four days, what do I do with them". Plan answers
     that, and Explore is one tap away in the bar for anyone who'd rather
     browse. Change this one word to move the front door. */
  const HOME = "plan";

  let lastCat = null;
  function route() {
    let cat = location.hash.replace("#/", "") || HOME;

    /* The shop is a screen, not a tab: it has no slot in the bottom bar (five
       is already the most a phone fits) and it keeps whichever tab you came
       from highlighted, so buying never feels like leaving the guide. */
    if (cat === "shop") {
      applyRankTheme(); renderHud(); renderTabs(lastCat || HOME); renderUnlockBtn();
      renderShop();
      renderStickyBar();
      window.scrollTo(0, 0);
      return;
    }

    if (!D.categories.find(c => c.id === cat) && LEGACY[cat]) cat = LEGACY[cat];
    const known = D.categories.find(c => c.id === cat) ? cat : HOME;
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
    renderStickyBar();
    window.scrollTo(0, 0);
  }

  /* ========================================================= THE STICKY BAR
     The page is 22,000 pixels tall and, until this existed, the only thing
     asking for anything sat at the very top of it, scrolled out of sight one
     flick after landing. A reader thirty spots deep is the most interested
     person on the site and had nothing to press.

     Rules it obeys, all of them learned the expensive way:
       - it sits ABOVE the bottom tab bar, never over it. The tab bar is
         navigation and must never be covered.
       - it is not "a control that follows the scroll" in the sense he hates:
         the FILTER row must stay put, because losing your place in a list is
         maddening. This is a single ask, one line tall, and it is the only
         fixed thing besides the nav.
       - closing it closes it for the session. Asked once, refused once,
         that's an answer.
       - it never appears over the shop (you're already there), over the
         welcome, or while a sheet or modal is open.
       - anyone who already owns something never sees it at all. */
  let barDismissed = false;
  try { barDismissed = sessionStorage.getItem("oman_bar_off") === "1"; } catch {}

  /* ================================================== THE EARNED ASK
     Nothing asks a stranger for anything until they have shown the app is
     worth something to them. The old order was backwards: the welcome
     offered a choice and a gold bar slid up over it before the reader had
     read one word, so the first thing the app did was interrupt the first
     thing the app asked. Two competing asks, zero earned.

     The gate: THREE spot sheets opened, or SIXTY seconds on the page.
     Either one proves the reader is reading rather than bouncing. Then,
     once, the ask arrives as a modal; the sticky bar stays afterwards as
     the quiet reminder. Both are silent until the gate opens, and both stay
     silent while the welcome, a sheet or a modal is on screen.

     Asked once, refused once, gone for the session. */
  const GATE_SHEETS = 3, GATE_SECONDS = 60;
  let sheetsOpened = 0, gateOpen = false, askShown = false;
  try { askShown = localStorage.getItem("oman_asked") === "1"; } catch {}

  function openGate(why) {
    if (gateOpen) return;
    gateOpen = true;
    if (window.Analytics) Analytics.track("ask_earned", { via: why, sheets: sheetsOpened });
    maybeAsk();
    renderStickyBar();
  }
  function noteSheetOpened() {
    if (++sheetsOpened >= GATE_SHEETS) openGate("sheets");
  }
  setTimeout(() => openGate("time"), GATE_SECONDS * 1000);

  /* The one interruption in the app, and it waits its turn: if a sheet or
     the welcome is open it does nothing and tries again when they close. */
  function maybeAsk() {
    if (askShown || !gateOpen) return;
    if (Unlock.isAnythingOwned()) return;
    if (document.querySelector(".welcome")) return;
    if (!$("#sheet").hidden || !$("#modalBackdrop").hidden) return;
    if ((location.hash.replace("#/", "") || "") === "shop") return;   // already there
    askShown = true;
    try { localStorage.setItem("oman_asked", "1"); } catch {}
    openCapture(null, {
      title: "Before you scroll on",
      lead: "You've read a few of these, so here's the one thing I'll ask for. " +
            "Tell me when you're coming and I'll send the guide before you fly, " +
            "at the founding price.",
      cta: "Send it to me before I fly"
    });
  }

  function renderStickyBar() {
    const old = $("#stickyCta");
    if (old) old.remove();
    document.documentElement.style.removeProperty("--bar-space");
    if (barDismissed) return;
    if (!gateOpen) return;                                        // not earned yet
    if (document.querySelector(".welcome")) return;               // never over the welcome
    if (Unlock.isAnythingOwned() && !D.meta.freeLaunch) return;   // they've bought
    if ((location.hash.replace("#/", "") || "") === "shop") return;

    const svc = D.meta.planService || {};
    const bar = el("div", "stickycta");
    bar.id = "stickyCta";
    bar.innerHTML = `
      <button type="button" class="sc-main">
        <span class="sc-txt">
          <b>Planning a trip?</b>
          <small>Tell me your dates, I'll send the guide before you fly</small>
        </span>
        <span class="sc-go" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5.5L18.5 12 12 18.5"/></svg>
        </span>
      </button>
      <button type="button" class="sc-x" aria-label="Hide this">✕</button>`;

    bar.querySelector(".sc-main").onclick = () => {
      if (window.Analytics) Analytics.track("sticky_click", { from: location.hash.replace("#/", "") || HOME });
      location.hash = "#/shop";
    };
    bar.querySelector(".sc-x").onclick = () => {
      barDismissed = true;
      try { sessionStorage.setItem("oman_bar_off", "1"); } catch {}
      bar.remove();
      document.documentElement.style.removeProperty("--bar-space");
      if (window.Analytics) Analytics.track("sticky_dismiss", {});
    };
    document.body.appendChild(bar);
    fitStickyBar();
  }

  /* MEASURE the tab bar, never guess it. The first version hardcoded 62px
     from the CSS padding sums and the real bar renders at 80, so the ask sat
     ON TOP of the navigation: the one thing this must never do. Heights move
     with font scaling, notches and any future tab, so the only safe number
     is the one the browser reports. Re-run on resize and on rotate.

     The same measurement sets --bar-space, the tail padding under the page,
     so the last card is never buried under the bar either. */
  function fitStickyBar() {
    const bar = $("#stickyCta");
    if (!bar) {
      document.documentElement.style.removeProperty("--bar-space");
      return;
    }
    const tabs = $("#tabs");
    // Phones dock the tabs to the bottom edge; desktop keeps them in the
    // header, where the bottom edge is free and the ask sits on it.
    const docked = tabs && getComputedStyle(tabs).position === "fixed";
    const tabH = docked ? Math.round(tabs.getBoundingClientRect().height) : 0;
    bar.style.bottom = tabH ? tabH + "px" : "0px";
    document.documentElement.style.setProperty(
      "--bar-space", (tabH + Math.round(bar.getBoundingClientRect().height) + 16) + "px");
  }
  // Rotating a phone, opening the keyboard and crossing the 640px breakpoint
  // all change which of the two layouts is in force, so the measurement is
  // taken again rather than trusted from the last one.
  addEventListener("resize", fitStickyBar);
  addEventListener("orientationchange", fitStickyBar);
  if (window.matchMedia) {
    const mq = matchMedia("(max-width:640px)");
    if (mq.addEventListener) mq.addEventListener("change", fitStickyBar);
  }
  // The sheet and the modal own the screen while they're open; the bar hides
  // under them rather than poking through the backdrop.
  function barVisible(on) {
    const b = $("#stickyCta");
    if (b) b.classList.toggle("bar-hidden", !on);
  }
  window.__barVisible = barVisible;

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
  /* The header button goes to the shop, where all three products and the
     date capture live. Someone who already owns something wants the key
     panel instead, which is what that button used to be for. */
  $("#unlockBtn").onclick = () => {
    if (Unlock.isAnythingOwned() && !D.meta.freeLaunch) return openUnlock();
    if (window.Analytics) Analytics.track("header_cta", { from: location.hash.replace("#/", "") || HOME });
    location.hash = "#/shop";
  };
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

  /* ------------------------------------------------------------ welcome
     The app opened straight into tool mode: brand row, HUD, tabs, search,
     cards. Perfect for someone who already trusts it, and nothing at all for
     a stranger, who got no hero image, no pitch and nothing to press. This
     sells once, to first-time visitors only, then never appears again, so
     returning readers opening the guide in a car at 6am are not made to
     scroll past a billboard.

     Design rules it has to obey:
       - it must never delay the app: the app renders underneath, this sits
         on top and can be dismissed before the photo has even arrived
       - no blank flash: the already-cached banner paints instantly as the
         backdrop, the full photo fades in over it when it lands
       - keyboard: focus moves to the button, Escape dismisses
       - reduced motion: no fade (handled by the global media query) */
  function showWelcome() {
    let seen = true;
    try { seen = localStorage.getItem("oman_welcomed") === "1"; } catch {}
    if (seen) return;

    const m = D.meta;
    const w = el("div", "welcome");
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-modal", "true");
    w.setAttribute("aria-label", "Welcome to Exploring Oman");
    w.innerHTML = `
      <div class="wc-art" aria-hidden="true">
        <div class="wc-photo"></div>
        <div class="wc-full"></div>
        <div class="wc-scrim"></div>
      </div>
      <div class="wc-panel">
        <div class="wc-body">
          <!-- The credential goes FIRST, above the hook. "Someone who lives
               here" is a million Instagram accounts; a licence is a fact
               nobody else on the reader's feed can claim, and it is the
               cheapest trust in the whole app. -->
          <p class="wc-eyebrow"><i></i>Oman, from a licensed Omani tour guide</p>
          <h1 class="wc-hook">${esc(m.aboutHook)}</h1>
          <p class="wc-sub">${esc(m.aboutSub)}</p>
          <ul class="wc-list">
            <li><b>${D.spots.length} places</b>, pinned to the parking, not the middle of the valley</li>
            <li>The drive, the walk in, the <b>entry fee</b> and the right month</li>
            <li>Day plans with <b>what they actually cost</b>, to the rial</li>
          </ul>
          <!-- TWO doors, not one. The app lands on Plan now, so a single
               button reading "show me the places" would promise a catalogue
               and deliver a planner. More usefully, the two buttons ask the
               only question that matters about a stranger: are you coming,
               or are you looking? One tap sorts them, and each gets the
               screen they actually wanted. -->
          <button type="button" class="wc-go">
            <span>I'm planning a trip</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5.5L18.5 12 12 18.5"/></svg>
          </button>
          <button type="button" class="wc-alt">Just show me the ${D.spots.length} places</button>
          <!-- COUNTED, never typed. This line said "58 places free to read"
               for a while after the free/paid split moved to 70, which is a
               wrong number in the first nine words a stranger ever reads.
               Any figure that can drift out of step with the data has to be
               derived from the data. -->
          <p class="wc-fine">1M+ views on the wadi reels · ${D.spots.filter(s => s.free).length}
             places free to read · updated every month</p>
        </div>
      </div>`;

    // Full-resolution hero fades in over the cached banner. Two sources so the
    // photo is never upscaled: a tall crop for phones, a wide one for the
    // desktop split. The old hero was a 1100x575 strip stretched across a
    // 1520px screen, which is exactly why it looked cheap.
    const hero = new Image();
    hero.onload = () => {
      const full = w.querySelector(".wc-full");
      full.style.backgroundImage = `url("${hero.src}")`;
      full.classList.add("on");
    };
    hero.src = matchMedia("(min-width: 900px)").matches
      ? "assets/welcome-wide.jpg"
      : "assets/welcome-hero.jpg";

    let closed = false;
    const close = (where) => {
      if (closed) return;
      closed = true;
      if (where && location.hash.replace("#/", "") !== where) location.hash = "#/" + where;
      try { localStorage.setItem("oman_welcomed", "1"); } catch {}
      // .closing sets pointer-events:none, so from this instant the overlay
      // cannot intercept a tap even if its removal is delayed. That matters:
      // background a tab mid-fade (switching apps on a phone is the common
      // case) and Chrome pauses the animation and throttles the timer, which
      // would otherwise leave an invisible sheet of glass over the app.
      w.classList.add("closing");
      document.body.style.overflow = "";
      const kill = () => w.remove();
      w.addEventListener("animationend", kill, { once: true });
      setTimeout(kill, 400);                       // fallback if it never runs
      const s = $("#catSearch");
      if (s) s.focus({ preventScroll: true });
      if (window.Analytics) Analytics.track("welcome", { action: where || "dismissed" });
    };
    w.querySelector(".wc-go").onclick = () => close("plan");
    w.querySelector(".wc-alt").onclick = () => close("explore");
    w.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    document.body.appendChild(w);
    document.body.style.overflow = "hidden";
    w.querySelector(".wc-go").focus({ preventScroll: true });
  }

  Unlock.init().finally(() => { route(); showWelcome(); });
})();

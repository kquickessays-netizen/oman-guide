/* =============================================================================
   ANALYTICS — anonymous usage events + the email list, via Supabase REST
   -----------------------------------------------------------------------------
   Entirely optional. If meta.backend in content.js is empty (the default),
   everything here is a no-op: no requests, no errors, no cookies, and the
   app behaves exactly as it did before this file existed. Paste a Supabase
   URL + anon key to switch it on. Setup steps: delivery/BACKEND-SETUP.md

   The anon key ships in public source — that's fine BY DESIGN: the database
   only lets the anon role INSERT (see delivery/backend-schema.sql). Reading
   the data needs the dashboard.
   ========================================================================== */

window.Analytics = (() => {

  const cfg = (window.OMAN_DATA && window.OMAN_DATA.meta.backend) || {};
  const enabled = !!(cfg.url && cfg.anonKey);

  /* -------------------------------------------------------------- device id
     One random id per browser, kept in localStorage. It identifies "a
     device", not "a person" — no name, no fingerprinting, and clearing
     site data mints a fresh one. */
  function deviceId() {
    try {
      let id = localStorage.getItem("oman_device_id");
      if (!id) {
        id = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : "d-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("oman_device_id", id);
      }
      return id;
    } catch { return "d-anon"; }  // localStorage blocked (private mode etc.)
  }

  /* Buyer context, read fresh at call time so events sent after an unlock
     carry the email/grants. Unlock may not exist yet (script order, future
     refactors) and may not expose these — never let that break a click. */
  function who() {
    const U = window.Unlock || (typeof Unlock !== "undefined" ? Unlock : null);
    const out = { email: null, grants: null };
    try { out.email  = (U && U.email  && U.email())  || null; } catch {}
    try { out.grants = (U && U.grants && U.grants()) || null; } catch {}
    return out;
  }

  function post(table, body) {
    return fetch(cfg.url.replace(/\/+$/, "") + "/rest/v1/" + table, {
      method: "POST",
      keepalive: true,  // let a click on an outbound buy link finish sending
      headers: {
        apikey: cfg.anonKey,
        Authorization: "Bearer " + cfg.anonKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(body)
    });
  }

  /* ------------------------------------------------------------------ track
     Fire and forget. Offline, ad blocker, Supabase asleep — whatever goes
     wrong, the answer is the same: silently don't care. */
  function track(event, props) {
    if (!enabled) return;
    try {
      const w = who();
      post("events", { event: event, props: props || {}, device_id: deviceId(),
                       email: w.email, grants: w.grants }).catch(() => {});
    } catch {}
  }

  /* -------------------------------------------------------------- subscribe */
  function subscribe(email) {
    if (!enabled) return Promise.resolve({ ok: false, error: "No backend configured." });
    email = String(email || "").trim().toLowerCase();
    if (!email || email.indexOf("@") < 1) return Promise.resolve({ ok: false, error: "Enter a valid email." });
    return post("subscribers", { email: email, device_id: deviceId() })
      .then(res => {
        if (res.ok || res.status === 409) return { ok: true };  // 409 = already on the list. Still a yes.
        return { ok: false, error: "Couldn't subscribe (" + res.status + "). Try again later." };
      })
      .catch(() => ({ ok: false, error: "Couldn't reach the server. Check your connection." }));
  }

  /* ------------------------------------------------------------------ review
     One-tap "worth it?" + optional tip, per spot. Insert-only — same trust
     model as events: anon key can write, only the dashboard can read. The
     best tips get hand-published into the spot as travellerTips (curated —
     nothing readers write appears in the app without Hussain approving it). */
  function review(spot, data) {
    if (!enabled) return Promise.resolve({ ok: false, error: "No backend configured." });
    data = data || {};
    const stars = Math.min(5, Math.max(0, parseInt(data.stars, 10) || 0)) || null;
    return post("reviews", {
      spot: spot || null,
      stars: stars,                                              // 1–5
      verdict: stars ? (stars >= 4 ? "up" : stars <= 2 ? "down" : null) : null,
      name: String(data.name || "").trim().slice(0, 60) || null,
      tip: String(data.tip || "").trim().slice(0, 500) || null,
      device_id: deviceId(),
      email: who().email
    }).then(res => ({ ok: res.ok })).catch(() => ({ ok: false }));
  }

  /* -------------------------------------------------------------------- book
     "Plan my trip with Hussain" requests — a lead, not an event. Same
     insert-only trust model. Table: bookings (delivery/backend-schema.sql). */
  function book(data) {
    if (!enabled) return Promise.resolve({ ok: false, error: "No backend configured." });
    data = data || {};
    return post("bookings", {
      name: String(data.name || "").trim().slice(0, 80) || null,
      contact: String(data.contact || "").trim().slice(0, 120) || null,
      dates: String(data.dates || "").trim().slice(0, 80) || null,
      group_size: String(data.group || "").trim().slice(0, 40) || null,
      note: String(data.note || "").trim().slice(0, 1000) || null,
      device_id: deviceId(),
      email: who().email
    }).then(res => ({ ok: res.ok })).catch(() => ({ ok: false }));
  }

  /* ---------------------------------------------------- auto-instrumentation */
  if (enabled) {
    const viewed = () => track("view", { tab: location.hash.replace("#/", "") || "wadis" });
    window.addEventListener("hashchange", viewed);
    viewed();  // the initial load is a view too

    // One listener for the whole document — buy/affiliate buttons are
    // re-rendered constantly, so catch the clicks on the way up instead
    // of wiring every button.
    document.addEventListener("click", e => {
      try {
        if (!e.target || !e.target.closest) return;
        const buy = e.target.closest(".btn-buy");
        if (buy) return track("buy_click", { href: buy.getAttribute("href") || "", text: (buy.textContent || "").trim() });
        const aff = e.target.closest(".affbtn");
        if (aff) return track("aff_click", { href: aff.getAttribute("href") || "",
                                      spot: (aff.dataset && aff.dataset.spot) || null });
        const ig = e.target.closest(".instabtn");
        if (ig) track("insta_click", { href: ig.getAttribute("href") || "",
                                       spot: (ig.dataset && ig.dataset.spot) || null });
      } catch {}
    }, true);
  }

  return { track: track, subscribe: subscribe, review: review, book: book, enabled: enabled, deviceId: deviceId };
})();

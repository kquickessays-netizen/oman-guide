/* =============================================================================
   ACCOUNTS — sign in, so saves / been-there / reviews follow the person,
   not the phone.
   -----------------------------------------------------------------------------
   Built on the SAME Supabase project as analytics (meta.backend in
   content.js). If that config is empty, this whole file is a no-op: no
   button, no requests, no errors — exactly the analytics.js contract.

   What signing in adds, and the ONLY things it adds:
     · oman_saved / oman_been sync to user_saves / user_visits, so a new
       phone (or a cleared browser) gets them back.
     · reviews posted while signed in carry the account, so Hussain can
       credit the author and reply.
     · Supabase sends the emails automatically: the confirm-your-address
       mail on signup, magic links, password resets. No email code here.

   Sign-in methods: Google, email + password (with confirmation email),
   and a passwordless magic link. Setup: delivery/ACCOUNTS-SETUP.md.

   OFFLINE-FIRST, like everything else in the app. localStorage stays the
   source of truth the UI reads; the account is a mirror of it. Toggles made
   offline are queued (oman_acct_queue) and flushed when the network returns.
   The supabase-js library (~50KB) is loaded from CDN only when there is a
   session to restore or the reader opens the account panel — a reader who
   never signs in never downloads it.
   ========================================================================== */

window.Account = (() => {

  const cfg = (window.OMAN_DATA && window.OMAN_DATA.meta.backend) || {};
  const enabled = !!(cfg.url && cfg.anonKey);
  const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";

  let sb = null;          // the supabase client, once the lib is loaded
  let me = null;          // the signed-in user (supabase user object) or null
  let libLoading = null;  // in-flight lib load, so two callers share one fetch

  const $id = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  /* ------------------------------------------------------------ local lists
     Read/write the SAME keys app.js's Store uses. Account never invents its
     own copy of the data; it mirrors the phone's lists to the server. */
  const readList = k => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
  const writeList = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  /* ------------------------------------------------------- the offline queue
     A toggle while signed in but offline must not be lost. Each push that
     fails lands here; the queue is flushed on boot, on login and whenever
     the browser says it is back online. Last entry per (kind,id) wins. */
  const QKEY = "oman_acct_queue";
  const qRead = () => { try { return JSON.parse(localStorage.getItem(QKEY) || "[]"); } catch { return []; } };
  const qWrite = v => { try { localStorage.setItem(QKEY, JSON.stringify(v)); } catch {} };
  const qAdd = (kind, id, on) => {
    const q = qRead().filter(x => !(x.kind === kind && x.id === id));
    q.push({ kind, id, on });
    qWrite(q);
  };

  /* -------------------------------------------------------------- lib + client */
  function loadLib() {
    if (window.supabase) return Promise.resolve();
    if (libLoading) return libLoading;
    libLoading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = LIB; s.async = true;
      s.onload = () => res();
      s.onerror = () => { libLoading = null; rej(new Error("offline")); };
      document.head.appendChild(s);
    });
    return libLoading;
  }

  function client() {
    if (sb) return sb;
    sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    sb.auth.onAuthStateChange((event, session) => {
      const was = !!me;
      me = (session && session.user) || null;
      paintButton();
      if (event === "SIGNED_IN" && !was && me) afterLogin();
      if (event === "PASSWORD_RECOVERY") openModal("recover");
      if (event === "SIGNED_OUT") { me = null; paintButton(); }
    });
    return sb;
  }

  /* Supabase keeps its session under "sb-<ref>-auth-token". If one exists,
     the person signed in before: restore quietly on boot. If not, do
     nothing until they open the panel — no CDN fetch for the 95% who
     never sign in. The URL hash check catches the return leg of the
     confirmation / magic-link / Google redirects. */
  function hasSession() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) return true;
      }
    } catch {}
    return /access_token=|refresh_token=|type=recovery|code=/.test(location.hash + location.search);
  }

  function init() {
    return loadLib().then(() => {
      client();
      return sb.auth.getSession().then(({ data }) => {
        me = (data.session && data.session.user) || null;
        paintButton();
        if (me) afterLogin(true);
      });
    }).catch(() => {});   // offline: the phone's lists still work, that's the design
  }

  /* ------------------------------------------------------------------- sync
     FIRST link of this browser to this account: UNION the phone's lists
     with the server's, so nothing anybody did on either side is lost.
     Every boot after that: the server is the truth (each local toggle also
     pushed), so pull-and-replace — that is what carries saves from the old
     phone to the new one. The queue is flushed first so an offline toggle
     beats a stale server row. */
  function afterLogin(quiet) {
    ensureProfile();
    flushQueue()
      .then(() => syncLists())
      .then(changed => {
        if (changed) window.dispatchEvent(new CustomEvent("oman:accountsync"));
        if (!quiet) toastMsg("✓ Signed in — your saves follow you now");
      })
      .catch(() => {});
  }

  function ensureProfile() {
    if (!me) return;
    let name = "";
    try { name = localStorage.getItem("oman_reviewer_name") || ""; } catch {}
    name = name || (me.user_metadata && (me.user_metadata.full_name || me.user_metadata.name)) || "";
    client().from("profiles")
      .upsert({ id: me.id, name: name || null }, { onConflict: "id" })
      .then(() => {}, () => {});
  }

  function flushQueue() {
    const q = qRead();
    if (!me || !q.length) return Promise.resolve();
    return Promise.all(q.map(x => pushRow(x.kind, x.id, x.on, true)))
      .then(() => qWrite([]));
  }

  function syncLists() {
    if (!me) return Promise.resolve(false);
    const linkKey = "oman_acct_linked_" + me.id;
    const firstLink = !localStorage.getItem(linkKey);
    const tables = [
      { table: "user_saves",  key: "oman_saved" },
      { table: "user_visits", key: "oman_been"  }
    ];
    return Promise.all(tables.map(t =>
      client().from(t.table).select("spot_id").then(({ data, error }) => {
        if (error) throw error;
        const server = (data || []).map(r => r.spot_id);
        const local = readList(t.key);
        if (firstLink) {
          // union both ways: server gains what the phone had, phone gains
          // what the account had from other devices.
          const missing = local.filter(id => !server.includes(id));
          if (missing.length) {
            client().from(t.table)
              .upsert(missing.map(id => ({ user_id: me.id, spot_id: id })),
                      { onConflict: "user_id,spot_id" })
              .then(() => {}, () => {});
          }
          const union = [...new Set([...server, ...local])];
          const changed = union.length !== local.length;
          writeList(t.key, union);
          return changed;
        }
        // steady state: server is the truth
        const changed = server.length !== local.length ||
                        server.some(id => !local.includes(id));
        writeList(t.key, server);
        return changed;
      })
    )).then(flags => {
      try { localStorage.setItem(linkKey, "1"); } catch {}
      return flags.some(Boolean);
    });
  }

  function pushRow(kind, id, on, fromQueue) {
    const table = kind === "save" ? "user_saves" : "user_visits";
    const op = on
      ? client().from(table).upsert({ user_id: me.id, spot_id: id }, { onConflict: "user_id,spot_id" })
      : client().from(table).delete().eq("user_id", me.id).eq("spot_id", id);
    return op.then(({ error }) => { if (error) throw error; })
      .catch(err => {
        if (!fromQueue) qAdd(kind, id, on);
        else throw err;
      });
  }

  /* Called by app.js's Store on every toggle. Signed out: does nothing,
     which is exactly the app's old behaviour. */
  function pushSave(id, on) { if (me && sb) pushRow("save", id, on).catch(() => {}); else if (me) qAdd("save", id, on); }
  function pushBeen(id, on) { if (me && sb) pushRow("been", id, on).catch(() => {}); else if (me) qAdd("been", id, on); }

  window.addEventListener("online", () => { if (me && sb) flushQueue().catch(() => {}); });

  /* ----------------------------------------------------------------- review
     Same shape analytics.js sends, plus the account. RLS ties user_id to
     the session server-side, so it cannot be spoofed. */
  function review(spot, data) {
    if (!me || !sb) return Promise.resolve({ ok: false });
    const stars = Math.min(5, Math.max(0, parseInt(data.stars, 10) || 0)) || null;
    return client().from("reviews").insert({
      spot: spot || null,
      stars: stars,
      verdict: stars ? (stars >= 4 ? "up" : stars <= 2 ? "down" : null) : null,
      name: String(data.name || "").trim().slice(0, 60) || null,
      tip: String(data.tip || "").trim().slice(0, 500) || null,
      device_id: (window.Analytics && Analytics.deviceId && Analytics.deviceId()) || null,
      email: me.email || null,
      user_id: me.id
    }).then(({ error }) => ({ ok: !error })).catch(() => ({ ok: false }));
  }

  /* ================================================================== UI ==
     One button in the top bar, one modal. The modal reuses the app's own
     .modal / .field / .pill styles so it looks native; the few classes
     that don't exist yet are injected below. */
  const CSS = `
  .acct-google{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;
    padding:11px;border-radius:12px;border:1.5px solid var(--line);background:#fff;
    font-weight:650;font-size:14px;color:var(--ink);cursor:pointer;
    transition:transform .13s ease,box-shadow .13s ease}
  .acct-google:hover{box-shadow:0 4px 14px rgba(27,35,32,.1)}
  .acct-google:active{transform:scale(.97)}
  .acct-div{display:flex;align-items:center;gap:10px;margin:16px 0;color:var(--muted);font-size:12px}
  .acct-div::before,.acct-div::after{content:"";flex:1;height:1px;background:var(--line)}
  .acct-btn{width:100%;padding:12px;border:none;border-radius:12px;background:var(--water);
    color:#fff;font-weight:650;font-size:14px;cursor:pointer;transition:transform .13s ease}
  .acct-btn:active{transform:scale(.97)}
  .acct-btn[disabled]{opacity:.6}
  .acct-btn.ghost{background:var(--water-soft);color:var(--water-dark)}
  .acct-links{display:flex;justify-content:space-between;margin-top:12px;font-size:12.5px}
  .acct-links a{color:var(--water);cursor:pointer;text-decoration:none;font-weight:600}
  .acct-err{margin:10px 0 0;padding:9px 12px;border-radius:10px;background:#fdf0ee;
    color:#8c3b2e;font-size:13px;line-height:1.4}
  .acct-ok{margin:10px 0 0;padding:9px 12px;border-radius:10px;background:#e7f4ea;
    color:#1e6b39;font-size:13px;line-height:1.4}
  .acct-me{display:flex;align-items:center;gap:12px;margin-bottom:16px}
  .acct-ava{width:44px;height:44px;border-radius:50%;background:var(--water);color:#fff;
    font-size:19px;font-weight:700;display:grid;place-items:center;flex:none}
  .acct-me b{font-size:15px;word-break:break-all}
  .acct-me small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
  .acct-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 16px}
  .acct-stat{background:var(--sand);border-radius:12px;padding:11px;text-align:center}
  .acct-stat b{display:block;font-size:19px}
  .acct-stat span{font-size:11.5px;color:var(--muted)}
  #accountBtn .acct-dot{display:inline-block;width:7px;height:7px;border-radius:50%;
    background:#1e9e59;margin-left:5px;vertical-align:1px}`;

  const GOOGLE_SVG = `<svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>`;

  function injectUI() {
    const st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    const actions = document.querySelector(".topbar-actions");
    if (!actions) return;
    const b = document.createElement("button");
    b.className = "pill pill-ghost";
    b.id = "accountBtn";
    b.onclick = () => openModal();
    actions.insertBefore(b, actions.firstChild);
    paintButton();
  }

  function paintButton() {
    const b = $id("accountBtn");
    if (!b) return;
    if (me) {
      b.innerHTML = "👤<span class=\"acct-dot\" aria-hidden=\"true\"></span>";
      b.setAttribute("aria-label", "Account, signed in as " + (me.email || ""));
      b.title = me.email || "Signed in";
    } else {
      b.textContent = "👤";
      b.setAttribute("aria-label", "Sign in");
      b.title = "Sign in";
    }
  }

  /* One backdrop of its own — the unlock modal keeps #modalBackdrop. */
  function modalRoot() {
    let back = $id("acctBackdrop");
    if (back) return back;
    back = document.createElement("div");
    back.id = "acctBackdrop";
    back.className = "modal-backdrop";
    back.hidden = true;
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Account">
        <button class="sheet-close" id="acctClose" aria-label="Close">✕</button>
        <div id="acctBody"></div>
      </div>`;
    document.body.appendChild(back);
    back.addEventListener("click", e => { if (e.target === back) closeModal(); });
    back.querySelector("#acctClose").onclick = closeModal;
    return back;
  }
  function closeModal() { const b = $id("acctBackdrop"); if (b) b.hidden = true; }

  function openModal(view) {
    const back = modalRoot();
    back.hidden = false;
    const body = back.querySelector("#acctBody");
    body.innerHTML = `<h2>Your account</h2><p>One moment…</p>`;
    init().then(() => {
      if (!window.supabase) {
        body.innerHTML = `<h2>Your account</h2>
          <p>You're offline right now. Your saves still work on this phone —
             sign in when you're back on a network and they'll sync up.</p>`;
        return;
      }
      render(view || (me ? "me" : "login"));
    });
  }

  function render(view) {
    const body = $id("acctBody");
    if (!body) return;

    /* ---- signed in ---- */
    if (view === "me" && me) {
      const saved = readList("oman_saved").length;
      const been = readList("oman_been").length;
      const letter = (me.email || "?").slice(0, 1).toUpperCase();
      body.innerHTML = `
        <h2>Your account</h2>
        <div class="acct-me">
          <span class="acct-ava">${esc(letter)}</span>
          <div><b>${esc(me.email || "Signed in")}</b>
          <small>Saves and been-theres sync to this account.</small></div>
        </div>
        <div class="acct-stats">
          <div class="acct-stat"><b>♥ ${saved}</b><span>saved</span></div>
          <div class="acct-stat"><b>✓ ${been}</b><span>been there</span></div>
        </div>
        <button class="acct-btn ghost" id="acctOut">Sign out</button>
        <p style="font-size:12px;color:var(--muted);margin-top:12px">
          Signing out keeps everything on this phone; it just stops syncing.</p>`;
      body.querySelector("#acctOut").onclick = () => {
        client().auth.signOut().then(() => { me = null; paintButton(); render("login"); });
      };
      return;
    }

    /* ---- password recovery (arrived from the reset email) ---- */
    if (view === "recover") {
      body.innerHTML = `
        <h2>New password</h2>
        <p>You followed the reset link — set the new password here.</p>
        <div class="field"><label for="acctPw2">New password</label>
          <input type="password" id="acctPw2" autocomplete="new-password" minlength="8" placeholder="At least 8 characters"></div>
        <button class="acct-btn" id="acctSetPw">Save password</button>
        <div id="acctMsg"></div>`;
      body.querySelector("#acctSetPw").onclick = () => {
        const pw = body.querySelector("#acctPw2").value;
        if (pw.length < 8) return msg("err", "8 characters minimum.");
        client().auth.updateUser({ password: pw })
          .then(({ error }) => error ? msg("err", error.message) : render("me"));
      };
      const back = modalRoot(); back.hidden = false;
      return;
    }

    /* ---- signed out: the login panel ---- */
    body.innerHTML = `
      <h2>Sign in</h2>
      <p>So your ♥ saves, ✓ been-theres and reviews follow you onto any
         phone — free, and the guide works exactly the same without it.</p>
      <button class="acct-google" id="acctGoogle">${GOOGLE_SVG} Continue with Google</button>
      <div class="acct-div">or with email</div>
      <div class="field"><label for="acctEmail">Email</label>
        <input type="email" id="acctEmail" autocomplete="email" placeholder="you@example.com"></div>
      <div class="field"><label for="acctPw">Password</label>
        <input type="password" id="acctPw" autocomplete="current-password" placeholder="Your password"></div>
      <button class="acct-btn" id="acctIn">Sign in</button>
      <div class="acct-links">
        <a id="acctUp">Create an account</a>
        <a id="acctMagic">Email me a sign-in link</a>
        <a id="acctForgot">Forgot?</a>
      </div>
      <div id="acctMsg"></div>`;

    const email = () => (body.querySelector("#acctEmail").value || "").trim().toLowerCase();
    const pw = () => body.querySelector("#acctPw").value || "";
    const redirect = location.origin + location.pathname;
    const needEmail = () => {
      if (email().indexOf("@") > 0) return true;
      msg("err", "Enter your email first."); return false;
    };

    body.querySelector("#acctGoogle").onclick = () => {
      client().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirect } })
        .then(({ error }) => { if (error) msg("err", error.message); });
    };
    body.querySelector("#acctIn").onclick = () => {
      if (!needEmail()) return;
      if (!pw()) return msg("err", "Enter your password (or use the sign-in link).");
      client().auth.signInWithPassword({ email: email(), password: pw() })
        .then(({ error }) => {
          if (!error) return render("me");
          msg("err", /confirm/i.test(error.message)
            ? "Almost there — confirm your email first (check your inbox, the spam folder too)."
            : error.message);
        });
    };
    body.querySelector("#acctUp").onclick = () => {
      if (!needEmail()) return;
      if (pw().length < 8) return msg("err", "Pick a password of at least 8 characters, then tap Create again.");
      client().auth.signUp({ email: email(), password: pw(),
                             options: { emailRedirectTo: redirect } })
        .then(({ data, error }) => {
          if (error) return msg("err", error.message);
          // Supabase quietly succeeds for an address that already has an
          // account (no leaking who's registered) — same message either way.
          msg("ok", "📬 Almost done — we've emailed <b>" + esc(email()) + "</b> a confirmation link. Tap it and you're in.");
        });
    };
    body.querySelector("#acctMagic").onclick = () => {
      if (!needEmail()) return;
      client().auth.signInWithOtp({ email: email(), options: { emailRedirectTo: redirect } })
        .then(({ error }) => error
          ? msg("err", error.message)
          : msg("ok", "📬 Sign-in link sent to <b>" + esc(email()) + "</b> — open it on this device."));
    };
    body.querySelector("#acctForgot").onclick = () => {
      if (!needEmail()) return;
      client().auth.resetPasswordForEmail(email(), { redirectTo: redirect })
        .then(({ error }) => error
          ? msg("err", error.message)
          : msg("ok", "📬 Password reset link sent to <b>" + esc(email()) + "</b>."));
    };

    function msg(kind, text) {
      const m = body.querySelector("#acctMsg");
      if (m) m.innerHTML = `<div class="acct-${kind === "err" ? "err" : "ok"}">${text}</div>`;
    }
  }

  function msg(kind, text) {  // used by the recover view
    const m = $id("acctMsg");
    if (m) m.innerHTML = `<div class="acct-${kind === "err" ? "err" : "ok"}">${esc(text)}</div>`;
  }

  function toastMsg(text) {
    const t = $id("toast");
    if (!t) return;
    t.textContent = text; t.hidden = false;
    clearTimeout(toastMsg._t);
    toastMsg._t = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* -------------------------------------------------------------------- boot */
  if (enabled) {
    const boot = () => {
      injectUI();
      if (hasSession()) init();   // returning user or an auth redirect landing
    };
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", boot)
      : boot();
  }

  return {
    enabled: enabled,
    user: () => me,
    open: openModal,
    pushSave: pushSave,
    pushBeen: pushBeen,
    review: review
  };
})();

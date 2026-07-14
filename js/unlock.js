/* =============================================================================
   UNLOCK — Gumroad licence-key verification
   -----------------------------------------------------------------------------
   HOW IT WORKS
   1. Buyer purchases on Gumroad. Gumroad emails them a licence key.
      (Turn this on: Gumroad product → Settings → check "Generate a licence key
       per sale". Then copy the product's *permalink* into GUMROAD below.)
   2. Buyer taps Unlock, pastes the key.
   3. We POST it to Gumroad's public verify endpoint. If it's a real, unrefunded
      sale, we store the unlock in localStorage and load premium.js.

   The bundle key unlocks EVERYTHING. A single-guide key unlocks that tab only.
   ========================================================================== */

const Unlock = (() => {

  // >>> SET THESE. The permalink is the bit after gumroad.com/l/  <<<
  // e.g. https://hussain.gumroad.com/l/oman-bundle  →  permalink: "oman-bundle"
  const GUMROAD = {
    bundle:      { permalink: "YOUR-BUNDLE",      grants: "*" },
    wadis:       { permalink: "YOUR-WADIS",       grants: "wadis" },
    beaches:     { permalink: "YOUR-BEACHES",     grants: "beaches" },
    experiences: { permalink: "YOUR-EXPERIENCES", grants: "experiences" },
    food:        { permalink: "YOUR-FOOD",        grants: "food" },
    shopping:    { permalink: "YOUR-SHOPPING",    grants: "shopping" },
    itineraries: { permalink: "YOUR-ITINERARIES", grants: "itineraries" }
  };

  // Master keys that always work — for you, for press, for refunds/gifts.
  // Stored as SHA-256 HASHES so the plaintext never ships to visitors (this
  // file is public — a plaintext key here is a skeleton key for anyone who
  // opens devtools). The plaintext lives in delivery/OWNER-KEY.txt (not
  // deployed). To mint a new one, hash the UPPERCASED key:
  //   crypto.subtle.digest("SHA-256", new TextEncoder().encode("MY-KEY"))
  //     .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")))
  const MASTER_HASHES = [
    "c122915f89f6df13c8d9c1a6c0204920a097e5dc8af12737aa23d4bbb0e9fbc9"
  ];

  async function sha256Hex(text) {
    if (!(window.crypto && crypto.subtle)) return null;  // file:// — no subtle crypto
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  const STORE = "oman_unlock_v1";
  const API = "https://api.gumroad.com/v2/licenses/verify";

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return { grants: [], key: null, email: null };
      const s = JSON.parse(raw);
      return { grants: s.grants || [], key: s.key || null, email: s.email || null };
    } catch { return { grants: [], key: null, email: null }; }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {}
  }

  /* ---------------------------------------------------------------- queries */
  function hasBundle()      { return state.grants.includes("*"); }
  function has(category)    { return hasBundle() || state.grants.includes(category); }
  function isAnythingOwned(){ return state.grants.length > 0; }
  function grants()         { return state.grants.slice(); }
  function key()            { return state.key; }

  /* ------------------------------------------------------- premium content */
  let premiumLoading = null;

  function loadPremium() {
    // ⚠️ THIS IS THE ONE FUNCTION TO CHANGE if you ever move to a real backend:
    //    replace the script-injection with fetch('/api/premium', {headers:{key}}).
    if (window.OMAN_PREMIUM) return Promise.resolve(window.OMAN_PREMIUM);
    if (premiumLoading) return premiumLoading;

    premiumLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "data/premium.js?v=" + Date.now();
      s.onload = () => resolve(window.OMAN_PREMIUM || {});
      s.onerror = () => reject(new Error("Could not load premium content."));
      document.head.appendChild(s);
    });
    return premiumLoading;
  }

  function detail(spotId) {
    return (window.OMAN_PREMIUM && window.OMAN_PREMIUM[spotId]) || null;
  }

  /* ------------------------------------------------------------- verify key */
  async function verify(rawKey) {
    const licenceKey = (rawKey || "").trim();
    if (!licenceKey) return { ok: false, error: "Enter your licence key." };

    // 1. master keys (compared by hash — needs a secure context, i.e. HTTPS
    //    or localhost; on file:// master keys simply don't apply)
    const keyHash = await sha256Hex(licenceKey.toUpperCase());
    if (keyHash && MASTER_HASHES.includes(keyHash)) {
      state = { grants: ["*"], key: licenceKey, email: null };
      save();
      await loadPremium();
      return { ok: true, grants: ["*"], master: true };
    }

    // 2. try each configured product until one verifies
    const products = Object.entries(GUMROAD).filter(
      ([, p]) => p.permalink && !p.permalink.startsWith("YOUR-")
    );

    if (!products.length) {
      return {
        ok: false,
        error: "No Gumroad products configured yet. Open app/js/unlock.js and paste your product permalinks into GUMROAD."
      };
    }

    let networkFailed = false;

    for (const [name, prod] of products) {
      try {
        const body = new URLSearchParams({
          product_permalink: prod.permalink,
          license_key: licenceKey,
          // count verifications on Gumroad's side — it's how you notice a key
          // being shared around (Gumroad shows uses per licence)
          increment_uses_count: "true"
        });
        const res = await fetch(API, { method: "POST", body });
        const data = await res.json().catch(() => ({}));

        if (data && data.success && data.purchase) {
          const p = data.purchase;
          if (p.refunded)             return { ok: false, error: "That purchase was refunded." };
          if (p.chargebacked)         return { ok: false, error: "That purchase was charged back." };
          if (p.subscription_cancelled_at) return { ok: false, error: "That subscription was cancelled." };

          const grant = prod.grants;
          const next = new Set(state.grants);
          next.add(grant);
          state = { grants: [...next], key: licenceKey, email: p.email || null };
          save();
          await loadPremium();
          return { ok: true, grants: state.grants, product: name };
        }
      } catch (e) {
        networkFailed = true;   // CORS / offline / Gumroad down
      }
    }

    if (networkFailed) {
      return { ok: false, error: "Couldn't reach Gumroad. Check your connection and try again." };
    }
    return { ok: false, error: "That key isn't valid. Check the email Gumroad sent you." };
  }

  function reset() {
    state = { grants: [], key: null, email: null };
    save();
  }

  /* ------------------------------- restore premium on load if already owned */
  function init() {
    if (isAnythingOwned()) return loadPremium().catch(() => {});
    return Promise.resolve();
  }

  return { has, hasBundle, isAnythingOwned, grants, key, verify, reset, init, loadPremium, detail, GUMROAD };
})();

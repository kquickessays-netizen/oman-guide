# The Exploring Oman app

One codebase. It's the website *and* the app — buyers "install" it from the browser and it lands on their home screen, works offline, and updates the moment you edit a file.

```
app/
  index.html              the shell — you'll rarely touch this
  manifest.webmanifest    makes it installable (name, icon, colours)
  sw.js                   offline cache. BUMP THE VERSION when you publish changes.
  css/app.css             all the styling. Colours live at the very top.
  js/
    app.js                tabs, cards, the detail sheet, the paywall veil
    planner.js            THE PLANNER — the routing engine
    unlock.js             Gumroad licence check.  ← put your product links here
  data/
    content.js            ★ EVERYTHING YOU EDIT LIVES HERE ★  free content + all metadata
    premium.js            the paid write-ups. Only loaded after a valid licence.
  icons/                  app icons (regenerate if you want a different look)
```

---

## The three things you must do before selling

**1. Paste your Gumroad links** → `data/content.js`, the `buyLinks` block near the top.

**2. Turn on licence keys in Gumroad, then paste the permalinks** → `js/unlock.js`, the `GUMROAD` block.

In Gumroad: your product → **Settings → check "Generate a licence key per sale"**. The *permalink* is the last bit of the product URL — `gumroad.com/l/oman-bundle` → `"oman-bundle"`.

```js
const GUMROAD = {
  bundle: { permalink: "oman-bundle", grants: "*" },        // "*" = unlocks everything
  wadis:  { permalink: "oman-wadis",  grants: "wadis" },    // unlocks one tab
  ...
};
```

The bundle key unlocks every tab **and the Planner**. That's the whole reason to buy the bundle.

**3. Paste your affiliate links** → `data/content.js`, the `affiliates` block. One link each; the app drops them in everywhere they're relevant automatically.

---

## Adding a spot (the thing you'll do most)

Open `data/content.js`, copy any block in `spots`, change the fields, save, refresh. It appears in its tab, in search, and in the planner. No other file needs touching — unless it's a locked spot, in which case add a matching entry in `premium.js` with the same `id`.

`free: true` = your shop window. `free: false` = the product.

Right now: **2 free / 3–4 locked** per tab. The free ones are the famous spots people can Google anyway (Wadi Shab, Bimmah, the Grand Mosque). The locked ones are the stuff only you have — Mibam, Hawer, Snake Gorge, your food spots. That's the right way round.

---

## The Planner

Bundle-only. It asks for days, month, interests, fitness, pace, and whether they've got a 4×4 — then:

1. **Filters** out anything they physically can't do (no 4×4 → no Snake Gorge; can't swim → no Wadi Shab).
2. **Scores** what's left on interest match, season and fitness fit.
3. **Clusters** by region, so it never sends anyone Muscat → Sur → Nizwa → Sur.
4. **Routes** each day with a real clock and a real drive budget, moving their hotel when — and only when — the region has enough left in it to justify repacking.
5. **Gets them home** on the last day, in time for the flight.

It never invents a place. Every stop comes from `content.js`, so anything you add becomes plannable for free.

**Tuning it:** `driveMatrix` and `regions` in `content.js` are the map it drives on. Every drive time in there is an estimate from public sources — **you know the real numbers, so correct them.** That single change improves every itinerary the app will ever produce.

---

## Publishing

Drag the whole folder into **Netlify Drop** (netlify.com/drop) or push it to GitHub and turn on Pages. It's static — no server, no build step, no monthly bill.

You need HTTPS for the "install to home screen" prompt to appear. Netlify and GitHub Pages both give you that free.

**After every content change:** bump `CACHE = "oman-v1"` in `sw.js` to `oman-v2`, etc. Otherwise people who've already installed it keep seeing the old version.

---

## Added 2026-07-13

- **Map tab** — every spot with coords, on one map (Leaflet, loads on demand;
  degrades to a pin list offline). Locked spots show dimmed with an unlock CTA.
- **Planner teaser** — non-buyers can now run the real planner: they see Day 1
  of their own route in full, the rest as locked skeletons. Strongest sales
  screen in the app.
- **Heat-smart seasons** — `months` means *best months*, never availability.
  Off-best spots stay bookable and plannable: cards and detail sheets show
  "🌡️ Best Oct–Apr — go at first light or after 4pm", summer plans run on a
  06:30 clock, and the planner gives the hottest spots the coolest slots.
- **Route map** — every generated plan draws the whole trip on a map: numbered
  stops in visit order, one colour per day, home marked. (Bundle only — the
  teaser mentions it.)
- **Master keys are hashed now** — the old plaintext keys were readable by
  anyone in devtools and were removed. Your working key is in
  `delivery/OWNER-KEY.txt` (not deployed); minting instructions in `unlock.js`.
- **Changelog** — `meta.changelog` in content.js renders as "What's new" on the
  About tab. Add an entry every time you publish; it's the proof behind
  "updated monthly, free forever".
- **Share footers** — printed/copied plans carry your handle + `meta.storeUrl`
  (set it once you deploy).

## The honest bit about the paywall

This is a static site, so someone determined could find `data/premium.js` and read it without paying. That makes it exactly as leaky as the PDF you already sell — anyone who buys can forward it. It stops casual copying, not piracy, and for an $8–20 guide that's the right trade.

If it ever matters enough to fix properly, there's exactly one function to change: `loadPremium()` in `js/unlock.js`. Point it at a server endpoint that checks the licence before it hands the content over, and the rest of the app doesn't need to know.

## What's still on you

- **Photos.** 45/50 cards have free-licence Wikimedia Commons photos (in `app/assets/`,
  credits auto-render on sheets + About). Replace with your own shots over time —
  and supply the 5 gaps (Wadi Hawer, Al Arbeieen, Wadi Damm, Seeb Souq, Al Sharaa):
  drop a ~1280px JPEG at `assets/<category>/<spot-id>.jpg`, set `img:` in content.js.
  If you replace a Commons photo with your own, delete its `imgCredit:` line.
- **Your voice.** The `[bracketed]` text in `premium.js` is researched filler. It's the part people are paying for — it can't stay generic.
- **The drive times.** Confirm them. You've done these roads.

/* =============================================================================
   EXPLORING OMAN — CONTENT DATA (free / public tier)
   -----------------------------------------------------------------------------
   THIS IS THE FILE YOU EDIT TO CHANGE THE APP. Plain JSON wrapped in one line of
   JS so it also works when you just double-click index.html locally.

   To add a spot: copy a block, change the fields, save, refresh. It appears in
   its tab, in search, and in the itinerary planner automatically.

   FIELD REFERENCE
     id            unique slug, no spaces            "wadi-shab"
     cat           wadis | beaches | experiences | food | itineraries
     sub           optional sub-label shown as a chip ("Coffee", "Seafood"…)
     name, tagline, blurb
     free          true = visible to everyone (your shop window)
                   false = locked; the detail lives in premium.js
     img           "../assets/wadis/shab.jpg"  ("" = grey placeholder)
     region        muscat | batinah | coast-east | sharqiyah | dakhiliyah |
                   rustaq | musandam | dhofar
     coords        [lat, lng] — approximate
     hours         hours actually spent there (the planner budgets with this)
     hikeTime      "45–60 min each way"  ← shown in the stat box
     swimTime      "1–2 hrs in the water"
     bring         { essential: [...], optional: [...] }  ← the packing list
     fitness       1 (anyone) … 5 (serious)
     needs4x4 / swim / kidOk    hard filters in the planner
     months        [1..12] the BEST months (usually = not brutal heat). Spots
                   are NEVER hidden or excluded outside these months — the app
                   shows a "🌡️ Best Oct–Apr" chip + go-early advice instead,
                   and the planner schedules them in the coolest morning slots.
     tags          swimming, hiking, canyoning, snorkel, wildlife, culture,
                   desert, beach, photography, food, adrenaline, sunset, camping
     guide         "" | "recommended" | "required"
     stats         the fact box — any label/value pairs
     mapUrl        Google Maps link
     verify        true = researched from public sources, NOT yet confirmed by
                   you. The app shows a small "confirm on the day" note.
                   Set to false once you've checked it yourself.
   ========================================================================== */

window.OMAN_DATA = {

  meta: {
    creator: "@hussain_explores",
    creatorLine: "Omani content creator · Licensed Oman tour guide 🪪",
    tagline: "Wadis, beaches and hidden corners — from someone who actually lives here.",
    email: "exploree.oman@gmail.com",
    instagram: "https://instagram.com/hussain_explores",
    instagramHandle: "@hussain_explores",

    bundlePrice: "$20",
    bundlePriceNum: 20,
    singlePrice: "$8",
    singlePriceNum: 8,

    // Shown in the banner at the top of every tab. Change the date each month —
    // this line is the whole reason an app beats a PDF.
    lastUpdated: "July 2026",
    updateNote: "Living guide — new spots, prices and road conditions added every month. Buy once, updated free forever.",

    // Where shared plans point people (your bio link / deployed app URL).
    // Leave "" until deployed; the share footer falls back to Instagram.
    storeUrl: "https://kquickessays-netizen.github.io/oman-guide/",

    // "What's new" — shown on the About tab. Add an entry each time you
    // publish (newest first). This is the proof behind "updated monthly".
    changelog: [
      { date: "July 2026", items: [
        "App launched: every guide in one place, installable, works offline.",
        "Trip planner: routes a custom itinerary from your days, interests, fitness and vehicle — and draws the whole route on a map.",
        "Map tab: every spot in the guide on one map.",
        "Heat-smart: summer plans start at 06:30, the hottest spots get the coolest slots, and each carries go-early advice.",
        "Info tab: rules, pro tips (OTaxi, Talabat, cards), transport ranked best to worst, money and emergency numbers — free for everyone.",
        "Shopping guide: the souqs (Mutrah, Seeb, Nizwa), the speciality shops and the malls."
      ]}
    ],

    // >>> PASTE YOUR REAL GUMROAD LINKS HERE <<<
    buyLinks: {
      bundle: "https://gumroad.com/l/YOUR-BUNDLE",
      wadis: "https://gumroad.com/l/YOUR-WADIS",
      beaches: "https://gumroad.com/l/YOUR-BEACHES",
      experiences: "https://gumroad.com/l/YOUR-EXPERIENCES",
      food: "https://gumroad.com/l/YOUR-FOOD",
      shopping: "https://gumroad.com/l/YOUR-SHOPPING",
      itineraries: "https://gumroad.com/l/YOUR-ITINERARIES"
    },

    // >>> AFFILIATE SLOTS — one link each, dropped in everywhere relevant <<<
    affiliates: {
      esim: "",       // Airalo / Holafly
      car: "",        // car rental
      hotel: "",      // Booking / hotel
      gear: "",       // gear list
      guide: ""       // your tour-operator referral
    }
  },

  // The tabs. Reorder / rename / add freely — the app builds nav from this.
  categories: [
    { id: "wadis",        label: "Wadis",       icon: "💧", blurb: "Canyons, emerald pools and waterfalls." },
    { id: "beaches",      label: "Beaches",     icon: "🏖️", blurb: "3,000 km of coast, and most of it empty." },
    { id: "experiences",  label: "Experiences", icon: "⭐", blurb: "The things worth building a whole day around." },
    { id: "food",         label: "Food",        icon: "🍽️", blurb: "Coffee, shuwa and seafood — where I actually eat." },
    { id: "shopping",     label: "Shopping",    icon: "🛍️", blurb: "Souqs, speciality shops and the malls." },
    { id: "itineraries",  label: "Itineraries", icon: "🗺️", blurb: "Done-for-you routes. Just follow along." },
    { id: "planner",      label: "Planner",     icon: "🧭", blurb: "Build your own trip in 60 seconds.", special: "planner" },
    { id: "map",          label: "Map",         icon: "📍", blurb: "Every spot in the guide, on one map.", special: "map" },
    { id: "info",         label: "Info",        icon: "ℹ️", blurb: "Rules, money, transport — read before you land.", special: "info" },
    { id: "about",        label: "About",       icon: "👋", blurb: "Who's behind this.", special: "about" }
  ],

  /* Region model — the planner clusters days by region and costs the drive
     between them. `fly: true` means it's not drivable on a Muscat-based trip;
     the planner leaves those out and says so. */
  regions: {
    "muscat":     { label: "Muscat & around",       base: "Muscat",      coords: [23.588, 58.408] },
    "batinah":    { label: "The Batinah coast",     base: "Al Sawadi",   coords: [23.775, 57.790] },
    "coast-east": { label: "The east coast",        base: "Tiwi / Sur",  coords: [22.840, 59.230] },
    "sharqiyah":  { label: "Sharqiyah & the sands", base: "Bidiyah",     coords: [22.440, 58.832] },
    "dakhiliyah": { label: "Nizwa & the mountains", base: "Nizwa",       coords: [22.933, 57.533] },
    "rustaq":     { label: "Rustaq & Bani Awf",     base: "Al Awabi",    coords: [23.310, 57.520] },
    "musandam":   { label: "Musandam fjords",       base: "Khasab",      coords: [26.180, 56.245], fly: true },
    "dhofar":     { label: "Salalah & Dhofar",      base: "Salalah",     coords: [17.019, 54.089], fly: true }
  },

  // Drive time between region bases, in MINUTES. Symmetric. ESTIMATES —
  // you've driven these roads, so correct them. Every itinerary improves.
  driveMatrix: {
    "muscat|batinah": 75,
    "muscat|coast-east": 120,
    "muscat|sharqiyah": 165,
    "muscat|dakhiliyah": 105,
    "muscat|rustaq": 105,
    "batinah|rustaq": 60,
    "batinah|dakhiliyah": 120,
    "batinah|coast-east": 195,
    "batinah|sharqiyah": 240,
    "coast-east|sharqiyah": 120,
    "coast-east|dakhiliyah": 240,
    "coast-east|rustaq": 240,
    "sharqiyah|dakhiliyah": 120,
    "sharqiyah|rustaq": 210,
    "dakhiliyah|rustaq": 120
  },

  /* ==========================================================================
     THE SPOTS
     ====================================================================== */
  spots: [

    /* ═══════════════════════════════════════════════════════════════ WADIS */
    {
      id: "wadi-shab", cat: "wadis", free: true,
      name: "Wadi Shab",
      tagline: "The famous one — and for once the hype is real.",
      blurb: "A flat walk past a string of turquoise pools ends at the bit nobody forgets: a narrow gap you swim through into a hidden cave with a waterfall thundering inside it. Bucket-list stuff, and surprisingly doable.",
      img: "assets/wadis/wadi-shab.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons", region: "coast-east", coords: [22.839, 59.236],
      hours: 5, fitness: 3, needs4x4: false, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","photography","canyoning"],
      guide: "",
      hikeTime: "45–60 min each way from the boat drop",
      swimTime: "1–2 hrs — the last 200m to the cave is swim-only",
      bring: {
        essential: ["Water shoes (grippy, drain fast)", "Dry bag — there is no dry route to the cave", "2L water per person", "Sun hat"],
        optional: ["Goggles or a mask — the cave is worth seeing underwater", "GoPro / waterproof phone case", "Waterproof head torch for the cave", "Small towel", "Cash for the boat (~OMR 1)"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "Half day (4–5 hrs)",
        "Hike": "45–60 min each way",
        "Swim": "Yes — into the cave",
        "Vehicle": "Any car + 2-min boat crossing",
        "Best season": "Oct–Apr",
        "Entry fee": "~OMR 1 pp (incl. boat)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Shab+Oman",
      verify: true,
      gettingThere: "From Muscat ~1h40–2h south on Route 17 toward Sur/Tiwi. Parking is free but the lot is small — arrive early on weekends. A ~2-minute boat crossing (~OMR 1 return, pay as you board, last boat around 5pm) gets you to the trailhead, then it's roughly a 45–60 min walk in to the pools.",
      whatYoullDo: "A mostly flat walk past a string of turquoise pools, crossing the wadi bed a few times, ends at a narrow gap you swim through into a hidden cave with a waterfall inside. Keep a phone in a dry bag — the last stretch is swim-only, no dry route around it.",
      tips: [
        "Go early — it fills up by mid-morning.",
        "A dry bag is essential to get a phone to the cave.",
        "Leave valuables behind — you swim the last part."
      ]
    },
    {
      id: "wadi-bani-khalid", cat: "wadis", free: true,
      name: "Wadi Bani Khalid",
      tagline: "The easy one — and still stunning.",
      blurb: "The most accessible wadi on this list, and somehow still one of the prettiest. Big emerald pools you can reach without a real hike — perfect if you're bringing people who aren't up for scrambling.",
      img: "assets/wadis/wadi-bani-khalid.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons", region: "sharqiyah", coords: [22.639, 59.012],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["swimming","photography"],
      guide: "",
      hikeTime: "None to the main pools — 15–20 min upstream to escape the crowds",
      swimTime: "As long as you like — this is a swimming day",
      bring: {
        essential: ["Modest swimwear — it's beside a village", "Water shoes", "Water"],
        essentialNote: "",
        optional: ["Goggles", "Towel", "Coins for the toilets (400 baisa) and changing tents (100 baisa)", "Picnic — there are shaded spots upstream"]
      },
      stats: {
        "Difficulty": "Easy",
        "Time needed": "2–4 hrs",
        "Hike": "None — pools are by the car park",
        "Swim": "Yes",
        "Vehicle": "Any car (2WD ok)",
        "Best season": "Year-round",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Bani+Khalid+Oman",
      verify: true,
      gettingThere: "From Muscat ~2.5 hrs via Route 23 (the faster inland road; the coastal Route 17 is prettier but closer to 4 hrs). Tarmac almost the whole way, with a long, easy 2WD-friendly car park right by the pools.",
      whatYoullDo: "The main pools by the car park get busy fast, but a 15–20 min walk upstream thins the crowds out considerably. There's also a cave further in for those who want to explore beyond the swimming area.",
      tips: [
        "Walk 15 min past the busy pools and you'll have it to yourself.",
        "Dress modestly — it's right next to a village."
      ]
    },
    {
      id: "wadi-mibam", cat: "wadis", free: false,
      name: "Wadi Mibam",
      tagline: "The one that made me fall for this country all over again.",
      blurb: "Emerald pools tucked between towering canyon walls, water so clear it looks fake on camera, and — if you time it right — barely another soul around.",
      img: "assets/wadis/wadi-mibam.jpg",
      imgCredit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons", region: "coast-east", coords: [22.816, 59.204],
      hours: 5, fitness: 3, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","canyoning","photography","hiking"],
      guide: "recommended",
      hikeTime: "~15 min down to the first waterfall, more if you push on",
      swimTime: "1–2 hrs across 2–3 pools",
      bring: {
        essential: ["Water shoes — the rocks past the first pool are slippery", "Dry bag", "2L water", "4×4 (non-negotiable for the last stretch)"],
        optional: ["Goggles", "Rope-free scramble gloves if you're going deep", "Snacks — no shops anywhere near", "Spare shoes for the drive back"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "Half day",
        "Hike": "~15 min in",
        "Swim": "Yes",
        "Vehicle": "4×4 required",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Mibam+Village+Oman",
      verify: true
    },
    {
      id: "wadi-al-arbeieen", cat: "wadis", free: false,
      name: "Wadi Al Arbeieen",
      tagline: "Boulder-hop your way to pools nobody else is in.",
      blurb: "Less famous than Shab and it shows — you'll have whole pools to yourself. The catch is the approach: a graded gravel track through a mountain pass, then real bouldering over giant white rocks. It's a workout, and it's brilliant.",
      img: "", region: "muscat", coords: [23.109, 58.802],
      hours: 6, fitness: 4, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","canyoning","photography","adrenaline"],
      guide: "recommended",
      hikeTime: "2–2.5 hrs each way to the upper pools — mostly bouldering, not walking",
      swimTime: "1–2 hrs. The deeper you go, the bigger and emptier the pools get",
      bring: {
        essential: ["Proper hiking shoes with grip that drain — this is the one that will hurt you without them", "3L water minimum", "Dry bag", "Sun protection — long stretches with no shade"],
        optional: ["Goggles for the deep pools", "Gloves for the boulders", "Packed lunch — most people eat at the top pool", "Trekking pole", "Head torch if you're cutting it fine on daylight"]
      },
      stats: {
        "Difficulty": "Hard-ish — lots of bouldering",
        "Time needed": "5–6 hrs of daylight minimum",
        "Hike": "2–2.5 hrs each way",
        "Swim": "Yes — deep pools, jumps for the brave",
        "Vehicle": "4×4 strongly recommended (10km graded gravel + water crossings)",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Al+Arbeieen+Oman",
      verify: true
    },
    {
      id: "wadi-damm", cat: "wadis", free: false,
      name: "Wadi Damm",
      tagline: "Azure pools and ferns in a sheer-walled canyon — with water all year.",
      blurb: "One of the few wadis that holds water year-round. Most people crowd the first pool, which isn't even the best one — walk a little further into the canyon and the good ones are yours.",
      img: "", region: "dakhiliyah", coords: [23.190, 57.037],
      hours: 4, fitness: 3, needs4x4: true, swim: true, kidOk: false,
      months: [1,2,3,4,10,11,12],
      tags: ["swimming","hiking","photography"],
      guide: "",
      hikeTime: "30–40 min from the car park to the main pools",
      swimTime: "1–2 hrs. Sit down and slide in — the entry rocks are viciously slippery",
      bring: {
        essential: ["Water shoes — the pool edges are like ice", "Dry bag", "2L water"],
        optional: ["Goggles", "Mask — the water is clear enough to be worth it", "Picnic", "A second towel; you'll be in and out of several pools"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "Half day",
        "Hike": "30–40 min each way",
        "Swim": "Yes — water year-round, rare in Oman",
        "Vehicle": "4×4 recommended (2WD can park ~500m out and walk)",
        "Best season": "Nov–Mar (best water levels)",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Damm+Oman",
      verify: true
    },
    {
      id: "wadi-tiwi", cat: "wadis", free: false,
      name: "Wadi Tiwi",
      tagline: "Wadi Shab's quieter, prettier neighbour.",
      blurb: "Right next to Wadi Shab but with a fraction of the crowds. Terraced date plantations, blue pools, and tiny villages clinging to the cliffs as you drive deeper in.",
      img: "assets/wadis/wadi-tiwi.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons", region: "coast-east", coords: [22.815, 59.254],
      hours: 4, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","photography","culture"],
      guide: "",
      hikeTime: "Short — the drive in is the main event, then 20–30 min to the pools",
      swimTime: "1 hr or so",
      bring: {
        essential: ["Water shoes", "Modest clothing — you're driving through people's villages", "Water"],
        optional: ["Goggles", "Camera — the terraced plantations are the shot", "Small change for the village shops"]
      },
      stats: {
        "Difficulty": "Easy–Moderate",
        "Time needed": "Half day",
        "Hike": "20–30 min to the pools",
        "Swim": "Yes",
        "Vehicle": "2WD to the lower wadi; 4×4 toward Mibam",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Tiwi+Oman",
      verify: true
    },
    {
      id: "wadi-dayqah", cat: "wadis", free: false,
      name: "Wadi Dayqah Dam",
      tagline: "The easy family day — kayaks, not scrambling.",
      blurb: "Oman's biggest dam, and now an adventure park around it: kayaks, paddleboards, pedal boats, a café at the viewpoint. Not a wild wadi — but it's the one you take people who don't want a wild wadi.",
      img: "assets/wadis/wadi-dayqah.jpg",
      imgCredit: "Photo: Paasikivi · CC BY-SA 3.0 · Wikimedia Commons", region: "muscat", coords: [23.070, 58.850],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["photography","wildlife"],
      guide: "",
      hikeTime: "None — it's a park",
      swimTime: "None. Swimming at the dam is restricted; you're on the water, not in it",
      bring: {
        essential: ["Cash for entry and boat hire", "Sun hat"],
        optional: ["Change of clothes if you're kayaking", "Dry bag for the phone", "Kids' sun gear"]
      },
      stats: {
        "Difficulty": "Easy — family",
        "Time needed": "Half day",
        "Hike": "None",
        "Swim": "No — kayak/paddle only",
        "Vehicle": "Any car",
        "Opening hours": "~8am–10pm",
        "Entry fee": "~OMR 1 pp (visitors) — cash"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Dayqah+Dam+Oman",
      verify: true
    },
    {
      id: "wadi-tanuf", cat: "wadis", free: false,
      name: "Wadi Tanuf",
      tagline: "A ruined village, a gorge, and almost nobody there.",
      blurb: "Palm groves, turquoise pools under small waterfalls, and the bombed-out ruins of old Tanuf village at the mouth of the gorge. Half an hour from Nizwa and a fraction of the traffic.",
      img: "assets/wadis/wadi-tanuf.jpg",
      imgCredit: "Photo: Harri J from Lausanne, Switzerland · CC BY 2.0 · Wikimedia Commons", region: "dakhiliyah", coords: [23.058, 57.475],
      hours: 3, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","culture","photography"],
      guide: "",
      hikeTime: "30–60 min into the gorge, as far as you fancy",
      swimTime: "30–60 min in the pools when water levels are up",
      bring: {
        essential: ["Water shoes", "Water", "Sun hat — the gorge is exposed early on"],
        optional: ["Goggles", "Camera for the ruins", "Picnic"]
      },
      stats: {
        "Difficulty": "Easy–Moderate",
        "Time needed": "Half day",
        "Hike": "30–60 min in",
        "Swim": "Yes, when water levels allow",
        "Vehicle": "2WD to the ruins; 4×4 for the rough track further in",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Tanuf+Oman",
      verify: true
    },
    {
      id: "wadi-ghul", cat: "wadis", free: false,
      name: "Wadi Ghul / Wadi Nakhar",
      tagline: "The floor of Oman's Grand Canyon.",
      blurb: "Everyone photographs this canyon from the rim at Jabal Shams. Far fewer people drive into the bottom of it — up the Ghul–Nakhar track with 1,000m walls closing in on either side. It reframes the whole mountain.",
      img: "assets/wadis/wadi-ghul.jpg",
      imgCredit: "Photo: Albinfo · CC BY 4.0 · Wikimedia Commons", region: "dakhiliyah", coords: [23.192, 57.157],
      hours: 4, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["photography","hiking","culture"],
      guide: "recommended",
      hikeTime: "Optional — you can drive most of it, or walk the canyon floor for hours",
      swimTime: "None reliably — it's a dry canyon most of the year",
      bring: {
        essential: ["4×4 — the track degrades fast past Al Hajir", "Water", "Full tank of fuel"],
        optional: ["Wide lens — the walls do not fit in a phone frame", "Jacket if you're pairing it with the Jabal Shams rim (it's cold up top)", "Offline map — signal drops"]
      },
      stats: {
        "Difficulty": "Easy on foot, hard on the car",
        "Time needed": "Half day",
        "Hike": "Optional",
        "Swim": "No",
        "Vehicle": "4×4 required past Al Hajir",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Ghul+Oman",
      verify: true
    },
    {
      id: "wadi-hawer", cat: "wadis", free: false,
      name: "Wadi Hawer",
      tagline: "For people who want an adventure, not a viewpoint.",
      blurb: "Long, remote and genuinely demanding — the kind of day that earns the views. Canyon scenery most visitors never reach. Get a guide for this one.",
      img: "", region: "sharqiyah", coords: [22.650, 58.950],
      hours: 8, fitness: 5, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["canyoning","adrenaline","hiking","swimming"],
      guide: "required",
      hikeTime: "Full day — 6+ hrs of scrambling and boulder-hopping",
      swimTime: "Lots. You will be wet most of the day",
      bring: {
        essential: ["A guide", "Shoes you can swim and scramble in", "3L+ water", "Dry bag", "Real fitness"],
        optional: ["Helmet (your guide should bring one)", "Energy food", "Waterproof camera strap — you'll lose a loose one"]
      },
      stats: {
        "Difficulty": "Hard",
        "Time needed": "Full day",
        "Hike": "6+ hrs scrambling",
        "Swim": "Yes — lots",
        "Vehicle": "4×4 required",
        "Best season": "Oct–Apr",
        "Guide": "Strongly recommended — remote, technical"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Hawer+Oman",
      verify: true
    },
    {
      id: "snake-gorge", cat: "wadis", free: false,
      name: "Snake Gorge (Wadi Bani Awf)",
      tagline: "The most adrenaline you'll find in an Omani wadi.",
      blurb: "Cliff jumps, swims through narrow gorges and proper scrambling. Spectacular — but it bites if you don't know it. Go with a guide, no exceptions.",
      img: "assets/wadis/snake-gorge.jpg",
      imgCredit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons", region: "rustaq", coords: [23.237, 57.444],
      hours: 8, fitness: 5, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["canyoning","adrenaline","swimming","hiking"],
      guide: "required",
      hikeTime: "~6 hrs through the gorge — this is canyoning, not hiking",
      swimTime: "Continuous. Cliff jumps (3–4m) and two ~20m abseils in the upper section",
      bring: {
        essential: ["A guide with ropes and helmets — do not do this alone", "Shoes that grip wet rock", "Dry bag", "Water"],
        optional: ["Wetsuit top in winter — the water is genuinely cold in the narrows", "Chin-strap for anything on your head", "Nothing loose in pockets — you will lose it"]
      },
      stats: {
        "Difficulty": "Hard — real canyoning",
        "Time needed": "~6 hrs + drive",
        "Hike": "~6 hrs through the gorge",
        "Swim": "Yes — jumps and abseils",
        "Vehicle": "4×4 required (mountain road)",
        "Best season": "Oct–Apr",
        "Guide": "Required"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Snake+Gorge+Wadi+Bani+Awf+Oman",
      verify: true
    },
    {
      id: "wadi-as-suwayh", cat: "wadis", free: false,
      name: "Wadi As Suwayh",
      tagline: "Where the wadi meets the sea.",
      blurb: "A quiet one on the coast road past Sur — pools, palms and a short walk in, with the sea a few minutes away. Barely on the tourist map, which is the point.",
      img: "assets/wadis/wadi-as-suwayh.jpg",
      imgCredit: "Photo: Arian Zwegers · CC BY 2.0 · Wikimedia Commons", region: "coast-east", coords: [22.331, 59.591],
      hours: 3, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","beach","photography"],
      guide: "",
      hikeTime: "20–40 min in",
      swimTime: "As long as the pools hold water — check conditions first",
      bring: {
        essential: ["Water shoes", "Water", "Everything you need — nothing out here"],
        optional: ["Goggles", "Beach kit, since you're minutes from the coast", "Picnic"]
      },
      stats: {
        "Difficulty": "Easy–Moderate",
        "Time needed": "2–4 hrs",
        "Hike": "20–40 min",
        "Swim": "Yes (water levels vary a lot)",
        "Vehicle": "2WD to the entrance",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+As+Suwayh+Oman",
      verify: true,
      needsFirstHand: true
    },
    {
      id: "wadi-naqab", cat: "wadis", free: false,
      name: "Wadi Naqab",
      tagline: "Serious mountain country — go prepared or don't go.",
      blurb: "A big, rugged wadi in the northern Hajar. Long approach, real exposure, and a route you should not be finding by yourself. The reward is scale you won't get anywhere near Muscat.",
      img: "assets/wadis/wadi-naqab.jpg",
      imgCredit: "Photo: IbrahimKumar · CC0 · Wikimedia Commons", region: "musandam", coords: [25.878, 56.130],
      hours: 8, fitness: 5, needs4x4: true, swim: false, kidOk: false,
      months: [11,12,1,2,3],
      tags: ["hiking","adrenaline","photography"],
      guide: "required",
      hikeTime: "Full day, serious terrain",
      swimTime: "Seasonal pools only — do not count on water",
      bring: {
        essential: ["A guide who knows the route", "Full-day water (4L)", "Proper boots", "Sun and wind protection"],
        optional: ["Poles", "Emergency layer — it gets cold and windy", "Offline maps + a charged phone"]
      },
      stats: {
        "Difficulty": "Hard",
        "Time needed": "Full day",
        "Hike": "Full day, serious",
        "Swim": "Seasonal only",
        "Vehicle": "4×4",
        "Best season": "Nov–Mar",
        "Guide": "Required"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Naqab",
      verify: true,
      needsFirstHand: true
    },

    /* ═════════════════════════════════════════════════════════════ BEACHES */
    {
      id: "bimmah-sinkhole", cat: "beaches", free: true,
      name: "Bimmah Sinkhole",
      tagline: "A natural blue swimming hole right off the coast road.",
      blurb: "A surreal limestone sinkhole filled with blue-green water, sitting in a tidy park just off the coastal highway. Steps lead right down to the water. Perfect to pair with Wadi Shab on the same drive.",
      img: "assets/beaches/bimmah-sinkhole.jpg",
      imgCredit: "Photo: Uhooep · CC BY-SA 4.0 · Wikimedia Commons", region: "coast-east", coords: [23.040, 59.074],
      hours: 1.5, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["swimming","photography"],
      guide: "",
      swimTime: "30–60 min — it's a stop, not a day",
      bring: {
        essential: ["Swimwear", "Towel"],
        optional: ["Goggles — the little fish will nibble your feet", "Water shoes for the steps"]
      },
      stats: {
        "Best for": "Quick swim / photos",
        "Time needed": "1–1.5 hrs",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Opening hours": "8am–8pm",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bimmah+Sinkhole+Oman",
      verify: true,
      gettingThere: "Right on the Muscat–Sur coast road (Route 17), ~1.5 hrs from Muscat, in Hawiyat Najm Park near Bimmah village. Free parking, steps lead straight down to the water.",
      whatYoullDo: "Swim, jump in, photograph the impossible colour of the water, and move on — it's an hour, not a day. Pairs perfectly with Wadi Shab on the same coastal run (they're minutes apart).",
      tips: [
        "Combine Bimmah + Wadi Shab in one coastal day.",
        "Midday sun makes the water glow for photos."
      ]
    },
    {
      id: "fins-beach", cat: "beaches", free: true,
      name: "Fins Beach",
      tagline: "White sand, turquoise water, mountains behind. Postcard Oman.",
      blurb: "One of the most beautiful beaches in the country, and a favourite camping spot for a reason: soft white sand, impossibly blue water, and the Hajar mountains rising right behind you. Sunset here is unreal.",
      img: "assets/beaches/fins-beach.jpg",
      imgCredit: "Photo: Daredeep33 · CC BY-SA 4.0 · Wikimedia Commons", region: "coast-east", coords: [23.098, 59.024],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","camping","sunset","photography"],
      guide: "",
      swimTime: "All day if you want it",
      bring: {
        essential: ["Everything — there are no facilities at all", "Water", "Shade (umbrella or tarp)", "A bag for your rubbish"],
        optional: ["Tent — wild camping is legal in Oman", "Firewood", "Cool box", "Snorkel gear"]
      },
      stats: {
        "Best for": "Camping / swimming",
        "Time needed": "Half day–overnight",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Facilities": "None — bring everything",
        "Entry": "Free (wild camping legal)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Fins+Beach+Oman",
      verify: true,
      gettingThere: "From Muscat ~1.5–2 hrs on the coast road, between Quriyat and Sur, right off the highway near Fins village — dirt tracks lead down to the sand, no 4×4 required.",
      whatYoullDo: "Swim, camp, watch the sun go down behind the Hajar. There are no facilities at all, so bring water, shade, and a bag for your rubbish. Best Oct–Apr when the sea is calmer.",
      tips: [
        "Camp on a weekday and you'll have it to yourself.",
        "No facilities — bring water, shade, and take your rubbish out."
      ]
    },
    {
      id: "bandar-khayran", cat: "beaches", free: false,
      name: "Bandar Khayran",
      tagline: "The snorkel and kayak playground near Muscat.",
      blurb: "A maze of coves, mangroves and little islands just south of Muscat — and some of the best snorkelling near the city. Calm, clear water and reefs you can reach by boat or kayak.",
      img: "assets/beaches/bandar-khayran.jpg",
      imgCredit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.523, 58.717],
      hours: 5, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["snorkel","beach","wildlife","photography"],
      guide: "recommended",
      swimTime: "Half a day in and out of the water",
      bring: {
        essential: ["Reef-safe sunscreen", "Water", "Hat"],
        optional: ["Your own mask & snorkel — hire gear is hit and miss", "Rash vest instead of sunscreen", "Dry bag", "Waterproof camera"]
      },
      stats: {
        "Best for": "Snorkel / kayak",
        "Time needed": "Half day",
        "Swim": "Yes",
        "Access": "Boat/kayak only — no road access",
        "Best time": "Morning (calmest water)",
        "Entry": "Boat/kayak hire (~OMR 15 for a kayak)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bandar+Khayran+Oman",
      verify: true
    },
    {
      id: "ras-al-jinz", cat: "beaches", free: false,
      name: "Ras Al Jinz",
      tagline: "Watch sea turtles nest under the stars.",
      blurb: "Oman's famous turtle nesting beach at the easternmost tip of Arabia. On a guided night or dawn visit you watch green turtles haul ashore to lay eggs — and hatchlings scramble for the sea.",
      img: "assets/beaches/ras-al-jinz.jpg",
      imgCredit: "Photo: F igy · CC BY 3.0 · Wikimedia Commons", region: "coast-east", coords: [22.420, 59.836],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["wildlife","photography"],
      guide: "required",
      swimTime: "None — this is a protected nesting beach",
      bring: {
        essential: ["Booking confirmation — numbers are capped", "Closed shoes for soft sand in the dark", "A jacket — it's cold on that beach at night"],
        optional: ["Red-light torch (never white light near turtles)", "NO flash photography — it disorients them", "Patience"]
      },
      stats: {
        "Best for": "Turtle watching",
        "Time needed": "2–3 hrs (night or dawn tour)",
        "Swim": "No",
        "Access": "Guided tour only, fixed times",
        "Peak nesting": "Jun–Aug (year-round sightings)",
        "Entry": "~OMR 3 pp + ~OMR 7 pp guided tour"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Ras+Al+Jinz+Turtle+Reserve+Oman",
      verify: true
    },
    {
      id: "yiti-qantab", cat: "beaches", free: false,
      name: "Yiti & Qantab",
      tagline: "Quiet coves 30 minutes from the city.",
      blurb: "When I want the coast without the drive, I come here. Calm coves and dramatic cliffs just outside Muscat — great for a quick swim, a sunset, or kayaking around the headlands.",
      img: "assets/beaches/yiti-qantab.jpg",
      imgCredit: "Photo: Allan Henderson · CC BY 2.0 · Wikimedia Commons", region: "muscat", coords: [23.568, 58.538],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["beach","sunset","swimming"],
      guide: "",
      swimTime: "A couple of hours",
      bring: {
        essential: ["Swimwear", "Water"],
        optional: ["Snorkel", "Sunset snacks", "Kayak if you have one"]
      },
      stats: {
        "Best for": "Quick swim / sunset",
        "Time needed": "2–3 hrs",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Best time": "Late afternoon",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Qantab+Beach+Oman",
      verify: true
    },
    {
      id: "as-sifah", cat: "beaches", free: false,
      name: "As Sifah",
      tagline: "A long, wild, empty stretch an hour from the city.",
      blurb: "Sandy, quiet and backed by mountains — the beach you go to when you want space. Popular for camping, and one of the easiest wild nights out you can have from Muscat.",
      img: "assets/beaches/as-sifah.jpg",
      imgCredit: "Photo: MariamMajdolineLahham · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.427, 58.833],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","camping","sunset","swimming","photography"],
      guide: "",
      swimTime: "As long as you like — calm and shallow in stretches",
      bring: {
        essential: ["Water", "Shade", "A bag for your rubbish"],
        optional: ["Tent — wild camping is legal", "Cool box", "Firewood", "Snorkel gear"]
      },
      stats: {
        "Best for": "Camping / space",
        "Time needed": "Half day–overnight",
        "Swim": "Yes",
        "Vehicle": "Any car (4×4 for the quiet far ends)",
        "Facilities": "Minimal",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=As+Sifah+Beach+Oman",
      verify: true
    },
    {
      id: "al-sawadi", cat: "beaches", free: false,
      name: "Al Sawadi",
      tagline: "Islands offshore, reef in between, palms behind.",
      blurb: "An hour and a half up the Batinah coast: clean sand, calm water, and a cluster of protected islands just offshore you can boat out to. The reef between the mainland and the islands is the reason to bother.",
      img: "assets/beaches/al-sawadi.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons", region: "batinah", coords: [23.775, 57.790],
      hours: 4, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","snorkel","wildlife","sunset"],
      guide: "recommended",
      swimTime: "Half a day, mostly snorkelling",
      bring: {
        essential: ["Reef-safe sunscreen", "Water", "Cash for the boat out to the islands"],
        optional: ["Own mask & snorkel", "Rash vest", "Binoculars — the islands are a seabird nesting site"]
      },
      stats: {
        "Best for": "Snorkelling / islands",
        "Time needed": "Half day",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Access": "Beach free; boat to the islands is paid",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Sawadi+Beach+Oman",
      verify: true
    },
    {
      id: "mughsail", cat: "beaches", free: false,
      name: "Mughsail Beach (Salalah)",
      tagline: "Blowholes, cliffs and a beach that doesn't look like the rest of Oman.",
      blurb: "Down in Dhofar: golden sand, dramatic cliffs, and natural blowholes that fire seawater into the air. Green in the khareef — a sentence you can't write about anywhere else in the Gulf.",
      img: "assets/beaches/mughsail.jpg",
      imgCredit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons", region: "dhofar", coords: [16.873, 53.774],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,7,8,9,10,11,12],
      tags: ["beach","photography","sunset"],
      guide: "",
      swimTime: "Depends on the sea — it can be rough",
      bring: {
        essential: ["Water", "Sun protection"],
        optional: ["Camera for the blowholes (they need a decent swell)", "Windproof layer in khareef season"]
      },
      stats: {
        "Best for": "Scenery / blowholes",
        "Time needed": "2–3 hrs",
        "Swim": "Sometimes — check the sea",
        "Vehicle": "Any car",
        "Getting there": "Fly to Salalah — it's ~1,000km from Muscat",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Mughsail+Beach+Salalah+Oman",
      verify: true
    },

    /* ═════════════════════════════════════════════════════════ EXPERIENCES */
    {
      id: "grand-mosque", cat: "experiences", free: true,
      name: "Sultan Qaboos Grand Mosque",
      tagline: "The one thing every visitor should do in Muscat.",
      blurb: "The mosque that changes how people see the whole country — the scale, the light, the second-largest hand-woven carpet on earth. Free to enter, and an hour well spent.",
      img: "assets/experiences/grand-mosque.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.584, 58.389],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Arms and legs covered", "Women: a scarf to cover your hair", "Shoes you can slip off easily"],
        optional: ["Robe hire on site (~OMR 2.5) if you forget", "Wide lens for the prayer hall", "Arrive at 8am — empty and cool"]
      },
      stats: {
        "Best for": "Culture / architecture",
        "Time needed": "1–1.5 hrs",
        "Visiting hours": "8–11am daily — closed Fridays & public holidays",
        "Dress code": "Arms/legs covered; women cover hair",
        "Booking": "Walk-in",
        "Entry": "Free (guided tour ~OMR 5pp; robe hire ~OMR 2.5)"
      },
      // Opening hours confirmed first-hand by Hussain — no "check on the day" note.
      closedFridays: true,
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sultan+Qaboos+Grand+Mosque+Muscat",
      verify: false,
      gettingThere: "In Muscat proper — a short taxi/drive from most hotels, with visitor parking on site. Visitor hours are 8–11am every day except Friday and public holidays, so get there by 10am at the latest to have any real time inside.",
      whatYoullDo: "The courtyard, the main prayer hall, the chandelier, and the carpet. Give it an hour and don't rush the prayer hall — it's the whole point.",
      tips: [
        "Open to visitors 8–11am, every day except Friday and public holidays. That's a narrow window — plan the morning around it, not the other way round.",
        "Go right at 8am — noticeably quieter and cooler for photos.",
        "Pair it with Mutrah Souq / the Corniche the same morning."
      ]
    },
    {
      id: "mutrah", cat: "experiences", free: true,
      name: "Mutrah Souq & Corniche",
      tagline: "Old Muscat, best at dusk.",
      blurb: "The corniche at golden hour, then straight into the souq — frankincense, silver, textiles, and the smell of oud in every alley. It's touristy and it's still good; you just have to haggle.",
      img: "assets/experiences/mutrah.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.617, 58.594],
      hours: 2.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","food","photography","sunset"],
      guide: "",
      bring: {
        essential: ["Cash — many stalls don't take card", "Modest clothing"],
        optional: ["A firm 'no thanks' — the first price is never the price", "Room in your bag for frankincense", "Camera for the corniche at sunset"]
      },
      stats: {
        "Best for": "Souq / sunset / your first evening",
        "Time needed": "2–3 hrs",
        "Souq hours": "~9am–1pm & 5–9pm (roughly)",
        "Vehicle": "Any car / taxi",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Mutrah+Souq+Muscat",
      verify: true,
      gettingThere: "On the Muscat waterfront, ~15 min from most hotels. Park along the corniche and walk.",
      whatYoullDo: "Walk the corniche as the light goes, then into the souq. Buy frankincense and a burner, ignore the 'antique' khanjars, and eat on the water afterwards.",
      tips: [
        "Go at dusk — the light on the corniche is the photo.",
        "Haggle. Start at about half and meet in the middle."
      ]
    },
    {
      id: "daymaniyat", cat: "experiences", free: false,
      name: "Daymaniyat Islands",
      tagline: "Oman's best reef, a boat ride from the city.",
      blurb: "A protected marine reserve 18km off Seeb — turtles, rays, reef, and a real chance of something bigger. Half a day, and the best snorkelling in the country.",
      img: "assets/experiences/daymaniyat.jpg",
      imgCredit: "Photo: Wusel007 · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.861, 58.100],
      hours: 5, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [11,12,1,2,3],
      tags: ["snorkel","wildlife","beach","photography"],
      guide: "required",
      swimTime: "2–3 hrs in the water across two or three reef stops",
      bring: {
        essential: ["Reef-safe sunscreen — it's a protected reserve", "Towel", "Motion-sickness tablet if you're prone"],
        optional: ["Own mask — a leaking hire mask ruins the day", "Rash vest", "Waterproof camera", "Cash"]
      },
      stats: {
        "Best for": "Snorkelling / diving",
        "Time needed": "Half day",
        "Swim": "Yes — the whole point",
        "Access": "Boat tour only (nature reserve)",
        "Best season": "Nov–Mar (visibility, turtles)",
        "Booking": "2–3 days ahead in peak season"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Daymaniyat+Islands+Oman",
      verify: true
    },
    {
      id: "wahiba-sands", cat: "experiences", free: false,
      name: "Wahiba Sands",
      tagline: "A night in the dunes you won't get back home.",
      blurb: "Tarmac to the sand's edge, then a 4×4 into the dunes. Dune bashing, camels, a sunset session on a ridge, and a night sky that ruins other night skies.",
      img: "assets/experiences/wahiba-sands.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons", region: "sharqiyah", coords: [22.439, 58.832],
      hours: 20, fitness: 1, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3],
      tags: ["desert","camping","adrenaline","sunset","photography"],
      guide: "recommended",
      overnight: true,
      bring: {
        essential: ["A warm layer — the desert gets genuinely cold at night", "Scarf for the sand", "Your camp booking"],
        optional: ["Tripod for the stars", "Sandals you don't mind losing to a dune", "Torch", "A book — the afternoon is slow"]
      },
      stats: {
        "Best for": "Desert camp / dune bashing",
        "Time needed": "Overnight (1–2 nights)",
        "Swim": "No",
        "Vehicle": "Tarmac to Al Wasil, then 4×4 into the dunes",
        "Best season": "Oct–Mar",
        "Booking": "Book the camp ahead"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wahiba+Sands+Oman",
      verify: true
    },
    {
      id: "jabal-shams", cat: "experiences", free: false,
      name: "Jabal Shams — the Balcony Walk",
      tagline: "Oman's Grand Canyon, and the hike along its rim.",
      blurb: "8.7km out-and-back along the rim of the canyon to an abandoned village. Exposed edges, huge views, and cold air at 2,000m — bring a jacket, even here.",
      img: "assets/experiences/jabal-shams.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons", region: "dakhiliyah", coords: [23.232, 57.203],
      hours: 6, fitness: 4, needs4x4: true, swim: false, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["hiking","photography","adrenaline"],
      guide: "recommended",
      hikeTime: "4–5 hrs — 8.7km out-and-back on the waymarked W6 trail",
      swimTime: "None",
      bring: {
        essential: ["Proper hiking shoes", "3L water — there is none on the trail", "A jacket (cold and windy at 2,000m, even in summer)", "Sun hat"],
        optional: ["Poles for the loose sections", "A head for heights — the ledge is exposed", "Packed lunch for the abandoned village at the turnaround"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "4–5 hrs (8.7km out-and-back)",
        "Hike": "4–5 hrs, W6 trail",
        "Swim": "No",
        "Vehicle": "4×4 recommended for the final stretch",
        "Best season": "Oct–Apr",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Jabal+Shams+Balcony+Walk+Al+Khitaym",
      verify: true
    },
    {
      id: "nizwa", cat: "experiences", free: false,
      name: "Nizwa Fort & Souq",
      tagline: "Old Oman, still very much alive.",
      blurb: "The fort tower, the souq stalls — silver, dates, pottery, spices — and, if you time it for a Friday morning, the livestock souq, which is a genuine spectacle.",
      img: "assets/experiences/nizwa.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons", region: "dakhiliyah", coords: [22.933, 57.533],
      hours: 4, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","food","photography"],
      guide: "",
      bring: {
        essential: ["Cash", "Sun hat — no shade on the fort tower"],
        optional: ["Friday ~7am for the livestock souq", "Room in the bag for dates and halwa", "Modest clothing"]
      },
      stats: {
        "Best for": "History / local life",
        "Time needed": "Half day",
        "Fort hours": "Sat–Thu 8am–6pm; Fri 8–11:30am & 1:30–6pm",
        "Souq hours": "~8am–1pm & 4–8pm",
        "Best time": "Friday morning (livestock souq)",
        "Entry": "Fort OMR 5 / kids OMR 3. Souq free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Nizwa+Fort+Oman",
      verify: true
    },
    {
      id: "misfat-al-abriyeen", cat: "experiences", free: false,
      name: "Misfat Al Abriyeen",
      tagline: "A mud-brick village in the mountains that time forgot to ruin.",
      blurb: "Terraced gardens, falaj channels running through the alleys, and old stone houses stacked into the hillside. Walk it slowly — and stay the night in a village guesthouse if you can.",
      img: "assets/experiences/misfat-al-abriyeen.jpg",
      imgCredit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons", region: "dakhiliyah", coords: [23.130, 57.281],
      hours: 3, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography","hiking"],
      guide: "",
      hikeTime: "1 hr through the village and the terraces; longer if you take the trail out",
      bring: {
        essential: ["Modest clothing — people live here", "Shoes with grip (the alleys are steep and polished)", "Water"],
        optional: ["Cash for the village guesthouses and cafés", "Camera — go at golden hour", "Respect: ask before photographing doorways"]
      },
      stats: {
        "Best for": "Culture / photography",
        "Time needed": "2–3 hrs (or stay the night)",
        "Vehicle": "Any car",
        "Pairs with": "Al Hoota Cave, Wadi Ghul, Jabal Shams",
        "Best time": "Late afternoon",
        "Entry": "Free (park outside the village)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Misfat+Al+Abriyeen+Oman",
      verify: true
    },
    {
      id: "al-hoota-cave", cat: "experiences", free: false,
      name: "Al Hoota Cave",
      tagline: "Two million years old, and the only show cave in Arabia.",
      blurb: "4.5km of cave under the foot of Jabal Shams, with 500m of it opened up and lit. A little train takes you in. It's the easy win on a mountain day — and blissfully cool.",
      img: "assets/experiences/al-hoota-cave.jpg",
      imgCredit: "Photo: A1000 · CC0 · Wikimedia Commons", region: "dakhiliyah", coords: [23.081, 57.363],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","wildlife","photography"],
      guide: "",
      bring: {
        essential: ["Booking, or arrive early — slots are timed and sell out", "Closed shoes (wet, uneven floor)"],
        optional: ["A light layer — it's cool inside", "A camera that copes with low light"]
      },
      stats: {
        "Best for": "Something different / hot days",
        "Time needed": "1.5–2 hrs",
        "Hours": "Sun–Thu & Sat 9am–5pm; Fri split hours",
        "Vehicle": "Any car",
        "Entry": "~OMR 7 adults / OMR 3.5 children (foreign visitors)",
        "Booking": "Recommended — timed slots"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Hoota+Cave+Oman",
      verify: true
    },
    {
      id: "jabal-akhdar", cat: "experiences", free: false,
      name: "Jabal Akhdar",
      tagline: "Rose terraces, cold air, and villages hanging off a cliff.",
      blurb: "The Green Mountain — cool enough to grow roses and pomegranates, high enough that you'll want a jacket in the evening. The terraced village walk is one of the best easy hikes in Oman.",
      img: "assets/experiences/jabal-akhdar.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons", region: "dakhiliyah", coords: [23.070, 57.665],
      hours: 5, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["hiking","culture","photography"],
      guide: "",
      hikeTime: "2–3 hrs for the terraced-village loop; longer trails available",
      bring: {
        essential: ["4×4 — there's a checkpoint and they turn 2WDs back", "Warm layer for the evening", "Water"],
        optional: ["Go Mar–Apr for the rose harvest", "Good camera — terraces at dawn", "Cash for village stalls"]
      },
      stats: {
        "Best for": "Cool air / terraced villages",
        "Time needed": "Half–full day",
        "Hike": "2–3 hrs (village loop)",
        "Vehicle": "4×4 REQUIRED — enforced at a checkpoint",
        "Best season": "Oct–Apr (roses Mar–Apr)",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Jabal+Akhdar+Oman",
      verify: true
    },
    {
      id: "musandam-dhow", cat: "experiences", free: false,
      name: "Musandam dhow cruise",
      tagline: "Norway's fjords, dropped into Arabia.",
      blurb: "Limestone walls falling hundreds of metres straight into dark blue water, dolphins riding the bow, and swimming stops you can't reach any other way.",
      img: "assets/experiences/musandam-dhow.jpg",
      imgCredit: "Photo: Toppazz · CC BY 3.0 · Wikimedia Commons", region: "musandam", coords: [26.180, 56.245],
      hours: 6, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["wildlife","snorkel","photography","beach"],
      guide: "required",
      swimTime: "1–2 hrs at the dhow's swim and snorkel stops",
      bring: {
        essential: ["Booking", "Sun protection — no shade on deck for long stretches", "Towel"],
        optional: ["Own mask & snorkel", "Motion-sickness tablet", "Cash", "Zoom lens for the dolphins"]
      },
      stats: {
        "Best for": "Fjords / dolphins / snorkelling",
        "Time needed": "Half–full day",
        "Swim": "Yes",
        "Getting there": "Fly or drive to Khasab — a separate trip from a Muscat base",
        "Best season": "Oct–Apr",
        "Booking": "Ahead in peak season"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Khasab+Musandam+Oman",
      verify: true
    },

    /* ════════════════════════════════════════════════════════════════ FOOD
       Researched, well-known spots — SWAP THESE FOR THE ONES YOU ACTUALLY EAT
       AT. Your real picks are worth more than any list off the internet.      */
    {
      id: "cafe-la-miel", cat: "food", sub: "Coffee", free: true,
      name: "La Miel Specialty Coffee",
      tagline: "The pre-wadi flat white.",
      blurb: "Al Ghubrah. Properly sourced beans, properly pulled shots, and a room that doesn't feel like a hotel lobby. This is where I start a driving day.",
      img: "assets/food/cafe-la-miel.jpg",
      imgCredit: "Photo: Irvan Ary Maulana · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.588, 58.408],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty coffee", "Area": "Al Ghubrah", "Price": "$", "Best for": "Morning / before a drive", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=La+Miel+Specialty+Coffee+Muscat",
      verify: true,
      whatYoullDo: "Coffee, a pastry, and get on the road before the traffic. Twenty minutes, not an hour.",
      tips: ["Be out the door by 9am on a wadi day — you want to be past Quriyat by 10."]
    },
    {
      id: "food-bait-al-luban", cat: "food", sub: "Traditional", free: true,
      name: "Bait Al Luban",
      tagline: "Shuwa, with a view of the harbour.",
      blurb: "In a restored khan across from the Mutrah fish market. Traditional Omani done properly — shuwa (meat buried and slow-cooked for a day), mashuai, harees — and portions two people can share.",
      img: "assets/food/food-bait-al-luban.jpg",
      imgCredit: "Photo: Erkan Pinar · CC BY 2.0 · Wikimedia Commons", region: "muscat", coords: [23.617, 58.564],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Traditional Omani", "Must-order": "Shuwa", "Area": "Mutrah", "Price": "$$", "Best for": "Dinner with a view", "Book?": "Worth booking at sunset" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bait+Al+Luban+Muscat",
      verify: true,
      whatYoullDo: "Order the shuwa. Sit upstairs by the window if you can — the harbour at dusk does half the work.",
      tips: ["Portions are big. Two mains between three people is usually enough."]
    },
    {
      id: "cafe-qaha", cat: "food", sub: "Coffee", free: false,
      name: "Qaha Specialty Coffee",
      tagline: "Omani coffee culture, modernised.",
      blurb: "White-and-blue, calm, and serious about the coffee. The slow morning where you're not going anywhere in a hurry.",
      img: "assets/food/cafe-qaha.jpg",
      imgCredit: "Photo: Justwiki · CC0 · Wikimedia Commons", region: "muscat", coords: [23.588, 58.408],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty coffee", "Area": "Al Maha St", "Price": "$", "Best for": "A slow morning", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Qaha+Specialty+Coffee+Muscat",
      verify: true
    },
    {
      id: "cafe-azura", cat: "food", sub: "Coffee", free: false,
      name: "Azura — The Coffee Company",
      tagline: "The roastery. For people who care about the bean.",
      blurb: "Specialty café and roastery, and the one the coffee people in Muscat send you to. Take beans home.",
      img: "assets/food/cafe-azura.jpg",
      imgCredit: "Photo: Ioacc1234red · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.588, 58.408],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty coffee / roastery", "Area": "Muscat", "Price": "$$", "Best for": "Buying beans", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Azura+The+Coffee+Company+Muscat",
      verify: true
    },
    {
      id: "cafe-farah", cat: "food", sub: "Coffee", free: false,
      name: "Café Farah",
      tagline: "Coffee on the sand at Azaiba.",
      blurb: "Right on Azaiba Beach. Come for the view as much as the cup — this is the sunset coffee, not the 7am one.",
      img: "assets/food/cafe-farah.jpg",
      imgCredit: "Photo: Andy Li · CC0 · Wikimedia Commons", region: "muscat", coords: [23.610, 58.380],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","sunset"], guide: "",
      stats: { "Type": "Beachfront café", "Area": "Azaiba Beach", "Price": "$$", "Best for": "Sunset", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+Farah+Azaiba+Beach+Muscat",
      verify: true
    },
    {
      id: "food-kargeen", cat: "food", sub: "Dinner", free: false,
      name: "Kargeen",
      tagline: "Lantern-lit courtyards and grilled kingfish.",
      blurb: "The one everyone ends up at, and deservedly. Eat outside under the lanterns; order the mashuai (grilled kingfish with rice) and the Omani bread with dips.",
      img: "assets/food/food-kargeen.jpg",
      imgCredit: "Photo: Dingli35 · CC BY-SA 3.0 · Wikimedia Commons", region: "muscat", coords: [23.588, 58.408],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Omani / grill", "Must-order": "Mashuai (grilled kingfish)", "Area": "Madinat Qaboos", "Price": "$$", "Best for": "A long dinner outside", "Book?": "Yes, at weekends" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Kargeen+Muscat",
      verify: true
    },
    {
      id: "food-bin-ateeq", cat: "food", sub: "Traditional", free: false,
      name: "Bin Ateeq",
      tagline: "Eat on the floor, like you're meant to.",
      blurb: "Family-run, private curtained rooms, cushions on the floor. Unfussy, unbranded, and about as close as a restaurant gets to eating in an Omani home.",
      img: "assets/food/food-bin-ateeq.jpg",
      imgCredit: "Photo: Sammy Six · CC BY 2.0 · Wikimedia Commons", region: "muscat", coords: [23.588, 58.408],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Traditional Omani", "Must-order": "Maqbous / harees", "Area": "Al Khuwair", "Price": "$", "Best for": "Lunch", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bin+Ateeq+Restaurant+Muscat",
      verify: true
    },
    {
      id: "food-halwa", cat: "food", sub: "Sweets", free: false,
      name: "Omani halwa — Mutrah Souq",
      tagline: "Watch them stir it in the copper pot.",
      blurb: "Rosewater, saffron, cardamom, nuts, and an arm-aching amount of stirring. Buy it where they make it, not where they box it.",
      img: "assets/food/food-halwa.jpg",
      imgCredit: "Photo: Silpa11 · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.617, 58.594],
      hours: 0.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Sweets / halwa", "Must-order": "Omani halwa (black or saffron)", "Area": "Mutrah Souq", "Price": "$", "Best for": "Gifts", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Omani+halwa+Mutrah+Souq",
      verify: true
    },

    /* ══════════════════════════════════════════════════════════ SHOPPING */
    {
      id: "shop-mutrah-souq", cat: "shopping", sub: "Traditional souq", free: true,
      name: "Mutrah Souq",
      tagline: "The oldest souq in Oman — go at dusk.",
      blurb: "Frankincense, silver khanjars, pashminas and a maze of covered alleys that's been trading for two centuries. Touristy at the front, real the deeper you go.",
      img: "assets/shopping/shop-mutrah-souq.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons", region: "muscat", coords: [23.617, 58.592],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","photography"], guide: "",
      stats: { "Type": "Traditional souq", "Best time": "5–9pm", "Haggling": "Expected — start around half", "Cards": "Bigger shops yes; carry cash", "Best buys": "Frankincense + burner, silver, halwa" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Mutrah+Souq+Muscat",
      verify: true
    },
    {
      id: "shop-seeb-souq", cat: "shopping", sub: "Traditional souq", free: false,
      name: "Seeb Souq",
      tagline: "Where Muscat actually shops — fish, dates and zero tourists.",
      blurb: "A working local souq on the Seeb waterfront: the morning fish auction, dates by the kilo, abayas and kummas. Nothing here is staged for visitors — that's the point.",
      img: "", region: "muscat", coords: [23.670, 58.189],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","food","photography"], guide: "",
      stats: { "Type": "Local souq", "Best time": "Early morning (fish) or after 5pm", "Haggling": "Gentle", "Cards": "Cash mostly", "Best buys": "Dates, fish, kummas" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Seeb+Souq",
      verify: true
    },
    {
      id: "shop-nizwa-souq", cat: "shopping", sub: "Traditional souq", free: false,
      name: "Nizwa Souq",
      tagline: "Pottery, silver and the Friday goat market.",
      blurb: "The interior's great souq under the fort: dates, pottery, copper and the famous Friday-morning livestock auction — get there by 7am or you've missed the show.",
      img: "assets/shopping/shop-nizwa-souq.jpg",
      imgCredit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons", region: "dakhiliyah", coords: [22.932, 57.531],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","photography"], guide: "",
      stats: { "Type": "Traditional souq", "Best time": "Friday 6:30–9am for the goat market", "Haggling": "Expected", "Cards": "Carry cash", "Best buys": "Pottery, silver, Nizwa dates" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Nizwa+Souq",
      verify: true
    },
    {
      id: "shop-al-sharaa", cat: "shopping", sub: "Speciality", free: false,
      name: "Al Sharaa",
      tagline: "The shop I send everyone to before they fly home.",
      blurb: "[Describe Al Sharaa in a line or two — what it sells, why it beats the airport souvenirs, and what you always walk out with. This one's yours to write.]",
      img: "", region: "muscat", coords: null,
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Speciality shop", "Best time": "[fill in]", "Cards": "[fill in]", "Best buys": "[fill in]" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Sharaa+Muscat",
      verify: true, needsFirstHand: true
    },
    {
      id: "shop-amouage", cat: "shopping", sub: "Speciality", free: false,
      name: "Amouage Visitor Centre",
      tagline: "Oman's world-famous perfume house — at the source.",
      blurb: "One of the most valuable perfume brands on earth is Omani, and the factory visitor centre sells the full range with tester bars and a tour of the production floor. A bottle here is the souvenir that outclasses everything else.",
      img: "assets/shopping/shop-amouage.jpg",
      imgCredit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons", region: "muscat", coords: [23.541, 58.183],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture"], guide: "",
      stats: { "Type": "Perfume house / factory", "Time needed": "1–1.5 hrs", "Cards": "Yes", "Best buys": "Their classics — test before you choose" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Amouage+Visitor+Centre+Muscat",
      verify: true
    },
    {
      id: "shop-mall-of-oman", cat: "shopping", sub: "Mall", free: true,
      name: "Mall of Oman",
      tagline: "The big one — with an indoor snow park.",
      blurb: "The country's largest mall: every brand you'd expect, a huge food court, cinema and Snow Oman for when the kids (or you) need a break from 45°C. This is where midday hides in summer.",
      img: "assets/shopping/shop-mall-of-oman.jpg",
      imgCredit: "Photo: Mariacaminod · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.565, 58.238],
      hours: 2.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Mall", "Highlights": "Snow Oman, cinema, food court", "Cards": "Everywhere", "Best time": "Midday — it's air-conditioned escape" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Mall+of+Oman+Muscat",
      verify: true
    },
    {
      id: "shop-avenues-mall", cat: "shopping", sub: "Mall", free: true,
      name: "Oman Avenues Mall",
      tagline: "Central, calm and easy.",
      blurb: "Big, central and rarely overwhelming — Carrefour for road-trip supplies, plus the usual brands and cafés. The practical stop, not the destination.",
      img: "assets/shopping/shop-avenues-mall.jpg",
      imgCredit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.590, 58.427],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Mall", "Highlights": "Carrefour, central location", "Cards": "Everywhere", "Best for": "Stocking up before a road trip" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Oman+Avenues+Mall",
      verify: true
    },
    {
      id: "shop-city-centre", cat: "shopping", sub: "Mall", free: true,
      name: "City Centre Muscat",
      tagline: "Closest big mall to the airport.",
      blurb: "The reliable all-rounder near Seeb and the airport — good for a last-day sweep: dates, chocolates, and anything you forgot to buy properly.",
      img: "assets/shopping/shop-city-centre.jpg",
      imgCredit: "Photo: Mostafameraji · CC BY-SA 4.0 · Wikimedia Commons", region: "muscat", coords: [23.607, 58.256],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Mall", "Highlights": "Near the airport", "Cards": "Everywhere", "Best for": "Last-day souvenir sweep" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=City+Centre+Muscat",
      verify: true
    }
  ],

  /* ══════════════════════════════════════════════════════════ ITINERARIES */
  itineraries: [
    {
      id: "escape-3day", cat: "itineraries", free: true,
      name: "The 3-Day Muscat & Wadis Escape",
      tagline: "Short on time? This is the perfect long weekend.",
      blurb: "Muscat, the coast road, and the two best wadis within reach. First-timer proof, mostly 2WD.",
      img: "assets/itineraries/escape-3day.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      stats: { "Best for": "First-timers", "Base": "Muscat + 1 night east", "Car": "2WD ok mostly", "Days": "3" },
      days: [
        { title: "Day 1 — Muscat & the coast", body: "Morning: the Grand Mosque (be there by 10am — the non-Muslim window shuts at 11). Afternoon: a swim at Qantab or Yiti. Evening: Mutrah Corniche at dusk, then the souq, then dinner at Bait Al Luban. Stay in Muscat.", spots: ["grand-mosque","yiti-qantab","mutrah","food-bait-al-luban"] },
        { title: "Day 2 — Bimmah + Wadi Shab", body: "Coffee early, then drive the coast road east. Quick swim at Bimmah Sinkhole (an hour, no more), then Wadi Shab for the afternoon — boat across, walk in, swim into the cave. Stay near Tiwi/Sur.", spots: ["bimmah-sinkhole","wadi-shab"] },
        { title: "Day 3 — Wadi Tiwi & back", body: "A slow morning in Wadi Tiwi (minutes from Shab and a fraction of the crowds), lunch on the coast, easy drive back to Muscat.", spots: ["wadi-tiwi"] }
      ]
    },
    {
      id: "loop-7day", cat: "itineraries", free: false,
      name: "The 7-Day Ultimate Oman Loop",
      tagline: "Mountains, wadis, desert and coast — the full circle.",
      blurb: "The route I'd drive if I had a week: the coast, the turtles, a night in the dunes, Nizwa, the mountains, and a canyon on the way home.",
      img: "assets/itineraries/loop-7day.jpg",
      imgCredit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons",
      stats: { "Best for": "The full picture", "Base": "Moving loop", "Car": "4×4 recommended", "Days": "7" }
    },
    {
      id: "adventure-5day", cat: "itineraries", free: false,
      name: "The 5-Day Adventure Route",
      tagline: "For people who came here to get wet and tired.",
      blurb: "No forts, no souqs. Canyoning, bouldering, cliff jumps and the wadis that hurt. 4×4 and real fitness required — this is the one I'd do myself.",
      img: "assets/itineraries/adventure-5day.jpg",
      imgCredit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons",
      stats: { "Best for": "Fit, adventurous, been here before", "Base": "Moving", "Car": "4×4 required", "Days": "5" }
    }
  ],

  // Planner interest options — these must match the `tags` used on spots.
  interests: [
    { id: "swimming",   label: "Swimming & wadis", icon: "💧" },
    { id: "snorkel",    label: "Snorkelling",      icon: "🐠" },
    { id: "hiking",     label: "Hiking",           icon: "🥾" },
    { id: "canyoning",  label: "Canyoning",        icon: "🧗" },
    { id: "adrenaline", label: "Adrenaline",       icon: "⚡" },
    { id: "beach",      label: "Beaches",          icon: "🏖️" },
    { id: "desert",     label: "Desert",           icon: "🐪" },
    { id: "culture",    label: "Culture & history",icon: "🕌" },
    { id: "wildlife",   label: "Wildlife",         icon: "🐢" },
    { id: "photography",label: "Photography",      icon: "📸" },
    { id: "food",       label: "Food & coffee",    icon: "☕" },
    { id: "sunset",     label: "Sunsets",          icon: "🌅" },
    { id: "camping",    label: "Camping",          icon: "⛺" },
    { id: "shopping",   label: "Souqs & shopping", icon: "🛍️" }
  ],

  /* The Info tab — free for everyone. Edit freely; `affiliate` on an item
     drops in the matching link from meta.affiliates when you've set it. */
  info: {
    intro: "The stuff I tell every visitor before they land — ten minutes here saves you real money and real hassle.",
    sections: [
      { icon: "📜", title: "Rules & etiquette", items: [
        { name: "Dress modestly", text: "Shoulders and knees covered in villages, souqs and anywhere religious. Swimwear is fine at hotel pools and in the wadis — just cover up for the walk through the village to get there." },
        { name: "The weekend is Friday–Saturday", text: "Friday morning the country slows down for prayers — souqs and small shops open late. Plan a wadi or a slow breakfast, not errands." },
        { name: "Alcohol", text: "Licensed hotel bars and restaurants only. Never in public, never on a beach, never in the car." },
        { name: "Drones need a permit", text: "Flying without one risks confiscation at the airport. Unless you've done the paperwork in advance, leave it at home." },
        { name: "Ask before photographing people", text: "Especially women and elders. Omanis are famously welcoming — asking first is what keeps it that way." }
      ]},
      { icon: "💡", title: "Pro tips", items: [
        { name: "Download OTaxi before you land", text: "Oman's ride-hailing app — fixed fair prices, no haggling. An airport pickup without it can cost triple." },
        { name: "Download Talabat", text: "Food delivery for everything from shawarma to groceries. You'll thank yourself the evening you crawl back from a wadi too tired to move." },
        { name: "Cards work almost everywhere", text: "Malls, restaurants and hotels all take card. Keep 10–20 OMR in cash for village shops, wadi parking and souq haggling." },
        { name: "Download offline maps", text: "Signal disappears in the mountains and canyons. Save the Muscat area and your route in Google Maps before you leave wifi.", affiliate: "esim", affLabel: "Get an Oman eSIM →" }
      ]},
      { icon: "🚗", title: "Getting around — best to worst", ranked: true, items: [
        { name: "Rent a car", text: "The only way to really do this country — the best places aren't on any bus route. A 4×4 opens everything; a 2WD still covers the classics.", affiliate: "car", affLabel: "Rent a car →" },
        { name: "OTaxi inside the city", text: "Cheap, metered and reliable around Muscat and Salalah. It just won't take you down a wadi track." },
        { name: "Hire a guide with a car", text: "The best of both for the hard spots — local knowledge, proper vehicle, zero stress. Costs more, worth it for Snake Gorge-grade days.", affiliate: "guide", affLabel: "Book a guided trip →" },
        { name: "Mwasalat buses", text: "Clean, cheap intercity coaches (Muscat–Sur, Muscat–Nizwa, Muscat–Salalah). Fine for moving between cities; useless for the spots themselves." },
        { name: "Street taxis", text: "No meter. If you must: agree the price before you get in, and halve the first number you hear." }
      ]},
      { icon: "💰", title: "Money", items: [
        { name: "The rial is strong", text: "1 OMR ≈ USD 2.60 — prices look small until you multiply. ATMs are everywhere and exchange rates at the airport are fine." },
        { name: "Tipping", text: "Not expected anywhere. Rounding up a taxi or leaving a rial for great service is appreciated, never demanded." }
      ]},
      { icon: "🆘", title: "If something goes wrong", items: [
        { name: "9999", text: "One number for police and ambulance, nationwide." },
        { name: "Flash floods", text: "The one real danger here. If rain is forecast anywhere upstream — even under blue sky where you stand — stay out of the wadi. Every year someone doesn't." }
      ]}
    ]
  }
};

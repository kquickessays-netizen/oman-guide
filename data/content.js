/* =============================================================================
   EXPLORING OMAN, CONTENT DATA (free / public tier)
   -----------------------------------------------------------------------------
   THIS IS THE FILE YOU EDIT TO CHANGE THE APP. Plain JSON wrapped in one line of
   JS so it also works when you just double-click index.html locally.

   To add a spot: copy a block, change the fields, save, refresh. It appears in
   its tab, in search, and in the itinerary planner automatically.

   FIELD REFERENCE
     id            unique slug, no spaces            "wadi-shab"
     cat           wadis | beaches | mountains | salalah | experiences |
                   food | shopping | itineraries
                   ← WHICH TAB it lives in. Explore shows six of these;
                     the Salalah tab shows cat:"salalah".

     group         THE FILTER CHIP. The broad bucket: wadis | beaches |
                   mountains | experiences | food | shopping.
                   Defaults to `cat`, so you only set it when the two differ, 
                   which is exactly the Salalah spots: they're all cat:"salalah"
                   (so they sit in the Salalah tab) but a beach in Dhofar is
                   still group:"beaches".
                   SIX chips, not twenty. Don't invent new ones.

     type          THE SUB-TAG ON THE CARD. What kind of thing this particular
                   one is, invent freely, it doesn't add a filter chip:
                   Beach · Mountain · Wadi · Waterfall · Canyon · Cave · Spring ·
                   Viewpoint · Village · Fort · Museum · Ruins · Mosque · Souq ·
                   Mall · Shop · Desert · Snorkel · Boat trip · Swim spot ·
                   Wildlife · Nature · Hike · Dam · Coffee · Omani food ·
                   Dinner · Sweets
     sub           optional sub-label shown as a chip ("Coffee", "Seafood"…)
     name, tagline, blurb
     free          true = visible to everyone (your shop window)
                   false = locked; the detail lives in premium.js
     img           "../assets/wadis/shab.jpg"  ("" = grey placeholder)
     region        muscat | batinah | coast-east | sharqiyah | dakhiliyah |
                   rustaq | musandam | dhofar
     coords        [lat, lng], approximate
     hours         hours actually spent there (the planner budgets with this)
     hikeTime      "45–60 min each way"  ← shown in the stat box
     swimTime      "1–2 hrs in the water"
     bring         { essential: [...], optional: [...] }  ← the packing list
     fitness       1 (anyone) … 5 (serious)
     needs4x4 / swim / kidOk    hard filters in the planner
     months        [1..12] the BEST months (usually = not brutal heat). Spots
                   are NEVER hidden or excluded outside these months, the app
                   shows a "🌡️ Best Oct–Apr" chip + go-early advice instead,
                   and the planner schedules them in the coolest morning slots.
     tags          swimming, hiking, canyoning, snorkel, wildlife, culture,
                   desert, beach, photography, food, adrenaline, sunset, camping
     guide         "" | "recommended" | "required"
     stats         the fact box, any label/value pairs
     mapUrl        Google Maps link
     insta         link (or ARRAY of links) to your Instagram reel(s) filmed at
                   this spot. Renders a "🎬 Watch my reel" button on the detail
                   sheet and a 🎬 chip on the card. Clicks tracked (insta_click).
     travellerTips [{text, by}], reader tips YOU chose to publish, shown in
                   the detail sheet as "Traveller tips, verified by me".
                   Source: the reviews table in Supabase. Curation = moderation:
                   nothing appears in the app unless you paste it here.
     verify        true = researched from public sources, NOT yet confirmed by
                   you. The app shows a small "confirm on the day" note.
                   Set to false once you've checked it yourself.
   ========================================================================== */

window.OMAN_DATA = {

  meta: {
    creator: "@hussain_explores",
    // Not rendered anywhere right now, the About byline is just name + handle,
    // because this line only repeated the "Licensed Oman tour guide" badge
    // sitting two centimetres below it. Kept in case you want it back.
    creatorLine: "Omani content creator · Licensed Oman tour guide 🪪",
    tagline: "90+ spots across Oman: where they are, how hard they are, what to bring.",

    // >>> THE HOOK, the first line on the About tab, and the hardest-working
    //     twelve words in the app. It is a real question people send you, kept
    //     in quotation marks on purpose: it's the reader's own words before
    //     they've read a single claim of yours. The sub-line explains why the
    //     app exists in one breath.
    //     If you ever rewrite these: no adjectives, no brochure language, and
    //     never repeat something a badge below already says. <<<
    aboutHook: "Where is this, and how do I get there?",
    aboutSub: "I get that DM every day. So I stopped typing the answer and built this.",
    email: "exploree.oman@gmail.com",
    instagram: "https://instagram.com/hussain_explores",
    instagramHandle: "@hussain_explores",

    // >>> YOUR PHOTO on the About tab. Save the close-up headshot (the smiling
    //     one) as app/assets/hussain.jpg and it appears; until the file
    //     exists the placeholder circle shows instead. The headshot, not the
    //     camel shot: the avatar renders 74px wide, and only a face that
    //     fills the frame survives that size. <<<
    aboutPhoto: "assets/hussain.jpg",

    // >>> FREE LAUNCH MODE <<<
    // true  = the ENTIRE guide is free for everyone: all spots, itineraries
    //         and the Planner. Buy buttons disappear; the ask everywhere
    //         becomes "leave your email" (founding-explorer list) + reviews.
    //         Use this phase to build users, emails and reviews through the
    //         khareef, with Supabase tracking every step.
    // false = the paywall is ON (normal paid mode).
    // THE PLAN: flip to false in early October, before the Oct–Apr peak.
    // Announce the flip as content ("the guide becomes paid on Friday"), and
    // give the founding-explorer email list a discount code on day one.
    freeLaunch: true,

    // >>> HARD LOCKS, these override freeLaunch. <<<
    // salalahComingSoon: the Salalah tab shows a "coming soon" panel instead
    //   of its spots. The 26 Dhofar spots stay in this file untouched; flip to
    //   false and the tab is live again.
    // plannerLocked: "Build your own" on the Plan tab shows the locked pitch
    //   instead of the form, even during free launch. Flip to false when the
    //   Planner should open (e.g. with the October paid launch).
    salalahComingSoon: true,
    plannerLocked: true,

    // ONE product, ONE price, ONE key. It unlocks every locked spot, both extra
    // itineraries and the Planner, forever, updates included. (There used to be
    // nine per-tab guides; the tabs merged, so the products did too.)
    // PRICING PLAN (see MONETIZATION.md): $9.99/OMR 3.9 is the LAUNCH INTRO
    // ("first 100 buyers"). ~Week 5: raise to $14.99/OMR 4.9 here + on Gumroad
    // + announce the raise (reliably the best sales day). 12-month target: $19.
    bundlePrice: "$9.99",
    bundlePriceNum: 9.99,

    // Shown in the banner at the top of every tab. Change the date each month, 
    // this line is the whole reason an app beats a PDF.
    lastUpdated: "July 2026",
    updateNote: "I add new spots and re-check prices, opening hours and road conditions every month.",

    // Where shared plans point people (your bio link / deployed app URL).
    // Leave "" until deployed; the share footer falls back to Instagram.
    storeUrl: "https://exploresoman.com/",

    // "What's new", shown on the About tab, collapsed. Newest entry FIRST.
    // This is the proof behind "updated monthly".
    //
    // RULE: the newest entry gets EIGHT items, maximum. Eight is the whole
    // month at a glance. When you publish a new month, push the old month's
    // items down into the "Earlier" entry at the bottom and start fresh.
    // Everything below the first entry renders inside a second fold, so the
    // history is kept without anyone having to scroll past it.
    changelog: [
      { date: "Late July 2026", items: [
        "🎬 The reels audit: every place I've filmed is in the guide with its reel attached — Sidab's coves, Qantab's ten beaches, the Sifah shark shallows, Matrah Fort, Ain Al Kasfah, Hijrat Al Sheikh, Batch, Rozna.",
        "🌌 Seasonal experiences get their own entries: bioluminescence, rose season, whale-shark summer.",
        "🗓️ New one-day plan: The Perfect Wadi Shab Day, with real costs.",
        "🗺️ The country got bigger: Musandam properly (Khasab, Bukha, Khor Najd), Sur and its dhow yard, Masirah, Bar Al Hikman, the pink lakes and the Empty Quarter.",
        "🏛️ Museums with real hours: the National Museum, Oman Across Ages, the Frankincense Land.",
        "🧗 Adventure bookings: via ferrata, Wadi Dayqah's zipline park, Wahiba ballooning, Majlis Al Jinn.",
        "🐐 Nizwa Fridays: the goat market and the old quarter join the guide.",
        "🚌 Info tab: the land-border kit, and domestic flights join the transport ladder.",
        "🧾 Itineraries rebuilt hour by hour with real receipts: the 1-day, the 3-day, and the new 5-Day Grand Tour."
      ]},

      { date: "July 2026", items: [
        "🎁 Launch season: the whole guide is free, every spot, every itinerary, the Planner. It goes paid in October.",
        "♥ Save spots and tick off where you've been. No account, your phone remembers.",
        "🌡️ One-tap filters: In season now · No 4×4 · Kids OK · Saved.",
        "⚠️ Every wadi now carries the flash-flood rule, and your plan has a one-tap \"send to family\" copy on WhatsApp.",
        "🤝 Plan my trip with Hussain, leave your details and I'll plan it with you personally.",
        "⛺ Camping: five spots with kit lists and the rules, Fins, Ras Al Hadd, Jabal Shams, Jabal Akhdar, Sugar Dunes.",
        "📍 16 new spots up north, the castle circuit, the beehive tombs, Wadi Al Hoqain, the Salma Plateau caves.",
        "🎬 Spots I've filmed now carry a Watch-my-reel button."
      ]},

      { date: "Earlier", items: [
        "🗣️ Tell me if a spot was worth it, one tap, plus an optional tip. The best get published with your name on them.",
        "✨ New look: photos front and centre, and the tabs moved to a bottom bar on phones.",
        "📲 Share any spot or your whole plan straight to WhatsApp.",
        "Marjan Beach: snorkel with green turtles inside the city, no boat needed.",
        "Salalah grew by 16 spots, Tawi Atair, Teeq Cave, Ayn Khor, Ayn Garziz, Marneef Cave, the frankincense buying guide.",
        "Five tabs instead of twelve. Everything north lives in Explore, filtered by chips.",
        "One price: $9.99 unlocks the whole guide. No more separate guides to buy.",
        "31 spots are free, including Wadi Tiwi, Nizwa, Misfat, Jabal Akhdar, Al Hoota Cave and Khor Rori.",
        "Every spot carries a type tag, beach, souq, waterfall, fort, and every tab has a filter row.",
        "Mountains: Jabal Shams, Jabal Akhdar, Wakan, Bilad Sayt, Sharaf Al Alamayn.",
        "Salalah: khareef season, Wadi Darbat, the frankincense coast, the empty beaches west.",
        "Planner: fuller days, the Grand Mosque scheduled inside its 8–11am window, Salalah-based trips.",
        "Heat-smart planning: summer days start 06:30 and the hottest spots get the coolest slots.",
        "Info tab: rules, SIMs and eSIM, transport ranked best to worst, money, emergency numbers.",
        "Map tab: every spot in the guide on one map.",
        "App launched: everything in one place, installable, works offline."
      ]}
    ],

    // >>> PASTE YOUR REAL GUMROAD LINK HERE, one product, that's it. <<<
    //     js/unlock.js reads the permalink out of this URL, so there is
    //     nothing else to edit anywhere. See delivery/GUMROAD-SETUP.md.
    buyLinks: {
      bundle: "https://gumroad.com/l/YOUR-BUNDLE"
    },

    // >>> AFFILIATE SLOTS, one link each, dropped in everywhere relevant.
    //     See delivery/GUMROAD-SETUP.md for which programs fit each slot. <<<
    affiliates: {
      esim: "", // Airalo / Holafly
      car: "", // car rental (DiscoverCars / Rentalcars)
      hotel: "", // Booking.com
      gear: "", // gear list (Amazon Associates or a kit.co page)
      guide: "", // your tour-operator referral
      tours: ""       // GetYourGuide / Viator, general tours & activities
    },

    // >>> AFFILIATE ATTRIBUTION, appended to every affiliate link so partners
    //     can see the traffic came from you. utm_* works everywhere; `ref` is
    //     for operators who give you a personal code. Empty strings = skipped.
    //     discountCode: shown beside affiliate buttons ("use code X for 10% off")
    //     once an operator gives you one, leave empty until then. <<<
    affRef: {
      utm_source: "exploring-oman",
      utm_medium: "guide-app",
      ref: "", // e.g. "HUSSAIN", your personal partner code
      discountCode: "", // e.g. "HUSSAIN10"
      discountLabel: ""     // e.g. "10% off with code"
    },

    // >>> TESTIMONIALS, hand-picked quotes from real buyers (Gumroad
    //     receipts, DMs, the reviews table). Shown on the price block and in
    //     the unlock modal. Start empty; add as they arrive. Keep them short.
    //     Format: { text: "Planned our whole trip with this.", by: "Sara, UK" } <<<
    testimonials: [],

    // >>> BACKEND (optional), paste your Supabase project URL + anon key to
    //     turn on interaction analytics + the email list. Empty = fully off.
    //     Setup steps: delivery/BACKEND-SETUP.md <<<
    backend: {
      url: "https://bfneutpsjyfqferkublh.supabase.co",
      anonKey: "sb_publishable_kHrIcnawDTYNmumFholkYQ_F8k7Z24d" // publishable key (new-format anon), safe to ship
    }
  },

  // The tabs. Reorder / rename / add freely, the app builds nav from this.
  // Info sits first in the bar; the app still LANDS on Wadis (see route(), 
  // the empty-hash default), which is exactly the intended combination.
  // `intro` = the explainer at the top of the tab. Give it an ARRAY and it
  // renders as a bullet list (preferred, nobody reads paragraphs on a phone).
  // A plain string still works and renders as one line.
  /* FIVE tabs. `cats` = which spot categories a tab shows, the old per-subject
     tabs (wadis, beaches, mountains…) are now TYPE CHIPS inside Explore, built
     automatically from each spot's `type`. A spot's `cat` still exists: it's how
     the data is organised, not how it's navigated. */
  categories: [
    { id: "info", label: "Info", icon: "ℹ️", blurb: "Rules, money, SIMs, transport, read before you land.", special: "info" },

    // NOTE ON `intro`: only write one where it tells the reader something the
    // screen doesn't already show them. Explore's used to describe the filter
    // chips sitting directly beneath it, so it's gone. Salalah's stays because
    // "you have to fly there" is the single most useful thing a visitor can
    // learn before they start planning a day trip that isn't possible.
    { id: "explore", label: "Explore", icon: "🧭", blurb: "Everything in the north, wadis, beaches, mountains, food, souqs.",
      cats: ["wadis", "beaches", "mountains", "experiences", "food", "shopping"] },

    { id: "salalah", label: "Salalah", icon: "🌴", blurb: "Dhofar, the monsoon-green south.",
      cats: ["salalah"],
      intro: [
        "A separate trip, not a day out of Muscat, 1,000km south, so you fly.",
        "Late June to early September: the khareef monsoon turns the coast green and the waterfalls run.",
        "Any other month: empty beaches and the frankincense coast, warm and quiet."
      ] },

    { id: "plan", label: "Plan", icon: "🗺️", blurb: "Build your own trip, or follow one of mine.", special: "planner",
      intro: [
        "Answer five questions and the planner routes a trip around you, days, pace, interests, fitness, vehicle, heat.",
        "Or scroll down for the hand-built routes: 3 days, 5 days, 7 days."
      ] },

    { id: "about", label: "About", icon: "👋", blurb: "Who's behind this.", special: "about" }
  ],

  /* Region model, the planner clusters days by region and costs the drive
     between them. `fly: true` means it's not drivable on a Muscat-based trip;
     the planner leaves those out and says so. */
  regions: {
    "muscat":     { label: "Muscat & around", base: "Muscat", coords: [23.588, 58.408] },
    "batinah":    { label: "The Batinah coast", base: "Al Sawadi", coords: [23.775, 57.790] },
    "coast-east": { label: "The east coast", base: "Tiwi / Sur", coords: [22.840, 59.230] },
    "sharqiyah":  { label: "Sharqiyah & the sands", base: "Bidiyah", coords: [22.440, 58.832] },
    "dakhiliyah": { label: "Nizwa & the mountains", base: "Nizwa", coords: [22.933, 57.533] },
    "rustaq":     { label: "Rustaq & Bani Awf", base: "Al Awabi", coords: [23.310, 57.520] },
    "musandam":   { label: "Musandam fjords", base: "Khasab", coords: [26.180, 56.245], fly: true },
    "dhofar":     { label: "Salalah & Dhofar", base: "Salalah", coords: [17.019, 54.089], fly: true }
  },

  // Drive time between region bases, in MINUTES. Symmetric. ESTIMATES, 
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
      id: "wadi-shab", cat: "wadis", free: true, type: "Wadi",
      name: "Wadi Shab",
      tagline: "The famous one, and for once the hype is real.",
      blurb: "A flat 45–60 min walk from the boat drop past a string of pools. The last 200m is swim-only: through a narrow gap into a cave with a waterfall inside it.",
      img: "assets/wadis/wadi-shab.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-shab-2.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-shab-3.jpg", credit: "Photo: Uhooep · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "coast-east", coords: [22.83896, 59.24598],
      hours: 5, fitness: 3, needs4x4: false, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","photography","canyoning"],
      guide: "",
      hikeTime: "45–60 min each way from the boat drop",
      swimTime: "1–2 hrs, the last 200m to the cave is swim-only",
      bring: {
        essential: ["Water shoes (grippy, drain fast)", "Dry bag, there is no dry route to the cave", "2L water per person", "Sun hat"],
        optional: ["Goggles or a mask, the cave is worth seeing underwater", "GoPro / waterproof phone case", "Waterproof head torch for the cave", "Small towel", "Cash for the boat (~OMR 1)"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "Half day (4–5 hrs)",
        "Hike": "45–60 min each way",
        "Swim": "Yes, into the cave",
        "Vehicle": "Any car + 2-min boat crossing",
        "Best season": "Oct–Apr",
        "Entry fee": "~OMR 1 pp (incl. boat)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.83896,59.24598",
      insta: "https://www.instagram.com/hussain_explores/reel/DUsh1oYDMQC/", // the 14K reel — confirmed Wadi Shab, THE video
      verify: true,
      gettingThere: [
        "Drive Route 17 south from Muscat toward Sur/Tiwi, 1h40 to 2h.",
        "Park at the free lot under the bridge. It's small: on a weekend, be there before 9am.",
        "Take the boat across, 2 minutes, about 1 OMR return, pay as you board. Last boat ~5pm.",
        "Walk in from the far bank: 45–60 min, mostly flat, along the wadi bed."
      ],
      whatYoullDo: [
        "Follow the path past a chain of turquoise pools, crossing the wadi bed a few times.",
        "Swim the last stretch, there is no dry route around it. Phone in a dry bag.",
        "Squeeze through the narrow gap in the rock at the end.",
        "Inside: a hidden cave with a waterfall in it. That's the reason you came."
      ],
      tips: [
        "Go early, it fills up by mid-morning.",
        "A dry bag is essential to get a phone to the cave.",
        "Leave valuables behind, you swim the last part."
      ]
    },
    {
      id: "wadi-bani-khalid", cat: "wadis", free: true, type: "Wadi",
      name: "Wadi Bani Khalid",
      tagline: "The easy one, and still stunning.",
      blurb: "The pools start at the car park: no hike, any car, 2.5 hrs from Muscat on Route 23. Walk 15–20 min upstream and the crowds are gone.",
      img: "assets/wadis/wadi-bani-khalid.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-bani-khalid-2.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-bani-khalid-3.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "sharqiyah", coords: [22.639, 59.012],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["swimming","photography"],
      guide: "",
      hikeTime: "None to the main pools, 15–20 min upstream to escape the crowds",
      swimTime: "As long as you like, this is a swimming day",
      bring: {
        essential: ["Modest swimwear, it's beside a village", "Water shoes", "Water"],
        essentialNote: "",
        optional: ["Goggles", "Towel", "Coins for the toilets (400 baisa) and changing tents (100 baisa)", "Picnic, there are shaded spots upstream"]
      },
      stats: {
        "Difficulty": "Easy",
        "Time needed": "2–4 hrs",
        "Hike": "None, pools are by the car park",
        "Swim": "Yes",
        "Vehicle": "Any car (2WD ok)",
        "Best season": "Year-round",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Bani+Khalid+Oman",
      insta: "https://www.instagram.com/hussain_explores/reel/DaNo9_NM7Wv/",
      verify: true,
      gettingThere: [
        "Take Route 23 inland from Muscat, 2.5 hrs, and tarmac almost the whole way.",
        "(Route 17 along the coast is prettier but closer to 4 hrs. Your call.)",
        "Park in the big lot right by the pools. Any car does it, no 4×4 needed."
      ],
      whatYoullDo: [
        "Skip the first pools by the car park, that's where everyone stops.",
        "Walk 15–20 min upstream. The crowds thin out and the water gets better.",
        "Keep going and there's a cave further in, if you want more than a swim."
      ],
      tips: [
        "Walk 15 min past the busy pools and you'll have it to yourself.",
        "Dress modestly, it's right next to a village."
      ]
    },
    {
      id: "wadi-mibam", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi Mibam",
      tagline: "4×4 only, which is why it's still empty.",
      blurb: "Fifteen minutes down from the parking to the first waterfall, then two or three pools you swim between. The last stretch of track is 4×4 only.",
      img: "assets/wadis/wadi-mibam.jpg",
      imgCredit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-mibam-2.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-mibam-3.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "coast-east", coords: [22.816, 59.204],
      hours: 5, fitness: 3, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","canyoning","photography","hiking"],
      guide: "recommended",
      hikeTime: "~15 min down to the first waterfall, more if you push on",
      swimTime: "1–2 hrs across 2–3 pools",
      bring: {
        essential: ["Water shoes, the rocks past the first pool are slippery", "Dry bag", "2L water", "4×4 (non-negotiable for the last stretch)"],
        optional: ["Goggles", "Rope-free scramble gloves if you're going deep", "Snacks, no shops anywhere near", "Spare shoes for the drive back"]
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
      insta: ["https://www.instagram.com/hussain_explores/reel/DXUH9xHDC1y/", // official Mibam video
              "https://www.instagram.com/hussain_explores/reel/DWHK3ACDOdD/"], // the 4×4 drive in (2h20 from Muscat)
      verify: true
    },
    {
      id: "wadi-al-arbeieen", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi Al Arbeieen",
      tagline: "Boulder-hop your way to pools nobody else is in.",
      blurb: "Less famous than Shab and it shows, you'll have whole pools to yourself. The catch is the approach: a graded gravel track through a mountain pass, then real bouldering over giant white rocks. It's a workout, and it's brilliant.",
      img: "assets/wadis/wadi-al-arbeieen.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-al-arbeieen-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-al-arbeieen-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.109, 58.802],
      hours: 6, fitness: 4, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","canyoning","photography","adrenaline"],
      guide: "recommended",
      hikeTime: "2–2.5 hrs each way to the upper pools, mostly bouldering, not walking",
      swimTime: "1–2 hrs. The deeper you go, the bigger and emptier the pools get",
      bring: {
        essential: ["Proper hiking shoes with grip that drain, this is the one that will hurt you without them", "3L water minimum", "Dry bag", "Sun protection, long stretches with no shade"],
        optional: ["Goggles for the deep pools", "Gloves for the boulders", "Packed lunch, most people eat at the top pool", "Trekking pole", "Head torch if you're cutting it fine on daylight"]
      },
      stats: {
        "Difficulty": "Hard-ish, lots of bouldering",
        "Time needed": "5–6 hrs of daylight minimum",
        "Hike": "2–2.5 hrs each way",
        "Swim": "Yes, deep pools, jumps for the brave",
        "Vehicle": "4×4 strongly recommended (10km graded gravel + water crossings)",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Al+Arbeieen+Oman",
      verify: true
    },
    {
      id: "wadi-damm", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi Damm",
      tagline: "Holds water all year, almost no wadi here does.",
      blurb: "One of the few wadis that holds water year-round. Most people crowd the first pool, which isn't even the best one, walk a little further into the canyon and the good ones are yours.",
      img: "assets/wadis/wadi-damm.jpg",
      imgCredit: "Photo: A1000 · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-damm-2.jpg", credit: "Photo: A1000 · CC0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-damm-3.jpg", credit: "Photo: A1000 · CC0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.190, 57.037],
      hours: 4, fitness: 3, needs4x4: true, swim: true, kidOk: false,
      months: [1,2,3,4,10,11,12],
      tags: ["swimming","hiking","photography"],
      guide: "",
      hikeTime: "30–40 min from the car park to the main pools",
      swimTime: "1–2 hrs. Sit down and slide in, the entry rocks are viciously slippery",
      bring: {
        essential: ["Water shoes, the pool edges are like ice", "Dry bag", "2L water"],
        optional: ["Goggles", "Mask, the water is clear enough to be worth it", "Picnic", "A second towel; you'll be in and out of several pools"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "Half day",
        "Hike": "30–40 min each way",
        "Swim": "Yes, water year-round, rare in Oman",
        "Vehicle": "4×4 recommended (2WD can park ~500m out and walk)",
        "Best season": "Nov–Mar (best water levels)",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Damm+Oman",
      verify: true
    },
    {
      id: "wadi-tiwi", cat: "wadis", free: true, type: "Wadi",
      name: "Wadi Tiwi",
      tagline: "Wadi Shab's quieter, prettier neighbour.",
      blurb: "Right next to Wadi Shab but with a fraction of the crowds. Terraced date plantations, blue pools, and tiny villages clinging to the cliffs as you drive deeper in.",
      img: "assets/wadis/wadi-tiwi.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-tiwi-2.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-tiwi-3.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "coast-east", coords: [22.815, 59.254],
      hours: 4, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","photography","culture"],
      guide: "",
      hikeTime: "Short, the drive in is the main event, then 20–30 min to the pools",
      swimTime: "1 hr or so",
      bring: {
        essential: ["Water shoes", "Modest clothing, you're driving through people's villages", "Water"],
        optional: ["Goggles", "Camera, the terraced plantations are the shot", "Small change for the village shops"]
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
      gettingThere: [
        "2–2.5 hrs from Muscat, right next to Wadi Shab off Route 17.",
        "Drive the paved road ~10km into the wadi, through plantations and villages.",
        "It's steep and narrow, go slowly, this is someone's street.",
        "Continuing to Mibam? 4×4, mandatory."
      ],
      whatYoullDo: [
        "The drive is the highlight: terraced plantations, cliffside villages.",
        "Park up and walk to the blue pools.",
        "Far fewer people than Wadi Shab, minutes away."
      ],
      tips: [
        "Pair it with Wadi Shab in one day, they're minutes apart.",
        "The road is tight. Mind the villagers: this is their street, not a track."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.815,59.254",
      verify: true
    },
    {
      id: "wadi-dayqah", cat: "wadis", free: false, type: "Dam",
      name: "Wadi Dayqah Dam",
      tagline: "The easy family day, kayaks, not scrambling.",
      blurb: "Oman's biggest dam, and now an adventure park around it: kayaks, paddleboards, pedal boats, a café at the viewpoint. Not a wild wadi, but it's the one you take people who don't want a wild wadi.",
      img: "assets/wadis/wadi-dayqah.jpg",
      imgCredit: "Photo: Paasikivi · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-dayqah-2.jpg", credit: "Photo: Paasikivi · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-dayqah-3.jpg", credit: "Photo: Paasikivi · CC BY-SA 3.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.08509, 58.84815],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["photography","wildlife"],
      guide: "",
      hikeTime: "None, it's a park",
      swimTime: "None. Swimming at the dam is restricted; you're on the water, not in it",
      bring: {
        essential: ["Cash for entry and boat hire", "Sun hat"],
        optional: ["Change of clothes if you're kayaking", "Dry bag for the phone", "Kids' sun gear"]
      },
      stats: {
        "Difficulty": "Easy, family",
        "Time needed": "Half day",
        "Hike": "None",
        "Swim": "No, kayak/paddle only",
        "Vehicle": "Any car",
        "Opening hours": "~8am–10pm",
        "Entry fee": "~OMR 1 pp (visitors), cash"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.08509,58.84815",
      verify: true
    },
    {
      id: "wadi-tanuf", cat: "wadis", free: true, type: "Wadi",
      name: "Wadi Tanuf",
      tagline: "A ruined village, a gorge, and almost nobody there.",
      blurb: "Palm groves, turquoise pools under small waterfalls, and the bombed-out ruins of old Tanuf village at the mouth of the gorge. Half an hour from Nizwa and a fraction of the traffic.",
      img: "assets/wadis/wadi-tanuf.jpg",
      imgCredit: "Photo: Harri J from Lausanne, Switzerland · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-tanuf-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-tanuf-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.05246, 57.46948],
      hours: 3, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","culture","photography"],
      guide: "",
      hikeTime: "30–60 min into the gorge, as far as you fancy",
      swimTime: "30–60 min in the pools when water levels are up",
      bring: {
        essential: ["Water shoes", "Water", "Sun hat, the gorge is exposed early on"],
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
      gettingThere: [
        "30 min from Nizwa on Route 21, signposted to Tanuf.",
        "2WD reaches the ruins and the wadi mouth.",
        "The dirt track deeper in is rough, that part wants a 4×4."
      ],
      whatYoullDo: [
        "Start at the ruins of old Tanuf, bombed out in the 1950s and left standing.",
        "Walk up into the gorge: palm groves, falaj channels, turquoise pools under small waterfalls.",
        "Water's up? Swim. Water's down? Still one of the better short gorge walks in the country.",
        "Either way it's usually empty."
      ],
      tips: [
        "Walk the ruins first, in the morning light, before the gorge.",
        "Water levels swing hard with the season, check before you commit to a swim day.",
        "Pairs perfectly with Al Hoota Cave and Misfat in one Nizwa day."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.05246,57.46948",
      verify: true
    },
    {
      id: "wadi-ghul", cat: "wadis", free: false, type: "Canyon",
      name: "Wadi Ghul / Wadi Nakhar",
      tagline: "The floor of Oman's Grand Canyon.",
      blurb: "Everyone photographs this canyon from the rim at Jabal Shams. Far fewer people drive into the bottom of it, up the Ghul–Nakhar track with 1,000m walls closing in on either side. It reframes the whole mountain.",
      img: "assets/wadis/wadi-ghul.jpg",
      imgCredit: "Photo: Albinfo · CC BY 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-ghul-2.jpg", credit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-ghul-3.jpg", credit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.192, 57.157],
      hours: 4, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["photography","hiking","culture"],
      guide: "recommended",
      hikeTime: "Optional, you can drive most of it, or walk the canyon floor for hours",
      swimTime: "None reliably, it's a dry canyon most of the year",
      bring: {
        essential: ["4×4, the track degrades fast past Al Hajir", "Water", "Full tank of fuel"],
        optional: ["Wide lens, the walls do not fit in a phone frame", "Jacket if you're pairing it with the Jabal Shams rim (it's cold up top)", "Offline map, signal drops"]
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
      id: "wadi-hawer", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi Hawer",
      tagline: "For people who want an adventure, not a viewpoint.",
      blurb: "A full day: 6+ hours of scrambling and boulder-hopping, wet most of it, 4×4 to the start. Remote and technical enough that you go with a guide.",
      img: "assets/wadis/wadi-hawer.jpg",
      imgCredit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-hawer-2.jpg", credit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-hawer-3.jpg", credit: "Photo: Luca Nebuloni · CC BY 2.0 · Wikimedia Commons" }
      ], region: "sharqiyah", coords: [22.650, 58.950],
      hours: 8, fitness: 5, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["canyoning","adrenaline","hiking","swimming"],
      guide: "required",
      hikeTime: "Full day, 6+ hrs of scrambling and boulder-hopping",
      swimTime: "Lots. You will be wet most of the day",
      bring: {
        essential: ["A guide", "Shoes you can swim and scramble in", "3L+ water", "Dry bag", "Real fitness"],
        optional: ["Helmet (your guide should bring one)", "Energy food", "Waterproof camera strap, you'll lose a loose one"]
      },
      stats: {
        "Difficulty": "Hard",
        "Time needed": "Full day",
        "Hike": "6+ hrs scrambling",
        "Swim": "Yes, lots",
        "Vehicle": "4×4 required",
        "Best season": "Oct–Apr",
        "Guide": "Strongly recommended, remote, technical"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Hawer+Oman",
      insta: "https://www.instagram.com/hussain_explores/reel/DZc2iUeMYZj/", // the waterfalls
      verify: true
    },
    {
      id: "snake-gorge", cat: "wadis", free: false, type: "Canyon",
      name: "Snake Gorge (Wadi Bani Awf)",
      tagline: "The most adrenaline you'll find in an Omani wadi.",
      blurb: "Cliff jumps, swims through narrow gorges and proper scrambling. Spectacular, but it bites if you don't know it. Go with a guide, no exceptions.",
      img: "assets/wadis/snake-gorge.jpg",
      imgCredit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/snake-gorge-2.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/snake-gorge-3.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "rustaq", coords: [23.237, 57.444],
      hours: 8, fitness: 5, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["canyoning","adrenaline","swimming","hiking"],
      guide: "required",
      hikeTime: "~6 hrs through the gorge, this is canyoning, not hiking",
      swimTime: "Continuous. Cliff jumps (3–4m) and two ~20m abseils in the upper section",
      bring: {
        essential: ["A guide with ropes and helmets, do not do this alone", "Shoes that grip wet rock", "Dry bag", "Water"],
        optional: ["Wetsuit top in winter, the water is genuinely cold in the narrows", "Chin-strap for anything on your head", "Nothing loose in pockets, you will lose it"]
      },
      stats: {
        "Difficulty": "Hard, real canyoning",
        "Time needed": "~6 hrs + drive",
        "Hike": "~6 hrs through the gorge",
        "Swim": "Yes, jumps and abseils",
        "Vehicle": "4×4 required (mountain road)",
        "Best season": "Oct–Apr",
        "Guide": "Required"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Snake+Gorge+Wadi+Bani+Awf+Oman",
      verify: true
    },
    {
      id: "wadi-as-suwayh", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi As Suwayh",
      tagline: "Where the wadi meets the sea.",
      blurb: "A quiet one on the coast road past Sur, pools, palms and a short walk in, with the sea a few minutes away. Barely on the tourist map, which is the point.",
      img: "assets/wadis/wadi-as-suwayh.jpg",
      imgCredit: "Photo: Arian Zwegers · CC BY 2.0 · Wikimedia Commons", region: "coast-east", coords: [22.331, 59.591],
      hours: 3, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","beach","photography"],
      guide: "",
      hikeTime: "20–40 min in",
      swimTime: "As long as the pools hold water, check conditions first",
      bring: {
        essential: ["Water shoes", "Water", "Everything you need, nothing out here"],
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
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.331,59.591",
      verify: true,
      needsFirstHand: true
    },
    {
      id: "wadi-naqab", cat: "wadis", free: false, type: "Canyon",
      name: "Wadi Naqab",
      tagline: "Serious mountain country, go prepared or don't go.",
      blurb: "A big, rugged wadi in the northern Hajar. Long approach, real exposure, and a route you should not be finding by yourself. The reward is scale you won't get anywhere near Muscat.",
      img: "assets/wadis/wadi-naqab.jpg",
      imgCredit: "Photo: IbrahimKumar · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-naqab-2.jpg", credit: "Photo: IbrahimKumar · CC0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-naqab-3.jpg", credit: "Photo: IbrahimKumar · CC0 · Wikimedia Commons" }
      ], region: "musandam", coords: [25.878, 56.130],
      hours: 8, fitness: 5, needs4x4: true, swim: false, kidOk: false,
      months: [11,12,1,2,3],
      tags: ["hiking","adrenaline","photography"],
      guide: "required",
      hikeTime: "Full day, serious terrain",
      swimTime: "Seasonal pools only, do not count on water",
      bring: {
        essential: ["A guide who knows the route", "Full-day water (4L)", "Proper boots", "Sun and wind protection"],
        optional: ["Poles", "Emergency layer, it gets cold and windy", "Offline maps + a charged phone"]
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
    {
      id: "wadi-al-hoqain", cat: "wadis", free: true, type: "Wadi",
      name: "Wadi Al Hoqain, the trenches",
      tagline: "Sulfur-blue water in carved rock channels, and it's easy.",
      blurb: "Long, straight rock trenches filled with pale-blue, sulfur-rich water, south of Rustaq. No serious hike, no scramble, you walk in, float down the channels, and wonder why nobody told you about it sooner. From my wadi series: one of the easiest wins in the north.",
      img: "",
      region: "rustaq", coords: [23.24, 57.40],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","photography"],
      guide: "",
      hikeTime: "Minutes, the trenches are near the track",
      swimTime: "1–2 hrs floating the channels",
      bring: {
        essential: ["Water shoes", "Water", "Modest swimwear, village area"],
        optional: ["Goggles, the blue reads even better underwater", "Picnic"]
      },
      stats: {
        "Difficulty": "Easy",
        "Time needed": "Half day from Muscat",
        "Swim": "Yes, calm channels",
        "Vehicle": "2WD gets close; the last stretch is rough",
        "Best season": "Oct–Apr",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Al+Hoqain+Oman",
      insta: "https://www.instagram.com/hussain_explores/reel/DUB4un3jP6F/", // the trenches
      verify: true,
      gettingThere: [
        "Head for Al Hoqain, south of Rustaq, around 2 hrs from Muscat.",
        "2WD gets you close; the final approach is rough track, park and walk if unsure.",
        "The trenches are minutes from where you leave the car."
      ],
      whatYoullDo: [
        "Walk the carved channels, long, straight, waist-to-chest deep.",
        "Float down them. That's the activity, and it's enough.",
        "The sulfur gives the water its milky blue, and a faint mineral smell you stop noticing fast."
      ],
      tips: [
        "Easy and family-friendly, one of the best starter wadis in the guide.",
        "Weekday mornings for empty channels.",
        "Combine with the Rustaq loop, fort, hot spring and castle are all nearby."
      ]
    },
    {
      id: "wadi-al-abyad", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi Al Abyad",
      tagline: "The white wadi, milky-blue pools an hour from Muscat.",
      blurb: "Mineral springs feed a chain of pools with a pale, milky-blue tint you won't see in any other wadi, that's the 'abyad' (white). Short flat walk-in, palms, and far fewer people than the famous names. One of the best low-effort wadi days near the capital.",
      img: "assets/wadis/wadi-al-abyad.jpg",
      imgCredit: "Photo: IbrahimKumar · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/wadis/wadi-al-abyad-2.jpg", credit: "Photo: IbrahimKumar · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/wadis/wadi-al-abyad-3.jpg", credit: "Photo: IbrahimKumar · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.389, 57.662],
      hours: 3, fitness: 1, needs4x4: true, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","photography"],
      guide: "",
      hikeTime: "10–20 min of flat wadi-bed walking",
      swimTime: "1–2 hrs across the pools",
      bring: {
        essential: ["Water shoes", "Water", "Modest swimwear, village wadi"],
        optional: ["Goggles, the milky water is the show", "Picnic"]
      },
      stats: {
        "Difficulty": "Easy",
        "Time needed": "Half day from Muscat",
        "Swim": "Yes",
        "Vehicle": "4×4 recommended for the wadi track",
        "Best season": "Oct–Apr",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.389,57.662",
      verify: true
    },
    {
      id: "wadi-al-khoudh", cat: "wadis", free: false, type: "Wadi",
      name: "Wadi Al Khoudh",
      tagline: "Muscat's own wadi, pools in the gorge behind the city.",
      blurb: "The wadi everyone in Muscat drives over and almost nobody drives into. Past the dam the gorge narrows and holds year-round pools between smooth rock walls, a real wadi swim twenty minutes from the suburbs. After rain, the whole city comes to watch it flow.",
      img: "assets/wadis/wadi-al-khoudh.jpg",
      imgCredit: "Photo: Raymond M. Coveney, … · CC BY-SA 3.0 · Wikimedia Commons",
      region: "muscat", coords: [23.55945, 58.11025],
      hours: 3, fitness: 2, needs4x4: true, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","hiking","photography"],
      guide: "",
      hikeTime: "20–40 min up the gorge, some boulder-hopping",
      swimTime: "1 hr in the upper pools",
      bring: {
        essential: ["Water shoes", "Water", "Dry bag"],
        optional: ["Goggles", "Rope for pack-hauling if you go deep"]
      },
      stats: {
        "Difficulty": "Easy–moderate",
        "Time needed": "Half day",
        "Swim": "Yes, upper pools",
        "Vehicle": "4×4 for the wadi bed; 2WD parks at the edge",
        "Best season": "Oct–Apr, never after rain upstream",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.55945,58.11025",
      verify: true
    },

    /* ═════════════════════════════════════════════════════════════ BEACHES */
    {
      id: "qurum-beach", cat: "beaches", free: true, type: "Beach",
      name: "Qurum Beach",
      tagline: "The city's beach, and better than a city beach has any right to be.",
      blurb: "Kilometres of flat golden sand along Shatti Al Qurum, minutes from wherever you're staying. Morning walks, casual swims, and cafés when you're done. The easiest sea time in Oman.",
      img: "assets/beaches/qurum-beach.jpg",
      imgCredit: "Photo: Alexey Komarov · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/qurum-beach-2.jpg", credit: "Photo: Albinfo · CC BY 4.0 · Wikimedia Commons" },
        { src: "assets/beaches/qurum-beach-3.jpg", credit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.61204, 58.46363],
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["beach","swimming","sunset","food"],
      guide: "",
      swimTime: "As long as you like, watch the current flags",
      bring: { essential: ["Swimwear", "Water"], optional: ["Running shoes, the promenade is the city's jogging track", "Cash for the beach cafés"] },
      stats: {
        "Best for": "Easy swim / evening walk",
        "Time needed": "1–3 hrs",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Best time": "Early morning or golden hour",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.61204,58.46363",
      insta: "https://www.instagram.com/hussain_explores/reel/DR7SH7kjGn8/",
      verify: true,
      gettingThere: [
        "It runs along Shatti Al Qurum in central Muscat, any taxi driver knows it.",
        "Park anywhere along the beach road, free."
      ],
      whatYoullDo: [
        "Walk the sand, it goes on for kilometres.",
        "Swim where the flags allow, currents can pick up some days.",
        "Finish at a beachfront café, this is the one beach with proper coffee at the end."
      ],
      tips: [
        "Sunset turns the whole bay orange, time your walk for it.",
        "Weekend evenings are lively, weekday mornings are yours alone."
      ]
    },
    {
      id: "al-bustan-beach", cat: "beaches", free: true, type: "Beach",
      name: "Al Bustan Beach",
      tagline: "A mountain-framed bay ten minutes past Old Muscat.",
      blurb: "A quiet arc of sand backed by dark rock, far calmer than its distance from town suggests. And on the right dark winter night, the shallows here glow, this is one of the bays where bioluminescence shows up.",
      img: "assets/beaches/al-bustan-beach.jpg",
      imgCredit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/al-bustan-beach-2.jpg", credit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/beaches/al-bustan-beach-3.jpg", credit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.5561, 58.60104],
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["beach","swimming","sunset","photography"],
      guide: "",
      swimTime: "A relaxed hour or two",
      bring: { essential: ["Swimwear", "Water"], optional: ["A torch-free night visit in winter, your eyes need the dark for the glow"] },
      stats: {
        "Best for": "Quiet swim / night glow luck",
        "Time needed": "2–3 hrs",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Best time": "Late afternoon, or a moonless winter night",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.5561,58.60104",
      insta: "https://www.instagram.com/hussain_explores/reel/DSHboeCjJek/", // the "planktons are still there" night
      verify: true,
      gettingThere: [
        "Follow the road past Old Muscat toward Al Bustan, about 15 min from Mutrah.",
        "Park by the public beach, any car."
      ],
      whatYoullDo: [
        "Swim the calm bay with the mountains at your back.",
        "In winter, come back after dark on a moonless night, splash the shallows and watch for the blue glow. No promises, that's the deal with plankton."
      ],
      tips: [
        "The glow needs three things: winter water, real darkness and a bit of luck.",
        "Combine with Old Muscat and the corniche for an easy half day."
      ]
    },
    {
      id: "sidab", cat: "beaches", free: true, type: "Snorkel",
      name: "Sidab & its hidden coves",
      tagline: "The 100/10 coves. My favourite corner of the Muscat coast.",
      blurb: "Behind the fishing village of Sidab, a short rough hike drops you into coves you'd swear were photoshopped, clear turquoise water, empty sand, snorkelling straight off the beach. The two reels everyone asks about were filmed here.",
      img: "assets/beaches/sidab.jpg",
      imgCredit: "Photo: Nadeem Sait · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/sidab-2.jpg", credit: "Photo: Apemaninoman · CC BY 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.60153, 58.59943],
      hours: 4, fitness: 2, needs4x4: false, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","snorkel","hiking","photography","swimming"],
      guide: "",
      hikeTime: "20–40 min over the headland, rough and rocky",
      swimTime: "1–2 hrs, bring a snorkel or regret it",
      bring: {
        essential: ["Proper shoes for the rocky path", "2L water, there is zero shade", "Snorkel and mask"],
        optional: ["Dry bag", "Reef-safe sunscreen", "GoPro"]
      },
      stats: {
        "Difficulty": "Moderate",
        "Time needed": "Half day",
        "Hike": "20–40 min each way",
        "Swim": "Yes, snorkelling is the point",
        "Vehicle": "Any car to Sidab",
        "Best season": "Oct–Apr",
        "Entry fee": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.60153,58.59943",
      insta: "https://www.instagram.com/hussain_explores/reel/DaEEFqvMzvf/", // the hike + snorkel cove reel
      verify: true,
      gettingThere: [
        "Drive to Sidab village, 10 min past Mutrah on the harbour road.",
        "Park in the village and pick up the coastal trail over the headland, ask a local for 'the beach path' if unsure.",
        "The trail is unmarked in places, wear real shoes and go with daylight to spare."
      ],
      whatYoullDo: [
        "Hike over the dry headland with the sea opening up below you.",
        "Drop into the first cove, swim, then explore along, each cove is emptier than the last.",
        "Snorkel straight off the sand, the rocks at the edges hold the fish."
      ],
      tips: [
        "Go on a weekday morning and you'll likely have a cove entirely to yourself.",
        "There is no shade and no water out there. Carry everything.",
        "Take your rubbish back out, these coves are clean because people care."
      ]
    },
    {
      id: "qantab-beaches", cat: "beaches", free: true, type: "Boat trip",
      name: "Qantab & its ten beaches",
      tagline: "One fishing village, ten beaches, three rials.",
      blurb: "Qantab looks like one small beach until a local boat takes you around the corner: coves and beaches strung along the cliffs, most reachable only by sea. A short ride costs a few rials and skips every hike.",
      img: "assets/beaches/qantab-beaches.jpg",
      imgCredit: "Photo: Bilal Sarwar from Muscat, Oman · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/qantab-beaches-2.jpg", credit: "Photo: Bilal Sarwar from Muscat, Oman · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/beaches/qantab-beaches-3.jpg", credit: "Photo: Bilal Sarwar from Muscat, Oman · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.556, 58.632],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["beach","boat","swimming","snorkel"],
      guide: "",
      swimTime: "As long as you book the boat for",
      bring: {
        essential: ["Swimwear", "Water", "Cash for the boat"],
        optional: ["Snorkel", "Dry bag for phones on the boat", "Umbrella for shade, the drop-off beaches have none"]
      },
      stats: {
        "Best for": "Boat-hop beach day",
        "Time needed": "2–4 hrs",
        "Swim": "Yes",
        "Boats": "Several operators on the beach — prices vary by season, group size and per-person vs whole-boat. Agree before boarding",
        "On offer": "Beach drop-off & pick-up · sunset tour · dolphin watching · banana boat · jet ski",
        "Vehicle": "Any car to Qantab",
        "Entry": "Beach free, boat is the cost"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.556,58.632",
      insta: ["https://www.instagram.com/hussain_explores/reel/DSwgRMDDDcQ/", // the boat-booking reel
              "https://www.instagram.com/hussain_explores/reel/DS7BQFYDJdp/"], // part 2 — all ten beaches
      verify: true,
      gettingThere: [
        "Drive to Qantab village, 20–25 min from central Muscat.",
        "Walk onto the main beach, the fishermen with boats are right there.",
        "Prices swing with the season and whether you pay per person or per boat — always agree the price and pickup time before you get in. For a trusted contact, DM @hussain_explores and I'll connect you to the captain I use."
      ],
      whatYoullDo: [
        "Pick your ride: a simple beach drop, the sunset tour, dolphin watching, or the toys — banana boat and jet skis run from the same beach.",
        "Get dropped with your kit, swim and snorkel until pickup.",
        "Or take the full ride along the cliffs and count the beaches, I got to ten."
      ],
      tips: [
        "Morning water is calmer for the boat.",
        "Set the pickup time clearly, there's no phone signal argument you want to have from a beach.",
        "Fridays get busy with local families, midweek is silent."
      ]
    },
    {
      id: "sifah-hidden-beach", cat: "beaches", free: true, type: "Swim spot",
      name: "Sifah Beach",
      tagline: "The easy wild beach an hour from town — with a famous surprise in the shallows.",
      blurb: "The beach at Al Sifah: long sand, clear water, mountains behind, an hour from Muscat. And some days, baby reef sharks cruise the shallows at your feet — harmless, skittish and completely mesmerising (yes, the reel was filmed here).",
      img: "assets/beaches/sifah-hidden-beach.jpg",
      imgCredit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/sifah-hidden-beach-2.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/beaches/sifah-hidden-beach-3.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.4204, 58.7869], // Sifah Beach pin confirmed by Hussain
      hours: 3, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4,5],
      tags: ["beach","wildlife","swimming","photography"],
      guide: "",
      swimTime: "An hour or two, the sharks come and go",
      bring: {
        essential: ["Water", "Sun protection, no shade"],
        optional: ["Polarised sunglasses, you'll spot the sharks sooner", "Snorkel for the calm days"]
      },
      stats: {
        "Best for": "Reef-shark shallows",
        "Time needed": "Half day with the drive",
        "Swim": "Yes",
        "Vehicle": "Any car to Sifah — the sandy stretch itself is 4×4 only",
        "Best season": "Oct–May",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=As+Sifah+Oman",
      insta: "https://www.instagram.com/hussain_explores/reel/DTFXV2sjKDG/", // "Would you swim here?" — 8.3K likes
      verify: false,
      gettingThere: [
        "Head for Al Sifah, about an hour from Muscat on a good sealed road — any car.",
        "⚠️ The final sandy stretch swallows 2WDs: without a 4×4, stop where the hard ground ends and walk the last part. With one, drop tyre pressure a little and carry on.",
        "Walk the shore away from the busiest section and watch the shallows — that's where the small sharks patrol."
      ],
      whatYoullDo: [
        "Wade in slowly and stand still, the small sharks come to you.",
        "They're baby reef sharks, curious and harmless, let them pass, don't chase or corner them.",
        "Swim properly when they've moved on, the water here is glass on a calm day."
      ],
      tips: [
        "Still feet beat splashing, the sharks spook easily.",
        "Never grab or block a shark, look, film, let them be.",
        "Early morning light makes them easiest to spot."
      ]
    },
    {
      id: "pebble-beach-tiwi", cat: "beaches", free: true, type: "Beach",
      name: "Pebble Beach, Tiwi",
      tagline: "The relaxed stop on the Tiwi coast everyone drives straight past.",
      blurb: "Smooth stones instead of sand, clear water, and the Sur coast's cliffs behind you. Minutes from Wadi Shab and Wadi Tiwi, it's the easy decompression stop after a wadi morning, and next door hides the Romantic Cave.",
      img: "assets/beaches/pebble-beach-tiwi.jpg",
      imgCredit: "Photo: Nadeem Sait · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/pebble-beach-tiwi-2.jpg", credit: "Photo: Harmer, T. (17..-18.. ; graveur). Graveur Grande-Bretagne. Hydrographic office. · Public domain · Wikimedia Commons" },
        { src: "assets/beaches/pebble-beach-tiwi-3.jpg", credit: "Photo: Adhilaslam · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "coast-east", coords: [22.8535, 59.2375], // right beside the Romantic Cave — confirmed area
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","swimming","photography"],
      guide: "",
      swimTime: "An easy hour",
      bring: { essential: ["Water shoes, pebbles are pebbles", "Water"], optional: ["Snorkel", "Picnic"] },
      stats: {
        "Best for": "Post-wadi wind-down",
        "Time needed": "1–2 hrs",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Best season": "Oct–Apr",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.8535,59.2375",
      insta: "https://www.instagram.com/hussain_explores/reel/DUN_l4sDHKG/", // relaxed beach + the cave
      verify: true,
      gettingThere: [
        "It's on the coast by Tiwi, right off Route 17, 5–10 min from the Wadi Shab bridge.",
        "Park above the beach and walk down, any car."
      ],
      whatYoullDo: [
        "Swim off the pebbles, the water is usually clearer here than on sand beaches.",
        "Walk the shoreline toward the cliffs, that's where the Romantic Cave hides.",
        "Watch the fishing boats work the bay."
      ],
      tips: [
        "Perfect pairing: Wadi Shab in the morning, here for the afternoon.",
        "The pebbles get hot by noon, shoes on."
      ]
    },
    {
      id: "fins-beach", cat: "beaches", free: true, type: "Beach",
      name: "Fins Beach",
      tagline: "White sand, turquoise water, mountains behind.",
      blurb: "The default beach camp on the Sur road, 1.5 to 2 hrs from Muscat, any car, free. No facilities at all: bring water, shade, food and a bag for your rubbish.",
      img: "assets/beaches/fins-beach.jpg",
      imgCredit: "Photo: Daredeep33 · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/fins-beach-2.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/beaches/fins-beach-3.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "coast-east", coords: [23.098, 59.024],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","camping","sunset","photography"],
      guide: "",
      swimTime: "All day if you want it",
      bring: {
        essential: ["Everything, there are no facilities at all", "Water", "Shade (umbrella or tarp)", "A bag for your rubbish"],
        optional: ["Tent, wild camping is legal in Oman", "Firewood", "Cool box", "Snorkel gear"]
      },
      stats: {
        "Best for": "Camping / swimming",
        "Time needed": "Half day–overnight",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Facilities": "None, bring everything",
        "Entry": "Free (wild camping legal)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.098,59.024",
      verify: true,
      gettingThere: [
        "Coast road from Muscat toward Sur, 1.5 to 2 hrs, near Fins village.",
        "Turn off the highway onto one of the short dirt tracks down to the sand.",
        "No 4×4 needed. Drive slowly on the sand and don't park where it's soft."
      ],
      whatYoullDo: [
        "Swim, then find a spot for the evening, camping on the sand is normal and legal here.",
        "Watch the sun drop behind the Hajar. That's the show.",
        "Bring everything: water, shade, food. There are no facilities at all.",
        "Take your rubbish home with you. Every bit of it."
      ],
      tips: [
        "Camp on a weekday and you'll have it to yourself.",
        "No facilities, bring water, shade, and take your rubbish out."
      ]
    },
    {
      id: "bandar-khayran", cat: "beaches", free: false, type: "Snorkel",
      name: "Bandar Khayran",
      tagline: "The snorkel and kayak playground near Muscat.",
      blurb: "A maze of coves, mangroves and little islands just south of Muscat, and some of the best snorkelling near the city. Calm, clear water and reefs you can reach by boat or kayak.",
      img: "assets/beaches/bandar-khayran.jpg",
      imgCredit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/bandar-khayran-2.jpg", credit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/beaches/bandar-khayran-3.jpg", credit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.523, 58.717],
      hours: 5, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["snorkel","beach","wildlife","photography"],
      guide: "recommended",
      swimTime: "Half a day in and out of the water",
      bring: {
        essential: ["Reef-safe sunscreen", "Water", "Hat"],
        optional: ["Your own mask & snorkel, hire gear is hit and miss", "Rash vest instead of sunscreen", "Dry bag", "Waterproof camera"]
      },
      stats: {
        "Best for": "Snorkel / kayak",
        "Time needed": "Half day",
        "Swim": "Yes",
        "Access": "Boat/kayak only, no road access",
        "Best time": "Morning (calmest water)",
        "Entry": "Boat/kayak hire (~OMR 15 for a kayak)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.523,58.717",
      insta: "https://www.instagram.com/hussain_explores/reel/DSPMoABDHsf/", // the two beaches + no-4×4 parking guide
      verify: true
    },
    {
      id: "ras-al-jinz", cat: "beaches", free: false, type: "Wildlife",
      name: "Ras Al Jinz",
      tagline: "Watch sea turtles nest under the stars.",
      blurb: "Oman's famous turtle nesting beach at the easternmost tip of Arabia. On a guided night or dawn visit you watch green turtles haul ashore to lay eggs, and hatchlings scramble for the sea.",
      img: "assets/beaches/ras-al-jinz.jpg",
      imgCredit: "Photo: F igy · CC BY 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/ras-al-jinz-2.jpg", credit: "Photo: Kim Kash · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/beaches/ras-al-jinz-3.jpg", credit: "Photo: Kim Kash · CC BY-SA 2.0 · Wikimedia Commons" }
      ], region: "coast-east", coords: [22.42353, 59.82529],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["wildlife","photography"],
      guide: "required",
      swimTime: "None, this is a protected nesting beach",
      bring: {
        essential: ["Booking confirmation, numbers are capped", "Closed shoes for soft sand in the dark", "A jacket, it's cold on that beach at night"],
        optional: ["Red-light torch (never white light near turtles)", "NO flash photography, it disorients them", "Patience"]
      },
      stats: {
        "Best for": "Turtle watching",
        "Time needed": "2–3 hrs (night or dawn tour)",
        "Swim": "No",
        "Access": "Guided tour only, fixed times",
        "Peak nesting": "Jun–Aug (year-round sightings)",
        "Entry": "~OMR 3 pp + ~OMR 7 pp guided tour"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.42353,59.82529",
      verify: true
    },
    {
      id: "yiti-qantab", cat: "beaches", free: true, type: "Beach",
      name: "Yiti Beach",  // id kept as yiti-qantab so old links & plans still work
      tagline: "The easy bay 30–45 minutes from the city.",
      blurb: "Calm, mountain-backed, 30–45 min east of Muscat. Any car, free, empty midweek — a quick swim or a sunset, not a whole day. Boat-run beaches: see Qantab Beaches. Hidden snorkel coves: see Sidab.",
      img: "assets/beaches/yiti-qantab.jpg",
      imgCredit: "Photo: Allan Henderson · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/yiti-qantab-2.jpg", credit: "Photo: Joe Castleman · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/beaches/yiti-qantab-3.jpg", credit: "Photo: Joe Castleman · CC BY-SA 3.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.568, 58.538],
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
      gettingThere: [
        "Yiti: 30–45 min from central Muscat on the coastal road.",
        "Any car. This is the 'I've got three hours' option."
      ],
      whatYoullDo: [
        "Swim.",
        "Walk the headland.",
        "Kayak, if you've brought one.",
        "Don't plan a day around it, plan an evening."
      ],
      tips: [
        "Late afternoon, the cliffs go gold.",
        "Midweek it's basically empty."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Qantab+Beach+Oman",
      verify: true
    },
    {
      id: "marjan-beach", cat: "beaches", free: true, type: "Snorkel",
      name: "Marjan Beach (Ras Al Hamra)",
      tagline: "Turtles grazing metres from the sand, inside the city, for free.",
      blurb: "The PDO beach at Ras Al Hamra, 'Al Marjan' on the maps. Swim out over the seagrass and you're snorkelling with green turtles, no boat and no tour required; the brave take the jump rock at the far end. Public access until 7pm.",
      img: "assets/beaches/marjan-beach.jpg",
      imgCredit: "Photo: Bernard DUPONT from FRANCE · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/marjan-beach-2.jpg", credit: "Photo: Bernard DUPONT from FRANCE · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/beaches/marjan-beach-3.jpg", credit: "Photo: P.Lindgren · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.62777, 58.50494],
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4,5],
      tags: ["swimming","snorkel","wildlife","beach"],
      guide: "",
      swimTime: "As long as you like, this is a mask-and-fins morning",
      bring: {
        essential: ["Mask and snorkel, the turtles are the point", "Water shoes for the rocky entries"],
        optional: ["Fins", "GoPro / waterproof phone case", "Shade, trees are limited"]
      },
      stats: {
        "Best for": "Turtles without a boat trip",
        "Time needed": "2–3 hrs",
        "Swim": "Yes, calm most days",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.62777,58.50494",
      insta: ["https://www.instagram.com/hussain_explores/reel/DTU37gojIR0/", // turtles for free
              "https://www.instagram.com/hussain_explores/reel/DUqIWIhDKzt/"], // "my favourite beach in Oman"
      verify: true,
      whatYoullDo: [
        "Swim out over the seagrass beds, that's where the turtles feed.",
        "Move slowly and keep your distance; they'll carry on grazing right next to you.",
        "Early morning = calmest water and the best visibility."
      ],
      tips: [
        "Look, don't touch, and never block a turtle's path to the surface.",
        "Visibility drops after windy days, pick a calm morning."
      ]
    },
    {
      id: "as-sifah", cat: "beaches", free: false, type: "Beach",
      name: "As Sifah",
      tagline: "A long, wild, empty stretch an hour from the city.",
      blurb: "Sandy, quiet and backed by mountains, the beach you go to when you want space. Popular for camping, and one of the easiest wild nights out you can have from Muscat.",
      img: "assets/beaches/as-sifah.jpg",
      imgCredit: "Photo: MariamMajdolineLahham · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/as-sifah-2.jpg", credit: "Photo: MarjuneShiela · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/beaches/as-sifah-3.jpg", credit: "Photo: MarjuneShiela · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.427, 58.833],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","camping","sunset","swimming","photography"],
      guide: "",
      swimTime: "As long as you like, calm and shallow in stretches",
      bring: {
        essential: ["Water", "Shade", "A bag for your rubbish"],
        optional: ["Tent, wild camping is legal", "Cool box", "Firewood", "Snorkel gear"]
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
      id: "al-sawadi", cat: "beaches", free: false, type: "Beach",
      name: "Al Sawadi",
      tagline: "Islands offshore, reef in between, palms behind.",
      blurb: "An hour and a half up the Batinah coast: clean sand, calm water, and a cluster of protected islands just offshore you can boat out to. The reef between the mainland and the islands is the reason to bother.",
      img: "assets/beaches/al-sawadi.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/al-sawadi-2.jpg", credit: "Photo: Ondřej Žváček · CC BY 2.5 · Wikimedia Commons" },
        { src: "assets/beaches/al-sawadi-3.jpg", credit: "Photo: Estelle from Paris, France · CC BY 2.0 · Wikimedia Commons" }
      ], region: "batinah", coords: [23.77636, 57.7849],
      hours: 4, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","snorkel","wildlife","sunset"],
      guide: "recommended",
      swimTime: "Half a day, mostly snorkelling",
      bring: {
        essential: ["Reef-safe sunscreen", "Water", "Cash for the boat out to the islands"],
        optional: ["Own mask & snorkel", "Rash vest", "Binoculars, the islands are a seabird nesting site"]
      },
      stats: {
        "Best for": "Snorkelling / islands",
        "Time needed": "Half day",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Access": "Beach free; boat to the islands is paid",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.77636,57.7849",
      verify: true
    },

    /* ── Camping (added Jul 2026), wild camping is legal, free and one of
       Oman's superpowers. Every camp spot carries the safety rules. ──────── */
    {
      id: "white-beach-fins", cat: "beaches", free: true, type: "Camping",
      name: "White Beach (Fins)",
      tagline: "The classic first camp, white pebbles, clear water, fire on the beach.",
      blurb: "The little white cove past Fins is where half of Muscat learned to beach-camp: sheltered, swimmable, and close enough to bail out if the kids mutiny. Pitch above the tide line, cook on the sand, wake up and swim before breakfast. Wild camping in Oman is legal and free, this is the place to start.",
      img: "assets/beaches/white-beach-fins.jpg",
      imgCredit: "Photo: Rick Obst · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/white-beach-fins-2.jpg", credit: "Photo: Sgt. Donovan Lee · Public domain · Wikimedia Commons" },
        { src: "assets/beaches/white-beach-fins-3.jpg", credit: "Photo: Sgt. Donovan Lee · Public domain · Wikimedia Commons" }
      ],
      region: "coast-east", coords: [22.926, 59.108],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","camping","swimming","sunset","photography"],
      guide: "",
      swimTime: "Morning swim is the whole point",
      bring: {
        essential: ["Tent + pegs that hold in sand", "Water (3L pp/day), nothing sold nearby", "Firewood bought in town + lighter", "Rubbish bags, you carry out everything", "Torch / head lamps"],
        optional: ["Camp chairs", "Shade tarp for the morning", "Snorkel gear", "Cool box"]
      },
      stats: {
        "Best for": "Your first Oman beach camp",
        "Time needed": "Overnight (or a day trip)",
        "Swim": "Yes, calm cove",
        "Vehicle": "Careful 2WD to the top; 4×4 drives down",
        "Best season": "Oct–Apr",
        "Entry": "Free, wild camping is legal"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.926,59.108",
      verify: true,
      gettingThere: [
        "Coast road toward Fins, ~1h30 from Muscat.",
        "The cove is just past Fins beach, short rough track down to the sand.",
        "Arrive 2–3 hrs before sunset to claim a spot on winter weekends."
      ],
      whatYoullDo: [
        "Pitch above the high-tide line, check the wet sand mark.",
        "Swim, snorkel the rocky ends, cook as the sun drops.",
        "Fall asleep to waves; be in the water by seven."
      ],
      tips: [
        "Take EVERYTHING out with you, this cove's future depends on it.",
        "Weekends fill up; midweek you may have it alone.",
        "Wind picks up at night, peg the tent properly and face the door away from the sea.",
        "No facilities: dig-and-bury, or use the toilets at Fins car park before you settle."
      ]
    },
    {
      id: "ras-al-hadd-camp", cat: "beaches", free: false, type: "Camping",
      name: "Ras Al Hadd beach camp",
      tagline: "Camp at the easternmost tip of Arabia, first sunrise in the Arab world.",
      blurb: "Where the Gulf of Oman meets the Arabian Sea: wide empty beaches, a fishing town for supplies, turtle beaches next door and the first sunrise in the Arab world from your sleeping bag. The natural overnight on any Sur / Ras Al Jinz run.",
      img: "assets/beaches/ras-al-hadd-camp.jpg",
      imgCredit: "Photo: Braveheart · CC BY 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/beaches/ras-al-hadd-camp-2.jpg", credit: "Photo: dconvertini · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/beaches/ras-al-hadd-camp-3.jpg", credit: "Photo: dconvertini · CC BY-SA 2.0 · Wikimedia Commons" }
      ],
      region: "coast-east", coords: [22.530, 59.790],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      overnight: true,
      tags: ["beach","camping","sunset","wildlife","photography"],
      guide: "",
      bring: {
        essential: ["Tent, water, firewood, rubbish bags", "Torch with red mode, turtle beaches are nearby, white light disturbs them"],
        optional: ["Fresh fish from the Ras Al Hadd market for the fire", "Binoculars"]
      },
      stats: {
        "Best for": "The turtle-coast overnight",
        "Time needed": "Overnight",
        "Swim": "Yes",
        "Vehicle": "Any car to town; 4×4 opens the wilder beaches",
        "Best season": "Oct–Apr",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Ras+Al+Hadd+Oman",
      verify: true
    },
    {
      id: "mughsail", cat: "salalah", free: true, group: "beaches", type: "Beach",
      name: "Mughsail Beach",
      tagline: "Blowholes, cliffs and a beach that doesn't look like the rest of Oman.",
      blurb: "40 minutes west of Salalah on good tarmac, any car. The blowholes at the western end need a decent swell: flat sea and nothing happens. In khareef the cliffs behind turn green.",
      img: "assets/beaches/mughsail.jpg",
      imgCredit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/mughsail-2.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/mughsail-3.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [16.87695, 53.76778],
      hours: 3, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,7,8,9,10,11,12],
      tags: ["beach","photography","sunset"],
      guide: "",
      swimTime: "Depends on the sea, it can be rough",
      bring: {
        essential: ["Water", "Sun protection"],
        optional: ["Camera for the blowholes (they need a decent swell)", "Windproof layer in khareef season"]
      },
      stats: {
        "Best for": "Scenery / blowholes",
        "Time needed": "2–3 hrs",
        "Swim": "Sometimes, check the sea",
        "Vehicle": "Any car",
        "Getting there": "Fly to Salalah, it's ~1,000km from Muscat",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=16.87695,53.76778",
      verify: true,
      gettingThere: [
        "Drive west from Salalah, 40 min on good tarmac, any car.",
        "Park at the Marneef Cave end: that's where the walkways and shaded shelters are."
      ],
      whatYoullDo: [
        "Walk the long crescent of sand.",
        "Go to the blowholes at the western end, with the right swell they fire seawater metres into the air.",
        "Khareef (Jul–Sep): the cliffs behind turn green and the whole place goes misty.",
        "Winter: sunny, calm, and warm enough to swim."
      ],
      tips: [
        "The blowholes need a swell, flat sea means nothing happens. Khareef is the show.",
        "Khareef and winter are two completely different beaches. Both are worth it.",
        "With a 4×4 and time, continue west toward Fazayah, emptier, and even better."
      ]
    },

    /* ═════════════════════════════════════════════════════════ EXPERIENCES */
    {
      id: "khasab", cat: "experiences", free: true, type: "Fort",
      name: "Khasab & its castle",
      tagline: "Musandam's capital, guarded by a 17th-century Portuguese fort.",
      blurb: "The gateway town to the fjords. Khasab Castle is small, restored and genuinely good, and the town is where every dhow, ferry and mountain safari starts. Reaching it is the adventure: fly from Muscat, take the Shinas ferry, or drive through the UAE with your passport.",
      img: "assets/experiences/khasab.jpg",
      imgCredit: "Photo: (A1000 · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/khasab-2.jpg", credit: "Photo: (A1000 · CC0 · Wikimedia Commons" },
        { src: "assets/experiences/khasab-3.jpg", credit: "Photo: (A1000 · CC0 · Wikimedia Commons" }
      ],
      region: "musandam", coords: [26.18361, 56.24726],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography"],
      guide: "",
      stats: {
        "Best for": "Fjord-trip base + the castle",
        "Time needed": "1–2 hrs for the castle",
        "Getting here": "Fly MCT→Khasab, Shinas–Khasab ferry, or 6–7 hrs via UAE (passport!)",
        "Entry": "500 baisa; Sat–Thu 9–4, Fri mornings [secondary source]",
        "Vehicle": "Any car in town"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=26.18361,56.24726",
      verify: false,
      gettingThere: [
        "Three ways in: a short flight from Muscat, the Shinas car ferry (runs ~4 days/week, car OMR 5.25 — schedules shift, confirm on nfc.mwasalat.om or tel. 1551), or the 6–7 hr drive through the UAE with your passport.",
        "The castle is in the middle of town, you can't miss it."
      ],
      whatYoullDo: [
        "Walk Khasab Castle's towers and the recreated summer houses in the courtyard.",
        "Book tomorrow's dhow cruise and mountain safari from the operators along the corniche.",
        "Watch the speedboats running to and from Iran across the strait, Khasab's famous open secret."
      ],
      tips: [
        "Combine: castle in the afternoon, dhow into the fjords the next morning.",
        "If driving via UAE, carry car insurance valid for Oman and check the border post hours."
      ]
    },
    {
      id: "bukha-fort", cat: "experiences", free: true, type: "Fort",
      name: "Bukha Fort",
      tagline: "The fort on the coast road nobody stops for. Stop.",
      blurb: "Musandam's second fort sits right on the Khasab coastal road with the sea in front and mountains behind. Restored, photogenic and usually empty, a ten-minute stop that looks like a postcard.",
      img: "assets/experiences/bukha-fort.jpg",
      imgCredit: "Photo: Toppazz · CC BY 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/bukha-fort-2.jpg", credit: "Photo: Sdtrams · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/bukha-fort-3.jpg", credit: "Photo: Sdtrams · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "musandam", coords: [26.14324, 56.15494],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography"],
      guide: "",
      stats: {
        "Best for": "The drive-by photo stop",
        "Time needed": "20–30 min",
        "On the way": "Between the UAE border and Khasab",
        "Entry": "[CONFIRM fee/hours]",
        "Vehicle": "Any car"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=26.14324,56.15494",
      verify: false,
      gettingThere: [
        "It's directly on the Bukha–Khasab coast road, you'll see it from the car."
      ],
      whatYoullDo: [
        "Climb the restored tower, photograph the fort against the sea, carry on to Khasab."
      ],
      tips: [
        "Morning light puts the sun behind you for the classic shot."
      ]
    },
    {
      id: "khor-najd", cat: "experiences", free: true, type: "Viewpoint",
      name: "Khor Najd",
      tagline: "The fjord photo every Musandam ad uses, and you can drive to it.",
      blurb: "A steep graded track climbs from Khasab to the one place you can see a Musandam fjord from above without a boat. The hairpin viewpoint over the bay is the region's defining image.",
      img: "assets/experiences/khor-najd.jpg",
      imgCredit: "Photo: Xiaotong Gao · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/khor-najd-2.jpg", credit: "Photo: Robert Haandrikman · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/khor-najd-3.jpg", credit: "Photo: Robert Haandrikman · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "musandam", coords: [26.13, 56.303],
      hours: 2, fitness: 1, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["photography","nature"],
      guide: "",
      stats: {
        "Best for": "THE fjord view",
        "Time needed": "1–2 hrs from Khasab",
        "Road": "Steep graded track, 4×4 strongly advised",
        "Swim": "Beach at the bottom, modest",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Khor+Najd+Musandam",
      verify: false,
      gettingThere: [
        "From Khasab head inland toward the Sayh plateau and follow the Khor Najd signs, about 25 km.",
        "The last section is a steep zigzag track, 4×4 with a confident driver."
      ],
      whatYoullDo: [
        "Stop at the hairpin viewpoint, the fjord unrolls beneath you.",
        "Drive down to the water if the track is in good shape, it's one of the few fjord shores you can reach by car."
      ],
      tips: [
        "Late afternoon light fills the fjord, mornings are hazier.",
        "Camping is possible at the bottom, take everything out with you."
      ]
    },
    {
      id: "sur-old-town", cat: "experiences", free: true, type: "Village",
      name: "Sur old town & corniche",
      tagline: "The dhow-building capital, still building them.",
      blurb: "Sur curls around a lagoon where wooden dhows have been launched for a thousand years. Whitewashed lanes, watchtowers, the Bilad Sur Castle, the Al Ayjah lighthouse walk, and a corniche made for slow evenings. The proper overnight stop before or after Ras Al Jinz.",
      img: "assets/experiences/sur-old-town.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/sur-old-town-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/sur-old-town-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [22.56798, 59.52198],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography","sunset"],
      guide: "",
      stats: {
        "Best for": "The evening stroll + dhow heritage",
        "Time needed": "Half day or an overnight",
        "Drive": "2.5–3 hrs from Muscat",
        "Pairs with": "Ras Al Jinz turtles, 40 min on",
        "Entry": "Town free, castle small fee [CONFIRM]"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.56798,59.52198",
      verify: false,
      gettingThere: [
        "Route 17 all the way down the coast from Muscat, 2.5–3 hrs, tarmac throughout.",
        "Park by the corniche and do the town on foot, cross to Al Ayjah by the bridge for the lighthouse side."
      ],
      whatYoullDo: [
        "Walk the corniche at golden hour with the lagoon full of moored dhows.",
        "Look across to Al Ayjah's watchtowers and lighthouse, the classic Sur view.",
        "Poke around Bilad Sur Castle if it's open when you pass."
      ],
      tips: [
        "Stay the night and do Ras Al Jinz turtles after dark, it's 40 minutes further.",
        "Sunset from the Al Ayjah side, looking back over the lagoon at the town."
      ]
    },
    {
      id: "sur-dhow-factory", cat: "experiences", free: true, type: "Culture",
      name: "The dhow yard at Sur",
      tagline: "Watch thousand-year-old shipbuilding happen in front of you.",
      blurb: "Sur's working dhow yard still builds and restores ocean-going wooden ships by hand, teak hulls, no drawings, knowledge passed father to son. You walk among the hulls and watch the work. One of the last places on Earth to see it.",
      img: "assets/experiences/sur-dhow-factory.jpg",
      imgCredit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/sur-dhow-factory-2.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/sur-dhow-factory-3.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [22.5769, 59.52494],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography"],
      guide: "",
      stats: {
        "Best for": "Living heritage",
        "Time needed": "30–60 min",
        "When": "Mornings, when work is on",
        "Entry": "Free (per travel guides, 2025) — a polite hello to the carpenters is the real ticket",
        "Vehicle": "Any car"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.5769,59.52494",
      verify: false,
      gettingThere: [
        "On the lagoon edge at the entrance to Sur, signposted, park beside it."
      ],
      whatYoullDo: [
        "Wander between hulls in every stage of build, keels to nearly-launched.",
        "Watch the carpenters work teak with hand tools, ask before you photograph the men, they usually say yes.",
        "The giant ceremonial dhow by the roundabout makes the scale point for you."
      ],
      tips: [
        "Go on a weekday morning, that's when the yard is actually working.",
        "Pairs perfectly with the corniche walk, they're five minutes apart."
      ]
    },
    {
      id: "majlis-al-jinn", cat: "experiences", free: true, type: "Cave",
      name: "Majlis Al Jinn",
      tagline: "One of the largest cave chambers on Earth, under a plateau you can drive.",
      blurb: "Beneath the Selma Plateau hides a chamber big enough to swallow a cathedral, one of the world's largest underground rooms. Entry is a 120-metre free-hanging rope descent, professionals only, with a licensed caving operator. For everyone else, standing on the plateau above the sinkholes is its own trip.",
      img: "assets/experiences/majlis-al-jinn.jpg",
      imgCredit: "Photo: The original uploader was Michaelmcandrew at English Wikipedia. · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/majlis-al-jinn-2.jpg", credit: "Photo: The original uploader was Michaelmcandrew at English Wikipedia. · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/experiences/majlis-al-jinn-3.jpg", credit: "Photo: The original uploader was Michaelmcandrew at English Wikipedia. · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "coast-east", coords: [22.885, 59.107],
      hours: 6, fitness: 3, needs4x4: true, swim: false, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["adrenaline","hiking","photography"],
      guide: "",
      stats: {
        "Best for": "Serious adventure bragging rights",
        "Access": "Interior: guided rope descent ONLY (licensed operators)",
        "Surface": "4×4 plateau drive, sinkhole rims",
        "Season": "Oct–Apr",
        "Cost": "Permitted descents via Explore Majan (exploremajan.com), price on enquiry; OMRAN is developing wider access"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.885,59.107",
      verify: false,
      gettingThere: [
        "The plateau track up from Fins/Tiwi side needs a proper 4×4 and a driver who's done mountain tracks.",
        "The cave mouths are unfenced holes in the plateau, do not approach the rims casually."
      ],
      whatYoullDo: [
        "Surface trip: the Selma Plateau drive, the sinkhole openings from a safe distance, and the wild plateau landscape.",
        "The descent, if you're qualified and booked: 120 m on rope through the ceiling of a chamber the size of several football fields."
      ],
      tips: [
        "⚠️ The interior is NOT a tourist walk, rope access with a professional outfit or nothing.",
        "Combine the surface trip with the 7th Hole and Tahery Cave entry already in this guide, same plateau."
      ]
    },
    {
      id: "wadi-bani-awf", cat: "experiences", free: true, type: "Canyon",
      name: "Wadi Bani Awf, the mountain road",
      tagline: "Oman's most famous off-road drive, village to village through the Hajar.",
      blurb: "The graded track over the mountains between Al Awabi and Balad Sayt is the country's benchmark 4×4 day: hairpins, cliff edges, Snake Gorge's slot far below, and Bilad Sayt's terraces at the end. You don't drive it for the destination, the road IS the destination.",
      img: "assets/experiences/wadi-bani-awf.jpg",
      imgCredit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/wadi-bani-awf-2.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/wadi-bani-awf-3.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.24, 57.44],
      hours: 5, fitness: 2, needs4x4: true, swim: false, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["adrenaline","photography","hiking"],
      guide: "",
      stats: {
        "Best for": "The drive of the trip",
        "Time needed": "Half to full day",
        "Road": "Steep graded track, real 4×4 + experience, low range used",
        "Season": "Oct–Apr, NEVER in rain (flash floods)",
        "Fuel": "Fill up before, there is none inside"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Bani+Awf+Oman",
      verify: false,
      gettingThere: [
        "Southern approach from Al Hamra side or northern from Awabi/Rustaq side, both signed to Balad Sayt.",
        "Confident 4×4 drivers only, the exposure is real and there are no barriers."
      ],
      whatYoullDo: [
        "Descend (or climb) the switchbacks with the gorge falling away beside you.",
        "Stop at the Snake Gorge overlook, the slot canyon entry is already in this guide.",
        "Finish at Bilad Sayt, the amphitheatre of terraces that made the village famous."
      ],
      tips: [
        "⚠️ Check the sky and the forecast, this valley funnels flash floods.",
        "Go in convoy if you can, phone signal dies in the gorge sections.",
        "Sedans have done it. Sedans have also been recovered from it. Take the 4×4."
      ]
    },
    {
      id: "nizwa-goat-market", cat: "experiences", free: true, type: "Souq",
      name: "Nizwa Friday goat market",
      tagline: "Sunrise, one auction ring, and half the interior's livestock.",
      blurb: "Every Friday before the heat, herders circle goats and cattle around a ring of buyers at Nizwa's souq, bidding as they walk. It's loud, it's real, it's been happening for centuries, and visitors are welcome to stand in the middle of it. The best free cultural show in Oman.",
      img: "assets/experiences/nizwa-goat-market.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/nizwa-goat-market-2.jpg", credit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/nizwa-goat-market-3.jpg", credit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [22.933, 57.531],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      stats: {
        "Best for": "The real Oman, no ticket",
        "When": "Fridays only, ~6:30–9am, earlier is better",
        "Time needed": "1–2 hrs + the souq after",
        "Entry": "Free",
        "Vehicle": "Any car, park at the souq"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.933,57.531",
      verify: false,
      gettingThere: [
        "It's inside the Nizwa souq complex, follow the noise on a Friday morning.",
        "Be there by 7am, by 9 it's winding down."
      ],
      whatYoullDo: [
        "Stand at the ring and watch the walking auction circle past you.",
        "Wander the adjoining halls after, dates, pottery, silver, the full souq entry in this guide covers them."
      ],
      tips: [
        "Ask before close-up photos of people, a smile and a gesture is enough.",
        "Friday pairing: market at dawn, fort when it opens, lunch in the old quarter."
      ]
    },
    {
      id: "harat-al-aqr", cat: "experiences", free: true, type: "Village",
      name: "Harat Al Aqr, Nizwa's old quarter",
      tagline: "The mudbrick district behind the fort, quietly coming back to life.",
      blurb: "A restored quarter of lanes, carved doors and courtyard houses a few minutes from Nizwa Fort, now dotted with small cafés and craft rooms. The slow hour between the fort and the drive on.",
      img: "assets/experiences/harat-al-aqr.jpg",
      imgCredit: "Photo: Laurent C · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/harat-al-aqr-2.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/experiences/harat-al-aqr-3.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [22.93301, 57.52756],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography","food"],
      guide: "",
      stats: {
        "Best for": "A slow wander + coffee",
        "Time needed": "45 min – 1.5 hrs",
        "Entry": "Free",
        "Vehicle": "Walk from the fort",
        "Best time": "Morning or late afternoon"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.93301,57.52756",
      verify: false,
      gettingThere: [
        "Walk from Nizwa Fort, it's the mudbrick district directly behind the souq side."
      ],
      whatYoullDo: [
        "Drift the lanes, photograph the doors, duck into whichever café has the falaj-side seats.",
        "Watch restoration work happening on houses mid-rescue, the quarter is a living project."
      ],
      tips: [
        "Dress modestly and keep voices down, people live here.",
        "Combine with the fort + Friday market for the full Nizwa morning."
      ]
    },
    {
      id: "national-museum", cat: "experiences", free: true, type: "Museum",
      name: "National Museum of Oman",
      tagline: "The country's story, told properly. Do it on day one.",
      blurb: "Opposite the Sultan's palace in Old Muscat, the National Museum lays out five thousand years, seafaring, forts, silver, dhows, Islamic art, in a building that's a pleasure to be in. An hour here makes every fort and souq afterwards make more sense.",
      img: "assets/experiences/national-museum.jpg",
      imgCredit: "Photo: Yusi AlK · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/national-museum-2.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/national-museum-3.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.61467, 58.5926],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture"],
      guide: "",
      stats: {
        "Best for": "Context before the road trip",
        "Hours": "Daily 10am–5pm, tickets until 4:30 (official)",
        "Time needed": "1.5–3 hrs",
        "Entry": "OMR 5 foreign visitors, card payment only",
        "Where": "Old Muscat, opposite Al Alam Palace"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.61467,58.5926",
      verify: false,
      gettingThere: [
        "Old Muscat, directly opposite the Al Alam Palace approach, park on the harbour side.",
        "Do it in the same outing as the palace exterior and the corniche, they're all within ten minutes' walk."
      ],
      whatYoullDo: [
        "Work through the maritime and forts galleries, the two that explain everything you'll see on the road.",
        "Photograph Al Alam Palace's blue-and-gold facade on the way out, exterior viewing only."
      ],
      tips: [
        "Air-conditioned, it's the perfect 1pm-heat move.",
        "Friday it opens only in the afternoon, plan around it."
      ]
    },
    {
      id: "oman-across-ages", cat: "experiences", free: true, type: "Museum",
      name: "Oman Across Ages Museum",
      tagline: "The billion-dollar museum in the middle of the country, worth the detour.",
      blurb: "At Manah near Nizwa, a vast modern museum walks Oman from prehistoric seas to the renaissance years, immersive, interactive and genuinely world-class. If your loop passes Nizwa, this is the rainy-day-quality stop that happens to sit in the desert.",
      img: "assets/experiences/oman-across-ages.jpg",
      imgCredit: "Photo: Birmingham Museums Trust, Peter Reavill, 2011-04-18 15:20:50 · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/oman-across-ages-2.jpg", credit: "Photo: Almaddy2022 · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/oman-across-ages-3.jpg", credit: "Photo: Somerset County Council, Laura Burnett, 2019-08-13 09:56:38 · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [22.7921, 57.58814],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture"],
      guide: "",
      stats: {
        "Best for": "Families + museum people",
        "Hours": "Galleries Sat–Thu 9–5, Fri 1:30–7 (official)",
        "Time needed": "2–3 hrs",
        "Entry": "OMR 5 tourists / OMR 2 residents; kids under 6 free",
        "Where": "Manah, ~25 min from Nizwa"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.7921,57.58814",
      verify: false,
      gettingThere: [
        "Signposted off the Nizwa–Salalah road at Manah, 25–30 km from Nizwa, any car."
      ],
      whatYoullDo: [
        "The geological and prehistory halls first, then the modern renaissance wing, the building itself is half the show."
      ],
      tips: [
        "Pairs with Nizwa + Bahla into one full interior day.",
        "Friday opens after lunch only."
      ]
    },
    {
      id: "frankincense-museum", cat: "experiences", free: true, type: "Museum",
      name: "Museum of the Frankincense Land",
      tagline: "The museum inside Al Baleed that explains the whole south.",
      blurb: "Within the Al Baleed Archaeological Park in Salalah, this museum tells the story that made Dhofar rich for two thousand years, the frankincense trade, and Oman's maritime world. Do it with the ruins around it, one ticket, one golden-hour walk.",
      img: "assets/experiences/frankincense-museum.jpg",
      imgCredit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/frankincense-museum-2.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/frankincense-museum-3.jpg", credit: "Photo: see source · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.001, 54.113],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture"],
      guide: "",
      stats: {
        "Best for": "The Dhofar backstory",
        "Time needed": "1–2 hrs with the park",
        "Entry": "With Al Baleed park ticket [CONFIRM]",
        "Where": "Al Baleed, Salalah",
        "Best time": "Late afternoon, then the ruins at sunset"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.001,54.113",
      verify: false,
      gettingThere: [
        "Inside the Al Baleed Archaeological Park on Salalah's shore, the park entry in this guide has the logistics."
      ],
      whatYoullDo: [
        "The frankincense hall first, then the maritime hall, then walk the excavated city to the lagoon as the light drops."
      ],
      tips: [
        "This is the stop that turns Wadi Dawkah's trees and Khor Rori's ruins into one story."
      ]
    },
    {
      id: "masirah-island", cat: "experiences", free: true, type: "Wildlife",
      name: "Masirah Island",
      tagline: "Oman's big wild island: ferries, empty coasts, four turtle species.",
      blurb: "A car-ferry ride off the east coast, Masirah is where Oman keeps its emptiest beaches, its kitesurf season and some of the world's densest turtle nesting. Take the vehicle ferry from Shannah, stay a night or three, do laps of the island.",
      img: "assets/experiences/masirah-island.jpg",
      imgCredit: "Photo: see source · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/masirah-island-2.jpg", credit: "Photo: see source · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/masirah-island-3.jpg", credit: "Photo: see source · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [20.441, 58.815],
      hours: 8, fitness: 2, needs4x4: true, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4,5,6,7,8,9],
      tags: ["beach","wildlife","camping","adrenaline"],
      guide: "",
      stats: {
        "Best for": "Wild-island escape",
        "Getting there": "Shannah car ferry, daily sailings ~9am/12/3/5pm, ~1 hr crossing (nfc.mwasalat.om)",
        "Ferry price": "Car OMR 8.4 / 4×4 OMR 10.5 one-way + OMR 3.6 pp",
        "Season": "Kitesurf May–Sep, turtles all summer, touring Oct–Apr",
        "Stay": "Masira Island Resort or camp",
        "Vehicle": "4×4 recommended for the wild coasts"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=20.441,58.815",
      verify: false,
      gettingThere: [
        "Drive to Shannah (~4.5 hrs), roll onto the vehicle ferry — daily sailings around 9am, noon, 3pm and 5pm, about an hour across. Book on nfc.mwasalat.om.",
        "Book the crossing ahead in season."
      ],
      whatYoullDo: [
        "Circle the island, west side calm, east side waves and wind.",
        "Summer nights: turtles nest on the eastern beaches, keep lights off and distance on.",
        "May–Sep the wind machine turns on and the kitesurfers arrive."
      ],
      tips: [
        "Fuel and shops exist in Hilf, stock up there, the rest is wilderness.",
        "⚠️ Summer is brutally hot, that season is for wind and turtles, not hiking."
      ]
    },
    {
      id: "bar-al-hikman", cat: "experiences", free: true, type: "Wildlife",
      name: "Bar Al Hikman",
      tagline: "The flamingo flats: Arabia's greatest birdwatching, and its trickiest ground.",
      blurb: "A vast tidal peninsula opposite Masirah where tens of thousands of flamingos and waders winter on the flats, and kitesurfers ride the shallows in summer. Also home to genuine quicksand and tide traps, this is licensed-operator territory, not a casual detour.",
      img: "assets/experiences/bar-al-hikman.jpg",
      imgCredit: "Photo: This Photo was taken by Timothy A. Gonsalves. Feel free to use my photos, but p · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/bar-al-hikman-2.jpg", credit: "Photo: Rangan Datta Wiki · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/bar-al-hikman-3.jpg", credit: "Photo: Rangan Datta Wiki · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [20.567, 58.211],
      hours: 8, fitness: 2, needs4x4: true, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["wildlife","photography","adrenaline"],
      guide: "",
      stats: {
        "Best for": "Birders + kiters",
        "Season": "Birds Oct–Apr, kitesurf May–Sep",
        "Drive": "5–5.5 hrs from Muscat, 4WD required",
        "⚠️": "Quicksand + tidal cutoffs, go with a licensed operator/camp",
        "Stay": "Dream Camp or operator camps [CONFIRM]"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bar+Al+Hikman+Oman",
      verify: false,
      gettingThere: [
        "Via Mahout toward Shannah, then operator tracks onto the peninsula, do NOT freelance on the flats."
      ],
      whatYoullDo: [
        "Winter: flamingo lines to the horizon and clouds of waders at the tide line.",
        "Summer: flat shallow water and constant wind, kitesurf heaven."
      ],
      tips: [
        "⚠️ The flats eat vehicles, tides move faster than you think and the crust lies. Guides know the ground, use them.",
        "Bring binoculars, the birds keep their distance."
      ]
    },
    {
      id: "pink-lakes", cat: "experiences", free: true, type: "Nature",
      name: "The pink lakes",
      tagline: "Yes, actually pink. Algae-tinted salt lagoons on the empty coast.",
      blurb: "Salt lagoons at Al Suwih on the Sharqiyah coast turn shades of rose when the algae bloom, strongest on dry, bright days in the cool months. Remote, serviceless and surreal, a photo stop wrapped in a proper road trip.",
      img: "assets/experiences/pink-lakes.jpg",
      imgCredit: "Photo: Copernicus Sentinel-2, ESA · CC BY-SA 3.0 igo · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/pink-lakes-2.jpg", credit: "Photo: Amir Pashaei · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/pink-lakes-3.jpg", credit: "Photo: Amir Pashaei · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [21.855, 59.633],
      hours: 6, fitness: 1, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2],
      tags: ["photography","nature"],
      guide: "",
      stats: {
        "Best for": "The surreal photo",
        "Season": "Oct–Feb, dry sunny days show the strongest pink",
        "Drive": "3–3.5 hrs from Muscat toward Al Ashkharah [CONFIRM exact pin]",
        "Services": "None, fuel/water before",
        "Vehicle": "4×4 advised for the sabkha edges"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Pink+Lake+Al+Suwih+Oman",
      verify: false,
      gettingThere: [
        "Down the coast past Al Ashkharah toward Al Suwih, last stretch on sand tracks, don't drive onto the salt crust [CONFIRM pin]."
      ],
      whatYoullDo: [
        "Walk the shoreline, colour shifts with the light angle, midday is pinkest.",
        "Drone shots make this spot, the colour bands only fully read from above."
      ],
      tips: [
        "⚠️ Sabkha crust breaks under vehicles, park on firm ground and walk.",
        "No shade, no services, no signal in stretches, treat it as expedition-lite."
      ]
    },
    {
      id: "empty-quarter", cat: "experiences", free: true, type: "Desert",
      name: "The Empty Quarter",
      tagline: "The biggest sand desert on Earth. Dunes the size of hills, silence the size of everything.",
      blurb: "Rub' al Khali, reached from Salalah with a licensed desert operator, dunes that dwarf Wahiba's, sunsets that shut everyone up, and the hardest solitude money can buy. This is a guided expedition, not a self-drive, and it's worth every rial.",
      img: "assets/experiences/empty-quarter.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/empty-quarter-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/empty-quarter-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [18.2, 53.6],
      hours: 10, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3],
      tags: ["desert","photography","camping","adrenaline"],
      guide: "",
      stats: {
        "Best for": "The once-in-a-lifetime desert",
        "Season": "Oct–Mar",
        "Access": "From Salalah, 3–5+ hrs off-road, GUIDED convoys only",
        "Operators": "Beautiful Salalah Tours (~$90 day safari, ~$170 overnight camp), Bediyah Safari, Hud Hud (luxury)",
        "Sleep": "Operator camps under zero light pollution"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Rub+Al+Khali+Salalah",
      verify: false,
      gettingThere: [
        "Book a licensed operator out of Salalah, they run the vehicles, permits, recovery gear and camps.",
        "Self-driving the Empty Quarter without desert experience and a convoy is how rescue stories start."
      ],
      whatYoullDo: [
        "Cross the frankincense country and the gravel plains into the first true dune fields.",
        "Climb a 100-metre dune for sunset, sleep in a camp with the clearest sky you've ever seen.",
        "Stand somewhere with no human trace to the horizon in every direction."
      ],
      tips: [
        "The Salalah pairing: khareef greenery one day, the largest desert on Earth the next, nowhere else offers that.",
        "Bring warm layers, winter desert nights genuinely drop cold."
      ]
    },
    {
      id: "wadi-dayqah-park", cat: "experiences", free: true, type: "Adrenaline",
      name: "Wadi Dayqah Adventure Park",
      tagline: "Ziplines and via ferrata over the dam Oman built for postcards.",
      blurb: "At Wadi Dayqah Dam near Quriyat, an operator-run park strings ziplines, a via ferrata and hanging bridges over the water, with kayaks and pedal boats below. The easy adrenaline day, one hour from Muscat, kids welcome on most of it.",
      img: "assets/experiences/wadi-dayqah-park.jpg",
      imgCredit: "Photo: Paasikivi · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/wadi-dayqah-park-2.jpg", credit: "Photo: Omanihunter at Arabic Wikipedia · Public domain · Wikimedia Commons" },
        { src: "assets/experiences/wadi-dayqah-park-3.jpg", credit: "Photo: Omanihunter at Arabic Wikipedia · Public domain · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.084, 58.888],
      hours: 3, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["adrenaline","photography"],
      guide: "",
      stats: {
        "Best for": "Family adrenaline",
        "Time needed": "Half day",
        "Drive": "~1 hr from Muscat",
        "Book": "wadidayqah.com — day pass OMR 20 adult / 12 child / 60 family; zip+ferrata+bridge combo OMR 19",
        "Hours": "8am–10pm (official)",
        "Vehicle": "Any car"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Dayqah+Dam+Adventure+Park",
      verify: false,
      gettingThere: [
        "Signposted from Quriyat to the dam, the park operates at the dam site, book online first."
      ],
      whatYoullDo: [
        "Zipline across the reservoir, walk the hanging bridges, clip into the via ferrata line.",
        "Kayak or pedal-boat the flat water after, the dam's entry in this guide covers the viewpoint."
      ],
      tips: [
        "Book online first; summer-season operating pattern unconfirmed — check the site before the drive."
      ]
    },
    {
      id: "via-ferrata-akhdar", cat: "experiences", free: true, type: "Adrenaline",
      name: "Via ferrata on Jabal Akhdar",
      tagline: "Clip in, step off the edge of the Green Mountain.",
      blurb: "A guided cable-protected route across Jabal Akhdar's cliff faces, Oman's biggest managed adrenaline hit, run by professional outfits with all gear provided. Cold-season only, booked ahead, no experience needed beyond nerve.",
      img: "assets/experiences/via-ferrata-akhdar.jpg",
      imgCredit: "Photo: Ocyid · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/via-ferrata-akhdar-2.jpg", credit: "Photo: Ocyid · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/via-ferrata-akhdar-3.jpg", credit: "Photo: Zairon · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [23.06915, 57.65798],
      hours: 4, fitness: 3, needs4x4: true, swim: false, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["adrenaline"],
      guide: "",
      stats: {
        "Best for": "The nerve test with the view",
        "Season": "Oct–Apr",
        "Operator": "Wadi Adventure Oman (book.wadi-adventure.com) or Anantara\u2019s resort route — prices on enquiry",
        "Requirements": "Age/height/fitness minimums apply",
        "Vehicle": "4×4 for the mountain checkpoint"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.06915,57.65798",
      verify: false,
      gettingThere: [
        "Book ahead, meet the guides on the mountain, 4×4 required past the Birkat Al Mouz checkpoint."
      ],
      whatYoullDo: [
        "Harness up, clip to the steel line, traverse ledges and bridges with a kilometre of air under your heels.",
        "Guides manage every clip, your only job is the next step."
      ],
      tips: [
        "Winter mornings are cold up there, layer up.",
        "Combine with the rose terraces or the Anantara viewpoint for the classic Akhdar day."
      ]
    },
    {
      id: "ballooning-wahiba", cat: "experiences", free: true, type: "Adrenaline",
      name: "Hot-air balloon over the Wahiba",
      tagline: "Sunrise over a sea of dunes, from a basket.",
      blurb: "Balloon flights lift off at dawn over the Sharqiyah Sands, an hour of silent drifting while the dunes light up gold beneath you. Operators fly the cool months, book ahead, it's the splurge that photographs like nothing else in Oman.",
      img: "assets/experiences/ballooning-wahiba.jpg",
      imgCredit: "Photo: krebsmaus07 · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/ballooning-wahiba-2.jpg", credit: "Photo: krebsmaus07 · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/ballooning-wahiba-3.jpg", credit: "Photo: Songeunyoung songeunyoung · CC0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [22.5, 58.8],
      hours: 4, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3],
      tags: ["photography","desert","adrenaline"],
      guide: "",
      stats: {
        "Best for": "The anniversary-level splurge",
        "Season": "~Oct–Mar, dawn flights",
        "Operators": "Royal Balloon Oman / Bin Majid — roughly OMR 80 pp, residents less; season Oct–Apr",
        "Time needed": "3–4 hrs incl. transfers",
        "Base": "Wahiba edge camps"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Hot+Air+Balloon+Wahiba+Oman",
      verify: false,
      gettingThere: [
        "Book direct with the operator, they collect from the desert camps before first light."
      ],
      whatYoullDo: [
        "Lift off as the sun breaks the horizon, an hour over the dune sea, land wherever the wind says, celebrate like the tradition demands."
      ],
      tips: [
        "Pair it with a Wahiba camp night, you're up at dawn anyway.",
        "Flights cancel on wind, keep a flexible morning."
      ]
    },
    {
      id: "flamingo-lake-quriyat", cat: "experiences", free: true, type: "Wildlife",
      name: "Quriyat's flamingo lagoon",
      tagline: "Pink birds, twenty minutes off the Muscat–Sur road.",
      blurb: "The khor at Quriyat pulls in flamingos and migrating waders through the cool months, an easy add-on to the coast-road day everyone already drives. Binoculars, golden light, zero effort.",
      img: "assets/experiences/flamingo-lake-quriyat.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/flamingo-lake-quriyat-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/flamingo-lake-quriyat-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.25905, 58.91964],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3],
      tags: ["wildlife","photography"],
      guide: "",
      stats: {
        "Best for": "A 30-min bird stop",
        "Season": "Oct–Mar for the big flocks",
        "On the way": "Quriyat, off the Muscat–Sur road",
        "Entry": "Free",
        "Vehicle": "Any car"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.25905,58.91964",
      verify: false,
      gettingThere: [
        "Turn into Quriyat off Route 17 and head for the khor/lagoon on the town's edge."
      ],
      whatYoullDo: [
        "Scan the shallows, flamingo lines, herons, waders working the mud.",
        "Stay in the car at first, it works as a hide, birds spook when doors open."
      ],
      tips: [
        "Morning and late afternoon put the light behind you and the birds close.",
        "Pairs with Wadi Dayqah Dam and the Bimmah road, same junction."
      ]
    },
    {
      id: "matrah-fort", cat: "experiences", free: true, type: "Fort",
      name: "Matrah Fort & the corniche",
      tagline: "The little fort with the best free view in old Muscat.",
      blurb: "The 16th-century Portuguese fort on the rock above Mutrah harbour. Climb up for the view every postcard of Oman is trying to be, then spend the evening below it: corniche, fish market, souq. This is 'things to do in Matrah' in one entry.",
      img: "assets/experiences/matrah-fort.jpg",
      imgCredit: "Photo: Eduard Marmet · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/matrah-fort-2.jpg", credit: "Photo: Safa.daneshvar · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/matrah-fort-3.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.62031, 58.56677],
      hours: 2, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography","sunset"],
      guide: "",
      stats: {
        "Best for": "The harbour view",
        "Time needed": "30–45 min for the fort, an evening for Matrah",
        "Climb": "Steep steps, 10 min",
        "Vehicle": "Any car / taxi",
        "Best time": "Late afternoon into dusk",
        "Hours": "Daily 8am–11pm (official site)",
        "Entry": "OMR 3 non-resident adult / OMR 2 child"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.62031,58.56677",
      insta: "https://www.instagram.com/hussain_explores/reel/DSW1Z5MjKQL/", // the viewpoint reel
      verify: true,
      gettingThere: [
        "It's the fort you can already see from anywhere on Mutrah corniche.",
        "Park along the corniche or by the souq and walk, the steps start at the base of the rock."
      ],
      whatYoullDo: [
        "Climb the steps to the towers, the harbour, the mountains and the old town spread out below.",
        "Time it for golden hour, the whole bay lights up.",
        "Come down and do Matrah properly: fish market at the north end, souq in the middle, corniche shawarma at the end."
      ],
      tips: [
        "The steps are steep, decent shoes help.",
        "Pair it with the Mutrah souq entry, they're a hundred metres apart."
      ]
    },
    {
      id: "bioluminescence-qantab", cat: "experiences", free: true, type: "Night glow",
      name: "Bioluminescence at Qantab",
      tagline: "The night the sea glows blue. Sometimes.",
      blurb: "On the right winter night, the water around Qantab lights up electric blue wherever it's disturbed, every wave, every splash, every kick of your feet. It's plankton, it's real, and it's never guaranteed, which is exactly why it feels like magic when you catch it.",
      img: "assets/experiences/bioluminescence-qantab.jpg",
      imgCredit: "Photo: Panamitsu · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/bioluminescence-qantab-2.jpg", credit: "Photo: Panamitsu · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/bioluminescence-qantab-3.jpg", credit: "Photo: Panamitsu · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.556, 58.632],
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [11,12,1,2],
      tags: ["wildlife","photography","swimming","boat"],
      guide: "",
      stats: {
        "Best for": "A night you won't shut up about",
        "Time needed": "1–2 hrs after dark",
        "Season": "Winter-ish, roughly Nov–Feb",
        "Needs": "Moonless dark + clear calm water + luck",
        "Vehicle": "Any car to Qantab",
        "Entry": "Free from shore, boat optional"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.556,58.632",
      insta: "https://www.instagram.com/hussain_explores/reel/DSo_iEkjPfT/", // the glow, filmed real
      verify: true,
      gettingThere: [
        "Drive to Qantab beach after dark, 20–25 min from town.",
        "Walk to the water's edge away from the village lights, darker is better."
      ],
      whatYoullDo: [
        "Let your eyes adjust for ten minutes, phone away.",
        "Splash the shallows or drag a hand through the water and watch the blue fire trail behind it.",
        "If it's a strong night, swim, every stroke glows. A boat out of the bay makes it stronger still."
      ],
      tips: [
        "How it works: dinoflagellate plankton flash blue when the water is disturbed, their defence mechanism, your light show.",
        "Chase it, don't promise it: new-moon nights in winter with calm clear water are your best odds, and some nights it's simply not there.",
        "Every light kills it, no torches at the waterline, let the dark do its work."
      ]
    },
    {
      id: "dhow-bandar-rowdha", cat: "experiences", free: true, type: "Boat trip",
      name: "Dhow cruise from Bandar Al Rowdha",
      tagline: "Muscat's coast the way it was meant to be seen, from a wooden deck.",
      blurb: "A traditional Omani dhow out of Bandar Al Rowdha marina, cruising the cliffs, forts and coves south of the harbour. Sunset runs are the classic: the coast goes gold, the city disappears, and the boat does the work.",
      img: "assets/experiences/dhow-bandar-rowdha.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/dhow-bandar-rowdha-2.jpg", credit: "Photo: see source · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/dhow-bandar-rowdha-3.jpg", credit: "Photo: Mostafameraji · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.57445, 58.61115],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["boat","sunset","photography","culture"],
      guide: "",
      stats: {
        "Best for": "Sunset on the water",
        "Time needed": "2–3 hrs",
        "Departs": "Bandar Al Rowdha marina, 10 min past Mutrah",
        "Book?": "Yes, ahead — several operators run from the marina; sunset slots sell out first",
        "Vehicle": "Any car / taxi to the marina",
        "Kids": "Easy yes"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.57445,58.61115",
      insta: "https://www.instagram.com/hussain_explores/reel/DUJFPi8DFcL/", // the dhow explainer — 4.1K likes
      verify: true,
      gettingThere: [
        "Bandar Al Rowdha marina is 10 minutes past Mutrah on the Sidab road.",
        "Book ahead and arrive 20 min early, boats don't wait for parking."
      ],
      whatYoullDo: [
        "Board a real wooden dhow, the boats Oman traded from for centuries.",
        "Cruise under the cliffs and past coves you can't reach by road.",
        "Watch sunset hit the Hajar mountains from the water with Omani coffee in hand."
      ],
      tips: [
        "Sunset departures sell out first, book those early.",
        "Light jacket in winter, the sea breeze is real once you're moving."
      ]
    },
    {
      id: "romantic-cave-tiwi", cat: "experiences", free: true, type: "Cave",
      name: "The Romantic Cave, Tiwi",
      tagline: "Beautiful enough to name, dangerous enough to respect.",
      blurb: "A sea cave in the cliffs by Tiwi's pebble beach, light bouncing off turquoise water inside dark rock. It is genuinely stunning and genuinely unforgiving: swell funnels into the entrance, and the rocks give you nothing to hold.",
      img: "assets/experiences/romantic-cave-tiwi.jpg",
      imgCredit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/romantic-cave-tiwi-2.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/romantic-cave-tiwi-3.jpg", credit: "Photo: yeowatzup · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "coast-east", coords: [22.8539, 59.2380], // "Romantic cave (Love cave)" — pin confirmed by Hussain
      hours: 2, fitness: 3, needs4x4: false, swim: true, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["swimming","photography","adrenaline"],
      guide: "recommended",
      stats: {
        "Best for": "The photo and the story",
        "Time needed": "1–2 hrs with the beach",
        "Swim": "Yes, entry is by water",
        "Danger": "Real. Calm flat sea ONLY, never alone",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Romantic+cave+Love+cave+Tiwi",
      insta: "https://www.instagram.com/hussain_explores/reel/DUN_l4sDHKG/", // the beach + cave reel
      verify: true,
      gettingThere: [
        "Start from Pebble Beach at Tiwi and walk the shoreline toward the cliffs.",
        "The cave mouth is reached from the water, size it up from land first."
      ],
      whatYoullDo: [
        "Read the sea before anything else. Swell at the entrance means the answer is no, today.",
        "On a flat calm day, swim in with a buddy and let your eyes adjust, the light inside is the whole point.",
        "Keep clear of the walls, surge moves you harder than you expect."
      ],
      tips: [
        "This is a calm-day-only spot. If you're not confident in the sea, enjoy it from outside, it's still beautiful.",
        "Never alone, never at dusk, never in swell. Three nevers, all of them earned.",
        "A waterproof torch turns the back of the cave from black to blue."
      ]
    },
    {
      id: "ain-al-kasfah", cat: "experiences", free: true, type: "Spring",
      name: "Ain Al Kasfah hot springs",
      tagline: "Rustaq's natural hot bath, and your post-wadi recovery plan.",
      blurb: "A genuinely hot mineral spring bubbling out at Rustaq, feeding bath houses and a falaj that's watered these palms for centuries. Locals have used it for aches and skin for generations. An hour from Muscat and criminally uncombined with the wadis next door.",
      img: "assets/experiences/ain-al-kasfah.jpg",
      imgCredit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/ain-al-kasfah-2.jpg", credit: "Photo: Hans Birger Nilsen · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/ain-al-kasfah-3.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.38884, 57.42514],
      hours: 1, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","swimming"],
      guide: "",
      swimTime: "20–30 min is plenty, the water is properly hot",
      bring: { essential: ["Change of clothes", "Modest swimwear, this is a town spring"], optional: ["Towel", "Water to drink, hot soak dehydrates"] },
      stats: {
        "Best for": "A hot soak after a wadi",
        "Time needed": "45 min – 1 hr",
        "Water": "Hot, mineral spring",
        "Baths": "Separate men's and women's sections",
        "Vehicle": "Any car, ~1 hr from Muscat (Seeb side)",
        "Entry": "Bath houses ~OMR 1 per ~15-min slot (as of early 2026); the spring area is free to visit"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.38884,57.42514",
      insta: "https://www.instagram.com/hussain_explores/reel/DT-QlnADBpL/",
      verify: true,
      gettingThere: [
        "Drive toward Rustaq, about an hour from Muscat from the Seeb side, longer from Qurm.",
        "The spring is signposted in town, park beside it."
      ],
      whatYoullDo: [
        "Soak in genuinely hot spring water — the bath houses are open and usable (separate men's and women's sections), with improvement works still ongoing around the site.",
        "Watch the spring feed straight into the falaj system running off through the palms.",
        "Free fish spa included, the little fish in the channels have no boundaries."
      ],
      tips: [
        "Bring a change of clothes, you will want it.",
        "The perfect circuit: Ain Al Kasfah + Rustaq Fort + Wadi Al Hoqain, all within half an hour of each other.",
        "Go early or late, midday soak in hot water under hot sun is a choice."
      ]
    },
    {
      id: "hijrat-al-sheikh", cat: "experiences", free: true, type: "Village",
      name: "Hijrat Al Sheikh",
      tagline: "A 300-year-old village where the falaj still runs the show.",
      blurb: "'The sheikh's room': three centuries of village, working falaj channels threading the farms exactly as classical Omani irrigation intended, a little market, a walk-in bird enclosure, and more coffee shops than a village this size has any right to. Come to walk slowly and sit long.",
      img: "assets/experiences/hijrat-al-sheikh.jpg",
      imgCredit: "Photo: H. Grobe · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/hijrat-al-sheikh-2.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/hijrat-al-sheikh-3.jpg", credit: "Photo: NationalMuseumOman · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.4516, 57.8094], // Hujrat Al Sheikh Heritage Walkway (pin confirmed by Hussain)
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography","food"],
      guide: "",
      stats: {
        "Best for": "Slow culture + coffee",
        "Time needed": "1–2 hrs",
        "Walk": "Easy, flat village lanes",
        "Vehicle": "Any car",
        "Best time": "Morning or late afternoon",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Hujrat+Al+Sheikh+Heritage+Walkway",
      insta: "https://www.instagram.com/hussain_explores/reel/DVGM8YoDNMA/",
      verify: true,
      gettingThere: [
        "Head inland on the Nakhal road (Route 13), about 1¼–1½ hrs from Muscat — search 'Hujrat Al Sheikh Heritage Walkway' on Google Maps, the pin takes you straight there.",
        "Any car does it; park by the walkway entrance."
      ],
      whatYoullDo: [
        "Walk the falaj lines through the farms, 300 years of engineering still doing its job.",
        "Poke around the little market and step inside the bird enclosure.",
        "Then do what the village is built for: pick a coffee shop and stay a while."
      ],
      tips: [
        "Dress modestly and greet people, this is a living village, not a museum.",
        "Pairs into the Rustaq loop if the pin confirms where I think it is."
      ]
    },
    {
      id: "rose-season-jabal-akhdar", cat: "experiences", free: true, type: "Season",
      name: "Rose season on Jabal Akhdar",
      tagline: "Three weeks a year, the Green Mountain turns pink.",
      blurb: "From roughly late March to late April the terrace villages of Jabal Akhdar bloom with damask roses, and the air genuinely smells of them. Families pick at dawn and distil rosewater the way they have for centuries. Miss the window, wait a year.",
      img: "assets/experiences/rose-season-jabal-akhdar.jpg",
      imgCredit: "Photo: Kathryn james · CC BY 2.0 · Wikimedia Commons",
      region: "dakhiliyah", coords: [23.070, 57.660],
      hours: 3, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [3,4],
      tags: ["nature","culture","photography"],
      guide: "",
      stats: {
        "Best for": "The bloom + rosewater houses",
        "Season": "~Late March to late April, short and sharp",
        "Where": "Al Ayn, Al Aqr & Ash Shirayjah terraces",
        "Time needed": "Half day on the mountain",
        "Vehicle": "4×4 required for the Jabal Akhdar road (checkpoint enforced)",
        "Entry": "Free, distillery visits vary"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Ayn+Village+Jabal+Akhdar",
      insta: ["https://www.instagram.com/hussain_explores/reel/DXKEqAajCc-/", // rose season
              "https://www.instagram.com/hussain_explores/reel/DXLpov7DHOm/"], // Al Ain village terraces
      verify: true,
      gettingThere: [
        "Drive to Jabal Akhdar, 4×4 only past the Birkat Al Mouz checkpoint.",
        "Head for the terrace villages, Al Ayn, Al Aqr, Ash Shirayjah, and walk the village path between them."
      ],
      whatYoullDo: [
        "Walk the terrace path with the roses in full bloom around you.",
        "Find a distillation house and watch rosewater being made over wood fires.",
        "Buy a bottle from the family that made it, it's the souvenir that beats every souq."
      ],
      tips: [
        "Timing is everything and shifts with the weather each year, check before you drive.",
        "Dawn is when picking happens, that's the real show.",
        "The full Jabal Akhdar entry covers the rest of the mountain, this entry is the season."
      ]
    },
    {
      id: "whale-sharks", cat: "experiences", free: true, type: "Wildlife",
      name: "Whale shark season",
      tagline: "Summer's consolation prize: the biggest fish on Earth, off Muscat.",
      blurb: "When the summer heat empties the wadis, the sea delivers: whale sharks gather off the Daymaniyat Islands roughly June to October. Snorkelling beside one is the single most humbling thing you can do in Omani water, and it's a day trip from the capital.",
      img: "assets/experiences/whale-sharks.jpg",
      imgCredit: "Photo: Laika ac from USA · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/whale-sharks-2.jpg", credit: "Photo: Brocken Inaglory · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/whale-sharks-3.jpg", credit: "Photo: Jordy Meow · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.850, 58.100],
      hours: 6, fitness: 2, needs4x4: false, swim: true, kidOk: false,
      months: [8,9,10,11],
      tags: ["wildlife","snorkel","boat"],
      guide: "required",
      stats: {
        "Best for": "The biggest fish on Earth",
        "Season": "~Aug–Nov, peak late Aug–early Oct, sightings luck-dependent",
        "Time needed": "Full-day boat trip",
        "Departs": "Al Mouj & Bandar Al Rowdha marinas — Horizon Blue, SeaOman, Octopus Oman",
        "Swim level": "Confident snorkeller",
        "Cost": "From ~OMR 30 pp shared trip + OMR 3 island permit"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Daymaniyat+Islands",
      insta: "https://www.instagram.com/hussain_explores/reel/DapZDrDsnUD/", // cruising around looking for whale sharks
      verify: true,
      gettingThere: [
        "Book a licensed Daymaniyat snorkel/dive operator out of Muscat, summer departures chase the sharks.",
        "Boats leave early, be at the marina by the time they say minus fifteen minutes."
      ],
      whatYoullDo: [
        "Scan the blue with the crew until a shadow the size of a bus appears.",
        "Slip in quietly and swim alongside, they're filter feeders, utterly indifferent to you.",
        "Between sightings you're at the Daymaniyats anyway, the snorkelling fills the gaps."
      ],
      tips: [
        "Keep 3–4 metres away and never touch or block its path, guides brief this and mean it.",
        "No sighting is possible, it's wildlife. The islands make sure the day is never wasted.",
        "This is THE reason to visit Muscat in summer, the season most guides write off."
      ]
    },
    {
      id: "grand-mosque", cat: "experiences", free: true, type: "Mosque",
      name: "Sultan Qaboos Grand Mosque",
      tagline: "The one thing every visitor should do in Muscat.",
      blurb: "The mosque that changes how people see the whole country, the scale, the light, the second-largest hand-woven carpet on earth. Free to enter, and an hour well spent.",
      img: "assets/experiences/grand-mosque.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/grand-mosque-2.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/grand-mosque-3.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.58233, 58.38961],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Arms and legs covered", "Women: a scarf to cover your hair", "Shoes you can slip off easily"],
        optional: ["Robe hire on site (~OMR 2.5) if you forget", "Wide lens for the prayer hall", "Arrive at 8am, empty and cool"]
      },
      stats: {
        "Best for": "Culture / architecture",
        "Time needed": "1–1.5 hrs",
        "Visiting hours": "8–11am daily, closed Fridays & public holidays",
        "Dress code": "Arms/legs covered; women cover hair",
        "Booking": "Walk-in",
        "Entry": "Free (guided tour ~OMR 5pp; robe hire ~OMR 2.5)"
      },
      // Opening hours confirmed first-hand by Hussain, no "check on the day" note.
      // visitWindow: the planner may only schedule this spot between these
      // clock hours (visitor doors). closedFridays adds the Friday warning.
      visitWindow: [8, 11],
      closedFridays: true,
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.58233,58.38961",
      insta: "https://www.instagram.com/hussain_explores/reel/DTnzHSpjPTj/",
      verify: false,
      gettingThere: [
        "Short taxi or drive from anywhere in Muscat. Visitor parking on site.",
        "Non-Muslim visiting hours: 8–11am, every day except Friday and public holidays.",
        "Be there by 10am at the latest, or you're walking straight back out.",
        "Dress code is enforced: long sleeves, long trousers/skirt, and a headscarf for women."
      ],
      whatYoullDo: [
        "Start in the courtyard.",
        "Then the main prayer hall, the chandelier and the carpet are the reason people talk about this place.",
        "Give it an hour. Don't rush the prayer hall; it's the whole point."
      ],
      tips: [
        "Open to visitors 8–11am, every day except Friday and public holidays. That's a narrow window, plan the morning around it, not the other way round.",
        "Go right at 8am, noticeably quieter and cooler for photos.",
        "Pair it with Mutrah Souq / the Corniche the same morning."
      ]
    },
    {
      id: "mutrah", cat: "experiences", free: true, type: "Souq",
      name: "Mutrah Souq & Corniche",
      tagline: "Old Muscat, best at dusk.",
      blurb: "The corniche at golden hour, then straight into the souq, frankincense, silver, textiles, and the smell of oud in every alley. It's touristy and it's still good; you just have to haggle.",
      img: "assets/experiences/mutrah.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/mutrah-2.jpg", credit: "Photo: see source · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/mutrah-3.jpg", credit: "Photo: Hafsa rk · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.61729, 58.59395],
      hours: 2.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","food","photography","sunset"],
      guide: "",
      bring: {
        essential: ["Cash, many stalls don't take card", "Modest clothing"],
        optional: ["A firm 'no thanks', the first price is never the price", "Room in your bag for frankincense", "Camera for the corniche at sunset"]
      },
      insta: "https://www.instagram.com/hussain_explores/reel/DQ9mbXyDDlu/",
      stats: {
        "Best for": "Souq / sunset / your first evening",
        "Time needed": "2–3 hrs",
        "Souq hours": "~9am–1pm & 5–9pm (roughly)",
        "Vehicle": "Any car / taxi",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.61729,58.59395",
      verify: true,
      gettingThere: [
        "Muscat waterfront, 15 min from most hotels.",
        "Park along the corniche and walk. Go at dusk, not midday."
      ],
      whatYoullDo: [
        "Walk the corniche as the light goes, that's the photo.",
        "Then into the souq. Buy frankincense and a burner.",
        "Ignore the 'antique' khanjars. They aren't.",
        "Haggle: start at about half, meet in the middle.",
        "Eat on the water afterwards."
      ],
      tips: [
        "Go at dusk, the light on the corniche is the photo.",
        "Haggle. Start at about half and meet in the middle."
      ]
    },
    {
      id: "bimmah-sinkhole", cat: "experiences", free: true, type: "Swim spot",
      name: "Bimmah Sinkhole",
      tagline: "A natural blue swimming hole right off the coast road.",
      blurb: "A surreal limestone sinkhole filled with blue-green water, sitting in a tidy park just off the coastal highway. Steps lead right down to the water. Not a beach, a one-hour experience you stop for on the way to Wadi Shab.",
      img: "assets/beaches/bimmah-sinkhole.jpg",
      imgCredit: "Photo: Uhooep · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/bimmah-sinkhole-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/bimmah-sinkhole-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "coast-east", coords: [23.03688, 59.07013],
      hours: 1.5, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["swimming","photography"],
      guide: "",
      swimTime: "30–60 min, it's a stop, not a day",
      bring: {
        essential: ["Swimwear", "Towel"],
        optional: ["Goggles, the little fish will nibble your feet", "Water shoes for the steps"]
      },
      stats: {
        "Best for": "Quick swim / photos",
        "Time needed": "1–1.5 hrs",
        "Swim": "Yes",
        "Vehicle": "Any car",
        "Opening hours": "8am–8pm",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.03688,59.07013",
      insta: "https://www.instagram.com/hussain_explores/reel/DUUCjQOjMWn/",
      verify: true,
      gettingThere: [
        "Route 17, the Muscat–Sur coast road, 1.5 hrs from Muscat.",
        "It's inside Hawiyat Najm Park, near Bimmah village. Free parking.",
        "Steps lead straight down to the water. Open 8am–8pm."
      ],
      whatYoullDo: [
        "Swim. Jump in. Photograph the colour, midday sun makes it glow.",
        "Let the little fish nibble your feet. They will.",
        "Then leave, it's an hour, not a day.",
        "Do it on the same run as Wadi Shab. They're minutes apart."
      ],
      tips: [
        "Combine Bimmah + Wadi Shab in one coastal day.",
        "Midday sun makes the water glow for photos."
      ]
    },
    {
      id: "daymaniyat", cat: "experiences", free: false, type: "Snorkel",
      name: "Daymaniyat Islands",
      tagline: "Oman's best reef, a boat ride from the city.",
      blurb: "A protected marine reserve 18km off Seeb, turtles, rays, reef, and a real chance of something bigger. Half a day, and the best snorkelling in the country.",
      img: "assets/experiences/daymaniyat.jpg",
      imgCredit: "Photo: Wusel007 · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/daymaniyat-2.jpg", credit: "Photo: Wusel007 · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/daymaniyat-3.jpg", credit: "Photo: Wusel007 · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.861, 58.100],
      hours: 5, fitness: 2, needs4x4: false, swim: true, kidOk: true,
      months: [11,12,1,2,3],
      tags: ["snorkel","wildlife","beach","photography"],
      guide: "required",
      swimTime: "2–3 hrs in the water across two or three reef stops",
      bring: {
        essential: ["Reef-safe sunscreen, it's a protected reserve", "Towel", "Motion-sickness tablet if you're prone"],
        optional: ["Own mask, a leaking hire mask ruins the day", "Rash vest", "Waterproof camera", "Cash"]
      },
      stats: {
        "Best for": "Snorkelling / diving",
        "Time needed": "Half day",
        "Swim": "Yes, the whole point",
        "Access": "Boat tour only (nature reserve)",
        "Best season": "Nov–Mar (visibility, turtles)",
        "Booking": "2–3 days ahead in peak season",
        "Permit": "OMR 3 pp day visit (Environment Authority, via your operator)",
        "⚠️ May–Oct": "Beach landing banned (turtle nesting) — boat + water only"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Daymaniyat+Islands+Oman",
      insta: "https://www.instagram.com/hussain_explores/reel/DTAsYETDL0w/", // "one of my absolute favorite things"
      verify: true
    },
    {
      id: "wahiba-sands", cat: "experiences", free: false, type: "Desert",
      name: "Wahiba Sands",
      tagline: "A night in the dunes you won't get back home.",
      blurb: "Tarmac to Al Wasil, then 4×4 into the dunes: dune bashing, camels, sunset on a ridge, then stars. Book the camp ahead and bring a warm layer, it gets cold at night.",
      img: "assets/experiences/wahiba-sands.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/wahiba-sands-2.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/wahiba-sands-3.jpg", credit: "Photo: albinfo · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "sharqiyah", coords: [22.439, 58.832],
      hours: 20, fitness: 1, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3],
      tags: ["desert","camping","adrenaline","sunset","photography"],
      guide: "recommended",
      overnight: true,
      bring: {
        essential: ["A warm layer, the desert gets genuinely cold at night", "Scarf for the sand", "Your camp booking"],
        optional: ["Tripod for the stars", "Sandals you don't mind losing to a dune", "Torch", "A book, the afternoon is slow"]
      },
      stats: {
        "Best for": "Desert camp / dune bashing",
        "Time needed": "Overnight (1–2 nights)",
        "Swim": "No",
        "Vehicle": "Tarmac to Al Wasil, then 4×4 into the dunes",
        "Best season": "Oct–Mar",
        "Booking": "Book the camp ahead"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.439,58.832",
      insta: "https://www.instagram.com/hussain_explores/reel/Daw-U92sNGP/",
      verify: true
    },
    {
      id: "jabal-shams", cat: "mountains", free: true, type: "Hike",
      name: "Jabal Shams, the Balcony Walk",
      tagline: "Oman's Grand Canyon, and the hike along its rim.",
      blurb: "8.7km out-and-back along the rim of the canyon to an abandoned village. Exposed edges, huge views, and cold air at 2,000m, bring a jacket, even here.",
      img: "assets/experiences/jabal-shams.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/jabal-shams-2.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/mountains/jabal-shams-3.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.22656, 57.20106],
      hours: 6, fitness: 4, needs4x4: true, swim: false, kidOk: false,
      months: [10,11,12,1,2,3,4],
      tags: ["hiking","photography","adrenaline","mountains"],
      guide: "recommended",
      gettingThere: [
        "3.5–4 hrs from Muscat, or 1.5 hrs on from Nizwa.",
        "Paved most of the way; take a 4×4 for the last graded stretch.",
        "Start at Al Khitaym village, on the rim."
      ],
      whatYoullDo: [
        "Walk the W6 'Balcony Walk': 8.7km out-and-back, waymarked red-white-yellow.",
        "The path is a ledge cut into the canyon wall, wide enough, but the drop is real. Know that before you start.",
        "It ends at As Sab, an abandoned village tucked under the rim.",
        "Turn around and walk back the same way. Allow 4–5 hrs in total.",
        "Bring a jacket: at 2,000m it's cold and windy even when Muscat is baking."
      ],
      tips: [
        "Start early, the shade goes by late morning and it's a long walk back.",
        "3L of water. There is none on the trail.",
        "Bring a jacket. Nobody believes the mountain is cold; everybody regrets it.",
        "Pair it with Wadi Ghul below, same canyon, opposite perspective."
      ],
      hikeTime: "4–5 hrs, 8.7km out-and-back on the waymarked W6 trail",
      swimTime: "None",
      bring: {
        essential: ["Proper hiking shoes", "3L water, there is none on the trail", "A jacket (cold and windy at 2,000m, even in summer)", "Sun hat"],
        optional: ["Poles for the loose sections", "A head for heights, the ledge is exposed", "Packed lunch for the abandoned village at the turnaround"]
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
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.22656,57.20106",
      verify: true
    },
    {
      id: "nizwa", cat: "experiences", free: true, type: "Fort",
      name: "Nizwa Fort & Souq",
      tagline: "Old Oman, still very much alive.",
      blurb: "The fort tower, the souq stalls, silver, dates, pottery, spices, and, if you time it for a Friday morning, the livestock souq, which is a genuine spectacle.",
      img: "assets/experiences/nizwa.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/nizwa-2.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/nizwa-3.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [22.93314, 57.53297],
      hours: 4, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","food","photography"],
      guide: "",
      bring: {
        essential: ["Cash", "Sun hat, no shade on the fort tower"],
        optional: ["Friday ~7am for the livestock souq", "Room in the bag for dates and halwa", "Modest clothing"]
      },
      stats: {
        "Best for": "History / local life",
        "Time needed": "Half day",
        "Fort hours": "Sat–Thu 8am–8pm; Fri 8–11:30am & 1:30–8pm [CONFIRM — evening extension per omantravelhub, Jul 2026]",
        "Souq hours": "~8am–1pm & 4–8pm",
        "Best time": "Friday morning (livestock souq)",
        "Entry": "Fort OMR 5 / kids OMR 3. Souq free"
      },
      gettingThere: [
        "1.5–2 hrs from Muscat via Route 15. Easy paved drive, any car.",
        "Fort and souq are a few minutes' walk apart in the centre.",
        "Pair it with Jabal Akhdar, Al Hoota or Misfat, all on the same road inland."
      ],
      whatYoullDo: [
        "Climb the fort tower for the view over the date palms.",
        "Then walk the souq: silver, dates, pottery, spices.",
        "Friday at 7am: the livestock souq. Get there early, it's over by 9."
      ],
      tips: [
        "Friday, ~7am, for the livestock souq. It's the real spectacle and it's over by 9.",
        "The fort tower bakes at midday. Early or late.",
        "Buy dates here, not at the airport."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.93314,57.53297",
      verify: true
    },
    {
      id: "misfat-al-abriyeen", cat: "mountains", free: true, type: "Village",
      name: "Misfat Al Abriyeen",
      tagline: "A mud-brick village in the mountains that time forgot to ruin.",
      blurb: "Terraced gardens, falaj channels running through the alleys, and old stone houses stacked into the hillside. Walk it slowly, and stay the night in a village guesthouse if you can.",
      img: "assets/experiences/misfat-al-abriyeen.jpg",
      imgCredit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/misfat-al-abriyeen-2.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/mountains/misfat-al-abriyeen-3.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.12023, 57.27959],
      hours: 3, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography","hiking","mountains"],
      guide: "",
      hikeTime: "1 hr through the village and the terraces; longer if you take the trail out",
      bring: {
        essential: ["Modest clothing, people live here", "Shoes with grip (the alleys are steep and polished)", "Water"],
        optional: ["Cash for the village guesthouses and cafés", "Camera, go at golden hour", "Respect: ask before photographing doorways"]
      },
      stats: {
        "Best for": "Culture / photography",
        "Time needed": "2–3 hrs (or stay the night)",
        "Vehicle": "Any car",
        "Pairs with": "Al Hoota Cave, Wadi Ghul, Jabal Shams",
        "Best time": "Late afternoon",
        "Entry": "Free (park outside the village)"
      },
      gettingThere: [
        "2 hrs from Muscat, 30 min from Nizwa. Any car.",
        "Park outside the village.",
        "Walk in, cars aren't allowed through the old alleys."
      ],
      whatYoullDo: [
        "Walk down through the mud-brick alleys with the falaj running beside your feet.",
        "Come out into the terraced gardens below: date palms, bananas, mangoes.",
        "It takes an hour. You'll want two.",
        "Village guesthouses will put you up for the night, that's the way to do it."
      ],
      tips: [
        "Late afternoon light on the terraces is the whole reason to come.",
        "People live here. Don't photograph doorways and windows without asking.",
        "Stay the night, the village empties after 5pm and it's a different place."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.12023,57.27959",
      insta: "https://www.instagram.com/hussain_explores/reel/DDC_F40yIa2/",
      verify: true
    },
    {
      id: "al-hoota-cave", cat: "mountains", free: true, type: "Cave",
      name: "Al Hoota Cave",
      tagline: "Two million years old, and the only show cave in Arabia.",
      blurb: "4.5km of cave under the foot of Jabal Shams, with 500m of it opened up and lit. A little train takes you in. It's the easy win on a mountain day, and blissfully cool.",
      img: "assets/experiences/al-hoota-cave.jpg",
      imgCredit: "Photo: A1000 · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/al-hoota-cave-2.jpg", credit: "Photo: Paul IJpelaar · CC BY 3.0 · Wikimedia Commons" },
        { src: "assets/mountains/al-hoota-cave-3.jpg", credit: "Photo: Ambreen Waseem · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.08114, 57.34987],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","wildlife","photography","mountains"],
      guide: "",
      bring: {
        essential: ["Booking, or arrive early, slots are timed and sell out", "Closed shoes (wet, uneven floor)"],
        optional: ["A light layer, it's cool inside", "A camera that copes with low light"]
      },
      stats: {
        "Best for": "Something different / hot days",
        "Time needed": "1.5–2 hrs",
        "Hours": "Sun–Thu & Sat 9am–5pm; Fri split hours",
        "Vehicle": "Any car",
        "Entry": "~OMR 7 adults / OMR 3.5 children (foreign visitors)",
        "Booking": "Recommended, timed slots"
      },
      gettingThere: [
        "At the foot of Jabal Shams near Al Hamra, 2 hrs from Muscat. Any car, proper parking.",
        "Entry is roughly OMR 7 for adult foreign visitors, OMR 3.5 for children.",
        "Slots are timed and they sell out. Book, or turn up early."
      ],
      whatYoullDo: [
        "A little electric train takes you into the mountain.",
        "You walk the lit 500m section: stalactites, a subterranean lake.",
        "Look for the blind cave fish, they live nowhere else on earth.",
        "Two million years old, and the only show cave on the Arabian Peninsula."
      ],
      tips: [
        "Slots are timed and they do sell out. Book, or turn up early.",
        "The perfect midday stop on a hot Nizwa day, you're underground while the sun is at its worst.",
        "It closes some days. Check before you drive out there."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.08114,57.34987",
      verify: true
    },
    {
      id: "jabal-akhdar", cat: "mountains", free: true, type: "Mountain",
      name: "Jabal Akhdar",
      tagline: "Rose terraces, cold air, and villages hanging off a cliff.",
      blurb: "The Green Mountain, cool enough to grow roses and pomegranates, high enough that you'll want a jacket in the evening. The terraced village walk is one of the best easy hikes in Oman.",
      img: "assets/experiences/jabal-akhdar.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/jabal-akhdar-2.jpg", credit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/mountains/jabal-akhdar-3.jpg", credit: "Photo: Philipp Weigell · CC BY 3.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [23.07176, 57.66722],
      hours: 5, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["hiking","culture","photography","mountains"],
      guide: "",
      hikeTime: "2–3 hrs for the terraced-village loop; longer trails available",
      bring: {
        essential: ["4×4, there's a checkpoint and they turn 2WDs back", "Warm layer for the evening", "Water"],
        optional: ["Go Mar–Apr for the rose harvest", "Good camera, terraces at dawn", "Cash for village stalls"]
      },
      stats: {
        "Best for": "Cool air / terraced villages",
        "Time needed": "Half–full day",
        "Hike": "2–3 hrs (village loop)",
        "Vehicle": "4×4 REQUIRED, enforced at a checkpoint",
        "Best season": "Oct–Apr (roses Mar–Apr)",
        "Entry": "Free"
      },
      gettingThere: [
        "2 hrs from Muscat.",
        "There's a police checkpoint at the bottom of the mountain road.",
        "They WILL turn you back in a 2WD. This isn't a suggestion, it's enforced.",
        "4×4 only. No exceptions."
      ],
      whatYoullDo: [
        "Walk the terraced-village loop: Al Ayn → Ash Shirayjah → Al Aqr.",
        "The paths run down through rose terraces and pomegranate orchards, with the canyon opening below.",
        "Two to three hours. One of the best easy hikes in the country."
      ],
      tips: [
        "4×4 or you don't get up the mountain. The checkpoint is real.",
        "Mar–Apr for the rose harvest and the rosewater distilleries.",
        "It's cold up there in the evening. Bring a layer."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.07176,57.66722",
      insta: ["https://www.instagram.com/hussain_explores/reel/DXhGMJrkR5t/",
              "https://www.instagram.com/hussain_explores/reel/DXLpov7DHOm/",
              "https://www.instagram.com/hussain_explores/reel/DXKEqAajCc-/"], // terraces path · Al Ain village · rose season
      verify: true
    },
    {
      id: "musandam-dhow", cat: "experiences", free: false, type: "Boat trip",
      name: "Musandam dhow cruise",
      tagline: "Fly to Khasab. From there it's boat-only.",
      blurb: "Limestone walls falling hundreds of metres straight into dark blue water, dolphins riding the bow, and swimming stops you can't reach any other way.",
      img: "assets/experiences/musandam-dhow.jpg",
      imgCredit: "Photo: Toppazz · CC BY 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/musandam-dhow-2.jpg", credit: "Photo: Robert Haandrikman · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/musandam-dhow-3.jpg", credit: "Photo: Robert Haandrikman · CC BY 2.0 · Wikimedia Commons" }
      ], region: "musandam", coords: [26.17893, 56.24776],
      hours: 6, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["wildlife","snorkel","photography","beach"],
      guide: "required",
      swimTime: "1–2 hrs at the dhow's swim and snorkel stops",
      bring: {
        essential: ["Booking", "Sun protection, no shade on deck for long stretches", "Towel"],
        optional: ["Own mask & snorkel", "Motion-sickness tablet", "Cash", "Zoom lens for the dolphins"]
      },
      stats: {
        "Best for": "Fjords / dolphins / snorkelling",
        "Time needed": "Half–full day",
        "Swim": "Yes",
        "Getting there": "Fly or drive to Khasab, a separate trip from a Muscat base",
        "Best season": "Oct–Apr",
        "Booking": "Ahead in peak season"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=26.17893,56.24776",
      verify: true
    },

    /* ── Forts & heritage (added Jul 2026, the castle circuit) ──────────── */
    {
      id: "bahla-fort", cat: "experiences", free: true, type: "Fort",
      name: "Bahla Fort",
      tagline: "The UNESCO one, Oman's greatest mud-brick fortress.",
      blurb: "The only fort in Oman on the UNESCO World Heritage list, and it earns it: a vast mud-brick citadel rising over a 12km ring of ancient walls, restored over decades. Twenty minutes from Nizwa, do them in one day with Jabrin.",
      img: "assets/experiences/bahla-fort.jpg",
      imgCredit: "Photo: Prof. Mortel · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/bahla-fort-2.jpg", credit: "Photo: Francisco Anzola · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/bahla-fort-3.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [22.96358, 57.29993],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["A few rial for entry", "Water, it's a big site with little shade"],
        optional: ["Hat", "Wide lens"]
      },
      stats: {
        "Best for": "The one fort to see if you see only one",
        "Time needed": "1.5–2 hrs",
        "Vehicle": "Any car",
        "Entry": "Small fee",
        "Status": "UNESCO World Heritage",
        "Closed": "Check Friday hours"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.96358,57.29993",
      verify: true,
      gettingThere: [
        "Route 21 past Nizwa, about 2 hrs from Muscat, 25 min beyond Nizwa.",
        "Park at the fort entrance. Any car.",
        "Stack the day: Nizwa souq early → Bahla Fort → Jabrin Castle → Al Hoota Cave or Misfat."
      ],
      whatYoullDo: [
        "Climb through the towers and wall-walks, the scale only lands from the ramparts.",
        "Look out over the oasis and the old walled town below.",
        "Swing past the potters, Bahla is also Oman's pottery town."
      ],
      tips: [
        "Morning light for photos; afternoons bake.",
        "Jabrin Castle is 15 min away and the two are a natural pair, fort for scale, castle for interiors."
      ]
    },
    {
      id: "jabrin-castle", cat: "experiences", free: false, type: "Fort",
      name: "Jabrin Castle",
      tagline: "The most beautiful rooms in any Omani fort, painted ceilings and secret passages.",
      blurb: "Bahla is the fortress; Jabrin is the palace. Built as a scholars' retreat, it has the finest interiors of any castle in the country, painted ceilings, carved balconies, date stores, courts and hidden stairways. If castles usually bore you, this is the one that won't.",
      img: "assets/experiences/jabrin-castle.jpg",
      imgCredit: "Photo: Leon petrosyan · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/jabrin-castle-2.jpg", credit: "Photo: Muck · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/jabrin-castle-3.jpg", credit: "Photo: Muck · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [22.91543, 57.24951],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["A few rial for entry"],
        optional: ["Combine with Bahla Fort, 15 min apart"]
      },
      stats: {
        "Best for": "Interiors, the painted ceilings",
        "Time needed": "1–1.5 hrs",
        "Vehicle": "Any car",
        "Entry": "Small fee",
        "Closed": "Check Friday hours"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.91543,57.24951",
      verify: true
    },
    {
      id: "nakhal-fort", cat: "experiences", free: false, type: "Fort",
      name: "Nakhal Fort & the hot springs",
      tagline: "A fort wrapped around a rock, with a hot spring in the palms below.",
      blurb: "Under an hour from Muscat: a fort built straight onto a boulder outcrop with the Hajar wall behind it, and Ain A'Thawwarah hot spring flowing through the date plantation below. The classic half-day escape from the capital, and the gateway to the whole Rustaq loop.",
      img: "assets/experiences/nakhal-fort.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/nakhal-fort-2.jpg", credit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/nakhal-fort-3.jpg", credit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.39514, 57.8291],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["A few rial for entry"],
        optional: ["Sandals for the spring, warm water, small fish"]
      },
      stats: {
        "Best for": "Fort + spring in one easy stop",
        "Time needed": "1.5–2 hrs",
        "Vehicle": "Any car",
        "Entry": "Small fee",
        "Loop": "Start of the Rustaq loop (Nakhal → Rustaq → Al Hazm)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.39514,57.8291",
      verify: true
    },
    {
      id: "rustaq-fort", cat: "experiences", free: false, type: "Fort",
      name: "Rustaq Fort & Ain Al Kasfah",
      tagline: "The old capital's fortress, and Oman's hottest spring.",
      blurb: "Rustaq was once the capital, and its four-towered fort shows it. Down the road, Ain Al Kasfah runs at about 45°C year-round, locals swear by the water. The middle stop of the Nakhal → Rustaq → Al Hazm castle loop.",
      img: "assets/experiences/rustaq-fort.jpg",
      imgCredit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/rustaq-fort-2.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/rustaq-fort-3.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.3906, 57.4249],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["A few rial for entry"],
        optional: ["Modest dress for the spring, it's a local bathing spot"]
      },
      stats: {
        "Best for": "History + the hot spring",
        "Time needed": "1.5–2 hrs",
        "Vehicle": "Any car",
        "Entry": "Small fee",
        "Loop": "Middle of the Rustaq loop"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.3906,57.4249",
      verify: true
    },
    {
      id: "al-hazm-castle", cat: "experiences", free: false, type: "Fort",
      name: "Al Hazm Castle",
      tagline: "The engineering marvel, a falaj runs straight through the castle.",
      blurb: "The most sophisticated of the Batinah castles: cannon-proof walls, a falaj channelling spring water right through the building, escape tunnels and one of the best restorations in the country. Finishes the Nakhal → Rustaq → Al Hazm loop.",
      img: "assets/experiences/al-hazm-castle.jpg",
      imgCredit: "Photo: Gonzo Gooner · CC BY 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/al-hazm-castle-2.jpg", credit: "Photo: Hans Birger Nilsen · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/al-hazm-castle-3.jpg", credit: "Photo: Reda Kerbush · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "rustaq", coords: [23.55053, 57.47279],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["A few rial for entry"],
        optional: ["Audio guide if offered, the details are the point here"]
      },
      stats: {
        "Best for": "The cleverest castle in Oman",
        "Time needed": "1–1.5 hrs",
        "Vehicle": "Any car",
        "Entry": "Small fee",
        "Loop": "End of the Rustaq loop"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.55053,57.47279",
      verify: true
    },
    {
      id: "birkat-al-mouz", cat: "experiences", free: true, type: "Village",
      name: "Birkat Al Mouz",
      tagline: "Ruins, banana groves and a UNESCO falaj, the gateway to Jabal Akhdar.",
      blurb: "At the foot of the Jabal Akhdar road: the abandoned mud-brick quarter of Harat Al Sibani stacked above banana plantations, with Falaj Al Khatmeen, one of Oman's five UNESCO-listed aflaj, running through it. Twenty minutes, or two hours if the light is good.",
      img: "assets/experiences/birkat-al-mouz.jpg",
      imgCredit: "Photo: Lionel Duchoiselle (https://www.geodiversite.net/auteur386) · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/birkat-al-mouz-2.jpg", credit: "Photo: John Crane from Prague, Czech Republic · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/birkat-al-mouz-3.jpg", credit: "Photo: John Crane from Prague, Czech Republic · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [22.92411, 57.6683],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Shoes with grip, the ruin paths are crumbly"],
        optional: ["Respectful distance from homes, people still live around the old quarter"]
      },
      stats: {
        "Best for": "Ruins + falaj on the way up Jabal Akhdar",
        "Time needed": "1–2 hrs",
        "Vehicle": "Any car",
        "Entry": "Free",
        "Status": "Falaj Al Khatmeen is UNESCO-listed"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.92411,57.6683",
      verify: true,
      gettingThere: [
        "On Route 21 just before the Jabal Akhdar checkpoint turn-off, 1h45 from Muscat.",
        "Park by the falaj or the mosque. Any car.",
        "Walk up into the old quarter from the plantation side."
      ],
      whatYoullDo: [
        "Follow the falaj as it splits through the plantations, this is living UNESCO engineering, not a museum.",
        "Climb through the abandoned houses of Harat Al Sibani for the view over the banana groves.",
        "Then start the climb to Jabal Akhdar, this is its front door."
      ],
      tips: [
        "Late afternoon light turns the mud brick gold.",
        "Don't enter rooms with cracked lintels, these ruins are genuinely fragile.",
        "Stack it: Birkat Al Mouz → Jabal Akhdar sunset is the classic run."
      ]
    },
    {
      id: "old-muscat", cat: "experiences", free: true, type: "Heritage",
      name: "Old Muscat & Al Alam Palace",
      tagline: "The Sultan's palace, two Portuguese forts and the oldest quarter in the capital.",
      blurb: "The original walled Muscat: the blue-and-gold Al Alam Palace flanked by the 16th-century Portuguese forts of Mirani and Jalali, with the National Museum across the square. An easy, beautiful city walk, and it connects to Mutrah along the corniche.",
      img: "assets/experiences/old-muscat.jpg",
      imgCredit: "Photo: Dr. Ondřej Havelka (cestovatel) · CC BY 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/old-muscat-2.jpg", credit: "Photo: Tristan · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/experiences/old-muscat-3.jpg", credit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.6159, 58.5925],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: [],
        optional: ["National Museum entry fee if you go in, worth it", "Walking shoes for the corniche loop"]
      },
      stats: {
        "Best for": "The ceremonial heart of Muscat",
        "Time needed": "1.5–2 hrs (more with the museum)",
        "Vehicle": "Any car, or walk from Mutrah",
        "Entry": "Palace viewed from outside; museum has a fee"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.6159,58.5925",
      verify: true,
      gettingThere: [
        "10 min beyond Mutrah along the corniche road.",
        "Park by the National Museum square.",
        "Everything is within a few hundred metres on foot."
      ],
      whatYoullDo: [
        "Walk the palace approach, the mushroom-column facade is Muscat's most photographed frame after the mosque.",
        "Spot Mirani and Jalali forts guarding the old harbour on both sides.",
        "Do the National Museum if you want the country's story in ninety minutes."
      ],
      tips: [
        "Combine with Mutrah: souq at dusk, corniche walk, Old Muscat in the golden hour.",
        "The palace is photographed from the plaza, you don't go inside."
      ]
    },
    {
      id: "royal-opera-house", cat: "experiences", free: true, type: "Landmark",
      name: "Royal Opera House Muscat",
      tagline: "Arabia's opera house, worth seeing even with no ticket.",
      blurb: "Omani marble, teak and craftsmanship at a scale nothing else in the Gulf matches. Catch a performance if the season is on; otherwise the daytime tour and the arcades around it still justify the stop on any Muscat day.",
      img: "assets/experiences/royal-opera-house.jpg",
      imgCredit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/royal-opera-house-2.jpg", credit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/royal-opera-house-3.jpg", credit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.61258, 58.4657],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Smart-casual dress, shorts won't get you into a performance"],
        optional: ["Check the season programme before your trip, tickets sell out"]
      },
      stats: {
        "Best for": "Architecture + a night out in Muscat",
        "Time needed": "1 hr tour · evening for a show",
        "Vehicle": "Any car",
        "Entry": "Tour fee; performance tickets vary",
        "Season": "Sep–May typically"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.61258,58.4657",
      insta: "https://www.instagram.com/hussain_explores/reel/DVNxLLWDP61/",
      verify: true,
      whatYoullDo: [
        "Take the morning tour, the auditorium's woodwork is the best of Omani craft in one room.",
        "Or book a show: opera, Arabic music, ballet, the mix is wide.",
        "The Opera Galleria next door does a good pre-show dinner."
      ],
      tips: [
        "Book performances weeks ahead in season.",
        "Dress code is enforced for shows, no shorts or sandals."
      ]
    },
    {
      id: "bat-necropolis", cat: "experiences", free: false, type: "Ruins",
      name: "Bat & Al Ayn beehive tombs",
      tagline: "5,000-year-old tombs on a ridgeline, older than the pyramids.",
      blurb: "A UNESCO site almost nobody visits: Bronze Age beehive tombs strung along ridgetops near Ibri, at their best at Al Ayn where a row of them lines up against Jabal Misht at sunset. Pairs naturally with Wadi Damm, twenty minutes away.",
      img: "assets/experiences/bat-necropolis.jpg",
      imgCredit: "Photo: Arian Zwegers · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/bat-necropolis-2.jpg", credit: "Photo: Esra1993 · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/bat-necropolis-3.jpg", credit: "Photo: Alfred Weidinger from Vienna, Austria · CC BY 2.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [23.2747, 56.7477],
      hours: 2, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography","hiking"],
      guide: "",
      hikeTime: "15–20 min up to the Al Ayn ridge",
      bring: {
        essential: ["Water", "Shoes for loose slopes"],
        optional: ["Long lens for the Jabal Misht backdrop"]
      },
      stats: {
        "Best for": "Sunset over 5,000 years of history, alone",
        "Time needed": "1.5–2 hrs",
        "Vehicle": "Any car to the base",
        "Entry": "Free",
        "Status": "UNESCO World Heritage",
        "Pair with": "Wadi Damm, 20 min away"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.2747,56.7477",
      verify: true
    },
    {
      id: "al-mudhaireb", cat: "experiences", free: false, type: "Village",
      name: "Al Mudhaireb",
      tagline: "The Sharqiyah oasis town everyone drives past on the way to the sands.",
      blurb: "Watchtowers on every hilltop, restored merchant houses, falaj channels and date gardens, ten minutes off the Wahiba road and a century away from it. The perfect leg-stretch between Muscat and the desert camps.",
      img: "assets/experiences/al-mudhaireb.jpg",
      imgCredit: "Photo: Bernhard Dunst · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/experiences/al-mudhaireb-2.jpg", credit: "Photo: Bernhard Dunst · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/experiences/al-mudhaireb-3.jpg", credit: "Photo: Bernhard Dunst · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "sharqiyah", coords: [22.616, 58.67499],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Water"],
        optional: ["Ask before photographing people, small town, big manners"]
      },
      stats: {
        "Best for": "A heritage stop en route to Wahiba",
        "Time needed": "1–1.5 hrs",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.616,58.67499",
      verify: true
    },
    {
      id: "sugar-dunes", cat: "experiences", free: false, type: "Camping",
      name: "The Sugar Dunes (Al Khaluf)",
      tagline: "Dunes so white they look like snow, falling straight into a turquoise sea.",
      blurb: "Four hours south of the tourist trail: white gypsum dunes meeting an empty turquoise coast, flamingos in the lagoons, nobody for kilometres. The camp in this guide that needs the most planning.",
      img: "",
      region: "sharqiyah", coords: [20.68, 58.05],
      hours: 4, fitness: 2, needs4x4: true, swim: true, kidOk: true,
      months: [10,11,12,1,2,3],
      overnight: true,
      tags: ["desert","camping","beach","photography","adrenaline"],
      guide: "recommended",
      bring: {
        essential: ["Proper 4×4 + sand-driving experience (deflate to ~15psi)", "Double water: 5L pp/day", "All fuel, last station is far behind you", "Recovery gear: boards, shovel, tow rope", "Tent, food, firewood, rubbish bags"],
        optional: ["Second vehicle (strongly advised)", "Drone permit if you fly, this is THE aerial shot"]
      },
      stats: {
        "Best for": "The bucket-list camp",
        "Time needed": "2 days minimum from Muscat",
        "Swim": "Yes, empty sea",
        "Vehicle": "4×4 essential, ideally two",
        "Best season": "Oct–Mar",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sugar+Dunes+Al+Khaluf+Oman",
      verify: true
    },

    /* ═══════════════════════════════════════════════════════════ MOUNTAINS
       (Jabal Shams, Jabal Akhdar, Misfat and Al Hoota moved here from
       Experiences when this tab was created, their ids are unchanged.)      */
    {
      id: "wakan-village", cat: "mountains", free: true, type: "Village",
      name: "Wakan Village",
      tagline: "700 steps up through the orchards, and the blossoms in spring.",
      blurb: "A tiny terraced village hanging 2,000m up the wall of Wadi Mistal, stone steps climbing through apricot and pomegranate gardens to a viewpoint over the whole valley. In late February the orchards blossom white and pink, and half of Oman drives up to see it.",
      img: "assets/mountains/wakan-village.jpg",
      imgCredit: "Photo: Raijelani · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/wakan-village-2.jpg", credit: "Photo: Raijelani · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/mountains/wakan-village-3.jpg", credit: "Photo: Raijelani · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "rustaq", coords: [23.14337, 57.73537],
      hours: 3, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["mountains","hiking","culture","photography"],
      guide: "",
      hikeTime: "~700 steps to the viewpoint, 45–60 min up at a polite pace",
      bring: {
        essential: ["Water", "Shoes with grip, the steps are stone and polished", "Modest clothing (people live here)"],
        optional: ["Camera, late Feb–Mar for the blossoms", "A jacket; it's noticeably cooler than the coast", "Cash for the village coffee shop"]
      },
      stats: {
        "Best for": "Village walk / blossom season",
        "Time needed": "Half day with the drive",
        "Hike": "~700 steps up, same back",
        "Vehicle": "4×4 strongly recommended, the final climb is steep switchbacks",
        "Best season": "Oct–Apr (blossoms late Feb–Mar)",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.14337,57.73537",
      insta: "https://www.instagram.com/hussain_explores/reel/DU0cYhZDCvB/",
      verify: true,
      gettingThere: [
        "Highway from Muscat toward Nakhal, 1.5 to 2 hrs in total.",
        "Turn into Wadi Mistal through the gap in the mountains.",
        "Up the switchbacks to the village car park. Steep and narrow, take the 4×4.",
        "Park there. The village itself is walking-only."
      ],
      whatYoullDo: [
        "Climb the stepped path, roughly 700 steps, through the terraced gardens.",
        "Look for the falaj channels, apricot, pomegranate and grape on the way up.",
        "Stop at the viewpoint platform at the top. The whole valley is under you.",
        "Come down slowly and let the village do its thing.",
        "Blossom season (late Feb–Mar): go early, on a weekday. It's Oman's worst-kept secret."
      ],
      tips: [
        "Late February to mid-March for the blossoms, confirm timing on Instagram before you drive, the window is short.",
        "Go early: the light is better, the steps are cooler and the car park is small.",
        "It's 10–15°C cooler than Muscat up here. Bring the layer."
      ]
    },
    {
      id: "balad-sayt", cat: "mountains", free: false, type: "Village",
      name: "Balad Sayt (Bilad Sayt)",
      tagline: "The postcard mountain village, earned the hard way.",
      blurb: "An amphitheatre of green terraces and mud-brick houses sealed off from the world by the Hajar, arguably the most photographed village in Oman, and still barely visited, because getting there means a proper 4×4 mountain road.",
      img: "assets/mountains/balad-sayt.jpg",
      imgCredit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/balad-sayt-2.jpg", credit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/mountains/balad-sayt-3.jpg", credit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons" }
      ], region: "rustaq", coords: [23.187, 57.387],
      hours: 2.5, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["mountains","culture","photography"],
      guide: "recommended",
      hikeTime: "30–60 min wandering the terraces and lanes",
      bring: {
        essential: ["4×4 and a confident driver, this is a real mountain road", "Water", "Modest clothing, it's a conservative village"],
        optional: ["Camera, the classic shot is from the track above the village", "Snacks; there are no shops", "A jacket in winter"]
      },
      stats: {
        "Best for": "Photography / old Oman",
        "Time needed": "2–3 hrs + the drive",
        "Hike": "Gentle wander",
        "Vehicle": "4×4 required (Wadi Bani Awf road)",
        "Best season": "Oct–Apr",
        "Entry": "Free, park outside, walk in"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.187,57.387",
      verify: true
    },
    {
      id: "sharaf-al-alamayn", cat: "mountains", free: false, type: "Viewpoint",
      name: "Sharaf Al Alamayn",
      tagline: "The rim of the Hajar, the best view you can drive to.",
      blurb: "The high pass on the mountain road between Al Hamra and Wadi Bani Awf, at around 2,000m. Park, walk to the edge, and the entire western Hajar falls away beneath you. Sunset up here is the show.",
      img: "assets/mountains/sharaf-al-alamayn.jpg",
      imgCredit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/sharaf-al-alamayn-2.jpg", credit: "Photo: Bruno Befreetv · CC BY-SA 3.0 · Wikimedia Commons" }
      ], region: "rustaq", coords: [23.205, 57.400],
      hours: 1, fitness: 1, needs4x4: true, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["mountains","photography","sunset"],
      guide: "",
      bring: {
        essential: ["A jacket, it is genuinely cold and windy on the rim", "Water"],
        optional: ["Tripod for sunset", "Binoculars", "A flask of karak, trust me"]
      },
      stats: {
        "Best for": "The view / sunset",
        "Time needed": "1 hr at the top",
        "Vehicle": "4×4 (steep graded mountain road both sides)",
        "Best time": "Late afternoon",
        "Altitude": "~2,000m",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sharfat+Al+Alamayn+Oman",
      verify: true
    },
    {
      id: "salma-plateau", cat: "mountains", free: false, type: "Cave",
      name: "Salma Plateau, 7th Hole & Tahery Cave",
      tagline: "A hole in the plateau you could drop a tower block into.",
      blurb: "High above the Tiwi coast, the Salma Plateau hides some of the deepest cave shafts on earth, the 7th Hole drops sheer from flat ground, and Tahery Cave opens into a chamber the size of a stadium. The drive up is half the adventure: a serious 4×4 track with the Gulf of Oman falling away behind you.",
      img: "assets/mountains/salma-plateau.jpg",
      imgCredit: "Photo: Alyahyai · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/salma-plateau-2.jpg", credit: "Photo: Jclaver · Public domain · Wikimedia Commons" },
        { src: "assets/mountains/salma-plateau-3.jpg", credit: "Photo: Linda Vignato · Public domain · Wikimedia Commons" }
      ],
      region: "coast-east", coords: [22.859, 59.116],
      hours: 6, fitness: 3, needs4x4: true, swim: false, kidOk: false,
      months: [10,11,12,1,2,3],
      tags: ["adrenaline","hiking","photography","camping"],
      guide: "required",
      hikeTime: "Short walks from the track; the shafts are unfenced",
      bring: {
        essential: ["Proper 4×4 with a second vehicle ideally", "3L water pp", "Head torch", "Warm layer, the plateau is high and cold at night"],
        optional: ["Camping kit, sunset up here is worth the night", "Rope access is experts-with-guides only"]
      },
      stats: {
        "Best for": "The wildest day trip from the east coast",
        "Time needed": "Full day (or camp)",
        "Vehicle": "4×4 essential, experienced drivers only",
        "Guide": "Required, unfenced shafts, unmarked tracks",
        "Best season": "Oct–Mar",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=7th+Hole+Salma+Plateau+Oman",
      verify: true
    },
    {
      id: "muscat-ridge-treks", cat: "mountains", free: true, type: "Hike",
      name: "The Mutrah ridge treks",
      tagline: "Real mountain trails that start where the city parking ends.",
      blurb: "Muscat is one of the few capitals where marked treks leave from the corniche: the C38 climbs from Riyam to the ridgeline above Mutrah harbour, and its sister paths (Sidab coastal, the Geotrek) thread the same bare hills. Two hours, city shoes optional, views you'd fly for.",
      img: "assets/mountains/muscat-ridge-treks.jpg",
      imgCredit: "Photo: Abubakr Saeed from Muscat, Oman, Sudan · CC BY 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/muscat-ridge-treks-2.jpg", credit: "Photo: Abubakr Saeed from Sudan · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/mountains/muscat-ridge-treks-3.jpg", credit: "Photo: Eduard Marmet · CC BY-SA 2.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.62908, 58.55861],
      hours: 3, fitness: 3, needs4x4: false, swim: false, kidOk: false,
      months: [10,11,12,1,2,3],
      tags: ["hiking","photography","sunset"],
      guide: "",
      hikeTime: "2–3 hrs for the classic Riyam → Mutrah line",
      bring: {
        essential: ["Real shoes, polished rock and loose stone", "1.5L water pp", "Sun cover"],
        optional: ["Head torch if you're chasing sunset", "Trekking poles"]
      },
      stats: {
        "Best for": "A mountain fix without leaving the city",
        "Time needed": "Half a morning",
        "Vehicle": "None needed, start at Riyam Park",
        "Difficulty": "Moderate, steep, exposed to sun",
        "Best season": "Oct–Mar, early",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.62908,58.55861",
      insta: ["https://www.instagram.com/hussain_explores/reel/DMLRTf1s0L0/",
              "https://www.instagram.com/hussain_explores/reel/DJ6K6kzsFvT/"], // Mutrah hike · Sidab trail 8/10
      verify: true,
      gettingThere: [
        "Park at Riyam Park on the Mutrah corniche.",
        "The C38 trailhead is signposted behind the park, yellow-red-yellow waymarks.",
        "Finish in Mutrah and walk the corniche back to the car."
      ],
      whatYoullDo: [
        "Climb out of the palms into bare rock ridges in about twenty minutes.",
        "Top out with the whole harbour, the forts and the ocean below you.",
        "Descend into the old town and reward yourself in the souq."
      ],
      tips: [
        "Start at first light, the rock throws heat by 9am even in winter.",
        "Waymarks fade in places: if you've lost paint for 5 minutes, backtrack.",
        "Never in summer afternoons. This trail has caught people out."
      ]
    },
    {
      id: "fanja", cat: "mountains", free: false, type: "Hike",
      name: "Fanja, the tabletop & old village",
      tagline: "The flat-topped mountain 30 minutes from Muscat that nobody climbs.",
      blurb: "Fanja's abandoned mud-brick village guards a mesa you can walk up, a short, sharp trek to a flat summit with date gardens and the wadi glittering below. Close enough for a post-work sunset mission from the capital.",
      img: "assets/mountains/fanja.jpg",
      imgCredit: "Photo: Bernhard Dunst · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/fanja-2.jpg", credit: "Photo: Bernhard Dunst · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/mountains/fanja-3.jpg", credit: "Photo: Bernhard Dunst · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "muscat", coords: [23.440, 58.174],
      hours: 3, fitness: 3, needs4x4: false, swim: false, kidOk: false,
      months: [10,11,12,1,2,3],
      tags: ["hiking","photography","sunset"],
      guide: "",
      hikeTime: "45–60 min up, steep in bursts",
      bring: {
        essential: ["Real shoes", "1.5L water pp", "Head torch for sunset descents"],
        optional: ["Ask locals for the current path through the old village"]
      },
      stats: {
        "Best for": "Sunset tabletop close to Muscat",
        "Time needed": "Half a day",
        "Vehicle": "Any car to the village",
        "Difficulty": "Moderate, steep, unmarked in parts",
        "Best season": "Oct–Mar",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Fanja+Oman",
      verify: true
    },
    {
      id: "jabal-shams-camp", cat: "mountains", free: false, type: "Camping",
      name: "Jabal Shams rim camp",
      tagline: "Sleep on the edge of Arabia's Grand Canyon.",
      blurb: "Camp free on the rim of Wadi Ghul at ~2,000m; 4×4 for the upper tracks. It can approach freezing up here while Muscat sits at 35°, so bring a real sleeping bag and firewood from Al Hamra, there's none to gather on top.",
      img: "assets/mountains/jabal-shams-camp.jpg",
      imgCredit: "Photo: Ralf Hüsges · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/jabal-shams-camp-2.jpg", credit: "Photo: Obersachse · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/mountains/jabal-shams-camp-3.jpg", credit: "Photo: Imbâbah22, myself · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [23.20, 57.22],
      hours: 3, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [3,4,5,6,7,8,9,10],
      overnight: true,
      tags: ["camping","hiking","photography","sunset"],
      guide: "",
      bring: {
        essential: ["Real sleeping bags, it can approach freezing up here even when Muscat is 35°", "Windproof tent + serious pegs", "Water and all food", "Warm layers, hat"],
        optional: ["Firewood from Al Hamra (nothing to gather at altitude)", "Tripod, this is star-photo country"]
      },
      stats: {
        "Best for": "Stars + the canyon at dawn",
        "Time needed": "Overnight",
        "Vehicle": "4×4 for the upper tracks",
        "Best season": "Mar–Oct (winter nights bite)",
        "Altitude": "~2,000m",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Jabal+Shams+viewpoint+Oman",
      verify: true
    },
    {
      id: "jabal-akhdar-camp", cat: "mountains", free: false, type: "Camping",
      name: "Jabal Akhdar plateau camp",
      tagline: "Juniper woods, cool air, and sunrise over the terraces.",
      blurb: "The Saiq plateau has quiet juniper clearings where you can camp in genuinely cool air all summer, Muscat bakes at 45° while you're in a sleeping bag at 20°. Wake to sunrise over the terraced villages with a flask of karak.",
      img: "assets/mountains/jabal-akhdar-camp.jpg",
      imgCredit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/mountains/jabal-akhdar-camp-2.jpg", credit: "Photo: Brian Harrington Spier from Shanghai, China · CC BY-SA 2.0 · Wikimedia Commons" }
      ],
      region: "dakhiliyah", coords: [23.07, 57.66],
      hours: 3, fitness: 1, needs4x4: true, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      overnight: true,
      tags: ["camping","photography","sunset","hiking"],
      guide: "",
      bring: {
        essential: ["4×4, the checkpoint at the bottom requires it by law", "Sleeping bags rated cool", "Water, food, rubbish bags"],
        optional: ["Firewood from Birkat Al Mouz", "A morning plan: rose terraces (Apr) or the village walk"]
      },
      stats: {
        "Best for": "Summer escape camping",
        "Time needed": "Overnight",
        "Vehicle": "4×4 required (police checkpoint enforces it)",
        "Best season": "Year-round, THE summer camp",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Jabal+Akhdar+Saiq+Oman",
      verify: true
    },

    /* ═════════════════════════════════════════════════════════════ SALALAH
       Dhofar is a flight, not a day trip, the planner knows (region "dhofar"
       is fly:true) and only routes these on a Salalah-based plan.            */
    {
      id: "wadi-darbat", cat: "salalah", free: true, group: "wadis", type: "Waterfall",
      name: "Wadi Darbat",
      tagline: "Waterfalls, green meadows and camels in the mist.",
      blurb: "In khareef season this valley turns into something that shouldn't exist in Arabia: waterfalls pouring off a travertine cliff, lakes, mist, and camels grazing on actual grass. The rest of the year it's a calm green valley with a lake and boat rides, still the first place I'd send anyone in Dhofar.",
      img: "assets/salalah/wadi-darbat.jpg",
      imgCredit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/wadi-darbat-2.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/wadi-darbat-3.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.10428, 54.45259],
      hours: 3, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [6,7,8,9,10],
      tags: ["photography","wildlife","hiking"],
      guide: "",
      bring: {
        essential: ["Water", "Shoes you don't mind getting muddy in khareef"],
        optional: ["A light rain layer Jul–Aug, the drizzle is constant", "Cash for boats, karak and grilled corn", "Zoom lens for the camels"]
      },
      stats: {
        "Best for": "Khareef scenery / families",
        "Time needed": "Half day",
        "Swim": "No, boats and walking",
        "Vehicle": "Any car",
        "Best season": "Khareef (late Jun–early Sep) + the green weeks after",
        "Entry": "Free (small parking fee in season)"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.10428,54.45259",
      verify: true,
      gettingThere: [
        "40 min east of Salalah, signposted off the Taqah road.",
        "Paved all the way to the valley floor, any car.",
        "In khareef the road in jams up. Be there before 9am."
      ],
      whatYoullDo: [
        "Walk the lakeside under the trees.",
        "Take a pedal boat out on the water.",
        "Photograph the travertine curtain, in full khareef flow the waterfall covers the whole cliff face.",
        "Drive up to the plateau viewpoint on the way out.",
        "Stop at the karak and corn stalls. They're everywhere in season, and they're the point."
      ],
      tips: [
        "Peak waterfall flow is late July–August. Just after khareef (Sep–Oct) everything is still green and the crowds are gone.",
        "Weekday mornings in khareef, always, Gulf tourism arrives in the afternoon.",
        "Don't swim in the lake. The camels have opinions and the bilharzia risk is real."
      ]
    },
    {
      id: "al-baleed", cat: "salalah", free: false, group: "experiences", type: "Museum",
      name: "Al Baleed & the Frankincense Museum",
      tagline: "The port that shipped frankincense to Rome, lit up at night.",
      blurb: "A UNESCO archaeological park on the Salalah waterfront: the ruins of the medieval trading port of Zafar, a lagoon full of birdlife, and the Museum of the Frankincense Land, which is the best hour of history in the south.",
      img: "assets/salalah/al-baleed.jpg",
      imgCredit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/al-baleed-2.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/al-baleed-3.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.002, 54.114],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Cash or card for entry", "Sun hat, the ruins are exposed"],
        optional: ["Go at dusk, the site is lit and the heat is gone", "Binoculars for the lagoon birds"]
      },
      stats: {
        "Best for": "History / an easy evening",
        "Time needed": "1.5–2 hrs",
        "Hours": "Open late, evening visits are the move",
        "Vehicle": "Any car / taxi",
        "Entry": "A few OMR per car, museum included",
        "UNESCO": "Land of Frankincense site"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.002,54.114",
      verify: true
    },
    {
      id: "khor-rori", cat: "salalah", free: true, group: "experiences", type: "Ruins",
      name: "Khor Rori & Sumhuram",
      tagline: "2,000-year-old ruins above a lagoon full of flamingos.",
      blurb: "The ancient port of Sumhuram, once the edge of the frankincense trade, now a hilltop ruin looking down on a blue lagoon where the wadi meets the sea. Flamingos in the water, camels on the beach, and almost nobody there on a weekday.",
      img: "assets/salalah/khor-rori.jpg",
      imgCredit: "Photo: Scott Edmunds · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/khor-rori-2.jpg", credit: "Photo: Richard N Horne · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/khor-rori-3.jpg", credit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.03991, 54.43393],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","wildlife","photography"],
      guide: "",
      bring: {
        essential: ["Water", "Sun hat"],
        optional: ["Zoom lens, flamingos keep their distance", "Pair it with Wadi Darbat; they're on the same road"]
      },
      stats: {
        "Best for": "History / the lagoon view",
        "Time needed": "1.5–2 hrs",
        "Vehicle": "Any car",
        "Best time": "Late afternoon light",
        "Entry": "A few OMR per car",
        "UNESCO": "Land of Frankincense site"
      },
      gettingThere: [
        "35–40 min east of Salalah, signposted off the Taqah–Mirbat road, just past the Wadi Darbat turnoff.",
        "Paved to the gate, then a short dusty track up to the hilltop car park.",
        "A few rials per car."
      ],
      whatYoullDo: [
        "Walk the 2,000-year-old walls of Sumhuram, above the lagoon, the frankincense port that traded with Rome and India.",
        "Then drive down to the lagoon mouth.",
        "Flamingos and herons on the water; camels on the sand bar where the khor meets the sea.",
        "Come late afternoon, the light turns the whole thing gold."
      ],
      tips: [
        "Combine Darbat + Khor Rori in one day, same road.",
        "The beach at the sand bar is one of the quietly great picnic spots in Dhofar.",
        "Weekdays: you'll have the ruins nearly alone."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.03991,54.43393",
      verify: true
    },
    {
      id: "jabal-samhan", cat: "salalah", free: false, group: "mountains", type: "Mountain",
      name: "Jabal Samhan viewpoint",
      tagline: "A kilometre of cliff, straight down to the coastal plain.",
      blurb: "The Dhofar mountains end in a sheer escarpment, and the Jabal Samhan viewpoint sits right on the lip of it, the coastal plain and the sea a vertical kilometre below. This is also Arabian leopard country; you won't see one, but it changes how the mountain feels.",
      img: "assets/salalah/jabal-samhan.jpg",
      imgCredit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/jabal-samhan-2.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/jabal-samhan-3.jpg", credit: "Photo: Francesco Bini · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.1116, 54.7109],
      hours: 2.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [9,10,11,12,1,2,3],
      tags: ["mountains","photography","wildlife","sunset"],
      guide: "",
      bring: {
        essential: ["Water", "A layer, it's windy on the rim"],
        optional: ["Sunrise is the classic run", "Full tank, fuel stops are sparse up here"]
      },
      stats: {
        "Best for": "The view",
        "Time needed": "2–3 hrs with the drive up",
        "Vehicle": "Any car (paved to the viewpoint)",
        "Best season": "Sep–Mar (khareef fog hides the view Jul–Aug)",
        "Altitude": "~1,800m",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.1116,54.7109",
      verify: true
    },
    {
      id: "fazayah-beach", cat: "salalah", free: false, group: "beaches", type: "Beach",
      name: "Fazayah Beach",
      tagline: "The empty white coves past the end of the road.",
      blurb: "Keep going west past Mughsail, over the mountain switchbacks, and drop down a steep track to a string of white-sand coves with cliffs behind and usually nobody on them but camels. The best beach in the south, and it makes you work for it.",
      img: "assets/salalah/fazayah-beach.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/fazayah-beach-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/fazayah-beach-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [16.848, 53.556],
      hours: 3, fitness: 1, needs4x4: true, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4],
      tags: ["beach","photography","swimming","sunset"],
      guide: "",
      swimTime: "Calm and swimmable outside khareef, the monsoon sea is dangerous",
      bring: {
        essential: ["4×4 for the descent track", "Everything you need, zero facilities", "Water and shade"],
        optional: ["Snorkel", "Firewood if you're staying for sunset", "A bag for your rubbish"]
      },
      stats: {
        "Best for": "Empty beach / the drive",
        "Time needed": "Half day from Salalah",
        "Swim": "Yes (not in khareef, rough sea)",
        "Vehicle": "4×4 for the track down",
        "Facilities": "None",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Fazayah+Beach+Salalah+Oman",
      verify: true
    },
    {
      id: "wadi-dawkah", cat: "salalah", free: false, group: "experiences", type: "Nature",
      name: "Wadi Dawkah frankincense park",
      tagline: "The trees that made Oman rich for 2,000 years.",
      blurb: "A protected valley of wild frankincense trees on the desert side of the mountains, the actual source of the trade that built the ports at Al Baleed and Sumhuram. Twenty minutes among the trees ties the whole frankincense story together.",
      img: "assets/salalah/wadi-dawkah.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/wadi-dawkah-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/wadi-dawkah-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.283, 54.050],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [10,11,12,1,2,3],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["Water, it's on the hot, dry side of the mountains"],
        optional: ["Combine it with the Thumrait road toward the Empty Quarter", "Macro shot: the resin beads on the bark"]
      },
      stats: {
        "Best for": "The frankincense story",
        "Time needed": "45 min–1 hr",
        "Vehicle": "Any car",
        "On the way to": "Thumrait / Empty Quarter day trips",
        "Entry": "Free",
        "UNESCO": "Land of Frankincense site"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Wadi+Dawkah+Frankincense+Park+Oman",
      verify: true
    },
    {
      id: "ayn-razat", cat: "salalah", free: true, group: "wadis", type: "Spring",
      name: "Ayn Razat",
      tagline: "Spring water, gardens and a cave, Salalah's easiest hour.",
      blurb: "A natural spring at the foot of the mountains feeding a strip of ornamental gardens, running water year-round, lush and loud with birds in khareef, and a small cave in the cliff above. The local picnic spot, and a gentle first stop after landing.",
      img: "assets/salalah/ayn-razat.jpg",
      imgCredit: "Photo: Moayed Bahajjaj · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/ayn-razat-2.jpg", credit: "Photo: jack_246 from Salalah, Sultanate of Oman · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/ayn-razat-3.jpg", credit: "Photo: Balou46 · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.12943, 54.23734],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["photography","wildlife"],
      guide: "",
      bring: {
        essential: ["Water"],
        optional: ["Picnic, that's the whole point", "Mosquito repellent in khareef"]
      },
      stats: {
        "Best for": "An easy stop / picnic",
        "Time needed": "1–1.5 hrs",
        "Swim": "No, the spring feeds the falaj",
        "Vehicle": "Any car",
        "Best time": "Morning",
        "Entry": "Free"
      },
      gettingThere: [
        "25 min northeast of Salalah. Paved, signposted, any car.",
        "Free parking by the gardens."
      ],
      whatYoullDo: [
        "The spring rises at the cliff base and feeds a falaj through ornamental gardens.",
        "This is where Salalah families picnic, go with it.",
        "Climb the steps to the small cave in the cliff for the view over the greenery.",
        "In khareef the hillside above runs green and the birdlife goes berserk."
      ],
      tips: [
        "Mornings are quiet; Friday afternoons are the full family scene, pick your vibe.",
        "Combine with Ayn Athum and the other springs along the mountain base in khareef.",
        "No swimming in the spring, it feeds the irrigation channels."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.12943,54.23734",
      verify: true
    },
    {
      id: "haffa-souq", cat: "salalah", free: true, group: "shopping", type: "Souq",
      name: "Al Haffa Souq",
      tagline: "Frankincense by the scoop, a street back from the sea.",
      blurb: "The old frankincense souq near the corniche, sacks of resin graded by colour, bakhoor, Dhofari incense burners, and the smell that tells you you're in Salalah and nowhere else. Come at dusk when the town wakes up.",
      img: "assets/salalah/haffa-souq.jpg",
      imgCredit: "Photo: see source · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/haffa-souq-2.jpg", credit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/haffa-souq-3.jpg", credit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.002, 54.093],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","sunset"],
      guide: "",
      bring: {
        essential: ["Cash, small notes"],
        optional: ["An empty corner of your suitcase", "Ask to smell before you buy, grades differ hugely"]
      },
      stats: {
        "Best for": "Frankincense / evening wander",
        "Time needed": "1–1.5 hrs",
        "Best time": "Dusk onwards",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.002,54.093",
      verify: true
    },
    {
      id: "salalah-gardens-mall", cat: "salalah", free: true, group: "shopping", type: "Mall",
      name: "Salalah Gardens Mall",
      tagline: "The AC hours, where Salalah goes at midday.",
      blurb: "The city's main mall: supermarket, food court, cafés and cinema. Not a sight, a tool. It's where you restock, cool down between the morning and the late afternoon, and where the kids forgive you for the long drive.",
      img: "assets/salalah/salalah-gardens-mall.jpg",
      imgCredit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/salalah-gardens-mall-2.jpg", credit: "Photo: MichalPL · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/salalah-gardens-mall-3.jpg", credit: "Photo: Jpbowen · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.048, 54.068],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"],
      guide: "",
      bring: {
        essential: [],
        optional: ["Cool bag if you're stocking a beach day"]
      },
      stats: {
        "Best for": "Midday break / supplies",
        "Time needed": "1–2 hrs",
        "Vehicle": "Any car, big car park",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.048,54.068",
      verify: true
    },
    {
      id: "dahariz-beach", cat: "salalah", free: true, group: "beaches", type: "Beach",
      name: "Dahariz Beach",
      tagline: "Salalah's own beach, coconut palms to the sand.",
      blurb: "The long city beach on the east side of town, backed by coconut plantations. Outside khareef it's calm, warm and swimmable ten minutes from your hotel; in khareef the sea turns wild and you walk it instead.",
      img: "assets/salalah/dahariz-beach.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/dahariz-beach-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/dahariz-beach-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.00908, 54.15084],
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4,5],
      tags: ["beach","swimming","sunset"],
      guide: "",
      swimTime: "Calm outside khareef, stay out of the monsoon sea (Jul–Sep)",
      bring: {
        essential: ["Water", "Sun cover, little natural shade"],
        optional: ["Fresh coconut from the plantation stalls on the way"]
      },
      stats: {
        "Best for": "Easy swim / sunset walk",
        "Time needed": "1–2 hrs",
        "Swim": "Yes (not in khareef)",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.00908,54.15084",
      verify: true
    },
    {
      id: "taqah-castle", cat: "salalah", free: false, group: "experiences", type: "Fort",
      name: "Taqah Castle",
      tagline: "A wali's house with the best small museum in the south.",
      blurb: "A restored 19th-century fortified residence in Taqah town, rooms set out as they were lived in, rifle slits over the bay, and a rooftop view along the coast. Twenty minutes from Khor Rori; do them together.",
      img: "assets/salalah/taqah-castle.jpg",
      imgCredit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/taqah-castle-2.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/taqah-castle-3.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.04171, 54.39986],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography"],
      guide: "",
      bring: {
        essential: ["A few rial for entry"],
        optional: ["Combine with Khor Rori and Wadi Darbat, same road east"]
      },
      stats: {
        "Best for": "Dhofari history in an hour",
        "Time needed": "45 min–1 hr",
        "Vehicle": "Any car",
        "Entry": "Small fee",
        "Closed": "Check Friday hours"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.04171,54.39986",
      verify: true
    },
    {
      id: "ayn-athum", cat: "salalah", free: false, group: "wadis", type: "Waterfall",
      name: "Ayn Athum",
      tagline: "The khareef waterfall the tour buses haven't found yet.",
      blurb: "A spring at the foot of the mountains that turns into a proper waterfall in the monsoon, mist, green cliffs, and far fewer people than Wadi Darbat. Outside khareef it's a quiet pool under the trees.",
      img: "assets/salalah/ayn-athum.jpg",
      imgCredit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/ayn-athum-2.jpg", credit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/ayn-athum-3.jpg", credit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.10706, 54.21507],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [6,7,8,9],
      tags: ["photography","wildlife"],
      guide: "",
      bring: {
        essential: ["Shoes with grip, wet rock everywhere in season"],
        optional: ["Mosquito repellent", "A rain layer in khareef"]
      },
      stats: {
        "Best for": "Khareef waterfalls without the crowd",
        "Time needed": "1–1.5 hrs",
        "Swim": "No",
        "Vehicle": "Any car",
        "Best season": "Khareef (late Jun–early Sep)",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.10706,54.21507",
      verify: true
    },

    /* ── Salalah additions (Jul 2026): every chip now has ≥5 spots ────────── */
    {
      id: "al-haffa-beach", cat: "salalah", free: true, group: "beaches", type: "Beach",
      name: "Al Haffa Beach",
      tagline: "The city beach, coconuts on one side, the Arabian Sea on the other.",
      blurb: "Salalah's own beach: a long palm-backed strip right next to the Haffa souq, with coconut stands on the road behind it. Not a hidden cove, it's where the city comes to walk at sunset, and that's the point.",
      img: "assets/salalah/al-haffa-beach.jpg",
      imgCredit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/al-haffa-beach-2.jpg", credit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/al-haffa-beach-3.jpg", credit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.001, 54.113],
      hours: 1.5, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4,5],
      tags: ["beach","sunset","food"],
      guide: "",
      swimTime: "Fine outside khareef, stay out of the monsoon sea (Jul–Sep)",
      bring: {
        essential: ["Small cash for the coconut stands"],
        optional: ["Towel, a swim here is casual, not a mission"]
      },
      stats: {
        "Best for": "Sunset walk + a fresh coconut",
        "Time needed": "1–2 hrs",
        "Swim": "Yes (not in khareef)",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.001,54.113",
      verify: true,
      gettingThere: [
        "It's in the middle of town, off Sultan Qaboos Street, beside the Haffa souq.",
        "Park along the beach road. Any car, no planning needed."
      ],
      whatYoullDo: [
        "Walk the sand, it runs for kilometres and never feels crowded.",
        "Buy a cold coconut from the stands on the road behind the beach.",
        "Stay for sunset, then wander into the Haffa souq, the frankincense smoke starts in the evening."
      ],
      tips: [
        "During khareef the sea is dangerous, walk, don't swim.",
        "Combine with the souq and the coconut stands: this corner of town is one easy evening."
      ]
    },
    {
      id: "taqah-beach", cat: "salalah", free: false, group: "beaches", type: "Beach",
      name: "Taqah Beach",
      tagline: "The quiet white-sand stretch the castle crowd drives straight past.",
      blurb: "Below Taqah town, twenty minutes east of Salalah: white sand, fishing boats, and hardly anyone on it even in season. You'll visit Taqah Castle and Khor Rori anyway, this is the swim in between.",
      img: "assets/salalah/taqah-beach.jpg",
      imgCredit: "Photo: patano · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/taqah-beach-2.jpg", credit: "Photo: Ujj.w · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/taqah-beach-3.jpg", credit: "Photo: Ujj.w · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.03781, 54.39558],
      hours: 2, fitness: 1, needs4x4: false, swim: true, kidOk: true,
      months: [10,11,12,1,2,3,4,5],
      tags: ["beach","swimming","photography"],
      guide: "",
      swimTime: "Calm outside khareef",
      bring: {
        essential: ["Water", "Sun cover, no shade on the sand"],
        optional: ["Snorkel gear for the rocky ends"]
      },
      stats: {
        "Best for": "An empty swim on the castle-and-ruins day",
        "Time needed": "1–2 hrs",
        "Swim": "Yes (not in khareef)",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.03781,54.39558",
      verify: true
    },
    {
      id: "ayn-garziz", cat: "salalah", free: false, group: "wadis", type: "Spring",
      name: "Ayn Garziz",
      tagline: "The spring under the cliff, ten minutes from town.",
      blurb: "A spring at the foot of the Ittin cliffs, close enough to the city for an evening visit. In khareef the whole cliff face drips green and the stream runs; the rest of the year it's a quiet picnic spot under the rock.",
      img: "assets/salalah/ayn-garziz.jpg",
      imgCredit: "Photo: Syed99975 · CC BY 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/ayn-garziz-2.jpg", credit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/ayn-garziz-3.jpg", credit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.07498, 54.06632],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [6,7,8,9,10],
      tags: ["photography","wildlife"],
      guide: "",
      bring: {
        essential: ["Shoes with grip, wet rock in season"],
        optional: ["Picnic, locals do", "Mosquito repellent in khareef"]
      },
      stats: {
        "Best for": "A khareef stop without leaving town",
        "Time needed": "1–1.5 hrs",
        "Swim": "No",
        "Vehicle": "Any car",
        "Best season": "Khareef (late Jun–early Sep)",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.07498,54.06632",
      verify: true
    },
    {
      id: "ayn-khor", cat: "salalah", free: false, group: "wadis", type: "Waterfall",
      name: "Ayn Khor",
      tagline: "The khareef waterfall at the end of the rough road, which is why it's empty.",
      blurb: "West of Salalah in the monsoon hills: a seasonal waterfall off a green cliff, mist through the trees, and a fraction of Darbat's traffic because the last stretch takes commitment. Khareef only, outside the monsoon it's dry.",
      img: "assets/salalah/ayn-khor.jpg",
      imgCredit: "Photo: Syed99975 · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/ayn-khor-2.jpg", credit: "Photo: Brian Harrington Spier from Shanghai, China · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/ayn-khor-3.jpg", credit: "Photo: Shobiha · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.141, 53.868],
      hours: 2.5, fitness: 2, needs4x4: true, swim: false, kidOk: true,
      months: [6,7,8,9],
      tags: ["photography","wildlife","hiking"],
      guide: "",
      bring: {
        essential: ["4×4 for the last stretch", "Shoes with grip"],
        optional: ["Rain layer, khareef drizzle is constant", "Snacks, nothing sold out here"]
      },
      stats: {
        "Best for": "Khareef scenery without the buses",
        "Time needed": "Half a morning with the drive",
        "Swim": "No",
        "Vehicle": "4×4 recommended",
        "Best season": "Khareef only",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Ayn+Khor+waterfall+Salalah+Oman",
      verify: true
    },
    {
      id: "jabal-ittin", cat: "salalah", free: true, group: "mountains", type: "Viewpoint",
      name: "Ateen Plateau & Prophet Ayoub's Tomb",
      tagline: "The city from above, and one of the oldest pilgrimage sites in the south.",
      blurb: "The plateau straight up behind Salalah. In khareef you drive into the fog line and the hills turn green around you; year-round, the tomb of Nabi Ayoub (Job) sits quietly at the top, and the viewpoints on the way down look over the whole city to the sea.",
      img: "assets/salalah/jabal-ittin.jpg",
      imgCredit: "Photo: StellarD · CC BY-SA 4.0 · Wikimedia Commons",
      region: "dhofar", coords: [17.10754, 54.05892],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","photography","sunset"],
      guide: "",
      bring: {
        essential: ["Modest dress for the tomb, shoulders and knees covered, shoes off inside"],
        optional: ["A layer, the plateau is cooler than the city"]
      },
      stats: {
        "Best for": "Views + a genuinely old holy site",
        "Time needed": "1.5–2 hrs",
        "Vehicle": "Any car, paved all the way",
        "Entry": "Free",
        "Note": "Active religious site, quiet and respect"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.10754,54.05892",
      verify: true,
      gettingThere: [
        "Take the Ittin road out of the city, the climb starts almost immediately.",
        "20–30 min of switchbacks to the plateau. Paved, any car.",
        "The tomb is signposted near the top; viewpoints line the road down."
      ],
      whatYoullDo: [
        "Stop at the viewpoints, the whole city, the plantations and the sea in one frame.",
        "Visit the small tomb complex, pilgrims have come here for centuries.",
        "In khareef: watch the fog roll over the road. It's the cheapest special effect in Oman."
      ],
      tips: [
        "Late afternoon light over the city is the shot.",
        "In khareef fog, drive slowly, visibility drops to metres up here.",
        "Gravity Point is on this same road, do both in one run."
      ]
    },
    {
      id: "gravity-point", cat: "salalah", free: true, group: "mountains", type: "Viewpoint",
      name: "Gravity Point (Anti-Gravity Road)",
      tagline: "Put the car in neutral. It rolls uphill. Argue about why on the drive back.",
      blurb: "A stretch of the Ittin road where a stopped car in neutral appears to roll up the slope. It's an optical illusion, the horizon lies to you, but nobody believes that until they've tried it. Twenty minutes of pure fun on the way to the plateau.",
      img: "",
      region: "dhofar", coords: [17.089, 54.048],
      hours: 0.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["photography","adrenaline"],
      guide: "",
      bring: {
        essential: [],
        optional: ["A phone mounted to film the dashboard, the video sells itself"]
      },
      stats: {
        "Best for": "A 20-minute detour everyone remembers",
        "Time needed": "20–30 min",
        "Vehicle": "Any car",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.089,54.048",
      verify: true,
      gettingThere: [
        "On the Ittin road out of Salalah, same road as the Ayoub tomb.",
        "Follow the maps pin; the spot is a straight, quiet stretch of road."
      ],
      whatYoullDo: [
        "Stop the car on the marked stretch, shift to neutral, foot off the brake.",
        "Watch it roll the 'wrong' way.",
        "Film it. Try to work out the illusion. Fail. Drive on to the plateau."
      ],
      tips: [
        "Check mirrors first and keep it brief, it's a public road, not a playground.",
        "Weekday mornings are quietest; khareef weekends bring queues of cars doing the same thing."
      ]
    },
    {
      id: "tawi-atair", cat: "salalah", free: false, group: "mountains", type: "Sinkhole",
      name: "Tawi Atair, the Well of Birds",
      tagline: "A hole in the plateau deep enough to swallow a skyscraper.",
      blurb: "One of the deepest sinkholes in the world, sunk into the green Taqah plateau, over 200m straight down, named for the birdsong that echoes off its walls. A short walk from the parking gets you to the rim viewpoints.",
      img: "assets/salalah/tawi-atair.jpg",
      imgCredit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/tawi-atair-2.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/tawi-atair-3.jpg", credit: "Photo: Krzysztof Ziarnek, Kenraiz · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.11411, 54.55783],
      hours: 1.5, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["photography","wildlife","hiking"],
      guide: "",
      hikeTime: "10–15 min from the parking to the rim",
      bring: {
        essential: ["Proper shoes, the rim path is uneven", "Water"],
        optional: ["Binoculars for the birds the place is named after"]
      },
      stats: {
        "Best for": "Scale you can't photograph properly",
        "Time needed": "1–1.5 hrs",
        "Depth": "~211m",
        "Vehicle": "Any car",
        "Best season": "Khareef for the green; clear views the rest of the year",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.11411,54.55783",
      verify: true
    },
    {
      id: "teeq-cave", cat: "salalah", free: false, group: "mountains", type: "Viewpoint",
      name: "Teeq Cave & the Darbat overlook",
      tagline: "The view down the valley the tour buses drive along the bottom of.",
      blurb: "Minutes from Tawi Atair: a cave mouth and a cliff-edge overlook down the length of Wadi Darbat, the waterfalls, the lake and the grazing camels, all from above. In khareef it's the best single view in Dhofar.",
      img: "",
      region: "dhofar", coords: [17.104, 54.530],
      hours: 1.5, fitness: 2, needs4x4: false, swim: false, kidOk: true,
      months: [6,7,8,9,10,11],
      tags: ["photography","hiking"],
      guide: "",
      hikeTime: "Short walks from the parking; unfenced edges",
      bring: {
        essential: ["Shoes with grip", "Water"],
        optional: ["A wide lens, the valley is the shot"]
      },
      stats: {
        "Best for": "Wadi Darbat from above",
        "Time needed": "1–1.5 hrs",
        "Vehicle": "Any car",
        "Best season": "Khareef and just after",
        "Entry": "Free",
        "Caution": "Unfenced drops, watch children"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Teeq+Cave+Salalah+Oman",
      verify: true
    },
    {
      id: "marneef-cave", cat: "salalah", free: true, group: "experiences", type: "Nature",
      name: "Marneef Cave & the Mughsail blowholes",
      tagline: "The sea fires through the rock at your feet.",
      blurb: "At the west end of Mughsail beach: a big rock shelter over a paved walkway, and blowholes in the cliff shelf that jet seawater metres into the air when the swell is up. In khareef they go off like geysers.",
      img: "assets/salalah/marneef-cave.jpg",
      imgCredit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/marneef-cave-2.jpg", credit: "Photo: see source · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/marneef-cave-3.jpg", credit: "Photo: User: (WT-shared) MarkFLLN at wts wikivoyage · Public domain · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [16.876, 53.760],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["photography","wildlife"],
      guide: "",
      bring: {
        essential: [],
        optional: ["Something waterproof for your phone, spray, not swimming"]
      },
      stats: {
        "Best for": "Blowholes + the cliffs west of Mughsail",
        "Time needed": "45 min–1 hr",
        "Vehicle": "Any car",
        "Best season": "Biggest jets in khareef swell",
        "Entry": "Free"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Marneef+Cave+Mughsail+Oman",
      verify: true,
      gettingThere: [
        "Drive to Mughsail beach, ~40 min west of Salalah.",
        "Follow the road to the west end, the cave and walkway are signposted.",
        "Park by the shelters. Flat paved path, fine for everyone."
      ],
      whatYoullDo: [
        "Walk the path under the Marneef rock shelter.",
        "Stand by the grated blowholes and wait for the swell, you'll hear it coming before it fires.",
        "Look west: the cliff road to Fizayah climbs straight out of the far end of the bay."
      ],
      tips: [
        "Khareef = the biggest jets, but you and your phone will get wet.",
        "Combine with Mughsail beach and (with a 4×4) Fizayah, one natural half-day west."
      ]
    },
    {
      id: "haffa-coconut-stands", cat: "salalah", sub: "Street food", free: true, group: "food", type: "Street food",
      name: "The Haffa coconut stands",
      tagline: "A machete, a straw, and the freshest thing you'll drink in Oman.",
      blurb: "The row of fruit stands along the plantation road behind Haffa beach: coconuts opened while you wait, tiny sweet Dhofari bananas, papaya and sugarcane straight from the plantations you're standing in. This is Salalah's whole southern-tropics act in one stop.",
      img: "assets/salalah/haffa-coconut-stands.jpg",
      imgCredit: "Photo: PattayaPatrol · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/haffa-coconut-stands-2.jpg", credit: "Photo: PattayaPatrol · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/haffa-coconut-stands-3.jpg", credit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.00135, 54.1028],
      hours: 0.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"],
      guide: "",
      stats: {
        "Type": "Fruit stands",
        "Area": "Al Haffa / plantation road",
        "Price": "$, coconuts well under a rial",
        "Best for": "A stop between the beach and the souq",
        "Book?": "Just pull over"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.00135,54.1028",
      verify: true,
      whatYoullDo: [
        "Pick a stand, busy ones turn their stock over fastest.",
        "Coconut first: drink it, then hand it back and they'll split it so you can eat the flesh.",
        "Take a bunch of the small local bananas for the car. They're better than they have any right to be."
      ],
      tips: [
        "Cash, small notes.",
        "The stands run for a couple of kilometres, the quieter ones further from the beach are often cheaper."
      ]
    },
    {
      id: "food-fish-grills-dahariz", cat: "salalah", sub: "Seafood", free: false, group: "food", type: "Seafood",
      name: "Fresh fish, straight off the boats",
      tagline: "Pick your fish at the harbour. Eat it grilled twenty minutes later.",
      blurb: "The fishermen land the catch, the grill houses near the harbour cook it, kingfish, tuna and whatever came in that morning, priced by the kilo and served with rice. The locked page names the place I actually use and what to order.",
      img: "assets/salalah/food-fish-grills-dahariz.jpg",
      imgCredit: "Photo: Bahnfrend · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/food-fish-grills-dahariz-2.jpg", credit: "Photo: Penwills · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/food-fish-grills-dahariz-3.jpg", credit: "Photo: pompi · CC0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.000, 54.135],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"],
      guide: "",
      stats: {
        "Type": "Seafood, grilled by the kilo",
        "Area": "Near the fisheries harbour",
        "Price": "$$",
        "Best for": "Lunch after a beach morning",
        "Book?": "Walk-in"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=fish+restaurant+Salalah",
      verify: true
    },
    {
      id: "food-shawarma-salalah", cat: "salalah", sub: "Late night", free: false, group: "food", type: "Dinner",
      name: "The late-night shawarma run",
      tagline: "Where Salalah actually eats after ten.",
      blurb: "Every Omani city has one street the shawarma queues point to, and Salalah is no exception. The locked page has my spot, what to order, and why you want it after an evening in the souq.",
      img: "assets/salalah/food-shawarma-salalah.jpg",
      imgCredit: "Photo: جنان مريش · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/food-shawarma-salalah-2.jpg", credit: "Photo: Andy Li · CC0 · Wikimedia Commons" },
        { src: "assets/salalah/food-shawarma-salalah-3.jpg", credit: "Photo: Vyacheslav Argenberg · CC BY 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.019, 54.090],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"],
      guide: "",
      stats: {
        "Type": "Shawarma / grills",
        "Area": "Central Salalah",
        "Price": "$",
        "Best for": "Late dinner, zero ceremony",
        "Book?": "Never"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=shawarma+Salalah",
      verify: true
    },
    {
      id: "food-dhofari-halwa", cat: "salalah", sub: "Sweets", free: false, group: "food", type: "Sweets",
      name: "Halwa from the south",
      tagline: "Dhofar's version of Oman's national sweet, and where to buy it warm.",
      blurb: "Omani halwa is the thing you take home; Dhofaris will tell you theirs is the best in the country. The locked page has the shop I buy from, what a fair price looks like, and how to get it through your flight home intact.",
      img: "",
      region: "dhofar", coords: [17.010, 54.098],
      hours: 0.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"],
      guide: "",
      stats: {
        "Type": "Traditional sweets",
        "Area": "Central Salalah",
        "Price": "$",
        "Best for": "Gifts that survive the suitcase",
        "Book?": "Walk-in"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Omani+halwa+Salalah",
      verify: true
    },
    {
      id: "salalah-grand-mall", cat: "salalah", sub: "Mall", free: true, group: "shopping", type: "Mall",
      name: "Salalah Grand Mall",
      tagline: "The rainy-day option, khareef drizzle included free.",
      blurb: "The other big mall in town: hypermarket, food court, cinema, the usual brands. Nobody flies to Dhofar for a mall, but in a khareef downpour or a June afternoon you'll be glad it exists.",
      img: "assets/salalah/salalah-grand-mall.jpg",
      imgCredit: "Photo: Roy Egloff · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/salalah-grand-mall-2.jpg", credit: "Photo: W.carter · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/salalah/salalah-grand-mall-3.jpg", credit: "Photo: MBH · CC BY 4.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.024, 54.083],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"],
      guide: "",
      stats: {
        "Type": "Mall",
        "Best for": "Khareef rain, supplies, a cool hour",
        "Price": "$–$$",
        "Vehicle": "Any car, big parking",
        "Book?": "No"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.024,54.083",
      verify: true
    },
    {
      id: "shop-frankincense-guide", cat: "salalah", sub: "Speciality", free: false, group: "shopping", type: "Shop",
      name: "Buying frankincense, without getting tourist-priced",
      tagline: "Hojari, Najdi, Shaabi, know the difference before you open your wallet.",
      blurb: "Frankincense is THE thing to bring home from Dhofar, and the quality range is enormous, so is the price range for the same resin. The locked page covers the grades, what each should cost, how to check what you're being sold, and the stalls I actually buy from in the Haffa souq.",
      img: "assets/salalah/shop-frankincense-guide.jpg",
      imgCredit: "Photo: 'dronepicr' · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/shop-frankincense-guide-2.jpg", credit: "Photo: No machine-readable author provided. Gaius Cornelius assumed (based on copyright · Public domain · Wikimedia Commons" },
        { src: "assets/salalah/shop-frankincense-guide-3.jpg", credit: "Photo: derivative work of User:Gaius Cornelius Frankincense.JPG' · Public domain · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.002, 54.109],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["culture","food"],
      guide: "",
      stats: {
        "Type": "Buying guide, Haffa souq",
        "Price": "Grades from a few rials to serious money",
        "Best for": "The one souvenir worth doing properly",
        "Book?": "No"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.002,54.109",
      verify: true
    },
    {
      id: "salalah-central-market", cat: "salalah", sub: "Market", free: true, group: "shopping", type: "Market",
      name: "The fruit & vegetable market",
      tagline: "Dhofari bananas, coconuts and papaya, where the plantations sell wholesale.",
      blurb: "Salalah's central produce market: stalls piled with the plantation crops the south is famous for. Louder, cheaper and more local than the roadside stands, come in the morning when everything is fresh off the trucks.",
      img: "assets/salalah/salalah-central-market.jpg",
      imgCredit: "Photo: Hans Birger Nilsen · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/salalah/salalah-central-market-2.jpg", credit: "Photo: Hans Birger Nilsen · CC BY-SA 2.0 · Wikimedia Commons" },
        { src: "assets/salalah/salalah-central-market-3.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" }
      ],
      region: "dhofar", coords: [17.016, 54.093],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"],
      guide: "",
      stats: {
        "Type": "Produce market",
        "Best for": "Morning browse + fruit for the whole trip",
        "Price": "$",
        "Book?": "No"
      },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.016,54.093",
      verify: true,
      whatYoullDo: [
        "Walk the fruit rows first, bananas, coconuts, papaya, and in season the famous local mangoes.",
        "Buy for the car: fruit here costs a fraction of hotel prices.",
        "Watch the haggling even if you don't join in, it's half the show."
      ],
      tips: [
        "Mornings only for the good stuff.",
        "Small notes, and bring your own bag if you have one."
      ]
    },

    /* ════════════════════════════════════════════════════════════════ FOOD
       Researched, well-known spots, SWAP THESE FOR THE ONES YOU ACTUALLY EAT
       AT. Your real picks are worth more than any list off the internet.      */
    {
      id: "cafe-batch", cat: "food", sub: "Coffee", free: true, type: "Coffee",
      name: "Batch",
      tagline: "Al Khoud's cute one. Staff carry the place.",
      blurb: "Aesthetic little specialty café in Al Khoud with some of the friendliest staff in Muscat and bakes worth the drive, the maritozzo has fans.",
      img: "assets/food/cafe-batch.jpg",
      region: "muscat", coords: [23.6207, 58.2122], // Batch — pin confirmed by Hussain
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty café", "Area": "Al Khoud", "Price": "$$", "Best for": "Coffee + bakes", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Batch+Cafe+Al+Khoud+Muscat",
      insta: "https://www.instagram.com/hussain_explores/reel/DWJnFtSDHfg/",
      verify: true
    },
    {
      id: "food-rozna", cat: "food", sub: "Traditional", free: true, type: "Omani food",
      name: "Rozna",
      tagline: "Dinner inside a fort. The design does half the hosting.",
      blurb: "Traditional Omani food served in a building styled like a fort, majlis seating, carved doors, the works. The most designed restaurant in Muscat, and the food holds its end up.",
      img: "assets/food/food-rozna.jpg",
      region: "muscat", coords: [23.5888, 58.3221], // Rozna Restaurant — pin confirmed by Hussain
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Traditional Omani", "Area": "Ghala, Muscat", "Price": "$$$", "Best for": "The occasion dinner", "Book?": "Book on weekends" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Rozna+Restaurant+Muscat",
      insta: "https://www.instagram.com/hussain_explores/reel/DXmYNsDDBqN/", // "nicest restaurant design in Oman" — 3.6K likes
      verify: true
    },
    {
      id: "cafe-la-miel", cat: "food", sub: "Coffee", free: true, type: "Coffee",
      name: "La Miel Specialty Coffee",
      tagline: "The pre-wadi flat white.",
      blurb: "Al Ghubrah. Properly sourced beans, properly pulled shots, and a room that doesn't feel like a hotel lobby. This is where I start a driving day.",
      img: "assets/food/cafe-la-miel.jpg",
      imgCredit: "Photo: Irvan Ary Maulana · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/cafe-la-miel-2.jpg", credit: "Photo: Kgbo · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/food/cafe-la-miel-3.jpg", credit: "Photo: Kim Sanso · CC0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.588, 58.408],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty coffee", "Area": "Al Ghubrah", "Price": "$", "Best for": "Morning / before a drive", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.588,58.408",
      verify: true,
      whatYoullDo: [
        "Coffee and a pastry.",
        "Get on the road before the traffic builds.",
        "Twenty minutes, not an hour."
      ],
      tips: ["Be out the door by 9am on a wadi day, you want to be past Quriyat by 10."]
    },
    {
      id: "food-bait-al-luban", cat: "food", sub: "Traditional", free: true, type: "Omani food",
      name: "Bait Al Luban",
      tagline: "Shuwa, with a view of the harbour.",
      blurb: "In a restored khan across from the Mutrah fish market. Traditional Omani done properly, shuwa (meat buried and slow-cooked for a day), mashuai, harees, and portions two people can share.",
      img: "assets/food/food-bait-al-luban.jpg",
      imgCredit: "Photo: Erkan Pinar · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/food-bait-al-luban-2.jpg", credit: "Photo: Vyacheslav Argenberg · CC BY 4.0 · Wikimedia Commons" },
        { src: "assets/food/food-bait-al-luban-3.jpg", credit: "Photo: Andy Mitchell from Glasgow, UK · CC BY-SA 2.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.617, 58.564],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Traditional Omani", "Must-order": "Shuwa", "Area": "Mutrah", "Price": "$$", "Best for": "Dinner with a view", "Book?": "Worth booking at sunset" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.617,58.564",
      verify: true,
      whatYoullDo: [
        "Order the shuwa.",
        "Ask for a table upstairs by the window.",
        "Go at dusk, the harbour does half the work."
      ],
      tips: ["Portions are big. Two mains between three people is usually enough."]
    },
    {
      id: "cafe-qaha", cat: "food", sub: "Coffee", free: true, type: "Coffee",
      name: "Qaha Specialty Coffee",
      tagline: "Omani coffee culture, modernised.",
      blurb: "Specialty coffee on Al Maha St. Walk-in, cheap, and quiet enough to sit for an hour before an early drive.",
      img: "assets/food/cafe-qaha.jpg",
      imgCredit: "Photo: Justwiki · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/cafe-qaha-2.jpg", credit: "Photo: Justwiki · CC0 · Wikimedia Commons" },
        { src: "assets/food/cafe-qaha-3.jpg", credit: "Photo: Justwiki · CC0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.56816, 58.41489],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty coffee", "Area": "Al Maha St", "Price": "$", "Best for": "A slow morning", "Book?": "Walk-in" },
      whatYoullDo: [
        "Omani coffee culture with a modern room around it.",
        "White, blue, calm, unhurried. Nobody is rushing you out."
      ],
      tips: [
        "The quiet one of the specialty cafés, good before an early drive."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.56816,58.41489",
      verify: true
    },
    {
      id: "cafe-azura", cat: "food", sub: "Coffee", free: false, type: "Coffee",
      name: "Azura, The Coffee Company",
      tagline: "The roastery. For people who care about the bean.",
      blurb: "Specialty café and roastery, and the one the coffee people in Muscat send you to. Take beans home.",
      img: "assets/food/cafe-azura.jpg",
      imgCredit: "Photo: Ioacc1234red · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/cafe-azura-2.jpg", credit: "Photo: Ioacc1234red · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/food/cafe-azura-3.jpg", credit: "Photo: Ioacc1234red · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.588, 58.408],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Specialty coffee / roastery", "Area": "Muscat", "Price": "$$", "Best for": "Buying beans", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.588,58.408",
      verify: true
    },
    {
      id: "cafe-farah", cat: "food", sub: "Coffee", free: false, type: "Coffee",
      name: "Café Farah",
      tagline: "Coffee on the sand at Azaiba.",
      blurb: "Right on Azaiba Beach. Come for the view as much as the cup, this is the sunset coffee, not the 7am one.",
      img: "assets/food/cafe-farah.jpg",
      imgCredit: "Photo: Andy Li · CC0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/cafe-farah-2.jpg", credit: "Photo: Andy Li · CC0 · Wikimedia Commons" },
        { src: "assets/food/cafe-farah-3.jpg", credit: "Photo: Goldberry23 · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.60493, 58.35346],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","sunset"], guide: "",
      stats: { "Type": "Beachfront café", "Area": "Azaiba Beach", "Price": "$$", "Best for": "Sunset", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.60493,58.35346",
      verify: true
    },
    {
      id: "food-kargeen", cat: "food", sub: "Dinner", free: false, type: "Dinner",
      name: "Kargeen",
      tagline: "Lantern-lit courtyards and grilled kingfish.",
      blurb: "The one everyone ends up at, and deservedly. Eat outside under the lanterns; order the mashuai (grilled kingfish with rice) and the Omani bread with dips.",
      img: "assets/food/food-kargeen.jpg",
      imgCredit: "Photo: Dingli35 · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/food-kargeen-2.jpg", credit: "Photo: Majalam · CC BY 4.0 · Wikimedia Commons" },
        { src: "assets/food/food-kargeen-3.jpg", credit: "Photo: Majalam · CC BY 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.60055, 58.455],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Omani / grill", "Must-order": "Mashuai (grilled kingfish)", "Area": "Madinat Qaboos", "Price": "$$", "Best for": "A long dinner outside", "Book?": "Yes, at weekends" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.60055,58.455",
      verify: true
    },
    {
      id: "food-najmat-sur", cat: "food", sub: "Traditional", free: true, type: "Omani food",
      name: "Najmat Sur",
      tagline: "The 2-rial lunch of the Wadi Shab day.",
      blurb: "Roadside Omani grill on the coast road just north of Wadi Shab, on the way to Bimmah. Local lunch about 1.8, tea 0.3, no menu theatre, full plates. Where I actually eat after the canyon.",
      region: "coast-east", coords: [22.86881, 59.22594],
      hours: 0.75, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food"], guide: "",
      stats: { "Type": "Omani grill", "Area": "Coast road, Shab → Bimmah", "Price": "$", "Best for": "Lunch after the wadi", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.86881,59.22594",
      verify: true
    },
    {
      id: "food-bin-ateeq-salalah", cat: "salalah", sub: "Traditional", free: true, group: "food", type: "Omani food",
      name: "Bin Ateeq (Salalah)",
      tagline: "The Salalah branch of the floor-cushion classic.",
      blurb: "Same formula as the Muscat original: private majlis rooms, cushions on the floor, big plates of Omani rice and meat. The reliable lunch between a morning in the mountains and an afternoon on the coast.",
      img: "assets/food/food-bin-ateeq-salalah.jpg",
      imgCredit: "Photo: Vengolis · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/food-bin-ateeq-salalah-2.jpg", credit: "Photo: Dr. Bernd Gross · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/food/food-bin-ateeq-salalah-3.jpg", credit: "Photo: Dr. Bernd Gross · CC BY-SA 3.0 · Wikimedia Commons" }
      ], region: "dhofar", coords: [17.019, 54.081],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Omani traditional", "Area": "Central Salalah", "Price": "$", "Best for": "Lunch, Omani-style", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=17.019,54.081",
      verify: true
    },
    {
      id: "food-bin-ateeq", cat: "food", sub: "Traditional", free: false, type: "Omani food",
      name: "Bin Ateeq",
      tagline: "Eat on the floor, like you're meant to.",
      blurb: "Family-run, private curtained rooms, cushions on the floor. Unfussy, unbranded, and about as close as a restaurant gets to eating in an Omani home.",
      img: "assets/food/food-bin-ateeq.jpg",
      imgCredit: "Photo: Sammy Six · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/food-bin-ateeq-2.jpg", credit: "Photo: Vengolis · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/food/food-bin-ateeq-3.jpg", credit: "Photo: منال شحادة · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.588, 58.408],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Traditional Omani", "Must-order": "Maqbous / harees", "Area": "Al Khuwair", "Price": "$", "Best for": "Lunch", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.588,58.408",
      verify: true
    },
    {
      id: "food-halwa", cat: "food", sub: "Sweets", free: false, type: "Sweets",
      name: "Omani halwa, Mutrah Souq",
      tagline: "Watch them stir it in the copper pot.",
      blurb: "Rosewater, saffron, cardamom, nuts, and an arm-aching amount of stirring. Buy it where they make it, not where they box it.",
      img: "assets/food/food-halwa.jpg",
      imgCredit: "Photo: Silpa11 · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/food/food-halwa-2.jpg", credit: "Photo: Slywire · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.617, 58.594],
      hours: 0.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["food","culture"], guide: "",
      stats: { "Type": "Sweets / halwa", "Must-order": "Omani halwa (black or saffron)", "Area": "Mutrah Souq", "Price": "$", "Best for": "Gifts", "Book?": "Walk-in" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.617,58.594",
      verify: true
    },

    /* ══════════════════════════════════════════════════════════ SHOPPING */
    {
      id: "shop-mutrah-souq", cat: "shopping", sub: "Traditional souq", free: true, type: "Souq",
      name: "Mutrah Souq",
      tagline: "The oldest souq in Oman, go at dusk.",
      blurb: "Frankincense, silver khanjars, pashminas and a maze of covered alleys that's been trading for two centuries. Touristy at the front, real the deeper you go.",
      img: "assets/shopping/shop-mutrah-souq.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-mutrah-souq-2.jpg", credit: "Photo: Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-mutrah-souq-3.jpg", credit: "Photo: Martin Dougiamas · CC BY 2.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.617, 58.592],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","photography"], guide: "",
      stats: { "Type": "Traditional souq", "Best time": "5–9pm", "Haggling": "Expected, start around half", "Cards": "Bigger shops yes; carry cash", "Best buys": "Frankincense + burner, silver, halwa" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.617,58.592",
      verify: true
    },
    {
      id: "shop-seeb-souq", cat: "shopping", sub: "Traditional souq", free: true, type: "Souq",
      name: "Seeb Souq",
      tagline: "Where Muscat actually shops, fish, dates and zero tourists.",
      blurb: "A working local souq on the Seeb waterfront: the morning fish auction, dates by the kilo, abayas and kummas. Nothing here is staged for visitors, that's the point.",
      img: "assets/shopping/shop-seeb-souq.jpg",
      imgCredit: "Photo: 'dronepicr' · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-seeb-souq-2.jpg", credit: "Photo: JK Werner from London, England · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-seeb-souq-3.jpg", credit: "Photo: JK Werner from London, England · CC BY 2.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.670, 58.189],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","food","photography"], guide: "",
      stats: { "Type": "Local souq", "Best time": "Early morning (fish) or after 5pm", "Haggling": "Gentle", "Cards": "Cash mostly", "Best buys": "Dates, fish, kummas" },
      gettingThere: [
        "On the Seeb corniche, 25 min from central Muscat.",
        "Park along the waterfront.",
        "The souq runs back from the fish market."
      ],
      whatYoullDo: [
        "Start at the fish market early, the auction is loud, fast and completely real.",
        "Then the covered lanes: dates by the kilo at half the tourist-shop price.",
        "Kummas, abayas, household stalls.",
        "This is shopping the way Muscat actually does it."
      ],
      tips: [
        "Early morning, or you miss the fish auction entirely.",
        "Buy dates here rather than in the tourist souqs, same dates, half the price."
      ],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Seeb+Souq",
      verify: true
    },
    {
      id: "shop-nizwa-souq", cat: "shopping", sub: "Traditional souq", free: false, type: "Souq",
      name: "Nizwa Souq",
      tagline: "Pottery, silver and the Friday goat market.",
      blurb: "The interior's great souq under the fort: dates, pottery, copper and the famous Friday-morning livestock auction, get there by 7am or you've missed the show.",
      img: "assets/shopping/shop-nizwa-souq.jpg",
      imgCredit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-nizwa-souq-2.jpg", credit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-nizwa-souq-3.jpg", credit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "dakhiliyah", coords: [22.932, 57.531],
      hours: 2, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture","photography"], guide: "",
      stats: { "Type": "Traditional souq", "Best time": "Friday 6:30–9am for the goat market", "Haggling": "Expected", "Cards": "Carry cash", "Best buys": "Pottery, silver, Nizwa dates" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=22.932,57.531",
      verify: true
    },
    {
      id: "shop-al-sharaa", cat: "shopping", sub: "Speciality", free: false, type: "Shop",
      name: "Al Sharaa Mills & Dates",
      tagline: "The shop I send everyone to before they fly home.",
      blurb: "A family mills-and-dates company going since 1972: dates by the kilo, sesame tahini, date molasses, Omani coffee, spices, honey and stone-ground flours, farm-to-shop, at local prices instead of airport prices. The Al Rusail (Seeb) branch is the convenient one before a flight; there's a branch in Bahla for the Nizwa run, plus their own web shop and Talabat delivery.",
      img: "", region: "muscat", coords: [23.545, 58.135],
      hours: 1, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","food"], guide: "",
      stats: { "Type": "Dates, mills & pantry goods", "Since": "1972", "Branches": "Al Rusail (Seeb) · Bahla · online", "Best buys": "Dates by the kilo, date molasses, Omani coffee & spices" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Sharaa+Mills+and+Dates+Rusail",
      insta: "https://www.instagram.com/hussain_explores/reel/Daedw8lMakd/",
      verify: true
    },
    {
      id: "shop-amouage", cat: "shopping", sub: "Speciality", free: false, type: "Shop",
      name: "Amouage Visitor Centre",
      tagline: "Oman's world-famous perfume house, at the source.",
      blurb: "One of the most valuable perfume brands on earth is Omani. The factory visitor centre sells the full range, with tester bars and a tour of the production floor.",
      img: "assets/shopping/shop-amouage.jpg",
      imgCredit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-amouage-2.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-amouage-3.jpg", credit: "Photo: Ji-Elle · CC BY-SA 3.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.541, 58.183],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping","culture"], guide: "",
      stats: { "Type": "Perfume house / factory", "Time needed": "1–1.5 hrs", "Cards": "Yes", "Best buys": "Their classics, test before you choose" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.541,58.183",
      verify: true
    },
    {
      id: "shop-mall-of-oman", cat: "shopping", sub: "Mall", free: true, type: "Mall",
      name: "Mall of Oman",
      tagline: "The big one, with an indoor snow park.",
      blurb: "The country's largest mall: every brand you'd expect, a huge food court, cinema and Snow Oman for when the kids (or you) need a break from 45°C. This is where midday hides in summer.",
      img: "assets/shopping/shop-mall-of-oman.jpg",
      imgCredit: "Photo: Mariacaminod · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-mall-of-oman-2.jpg", credit: "Photo: 'dronepicr' · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-mall-of-oman-3.jpg", credit: "Photo: 'dronepicr' · CC BY 2.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.565, 58.238],
      hours: 2.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Mall", "Highlights": "Snow Oman, cinema, food court", "Cards": "Everywhere", "Best time": "Midday, it's air-conditioned escape" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.565,58.238",
      verify: true
    },
    {
      id: "shop-avenues-mall", cat: "shopping", sub: "Mall", free: true, type: "Mall",
      name: "Oman Avenues Mall",
      tagline: "Central, calm and easy.",
      blurb: "Big, central and rarely overwhelming, Carrefour for road-trip supplies, plus the usual brands and cafés. The practical stop, not the destination.",
      img: "assets/shopping/shop-avenues-mall.jpg",
      imgCredit: "Photo: Taha Al-Hayali · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-avenues-mall-2.jpg", credit: "Photo: Andrey Filippov 安德烈 from Moscow, Russia · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-avenues-mall-3.jpg", credit: "Photo: Andrey Filippov 安德烈 from Moscow, Russia · CC BY 2.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.590, 58.427],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Mall", "Highlights": "Carrefour, central location", "Cards": "Everywhere", "Best for": "Stocking up before a road trip" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Oman+Avenues+Mall",
      verify: true
    },
    {
      id: "shop-city-centre", cat: "shopping", sub: "Mall", free: true, type: "Mall",
      name: "City Centre Muscat",
      tagline: "Closest big mall to the airport.",
      blurb: "The reliable all-rounder near Seeb and the airport, good for a last-day sweep: dates, chocolates, and anything you forgot to buy properly.",
      img: "assets/shopping/shop-city-centre.jpg",
      imgCredit: "Photo: Mostafameraji · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/shopping/shop-city-centre-2.jpg", credit: "Photo: Mostafameraji · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/shopping/shop-city-centre-3.jpg", credit: "Photo: Mostafameraji · CC BY-SA 4.0 · Wikimedia Commons" }
      ], region: "muscat", coords: [23.607, 58.256],
      hours: 1.5, fitness: 1, needs4x4: false, swim: false, kidOk: true,
      months: [1,2,3,4,5,6,7,8,9,10,11,12],
      tags: ["shopping"], guide: "",
      stats: { "Type": "Mall", "Highlights": "Near the airport", "Cards": "Everywhere", "Best for": "Last-day souvenir sweep" },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=23.607,58.256",
      verify: true
    }
  ],

  /* ══════════════════════════════════════════════════════════ ITINERARIES
     Two formats live here.
       route/receipt  = the hour-by-hour plans with a costs receipt, rendered
                        as a timeline (the "banger" format, Jul 2026).
       days           = the older prose format, still used by the premium
                        routes whose day text lives in premium.js.
     route day: { name, sub, chip, cost, stops: [{t, icon, title, note, omr,
     spot, hl}], sleep }. receipt: { rows: [[label, amount]], splits:
     [[label, amount]], note }. Amounts are strings on purpose: "~" marks an
     estimate, bare numbers are posted prices. */
  itineraries: [
    {
      id: "shab-1day", cat: "itineraries", free: true,
      name: "The Perfect Wadi Shab Day",
      tagline: "The famous swim, timed to the hour and costed to the rial.",
      blurb: "The exact day from my reel: out of Muscat early, the boat, the canyon, the cave, then the Tiwi coast to wind down. Every rial it costs is on the receipt at the bottom.",
      img: "assets/itineraries/shab-1day.jpg",
      stats: { "Best for": "Day-trippers from Muscat", "Base": "Muscat, back by dinner", "Car": "Any car", "Days": "1" },
      insta: "https://www.instagram.com/hussain_explores/reel/DUbTJINDJ6B/", // the costs & timing reel this plan is built from
      route: [
        { name: "Muscat → the coast → back by dinner", sub: "the country's best single day", chip: "🏞️", cost: "from OMR 16 pp",
          stops: [
            { t: "08:00", icon: "🚗", title: "Leave Muscat", note: "Route 17 east, the scenic coast road. Fuel for the whole loop is about OMR 10." },
            { t: "10:00", icon: "🏞️", title: "Wadi Shab", note: "Boat across, hike the canyon 45–60 min, swim the last stretch into the waterfall cave. Give it 3 hours, it is the reason you came.", omr: "3.0", spot: "wadi-shab", hl: true },
            { t: "13:05", icon: "🌊", title: "Pebble Beach + the Romantic Cave", note: "3 minutes down the road at Tiwi. Rest, photos, and the cave if the sea is flat calm.", spot: "pebble-beach-tiwi" },
            { t: "13:50", icon: "🍽️", title: "Lunch at Najmat Sur", note: "On the coast road toward Bimmah. Local lunch 1.8, tea 0.3.", omr: "2.1", spot: "food-najmat-sur" },
            { t: "15:00", icon: "💧", title: "Bimmah Sinkhole", note: "Swim the sinkhole, walk the park, wind down. An hour or two.", spot: "bimmah-sinkhole" },
            { t: "17:00", icon: "🌇", title: "Drive home", note: "Back in Muscat around 19:00." }
          ] }
      ],
      receipt: {
        rows: [
          ["Wadi Shab boat + shoes + jacket", "3.0"],
          ["Lunch + tea at Najmat Sur", "2.1"],
          ["Snacks on the road (optional)", "5.0"],
          ["Car rental + fuel, whole loop", "25.0 /car"]
        ],
        splits: [["solo", "OMR 35"], ["two people", "OMR 23 each"], ["four", "OMR 16 each"]],
        note: "Posted prices, July 2026. OMR 1 ≈ USD 2.60."
      }
    },
    {
      id: "escape-3day", cat: "itineraries", free: true,
      name: "The 3-Day Muscat & Wadis Escape",
      tagline: "The long weekend that covers the classics.",
      blurb: "One day for the capital, one for the coast and the famous swim, one for Nizwa and the mountains. First-timer proof, any car, one hotel, no repacking.",
      img: "assets/itineraries/escape-3day.jpg",
      imgCredit: "Photo: Andries Oudshoorn · CC BY-SA 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/itineraries/escape-3day-2.jpg", credit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/itineraries/escape-3day-3.jpg", credit: "Photo: Fabio Achilli from Milano, Italy · CC BY 2.0 · Wikimedia Commons" }
      ],
      stats: { "Best for": "First-timers", "Base": "One Muscat hotel", "Car": "Any car", "Days": "3" },
      route: [
        { name: "Muscat", sub: "mosque, souq, forts, corniche", chip: "🕌", cost: "≈ OMR 3 pp",
          stops: [
            { t: "08:00", icon: "🕌", title: "Sultan Qaboos Grand Mosque", note: "Visitor window closes 11:00. Free; robe hire 2.5 if you need one.", spot: "grand-mosque", hl: true },
            { t: "11:30", icon: "🍽️", title: "Lunch in Old Muscat", note: "Bait Al Luban on the harbour is the one worth booking.", spot: "food-bait-al-luban" },
            { t: "13:00", icon: "🏛️", title: "Al Alam Palace + Jalali & Mirani forts", note: "Viewed from outside, 45 minutes of the best photo spots in the capital.", spot: "old-muscat" },
            { t: "16:00", icon: "🏮", title: "Mutrah Souq + fort", note: "The souq wakes up late afternoon. Frankincense, silver, karak.", spot: "mutrah" },
            { t: "18:00", icon: "🌇", title: "Mutrah Corniche at dusk", note: "The postcard walk. Dinner idea: Al Bait Al Omani." }
          ], sleep: "Muscat" },
        { name: "The coast + Wadi Shab", sub: "the perfect day, compressed", chip: "🏞️", cost: "≈ OMR 5 pp",
          stops: [
            { t: "08:00", icon: "🚗", title: "Coast road east", note: "Breakfast on the way." },
            { t: "10:00", icon: "🏞️", title: "Wadi Shab", note: "Boat, canyon, cave. Three hours.", omr: "3.0", spot: "wadi-shab", hl: true },
            { t: "13:50", icon: "🍽️", title: "Najmat Sur", note: "Local lunch about OMR 2.", omr: "2.1", spot: "food-najmat-sur" },
            { t: "15:00", icon: "💧", title: "Bimmah Sinkhole", note: "The swim on the way home.", spot: "bimmah-sinkhole" },
            { t: "17:00", icon: "🌇", title: "Back to Muscat", note: "Home by 19:00." }
          ], sleep: "Muscat" },
        { name: "Nizwa + the mountain village", sub: "souq, fort, old quarters", chip: "🏯", cost: "≈ OMR 5 pp",
          stops: [
            { t: "08:00", icon: "🚗", title: "Drive to Nizwa", note: "1h45 on smooth highway." },
            { t: "10:00", icon: "🏺", title: "Nizwa Souq", note: "Pottery, silver, dates. Friday morning adds the goat market.", spot: "nizwa" },
            { t: "11:30", icon: "🏘️", title: "Harat Al Aqr", note: "The restored old quarter behind the fort.", spot: "harat-al-aqr" },
            { t: "12:30", icon: "🏯", title: "Nizwa Fort", note: "OMR 5, the best fort in the country.", omr: "5.0", spot: "nizwa", hl: true },
            { t: "14:30", icon: "⛰️", title: "Misfat Al Abriyeen", note: "Mud houses, falaj, date terraces. Walk it slowly.", spot: "misfat-al-abriyeen" },
            { t: "17:00", icon: "🌇", title: "Back to Muscat", note: "Two hours, dinner in the city." }
          ], sleep: "Muscat" }
      ],
      receipt: {
        rows: [
          ["Wadi Shab boat + kit", "3.0"],
          ["Nizwa Fort entry", "5.0"],
          ["Food, 3 days of eating well", "~30"],
          ["Hotel, 2 nights", "~80 /room"],
          ["Car + fuel, 3 days", "~75 /car"]
        ],
        splits: [["two people", "≈ OMR 116 each"], ["four", "≈ OMR 97 each"], ["solo", "≈ OMR 193"]],
        note: "Entries and the boat are posted prices; hotel, car and food are mid-range July 2026 estimates. OMR 1 ≈ USD 2.60."
      }
    },
    {
      id: "classic-5day", cat: "itineraries", free: false,
      name: "The 5-Day Grand Tour",
      tagline: "Forts, islands, wadis, Nizwa and the sands. One hotel, two speeds.",
      blurb: "My real five days for visitors: the western forts and hot springs, a morning snorkelling the Daymaniyats, the Wadi Shab day, Nizwa, then the desert on the way out. Every day ends back at the same Muscat bed, no repacking, and the receipt at the bottom is the whole trip. Came to get wet and tired instead? Three of the days carry an adventure swap: same direction, harder wadi.",
      img: "assets/experiences/wahiba-sands.jpg",
      imgCredit: "Photo: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/itineraries/adventure-5day.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" },
        { src: "assets/itineraries/adventure-5day-2.jpg", credit: "Photo: Davide Mauro · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      stats: { "Best for": "First visit, one week off work", "Base": "One Muscat hotel, 4 nights", "Car": "Any car (4×4 for the swaps)", "Days": "5" },
      route: [
        { name: "Forts & springs of the west", sub: "Seeb souq → Rustaq loop", chip: "🏰", cost: "≈ OMR 2 pp",
          stops: [
            { t: "08:00", icon: "🚗", title: "Leave the hotel", note: "Batinah side today. All tarmac." },
            { t: "10:00", icon: "🐟", title: "Seeb fish market", note: "Fish auction, dates and frankincense under one roof.", spot: "shop-seeb-souq" },
            { t: "11:00", icon: "🏞️", title: "Wadi Al Hoqain", note: "The trenches: palms, pools and a drivable wadi bed.", spot: "wadi-al-hoqain", hl: true },
            { t: "14:00", icon: "♨️", title: "Ain Al Kasfah hot spring", note: "45°C spring water. Bath houses about OMR 1 a slot; the spring itself free.", omr: "~1", spot: "ain-al-kasfah" },
            { t: "15:00", icon: "🍽️", title: "Late lunch in Rustaq", note: "Local, a couple of rials." },
            { t: "16:00", icon: "🏰", title: "Nakhal Fort + Ain A'Thawwarah", note: "The fort on the boulder, then the warm spring in the plantation. Small entry fee.", omr: "~0.5", spot: "nakhal-fort" },
            { t: "18:30", icon: "🌙", title: "Back to the hotel" }
          ], sleep: "Muscat",
          swap: "Adventure swap: Snake Gorge is this same side of the mountains. Canyoning, 3–4m cliff jumps, two ~20m abseils. Guide, ropes and helmets, no exceptions, and nothing planned for the evening." },
        { name: "Islands & the old capital", sub: "snorkel morning, souq evening", chip: "🐠", cost: "≈ OMR 25 pp",
          stops: [
            { t: "08:30", icon: "🚤", title: "Daymaniyat Islands boat trip", note: "Turtles, rays, reef. Book ahead; gear and the OMR 3 permit are usually included.", omr: "~25", spot: "daymaniyat", hl: true },
            { t: "14:00", icon: "🍽️", title: "Lunch at Rozna", note: "The Omani house restaurant. The splurge meal of the trip.", spot: "food-rozna" },
            { t: "16:00", icon: "🏮", title: "Mutrah Souq + fort", note: "Souq first, fort for the harbour view.", spot: "mutrah" },
            { t: "17:30", icon: "🏛️", title: "Al Alam Palace, Jalali & Mirani", note: "The old capital at golden hour.", spot: "old-muscat" },
            { t: "19:00", icon: "🌙", title: "Corniche, then the hotel" }
          ], sleep: "Muscat" },
        { name: "The Wadi Shab day", sub: "the swim you came for", chip: "🏞️", cost: "≈ OMR 5 pp",
          stops: [
            { t: "08:00", icon: "🕌", title: "Grand Mosque first", note: "Beat the heat and the buses, visitor window shuts 11:00.", spot: "grand-mosque" },
            { t: "09:45", icon: "🚗", title: "Coast road east", note: "Breakfast on the way." },
            { t: "11:30", icon: "🏞️", title: "Wadi Shab", note: "Boat, canyon, swim into the cave. Fit and early? Keep going where everyone else turns around, the upper pools are empty. Out by 14:30.", omr: "3.0", spot: "wadi-shab", hl: true },
            { t: "14:40", icon: "🍽️", title: "Najmat Sur", note: "The 2-rial lunch that beats every hotel buffet.", omr: "2.1", spot: "food-najmat-sur" },
            { t: "15:30", icon: "💧", title: "Hawiyat Najm (Bimmah Sinkhole)", note: "One last swim.", spot: "bimmah-sinkhole" },
            { t: "16:30", icon: "🌇", title: "Drive back", note: "Hotel by 18:30." }
          ], sleep: "Muscat",
          swap: "Adventure swap: Wadi Al Arbeieen, the same direction out of Muscat. Graded gravel through the pass, then 2+ hours of bouldering to the upper pools. The day that tells you what the rest of the week can be." },
        { name: "Nizwa & the mountain village", sub: "souq, fort, Misfat", chip: "🏯", cost: "≈ OMR 5 pp",
          stops: [
            { t: "08:00", icon: "🚗", title: "Drive to Nizwa", note: "1h45." },
            { t: "10:00", icon: "🏺", title: "Nizwa Souq", note: "Friday adds the goat market from 06:30.", spot: "nizwa" },
            { t: "11:30", icon: "🏘️", title: "Harat Al Aqr", note: "The old quarter nobody skips twice.", spot: "harat-al-aqr" },
            { t: "12:30", icon: "🏯", title: "Nizwa Fort", note: "Climb the round tower.", omr: "5.0", spot: "nizwa", hl: true },
            { t: "14:30", icon: "⛰️", title: "Misfat Al Abriyeen", note: "Late lunch in the village, then the falaj walk.", spot: "misfat-al-abriyeen" },
            { t: "18:00", icon: "🌙", title: "Back to Muscat" }
          ], sleep: "Muscat" },
        { name: "Wadi Bani Khalid & the sands", sub: "the finale", chip: "🏜️", cost: "≈ OMR 20 pp",
          stops: [
            { t: "08:00", icon: "🚗", title: "Drive east", note: "2.5 hrs to the pools." },
            { t: "10:30", icon: "🏞️", title: "Wadi Bani Khalid", note: "Pools from the car park, walk 15 min upstream to lose the crowd. Free.", spot: "wadi-bani-khalid", hl: true },
            { t: "13:00", icon: "🍽️", title: "Lunch near Bidiyah", note: "Grills and karak on the desert road." },
            { t: "14:00", icon: "🏘️", title: "Al Mudhaireb old town", note: "Watchtowers and date gardens, the leg-stretch before the sand.", spot: "al-mudhaireb" },
            { t: "15:30", icon: "🏜️", title: "Wahiba Sands", note: "Dune bashing and a camel ride with a camp day-visit, stay for the sunset ridge.", omr: "~18", spot: "wahiba-sands" },
            { t: "18:30", icon: "🌇", title: "Back to Muscat", note: "2.5 hrs. Land with sand in your shoes." }
          ], sleep: "Muscat, or swap this night for a desert camp",
          swap: "Adventure swap: Wadi Mibam instead of Bani Khalid, 4×4 up through the date gardens, emerald pools, nobody there. Or, with a guide, Wadi Hawer: remote, technical, wet from morning to evening." }
      ],
      receipt: {
        rows: [
          ["Wadi Shab boat + kit", "3.0"],
          ["Daymaniyat trip incl permit", "~25"],
          ["Nizwa + Nakhal forts, hot spring", "~7"],
          ["Desert afternoon in the sands", "~18"],
          ["Food, 5 days incl the Rozna meal", "~50"],
          ["Hotel, 4 nights, Novotel class", "~160 /room"],
          ["Car + fuel, 5 days", "~125 /car"]
        ],
        splits: [["two people", "≈ OMR 245 each"], ["four", "≈ OMR 215 each"], ["solo", "≈ OMR 385"]],
        note: "Forts, permits and the Shab boat are posted prices; hotel, boat trip, desert and food are July 2026 estimates. Adventure swaps add a guide, OMR 30–60 pp for Snake Gorge grade days. OMR 1 ≈ USD 2.60."
      }
    },
    {
      id: "loop-7day", cat: "itineraries", free: false,
      name: "The 7-Day Ultimate Oman Loop",
      tagline: "Mountains, wadis, desert and coast, the full circle.",
      blurb: "The route I'd drive if I had a week: the coast, the turtles, a night in the dunes, Nizwa, the mountains, and a canyon on the way home.",
      img: "assets/itineraries/loop-7day.jpg",
      imgCredit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons",
      gallery: [
        { src: "assets/itineraries/loop-7day-2.jpg", credit: "Photo: Juozas Šalna · CC BY 2.0 · Wikimedia Commons" },
        { src: "assets/itineraries/loop-7day-3.jpg", credit: "Photo: Erfan.arafat · CC BY-SA 4.0 · Wikimedia Commons" }
      ],
      stats: { "Best for": "The full picture", "Base": "Moving loop", "Car": "4×4 recommended", "Days": "7" }
    }
  ],

  // Planner interest options, these must match the `tags` used on spots.
  interests: [
    { id: "swimming", label: "Swimming & wadis", icon: "💧" },
    { id: "snorkel", label: "Snorkelling", icon: "🐠" },
    { id: "hiking", label: "Hiking", icon: "🥾" },
    { id: "canyoning", label: "Canyoning", icon: "🧗" },
    { id: "adrenaline", label: "Adrenaline", icon: "⚡" },
    { id: "beach", label: "Beaches", icon: "🏖️" },
    { id: "desert", label: "Desert", icon: "🐪" },
    { id: "culture", label: "Culture & history",icon: "🕌" },
    { id: "wildlife", label: "Wildlife", icon: "🐢" },
    { id: "photography",label: "Photography", icon: "📸" },
    { id: "food", label: "Food & coffee", icon: "☕" },
    { id: "sunset", label: "Sunsets", icon: "🌅" },
    { id: "camping", label: "Camping", icon: "⛺" },
    { id: "shopping", label: "Souqs & shopping", icon: "🛍️" }
  ],

  /* The Info tab, free for everyone. Edit freely; `affiliate` on an item
     drops in the matching link from meta.affiliates when you've set it. */
  info: {
    intro: "What I tell every visitor before they land.",

    /* The four numbers worth knowing before the plane door opens. Rendered as
       the big-type strip at the top of the Info tab. */
    keyFacts: [
      { big: "9999", label: "any emergency" },
      { big: "1 = $2.60", label: "rial to dollar" },
      { big: "Fri–Sat", label: "the weekend" },
      { big: "Omantel", label: "best signal off-road" }
    ],

    /* Each section declares a LAYOUT and the renderer draws it bespoke:
         signs:   pictogram road-signs; `no: true` = red prohibition ring
         connect, one connectivity card; `bars` is the coverage chart
         apps:    download-these chips
         ranked:  best-to-worst ladder
         stats:   big typographic numbers; `big` / `sub` per item
         sos:     the red panel; `tel: true` makes the number call
       Every item still carries its full `text`, tapping anything opens it. */
    sections: [
      /* Visas first: the one thing that can end a trip at the airport. The
         text stays deliberately unspecific about which passports need what,
         because those rules change; the official portal is the answer. */
      { title: "Before you fly", layout: "apps", items: [
        { name: "Do I need a visa?", icon: "visa", short: "Check your passport on the official eligibility page, two minutes.", text: "Many nationalities get a visa on arrival or an exemption for short stays, and the rules change. Check what your passport needs on the Royal Oman Police eVisa portal, the official source, and apply there rather than through third-party visa sites.", link: "https://evisa.rop.gov.om/visa-eligibility", linkLabel: "Check if you need a visa" },
        { name: "Driving in over a land border?", icon: "border", short: "Passport, car papers, and insurance that covers Oman.", text: "Oman has land crossings with the UAE and with Saudi Arabia. Whichever you use, you need your passport, the car's registration, and insurance that explicitly covers Oman; a rental also needs a no-objection letter from the hire company. The UAE crossings are the busiest and the best organised. Reaching Musandam by road from Muscat means transiting the UAE either way. Opening hours and rules change, so check the day before you drive.", link: "", linkLabel: "" },
        { name: "Do I need an IDP to drive?", icon: "idp", short: "If you need one, get it at home. You cannot buy one here.", text: "Gulf licences are accepted as they are. For everyone else the rental company sets the rule, and many want an International Driving Permit alongside your own licence, particularly if your licence is not in English or Arabic. The catch: an IDP is only issued by the country that issued your licence, usually through its automobile association, so it has to be done before you fly. It is cheap and takes a day or two. Ask your rental company what they need at the time you book, not at the desk.", link: "", linkLabel: "" },
        { name: "Download OTaxi and Talabat", icon: "otaxi", short: "Rides with no haggling, and food at the end of a wadi day.", text: "OTaxi is Oman's ride-hailing app: fixed fares, no haggling, and an airport pickup without it can cost triple. Talabat delivers everything from shawarma to groceries. Install both while you still have wifi at home.", link: "", linkLabel: "" },
      ]},

      { title: "The rules", layout: "signs", items: [
        { name: "Dress modestly", icon: "dress", short: "Shoulders and knees covered in villages and souqs.", text: "Shoulders and knees covered in villages, souqs and anywhere religious. Swimwear is fine at hotel pools and in the wadis, just cover up for the walk through the village to get there." },
        { name: "Alcohol in public", icon: "alcohol", no: true, short: "Licensed hotels and restaurants only.", text: "Licensed hotel bars and restaurants only. Never in public, never on a beach, never in the car." },
        { name: "Drones", icon: "drone", no: true, short: "No permit, no drone.", text: "Drones need a permit. Flying without one risks confiscation at the airport. Unless you've done the paperwork in advance, leave it at home." },
        { name: "Photographing people", icon: "camera", no: true, short: "Not without permission, especially women and elders.", text: "Ask before photographing people, especially women and elders. You'll almost always get a yes." },
        { name: "The weekend is Fri–Sat", icon: "weekend", short: "Friday morning the country slows down.", text: "Friday morning the country slows down for prayers, souqs and small shops open late. Plan a wadi or a slow breakfast, not errands." },
        { name: "Take your rubbish out", icon: "rubbish", short: "No bins at a wadi. Bring a bag.", text: "There are no bins at a wadi. Bring a bag, fill it, drive it home. Don't touch the coral or the turtles." }
      ]},

      { title: "Stay connected", layout: "connect",
        /* The chart is a drawing of the text below it, not a measurement, 
           the bars rank the three networks the way the words do. */
        bars: [
          { label: "Omantel", pct: 92, note: "mountains & the far south" },
          { label: "Ooredoo", pct: 76, note: "close behind, often cheaper" },
          { label: "Vodafone", pct: 55, note: "fine in the cities" }
        ],
        items: [
        { name: "The three networks", icon: "signal", short: "Omantel for the mountains. Ooredoo cheaper.", text: "Omantel: best coverage in the mountains and the far south, and the only one with a bar of signal on a wadi track. Ooredoo: close behind, often cheaper. Vodafone Oman: newest, fine in the cities." },
        { name: "A physical SIM at the airport", icon: "sim", short: "Ask for Ooredoo Tourist 5 · 8 GB · 10 days · 5 OMR", text: "Tourist SIM counters sit in arrivals at both Muscat and Salalah: passport, five minutes, and the counter is open at 2am. Ask for Ooredoo's Tourist 5: 8 GB, 50 local and 50 international minutes, 50 SMS, valid 10 days, OMR 5 plus 5% VAT as of July 2026. Tourist 10 is 18 GB over 15 days if you are staying longer, and the line itself stays alive 30 days either way. Omantel's tourist pack costs about the same for a quarter of the data, so take that one only if your trip is mostly deep wadis and mountains, where coverage beats gigabytes." },
        { name: "Or an eSIM before you fly", icon: "esim", short: "Land already connected, no queue.", text: "If your phone takes an eSIM, buy it at home and land already connected, no counter, no queue, no passport copies. Slightly pricier per GB than a local SIM, and it usually rides on Omantel or Ooredoo anyway.", affiliate: "esim", affLabel: "Get an Oman eSIM →" },
        { name: "No signal in the wadis", icon: "nosignal", short: "Download offline maps before you drive in.", text: "Whatever you buy, assume no signal in the canyons and on the mountain tracks. Save the Muscat area and your route in Google Maps before you leave wifi, and send your \"here's where I'm going\" message before you drive in." }
      ]},

      { title: "Getting around: best to worst", layout: "ranked", items: [
        { name: "Rent a car", icon: "rentcar", short: "Nothing good is on a bus route.", text: "Nothing good here is on a bus route. A 4×4 opens everything; a 2WD still covers the classics.", affiliate: "car", affLabel: "Rent a car →" },
        { name: "OTaxi inside the city", icon: "citytaxi", short: "Cheap and metered, but not down a wadi track.", text: "Cheap, metered and reliable around Muscat and Salalah. It just won't take you down a wadi track." },
        { name: "Hire a guide with a car", icon: "guidecar", short: "Local knowledge, proper vehicle.", text: "Local knowledge and a proper vehicle for the hard spots. Costs more, worth it for Snake Gorge-grade days.", affiliate: "guide", affLabel: "Book a guided trip →" },
        { name: "Domestic flights", icon: "plane", short: "Muscat–Salalah daily, Khasab and Duqm too.", text: "Oman Air and SalamAir fly Muscat–Salalah daily, which saves the 10-hour drive, plus Khasab for Musandam and Duqm. Book khareef early, everyone in the Gulf has the same idea. You still need a car at the other end." },
        { name: "Mwasalat buses", icon: "bus", short: "Fine between cities, useless for the spots.", text: "Clean, cheap intercity coaches (Muscat–Sur, Muscat–Nizwa, Muscat–Salalah). Fine for moving between cities; useless for the spots themselves. The Salalah run is an overnight haul of 10 to 12 hours, so book ahead around holidays.", link: "https://mwasalat.om", linkLabel: "Mwasalat routes" },
        { name: "Street taxis", icon: "streettaxi", short: "No meter. Agree the price before you get in.", text: "No meter. If you must: agree the price before you get in, and halve the first number you hear." }
      ]},

      { title: "Money", layout: "stats", items: [
        { name: "The rial is strong", big: "1 OMR", sub: "≈ USD 2.60, prices look small until you multiply", text: "1 OMR ≈ USD 2.60, and it is pegged there, so the rate barely moves while you are here. Prices look small until you multiply." },
        { name: "Card in the cities, cash in the mountains", big: "10–20", sub: "OMR of cash is about the right amount to carry", text: "Malls, hotels, restaurants and fuel stations all take card. Cash is for village shops, wadi entry and parking, the boat at Wadi Shab, souq haggling and the small places worth eating in. Carry 10 to 20 OMR and top it up whenever you pass through a town, because the last ATM before the mountains is further back than you think." },
        { name: "Where to change money", big: "ATM", sub: "the simplest answer, and they are in every town", text: "ATMs are in every town, take international cards, and are usually the cheapest route once you count the spread on cash. If you want notes in hand, the exchange houses in the malls and souqs beat hotel desks, and the airport counters are fine for your first 20 or 30 rials. Bring clean, untorn notes if you are exchanging cash, and expect to show your passport." },
        { name: "Tipping", big: "0", sub: "expected, rounding up is plenty", text: "Not expected. Round up a taxi or leave a rial if you want to." }
      ]},

      { title: "If something goes wrong", layout: "sos", items: [
        { name: "9999", tel: true, short: "Police and ambulance, one number, nationwide.", text: "One number for police and ambulance, nationwide." },
        { name: "Flash floods", icon: "flood", short: "Rain upstream, even under blue sky, means stay out.", text: "The one real danger here. If rain is forecast anywhere upstream, even under blue sky where you stand, stay out of the wadi. Every year someone doesn't." }
      ]}
    ]
  }
};
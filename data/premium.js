/* =============================================================================
   EXPLORING OMAN, PREMIUM CONTENT (paid tier)
   -----------------------------------------------------------------------------
   Only loaded after a licence key verifies. Keys = the `id` in content.js.

   Every [bracketed] line is researched filler or a prompt for you. THAT TEXT IS
   THE PRODUCT. A buyer can Google "how to get to Wadi Shab", they cannot Google
   "which pool Hussain stops at". Replace the brackets before you sell.

   📝 FORMAT: no paragraphs. `gettingThere` is an ARRAY of short lines and renders
   as NUMBERED STEPS. `whatYoullDo` is an ARRAY and renders as BULLETS. Keep each
   line to one idea, this is read on a phone, in a car, at 6am. (A plain string
   still works, it just renders as one block of text. Don't.)

   ⚠️ SECURITY: this is a static site, so a determined person could fetch this
   file directly. Exactly as leaky as the PDF you already sell. To lock it
   properly, change ONE function: `loadPremium()` in js/unlock.js.
   ========================================================================== */

window.OMAN_PREMIUM = {

  /* ═══════════════════════════════════════════════════════════════ WADIS */
  "wadi-mibam": {
    gettingThere: [
      "Sharqiyah Highway from Muscat toward Sur, about 3.5 hrs.",
      "Turn off at Wadi Tiwi: 2km past Wadi Shab, at the second bridge.",
      "Follow the wadi road ~10km to Mibam village. 4×4 required, the last stretch is steep track through date gardens.",
      "Park at the village. Hike down about 15 min to the first waterfall."
    ],
    whatYoullDo: [
      "[REWRITE IN YOUR OWN VOICE, this is the core value of the product.]",
      "Drop from the village to the canyon floor: green pools between high walls.",
      "Swim and wade between 2–3 pools. Most people give it a couple of hours.",
      "How far you get depends entirely on water levels that week."
    ],
    tips: [
      "[Go on a weekday, weekends get busy.]",
      "[Water shoes, the rocks past the first pool are slippery.]",
      "[The best pool is __, most people stop too early.]"
    ],
    guideNote: "Easier with someone who knows the way. I trust [Guide name], tell them I sent you."
  },

  "wadi-al-arbeieen": {
    gettingThere: [
      "1h35 from Muscat. Turn off the highway toward Wadi Al Arbeieen.",
      "Take the mountain pass: ~10km of graded gravel, steep sections, water crossings.",
      "Take the 4×4. A sedan will make it on a good day and you'll hate every minute.",
      "Park near the village and start walking."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, which pools you stop at, how far you push, where the good jumps are.]",
      "The walk in is bouldering, not hiking, you hop and climb over giant white rocks.",
      "Give it two-plus hours to reach the good stuff.",
      "The pools get bigger, deeper and emptier the further you go.",
      "Most people turn round at the first decent pool. That's the mistake."
    ],
    tips: [
      "[Give it 5–6 hours of daylight if you want the top pools and back.]",
      "[Shoes with drainage AND grip. This is the wadi that punishes bad footwear.]",
      "[Go on a weekday and you may not see another person all day.]",
      "[Flash-flood country. Grey sky over the mountains = do not enter.]"
    ],
    guideNote: "The driving and the route-finding are the hard parts. [Guide name] handles both."
  },

  "wadi-damm": {
    gettingThere: [
      "Head for Al Hamra / Al Ayn, roughly 2 hrs from Muscat via Nizwa.",
      "2WD: park ~500m out and walk the last 10 min. 4×4: you get a bit closer over the rocks and the stream.",
      "From the parking it's a 30–40 min walk up the canyon to the main pools."
    ],
    whatYoullDo: [
      "[YOUR ROUTE.]",
      "Blue-green pools and small waterfalls in a narrow canyon, ferns growing out of the rock.",
      "Unusually for Oman, there's water in it all year.",
      "Walk past the first pool, it's the least impressive one and where everyone stops.",
      "Keep going into the canyon: a string of better pools, often empty."
    ],
    tips: [
      "[Don't wade in, sit on the edge and slide. The entry rocks are like ice.]",
      "[Nov–Mar for the best water levels.]"
    ],
    guideNote: ""
  },

  /* NOTE: wadi-tiwi, wadi-tanuf, yiti-qantab, nizwa, misfat-al-abriyeen,
     al-hoota-cave, jabal-akhdar, khor-rori, ayn-razat, shop-seeb-souq and
     cafe-qaha are now FREE spots, their write-ups live in content.js, because
     this file only loads for buyers. Don't add them back here. */

  "wadi-dayqah": {
    gettingThere: [
      "About an hour from Muscat via Quriyat. Tarmac the whole way, any car.",
      "Entry is roughly OMR 1 per visitor, bring cash.",
      "Open roughly 8am to 10pm."
    ],
    whatYoullDo: [
      "[YOUR TAKE, which activity is actually worth the money.]",
      "Oman's biggest dam, with an adventure park on the water.",
      "Kayaks, paddleboards, pedal boats, donut rides, pick one.",
      "Café at the top viewpoint.",
      "Swimming in the dam is restricted: this is a day ON the water, not in it."
    ],
    tips: [
      "[The best light on the dam wall is late afternoon.]",
      "[This is the one for family, kids, or anyone who's said no to a hike.]",
      "[Bring cash, card isn't reliable here.]"
    ],
    guideNote: "Boat and watersport hire on site (Husaak run the adventure park). Book ahead at weekends."
  },

  "wadi-ghul": {
    gettingThere: [
      "Take the Ghul–Nakhar route below Jabal Shams, 2.5 hrs from Muscat via Nizwa.",
      "Pavement ends past Al Hajir and turns into rough track. 4×4, and a full tank."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, how far up you drove, where you stopped, what it does to your sense of scale.]",
      "Drive up the canyon floor with 1,000m walls closing in on both sides.",
      "Stop the car and walk. You can't read the height of the walls from inside it.",
      "Stop at Ghul village on the way: half-abandoned, stacked up the hillside."
    ],
    tips: [
      "[The scale doesn't fit in a phone camera. Bring something wider, or a person for scale.]",
      "[Combine with the Balcony Walk on the rim, same mountain, opposite perspectives, one long day.]",
      "[Signal disappears. Download the map before you leave Nizwa.]"
    ],
    guideNote: "The track is the hard part, not the walking. Go with a driver who's done it: [Guide name]."
  },

  "wadi-hawer": {
    gettingThere: [
      "Remote: ~2.5 hrs from Muscat by 4×4, branching off the Wadi Bani Khalid valley system.",
      "The terrain is boulder-hopping, narrow scrambles and swimming.",
      "Most people go with an operator who handles the off-road driving. Don't attempt the drive without the right vehicle and experience."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, the swims, the tricky sections, what makes it special.]",
      "[Be honest about the difficulty from your own experience. This section is the product.]"
    ],
    tips: [
      "[Start early, this is a full day.]",
      "[Strong shoes and real fitness needed.]",
      "[Don't go after rain, flash-flood country.]"
    ],
    guideNote: "Don't do this one alone. I went with [Guide name] and it made the day."
  },

  "snake-gorge": {
    gettingThere: [
      "Wadi Bani Awf area, 1.5 to 4 hrs from Muscat depending on the road you take (via Nakhal → Al Rustaq → Al Awabi).",
      "Mountain 4×4 road: high, narrow, exposed.",
      "Drive it yourself only if you're an experienced off-road driver. Otherwise go with a guide who drives too."
    ],
    whatYoullDo: [
      "[REWRITE IN YOUR OWN VOICE.]",
      "About 6 hours through the gorge, this is canyoning, not a casual swim.",
      "Rock pools and boulder scrambling the whole way.",
      "Cliff jumps of 3–4m, where your guide says and nowhere else.",
      "Two ~20m abseils in the upper section.",
      "You need real fitness and to be comfortable with heights and rappelling."
    ],
    tips: [
      "[Only jump where your guide says, depths change with every flood.]",
      "[Helmet + good shoes. This is canyoning.]",
      "[Never in or after rain. Ever.]"
    ],
    guideNote: "Non-negotiable: go with a guide. Book through [Guide name], they bring the ropes and the helmets."
  },

  "wadi-as-suwayh": {
    gettingThere: [
      "Coast road past Sur, roughly 3 hrs from Muscat.",
      "2WD reaches the entrance.",
      "Walk in: 20–40 minutes."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, this one needs your first-hand notes more than any other in the guide.]",
      "[Water levels vary hugely and public info is thin. Your notes ARE the value here.]",
      "Palms, pools, a short walk in.",
      "The sea is a few minutes away, a wadi and a beach in one morning."
    ],
    tips: [
      "[Check water levels before committing, it can be dry.]",
      "[Bring everything. There is nothing out here.]"
    ],
    guideNote: "",
    needsFirstHand: true
  },

  "wadi-naqab": {
    gettingThere: [
      "Northern Hajar, in the Musandam region.",
      "A serious drive from Muscat, realistically a separate trip, not a day out.",
      "4×4 essential."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, and be blunt about who should and shouldn't attempt this.]",
      "[Public info is thin and inconsistent, so this section must be yours.]",
      "Long approach, real exposure, big mountain scale."
    ],
    tips: [
      "[Don't route-find this yourself.]",
      "[4L of water minimum. There is no shade and no bail-out.]",
      "[Nov–Mar only.]"
    ],
    guideNote: "Guide required. Non-negotiable.",
    needsFirstHand: true
  },

  /* ═════════════════════════════════════════════════════════════ BEACHES */
  "bandar-khayran": {
    gettingThere: [
      "By boat: ~25 min. Most people book out of Marina Bandar Al Rowdha or Sifah.",
      "By car: ~40 min from Muscat via the Qantab–Yiti–Sifah road.",
      "The boat is the point, the good coves have no road to them."
    ],
    whatYoullDo: [
      "[YOUR TAKE, which cove, what you saw.]",
      "Snorkel the reef: rays, turtles, and a chance of dolphins on the way out.",
      "It's the best snorkelling this close to the city.",
      "Prefer it quiet? Kayak the coves and mangroves instead of taking a boat."
    ],
    tips: [
      "[Morning, the water is glassiest before the wind picks up.]",
      "[Bring your own mask. A leaking hire mask ruins the day.]",
      "[Reef-safe sunscreen, or a rash vest instead.]"
    ],
    guideNote: "Easiest by boat. Researched candidates: Mola Mola Diving Center, Coral Ocean Tours, Husaak Adventures (sunset kayak). Pick the one you've actually used: [operator]."
  },

  "ras-al-jinz": {
    gettingThere: [
      "3–3.5 hrs from Muscat, too far to do and come back in a night.",
      "Sleep at the reserve's eco-lodge or in Sur (rooms roughly OMR 75–100).",
      "In-house guests get the turtle viewing included.",
      "Tours run at dawn and at night. Book direct through the reserve, numbers are capped and it sells out."
    ],
    whatYoullDo: [
      "[YOUR TAKE, what you saw, what it felt like.]",
      "A ranger walks the group onto the beach in the dark.",
      "You watch green turtles haul up the sand and dig.",
      "Dawn tour: you often catch the hatchlings running for the sea instead."
    ],
    tips: [
      "[Book well ahead, they cap numbers and it sells out.]",
      "[No flash. Ever. It disorients them and they'll turn back to sea without laying.]",
      "[It's cold on that beach at night. Bring a jacket.]"
    ],
    guideNote: "Guided access only, book through the reserve directly."
  },

  "as-sifah": {
    gettingThere: [
      "About an hour from Muscat via the Qantab–Yiti road, scenic, some rough sections.",
      "Or take the longer paved route if you're in a low car.",
      "Any car reaches the main beach. A 4×4 gets you to the emptier far ends."
    ],
    whatYoullDo: [
      "[YOUR TAKE, where exactly you camp, and how far along you drive to lose everyone else.]",
      "A long, wide, quiet stretch of sand with mountains behind it.",
      "Drive past the first bit, that's where everyone stops.",
      "Camp. It's one of the easiest wild nights you can have from Muscat."
    ],
    tips: [
      "[Wild camping is legal, but take every scrap of rubbish out with you.]",
      "[Weekdays. On a Friday it fills up.]"
    ],
    guideNote: ""
  },

  "al-sawadi": {
    gettingThere: [
      "1.5 hrs northwest of Muscat up the Batinah coast. Tarmac all the way.",
      "The beach is free.",
      "Boats to the offshore islands are hired on the day, on the beach."
    ],
    whatYoullDo: [
      "[YOUR TAKE, is the island boat worth it, and which island.]",
      "Clean sand, calm water, a cluster of protected islands offshore.",
      "The reef between the mainland and the islands is the reason to bother.",
      "The beach alone is nice, not remarkable. Take the boat.",
      "The islands are a seabird nesting site, stay off the nests."
    ],
    tips: [
      "[Negotiate the boat price before you get in.]",
      "[Take your own snorkel gear.]",
      "[Sunset from the beach, looking back at the islands, is the shot.]"
    ],
    guideNote: "Boat hire is arranged on the beach, agree the price and the return time up front."
  },

  /* ═════════════════════════════════════════════════════════════ SALALAH */
  "al-baleed": {
    gettingThere: [
      "On the Salalah waterfront, near the Hilton side of town. Any car, or an OTaxi.",
      "Entry is a few rials per car and includes the Museum of the Frankincense Land.",
      "It stays open into the evening, which is when you want to be there."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, museum first or ruins first, and why.]",
      "Do the museum first: the frankincense trade, the dhows, the ports. It's the story.",
      "Then walk (or take the buggy) around the excavated city of Zafar as the light drops.",
      "Watch the lagoon edge, herons, and flamingos in season.",
      "Stay for dusk: the ruins are lit and the temperature finally behaves."
    ],
    tips: [
      "[Go after 4pm.]",
      "[The buggy is worth it with kids, the site is bigger than it looks.]",
      "[Pair with a sunset walk on Al Haffa beach and dinner nearby.]"
    ],
    guideNote: ""
  },

  "jabal-samhan": {
    gettingThere: [
      "1.5 hrs east of Salalah: through Taqah and Mirbat.",
      "Then the switchback road up the plateau, paved the whole way, any car.",
      "Check your brakes before the descent. Seriously.",
      "On the way, stop at Tawi Atayr sinkhole and the baobab valley."
    ],
    whatYoullDo: [
      "[YOUR TAKE, sunrise or sunset, and where exactly you stand.]",
      "Park at the viewpoint and walk the rim.",
      "The escarpment drops the best part of a kilometre, straight to the coastal plain.",
      "On a clear day you can trace the shoreline all the way to Mirbat.",
      "This is the Arabian leopard reserve. Camera traps see them; visitors don't."
    ],
    tips: [
      "[Avoid khareef for this one, the plateau sits inside the fog Jul–Aug and there is no view.]",
      "[It's windy and 10 degrees cooler up top. Jacket.]",
      "[Fuel up in Mirbat, stations are sparse on the mountain.]"
    ],
    guideNote: ""
  },

  "fazayah-beach": {
    gettingThere: [
      "West from Salalah, past Mughsail, 1.5 hrs in total.",
      "Climb the Sarfait switchbacks, then take the signed graded track that drops to the coves.",
      "The descent is the 4×4 part: low gear, no drama in the dry.",
      "There is nothing down there but sand and camels. Bring everything you need."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE, which cove, and what time the light works.]",
      "White-sand coves under pale cliffs, usually empty except for camels in the shallows.",
      "Outside khareef: swim, snorkel the rocky ends, stay for sunset.",
      "In khareef: the sea is dangerous. Go for the view, not the water.",
      "Walk one cove further than the first. That's where everyone stops."
    ],
    tips: [
      "[No shade, no water, no signal in the coves. Plan like it's a mini-expedition.]",
      "[Stop on the descent track on the way out at sunset, the angle is better than from the beach.]"
    ],
    guideNote: ""
  },

  "wadi-dawkah": {
    gettingThere: [
      "45 min north of Salalah on the Thumrait road (Route 31).",
      "Signposted, paved, any car.",
      "It's on the way to the Empty Quarter, slot it into a desert day."
    ],
    whatYoullDo: [
      "[YOUR TAKE, why this ties the frankincense story together.]",
      "Walk among a couple of thousand wild Boswellia sacra trees in their own wadi.",
      "These are the groves that supplied Sumhuram and Al Baleed for two millennia.",
      "Look for the dried resin beads on the cut bark.",
      "Twenty minutes here and the museums finally make sense."
    ],
    tips: [
      "[Go early or late, the desert side of the mountains is hotter than Salalah.]",
      "[Buy your actual frankincense in Al Haffa souq afterwards, now you know what you're looking at.]",
      "[If you're pushing on to the Empty Quarter, this is the free warm-up act.]"
    ],
    guideNote: ""
  },

  "taqah-castle": {
    gettingThere: [
      "35 min east of Salalah on the coast road, in the middle of Taqah town.",
      "Any car. Park by the square.",
      "It's 20 min short of Khor Rori, do them on the same run east."
    ],
    whatYoullDo: [
      "[YOUR TAKE, what stuck with you inside.]",
      "The restored wali's residence, laid out as it was actually lived in.",
      "The majlis, the women's rooms, the rifle slits covering the bay.",
      "Go up to the rooftop for the view along the Taqah coast.",
      "It's small, under an hour, and it's the best window into pre-1970 Dhofari life you'll get."
    ],
    tips: [
      "[Confirm opening days, small forts keep small hours, and Fridays are unreliable.]",
      "[Rooftop late afternoon for the light along the coast.]",
      "[Stack it: Taqah Castle → Khor Rori → Wadi Darbat is one natural day east.]"
    ],
    guideNote: ""
  },

  "ayn-athum": {
    gettingThere: [
      "25 min northeast of Salalah, at the foot of the mountains.",
      "Paved to the parking, any car.",
      "Signage is thin, follow the maps pin, not the road signs."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE, when you go and where you stand.]",
      "In khareef the spring becomes a waterfall off the green cliff, mist rolling through the trees.",
      "It's the Darbat scene without the tour buses.",
      "Outside the monsoon: a quiet pool and a shady walk.",
      "Ten minutes from Ayn Razat, see both in one morning."
    ],
    tips: [
      "[Peak flow late July–August; just after khareef it's still green and empty.]",
      "[Wet rock everywhere in season, grip matters more than it looks.]",
      "[No swimming, it feeds the falaj, same as Razat.]"
    ],
    guideNote: ""
  },

  /* ── Salalah additions (Jul 2026) ─────────────────────────────────────── */
  "taqah-beach": {
    gettingThere: [
      "Coast road east from Salalah, ~25 min. Turn seaward in Taqah town.",
      "Any car, park on the hard sand behind the beach.",
      "It sits between Taqah Castle and Khor Rori: swim in the middle of that day."
    ],
    whatYoullDo: [
      "[YOUR STRETCH, which end you park at and why.]",
      "White sand, fishing boats at the west end, and usually nobody in the water.",
      "Swim, walk, or just eat lunch looking at it.",
      "The rocky ends hold fish if you brought a mask."
    ],
    tips: [
      "[Confirm the best access track, the GPS pin drifts.]",
      "Not in khareef, the whole south coast is off-limits for swimming Jul–Sep.",
      "Weekday mornings you will have it entirely to yourself."
    ],
    guideNote: ""
  },
  "ayn-garziz": {
    gettingThere: [
      "10–15 min north of the city centre, at the foot of the Ittin cliffs.",
      "Paved to the parking, any car.",
      "Follow the maps pin, small brown signs, easy to overshoot."
    ],
    whatYoullDo: [
      "[YOUR TIMING, when the cliff actually drips and when it's dry.]",
      "In khareef: the cliff face streams, the pools fill, everything is green.",
      "Walk the short path along the stream under the rock.",
      "Outside the monsoon: shade, birds, picnicking families."
    ],
    tips: [
      "[Best light is __, the cliff faces __.]",
      "No swimming, spring water, local supply.",
      "Stack it with the Ittin road: Garziz → Gravity Point → Ayoub's tomb is one climb."
    ],
    guideNote: ""
  },
  "ayn-khor": {
    gettingThere: [
      "Head west out of Salalah, then up into the hills, about an hour with the track.",
      "[YOUR ROUTE, which turnoff, and where 2WD must stop.]",
      "The last stretch is rough track: 4×4, or park and walk it.",
      "Khareef only. Any other month there is no waterfall."
    ],
    whatYoullDo: [
      "[WHAT'S ACTUALLY THERE at peak, pool size, spray, the fog.]",
      "The fall comes off the green cliff into a shallow pool, mist, cows, silence.",
      "Give it a slow hour once you're there."
    ],
    tips: [
      "[Peak flow late Jul–Aug, confirm the week before recommending.]",
      "Track gets slick in drizzle, drive it in daylight.",
      "No swimming."
    ],
    guideNote: "First-timers in khareef fog: easier with someone who knows the track."
  },
  "tawi-atair": {
    gettingThere: [
      "Taqah plateau road, ~45 min from Salalah via Taqah town.",
      "Paved to the village; signposted parking.",
      "10–15 min on foot to the rim viewpoints."
    ],
    whatYoullDo: [
      "[YOUR VANTAGE POINT, where the scale actually reads.]",
      "Stand on the rim of a 211m sinkhole, the far wall is a city block away.",
      "Listen: the birds nesting in the walls give the place its name.",
      "In khareef the whole plateau around it is green pasture."
    ],
    tips: [
      "[The best viewpoint is __, the first platform undersells it.]",
      "Uneven rim path, proper shoes, hold the kids' hands.",
      "Pair with Teeq Cave next door; together they're a half-day from Salalah."
    ],
    guideNote: ""
  },
  "teeq-cave": {
    gettingThere: [
      "Minutes from Tawi Atair on the plateau road, do them together.",
      "Any car to the parking; short walks to the overlooks.",
      "Unfenced edges, park and walk carefully."
    ],
    whatYoullDo: [
      "[YOUR SPOT, where you stand for the full valley shot.]",
      "Look down the length of Wadi Darbat, lake, falls, camels, all from above.",
      "The cave mouth itself is huge; the view is the reason you came."
    ],
    tips: [
      "[Morning vs afternoon light, confirm which works for the valley.]",
      "Fog can erase the view in khareef, if it's socked in, wait 20 minutes.",
      "Nothing sold up here: bring water."
    ],
    guideNote: ""
  },
  "food-fish-grills-dahariz": {
    gettingThere: [
      "[THE PLACE, name, and the landmark you find it by.]",
      "Near the fisheries harbour, east side of town.",
      "Lunchtime is the play, the morning catch is on the ice."
    ],
    whatYoullDo: [
      "[YOUR ORDER, the fish, the size, grilled or fried, which rice.]",
      "Pick the fish off the ice; it's weighed and priced by the kilo.",
      "Twenty minutes later it's on your table with rice and salad.",
      "Kingfish and tuna are the safe bets; ask what came in today."
    ],
    tips: [
      "[A fair per-kilo price is __, know it before you point.]",
      "Go at lunch, not dinner.",
      "Cash."
    ],
    guideNote: ""
  },
  "food-shawarma-salalah": {
    gettingThere: [
      "[THE SPOT, name and street.]",
      "Central Salalah; evenings only, the queue tells you you're there."
    ],
    whatYoullDo: [
      "[YOUR ORDER, and the sauce decision.]",
      "Order at the window, eat on the hood of the car like everyone else.",
      "This is the after-souq stop, not a restaurant."
    ],
    tips: [
      "[Peak queue is __ pm, go before or embrace it.]",
      "A full meal costs pocket change, bring small notes."
    ],
    guideNote: ""
  },
  "food-dhofari-halwa": {
    gettingThere: [
      "[THE SHOP, name and area.]",
      "Central Salalah. Go in the afternoon when fresh batches come out."
    ],
    whatYoullDo: [
      "[YOUR PICK, plain, saffron or nutty, and the tub size that makes sense.]",
      "Every shop offers tastes, take them up on it.",
      "Watch it being turned in the copper pot if the timing's right, halwa is a spectator sport.",
      "Sealed tubs travel fine in checked luggage."
    ],
    tips: [
      "[A fair price per small tub is __.]",
      "Dhofari halwa is darker and smokier than the Muscat style, that's the local pride.",
      "It keeps for weeks unrefrigerated."
    ],
    guideNote: ""
  },
  "shop-frankincense-guide": {
    gettingThere: [
      "The Haffa souq, by the beach, evenings are when it comes alive.",
      "[YOUR STALLS, the two or three you actually trust.]"
    ],
    whatYoullDo: [
      "Learn the grades first: Hojari (the pale green-white premium, from the eastern mountains), Najdi, then Shaabi, the everyday grade.",
      "[WHAT TO PAY, rough per-100g price for each grade, updated seasonally.]",
      "Check what you're sold: big, pale, translucent tears = better. Dusty brown crumble = burner fuel, price it accordingly.",
      "Buy a clay burner (mabkhara) + charcoal discs with it, the whole kit is the gift.",
      "Smell before you buy: good hojari is citrus-pine, not just 'smoky'."
    ],
    tips: [
      "[The stall I use is __, say hello from me.]",
      "Prices are negotiable but not theatrical, 10–20% movement, not half.",
      "Airport shops sell the same tubs at multiples of the souq price. Buy in Haffa.",
      "Vacuum-sealed bags survive customs sniffer dogs' attention better, declare if asked, it's legal everywhere."
    ],
    guideNote: ""
  },

  /* ═════════════════════════════════════════════════════════ EXPERIENCES */
  "daymaniyat": {
    gettingThere: [
      "Tours leave from Seeb Marina, 30 min from central Muscat.",
      "Then 30 min by boat out to the reserve.",
      "Morning trips run about 8:30am–12:30pm; afternoon 1:30–5:30pm.",
      "Gear, life jackets, permits and snacks are usually included, confirm when you book."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, which reef, what you saw, how it compared to other snorkel spots.]",
      "[3–5 lines. This is the one people will buy the guide for.]"
    ],
    tips: [
      "[Book a couple of days ahead in peak season, trips fill up.]",
      "[Reef-safe sunscreen only. It's a protected marine reserve and they check.]",
      "[Take your own mask.]",
      "[Nov–Mar for visibility and turtles.]"
    ],
    guideNote: "Boat tour only. Researched candidates: Daymaniyat Tours, Muscat Sea Adventure, Mola Mola Diving Center, Cruiseboat Oman. Use the one you've actually been out with: [operator]."
  },

  "wahiba-sands": {
    gettingThere: [
      "2.5–3 hrs from Muscat via Highway 15 to Al Wasil. Smooth tarmac the whole way.",
      "Most camps send a 4×4 to meet you at the edge of the sand, or collect you from Muscat directly.",
      "Arrange that when you book. Don't drive into the dunes yourself.",
      "Nearly every camp offers dune bashing, camel rides and a sunset dune session."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, the camp, the dune-bashing, the night sky, the morning. 3–5 lines.]"
    ],
    tips: [
      "[Go Oct–Mar. Summer in the desert is genuinely dangerous heat.]",
      "[Ask for a camp away from the main road, that's the difference between stars and no stars.]",
      "[It gets cold at night. Nobody believes me, and everybody regrets it.]"
    ],
    guideNote: "Pick a camp. Researched candidates: Oman Wahiba Sands Desert Tours, Magic Camps, Zahara Tours, Sunshine Tours. I stay at [camp name]."
  },

  /* ═══════════════════════════════════════════════════════════ MOUNTAINS */
  "balad-sayt": {
    gettingThere: [
      "Two ways in, both 4×4.",
      "Option 1, over the Sharaf Al Alamayn pass from Al Hamra. The spectacular way.",
      "Option 2, up Wadi Bani Awf from the Rustaq side. The long way, past Snake Gorge.",
      "Either way it's a real graded mountain road: confident driving, low gear, and never in rain.",
      "Park at the village edge and walk in."
    ],
    whatYoullDo: [
      "[YOUR ROUTE, where you stop for THE photo, and how you've seen tourists get it wrong.]",
      "Green terraces below, mud-brick houses above, mountains all the way round.",
      "Wander the lanes quietly. People live here, dress modestly, ask before photographing anyone.",
      "Climb to the track above the football pitch for the classic panorama.",
      "Late afternoon is when that shot works."
    ],
    tips: [
      "[The famous shot is from the track above the village, late afternoon.]",
      "[Combine into a loop: Al Hamra → Sharaf Al Alamayn → Balad Sayt → Snake Gorge viewpoint → Rustaq.]"
    ],
    guideNote: "If the mountain road worries you, a guide-driver turns a white-knuckle day into a great one. [Guide name] does this loop well."
  },

  "sharaf-al-alamayn": {
    gettingThere: [
      "From Al Hamra: paved road climbs to the pass, tarmac ends near the top. About 45 min.",
      "From the Bani Awf side: graded track the whole way up.",
      "4×4 either way.",
      "The viewpoint is at the crest, park and walk the rim."
    ],
    whatYoullDo: [
      "[YOUR TAKE, sunset ritual, where you set up.]",
      "Stand on the rim at 2,000m with the western Hajar collapsing away beneath you.",
      "Ridgelines to the horizon; Wadi Bani Awf's villages tiny below.",
      "Sunset turns the whole range copper. Bring a flask and stay past the colour.",
      "Then drive down in the last light, carefully."
    ],
    tips: [
      "[Single digits up here after sunset, even in May.]",
      "[The W9 trail to Balad Sayt starts near the pass, a serious, brilliant day hike if you arrange a pickup below.]",
      "[On a full moon you can walk the rim without a torch.]"
    ],
    guideNote: ""
  },

  "musandam-dhow": {
    gettingThere: [
      "Khasab is the base.",
      "Either fly there, or drive up through the UAE, which means border crossings, so check your visa situation carefully.",
      "Treat it as a separate trip, not a day out of Muscat."
    ],
    whatYoullDo: [
      "[YOUR TAKE, which operator, what you saw.]",
      "A traditional dhow motors out into the khors, fjords, effectively.",
      "Limestone walls drop straight into deep blue water.",
      "Dolphins usually ride the bow on the way out.",
      "The boat anchors for swimming and snorkelling at spots you cannot reach by land.",
      "Lunch is served on deck."
    ],
    tips: [
      "[Half-day is enough for most people; full-day if you want the far khors.]",
      "[Take the motion-sickness tablet BEFORE you board if you're prone. Too late once you're out there.]",
      "[No shade on deck for long stretches, cover up properly.]"
    ],
    guideNote: "Dhow operators run from Khasab harbour, book ahead in peak season. [Operator]."
  },

  /* ════════════════════════════════════════════════════════════════ FOOD */
  "cafe-azura": {
    whatYoullDo: [
      "[Your order, and which beans you take home.]",
      "Specialty café and roastery.",
      "Ask what came off the roaster this week."
    ],
    tips: ["[Buy beans, not just a cup.]"],
    guideNote: ""
  },
  "cafe-farah": {
    whatYoullDo: [
      "[Your take.]",
      "Right on Azaiba Beach.",
      "The view is doing a lot of the work, and that's fine.",
      "This is the sunset coffee, not the serious one."
    ],
    tips: [],
    guideNote: ""
  },
  "food-kargeen": {
    whatYoullDo: [
      "[Your order.]",
      "Lantern-lit courtyards and outside tables.",
      "Order the mashuai, kingfish over rice.",
      "Start with the Omani bread and dips."
    ],
    tips: ["[Book at the weekend.]", "[Sit outside. Always outside.]"],
    guideNote: ""
  },
  "food-bin-ateeq": {
    whatYoullDo: [
      "[Your order.]",
      "Curtained rooms, cushions on the floor, no ceremony."
    ],
    tips: ["[Eat with your right hand, the left one is rude here.]"],
    guideNote: ""
  },
  "food-halwa": {
    whatYoullDo: [
      "[Which stall, specifically.]",
      "Watch it stirred in the copper pot.",
      "Rosewater, saffron, cardamom, nuts, and about an hour of someone's shoulder.",
      "Taste before you buy."
    ],
    tips: ["[The quality swings wildly between stalls.]", "[Buy from where they make it, not where they box it.]"],
    guideNote: ""
  },

  /* ═════════════════════════════════════════════════════════ ITINERARIES */
  "loop-7day": {
    days: [
      { title: "Day 1, Muscat", body: "Land, settle, then the Grand Mosque if you're early enough. Mutrah Corniche at dusk, into the souq, dinner at Bait Al Luban looking over the harbour. Stay: [__].", spots: ["grand-mosque","mutrah","food-bait-al-luban"] },
      { title: "Day 2, The coast: Bimmah + Wadi Shab", body: "Coffee, then east on the coast road. Sinkhole swim mid-morning (an hour, no more), Wadi Shab all afternoon, boat across, walk in, swim into the cave. Stay: [__] near Sur.", spots: ["bimmah-sinkhole","wadi-shab"] },
      { title: "Day 3, Turtles at Ras Al Jinz", body: "Sur in the day, the dhow yards are worth an hour, then the turtle tour at night. Book directly through the reserve in advance; numbers are capped (~OMR 3 entry + ~OMR 7 tour). Stay: [__].", spots: ["ras-al-jinz"] },
      { title: "Day 4, Wahiba Sands (desert night)", body: "Inland (~2.5–3 hrs, tarmac to Al Wasil then 4×4 into the dunes). The camp handles the dune bashing, the camels and the sunset ridge. Bring a warm layer for the night. Stay: [__] camp.", spots: ["wahiba-sands"] },
      { title: "Day 5, Wadi Bani Khalid & Nizwa", body: "Wadi Bani Khalid swim en route (easy, tarmac, free, walk 15 min upstream to lose the crowd), then on to Nizwa (~2 hrs) for the fort and the souq. Stay: [__].", spots: ["wadi-bani-khalid","nizwa"] },
      { title: "Day 6, Jabal Shams & Wadi Ghul", body: "The Balcony Walk on the rim (8.7km out-and-back, 4–5 hrs, W6 markers), then drop into Wadi Ghul below for the opposite view of the same canyon. Jacket, it's cold at 2,000m. Stay: [__] in the mountains.", spots: ["jabal-shams","wadi-ghul"] },
      { title: "Day 7, Misfat, Al Hoota & home", body: "Misfat Al Abriyeen in the morning light, Al Hoota Cave as the day heats up, then the easy run back to Muscat. Fly out. (Adventurous, and got a guide? Swap all of it for Snake Gorge.)", spots: ["misfat-al-abriyeen","al-hoota-cave","snake-gorge"] }
    ]
  },

  "adventure-5day": {
    days: [
      { title: "Day 1, Wadi Al Arbeieen", body: "Straight out of Muscat, no warm-up. Graded gravel through the pass, then 2+ hours of bouldering to the upper pools. Swim, eat, boulder back. This is the day that tells you whether the rest of the week is going to work. Stay: Muscat.", spots: ["wadi-al-arbeieen"] },
      { title: "Day 2, Wadi Shab, the proper way", body: "Early, be at the boat before the crowd. Walk in, swim the cave, then keep going where everyone else turns around. Afternoon: drive on and sleep near Tiwi. Stay: [__].", spots: ["wadi-shab","wadi-tiwi"] },
      { title: "Day 3, Wadi Mibam", body: "4×4 up through the date gardens to Mibam village, then down into the canyon. Emerald pools, high walls, nobody there. [Add your own route, which pool you stop at.] Stay: [__].", spots: ["wadi-mibam"] },
      { title: "Day 4, Wadi Hawer", body: "The full day. Remote, technical, and genuinely hard, go with a guide who knows the line. You'll be wet from morning to evening. Stay: [__].", spots: ["wadi-hawer"] },
      { title: "Day 5, Snake Gorge, then home", body: "Canyoning: rock pools, 3–4m cliff jumps, two ~20m abseils. Guide, ropes, helmets, no exceptions. Then the drive back to Muscat: allow 2.5 hrs and don't plan anything for the evening.", spots: ["snake-gorge"] }
    ]
  },

  /* ═══════════════════════════════════════════════════════════ SHOPPING */
  "shop-nizwa-souq": {
    gettingThere: [
      "Under Nizwa Fort, 1h45 from Muscat.",
      "Big free car park by the fort walls.",
      "Do the fort at the same time. They share a wall."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE.]",
      "Friday from 6:30am: the goat market. Farmers walk livestock around a circle of bidders, unchanged for centuries.",
      "Be there by 7am or it's over.",
      "Then the pottery hall.",
      "Then the silver souq for khanjars, and the date warehouses.",
      "Weekdays are calmer, but the goat circle only happens on Friday."
    ],
    tips: [
      "[What a fair price looks like for a khanjar / silver piece, and what's tourist-priced.]",
      "[Which pottery seller you trust.]",
      "[Where the locals drink karak around the souq.]"
    ],
    guideNote: ""
  },

  "shop-al-sharaa": {
    gettingThere: [
      "The Al Rusail branch is their biggest, just off the highway on the Seeb side.",
      "There's also the Seeb branch (the one in my reel) and one in Bahla for the Nizwa run.",
      "[Parking + the landmark you'd tell a friend to look for.]"
    ],
    whatYoullDo: [
      "Dates by the kilo, and the sesame tahini they're known for, that's the thing to walk out with.",
      "Date molasses, Omani coffee, spices, honey, stone-ground flours, the whole food-gift run in one stop.",
      "[YOUR PICKS, which dates, which tahini, what you actually take home.]"
    ],
    tips: [
      "They'll offer tastes, say yes.",
      "Do this stop on your last day: local prices, not airport prices, for the same gifts.",
      "[Roughly what a kilo of the good dates should cost.]"
    ],
    guideNote: ""
  },

  /* ── Jul 2026 additions, the castle circuit, new wadis, Salma ─────────── */
  "wadi-al-abyad": {
    gettingThere: [
      "Route 13 toward Nakhal, ~1 hr from Muscat, then the signed turn into the wadi.",
      "The wadi track is gravel with water crossings, 4×4 recommended; 2WD parks early and walks.",
      "[Where YOU park and how far you walk in.]"
    ],
    whatYoullDo: [
      "Walk the flat wadi bed between palms to the first milky-blue pools.",
      "[YOUR pool, which one is deep enough to swim, where the light hits.]",
      "The mineral tint is strongest in the still pools, goggles on, it glows."
    ],
    tips: [
      "[Weekends get local crowds by mid-morning, your timing advice.]",
      "Modest swimwear, this is a village wadi.",
      "Pair with Nakhal Fort and the hot spring, same road."
    ],
    guideNote: ""
  },
  "wadi-al-khoudh": {
    gettingThere: [
      "20–30 min from most of Muscat, head for Al Khoudh dam.",
      "2WD: park near the dam end and walk upstream. 4×4: drive the bed further in.",
      "[Your entry point, the gorge mouth pin.]"
    ],
    whatYoullDo: [
      "Boulder-hop up the narrowing gorge, smooth marble-like rock.",
      "[Which pools hold water year-round and where the jumps are safe.]",
      "Turn around whenever, even 40 minutes in feels far from the city."
    ],
    tips: [
      "NEVER after rain in the mountains, this wadi drains half the Hajar and floods fast.",
      "[Weekday evenings vs Friday crowds, your call.]",
      "Phone signal dies in the gorge, tell someone your plan."
    ],
    guideNote: ""
  },
  "salma-plateau": {
    gettingThere: [
      "The track climbs from near Fins/Tiwi on the coast, 2+ hrs of steep 4×4 switchbacks.",
      "[YOUR route up and the turnoffs, this is the part people get wrong.]",
      "Never solo: one vehicle failure up here is a serious problem."
    ],
    whatYoullDo: [
      "Cross the plateau, Bedouin stone villages, feral donkeys, total silence.",
      "Stand (carefully) near the 7th Hole rim, a sheer shaft dropping out of flat ground.",
      "Tahery Cave's entrance chamber is too big for a hand torch to light.",
      "[Where you camp and where sunset is best.]"
    ],
    tips: [
      "Guide required, the shafts are unfenced and the tracks unmarked.",
      "Cold at night year-round, bring real layers.",
      "Descending into any cave here is a rope-access expedition, not a walk."
    ],
    guideNote: "This is THE trip to do with someone who knows the plateau. [Guide name] runs it properly."
  },
  "jabrin-castle": {
    gettingThere: [
      "15 min from Bahla Fort, ~2h15 from Muscat.",
      "Any car, big parking at the site."
    ],
    whatYoullDo: [
      "Head for the painted ceilings, the sun-and-moon room is the famous one.",
      "Find the date store where the syrup channels run under the floor.",
      "[YOUR favourite room and the passage most people miss.]"
    ],
    tips: [
      "Do Bahla for scale first, Jabrin for detail second, that order.",
      "[Confirm hours, Fridays are short.]"
    ],
    guideNote: ""
  },
  "nakhal-fort": {
    gettingThere: [
      "Route 13, ~50 min from Muscat. Any car.",
      "The spring (Ain A'Thawwarah) is 5 min beyond the fort through the plantation."
    ],
    whatYoullDo: [
      "Climb to the gun towers, the fort is built ON the boulder, not beside it.",
      "Date-palm sea on one side, the Hajar wall on the other.",
      "Finish at the spring: warm water, small fish, families picnicking.",
      "[Your Friday-market note if it's running.]"
    ],
    tips: [
      "Morning light for the fort, late afternoon for the spring.",
      "Start of the loop: Nakhal → Rustaq → Al Hazm fits one day with lunch in Rustaq."
    ],
    guideNote: ""
  },
  "rustaq-fort": {
    gettingThere: [
      "Route 13 past Nakhal, ~1h30 from Muscat.",
      "Ain Al Kasfah spring is on the edge of town, 5 min from the fort."
    ],
    whatYoullDo: [
      "Four towers, a mosque and a small museum inside the walls.",
      "[What's actually open, restoration comes and goes; your current state note.]",
      "The spring runs genuinely hot (~45°C), locals bathe, you can too (dressed modestly)."
    ],
    tips: [
      "[Lunch in Rustaq, your spot.]",
      "Middle stop of the castle loop, don't linger too long if Al Hazm closes early."
    ],
    guideNote: ""
  },
  "al-hazm-castle": {
    gettingThere: [
      "20 min north of Rustaq toward the coast road. Any car."
    ],
    whatYoullDo: [
      "Follow the falaj, it runs straight through the castle, still flowing.",
      "Cannon rooms, escape tunnels, and walls built to absorb artillery.",
      "[The detail that stuck with you, this castle rewards slow walking.]"
    ],
    tips: [
      "Best-restored interior on the loop, save energy for it.",
      "[Confirm closing time, it decides your loop order.]"
    ],
    guideNote: ""
  },
  "bat-necropolis": {
    gettingThere: [
      "Off Route 21 near Ibri, ~2h45 from Muscat, or 20 min from Wadi Damm.",
      "For the photogenic row, skip Bat itself and go to the AL AYN tombs.",
      "Park by the village; 15–20 min walk up the ridge."
    ],
    whatYoullDo: [
      "Walk the ridgeline past 5,000-year-old beehive tombs, no fences, no queue, usually no one.",
      "Line the tombs up against Jabal Misht for THE photo at golden hour.",
      "[Your route up the ridge, the obvious line vs the easy line.]"
    ],
    tips: [
      "Don't climb on the tombs.",
      "Pair with Wadi Damm: swim, then sunset here."
    ],
    guideNote: ""
  },
  "al-mudhaireb": {
    gettingThere: [
      "Just off Route 23 before Al Mintirib and the sands, ~1h45 from Muscat.",
      "Park by the old quarter. Any car."
    ],
    whatYoullDo: [
      "Wander the restored merchant houses and watchtower hills.",
      "Follow the falaj through the date gardens.",
      "[The tower with the best view, your pick.]"
    ],
    tips: [
      "Perfect leg-stretch before your desert camp check-in.",
      "Late afternoon, towers, palms and long shadows."
    ],
    guideNote: ""
  },
  /* ── Camping (Jul 2026) ─────────────────────────────────────────────── */
  "ras-al-hadd-camp": {
    gettingThere: [
      "Sur road, then the Ras Al Hadd spur, ~3h15 from Muscat.",
      "Stock up in Sur or Ras Al Hadd town: water, firewood, fresh fish.",
      "[YOUR beach, which stretch you camp on and how you reach it.]"
    ],
    whatYoullDo: [
      "Camp above the tide line on the open beaches past town.",
      "Grill the fish you bought an hour earlier.",
      "Sunrise here is the first in the Arab world, set an alarm.",
      "[Pair with Ras Al Jinz turtle booking, evening or dawn slot?]"
    ],
    tips: [
      "Red-light torches only near the turtle beaches, white light disorients nesting turtles.",
      "Never camp ON a turtle beach, the reserve signs mark them.",
      "Wind shifts onshore at night; door away from the sea.",
      "[Your tide/wind reading for this coast.]"
    ],
    guideNote: ""
  },
  "jabal-shams-camp": {
    gettingThere: [
      "Al Hamra → the Jabal Shams road, ~3h from Muscat, last stretch graded track.",
      "[YOUR camp area near the rim, flat, wind-sheltered, a safe margin from the edge.]",
      "Arrive with 2 hrs of light to pitch and cook warm."
    ],
    whatYoullDo: [
      "Sunset over Wadi Ghul from your chair.",
      "No light pollution: the Milky Way is visible with the naked eye.",
      "Dawn on the canyon rim, then the Balcony Walk before the day-trippers arrive.",
      "[Your cold-night kit list, what people always underestimate.]"
    ],
    tips: [
      "Camp WELL back from the rim, wind gusts here are real.",
      "It can approach freezing most of the year at 2,000m. Pack like it."
    ],
    guideNote: ""
  },
  "jabal-akhdar-camp": {
    gettingThere: [
      "Birkat Al Mouz checkpoint (4×4 enforced) → the Saiq plateau, ~2h30 from Muscat.",
      "[YOUR clearing, the juniper spots you actually use.]",
      "Buy firewood and supplies before the climb."
    ],
    whatYoullDo: [
      "Cool-air camping while the coast melts, 15–20° cooler than Muscat.",
      "Sunrise over the terraces; April adds the rose harvest.",
      "[Your morning circuit: villages, viewpoints, coffee.]"
    ],
    tips: [
      "Respect farm walls and water channels, camp on open ground only.",
      "Weekend nights get busy near the hotels; go one track further.",
      "[The one clearing to avoid and why.]"
    ],
    guideNote: ""
  },
  "sugar-dunes": {
    gettingThere: [
      "Muscat → Sinaw → Mahout → Al Khaluf: ~4.5–5 hrs, last hour on sand.",
      "Deflate to ~15psi before the dunes; reinflate at Mahout on the way back.",
      "[YOUR line in, the safe approach vs the one that buries cars.]"
    ],
    whatYoullDo: [
      "White gypsum dunes straight into a turquoise sea, camp where they meet.",
      "Flamingos and wading birds in the khors (lagoons).",
      "Swim in the emptiest sea you'll ever have to yourself.",
      "[Where the firm sand runs and where it lies.]"
    ],
    tips: [
      "Two vehicles or a guide, recovery out here is a long, expensive tow.",
      "Double your water; there is nothing at Al Khaluf beyond the village shop.",
      "Check tides before camping low, the flats flood far and fast.",
      "[Best moon phase, full moon on white dunes is its own show.]"
    ],
    guideNote: "First time on serious sand? Go with someone who's done it. [Guide name] runs Sugar Dunes trips."
  },

  "fanja": {
    gettingThere: [
      "~30 min from Muscat off Route 15 toward Nizwa.",
      "Park by the old village; the path starts through the ruins.",
      "[The current safe line up, paths shift with rockfall.]"
    ],
    whatYoullDo: [
      "Climb through the abandoned mud-brick village first.",
      "Steep bursts to the tabletop rim, then it's flat, wide and silent.",
      "[Where you watch sunset from and how you time the descent.]"
    ],
    tips: [
      "Head torch mandatory for sunset missions, the descent in the dark is real.",
      "Respect the village, parts are fragile and parts are private."
    ],
    guideNote: ""
  },

  "shop-amouage": {
    gettingThere: [
      "Off the Muscat Expressway near Rusayl, 25 min from central Muscat.",
      "Free parking at the visitor centre."
    ],
    whatYoullDo: [
      "[YOUR TAKE, which scents you steer friends toward, whether the tour is worth booking.]",
      "The factory tour shows the production floor and the story of the house.",
      "The boutique carries the full range, with tester bars.",
      "Look for the editions that are hard to find abroad.",
      "Prices beat duty free, and are far better than Europe."
    ],
    tips: [
      "[Your scent shortlist, the two or three you'd tell a friend to smell first.]",
      "[Tour timing / whether to book ahead.]",
      "[The duty-free price comparison, so buyers know the saving.]"
    ],
    guideNote: ""
  }
};

if (window.__onPremiumLoaded) window.__onPremiumLoaded();

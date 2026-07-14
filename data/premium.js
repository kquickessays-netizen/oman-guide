/* =============================================================================
   EXPLORING OMAN — PREMIUM CONTENT (paid tier)
   -----------------------------------------------------------------------------
   Only loaded after a licence key verifies. Keys = the `id` in content.js.

   Every [bracketed] line is researched filler or a prompt for you. THAT TEXT IS
   THE PRODUCT. A buyer can Google "how to get to Wadi Shab" — they cannot Google
   "which pool Hussain stops at". Replace the brackets before you sell.

   📝 FORMAT: no paragraphs. `gettingThere` is an ARRAY of short lines and renders
   as NUMBERED STEPS. `whatYoullDo` is an ARRAY and renders as BULLETS. Keep each
   line to one idea — this is read on a phone, in a car, at 6am. (A plain string
   still works, it just renders as one block of text. Don't.)

   ⚠️ SECURITY: this is a static site, so a determined person could fetch this
   file directly. Exactly as leaky as the PDF you already sell. To lock it
   properly, change ONE function: `loadPremium()` in js/unlock.js.
   ========================================================================== */

window.OMAN_PREMIUM = {

  /* ═══════════════════════════════════════════════════════════════ WADIS */
  "wadi-mibam": {
    gettingThere: [
      "Sharqiyah Highway from Muscat toward Sur — about 3.5 hrs.",
      "Turn off at Wadi Tiwi: 2km past Wadi Shab, at the second bridge.",
      "Follow the wadi road ~10km to Mibam village. 4×4 required — the last stretch is steep track through date gardens.",
      "Park at the village. Hike down about 15 min to the first waterfall."
    ],
    whatYoullDo: [
      "[REWRITE IN YOUR OWN VOICE — this is the core value of the product.]",
      "Drop from the village to the canyon floor: emerald pools framed by high rock walls.",
      "Swim and wade between 2–3 pools. Most people give it a couple of hours.",
      "How far you get depends entirely on water levels that week."
    ],
    tips: [
      "[Go on a weekday — weekends get busy.]",
      "[Water shoes — the rocks past the first pool are slippery.]",
      "[The best pool is __ — most people stop too early.]"
    ],
    guideNote: "Easier with someone who knows the way. I trust [Guide name] — tell them I sent you."
  },

  "wadi-al-arbeieen": {
    gettingThere: [
      "1h35 from Muscat. Turn off the highway toward Wadi Al Arbeieen.",
      "Take the mountain pass: ~10km of graded gravel, steep sections, water crossings.",
      "Take the 4×4. A sedan will make it on a good day and you'll hate every minute.",
      "Park near the village and start walking."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — which pools you stop at, how far you push, where the good jumps are.]",
      "The walk in is bouldering, not hiking — you hop and climb over giant white rocks.",
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
      "Head for Al Hamra / Al Ayn — roughly 2 hrs from Muscat via Nizwa.",
      "2WD: park ~500m out and walk the last 10 min. 4×4: you get a bit closer over the rocks and the stream.",
      "From the parking it's a 30–40 min walk up the canyon to the main pools."
    ],
    whatYoullDo: [
      "[YOUR ROUTE.]",
      "Azure pools and small waterfalls in a sheer-walled canyon, ferns growing out of the rock.",
      "Unusually for Oman, there's water in it all year.",
      "Walk past the first pool — it's the least impressive one and where everyone stops.",
      "Keep going into the canyon: a string of better pools, often empty."
    ],
    tips: [
      "[Don't wade in — sit on the edge and slide. The entry rocks are like ice.]",
      "[Walk past the first pool. That's the whole trick here.]",
      "[Nov–Mar for the best water levels.]"
    ],
    guideNote: ""
  },

  "wadi-tiwi": {
    gettingThere: [
      "2–2.5 hrs from Muscat, right next to Wadi Shab off Route 17.",
      "Drive the paved road ~10km into the wadi, through plantations and villages.",
      "It's steep and narrow — go slowly, this is someone's street.",
      "Continuing to Mibam? 4×4, mandatory."
    ],
    whatYoullDo: [
      "[REWRITE IN YOUR OWN VOICE.]",
      "The drive is the highlight: terraced plantations, cliffside villages.",
      "Park up and walk to the blue pools.",
      "Far fewer people than Wadi Shab, minutes away."
    ],
    tips: [
      "[Pair it with Wadi Shab in one day — they're minutes apart.]",
      "[The road is tight — mind the villagers, this is their street.]"
    ],
    guideNote: "I trust [Guide name] for the Tiwi + Shab combo."
  },

  "wadi-dayqah": {
    gettingThere: [
      "About an hour from Muscat via Quriyat. Tarmac the whole way, any car.",
      "Entry is roughly OMR 1 per visitor — bring cash.",
      "Open roughly 8am to 10pm."
    ],
    whatYoullDo: [
      "[YOUR TAKE — which activity is actually worth the money.]",
      "Oman's biggest dam, with an adventure park on the water.",
      "Kayaks, paddleboards, pedal boats, donut rides — pick one.",
      "Café at the top viewpoint.",
      "Swimming in the dam is restricted: this is a day ON the water, not in it."
    ],
    tips: [
      "[The best light on the dam wall is late afternoon.]",
      "[This is the one for family, kids, or anyone who's said no to a hike.]",
      "[Bring cash — card isn't reliable here.]"
    ],
    guideNote: "Boat and watersport hire on site (Husaak run the adventure park). Book ahead at weekends."
  },

  "wadi-tanuf": {
    gettingThere: [
      "30 min from Nizwa on Route 21, signposted to Tanuf.",
      "2WD reaches the ruins and the wadi mouth.",
      "The dirt track deeper in is rough — that part wants a 4×4."
    ],
    whatYoullDo: [
      "[YOUR ROUTE.]",
      "Start at the ruins of old Tanuf — bombed out in the 1950s and left standing.",
      "Walk up into the gorge: palm groves, falaj channels, turquoise pools under small waterfalls.",
      "Water's up? Swim. Water's down? Still one of the better short gorge walks in the country.",
      "Either way it's usually empty."
    ],
    tips: [
      "[Walk the ruins first, in the morning light, before the gorge.]",
      "[Water levels swing hard with the season — check before you commit to a swim day.]",
      "[Pairs perfectly with Al Hoota Cave and Misfat in one Nizwa day.]"
    ],
    guideNote: ""
  },

  "wadi-ghul": {
    gettingThere: [
      "Take the Ghul–Nakhar route below Jabal Shams — 2.5 hrs from Muscat via Nizwa.",
      "Pavement ends past Al Hajir and turns into rough track. 4×4, and a full tank.",
      "Most people only photograph this canyon from the rim at Jabal Shams. Come down into it too."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — how far up you drove, where you stopped, what it does to your sense of scale.]",
      "Drive up the canyon floor with 1,000m walls closing in on both sides.",
      "Stop the car. Get out and walk — that's when the scale lands.",
      "Stop at Ghul village on the way: half-abandoned, stacked up the hillside."
    ],
    tips: [
      "[The scale doesn't fit in a phone camera. Bring something wider, or a person for scale.]",
      "[Combine with the Balcony Walk on the rim — same mountain, opposite perspectives, one long day.]",
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
      "[YOUR ROUTE — the swims, the tricky sections, what makes it special.]",
      "[Be honest about the difficulty from your own experience. This section is the product.]"
    ],
    tips: [
      "[Start early — this is a full day.]",
      "[Strong shoes and real fitness needed.]",
      "[Don't go after rain — flash-flood country.]"
    ],
    guideNote: "Don't do this one alone. I went with [Guide name] and it made the day."
  },

  "snake-gorge": {
    gettingThere: [
      "Wadi Bani Awf area — 1.5 to 4 hrs from Muscat depending on the road you take (via Nakhal → Al Rustaq → Al Awabi).",
      "Mountain 4×4 road: high, narrow, exposed.",
      "Drive it yourself only if you're an experienced off-road driver. Otherwise go with a guide who drives too."
    ],
    whatYoullDo: [
      "[REWRITE IN YOUR OWN VOICE.]",
      "About 6 hours through the gorge — this is canyoning, not a casual swim.",
      "Rock pools and boulder scrambling the whole way.",
      "Cliff jumps of 3–4m, where your guide says and nowhere else.",
      "Two ~20m abseils in the upper section.",
      "You need real fitness and to be comfortable with heights and rappelling."
    ],
    tips: [
      "[Only jump where your guide says — depths change with every flood.]",
      "[Helmet + good shoes. This is canyoning.]",
      "[Never in or after rain. Ever.]"
    ],
    guideNote: "Non-negotiable: go with a guide. Book through [Guide name] — they bring the ropes and the helmets."
  },

  "wadi-as-suwayh": {
    gettingThere: [
      "Coast road past Sur — roughly 3 hrs from Muscat.",
      "2WD reaches the entrance.",
      "Walk in: 20–40 minutes."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — this one needs your first-hand notes more than any other in the guide.]",
      "[Water levels vary hugely and public info is thin. Your notes ARE the value here.]",
      "Palms, pools, a short walk in.",
      "The sea is a few minutes away — a wadi and a beach in one morning."
    ],
    tips: [
      "[Check water levels before committing — it can be dry.]",
      "[Bring everything. There is nothing out here.]"
    ],
    guideNote: "",
    needsFirstHand: true
  },

  "wadi-naqab": {
    gettingThere: [
      "Northern Hajar, in the Musandam region.",
      "A serious drive from Muscat — realistically a separate trip, not a day out.",
      "4×4 essential."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — and be blunt about who should and shouldn't attempt this.]",
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
      "The boat is the point — the good coves have no road to them."
    ],
    whatYoullDo: [
      "[YOUR TAKE — which cove, what you saw.]",
      "Snorkel the reef: rays, turtles, and a chance of dolphins on the way out.",
      "It's the best snorkelling this close to the city.",
      "Prefer it quiet? Kayak the coves and mangroves instead of taking a boat."
    ],
    tips: [
      "[Morning — the water is glassiest before the wind picks up.]",
      "[Bring your own mask. A leaking hire mask ruins the day.]",
      "[Reef-safe sunscreen, or a rash vest instead.]"
    ],
    guideNote: "Easiest by boat. Researched candidates: Mola Mola Diving Center, Coral Ocean Tours, Husaak Adventures (sunset kayak). Pick the one you've actually used: [operator]."
  },

  "ras-al-jinz": {
    gettingThere: [
      "3–3.5 hrs from Muscat — too far to do and come back in a night.",
      "Sleep at the reserve's eco-lodge or in Sur (rooms roughly OMR 75–100).",
      "In-house guests get the turtle viewing included.",
      "Tours run at dawn and at night. Book direct through the reserve — numbers are capped and it sells out."
    ],
    whatYoullDo: [
      "[YOUR TAKE — what you saw, what it felt like.]",
      "A ranger walks the group onto the beach in the dark.",
      "You watch green turtles haul up the sand and dig.",
      "Dawn tour: you often catch the hatchlings running for the sea instead."
    ],
    tips: [
      "[Book well ahead — they cap numbers and it sells out.]",
      "[No flash. Ever. It disorients them and they'll turn back to sea without laying.]",
      "[It's cold on that beach at night. Bring a jacket.]"
    ],
    guideNote: "Guided access only — book through the reserve directly."
  },

  "yiti-qantab": {
    gettingThere: [
      "Qantab: 20–25 min from central Muscat on the coastal road.",
      "Yiti: 30–45 min.",
      "Any car. This is the 'I've got three hours' option."
    ],
    whatYoullDo: [
      "[YOUR TAKE.]",
      "Swim.",
      "Walk the headland.",
      "Kayak, if you've brought one.",
      "Don't plan a day around it — plan an evening."
    ],
    tips: [
      "[Late afternoon — the cliffs go gold.]",
      "[Midweek it's basically empty.]"
    ],
    guideNote: ""
  },

  "as-sifah": {
    gettingThere: [
      "About an hour from Muscat via the Qantab–Yiti road — scenic, some rough sections.",
      "Or take the longer paved route if you're in a low car.",
      "Any car reaches the main beach. A 4×4 gets you to the emptier far ends."
    ],
    whatYoullDo: [
      "[YOUR TAKE — where exactly you camp, and how far along you drive to lose everyone else.]",
      "A long, wide, quiet stretch of sand with mountains behind it.",
      "Drive past the first bit — that's where everyone stops.",
      "Camp. It's one of the easiest wild nights you can have from Muscat."
    ],
    tips: [
      "[Drive past the first bit everyone stops at.]",
      "[Wild camping is legal — but take every scrap of rubbish out with you.]",
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
      "[YOUR TAKE — is the island boat worth it, and which island.]",
      "Clean sand, calm water, a cluster of protected islands offshore.",
      "The reef between the mainland and the islands is the reason to bother.",
      "The beach alone is nice, not remarkable. Take the boat.",
      "The islands are a seabird nesting site — stay off the nests."
    ],
    tips: [
      "[Negotiate the boat price before you get in.]",
      "[Take your own snorkel gear.]",
      "[Sunset from the beach, looking back at the islands, is the shot.]"
    ],
    guideNote: "Boat hire is arranged on the beach — agree the price and the return time up front."
  },

  /* ═════════════════════════════════════════════════════════════ SALALAH */
  "al-baleed": {
    gettingThere: [
      "On the Salalah waterfront, near the Hilton side of town. Any car, or an OTaxi.",
      "Entry is a few rials per car and includes the Museum of the Frankincense Land.",
      "It stays open into the evening — which is when you want to be there."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — museum first or ruins first, and why.]",
      "Do the museum first: the frankincense trade, the dhows, the ports. It's the story.",
      "Then walk (or take the buggy) around the excavated city of Zafar as the light drops.",
      "Watch the lagoon edge — herons, and flamingos in season.",
      "Stay for dusk: the ruins are lit and the temperature finally behaves."
    ],
    tips: [
      "[Evening. The site is lit, the museum is air-conditioned, and the midday heat is nobody's friend.]",
      "[The buggy is worth it with kids — the site is bigger than it looks.]",
      "[Pair with a sunset walk on Al Haffa beach and dinner nearby.]"
    ],
    guideNote: ""
  },

  "khor-rori": {
    gettingThere: [
      "35–40 min east of Salalah, signposted off the Taqah–Mirbat road, just past the Wadi Darbat turnoff.",
      "Paved to the gate, then a short dusty track up to the hilltop car park.",
      "A few rials per car."
    ],
    whatYoullDo: [
      "[YOUR ROUTE.]",
      "Walk the 2,000-year-old walls of Sumhuram, above the lagoon — the frankincense port that traded with Rome and India.",
      "Then drive down to the lagoon mouth.",
      "Flamingos and herons on the water; camels on the sand bar where the khor meets the sea.",
      "Come late afternoon — the light turns the whole thing gold."
    ],
    tips: [
      "[Combine Darbat + Khor Rori in one day — same road.]",
      "[The beach at the sand bar is one of the quietly great picnic spots in Dhofar.]",
      "[Weekdays: you'll have the ruins nearly alone.]"
    ],
    guideNote: ""
  },

  "jabal-samhan": {
    gettingThere: [
      "1.5 hrs east of Salalah: through Taqah and Mirbat.",
      "Then the switchback road up the plateau — paved the whole way, any car.",
      "Check your brakes before the descent. Seriously.",
      "On the way, stop at Tawi Atayr sinkhole and the baobab valley."
    ],
    whatYoullDo: [
      "[YOUR TAKE — sunrise or sunset, and where exactly you stand.]",
      "Park at the viewpoint and walk the rim.",
      "The escarpment drops the best part of a kilometre, straight to the coastal plain.",
      "On a clear day you can trace the shoreline all the way to Mirbat.",
      "This is the heart of the Arabian leopard reserve. You won't see one — the emptiness is the point."
    ],
    tips: [
      "[Avoid khareef for this one — the plateau sits inside the fog Jul–Aug and there is no view.]",
      "[It's windy and 10 degrees cooler up top. Jacket.]",
      "[Fuel up in Mirbat — stations are sparse on the mountain.]"
    ],
    guideNote: ""
  },

  "fazayah-beach": {
    gettingThere: [
      "West from Salalah, past Mughsail — 1.5 hrs in total.",
      "Climb the Sarfait switchbacks, then take the signed graded track that drops to the coves.",
      "The descent is the 4×4 part: low gear, no drama in the dry.",
      "There is nothing down there but sand and camels. Bring everything you need."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE — which cove, and what time the light works.]",
      "White-sand coves under pale cliffs, usually empty except for camels in the shallows.",
      "Outside khareef: swim, snorkel the rocky ends, stay for sunset.",
      "In khareef: the sea is dangerous. Go for the view, not the water.",
      "Walk one cove further than the first. That's where everyone stops."
    ],
    tips: [
      "[The first cove gets the (few) visitors — walk one further.]",
      "[No shade, no water, no signal in the coves. Plan like it's a mini-expedition.]",
      "[Sunset from the descent track, looking back down the coast, is the photograph.]"
    ],
    guideNote: ""
  },

  "wadi-dawkah": {
    gettingThere: [
      "45 min north of Salalah on the Thumrait road (Route 31).",
      "Signposted, paved, any car.",
      "It's on the way to the Empty Quarter — slot it into a desert day."
    ],
    whatYoullDo: [
      "[YOUR TAKE — why this ties the frankincense story together.]",
      "Walk among a couple of thousand wild Boswellia sacra trees in their own wadi.",
      "These are the groves that supplied Sumhuram and Al Baleed for two millennia.",
      "Look for the dried resin beads on the cut bark.",
      "Twenty minutes here and the museums finally make sense."
    ],
    tips: [
      "[Go early or late — the desert side of the mountains is hotter than Salalah.]",
      "[Buy your actual frankincense in Al Haffa souq afterwards, now you know what you're looking at.]",
      "[If you're pushing on to the Empty Quarter, this is the free warm-up act.]"
    ],
    guideNote: ""
  },

  "ayn-razat": {
    gettingThere: [
      "25 min northeast of Salalah. Paved, signposted, any car.",
      "Free parking by the gardens."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE.]",
      "The spring rises at the cliff base and feeds a falaj through ornamental gardens.",
      "This is where Salalah families picnic — go with it.",
      "Climb the steps to the small cave in the cliff for the view over the greenery.",
      "In khareef the hillside above runs green and the birdlife goes berserk."
    ],
    tips: [
      "[Mornings are quiet; Friday afternoons are the full family scene — pick your vibe.]",
      "[Combine with Ayn Athum and the other springs along the mountain base in khareef.]",
      "[No swimming in the spring — it feeds the irrigation channels.]"
    ],
    guideNote: ""
  },

  "taqah-castle": {
    gettingThere: [
      "35 min east of Salalah on the coast road, in the middle of Taqah town.",
      "Any car. Park by the square.",
      "It's 20 min short of Khor Rori — do them on the same run east."
    ],
    whatYoullDo: [
      "[YOUR TAKE — what stuck with you inside.]",
      "The restored wali's residence, laid out as it was actually lived in.",
      "The majlis, the women's rooms, the rifle slits covering the bay.",
      "Go up to the rooftop for the view along the Taqah coast.",
      "It's small — under an hour — and it's the best window into pre-1970 Dhofari life you'll get."
    ],
    tips: [
      "[Confirm opening days — small forts keep small hours, and Fridays are unreliable.]",
      "[Rooftop late afternoon for the light along the coast.]",
      "[Stack it: Taqah Castle → Khor Rori → Wadi Darbat is one natural day east.]"
    ],
    guideNote: ""
  },

  "ayn-athum": {
    gettingThere: [
      "25 min northeast of Salalah, at the foot of the mountains.",
      "Paved to the parking, any car.",
      "Signage is thin — follow the maps pin, not the road signs."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE — when you go and where you stand.]",
      "In khareef the spring becomes a waterfall off the green cliff, mist rolling through the trees.",
      "It's the Darbat scene without the tour buses.",
      "Outside the monsoon: a quiet pool and a shady walk.",
      "Ten minutes from Ayn Razat — see both in one morning."
    ],
    tips: [
      "[Peak flow late July–August; just after khareef it's still green and empty.]",
      "[Wet rock everywhere in season — grip matters more than it looks.]",
      "[No swimming — it feeds the falaj, same as Razat.]"
    ],
    guideNote: ""
  },

  /* ═════════════════════════════════════════════════════════ EXPERIENCES */
  "daymaniyat": {
    gettingThere: [
      "Tours leave from Seeb Marina — 30 min from central Muscat.",
      "Then 30 min by boat out to the reserve.",
      "Morning trips run about 8:30am–12:30pm; afternoon 1:30–5:30pm.",
      "Gear, life jackets, permits and snacks are usually included — confirm when you book."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — which reef, what you saw, how it compared to other snorkel spots.]",
      "[3–5 lines. This is the one people will buy the guide for.]"
    ],
    tips: [
      "[Book a couple of days ahead in peak season — trips fill up.]",
      "[Reef-safe sunscreen only. It's a protected marine reserve and they check.]",
      "[Take your own mask.]",
      "[Nov–Mar for visibility and turtles.]"
    ],
    guideNote: "Boat tour only. Researched candidates: Daymaniyat Tours, Muscat Sea Adventure, Mola Mola Diving Center, Cruiseboat Oman. Use the one you've actually been out with: [operator]."
  },

  "wahiba-sands": {
    gettingThere: [
      "2.5–3 hrs from Muscat via Highway 15 to Al Wasil. Smooth tarmac the whole way.",
      "Most camps send a 4×4 to meet you at the edge of the sand — or collect you from Muscat directly.",
      "Arrange that when you book. Don't drive into the dunes yourself.",
      "Nearly every camp offers dune bashing, camel rides and a sunset dune session."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — the camp, the dune-bashing, the night sky, the morning. 3–5 lines.]"
    ],
    tips: [
      "[Go Oct–Mar. Summer in the desert is genuinely dangerous heat.]",
      "[Ask for a camp away from the main road — that's the difference between stars and no stars.]",
      "[It gets cold at night. Nobody believes me, and everybody regrets it.]"
    ],
    guideNote: "Pick a camp. Researched candidates: Oman Wahiba Sands Desert Tours, Magic Camps, Zahara Tours, Sunshine Tours. I stay at [camp name]."
  },

  /* ═══════════════════════════════════════════════════════════ MOUNTAINS */
  "balad-sayt": {
    gettingThere: [
      "Two ways in, both 4×4.",
      "Option 1 — over the Sharaf Al Alamayn pass from Al Hamra. The spectacular way.",
      "Option 2 — up Wadi Bani Awf from the Rustaq side. The long way, past Snake Gorge.",
      "Either way it's a real graded mountain road: confident driving, low gear, and never in rain.",
      "Park at the village edge and walk in."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — where you stop for THE photo, and how you've seen tourists get it wrong.]",
      "The village sits in a natural amphitheatre: green terraces below, mud-brick houses above, mountains sealing it in.",
      "Wander the lanes quietly. People live here — dress modestly, ask before photographing anyone.",
      "Climb to the track above the football pitch for the classic panorama.",
      "Late afternoon is when that shot works."
    ],
    tips: [
      "[The famous shot is from the track above the village, late afternoon.]",
      "[Combine into a loop: Al Hamra → Sharaf Al Alamayn → Balad Sayt → Snake Gorge viewpoint → Rustaq.]",
      "[This is a conservative village that has been very patient with Instagram. Be the visitor that keeps it that way.]"
    ],
    guideNote: "If the mountain road worries you, a guide-driver turns a white-knuckle day into a great one. [Guide name] does this loop well."
  },

  "sharaf-al-alamayn": {
    gettingThere: [
      "From Al Hamra: paved road climbs to the pass, tarmac ends near the top. About 45 min.",
      "From the Bani Awf side: graded track the whole way up.",
      "4×4 either way.",
      "The viewpoint is at the crest — park and walk the rim."
    ],
    whatYoullDo: [
      "[YOUR TAKE — sunset ritual, where you set up.]",
      "Stand on the rim at 2,000m with the western Hajar collapsing away beneath you.",
      "Ridgelines to the horizon; Wadi Bani Awf's villages tiny below.",
      "Sunset turns the whole range copper. Bring a flask and stay past the colour.",
      "Then drive down in the last light — carefully."
    ],
    tips: [
      "[It is COLD up here after sunset, even in May. Nobody believes it.]",
      "[The W9 trail to Balad Sayt starts near the pass — a serious, brilliant day hike if you arrange a pickup below.]",
      "[Full moon nights up here are something else entirely.]"
    ],
    guideNote: ""
  },

  "nizwa": {
    gettingThere: [
      "1.5–2 hrs from Muscat via Route 15. Easy paved drive, any car.",
      "Fort and souq are a few minutes' walk apart in the centre.",
      "Pair it with Jabal Akhdar, Al Hoota or Misfat — all on the same road inland."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — the fort tower, the souq stalls, the Friday goat market if you time it.]",
      "Climb the fort tower for the view over the date palms.",
      "Then walk the souq: silver, dates, pottery, spices.",
      "Friday at 7am: the livestock souq. Get there early — it's over by 9."
    ],
    tips: [
      "[Friday, ~7am, for the livestock souq. It's the real spectacle and it's over by 9.]",
      "[The fort tower bakes at midday. Early or late.]",
      "[Buy dates here, not at the airport.]"
    ],
    guideNote: ""
  },

  "misfat-al-abriyeen": {
    gettingThere: [
      "2 hrs from Muscat, 30 min from Nizwa. Any car.",
      "Park outside the village.",
      "Walk in — cars aren't allowed through the old alleys."
    ],
    whatYoullDo: [
      "[YOUR TAKE — and where you'd sit for the view.]",
      "Walk down through the mud-brick alleys with the falaj running beside your feet.",
      "Come out into the terraced gardens below: date palms, bananas, mangoes.",
      "It takes an hour. You'll want two.",
      "Village guesthouses will put you up for the night — that's the way to do it."
    ],
    tips: [
      "[Late afternoon light on the terraces is the whole reason to come.]",
      "[People live here. Don't photograph doorways and windows without asking.]",
      "[Stay the night — the village empties after 5pm and it's a different place.]"
    ],
    guideNote: ""
  },

  "al-hoota-cave": {
    gettingThere: [
      "At the foot of Jabal Shams near Al Hamra — 2 hrs from Muscat. Any car, proper parking.",
      "Entry is roughly OMR 7 for adult foreign visitors, OMR 3.5 for children.",
      "Slots are timed and they sell out. Book, or turn up early."
    ],
    whatYoullDo: [
      "[YOUR TAKE.]",
      "A little electric train takes you into the mountain.",
      "You walk the lit 500m section: stalactites, a subterranean lake.",
      "Look for the blind cave fish — they live nowhere else on earth.",
      "Two million years old, and the only show cave on the Arabian Peninsula."
    ],
    tips: [
      "[Slots are timed and they do sell out. Book, or turn up early.]",
      "[The perfect midday stop on a hot Nizwa day — you're underground while the sun is at its worst.]",
      "[It closes some days. Check before you drive out there.]"
    ],
    guideNote: ""
  },

  "jabal-akhdar": {
    gettingThere: [
      "2 hrs from Muscat.",
      "There's a police checkpoint at the bottom of the mountain road.",
      "They WILL turn you back in a 2WD. This isn't a suggestion, it's enforced.",
      "4×4 only. No exceptions."
    ],
    whatYoullDo: [
      "[YOUR ROUTE — which village loop you'd walk.]",
      "Walk the terraced-village loop: Al Ayn → Ash Shirayjah → Al Aqr.",
      "The paths run down through rose terraces and pomegranate orchards, with the canyon opening below.",
      "Two to three hours. One of the best easy hikes in the country."
    ],
    tips: [
      "[4×4 or you don't get up the mountain. The checkpoint is real.]",
      "[Mar–Apr for the rose harvest and the rosewater distilleries.]",
      "[It's cold up there in the evening. Bring a layer.]"
    ],
    guideNote: ""
  },

  "musandam-dhow": {
    gettingThere: [
      "Khasab is the base.",
      "Either fly there, or drive up through the UAE — which means border crossings, so check your visa situation carefully.",
      "Treat it as a separate trip, not a day out of Muscat."
    ],
    whatYoullDo: [
      "[YOUR TAKE — which operator, what you saw.]",
      "A traditional dhow motors out into the khors — fjords, effectively.",
      "Limestone walls drop straight into deep blue water.",
      "Dolphins usually ride the bow on the way out.",
      "The boat anchors for swimming and snorkelling at spots you cannot reach by land.",
      "Lunch is served on deck."
    ],
    tips: [
      "[Half-day is enough for most people; full-day if you want the far khors.]",
      "[Take the motion-sickness tablet BEFORE you board if you're prone. Too late once you're out there.]",
      "[No shade on deck for long stretches — cover up properly.]"
    ],
    guideNote: "Dhow operators run from Khasab harbour — book ahead in peak season. [Operator]."
  },

  /* ════════════════════════════════════════════════════════════════ FOOD */
  "cafe-qaha": {
    whatYoullDo: [
      "[Your order.]",
      "Omani coffee culture with a modern room around it.",
      "White, blue, calm, unhurried. Nobody is rushing you out."
    ],
    tips: ["[Your go-to order.]"],
    guideNote: ""
  },
  "cafe-azura": {
    whatYoullDo: [
      "[Your order — and which beans you take home.]",
      "Specialty café and roastery.",
      "This is the one the coffee people send you to."
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
    tips: ["[Go for the sunset, not for the coffee.]"],
    guideNote: ""
  },
  "food-kargeen": {
    whatYoullDo: [
      "[Your order.]",
      "Lantern-lit courtyards and outside tables.",
      "Order the mashuai — kingfish over rice.",
      "Start with the Omani bread and dips."
    ],
    tips: ["[Book at the weekend.]", "[Sit outside. Always outside.]"],
    guideNote: ""
  },
  "food-bin-ateeq": {
    whatYoullDo: [
      "[Your order.]",
      "Curtained rooms, cushions on the floor, no ceremony.",
      "The closest a restaurant gets to eating in an Omani house."
    ],
    tips: ["[Eat with your right hand. It tastes better, and it's polite.]"],
    guideNote: ""
  },
  "food-halwa": {
    whatYoullDo: [
      "[Which stall, specifically.]",
      "Watch it stirred in the copper pot.",
      "Rosewater, saffron, cardamom, nuts — and about an hour of someone's shoulder.",
      "Taste before you buy."
    ],
    tips: ["[Ask for a taste first. The quality swings wildly between stalls.]", "[Buy from where they make it, not where they box it.]"],
    guideNote: ""
  },

  /* ═════════════════════════════════════════════════════════ ITINERARIES */
  "loop-7day": {
    days: [
      { title: "Day 1 — Muscat", body: "Land, settle, then the Grand Mosque if you're early enough. Mutrah Corniche at dusk, into the souq, dinner at Bait Al Luban looking over the harbour. Stay: [__].", spots: ["grand-mosque","mutrah","food-bait-al-luban"] },
      { title: "Day 2 — The coast: Bimmah + Wadi Shab", body: "Coffee, then east on the coast road. Sinkhole swim mid-morning (an hour, no more), Wadi Shab all afternoon — boat across, walk in, swim into the cave. Stay: [__] near Sur.", spots: ["bimmah-sinkhole","wadi-shab"] },
      { title: "Day 3 — Turtles at Ras Al Jinz", body: "Sur in the day — the dhow yards are worth an hour — then the turtle tour at night. Book directly through the reserve in advance; numbers are capped (~OMR 3 entry + ~OMR 7 tour). Stay: [__].", spots: ["ras-al-jinz"] },
      { title: "Day 4 — Wahiba Sands (desert night)", body: "Inland (~2.5–3 hrs, tarmac to Al Wasil then 4×4 into the dunes). The camp handles the dune bashing, the camels and the sunset ridge. Bring a warm layer — nobody believes me until they're cold. Stay: [__] camp.", spots: ["wahiba-sands"] },
      { title: "Day 5 — Wadi Bani Khalid & Nizwa", body: "Wadi Bani Khalid swim en route (easy, tarmac, free — walk 15 min upstream to lose the crowd), then on to Nizwa (~2 hrs) for the fort and the souq. Stay: [__].", spots: ["wadi-bani-khalid","nizwa"] },
      { title: "Day 6 — Jabal Shams & Wadi Ghul", body: "The Balcony Walk on the rim (8.7km out-and-back, 4–5 hrs, W6 markers), then drop into Wadi Ghul below for the opposite view of the same canyon. Jacket — it's cold at 2,000m. Stay: [__] in the mountains.", spots: ["jabal-shams","wadi-ghul"] },
      { title: "Day 7 — Misfat, Al Hoota & home", body: "Misfat Al Abriyeen in the morning light, Al Hoota Cave as the day heats up, then the easy run back to Muscat. Fly out. (Adventurous, and got a guide? Swap all of it for Snake Gorge.)", spots: ["misfat-al-abriyeen","al-hoota-cave","snake-gorge"] }
    ]
  },

  "adventure-5day": {
    days: [
      { title: "Day 1 — Wadi Al Arbeieen", body: "Straight out of Muscat, no warm-up. Graded gravel through the pass, then 2+ hours of bouldering to the upper pools. Swim, eat, boulder back. This is the day that tells you whether the rest of the week is going to work. Stay: Muscat.", spots: ["wadi-al-arbeieen"] },
      { title: "Day 2 — Wadi Shab, the proper way", body: "Early — be at the boat before the crowd. Walk in, swim the cave, then keep going where everyone else turns around. Afternoon: drive on and sleep near Tiwi. Stay: [__].", spots: ["wadi-shab","wadi-tiwi"] },
      { title: "Day 3 — Wadi Mibam", body: "4×4 up through the date gardens to Mibam village, then down into the canyon. Emerald pools, high walls, nobody there. [Add your own route — which pool you stop at.] Stay: [__].", spots: ["wadi-mibam"] },
      { title: "Day 4 — Wadi Hawer", body: "The full day. Remote, technical, and genuinely hard — go with a guide who knows the line. You'll be wet from morning to evening. Stay: [__].", spots: ["wadi-hawer"] },
      { title: "Day 5 — Snake Gorge, then home", body: "Canyoning: rock pools, 3–4m cliff jumps, two ~20m abseils. Guide, ropes, helmets, no exceptions. Then the drive back to Muscat with nothing left in the tank. Perfect.", spots: ["snake-gorge"] }
    ]
  },

  /* ═══════════════════════════════════════════════════════════ SHOPPING */
  "shop-seeb-souq": {
    gettingThere: [
      "On the Seeb corniche — 25 min from central Muscat.",
      "Park along the waterfront.",
      "The souq runs back from the fish market."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE — when you go, what you buy, which corner has the good dates.]",
      "Start at the fish market early — the auction is loud, fast and completely real.",
      "Then the covered lanes: dates by the kilo at half the tourist-shop price.",
      "Kummas, abayas, household stalls.",
      "This is shopping the way Muscat actually does it."
    ],
    tips: [
      "[Which dates stall you buy from, and what a fair per-kilo price is.]",
      "[Fish market timing — what hour the auction peaks.]",
      "[Where you get breakfast after.]"
    ],
    guideNote: ""
  },

  "shop-nizwa-souq": {
    gettingThere: [
      "Under Nizwa Fort — 1h45 from Muscat.",
      "Big free car park by the fort walls.",
      "Do the fort at the same time. They share a wall."
    ],
    whatYoullDo: [
      "[YOUR ROUTINE.]",
      "Friday from 6:30am: the goat market. Farmers walk livestock around a circle of bidders, unchanged for centuries.",
      "Be there by 7am or it's over.",
      "Then the pottery hall.",
      "Then the silver souq for khanjars, and the date warehouses.",
      "Weekdays are calmer — but the goat circle only happens on Friday."
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
      "[Where it is.]",
      "[How to find it — the landmark you'd tell a friend to look for.]",
      "[Parking.]"
    ],
    whatYoullDo: [
      "[THE WHOLE WRITE-UP IS YOURS — what Al Sharaa sells, why you send people there, what to walk out with.]",
      "[This is exactly the only-you-know content people pay for. Four or five lines.]"
    ],
    tips: [
      "[Best time to go.]",
      "[What to buy and roughly what it should cost.]"
    ],
    guideNote: ""
  },

  "shop-amouage": {
    gettingThere: [
      "Off the Muscat Expressway near Rusayl — 25 min from central Muscat.",
      "Free parking at the visitor centre."
    ],
    whatYoullDo: [
      "[YOUR TAKE — which scents you steer friends toward, whether the tour is worth booking.]",
      "The factory tour shows the production floor and the story of the house.",
      "The boutique carries the full range, with tester bars.",
      "Look for the editions that are hard to find abroad.",
      "Prices beat duty free, and are far better than Europe."
    ],
    tips: [
      "[Your scent shortlist — the two or three you'd tell a friend to smell first.]",
      "[Tour timing / whether to book ahead.]",
      "[The duty-free price comparison, so buyers know the saving.]"
    ],
    guideNote: ""
  }
};

if (window.__onPremiumLoaded) window.__onPremiumLoaded();

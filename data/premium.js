/* =============================================================================
   EXPLORING OMAN — PREMIUM CONTENT (paid tier)
   -----------------------------------------------------------------------------
   Only loaded after a licence key verifies. Keys = the `id` in content.js.

   Every [bracketed] line is researched filler or a prompt for you. THAT TEXT IS
   THE PRODUCT. A buyer can Google "how to get to Wadi Shab" — they cannot Google
   "which pool Hussain stops at". Replace the brackets before you sell.

   ⚠️ SECURITY: this is a static site, so a determined person could fetch this
   file directly. Exactly as leaky as the PDF you already sell. To lock it
   properly, change ONE function: `loadPremium()` in js/unlock.js.
   ========================================================================== */

window.OMAN_PREMIUM = {

  /* ═══════════════════════════════════════════════════════════════ WADIS */
  "wadi-mibam": {
    gettingThere: "From Muscat ~3.5 hrs via the Sharqiyah Highway toward Sur, turning off at Wadi Tiwi (2km past Wadi Shab / the second bridge), then ~10km further to Mibam village. A 4×4 is required — the last stretch is steep track through date gardens. Park at Mibam village; it's roughly a 15-minute hike down to the first waterfall.",
    whatYoullDo: "[REWRITE IN YOUR OWN VOICE — this is the core value of the product.] From the village the trail drops toward the canyon floor to a series of emerald pools framed by high rock walls. Most visitors swim and wade between 2–3 pools over a couple of hours; how far you go depends on water levels.",
    tips: [
      "[Go on a weekday — weekends get busy.]",
      "[Water shoes — the rocks past the first pool are slippery.]",
      "[The best pool is __ — most people stop too early.]"
    ],
    guideNote: "Easier with someone who knows the way. I trust [Guide name] — tell them I sent you."
  },

  "wadi-al-arbeieen": {
    gettingThere: "~1h35 from Muscat. Turn off the highway toward Wadi Al Arbeieen and take the mountain pass — around 10km of graded gravel with steep sections and water crossings. The road has been improved, but a sedan will struggle and you'll be nervous the whole way. Take the 4×4. Park near the village.",
    whatYoullDo: "[YOUR ROUTE — which pools you stop at, how far you push, where the good jumps are.] The walk in is bouldering, not hiking: you hop and climb over giant white rocks for two-plus hours. The pools get bigger, deeper and emptier the further you go, and the last ones are usually yours alone. Most people turn around at the first decent pool — that's the mistake.",
    tips: [
      "[Give it 5–6 hours of daylight if you want the top pools and back.]",
      "[Shoes with drainage AND grip. This is the wadi that punishes bad footwear.]",
      "[Go on a weekday and you may not see another person all day.]",
      "[Flash-flood country. Grey sky over the mountains = do not enter.]"
    ],
    guideNote: "The driving and the route-finding are the hard parts. [Guide name] handles both."
  },

  "wadi-damm": {
    gettingThere: "Near Al Hamra / Al Ayn, roughly 2 hrs from Muscat via Nizwa. A 2WD can get within ~500m of the entrance and you walk the last 10 minutes; a 4×4 gets you a bit closer over the rocks and the stream. From the parking it's a 30–40 min walk up the canyon to the main pools.",
    whatYoullDo: "[YOUR ROUTE.] Azure pools and small waterfalls in a sheer-walled canyon with ferns growing out of the rock — and, unusually for Oman, water in it all year. Almost everyone stops at the first pool, which is the least impressive one. Keep walking into the canyon and you'll find a string of better ones, often empty.",
    tips: [
      "[Don't wade in — sit on the edge and slide. The entry rocks are like ice.]",
      "[Walk past the first pool. That's the whole trick here.]",
      "[Nov–Mar for the best water levels.]"
    ],
    guideNote: ""
  },

  "wadi-tiwi": {
    gettingThere: "From Muscat ~2–2.5 hrs, right next to Wadi Shab off Route 17. A paved but steep and narrow road runs ~10km into the wadi through date and fruit plantations and small villages — drive slowly, it's tight. A 4×4 is mandatory if you're continuing toward Mibam.",
    whatYoullDo: "[REWRITE IN YOUR OWN VOICE.] The drive itself is the highlight — terraced plantations and cliffside villages — before parking up and walking to the blue pools. Far fewer visitors than neighbouring Wadi Shab.",
    tips: [
      "[Pair it with Wadi Shab in one day — they're minutes apart.]",
      "[The road is tight — mind the villagers, this is their street.]"
    ],
    guideNote: "I trust [Guide name] for the Tiwi + Shab combo."
  },

  "wadi-dayqah": {
    gettingThere: "About an hour from Muscat via Quriyat, on tarmac the whole way. Any car does it. Entry is roughly OMR 1 per visitor — bring cash, and expect the park to be open from around 8am to 10pm.",
    whatYoullDo: "[YOUR TAKE — which activity is actually worth the money.] Oman's biggest dam, with an adventure park on the water: kayaks, paddleboards, pedal boats, donut rides. There's a café at the top viewpoint. Swimming in the dam itself is restricted, so this is a day on the water rather than in it.",
    tips: [
      "[The best light on the dam wall is late afternoon.]",
      "[This is the one for family, kids, or anyone who's said no to a hike.]",
      "[Bring cash — card isn't reliable here.]"
    ],
    guideNote: "Boat and watersport hire on site (Husaak run the adventure park). Book ahead at weekends."
  },

  "wadi-tanuf": {
    gettingThere: "About 30 min from Nizwa on Route 21, signposted to Tanuf. A 2WD gets you to the ruins and the wadi mouth; the dirt track deeper in is rough and wants a 4×4.",
    whatYoullDo: "[YOUR ROUTE.] Park at the ruins of old Tanuf village — bombed out in the 1950s and left standing — then walk up into the gorge past palm groves, falaj channels, and turquoise pools under small waterfalls. When the water's up you can swim; when it's not, it's still one of the better short gorge walks in the country, and it's usually empty.",
    tips: [
      "[Walk the ruins first, in the morning light, before the gorge.]",
      "[Water levels swing hard with the season — check before you commit to a swim day.]",
      "[Pairs perfectly with Al Hoota Cave and Misfat in one Nizwa day.]"
    ],
    guideNote: ""
  },

  "wadi-ghul": {
    gettingThere: "The Ghul–Nakhar route below Jabal Shams, ~2.5 hrs from Muscat via Nizwa. Pavement ends past Al Hajir and degrades into a rough track — 4×4, and a full tank. Most people photograph this canyon from the rim at Jabal Shams and never come down into it. Do both if you can.",
    whatYoullDo: "[YOUR ROUTE — how far up you drove, where you stopped, what it does to your sense of scale.] You drive up the canyon floor with 1,000m walls closing in on both sides. Get out and walk. The village of Ghul itself, half-abandoned and stacked on the hillside, is worth the stop on the way.",
    tips: [
      "[The scale doesn't fit in a phone camera. Bring something wider, or a person for scale.]",
      "[Combine with the Balcony Walk on the rim — same mountain, opposite perspectives, one long day.]",
      "[Signal disappears. Download the map before you leave Nizwa.]"
    ],
    guideNote: "The track is the hard part, not the walking. Go with a driver who's done it: [Guide name]."
  },

  "wadi-hawer": {
    gettingThere: "Remote — roughly 2.5 hrs from Muscat by 4×4, branching off the Wadi Bani Khalid valley system. Most visitors go with an operator who handles the off-road driving; the terrain includes boulder-hopping, narrow scrambles and swimming, so don't attempt the drive without the right vehicle and experience.",
    whatYoullDo: "[YOUR ROUTE — the swims, the tricky sections, what makes it special. Be honest about the difficulty from your own experience.]",
    tips: [
      "[Start early — this is a full day.]",
      "[Strong shoes and real fitness needed.]",
      "[Don't go after rain — flash-flood country.]"
    ],
    guideNote: "Don't do this one alone. I went with [Guide name] and it made the day."
  },

  "snake-gorge": {
    gettingThere: "In the Wadi Bani Awf area — ~1.5 to ~4 hrs from Muscat depending on the road (via Nakhal → Al Rustaq → Al Awabi). Mountain 4×4 road with high, narrow trails; drive it yourself only if you're an experienced off-road driver, otherwise go with a guide who handles the driving too.",
    whatYoullDo: "[REWRITE IN YOUR OWN VOICE.] Roughly a 6-hour route through the gorge with rock pools, boulder scrambling, cliff jumps (3–4m) and two ~20m abseils in the upper section — real canyoning, not a casual swim. Fitness and comfort with heights and rappelling required.",
    tips: [
      "[Only jump where your guide says — depths change with every flood.]",
      "[Helmet + good shoes. This is canyoning.]",
      "[Never in or after rain. Ever.]"
    ],
    guideNote: "Non-negotiable: go with a guide. Book through [Guide name] — they bring the ropes and the helmets."
  },

  "wadi-as-suwayh": {
    gettingThere: "On the coast road past Sur, roughly 3 hrs from Muscat. 2WD to the entrance; the walk in is 20–40 minutes.",
    whatYoullDo: "[YOUR ROUTE — this one needs your first-hand notes more than any other in the guide. Water levels here vary hugely and public info is thin.] Palms, pools and a short walk in, with the sea a few minutes away — a wadi and a beach in one morning.",
    tips: [
      "[Check water levels before committing — it can be dry.]",
      "[Bring everything. There is nothing out here.]"
    ],
    guideNote: "",
    needsFirstHand: true
  },

  "wadi-naqab": {
    gettingThere: "Northern Hajar, in the Musandam region — a serious drive from Muscat and realistically a separate trip. 4×4 essential.",
    whatYoullDo: "[YOUR ROUTE — and be blunt about who should and shouldn't attempt this. Public info is thin and inconsistent, so this section must be yours.] Long approach, real exposure, big mountain scale.",
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
    gettingThere: "~25 min by boat, or ~40 min drive (via the Qantab–Yiti–Sifah road) from Muscat. Most people book a boat out of Marina Bandar Al Rowdha or Sifah.",
    whatYoullDo: "[YOUR TAKE — which cove, what you saw.] One of the best snorkelling spots near the city — reef, rays, turtles, and a chance of dolphins on the way out. Kayaking through the coves and mangroves is the quieter alternative to a boat.",
    tips: [
      "[Morning — the water is glassiest before the wind picks up.]",
      "[Bring your own mask. A leaking hire mask ruins the day.]",
      "[Reef-safe sunscreen, or a rash vest instead.]"
    ],
    guideNote: "Easiest by boat. Researched candidates: Mola Mola Diving Center, Coral Ocean Tours, Husaak Adventures (sunset kayak). Pick the one you've actually used: [operator]."
  },

  "ras-al-jinz": {
    gettingThere: "A long drive from Muscat (~3–3.5 hrs), so most people stay overnight at the reserve's eco-lodge or in Sur (rooms ~OMR 75–100; in-house guests get turtle viewing included). Tours run at dawn and at night — book directly through the reserve's website in advance, numbers are capped.",
    whatYoullDo: "[YOUR TAKE — what you saw, what it felt like.] A ranger walks the group onto the beach in the dark to watch green turtles haul up and dig. Dawn tours often catch hatchlings running for the sea.",
    tips: [
      "[Book well ahead — they cap numbers and it sells out.]",
      "[No flash. Ever. It disorients them and they'll turn back to sea without laying.]",
      "[It's cold on that beach at night. Bring a jacket.]"
    ],
    guideNote: "Guided access only — book through the reserve directly."
  },

  "yiti-qantab": {
    gettingThere: "Qantab is ~20–25 min from central Muscat on the coastal road; Yiti is ~30–45 min. Both are easy coves for a swim or a sunset without a long drive.",
    whatYoullDo: "[YOUR TAKE.] Swim, walk the headland, kayak if you've got one. This is the 'I've got three hours' option, not a day trip.",
    tips: [
      "[Late afternoon — the cliffs go gold.]",
      "[Midweek it's basically empty.]"
    ],
    guideNote: ""
  },

  "as-sifah": {
    gettingThere: "About an hour from Muscat via the Qantab–Yiti road (scenic, some rough sections) or the longer paved route. Any car reaches the main beach; a 4×4 gets you to the emptier far ends.",
    whatYoullDo: "[YOUR TAKE — where exactly you camp, and how far along you drive to lose everyone else.] A long, wide, quiet stretch of sand with mountains behind it. One of the easiest wild camping nights you can have from Muscat.",
    tips: [
      "[Drive past the first bit everyone stops at.]",
      "[Wild camping is legal — but take every scrap of rubbish out with you.]",
      "[Weekdays. On a Friday it fills up.]"
    ],
    guideNote: ""
  },

  "al-sawadi": {
    gettingThere: "~1.5 hrs northwest of Muscat up the Batinah coast, tarmac all the way. The beach is free; boats out to the offshore islands are hired on the day from the beach.",
    whatYoullDo: "[YOUR TAKE — is the island boat worth it, and which island.] Clean sand and calm water, with a cluster of protected islands offshore. The reef between the mainland and the islands is the reason to bother — the beach alone is nice, not remarkable. The islands are a seabird nesting site.",
    tips: [
      "[Negotiate the boat price before you get in.]",
      "[Take your own snorkel gear.]",
      "[Sunset from the beach, looking back at the islands, is the shot.]"
    ],
    guideNote: "Boat hire is arranged on the beach — agree the price and the return time up front."
  },

  /* ═════════════════════════════════════════════════════════════ SALALAH */
  "al-baleed": {
    gettingThere: "On the Salalah waterfront next to the Hilton side of town — any car or an OTaxi. Entry is a few rials per car and includes the Museum of the Frankincense Land. Open into the evening.",
    whatYoullDo: "[YOUR ROUTE — museum first or ruins first, and why.] Do the museum first for the story — the frankincense trade, the dhows, the ports — then walk or take the buggy around the excavated city of Zafar as the light drops. The lagoon edge is full of herons and, in season, flamingos. At dusk the ruins are lit and the temperature finally behaves.",
    tips: [
      "[Evening. The site is lit, the museum is air-conditioned, and the midday heat is nobody's friend.]",
      "[The buggy is worth it with kids — the site is bigger than it looks.]",
      "[Pair with a sunset walk on Al Haffa beach and dinner nearby.]"
    ],
    guideNote: ""
  },

  "khor-rori": {
    gettingThere: "~35–40 min east of Salalah, signposted off the Taqah–Mirbat road just past Wadi Darbat's turnoff. Paved to the gate, then a short dusty track to the hilltop car park. A few rials per car.",
    whatYoullDo: "[YOUR ROUTE.] Walk the 2,000-year-old walls of Sumhuram above the lagoon — this was the frankincense port that traded with Rome and India. Then drive down to the lagoon mouth: flamingos and herons on the water, camels wandering the sand bar where the khor meets the sea. Late afternoon light turns the whole thing gold.",
    tips: [
      "[Combine Darbat + Khor Rori in one day — same road.]",
      "[The beach at the sand bar is one of the quietly great picnic spots in Dhofar.]",
      "[Weekdays: you'll have the ruins nearly alone.]"
    ],
    guideNote: ""
  },

  "jabal-samhan": {
    gettingThere: "~1.5 hrs east of Salalah: through Taqah and Mirbat, then the switchback road up the plateau — paved the whole way, any car, but check your brakes for the descent. Combine with Tawi Atayr sinkhole and the baobab valley on the way.",
    whatYoullDo: "[YOUR TAKE — sunrise or sunset, and where exactly you stand.] Park at the viewpoint and walk the rim: the escarpment drops the best part of a kilometre to the coastal plain, and on a clear day you can trace the whole shoreline toward Mirbat. This is the heart of the Arabian leopard reserve — you won't see one, but the emptiness is the point.",
    tips: [
      "[Avoid khareef for this one — the plateau sits inside the fog Jul–Aug and there is no view.]",
      "[It's windy and 10 degrees cooler up top. Jacket.]",
      "[Fuel up in Mirbat — stations are sparse on the mountain.]"
    ],
    guideNote: ""
  },

  "fazayah-beach": {
    gettingThere: "West from Salalah past Mughsail (~1.5 hrs total): the road climbs the Sarfait switchbacks, then a signed graded track drops steeply to the coves. The descent is the 4×4 part — low gear, no drama in the dry. Nothing down there but sand and camels: bring everything.",
    whatYoullDo: "[YOUR ROUTINE — which cove, and what time the light works.] A string of white-sand coves under pale cliffs, usually empty except for camels cooling their feet in the shallows. Outside khareef the water is calm and clear — swim, snorkel the rocky ends, stay for sunset. In khareef the sea is dangerous; go for the view, not the water.",
    tips: [
      "[The first cove gets the (few) visitors — walk one further.]",
      "[No shade, no water, no signal in the coves. Plan like it's a mini-expedition.]",
      "[Sunset from the descent track, looking back down the coast, is the photograph.]"
    ],
    guideNote: ""
  },

  "wadi-dawkah": {
    gettingThere: "~45 min north of Salalah on the Thumrait road (Route 31) — signposted, paved, any car. It's on the way to the Empty Quarter, so it slots naturally into a desert day.",
    whatYoullDo: "[YOUR TAKE — why this ties the frankincense story together.] Walk among a couple of thousand wild Boswellia sacra trees in their natural wadi — the same groves that supplied the ports at Sumhuram and Al Baleed for two millennia. Look for the dried resin beads on cut bark. Twenty minutes here makes the museums make sense.",
    tips: [
      "[Go early or late — the desert side of the mountains is hotter than Salalah.]",
      "[Buy your actual frankincense in Al Haffa souq afterwards, now you know what you're looking at.]",
      "[If you're pushing on to the Empty Quarter, this is the free warm-up act.]"
    ],
    guideNote: ""
  },

  "ayn-razat": {
    gettingThere: "~25 min northeast of Salalah — paved, signposted, any car. Free parking by the gardens.",
    whatYoullDo: "[YOUR ROUTINE.] The spring rises at the cliff base and feeds a falaj through a strip of ornamental gardens — this is where Salalah families picnic. Climb the steps to the small cave in the cliff for the view over the greenery. In khareef the whole hillside above runs green and the birdlife goes berserk.",
    tips: [
      "[Mornings are quiet; Friday afternoons are the full family scene — pick your vibe.]",
      "[Combine with Ayn Athum and the other springs along the mountain base in khareef.]",
      "[No swimming in the spring — it feeds the irrigation channels.]"
    ],
    guideNote: ""
  },

  "taqah-castle": {
    gettingThere: "~35 min east of Salalah on the coast road, in the middle of Taqah town — any car, park by the square. Twenty minutes short of Khor Rori, so do them on the same run east.",
    whatYoullDo: "[YOUR TAKE — what stuck with you inside.] The restored wali's residence: living quarters laid out as they were used, the majlis, the women's rooms, rifle slits covering the bay, and a rooftop with the view along the Taqah coast. It's small — under an hour — but it's the best window into pre-1970 Dhofari life you'll get.",
    tips: [
      "[Confirm opening days — small forts keep small hours, and Fridays are unreliable.]",
      "[Rooftop late afternoon for the light along the coast.]",
      "[Stack it: Taqah Castle → Khor Rori → Wadi Darbat is one natural day east.]"
    ],
    guideNote: ""
  },

  "ayn-athum": {
    gettingThere: "~25 min northeast of Salalah at the foot of the mountains — paved to the parking, any car. Signage is thin; follow the maps pin, not the road signs.",
    whatYoullDo: "[YOUR ROUTINE — when you go and where you stand.] In khareef the spring becomes a waterfall off the green cliff, with mist rolling through the trees — the Darbat scene without the buses. Outside the monsoon it's a quiet pool and a shady walk. Ten minutes from Ayn Razat, so see both.",
    tips: [
      "[Peak flow late July–August; just after khareef it's still green and empty.]",
      "[Wet rock everywhere in season — grip matters more than it looks.]",
      "[No swimming — it feeds the falaj, same as Razat.]"
    ],
    guideNote: ""
  },

  /* ═════════════════════════════════════════════════════════ EXPERIENCES */
  "daymaniyat": {
    gettingThere: "Tours depart from Seeb Marina (~30 min from central Muscat), then ~30 min by boat to the reserve. Morning tours typically run 8:30am–12:30pm, afternoon 1:30–5:30pm. Gear, life jackets, permits and snacks are usually included.",
    whatYoullDo: "[YOUR ROUTE — which reef, what you saw, how it compared to other snorkel spots. 3–5 sentences. This is the one people will buy the guide for.]",
    tips: [
      "[Book a couple of days ahead in peak season — trips fill up.]",
      "[Reef-safe sunscreen only. It's a protected marine reserve and they check.]",
      "[Take your own mask.]",
      "[Nov–Mar for visibility and turtles.]"
    ],
    guideNote: "Boat tour only. Researched candidates: Daymaniyat Tours, Muscat Sea Adventure, Mola Mola Diving Center, Cruiseboat Oman. Use the one you've actually been out with: [operator]."
  },

  "wahiba-sands": {
    gettingThere: "~2.5–3 hrs from Muscat via Highway 15 to Al Wasil — smooth tarmac the whole way, then most camps send a 4×4 to meet you at the sand's edge (or collect you from Muscat directly). Almost every camp offers dune bashing, camel rides and sunset/sunrise dune sessions.",
    whatYoullDo: "[YOUR ROUTE — the camp, the dune-bashing, the night sky, the morning. 3–5 sentences.]",
    tips: [
      "[Go Oct–Mar. Summer in the desert is genuinely dangerous heat.]",
      "[Ask for a camp away from the main road — that's the difference between stars and no stars.]",
      "[It gets cold at night. Nobody believes me, and everybody regrets it.]"
    ],
    guideNote: "Pick a camp. Researched candidates: Oman Wahiba Sands Desert Tours, Magic Camps, Zahara Tours, Sunshine Tours. I stay at [camp name]."
  },

  /* ═══════════════════════════════════════════════════════════ MOUNTAINS */
  "balad-sayt": {
    gettingThere: "Two ways in, both 4×4: over the Sharaf Al Alamayn pass from Al Hamra (the spectacular way), or up Wadi Bani Awf from the Rustaq side (the long way, past Snake Gorge). Either way it's a real graded mountain road — confident driving, low gear, and don't do it in rain. Park at the village edge; walk in.",
    whatYoullDo: "[YOUR ROUTE — where you stop for THE photo, and how you've seen tourists get it wrong.] The village sits in a natural amphitheatre — green terraces below, mud-brick houses stacked above, mountains sealing it in on every side. Wander the lanes quietly (people live here; dress modestly, ask before photographing anyone), then climb to the track above the football pitch for the classic panorama.",
    tips: [
      "[The famous shot is from the track above the village, late afternoon.]",
      "[Combine into a loop: Al Hamra → Sharaf Al Alamayn → Balad Sayt → Snake Gorge viewpoint → Rustaq.]",
      "[This is a conservative village that has been very patient with Instagram. Be the visitor that keeps it that way.]"
    ],
    guideNote: "If the mountain road worries you, a guide-driver turns a white-knuckle day into a great one. [Guide name] does this loop well."
  },

  "sharaf-al-alamayn": {
    gettingThere: "From Al Hamra the paved road climbs to the pass and the tarmac ends near the top (~45 min); from the Bani Awf side it's graded track the whole way up. 4×4 either way. The viewpoint is at the crest — park and walk the rim.",
    whatYoullDo: "[YOUR TAKE — sunset ritual, where you set up.] Stand on the rim at ~2,000m with the western Hajar collapsing away beneath you — ridgelines to the horizon, Wadi Bani Awf's villages tiny below. Sunset turns the whole range copper. Bring the flask, stay past the colour, and drive down in the last light carefully.",
    tips: [
      "[It is COLD up here after sunset, even in May. Nobody believes it.]",
      "[The W9 trail to Balad Sayt starts near the pass — a serious, brilliant day hike if you arrange a pickup below.]",
      "[Full moon nights up here are something else entirely.]"
    ],
    guideNote: ""
  },

  "nizwa": {
    gettingThere: "~1.5–2 hrs from Muscat via Route 15, an easy paved drive. Fort and souq are a few minutes' walk apart in central Nizwa — pairs naturally with Jabal Akhdar, Al Hoota or Misfat, they're all on the same road inland.",
    whatYoullDo: "[YOUR ROUTE — the fort tower, the souq stalls, the Friday goat market if you time it.] Climb the fort tower for the view over the date palms, then walk the souq: silver, dates, pottery, spices.",
    tips: [
      "[Friday, ~7am, for the livestock souq. It's the real spectacle and it's over by 9.]",
      "[The fort tower bakes at midday. Early or late.]",
      "[Buy dates here, not at the airport.]"
    ],
    guideNote: ""
  },

  "misfat-al-abriyeen": {
    gettingThere: "~2 hrs from Muscat, 30 min from Nizwa. Any car. You park outside the village and walk in — cars aren't allowed through the old alleys.",
    whatYoullDo: "[YOUR TAKE — and where you'd sit for the view.] Walk down through the mud-brick alleys with the falaj running beside your feet, out into the terraced gardens of date palms, bananas and mangoes below. It takes an hour and you'll want two. Village guesthouses will put you up for the night, which is the way to do it.",
    tips: [
      "[Late afternoon light on the terraces is the whole reason to come.]",
      "[People live here. Don't photograph doorways and windows without asking.]",
      "[Stay the night — the village empties after 5pm and it's a different place.]"
    ],
    guideNote: ""
  },

  "al-hoota-cave": {
    gettingThere: "At the foot of Jabal Shams near Al Hamra, ~2 hrs from Muscat. Any car, proper parking. Entry runs roughly OMR 7 for adult foreign visitors, OMR 3.5 for children, and slots are timed.",
    whatYoullDo: "[YOUR TAKE.] A little electric train takes you into the mountain, then you walk the lit 500m section — stalactites, a subterranean lake, and blind cave fish that live nowhere else on earth. Two million years old, and the only show cave on the Arabian Peninsula.",
    tips: [
      "[Slots are timed and they do sell out. Book, or turn up early.]",
      "[The perfect midday stop on a hot Nizwa day — you're underground while the sun is at its worst.]",
      "[It closes some days. Check before you drive out there.]"
    ],
    guideNote: ""
  },

  "jabal-akhdar": {
    gettingThere: "~2 hrs from Muscat. There is a police checkpoint at the bottom of the mountain road and they WILL turn you back in a 2WD — this isn't a suggestion, it's enforced. 4×4 only.",
    whatYoullDo: "[YOUR ROUTE — which village loop you'd walk.] The terraced-village walk (Al Ayn → Ash Shirayjah → Al Aqr) takes you down through rose terraces and pomegranate orchards on the paths between the villages, with the canyon opening up below. Two to three hours, and one of the best easy hikes in the country.",
    tips: [
      "[4×4 or you don't get up the mountain. The checkpoint is real.]",
      "[Mar–Apr for the rose harvest and the rosewater distilleries.]",
      "[It's cold up there in the evening. Bring a layer.]"
    ],
    guideNote: ""
  },

  "musandam-dhow": {
    gettingThere: "Khasab is the base. Either fly, or drive up through the UAE (which means border crossings — check your visa situation carefully). Realistically a separate trip from a Muscat itinerary, not a day out.",
    whatYoullDo: "[YOUR TAKE — which operator, what you saw.] A traditional dhow motors out into the khors — fjords, effectively — with limestone walls dropping straight into deep blue water. Dolphins usually ride the bow on the way out. The boat anchors for swimming and snorkelling at spots you cannot reach by land, and lunch is served on deck.",
    tips: [
      "[Half-day is enough for most people; full-day if you want the far khors.]",
      "[Take the motion-sickness tablet BEFORE you board if you're prone. Too late once you're out there.]",
      "[No shade on deck for long stretches — cover up properly.]"
    ],
    guideNote: "Dhow operators run from Khasab harbour — book ahead in peak season. [Operator]."
  },

  /* ════════════════════════════════════════════════════════════════ FOOD */
  "cafe-qaha": {
    whatYoullDo: "[Your order.] Omani coffee culture with a modern room around it — white and blue, calm, unhurried.",
    tips: ["[Your go-to order.]"],
    guideNote: ""
  },
  "cafe-azura": {
    whatYoullDo: "[Your order — and which beans you take home.] Specialty café and roastery; the one the coffee people send you to.",
    tips: ["[Buy beans, not just a cup.]"],
    guideNote: ""
  },
  "cafe-farah": {
    whatYoullDo: "[Your take.] Right on Azaiba Beach — the view is doing a lot of the work, and that's fine. This is the sunset coffee.",
    tips: ["[Go for the sunset, not for the coffee.]"],
    guideNote: ""
  },
  "food-kargeen": {
    whatYoullDo: "[Your order.] Lantern-lit courtyards, outside tables, grilled fish. The mashuai — kingfish over rice — is the order, with the Omani bread and dips to start.",
    tips: ["[Book at the weekend.]", "[Sit outside. Always outside.]"],
    guideNote: ""
  },
  "food-bin-ateeq": {
    whatYoullDo: "[Your order.] Curtained rooms, cushions on the floor, no ceremony. The closest a restaurant gets to eating in an Omani house.",
    tips: ["[Eat with your right hand. It tastes better, and it's polite.]"],
    guideNote: ""
  },
  "food-halwa": {
    whatYoullDo: "[Which stall, specifically.] Watch it stirred in the copper pot — rosewater, saffron, cardamom, nuts, and about an hour of someone's shoulder.",
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
    gettingThere: "On the Seeb corniche, ~25 min from central Muscat. Park along the waterfront; the souq runs back from the fish market.",
    whatYoullDo: "[YOUR ROUTINE — when you go, what you buy, which corner has the good dates.] Start at the fish market early if you want the show — the auction is loud, fast and completely real. Then the covered lanes: dates by the kilo at half the tourist-shop price, kummas, abayas, household stalls. This is shopping the way Muscat actually does it.",
    tips: [
      "[Which dates stall you buy from, and what a fair per-kilo price is.]",
      "[Fish market timing — what hour the auction peaks.]",
      "[Where you get breakfast after.]"
    ],
    guideNote: ""
  },

  "shop-nizwa-souq": {
    gettingThere: "Under Nizwa Fort, ~1h45 from Muscat. Big free car park by the fort walls — pair it with the fort, they share a wall.",
    whatYoullDo: "[YOUR ROUTINE.] Friday from ~6:30am: the goat market — farmers walking livestock around a circle of bidders, unchanged for centuries; be there by 7am or it's over. Then the pottery hall, the silver souq for khanjars, and the date warehouses. Weekdays are calmer, but the goat circle only happens Friday.",
    tips: [
      "[What a fair price looks like for a khanjar / silver piece, and what's tourist-priced.]",
      "[Which pottery seller you trust.]",
      "[Where the locals drink karak around the souq.]"
    ],
    guideNote: ""
  },

  "shop-al-sharaa": {
    gettingThere: "[Where it is, how to find it, parking.]",
    whatYoullDo: "[THE WHOLE WRITE-UP IS YOURS — what Al Sharaa sells, why you send people there, what to walk out with. This is exactly the only-you-know content people pay for.]",
    tips: [
      "[Best time to go.]",
      "[What to buy and roughly what it should cost.]"
    ],
    guideNote: ""
  },

  "shop-amouage": {
    gettingThere: "Off the Muscat Expressway near Rusayl, ~25 min from central Muscat. Free parking at the visitor centre.",
    whatYoullDo: "[YOUR TAKE — which scents you steer friends toward, whether the tour is worth booking.] The factory tour shows the production floor and the story of the house; the boutique carries the full range with tester bars, including editions that are hard to find abroad — at prices better than duty free and far better than Europe.",
    tips: [
      "[Your scent shortlist — the two or three you'd tell a friend to smell first.]",
      "[Tour timing / whether to book ahead.]",
      "[The duty-free price comparison, so buyers know the saving.]"
    ],
    guideNote: ""
  }
};

if (window.__onPremiumLoaded) window.__onPremiumLoaded();

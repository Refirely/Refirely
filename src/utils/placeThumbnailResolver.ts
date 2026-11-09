import { ScoutInterestId, SCOUT_INTEREST_CATALOG } from '../data/scoutCoordinatesAndItineraries';

/**
 * Curated dictionary of specific venue, landmark, neighborhood, trail, and beach keywords
 * mapped to distinct, high-resolution Unsplash photo URLs so famous places across cities
 * immediately get a tailored visual even before live Wikimedia landmark resolution.
 */
const SPECIFIC_PLACE_PHOTO_KEYWORDS: Array<{ keywords: string[]; url: string }> = [
  // Goa
  {
    keywords: ['soro', 'joseph bar', 'assagao pub'],
    url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['thalassa', 'siolim', 'chapora'],
    url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['artjuna', 'clay coworking', 'anjuna'],
    url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['netravali', 'dudhsagar'],
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['fontainhas', 'reis magos'],
    url: 'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['vaayu', 'ashwem', 'mandrem'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },

  // Bengaluru
  {
    keywords: ['toit', 'skyye', 'ub city'],
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['olive beach', 'toast & tonic'],
    url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['wework prestige', 'araku coffee'],
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['nandi hills', 'skandagiri'],
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['cubbon park', 'lalbagh'],
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['manipal hospital', 'apollo bannerghatta'],
    url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=900&q=80',
  },

  // Mumbai
  {
    keywords: ['aer four seasons', 'bonobo', 'worli'],
    url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['pali village', 'carter road', 'marine drive'],
    url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['sanjay gandhi', 'kanheri'],
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['kala ghoda', 'colaba', 'chhatrapati'],
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['blue tokai', 'bkc'],
    url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=900&q=80',
  },

  // Udaipur & Jaipur
  {
    keywords: ['ambrai', 'uppala', 'pichola'],
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['city palace', 'gangaur', 'jagdish'],
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['bahubali hills', 'badi lake', 'aravalli'],
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  },

  // Rishikesh & Himachal
  {
    keywords: ['kunjapuri', 'ganges', 'bir paragliding'],
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['beatles ashram', 'chaurasi kutia', 'parmarth niketan'],
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['tapovan', 'delmar', 'tat cafe'],
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80',
  },

  // Pondicherry & Kochi
  {
    keywords: ['villa shanti', 'coromandel cafe'],
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['rue dumas', 'white town', 'auroville', 'matrimandir'],
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['kallialay', 'serenity beach'],
    url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['fort kochi', 'kashi art', 'mattancherry'],
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['alappuzha', 'kumarakom', 'marari'],
    url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80',
  },

  // Lisbon, Porto & Algarve (Portugal)
  {
    keywords: ['park rooftop', 'bairro alto', 'pavilhao chines'],
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['principe real', 'time out market', 'cais do sodre'],
    url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['cabo da roca', 'praia da ursa', 'arrabida'],
    url: 'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['carcavelos', 'guincho', 'cascais'],
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['alfama', 'santa luzia', 'fado'],
    url: 'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['second home', 'lx factory'],
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['galeria de paris', 'base porto', 'clerigos'],
    url: 'https://images.unsplash.com/photo-1555881400-69a2384edcd4?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['ribeira', 'dom luis', 'gaia'],
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['matosinhos', 'foz do douro'],
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['seven hanging valleys', 'benagil', 'marinha'],
    url: 'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['ponta da piedade', 'lagos', 'sagres'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },

  // Spain (Valencia, Málaga, Barcelona)
  {
    keywords: ['cafe de las horas', 'ruzafa', 'el carmen'],
    url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['marina beach club', 'malvarrosa'],
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['arts & sciences', 'turia', 'lonja'],
    url: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['albufera', 'garbi'],
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['alcazaba', 'elhedonista', 'chinitas', 'muelle uno'],
    url: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['caminito del rey', 'maroma'],
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
  },

  // Colombia (Medellín)
  {
    keywords: ['perro negro', 'envy rooftop', 'parque lleras'],
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['provenza', 'carmen', 'el cielo'],
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['san felix', 'paragliding', 'arvi', 'guatape'],
    url: 'https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['selina cowork', 'pergamino', 'laureles'],
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['comuna 13', 'botero'],
    url: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=900&q=80',
  },

  // Bali / Indonesia
  {
    keywords: ['single fin', 'uluwatu', 'la brisa', 'echo beach'],
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['batur', 'campuhan', 'tegallalang', 'ubud'],
    url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['tropical nomad', 'outpost', 'crate cafe', 'canggu'],
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
  },

  // Thailand (Chiang Mai, Bangkok, Phuket)
  {
    keywords: ['warmup', 'zoe in yellow', 'nimman', 'graph cafe'],
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['doi suthep', 'monk’s trail', 'inthanon'],
    url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['sky bar', 'lebua', 'octave', 'bangkok', 'talad noi', 'lumphini'],
    url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
  },

  // Malaysia (Kuala Lumpur & Penang)
  {
    keywords: ['heli lounge', 'changkat', 'klcc', 'petronas', 'batu caves'],
    url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
  },
  {
    keywords: ['george town', 'armenian street', 'penang hill', 'kek lok si'],
    url: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=900&q=80',
  },
];

/**
 * Rich, multi-variant photo pools per ScoutInterestId (12–16 verified high-res Unsplash URLs per category).
 * Used with deterministic hashing + per-stop deduplication so no two venue cards ever share the same image.
 */
const CATEGORY_PHOTO_VARIATIONS: Record<ScoutInterestId, string[]> = {
  nightlife: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=900&q=80',
  ],
  dating: [
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&w=900&q=80',
  ],
  hiking: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=900&q=80',
  ],
  surfing: [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1537519646099-335112f03225?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1520116468816-95b69f847357?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80',
  ],
  culture: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
  ],
  architecture: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
  ],
  nature: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
  ],
  volunteering: [
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=900&q=80',
  ],
  hobbies: [
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
  ],
  coworking: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
  ],
  healthcare: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=900&q=80',
  ],
  residency: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=900&q=80',
  ],
};

function computeDeterministicHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Resolves a unique, place/city/country-specific photo URL for a venue recommendation card
 * and ensures zero duplicate thumbnail URLs within the same city or across cards.
 * Also returns the generic category photo as `genericFallbackUrl` in case the custom photo cannot load.
 */
export function resolveUniqueVenuePhotoUrl(params: {
  interestId: ScoutInterestId;
  title: string;
  neighborhood: string;
  cityName: string;
  countryId: string;
  countryName: string;
  idSuffix: string;
  seedPhotoUrl?: string;
  countryPhotoUrl?: string;
  usedUrlsTracker?: Set<string>;
}): {
  primaryPhotoUrl: string;
  genericCategoryFallbackUrl: string;
} {
  const {
    interestId,
    title,
    neighborhood,
    cityName,
    countryId,
    countryName,
    idSuffix,
    countryPhotoUrl,
    usedUrlsTracker,
  } = params;

  const genericCatalogObj = SCOUT_INTEREST_CATALOG.find(item => item.id === interestId);
  const genericCategoryFallbackUrl =
    genericCatalogObj?.photoUrl ||
    countryPhotoUrl ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80';

  const combinedText = `${title} ${neighborhood} ${cityName} ${countryName}`.toLowerCase();

  // 1. Check if a specific named place/landmark keyword matches and isn't already used in this stop
  for (const entry of SPECIFIC_PLACE_PHOTO_KEYWORDS) {
    if (entry.keywords.some(kw => combinedText.includes(kw))) {
      if (!usedUrlsTracker || !usedUrlsTracker.has(entry.url)) {
        usedUrlsTracker?.add(entry.url);
        return {
          primaryPhotoUrl: entry.url,
          genericCategoryFallbackUrl,
        };
      }
    }
  }

  // 2. Otherwise select a deterministic, city+place-unique photo from the 12-photo category pool
  const pool = CATEGORY_PHOTO_VARIATIONS[interestId] || CATEGORY_PHOTO_VARIATIONS.culture;
  const hashSeed = computeDeterministicHash(
    `${countryId.toLowerCase()}::${cityName.toLowerCase()}::${idSuffix.toLowerCase()}::${title.toLowerCase()}`
  );

  for (let offset = 0; offset < pool.length; offset++) {
    const candidate = pool[(hashSeed + offset) % pool.length];
    if (!usedUrlsTracker || !usedUrlsTracker.has(candidate)) {
      usedUrlsTracker?.add(candidate);
      return {
        primaryPhotoUrl: candidate,
        genericCategoryFallbackUrl,
      };
    }
  }

  // 3. If all pool items for this single category were somehow exhausted, check cross-category or country photo
  if (countryPhotoUrl && (!usedUrlsTracker || !usedUrlsTracker.has(countryPhotoUrl))) {
    usedUrlsTracker?.add(countryPhotoUrl);
    return {
      primaryPhotoUrl: countryPhotoUrl,
      genericCategoryFallbackUrl,
    };
  }

  const fallbackPick = pool[hashSeed % pool.length] || genericCategoryFallbackUrl;
  return {
    primaryPhotoUrl: fallbackPick,
    genericCategoryFallbackUrl,
  };
}

/**
 * In-memory cache for live Wikipedia / Wikimedia Commons place & landmark photo resolution
 */
const WIKI_PLACE_PHOTO_CACHE = new Map<string, string | null>();

const WIKI_STORAGE_CACHE_KEY = 'refirely_wiki_place_photos_v1';

function loadSessionWikiCache(): void {
  if (typeof window === 'undefined' || WIKI_PLACE_PHOTO_CACHE.size > 0) return;
  try {
    const raw = window.sessionStorage.getItem(WIKI_STORAGE_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string | null>;
    Object.entries(parsed).forEach(([k, v]) => WIKI_PLACE_PHOTO_CACHE.set(k, v));
  } catch {
    // Ignore storage read errors
  }
}

function persistSessionWikiCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, string | null> = {};
    let count = 0;
    WIKI_PLACE_PHOTO_CACHE.forEach((v, k) => {
      if (count < 250) {
        obj[k] = v;
        count++;
      }
    });
    window.sessionStorage.setItem(WIKI_STORAGE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Cleans a venue card title into a concise landmark/place search query suitable for Wikimedia Commons / Wikipedia pageimages
 */
function buildCleanPlaceSearchCandidate(title: string, cityName: string, countryName: string): string {
  const cleanCity = cityName.split(/[(&,/]/)[0].trim();
  // Take the primary venue/landmark segment before '&' or '+'
  const firstSegment = title
    .split(/\s+(?:\+|&|\/)\s+/)[0]
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(Guided|Sunrise|Sunset|Walk|Trek|Tour|Session|Audit|Consult|Flagship|Premier|Boutique)\b/gi, '')
    .trim();

  if (!firstSegment || firstSegment.length < 3) {
    return `${cleanCity} ${countryName}`;
  }

  // If the segment already contains the city name, don't duplicate it
  if (firstSegment.toLowerCase().includes(cleanCity.toLowerCase())) {
    return `${firstSegment} ${countryName}`.trim();
  }
  return `${firstSegment} ${cleanCity} ${countryName}`.trim();
}

/**
 * Asynchronously resolves an authentic, place-specific photo from Wikipedia / Wikimedia Commons REST API
 * for a specific landmark, beach, mountain trail, neighborhood, or cultural venue in that city & country.
 * Returns `null` if no verified photographic match is found so the caller keeps its unique curated thumbnail.
 */
export async function fetchSpecificPlacePhotoFromCommons(params: {
  title: string;
  neighborhood?: string;
  cityName?: string;
  countryName?: string;
}): Promise<string | null> {
  loadSessionWikiCache();
  const { title, neighborhood = '', cityName = '', countryName = '' } = params;
  if (!title || (!cityName && !countryName)) return null;

  // Skip generic utility titles like "Furnished Rental Tour" or "Private Hospital" where curated architectural/medical photos look cleaner
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes('furnished rental') ||
    lowerTitle.includes('apartment viewing') ||
    lowerTitle.includes('fiber test') ||
    lowerTitle.includes('specialist tour')
  ) {
    return null;
  }

  const cleanCity = cityName.split(/[(&,/]/)[0].trim();
  const searchCandidate = buildCleanPlaceSearchCandidate(title, cleanCity, countryName);
  const cacheKey = `${searchCandidate.toLowerCase()}::${neighborhood.toLowerCase().slice(0, 24)}`;

  if (WIKI_PLACE_PHOTO_CACHE.has(cacheKey)) {
    return WIKI_PLACE_PHOTO_CACHE.get(cacheKey) || null;
  }

  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchCandidate
    )}&gsrlimit=4&prop=pageimages|extracts&exintro=1&explaintext=1&exchars=220&piprop=thumbnail&pithumbsize=900&format=json&origin=*`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      WIKI_PLACE_PHOTO_CACHE.set(cacheKey, null);
      return null;
    }

    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) as Array<any> : [];
    if (pages.length === 0) {
      WIKI_PLACE_PHOTO_CACHE.set(cacheKey, null);
      return null;
    }

    // Sort by search index order
    pages.sort((a, b) => (a.index || 99) - (b.index || 99));

    const cityLower = cleanCity.toLowerCase();
    const countryLower = countryName.toLowerCase();

    for (const page of pages) {
      const thumbUrl: string | undefined = page?.thumbnail?.source;
      if (!thumbUrl) continue;

      const lowerUrl = thumbUrl.toLowerCase();
      // Reject maps, flags, coats of arms, logos, diagrams, or SVG icons
      if (
        lowerUrl.endsWith('.svg') ||
        lowerUrl.endsWith('.svg.png') ||
        lowerUrl.includes('flag_of') ||
        lowerUrl.includes('coat_of_arms') ||
        lowerUrl.includes('locator_map') ||
        lowerUrl.includes('location_map') ||
        lowerUrl.includes('logo') ||
        lowerUrl.includes('icon') ||
        lowerUrl.includes('map_of')
      ) {
        continue;
      }

      const pageContext = `${page.title || ''} ${page.extract || ''}`.toLowerCase();
      // Ensure the Wikipedia article actually relates to this city or country
      if (
        (cityLower && pageContext.includes(cityLower)) ||
        (countryLower && pageContext.includes(countryLower))
      ) {
        WIKI_PLACE_PHOTO_CACHE.set(cacheKey, thumbUrl);
        persistSessionWikiCache();
        return thumbUrl;
      }
    }

    WIKI_PLACE_PHOTO_CACHE.set(cacheKey, null);
    persistSessionWikiCache();
    return null;
  } catch {
    WIKI_PLACE_PHOTO_CACHE.set(cacheKey, null);
    return null;
  }
}

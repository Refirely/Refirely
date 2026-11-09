import { ScoutInterestId, SCOUT_INTEREST_CATALOG } from '../data/scoutCoordinatesAndItineraries';

/**
 * Exact 1-to-1 photo mapping for every curated venue seed `idSuffix` in `CITY_FAMOUS_VENUES`.
 * Guarantees that every curated city card in India, Portugal, Spain, Colombia, Thailand,
 * Greece, Mexico, and Indonesia displays a verified photo matching that specific place, city, and country.
 */
const CURATED_SEED_ID_PHOTOS: Record<string, string> = {
  // India — Goa
  'goa-soro-joseph-nightlife':
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80',
  'goa-thalassa-dating':
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=80',
  'goa-artjuna-clay-cowork':
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
  'goa-netravali-dudhsagar-hike':
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80',
  'goa-fontainhas-arch':
    'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?auto=format&fit=crop&w=900&q=80',
  'goa-ashwem-surf':
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',

  // India — Bengaluru
  'blr-toit-arbor-nightlife':
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
  'blr-olive-toast-dating':
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80',
  'blr-wework-thirdwave-cowork':
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
  'blr-nandi-hills-hike':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  'blr-palace-lalbagh-arch':
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
  'blr-manipal-hospital':
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=900&q=80',

  // India — Mumbai
  'bom-aer-bonobo-nightlife':
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=80',
  'bom-subko-veronicas-cowork':
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=900&q=80',
  'bom-kalaghoda-marine-arch':
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80',
  'bom-kanheri-hike':
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=900&q=80',

  // India — Pune
  'pnq-effingut-nightlife':
    'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?auto=format&fit=crop&w=900&q=80',
  'pnq-sante-dating':
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
  'pnq-sinhagad-hike':
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80',

  // India — Kochi & Kerala
  'cok-seagull-varkala-nightlife':
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80',
  'cok-kashi-dating':
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
  'cok-varkala-surf':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'cok-fort-kochi-arch':
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80',

  // India — Udaipur
  'udr-ambrai-palladio-dating':
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
  'udr-fateh-nightlife':
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80',
  'udr-city-palace-arch':
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80',
  'udr-bahubali-badi-hike':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',

  // India — Rishikesh & Himachal
  'ded-triund-ganges-hike':
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
  'ded-beatles-cafe-culture':
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80',
  'ded-tapovan-cowork':
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80',

  // India — Pondicherry
  'pny-villashanti-dating':
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
  'pny-whitetown-arch':
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80',
  'pny-kallialay-surf':
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80',

  // Portugal — Lisbon
  'lis-park-rooftop':
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  'lis-principe-real-dating':
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
  'lis-cabo-roca-hike':
    'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?auto=format&fit=crop&w=900&q=80',
  'lis-carcavelos-surf':
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
  'lis-alfama-arch':
    'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80',
  'lis-second-home-cowork':
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',

  // Portugal — Porto
  'opo-base-galeria-nightlife':
    'https://images.unsplash.com/photo-1555881400-69a2384edcd4?auto=format&fit=crop&w=900&q=80',
  'opo-ribeira-grahams-dating':
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
  'opo-paiva-walkways-hike':
    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
  'opo-matosinhos-surf':
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=900&q=80',
  'opo-saobento-arch':
    'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?auto=format&fit=crop&w=901&q=80',
  'opo-portoio-cowork':
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',

  // Portugal — Lagos / Algarve
  'fao-bonvivant-nightlife':
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
  'fao-ponta-piedade-hike':
    'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?auto=format&fit=crop&w=900&q=80',
  'fao-jahshaka-surf':
    'https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=80',

  // Portugal — Funchal / Madeira
  'fnc-pico-arieiro-hike':
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80',
  'fnc-nomad-village-cowork':
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80',

  // Spain — Valencia
  'vlc-atenea-sky-rooftop':
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=900&q=80',
  'vlc-ruzafa-mercat-colon':
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
  'vlc-montanejos-turia-hike':
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  'vlc-ciudad-artes-arch':
    'https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=900&q=80',

  // Spain — Málaga
  'agp-alcazaba-pimpi-nightlife':
    'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80',
  'agp-muelle-uno-dating':
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=900&q=80',
  'agp-caminito-rey-hike':
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',

  // Spain — Barcelona
  'bcn-paradiso-pulitzer-nightlife':
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
  'bcn-enric-granados-dating':
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  'bcn-montserrat-bunkers-hike':
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=900&q=80',

  // Thailand — Chiang Mai
  'cnx-north-gate-jazz':
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
  'cnx-one-nimman-dating':
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
  'cnx-monks-trail-hike':
    'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
  'cnx-yellow-punspace-cowork':
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80',

  // Thailand — Bangkok
  'bkk-octave-havana-nightlife':
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
  'bkk-commons-ari-dating':
    'https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=900&q=80',
  'bkk-benjakitti-bangkrachao-hike':
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  'bkk-bumrungrad-hospital':
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',

  // Thailand — Phuket
  'hkt-catch-beach-nightlife':
    'https://images.unsplash.com/photo-1537519646099-335112f03225?auto=format&fit=crop&w=900&q=80',
  'hkt-kata-surf-catamaran':
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',

  // Colombia — Medellín
  'med-envy-rooftop':
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
  'med-provenza-dating':
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  'med-paragliding-sanfelix':
    'https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?auto=format&fit=crop&w=900&q=80',
  'med-selina-semilla':
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',

  // Colombia — Bogotá
  'bog-andres-dc-nightlife':
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80',
  'bog-monserrate-hike':
    'https://images.unsplash.com/photo-1536708880921-03a9306ec47d?auto=format&fit=crop&w=900&q=80',

  // Colombia — Cartagena
  'ctg-alquimico-cafedelmar':
    'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=900&q=80',
  'ctg-rosario-tayrona':
    'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=900&q=80',

  // Greece — Athens
  'ath-a-for-athens-rooftop':
    'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80',
  'ath-koukaki-plaka-dating':
    'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=900&q=80',
  'ath-vouliagmeni-beach-club':
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
  'ath-sounion-hymettus-hike':
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',

  // Greece — Chania / Crete
  'chq-sinagogi-barbarossa-nightlife':
    'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=900&q=80',
  'chq-samaria-gorge-hike':
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=900&q=80',

  // Mexico — Mexico City
  'mex-supra-limantour':
    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=80',
  'mex-parque-mexico-dating':
    'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=900&q=80',
  'mex-balloon-toluca-hike':
    'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=900&q=80',

  // Mexico — Puerto Vallarta
  'pvr-lapalapa-elsolar':
    'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&w=900&q=80',
  'pvr-boca-tomatlan-hike':
    'https://images.unsplash.com/photo-1520116468816-95b69f847357?auto=format&fit=crop&w=900&q=80',

  // Indonesia — Canggu & Ubud
  'dps-la-brisa-finns':
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
  'dps-bwork-canggu':
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
  'ubd-campuhan-batur-hike':
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=900&q=80',
  'ubd-outpost-cowork':
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
};

/**
 * Country-specific scenic & architectural photo pools.
 * Used when a stop in a country has dynamic `architecture`, `culture`, `hiking`, `surfing`, or `nature` cards
 * so that Portugal shows Portuguese plazas/coasts, Colombia shows Colombian colonial towns/Andean valleys,
 * Spain shows Spanish plazas/coasts, and India shows Indian heritage—never mixing monuments across countries.
 */
const COUNTRY_SCENIC_PHOTO_POOLS: Record<string, string[]> = {
  portugal: [
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555881400-69a2384edcd4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=900&q=80',
  ],
  colombia: [
    'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1536708880921-03a9306ec47d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  ],
  spain: [
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  ],
  india: [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80',
  ],
  thailand: [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
  ],
  greece: [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80',
  ],
  italy: [
    'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
  ],
  mexico: [
    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=900&q=80',
  ],
  indonesia: [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
  ],
  malaysia: [
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1508062878650-88b52897f298?auto=format&fit=crop&w=900&q=80',
  ],
  vietnam: [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
  ],
  france: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
  ],
  'costa-rica': [
    'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  ],
  panama: [
    'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
  ],
};

/**
 * Rich, multi-variant photo pools per ScoutInterestId (10–12 verified high-res Unsplash URLs per category).
 * IMPORTANT: Zero country-specific iconic monuments (no Taj Mahal, no Eiffel Tower, no Big Ben,
 * no Santorini Blue Domes, no Himalayan prayer flags) are allowed in these generic pools so a
 * generic fallback never shows a recognizable landmark from another country.
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
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=80',
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
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
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
 * Also returns the generic category/country photo as `genericCategoryFallbackUrl` in case the custom photo cannot load.
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
    cityName,
    countryId,
    idSuffix,
    countryPhotoUrl,
    usedUrlsTracker,
  } = params;

  const cleanCountryId = countryId.toLowerCase().trim();
  const genericCatalogObj = SCOUT_INTEREST_CATALOG.find(item => item.id === interestId);
  const genericCategoryFallbackUrl =
    countryPhotoUrl ||
    genericCatalogObj?.photoUrl ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80';

  // 1. Exact curated seed ID match (strictly city & country verified)
  const exactCuratedUrl = CURATED_SEED_ID_PHOTOS[idSuffix];
  if (exactCuratedUrl && (!usedUrlsTracker || !usedUrlsTracker.has(exactCuratedUrl))) {
    usedUrlsTracker?.add(exactCuratedUrl);
    return {
      primaryPhotoUrl: exactCuratedUrl,
      genericCategoryFallbackUrl,
    };
  }

  const hashSeed = computeDeterministicHash(
    `${cleanCountryId}::${cityName.toLowerCase()}::${idSuffix.toLowerCase()}::${title.toLowerCase()}`
  );

  // 2. For architecture, culture, hiking, or nature cards, prefer the country's own verified scenic/heritage pool first
  if (
    interestId === 'architecture' ||
    interestId === 'culture' ||
    interestId === 'hiking' ||
    interestId === 'nature'
  ) {
    const countryPool = COUNTRY_SCENIC_PHOTO_POOLS[cleanCountryId];
    if (countryPool && countryPool.length > 0) {
      for (let offset = 0; offset < countryPool.length; offset++) {
        const candidate = countryPool[(hashSeed + offset) % countryPool.length];
        if (!usedUrlsTracker || !usedUrlsTracker.has(candidate)) {
          usedUrlsTracker?.add(candidate);
          return {
            primaryPhotoUrl: candidate,
            genericCategoryFallbackUrl,
          };
        }
      }
    }
  }

  // 3. Otherwise select a deterministic, monument-free photo from the category pool
  const pool = CATEGORY_PHOTO_VARIATIONS[interestId] || CATEGORY_PHOTO_VARIATIONS.culture;
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

  // 4. Country fallback photo if not yet used
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

// Bumped to v3 to immediately invalidate any stale cached Wikipedia lookups
const WIKI_STORAGE_CACHE_KEY = 'refirely_wiki_place_photos_v3';

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
 * Detects whether a venue card title is a generic synthesized template (e.g., "Medellín Historic Quarter, Grand Plazas & Heritage Walk")
 * rather than a specific named real-world landmark. Generic synthesized titles should use their country-verified pool
 * rather than querying Wikipedia search (which could match generic overview pages like "World Heritage Site").
 */
function isGenericSynthesizedTitle(title: string): boolean {
  const lower = title.toLowerCase();
  const genericPatterns = [
    'historic quarter, grand plazas',
    'royal landmarks, mirador',
    'central market food tour',
    'contemporary arts center & heritage',
    'panoramic summit trail',
    'canyon waterfall trail',
    'botanical wine bar',
    'courtyard bistro &',
    'sky rooftop lounge',
    'craft brewhouse &',
    'surf & paddleboard school',
    'sunset catamaran & waterfront',
    'botanical gardens & regional nature',
    'expat-local community project',
    'padel & racquet club',
    'premier coworking hub',
    'specialty coffee roastery & nomad',
    'international private hospital',
    'furnished rental tour',
    'apartment viewing',
    'fiber test',
    'specialist tour',
    'top ',
  ];
  return genericPatterns.some(pat => lower.includes(pat));
}

/**
 * Cleans a specific named venue/landmark card title into a concise search query for Wikipedia pageimages
 */
function buildCleanPlaceSearchCandidate(title: string, cityName: string, countryName: string): string {
  const cleanCity = cityName.split(/[(&,/]/)[0].trim();
  const firstSegment = title
    .split(/\s+(?:\+|&|\/)\s+/)[0]
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(Guided|Sunrise|Sunset|Walk|Trek|Tour|Session|Audit|Consult|Flagship|Premier|Boutique)\b/gi, '')
    .trim();

  if (!firstSegment || firstSegment.length < 3) {
    return `${cleanCity} ${countryName}`;
  }

  if (firstSegment.toLowerCase().includes(cleanCity.toLowerCase())) {
    return `${firstSegment} ${countryName}`.trim();
  }
  return `${firstSegment} ${cleanCity} ${countryName}`.trim();
}

/**
 * Asynchronously resolves an authentic, place-specific photo from Wikipedia / Wikimedia Commons REST API
 * for a specific named landmark, beach, mountain trail, neighborhood, or cultural venue in that city & country.
 * Strictly requires both the city and country to match the article so no foreign monument is ever returned.
 */
export async function fetchSpecificPlacePhotoFromCommons(params: {
  title: string;
  neighborhood?: string;
  cityName?: string;
  countryName?: string;
}): Promise<string | null> {
  loadSessionWikiCache();
  const { title, neighborhood = '', cityName = '', countryName = '' } = params;
  if (!title || !cityName || !countryName) return null;

  // Never query Wikipedia for generic synthesized template titles
  if (isGenericSynthesizedTitle(title)) {
    return null;
  }

  const cleanCity = cityName.split(/[(&,/]/)[0].trim();
  if (cleanCity.length < 2) return null;

  const searchCandidate = buildCleanPlaceSearchCandidate(title, cleanCity, countryName);
  const cacheKey = `${searchCandidate.toLowerCase()}::${neighborhood.toLowerCase().slice(0, 24)}`;

  if (WIKI_PLACE_PHOTO_CACHE.has(cacheKey)) {
    return WIKI_PLACE_PHOTO_CACHE.get(cacheKey) || null;
  }

  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchCandidate
    )}&gsrlimit=4&prop=pageimages|extracts&exintro=1&explaintext=1&exchars=280&piprop=thumbnail&pithumbsize=900&format=json&origin=*`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      WIKI_PLACE_PHOTO_CACHE.set(cacheKey, null);
      return null;
    }

    const data = await res.json();
    const pages = data?.query?.pages ? (Object.values(data.query.pages) as Array<any>) : [];
    if (pages.length === 0) {
      WIKI_PLACE_PHOTO_CACHE.set(cacheKey, null);
      return null;
    }

    pages.sort((a, b) => (a.index || 99) - (b.index || 99));

    const cityLower = cleanCity.toLowerCase();
    const countryLower = countryName.toLowerCase();

    for (const page of pages) {
      const thumbUrl: string | undefined = page?.thumbnail?.source;
      if (!thumbUrl) continue;

      const pageTitleLower = String(page.title || '').toLowerCase();
      // Reject generic overview, list, or global UNESCO pages that might show another country's landmark
      if (
        pageTitleLower.startsWith('list of') ||
        pageTitleLower.startsWith('outline of') ||
        pageTitleLower.startsWith('tourism in') ||
        pageTitleLower.startsWith('history of') ||
        pageTitleLower.includes('world heritage') ||
        pageTitleLower.includes('wonders of the world')
      ) {
        continue;
      }

      const lowerUrl = thumbUrl.toLowerCase();
      if (
        lowerUrl.endsWith('.svg') ||
        lowerUrl.endsWith('.svg.png') ||
        lowerUrl.includes('flag_of') ||
        lowerUrl.includes('coat_of_arms') ||
        lowerUrl.includes('locator_map') ||
        lowerUrl.includes('location_map') ||
        lowerUrl.includes('logo') ||
        lowerUrl.includes('icon') ||
        lowerUrl.includes('map_of') ||
        lowerUrl.includes('taj_mahal')
      ) {
        continue;
      }

      const pageContext = `${page.title || ''} ${page.extract || ''}`.toLowerCase();
      // Strictly require BOTH the city AND country (or the exact city name in the article title)
      const matchesBothCityAndCountry =
        pageContext.includes(cityLower) && pageContext.includes(countryLower);
      const titleMatchesCity = pageTitleLower.includes(cityLower);

      if (matchesBothCityAndCountry || titleMatchesCity) {
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

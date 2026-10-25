import React, { useState } from 'react';
import { Country } from '../types';

interface CountryThumbnailProps {
  country: Country;
  className?: string;
  children?: React.ReactNode;
  hideLandmarkLabel?: boolean;
}

interface CountryPhotoConfig {
  photoUrl: string;
  fallbackPhotoUrl: string;
  landmarkLabel: string;
  gradientFallback: string;
}

const COUNTRY_PHOTOS: Record<string, CountryPhotoConfig> = {
  portugal: {
    photoUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Lisbon & Algarve Coast',
    gradientFallback: 'from-amber-900 via-slate-900 to-teal-950',
  },
  spain: {
    photoUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Andalusia & Costa del Sol',
    gradientFallback: 'from-orange-900 via-amber-950 to-slate-900',
  },
  thailand: {
    photoUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Andaman Bay & Chiang Mai',
    gradientFallback: 'from-teal-900 via-emerald-950 to-slate-900',
  },
  'costa-rica': {
    photoUrl: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Arenal & Central Valley',
    gradientFallback: 'from-emerald-900 via-teal-950 to-slate-900',
  },
  panama: {
    photoUrl: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Panama Bay & Boquete Highlands',
    gradientFallback: 'from-sky-900 via-blue-950 to-slate-900',
  },
  mexico: {
    photoUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'San Miguel & Lake Chapala',
    gradientFallback: 'from-amber-900 via-rose-950 to-slate-900',
  },
  greece: {
    photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Aegean Islands & Crete',
    gradientFallback: 'from-sky-800 via-blue-950 to-slate-900',
  },
  italy: {
    photoUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Amalfi Coast & Southern Italy',
    gradientFallback: 'from-amber-900 via-stone-900 to-slate-900',
  },
  malaysia: {
    photoUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1508062878650-88b52897f298?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Kuala Lumpur & Penang',
    gradientFallback: 'from-teal-900 via-cyan-950 to-slate-900',
  },
  colombia: {
    photoUrl: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1536708880921-03a9306ec47d?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Medellín & Cartagena Heritage',
    gradientFallback: 'from-emerald-900 via-amber-950 to-slate-900',
  },
  philippines: {
    photoUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Palawan & Visayan Islands',
    gradientFallback: 'from-cyan-900 via-teal-950 to-slate-900',
  },
  vietnam: {
    photoUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Ha Long Bay & Da Nang Coast',
    gradientFallback: 'from-teal-900 via-emerald-950 to-slate-900',
  },
  france: {
    photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Provence & Côte d’Azur',
    gradientFallback: 'from-indigo-900 via-slate-900 to-blue-950',
  },
  cyprus: {
    photoUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Paphos & Limassol Coast',
    gradientFallback: 'from-sky-900 via-cyan-950 to-slate-900',
  },
  ecuador: {
    photoUrl: 'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Cuenca & Andean Highlands',
    gradientFallback: 'from-blue-900 via-emerald-950 to-slate-900',
  },
  malta: {
    photoUrl: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Valletta Grand Harbour & Gozo',
    gradientFallback: 'from-amber-900 via-yellow-950 to-slate-900',
  },
  belize: {
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Ambergris Caye & Barrier Reef',
    gradientFallback: 'from-cyan-800 via-teal-950 to-slate-900',
  },
  croatia: {
    photoUrl: 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Dubrovnik & Dalmatian Coast',
    gradientFallback: 'from-sky-900 via-orange-950 to-slate-900',
  },
  uruguay: {
    photoUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Punta del Este & Montevideo Rambla',
    gradientFallback: 'from-blue-900 via-slate-900 to-sky-950',
  },
  indonesia: {
    photoUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Sanur Beach & Ubud Terraces',
    gradientFallback: 'from-emerald-900 via-teal-950 to-slate-900',
  },
  'dominican-republic': {
    photoUrl: 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Las Terrenas & Punta Cana',
    gradientFallback: 'from-sky-800 via-teal-950 to-slate-900',
  },
  slovenia: {
    photoUrl: 'https://images.unsplash.com/photo-1569388330292-79cc1ec67270?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Lake Bled & Ljubljana',
    gradientFallback: 'from-emerald-900 via-slate-900 to-teal-950',
  },
  chile: {
    photoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Viña del Mar & Andean Valleys',
    gradientFallback: 'from-indigo-900 via-slate-900 to-rose-950',
  },
  ireland: {
    photoUrl: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Kinsale Harbor & Wild Atlantic',
    gradientFallback: 'from-emerald-900 via-green-950 to-slate-900',
  },
  turkey: {
    photoUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Antalya & Bodrum Turquoise Coast',
    gradientFallback: 'from-cyan-900 via-amber-950 to-slate-900',
  },
  cambodia: {
    photoUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Siem Reap & Kampot Riverside',
    gradientFallback: 'from-amber-900 via-purple-950 to-slate-900',
  },
  argentina: {
    photoUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Buenos Aires & Bariloche Lakes',
    gradientFallback: 'from-sky-900 via-blue-950 to-slate-900',
  },
  albania: {
    photoUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Saranda & Albanian Riviera',
    gradientFallback: 'from-teal-900 via-sky-950 to-slate-900',
  },
  guatemala: {
    photoUrl: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Antigua & Lake Atitlán Volcanoes',
    gradientFallback: 'from-amber-900 via-emerald-950 to-slate-900',
  },
  taiwan: {
    photoUrl: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1508062878650-88b52897f298?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Taipei Skyline & East Rift Coast',
    gradientFallback: 'from-teal-900 via-slate-900 to-cyan-950',
  },
  montenegro: {
    photoUrl: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Bay of Kotor & Porto Montenegro',
    gradientFallback: 'from-sky-900 via-slate-900 to-teal-950',
  },
  bulgaria: {
    photoUrl: 'https://images.unsplash.com/photo-1563284223-333497472e88?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Plovdiv Old Town & Black Sea Coast',
    gradientFallback: 'from-amber-900 via-emerald-950 to-slate-900',
  },
  hungary: {
    photoUrl: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Budapest Danube & Thermal Baths',
    gradientFallback: 'from-amber-900 via-slate-900 to-orange-950',
  },
  austria: {
    photoUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Vienna & Salzkammergut Lakes',
    gradientFallback: 'from-indigo-900 via-slate-900 to-emerald-950',
  },
  switzerland: {
    photoUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Lake Lugano & Swiss Alps',
    gradientFallback: 'from-sky-900 via-slate-900 to-blue-950',
  },
  peru: {
    photoUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Miraflores Coast & Sacred Valley',
    gradientFallback: 'from-amber-900 via-emerald-950 to-slate-900',
  },
  brazil: {
    photoUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Florianópolis & Atlantic Coast',
    gradientFallback: 'from-emerald-900 via-teal-950 to-slate-900',
  },
  nicaragua: {
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Granada Colonial & Emerald Coast',
    gradientFallback: 'from-amber-900 via-sky-950 to-slate-900',
  },
  paraguay: {
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Asunción & Paraná Waterfront',
    gradientFallback: 'from-emerald-900 via-slate-900 to-sky-950',
  },
  honduras: {
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Roatán Island & Coral Barrier Reef',
    gradientFallback: 'from-cyan-800 via-teal-950 to-slate-900',
  },
  'sri-lanka': {
    photoUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Galle Fort & Ceylon Tea Highlands',
    gradientFallback: 'from-emerald-900 via-teal-950 to-slate-900',
  },
  japan: {
    photoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1508062878650-88b52897f298?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Fukuoka Bay, Kyoto & Mount Fuji',
    gradientFallback: 'from-rose-900 via-slate-900 to-indigo-950',
  },
  'south-korea': {
    photoUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Busan Haeundae & Jeju Island',
    gradientFallback: 'from-sky-900 via-slate-900 to-indigo-950',
  },
  laos: {
    photoUrl: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Luang Prabang & Mekong River',
    gradientFallback: 'from-amber-900 via-teal-950 to-slate-900',
  },
  mauritius: {
    photoUrl: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Grand Baie & Le Morne Coral Lagoon',
    gradientFallback: 'from-cyan-800 via-teal-950 to-slate-900',
  },
  'czech-republic': {
    photoUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Prague Charles Bridge & Karlovy Vary Spas',
    gradientFallback: 'from-amber-900 via-slate-900 to-indigo-950',
  },
  georgia: {
    photoUrl: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Tbilisi Old Town & Batumi Black Sea Coast',
    gradientFallback: 'from-rose-900 via-slate-900 to-amber-950',
  },
  andorra: {
    photoUrl: 'https://images.unsplash.com/photo-1548678967-f1aec58f6fb2?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Pyrenees Peaks & Escaldes Thermal Valley',
    gradientFallback: 'from-sky-900 via-slate-900 to-indigo-950',
  },
  romania: {
    photoUrl: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Brașov, Sibiu & Transylvanian Carpathians',
    gradientFallback: 'from-emerald-900 via-slate-900 to-amber-950',
  },
  poland: {
    photoUrl: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Kraków Royal Square & Gdańsk Baltic Pier',
    gradientFallback: 'from-rose-900 via-slate-900 to-amber-950',
  },
  estonia: {
    photoUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Tallinn Medieval Towers & Pärnu Baltic Spa',
    gradientFallback: 'from-sky-900 via-slate-900 to-cyan-950',
  },
  australia: {
    photoUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Sunshine Coast, Gold Coast & Sydney Harbour',
    gradientFallback: 'from-sky-800 via-teal-950 to-slate-900',
  },
  'new-zealand': {
    photoUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Bay of Plenty, Nelson & Southern Alps',
    gradientFallback: 'from-emerald-900 via-sky-950 to-slate-900',
  },
  singapore: {
    photoUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1508062878650-88b52897f298?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Marina Bay Gardens & Sentosa Cove',
    gradientFallback: 'from-teal-900 via-indigo-950 to-slate-900',
  },
  india: {
    photoUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Goa Palms, Kerala Backwaters & Pondicherry',
    gradientFallback: 'from-amber-900 via-teal-950 to-slate-900',
  },
  nepal: {
    photoUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Pokhara Phewa Lake & Annapurna Himalayas',
    gradientFallback: 'from-sky-900 via-indigo-950 to-slate-900',
  },
  barbados: {
    photoUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Platinum West Coast & Carlisle Bay',
    gradientFallback: 'from-cyan-800 via-blue-950 to-slate-900',
  },
  bahamas: {
    photoUrl: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Exuma Cays, Nassau & Abaco Marinas',
    gradientFallback: 'from-cyan-800 via-teal-950 to-slate-900',
  },
  curacao: {
    photoUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Willemstad Handelskade & Jan Thiel Bay',
    gradientFallback: 'from-sky-800 via-amber-950 to-slate-900',
  },
  'el-salvador': {
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Surf City Pacific Coast & Suchitoto Highlands',
    gradientFallback: 'from-indigo-900 via-teal-950 to-slate-900',
  },
  'united-arab-emirates': {
    photoUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Dubai Marina, Palm Jumeirah & Abu Dhabi Corniche',
    gradientFallback: 'from-amber-900 via-slate-900 to-cyan-950',
  },
  morocco: {
    photoUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Marrakech Riads, Agadir Bay & Tangier Coast',
    gradientFallback: 'from-orange-900 via-amber-950 to-slate-900',
  },
  'south-africa': {
    photoUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Cape Town Table Mountain & Franschhoek Winelands',
    gradientFallback: 'from-emerald-900 via-sky-950 to-slate-900',
  },
  fiji: {
    photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Port Denarau, Savusavu & Mamanuca Lagoons',
    gradientFallback: 'from-cyan-800 via-teal-950 to-slate-900',
  },
  'st-kitts-and-nevis': {
    photoUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Frigate Bay Peninsula & Nevis Peak',
    gradientFallback: 'from-teal-900 via-blue-950 to-slate-900',
  },
  aruba: {
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Eagle Beach, Palm Beach & Oranjestad Marina',
    gradientFallback: 'from-sky-800 via-cyan-950 to-slate-900',
  },
  'cayman-islands': {
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Seven Mile Beach, Camana Bay & Grand Cayman',
    gradientFallback: 'from-blue-900 via-cyan-950 to-slate-900',
  },
  jamaica: {
    photoUrl: 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Montego Bay, Negril Cliffs & Blue Mountains',
    gradientFallback: 'from-emerald-900 via-amber-950 to-slate-900',
  },
  'saint-lucia': {
    photoUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'UNESCO Pitons, Rodney Bay & Marigot Lagoon',
    gradientFallback: 'from-teal-900 via-emerald-950 to-slate-900',
  },
  grenada: {
    photoUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'St. George’s Carenage & Grand Anse Beach',
    gradientFallback: 'from-amber-900 via-teal-950 to-slate-900',
  },
  'antigua-and-barbuda': {
    photoUrl: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'English Harbour Dockyard & Jolly Harbour',
    gradientFallback: 'from-sky-800 via-blue-950 to-slate-900',
  },
  bermuda: {
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Horseshoe Bay Pink Sands & Hamilton Harbour',
    gradientFallback: 'from-rose-900 via-sky-950 to-slate-900',
  },
  seychelles: {
    photoUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Eden Island Marina, Mahé & La Digue Boulders',
    gradientFallback: 'from-teal-900 via-cyan-950 to-slate-900',
  },
  serbia: {
    photoUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Belgrade Danube Confluence & Novi Sad Fortress',
    gradientFallback: 'from-indigo-900 via-slate-900 to-amber-950',
  },
  slovakia: {
    photoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
    fallbackPhotoUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=900&q=80',
    landmarkLabel: 'Bratislava Castle, Piešťany Spas & High Tatras',
    gradientFallback: 'from-sky-900 via-slate-900 to-indigo-950',
  },
};

const DEFAULT_PHOTO: CountryPhotoConfig = {
  photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  fallbackPhotoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80',
  landmarkLabel: 'Verified Retirement Haven',
  gradientFallback: 'from-teal-900 via-slate-900 to-slate-950',
};

export function getCountryPhotoConfig(countryId: string, customImageUrl?: string): {
  photoUrl: string;
  fallbackPhotoUrl: string;
  landmarkLabel: string;
  gradientFallback: string;
  candidateUrls: string[];
} {
  const config = COUNTRY_PHOTOS[countryId] || DEFAULT_PHOTO;
  const candidateUrls = Array.from(
    new Set(
      [
        customImageUrl,
        config.photoUrl,
        config.fallbackPhotoUrl,
        DEFAULT_PHOTO.photoUrl,
        DEFAULT_PHOTO.fallbackPhotoUrl,
      ].filter((u): u is string => Boolean(u && u.trim()))
    )
  );
  return {
    photoUrl: candidateUrls[0] || DEFAULT_PHOTO.photoUrl,
    fallbackPhotoUrl: config.fallbackPhotoUrl,
    landmarkLabel: config.landmarkLabel,
    gradientFallback: config.gradientFallback,
    candidateUrls,
  };
}

export const CountryThumbnail: React.FC<CountryThumbnailProps> = ({
  country,
  className = 'h-48',
  children,
  hideLandmarkLabel = false,
}) => {
  const config = COUNTRY_PHOTOS[country.id] || DEFAULT_PHOTO;
  const [attempt, setAttempt] = useState<number>(0);

  const sources = [
    country.imageUrl,
    config.photoUrl,
    config.fallbackPhotoUrl,
  ].filter(Boolean) as string[];

  const activeSrc = attempt < sources.length ? sources[attempt] : null;

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${config.gradientFallback} select-none ${className}`}
    >
      {activeSrc && (
        <img
          src={activeSrc}
          alt={`${country.name} — ${config.landmarkLabel}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setAttempt(prev => prev + 1)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      )}

      {/* Measured Contrast Scrim for WCAG AA Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/15 pointer-events-none" />

      {/* Subtle Landmark Kicker Top-Left (hidden when card renders custom top badges) */}
      {!hideLandmarkLabel && (
        <div className="absolute top-3 left-3.5 text-[11px] font-medium text-white/90 tracking-wide drop-shadow-xs pointer-events-none">
          {config.landmarkLabel}
        </div>
      )}

      {/* Overlaid Content Slot */}
      {children}
    </div>
  );
};

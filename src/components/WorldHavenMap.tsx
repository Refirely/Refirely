import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere } from 'react-simple-maps';
import worldGeo from 'world-atlas/countries-110m.json';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Country } from '../types';
import { CountryFlag } from './CountryFlag';
import {
  ArrowRight,
  X,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Globe2,
  Map as MapIcon,
  Compass,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Tag,
  Maximize2,
  Minimize2,
  Navigation,
} from 'lucide-react';

// Country geographic coordinates [longitude, latitude]
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  portugal: [-8.2245, 39.3999],
  spain: [-3.7492, 40.4637],
  thailand: [100.9925, 15.8700],
  'costa-rica': [-84.0534, 9.9489],
  panama: [-80.2821, 8.8380],
  mexico: [-102.5528, 23.6345],
  greece: [21.8243, 39.0742],
  italy: [12.5674, 41.8719],
  malaysia: [102.4758, 4.2105],
  colombia: [-74.2973, 4.5709],
  philippines: [121.7740, 12.8797],
  vietnam: [108.2772, 14.0583],
  france: [2.2137, 46.2276],
  cyprus: [33.4299, 35.1264],
  ecuador: [-78.1834, -1.8312],
  malta: [14.3754, 35.9375],
  belize: [-88.4976, 17.1899],
  croatia: [15.2000, 45.1000],
  uruguay: [-55.7658, -32.5228],
  indonesia: [113.9213, -0.7893],
  'dominican-republic': [-70.1627, 18.7357],
  slovenia: [14.9955, 46.1512],
  chile: [-71.5430, -35.6751],
  ireland: [-8.2439, 53.4129],
  turkey: [35.2433, 38.9637],
  cambodia: [104.9910, 12.5657],
  argentina: [-63.6167, -38.4161],
  albania: [20.1683, 41.1533],
  guatemala: [-90.2308, 15.7835],
  taiwan: [120.9605, 23.6978],
  montenegro: [19.3744, 42.7087],
  bulgaria: [25.4858, 42.7339],
  hungary: [19.5033, 47.1625],
  austria: [14.5501, 47.5162],
  switzerland: [8.2275, 46.8182],
  peru: [-75.0152, -9.1900],
  brazil: [-48.5480, -27.5954],
  nicaragua: [-85.2072, 12.8654],
  paraguay: [-57.5759, -25.2637],
  honduras: [-86.5376, 16.3298],
  'sri-lanka': [80.7718, 7.8731],
  japan: [135.7681, 35.0116],
  'south-korea': [129.0756, 35.1796],
  laos: [102.1347, 19.8856],
  mauritius: [57.5522, -20.3484],
  'czech-republic': [15.4730, 49.8175],
  georgia: [43.3569, 42.3154],
  andorra: [1.5218, 42.5063],
  romania: [24.9668, 45.9432],
  poland: [19.1451, 51.9194],
  estonia: [25.0136, 58.5953],
  australia: [133.7751, -25.2744],
  'new-zealand': [174.8860, -40.9006],
  singapore: [103.8198, 1.3521],
  india: [78.9629, 20.5937],
  nepal: [84.1240, 28.3949],
  barbados: [-59.5432, 13.1939],
  bahamas: [-77.3963, 25.0343],
  curacao: [-68.9900, 12.1696],
  'el-salvador': [-88.8965, 13.7942],
  'united-arab-emirates': [54.3773, 24.4539],
  morocco: [-7.9811, 31.6295],
  'south-africa': [18.4241, -33.9249],
  fiji: [177.9844, -17.7134],
  'st-kitts-and-nevis': [-62.7830, 17.3578],
  aruba: [-69.9683, 12.5211],
  'cayman-islands': [-81.2546, 19.3133],
  jamaica: [-77.2975, 18.1096],
  'saint-lucia': [-60.9789, 13.9094],
  grenada: [-61.6790, 12.1165],
  'antigua-and-barbuda': [-61.7964, 17.0608],
  bermuda: [-64.7505, 32.3078],
  seychelles: [55.4920, -4.6796],
  serbia: [20.4489, 44.7866],
  slovakia: [17.1077, 48.1486],
  monaco: [7.4246, 43.7384],
  'united-kingdom': [-1.1743, 52.3555],
  germany: [10.4515, 51.1657],
  netherlands: [5.2913, 52.1326],
  belgium: [4.4699, 50.5039],
  latvia: [24.1052, 56.9496],
  lithuania: [25.2797, 54.6872],
  'north-macedonia': [21.4254, 41.6086],
  'bosnia-and-herzegovina': [17.6791, 43.9159],
  armenia: [44.5152, 40.1872],
  tunisia: [10.1815, 36.8065],
  namibia: [17.0658, -22.5609],
  vanuatu: [168.3273, -17.7333],
  maldives: [73.5093, 4.1755],
  'turks-and-caicos': [-72.1859, 21.7922],
  dominica: [-61.3710, 15.4150],
  oman: [58.4059, 23.5880],
  'cape-verde': [-23.6052, 15.1201],
  luxembourg: [6.1296, 49.6116],
  canada: [-123.3656, 48.4284],
  jordan: [35.9106, 31.9539],
  kenya: [36.8219, -1.2921],
  tanzania: [39.2083, -6.1659],
  'french-polynesia': [-149.5665, -17.5516],
  finland: [24.9384, 60.1699],
  'puerto-rico': [-66.5901, 18.2208],
  'us-virgin-islands': [-64.8963, 18.3358],
  bonaire: [-68.2624, 12.2019],
  'sint-maarten': [-63.0548, 18.0425],
  anguilla: [-63.0686, 18.2206],
  'british-virgin-islands': [-64.6399, 18.4207],
  martinique: [-61.0242, 14.6415],
  guadeloupe: [-61.5510, 16.2650],
  'trinidad-and-tobago': [-61.2225, 10.6918],
  gibraltar: [-5.3536, 36.1408],
  'san-marino': [12.4578, 43.9424],
  liechtenstein: [9.5554, 47.1660],
  sweden: [18.0686, 59.3293],
  denmark: [12.5683, 55.6761],
  norway: [10.7522, 59.9139],
  iceland: [-21.9426, 64.1466],
  'hong-kong': [114.1694, 22.3193],
  samoa: [-171.7514, -13.8333],
  'cook-islands': [-159.7777, -21.2367],
  bahrain: [50.5577, 26.0667],
  moldova: [28.8638, 47.0105],
  kosovo: [21.1655, 42.6629],
  ukraine: [24.0297, 49.8397],
  belarus: [27.5615, 53.9045],
  russia: [39.7231, 43.5855],
  azerbaijan: [49.8671, 40.4093],
  'vatican-city': [12.4534, 41.9029],
  jersey: [-2.1312, 49.2144],
  guernsey: [-2.5853, 49.4657],
  'isle-of-man': [-4.5481, 54.2361],
  'faroe-islands': [-6.7716, 62.0079],
  'united-states': [-81.5158, 27.6648],
  bolivia: [-66.1568, -17.3895],
  guyana: [-58.1551, 6.8013],
  suriname: [-55.2038, 5.8520],
  venezuela: [-63.8697, 11.0170],
  'french-guiana': [-52.3333, 4.9372],
  'saint-vincent-and-the-grenadines': [-61.2248, 13.1579],
  cuba: [-82.3666, 23.1136],
  haiti: [-72.2016, 19.7592],
  'st-barts': [-62.8498, 17.8962],
  montserrat: [-62.1874, 16.7425],
  greenland: [-51.7216, 64.1835],
  brunei: [114.9481, 4.9031],
  'timor-leste': [125.5736, -8.5569],
  myanmar: [96.1951, 16.8661],
  'christmas-island': [105.6904, -10.4475],
  // Tier 1 (26)
  qatar: [51.5310, 25.2854],
  'saudi-arabia': [45.0792, 23.8859],
  kuwait: [47.9774, 29.3759],
  china: [109.5119, 18.2528],
  macau: [113.5439, 22.1987],
  kazakhstan: [76.8897, 43.2389],
  uzbekistan: [66.9750, 39.6542],
  kyrgyzstan: [74.5698, 42.8746],
  bhutan: [89.6393, 27.4728],
  mongolia: [106.9057, 47.8864],
  botswana: [25.9231, -24.6282],
  rwanda: [30.0619, -1.9441],
  ghana: [-0.1870, 5.6037],
  senegal: [-17.4677, 14.7167],
  egypt: [33.6775, 27.3942],
  zambia: [28.3228, -15.3875],
  gambia: [-16.6881, 13.4549],
  uganda: [32.4637, 0.0512],
  madagascar: [48.2738, -13.3250],
  reunion: [55.5364, -21.1151],
  palau: [134.4789, 7.3419],
  tonga: [-175.1982, -21.1789],
  guam: [144.7937, 13.4443],
  'northern-mariana-islands': [145.7545, 15.1778],
  'new-caledonia': [166.4580, -22.2758],
  'norfolk-island': [167.9547, -29.0408],
  // Tier 2 (36)
  'cote-divoire': [-4.0083, 5.3600],
  benin: [2.3912, 6.3703],
  togo: [1.2255, 6.1375],
  'sao-tome-and-principe': [6.7273, 0.3365],
  malawi: [33.7741, -13.9626],
  eswatini: [31.1367, -26.3054],
  lesotho: [27.4833, -29.3167],
  algeria: [3.0588, 36.7538],
  angola: [13.2343, -8.8390],
  gabon: [9.4673, 0.4162],
  'republic-of-the-congo': [15.2832, -4.2634],
  cameroon: [9.9105, 2.9375],
  comoros: [43.2551, -11.7172],
  djibouti: [43.1456, 11.5721],
  'equatorial-guinea': [8.7832, 3.7504],
  ethiopia: [38.7578, 8.9806],
  guinea: [-13.5784, 9.6412],
  'guinea-bissau': [-15.5984, 11.8636],
  liberia: [-10.7969, 6.3004],
  mauritania: [-15.9582, 18.0735],
  'sierra-leone': [-13.2317, 8.4657],
  zimbabwe: [31.0492, -17.8216],
  mozambique: [32.5732, -25.9692],
  tajikistan: [68.7870, 38.5598],
  turkmenistan: [58.3261, 37.9601],
  micronesia: [158.1610, 6.9640],
  'marshall-islands': [171.3803, 7.0897],
  'solomon-islands': [159.9729, -9.4456],
  kiribati: [172.9717, 1.3382],
  tuvalu: [179.1942, -8.5211],
  nauru: [166.9315, -0.5228],
  niue: [-169.9187, -19.0544],
  'american-samoa': [-170.7020, -14.2756],
  'falkland-islands': [-57.8517, -51.6977],
  'saint-helena': [-5.7089, -15.9650],
  'saint-pierre-and-miquelon': [-56.1778, 46.7778],
};

// Numeric ISO IDs in 110m world atlas
const COUNTRY_ISO_MAP: Record<string, string> = {
  '620': 'portugal',
  '724': 'spain',
  '764': 'thailand',
  '188': 'costa-rica',
  '591': 'panama',
  '484': 'mexico',
  '300': 'greece',
  '380': 'italy',
  '458': 'malaysia',
  '170': 'colombia',
  '608': 'philippines',
  '704': 'vietnam',
  '250': 'france',
  '196': 'cyprus',
  '218': 'ecuador',
  '470': 'malta',
  '084': 'belize',
  '191': 'croatia',
  '858': 'uruguay',
  '360': 'indonesia',
  '214': 'dominican-republic',
  '705': 'slovenia',
  '152': 'chile',
  '372': 'ireland',
  '792': 'turkey',
  '116': 'cambodia',
  '032': 'argentina',
  '008': 'albania',
  '320': 'guatemala',
  '158': 'taiwan',
  '499': 'montenegro',
  '100': 'bulgaria',
  '348': 'hungary',
  '040': 'austria',
  '756': 'switzerland',
  '604': 'peru',
  '076': 'brazil',
  '558': 'nicaragua',
  '600': 'paraguay',
  '340': 'honduras',
  '144': 'sri-lanka',
  '392': 'japan',
  '410': 'south-korea',
  '418': 'laos',
  '480': 'mauritius',
  '203': 'czech-republic',
  '268': 'georgia',
  '020': 'andorra',
  '642': 'romania',
  '616': 'poland',
  '233': 'estonia',
  '036': 'australia',
  '554': 'new-zealand',
  '702': 'singapore',
  '356': 'india',
  '524': 'nepal',
  '052': 'barbados',
  '044': 'bahamas',
  '531': 'curacao',
  '222': 'el-salvador',
  '784': 'united-arab-emirates',
  '504': 'morocco',
  '710': 'south-africa',
  '242': 'fiji',
  '659': 'st-kitts-and-nevis',
  '533': 'aruba',
  '136': 'cayman-islands',
  '388': 'jamaica',
  '662': 'saint-lucia',
  '308': 'grenada',
  '028': 'antigua-and-barbuda',
  '060': 'bermuda',
  '690': 'seychelles',
  '688': 'serbia',
  '703': 'slovakia',
  '492': 'monaco',
  '826': 'united-kingdom',
  '276': 'germany',
  '528': 'netherlands',
  '056': 'belgium',
  '428': 'latvia',
  '440': 'lithuania',
  '807': 'north-macedonia',
  '070': 'bosnia-and-herzegovina',
  '051': 'armenia',
  '788': 'tunisia',
  '516': 'namibia',
  '548': 'vanuatu',
  '462': 'maldives',
  '796': 'turks-and-caicos',
  '212': 'dominica',
  '512': 'oman',
  '132': 'cape-verde',
  '442': 'luxembourg',
  '124': 'canada',
  '400': 'jordan',
  '404': 'kenya',
  '834': 'tanzania',
  '258': 'french-polynesia',
  '246': 'finland',
  '630': 'puerto-rico',
  '850': 'us-virgin-islands',
  '535': 'bonaire',
  '534': 'sint-maarten',
  '660': 'anguilla',
  '092': 'british-virgin-islands',
  '474': 'martinique',
  '312': 'guadeloupe',
  '780': 'trinidad-and-tobago',
  '292': 'gibraltar',
  '674': 'san-marino',
  '438': 'liechtenstein',
  '752': 'sweden',
  '208': 'denmark',
  '578': 'norway',
  '352': 'iceland',
  '344': 'hong-kong',
  '882': 'samoa',
  '184': 'cook-islands',
  '048': 'bahrain',
  '498': 'moldova',
  '804': 'ukraine',
  '112': 'belarus',
  '643': 'russia',
  '031': 'azerbaijan',
  '336': 'vatican-city',
  '832': 'jersey',
  '831': 'guernsey',
  '833': 'isle-of-man',
  '234': 'faroe-islands',
  '840': 'united-states',
  '068': 'bolivia',
  '328': 'guyana',
  '740': 'suriname',
  '862': 'venezuela',
  '254': 'french-guiana',
  '670': 'saint-vincent-and-the-grenadines',
  '192': 'cuba',
  '332': 'haiti',
  '652': 'st-barts',
  '500': 'montserrat',
  '304': 'greenland',
  '096': 'brunei',
  '626': 'timor-leste',
  '104': 'myanmar',
  '162': 'christmas-island',
  // Tier 1 & Tier 2 ISO Numeric Polygon Codes
  '634': 'qatar',
  '682': 'saudi-arabia',
  '414': 'kuwait',
  '156': 'china',
  '446': 'macau',
  '398': 'kazakhstan',
  '860': 'uzbekistan',
  '417': 'kyrgyzstan',
  '064': 'bhutan',
  '496': 'mongolia',
  '072': 'botswana',
  '646': 'rwanda',
  '288': 'ghana',
  '686': 'senegal',
  '818': 'egypt',
  '894': 'zambia',
  '270': 'gambia',
  '800': 'uganda',
  '450': 'madagascar',
  '638': 'reunion',
  '585': 'palau',
  '776': 'tonga',
  '316': 'guam',
  '580': 'northern-mariana-islands',
  '540': 'new-caledonia',
  '574': 'norfolk-island',
  '384': 'cote-divoire',
  '204': 'benin',
  '768': 'togo',
  '678': 'sao-tome-and-principe',
  '454': 'malawi',
  '748': 'eswatini',
  '426': 'lesotho',
  '012': 'algeria',
  '024': 'angola',
  '266': 'gabon',
  '178': 'republic-of-the-congo',
  '120': 'cameroon',
  '174': 'comoros',
  '262': 'djibouti',
  '226': 'equatorial-guinea',
  '231': 'ethiopia',
  '324': 'guinea',
  '624': 'guinea-bissau',
  '430': 'liberia',
  '478': 'mauritania',
  '694': 'sierra-leone',
  '716': 'zimbabwe',
  '508': 'mozambique',
  '762': 'tajikistan',
  '795': 'turkmenistan',
  '583': 'micronesia',
  '584': 'marshall-islands',
  '090': 'solomon-islands',
  '296': 'kiribati',
  '798': 'tuvalu',
  '520': 'nauru',
  '570': 'niue',
  '016': 'american-samoa',
  '238': 'falkland-islands',
  '654': 'saint-helena',
  '666': 'saint-pierre-and-miquelon',
};

// Starfield coordinates generated deterministically for the Google Earth cosmos backdrop
const STARFIELD_POINTS = Array.from({ length: 75 }, (_, i) => ({
  id: i,
  left: `${((i * 37 + 13) % 98) + 1}%`,
  top: `${((i * 53 + 7) % 96) + 2}%`,
  size: i % 5 === 0 ? 2.4 : i % 2 === 0 ? 1.6 : 1.1,
  opacity: i % 4 === 0 ? 0.85 : 0.45,
  delay: `${(i % 7) * 0.6}s`,
}));

// Check if a [lon, lat] point is on the visible front hemisphere of the 3D Orthographic Globe
function isPointVisibleOnGlobe(
  coords: [number, number],
  centerLon: number,
  centerLat: number
): boolean {
  const toRad = Math.PI / 180;
  const lam = coords[0] * toRad;
  const phi = coords[1] * toRad;
  const lam0 = centerLon * toRad;
  const phi0 = centerLat * toRad;

  const cosC =
    Math.sin(phi0) * Math.sin(phi) +
    Math.cos(phi0) * Math.cos(phi) * Math.cos(lam - lam0);

  return cosC > 0.02;
}

export const WorldHavenMap: React.FC = () => {
  const {
    countries,
    filteredCountries,
    navigateToCountry,
    selectedRegion,
    setSelectedRegion,
  } = useApp();

  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [selectedPinCountry, setSelectedPinCountry] = useState<Country | null>(null);

  // Google Earth View Mode: 'globe' (3D Orthographic Earth) or 'satellite-flat' (2D Wide Satellite Atlas)
  const [viewMode, setViewMode] = useState<'globe' | 'satellite-flat'>('globe');
  const [isExpandedHeight, setIsExpandedHeight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [countryPickerQuery, setCountryPickerQuery] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Camera state: centerLon & centerLat are the geographic coordinates facing the viewer
  // In d3-geo projectionConfig.rotate, rotate is [-centerLon, -centerLat, 0]
  const [camera, setCamera] = useState<{
    centerLon: number;
    centerLat: number;
    zoom: number;
  }>({
    centerLon: 8,
    centerLat: 24,
    zoom: 1.15,
  });

  // Drag rotation state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    startLon: number;
    startLat: number;
    moved: boolean;
  } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);

  const filteredIds = useMemo(
    () => new Set(filteredCountries.map(c => c.id)),
    [filteredCountries]
  );

  // Smoothly animate camera to target [lon, lat, zoom]
  const flyToLocation = useCallback(
    (targetLon: number, targetLat: number, targetZoom?: number) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setAutoRotate(false);

      const startLon = camera.centerLon;
      const startLat = camera.centerLat;
      const startZoom = camera.zoom;
      const endZoom = targetZoom ?? camera.zoom;

      // Shortest longitude delta across anti-meridian
      let deltaLon = ((targetLon - startLon + 540) % 360) - 180;
      const deltaLat = Math.max(-75, Math.min(75, targetLat)) - startLat;
      const deltaZoom = endZoom - startZoom;

      const duration = 680;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // Cubic ease-out for buttery Google Earth camera flight
        const ease = 1 - Math.pow(1 - t, 3);

        let nextLon = startLon + deltaLon * ease;
        if (nextLon > 180) nextLon -= 360;
        if (nextLon < -180) nextLon += 360;

        setCamera({
          centerLon: nextLon,
          centerLat: Math.max(-75, Math.min(75, startLat + deltaLat * ease)),
          zoom: Math.max(0.75, Math.min(9, startZoom + deltaZoom * ease)),
        });

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [camera.centerLon, camera.centerLat, camera.zoom]
  );

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Optional gentle Google Earth orbital auto-rotation
  useEffect(() => {
    if (!autoRotate || isDragging || hoveredCountry) return;
    let rafId: number;
    let lastTime = performance.now();

    const spin = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setCamera(prev => {
        let nextLon = prev.centerLon + dt * 9;
        if (nextLon > 180) nextLon -= 360;
        return { ...prev, centerLon: nextLon };
      });
      rafId = requestAnimationFrame(spin);
    };

    rafId = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(rafId);
  }, [autoRotate, isDragging, hoveredCountry]);

  // Native wheel zoom on the Google Earth viewport when holding Ctrl/Meta or scrolling directly
  useEffect(() => {
    const el = mapViewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      const zoomFactor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
      setCamera(prev => ({
        ...prev,
        zoom: Math.max(0.75, Math.min(9, Number((prev.zoom * zoomFactor).toFixed(3)))),
      }));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Pointer drag handlers for 3D globe rotation / 2D satellite panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on floating UI overlays or buttons
    if ((e.target as HTMLElement).closest('[data-map-ui="true"]')) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAutoRotate(false);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startLon: camera.centerLon,
      startLat: camera.centerLat,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
    }

    // Sensitivity scales inversely with zoom level for ultra-precise high-zoom navigation
    const sensitivity = 0.28 / Math.pow(camera.zoom, 0.78);
    let nextLon = dragStartRef.current.startLon - dx * sensitivity;
    if (nextLon > 180) nextLon -= 360;
    if (nextLon < -180) nextLon += 360;

    const nextLat = Math.max(
      -75,
      Math.min(75, dragStartRef.current.startLat + dy * sensitivity)
    );

    setCamera(prev => ({
      ...prev,
      centerLon: nextLon,
      centerLat: nextLat,
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Region centers and zoom levels
  const handleRegionFocus = (region: string) => {
    setSelectedRegion(region);
    if (region === 'Europe') {
      flyToLocation(14, 46, 2.75);
    } else if (region === 'Southeast Asia') {
      flyToLocation(108, 12, 2.55);
    } else if (region === 'Americas' || region === 'North & Central America') {
      flyToLocation(-76, 16, 2.15);
    } else if (region === 'South America') {
      flyToLocation(-62, -20, 2.1);
    } else if (region === 'Asia & Middle East') {
      flyToLocation(78, 25, 2.0);
    } else if (region === 'Africa') {
      flyToLocation(22, -6, 2.0);
    } else if (region === 'Oceania') {
      flyToLocation(155, -24, 2.2);
    } else {
      flyToLocation(8, 24, 1.15);
    }
  };

  // Select a country and smoothly rotate/zoom the Google Earth globe to it
  const handleSelectCountry = (c: Country, zoomToCountry: boolean = true) => {
    if (dragStartRef.current?.moved) return;
    setSelectedPinCountry(c);
    setIsPickerOpen(false);
    const coords = COUNTRY_COORDINATES[c.id];
    if (coords && zoomToCountry) {
      const targetZoom = Math.max(camera.zoom, 2.8);
      flyToLocation(coords[0], coords[1], targetZoom);
    }
  };

  const handleZoomIn = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.min(9, Number((prev.zoom * 1.35).toFixed(2))),
    }));
  };

  const handleZoomOut = () => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.75, Number((prev.zoom / 1.35).toFixed(2))),
    }));
  };

  const handleResetView = () => {
    setSelectedPinCountry(null);
    flyToLocation(8, 24, 1.15);
  };

  const handleNudgeRotation = (dLon: number, dLat: number) => {
    const stepScale = 1 / Math.pow(camera.zoom, 0.65);
    let nextLon = camera.centerLon + dLon * stepScale;
    if (nextLon > 180) nextLon -= 360;
    if (nextLon < -180) nextLon += 360;
    const nextLat = Math.max(-75, Math.min(75, camera.centerLat + dLat * stepScale));
    flyToLocation(nextLon, nextLat, camera.zoom);
  };

  const activeModalCountry = selectedPinCountry || hoveredCountry;

  // Multi-colored luminous palette matching the website's signature design system
  const getCountryColor = (
    c: Country | undefined,
    isSelected: boolean,
    isFilteredMatch: boolean,
    isHovered: boolean = false
  ) => {
    if (isSelected) return '#ec4899'; // Luminous Rose/Magenta for active selection
    if (isHovered) return '#22d3ee'; // Electric Cyan highlight on hover
    if (!isFilteredMatch) return '#334155'; // Muted satellite slate if filtered out

    switch (c?.region) {
      case 'Europe':
        return '#3b82f6'; // Brilliant Indigo / Sapphire Blue
      case 'Americas':
      case 'North & Central America':
      case 'South America':
        return '#f59e0b'; // Radiant Amber / Gold
      case 'Southeast Asia':
      case 'Asia & Middle East':
        return '#10b981'; // Luminous Emerald / Teal
      case 'Africa':
        return '#f97316'; // Warm Coral / Tangerine
      case 'Oceania':
        return '#8b5cf6'; // Electric Violet
      default:
        return '#14b8a6'; // Luminous Teal
    }
  };

  // Quick-picker filtered countries list for effortless selection
  const quickPickerCountries = useMemo(() => {
    const q = countryPickerQuery.trim().toLowerCase();
    const base = filteredCountries.length > 0 ? filteredCountries : countries;
    if (!q) return base;
    return base.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.climate.category.toLowerCase().includes(q)
    );
  }, [countries, filteredCountries, countryPickerQuery]);

  // Base projection scale
  const baseScale = viewMode === 'globe' ? 215 : 155;
  const activeScale = baseScale * camera.zoom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xl shadow-indigo-950/10 my-6"
    >
      {/* Top Signature Multi-Colored Luminous Gradient Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />

      {/* Top Atlas Command Header — Multi-Colored Theme */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-gradient-to-r from-teal-50/80 via-indigo-50/55 to-amber-50/75 z-20 relative space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Telemetry Badge */}
          <div className="flex items-start sm:items-center gap-3.5">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0"
            >
              <Globe2 className="w-5 h-5" />
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 bg-clip-text text-transparent">
                  Interactive 3D Earth &amp; Global Haven Atlas
                </h3>
                <span className="text-[11px] font-mono font-extrabold text-teal-900 bg-teal-100/90 border border-teal-300/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {filteredCountries.length} Havens Active
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/80 border border-indigo-200 px-2 py-0.5 rounded-lg">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Google Earth Style
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Drag to rotate the 3D Earth, scroll or use controls to zoom up to 9x, or click any country marker, territory, or quick-jump selector to inspect full metrics.
              </p>
            </div>
          </div>

          {/* Right Toolbar: 3D Globe vs 2D Map Toggle + Quick Country Jumper + Auto-Spin */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 3D Globe / 2D Satellite Projection Switcher */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white/90 border border-slate-200/90 shadow-2xs">
              <button
                onClick={() => setViewMode('globe')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'globe'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>3D Earth Globe</span>
              </button>
              <button
                onClick={() => setViewMode('satellite-flat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'satellite-flat'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>2D Satellite Map</span>
              </button>
            </div>

            {/* Auto-Spin Orbit Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAutoRotate(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                autoRotate
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/60'
              }`}
              title="Toggle automatic 3D Earth rotation"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoRotate ? 'Orbiting' : 'Auto-Rotate'}</span>
            </motion.button>

            {/* Show All Labels Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllLabels(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                showAllLabels
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/60'
              }`}
              title="Show or hide country name labels across all zoom levels"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{showAllLabels ? 'All Labels On' : 'Country Labels'}</span>
            </motion.button>

            {/* Quick Country Selector Dropdown Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPickerOpen(prev => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  isPickerOpen
                    ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 text-white border-transparent'
                    : 'bg-white text-slate-800 border-teal-300/90 hover:bg-teal-50/60'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-teal-600" />
                <span>Jump to Country ({filteredCountries.length})</span>
              </motion.button>

              <AnimatePresence>
                {isPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl p-3 z-40"
                  >
                    <div className="relative mb-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={countryPickerQuery}
                        onChange={e => setCountryPickerQuery(e.target.value)}
                        placeholder="Type country name to fly to..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 text-slate-900"
                      />
                      {countryPickerQuery && (
                        <button
                          onClick={() => setCountryPickerQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {quickPickerCountries.map(c => {
                        const isSelected = selectedPinCountry?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => handleSelectCountry(c, true)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-teal-500/15 via-indigo-500/15 to-amber-500/15 border border-indigo-300 font-bold text-slate-900'
                                : 'hover:bg-slate-100/90 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CountryFlag
                                countryCode={c.code}
                                countryName={c.name}
                                fallbackEmoji={c.flag}
                                size="sm"
                                className="w-5 h-3.5 rounded-2xs shrink-0"
                              />
                              <span className="truncate font-semibold">{c.name}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/70 px-1.5 py-0.5 rounded-md shrink-0">
                              ${c.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}/mo
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Region Camera Presets — Multi-Colored Segmented Buttons */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fly To Region:</span>
            </span>
            {[
              { label: 'All', activeGrad: 'from-teal-600 via-indigo-600 to-amber-600', pillHover: 'hover:border-teal-300 hover:bg-teal-50/70' },
              { label: 'Europe', activeGrad: 'from-blue-600 to-indigo-600', pillHover: 'hover:border-blue-300 hover:bg-blue-50/70' },
              { label: 'Americas', activeGrad: 'from-amber-500 to-orange-600', pillHover: 'hover:border-amber-300 hover:bg-amber-50/70' },
              { label: 'Southeast Asia', activeGrad: 'from-emerald-600 to-teal-600', pillHover: 'hover:border-emerald-300 hover:bg-emerald-50/70' },
              { label: 'Asia & Middle East', activeGrad: 'from-teal-600 to-cyan-600', pillHover: 'hover:border-cyan-300 hover:bg-cyan-50/70' },
              { label: 'Africa', activeGrad: 'from-orange-500 to-rose-600', pillHover: 'hover:border-orange-300 hover:bg-orange-50/70' },
              { label: 'Oceania', activeGrad: 'from-violet-600 to-purple-600', pillHover: 'hover:border-violet-300 hover:bg-violet-50/70' },
            ].map(r => (
              <motion.button
                key={r.label}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRegionFocus(r.label)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                  selectedRegion === r.label
                    ? `bg-gradient-to-r ${r.activeGrad} text-white shadow-xs`
                    : `bg-white/90 text-slate-700 border border-slate-200/90 ${r.pillHover}`
                }`}
              >
                {r.label}
              </motion.button>
            ))}
          </div>

          {/* Live Telemetry Coordinates & Zoom Readout */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-white/85 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <span className="text-teal-700 font-bold">
              LAT {camera.centerLat >= 0 ? `${camera.centerLat.toFixed(1)}°N` : `${Math.abs(camera.centerLat).toFixed(1)}°S`}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-700 font-bold">
              LON {camera.centerLon >= 0 ? `${camera.centerLon.toFixed(1)}°E` : `${Math.abs(camera.centerLon).toFixed(1)}°W`}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700 font-extrabold">
              ZOOM {camera.zoom.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* Google Earth Style Space & Satellite Viewport */}
      <div
        ref={mapViewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative w-full ${
          isExpandedHeight ? 'h-[580px] sm:h-[720px]' : 'h-[450px] sm:h-[560px]'
        } bg-[#04091a] cursor-grab active:cursor-grabbing overflow-hidden select-none transition-all duration-300`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #0c2448 0%, #061229 52%, #020612 100%)',
        }}
      >
        {/* Deep-Space Starfield Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {STARFIELD_POINTS.map(star => (
            <span
              key={star.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: star.delay,
                animationDuration: '4s',
              }}
            />
          ))}
          {/* Ambient Atmospheric Nebula Glow behind the Earth */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
        </div>

        {/* Interactive D3 Geo Globe / Satellite Map */}
        <ComposableMap
          projection={viewMode === 'globe' ? 'geoOrthographic' : 'geoEqualEarth'}
          projectionConfig={{
            rotate: [-camera.centerLon, -camera.centerLat, 0],
            scale: activeScale,
          }}
          width={800}
          height={500}
          className="w-full h-full relative z-10"
        >
          <defs>
            {/* Google Earth Realistic Sunlit Ocean Bathymetry Gradient */}
            <radialGradient id="googleEarthOcean" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="28%" stopColor="#0284c7" />
              <stop offset="62%" stopColor="#075985" />
              <stop offset="88%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#041e3a" />
            </radialGradient>

            {/* Atmospheric Outer Rim Glow */}
            <radialGradient id="atmosphereRim" cx="50%" cy="50%" r="50%">
              <stop offset="82%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="96%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.75" />
            </radialGradient>

            {/* Satellite Natural Landmass Gradient for non-haven countries */}
            <linearGradient id="satelliteTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3f35" />
              <stop offset="50%" stopColor="#24493c" />
              <stop offset="100%" stopColor="#1b332b" />
            </linearGradient>
          </defs>

          {/* Earth Ocean Sphere & Atmospheric Limb Halo */}
          <Sphere
            id="google-earth-sphere"
            fill="url(#googleEarthOcean)"
            stroke="#38bdf8"
            strokeWidth={1.6}
          />
          <Graticule stroke="rgba(125, 211, 252, 0.16)" strokeWidth={0.5} />

          {/* World Land Mass Polygons */}
          <Geographies geography={worldGeo as any}>
            {({ geographies }) =>
              geographies.map((geo: any) => {
                const countryId =
                  geo && geo.id != null ? COUNTRY_ISO_MAP[String(geo.id)] : undefined;
                const isHaven = Boolean(countryId);
                const isFilteredMatch =
                  isHaven && countryId ? filteredIds.has(countryId) : false;
                const isSelected = selectedPinCountry?.id === countryId;
                const isHovered = hoveredCountry?.id === countryId;
                const matched =
                  isHaven && countryId
                    ? countries.find(c => c.id === countryId)
                    : undefined;

                const fillColor = isHaven
                  ? getCountryColor(matched, isSelected, isFilteredMatch, isHovered)
                  : 'url(#satelliteTerrain)';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      if (matched) setHoveredCountry(matched);
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      if (matched) {
                        handleSelectCountry(matched, true);
                      }
                    }}
                    style={{
                      default: {
                        fill: fillColor,
                        stroke: isSelected
                          ? '#ffffff'
                          : isHaven
                          ? 'rgba(255, 255, 255, 0.72)'
                          : 'rgba(148, 163, 184, 0.35)',
                        strokeWidth: isSelected ? 1.5 : isHaven ? 0.75 : 0.4,
                        outline: 'none',
                        cursor: isHaven ? 'pointer' : 'grab',
                        transition: 'fill 180ms ease, stroke-width 180ms ease',
                      },
                      hover: {
                        fill: isHaven ? '#22d3ee' : '#2a5446',
                        stroke: '#ffffff',
                        strokeWidth: isHaven ? 1.4 : 0.6,
                        outline: 'none',
                        cursor: isHaven ? 'pointer' : 'grab',
                      },
                      pressed: {
                        fill: isHaven ? '#ec4899' : '#1e3f35',
                        outline: 'none',
                      },
                    } as any}
                  />
                );
              })
            }
          </Geographies>

          {/* Country Markers & Glowing Indicators (Preserved Design + Hemisphere Culling on 3D Globe) */}
          {countries.map(c => {
            const coords = COUNTRY_COORDINATES[c.id];
            if (!coords) return null;

            // Hide markers on the back hemisphere when in 3D Orthographic Globe mode
            if (
              viewMode === 'globe' &&
              !isPointVisibleOnGlobe(coords, camera.centerLon, camera.centerLat)
            ) {
              return null;
            }

            const isMatch = filteredIds.has(c.id);
            const isSelected = selectedPinCountry?.id === c.id;
            const isHovered = hoveredCountry?.id === c.id;
            const pinColor = getCountryColor(c, isSelected, isMatch, isHovered);

            // Show label when zoomed in, selected, hovered, or when "Show All Labels" is toggled on
            const shouldShowLabel =
              showAllLabels ||
              camera.zoom >= 1.75 ||
              isSelected ||
              isHovered;

            return (
              <Marker
                key={c.id}
                coordinates={coords}
                onClick={e => {
                  e.stopPropagation();
                  handleSelectCountry(c, true);
                }}
                onMouseEnter={() => setHoveredCountry(c)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <g className="cursor-pointer group transform transition-transform duration-150 hover:scale-125">
                  {/* Pulsing ring for filtered matching countries */}
                  {isMatch && (
                    <circle
                      r={isSelected ? 12 : 7.5}
                      fill={pinColor}
                      opacity={0.4}
                      className="animate-ping"
                    />
                  )}

                  {/* Outer Pin Body */}
                  <circle
                    r={isSelected ? 6.8 : isHovered ? 5.8 : 4.8}
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth={1.8}
                  />

                  {/* Inner core */}
                  <circle
                    r={isSelected ? 2.8 : 2}
                    fill="#ffffff"
                  />

                  {/* Crisp satellite country label text */}
                  {shouldShowLabel && (
                    <text
                      textAnchor="middle"
                      y={-10}
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: isSelected || isHovered ? '10px' : '8.5px',
                        fontWeight: 800,
                        fill: isSelected ? '#fbcfe8' : isHovered ? '#a5f3fc' : '#ffffff',
                        stroke: '#020617',
                        strokeWidth: 3,
                        paintOrder: 'stroke fill',
                      }}
                    >
                      {c.name}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Top-Right Google Earth 3D Navigation Gimbal, Zoom Slider & Viewport Controls */}
        <div
          data-map-ui="true"
          className="absolute top-4 right-4 flex flex-col items-end gap-2.5 z-20"
        >
          {/* 3D Compass / Rotation Gimbal */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-sky-400/30 rounded-2xl p-2 shadow-xl text-white flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-sky-300 font-bold">
              Rotate Earth
            </span>
            <div className="grid grid-cols-3 gap-1 items-center">
              <div />
              <button
                onClick={() => handleNudgeRotation(0, 18)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-sky-500/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Rotate North"
                aria-label="Rotate North"
              >
                <ChevronUp className="w-4 h-4 text-sky-200" />
              </button>
              <div />
              <button
                onClick={() => handleNudgeRotation(-24, 0)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-sky-500/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Rotate West"
                aria-label="Rotate West"
              >
                <ChevronLeft className="w-4 h-4 text-sky-200" />
              </button>
              <button
                onClick={handleResetView}
                className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                title="Reset Globe Orientation"
                aria-label="Reset Globe Orientation"
              >
                <Compass className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => handleNudgeRotation(24, 0)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-sky-500/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Rotate East"
                aria-label="Rotate East"
              >
                <ChevronRight className="w-4 h-4 text-sky-200" />
              </button>
              <div />
              <button
                onClick={() => handleNudgeRotation(0, -18)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-sky-500/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Rotate South"
                aria-label="Rotate South"
              >
                <ChevronDown className="w-4 h-4 text-sky-200" />
              </button>
              <div />
            </div>
          </div>

          {/* Precision Zoom Controls (+ / Slider / - / Expand) */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-sky-400/30 rounded-2xl p-2 shadow-xl text-white flex flex-col items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-teal-500/30 text-sky-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom in on map"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Vertical Zoom Range Slider */}
            <div className="py-1 flex flex-col items-center">
              <input
                type="range"
                min={0.8}
                max={8.0}
                step={0.1}
                value={camera.zoom}
                onChange={e =>
                  setCamera(prev => ({ ...prev, zoom: Number(e.target.value) }))
                }
                aria-label="Zoom level"
                className="w-20 accent-teal-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono font-bold text-teal-300 mt-1">
                {camera.zoom.toFixed(1)}x
              </span>
            </div>

            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-teal-500/30 text-sky-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom out on map"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="w-full h-px bg-white/15" />

            <button
              onClick={handleResetView}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-amber-500/30 text-amber-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Map View"
              aria-label="Reset zoom and center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpandedHeight(prev => !prev)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-indigo-500/30 text-indigo-200 flex items-center justify-center transition-colors cursor-pointer"
              title={isExpandedHeight ? 'Standard Atlas Height' : 'Expand Atlas Height'}
              aria-label="Toggle Atlas Height"
            >
              {isExpandedHeight ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Destination Inspector Overlay Card — Preserved Info Display with Current Multi-Colored Luminous Theme */}
        <AnimatePresence>
          {activeModalCountry && (
            <motion.div
              data-map-ui="true"
              key={activeModalCountry.id}
              initial={{ opacity: 0, x: -16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute top-4 left-4 max-w-xs sm:max-w-sm w-full bg-white/95 border border-teal-200/90 rounded-2xl overflow-hidden shadow-2xl z-20 backdrop-blur-xl text-slate-900"
            >
              {/* Top Multi-Colored Gradient Accent Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag
                      countryCode={activeModalCountry.code}
                      countryName={activeModalCountry.name}
                      fallbackEmoji={activeModalCountry.flag}
                      size="xl"
                      className="w-9 h-6 rounded-xs shrink-0 shadow-2xs"
                    />
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                        {activeModalCountry.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-bold text-teal-700">
                          {activeModalCountry.region}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-700 font-medium">
                          {activeModalCountry.climate.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPinCountry && (
                    <button
                      onClick={() => setSelectedPinCountry(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Close country preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5">
                  {activeModalCountry.tagline}
                </p>

                {/* Quick Metrics Bar — Three Signature Multi-Colored Pastel Cards */}
                <div className="grid grid-cols-3 gap-2 mb-3.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50/70 border border-teal-200/80 text-center">
                    <span className="text-[10px] text-teal-800 font-bold block">
                      Single Living
                    </span>
                    <span className="font-mono tabular-nums font-extrabold text-teal-950 text-xs">
                      ${activeModalCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50/70 border border-indigo-200/80 text-center">
                    <span className="text-[10px] text-indigo-800 font-bold block">
                      Healthcare
                    </span>
                    <span className="font-mono tabular-nums font-extrabold text-indigo-950 text-xs">
                      {activeModalCountry.lifestyle.healthcareScore}/100
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 text-center">
                    <span className="text-[10px] text-amber-800 font-bold block">
                      Sun Days
                    </span>
                    <span className="font-mono tabular-nums font-extrabold text-amber-950 text-xs">
                      {activeModalCountry.climate.annualSunnyDays}d
                    </span>
                  </div>
                </div>

                <div className="text-[11px] bg-gradient-to-r from-slate-50 via-indigo-50/40 to-teal-50/40 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 mb-3.5 flex items-center justify-between">
                  <span className="truncate max-w-[170px] text-slate-700 font-semibold">
                    {activeModalCountry.visa.retirementVisaName}
                  </span>
                  <span className="font-mono tabular-nums text-indigo-800 font-extrabold shrink-0">
                    Min. ${activeModalCountry.visa.minimumIncomeUSD}/mo
                  </span>
                </div>

                {/* CTA: Open Full Dossier */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigateToCountry(activeModalCountry.id)}
                  className="w-full py-2.5 px-3.5 bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 hover:from-teal-700 hover:via-indigo-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <span>Explore Complete {activeModalCountry.name} Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom-Left Regional Legend & Interactive Hint */}
        <div
          data-map-ui="true"
          className="absolute bottom-4 left-4 bg-slate-900/85 border border-sky-400/30 rounded-2xl px-4 py-2.5 text-[11px] text-slate-200 hidden sm:flex flex-wrap items-center gap-4 shadow-xl backdrop-blur-md z-10 font-medium"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white/40" />
            <span>Europe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white/40" />
            <span>Americas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white/40" />
            <span>Asia &amp; SE Asia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 ring-2 ring-white/40" />
            <span>Oceania &amp; Africa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
            <span className="text-pink-200 font-bold">Selected</span>
          </div>
        </div>
      </div>

      {/* Bottom Quick-Select Country Carousel Bar — Lets users click any country chip to rotate & zoom straight to it */}
      <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-teal-50/50 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 shrink-0 flex items-center gap-1.5 pr-1">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>Quick Select Haven:</span>
        </span>
        {filteredCountries.slice(0, 24).map(c => {
          const isSelected = selectedPinCountry?.id === c.id;
          return (
            <motion.button
              key={c.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectCountry(c, true)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-amber-600 text-white border-transparent shadow-xs font-bold'
                  : 'bg-white hover:bg-indigo-50/80 text-slate-700 border-slate-200/90 hover:border-indigo-300'
              }`}
            >
              <CountryFlag
                countryCode={c.code}
                countryName={c.name}
                fallbackEmoji={c.flag}
                size="sm"
                className="w-4 h-3 rounded-2xs shrink-0"
              />
              <span>{c.name}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

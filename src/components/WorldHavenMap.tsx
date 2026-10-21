import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere, ZoomableGroup } from 'react-simple-maps';
import worldGeo from 'world-atlas/countries-110m.json';
import { useApp } from '../context/AppContext';
import { Country } from '../types';
import { ArrowRight, X, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
};

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
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [10, 20],
    zoom: 1,
  });

  const filteredIds = new Set(filteredCountries.map(c => c.id));

  // Region centers and zoom levels
  const handleRegionFocus = (region: string) => {
    setSelectedRegion(region);
    if (region === 'Europe') {
      setPosition({ coordinates: [15, 45], zoom: 2.8 });
    } else if (region === 'Southeast Asia') {
      setPosition({ coordinates: [110, 15], zoom: 2.6 });
    } else if (region === 'Americas') {
      setPosition({ coordinates: [-85, 12], zoom: 2.2 });
    } else {
      setPosition({ coordinates: [10, 20], zoom: 1 });
    }
  };

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.35 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.35 }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [10, 20], zoom: 1 });
  };

  const activeModalCountry = selectedPinCountry || hoveredCountry;

  // Helper for regional vibrant colors with Saffron, Light Purple, and Navy
  const getCountryColor = (c: Country | undefined, isSelected: boolean, isFilteredMatch: boolean, isHovered: boolean = false) => {
    if (isSelected) return '#9333ea'; // Regal Purple for selected
    if (isHovered) return '#f97316'; // Luminous Saffron Orange hover
    if (!isFilteredMatch) return '#cbd5e1'; // Soft muted slate if filtered out
    
    switch (c?.region) {
      case 'Europe':
        return '#2563eb'; // Royal Navy Blue (Ashoka Chakra Inspired)
      case 'Americas':
        return '#ea580c'; // Radiant Saffron Orange
      case 'Southeast Asia':
        return '#d97706'; // Warm Radiant Amber
      default:
        return '#8b5cf6'; // Light Purple / Violet
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-orange-200/80 overflow-hidden shadow-lg relative my-8">
      
      {/* Top Map Toolbar - Saffron & Lavender Luminous Gradient */}
      <div className="p-4 sm:p-5 border-b border-orange-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-orange-50/90 via-purple-50/60 to-blue-50/70 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Interactive Global Retirement Atlas</span>
              <span className="text-[11px] font-mono font-bold text-orange-900 bg-orange-100/90 border border-orange-200 px-2 py-0.5 rounded-md">
                {filteredCountries.length} havens active
              </span>
            </h3>
            <p className="text-xs text-slate-600 hidden sm:block mt-0.5">
              Click any pin or regional destination to inspect monthly costs, climate, healthcare scores, and immigration pathways.
            </p>
          </div>
        </div>

        {/* Region Quick Filters - Saffron & Purple Segmented Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: 'All', color: 'orange' },
            { label: 'Europe', color: 'blue' },
            { label: 'Southeast Asia', color: 'amber' },
            { label: 'Americas', color: 'orange' },
          ].map(r => (
            <button
              key={r.label}
              onClick={() => handleRegionFocus(r.label)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shadow-2xs ${
                selectedRegion === r.label
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 text-white font-bold shadow-xs scale-[1.02]'
                  : 'bg-white text-slate-700 hover:text-orange-950 hover:bg-orange-50/80 border border-orange-200/70'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas — Serene Sky Ocean & Pastel Landmasses with Vibrant Haven Highlights */}
      <div className="relative w-full h-[370px] sm:h-[480px] bg-gradient-to-b from-sky-100/50 via-sky-50/60 to-teal-50/40 cursor-grab active:cursor-grabbing overflow-hidden">
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 145,
          }}
          className="w-full h-full select-none"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={(pos: any) => {
              if (pos && pos.coordinates) {
                setPosition({ coordinates: pos.coordinates, zoom: pos.zoom });
              }
            }}
            maxZoom={4}
            minZoom={0.8}
          >
            {/* Globe Ocean & Cartographic Lat/Long Grid */}
            <Sphere id="world-sphere" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth={0.8} />
            <Graticule stroke="#bae6fd" strokeWidth={0.5} />

            {/* World Land Mass */}
            <Geographies geography={worldGeo as any}>
              {({ geographies }) =>
                geographies.map((geo: any) => {
                  const countryId = geo && geo.id != null ? COUNTRY_ISO_MAP[String(geo.id)] : undefined;
                  const isHaven = Boolean(countryId);
                  const isFilteredMatch = isHaven && countryId ? filteredIds.has(countryId) : false;
                  const isSelected = selectedPinCountry?.id === countryId;
                  const matched = isHaven && countryId ? countries.find(c => c.id === countryId) : undefined;
                  const fillColor = isHaven
                    ? getCountryColor(matched, isSelected, isFilteredMatch)
                    : '#f8fafc';

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
                      onClick={() => {
                        if (matched) setSelectedPinCountry(matched);
                      }}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isHaven ? '#ffffff' : '#cbd5e1',
                          strokeWidth: isHaven ? 0.9 : 0.5,
                          outline: 'none',
                          cursor: isHaven ? 'pointer' : 'default',
                          transition: 'all 200ms ease',
                        },
                        hover: {
                          fill: isHaven ? '#06b6d4' : '#e2e8f0',
                          stroke: '#ffffff',
                          strokeWidth: 1.2,
                          outline: 'none',
                          cursor: isHaven ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: isHaven ? '#0891b2' : '#cbd5e1',
                          outline: 'none',
                        },
                      } as any}
                    />
                  );
                })
              }
            </Geographies>

            {/* Country Markers & Glowing Indicators */}
            {countries.map(c => {
              const coords = COUNTRY_COORDINATES[c.id];
              if (!coords) return null;

              const isMatch = filteredIds.has(c.id);
              const isSelected = selectedPinCountry?.id === c.id;
              const pinColor = getCountryColor(c, isSelected, isMatch);

              return (
                <Marker
                  key={c.id}
                  coordinates={coords}
                  onClick={() => setSelectedPinCountry(c)}
                  onMouseEnter={() => setHoveredCountry(c)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <g className="cursor-pointer group transform transition-transform duration-150 hover:scale-125">
                    {/* Pulsing ring for filtered matching countries */}
                    {isMatch && (
                      <circle
                        r={isSelected ? 11 : 7.5}
                        fill={pinColor}
                        opacity={0.35}
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Pin Body */}
                    <circle
                      r={isSelected ? 6.5 : 4.8}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth={1.8}
                    />

                    {/* Inner core */}
                    <circle
                      r={isSelected ? 2.8 : 2}
                      fill="#ffffff"
                    />

                    {/* Clean country label text for high-zoom or selected */}
                    {(position.zoom >= 1.6 || isSelected) && (
                      <text
                        textAnchor="middle"
                        y={-10}
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '8.5px',
                          fontWeight: 800,
                          fill: isSelected ? '#ea580c' : '#0f172a',
                          stroke: '#ffffff',
                          strokeWidth: 2.5,
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
          </ZoomableGroup>
        </ComposableMap>

        {/* Floating Zoom & Map Controls - Frosted Glass Light */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-white/95 border border-orange-200/80 rounded-xl p-1 shadow-md z-10 backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-700 hover:text-orange-950 hover:bg-orange-50 rounded-lg transition-colors"
            title="Zoom In"
            aria-label="Zoom in on map"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-700 hover:text-orange-950 hover:bg-orange-50 rounded-lg transition-colors"
            title="Zoom Out"
            aria-label="Zoom out on map"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-700 hover:text-orange-950 hover:bg-orange-50 rounded-lg transition-colors"
            title="Reset Map View"
            aria-label="Reset zoom and center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Destination Inspector Overlay Card - Luminous High-Contrast Light Theme */}
        {activeModalCountry && (
          <div className="absolute top-4 left-4 max-w-xs sm:max-w-sm w-full bg-white/95 border border-orange-200/90 rounded-2xl p-4 sm:p-5 shadow-2xl z-20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl leading-none drop-shadow-2xs" role="img" aria-label={activeModalCountry.name}>
                  {activeModalCountry.flag}
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    {activeModalCountry.name}
                  </h4>
                  {/* Clean unboxed metadata with regional badge */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-orange-800">{activeModalCountry.region}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeModalCountry.climate.category}</span>
                  </div>
                </div>
              </div>

              {selectedPinCountry && (
                <button
                  onClick={() => setSelectedPinCountry(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close country preview"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5">
              {activeModalCountry.tagline}
            </p>

            {/* Quick Metrics Bar - Three Vibrant Pastel Cards */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="p-2 rounded-xl bg-orange-50/90 border border-orange-200/70 text-center">
                <span className="text-[10px] text-orange-800 font-semibold block">Single Living</span>
                <span className="font-mono tabular-nums font-extrabold text-orange-950 text-xs">
                  ${activeModalCountry.costOfLiving.monthlyBudgetSingleUSD.toLocaleString()}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/90 border border-purple-200/70 text-center">
                <span className="text-[10px] text-purple-800 font-semibold block">Healthcare</span>
                <span className="font-mono tabular-nums font-extrabold text-purple-950 text-xs">
                  {activeModalCountry.lifestyle.healthcareScore}/100
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200/70 text-center">
                <span className="text-[10px] text-amber-800 font-semibold block">Sun Days</span>
                <span className="font-mono tabular-nums font-extrabold text-amber-900 text-xs">
                  {activeModalCountry.climate.annualSunnyDays}d
                </span>
              </div>
            </div>

            <div className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-slate-700 mb-3.5 flex items-center justify-between">
              <span className="truncate max-w-[170px] text-slate-600 font-medium">
                {activeModalCountry.visa.retirementVisaName}
              </span>
              <span className="font-mono tabular-nums text-orange-800 font-bold shrink-0">
                Min. ${activeModalCountry.visa.minimumIncomeUSD}/mo
              </span>
            </div>

            {/* CTA: Open Full Dossier */}
            <button
              onClick={() => navigateToCountry(activeModalCountry.id)}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Explore Complete {activeModalCountry.name} Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Legend in Bottom Left - Colourful Regional Swatches */}
        <div className="absolute bottom-4 left-4 bg-white/95 border border-orange-200/70 rounded-xl px-3.5 py-2.5 text-[11px] text-slate-700 hidden sm:flex items-center gap-4 shadow-md backdrop-blur-md z-10 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs" />
            <span className="font-medium">Europe (Navy)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shadow-2xs" />
            <span className="font-medium">Americas (Saffron)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
            <span className="font-medium">Southeast Asia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-2xs" />
            <span className="font-medium">Selected</span>
          </div>
        </div>

      </div>

    </div>
  );
};

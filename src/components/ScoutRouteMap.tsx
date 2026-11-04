import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import worldGeo from 'world-atlas/countries-110m.json';
import { motion } from 'motion/react';
import { ScoutTripStop } from '../types';
import {
  getHubCoordinatesForCountry,
  calculateDistanceKm,
  GeoHubCoordinate,
  getCountryIso2Code,
  registerCustomCityCoordinate,
} from '../data/scoutCoordinatesAndItineraries';
import {
  Play,
  Pause,
  RotateCcw,
  Plane,
  Car,
  Navigation,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  Wifi,
  Globe,
  ZoomIn,
  ZoomOut,
  X,
  Search,
} from 'lucide-react';

export interface EnrichedMapStop extends ScoutTripStop {
  days: number;
  stopBurnUSD: number;
  coord: GeoHubCoordinate;
}

export interface CandidateMapCountry {
  countryId: string;
  countryName: string;
  countryFlag: string;
  region: string;
  monthlyRateUSD: number;
  nomadScore: number;
  fiberMbps: number;
  visaName: string;
  isSchengen: boolean;
  sunnyDays: number;
  coord: GeoHubCoordinate;
  availableCities: string[];
}

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface RouteLegSummary {
  legIndex: number;
  fromStop: EnrichedMapStop;
  toStop: EnrichedMapStop;
  mode: 'DRIVING' | 'FLIGHT_HOP';
  distanceKm: number;
  durationText: string;
  pathPoints: LatLngPoint[];
}

interface ScoutRouteMapProps {
  stops: (ScoutTripStop & { days: number; stopBurnUSD: number })[];
  candidateCountries?: CandidateMapCountry[];
  focusedCountryId?: string | null;
  selectedCountryId?: string | null;
  selectedCountryName?: string;
  selectedCountryFlag?: string;
  countryCityHubs?: GeoHubCoordinate[];
  isDiscoveryPreview?: boolean;
  onSelectStopIndex?: (index: number) => void;
  onAddCountryFromMap?: (countryId: string, preferredCity?: string) => void;
  onAddCustomCityInCountry?: (
    countryId: string,
    cityName: string,
    lat?: number,
    lng?: number,
    highlight?: string
  ) => void;
  onRemoveStopFromMap?: (stopId: string) => void;
  onUpdateStopDatesFromMap?: (
    stopId: string,
    updates: { arrivalDate?: string; departureDate?: string; cityFocus?: string }
  ) => void;
}

function getTodayLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a compact human-readable label (e.g. "May 1")
 */
function formatShortIsoDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Generates interpolated geodesic points between two LatLng coordinates for smooth animation & flight arcs
 */
function interpolatePoints(
  start: LatLngPoint,
  end: LatLngPoint,
  steps = 60
): LatLngPoint[] {
  const pts: LatLngPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    pts.push({ lat, lng });
  }
  return pts;
}

/**
 * Google Places API (New) City Autocomplete restricted strictly to the active single country (`includedRegionCodes: [iso2]`),
 * paired with a local country city gazetteer fallback so users can always search and add any city in the chosen country.
 */
const SingleCountryPlacesCitySearch: React.FC<{
  countryId: string;
  countryName: string;
  countryFlag: string;
  countryCityHubs: GeoHubCoordinate[];
  disabled?: boolean;
  onSelectCity: (cityName: string, lat?: number, lng?: number, highlight?: string) => void;
}> = ({
  countryId,
  countryName,
  countryFlag,
  countryCityHubs,
  disabled = false,
  onSelectCity,
}) => {
  const placesLib = useMapsLibrary('places');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<
    {
      id: string;
      mainText: string;
      secondaryText: string;
      placePrediction?: any;
      coord?: GeoHubCoordinate;
    }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sessionTokenRef = useRef<any>(null);

  const iso2 = useMemo(
    () => getCountryIso2Code(countryId, countryName),
    [countryId, countryName]
  );

  useEffect(() => {
    const cleanQ = query.trim();
    if (cleanQ.length < 2) {
      setSuggestions([]);
      return;
    }

    let isCancelled = false;

    // 1. Immediate local matches from the chosen country's city hubs
    const localMatches = countryCityHubs
      .filter(h => h.cityName.toLowerCase().includes(cleanQ.toLowerCase()))
      .map(h => ({
        id: `local-${h.cityName}`,
        mainText: h.cityName,
        secondaryText: `${countryName} · ${h.highlight}`,
        coord: h,
      }));

    // 2. Query Google Places API (New) `AutocompleteSuggestion.fetchAutocompleteSuggestions` restricted to `includedRegionCodes: [iso2]`
    const fetchPlaces = async () => {
      if (
        !placesLib ||
        !(placesLib as any).AutocompleteSuggestion?.fetchAutocompleteSuggestions
      ) {
        setSuggestions(localMatches);
        return;
      }

      setIsLoading(true);
      try {
        const AutocompleteSessionToken = (placesLib as any).AutocompleteSessionToken;
        const AutocompleteSuggestion = (placesLib as any).AutocompleteSuggestion;
        if (!sessionTokenRef.current && AutocompleteSessionToken) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        const request: any = {
          input: `${cleanQ}`,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
        };
        if (iso2) {
          request.includedRegionCodes = [iso2.toLowerCase()];
        }
        if (sessionTokenRef.current) {
          request.sessionToken = sessionTokenRef.current;
        }

        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (isCancelled) return;

        const apiItems = (response?.suggestions || [])
          .filter((s: any) => s?.placePrediction)
          .slice(0, 6)
          .map((s: any, idx: number) => {
            const pred = s.placePrediction;
            const fullText = pred?.text?.text || cleanQ;
            const parts = fullText.split(',');
            const mainCity = (pred?.mainText?.text || parts[0] || cleanQ).trim();
            const subText =
              pred?.secondaryText?.text || parts.slice(1).join(',').trim() || countryName;
            return {
              id: pred?.placeId || `places-${idx}`,
              mainText: mainCity,
              secondaryText: `${subText} (${countryName})`,
              placePrediction: pred,
            };
          })
          // Filter to ensure country match if iso2 wasn't available
          .filter((item: any) =>
            iso2
              ? true
              : item.secondaryText.toLowerCase().includes(countryName.toLowerCase())
          );

        const combined = [...apiItems];
        localMatches.forEach(lm => {
          if (
            !combined.some(
              c =>
                c.mainText.toLowerCase() ===
                lm.mainText.split('(')[0].trim().toLowerCase()
            )
          ) {
            combined.push(lm);
          }
        });

        setSuggestions(combined.slice(0, 7));
      } catch {
        if (!isCancelled) {
          setSuggestions(localMatches);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    const timer = window.setTimeout(fetchPlaces, 180);
    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, placesLib, iso2, countryName, countryCityHubs]);

  const handlePickSuggestion = async (item: (typeof suggestions)[0]) => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);

    if (item.coord) {
      onSelectCity(item.coord.cityName, item.coord.lat, item.coord.lng, item.coord.highlight);
      return;
    }

    if (item.placePrediction && typeof item.placePrediction.toPlace === 'function') {
      try {
        const place = item.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'location', 'formattedAddress'],
        });
        const loc = place.location;
        const lat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat;
        const lng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng;
        const cityLabel = place.displayName || item.mainText;

        // Reset session token after place details fetch
        const AutocompleteSessionToken = (placesLib as any)?.AutocompleteSessionToken;
        if (AutocompleteSessionToken) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        if (typeof lat === 'number' && typeof lng === 'number') {
          registerCustomCityCoordinate(
            countryId,
            countryName,
            cityLabel,
            lat,
            lng,
            undefined,
            `Verified Google Places city in ${countryName}`
          );
          onSelectCity(
            cityLabel,
            lat,
            lng,
            `Google Places city hub in ${countryName}`
          );
          return;
        }
      } catch {
        // Fallback to name-only if fetchFields fails
      }
    }

    onSelectCity(item.mainText, undefined, undefined, `Custom city in ${countryName}`);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    if (suggestions.length > 0) {
      handlePickSuggestion(suggestions[0]);
      return;
    }
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    onSelectCity(clean, undefined, undefined, `Custom city hub in ${countryName}`);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleManualAdd} className="relative flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled}
            onFocus={() => setIsOpen(true)}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder={`Search any city in ${countryFlag} ${countryName} (Google Places)...`}
            className="w-full pl-8 pr-7 py-2 rounded-xl bg-white border border-amber-300/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || disabled}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-40 text-white text-xs font-extrabold cursor-pointer shrink-0 shadow-2xs"
        >
          + Add City
        </button>
      </form>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-1.5 z-40 rounded-2xl bg-white border border-amber-200 shadow-xl overflow-hidden">
          <div className="px-3 py-1.5 bg-gradient-to-r from-amber-50 via-rose-50 to-violet-50 border-b border-amber-100 flex items-center justify-between text-[10px] font-extrabold text-slate-600">
            <span>
              {countryFlag} Cities in {countryName} Only (Google Places)
            </span>
            {isLoading && <span className="text-rose-600 animate-pulse">Searching...</span>}
          </div>

          {suggestions.length > 0 ? (
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {suggestions.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePickSuggestion(item)}
                  className="w-full px-3 py-2 text-left hover:bg-amber-50/70 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{item.mainText}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate pl-4">
                      {item.secondaryText}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 text-[10px] font-extrabold shrink-0">
                    + Add to {countryName}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleManualAdd}
              className="w-full px-3 py-2.5 text-left hover:bg-amber-50/70 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
            >
              <span>
                Add <strong>"{query.trim()}"</strong> as a city stop in {countryFlag} {countryName}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 text-[10px] font-extrabold">
                + Add Custom City
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Inner Map Controller that uses `useMap()` and `useMapsLibrary('routes')`
 * to compute directions (`Route.computeRoutes`), draw a continuously animated flowing polyline
 * connecting the selected itinerary stops, fit bounds to the SINGLE chosen country, and run Start -> End traveler playback.
 */
const RouteDirectionsAndAnimator: React.FC<{
  enrichedStops: EnrichedMapStop[];
  singleCountryCityHubs: GeoHubCoordinate[];
  focusedCountryId?: string | null;
  isPlaying: boolean;
  playbackSpeed: 1 | 2;
  activeStopIdx: number;
  onUpdateActiveStop: (idx: number) => void;
  onFinishPlayback: () => void;
  onLegsComputed: (legs: RouteLegSummary[]) => void;
  onProgressChange: (pct: number) => void;
}> = ({
  enrichedStops,
  singleCountryCityHubs,
  focusedCountryId,
  isPlaying,
  playbackSpeed,
  activeStopIdx,
  onUpdateActiveStop,
  onFinishPlayback,
  onLegsComputed,
  onProgressChange,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<any[]>([]);
  const animatedFlowPolylinesRef = useRef<any[]>([]);
  const flowIntervalRef = useRef<number | null>(null);
  const [computedPathPoints, setComputedPathPoints] = useState<LatLngPoint[]>([]);
  const [legStartIndices, setLegStartIndices] = useState<number[]>([0]);
  const [travelerPos, setTravelerPos] = useState<LatLngPoint | null>(
    enrichedStops[0] ? { lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng } : null
  );
  const [activeTravelMode, setActiveTravelMode] = useState<'DRIVING' | 'FLIGHT_HOP'>('DRIVING');
  const animFrameRef = useRef<number | null>(null);
  const progressIdxRef = useRef<number>(0);

  // Fit bounds strictly to the single chosen country's stops and city hubs so the map is clutter-free!
  useEffect(() => {
    const gMaps = (window as any).google?.maps;
    if (!map || !gMaps) return;

    if (enrichedStops.length === 1 && singleCountryCityHubs.length <= 1) {
      map.panTo({ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng });
      map.setZoom(7);
      setTravelerPos({ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng });
      setComputedPathPoints([{ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng }]);
      onLegsComputed([]);
      return;
    }

    if (enrichedStops.length >= 2) {
      const bounds = new gMaps.LatLngBounds();
      enrichedStops.forEach(s => {
        bounds.extend({ lat: s.coord.lat, lng: s.coord.lng });
      });
      map.fitBounds(bounds, 75);
      return;
    }

    if (singleCountryCityHubs.length > 0) {
      if (singleCountryCityHubs.length === 1) {
        map.panTo({ lat: singleCountryCityHubs[0].lat, lng: singleCountryCityHubs[0].lng });
        map.setZoom(6);
      } else {
        const bounds = new gMaps.LatLngBounds();
        singleCountryCityHubs.forEach(h => {
          bounds.extend({ lat: h.lat, lng: h.lng });
        });
        map.fitBounds(bounds, 70);
      }
    }
  }, [
    map,
    focusedCountryId,
    enrichedStops.map(s => `${s.id}:${s.coord.lat},${s.coord.lng}`).join('|'),
    singleCountryCityHubs.map(h => `${h.cityName}:${h.lat},${h.lng}`).join('|'),
  ]);

  // Compute Routes using modern `Route.computeRoutes` for overland legs + geodesic arcs for flight hops
  useEffect(() => {
    const gMaps = (window as any).google?.maps;
    if (!map || !gMaps) return;

    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];
    animatedFlowPolylinesRef.current.forEach(p => p.setMap(null));
    animatedFlowPolylinesRef.current = [];
    if (flowIntervalRef.current) {
      window.clearInterval(flowIntervalRef.current);
      flowIntervalRef.current = null;
    }

    if (enrichedStops.length < 2) {
      setComputedPathPoints(
        enrichedStops[0] ? [{ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng }] : []
      );
      onLegsComputed([]);
      return;
    }

    let isCancelled = false;

    const buildAllLegs = async () => {
      const legsResult: RouteLegSummary[] = [];
      const fullAnimationPath: LatLngPoint[] = [];
      const stopPointIndices: number[] = [0];

      for (let i = 0; i < enrichedStops.length - 1; i++) {
        const fromStop = enrichedStops[i];
        const toStop = enrichedStops[i + 1];
        const originPt = { lat: fromStop.coord.lat, lng: fromStop.coord.lng };
        const destPt = { lat: toStop.coord.lat, lng: toStop.coord.lng };
        const straightDistKm = calculateDistanceKm(originPt, destPt);

        const sameContinent = fromStop.coord.continentGroup === toStop.coord.continentGroup;
        const canTryOverland =
          sameContinent && straightDistKm < 2600 && routesLib && (routesLib as any).Route;

        let legResolved = false;

        if (canTryOverland) {
          try {
            const RouteClass = (routesLib as any).Route;
            if (typeof RouteClass.computeRoutes === 'function') {
              const res = await RouteClass.computeRoutes({
                origin: originPt,
                destination: destPt,
                travelMode: 'DRIVING',
                fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
              });

              if (!isCancelled && res?.routes && res.routes.length > 0) {
                const primaryRoute = res.routes[0];
                const roadMeters = primaryRoute.distanceMeters || straightDistKm * 1000;
                const roadKm = Math.round(roadMeters / 1000);
                const durationMins = Math.round(
                  (primaryRoute.durationMillis || roadKm * 50 * 1000) / 60000
                );
                const hrs = Math.floor(durationMins / 60);
                const mins = durationMins % 60;

                let extractedPath: LatLngPoint[] = [];
                if (typeof primaryRoute.createPolylines === 'function') {
                  const routePolys: any[] = primaryRoute.createPolylines();
                  routePolys.forEach(poly => {
                    poly.setOptions({
                      strokeColor: '#e11d48', // Vibrant Rose-600 road path
                      strokeOpacity: 0.45,
                      strokeWeight: 6,
                      map,
                    });
                    polylinesRef.current.push(poly);
                    const pathObj = poly.getPath();
                    if (pathObj) {
                      for (let k = 0; k < pathObj.getLength(); k++) {
                        const pt = pathObj.getAt(k);
                        extractedPath.push({ lat: pt.lat(), lng: pt.lng() });
                      }
                    }
                  });
                }

                if (extractedPath.length < 2) {
                  extractedPath = interpolatePoints(originPt, destPt, 60);
                }

                const sampled: LatLngPoint[] = [];
                const sampleCount = 70;
                for (let s = 0; s <= sampleCount; s++) {
                  const idx = Math.min(
                    extractedPath.length - 1,
                    Math.floor((s / sampleCount) * (extractedPath.length - 1))
                  );
                  sampled.push(extractedPath[idx]);
                }

                const roadFlowPolyline = new gMaps.Polyline({
                  path: sampled,
                  geodesic: false,
                  strokeColor: '#7c3aed', // Violet-600 animated flow
                  strokeOpacity: 0.85,
                  strokeWeight: 3.5,
                  icons: [
                    {
                      icon: {
                        path: gMaps.SymbolPath?.FORWARD_CLOSED_ARROW ?? 1,
                        scale: 3.2,
                        strokeColor: '#ffffff',
                        strokeWeight: 1.5,
                        fillColor: '#f59e0b',
                        fillOpacity: 1,
                      },
                      offset: '0%',
                      repeat: '95px',
                    },
                  ],
                  map,
                });
                animatedFlowPolylinesRef.current.push(roadFlowPolyline);

                legsResult.push({
                  legIndex: i,
                  fromStop,
                  toStop,
                  mode: 'DRIVING',
                  distanceKm: roadKm,
                  durationText: hrs > 0 ? `${hrs}h ${mins}m overland` : `${mins}m drive`,
                  pathPoints: sampled,
                });

                fullAnimationPath.push(...sampled);
                stopPointIndices.push(fullAnimationPath.length - 1);
                legResolved = true;
              }
            }
          } catch {
            // Fallback to geodesic hop if overland route crosses sea or is unavailable
          }
        }

        if (!legResolved && !isCancelled) {
          const flightPts = interpolatePoints(originPt, destPt, 70);
          const flightHours = Math.max(1, Math.round((straightDistKm / 780) * 10) / 10);

          const baseFlightPoly = new gMaps.Polyline({
            path: [originPt, destPt],
            geodesic: true,
            strokeColor: '#f97316',
            strokeOpacity: 0.35,
            strokeWeight: 6,
            map,
          });
          polylinesRef.current.push(baseFlightPoly);

          const dashSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.95,
            strokeColor: '#e11d48',
            scale: 3.5,
          };
          const arrowSymbol = {
            path: gMaps.SymbolPath?.FORWARD_CLOSED_ARROW ?? 1,
            scale: 3.3,
            strokeColor: '#ffffff',
            strokeWeight: 1.2,
            fillColor: '#7c3aed',
            fillOpacity: 1,
          };

          const animatedFlightPolyline = new gMaps.Polyline({
            path: [originPt, destPt],
            geodesic: true,
            strokeOpacity: 0,
            icons: [
              {
                icon: dashSymbol,
                offset: '0',
                repeat: '18px',
              },
              {
                icon: arrowSymbol,
                offset: '0%',
                repeat: '110px',
              },
            ],
            map,
          });

          animatedFlowPolylinesRef.current.push(animatedFlightPolyline);

          legsResult.push({
            legIndex: i,
            fromStop,
            toStop,
            mode: 'FLIGHT_HOP',
            distanceKm: straightDistKm,
            durationText: `~${flightHours}h domestic hop`,
            pathPoints: flightPts,
          });

          fullAnimationPath.push(...flightPts);
          stopPointIndices.push(fullAnimationPath.length - 1);
        }
      }

      if (!isCancelled) {
        setComputedPathPoints(fullAnimationPath);
        setLegStartIndices(stopPointIndices);
        setTravelerPos(
          fullAnimationPath[0] || {
            lat: enrichedStops[0].coord.lat,
            lng: enrichedStops[0].coord.lng,
          }
        );
        progressIdxRef.current = 0;
        onProgressChange(0);
        onLegsComputed(legsResult);

        let offsetCount = 0;
        flowIntervalRef.current = window.setInterval(() => {
          offsetCount = (offsetCount + 1) % 200;
          const pctOffset = `${offsetCount / 2}%`;
          const pxOffset = `${(offsetCount % 36) / 2}px`;

          animatedFlowPolylinesRef.current.forEach(poly => {
            const icons = poly.get('icons');
            if (Array.isArray(icons) && icons.length > 0) {
              if (icons.length === 1) {
                icons[0].offset = pctOffset;
              } else if (icons.length >= 2) {
                icons[0].offset = pxOffset;
                icons[1].offset = pctOffset;
              }
              poly.set('icons', icons);
            }
          });
        }, 55);
      }
    };

    buildAllLegs();

    return () => {
      isCancelled = true;
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
      animatedFlowPolylinesRef.current.forEach(p => p.setMap(null));
      animatedFlowPolylinesRef.current = [];
      if (flowIntervalRef.current) {
        window.clearInterval(flowIntervalRef.current);
        flowIntervalRef.current = null;
      }
    };
  }, [
    map,
    routesLib,
    enrichedStops.map(s => `${s.id}:${s.coord.lat},${s.coord.lng}`).join('|'),
  ]);

  // Pan camera when user clicks a specific stop pill
  useEffect(() => {
    if (!map || isPlaying) return;
    const targetStop = enrichedStops[activeStopIdx];
    if (targetStop) {
      map.panTo({ lat: targetStop.coord.lat, lng: targetStop.coord.lng });
      setTravelerPos({ lat: targetStop.coord.lat, lng: targetStop.coord.lng });
      const targetPtIdx = legStartIndices[activeStopIdx] ?? 0;
      progressIdxRef.current = targetPtIdx;
      if (computedPathPoints.length > 1) {
        onProgressChange(Math.round((targetPtIdx / (computedPathPoints.length - 1)) * 100));
      }
    }
  }, [activeStopIdx]);

  // Animate Traveler Marker from Start Point -> End Point
  useEffect(() => {
    if (!isPlaying || computedPathPoints.length < 2) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    if (progressIdxRef.current >= computedPathPoints.length - 1) {
      progressIdxRef.current = 0;
      onUpdateActiveStop(0);
    }

    let lastTick = performance.now();
    const stepIntervalMs = playbackSpeed === 2 ? 22 : 42;

    const tick = (now: number) => {
      if (now - lastTick >= stepIntervalMs) {
        lastTick = now;
        const nextIdx = progressIdxRef.current + 1;

        if (nextIdx >= computedPathPoints.length) {
          progressIdxRef.current = computedPathPoints.length - 1;
          onProgressChange(100);
          onUpdateActiveStop(enrichedStops.length - 1);
          onFinishPlayback();
          return;
        }

        progressIdxRef.current = nextIdx;
        const nextPos = computedPathPoints[nextIdx];
        setTravelerPos(nextPos);
        if (map && nextIdx % 8 === 0) {
          map.panTo(nextPos);
        }

        const pct = Math.round((nextIdx / (computedPathPoints.length - 1)) * 100);
        onProgressChange(pct);

        for (let s = legStartIndices.length - 1; s >= 0; s--) {
          if (nextIdx >= legStartIndices[s]) {
            onUpdateActiveStop(s);
            setActiveTravelMode(s < enrichedStops.length - 1 ? 'DRIVING' : 'FLIGHT_HOP');
            break;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, computedPathPoints, legStartIndices]);

  if (!travelerPos || enrichedStops.length < 2) return null;

  return (
    <AdvancedMarker position={travelerPos} zIndex={999} title="Active Scouting Traveler">
      <div className="relative flex items-center justify-center">
        <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-rose-400 opacity-60" />
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
          {activeTravelMode === 'DRIVING' ? (
            <Navigation className="w-4 h-4" />
          ) : (
            <Plane className="w-4 h-4" />
          )}
        </div>
      </div>
    </AdvancedMarker>
  );
};

export const ScoutRouteMap: React.FC<ScoutRouteMapProps> = ({
  stops,
  candidateCountries = [],
  focusedCountryId = null,
  selectedCountryId = null,
  selectedCountryName,
  selectedCountryFlag,
  countryCityHubs = [],
  isDiscoveryPreview = false,
  onSelectStopIndex,
  onAddCountryFromMap,
  onAddCustomCityInCountry,
  onRemoveStopFromMap,
  onUpdateStopDatesFromMap,
}) => {
  const apiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
    (typeof process !== 'undefined' && (process as any).env?.GOOGLE_MAPS_PLATFORM_KEY) ||
    '';

  const [mapsAuthFailed, setMapsAuthFailed] = useState(false);
  const [fallbackCanvasMode, setFallbackCanvasMode] = useState<'atlas' | 'google-embed'>('atlas');
  const [atlasZoom, setAtlasZoom] = useState<number>(3.6);
  const [atlasCenter, setAtlasCenter] = useState<[number, number]>([-8, 39.5]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [activeStopIdx, setActiveStopIdx] = useState(0);
  const [selectedMarkerIdx, setSelectedMarkerIdx] = useState<number | null>(null);
  const [selectedCityHubName, setSelectedCityHubName] = useState<string | null>(null);
  const [showCandidatePins, setShowCandidatePins] = useState<boolean>(true);
  const [routeLegs, setRouteLegs] = useState<RouteLegSummary[]>([]);
  const [progressPct, setProgressPct] = useState(0);

  // Listen for Google Maps JS auth failure so the map smoothly falls back if referrer restrictions block the key
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      setMapsAuthFailed(true);
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };
    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  const enrichedStops: EnrichedMapStop[] = useMemo(() => {
    return stops.map(stop => ({
      ...stop,
      coord: getHubCoordinatesForCountry(stop.countryId, stop.countryName, stop.cityFocus),
    }));
  }, [stops]);

  // Active single country context (from explicit prop or first stop)
  const activeCountryId =
    selectedCountryId ||
    enrichedStops[0]?.countryId ||
    focusedCountryId ||
    candidateCountries[0]?.countryId ||
    'portugal';

  const activeCountryMeta = useMemo(() => {
    const cand = candidateCountries.find(
      c => c.countryId.toLowerCase() === activeCountryId.toLowerCase()
    );
    return {
      countryId: activeCountryId,
      countryName:
        selectedCountryName ||
        enrichedStops[0]?.countryName ||
        cand?.countryName ||
        'Portugal',
      countryFlag:
        selectedCountryFlag ||
        enrichedStops[0]?.countryFlag ||
        cand?.countryFlag ||
        '🇵🇹',
      monthlyRateUSD:
        enrichedStops[0]?.monthlyBurnRateUSD || cand?.monthlyRateUSD || 2100,
      fiberMbps: cand?.fiberMbps || 180,
      visaName: enrichedStops[0]?.visaStatusTag || cand?.visaName || 'Residency / Nomad Visa',
      isSchengen: enrichedStops[0]?.isSchengen ?? cand?.isSchengen ?? false,
    };
  }, [
    activeCountryId,
    selectedCountryName,
    selectedCountryFlag,
    enrichedStops,
    candidateCountries,
  ]);

  // Compute baseline geodesic legs immediately so distances, flight/drive badges, and animation always work
  const computedFallbackLegs = useMemo<RouteLegSummary[]>(() => {
    if (enrichedStops.length < 2) return [];
    const legs: RouteLegSummary[] = [];
    for (let i = 0; i < enrichedStops.length - 1; i++) {
      const fromStop = enrichedStops[i];
      const toStop = enrichedStops[i + 1];
      const distKm = calculateDistanceKm(fromStop.coord, toStop.coord);
      const isOverland = distKm < 950;
      const estHours = isOverland
        ? Math.max(1.2, Number((distKm / 78).toFixed(1)))
        : Math.max(1.2, Number((distKm / 720 + 0.6).toFixed(1)));
      const pts = interpolatePoints(
        { lat: fromStop.coord.lat, lng: fromStop.coord.lng },
        { lat: toStop.coord.lat, lng: toStop.coord.lng },
        50
      );
      legs.push({
        legIndex: i,
        fromStop,
        toStop,
        mode: isOverland ? 'DRIVING' : 'FLIGHT_HOP',
        distanceKm: distKm,
        durationText: isOverland ? `~${estHours} hrs overland` : `~${estHours} hrs flight hop`,
        pathPoints: pts,
      });
    }
    return legs;
  }, [enrichedStops]);

  const effectiveRouteLegs = routeLegs.length > 0 ? routeLegs : computedFallbackLegs;

  // Keep atlas center focused on the single chosen country
  useEffect(() => {
    if (enrichedStops.length > 0) {
      const target = enrichedStops[activeStopIdx] || enrichedStops[0];
      setAtlasCenter([target.coord.lng, target.coord.lat]);
      setAtlasZoom(4.2);
    } else if (countryCityHubs.length > 0) {
      setAtlasCenter([countryCityHubs[0].lng, countryCityHubs[0].lat]);
      setAtlasZoom(4.2);
    }
  }, [activeCountryId, enrichedStops.length, activeStopIdx]);

  // Animate Start -> End in Atlas fallback mode when Google Maps JS SDK is not active
  useEffect(() => {
    const useJsSdk = Boolean(apiKey) && !mapsAuthFailed;
    if (useJsSdk || !isPlaying || computedFallbackLegs.length === 0) return;

    const allPoints: LatLngPoint[] = [];
    const legIndices: number[] = [];
    computedFallbackLegs.forEach((leg, idx) => {
      legIndices.push(allPoints.length);
      allPoints.push(...(idx === 0 ? leg.pathPoints : leg.pathPoints.slice(1)));
    });

    if (allPoints.length < 2) return;
    let step = Math.round((progressPct / 100) * (allPoints.length - 1));
    if (step >= allPoints.length - 1) step = 0;

    const intervalMs = playbackSpeed === 2 ? 25 : 45;
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= allPoints.length) {
        setProgressPct(100);
        setActiveStopIdx(enrichedStops.length - 1);
        setIsPlaying(false);
        window.clearInterval(timer);
        return;
      }
      const pct = Math.round((step / (allPoints.length - 1)) * 100);
      setProgressPct(pct);
      for (let s = legIndices.length - 1; s >= 0; s--) {
        if (step >= legIndices[s]) {
          setActiveStopIdx(s);
          break;
        }
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed, apiKey, mapsAuthFailed, computedFallbackLegs]);

  useEffect(() => {
    if (enrichedStops.length > 0 && activeStopIdx >= enrichedStops.length) {
      setActiveStopIdx(enrichedStops.length - 1);
    }
  }, [enrichedStops.length, activeStopIdx]);

  const totalRouteDistanceKm = useMemo(
    () => effectiveRouteLegs.reduce((sum, leg) => sum + leg.distanceKm, 0),
    [effectiveRouteLegs]
  );

  const handleResetAnimation = () => {
    setIsPlaying(false);
    setActiveStopIdx(0);
    setProgressPct(0);
  };

  const defaultCenter = useMemo(() => {
    if (enrichedStops.length > 0) {
      return { lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng };
    }
    if (countryCityHubs.length > 0) {
      return { lat: countryCityHubs[0].lat, lng: countryCityHubs[0].lng };
    }
    return { lat: 38.7223, lng: -9.1393 };
  }, [enrichedStops, countryCityHubs]);

  // Unselected city hubs within the SINGLE chosen country (clutter-free!)
  const unselectedCityHubPins = useMemo(() => {
    if (!showCandidatePins) return [];
    const selectedCoordKeys = new Set(
      enrichedStops.map(s => `${s.coord.lat.toFixed(2)},${s.coord.lng.toFixed(2)}`)
    );
    const selectedCityNames = new Set(
      enrichedStops.map(s => (s.cityFocus || s.coord.cityName).toLowerCase())
    );
    return countryCityHubs.filter(
      h =>
        !selectedCoordKeys.has(`${h.lat.toFixed(2)},${h.lng.toFixed(2)}`) &&
        !selectedCityNames.has(h.cityName.toLowerCase())
    );
  }, [countryCityHubs, enrichedStops, showCandidatePins]);

  const selectedCityHubObj = useMemo(
    () =>
      selectedCityHubName
        ? countryCityHubs.find(
            h => h.cityName.toLowerCase() === selectedCityHubName.toLowerCase()
          ) || null
        : null,
    [selectedCityHubName, countryCityHubs]
  );

  const activeStop = enrichedStops[activeStopIdx] || enrichedStops[0] || null;
  const nextStop = enrichedStops[activeStopIdx + 1] || null;
  const activeLeg = effectiveRouteLegs[activeStopIdx] || null;

  const fallbackTravelerPoint = useMemo<LatLngPoint | null>(() => {
    if (enrichedStops.length < 2 || computedFallbackLegs.length === 0) return null;
    const allPts: LatLngPoint[] = [];
    computedFallbackLegs.forEach((leg, idx) => {
      allPts.push(...(idx === 0 ? leg.pathPoints : leg.pathPoints.slice(1)));
    });
    if (allPts.length === 0) return null;
    const idx = Math.min(
      allPts.length - 1,
      Math.max(0, Math.round((progressPct / 100) * (allPts.length - 1)))
    );
    return allPts[idx];
  }, [enrichedStops.length, computedFallbackLegs, progressPct]);

  return (
    <div className="rounded-3xl bg-white border-2 border-amber-200/90 shadow-md overflow-hidden">
      {/* Light, Multi-Colored Top Route Studio Header & Google Places City Search */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 via-rose-50/80 to-violet-50/90 border-b border-amber-200/80 text-slate-900 space-y-3.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-rose-200 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                {activeCountryMeta.countryFlag} {activeCountryMeta.countryName} Single-Country City Map &amp; Route Animator
              </span>
            </div>

            {enrichedStops.length > 0 ? (
              <h3 className="font-heading text-base sm:text-xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                <span>{activeCountryMeta.countryFlag} {activeCountryMeta.countryName} Route:</span>
                <span className="text-rose-700">
                  {enrichedStops[0]?.coord.cityName.split('(')[0].trim()}
                </span>
                <span className="text-[11px] font-mono text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                  {formatShortIsoDate(enrichedStops[0]?.arrivalDate)}
                </span>
                {enrichedStops.length > 1 && (
                  <>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                    <span className="text-violet-700">
                      {enrichedStops[enrichedStops.length - 1]?.coord.cityName.split('(')[0].trim()}
                    </span>
                    <span className="text-[11px] font-mono text-violet-900 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-md">
                      {formatShortIsoDate(enrichedStops[enrichedStops.length - 1]?.departureDate)}
                    </span>
                  </>
                )}
              </h3>
            ) : (
              <h3 className="font-heading text-base sm:text-xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                <span>
                  Explore {activeCountryMeta.countryFlag} {activeCountryMeta.countryName} Expat Cities on the Map
                </span>
                <span className="text-xs font-mono text-violet-800 bg-violet-100 border border-violet-200 px-2.5 py-0.5 rounded-full">
                  {countryCityHubs.length} Cities Plotted
                </span>
              </h3>
            )}

            <p className="text-xs text-slate-600">
              Map restricted to <strong>{activeCountryMeta.countryName}</strong> for zero clutter ·{' '}
              {enrichedStops.length}{' '}
              {enrichedStops.length === 1 ? 'City Stop' : 'Connected City Stops'}
              {totalRouteDistanceKm > 0
                ? ` · ${totalRouteDistanceKm.toLocaleString()} km animated path`
                : ' · Click any city pin or search below to add cities in this country'}
            </p>
          </div>

          {/* Right Controls: Google Places Single-Country City Autocomplete + Animation Playback */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {onAddCustomCityInCountry && (
              <APIProvider apiKey={apiKey || 'DEMO'}>
                <SingleCountryPlacesCitySearch
                  countryId={activeCountryMeta.countryId}
                  countryName={activeCountryMeta.countryName}
                  countryFlag={activeCountryMeta.countryFlag}
                  countryCityHubs={countryCityHubs}
                  disabled={stops.length >= 5}
                  onSelectCity={(cityName, lat, lng, highlight) => {
                    onAddCustomCityInCountry(
                      activeCountryMeta.countryId,
                      cityName,
                      lat,
                      lng,
                      highlight
                    );
                  }}
                />
              </APIProvider>
            )}

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {countryCityHubs.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowCandidatePins(prev => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showCandidatePins
                      ? 'bg-white border-violet-300 text-violet-900 shadow-2xs'
                      : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                  title={`Toggle other expat city pins in ${activeCountryMeta.countryName}`}
                >
                  {showCandidatePins ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-violet-600" />
                      <span>Other {activeCountryMeta.countryName} Cities ({unselectedCityHubPins.length})</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Show All Cities</span>
                    </>
                  )}
                </button>
              )}

              {enrichedStops.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(prev => !prev)}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-xs ${
                      isPlaying
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                        : 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {progressPct > 0 && progressPct < 100
                            ? 'Resume'
                            : 'Animate Start → End'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(prev => (prev === 1 ? 2 : 1))}
                    className="px-2.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-xs font-mono font-extrabold text-amber-900 cursor-pointer transition-colors"
                    title="Toggle animation speed"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAnimation}
                    className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 cursor-pointer transition-colors"
                    title="Reset to Starting Point"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Start -> Stop -> End Stepper with Dates & Animated Progress Bar */}
        {enrichedStops.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {enrichedStops.map((stop, idx) => {
                const isCurrent = idx === activeStopIdx;
                const isStart = idx === 0;
                const isEnd = idx === enrichedStops.length - 1 && enrichedStops.length > 1;
                return (
                  <React.Fragment key={stop.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveStopIdx(idx);
                        setSelectedMarkerIdx(idx);
                        setSelectedCityHubName(null);
                        onSelectStopIndex?.(idx);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-left transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-slate-900 border-rose-400 shadow-sm ring-2 ring-rose-400/30 scale-[1.01]'
                          : 'bg-white/80 hover:bg-white text-slate-700 border-amber-200/90'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-mono font-extrabold flex items-center justify-center ${
                          isStart
                            ? 'bg-amber-500 text-white'
                            : isEnd
                            ? 'bg-rose-600 text-white'
                            : 'bg-violet-600 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-extrabold">
                          <span>{stop.countryFlag}</span>
                          <span className="truncate max-w-[140px]">
                            {stop.coord.cityName.split('&')[0].split('(')[0].trim()}
                          </span>
                          {isStart && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold">
                              Start
                            </span>
                          )}
                          {isEnd && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 font-extrabold">
                              End
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono truncate max-w-[165px] text-slate-500">
                          {formatShortIsoDate(stop.arrivalDate)}–
                          {formatShortIsoDate(stop.departureDate)} ({stop.days}d)
                        </p>
                      </div>
                    </button>

                    {idx < enrichedStops.length - 1 && (
                      <div className="flex flex-col items-center shrink-0 px-1 text-[10px] font-mono text-rose-700 font-bold">
                        <div className="flex items-center gap-1">
                          {effectiveRouteLegs[idx]?.mode === 'DRIVING' ? (
                            <Car className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Plane className="w-3 h-3 text-violet-600" />
                          )}
                          <span>
                            {effectiveRouteLegs[idx]
                              ? `${effectiveRouteLegs[idx].distanceKm} km`
                              : '•••'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500">
                          {effectiveRouteLegs[idx]?.durationText || 'Hop'}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {enrichedStops.length > 1 && (
              <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.15 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Map Canvas + Active City Stop Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3 h-[390px] sm:h-[450px] w-full relative bg-amber-50/30">
          {apiKey && !mapsAuthFailed ? (
            <APIProvider apiKey={apiKey}>
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={defaultCenter}
                defaultZoom={6}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <RouteDirectionsAndAnimator
                  enrichedStops={enrichedStops}
                  singleCountryCityHubs={countryCityHubs}
                  focusedCountryId={activeCountryId}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  activeStopIdx={activeStopIdx}
                  onUpdateActiveStop={setActiveStopIdx}
                  onFinishPlayback={() => setIsPlaying(false)}
                  onLegsComputed={setRouteLegs}
                  onProgressChange={setProgressPct}
                />

                {/* 1. Unselected Candidate City Pins within the Single Chosen Country */}
                {unselectedCityHubPins.map(cityHub => {
                  const isFocused =
                    selectedCityHubName?.toLowerCase() === cityHub.cityName.toLowerCase();

                  return (
                    <AdvancedMarker
                      key={`city-cand-${cityHub.cityName}`}
                      position={{ lat: cityHub.lat, lng: cityHub.lng }}
                      onClick={() => {
                        setSelectedCityHubName(cityHub.cityName);
                        setSelectedMarkerIdx(null);
                      }}
                      zIndex={isFocused ? 45 : 15}
                      title={`Click to preview or add ${cityHub.cityName} (${activeCountryMeta.countryName})`}
                    >
                      <div
                        className={`group cursor-pointer transition-all duration-300 ${
                          isFocused ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <div
                          className={`px-2.5 py-1 rounded-full border shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-colors ${
                            isFocused
                              ? 'bg-violet-700 border-amber-300 text-white ring-2 ring-amber-300/60'
                              : 'bg-white/95 hover:bg-violet-700 text-slate-800 hover:text-white border-amber-300'
                          }`}
                        >
                          <span className="text-xs leading-none">{activeCountryMeta.countryFlag}</span>
                          <span className="text-[10px] font-extrabold whitespace-nowrap">
                            {cityHub.cityName.split('&')[0].split('(')[0].trim()}
                          </span>
                          {onAddCountryFromMap && stops.length < 5 && (
                            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* 2. Selected City Stop Markers with Connected Dates */}
                {enrichedStops.map((stop, idx) => {
                  const isStart = idx === 0;
                  const isEnd = idx === enrichedStops.length - 1 && enrichedStops.length > 1;
                  const isSelected = idx === activeStopIdx || idx === selectedMarkerIdx;

                  return (
                    <AdvancedMarker
                      key={stop.id}
                      position={{ lat: stop.coord.lat, lng: stop.coord.lng }}
                      onClick={() => {
                        setSelectedMarkerIdx(idx);
                        setActiveStopIdx(idx);
                        setSelectedCityHubName(null);
                        onSelectStopIndex?.(idx);
                      }}
                      zIndex={isSelected ? 70 : 35 + idx}
                      title={`Stop ${idx + 1}: ${stop.coord.cityName} (${stop.countryName}) · ${stop.arrivalDate} to ${stop.departureDate}`}
                    >
                      <div
                        className={`group cursor-pointer transition-transform duration-300 flex flex-col items-center ${
                          isSelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <div
                          className={`px-2.5 py-1.5 rounded-2xl border-2 shadow-xl flex items-center gap-1.5 ${
                            isStart
                              ? 'bg-amber-500 border-white text-slate-950'
                              : isEnd
                              ? 'bg-rose-600 border-white text-white'
                              : 'bg-violet-600 border-white text-white'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-black/20 text-white font-mono text-[11px] font-extrabold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm leading-none">{stop.countryFlag}</span>
                          <div className="text-left leading-tight">
                            <span className="text-xs font-extrabold whitespace-nowrap block">
                              {stop.coord.cityName.split('&')[0].split('(')[0].trim()}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold whitespace-nowrap block ${
                                isStart ? 'text-slate-900' : 'text-white/90'
                              }`}
                            >
                              {formatShortIsoDate(stop.arrivalDate)} –{' '}
                              {formatShortIsoDate(stop.departureDate)} · {stop.days}d
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-2.5 h-2.5 rotate-45 -mt-1 border-r-2 border-b-2 border-white ${
                            isStart
                              ? 'bg-amber-500'
                              : isEnd
                              ? 'bg-rose-600'
                              : 'bg-violet-600'
                          }`}
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow when a Selected City Stop Marker is clicked */}
                {selectedMarkerIdx !== null && enrichedStops[selectedMarkerIdx] && (
                  <InfoWindow
                    position={{
                      lat: enrichedStops[selectedMarkerIdx].coord.lat,
                      lng: enrichedStops[selectedMarkerIdx].coord.lng,
                    }}
                    onCloseClick={() => setSelectedMarkerIdx(null)}
                    maxWidth={290}
                  >
                    <div className="p-1.5 space-y-2 text-slate-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-mono text-[10px] font-extrabold">
                          City Stop #{selectedMarkerIdx + 1}{' '}
                          {selectedMarkerIdx === 0
                            ? '· START'
                            : selectedMarkerIdx === enrichedStops.length - 1 &&
                              enrichedStops.length > 1
                            ? '· END'
                            : ''}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-amber-800">
                          {enrichedStops[selectedMarkerIdx].days} Days · $
                          {enrichedStops[selectedMarkerIdx].stopBurnUSD.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-extrabold">
                          {enrichedStops[selectedMarkerIdx].countryFlag}{' '}
                          {enrichedStops[selectedMarkerIdx].coord.cityName}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          {enrichedStops[selectedMarkerIdx].coord.highlight}
                        </p>
                      </div>

                      {onUpdateStopDatesFromMap && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200">
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-500 block">
                              Arrival
                            </label>
                            <input
                              type="date"
                              min={getTodayLocalIsoDate()}
                              value={enrichedStops[selectedMarkerIdx].arrivalDate}
                              onChange={e =>
                                onUpdateStopDatesFromMap(enrichedStops[selectedMarkerIdx].id, {
                                  arrivalDate: e.target.value,
                                })
                              }
                              className="w-full px-1.5 py-1 rounded border border-slate-300 text-[10px] font-mono font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-500 block">
                              Departure
                            </label>
                            <input
                              type="date"
                              min={
                                enrichedStops[selectedMarkerIdx].arrivalDate &&
                                enrichedStops[selectedMarkerIdx].arrivalDate >= getTodayLocalIsoDate()
                                  ? enrichedStops[selectedMarkerIdx].arrivalDate
                                  : getTodayLocalIsoDate()
                              }
                              value={enrichedStops[selectedMarkerIdx].departureDate}
                              onChange={e =>
                                onUpdateStopDatesFromMap(enrichedStops[selectedMarkerIdx].id, {
                                  departureDate: e.target.value,
                                })
                              }
                              className="w-full px-1.5 py-1 rounded border border-slate-300 text-[10px] font-mono font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-1 border-t border-slate-200 flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-700">
                        <span>{enrichedStops[selectedMarkerIdx].visaStatusTag}</span>
                        {onRemoveStopFromMap && (
                          <button
                            type="button"
                            onClick={() => {
                              const idToRemove = enrichedStops[selectedMarkerIdx].id;
                              setSelectedMarkerIdx(null);
                              onRemoveStopFromMap(idToRemove);
                            }}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove City</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {/* InfoWindow when an Unselected City Pin in the same country is clicked */}
                {selectedCityHubObj && (
                  <InfoWindow
                    position={{
                      lat: selectedCityHubObj.lat,
                      lng: selectedCityHubObj.lng,
                    }}
                    onCloseClick={() => setSelectedCityHubName(null)}
                    maxWidth={290}
                  >
                    <div className="p-1.5 space-y-2 text-slate-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-mono text-[10px] font-extrabold">
                          {activeCountryMeta.countryFlag} {activeCountryMeta.countryName} Expat Hub
                        </span>
                        <span className="text-xs font-mono font-extrabold text-rose-700">
                          {selectedCityHubObj.airportCode}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          {selectedCityHubObj.cityName}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          {selectedCityHubObj.highlight}
                        </p>
                      </div>

                      {onAddCountryFromMap && (
                        <button
                          type="button"
                          onClick={() => {
                            onAddCountryFromMap(
                              activeCountryMeta.countryId,
                              selectedCityHubObj.cityName
                            );
                            setSelectedCityHubName(null);
                          }}
                          disabled={stops.length >= 5}
                          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            Add {selectedCityHubObj.cityName.split('(')[0].trim()} as Stop #
                            {stops.length + 1}
                          </span>
                        </button>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Light, Multi-Colored Single-Country Atlas + Live Google Maps City Embed Engine */
            <div className="w-full h-full relative bg-gradient-to-br from-amber-50/70 via-sky-50/60 to-rose-50/60 overflow-hidden select-none">
              <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-md border border-amber-200 pointer-events-auto shadow-md">
                  <button
                    type="button"
                    onClick={() => setFallbackCanvasMode('atlas')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      fallbackCanvasMode === 'atlas'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{activeCountryMeta.countryName} Route Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFallbackCanvasMode('google-embed')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      fallbackCanvasMode === 'google-embed'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      Google Maps Live View (
                      {selectedCityHubObj?.cityName.split('(')[0].trim() ||
                        activeStop?.coord.cityName.split('(')[0].trim() ||
                        countryCityHubs[0]?.cityName.split('(')[0].trim() ||
                        activeCountryMeta.countryName}
                      )
                    </span>
                  </button>
                </div>

                {fallbackCanvasMode === 'atlas' && (
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-md border border-amber-200 pointer-events-auto shadow-md">
                    <button
                      type="button"
                      onClick={() => setAtlasZoom(z => Math.min(9, Number((z * 1.35).toFixed(2))))}
                      className="p-1.5 rounded-lg text-slate-700 hover:bg-amber-50 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAtlasZoom(z => Math.max(1.5, Number((z / 1.35).toFixed(2))))}
                      className="p-1.5 rounded-lg text-slate-700 hover:bg-amber-50 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAtlasZoom(4.2);
                        setAtlasCenter([defaultCenter.lng, defaultCenter.lat]);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      Center {activeCountryMeta.countryName}
                    </button>
                  </div>
                )}
              </div>

              {fallbackCanvasMode === 'google-embed' ? (
                <iframe
                  title="Google Maps Destination View"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedCityHubObj
                      ? `${selectedCityHubObj.cityName}, ${activeCountryMeta.countryName}`
                      : activeStop
                      ? `${activeStop.coord.cityName}, ${activeStop.countryName}`
                      : countryCityHubs[0]
                      ? `${countryCityHubs[0].cityName}, ${activeCountryMeta.countryName}`
                      : activeCountryMeta.countryName
                  )}&z=11&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 140 }}
                  className="w-full h-full"
                >
                  <ZoomableGroup
                    center={atlasCenter}
                    zoom={atlasZoom}
                    onMoveEnd={({ coordinates, zoom }) => {
                      if (coordinates) setAtlasCenter(coordinates as [number, number]);
                      if (typeof zoom === 'number') setAtlasZoom(zoom);
                    }}
                  >
                    <Geographies geography={worldGeo as any}>
                      {({ geographies }) =>
                        geographies.map(geo => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth={0.45}
                            style={
                              {
                                default: { outline: 'none' },
                                hover: { fill: '#fde68a', outline: 'none' },
                                pressed: { outline: 'none' },
                              } as any
                            }
                          />
                        ))
                      }
                    </Geographies>

                    {/* Animated Route Polylines Connecting Selected Cities */}
                    {effectiveRouteLegs.map(leg => (
                      <React.Fragment key={`leg-line-${leg.legIndex}`}>
                        <Line
                          from={[leg.fromStop.coord.lng, leg.fromStop.coord.lat]}
                          to={[leg.toStop.coord.lng, leg.toStop.coord.lat]}
                          stroke="#e11d48"
                          strokeWidth={3.2 / Math.sqrt(atlasZoom)}
                          strokeLinecap="round"
                          strokeOpacity={0.45}
                        />
                        <Line
                          from={[leg.fromStop.coord.lng, leg.fromStop.coord.lat]}
                          to={[leg.toStop.coord.lng, leg.toStop.coord.lat]}
                          stroke="#7c3aed"
                          strokeWidth={1.8 / Math.sqrt(atlasZoom)}
                          strokeDasharray="5 4"
                          strokeLinecap="round"
                        />
                      </React.Fragment>
                    ))}

                    {/* Candidate City Pins within the Single Country */}
                    {unselectedCityHubPins.map(cityHub => {
                      const isFocused =
                        selectedCityHubName?.toLowerCase() === cityHub.cityName.toLowerCase();
                      return (
                        <Marker
                          key={`atlas-city-${cityHub.cityName}`}
                          coordinates={[cityHub.lng, cityHub.lat]}
                          onClick={() => {
                            setSelectedCityHubName(cityHub.cityName);
                            setSelectedMarkerIdx(null);
                          }}
                        >
                          <g className="cursor-pointer group">
                            <circle
                              r={(isFocused ? 7 : 5) / Math.sqrt(atlasZoom)}
                              fill={isFocused ? '#7c3aed' : '#ffffff'}
                              stroke="#e11d48"
                              strokeWidth={1.3 / Math.sqrt(atlasZoom)}
                            />
                            <text
                              textAnchor="middle"
                              y={-9 / Math.sqrt(atlasZoom)}
                              style={{
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: `${Math.max(6, 10 / Math.sqrt(atlasZoom))}px`,
                                fontWeight: 800,
                                fill: '#881337',
                                pointerEvents: 'none',
                              }}
                            >
                              {cityHub.cityName.split('&')[0].split('(')[0].trim()}
                            </text>
                          </g>
                        </Marker>
                      );
                    })}

                    {/* Selected City Stop Markers */}
                    {enrichedStops.map((stop, idx) => {
                      const isStart = idx === 0;
                      const isEnd = idx === enrichedStops.length - 1 && enrichedStops.length > 1;
                      const fillHex = isStart ? '#f59e0b' : isEnd ? '#e11d48' : '#7c3aed';
                      return (
                        <Marker
                          key={`atlas-stop-${stop.id}`}
                          coordinates={[stop.coord.lng, stop.coord.lat]}
                          onClick={() => {
                            setSelectedMarkerIdx(idx);
                            setActiveStopIdx(idx);
                            setSelectedCityHubName(null);
                            onSelectStopIndex?.(idx);
                          }}
                        >
                          <g className="cursor-pointer">
                            <circle
                              r={11 / Math.sqrt(atlasZoom)}
                              fill={fillHex}
                              fillOpacity={0.25}
                            />
                            <circle
                              r={7 / Math.sqrt(atlasZoom)}
                              fill={fillHex}
                              stroke="#ffffff"
                              strokeWidth={1.5 / Math.sqrt(atlasZoom)}
                            />
                            <text
                              textAnchor="middle"
                              y={2.5 / Math.sqrt(atlasZoom)}
                              style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: `${Math.max(6, 8.5 / Math.sqrt(atlasZoom))}px`,
                                fontWeight: 800,
                                fill: '#ffffff',
                                pointerEvents: 'none',
                              }}
                            >
                              {idx + 1}
                            </text>
                            <text
                              textAnchor="middle"
                              y={-11 / Math.sqrt(atlasZoom)}
                              style={{
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: `${Math.max(7, 10.5 / Math.sqrt(atlasZoom))}px`,
                                fontWeight: 800,
                                fill: '#1e293b',
                                pointerEvents: 'none',
                              }}
                            >
                              {stop.coord.cityName.split('&')[0].split('(')[0].trim()} (
                              {formatShortIsoDate(stop.arrivalDate)})
                            </text>
                          </g>
                        </Marker>
                      );
                    })}

                    {/* Animated Traveler Marker from Start -> End */}
                    {fallbackTravelerPoint && enrichedStops.length >= 2 && (
                      <Marker coordinates={[fallbackTravelerPoint.lng, fallbackTravelerPoint.lat]}>
                        <g>
                          <circle
                            r={10 / Math.sqrt(atlasZoom)}
                            fill="#e11d48"
                            fillOpacity={0.35}
                          />
                          <circle
                            r={5.5 / Math.sqrt(atlasZoom)}
                            fill="#e11d48"
                            stroke="#ffffff"
                            strokeWidth={1.5 / Math.sqrt(atlasZoom)}
                          />
                        </g>
                      </Marker>
                    )}
                  </ZoomableGroup>
                </ComposableMap>
              )}
            </div>
          )}

          {/* Light Multi-Colored Floating Map Legend Badge */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-xl border border-amber-200 text-[10px] font-bold shadow-md">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Start City</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
              <span>Mid Stop</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <span>Final City</span>
            </span>
            <span>·</span>
            <span className="text-rose-700 font-extrabold">
              Focused on {activeCountryMeta.countryFlag} {activeCountryMeta.countryName}
            </span>
          </div>
        </div>

        {/* Right Side: Light Multi-Colored Active City Stop & Directions Leg Inspector */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-50/50 via-white to-rose-50/40 border-t lg:border-t-0 lg:border-l border-amber-200/80 flex flex-col justify-between space-y-4">
          {activeStop ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-mono text-[10px] font-extrabold uppercase tracking-wider">
                    City {activeStopIdx + 1} of {enrichedStops.length}
                    {activeStopIdx === 0
                      ? ' · Start'
                      : activeStopIdx === enrichedStops.length - 1 && enrichedStops.length > 1
                      ? ' · Finale'
                      : ''}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    {activeStop.coord.airportCode} Hub
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeStop.countryFlag}</span>
                      <div>
                        <h4 className="font-heading text-base font-extrabold text-slate-900">
                          {activeStop.coord.cityName}
                        </h4>
                        <p className="text-xs font-bold text-rose-700">
                          {activeStop.countryName}
                        </p>
                      </div>
                    </div>

                    {onRemoveStopFromMap && (
                      <button
                        type="button"
                        onClick={() => onRemoveStopFromMap(activeStop.id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Remove this city stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {activeStop.coord.highlight}
                  </p>
                </div>

                {/* Live Connected Date Pickers for Active City Stop */}
                {onUpdateStopDatesFromMap ? (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/90 space-y-2 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>City Stay Dates ({activeStop.days} Days)</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block">
                          Arrival
                        </label>
                        <input
                          type="date"
                          min={getTodayLocalIsoDate()}
                          value={activeStop.arrivalDate}
                          onChange={e =>
                            onUpdateStopDatesFromMap(activeStop.id, {
                              arrivalDate: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-amber-50/40 border border-amber-200 text-[11px] font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block">
                          Departure
                        </label>
                        <input
                          type="date"
                          min={
                            activeStop.arrivalDate &&
                            activeStop.arrivalDate >= getTodayLocalIsoDate()
                              ? activeStop.arrivalDate
                              : getTodayLocalIsoDate()
                          }
                          value={activeStop.departureDate}
                          onChange={e =>
                            onUpdateStopDatesFromMap(activeStop.id, {
                              departureDate: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-amber-50/40 border border-amber-200 text-[11px] font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/90">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Stay Window</span>
                      </span>
                      <p className="text-sm font-mono font-extrabold text-slate-900 mt-0.5">
                        {activeStop.days} Days
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        {activeStop.arrivalDate} → {activeStop.departureDate}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-rose-200/90">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-rose-600" />
                        <span>City Living Burn</span>
                      </span>
                      <p className="text-sm font-mono font-extrabold text-rose-800 mt-0.5">
                        ${activeStop.stopBurnUSD.toLocaleString()}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        ${activeStop.monthlyBurnRateUSD.toLocaleString()}/mo rate
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-950 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>Est. Stop Burn:</span>
                  </span>
                  <span className="font-mono font-extrabold text-amber-900">
                    ${activeStop.stopBurnUSD.toLocaleString()} ({activeStop.days}d)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-violet-50/80 border border-violet-200/90 flex items-center justify-between text-xs">
                  <span className="font-semibold text-violet-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                    <span>{activeStop.visaStatusTag}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeStop.isSchengen
                        ? 'bg-violet-200/80 text-violet-950'
                        : 'bg-amber-200/80 text-amber-950'
                    }`}
                  >
                    {activeStop.isSchengen ? 'Schengen' : 'Non-Schengen'}
                  </span>
                </div>
              </div>

              {/* Next Hop Directions Summary (Light Multi-Colored Card) */}
              {nextStop && activeLeg ? (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-violet-50 border border-rose-200 text-slate-900 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                    <span className="flex items-center gap-1">
                      {activeLeg.mode === 'DRIVING' ? (
                        <Car className="w-3.5 h-3.5" />
                      ) : (
                        <Plane className="w-3.5 h-3.5" />
                      )}
                      <span>Next City Hop</span>
                    </span>
                    <span className="font-mono">{activeLeg.distanceKm.toLocaleString()} km</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-900">
                    To {nextStop.countryFlag} {nextStop.coord.cityName.split('(')[0].trim()}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">{activeLeg.durationText}</p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {enrichedStops.length === 1
                      ? `Single-city immersion in ${activeStop.coord.cityName.split('(')[0].trim()}, or click another ${activeStop.countryName} city pin to hop!`
                      : `Final city stop in ${activeStop.countryName}.`}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* When 0 stops are selected, show single-country city picker list */
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-[10px] font-extrabold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-rose-600" />
                <span>{activeCountryMeta.countryFlag} {activeCountryMeta.countryName} Cities</span>
              </div>

              <h4 className="font-heading text-sm sm:text-base font-extrabold text-slate-900">
                Pick Expat Cities in {activeCountryMeta.countryName}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click any city pin on the map or below to add it to your{' '}
                <strong>{activeCountryMeta.countryName}</strong> scouting route.
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Suggested Cities in {activeCountryMeta.countryName}:
                </span>
                <div className="space-y-1.5 max-h-[230px] overflow-y-auto pr-1">
                  {countryCityHubs.map(cityHub => (
                    <div
                      key={cityHub.cityName}
                      className="p-2 rounded-xl bg-white border border-amber-200/90 hover:border-rose-300 flex items-center justify-between gap-2 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCityHubName(cityHub.cityName)}
                        className="text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                          <span>{activeCountryMeta.countryFlag}</span>
                          <span className="truncate">{cityHub.cityName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {cityHub.highlight}
                        </span>
                      </button>
                      {onAddCountryFromMap && (
                        <button
                          type="button"
                          onClick={() =>
                            onAddCountryFromMap(activeCountryMeta.countryId, cityHub.cityName)
                          }
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-[10px] font-extrabold shrink-0 cursor-pointer transition-colors"
                        >
                          + Add City
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

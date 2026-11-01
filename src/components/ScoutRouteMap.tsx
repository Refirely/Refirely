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
  isDiscoveryPreview?: boolean;
  onSelectStopIndex?: (index: number) => void;
  onAddCountryFromMap?: (countryId: string, preferredCity?: string) => void;
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
 * Inner Map Controller that uses `useMap()` and `useMapsLibrary('routes')`
 * to compute directions (`Route.computeRoutes`), draw a continuously animated flowing polyline
 * connecting the selected itinerary stops, fit bounds to selected or candidate pins, and run Start -> End traveler playback.
 */
const RouteDirectionsAndAnimator: React.FC<{
  enrichedStops: EnrichedMapStop[];
  candidateCountries: CandidateMapCountry[];
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
  candidateCountries,
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

  // Pan to focused candidate country when user clicks "Preview on Map" or hovers/selects a country card
  useEffect(() => {
    if (!map || !focusedCountryId) return;
    const matchedStop = enrichedStops.find(
      s => s.countryId.toLowerCase() === focusedCountryId.toLowerCase()
    );
    if (matchedStop) {
      map.panTo({ lat: matchedStop.coord.lat, lng: matchedStop.coord.lng });
      return;
    }
    const matchedCandidate = candidateCountries.find(
      c => c.countryId.toLowerCase() === focusedCountryId.toLowerCase()
    );
    if (matchedCandidate) {
      map.panTo({ lat: matchedCandidate.coord.lat, lng: matchedCandidate.coord.lng });
      if ((map.getZoom() || 4) < 5) {
        map.setZoom(5);
      }
    }
  }, [map, focusedCountryId]);

  // Fit bounds when selected stops or candidate countries change
  useEffect(() => {
    const gMaps = (window as any).google?.maps;
    if (!map || !gMaps) return;

    if (enrichedStops.length === 1) {
      map.panTo({ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng });
      map.setZoom(6);
      setTravelerPos({ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng });
      setComputedPathPoints([{ lat: enrichedStops[0].coord.lat, lng: enrichedStops[0].coord.lng }]);
      onLegsComputed([]);
      return;
    }

    if (enrichedStops.length > 1) {
      const bounds = new gMaps.LatLngBounds();
      enrichedStops.forEach(s => {
        bounds.extend({ lat: s.coord.lat, lng: s.coord.lng });
      });
      map.fitBounds(bounds, 75);
      return;
    }

    // If 0 stops selected, fit bounds to candidate countries in the chosen continent/filter
    if (candidateCountries.length > 0) {
      const bounds = new gMaps.LatLngBounds();
      candidateCountries.slice(0, 18).forEach(c => {
        bounds.extend({ lat: c.coord.lat, lng: c.coord.lng });
      });
      map.fitBounds(bounds, 60);
    }
  }, [
    map,
    enrichedStops.map(s => `${s.id}:${s.coord.lat},${s.coord.lng}`).join('|'),
    enrichedStops.length === 0 ? candidateCountries.map(c => c.countryId).join('|') : '',
  ]);

  // Compute Routes using modern `Route.computeRoutes` for overland legs + geodesic arcs for cross-sea legs,
  // and render a CONTINUOUSLY ANIMATED POLYLINE connecting all selected itinerary stops!
  useEffect(() => {
    const gMaps = (window as any).google?.maps;
    if (!map || !gMaps) return;

    // Clear previous polylines & flow timers
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
                      strokeColor: '#4f46e5', // Indigo-600 base road route
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

                // Sample down to ~70 points per leg so animation speed is uniform
                const sampled: LatLngPoint[] = [];
                const sampleCount = 70;
                for (let s = 0; s <= sampleCount; s++) {
                  const idx = Math.min(
                    extractedPath.length - 1,
                    Math.floor((s / sampleCount) * (extractedPath.length - 1))
                  );
                  sampled.push(extractedPath[idx]);
                }

                // Add an animated directional flow polyline on top of the road route!
                const roadFlowPolyline = new gMaps.Polyline({
                  path: sampled,
                  geodesic: false,
                  strokeColor: '#4f46e5',
                  strokeOpacity: 0.85,
                  strokeWeight: 3.5,
                  icons: [
                    {
                      icon: {
                        path: gMaps.SymbolPath?.FORWARD_CLOSED_ARROW ?? 1,
                        scale: 3,
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
            // Fallback to geodesic flight hop if overland route crosses sea or is unavailable
          }
        }

        if (!legResolved && !isCancelled) {
          const flightPts = interpolatePoints(originPt, destPt, 70);
          const flightHours = Math.max(1, Math.round((straightDistKm / 780) * 10) / 10);

          // Base subtle glowing geodesic arc
          const baseFlightPoly = new gMaps.Polyline({
            path: [originPt, destPt],
            geodesic: true,
            strokeColor: '#0d9488',
            strokeOpacity: 0.35,
            strokeWeight: 6,
            map,
          });
          polylinesRef.current.push(baseFlightPoly);

          // Foreground animated flowing polyline with moving directional arrows & dashes
          const dashSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.95,
            strokeColor: '#14b8a6',
            scale: 3.5,
          };
          const arrowSymbol = {
            path: gMaps.SymbolPath?.FORWARD_CLOSED_ARROW ?? 1,
            scale: 3.3,
            strokeColor: '#ffffff',
            strokeWeight: 1.2,
            fillColor: '#0d9488',
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
            durationText: `~${flightHours}h flight hop`,
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

        // Start continuous flowing polyline animation so arrows visibly travel along the route path!
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
        <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-amber-400 opacity-60" />
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
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
  isDiscoveryPreview = false,
  onSelectStopIndex,
  onAddCountryFromMap,
  onRemoveStopFromMap,
  onUpdateStopDatesFromMap,
}) => {
  const apiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
    (typeof process !== 'undefined' && (process as any).env?.GOOGLE_MAPS_PLATFORM_KEY) ||
    '';

  const [mapsAuthFailed, setMapsAuthFailed] = useState(false);
  const [fallbackCanvasMode, setFallbackCanvasMode] = useState<'atlas' | 'google-embed'>('atlas');
  const [atlasZoom, setAtlasZoom] = useState<number>(1.8);
  const [atlasCenter, setAtlasCenter] = useState<[number, number]>([10, 25]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [activeStopIdx, setActiveStopIdx] = useState(0);
  const [selectedMarkerIdx, setSelectedMarkerIdx] = useState<number | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
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
        ? Math.max(1.5, Number((distKm / 78).toFixed(1)))
        : Math.max(1.5, Number((distKm / 720 + 0.8).toFixed(1)));
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
        durationText: isOverland ? `~${estHours} hrs drive` : `~${estHours} hrs flight hop`,
        pathPoints: pts,
      });
    }
    return legs;
  }, [enrichedStops]);

  const effectiveRouteLegs = routeLegs.length > 0 ? routeLegs : computedFallbackLegs;

  // Keep atlas center focused on selected stops or candidate countries
  useEffect(() => {
    if (enrichedStops.length > 0) {
      const target = enrichedStops[activeStopIdx] || enrichedStops[0];
      setAtlasCenter([target.coord.lng, target.coord.lat]);
      if (atlasZoom < 2.2) setAtlasZoom(2.4);
    } else if (candidateCountries.length > 0) {
      const avgLng =
        candidateCountries.reduce((acc, c) => acc + c.coord.lng, 0) / candidateCountries.length;
      const avgLat =
        candidateCountries.reduce((acc, c) => acc + c.coord.lat, 0) / candidateCountries.length;
      setAtlasCenter([avgLng, avgLat]);
    }
  }, [enrichedStops.length, activeStopIdx]);

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

  // Keep activeStopIdx within bounds when stops are added/removed
  useEffect(() => {
    if (enrichedStops.length > 0 && activeStopIdx >= enrichedStops.length) {
      setActiveStopIdx(enrichedStops.length - 1);
    }
  }, [enrichedStops.length, activeStopIdx]);

  // Open candidate InfoWindow if focusedCountryId changes
  useEffect(() => {
    if (!focusedCountryId) return;
    const stopIdx = enrichedStops.findIndex(
      s => s.countryId.toLowerCase() === focusedCountryId.toLowerCase()
    );
    if (stopIdx !== -1) {
      setActiveStopIdx(stopIdx);
      setSelectedMarkerIdx(stopIdx);
      setSelectedCandidateId(null);
      setAtlasCenter([enrichedStops[stopIdx].coord.lng, enrichedStops[stopIdx].coord.lat]);
    } else {
      setSelectedCandidateId(focusedCountryId);
      setSelectedMarkerIdx(null);
      const cand = candidateCountries.find(
        c => c.countryId.toLowerCase() === focusedCountryId.toLowerCase()
      );
      if (cand) {
        setAtlasCenter([cand.coord.lng, cand.coord.lat]);
      }
    }
  }, [focusedCountryId]);

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
    if (candidateCountries.length > 0) {
      return { lat: candidateCountries[0].coord.lat, lng: candidateCountries[0].coord.lng };
    }
    return { lat: 38.7223, lng: -9.1393 };
  }, [enrichedStops, candidateCountries]);

  // Filter out candidate countries that are already at the exact same coordinate as a selected stop
  const unselectedCandidatePins = useMemo(() => {
    if (!showCandidatePins && enrichedStops.length > 0) return [];
    const selectedCoordKeys = new Set(
      enrichedStops.map(s => `${s.coord.lat.toFixed(2)},${s.coord.lng.toFixed(2)}`)
    );
    return candidateCountries.filter(
      c => !selectedCoordKeys.has(`${c.coord.lat.toFixed(2)},${c.coord.lng.toFixed(2)}`)
    );
  }, [candidateCountries, enrichedStops, showCandidatePins]);

  const selectedCandidateObj = useMemo(
    () =>
      selectedCandidateId
        ? candidateCountries.find(
            c => c.countryId.toLowerCase() === selectedCandidateId.toLowerCase()
          ) || null
        : null,
    [selectedCandidateId, candidateCountries]
  );

  const activeStop = enrichedStops[activeStopIdx] || enrichedStops[0] || null;
  const nextStop = enrichedStops[activeStopIdx + 1] || null;
  const activeLeg = effectiveRouteLegs[activeStopIdx] || null;

  // Interpolated traveler position for Atlas fallback animation
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
    <div className="rounded-3xl bg-white border border-indigo-200/90 shadow-md overflow-hidden">
      {/* Top Route Studio Header & Animation Controls */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-200 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>
                {isDiscoveryPreview
                  ? 'Live Interactive Map Selector & Animated Route Preview'
                  : 'Interactive Google Maps Route & Directions Engine'}
              </span>
            </div>

            {enrichedStops.length > 0 ? (
              <h3 className="font-heading text-base sm:text-xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
                <span>Active Route Path:</span>
                <span className="text-teal-300">
                  {enrichedStops[0]?.countryFlag} {enrichedStops[0]?.coord.cityName}
                </span>
                <span className="text-[11px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  {formatShortIsoDate(enrichedStops[0]?.arrivalDate)}
                </span>
                {enrichedStops.length > 1 && (
                  <>
                    <ChevronRight className="w-4 h-4 text-teal-400" />
                    <span className="text-amber-300">
                      {enrichedStops[enrichedStops.length - 1]?.countryFlag}{' '}
                      {enrichedStops[enrichedStops.length - 1]?.coord.cityName}
                    </span>
                    <span className="text-[11px] font-mono text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md">
                      {formatShortIsoDate(enrichedStops[enrichedStops.length - 1]?.departureDate)}
                    </span>
                  </>
                )}
              </h3>
            ) : (
              <h3 className="font-heading text-base sm:text-xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
                <span>Click Any Country Pin on the Map to Start Your Route</span>
                <span className="text-xs font-mono text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full">
                  {candidateCountries.length} Havens Visible
                </span>
              </h3>
            )}

            <p className="text-xs text-slate-300">
              {enrichedStops.length > 0 ? (
                <>
                  {enrichedStops.length}{' '}
                  {enrichedStops.length === 1 ? 'Selected Stop' : 'Connected Stops'} ·{' '}
                  {totalRouteDistanceKm > 0
                    ? `${totalRouteDistanceKm.toLocaleString()} km animated polyline route · `
                    : ''}
                  Click any map pin to add/remove stops or edit arrival &amp; departure dates live.
                </>
              ) : (
                'Explore candidate pins visually on Google Maps—click any pin to inspect fiber speed, monthly living burn, and add cities directly to your route.'
              )}
            </p>
          </div>

          {/* Right Controls: Candidate Pins Toggle + Animation Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {candidateCountries.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCandidatePins(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showCandidatePins
                    ? 'bg-teal-500/20 border-teal-400/50 text-teal-200 hover:bg-teal-500/30'
                    : 'bg-white/10 border-white/15 text-slate-300 hover:bg-white/15'
                }`}
                title="Toggle unselected discovery country pins on the map"
              >
                {showCandidatePins ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-teal-300" />
                    <span>Discovery Pins ({unselectedCandidatePins.length})</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Show Discovery Pins</span>
                  </>
                )}
              </button>
            )}

            {enrichedStops.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPlaying(prev => !prev)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-md ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Route</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {progressPct > 0 && progressPct < 100
                          ? 'Resume Route'
                          : 'Animate Start → End'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(prev => (prev === 1 ? 2 : 1))}
                  className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-teal-200 cursor-pointer transition-colors"
                  title="Toggle animation speed"
                >
                  {playbackSpeed}x
                </button>

                <button
                  type="button"
                  onClick={handleResetAnimation}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 cursor-pointer transition-colors"
                  title="Reset to Starting Point"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
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
                        setSelectedCandidateId(null);
                        onSelectStopIndex?.(idx);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-left transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-slate-900 border-amber-400 shadow-md scale-[1.02]'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-mono font-extrabold flex items-center justify-center ${
                          isStart
                            ? 'bg-emerald-500 text-white'
                            : isEnd
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-indigo-500 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-extrabold">
                          <span>{stop.countryFlag}</span>
                          <span className="truncate max-w-[115px]">{stop.countryName}</span>
                          {isStart && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 font-extrabold">
                              Start
                            </span>
                          )}
                          {isEnd && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-800 font-extrabold">
                              End
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[10px] font-mono truncate max-w-[165px] ${
                            isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {stop.coord.cityName.split('&')[0].trim()} ·{' '}
                          {formatShortIsoDate(stop.arrivalDate)}–
                          {formatShortIsoDate(stop.departureDate)} ({stop.days}d)
                        </p>
                      </div>
                    </button>

                    {idx < enrichedStops.length - 1 && (
                      <div className="flex flex-col items-center shrink-0 px-1 text-[10px] font-mono text-teal-300">
                        <div className="flex items-center gap-1">
                          {effectiveRouteLegs[idx]?.mode === 'DRIVING' ? (
                            <Car className="w-3 h-3 text-indigo-300" />
                          ) : (
                            <Plane className="w-3 h-3 text-teal-300" />
                          )}
                          <span>
                            {effectiveRouteLegs[idx]
                              ? `${effectiveRouteLegs[idx].distanceKm} km`
                              : '•••'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400">
                          {effectiveRouteLegs[idx]?.durationText || 'Hop'}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {enrichedStops.length > 1 && (
              <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.15 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Map Canvas + Active Stop / Candidate Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3 h-[390px] sm:h-[460px] w-full relative bg-slate-100">
          {apiKey && !mapsAuthFailed ? (
            <APIProvider apiKey={apiKey}>
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={defaultCenter}
                defaultZoom={4}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <RouteDirectionsAndAnimator
                  enrichedStops={enrichedStops}
                  candidateCountries={candidateCountries}
                  focusedCountryId={focusedCountryId}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  activeStopIdx={activeStopIdx}
                  onUpdateActiveStop={setActiveStopIdx}
                  onFinishPlayback={() => setIsPlaying(false)}
                  onLegsComputed={setRouteLegs}
                  onProgressChange={setProgressPct}
                />

                {/* 1. Candidate Discovery Country Markers (Interactive Visual Picker Pins) */}
                {unselectedCandidatePins.map(cand => {
                  const isFocused =
                    selectedCandidateId?.toLowerCase() === cand.countryId.toLowerCase() ||
                    focusedCountryId?.toLowerCase() === cand.countryId.toLowerCase();

                  return (
                    <AdvancedMarker
                      key={`cand-${cand.countryId}`}
                      position={{ lat: cand.coord.lat, lng: cand.coord.lng }}
                      onClick={() => {
                        setSelectedCandidateId(cand.countryId);
                        setSelectedMarkerIdx(null);
                      }}
                      zIndex={isFocused ? 45 : 10}
                      title={`Click to preview or add ${cand.countryName} (${cand.coord.cityName}) — $${cand.monthlyRateUSD}/mo`}
                    >
                      <div
                        className={`group cursor-pointer transition-all duration-300 ${
                          isFocused ? 'scale-115' : 'hover:scale-110'
                        }`}
                      >
                        <div
                          className={`px-2 py-1 rounded-full border shadow-md flex items-center gap-1 backdrop-blur-xs transition-colors ${
                            isFocused
                              ? 'bg-slate-900 border-teal-400 text-white ring-2 ring-teal-400/50'
                              : 'bg-white/95 hover:bg-slate-900 text-slate-800 hover:text-white border-slate-300'
                          }`}
                        >
                          <span className="text-xs leading-none">{cand.countryFlag}</span>
                          <span className="text-[10px] font-extrabold whitespace-nowrap">
                            {cand.coord.cityName.split('&')[0].split('(')[0].trim()}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1 rounded ${
                              isFocused
                                ? 'bg-teal-500/30 text-teal-200'
                                : 'bg-emerald-50 text-emerald-700 group-hover:bg-teal-500/30 group-hover:text-teal-200'
                            }`}
                          >
                            ${cand.monthlyRateUSD}
                          </span>
                          {onAddCountryFromMap && stops.length < 5 && (
                            <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* 2. Coordinate-Based Selected Itinerary Stop Markers with Connected Dates */}
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
                        setSelectedCandidateId(null);
                        onSelectStopIndex?.(idx);
                      }}
                      zIndex={isSelected ? 70 : 35 + idx}
                      title={`Stop ${idx + 1}: ${stop.countryName} (${stop.coord.cityName}) · ${stop.arrivalDate} to ${stop.departureDate}`}
                    >
                      <div
                        className={`group cursor-pointer transition-transform duration-300 flex flex-col items-center ${
                          isSelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        {/* Main Marker Pill */}
                        <div
                          className={`px-2.5 py-1.5 rounded-2xl border-2 shadow-xl flex items-center gap-1.5 ${
                            isStart
                              ? 'bg-emerald-600 border-white text-white'
                              : isEnd
                              ? 'bg-amber-500 border-white text-slate-950'
                              : 'bg-indigo-600 border-white text-white'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-black/25 font-mono text-[11px] font-extrabold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm leading-none">{stop.countryFlag}</span>
                          <div className="text-left leading-tight">
                            <span className="text-xs font-extrabold whitespace-nowrap block">
                              {stop.coord.cityName.split('&')[0].trim()}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold whitespace-nowrap block ${
                                isEnd ? 'text-slate-900' : 'text-white/90'
                              }`}
                            >
                              {formatShortIsoDate(stop.arrivalDate)} –{' '}
                              {formatShortIsoDate(stop.departureDate)} · {stop.days}d
                            </span>
                          </div>
                        </div>
                        {/* Pointer Nub */}
                        <div
                          className={`w-2.5 h-2.5 rotate-45 -mt-1 border-r-2 border-b-2 border-white ${
                            isStart
                              ? 'bg-emerald-600'
                              : isEnd
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow when a Selected Stop Marker is clicked */}
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
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono text-[10px] font-extrabold">
                          Stop #{selectedMarkerIdx + 1}{' '}
                          {selectedMarkerIdx === 0
                            ? '· START'
                            : selectedMarkerIdx === enrichedStops.length - 1 &&
                              enrichedStops.length > 1
                            ? '· END'
                            : ''}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700">
                          {enrichedStops[selectedMarkerIdx].days} Days · $
                          {enrichedStops[selectedMarkerIdx].stopBurnUSD.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-extrabold">
                          {enrichedStops[selectedMarkerIdx].countryFlag}{' '}
                          {enrichedStops[selectedMarkerIdx].countryName} —{' '}
                          {enrichedStops[selectedMarkerIdx].coord.cityName}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          {enrichedStops[selectedMarkerIdx].coord.highlight}
                        </p>
                      </div>

                      {/* Quick Date Pickers right inside the Map InfoWindow */}
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
                            <span>Remove Stop</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {/* InfoWindow when a Candidate Discovery Pin is clicked on the Map */}
                {selectedCandidateObj && (
                  <InfoWindow
                    position={{
                      lat: selectedCandidateObj.coord.lat,
                      lng: selectedCandidateObj.coord.lng,
                    }}
                    onCloseClick={() => setSelectedCandidateId(null)}
                    maxWidth={290}
                  >
                    <div className="p-1.5 space-y-2 text-slate-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-950 font-mono text-[10px] font-extrabold">
                          {selectedCandidateObj.region} ·{' '}
                          {selectedCandidateObj.isSchengen ? 'Schengen' : 'Non-Schengen'}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-emerald-700">
                          ${selectedCandidateObj.monthlyRateUSD.toLocaleString()}/mo
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-extrabold">
                          {selectedCandidateObj.countryFlag} {selectedCandidateObj.countryName}
                        </p>
                        <p className="text-[11px] font-semibold text-indigo-700">
                          Primary Hub: {selectedCandidateObj.coord.cityName}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          {selectedCandidateObj.coord.highlight}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          ⚡ {selectedCandidateObj.fiberMbps} Mbps Fiber
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-900">
                          {selectedCandidateObj.visaName}
                        </span>
                      </div>

                      {onAddCountryFromMap && (
                        <div className="pt-1.5 border-t border-slate-200 space-y-1.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                            Click a City Hub to Add to Route:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedCandidateObj.availableCities.map(city => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  onAddCountryFromMap(selectedCandidateObj.countryId, city);
                                  setSelectedCandidateId(null);
                                }}
                                disabled={stops.length >= 5}
                                className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-900 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                + {city}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onAddCountryFromMap(selectedCandidateObj.countryId);
                              setSelectedCandidateId(null);
                            }}
                            disabled={stops.length >= 5}
                            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              Add {selectedCandidateObj.countryName} as Stop #{stops.length + 1}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Interactive Global & Regional Route Atlas + Live Google Maps City Embed Engine */
            <div className="w-full h-full relative bg-slate-950 overflow-hidden select-none">
              {/* Top Mode Switcher + Zoom Controls */}
              <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/15 pointer-events-auto shadow-lg">
                  <button
                    type="button"
                    onClick={() => setFallbackCanvasMode('atlas')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      fallbackCanvasMode === 'atlas'
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Interactive Route &amp; Pin Atlas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFallbackCanvasMode('google-embed')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      fallbackCanvasMode === 'google-embed'
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      Google Maps Live View (
                      {selectedCandidateObj?.coord.cityName ||
                        activeStop?.coord.cityName ||
                        candidateCountries[0]?.coord.cityName ||
                        'Lisbon'}
                      )
                    </span>
                  </button>
                </div>

                {fallbackCanvasMode === 'atlas' && (
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/15 pointer-events-auto shadow-lg">
                    <button
                      type="button"
                      onClick={() => setAtlasZoom(z => Math.min(8, Number((z * 1.35).toFixed(2))))}
                      className="p-1.5 rounded-lg text-slate-200 hover:bg-white/15 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAtlasZoom(z => Math.max(1, Number((z / 1.35).toFixed(2))))}
                      className="p-1.5 rounded-lg text-slate-200 hover:bg-white/15 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAtlasZoom(1.8);
                        setAtlasCenter([
                          defaultCenter.lng,
                          defaultCenter.lat,
                        ]);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-teal-300 hover:bg-white/15 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              {fallbackCanvasMode === 'google-embed' ? (
                <iframe
                  title="Google Maps Destination View"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedCandidateObj
                      ? `${selectedCandidateObj.coord.cityName}, ${selectedCandidateObj.countryName}`
                      : activeStop
                      ? `${activeStop.coord.cityName}, ${activeStop.countryName}`
                      : candidateCountries[0]
                      ? `${candidateCountries[0].coord.cityName}, ${candidateCountries[0].countryName}`
                      : 'Lisbon, Portugal'
                  )}&z=11&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 135 }}
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
                            fill="#1e293b"
                            stroke="#334155"
                            strokeWidth={0.45}
                            style={
                              {
                                default: { outline: 'none' },
                                hover: { fill: '#312e81', outline: 'none' },
                                pressed: { outline: 'none' },
                              } as any
                            }
                          />
                        ))
                      }
                    </Geographies>

                    {/* Animated Route Polylines Connecting Selected Stops */}
                    {effectiveRouteLegs.map(leg => (
                      <React.Fragment key={`leg-line-${leg.legIndex}`}>
                        <Line
                          from={[leg.fromStop.coord.lng, leg.fromStop.coord.lat]}
                          to={[leg.toStop.coord.lng, leg.toStop.coord.lat]}
                          stroke="#6366f1"
                          strokeWidth={3.2 / Math.sqrt(atlasZoom)}
                          strokeLinecap="round"
                          strokeOpacity={0.45}
                        />
                        <Line
                          from={[leg.fromStop.coord.lng, leg.fromStop.coord.lat]}
                          to={[leg.toStop.coord.lng, leg.toStop.coord.lat]}
                          stroke="#2dd4bf"
                          strokeWidth={1.8 / Math.sqrt(atlasZoom)}
                          strokeDasharray="5 4"
                          strokeLinecap="round"
                        />
                      </React.Fragment>
                    ))}

                    {/* Candidate Discovery Pins */}
                    {unselectedCandidatePins.map(cand => {
                      const isFocused =
                        selectedCandidateId?.toLowerCase() === cand.countryId.toLowerCase() ||
                        focusedCountryId?.toLowerCase() === cand.countryId.toLowerCase();
                      return (
                        <Marker
                          key={`atlas-cand-${cand.countryId}`}
                          coordinates={[cand.coord.lng, cand.coord.lat]}
                          onClick={() => {
                            setSelectedCandidateId(cand.countryId);
                            setSelectedMarkerIdx(null);
                          }}
                        >
                          <g className="cursor-pointer group">
                            <circle
                              r={(isFocused ? 7 : 5) / Math.sqrt(atlasZoom)}
                              fill={isFocused ? '#14b8a6' : '#f8fafc'}
                              stroke="#0f172a"
                              strokeWidth={1.2 / Math.sqrt(atlasZoom)}
                            />
                            <text
                              textAnchor="middle"
                              y={-9 / Math.sqrt(atlasZoom)}
                              style={{
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: `${Math.max(6, 10 / Math.sqrt(atlasZoom))}px`,
                                fontWeight: 800,
                                fill: isFocused ? '#5eead4' : '#e2e8f0',
                                pointerEvents: 'none',
                              }}
                            >
                              {cand.countryFlag} {cand.coord.cityName.split('&')[0].split('(')[0].trim()}
                            </text>
                          </g>
                        </Marker>
                      );
                    })}

                    {/* Selected Stop Markers */}
                    {enrichedStops.map((stop, idx) => {
                      const isStart = idx === 0;
                      const isEnd = idx === enrichedStops.length - 1 && enrichedStops.length > 1;
                      const fillHex = isStart ? '#10b981' : isEnd ? '#f59e0b' : '#6366f1';
                      return (
                        <Marker
                          key={`atlas-stop-${stop.id}`}
                          coordinates={[stop.coord.lng, stop.coord.lat]}
                          onClick={() => {
                            setSelectedMarkerIdx(idx);
                            setActiveStopIdx(idx);
                            setSelectedCandidateId(null);
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
                                fill: '#ffffff',
                                pointerEvents: 'none',
                              }}
                            >
                              {stop.countryFlag} {stop.coord.cityName.split('&')[0].trim()} (
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
                            fill="#f59e0b"
                            fillOpacity={0.35}
                          />
                          <circle
                            r={5.5 / Math.sqrt(atlasZoom)}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth={1.5 / Math.sqrt(atlasZoom)}
                          />
                        </g>
                      </Marker>
                    )}
                  </ZoomableGroup>
                </ComposableMap>
              )}

              {/* Floating Selected Candidate Popup Card in Atlas Mode */}
              {selectedCandidateObj && (
                <div className="absolute bottom-12 right-3 z-20 w-72 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200 shadow-2xl text-slate-900 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-950 font-mono text-[10px] font-extrabold">
                      {selectedCandidateObj.region} · ${selectedCandidateObj.monthlyRateUSD}/mo
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCandidateId(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">
                      {selectedCandidateObj.countryFlag} {selectedCandidateObj.countryName} —{' '}
                      {selectedCandidateObj.coord.cityName}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                      {selectedCandidateObj.coord.highlight}
                    </p>
                  </div>
                  {onAddCountryFromMap && (
                    <div className="pt-1 border-t border-slate-200 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidateObj.availableCities.map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              onAddCountryFromMap(selectedCandidateObj.countryId, city);
                              setSelectedCandidateId(null);
                            }}
                            disabled={stops.length >= 5}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-900 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            + {city}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onAddCountryFromMap(selectedCandidateObj.countryId);
                          setSelectedCandidateId(null);
                        }}
                        disabled={stops.length >= 5}
                        className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          Add {selectedCandidateObj.countryName} as Stop #{stops.length + 1}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Floating Map Legend Badge */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/15 text-[10px] font-semibold shadow-md">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Start</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span>Stop</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>End</span>
            </span>
            <span>·</span>
            <span className="text-teal-300">Animated Polyline = Active Route Path</span>
          </div>
        </div>

        {/* Right Side: Live Active Stop & Directions Leg Inspector (or Candidate Explorer when 0 stops) */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 border-t lg:border-t-0 lg:border-l border-slate-200/90 flex flex-col justify-between space-y-4">
          {activeStop ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-950 font-mono text-[10px] font-extrabold uppercase tracking-wider">
                    Stop {activeStopIdx + 1} of {enrichedStops.length}
                    {activeStopIdx === 0
                      ? ' · Starting Point'
                      : activeStopIdx === enrichedStops.length - 1 && enrichedStops.length > 1
                      ? ' · Final Haven'
                      : ''}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {activeStop.coord.airportCode} Hub
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeStop.countryFlag}</span>
                      <div>
                        <h4 className="font-heading text-base font-extrabold text-slate-900">
                          {activeStop.countryName}
                        </h4>
                        <p className="text-xs font-semibold text-indigo-700">
                          {activeStop.coord.cityName}
                        </p>
                      </div>
                    </div>

                    {onRemoveStopFromMap && (
                      <button
                        type="button"
                        onClick={() => onRemoveStopFromMap(activeStop.id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Remove this stop from route"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {activeStop.coord.highlight}
                  </p>
                </div>

                {/* Live Connected Date Pickers for Active Stop */}
                {onUpdateStopDatesFromMap ? (
                  <div className="p-2.5 rounded-xl bg-white border border-indigo-200/80 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      <span>Connected Stop Dates ({activeStop.days} Days)</span>
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
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-[11px] font-mono font-bold text-slate-900"
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
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-[11px] font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>Stay Window</span>
                      </span>
                      <p className="text-sm font-mono font-extrabold text-slate-900 mt-0.5">
                        {activeStop.days} Days
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        {activeStop.arrivalDate} → {activeStop.departureDate}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>Stop Living Burn</span>
                      </span>
                      <p className="text-sm font-mono font-extrabold text-emerald-800 mt-0.5">
                        ${activeStop.stopBurnUSD.toLocaleString()}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        ${activeStop.monthlyBurnRateUSD.toLocaleString()}/mo rate
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Est. Stop Burn:</span>
                  </span>
                  <span className="font-mono font-extrabold text-emerald-800">
                    ${activeStop.stopBurnUSD.toLocaleString()} ({activeStop.days}d)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{activeStop.visaStatusTag}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeStop.isSchengen
                        ? 'bg-indigo-200/80 text-indigo-950'
                        : 'bg-teal-200/80 text-teal-950'
                    }`}
                  >
                    {activeStop.isSchengen ? 'Schengen' : 'Non-Schengen'}
                  </span>
                </div>
              </div>

              {/* Next Hop Directions Summary */}
              {nextStop && activeLeg ? (
                <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    <span className="flex items-center gap-1">
                      {activeLeg.mode === 'DRIVING' ? (
                        <Car className="w-3.5 h-3.5" />
                      ) : (
                        <Plane className="w-3.5 h-3.5" />
                      )}
                      <span>Next Direction Leg</span>
                    </span>
                    <span className="font-mono">{activeLeg.distanceKm.toLocaleString()} km</span>
                  </div>
                  <p className="text-xs font-extrabold">
                    To {nextStop.countryFlag} {nextStop.coord.cityName}
                  </p>
                  <p className="text-[11px] text-slate-300 font-mono">{activeLeg.durationText}</p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {enrichedStops.length === 1
                      ? '1st stop placed! Click another country pin on the map to draw your animated route polyline.'
                      : 'Final destination reached on this scouting route.'}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* When 0 stops are selected, show interactive map selection guide & top matching pins */
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-950 text-[10px] font-extrabold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-teal-700" />
                <span>Visual Map Picker Active</span>
              </div>

              <h4 className="font-heading text-sm sm:text-base font-extrabold text-slate-900">
                Build Your Route Directly on Google Maps
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click any country pin on the map (or click a quick-pick haven below) to place{' '}
                <strong>Stop #1</strong>. Add 2 to 5 stops to watch the animated route polyline and
                directions connect automatically.
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Top Matching Pins on Map:
                </span>
                <div className="space-y-1.5 max-h-[230px] overflow-y-auto pr-1">
                  {candidateCountries.slice(0, 6).map(cand => (
                    <div
                      key={cand.countryId}
                      className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 flex items-center justify-between gap-2 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateId(cand.countryId)}
                        className="text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                          <span>{cand.countryFlag}</span>
                          <span className="truncate">{cand.countryName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {cand.coord.cityName} · ${cand.monthlyRateUSD}/mo ·{' '}
                          <Wifi className="w-2.5 h-2.5 inline text-teal-600" /> {cand.fiberMbps}M
                        </span>
                      </button>
                      {onAddCountryFromMap && (
                        <button
                          type="button"
                          onClick={() => onAddCountryFromMap(cand.countryId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                        >
                          + Add
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

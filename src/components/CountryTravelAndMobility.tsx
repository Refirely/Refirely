import React, { useState } from 'react';
import { Country } from '../types';
import { getCountryTravelMobility } from '../data/countryTravelMobility';
import {
  Compass,
  Train,
  Car,
  Navigation,
  Shield,
  Heart,
  User,
  Users,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  Wine,
  Camera,
  Palmtree,
  BookOpen,
  Eye,
  Bus,
  Plane,
  Smartphone,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CountryTravelAndMobilityProps {
  country: Country;
}

export const CountryTravelAndMobility: React.FC<CountryTravelAndMobilityProps> = ({ country }) => {
  const mobilityData = getCountryTravelMobility(country);
  const [selectedPersona, setSelectedPersona] = useState<'couples' | 'solo' | 'soloFemale'>('couples');

  const { retireeActivities, domesticTransit, couples, solo, soloFemale } = mobilityData;

  const currentProfile =
    selectedPersona === 'couples'
      ? couples
      : selectedPersona === 'solo'
      ? solo
      : soloFemale;

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'Outdoor & Nature':
        return <Palmtree className="w-4 h-4 text-emerald-600" />;
      case 'Food, Wine & Culinary':
        return <Wine className="w-4 h-4 text-rose-600" />;
      case 'Culture & Arts':
        return <Camera className="w-4 h-4 text-purple-600" />;
      case 'Social & Clubs':
        return <Users className="w-4 h-4 text-amber-600" />;
      case 'Wellness & Fitness':
        return <Heart className="w-4 h-4 text-teal-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900">
                <Compass className="w-3.5 h-3.5 text-orange-700" />
                Retiree Lifestyle & Mobility
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500">{country.name} Dossier</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Travel, Famous Activities & Domestic Mobility
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              {mobilityData.activitiesHeadline}. How retirees pass their days, explore regions, and move around safely as a couple, solo traveler, or solo female.
            </p>
          </div>

          {/* Quick Mobility Score Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Transit Index
              </span>
              <span className="text-lg font-extrabold text-slate-900 font-mono mt-0.5 block">
                {domesticTransit.publicTransitScore}/100
              </span>
              <span className="text-[10px] text-teal-700 font-medium">Intercity Ease</span>
            </div>

            <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl text-center">
              <span className="text-[10px] font-bold text-orange-900 uppercase tracking-wider block">
                Couple Safety
              </span>
              <span className="text-lg font-extrabold text-orange-950 font-mono mt-0.5 block">
                {couples.safetyRating}/100
              </span>
              <span className="text-[10px] text-orange-800 font-medium">{couples.safetyVerdict}</span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Solo Ease
              </span>
              <span className="text-lg font-extrabold text-amber-950 font-mono mt-0.5 block">
                {solo.socialEaseRating}/100
              </span>
              <span className="text-[10px] text-amber-800 font-medium">Social Cafes</span>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-center">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                Solo Female
              </span>
              <span className="text-lg font-extrabold text-purple-950 font-mono mt-0.5 block">
                {soloFemale.femaleSafetyScore}/100
              </span>
              <span className="text-[10px] text-purple-800 font-medium">{soloFemale.streetHarassmentLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: WHAT RETIREES DO - FAMOUS ACTIVITIES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Famous Retirement Activities in {country.name}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              What resident expats and retirees actively do to pass time, stay vibrant, and immerse in the local culture.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700 self-start sm:self-auto">
            {retireeActivities.length} Key Leisure Pursuits
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retireeActivities.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-orange-300 transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    {getActivityIcon(act.category)}
                    <span>{act.category}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
                    {act.intensity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-900 transition-colors">
                  {act.title}
                </h4>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-200/70 space-y-2">
                <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-700">Top Spots:</strong> {act.popularLocations}
                  </span>
                </div>
                <div className="bg-orange-50/70 rounded-lg p-2 border border-orange-100 text-[11px] text-orange-950 leading-snug">
                  <strong className="text-orange-900">Why Retirees Love It:</strong> {act.whyRetireesLoveIt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: MOBILITY & SAFETY PROFILE - COUPLES vs SOLO vs SOLO FEMALE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-700" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Domestic Mobility & Safety Profiles
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              How safe, exciting, and accessible is traveling within {country.name}? Compare tailored insights for your travel configuration.
            </p>
          </div>

          {/* Persona Segmented Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setSelectedPersona('couples')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPersona === 'couples'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>As a Couple</span>
            </button>

            <button
              onClick={() => setSelectedPersona('solo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPersona === 'solo'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Solo Traveler</span>
            </button>

            <button
              onClick={() => setSelectedPersona('soloFemale')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPersona === 'soloFemale'
                  ? 'bg-white text-purple-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Solo Female</span>
            </button>
          </div>
        </div>

        {/* Selected Persona Deep Dive Card */}
        <div className="mt-6 space-y-6">
          {/* Top KPI and Verdict Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Safety & Security Verdict</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentProfile.safetyRating}/100
                </span>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {currentProfile.safetyVerdict}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {selectedPersona === 'soloFemale'
                  ? `Street Harassment: ${soloFemale.streetHarassmentLevel}`
                  : 'Based on empirical peace & local crime metrics'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Domestic Ease of Movement</span>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {currentProfile.easeOfMovement}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {domesticTransit.trainNetwork.includes('high-speed') || domesticTransit.trainNetwork.includes('rail')
                  ? 'Modern train & intercity coach options'
                  : 'Flexible express coaches & regional shuttles'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Excitement & Scenic Variety</span>
              <div className="text-base font-extrabold text-orange-950 mt-1">
                {currentProfile.excitementLevel}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                High regional diversity & cultural depth
              </span>
            </div>
          </div>

          {/* In-depth Narrative Analysis */}
          <div className="p-5 rounded-xl bg-orange-50/50 border border-orange-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-950 mb-1.5">
              Comprehensive Mobility & Experience Assessment
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {currentProfile.summary}
            </p>
          </div>

          {/* Persona Specific Details */}
          {selectedPersona === 'couples' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-rose-700">
                  <Heart className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900">Romantic Escapes & Weekend Stays</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {couples.romanticEscapes.map((esc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{esc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Couple-Friendly Atmosphere</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {couples.coupleFriendlyVibe}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-orange-700">
                  <Navigation className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900">Scenic Road Trips & Coastal Loops</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {couples.scenicRoadTrips.map((trip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      <span>{trip}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Recommended Transport</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {couples.transportOptions.map((opt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPersona === 'solo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-amber-700">
                  <Coffee className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900">Solo Dining & Café Culture</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {solo.solitaryDiningAndCafeCulture}
                </p>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Connecting with Other Retirees</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {solo.meetingOtherRetirees}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-teal-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900">Solo Navigation Strategies</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {solo.solitaryNavigationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Solo Transit Choices</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {solo.transportOptions.map((opt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPersona === 'soloFemale' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-purple-700">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900">Cultural Norms & Nighttime Transit</h4>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800 block">Dress Code & Cultural Etiquette:</span>
                    <p className="mt-0.5 leading-relaxed">{soloFemale.culturalDressAndEtiquette}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Evening & Nighttime Movement:</span>
                    <p className="mt-0.5 leading-relaxed">{soloFemale.nighttimeTransitAdvice}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Expat Women’s Networks:</span>
                    <p className="mt-0.5 leading-relaxed">{soloFemale.femaleExpatCommunities}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-purple-700">
                  <Shield className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900">Recommended Female Safety Precautions</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {soloFemale.recommendedPrecautions.map((prec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span>{prec}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Recommended Transport</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {soloFemale.transportOptions.map((opt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-900 rounded text-[11px] font-semibold border border-purple-200/60">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safety & Prudence Advice Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-800">Prudence Tip:</strong>{' '}
                {currentProfile.safetyAdvice.join(' · ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DOMESTIC TRANSIT & INFRASTRUCTURE MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Train className="w-5 h-5 text-teal-700" />
          <h3 className="text-lg font-extrabold text-slate-900">
            Domestic Transit & Moving Around {country.name}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Comprehensive breakdown of trains, coaches, rental car driving, supported ride-hailing apps, and domestic flights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Rail */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-teal-800">
              <Train className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Train & Rail Network
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {domesticTransit.trainNetwork}
            </p>
          </div>

          {/* Intercity Buses */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-orange-800">
              <Bus className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Intercity Express Buses
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {domesticTransit.intercityBuses}
            </p>
          </div>

          {/* Driving & Roads */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-amber-800">
              <Car className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Car Rentals & Driving
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {domesticTransit.carRentalAndRoads}
            </p>
          </div>

          {/* Ride-Hailing Apps */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-purple-800">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Supported Ride Apps
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {domesticTransit.rideHailingAndTaxis.map((app, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Flights & Ferries */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2 text-blue-800">
              <Plane className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Domestic Flights, Islands & Ferries
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {domesticTransit.domesticAirAndFerries}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Country } from '../types';
import { getCountryGastronomyProfile } from '../data/countryFoodAndGastronomy';
import {
  UtensilsCrossed,
  Soup,
  Coffee,
  Clock,
  Sparkles,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  Info,
  ChevronRight,
  Filter,
  Flame,
  Wheat,
  Salad,
  Store,
  ExternalLink,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CountryFoodAndGastronomyTabProps {
  country: Country;
  onNavigateTab?: (tab: string) => void;
}

export const CountryFoodAndGastronomyTab: React.FC<CountryFoodAndGastronomyTabProps> = ({
  country,
  onNavigateTab,
}) => {
  const gastronomy = useMemo(() => getCountryGastronomyProfile(country), [country]);

  // Dish category filter
  const [dishFilter, setDishFilter] = useState<string>('All');

  // Copy phrase status
  const [copiedPhraseIndex, setCopiedPhraseIndex] = useState<number | null>(null);

  // Interactive Monthly Dining Budget Estimator State
  const [streetMealsPerWeek, setStreetMealsPerWeek] = useState<number>(4);
  const [casualMealsPerWeek, setCasualMealsPerWeek] = useState<number>(3);
  const [midRangeDinnersPerWeek, setMidRangeDinnersPerWeek] = useState<number>(1);

  const estimatedMonthlyDiningSpend = useMemo(() => {
    const weeklyCost =
      streetMealsPerWeek * gastronomy.costsAndHygiene.streetFoodOrMarketMealUSD +
      casualMealsPerWeek * gastronomy.costsAndHygiene.casualRestaurantMealUSD +
      midRangeDinnersPerWeek * (gastronomy.costsAndHygiene.midRangeDinnerForTwoUSD / 2);
    return Math.round(weeklyCost * 4.33);
  }, [streetMealsPerWeek, casualMealsPerWeek, midRangeDinnersPerWeek, gastronomy]);

  const handleCopyPhrase = (text: string, index: number) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedPhraseIndex(index);
      setTimeout(() => setCopiedPhraseIndex(null), 2500);
    }
  };

  const filteredDishes = useMemo(() => {
    if (dishFilter === 'All') return gastronomy.nationalDishes;
    if (dishFilter === 'Vegetarian') {
      return gastronomy.nationalDishes.filter(d => d.vegetarianFriendly || d.vegetarianAlternative);
    }
    return gastronomy.nationalDishes.filter(d => d.category === dishFilter);
  }, [gastronomy.nationalDishes, dishFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO CUISINE OVERVIEW & TELEMETRY STRIP */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-amber-100/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Food &amp; Gastronomy Guide</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-semibold">{country.name} Food Culture</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {gastronomy.cuisineHeadline}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {gastronomy.culinaryTraditionsOverview}
            </p>
          </div>

          {/* Quick Dining Score Gauges */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 w-full lg:w-72">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase">
                <span>Veg &amp; Vegan</span>
                <Salad className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="font-extrabold text-slate-900 text-sm mt-1">
                {gastronomy.dietaryRestrictions.vegetarianRating.split('/')[0]}
              </div>
              <span className="text-[10px] text-amber-700/90 font-medium block mt-0.5">
                Vegetarian Accessibility
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 uppercase">
                <span>Tap Water</span>
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="font-extrabold text-slate-900 text-sm mt-1 truncate">
                {gastronomy.costsAndHygiene.waterSafety}
              </div>
              <span className="text-[10px] text-sky-700/90 font-medium block mt-0.5">
                Drinking Water Safety
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 uppercase">
                <span>Hygiene Score</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="font-mono font-extrabold text-emerald-950 text-base mt-1">
                {gastronomy.costsAndHygiene.eatingOutHygieneScore} / 100
              </div>
              <span className="text-[10px] text-emerald-700/90 font-medium block mt-0.5">
                Restaurant Inspections
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-violet-900 uppercase">
                <span>Casual Meal</span>
                <DollarSign className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <div className="font-mono font-extrabold text-violet-950 text-base mt-1">
                ${gastronomy.costsAndHygiene.casualRestaurantMealUSD}
              </div>
              <span className="text-[10px] text-violet-700/90 font-medium block mt-0.5">
                Avg. Midday Lunch
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DAILY MEAL ROUTINES & LOCAL HABITS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-0.5">
              Daily Rhythms
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              What Locals Eat Every Day &amp; Routine Meal Timelines
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Daily culinary cadence in {country.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gastronomy.routines.map((routine, idx) => (
            <motion.div
              key={routine.mealName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50/80 via-white to-amber-50/30 border border-slate-200/80 hover:border-amber-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    {routine.mealName.includes('Breakfast') ? (
                      <Coffee className="w-4 h-4 text-amber-600" />
                    ) : routine.mealName.includes('Lunch') ? (
                      <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Soup className="w-4 h-4 text-indigo-600" />
                    )}
                    <span>{routine.mealName}</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{routine.timing}</span>
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Typical Routine Foods:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {routine.typicalFoods.map((food, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-amber-500 font-bold shrink-0">•</span>
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed italic bg-slate-50/60 p-2.5 rounded-xl">
                "{routine.culturalImportance}"
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. FAMOUS NATIONAL DISHES & AUTHENTIC SPOTS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-0.5">
              Iconic Gastronomy
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Famous National Dishes &amp; Where to Taste Them Authentically
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Traditional recipes, flavor profiles, average costs, and authentic local eateries.
            </p>
          </div>

          {/* Dish category filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Signature Main', 'Street Food / Snack', 'Soup / Stew', 'Seafood Delicacy', 'Vegetarian'].map(
              cat => (
                <button
                  key={cat}
                  onClick={() => setDishFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dishFilter === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDishes.map((dish, idx) => (
            <motion.div
              key={dish.name}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="p-5 rounded-3xl bg-gradient-to-br from-slate-50/70 via-white to-rose-50/30 border border-slate-200/90 hover:border-rose-300 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 mb-1">
                      {dish.category}
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {dish.name}
                    </h4>
                    {dish.localName && dish.localName !== dish.name && (
                      <span className="text-xs font-semibold text-slate-500 italic block">
                        Native: {dish.localName}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-extrabold text-slate-900 text-base block">
                      ${dish.typicalCostUSD}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">
                      {dish.typicalCostLocalCurrency}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {dish.description}
                </p>

                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-baseline gap-1.5">
                    <strong className="text-slate-900 text-[11px] font-bold shrink-0">Flavor Profile:</strong>
                    <span className="text-slate-600 italic text-[11px]">{dish.flavorProfile}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    <strong className="text-slate-800">Heritage: </strong>
                    {dish.traditionOrHistory}
                  </div>
                </div>

                {/* Vegetarian adaptability notice */}
                <div className="text-xs flex items-start gap-2 pt-1">
                  {dish.vegetarianFriendly ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Naturally Vegetarian</span>
                    </span>
                  ) : dish.vegetarianAlternative ? (
                    <div className="text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200 p-2 rounded-xl">
                      <strong className="text-amber-900 font-bold block mb-0.5">Vegetarian Alternative:</strong>
                      {dish.vegetarianAlternative}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <span>Meat / Seafood Centric</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Best Authentic Places */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Where to Get It Authentically:</span>
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {dish.bestAuthenticPlaces.map((place, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium">
                      <span className="text-rose-500 font-bold">›</span>
                      <span>{place}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. VEGETARIAN, VEGAN & DIETARY RESTRICTION DEEP DIVE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
              Dietary Inclusivity
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Vegetarian, Vegan &amp; Gluten-Free Accessibility
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ratings, hidden animal ingredients to watch for, and essential local phrases.
            </p>
          </div>
        </div>

        {/* 3 Rating cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Vegetarian Score
            </span>
            <div className="font-extrabold text-slate-900 text-base mt-1">
              {gastronomy.dietaryRestrictions.vegetarianRating}
            </div>
            <p className="text-[11px] text-emerald-800/90 mt-1">
              Traditional plant-forward options &amp; market availability.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 to-cyan-50/50 border border-teal-200">
            <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">
              Vegan Score
            </span>
            <div className="font-extrabold text-slate-900 text-base mt-1">
              {gastronomy.dietaryRestrictions.veganRating}
            </div>
            <p className="text-[11px] text-teal-800/90 mt-1">
              Strict dairy, egg, and seafood-free dining ease.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Gluten-Free / Celiac
            </span>
            <div className="font-extrabold text-slate-900 text-base mt-1">
              {gastronomy.dietaryRestrictions.glutenFreeRating}
            </div>
            <p className="text-[11px] text-amber-800/90 mt-1">
              Allergen menu labeling &amp; gluten-free staples.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {gastronomy.dietaryRestrictions.summary}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Warning: Hidden Ingredients */}
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Hidden Non-Veg Ingredients to Watch Out For</span>
            </div>
            <p className="text-xs text-rose-800/90">
              Even dishes listed with vegetables often contain animal-derived seasonings or broths:
            </p>
            <ul className="space-y-2">
              {gastronomy.dietaryRestrictions.hiddenNonVegIngredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Local Ordering Phrases */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
              <Copy className="w-4 h-4 text-indigo-600" />
              <span>Essential Local Language Ordering Phrases</span>
            </div>
            <p className="text-xs text-slate-500">
              Show these directly to your waiter or read phonetically when ordering:
            </p>
            <div className="space-y-2">
              {gastronomy.dietaryRestrictions.helpfulLocalPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-slate-900 font-bold block truncate">
                      {phrase.phrase}
                    </strong>
                    <span className="text-slate-500 text-[11px] block">{phrase.english}</span>
                    {phrase.phonetic && (
                      <span className="text-indigo-600 font-mono text-[10px] block">
                        Phonetic: {phrase.phonetic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyPhrase(phrase.phrase, idx)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                    title="Copy phrase"
                  >
                    {copiedPhraseIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staple Veg Dishes List */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Reliable Vegetarian Staples Widely Available Across {country.name}:
          </div>
          <div className="flex flex-wrap gap-2">
            {gastronomy.dietaryRestrictions.stapleVegDishes.map((dish, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-semibold text-emerald-950"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{dish}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. EXPAT DINING HURDLES & CULTURAL ETIQUETTE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-violet-700 uppercase tracking-wider block mb-0.5">
              Cultural Nuances
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Expat Dining Hurdles &amp; Practical Workarounds
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unwritten rules, meal timing traps, tipping etiquette, and bill customs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gastronomy.expatHurdles.map((hurdle, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 via-white to-violet-50/30 border border-slate-200/90 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-100 text-violet-900 border border-violet-200">
                  {hurdle.category}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900">
                {hurdle.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {hurdle.description}
              </p>

              <div className="p-3 rounded-xl bg-violet-50/80 border border-violet-100 text-xs text-violet-950 space-y-1">
                <strong className="text-violet-900 font-bold block text-[11px] uppercase tracking-wider">
                  Pro-Tip &amp; Workaround:
                </strong>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {hurdle.workaroundTip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DINING COSTS, GROCERIES & BUDGET ESTIMATOR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
              Financial Breakdown
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Eating Out Costs, Groceries &amp; Interactive Monthly Dining Budget
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              How costly or cheap is dining out in {country.name}?
            </p>
          </div>
        </div>

        {/* 6 Price KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Street Food</span>
            <span className="font-mono font-extrabold text-slate-900 text-lg block mt-1">
              ${gastronomy.costsAndHygiene.streetFoodOrMarketMealUSD}
            </span>
            <span className="text-[10px] text-slate-400">per meal</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Casual Lunch</span>
            <span className="font-mono font-extrabold text-teal-800 text-lg block mt-1">
              ${gastronomy.costsAndHygiene.casualRestaurantMealUSD}
            </span>
            <span className="text-[10px] text-slate-400">daily special</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Dinner for 2</span>
            <span className="font-mono font-extrabold text-indigo-900 text-lg block mt-1">
              ${gastronomy.costsAndHygiene.midRangeDinnerForTwoUSD}
            </span>
            <span className="text-[10px] text-slate-400">with wine</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Fine Dining</span>
            <span className="font-mono font-extrabold text-violet-900 text-lg block mt-1">
              ${gastronomy.costsAndHygiene.highEndFineDiningUSD}
            </span>
            <span className="text-[10px] text-slate-400">tasting menu</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Beer / Wine</span>
            <span className="font-mono font-extrabold text-amber-800 text-lg block mt-1">
              ${gastronomy.costsAndHygiene.localBeerOrWineGlassUSD}
            </span>
            <span className="text-[10px] text-slate-400">glass / draft</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Espresso</span>
            <span className="font-mono font-extrabold text-slate-900 text-lg block mt-1">
              ${gastronomy.costsAndHygiene.specialtyCoffeeUSD}
            </span>
            <span className="text-[10px] text-slate-400">counter bica/café</span>
          </div>
        </div>

        {/* Interactive Dining Calculator */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/40 border border-indigo-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                Retiree Calculator
              </span>
              <h4 className="text-base font-extrabold text-slate-900">
                Monthly Eating-Out Budget Simulator
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust your weekly dining frequency to project your real food expenses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-indigo-200 text-right shrink-0 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Estimated Monthly Dining Spend:
              </span>
              <span className="font-mono font-extrabold text-2xl sm:text-3xl text-indigo-950 block mt-0.5">
                ${estimatedMonthlyDiningSpend.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ mo</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* Slider 1: Street meals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Street / Market Meals:</span>
                <span className="font-mono text-teal-700">{streetMealsPerWeek} / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                value={streetMealsPerWeek}
                onChange={e => setStreetMealsPerWeek(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                ${gastronomy.costsAndHygiene.streetFoodOrMarketMealUSD} each
              </span>
            </div>

            {/* Slider 2: Casual meals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Casual Sit-down Lunches:</span>
                <span className="font-mono text-indigo-700">{casualMealsPerWeek} / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={casualMealsPerWeek}
                onChange={e => setCasualMealsPerWeek(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                ${gastronomy.costsAndHygiene.casualRestaurantMealUSD} each
              </span>
            </div>

            {/* Slider 3: Mid-range dinners */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Mid-Range 3-Course Dinners:</span>
                <span className="font-mono text-violet-700">{midRangeDinnersPerWeek} / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                value={midRangeDinnersPerWeek}
                onChange={e => setMidRangeDinnersPerWeek(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                ${Math.round(gastronomy.costsAndHygiene.midRangeDinnerForTwoUSD / 2)} per person
              </span>
            </div>
          </div>
        </div>

        {/* Groceries & Supermarkets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <strong className="text-slate-900 font-bold block flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Municipal Wet Markets vs. Supermarkets:</span>
            </strong>
            <p className="text-slate-600 leading-relaxed">
              {gastronomy.marketAndGroceryCulture.freshMarketsOverview}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <strong className="text-slate-900 font-bold block flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Supermarket Chains &amp; Western Imports:</span>
            </strong>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {gastronomy.marketAndGroceryCulture.supermarketChains.map((chain, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-800"
                >
                  {chain}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Western goods availability: <strong className="text-slate-800">{gastronomy.marketAndGroceryCulture.importedWesternGoodsAvailability}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 7. HYGIENE, STREET FOOD SAFETY & TAP WATER SAFETY */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block mb-0.5">
              Health &amp; Sanitation
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Food Hygiene, Street Safety &amp; Tap Water Potability
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              How safe is it to eat outside frequently in {country.name}?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Water Safety Card */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Tap Water Potability</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                gastronomy.costsAndHygiene.waterSafety === '100% Safe from Tap'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : gastronomy.costsAndHygiene.waterSafety.includes('Major Cities')
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {gastronomy.costsAndHygiene.waterSafety}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {gastronomy.costsAndHygiene.waterDetails}
            </p>

            <div className="p-3 rounded-xl bg-white/80 border border-sky-200/60 text-xs space-y-1">
              <strong className="text-sky-900 font-bold block text-[11px]">
                Produce Washing Advice:
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {gastronomy.costsAndHygiene.produceWashingAdvice}
              </p>
            </div>
          </div>

          {/* Restaurant & Street Food Hygiene Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Street &amp; Restaurant Sanitation</span>
              </span>
              <span className="font-mono text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                {gastronomy.costsAndHygiene.eatingOutHygieneScore} / 100
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {gastronomy.costsAndHygiene.hygieneGuidance}
            </p>

            <div className="space-y-1.5 pt-1">
              <strong className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Street Food Best Practices:
              </strong>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {gastronomy.costsAndHygiene.streetFoodSafetyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

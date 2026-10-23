import React, { useState, useMemo } from 'react';
import { Country } from '../types';
import { getCountryHealthcareProfile } from '../data/countryHealthcare';
import {
  Stethoscope,
  PhoneCall,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  HeartPulse,
  Ambulance,
  FileCheck,
  DollarSign,
  Globe,
  MapPin,
  ArrowRight,
  Info,
  Sparkles,
  Layers,
} from 'lucide-react';

interface CountryHealthcareTabProps {
  country: Country;
  onNavigateTab?: (tab: 'visa' | 'cost' | 'faq' | 'cities' | 'community') => void;
}

export const CountryHealthcareTab: React.FC<CountryHealthcareTabProps> = ({
  country,
  onNavigateTab,
}) => {
  const profile = useMemo(() => getCountryHealthcareProfile(country), [country]);
  const [selectedSection, setSelectedSection] = useState<'all' | 'routine' | 'emergency' | 'insurance'>('all');

  const { routineCare, emergencyServices, insurance, cityMedicalHubs } = profile;

  return (
    <div className="space-y-8">
      {/* Hero Healthcare Intelligence Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                Medical Care, Emergency & Insurance Dossier
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">
                {profile.headlineVerdict}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Healthcare Access, Emergency Services & Expat Insurance in {country.name}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
              {routineCare.executiveSummary}
            </p>
          </div>

          {/* 4-Card Healthcare KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                Healthcare Score
              </span>
              <span className="text-xl font-extrabold text-purple-950 font-mono tabular-nums mt-0.5 block">
                {country.lifestyle.healthcareScore}/100
              </span>
              <span className="text-[10px] text-purple-800 font-medium">Quality & Infrastructure</span>
            </div>

            <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block">
                Routine Access
              </span>
              <span className="text-xl font-extrabold text-teal-950 font-mono tabular-nums mt-0.5 block">
                {routineCare.easeScore}/100
              </span>
              <span className="text-[10px] text-teal-800 font-medium">Private GP in 24–48h</span>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">
                Emergency Dial
              </span>
              <span className="text-xl font-extrabold text-rose-950 font-mono tabular-nums mt-0.5 block">
                {emergencyServices.emergencyNumberPrimary}
              </span>
              <span className="text-[10px] text-rose-800 font-medium">24/7 Medical Dispatch</span>
            </div>

            <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-orange-900 uppercase tracking-wider block">
                Base Insurance
              </span>
              <span className="text-xl font-extrabold text-orange-950 font-mono tabular-nums mt-0.5 block">
                ${country.costOfLiving.healthcareMonthlyUSD}
                <span className="text-xs font-sans font-normal text-orange-800">/mo</span>
              </span>
              <span className="text-[10px] text-orange-800 font-medium">Single Est. Baseline</span>
            </div>
          </div>
        </div>

        {/* Section Focus Filter Bar */}
        <div className="pt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Complete Healthcare Guide (All 3 Pillars)', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'routine', label: '1. Routine Medical Care & Hospitals', icon: <Stethoscope className="w-3.5 h-3.5" /> },
              { id: 'emergency', label: '2. Emergency Services & ER Triage', icon: <Ambulance className="w-3.5 h-3.5" /> },
              { id: 'insurance', label: '3. Health Insurance & Out-of-Pocket Costs', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedSection(tab.id as typeof selectedSection)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  selectedSection === tab.id
                    ? 'bg-teal-800 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {onNavigateTab && (
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => onNavigateTab('cost')}
                className="text-orange-800 hover:text-orange-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Model in Budget Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          PILLAR 1: ROUTINE & EVERYDAY MEDICAL CARE ACCESS
         ===================================================================== */}
      {(selectedSection === 'all' || selectedSection === 'routine') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                Pillar 1 · Everyday Medical Care & Hospital Navigation
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                How Easy Is It to Get Routine Medical Care in {country.name}?
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {routineCare.easeVerdict}
            </span>
          </div>

          {/* Wait Times & English Proficiency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Private GP & Checkups</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                {routineCare.gpWaitTimePrivate}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Walk-in or digital app scheduling at private clinics
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>Private Specialist Access</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                {routineCare.specialistWaitTimePrivate}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Direct booking with cardiologists, orthopedists & dermatologists
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                <Globe className="w-4 h-4 text-orange-600" />
                <span>English-Speaking Doctors ({country.lifestyle.englishProficiency})</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {routineCare.englishSpeakingStaff}
              </p>
            </div>
          </div>

          {/* Public vs Private System Side-by-Side Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Private System Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/30 border border-teal-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  <span>Private Healthcare Network (Expat Primary Choice)</span>
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                  Fastest Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                {routineCare.privateSystemOverview}
              </p>
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Leading Hospital Groups & Accredited Facilities:
                </span>
                <div className="flex flex-wrap gap-2">
                  {routineCare.topHospitalNetworks.map((hosp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-teal-200/90 text-xs font-semibold text-teal-950 shadow-2xs"
                    >
                      {hosp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Public System Card */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>Public System: {routineCare.publicSystemName}</span>
                </h4>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  Universal / Subsidized
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                {routineCare.publicSystemOverview}
              </p>
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-0.5">Public Queue & Wait-Time Reality:</strong>
                {routineCare.publicWaitTimeNote}
              </div>
            </div>
          </div>

          {/* Regional Medical Hubs by City */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Hospital Infrastructure Across {country.name}’s Retirement Hubs</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cityMedicalHubs.map((hub, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-slate-900">{hub.cityName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hub.tierLabel === 'Primary Tertiary Hub'
                          ? 'bg-purple-100 text-purple-900'
                          : hub.tierLabel === 'Regional Hospital Center'
                          ? 'bg-teal-100 text-teal-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {hub.tierLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hub.facilitiesSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pharmacies & Prescription Transition Guide */}
          <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <Pill className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Pharmacies, Prescriptions & Chronic Medication Access
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                  {routineCare.pharmacyAndPrescriptions}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {routineCare.prescriptionRulesChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-white border border-amber-200/70 flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PILLAR 2: EMERGENCY SERVICES, AMBULANCE DISPATCH & MEDEVAC
         ===================================================================== */}
      {(selectedSection === 'all' || selectedSection === 'emergency') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <Ambulance className="w-4 h-4" />
                Pillar 2 · Emergency Medical Services & Acute Trauma
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Emergency Services, Ambulance Dispatch & ER Protocol in {country.name}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200 self-start sm:self-auto">
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              {emergencyServices.responseVerdict}
            </span>
          </div>

          {/* Emergency Number Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-rose-50 via-orange-50/50 to-white border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                <PhoneCall className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">SOS</span>
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                    Primary Emergency Number:
                  </span>
                  <span className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {emergencyServices.emergencyNumberPrimary}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 mt-1">
                  {emergencyServices.emergencyNumberNote}
                </p>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-right shrink-0 self-start md:self-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                EMS Reliability Index
              </span>
              <span className="font-mono tabular-nums text-lg font-extrabold text-rose-700">
                {emergencyServices.responseReliabilityScore}/100
              </span>
            </div>
          </div>

          {/* 3-Column Emergency Realities: Ambulance Dispatch, ER Triage/Deposits, Public vs Private ER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-rose-600" />
                <span>Ambulance Dispatch Reality</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {emergencyServices.ambulanceGuidance}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>ER Admission & Payment Protocol</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {emergencyServices.erTriageAndAdmissionProtocol}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Public Trauma vs. Private ER</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {emergencyServices.publicVsPrivateEr}
              </p>
            </div>
          </div>

          {/* Medevac & Regional Trauma Readiness */}
          <div className="p-5 rounded-xl bg-purple-50/60 border border-purple-200">
            <h4 className="text-sm font-bold text-purple-950 mb-1.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-700" />
              <span>Medical Evacuation (Medevac) & Tertiary Trauma Readiness</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {emergencyServices.medevacAndTraumaReadiness}
            </p>
          </div>

          {/* Retiree Emergency Preparation Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Essential Emergency Readiness Checklist for Expats in {country.name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emergencyServices.emergencyActionChecklist.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PILLAR 3: HEALTHCARE INSURANCE, VISA RULES & OUT-OF-POCKET COSTS
         ===================================================================== */}
      {(selectedSection === 'all' || selectedSection === 'insurance') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Pillar 3 · Health Insurance Architecture & Medical Costs
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Health Insurance Options, Visa Rules & Out-of-Pocket Costs in {country.name}
              </h3>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border self-start sm:self-auto ${
                insurance.visaInsuranceMandatory
                  ? 'bg-orange-50 text-orange-950 border-orange-200'
                  : 'bg-teal-50 text-teal-950 border-teal-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-orange-600" />
              {insurance.visaRequirementHeadline}
            </span>
          </div>

          {/* Visa Insurance Rules & Public Buy-In Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-orange-50/60 border border-orange-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-orange-950 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-orange-700" />
                    <span>Visa Application Insurance Requirement</span>
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-900">
                    {country.visa.retirementVisaName}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {insurance.visaInsuranceDetails}
                </p>
              </div>

              {onNavigateTab && (
                <div className="mt-4 pt-3 border-t border-orange-200/60 flex items-center justify-between text-xs">
                  <span className="text-orange-900/80 font-medium">
                    Verify full consular dossier checklist
                  </span>
                  <button
                    onClick={() => onNavigateTab('visa')}
                    className="font-bold text-orange-800 hover:text-orange-950 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>View Visas & Rules Tab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-teal-50/60 border border-teal-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Public Healthcare Eligibility for Expats</span>
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                    {insurance.publicMonthlyCostEstimate}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2">
                  {insurance.publicHealthcareEligibility}
                </p>
                <p className="text-xs text-teal-900/90">
                  <strong>Enrollment Timeline:</strong> {insurance.publicBuyInTimeline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-teal-200/60 flex items-center justify-between text-xs text-teal-900">
                <span>Pre-existing conditions covered 100% in public tier</span>
              </div>
            </div>
          </div>

          {/* 3-Tier Insurance Comparison Matrix */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  3-Tier Expat Health Insurance & Monthly Premium Matrix
                </h4>
                <p className="text-xs text-slate-500">
                  Estimated monthly premiums in USD across age brackets and coverage tiers for {country.name}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                    <th className="py-3.5 px-4 font-bold">Coverage Tier & Insurers</th>
                    <th className="py-3.5 px-4 font-bold">Single (Age 55–64)</th>
                    <th className="py-3.5 px-4 font-bold">Single (Age 65–74)</th>
                    <th className="py-3.5 px-4 font-bold">Couple (Age ~60)</th>
                    <th className="py-3.5 px-4 font-bold">Pre-Existing Conditions & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {insurance.insuranceTiers.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {tier.tierName}
                        </div>
                        <div className="text-[11px] text-teal-800 font-medium mt-0.5">
                          {tier.providerExamples}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                          {tier.coverageHighlights}
                        </p>
                      </td>
                      <td className="py-4 px-4 align-top font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                        {tier.singleAge55to64MonthlyUSD}
                      </td>
                      <td className="py-4 px-4 align-top font-mono tabular-nums font-bold text-purple-900 whitespace-nowrap">
                        {tier.singleAge65to74MonthlyUSD}
                      </td>
                      <td className="py-4 px-4 align-top font-mono tabular-nums font-bold text-orange-900 whitespace-nowrap">
                        {tier.coupleAge60MonthlyUSD}
                      </td>
                      <td className="py-4 px-4 align-top text-slate-600 max-w-xs leading-relaxed">
                        {tier.preExistingConditionsRule}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Out-of-Pocket Cash Benchmarks */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Typical Out-of-Pocket Private Medical & Dental Costs (Without Insurance)
                </h4>
                <p className="text-xs text-slate-500">
                  Direct self-pay cash tariffs at private clinics in {country.name}—explaining why many retirees choose higher deductibles and pay cash for routine visits.
                </p>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('cost')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>Customize Healthcare Tier in Budget Calc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {insurance.outOfPocketBenchmarks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {item.procedure}
                    </span>
                    <span className="font-mono tabular-nums text-lg font-extrabold text-teal-800 mt-1 block">
                      {item.privateCashPriceUSD}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* US Medicare Reality & Pre-Existing Conditions Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-xl bg-slate-900 text-white">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Info className="w-4 h-4" />
                <span>Medicare & Home-Country Coverage Reality</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {insurance.homeCountryCoverageNote}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950 to-slate-900 text-white">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Strategy for Pre-Existing Conditions</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {insurance.preExistingConditionsStrategy}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

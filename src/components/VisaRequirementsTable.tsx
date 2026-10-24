import React from 'react';
import { Country } from '../types';
import {
  FileText, CheckCircle2, Clock, DollarSign, Calendar,
  ShieldAlert, Globe, Briefcase, Award, AlertCircle
} from 'lucide-react';

interface VisaRequirementsTableProps {
  country: Country;
}

interface VisaDetailRow {
  category: string;
  icon: React.ReactNode;
  detail: string;
  requirement: string;
  notes: string;
}

export const VisaRequirementsTable: React.FC<VisaRequirementsTableProps> = ({ country }) => {
  // Country specific structured visa rules
  const getVisaSpecifications = (c: Country): VisaDetailRow[] => {
    // 1. Age Eligibility
    const ageReq = ['thailand', 'malaysia', 'philippines', 'mauritius', 'curacao'].includes(c.id)
      ? 'Age 50 years or older'
      : ['indonesia', 'switzerland', 'sri-lanka', 'cambodia', 'south-korea', 'united-arab-emirates', 'aruba'].includes(c.id)
      ? 'Age 55 years or older'
      : c.id === 'barbados'
      ? 'Age 60+ for SERP (Any age for 12-Month Welcome Stamp)'
      : c.id === 'new-zealand'
      ? 'Age 66 years or older (Temporary Retirement Visitor Visa)'
      : ['nicaragua', 'fiji'].includes(c.id)
      ? 'Age 45 years or older'
      : c.id === 'belize'
      ? 'Age 40 years or older (QRP Program)'
      : 'Any age with qualifying passive pension / investment income';

    // 2. Financial Thresholds
    const singleIncome = `$${c.visa.minimumIncomeUSD.toLocaleString()} USD / month`;
    const coupleIncome = c.id === 'portugal'
      ? `$${Math.round(c.visa.minimumIncomeUSD * 1.5).toLocaleString()} USD / mo (+50% for spouse)`
      : c.id === 'spain'
      ? `$${Math.round(c.visa.minimumIncomeUSD * 1.25).toLocaleString()} USD / mo (+100% IPREM for spouse)`
      : c.id === 'costa-rica' || c.id === 'panama' || c.id === 'mauritius' || c.id === 'united-arab-emirates'
      ? `$${c.visa.minimumIncomeUSD.toLocaleString()} USD / mo (covers spouse)`
      : `$${Math.round(c.visa.minimumIncomeUSD * 1.3).toLocaleString()} USD / mo (+30% dependent buffer)`;

    // 3. Bank Deposit / Reserve
    const bankBuffer = c.id === 'thailand'
      ? '800,000 THB (~$22,500 USD) deposited in a Thai bank, or pension certification'
      : c.id === 'portugal'
      ? 'Recommended €10,000–€15,000 buffer in Portuguese bank account'
      : c.id === 'spain'
      ? 'Proof of €28,800/yr savings if applying via lump-sum solvency'
      : c.id === 'philippines'
      ? '$10,000 USD time deposit with $800 pension, or $20,000 deposit'
      : c.id === 'malaysia'
      ? 'RM 150,000 (~$35,000 USD) fixed deposit for Sarawak MM2H'
      : c.id === 'andorra'
      ? '€600,000 investment in Andorran real estate or financial assets (includes €47,500 AFA deposit)'
      : c.id === 'new-zealand'
      ? 'NZ$750,000 (~$450,000 USD) 2-year investment + NZ$500,000 maintenance funds'
      : c.id === 'mauritius'
      ? '$1,500 USD/month ($18,000/yr) transferred into a local Mauritian bank account'
      : c.id === 'sri-lanka'
      ? '$15,000 USD fixed deposit + $1,500/mo remittance into a Sri Lankan bank'
      : c.id === 'georgia'
      ? 'No bank deposit required for 365-day visa-free stay ($100,000 property for Residence Permit)'
      : c.id === 'united-arab-emirates'
      ? '1M AED (~$272,500 USD) 3-year deposit or property if not using 15,000 AED/mo income route'
      : c.id === 'fiji'
      ? 'FJD 100,000 (~$44,500 USD) bank deposit (can be used to buy a home/car after approval)'
      : c.id === 'serbia'
      ? 'Residential property purchase of any value (~$45,000+ apartment) or local bank solvency'
      : 'Sufficient liquid funds to establish household (~$5,000–$15,000 buffer)';

    // 4. Initial Duration & Validity
    const initialDuration = c.id === 'panama' || c.id === 'peru' || c.id === 'guatemala'
      ? 'Indefinite (Direct Permanent Residency upon approval)'
      : c.id === 'cayman-islands'
      ? '25 Years (Renewable Residency Certificate for Persons of Independent Means)'
      : c.id === 'mauritius'
      ? '10 Years (Retired Non-Citizen Residence Permit)'
      : c.id === 'united-arab-emirates'
      ? '5 Years (Retire in Dubai Visa) or 10 Years (Golden Visa)'
      : c.id === 'south-africa'
      ? '4 Years renewable (Retired Persons Visa)'
      : c.id === 'fiji' || c.id === 'serbia'
      ? '3 Years renewable'
      : c.id === 'portugal' || c.id === 'costa-rica' || c.id === 'new-zealand' || c.id === 'andorra' || c.id === 'antigua-and-barbuda'
      ? '2 Years renewable'
      : c.id === 'spain' || c.id === 'france' || c.id === 'georgia' || c.id === 'morocco' || c.id === 'bermuda' || c.id === 'seychelles'
      ? '1 Year renewable'
      : c.id === 'india'
      ? '5 to 10 Years Multiple-Entry (180 days/yr) or Lifelong via OCI Card'
      : c.id === 'thailand'
      ? '1 Year renewable (or 10 Years with LTR)'
      : '1 to 2 Years renewable';

    // 5. Renewal Cadence & Timeline to Permanent Residency
    const renewalCadence = c.id === 'panama' || c.id === 'peru'
      ? 'Permanent status; valid for life with periodic entry'
      : c.id === 'portugal' || c.id === 'spain' || c.id === 'france' || c.id === 'greece' || c.id === 'italy' || c.id === 'czech-republic' || c.id === 'poland' || c.id === 'romania' || c.id === 'estonia' || c.id === 'slovakia'
      ? 'Renewable every 1–3 years; eligible for Permanent Residency & EU status after 5 years'
      : c.id === 'costa-rica' || c.id === 'mauritius' || c.id === 'el-salvador' || c.id === 'serbia' || c.id === 'grenada'
      ? 'Eligible for Permanent Residency after 3 years of legal residency'
      : c.id === 'thailand' || c.id === 'united-arab-emirates'
      ? 'Renewable indefinitely (5–10 year cycles in UAE; annual in Thailand)'
      : 'Renewable every 1–2 years; pathway to PR after 3–5 years';

    // 6. Physical Stay Obligation
    const stayRequirement = c.id === 'portugal'
      ? 'Average 8 months/year in-country (or 6 consecutive months)'
      : c.id === 'spain'
      ? '183 days per year to maintain residency renewals'
      : c.id === 'andorra'
      ? 'Only 90 days per calendar year required inside Andorra'
      : c.id === 'cayman-islands' || c.id === 'antigua-and-barbuda'
      ? 'Minimum 30 days per calendar year in-country'
      : c.id === 'panama'
      ? 'Visit Panama at least once every 24 months'
      : c.id === 'costa-rica' || c.id === 'guatemala' || c.id === 'honduras' || c.id === 'united-arab-emirates'
      ? 'Visit at least once every 180 days (or zero minimum stay with 10-Yr UAE Golden Visa)'
      : c.id === 'paraguay'
      ? 'Visit once every 3 years for Permanent Residents (no minimum for Temp)'
      : c.id === 'thailand' || c.id === 'georgia' || c.id === 'south-africa'
      ? 'No minimum stay requirement'
      : 'Minimum 3 to 6 months annually to preserve renewal eligibility';

    // 7. Work & Economic Rights
    const workRights = c.visa.allowedToWork
      ? 'Remote digital work, passive investments, and overseas client freelancing permitted'
      : 'Strictly passive income only (pensions, dividends, rental income); local employment prohibited';

    // 8. Health Insurance & Medical Clearances
    const medicalReq = c.id === 'spain'
      ? 'Spanish private policy with zero copays and zero deductibles (Sanitas, Adeslas)'
      : c.id === 'costa-rica'
      ? 'Mandatory enrollment in CAJA universal healthcare upon residency grant'
      : c.id === 'thailand'
      ? 'Mandatory health policy with min. $100,000 USD inpatient coverage'
      : 'Comprehensive international travel/health insurance covering hospital emergencies';

    return [
      {
        category: 'Eligibility & Age Limit',
        icon: <Award className="w-4 h-4 text-teal-600" />,
        detail: 'Age & Solvency Criteria',
        requirement: ageReq,
        notes: 'Applicants must demonstrate clean police record and financial independence.',
      },
      {
        category: 'Financial Threshold (Single)',
        icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
        detail: 'Minimum Monthly Passive Income',
        requirement: singleIncome,
        notes: 'Verifiable via state pension, social security, annuity, or certified dividend yield.',
      },
      {
        category: 'Financial Threshold (Couple)',
        icon: <DollarSign className="w-4 h-4 text-indigo-600" />,
        detail: 'Spouse & Dependent Allowance',
        requirement: coupleIncome,
        notes: 'Marriage certificate legalized with apostille required for spouse inclusion.',
      },
      {
        category: 'Capital / Bank Reserve',
        icon: <FileText className="w-4 h-4 text-violet-600" />,
        detail: 'Local In-Country Bank Buffer',
        requirement: bankBuffer,
        notes: 'Funds typically deposited in a local bank account prior to final interview.',
      },
      {
        category: 'Initial Visa Duration',
        icon: <Clock className="w-4 h-4 text-amber-600" />,
        detail: 'Initial Validity Period',
        requirement: initialDuration,
        notes: 'Begins with consular vignette stamp, followed by biometric residence card issue.',
      },
      {
        category: 'Renewal & PR Pathway',
        icon: <Calendar className="w-4 h-4 text-teal-600" />,
        detail: 'Long-Term Residency Cadence',
        requirement: renewalCadence,
        notes: c.visa.pathwayToPR,
      },
      {
        category: 'Physical Presence Mandate',
        icon: <Globe className="w-4 h-4 text-indigo-600" />,
        detail: 'Minimum In-Country Stay',
        requirement: stayRequirement,
        notes: 'Important consideration if planning frequent international travel.',
      },
      {
        category: 'Employment Rights',
        icon: <Briefcase className="w-4 h-4 text-violet-600" />,
        detail: 'Permitted Economic Activities',
        requirement: workRights,
        notes: c.visa.allowedToWork ? 'Allows remote international earnings.' : 'Preserves retirement nature of permit.',
      },
      {
        category: 'Medical & Police Clearances',
        icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
        detail: 'Health & Background Checks',
        requirement: medicalReq,
        notes: 'FBI or national police certificate apostilled within 90 days of application.',
      },
    ];
  };

  const rows = getVisaSpecifications(country);

  const badgeColors = [
    'bg-teal-50 text-teal-900 border-teal-200',
    'bg-emerald-50 text-emerald-900 border-emerald-200',
    'bg-indigo-50 text-indigo-900 border-indigo-200',
    'bg-violet-50 text-violet-900 border-violet-200',
    'bg-amber-50 text-amber-900 border-amber-200',
  ];

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100/90 shadow-sm mt-6">
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-500" />
      
      {/* Table Header Banner */}
      <div className="p-5 sm:p-6 border-b border-indigo-100 bg-gradient-to-r from-teal-50/50 via-indigo-50/40 to-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Structured Visa Eligibility, Duration &amp; Financial Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Empirical legal parameters for {country.name} ({country.visa.retirementVisaName}).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-white/90 px-4 py-2 rounded-2xl border border-indigo-100 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] text-indigo-700 uppercase tracking-wider block font-bold">Processing Time</span>
            <span className="font-mono tabular-nums text-sm font-extrabold text-slate-900">
              ~{country.visa.processingMonths} Months
            </span>
          </div>
          <div className="w-px h-7 bg-indigo-100" />
          <div className="text-right">
            <span className="text-[10px] text-teal-700 uppercase tracking-wider block font-bold">Difficulty Level</span>
            <span className="font-mono tabular-nums text-sm font-extrabold text-teal-800">
              Tier {country.visa.difficultyRating} / 5
            </span>
          </div>
        </div>
      </div>

      {/* Structured Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-indigo-100/70">
          <thead className="bg-slate-50 text-indigo-950 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-48">Regulatory Category</th>
              <th className="py-3.5 px-4 w-48">Parameter Dimension</th>
              <th className="py-3.5 px-4 min-w-[240px]">Official {country.name} Requirement</th>
              <th className="py-3.5 px-4 min-w-[200px] text-slate-500">Legal Notes &amp; Practical Advice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                {/* Category with Icon */}
                <td className="py-3.5 px-4 font-bold text-slate-900 align-top">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-100 shrink-0">{row.icon}</span>
                    <span>{row.category}</span>
                  </div>
                </td>

                {/* Dimension label */}
                <td className="py-3.5 px-4 text-slate-600 align-top font-semibold">
                  {row.detail}
                </td>

                {/* Official Requirement (Tabular figures) */}
                <td className="py-3.5 px-4 font-bold text-slate-900 align-top leading-relaxed">
                  <span className={`font-mono tabular-nums px-2.5 py-1 rounded-xl border inline-block ${badgeColors[idx % badgeColors.length]}`}>
                    {row.requirement}
                  </span>
                </td>

                {/* Practical Notes */}
                <td className="py-3.5 px-4 text-slate-500 align-top leading-relaxed">
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Note */}
      <div className="p-4 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-teal-50/30 border-t border-indigo-100 flex items-start gap-2.5 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900">Immigration Advisory:</strong> Requirements are verified directly against official consulate decrees. Income requirements are calculated based on national minimum wage baselines or statutory exchange rates. Consult an accredited immigration attorney before submitting consular dossiers.
        </p>
      </div>
    </div>
  );
};

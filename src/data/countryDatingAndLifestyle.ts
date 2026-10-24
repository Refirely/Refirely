import { Country } from '../types';

export interface PartnerExpectationItem {
  dimension: string;
  headline: string;
  detail: string;
}

export interface NormalVsAbnormalItem {
  completelyNormal: string;
  notNormalRedFlag: string;
  contextNote: string;
}

export interface DatingScamPreventionTip {
  scamName: string;
  riskLevel: 'High Vigilance' | 'Moderate Vigilance' | 'Standard Precaution';
  howItWorks: string;
  howToProtectYourself: string;
}

export interface CountryDatingAndLifestyleProfile {
  countryId: string;
  countryName: string;
  culturalArchetype: string;
  courtshipPace: string;
  ageGapNorms: string;
  billSplittingNorm: string;
  popularAppsAndVenues: string;
  datingStyleOverview: string;
  partnerExpectations: PartnerExpectationItem[];
  normalVsNotNormal: NormalVsAbnormalItem[];
  dosList: string[];
  dontsList: string[];
  scamPreventionTips: DatingScamPreventionTip[];
  assetAndLegalProtectionNote: string;
}

type CulturalZone =
  | 'southeast_asia'
  | 'east_asia'
  | 'latin_america'
  | 'caribbean'
  | 'southern_europe'
  | 'western_northern_europe'
  | 'eastern_europe_balkans_caucasus'
  | 'mena_gcc'
  | 'sub_saharan_africa'
  | 'south_asia'
  | 'oceania_north_america';

function detectCulturalZone(country: Country): CulturalZone {
  const id = country.id.toLowerCase();
  const region = country.region.toLowerCase();

  if (
    [
      'thailand',
      'vietnam',
      'philippines',
      'malaysia',
      'indonesia',
      'cambodia',
      'laos',
      'singapore',
      'brunei',
      'timor-leste',
    ].includes(id) ||
    region.includes('southeast asia')
  ) {
    return 'southeast_asia';
  }

  if (
    ['japan', 'south-korea', 'taiwan', 'hong-kong', 'macau', 'china', 'mongolia'].includes(id) ||
    region.includes('east asia')
  ) {
    return 'east_asia';
  }

  if (
    ['india', 'sri-lanka', 'nepal', 'bhutan', 'maldives'].includes(id) ||
    region.includes('south asia')
  ) {
    return 'south_asia';
  }

  if (region.includes('caribbean') || ['bahamas', 'barbados', 'jamaica', 'dominican-republic', 'aruba', 'curacao', 'cayman-islands', 'bermuda', 'turks-and-caicos', 'puerto-rico', 'st-lucia', 'antigua-and-barbuda', 'grenada', 'st-kitts-and-nevis', 'trinidad-and-tobago'].includes(id)) {
    return 'caribbean';
  }

  if (
    region.includes('latin america') ||
    region.includes('south america') ||
    region.includes('central america') ||
    ['mexico', 'costa-rica', 'panama', 'colombia', 'ecuador', 'peru', 'chile', 'argentina', 'uruguay', 'brazil', 'paraguay', 'bolivia', 'guatemala', 'belize', 'el-salvador', 'honduras', 'nicaragua'].includes(id)
  ) {
    return 'latin_america';
  }

  if (
    ['portugal', 'spain', 'italy', 'greece', 'malta', 'cyprus', 'andorra', 'monaco', 'san-marino', 'gibraltar'].includes(id) ||
    region.includes('southern europe') ||
    region.includes('mediterranean')
  ) {
    return 'southern_europe';
  }

  if (
    [
      'albania',
      'montenegro',
      'croatia',
      'serbia',
      'bosnia-and-herzegovina',
      'north-macedonia',
      'bulgaria',
      'romania',
      'hungary',
      'poland',
      'czechia',
      'czech-republic',
      'slovakia',
      'slovenia',
      'estonia',
      'latvia',
      'lithuania',
      'georgia',
      'armenia',
      'moldova',
    ].includes(id) ||
    region.includes('eastern europe') ||
    region.includes('balkans') ||
    region.includes('caucasus')
  ) {
    return 'eastern_europe_balkans_caucasus';
  }

  if (
    region.includes('middle east') ||
    region.includes('north africa') ||
    ['united-arab-emirates', 'uae', 'qatar', 'oman', 'bahrain', 'saudi-arabia', 'kuwait', 'jordan', 'morocco', 'tunisia', 'egypt', 'turkey', 'israel'].includes(id)
  ) {
    return 'mena_gcc';
  }

  if (
    region.includes('africa') ||
    ['south-africa', 'mauritius', 'seychelles', 'namibia', 'botswana', 'kenya', 'tanzania', 'rwanda', 'ghana', 'senegal', 'cape-verde', 'zambia', 'uganda', 'madagascar'].includes(id)
  ) {
    return 'sub_saharan_africa';
  }

  if (
    region.includes('oceania') ||
    region.includes('north america') ||
    ['australia', 'new-zealand', 'fiji', 'french-polynesia', 'samoa', 'vanuatu', 'tonga', 'canada', 'united-states'].includes(id)
  ) {
    return 'oceania_north_america';
  }

  return 'western_northern_europe';
}

export function getCountryDatingAndLifestyleProfile(
  country: Country
): CountryDatingAndLifestyleProfile {
  const zone = detectCulturalZone(country);
  const name = country.name;
  const city = country.topCities[0]?.name || country.capital;

  switch (zone) {
    case 'southeast_asia':
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Warm, Family-Centric & Face-Conscious Courtship',
        courtshipPace: 'Fast initial connection; steady progression toward family introduction',
        ageGapNorms: 'Age-gap relationships (10–25+ years) are socially common when mutually respectful',
        billSplittingNorm: 'The inviting/senior partner (especially an expat) is expected to cover dates',
        popularAppsAndVenues: `Thaifriendly / Pinalove / Bumble / Tinder, expat social clubs in ${city}, golf & badminton clubs, language exchanges`,
        datingStyleOverview: `Dating in ${name} blends warm hospitality, humor, and strong family loyalty with deeply ingrained "saving face" (keeping calm and polite in public). Expats and retirees find it very easy to meet partners in ${city}, but successful long-term relationships depend on distinguishing between cosmopolitan professionals, traditional family-oriented locals, and transactional nightlife circles.`,
        partnerExpectations: [
          {
            dimension: 'Emotional Demeanor ("Saving Face")',
            headline: 'Calmness, Gentleness & Public Respect',
            detail: `Losing your temper, shouting, or publicly criticizing a partner or waiter in ${name} causes severe loss of face and will quickly end a relationship. Calm, warm communication is prized above all.`,
          },
          {
            dimension: 'Financial & Provider Role',
            headline: 'Generosity Without Being an "ATM"',
            detail: `Covering dinner, weekend trips, and small thoughtful gifts is expected and appreciated. However, educated middle-class locals in ${city} do not ask for monthly allowances during early dating.`,
          },
          {
            dimension: 'Family Integration',
            headline: 'Respect for Parents & Extended Family',
            detail: `Filial piety is central in ${name}. Meeting the family and showing respect to parents is a milestone of serious commitment, though boundaries around extended-family support should be clear early on.`,
          },
          {
            dimension: 'Exclusivity & Commitment',
            headline: 'Clear Intentions & Daily Check-Ins',
            detail: `Frequent daily messaging (Line, WhatsApp, Zalo) sharing meals and whereabouts is a normal sign of affection—not possessiveness—in ${name}.`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `Frequent text messages ("Have you eaten yet?", sending photos of food) and wanting to introduce you to friends/family once exclusive.`,
            notNormalRedFlag: `Asking for cash transfers within the first few weeks for a "sick family member," "motorcycle accident," or "overdue debt."`,
            contextNote: `Genuine partners take pride in self-reliance and will avoid asking a new romantic partner for emergency cash.`,
          },
          {
            completelyNormal: `You paying for restaurants, cinema tickets, and weekend excursions when dating in ${city}.`,
            notNormalRedFlag: `Pressuring you to buy land, a house, or a new vehicle registered solely in their name or a relative's name.`,
            contextNote: `Foreigners often cannot own land freehold in Southeast Asia; never fund real estate in a new partner's name.`,
          },
          {
            completelyNormal: `Modest public affection (holding hands) while avoiding heavy kissing in conservative or temple districts.`,
            notNormalRedFlag: `Refusing to be seen with you during the daytime or only wanting to meet late at night in entertainment districts.`,
            contextNote: `Daytime coffee, market, or park dates are the best filter for sincere relationship intent.`,
          },
        ],
        dosList: [
          `Dress neatly (collared shirt, clean shoes) when meeting a date in ${city}; locals judge sincerity by personal grooming.`,
          `Suggest daytime dates—cafés, botanical gardens, art galleries, or brunch—to build genuine connection outside nightlife zones.`,
          `Learn polite local greetings and basic phrases in ${country.language}; it immediately earns warmth from her/his friends.`,
          `Keep your calm ("cool heart") in traffic, restaurants, and misunderstandings—humor solves 90% of cultural friction.`,
          `Be transparent about your retirement lifestyle and long-term plans in ${name} from the start.`,
        ],
        dontsList: [
          `Never raise your voice, point fingers, or cause a public scene in ${name}—public anger is culturally unforgivable.`,
          `Don't confuse bar/nightlife companionship with traditional local dating; the social rules and financial expectations are completely different.`,
          `Don't flash large bank balances, pension statements, or luxury watches on early dates or on dating apps.`,
          `Don't move a new partner into your leased condo or sign joint financial contracts within the first 6–12 months.`,
          `Don't ignore subtle "no" signals—in ${name}, people rarely say a blunt "no" to avoid rudeness; a hesitant "maybe later" usually means no.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'The "Sick Relative / Buffalo / Motorbike Crash" Cash Emergency',
            riskLevel: 'High Vigilance',
            howItWorks: `Shortly after building emotional rapport, a date or online match claims a sudden family hospital bill, motorbike crash, or village emergency requiring an immediate wire or cash handover.`,
            howToProtectYourself: `Maintain a strict personal rule: zero cash loans or family remittances during the first 6 months. Offer sympathy or suggest public hospital care, and observe their reaction.`,
          },
          {
            scamName: 'Property & Vehicle Purchase in Partner’s Name',
            riskLevel: 'High Vigilance',
            howItWorks: `Because foreigners face land ownership restrictions in parts of ${name}, some expats are persuaded to buy a house, condo, or SUV titled 100% in a local partner's name, losing everything upon breakup.`,
            howToProtectYourself: `Rent your home for at least the first 1–2 years. If buying a condo, purchase only foreign-quota freehold units titled strictly in your own passport name.`,
          },
          {
            scamName: 'Multi-Sponsor Long-Distance Allowance ("Butterfly" Syndrome)',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `An individual maintains multiple foreign "boyfriends/sponsors" abroad or in different expat towns, collecting monthly stipends from each via remittance apps.`,
            howToProtectYourself: `Date locally in ${city} where you spend normal unscheduled daytime together, and never send monthly stipends to someone you only see occasionally.`,
          },
          {
            scamName: 'High-Priced Venue & Drink-Padding Trap',
            riskLevel: 'Standard Precaution',
            howItWorks: `A new app match insists on meeting at a specific obscure lounge or karaoke bar where she receives a commission on wildly overpriced bottles or padded bills.`,
            howToProtectYourself: `Always choose the first-date venue yourself—pick a well-reviewed café, rooftop restaurant, or shopping mall bistro in ${city}.`,
          },
        ],
        assetAndLegalProtectionNote: `In ${name}, keep your retirement accounts, visa qualification deposits, and real estate strictly in your own name. Consult an independent bilingual family/property lawyer before signing any cohabitation, lease, or usufruct agreement.`,
      };

    case 'latin_america':
    case 'caribbean':
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Romantic, Expressive & Chivalrous Courtship',
        courtshipPace: 'Warm, passionate, and chemistry-driven; family ties remain close',
        ageGapNorms: 'Age gaps of 8–20 years are common and accepted when presentation and energy are vibrant',
        billSplittingNorm: 'Traditional chivalry is strong—the person who invites (typically the man) pays the bill',
        popularAppsAndVenues: `Bumble, Tinder, Instagram, salsa/bachata dance classes, language exchanges, and social cafés in ${city}`,
        datingStyleOverview: `Dating in ${name} is warm, expressive, and socially vibrant. Eye contact, dancing, good conversation, and chivalry ("caballerosidad") are central to romance. Locals value emotional warmth, personal style, and family connection, while expats who learn conversational ${country.language} enjoy a dramatically richer and safer dating life.`,
        partnerExpectations: [
          {
            dimension: 'Chivalry & Presentation',
            headline: 'Good Grooming, Fragrance & Courteous Manners',
            detail: `Locals in ${name} dress up for dates—even casual coffee or dinner in ${city}. Wearing beach flip-flops and gym shorts to an evening date signals disrespect; a crisp shirt, cologne/perfume, and attentive manners go a long way.`,
          },
          {
            dimension: 'Language & Cultural Effort',
            headline: 'Effort to Speak the Local Language & Dance',
            detail: `Speaking even intermediate ${country.language} and being willing to step onto the dance floor or join family Sunday lunches separates integrated expats from transient tourists.`,
          },
          {
            dimension: 'Time & Punctuality ("Hora Latina")',
            headline: 'Relaxed Social Timing',
            detail: `It is culturally normal for a date in ${name} to arrive 15–30 minutes after the scheduled time without intending disrespect. Relax and enjoy an aperitif while waiting.`,
          },
          {
            dimension: 'Family Closeness',
            headline: 'Multi-Generational Household Ties',
            detail: `Many single adults in ${name} live with or near their parents until marriage and talk to their mother daily. This is healthy cultural family cohesion.`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `A date arriving 20 minutes late, dressing stylishly, and expecting you to cover the restaurant bill if you invited them.`,
            notNormalRedFlag: `Insisting on coming straight to your apartment on the first night from a dating app, or bringing an unannounced "friend" along.`,
            contextNote: `Never bring a first-time app match back to your residence on date #1—always meet in public venues first.`,
          },
          {
            completelyNormal: `Affectionate nicknames ("mi amor", "corazón") and warm cheek kisses upon greeting in ${city}.`,
            notNormalRedFlag: `Asking about your monthly pension amount, bank balances, or requesting money for rent/phone repairs within weeks of meeting.`,
            contextNote: `Sincere partners in ${name} value romance and companionship, not financial interrogation.`,
          },
          {
            completelyNormal: `Meeting in lively, well-lit restaurants, plazas, or cafés in upscale neighborhoods of ${city}.`,
            notNormalRedFlag: `Luring you to an unfamiliar peripheral neighborhood late at night or leaving your drink unattended.`,
            contextNote: `Stay within established dining zones and use Uber/DiDi door-to-door.`,
          },
        ],
        dosList: [
          `Always meet first-time dates in established, well-lit cafés or restaurants in prime neighborhoods of ${city}.`,
          `Dress sharply—well-fitted trousers/jeans, collared shirt, and clean shoes—and practice chivalrous etiquette.`,
          `Verify a dating app match with a quick video call before meeting in person.`,
          `Keep your drink in your hand or sight at all times when socializing in nightlife venues.`,
          `Rent in buildings with 24/7 front-desk security ("portería") that logs visitor IDs—this deters 99% of bad actors.`,
        ],
        dontsList: [
          `Never invite a stranger from Tinder/Bumble directly to your apartment or hotel room on the first or second date.`,
          `Don't wear flashy gold chains, expensive watches, or use your primary banking phone openly on the street ("no dar papaya").`,
          `Don't leave your glass unattended when going to the restroom in bars or clubs.`,
          `Don't lend large sums of money or co-sign leases/business ventures for a romantic partner.`,
          `Don't rely solely on translation apps—take local language lessons to read social nuances accurately.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'Drink Spiking (Scopolamine / Benzodiazepines) via Dating Apps',
            riskLevel: 'High Vigilance',
            howItWorks: `In major nightlife cities, organized rings use attractive dating-app profiles to go on a drink date or visit the victim's apartment, slip a sedative into a drink, and empty electronics/cards.`,
            howToProtectYourself: `Never bring a first/second date to your home, never leave your drink unattended, and live in a building with 24-hour ID-checking concierge security.`,
          },
          {
            scamName: 'Fake Emergency / Rent / Medical Bill Requests',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `After a few passionate dates, a match claims sudden eviction, a sick child, or a stolen phone and asks for a $300–$1,500 transfer.`,
            howToProtectYourself: `Politely decline cash requests early in dating. Genuine professionals and family-minded locals in ${city} will never treat a new date as a lender.`,
          },
          {
            scamName: 'De Facto Common-Law Marital Property Claims ("Unión Libre")',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `In many Latin American jurisdictions, living together continuously under the same roof for 1–2+ years can create legal common-law marriage ("unión marital de hecho") with community property rights.`,
            howToProtectYourself: `Before moving a partner into your home full-time, sign a notarized cohabitation/prenuptial asset separation agreement ("capitulaciones") with a local attorney.`,
          },
        ],
        assetAndLegalProtectionNote: `Many jurisdictions in ${name}'s region recognize common-law partnerships ("Unión Libre") after 1–2 years of cohabitation. Always execute a notarized marital/cohabitation asset-separation agreement ("Capitulaciones") before cohabitating.`,
      };

    case 'southern_europe':
    case 'western_northern_europe':
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Egalitarian, Socially Cultured & Conversation-Driven',
        courtshipPace: 'Relaxed, organic progression through coffee, aperitivos, dinners, and shared hobbies',
        ageGapNorms: 'Peers within 5–12 years are most common; shared intellectual and lifestyle interests matter most',
        billSplittingNorm: 'Offering to pay on the first date is classy, while splitting ("going Dutch") or alternating turns is very common',
        popularAppsAndVenues: `Bumble, Hinge, Tinder, InterNations, hiking/sailing/wine clubs, cultural meetups, and neighborhood cafés in ${city}`,
        datingStyleOverview: `Dating in ${name} revolves around shared lifestyle pleasures—long conversations over coffee or wine, cultural events, outdoor fitness, and mutual independence. People date for genuine emotional, intellectual, and romantic compatibility rather than economic security, making relationships highly authentic and low-risk for financial exploitation.`,
        partnerExpectations: [
          {
            dimension: 'Intellectual & Cultural Curiosity',
            headline: 'Engaging Conversation & Local Appreciation',
            detail: `Locals and fellow expats in ${name} value curiosity about history, food, travel, arts, and current affairs. Boasting about wealth or income is considered tacky and off-putting.`,
          },
          {
            dimension: 'Financial Independence',
            headline: 'Equal Partnership & Shared Experiences',
            detail: `Partners in ${name} typically have their own careers, pensions, or savings. While picking up the tab for a nice dinner is appreciated, partners expect mutual respect and financial autonomy.`,
          },
          {
            dimension: 'Social Integration',
            headline: 'Friend Groups &Shared Activities',
            detail: `Instead of formal high-pressure "dates," romance in ${city} often starts naturally via group dinners, padel/tennis clubs, wine tastings, or walking clubs.`,
          },
          {
            dimension: 'Work-Life & Leisure Rhythm',
            headline: 'Savoring Meals & Unhurried Time',
            detail: `Rushing through a 45-minute dinner or checking your phone constantly kills romance in ${name}. Meals and evening strolls ("passeggiata" / "paseo") are meant to be savored.`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `Starting with an early-evening wine/aperitivo or coffee date in ${city} and talking for two hours before deciding on dinner.`,
            notNormalRedFlag: `An online match who refuses to meet in person despite claiming to live nearby, or immediately asks to move to encrypted crypto/investment chats.`,
            contextNote: `In-person café culture is effortless in ${name}; anyone avoiding a simple coffee meet-up is likely a fake profile.`,
          },
          {
            completelyNormal: `A partner offering to split the bill or insisting on paying for the next round of drinks.`,
            notNormalRedFlag: `Anyone asking for financial help, visa sponsorship promises, or investment transfers early in dating.`,
            contextNote: `Because locals have social safety nets and healthcare, sudden "medical bill" cash requests are virtually always scams.`,
          },
          {
            completelyNormal: `Taking several weeks of regular dating before introducing a partner to adult children or close family.`,
            notNormalRedFlag: `Love-bombing within 48 hours followed by a request to co-sign a lease or loan.`,
            contextNote: `Healthy European courtship progresses at a measured, grounded pace.`,
          },
        ],
        dosList: [
          `Join local hobby groups in ${city}—padel, golf, sailing, hiking, wine societies, or language exchanges—where most expat-local romances begin.`,
          `Dress with understated European smart-casual elegance (well-cut jacket, linen shirt, leather shoes/clean sneakers).`,
          `Offer to pay on the first date, but graciously accept if your date prefers to split or buy the post-dinner drinks.`,
          `Learn conversational ${country.language}—even in high-English countries, speaking the local tongue opens doors to authentic local circles.`,
        ],
        dontsList: [
          `Don't brag about your net worth, retirement portfolio, or how "cheap" ${name} feels compared to your home country.`,
          `Don't rush exclusivity talk on the very first coffee or aperitivo date—let chemistry unfold naturally.`,
          `Don't fall for online "pig-butchering" crypto/forex romance profiles on WhatsApp or dating apps.`,
          `Don't ignore local cohabitation tax/inheritance rules if you eventually buy property together.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'Online "Pig-Butchering" Crypto / Investment Romance Profiles',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `Polished profiles on Tinder, Bumble, or WhatsApp pose as wealthy international entrepreneurs living in ${city}, chat daily for weeks, and then invite you to trade on a fraudulent crypto/gold platform.`,
            howToProtectYourself: `Insist on meeting for an in-person coffee in ${city} within 7–10 days of matching, and never mix dating with investment platforms.`,
          },
          {
            scamName: 'Tourist-Zone Bar Bill Padding ("Clip Joint" Lounges)',
            riskLevel: 'Standard Precaution',
            howItWorks: `In certain historic tourist strips, an overly friendly stranger invites you to a specific bar where unmarked champagne or cocktails cost €300–€800.`,
            howToProtectYourself: `Always check printed menu prices and choose reputable restaurants or wine bars yourself.`,
          },
        ],
        assetAndLegalProtectionNote: `In ${name}, long-term cohabitation or registered partnerships can carry inheritance and tenancy implications under civil law. Keep cross-border wills updated with an international estate specialist.`,
      };

    case 'eastern_europe_balkans_caucasus':
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Traditional Gender Roles, Direct Honesty & High Elegance',
        courtshipPace: 'Deliberate, respectful courtship; partners may appear reserved at first before becoming deeply loyal',
        ageGapNorms: 'Age gaps of 7–18 years are well-accepted when the man is gentlemanly, fit, and well-presented',
        billSplittingNorm: 'Strictly traditional—the man is expected to pay 100% of restaurant dates and bring flowers on special occasions',
        popularAppsAndVenues: `Bumble, Tinder, Badoo, Instagram, upscale cafés, cultural theaters, fitness clubs, and wine lounges in ${city}`,
        datingStyleOverview: `Dating in ${name} combines classic old-world chivalry with direct, no-nonsense emotional honesty. Women typically invest significant effort into elegance and style, and expect a gentleman who opens doors, brings flowers (always an odd number!), plans thoughtful dates, and covers the bill without hesitation.`,
        partnerExpectations: [
          {
            dimension: 'Traditional Gentleman Etiquette',
            headline: 'Chivalry, Flowers & Planning the Date',
            detail: `Splitting a first-date dinner bill 50/50 in ${name} is widely seen as a romantic dealbreaker. Opening doors, helping with coats, and paying the bill smoothly are standard expectations.`,
          },
          {
            dimension: 'Emotional Directness',
            headline: 'Authentic Smiles over Polite Small Talk',
            detail: `People in ${name} do not wear "fake polite smiles" with strangers, which can initially feel reserved. Once trust is built, friendships and partnerships are remarkably deep and loyal.`,
          },
          {
            dimension: 'Floral Etiquette',
            headline: 'Always Bring an Odd Number of Flowers',
            detail: `Across Eastern Europe, the Balkans, and the Caucasus, even numbers of flowers are strictly reserved for funerals. Bring 3, 5, or 7 stems for a romantic date!`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `Your date dressing up elegantly for dinner and expecting you to lead the planning and cover the restaurant bill.`,
            notNormalRedFlag: `An online match asking you to wire money for a "visa, passport, or plane ticket" before you have ever met in person.`,
            contextNote: `Never send travel or visa funds to someone you haven't met face-to-face in ${city}.`,
          },
          {
            completelyNormal: `A somewhat reserved expression during the first 15 minutes of a date until rapport warms up.`,
            notNormalRedFlag: `Insisting on going to a specific unknown bar where she orders expensive hookah/champagne and disappears before the bill arrives.`,
            contextNote: `Always pick the café or restaurant yourself in ${city}'s central dining district.`,
          },
        ],
        dosList: [
          `Always choose the venue yourself for the first 2–3 dates in ${city} to avoid commission-bar traps.`,
          `Bring an odd number of fresh flowers (e.g., 3 or 5 roses) on a second or third romantic dinner date.`,
          `Pay the dinner or coffee bill smoothly without asking to split.`,
          `Show genuine respect for ${name}'s history, traditions, and family values.`,
        ],
        dontsList: [
          `Never gift an even number of flowers (even numbers are only for funerals).`,
          `Don't suggest splitting a coffee or dinner bill 50/50 on early dates.`,
          `Don't send money online to translation/marriage-agency profiles claiming they need funds to travel to you.`,
          `Don't walk into unreviewed bars recommended by a brand-new Tinder match.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'The "Commission Restaurant / Hookah Lounge" Consummation Trap',
            riskLevel: 'High Vigilance',
            howItWorks: `An attractive match on Tinder/Badoo asks to meet at a specific café or lounge in ${city}, orders platters, vintage wine, or shisha at 10x normal prices, and splits a 30% kickback with the venue.`,
            howToProtectYourself: `Golden Rule: You pick the venue for the first three dates. If a match refuses to meet at a well-known mainstream restaurant or café you select, cancel immediately.`,
          },
          {
            scamName: 'Online Translation Agency / Travel-Fund Scam',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `Dating websites charge per-letter translation fees or a match asks for €500+ to "pay for documents/travel" to visit you.`,
            howToProtectYourself: `Only use mainstream apps (Bumble, Hinge, Tinder) while physically in ${city}, and verify via live video call before meeting.`,
          },
        ],
        assetAndLegalProtectionNote: `Keep real estate and bank accounts in ${name} titled in your own name, and use a licensed bilingual notary for any property or lease contracts.`,
      };

    case 'mena_gcc':
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Discreet, Cosmopolitan Expat Circles & Respect for Local Law',
        courtshipPace: 'Measured, respectful, and privacy-conscious in public spaces',
        ageGapNorms: 'Common within international expat communities; traditional local families follow formal marriage customs',
        billSplittingNorm: 'Generous hosting is the cultural norm; the inviting person covers the bill',
        popularAppsAndVenues: `Bumble, Hinge, InterNations, beach/golf/yacht clubs, hotel brunch lounges, and expat social clubs in ${city}`,
        datingStyleOverview: `Dating in ${name} primarily takes place within the vibrant international expat community and cosmopolitan urban circles in ${city}. While social life in hotel lounges, beach clubs, and restaurants is sophisticated and active, public behavior must respect local cultural modesty, public decency laws, and telecommunications regulations.`,
        partnerExpectations: [
          {
            dimension: 'Public Discretion & Modesty',
            headline: 'Keep Public Displays of Affection Minimal',
            detail: `While holding hands is generally fine for couples, overt public kissing or intoxication outside licensed venues can violate public decency statutes in ${name}.`,
          },
          {
            dimension: 'Generous Hospitality',
            headline: 'Fine Dining, Lounge Culture & Courteous Hosting',
            detail: `Socializing in ${city} centers around weekend brunches, rooftop lounges, coffee houses, and private clubs where gracious hosting is expected.`,
          },
          {
            dimension: 'Digital & Messaging Etiquette',
            headline: 'Strict Cybercrime & Privacy Laws',
            detail: `Never send rude messages, insults, or unconsented photos on WhatsApp or social media—many jurisdictions in this region enforce strict cyber-defamation laws.`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `Meeting fellow expats or cosmopolitan professionals at licensed hotel restaurants, specialty coffee shops, or golf/beach clubs in ${city}.`,
            notNormalRedFlag: `Profiles soliciting transactional arrangements on dating apps or asking you to transfer funds before meeting.`,
            contextNote: `Stick to verified social clubs, InterNations events, and daytime coffee dates.`,
          },
          {
            completelyNormal: `Respecting family privacy and religious holidays (such as Ramadan dining etiquette).`,
            notNormalRedFlag: `Pressure to co-sign local loans, business sponsorships, or high-limit credit cards.`,
            contextNote: `Never co-sign financial instruments or checks in ${name}.`,
          },
        ],
        dosList: [
          `Meet in reputable cafés, hotel dining rooms, or established social clubs in ${city}.`,
          `Keep public displays of affection modest and respectful of local customs.`,
          `Maintain polite written communication on WhatsApp/social media at all times.`,
          `Respect local dress codes when visiting historic, religious, or government districts.`,
        ],
        dontsList: [
          `Never engage in public arguments, offensive hand gestures, or public intoxication.`,
          `Don't photograph people without their explicit permission.`,
          `Don't co-sign personal loans, blank security checks, or local business guarantees for a date.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'Lounges with Inflated Minimum-Spend / Bottle Bills',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `An app match suggests a specific nightclub table where bottle service is automatically opened at thousands of dollars.`,
            howToProtectYourself: `Always book the restaurant or coffee lounge yourself at a transparent, reputable venue in ${city}.`,
          },
          {
            scamName: 'Online Investment / Real Estate Romance Pitch',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `Polished dating profiles quickly pivot from romance to pitching off-plan crypto or high-yield trading schemes.`,
            howToProtectYourself: `Keep romance and financial investments 100% separate.`,
          },
        ],
        assetAndLegalProtectionNote: `Ensure all leases, bank accounts, and property holdings in ${name} comply with local civil and expat inheritance registries.`,
      };

    case 'east_asia':
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Polite, Ritualized & Relationship-Milestone Courtship',
        courtshipPace: 'Structured 3-date progression leading to an explicit exclusivity confession',
        ageGapNorms: 'Moderate age gaps (5–12 years) are common; neat presentation and cultural respect are essential',
        billSplittingNorm: 'First date is usually covered by the inviter, or split gracefully ("1st round dinner / 2nd round café")',
        popularAppsAndVenues: `Bumble, Pairs/Tinder, language exchange cafés, hiking/running clubs, and izakayas/bistros in ${city}`,
        datingStyleOverview: `Dating in ${name} is refined, courteous, and follows clear cultural milestones. Unlike Western casual dating where exclusivity can remain ambiguous for months, couples in ${name} typically go on 3–4 dates before having an explicit conversation ("confession") to become an official couple.`,
        partnerExpectations: [
          {
            dimension: 'Defined Exclusivity',
            headline: 'Clear Transition from Dating to Official Couple',
            detail: `After 3–5 good dates in ${city}, it is customary to explicitly ask to be exclusive partners rather than leaving the relationship status vague.`,
          },
          {
            dimension: 'Impeccable Etiquette & Punctuality',
            headline: 'Being On Time & Respecting Social Harmony',
            detail: `Arriving 5 minutes early, wearing clean smart-casual attire (plus neat socks if removing shoes at traditional restaurants!), and speaking softly in public are essential.`,
          },
          {
            dimension: 'Balanced Reciprocity',
            headline: 'You Cover Dinner, They Cover Coffee or Dessert',
            detail: `If you pay for dinner in ${city}, your date will often insist on paying for the second venue (coffee, dessert, or drinks) to maintain balanced reciprocity.`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `Planning dates several days or a week in advance and exchanging polite daily messages on LINE / KakaoTalk / WhatsApp.`,
            notNormalRedFlag: `A stranger or app match leading you into an unmarked upstairs bar in an entertainment alley that charges exorbitant cover/seating fees.`,
            contextNote: `Always choose ground-floor or well-reviewed restaurants on Google Maps / Tabelog.`,
          },
          {
            completelyNormal: `Minimal public displays of affection (rarely kissing in public transit or busy streets).`,
            notNormalRedFlag: `Pushing you to invest in online forex/crypto platforms before or shortly after meeting.`,
            contextNote: `Online investment romance scams exist on apps everywhere—verify in person early.`,
          },
        ],
        dosList: [
          `Be punctual (arrive 5 minutes early) and dress in crisp, understated smart-casual attire.`,
          `Wear clean, intact socks in case your restaurant in ${city} has traditional tatami/floor seating.`,
          `Respect personal space and keep public displays of affection subtle.`,
          `Learn basic local phrases and table manners in ${country.language}.`,
        ],
        dontsList: [
          `Never follow street touts or unknown app matches into unmarked upstairs bars in nightlife districts.`,
          `Don't be loud on public transit or in quiet restaurants.`,
          `Don't assume exclusivity without having a clear, respectful conversation around date 3 or 4.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'Unmarked Nightlife Bar Cover-Charge Trap ("Bottakuri")',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `A street tout or app match guides you to a tiny upstairs bar where hidden "seating, table, and hostess charges" turn two drinks into a $500+ bill.`,
            howToProtectYourself: `Only visit restaurants and bars that you look up yourself on Google Maps with hundreds of verified reviews.`,
          },
        ],
        assetAndLegalProtectionNote: `Banking and property regulations in ${name} are highly transparent and rule-based; keep personal accounts in your own name.`,
      };

    default:
      return {
        countryId: country.id,
        countryName: name,
        culturalArchetype: 'Warm, Community-Oriented & Respectful Courtship',
        courtshipPace: 'Balanced, conversational pace centered around shared activities and social warmth',
        ageGapNorms: 'Age gaps of 5–15 years are common when built on mutual respect and shared lifestyle',
        billSplittingNorm: 'The person who invites typically offers to pay, with flexible reciprocity over time',
        popularAppsAndVenues: `Bumble, Hinge, Tinder, InterNations, golf/tennis/yacht clubs, and neighborhood bistros in ${city}`,
        datingStyleOverview: `Social and romantic life in ${name} is welcoming, community-minded, and centered around shared outdoor activities, dining, and cultural events in ${city}. Expats who engage with local hobby clubs, volunteer groups, and community meetups build genuine relationships quickly while avoiding tourist-zone pitfalls.`,
        partnerExpectations: [
          {
            dimension: 'Respect & Sincerity',
            headline: 'Authentic Interest in Local Culture & People',
            detail: `Partners in ${name} appreciate expats who treat locals as equals, learn local customs, and communicate intentions honestly.`,
          },
          {
            dimension: 'Social & Family Courtesy',
            headline: 'Warm Manners & Community Reputation',
            detail: `In ${city}, word travels fast within both expat and local circles—being a courteous, reliable partner builds a great reputation.`,
          },
          {
            dimension: 'Financial Boundaries',
            headline: 'Generous Hosting with Clear Personal Boundaries',
            detail: `Paying for dinner dates is a warm gesture, while keeping personal retirement savings and property accounts strictly separate is standard wisdom.`,
          },
        ],
        normalVsNotNormal: [
          {
            completelyNormal: `Meeting for daytime coffee, coastal walks, or dinner at reputable restaurants in ${city}.`,
            notNormalRedFlag: `Requests for emergency cash loans, visa sponsorship fees, or medical transfers within weeks of meeting.`,
            contextNote: `Never mix early dating with cash loans or remittances.`,
          },
          {
            completelyNormal: `Gradually meeting each other's friends and social circles over the first few months.`,
            notNormalRedFlag: `Secrecy about their daily life or pressure to invest in unregulated business or property deals.`,
            contextNote: `Transparency and daytime socializing are the best indicators of sincerity.`,
          },
        ],
        dosList: [
          `Choose well-known, well-lit cafés and restaurants in ${city} for your first several dates.`,
          `Join expat and local clubs (hiking, sailing, golf, language exchange) to meet people organically.`,
          `Keep clear boundaries between dating and your retirement finances.`,
          `Use a quick video call to verify online matches before meeting in person.`,
        ],
        dontsList: [
          `Never send money to someone you met online or have only dated for a short time.`,
          `Don't display excessive wealth or discuss your total retirement net worth with new acquaintances.`,
          `Don't sign property deeds, leases, or business loans in a new partner's name.`,
        ],
        scamPreventionTips: [
          {
            scamName: 'Early-Stage Emergency Cash / Medical Bill Request',
            riskLevel: 'Moderate Vigilance',
            howItWorks: `A new romantic interest fabricates a sudden family crisis, rent shortfall, or medical bill to test if you will hand over cash.`,
            howToProtectYourself: `Maintain a firm personal policy against lending or gifting cash in dating relationships.`,
          },
          {
            scamName: 'Unverified Online Romance & Crypto Investment Lures',
            riskLevel: 'Standard Precaution',
            howItWorks: `Fake profiles on dating apps try to keep conversations online for weeks while steering you toward investment schemes.`,
            howToProtectYourself: `Meet in person for a simple coffee in ${city} within a week of matching, and never invest via links sent by a date.`,
          },
        ],
        assetAndLegalProtectionNote: `Always keep your retirement accounts, visa deposits, and property titles in ${name} strictly in your own name, and consult an independent legal advisor before cohabitating.`,
      };
  }
}

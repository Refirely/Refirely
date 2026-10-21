import { Country, PreRetirementFaqItem } from '../types';

/**
 * Country-specific pre-retirement hurdles and FAQ answers.
 * Provides concrete guidance on banking, tax residency, language barriers, healthcare, and rental logistics.
 */
export const COUNTRY_SPECIFIC_FAQS: Record<string, PreRetirementFaqItem[]> = {
  portugal: [
    {
      id: 'pt-banking-account',
      question: 'How do I open a Portuguese bank account before or during my D7 visa application?',
      category: 'banking',
      categoryLabel: 'Banking & Money',
      hurdleSeverity: 'Moderate',
      shortSummary: 'You must first secure a Portuguese Tax Number (NIF) and fiscal representative before opening an account at institutions like Millennium BCP, Novo Banco, or ActivoBank.',
      detailedAnswer: 'Opening a local account is a mandatory prerequisite for Portugal’s D7 passive income visa, as consulates require proof of funds deposited in a Portuguese institution (typically €10,000–€30,000 as a 12-month living buffer). Because you cannot open an account without a Portuguese Número de Identificação Fiscal (NIF), foreign applicants typically hire an online fiscal representation service (e.g., Bordr or a local solicitor) to obtain an NIF remotely. Once the NIF is assigned, you can open an account remotely or during a scouting visit. Note for US Citizens: Under FATCA, banks require IRS Form W-9 and your US Social Security Number.',
      actionableChecklist: [
        'Obtain a Portuguese NIF (Tax Number) with fiscal representation before booking bank appointments',
        'Gather certified proof of income/pension (translated or apostilled if required by the bank)',
        'Have proof of address from your home country (utility bill dated within 90 days)',
        'US citizens: expect FATCA compliance forms (W-9) and proof of taxpayer identification',
        'Fund the account via Wise or OFX to lock in competitive mid-market EUR/USD exchange rates'
      ],
      keyAgenciesOrForms: ['Autoridade Tributária (Finanças)', 'IRS Form W-9 (FATCA)', 'Millennium BCP / Novo Banco / ActivoBank'],
      estimatedResolutionTime: '2 to 4 weeks'
    },
    {
      id: 'pt-tax-residency',
      question: 'How does tax residency work in Portugal, and what happened after the NHR tax regime changed?',
      category: 'taxes',
      categoryLabel: 'Taxes & Residency',
      hurdleSeverity: 'High',
      shortSummary: 'You become a tax resident after spending 183 days in Portugal (or holding a permanent abode). The classic NHR closed to new entrants in 2024, replaced by the targeted IFICI+ regime; pensions are taxed under progressive rates unless covered by double tax treaties.',
      detailedAnswer: 'You become tax resident in Portugal if you spend more than 183 days in a 12-month period in Portugal or maintain a habitual residence that implies an intention to reside permanently. Portugal historically offered the Non-Habitual Resident (NHR) 10% flat pension tax, which was phased out for standard retirees starting January 1, 2024. New arrivals now fall under the standard Portuguese progressive tax scale (14.5% up to 48%), though existing bilateral Double Taxation Treaties (DTT) with over 75 countries (including the US, UK, and Canada) protect against double taxation. US citizens can utilize the Foreign Tax Credit (FTC) to offset Portuguese taxes against US liabilities. Capital gains from real estate abroad and dividends are subject to specific treaty articles.',
      actionableChecklist: [
        'Track physical days in Portugal rigorously using an entry log or passport stamps',
        'Consult a cross-border international tax CPA familiar with the US-Portugal or UK-Portugal tax treaty before arriving',
        'Remember that US citizens must still file annual Form 1040, FinCEN 114 (FBAR) if aggregate foreign accounts exceed $10,000, and IRS Form 8938 (FATCA)',
        'Register with the Portal das Finanças to monitor your Portuguese tax status once residency is granted'
      ],
      keyAgenciesOrForms: ['Portal das Finanças', 'FinCEN Form 114 (FBAR)', 'IRS Form 8938', 'Model 3 (Portuguese IRS)'],
      estimatedResolutionTime: 'Consultation prior to moving; annual filing in April–June'
    },
    {
      id: 'pt-language-barrier',
      question: 'How significant is the language barrier for healthcare, daily life, and government paperwork in Portugal?',
      category: 'language',
      categoryLabel: 'Language & Bureaucracy',
      hurdleSeverity: 'Moderate',
      shortSummary: 'English is widely spoken in the Algarve, Lisbon, and private hospitals, but civil registry offices, AIMA (immigration), and tax offices strictly operate in European Portuguese.',
      detailedAnswer: 'Portugal ranks among the top 10 countries globally for English proficiency among non-native speakers, particularly among individuals under 45 and in tourist/expat corridors like Cascais, Porto, and the southern Algarve. Most doctors and specialists in private hospital networks (e.g., CUF, Hospital da Luz) speak fluent English. However, public institutions—including AIMA (Agência para a Integração, Migrações e Asilo), local parish councils (Junta de Freguesia), and municipal tax offices—conduct all official business exclusively in European Portuguese. Using a licensed *solicitador* (legal fixer) or certified translator for official appointments prevents costly paperwork delays.',
      actionableChecklist: [
        'Hire an accredited English-speaking immigration attorney or solicitor for AIMA appointments',
        'Learn European Portuguese pronunciation rather than Brazilian Portuguese, as vowels are swallowed differently in Continental speech',
        'Request bilingual medical summaries or utilize private clinics with international patient desks',
        'Join municipal Portuguese as a Foreign Language (PLA) subsidized classes once your residency card arrives'
      ],
      keyAgenciesOrForms: ['AIMA', 'Junta de Freguesia (Atestado de Residência)', 'Instituto Camões (PLA Courses)'],
      estimatedResolutionTime: 'Immediate reliance on translators; 6–12 months for conversational baseline'
    },
    {
      id: 'pt-healthcare-medicare',
      question: 'Can I use US Medicare in Portugal, and how do I access the public SNS vs private insurance?',
      category: 'healthcare',
      categoryLabel: 'Healthcare & Prescriptions',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Medicare does not pay for healthcare outside the United States. You must carry private international/local health insurance for visa approval, then register for Portugal’s public SNS once resident.',
      detailedAnswer: 'Neither US Medicare Part A nor Part B covers medical treatments outside the 50 US states and territories. For your initial visa application, you must purchase private health insurance with a minimum of €30,000 medical evacuation and repatriation coverage. Once your resident card (Título de Residência) is issued by AIMA, you can visit your local public health center (Centro de Saúde) with your address certificate (Atestado da Junta) to receive your SNS user number (Número de Utente). This unlocks heavily subsidized care under the Serviço Nacional de Saúde (SNS). However, most retirees keep a private Portuguese policy (e.g., Medis, Multicare, or AdvanceCare at $70–$140/mo) for zero-wait access to specialists and English-fluent doctors.',
      actionableChecklist: [
        'Do not cancel Medicare Part B if you intend to ever return to the US, to avoid permanent late enrollment penalty surcharges',
        'Carry a 90-day supply of essential prescription medications in original labeled bottles with doctor’s chemical prescription',
        'Purchase compliant private insurance (Allianz, Medis, Cigna Global, or GeoBlue) for your consulate appointment',
        'Register for your Número de Utente at your local Centro de Saúde as soon as your residence card is in hand'
      ],
      keyAgenciesOrForms: ['Serviço Nacional de Saúde (SNS)', 'Centro de Saúde', 'Número de Utente', 'Private networks (CUF, Luz)'],
      estimatedResolutionTime: 'Private coverage instant; SNS registration within 30 days of receiving Título'
    },
    {
      id: 'pt-housing-rental',
      question: 'Why do Portuguese landlords ask for a fiador (guarantor), and how can expat retirees bypass this?',
      category: 'housing',
      categoryLabel: 'Housing & Settling In',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Portuguese leases traditionally require a local Portuguese guarantor. Retirees bypass this by offering 3 to 6 months of rent in advance or obtaining a bank guarantee.',
      detailedAnswer: 'Because Portuguese tenant protection laws make eviction difficult, landlords routinely demand a *fiador* (a Portuguese resident with local tax returns who guarantees the rent). As an arriving expat without local credit history, your most effective negotiation tool is offering 3 to 6 months of prepaid rent upfront or a refundable deposit. Ensure that your rental contract is officially registered on the Finanças portal (Contrato com comprovativo de registo no Portal das Finanças), as immigration authorities (AIMA) and consulates strictly reject informal or unrecorded lease agreements.',
      actionableChecklist: [
        'Never sign a lease without ensuring the landlord registers it on the Autoridade Tributária portal and provides the official registered stamp',
        'Budget for 2 months rent deposit + 2 to 4 months prepaid rent in lieu of a Portuguese fiador',
        'Inspect heating and insulation: older Portuguese apartments frequently lack central heating and develop winter dampness',
        'Rent for at least 12 months in your chosen region before considering buying property to experience winter weather'
      ],
      keyAgenciesOrForms: ['Portal das Finanças (Registo de Contratos de Arrendamento)', 'Caderneta Predial (Property Tax Sheet)'],
      estimatedResolutionTime: '3 to 6 weeks for property search and contract registration'
    }
  ],

  spain: [
    {
      id: 'es-banking-nie',
      question: 'How do I open a Spanish bank account, and what is the difference between a resident and non-resident account?',
      category: 'banking',
      categoryLabel: 'Banking & Money',
      hurdleSeverity: 'Moderate',
      shortSummary: 'You must obtain a Número de Identidad de Extranjero (NIE). You initially open a "Cuenta No Residente" with passport and NIE, which later converts to a resident account once your TIE card is issued.',
      detailedAnswer: 'In Spain, you cannot rent an apartment, set up electricity, or complete immigration filings without an NIE (tax identification number). Major banks like Banco Sabadell, CaixaBank, and BBVA allow foreigners to open non-resident accounts (*cuenta para no residentes*). Once your Non-Lucrative Visa (NLV) is approved and you receive your physical biometric residence card (TIE), you must visit your bank branch to convert the account into a resident account; otherwise, non-resident accounts incur hefty biannual maintenance and anti-money laundering certification fees. FATCA forms and evidence of pension origins are mandatory.',
      actionableChecklist: [
        'Apply for your NIE at the Spanish consulate in your home country or upon arrival via the National Police',
        'Open an account at an expat-friendly bank (e.g., Sabadell Key Account or CaixaBank HolaBank) offering English digital interfaces',
        'Update your banking status from non-resident to resident within 30 days of receiving your physical TIE card',
        'Use transfer platforms like Wise or Revolut to avoid Spanish interbank incoming wire fees'
      ],
      keyAgenciesOrForms: ['Comisaría General de Extranjería (NIE/TIE)', 'Banco Sabadell / CaixaBank / BBVA', 'Modelo 790 Codigo 012'],
      estimatedResolutionTime: '2 to 3 weeks'
    },
    {
      id: 'es-tax-residency',
      question: 'Will Spain tax my worldwide retirement pensions, and what about the Spanish Wealth Tax (Patrimonio)?',
      category: 'taxes',
      categoryLabel: 'Taxes & Residency',
      hurdleSeverity: 'High',
      shortSummary: 'Residing in Spain for >183 days makes you a worldwide tax resident. Government pensions (civil service, military) remain taxable only in the home country, while private pensions/401(k) are taxable in Spain under progressive rates.',
      detailedAnswer: 'Under Spanish law, living in Spain for more than 183 days in a calendar year triggers worldwide tax residency (IRPF). The Spain-US / Spain-UK Double Tax Treaty provides a crucial distinction: government-service pensions (e.g., US federal civil service, military retirement, UK government service) are taxed exclusively by the source country, though Spain uses the amount to calculate the progressive rate bracket. Private pensions, 401(k), IRAs, and Social Security are taxable in Spain as general income. Regarding Spain’s Wealth Tax (*Impuesto sobre el Patrimonio*) and Solidarity Tax: autonomous communities like Andalusia and Madrid offer a 100% regional rebate, effectively zeroing out the regional wealth tax for assets up to €3M.',
      actionableChecklist: [
        'Strategically choose your autonomous region: Andalusia (Costa del Sol, Seville) and Madrid offer generous wealth tax allowances',
        'File Modelo 720 (declaration of overseas assets exceeding €50,000 in accounts, real estate, or securities) before March 31 of your second year',
        'Engage a qualified Spanish *asesor fiscal* (tax accountant) before relocating to structure pension drawdowns and asset distributions',
        'Ensure you claim foreign tax credits in your home jurisdiction to eliminate duplicate levies'
      ],
      keyAgenciesOrForms: ['Agencia Tributaria (Hacienda)', 'Modelo 720 (Overseas Assets)', 'Modelo 100 (IRPF Annual Return)'],
      estimatedResolutionTime: 'Pre-move planning required; annual declaration April to June'
    },
    {
      id: 'es-language-gestor',
      question: 'Do I need a gestor (administrative agent) to navigate Spanish paperwork if I do not speak fluent Spanish?',
      category: 'language',
      categoryLabel: 'Language & Bureaucracy',
      hurdleSeverity: 'High',
      shortSummary: 'Yes, hiring a licensed "Gestor Administrativo" is virtually indispensable for securing police appointments (Citas Previas), padrón registration, and vehicle or healthcare paperwork.',
      detailedAnswer: 'Spanish bureaucracy is notorious for its online appointment bottleneck (*Cita Previa*) for immigration cards (TIE) and local municipality registrations (*Empadronamiento*). Civil servants in Extranjería offices and town halls rarely speak English and are legally required to conduct administrative interviews in Castilian Spanish. A *Gestor Administrativo* is a state-licensed professional with official access to digital portals, certified to submit legal documents, book priority appointments, and interface with town halls on your behalf.',
      actionableChecklist: [
        'Budget €300–€600 for a reputable English-speaking gestor to manage your town hall padrón and police fingerprinting (huellas)',
        'Have all foreign documents apostilled and translated by an official Spanish *Traductor Jurado* (sworn translator)',
        'Carry physical photocopies of every single document, passport, and payment receipt (Modelo 790) to every in-person appointment',
        'Enroll in language classes: Spanish immersion is expected for everyday social life, dining, and tradespeople outside resort zones'
      ],
      keyAgenciesOrForms: ['Colegio de Gestores Administrativos', 'Extranjería (Cita Previa)', 'Ayuntamiento (Certificado de Empadronamiento)'],
      estimatedResolutionTime: 'Ongoing support during the first 6 months'
    },
    {
      id: 'es-healthcare-convenio',
      question: 'How do I bridge the gap between private visa insurance and Spain’s public healthcare (Convenio Especial)?',
      category: 'healthcare',
      categoryLabel: 'Healthcare & Prescriptions',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Non-Lucrative Visa holders must maintain zero-copay private health insurance for year one. After 12 months of continuous residency, you can buy into the public health system via the Convenio Especial.',
      detailedAnswer: 'For Non-Lucrative Visa approval, consulates mandate a comprehensive private insurance policy from an insurer licensed in Spain (e.g., Sanitas, Adeslas, DKV, or Asisa) with zero copays, zero deductibles, and no waiting periods. While Medicare is non-functional in Spain, Spanish private medicine is world-class and costs roughly €90–€180/month for seniors. Once you have lived in Spain legally for at least one continuous year and have your padrón registered, you become eligible for the *Convenio Especial*, a program allowing foreign retirees to pay roughly €60/month (under 65) or €157/month (65+) into the state public system (SNS) to cover all medical care without pre-existing condition exclusions.',
      actionableChecklist: [
        'Select a zero-copay policy from Sanitas or Adeslas specifically drafted for the Spanish consulate NLV requirement',
        'Maintain continuous *padrón* registration in your municipality, as 12 months on the padrón is mandatory for Convenio Especial qualification',
        'Bring detailed medical histories and physician notes translated into Spanish for any chronic health conditions',
        'Local Spanish pharmacies can fulfill prescriptions using European chemical names (principio activo)'
      ],
      keyAgenciesOrForms: ['Sistema Nacional de Salud (SNS)', 'Convenio Especial de Prestación de Asistencia Sanitaria', 'Sanitas / Adeslas'],
      estimatedResolutionTime: 'Private coverage immediately; Convenio Especial eligible after 12 months'
    },
    {
      id: 'es-housing-padron',
      question: 'What is the "Padrón" and why is it the foundation of all expat legal life in Spain?',
      category: 'housing',
      categoryLabel: 'Housing & Settling In',
      hurdleSeverity: 'Low',
      shortSummary: 'The Empadronamiento is the local municipal registry of residents. You cannot get your TIE card, register for healthcare, buy a car, or enroll in classes without it.',
      detailedAnswer: 'Within days of leasing an apartment in Spain, you must visit the local Town Hall (*Ayuntamiento*) with your signed lease contract (minimum 6 months or 1 year) and the landlord’s authorization to obtain a *Certificado de Empadronamiento* (colloquially called the *padrón*). Spanish authorities consider this the only valid proof of your habitual address. Without a padrón certificate issued within the last 90 days, the National Police will immediately cancel your biometric TIE card appointment.',
      actionableChecklist: [
        'Ensure your rental contract explicitly grants you permission to register on the municipal padrón',
        'Obtain 2 to 3 original stamped copies of your padrón certificate from the Ayuntamiento',
        'Remember that padrón certificates are legally valid for only 3 months from issuance for immigration procedures',
        'Always rent for your first year in Spain to test regional climates before buying property'
      ],
      keyAgenciesOrForms: ['Ayuntamiento (Oficina de Atención Ciudadana)', 'Certificado de Empadronamiento', 'Contrato de Arrendamiento'],
      estimatedResolutionTime: '1 to 5 business days depending on town hall appointment availability'
    }
  ],

  thailand: [
    {
      id: 'th-banking-retirement',
      question: 'How do I open a Thai bank account and satisfy the 800,000 THB seasoned deposit requirement?',
      category: 'banking',
      categoryLabel: 'Banking & Money',
      hurdleSeverity: 'Moderate',
      shortSummary: 'You must open an account at Bangkok Bank or Kasikorn Bank. For the Non-O Retirement Visa, you must keep 800,000 THB (~$22,500 USD) seasoned in the account for 2 months prior to application and 3 months after.',
      detailedAnswer: 'Opening an account without a long-term visa can be challenging in Thailand due to tight Anti-Money Laundering (AML) regulations. Foreign retirees typically open an account during a 90-day Non-O entry or with the assistance of a licensed Thai visa agency at major Bangkok Bank, Kasikorn Bank (K-Bank), or SCB branches. The Thai Immigration Bureau enforces the financial rule strictly: either an ongoing monthly pension remittance of at least 65,000 THB (~$1,850 USD) or a lump sum of 800,000 THB deposited from an overseas source into your Thai bank book and seasoned untouched for 60 days before visa renewal, and remaining above 400,000 THB for the rest of the year.',
      actionableChecklist: [
        'Transfer funds via international SWIFT or Wise with the transaction code showing "International Funds Transfer" to secure a bank foreign exchange certificate (FET)',
        'Keep your physical blue bank passbook updated at branch automatic updating machines weekly',
        'Obtain a formal letter from the bank branch manager confirming account balance and 2-month seasoning 24 hours prior to your Immigration appointment',
        'Enable mobile banking (e.g., K-Plus or Bangkok Bank Bualuang) for QR-code payments (PromptPay), which is the primary payment method across Thailand'
      ],
      keyAgenciesOrForms: ['Bangkok Bank / Kasikorn Bank', 'Thai Immigration Bureau (Tor Mor 7)', 'Bank Seasoning Statement Letter'],
      estimatedResolutionTime: '2 to 5 business days once in Thailand'
    },
    {
      id: 'th-tax-remittance-rule',
      question: 'What is the new Thai Revenue Department rule regarding foreign income remittances for retirees?',
      category: 'taxes',
      categoryLabel: 'Taxes & Residency',
      hurdleSeverity: 'High',
      shortSummary: 'Effective January 1, 2024, Thai tax residents (>180 days) remitting foreign income earned in the same year into Thailand may face local taxation, unless protected by Double Taxation Agreements (DTTs).',
      detailedAnswer: 'Historically, Thailand only taxed foreign income remitted in the exact same calendar year it was earned, allowing retirees to bring in past-year savings tax-free. Under Departmental Instruction No. Paw 161/2566 (effective 2024), any tax resident spending 180+ days in Thailand who brings foreign income into Thailand is theoretically subject to Thai Personal Income Tax (PIT). Crucially, retirees living on Social Security, government pensions, or savings accumulated prior to moving can utilize Double Taxation Treaties (DTT). For example, under Article 20 of the US-Thailand Tax Treaty, pensions and Social Security paid by the US government are generally taxable only in the US. However, capital gains and new investment income transferred to Thailand require careful tax accounting.',
      actionableChecklist: [
        'Distinguish between prior-year capital savings and current-year income when making remittances to Thailand',
        'Maintain detailed financial ledgers proving that remitted funds originate from pre-move accumulated capital or tax-exempt pensions under DTT',
        'Consult an international tax specialist in Bangkok or Chiang Mai prior to executing large transfers for real estate or living expenses',
        'US citizens still file annual Form 1040 and FinCEN 114 (FBAR) for any Thai bank balance exceeding $10,000 USD'
      ],
      keyAgenciesOrForms: ['Thai Revenue Department (Paw 161/2566 & Paw 162/2566)', 'US-Thailand Double Tax Agreement', 'Thai Tax ID Number (TIN)'],
      estimatedResolutionTime: '1 to 2 months for tax profile structuring'
    },
    {
      id: 'th-language-bureaucracy',
      question: 'Can I get by with English in Thailand, and how do I handle mandatory 90-day reporting and TM30 rules?',
      category: 'language',
      categoryLabel: 'Language & Bureaucracy',
      hurdleSeverity: 'Moderate',
      shortSummary: 'English is fluent in top international hospitals and tourist hubs, but Immigration Bureau interactions (TM30 and 90-day reports) are bureaucratic and best managed through online portals or local visa agencies.',
      detailedAnswer: 'In destinations like Bangkok, Chiang Mai, Phuket, and Hua Hin, you can manage daily life comfortably in English. Supermarkets (Tops, Villa Market), private hospitals, and expat restaurants cater extensively to foreigners. However, Thai immigration laws require two strict reporting rituals: the TM30 (notification of residence address filed by your landlord within 24 hours of arrival) and the 90-Day Report (notifying immigration of your ongoing stay). Missing a 90-day report incurs a 2,000 THB fine. While both can be submitted online via the Immigration Bureau e-services portal, technical glitches are frequent, leading many retirees to pay a local visa agency ~500–1,000 THB ($15–$30) to handle queues.',
      actionableChecklist: [
        'Obtain a signed TM30 receipt slip from your landlord immediately upon moving into any condo or house',
        'Mark your calendar 15 days before every 90-day reporting deadline to submit online or through an agent',
        'Learn basic Thai numbers, polite particles (khrap/kha), and food vocabulary to build warm relationships with local vendors',
        'Use Google Translate’s camera feature for reading utility bills (PEA electricity and MWA water)'
      ],
      keyAgenciesOrForms: ['Thai Immigration Bureau', 'TM30 Address Notification', 'TM47 (90-Day Report Form)'],
      estimatedResolutionTime: 'Immediate adaptation with agency backup'
    },
    {
      id: 'th-healthcare-insurance',
      question: 'What are the mandatory health insurance requirements for Thai retirement visas, and how good is local healthcare?',
      category: 'healthcare',
      categoryLabel: 'Healthcare & Prescriptions',
      hurdleSeverity: 'Moderate',
      shortSummary: 'The Non-OA visa mandates approved health insurance covering 3,000,000 THB (~$85,000 USD) inpatient care. The Non-O visa does not currently require mandatory insurance, though comprehensive private coverage is strongly advised.',
      detailedAnswer: 'Thailand is the medical tourism hub of Asia, home to JCI-accredited hospitals like Bumrungrad International and Bangkok Hospital where consultations cost $30–$60 and diagnostic scans are 80% cheaper than in the US. However, visa rules differ: the Non-OA visa (applied for in your home country) legally requires certified insurance from the Thai General Insurance Association (TGIA) portal with minimum 3M THB coverage. In contrast, the Non-O visa (applied for domestically inside Thailand) currently does not impose this statutory insurance mandate. Prescription medications are widely accessible over-the-counter at reputable pharmacies (e.g., Fascino) without doctor appointments, except for controlled narcotics.',
      actionableChecklist: [
        'If over age 70, consider applying for the Non-O visa inside Thailand to avoid age-based insurance premium spikes or exclusions required by the Non-OA visa',
        'Keep a local emergency card in Thai listing your blood type, chronic allergies, and private hospital choice',
        'Maintain a private inpatient deductible policy (e.g., LMG, Pacific Cross, or Cigna Global) to guard against catastrophic medical events',
        'Bring an international prescription for any controlled medications (e.g., sleep aids, ADHD medications) to clear customs inspection at Suvarnabhumi'
      ],
      keyAgenciesOrForms: ['Thai General Insurance Association (TGIA)', 'Bumrungrad / Bangkok Hospital Network', 'Thai FDA (Controlled Drugs)'],
      estimatedResolutionTime: 'Policy issuance within 48 hours'
    },
    {
      id: 'th-housing-condos',
      question: 'Can foreigners buy property in Thailand, and what are the rules for renting a condo?',
      category: 'housing',
      categoryLabel: 'Housing & Settling In',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Foreigners can own condominiums freehold under the 49% foreign quota rule, but cannot own land freehold. Renting a modern condo is simple, requiring 2 months deposit and 1 month advance rent.',
      detailedAnswer: 'Under the Thai Condominium Act, foreigners may legally own up to 49% of the total saleable area of a condominium building freehold in their own individual name, provided purchase funds were transferred into Thailand as foreign currency with a Foreign Exchange Transaction (FET) certificate. Foreigners cannot own freehold land. For retirees, leasing a modern, fully furnished condo (with pool, gym, 24/7 security) is by far the most economical and stress-free option. Rental contracts are typically 12 months long and require two months security deposit plus the first month’s rent in advance.',
      actionableChecklist: [
        'Rent for at least 12 months before considering purchasing real estate to experience seasonal burning season (smog in northern Thailand Feb–April) and monsoon rains',
        'Ensure the condominium management office (*Juristic Office*) supports foreign tenant TM30 filings',
        'Verify electricity rates: ensure you are billed at the government rate (~4–5 THB per unit) rather than inflated landlord rates',
        'Take detailed move-in photos and video of all furnished items and air conditioning units'
      ],
      keyAgenciesOrForms: ['Land Department (Krom Thidin)', 'Condominium Juristic Person', 'Foreign Exchange Transaction (FET) Form'],
      estimatedResolutionTime: '1 to 2 weeks for condo search and move-in'
    }
  ],

  'costa-rica': [
    {
      id: 'cr-banking-dimex',
      question: 'How do I open a bank account in Costa Rica as a foreign retiree, and what is a DIMEX card?',
      category: 'banking',
      categoryLabel: 'Banking & Money',
      hurdleSeverity: 'Moderate',
      shortSummary: 'You need your DIMEX (Documento de Identidad Migratoria para Extranjeros) or temporary expediente to open a full account at state banks like BCR or private banks like BAC Credomatic.',
      detailedAnswer: 'Costa Rican banks follow stringent Know Your Customer (KYC) and anti-money laundering regulations. As a tourist, you can only open limited-tier accounts (*cuenta simplificada*) with low deposit caps. Once you submit your Pensionado residency application, Migración issues an *expediente* file number, and upon approval, you receive your biometric DIMEX residency card. With a DIMEX, opening a dual-currency (USD and Costa Rican Colones) account at Banco de Costa Rica (BCR), Banco Nacional (BNCR), or BAC Credomatic is straightforward. Banks will require a certified letter verifying your minimum $1,000 USD monthly pension.',
      actionableChecklist: [
        'Open a dual-currency (USD/CRC) account so you can hold US dollars and pay local utilities in colones without repeated conversion losses',
        'Carry an official letter of pension certification authenticated by the issuing agency and apostilled',
        'Use SINPE Móvil (Costa Rica’s ubiquitous instant smartphone bank transfer protocol) for daily payments at farmer markets and tradespeople',
        'Keep US bank accounts with Charles Schwab or Fidelity for zero-fee international ATM withdrawals at BCR ATMs'
      ],
      keyAgenciesOrForms: ['Dirección General de Migración y Extranjería (DIMEX)', 'Banco de Costa Rica (BCR) / BAC Credomatic', 'SINPE Móvil'],
      estimatedResolutionTime: '2 to 3 weeks after receiving DIMEX'
    },
    {
      id: 'cr-tax-territorial',
      question: 'Is it true that Costa Rica has a territorial tax system and does not tax foreign retirement pensions?',
      category: 'taxes',
      categoryLabel: 'Taxes & Residency',
      hurdleSeverity: 'Low',
      shortSummary: 'Yes. Costa Rica operates a pure territorial tax system: income earned outside Costa Rica (such as foreign pensions, 401(k) distributions, and US dividends) is 100% tax-free in Costa Rica.',
      detailedAnswer: 'One of Costa Rica’s greatest fiscal advantages for retirees is its strict territorial tax regime. Under Article 1 of the Costa Rican Income Tax Law, only income generated from goods, assets, or services rendered within the geographical territory of Costa Rica is subject to taxation. Therefore, US Social Security, private company pensions, UK state pensions, overseas brokerage portfolios, and rental income from properties outside Costa Rica are completely exempt from Costa Rican income tax. However, US citizens remain subject to US worldwide taxation and must continue filing IRS Form 1040 and FBAR FinCEN 114 annually.',
      actionableChecklist: [
        'Retain documentation confirming that your income sources originate strictly outside Costa Rican territory',
        'Do not engage in local salaried employment, as Pensionado visa status prohibits working for a Costa Rican employer',
        'File your US expat taxes annually: claim standard deductions or foreign housing considerations as applicable',
        'Be aware of Costa Rica’s annual municipal property tax (extremely low, typically 0.25% of assessed fiscal value)'
      ],
      keyAgenciesOrForms: ['Ministerio de Hacienda (Tributación Directa)', 'Ley de Impuesto sobre la Renta (Ley 7092)', 'IRS Form 1040 / FBAR'],
      estimatedResolutionTime: 'No local income tax declaration required for foreign pension earners'
    },
    {
      id: 'cr-language-spanish',
      question: 'Can I retire in Costa Rica without speaking fluent Spanish, and how do I navigate government offices?',
      category: 'language',
      categoryLabel: 'Language & Bureaucracy',
      hurdleSeverity: 'Moderate',
      shortSummary: 'English is widespread in tourist and expat centers (Escazú, Atenas, Guanacaste), but immigration, Caja healthcare, and municipal agencies operate strictly in Spanish.',
      detailedAnswer: 'Costa Ricans (*Ticos*) are famously warm, polite, and patient with foreigners trying to communicate. In expat strongholds like the Central Valley (Escazú, Santa Ana, Atenas, Grecia) and coastal hubs (Tamarindo, Jacó), many doctors, dentists, and bankers speak English. However, government bureaucracy at Migración, the CCSS (Caja), and the municipal *municipalidad* is conducted exclusively in Spanish. Hiring an immigration attorney or reputable bilingual relocation specialist (*tramitador*) is standard practice to navigate appointments and filings without delays.',
      actionableChecklist: [
        'Engage an accredited bilingual immigration attorney registered with the Costa Rican Bar (Colegio de Abogados)',
        'Learn essential courteous phrases: "Pura vida", "Con mucho gusto", and formal greetings before beginning any official conversation',
        'Download the WhatsApp app immediately—WhatsApp is the standard communication tool for all businesses, doctors, and utilities in Costa Rica',
        'Attend local conversational Spanish courses to integrate into neighborhood community associations (*ASADA* water boards)'
      ],
      keyAgenciesOrForms: ['Colegio de Abogados de Costa Rica', 'Dirección General de Migración', 'Local Municipalidades'],
      estimatedResolutionTime: 'Bilingual representation immediate; 6 months for day-to-day conversational ease'
    },
    {
      id: 'cr-healthcare-caja',
      question: 'Is joining the CCSS (Caja) public healthcare system mandatory for retirees in Costa Rica?',
      category: 'healthcare',
      categoryLabel: 'Healthcare & Prescriptions',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Yes, enrollment in the CCSS (Caja Costarricense de Seguro Social) is mandatory once your Pensionado residency is approved. Monthly payments are roughly 7%–10% of your reported pension.',
      detailedAnswer: 'Under Costa Rican immigration law, all approved legal residents (including Pensionados) must register with and pay monthly dues to the Caja Costarricense de Seguro Social (CCSS). The monthly contribution is calculated as a sliding percentage (typically 7%–10%) of the monthly pension income declared on your residency application (e.g., ~$70–$100/mo on a $1,000 monthly pension). The Caja covers all doctor visits, hospitalization, surgeries, and prescriptions with zero copayments. While the Caja is fantastic for emergencies and maintenance drugs, waiting lists for elective procedures can be long, so many retirees blend Caja coverage with private pay-as-you-go visits at private hospitals like CIMA or Clínica Bíblica.',
      actionableChecklist: [
        'Enroll at your local CCSS clinic (EBAIS) immediately upon receiving your DIMEX card to get your carnét',
        'Fill maintenance prescription medications at your local EBAIS pharmacy for free under your Caja coverage',
        'Budget for private out-of-pocket specialist consultations ($70–$120) at CIMA or Clínica Bíblica for rapid second opinions',
        'Keep private international catastrophic insurance if you desire medical evacuation back to North America'
      ],
      keyAgenciesOrForms: ['CCSS (Caja Costarricense de Seguro Social)', 'EBAIS (Equipos Básicos de Atención Integral)', 'Hospital CIMA / Clínica Bíblica'],
      estimatedResolutionTime: 'Enrollment takes 1 to 2 weeks after receiving DIMEX'
    },
    {
      id: 'cr-housing-renting',
      question: 'Why should I rent for a year before buying property in Costa Rica, and what are the microclimates?',
      category: 'housing',
      categoryLabel: 'Housing & Settling In',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Costa Rica has over a dozen microclimates, distinct rainy seasons, and real estate quirks. Renting for 12 months prevents buyer remorse and ensures you understand water availability and road access.',
      detailedAnswer: 'Costa Rica’s geography creates extreme microclimates within a 20-minute drive: Atenas is sunny and temperate (75°F–85°F), Heredia is cool and breezy (65°F–75°F), while Guanacaste is hot and dry (90°F+), and the South Pacific is lush and humid with intense seasonal rains (*invierno* from May to November). Furthermore, Costa Rican property law has nuances like concession beachfront land (the first 200 meters of maritime zone cannot be owned fee-simple). Renting for a year lets you experience both the green/rainy season and the dry season, test your local water board (*ASADA*) reliability, and inspect road infrastructure during heavy downpours.',
      actionableChecklist: [
        'Never purchase real estate until you have lived in the specific neighborhood through both the dry season and peak rainy season (October/November)',
        'Check water availability letter (*carta de agua*) from the local ASADA before signing any long-term lease or purchase contract',
        'Verify high-speed fiber-optic internet availability at the exact street address, as speeds vary dramatically across hillsides',
        'Use reputable bilingual real estate attorneys who will run title searches on the Registro Nacional'
      ],
      keyAgenciesOrForms: ['Registro Nacional de Costa Rica', 'ASADA (Local Water Administration)', 'Municipal Land Zoning (Plan Regulador)'],
      estimatedResolutionTime: '2 to 4 weeks for rental search; 12-month scouting phase advised'
    }
  ],

  panama: [
    {
      id: 'pa-banking-account',
      question: 'How do I open a bank account in Panama with the Pensionado Visa?',
      category: 'banking',
      categoryLabel: 'Banking & Money',
      hurdleSeverity: 'High',
      shortSummary: 'Panama has strict anti-money laundering banking standards. You need your approved visa certificate, certified bank reference letters from home, and tax returns for Banco General or Banistmo.',
      detailedAnswer: 'Because Panama is an international banking center with intense regulatory scrutiny, opening a personal bank account involves thorough document vetting. Most expat retirees open accounts at Banco General, Banistmo, or Bac Credomatic with the assistance of their immigration attorney. The US dollar is legal tender in Panama (circulating as Balboas at 1:1), which eliminates foreign currency exchange risk entirely for North American retirees. Banks require two original reference letters from your home bank, proof of your $1,000/month government or lifetime corporate pension, and tax returns.',
      actionableChecklist: [
        'Request written bank reference letters on official letterhead from your home bank before traveling to Panama',
        'Have your immigration attorney accompany you or introduce you directly to the bank’s expatriate account officer',
        'Benefit from zero exchange rate fees: Panama uses the USD for all paper bills and everyday transactions',
        'Set up online banking with token authentication for local ACH utility bill payments'
      ],
      keyAgenciesOrForms: ['Superintendencia de Bancos de Panamá (SBP)', 'Banco General / Banistmo', 'IRS Form W-9 (FATCA)'],
      estimatedResolutionTime: '2 to 4 weeks'
    },
    {
      id: 'pa-tax-pensionado-benefits',
      question: 'What are the legendary Panama Pensionado discounts and how does territorial taxation apply?',
      category: 'taxes',
      categoryLabel: 'Taxes & Residency',
      hurdleSeverity: 'Low',
      shortSummary: 'Panama operates a territorial tax system (zero tax on foreign income) and grants retirees world-famous statutory discounts (50% off movies, 25% off power/water, 15% off hospital bills).',
      detailedAnswer: 'Panama taxes only income produced inside its borders. Foreign pensions, offshore investment portfolios, and overseas annuities are 100% tax-free under Panamanian law. Moreover, Panama’s Law 6 of 1987 created the most generous retiree discount program in the world. Pensionados presenting their card are legally entitled to: 50% off movies, concerts, and sporting events; 30% off bus, train, and boat transit; 25% off domestic and international airline tickets departing Panama; 25% off monthly electric and water utility bills; 20% off doctor consultations; and 15% off hospital bills. Furthermore, new residents receive a one-time duty-free exemption on importing up to $10,000 in household goods and a tax-free vehicle import every two years.',
      actionableChecklist: [
        'Present your Pensionado visa card at restaurants, movie theaters, and clinics to automatically claim statutory discounts',
        'Take your electric (ENSA or Naturgy) and IDAAN water bills to customer service along with your Pensionado card for a 25% reduction',
        'Book international Copa Airlines flights departing Panama City at their physical ticket counter to claim your 25% discount',
        'US citizens still file annual IRS 1040 and FBAR FinCEN 114 reporting'
      ],
      keyAgenciesOrForms: ['Dirección General de Ingresos (DGI)', 'Ley 6 de 1987 (Pensionado Discounts)', 'Servicio Nacional de Migración'],
      estimatedResolutionTime: 'Discounts active immediately upon receiving Pensionado ID card'
    },
    {
      id: 'pa-language-lifestyle',
      question: 'Is English sufficient in Panama City and Boquete, and where is Spanish necessary?',
      category: 'language',
      categoryLabel: 'Language & Bureaucracy',
      hurdleSeverity: 'Low',
      shortSummary: 'English is widely spoken in the financial and medical sectors of Panama City and the mountain haven of Boquete, but Spanish is needed for government and interior towns.',
      detailedAnswer: 'Due to the historic US administration of the Panama Canal Zone, Panama has deep historical ties with the English language. In Panama City’s banking district and top hospitals (e.g., Pacifica Salud - Johns Hopkins affiliated) and in premier retirement enclaves like Boquete and Coronado, English is spoken by many professionals, doctors, and business owners. However, municipal services, transit police, local markets, and domestic contractors in rural areas speak Spanish. Learning basic conversational Spanish is warmly appreciated and will help you negotiate goods and services effectively.',
      actionableChecklist: [
        'Join established community organizations like the Boquete Community Players or Coronado Expat Club for English peer support',
        'Hire a bilingual relocation assistant or attorney for all official dealings with Migración and the Transit Authority (ATTT)',
        'Use ride-hailing apps like Uber in Panama City, which eliminates language miscommunications with taxi drivers',
        'Practice everyday Spanish for ordering groceries, speaking with building security, and communicating with repair tradespeople'
      ],
      keyAgenciesOrForms: ['Servicio Nacional de Migración', 'Autoridad del Tránsito y Transporte Terrestre (ATTT)'],
      estimatedResolutionTime: 'Smooth transition in expat hubs; basic Spanish learned within 6 months'
    },
    {
      id: 'pa-healthcare-hopkins',
      question: 'What is the quality of healthcare in Panama, and how does the Johns Hopkins affiliation work?',
      category: 'healthcare',
      categoryLabel: 'Healthcare & Prescriptions',
      hurdleSeverity: 'Low',
      shortSummary: 'Panama City boasts Hospital Pacífica Salud (affiliated with Johns Hopkins Medicine International) and Hospital Punta Pacífica, providing US-standard care at 50% to 70% lower prices.',
      detailedAnswer: 'Panama has some of the highest-rated medical facilities in Latin America. Pacífica Salud in Punta Pacífica is affiliated with Johns Hopkins Medicine International, and Hospital Nacional and Clínica San Fernando are JCI-accredited. Most senior specialists completed fellowships in the US or Europe and speak fluent English. While Medicare does not pay for services in Panama, local private health insurance plans (e.g., Blue Cross Blue Shield Panama, Worldwide Medical, or Palig) cost $100–$220/month for seniors, with rapid access to specialists. Retirees in Boquete have access to modern private clinics in nearby David (35 minutes away) such as Hospital Mae Lewis.',
      actionableChecklist: [
        'Bring thorough medical files and current prescription lists with chemical drug names to your initial physician visit',
        'Sign up for local health insurance or maintain an international private policy (GeoBlue, Cigna, or Allianz)',
        'Take advantage of the mandatory 15% to 20% Pensionado discount on medical consultations and pharmacy purchases',
        'Check pharmacy availability for specialized medications at Arrocha or Metro pharmacies'
      ],
      keyAgenciesOrForms: ['Hospital Pacífica Salud (Johns Hopkins Affiliate)', 'Hospital Mae Lewis (David)', 'Farmacias Arrocha'],
      estimatedResolutionTime: 'Immediate access upon arrival'
    },
    {
      id: 'pa-housing-renting',
      question: 'What should I know about renting in Boquete vs Coronado vs Panama City?',
      category: 'housing',
      categoryLabel: 'Housing & Settling In',
      hurdleSeverity: 'Moderate',
      shortSummary: 'Each region offers a completely different lifestyle: mountain spring-like weather in Boquete, coastal beach condos in Coronado, and cosmopolitan high-rises in Panama City.',
      detailedAnswer: 'Choosing where to live in Panama depends on your climate preference. Boquete (Chiriquí province) sits at 3,500+ feet in the highlands, offering year-round temperatures of 65°F–78°F, fresh breezes, and organic coffee farms. Coronado on the Pacific coast offers a beach resort lifestyle with warm temperatures (85°F–90°F) and golf courses, just 75 minutes from Panama City. Panama City (Avenida Balboa, San Francisco, Casco Viejo) offers high-rise skyline living, world-class dining, and proximity to major hospitals. Leases are typically 12 months with 1 month deposit and 1 month advance rent.',
      actionableChecklist: [
        'Spend a 2-week trial stay in both Boquete and the Pacific beaches to decide between highland spring vs tropical heat',
        'Ensure lease agreements stipulate who pays the building administration fee (PH maintenance fee)',
        'Verify that the property has a backup water tank (*tanque de reserva*) and backup power generator, especially in coastal or mountain areas',
        'Never purchase real estate on your first trip; rent for at least one year through both rainy and dry seasons'
      ],
      keyAgenciesOrForms: ['Junta Administradora PH (Propiedad Horizontal)', 'Registro Público de Panamá'],
      estimatedResolutionTime: '2 to 3 weeks for rental search'
    }
  ]
};

/**
 * Universal fallback FAQ generator for any country not explicitly detailed above.
 * Populates deep, factual, tailored answers addressing banking, tax residency,
 * language barriers, healthcare, and housing nuances based on empirical country metadata.
 */
export function getFaqsForCountry(country: Country): PreRetirementFaqItem[] {
  // If specific curated entries exist for this country, use them!
  if (COUNTRY_SPECIFIC_FAQS[country.id]) {
    return COUNTRY_SPECIFIC_FAQS[country.id];
  }

  // Otherwise, construct dynamic, deep country-specific FAQ items using empirical metadata
  const isTerritorial = [
    'malaysia', 'philippines', 'ecuador', 'panama', 'costa-rica',
    'nicaragua', 'paraguay', 'honduras', 'belize', 'guatemala',
    'mauritius', 'georgia', 'singapore', 'bahamas', 'el-salvador',
    'sri-lanka', 'cambodia', 'laos', 'united-arab-emirates', 'south-africa',
    'fiji', 'st-kitts-and-nevis', 'cayman-islands', 'saint-lucia',
    'grenada', 'antigua-and-barbuda', 'bermuda', 'seychelles'
  ].includes(country.id);
  const isEurope = country.region === 'Europe';
  const isAsia = country.region === 'Southeast Asia';

  return [
    {
      id: `${country.id}-banking`,
      question: `How do foreign retirees open a local bank account in ${country.name}?`,
      category: 'banking',
      categoryLabel: 'Banking & Money',
      hurdleSeverity: 'Moderate',
      shortSummary: `You will need your local tax ID/foreigner registration number, passport, proof of retirement income, and FATCA compliance documentation.`,
      detailedAnswer: `To open a retail bank account in ${country.name}, financial institutions require proof of legal presence (such as your ${country.visa.retirementVisaName}), a local tax identification number, and official proof of overseas pension or passive income exceeding ${country.currencySymbol}${country.visa.minimumIncomeUSD} USD equivalent. Due to international anti-money laundering (AML) and US FATCA regulations, expect to complete IRS Form W-9 if you are a US citizen. We recommend utilizing multi-currency accounts like Wise or Revolut for international wire transfers to minimize foreign exchange markups against the local currency (${country.currency}).`,
      actionableChecklist: [
        `Obtain your local taxpayer identification number and visa residency certificate in ${country.name}`,
        `Prepare 3 to 6 months of certified bank statements from your home country proving regular retirement income`,
        `Set up a Wise or OFX account to transfer funds into ${country.currency} without high traditional bank spreads`,
        `Keep home credit cards and bank accounts open with a reliable 2FA authentication method (physical SIM or VoIP)`
      ],
      keyAgenciesOrForms: [`Central Bank of ${country.name}`, 'IRS Form W-9 (FATCA)', 'Local Commercial Banking Bureau'],
      estimatedResolutionTime: '2 to 3 weeks'
    },
    {
      id: `${country.id}-taxes`,
      question: `What are the tax residency rules in ${country.name}, and will my foreign retirement income be taxed?`,
      category: 'taxes',
      categoryLabel: 'Taxes & Residency',
      hurdleSeverity: 'High',
      shortSummary: isTerritorial
        ? `${country.name} utilizes a territorial or preferential tax framework: foreign-source retirement pensions and overseas investment income generally enjoy full or partial exemption.`
        : `Spending 183+ days in ${country.name} generally triggers tax residency, subjecting worldwide income to local tax laws unless protected by Double Taxation Treaties.`,
      detailedAnswer: `${country.name}’s tax code defines tax residency primarily through the physical presence test (spending 183 days or more in a calendar or rolling 12-month period) or maintaining the center of vital economic interests in the country. ${country.visa.taxStatus} Double Taxation Treaties (DTTs) signed between ${country.name} and your home country provide tax credits and exemptions to prevent the same retirement income from being taxed twice. Remember that US citizens must still file annual IRS Form 1040 and submit FinCEN Form 114 (FBAR) if aggregate overseas bank balances exceed $10,000.`,
      actionableChecklist: [
        `Consult a cross-border international tax advisor prior to completing your 183rd day in ${country.name}`,
        `Review the bilateral Double Taxation Agreement between your home country and ${country.name}`,
        `Retain formal bank statements and pension remittance records to claim Foreign Tax Credits (FTC)`,
        `US Citizens: maintain compliance with annual FBAR (FinCEN 114) and FATCA (Form 8938) filings`
      ],
      keyAgenciesOrForms: [`National Tax Authority of ${country.name}`, 'Bilateral Double Tax Treaty (DTT)', 'FinCEN Form 114 (FBAR)'],
      estimatedResolutionTime: 'Annual tax filing window; pre-move consultation advised'
    },
    {
      id: `${country.id}-language`,
      question: `How steep is the language barrier in ${country.name}, and what are the tips for overcoming it?`,
      category: 'language',
      categoryLabel: 'Language & Bureaucracy',
      hurdleSeverity: country.lifestyle.englishProficiency === 'Very High' || country.lifestyle.englishProficiency === 'High' ? 'Low' : 'Moderate',
      shortSummary: `English proficiency is rated as "${country.lifestyle.englishProficiency}" in ${country.name}. While English is common in private medical hubs and expat towns, civil bureaucracy requires local language or a bilingual representative.`,
      detailedAnswer: `In ${country.name}, the primary language is ${country.language}. For everyday activities in international expat hubs and private clinics, you will find substantial English capability. However, legal procedures, town hall registrations, civil court documents, and immigration appointments are strictly conducted in the official language. Engaging an accredited bilingual relocation specialist, gestor, or certified translator for administrative appointments prevents procedural roadblocks and paperwork rejection.`,
      actionableChecklist: [
        `Hire an accredited local bilingual representative or fixer for immigration and municipal appointments`,
        `Have all legal documents (background checks, birth certificates) sworn and apostilled with certified official translations`,
        `Utilize translation camera apps for daily consumer goods, road signs, and utility statements`,
        `Enroll in local language immersion courses—basic conversational courtesy builds enormous goodwill with local residents`
      ],
      keyAgenciesOrForms: ['Immigration & Civil Registry Bureau', 'Sworn Certified Translators Association'],
      estimatedResolutionTime: 'Immediate reliance on translators; 6–12 months for conversational baseline'
    },
    {
      id: `${country.id}-healthcare`,
      question: `Does Medicare work in ${country.name}, and how do retirees structure healthcare and prescriptions?`,
      category: 'healthcare',
      categoryLabel: 'Healthcare & Prescriptions',
      hurdleSeverity: 'Moderate',
      shortSummary: `US Medicare does NOT cover healthcare outside the United States. Retirees rely on private international insurance or local health coverage.`,
      detailedAnswer: `Neither Medicare Part A nor Part B reimburses medical costs incurred outside US territory. In ${country.name}, healthcare quality is rated ${country.lifestyle.healthcareScore}/100. ${country.lifestyle.healthcareSummary} ${country.lifestyle.publicHealthcareAccess} Comprehensive private health insurance policies for expat retirees cost approximately $70 to $180/month depending on age and deductible choices. For prescription medications, carry a 90-day supply in original labeled pharmacy containers alongside a physician’s letter listing the international generic chemical names.`,
      actionableChecklist: [
        `Maintain Medicare Part B if you anticipate returning to the US in the future to avoid lifelong penalty surcharges`,
        `Secure a private health insurance policy with emergency evacuation and repatriation coverage`,
        `Obtain written doctor notes specifying the international generic chemical names for all regular medications`,
        `Locate premier private hospital networks and emergency clinics in your chosen town in ${country.name}`
      ],
      keyAgenciesOrForms: [`Ministry of Health of ${country.name}`, 'Private International Health Insurance (Cigna/Allianz/GeoBlue)'],
      estimatedResolutionTime: 'Immediate private coverage; local enrollment within 30 days of residency'
    },
    {
      id: `${country.id}-housing`,
      question: `What are the practical hurdles when renting an apartment in ${country.name}?`,
      category: 'housing',
      categoryLabel: 'Housing & Settling In',
      hurdleSeverity: 'Moderate',
      shortSummary: `Always rent for 6 to 12 months before considering a property purchase. Be prepared to provide 1 to 2 months deposit and verify utility registrations.`,
      detailedAnswer: `In ${country.name}, monthly rent for a 1-bedroom apartment in city centers averages roughly ${country.currencySymbol}${country.costOfLiving.rent1BedCenterUSD} USD (${country.currencySymbol}${country.costOfLiving.rent1BedOutsideUSD} outside the center). Most landlords require a standard 12-month lease with a security deposit of 1 to 2 months rent. We strongly urge prospective retirees to complete a 6- to 12-month rental lease to test local seasonal weather, evaluate transit accessibility, and experience daily neighbourhood dynamics before committing capital to long-term real estate.`,
      actionableChecklist: [
        `Inspect the property in person before transferring any rental deposit`,
        `Ensure the rental contract is formally registered with local authorities so it can serve as official proof of address for residency`,
        `Verify high-speed internet reliability and determine whether heating/cooling utilities are billed separately`,
        `Renting for your first full year enables you to experience all four seasons before buying`
      ],
      keyAgenciesOrForms: ['Municipal Registry Office', 'Local Real Estate Association'],
      estimatedResolutionTime: '2 to 4 weeks for rental search'
    }
  ];
}

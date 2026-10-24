import { Country } from '../types';

export interface BankInstitutionProfile {
  name: string;
  category: 'Nationalized / State-Backed' | 'Top Private Commercial' | 'International / Expat Tier' | 'Digital & Multi-Currency';
  expatOnboardingEase: 'Easy (Passport / Non-Resident OK)' | 'Moderate (Local Tax ID + Lease)' | 'Strict (Physical Residency Card Required)';
  englishSupport: 'Full English App & Branches' | 'English in Expat Hubs / Partial App' | 'Local Language Primary (Bring Translator)';
  multiCurrencyAccounts: string;
  atmAndWireHighlights: string;
  bestForRetirees: string;
}

export interface RemittanceChannelBenchmark {
  channelName: string;
  providerExamples: string;
  transferFeeStructure: string;
  fxSpreadPercent: string;
  typicalCostOn3000USD: string;
  settlementSpeed: string;
  idealUseCase: string;
  proTip: string;
}

export interface ExpatTaxCategoryRule {
  category: string;
  applicableRateOrVerdict: string;
  severity: '0% Tax / Exempt' | 'Favorable / Treaty Protected' | 'Moderate / Remittance Rule' | 'Progressive Worldwide Tax';
  detailedExplanation: string;
}

export interface SavingStrategyTip {
  title: string;
  type: 'Remittance & FX Fee Saver' | 'Legal Expat Tax Optimization';
  estimatedAnnualSavingsUSD: string;
  description: string;
  actionStep: string;
}

export interface CountryFinanceAndTaxProfile {
  countryId: string;
  countryName: string;
  taxRegimeClassification:
    | 'Territorial Tax Haven (0% on Foreign Income)'
    | '0% Personal Income Tax Jurisdiction'
    | 'Remittance-Basis Tax System'
    | 'Worldwide Tax with Special Expat / Pension Regime'
    | 'Standard Worldwide Tax with Double Tax Treaties';
  headlineSummary: string;
  inboundRemittanceTaxedVerdict: string;
  inboundRemittanceExplanation: string;
  localTaxIdName: string;
  depositInsuranceLimit: string;
  centralBankReportingThreshold: string;
  averageMonthlyFxCostOn3000USD: number; // baseline traditional bank cost vs fintech
  fintechCostOn3000USD: number;
  banks: BankInstitutionProfile[];
  accountOpeningChecklist: string[];
  remittanceChannels: RemittanceChannelBenchmark[];
  taxRulesMatrix: ExpatTaxCategoryRule[];
  savingStrategies: SavingStrategyTip[];
}

// Lookup of real nationalized/state and top private banks by country ID
const COUNTRY_BANKS_DATABASE: Record<
  string,
  {
    taxIdName: string;
    depositProtection: string;
    centralBankThreshold: string;
    stateBank: { name: string; highlights: string };
    privateBank1: { name: string; highlights: string };
    privateBank2: { name: string; highlights: string };
  }
> = {
  portugal: {
    taxIdName: 'NIF (Número de Identificação Fiscal)',
    depositProtection: '€100,000 per depositor (Fundo de Garantia de Depósitos - EU Directive)',
    centralBankThreshold: '€12,500+ cross-border transfers reported automatically to Banco de Portugal for statistical/AML compliance',
    stateBank: {
      name: 'Caixa Geral de Depósitos (CGD)',
      highlights: 'Portugal’s largest 100% state-owned bank; rock-solid sovereign backing, highest branch/ATM density in every parish, and Multibanco bill-pay integration.',
    },
    privateBank1: {
      name: 'Millennium BCP & ActivoBank',
      highlights: 'Top private commercial bank (Millennium) and its zero-monthly-fee digital subsidiary (ActivoBank) favored by D7/D8 visa applicants.',
    },
    privateBank2: {
      name: 'Novo Banco & Banco BPI',
      highlights: 'Dedicated English-speaking expat relationship managers in Cascais, Lisbon, Porto, and the Algarve with D7 visa deposit certificates.',
    },
  },
  spain: {
    taxIdName: 'NIE (Número de Identidad de Extranjero)',
    depositProtection: '€100,000 per depositor (Fondo de Garantía de Depósitos - EU Directive)',
    centralBankThreshold: '€10,000+ inbound wires require automated Banco de España / SEPBLAC source-of-funds declaration for large property transfers',
    stateBank: {
      name: 'CaixaBank (State FROB Stake) & Correos Cash',
      highlights: 'Spain’s largest domestic retail network (partially state-backed via FROB) with specialized HolaBank English expat accounts across all costas.',
    },
    privateBank1: {
      name: 'Banco Sabadell & Banco Santander',
      highlights: 'Premier private banks offering Non-Resident accounts using just a passport before your TIE residency card is issued.',
    },
    privateBank2: {
      name: 'BBVA Spain & Bankinter',
      highlights: 'Award-winning mobile banking apps, multi-currency accounts, and seamless direct debit setup for Spanish utilities and SUMA property tax.',
    },
  },
  thailand: {
    taxIdName: 'Thai TIN (Taxpayer Identification Number — Revenue Department)',
    depositProtection: '1,000,000 THB (~$29,000 USD) per depositor via Deposit Protection Agency (DPA)',
    centralBankThreshold: '$50,000+ USD (or equivalent) inbound wires generate a Foreign Exchange Transaction (FET) Form from the receiving Thai bank (essential for condo purchase!)',
    stateBank: {
      name: 'Krungthai Bank (KTB) & Government Savings Bank (GSB)',
      highlights: 'State-controlled commercial giants with nationwide branches, PaoTang wallet integration, and reliable 800,000 THB retirement visa seasoning letters.',
    },
    privateBank1: {
      name: 'Bangkok Bank',
      highlights: 'Historically the #1 expat-friendly private bank in Thailand for Non-Immigrant O/OA retirees; issues same-day immigration balance certificates.',
    },
    privateBank2: {
      name: 'Kasikornbank (KBank) & Siam Commercial Bank (SCB)',
      highlights: 'Best-in-class English mobile banking (K PLUS app) and instant PromptPay QR code payments accepted by every street vendor and hospital.',
    },
  },
  'costa-rica': {
    taxIdName: 'DIMEX (Residency ID) or NITE (Non-Resident Tax Number)',
    depositProtection: '100% unlimited sovereign state guarantee on deposits at State Banks (Banco Nacional & BCR); up to 6M CRC at private banks',
    centralBankThreshold: '$10,000+ USD monthly incoming transfers require SUGEF Origin of Funds documentation (pension letter or CPA certification)',
    stateBank: {
      name: 'Banco Nacional de Costa Rica (BNCR) & Banco de Costa Rica (BCR)',
      highlights: '100% state-owned banks enjoying an explicit constitutional 100% government deposit guarantee and SINPE Móvil instant transfer rails.',
    },
    privateBank1: {
      name: 'BAC Credomatic',
      highlights: 'Central America’s leading private bank; best English online platform, rapid USD/CRC dual-currency accounts, and regional credit cards.',
    },
    privateBank2: {
      name: 'Scotiabank Costa Rica & Davivienda',
      highlights: 'International private banking standards, escrow/fiduciary services for property purchases, and bilingual expat desks in Escazú and Guanacaste.',
    },
  },
  panama: {
    taxIdName: 'RUC / E-Tax 2.0 ID or E-Cédula (Carnet de Residente)',
    depositProtection: 'No federal FDIC equivalent (Panama uses strict Superintendencia de Bancos liquidity reserves; stick to Tier-1 systemic banks)',
    centralBankThreshold: '$10,000+ USD cash/wire declarations under UAF anti-money-laundering rules; bring apostilled bank reference letters',
    stateBank: {
      name: 'Banco Nacional de Panamá (BNP) & Caja de Ahorros',
      highlights: 'Panama’s official state banks where Friendly Nations and Pensionado visa guarantee checks and government treasury deposits are held.',
    },
    privateBank1: {
      name: 'Banco General',
      highlights: 'Panama’s #1 private bank and operator of Yappy (used by 95% of businesses and clinics in Panama for instant USD transfers).',
    },
    privateBank2: {
      name: 'Banistmo & Scotiabank Panama',
      highlights: 'Strong international wire connectivity in US Dollars, English relationship managers in Panama City, Boquete, and Coronado.',
    },
  },
  mexico: {
    taxIdName: 'RFC (Registro Federal de Contribuyentes) & CURP',
    depositProtection: '400,000 UDIs (~$185,000 USD) per depositor via IPAB (Instituto para la Protección al Ahorro Bancario)',
    centralBankThreshold: '$10,000+ USD or 15,000 MXN cash deposits trigger SAT reporting; electronic SPEI transfers via Wise/OFX are seamless',
    stateBank: {
      name: 'Banco del Bienestar & Banobras (State Development)',
      highlights: 'Nationalized state network alongside Banxico’s instant 24/7 SPEI interbank rail used by every bank in Mexico.',
    },
    privateBank1: {
      name: 'BBVA México & Banorte',
      highlights: 'Mexico’s largest commercial banks with the widest ATM networks and English-friendly branches in Ajijic, San Miguel de Allende, and Mérida.',
    },
    privateBank2: {
      name: 'Intercam Banco & Scotiabank México',
      highlights: 'Intercam specializes specifically in US/Canadian expats—allowing accounts with just a passport or Temporary Resident card and offering dual USD/MXN brokerage links.',
    },
  },
  malaysia: {
    taxIdName: 'TIN (Nombor Pengenalan Cukai — LHDN)',
    depositProtection: '250,000 MYR (~$57,000 USD) per depositor via PIDM (Perbadanan Insurans Deposit Malaysia)',
    centralBankThreshold: '50,000 MYR+ (~$11,500 USD) cross-border transfers require a simple purpose-of-transfer code under Bank Negara Malaysia FEA rules',
    stateBank: {
      name: 'Maybank (Permodalan Nasional State-Linked) & BSN',
      highlights: 'Malaysia’s flagship financial institution (Maybank2u / MAE app) and Bank Simpanan Nasional; top choice for MM2H fixed deposits.',
    },
    privateBank1: {
      name: 'CIMB Bank & Public Bank',
      highlights: 'Premier private banking groups with high-yield MM2H fixed deposit rates (3.5%–4.1% p.a.), English apps, and ASEAN-wide fee-free ATMs.',
    },
    privateBank2: {
      name: 'HSBC Malaysia & Standard Chartered Malaysia',
      highlights: 'International Premier banking allowing pre-arrival account opening from the US, UK, or Australia and instant global Premier transfers.',
    },
  },
  greece: {
    taxIdName: 'AFM (Arithmos Forologikou Mitroou — Greek Tax Number)',
    depositProtection: '€100,000 per depositor via TEKE (Hellenic Deposit and Investment Guarantee Fund - EU Directive)',
    centralBankThreshold: '€10,000+ international wires require source-of-funds documentation for Golden Visa or property deeds',
    stateBank: {
      name: 'National Bank of Greece (NBG — Ethniki Trapeza)',
      highlights: 'Greece’s oldest and most trusted historic national bank (founded 1841); offers non-resident digital onboarding via the NBG Mobile app.',
    },
    privateBank1: {
      name: 'Eurobank & Alpha Bank',
      highlights: 'Leading private banks with dedicated International Clients / Non-Resident desks that allow opening an account without a local Greek phone number.',
    },
    privateBank2: {
      name: 'Piraeus Bank',
      highlights: 'Largest branch footprint across Greek islands (Crete, Rhodes, Corfu, Cyclades) and Winbank English online portal.',
    },
  },
  italy: {
    taxIdName: 'Codice Fiscale (Italian Tax Identification Code)',
    depositProtection: '€100,000 per depositor via FITD (Fondo Interbancario di Tutela dei Depositi - EU Directive)',
    centralBankThreshold: '€5,000 cash limit; €15,000+ foreign transfers monitored under Agenzia delle Entrate "Quadro RW" foreign asset reporting',
    stateBank: {
      name: 'Poste Italiane (BancoPosta) & Monte dei Paschi di Siena',
      highlights: 'State-backed BancoPosta operates in every single Italian hill village, while MPS is the world’s oldest surviving bank (founded 1472).',
    },
    privateBank1: {
      name: 'Intesa Sanpaolo & FinecoBank',
      highlights: 'Italy’s #1 banking group (Intesa) and Europe’s top multi-currency digital private bank (Fineco—holds EUR, USD, GBP, CHF in one account!).',
    },
    privateBank2: {
      name: 'UniCredit Italy',
      highlights: 'Pan-European commercial giant with English mobile banking and Non-Resident ("Conto Non Residenti") accounts for property buyers.',
    },
  },
  france: {
    taxIdName: 'Numéro Fiscal (SPI — Direction Générale des Finances Publiques)',
    depositProtection: '€100,000 per depositor via FGDR (Fonds de Garantie des Dépôts et de Résolution - EU Directive)',
    centralBankThreshold: '€10,000+ cross-border wires reported to TRACFIN; all foreign bank accounts (including Wise/US accounts) must be declared annually on Form 3916',
    stateBank: {
      name: 'La Banque Postale (100% Caisse des Dépôts State Group)',
      highlights: 'Publicly owned bank with a legal universal banking mandate and branches in every post office across rural France.',
    },
    privateBank1: {
      name: 'BNP Paribas & Société Générale (SG)',
      highlights: 'Global Tier-1 private banks with dedicated English-speaking International Desks and US Global Alliance free ATM agreements (Bank of America).',
    },
    privateBank2: {
      name: 'Crédit Agricole (Britline) & CCF',
      highlights: 'CA Britline provides a 100% English-speaking telephone and online banking service specifically built for UK, US, and Commonwealth retirees in France.',
    },
  },
  philippines: {
    taxIdName: 'BIR TIN (Bureau of Internal Revenue Taxpayer Identification Number)',
    depositProtection: '500,000 PHP (~$8,800 USD) per depositor via PDIC (Philippine Deposit Insurance Corporation)',
    centralBankThreshold: '500,000 PHP (~$8,800 USD) single transaction triggers AMLC reporting; SRRV visa deposits go exclusively to PRA-accredited banks',
    stateBank: {
      name: 'Land Bank of the Philippines (LandBank) & DBP',
      highlights: '100% government-owned banks accredited by the Philippine Retirement Authority (PRA) to hold mandatory $10,000–$20,000 SRRV visa deposits.',
    },
    privateBank1: {
      name: 'BDO Unibank & Bank of the Philippine Islands (BPI)',
      highlights: 'The Philippines’ two largest private banks—100% English apps, USD Dollar FCDU accounts, and branches inside every SM and Ayala mall.',
    },
    privateBank2: {
      name: 'Metrobank & RCBC',
      highlights: 'Strong international remittance clearing, InstaPay/PESONet integration, and dedicated Wealth/Expat relationship managers.',
    },
  },
  vietnam: {
    taxIdName: 'Mã Số Thuế (MST — Personal Tax Code)',
    depositProtection: '125,000,000 VND (~$5,000 USD) via Deposit Insurance of Vietnam (DIV)',
    centralBankThreshold: 'Strict State Bank of Vietnam capital controls: inbound funds are easy, but wiring money OUT of Vietnam requires proof of legal tax-paid income or inbound wire receipts',
    stateBank: {
      name: 'Vietcombank, BIDV & VietinBank (State "Big 4")',
      highlights: 'State-controlled commercial leaders; Vietcombank has the best foreign exchange spreads and English counter staff in Da Nang, HCMC, and Hanoi.',
    },
    privateBank1: {
      name: 'timo Digital Bank (by BVBank) & Techcombank',
      highlights: 'Timo is famous among expats in Vietnam for English café-style branches and free VietQR instant payments on a 3+ month visa.',
    },
    privateBank2: {
      name: 'HSBC Vietnam & Standard Chartered Vietnam',
      highlights: 'International Tier-1 banks with high security, English mobile apps, and multi-currency VND/USD accounts.',
    },
  },
  colombia: {
    taxIdName: 'NIT / RUT (Registro Único Tributario — DIAN)',
    depositProtection: '50,000,000 COP (~$12,000 USD) per depositor via Fogafín (Fondo de Garantías de Instituciones Financieras)',
    centralBankThreshold: 'All inbound wires for real estate or Investor/M-Visas MUST be registered with Banco de la República using Formulario 4 (Foreign Investment) to guarantee repatriation rights!',
    stateBank: {
      name: 'Banco Agrario de Colombia (100% State-Owned)',
      highlights: 'State bank with nationwide presence, while Bancolombia serves as the de facto national retail backbone.',
    },
    privateBank1: {
      name: 'Bancolombia',
      highlights: 'Used by 80%+ of Colombian landlords and merchants; requires a Cédula de Extranjería (Residency ID) to open a local savings account.',
    },
    privateBank2: {
      name: 'Davivienda & Scotiabank Colpatria',
      highlights: 'Davivienda ATM withdrawals offer high single-transaction limits (up to 2,000,000 COP) and strong international wire desks for property buyers.',
    },
  },
  ecuador: {
    taxIdName: 'RUC / Cédula de Identidad (USD Economy)',
    depositProtection: '$32,000 USD at Tier-1 private banks and major Cooperativas via COSEDE (Corporación del Seguro de Depósitos)',
    centralBankThreshold: '5% ISD (Impuesto a la Salida de Divisas) capital-exit tax applies when wiring money OUT of Ecuador above the annual exempt card threshold (~$5,109/yr)—never bring in more principal than you need locally!',
    stateBank: {
      name: 'Banco del Pacífico (State-Owned Commercial Bank)',
      highlights: 'Operates as a modern commercial bank owned by the Ecuadorian state; top mobile app and high COSEDE safety in Cuenca and Quito.',
    },
    privateBank1: {
      name: 'Banco Pichincha & Banco Guayaquil',
      highlights: 'Ecuador’s two largest private banks; US Dollar accounts, dense ATM networks, and direct Social Security direct-deposit support.',
    },
    privateBank2: {
      name: 'JEP Cooperativa & Produbanco',
      highlights: 'JEP (in Cuenca) is beloved by retirees for high USD Certificate of Deposit (CD) yields (7%–8.5% p.a. in US Dollars!), though retirees should diversify across banks.',
    },
  },
  indonesia: {
    taxIdName: 'NPWP (Nomor Pokok Wajib Pajak)',
    depositProtection: '2,000,000,000 IDR (~$128,000 USD) per depositor via LPS (Lembaga Penjamin Simpanan)',
    centralBankThreshold: '$10,000+ USD cross-border wires require a simple Bank Indonesia LLD purpose code; Second Home / Retirement KITAS requires a state-bank deposit',
    stateBank: {
      name: 'Bank Mandiri, BNI & BRI (BUMN State-Owned Himbara Banks)',
      highlights: 'Indonesia’s state-owned banking giants; mandatory for holding the $130,000 USD Second Home Visa deposit or Golden Visa funds.',
    },
    privateBank1: {
      name: 'BCA (Bank Central Asia)',
      highlights: 'Universally regarded as the gold standard for daily banking in Bali and Jakarta; every villa landlord, clinic, and café uses BCA & QRIS.',
    },
    privateBank2: {
      name: 'PermataBank & CIMB Niaga',
      highlights: 'Expat-friendly onboarding in Sanur, Canggu, and Ubud with multi-currency accounts (12+ currencies in one app) and English mobile banking.',
    },
  },
  japan: {
    taxIdName: 'My Number (Individual Number — 12-Digit Tax & Social Security ID)',
    depositProtection: '¥10,000,000 JPY (~$67,000 USD) per depositor via Deposit Insurance Corporation of Japan (DICJ)',
    centralBankThreshold: '¥1,000,000+ JPY (~$6,700 USD) international wires trigger Foreign Exchange and Foreign Trade Act (FEFTA) source/purpose verification and My Number registration',
    stateBank: {
      name: 'Japan Post Bank (Yucho Ginko — State-Linked)',
      highlights: 'Accessible to newly arrived residents (even within the first 6 months as a "Non-Resident" account before the 6-month Foreign Exchange Act waiting period expires!).',
    },
    privateBank1: {
      name: 'Sony Bank (English App) & Prestia SMBC Trust Bank',
      highlights: 'The two best full-English banks for expats in Japan—holding 11 currencies (USD/EUR/JPY) with ultra-low FX spreads and English customer service.',
    },
    privateBank2: {
      name: 'MUFG, SMBC & Mizuho (Megabanks)',
      highlights: 'Japan’s "Big Three" private megabanks for utility auto-debits, mortgages, and high-value real estate wire settlements.',
    },
  },
  'united-arab-emirates': {
    taxIdName: 'Emirates ID & UAE Tax Residency Certificate (TRC)',
    depositProtection: 'Implicit Central Bank of the UAE (CBUAE) systemic guarantee on sovereign-backed national banks',
    centralBankThreshold: 'AED 55,000+ (~$15,000 USD) wires require source-of-funds invoice/pension statement under CBUAE AML rules',
    stateBank: {
      name: 'Emirates NBD & First Abu Dhabi Bank (FAB)',
      highlights: 'Majority government-owned national champions of Dubai and Abu Dhabi; world-class English apps, multi-currency USD/AED accounts, and Golden Visa mortgages.',
    },
    privateBank1: {
      name: 'ADCB (Abu Dhabi Commercial Bank) & Mashreq Bank',
      highlights: 'Fast digital onboarding with an Emirates ID (or Non-Resident savings account with passport) and zero-fee international transfers.',
    },
    privateBank2: {
      name: 'HSBC Middle East & Wio Bank',
      highlights: 'Global multi-currency wealth management with AED pegged at a fixed 3.6725 to $1 USD.',
    },
  },
};

// Real-world Nationalized/State & Top Private Banks for countries worldwide
const NAMED_BANKS_BY_COUNTRY: Record<string, { state: string; private1: string; private2: string; taxId?: string }> = {
  cyprus: { state: 'Central Co-operative / Housing Finance Corp (HFC)', private1: 'Bank of Cyprus (BoC)', private2: 'Hellenic Bank & Eurobank Cyprus', taxId: 'TIC (Tax Identification Code)' },
  malta: { state: 'Bank of Valletta (BOV — State-Linked)', private1: 'HSBC Bank Malta', private2: 'APS Bank & BNF Bank', taxId: 'Malta Tax Number / e-ID Card' },
  belize: { state: 'National Bank of Belize (NBB — 100% State-Owned)', private1: 'Belize Bank & Heritage Bank', private2: 'Atlantic Bank & Caye International Bank', taxId: 'TIN & Social Security / QRP Card' },
  croatia: { state: 'HPB (Hrvatska poštanska banka — State-Owned)', private1: 'Zagrebačka banka (ZABA - UniCredit)', private2: 'Privredna banka Zagreb (PBZ - Intesa) & Erste', taxId: 'OIB (Osobni identifikacijski broj)' },
  uruguay: { state: 'BROU (Banco de la República Oriental del Uruguay — State Giant)', private1: 'Banco Itaú Uruguay & Santander Uruguay', private2: 'BBVA Uruguay & Scotiabank Uruguay', taxId: 'Cédula de Identidad / RUT' },
  'dominican-republic': { state: 'Banreservas (Banco de Reservas — 100% State-Owned)', private1: 'Banco Popular Dominicano', private2: 'Banco BHD & Scotiabank DR', taxId: 'Cédula de Identidad y Electoral / RNC' },
  slovenia: { state: 'NLB (Nova Ljubljanska Banka — Systemic National Champion)', private1: 'OTP Banka Slovenija (formerly NKBM / SKB)', private2: 'Banca Intesa Sanpaolo & UniCredit Slovenija', taxId: 'Davčna številka (Slovenian Tax Number)' },
  chile: { state: 'BancoEstado (100% State-Owned Commercial Bank)', private1: 'Banco de Chile & Banco Santander Chile', private2: 'Banco BCI & Itaú Chile', taxId: 'RUT (Rol Único Tributario)' },
  ireland: { state: 'AIB (Allied Irish Banks) & An Post Money (State-Backed)', private1: 'Bank of Ireland (BOI)', private2: 'PTSB (Permanent TSB) & Revolut Ireland IBAN', taxId: 'PPSN (Personal Public Service Number)' },
  turkey: { state: 'Ziraat Bankası, VakıfBank & Halkbank (State Giants)', private1: 'Garanti BBVA & İş Bankası (İşbank)', private2: 'Yapı Kredi, Akbank & QNB Finansbank', taxId: 'Vergi Kimlik Numarası (VKN) & YKN' },
  cambodia: { state: 'National Bank (Bakong QR Rail) & Foreign Trade Bank (FTB)', private1: 'ABA Bank (National Bank of Canada Subsidiary — #1 Expat App)', private2: 'ACLEDA Bank & Canadia Bank', taxId: 'Cambodia TIN / E-Class Visa' },
  argentina: { state: 'Banco de la Nación Argentina (BNA) & Banco Provincia', private1: 'Banco Galicia & Banco Santander Argentina', private2: 'BBVA Argentina & Brubank', taxId: 'CUIT / CUIL & CDI' },
  albania: { state: 'Posta Shqiptare Financial & Credins Bank (Systemic Domestic)', private1: 'Raiffeisen Bank Albania & BKT (Banka Kombëtare Tregtare)', private2: 'Intesa Sanpaolo Bank Albania & OTP Bank Albania', taxId: 'NID / Personal ID Number (Letërnjoftim)' },
  guatemala: { state: 'CHN (El Crédito Hipotecario Nacional — State Bank) & Banrural', private1: 'Banco Industrial (BI)', private2: 'BAC Credomatic Guatemala & Banco G&T Continental', taxId: 'NIT (Número de Identificación Tributaria)' },
  taiwan: { state: 'Bank of Taiwan (BOT), Mega Bank & First Commercial Bank', private1: 'CTBC Bank & Cathay United Bank', private2: 'E.SUN Bank, Taipei Fubon & HSBC Taiwan', taxId: 'ARC (Alien Resident Certificate) Unified ID No.' },
  montenegro: { state: 'Poštanska Štedionica / IRF Montenegro', private1: 'CKB (Crnogorska Komercijalna Banka - OTP Group)', private2: 'NLB Banka Podgorica, Hipotekarna Banka & Erste', taxId: 'PIB / Boravak (Temporary Residence Permit ID)' },
  bulgaria: { state: 'Bulgarian Development Bank & Bulgarian Posts Financial', private1: 'UniCredit Bulbank & DSK Bank (OTP Group)', private2: 'UBB (United Bulgarian Bank - KBC) & Eurobank (Postbank)', taxId: 'LNC (ЛНЧ — Foreigner Personal Number)' },
  hungary: { state: 'MBH Bank (State Stake) & Magyar Posta Financial', private1: 'OTP Bank (Hungary’s #1 Banking Group)', private2: 'K&H Bank (KBC), Erste Bank Hungary & UniCredit', taxId: 'Adóazonosító jel (Hungarian Tax ID)' },
  austria: { state: 'bank99 (Austrian Post Bank) & HYPO Landesbanken', private1: 'Erste Bank und Sparkassen (George English App)', private2: 'Raiffeisen Bank International & Bank Austria (UniCredit)', taxId: 'Steuernummer (Austrian Tax Number)' },
  switzerland: { state: 'Zürcher Kantonalbank (ZKB) & PostFinance (Swiss Post State Bank)', private1: 'UBS Switzerland', private2: 'Raiffeisen Switzerland & Julius Bär', taxId: 'AHV / AVS Social Security & Tax Number' },
  peru: { state: 'Banco de la Nación (State Bank)', private1: 'BCP (Banco de Crédito del Perú) & Interbank', private2: 'BBVA Perú & Scotiabank Perú', taxId: 'Carnet de Extranjería (CE) & RUC' },
  brazil: { state: 'Banco do Brasil (BB) & Caixa Econômica Federal (State Giants)', private1: 'Itaú Unibanco & Banco Bradesco', private2: 'Santander Brasil, BTG Pactual & Nubank', taxId: 'CPF (Cadastro de Pessoas Físicas)' },
  nicaragua: { state: 'BANPRO / Produzcamos State Development', private1: 'LAFISE Bancentro & BAC Credomatic Nicaragua', private2: 'BDF (Banco de Finanzas) & Avanz', taxId: 'Cédula de Residencia & RUC' },
  paraguay: { state: 'BNF (Banco Nacional de Fomento — 100% State-Owned)', private1: 'Banco Itaú Paraguay & Sudameris Bank', private2: 'Banco Continental & Ueno Bank', taxId: 'Cédula de Identidad Paraguaya & RUC' },
  honduras: { state: 'BANADESA (State Bank)', private1: 'Banco Atlántida & BAC Credomatic Honduras', private2: 'Banco Ficohsa & Banpaís', taxId: 'RTN (Registro Tributario Nacional)' },
  'sri-lanka': { state: 'Bank of Ceylon (BOC) & People’s Bank (100% State-Owned)', private1: 'Commercial Bank of Ceylon & Hatton National Bank (HNB)', private2: 'Sampath Bank, Nations Trust & HSBC Sri Lanka', taxId: 'TIN (Inland Revenue Department) & NRFC/PFCA Account' },
  'south-korea': { state: 'IBK (Industrial Bank of Korea) & NH NongHyup Bank', private1: 'HANA Bank (KEB Hana — #1 Expat Foreign Exchange Bank) & KB Kookmin', private2: 'Shinhan Bank & Woori Bank', taxId: 'ARC (Residence Card — Foreigner Registration Number)' },
  laos: { state: 'BCEL (Banque Pour Le Commerce Extérieur Lao — State Flagship)', private1: 'LDB (Lao Development Bank) & Phongsavanh Bank', private2: 'JDB (Joint Development Bank) & Maruhan Japan Bank', taxId: 'TIN & BCEL One Mobile Wallet' },
  mauritius: { state: 'MauBank & State Bank of Mauritius (SBM — State-Backed)', private1: 'MCB (Mauritius Commercial Bank — #1 Island Bank)', private2: 'Absa Bank Mauritius, AfrAsia Bank & HSBC Mauritius', taxId: 'TAN (Tax Account Number — MRA)' },
  'czech-republic': { state: 'Česká pošta / Poštovní spořitelna (ČSOB)', private1: 'Česká spořitelna (Erste) & ČSOB', private2: 'Komerční banka (Société Générale) & Raiffeisenbank CZ', taxId: 'Rodné číslo (Birth/Identification Number) & DIČ' },
  georgia: { state: 'Liberty Bank (National Pension Distributor)', private1: 'Bank of Georgia (BoG — SOLO VIP Expat Banking)', private2: 'TBC Bank & Credo Bank', taxId: 'Georgian Tax Payer ID (9-Digit Code)' },
  andorra: { state: 'Andorran Financial Authority (AFA Regulated Trio)', private1: 'Creand (Crèdit Andorrà)', private2: 'MoraBanc & Andbank', taxId: 'NIA (Número d’Identificació Administrativa)' },
  romania: { state: 'CEC Bank (100% State-Owned Savings Bank, Founded 1864)', private1: 'Banca Transilvania (BT) & BCR (Erste Group)', private2: 'BRD (Société Générale), ING Romania & Raiffeisen', taxId: 'CNP (Cod Numeric Personal) / NIF' },
  poland: { state: 'PKO Bank Polski & Bank Pekao (State-Controlled Giants)', private1: 'Santander Bank Polska & ING Bank Śląski', private2: 'mBank & Millennium Bank Poland', taxId: 'PESEL (Universal Electronic System ID) & NIP' },
  estonia: { state: 'Omniva Financial / Finantsinspektsioon', private1: 'LHV Pank (Estonia’s #1 Domestic Expat & e-Resident Bank)', private2: 'Swedbank Estonia & SEB Estonia', taxId: 'Isikukood (Estonian Personal Identification Code)' },
  australia: { state: 'Reserve Bank / Australia Post Bank@Post Network', private1: 'Commonwealth Bank (CommBank) & Westpac', private2: 'ANZ, NAB & Macquarie Bank', taxId: 'TFN (Tax File Number — ATO)' },
  'new-zealand': { state: 'Kiwibank (100% New Zealand State-Owned Bank)', private1: 'ANZ New Zealand & ASB Bank', private2: 'BNZ (Bank of New Zealand) & Westpac NZ', taxId: 'IRD Number (Inland Revenue Department)' },
  singapore: { state: 'POSB / DBS Bank (Temasek Sovereign-Linked Flagship)', private1: 'OCBC Bank & UOB (United Overseas Bank)', private2: 'HSBC Singapore, Standard Chartered & Citibank SG', taxId: 'FIN (Foreign Identification Number) / NRIC' },
  india: { state: 'State Bank of India (SBI), Bank of Baroda & Punjab National Bank', private1: 'HDFC Bank & ICICI Bank (Leading NRI / Expat Portals)', private2: 'Axis Bank, Kotak Mahindra & IDFC First Bank', taxId: 'PAN Card (Permanent Account Number) & NRE/NRO Account' },
  nepal: { state: 'Rastriya Banijya Bank (RBB) & Nepal Bank Limited (State-Owned)', private1: 'Nabil Bank & Standard Chartered Bank Nepal', private2: 'Himalayan Bank & Global IME Bank', taxId: 'PAN (Inland Revenue Department)' },
  morocco: { state: 'Al Barid Bank (Postal State Bank) & CIH Bank / CDG', private1: 'Attijariwafa Bank & Banque Populaire (BCP)', private2: 'Bank of Africa (BMCE) & Société Générale Maroc', taxId: 'CIN / Carte d’Immatriculation & Compte en Dirhams Convertibles' },
  'south-africa': { state: 'Postbank / Land Bank (State)', private1: 'First National Bank (FNB) & Standard Bank', private2: 'Nedbank, Absa & Capitec Bank', taxId: 'SARS Income Tax Reference Number' },
  'united-kingdom': { state: 'NS&I (National Savings & Investments — 100% HM Treasury) & NatWest', private1: 'HSBC UK & Barclays', private2: 'Lloyds Bank, Santander UK & Monzo/Starling', taxId: 'National Insurance (NI) Number & UTR' },
  germany: { state: 'Sparkasse (Municipal Public Savings Banks) & KfW/DKB', private1: 'Deutsche Bank & Commerzbank', private2: 'ING Germany & N26 (Full English Mobile App)', taxId: 'Steueridentifikationsnummer (Steuer-ID)' },
  netherlands: { state: 'ASN Bank / de Volksbank (100% State-Owned)', private1: 'ING Netherlands & ABN AMRO (Dedicated Expat Desk)', private2: 'Rabobank & bunq', taxId: 'BSN (Burgerservicenummer)' },
  canada: { state: 'ATB Financial (Crown Corp) & Bank of Canada', private1: 'RBC (Royal Bank of Canada) & TD Canada Trust', private2: 'Scotiabank, BMO & CIBC', taxId: 'SIN (Social Insurance Number)' },
  'united-states': { state: 'FDIC / TreasuryDirect & US Postal Banking', private1: 'JPMorgan Chase, Bank of America & Citibank', private2: 'Charles Schwab Bank & Fidelity Cash Management', taxId: 'SSN (Social Security Number) or ITIN' },
  qatar: { state: 'Qatar National Bank (QNB — 50% Qatar Investment Authority State Owned)', private1: 'Commercial Bank of Qatar (CBQ) & Doha Bank', private2: 'Qatar Islamic Bank (QIB) & HSBC Qatar', taxId: 'QID (Qatar Residency ID Card)' },
  'saudi-arabia': { state: 'SNB (Saudi National Bank — PIF Sovereign Majority)', private1: 'Al Rajhi Bank & Riyad Bank', private2: 'SAB (Saudi Awwal Bank - HSBC affiliate) & Banque Saudi Fransi', taxId: 'Iqama / Premium Residency ID Number' },
  china: { state: 'Bank of China (BOC) & ICBC (State "Big Four" Banks)', private1: 'China Merchants Bank (CMB — Best Retail App)', private2: 'HSBC China & Standard Chartered China', taxId: 'Foreign Passport + Alipay / WeChat Pay Binding' },
  egypt: { state: 'National Bank of Egypt (NBE) & Banque Misr (100% State-Owned)', private1: 'CIB (Commercial International Bank — #1 Private Bank)', private2: 'HSBC Egypt & QNB Alahli', taxId: 'Egyptian Residency Stamp / Property Contract' },
  botswana: { state: 'Botswana Savings Bank (BSB — 100% Government Owned)', private1: 'First National Bank Botswana (FNBB) & Absa Botswana', private2: 'Standard Chartered Botswana & Stanbic Bank', taxId: 'BURS TIN (Botswana Unified Revenue Service)' },
  rwanda: { state: 'Bank of Kigali (BK — State-Linked Flagship)', private1: 'I&M Bank Rwanda & Equity Bank Rwanda', private2: 'BPR Bank Rwanda (KCB Group) & Ecobank', taxId: 'RRA TIN & Irembo Foreign Resident ID' },
  ghana: { state: 'GCB Bank (Ghana Commercial Bank) & Consolidated Bank (CBG)', private1: 'Ecobank Ghana & Stanbic Bank Ghana', private2: 'Absa Bank Ghana, Fidelity Bank & Zenith Bank', taxId: 'Non-Citizen Ghana Card & GRA TIN' },
  senegal: { state: 'BNDE (Banque Nationale pour le Développement) & La Poste', private1: 'CBAO (Attijariwafa) & Société Générale Sénégal', private2: 'BICIS & Ecobank Sénégal', taxId: 'NINEA & Carte d’Identité d’Étranger' },
};

export function getCountryFinanceAndTaxProfile(country: Country): CountryFinanceAndTaxProfile {
  const id = country.id;
  const taxText = country.visa.taxStatus.toLowerCase();
  const isZeroTax =
    taxText.includes('0% personal income tax') ||
    taxText.includes('no personal income tax') ||
    ['united-arab-emirates', 'qatar', 'saudi-arabia', 'kuwait', 'bahrain', 'bahamas', 'cayman-islands', 'bermuda', 'monaco', 'vanuatu', 'turks-and-caicos', 'st-kitts-and-nevis', 'antigua-and-barbuda', 'anguilla', 'british-virgin-islands', 'st-barts', 'brunei'].includes(id);

  const isTerritorial =
    !isZeroTax &&
    (taxText.includes('territorial') ||
      taxText.includes('0% tax on foreign') ||
      taxText.includes('exempt from') ||
      taxText.includes('not taxed') ||
      taxText.includes('untaxed') ||
      ['panama', 'costa-rica', 'malaysia', 'nicaragua', 'paraguay', 'guatemala', 'belize', 'dominican-republic', 'uruguay', 'georgia', 'hong-kong', 'macau', 'singapore', 'seychelles', 'botswana', 'namibia', 'philippines', 'bolivia'].includes(id));

  const isRemittanceBasis =
    !isZeroTax &&
    !isTerritorial &&
    (id === 'thailand' || id === 'malta' || id === 'ireland' || id === 'cyprus' || id === 'mauritius');

  const isSpecialRegime =
    !isZeroTax &&
    !isTerritorial &&
    !isRemittanceBasis &&
    (id === 'greece' || id === 'italy' || id === 'albania' || id === 'indonesia' || id === 'puerto-rico' || id === 'senegal');

  const taxRegimeClassification: CountryFinanceAndTaxProfile['taxRegimeClassification'] = isZeroTax
    ? '0% Personal Income Tax Jurisdiction'
    : isTerritorial
    ? 'Territorial Tax Haven (0% on Foreign Income)'
    : isRemittanceBasis
    ? 'Remittance-Basis Tax System'
    : isSpecialRegime
    ? 'Worldwide Tax with Special Expat / Pension Regime'
    : 'Standard Worldwide Tax with Double Tax Treaties';

  const customBankEntry = COUNTRY_BANKS_DATABASE[id];
  const namedBankFallback = NAMED_BANKS_BY_COUNTRY[id];

  const localTaxIdName =
    customBankEntry?.taxIdName ||
    namedBankFallback?.taxId ||
    (country.region === 'Europe'
      ? `National Tax Identification Number (TIN / NIF) in ${country.name}`
      : country.region === 'Americas'
      ? `National Tax & Residency ID (RUC / NIT / Cédula) in ${country.name}`
      : `Expat Taxpayer Identification Number (TIN) & Residency Card in ${country.name}`);

  const depositInsuranceLimit =
    customBankEntry?.depositProtection ||
    (country.currency.includes('EUR')
      ? '€100,000 per depositor per bank under European Deposit Guarantee Scheme standards'
      : country.currency.includes('USD')
      ? 'Up to $250,000 FDIC (in US territories) or statutory central bank liquidity reserve requirements'
      : `Protected up to statutory national deposit insurance limits regulated by the Central Bank of ${country.name}`);

  const centralBankReportingThreshold =
    customBankEntry?.centralBankThreshold ||
    `Inbound international wires exceeding $10,000 USD (or €10,000 EUR) require standard AML source-of-funds documentation (pension award letter, brokerage statement, or property sale contract).`;

  const banks: BankInstitutionProfile[] = customBankEntry
    ? [
        {
          name: customBankEntry.stateBank.name,
          category: 'Nationalized / State-Backed',
          expatOnboardingEase: 'Moderate (Local Tax ID + Lease)',
          englishSupport: country.lifestyle.englishProficiency === 'Very High' || country.lifestyle.englishProficiency === 'High' ? 'Full English App & Branches' : 'English in Expat Hubs / Partial App',
          multiCurrencyAccounts: `${country.currencySymbol} Local Currency + USD / EUR Foreign Currency Deposit Accounts`,
          atmAndWireHighlights: customBankEntry.stateBank.highlights,
          bestForRetirees: 'Best for maximum sovereign safety, holding mandatory visa deposit buffers, and paying municipal utilities/taxes.',
        },
        {
          name: customBankEntry.privateBank1.name,
          category: 'Top Private Commercial',
          expatOnboardingEase: 'Easy (Passport / Non-Resident OK)',
          englishSupport: 'Full English App & Branches',
          multiCurrencyAccounts: `Full multi-currency ${country.currencySymbol} / USD / EUR checking & savings`,
          atmAndWireHighlights: customBankEntry.privateBank1.highlights,
          bestForRetirees: 'Best everyday checking account for rent, debit cards, hospital direct-billing, and fast immigration balance letters.',
        },
        {
          name: customBankEntry.privateBank2.name,
          category: 'International / Expat Tier',
          expatOnboardingEase: 'Moderate (Local Tax ID + Lease)',
          englishSupport: 'Full English App & Branches',
          multiCurrencyAccounts: 'Multi-currency wealth & Premier global transfer accounts',
          atmAndWireHighlights: customBankEntry.privateBank2.highlights,
          bestForRetirees: 'Ideal for high-value real estate escrow transfers, wealth management, and English-speaking relationship managers.',
        },
        {
          name: 'Wise, Revolut & Charles Schwab International',
          category: 'Digital & Multi-Currency',
          expatOnboardingEase: 'Easy (Passport / Non-Resident OK)',
          englishSupport: 'Full English App & Branches',
          multiCurrencyAccounts: '40+ Currencies (USD, EUR, GBP, CAD, AUD + Local Routing)',
          atmAndWireHighlights: `Zero-markup mid-market exchange rates (0.35%–0.65% total fee) and 100% worldwide ATM fee rebates via Schwab Investor Checking.`,
          bestForRetirees: `Essential bridge for converting USD/EUR/GBP pensions into ${country.currency} without losing 3%–5% to traditional bank FX spreads.`,
        },
      ]
    : [
        {
          name: namedBankFallback?.state || `National / State Savings Bank of ${country.name}`,
          category: 'Nationalized / State-Backed',
          expatOnboardingEase: 'Moderate (Local Tax ID + Lease)',
          englishSupport:
            country.lifestyle.englishProficiency === 'Very High' || country.lifestyle.englishProficiency === 'High'
              ? 'Full English App & Branches'
              : 'English in Expat Hubs / Partial App',
          multiCurrencyAccounts: `${country.currency} primary account + USD/EUR foreign currency accounts`,
          atmAndWireHighlights: `Sovereign state-backed retail bank in ${country.capital} and regional hubs (${country.topCities[0]?.name || country.capital}); accepted for all official government visa deposits and municipal utility auto-pay.`,
          bestForRetirees: `Best for state-guaranteed deposit safety and official ${country.visa.retirementVisaName} compliance letters.`,
        },
        {
          name: namedBankFallback?.private1 || `Leading Commercial & Expat Bank (${country.capital} Tier-1)`,
          category: 'Top Private Commercial',
          expatOnboardingEase: 'Easy (Passport / Non-Resident OK)',
          englishSupport: 'Full English App & Branches',
          multiCurrencyAccounts: `Dual ${country.currencySymbol} & USD/EUR accounts with Visa/Mastercard debit`,
          atmAndWireHighlights: `Largest private ATM and branch footprint across ${country.topCities.map(c => c.name.split(' ')[0]).join(', ')}; supports instant mobile QR/interbank transfers and international SWIFT incoming wires.`,
          bestForRetirees: 'Best for everyday grocery/dining debit cards, paying local rent, and English mobile banking.',
        },
        {
          name: namedBankFallback?.private2 || 'Regional International Bank (HSBC / Scotiabank / Standard Chartered / Citi Network)',
          category: 'International / Expat Tier',
          expatOnboardingEase: 'Moderate (Local Tax ID + Lease)',
          englishSupport: 'Full English App & Branches',
          multiCurrencyAccounts: 'Premier Global USD / EUR / GBP / Local Currency Accounts',
          atmAndWireHighlights: `Dedicated International & Premier Expat Desks in ${country.capital} offering cross-border account linking and escrow wires for real estate purchases.`,
          bestForRetirees: 'Best for transferring $50,000–$300,000+ property or Golden/Investor visa funds cleanly.',
        },
        {
          name: 'Wise, Revolut & Charles Schwab / Fidelity Cash Management',
          category: 'Digital & Multi-Currency',
          expatOnboardingEase: 'Easy (Passport / Non-Resident OK)',
          englishSupport: 'Full English App & Branches',
          multiCurrencyAccounts: 'Hold & convert 40+ currencies at real mid-market interbank rates',
          atmAndWireHighlights: `Bypass $45 SWIFT fees and 3.5% bank FX markups; withdraw ${country.currency} at any local ATM in ${country.name} with 100% ATM fee reimbursement.`,
          bestForRetirees: 'Must-have setup to open BEFORE leaving your home country so your foreign pension lands fee-free.',
        },
      ];

  const inboundRemittanceTaxedVerdict = isZeroTax
    ? `0% Tax on All Inbound Remittances & Income`
    : isTerritorial
    ? `0% Tax on Foreign-Sourced Remittances (Territorial Exemption)`
    : isRemittanceBasis
    ? `Savings Principal Exempt; Current-Year Foreign Income Taxed Only If Remitted`
    : `Transferring Already-Taxed Principal Savings Is 0% Taxed; Annual Pension Income Follows Treaty Rules`;

  const inboundRemittanceExplanation = isZeroTax
    ? `${country.name} imposes 0% personal income tax and 0% remittance tax. Whether you wire $2,500/month from your pension or $500,000 to buy a beachfront home in ${country.topCities[0]?.name || country.capital}, zero local tax is levied on incoming funds.`
    : isTerritorial
    ? `${country.name} operates a territorial tax system (${country.visa.taxStatus}). Money earned or derived outside ${country.name}—including foreign pensions, Social Security, 401(k)/IRA withdrawals, and overseas capital gains—is 100% exempt from local income tax when remitted into your local bank account.`
    : isRemittanceBasis
    ? `Under ${country.name}’s remittance-basis rules, foreign income kept offshore is untaxed, and accumulated pre-relocation savings (principal earned in prior tax years) can be wired into ${country.name} tax-free if held in a separate "clean capital" account. However, current-year foreign income remitted into ${country.name} while you are a tax resident (180/183+ days) may be assessable unless exempt under a Double Taxation Treaty or LTR/special visa.`
    : `Simply wiring your existing post-tax bank savings or home-sale proceeds into a bank in ${country.name} is a transfer of principal—NOT a taxable event! However, once you spend 183+ days/year in ${country.name} and become a tax resident, your annual worldwide income (pensions, dividends, capital gains) becomes reportable under ${country.name}’s tax rules and applicable Double Taxation Treaties (DTT).`;

  const remittanceChannels: RemittanceChannelBenchmark[] = [
    {
      channelName: '1. Multi-Currency Fintech Rails (Recommended for Monthly Living)',
      providerExamples: 'Wise (formerly TransferWise), Revolut, OFX',
      transferFeeStructure: '$0 – $12 flat fee',
      fxSpreadPercent: '0.35% – 0.65% over mid-market rate',
      typicalCostOn3000USD: '$14 – $21 total',
      settlementSpeed: 'Instant to 24 hours (via local ACH / SEPA / PromptPay / SPEI rails)',
      idealUseCase: `Monthly $2,000–$6,000 transfers for rent, utilities, and living expenses in ${country.name}.`,
      proTip: `Set up an automatic "Rate Alert" or scheduled conversion on Wise/OFX when the USD or EUR spikes against ${country.currency} to lock in 6 months of living expenses at peak purchasing power.`,
    },
    {
      channelName: '2. Fee-Reimbursed Expat Debit & ATM Cards',
      providerExamples: 'Charles Schwab Investor Checking, Fidelity Cash Management, Wise Visa Card',
      transferFeeStructure: '$0 foreign transaction fee + 100% ATM surcharge refund',
      fxSpreadPercent: '0.20% – 0.40% (Visa/Mastercard wholesale rate)',
      typicalCostOn3000USD: '$6 – $12 total',
      settlementSpeed: 'Instant cash at any local bank ATM',
      idealUseCase: `Withdrawing local cash for markets, restaurants, and daily life in ${country.topCities[0]?.name || country.capital}.`,
      proTip: `ALWAYS press "Decline Conversion" or "Charge in Local Currency (${country.currencySymbol})" on the ATM screen! Accepting the ATM’s "Dynamic Currency Conversion (DCC)" adds a hidden 6%–10% markup.`,
    },
    {
      channelName: '3. Specialized FX Brokers & Interactive Brokers (Large Property Wires)',
      providerExamples: 'Interactive Brokers (IBKR), OFX Private Client, TorFX, Moneycorp',
      transferFeeStructure: '$0 – $15 wire fee',
      fxSpreadPercent: '0.02% (IBKR) – 0.40% (FX Broker)',
      typicalCostOn3000USD: '$2 – $15 (Saves $3,500+ on a $150k property buy!)',
      settlementSpeed: '1 to 2 business days',
      idealUseCase: `Transferring $25,000 to $500,000+ for purchasing real estate or funding a mandatory ${country.visa.retirementVisaName} bank deposit.`,
      proTip: `Use a Forward Contract with OFX or Moneycorp when buying property in ${country.name} to lock in your exact exchange rate up to 12 months before closing day.`,
    },
    {
      channelName: '4. Traditional Retail Bank SWIFT Wire (Avoid for Routine Transfers)',
      providerExamples: 'Chase, Bank of America, Wells Fargo, Barclays, Big-4 Retail Banks',
      transferFeeStructure: '$35 – $50 outgoing + $15 – $30 intermediary/receiving fee',
      fxSpreadPercent: '2.80% – 4.50% hidden retail FX spread',
      typicalCostOn3000USD: '$135 – $185 lost per $3,000 transfer!',
      settlementSpeed: '2 to 5 business days',
      idealUseCase: `Only use when a consulate or central bank explicitly requires a direct bank-to-bank SWIFT MT103 message in your own name for visa/property registration.`,
      proTip: `If you must send a traditional SWIFT wire for a visa deposit, send it in US Dollars or Euros to a local multi-currency account (select "OUR" fee code) and convert locally rather than letting your home bank convert the currency.`,
    },
  ];

  const taxRulesMatrix: ExpatTaxCategoryRule[] = [
    {
      category: 'Inbound Bank Remittances & Pre-Move Savings',
      applicableRateOrVerdict: '0% Tax on Principal Transfers',
      severity: '0% Tax / Exempt',
      detailedExplanation: `Wiring already-taxed savings or capital accumulated prior to moving to ${country.name} is not taxed as income. Keep pre-move savings in a segregated "Clean Capital" brokerage/bank account so principal is never commingled with post-move investment gains.`,
    },
    {
      category: 'Tax Residency Trigger (183-Day Rule)',
      applicableRateOrVerdict: isZeroTax
        ? 'No Personal Tax Regardless of Days'
        : isTerritorial
        ? '183+ Days = Resident (Foreign Income Still 0%)'
        : '183+ Days/Year or Habitual Abode',
      severity: isZeroTax || isTerritorial ? '0% Tax / Exempt' : 'Favorable / Treaty Protected',
      detailedExplanation: `Spending fewer than 183 days per 12-month period in ${country.name} (and maintaining your primary tax home elsewhere) generally keeps you a non-resident for tax purposes. Once you cross 183 days, ${country.visa.taxStatus}`,
    },
    {
      category: 'Foreign Private Pensions, 401(k) & IRA Withdrawals',
      applicableRateOrVerdict: isZeroTax || isTerritorial
        ? '0% Local Tax in ' + country.name
        : isSpecialRegime
        ? 'Flat 7%–10% Special Expat Regime or Treaty Rate'
        : 'Covered by Double Taxation Treaties (DTT)',
      severity: isZeroTax || isTerritorial ? '0% Tax / Exempt' : isSpecialRegime ? 'Favorable / Treaty Protected' : 'Moderate / Remittance Rule',
      detailedExplanation: isZeroTax || isTerritorial
        ? `Private pensions, annuities, 401(k) distributions, and IRA withdrawals from abroad are 0% taxed locally in ${country.name}. (Note: US citizens still pay standard US federal tax on pre-tax 401k/IRA withdrawals).`
        : `Under most OECD Double Taxation Treaties (Article 18), private pensions are taxed either solely in your country of residence or shared with a 100% Foreign Tax Credit so you never pay tax twice on the same dollar.`,
    },
    {
      category: 'Government Service Pensions & US Social Security',
      applicableRateOrVerdict: isZeroTax || isTerritorial
        ? '0% Local Tax in ' + country.name
        : 'Often Taxed Exclusively by Paying Country (Article 19)',
      severity: 'Favorable / Treaty Protected',
      detailedExplanation: `Civil service, military, police, and teacher pensions (and US Social Security under many bilateral treaties) are frequently taxed exclusively by the source government that pays them, keeping them exempt from local progressive brackets in ${country.name}.`,
    },
    {
      category: 'Foreign Dividends, Interest & Capital Gains (Stocks/ETFs)',
      applicableRateOrVerdict: isZeroTax || isTerritorial
        ? '0% Local Capital Gains & Dividend Tax'
        : '0% to 28% Depending on Holding Period & Treaty',
      severity: isZeroTax || isTerritorial ? '0% Tax / Exempt' : 'Favorable / Treaty Protected',
      detailedExplanation: isZeroTax || isTerritorial
        ? `Portfolio capital gains and dividends from US/global stock markets are 0% taxed locally in ${country.name}.`
        : `Before becoming a 183-day tax resident of ${country.name}, consider "stepping up" your stock/ETF cost basis by harvesting unrealized capital gains while still in a lower-tax jurisdiction.`,
    },
    {
      category: 'Wealth, Inheritance & Financial Transaction Taxes',
      applicableRateOrVerdict:
        id === 'spain' || id === 'france' || id === 'colombia' || id === 'norway' || id === 'switzerland'
          ? 'Net Wealth / Solidarity Thresholds Apply to High Net Worth'
          : id === 'ecuador'
          ? '0% Wealth Tax (5% ISD Outbound Wire Tax Applies)'
          : '0% Net Wealth Tax on Retirees',
      severity:
        id === 'spain' || id === 'france' || id === 'colombia' || id === 'ecuador'
          ? 'Moderate / Remittance Rule'
          : '0% Tax / Exempt',
      detailedExplanation:
        id === 'spain'
          ? 'Spain levies a regional Wealth Tax (Impuesto sobre el Patrimonio) on net assets above €700k–€3M depending on autonomous community (Andalusia and Madrid offer generous reliefs/credits).'
          : id === 'ecuador'
          ? 'Ecuador has no wealth tax, but charges a 5% ISD tax when sending money OUT of Ecuador—so only wire in what you plan to spend or invest locally.'
          : `${country.name} does not levy an annual net wealth tax on standard retiree portfolios.`,
    },
  ];

  const savingStrategies: SavingStrategyTip[] = [
    {
      title: '1. Eliminate the 3.5% Retail Bank FX Markup Using Wise + Schwab',
      type: 'Remittance & FX Fee Saver',
      estimatedAnnualSavingsUSD: '$1,450 – $2,200 / year',
      description: `A retiree transferring $3,500/month via a traditional US/UK/Canadian bank loses ~$150 every single month in hidden exchange-rate spreads and SWIFT intermediary fees.`,
      actionStep: `Open a Wise Multi-Currency account and a Charles Schwab Investor Checking account BEFORE leaving your home country. Link them via ACH/Faster Payments so your monthly transfers to ${country.name} cost less than 0.45%.`,
    },
    {
      title: `2. Never Accept "Dynamic Currency Conversion" at ${country.name} ATMs or Card Terminals`,
      type: 'Remittance & FX Fee Saver',
      estimatedAnnualSavingsUSD: '$480 – $900 / year',
      description: `Local ATMs and point-of-sale machines in ${country.name} will ask: "Would you like to be charged in USD/GBP/EUR with a guaranteed conversion rate?" Saying YES triggers a 6% to 10% predatory markup.`,
      actionStep: `Always choose "Continue Without Conversion" and pay or withdraw strictly in ${country.currency} (${country.currencySymbol}). Let Visa/Mastercard’s 0.2% wholesale network rate handle the conversion.`,
    },
    {
      title: '3. Segregate "Clean Capital" Principal from Post-Move Income Accounts',
      type: 'Legal Expat Tax Optimization',
      estimatedAnnualSavingsUSD: '$2,500 – $12,000 / year',
      description: `When moving to ${country.name} (especially in remittance-basis or worldwide tax jurisdictions), tax authorities treat mixed bank accounts as "income first" whenever you wire money into the country.`,
      actionStep: `Before your residency starts, place your existing post-tax savings into Account A ("Pre-Move Principal") and route all new dividends, interest, and pensions into Account B. Remit living or property funds from Account A completely tax-free.`,
    },
    {
      title: `4. Batch Transfers Quarterly & Use Limit Orders on FX Spikes`,
      type: 'Remittance & FX Fee Saver',
      estimatedAnnualSavingsUSD: '$600 – $1,500 / year',
      description: `Converting money automatically on the 1st of every month exposes you to short-term currency dips and 12 separate fixed wire fees per year.`,
      actionStep: `Keep a 3-to-6 month buffer in your local ${country.name} bank account and set an automated "Target Rate Limit Order" on Wise or OFX so your USD/EUR converts automatically when the exchange rate hits a 90-day high.`,
    },
    {
      title: '5. Harvest Capital Gains & Roth Conversions Before Day 183 of Residency',
      type: 'Legal Expat Tax Optimization',
      estimatedAnnualSavingsUSD: '$3,000 – $25,000+ one-time',
      description: `Many foreign jurisdictions do not recognize the tax-free status of US Roth IRAs, UK ISAs, or Canadian TFSAs—and tax historic unrealized stock gains based on original purchase price.`,
      actionStep: `Before spending 183 days in ${country.name}, sell appreciated ETFs/stocks and immediately re-buy them ("bed and breakfasting") to reset your cost basis to current market value prior to becoming a local tax resident.`,
    },
    {
      title: `6. Register Inbound Property Wires Properly with the Central Bank`,
      type: 'Legal Expat Tax Optimization',
      estimatedAnnualSavingsUSD: 'Protects 100% of Property Resale Capital',
      description: `In many countries, if you wire $150,000+ for a condo or villa as a casual personal transfer instead of an official "Foreign Real Estate Investment Wire," you face delays or penalties when selling the property later.`,
      actionStep: `When wiring property or visa-deposit capital into ${country.name}, instruct the receiving local bank’s FX desk to issue an official Foreign Exchange Investment Certificate (e.g., FET Form / Formulario 4 / Bank Certificate) in your name.`,
    },
  ];

  const accountOpeningChecklist = [
    `1. Obtain your local tax identification number (${localTaxIdName})—required before opening any resident or non-resident checking account in ${country.name}.`,
    `2. Bring your valid passport + 2 secondary IDs, apostilled proof of retirement/pension income (last 3–6 months of bank statements), and a local residential lease or utility bill.`,
    `3. US Citizens (FATCA Compliance): Bring your US Social Security Number and a signed IRS Form W-9; choose Tier-1 banks in ${country.capital} or ${country.topCities[0]?.name || country.capital} that have a dedicated FATCA compliance desk.`,
    `4. Keep your home-country phone number active on a low-cost eSIM (e.g., Tello, Google Fi, or Ultra Mobile at $5–$10/mo) so you never get locked out of 2-Factor Authentication (2FA) SMS codes from your home banks.`,
    `5. File annual foreign bank account disclosures if required by your home country (e.g., US FinCEN Form 114 "FBAR" if aggregate accounts in ${country.name} exceed $10,000 USD at any point during the calendar year).`,
  ];

  return {
    countryId: country.id,
    countryName: country.name,
    taxRegimeClassification,
    headlineSummary: `Comprehensive banking, cross-border remittance cost benchmarks, and expat retirement tax rules for relocating to ${country.name} (${country.currency}).`,
    inboundRemittanceTaxedVerdict,
    inboundRemittanceExplanation,
    localTaxIdName,
    depositInsuranceLimit,
    centralBankReportingThreshold,
    averageMonthlyFxCostOn3000USD: 148,
    fintechCostOn3000USD: 16,
    banks,
    accountOpeningChecklist,
    remittanceChannels,
    taxRulesMatrix,
    savingStrategies,
  };
}

import { Country } from '../types';

export type ContinentFilter =
  | 'All'
  | 'Europe'
  | 'Americas'
  | 'North & Central America'
  | 'South America'
  | 'Southeast Asia'
  | 'Asia & Middle East'
  | 'Africa'
  | 'Oceania';

const EUROPE_IDS = new Set([
  'portugal', 'spain', 'greece', 'italy', 'france', 'cyprus', 'malta',
  'croatia', 'slovenia', 'ireland', 'turkey', 'albania', 'montenegro',
  'bulgaria', 'hungary', 'austria', 'switzerland', 'czech-republic',
  'georgia', 'andorra', 'romania', 'poland', 'estonia', 'serbia',
  'slovakia', 'monaco', 'united-kingdom', 'germany', 'netherlands',
  'belgium', 'latvia', 'lithuania', 'north-macedonia',
  'bosnia-and-herzegovina', 'armenia', 'luxembourg', 'finland',
  'gibraltar', 'san-marino', 'liechtenstein', 'sweden', 'denmark',
  'norway', 'iceland', 'moldova', 'kosovo', 'ukraine', 'belarus',
  'russia', 'azerbaijan', 'vatican-city', 'jersey', 'guernsey',
  'isle-of-man', 'faroe-islands',
]);

const SOUTH_AMERICA_IDS = new Set([
  'colombia', 'ecuador', 'uruguay', 'chile', 'argentina', 'peru',
  'brazil', 'paraguay', 'bolivia', 'guyana', 'suriname', 'venezuela',
  'french-guiana', 'falkland-islands',
]);

const NORTH_CENTRAL_CARIBBEAN_IDS = new Set([
  'costa-rica', 'panama', 'mexico', 'belize', 'dominican-republic',
  'guatemala', 'nicaragua', 'honduras', 'barbados', 'bahamas',
  'curacao', 'el-salvador', 'st-kitts-and-nevis', 'aruba',
  'cayman-islands', 'jamaica', 'saint-lucia', 'grenada',
  'antigua-and-barbuda', 'bermuda', 'turks-and-caicos', 'dominica',
  'canada', 'puerto-rico', 'us-virgin-islands', 'bonaire',
  'sint-maarten', 'anguilla', 'british-virgin-islands', 'martinique',
  'guadeloupe', 'trinidad-and-tobago', 'united-states',
  'saint-vincent-and-the-grenadines', 'cuba', 'haiti', 'st-barts',
  'montserrat', 'greenland', 'saint-pierre-and-miquelon',
]);

const SOUTHEAST_ASIA_IDS = new Set([
  'thailand', 'malaysia', 'philippines', 'vietnam', 'indonesia',
  'cambodia', 'laos', 'singapore', 'brunei', 'timor-leste',
  'myanmar', 'christmas-island',
]);

const EAST_SOUTH_ASIA_MIDDLE_EAST_IDS = new Set([
  'taiwan', 'sri-lanka', 'japan', 'south-korea', 'india', 'nepal',
  'maldives', 'hong-kong', 'united-arab-emirates', 'oman', 'jordan',
  'bahrain', 'qatar', 'saudi-arabia', 'kuwait', 'china', 'macau',
  'kazakhstan', 'uzbekistan', 'kyrgyzstan', 'bhutan', 'mongolia',
  'tajikistan', 'turkmenistan',
]);

const AFRICA_IDS = new Set([
  'mauritius', 'morocco', 'south-africa', 'seychelles', 'tunisia',
  'namibia', 'cape-verde', 'kenya', 'tanzania', 'botswana', 'rwanda',
  'ghana', 'senegal', 'egypt', 'zambia', 'gambia', 'uganda',
  'madagascar', 'reunion', 'cote-divoire', 'benin', 'togo',
  'sao-tome-and-principe', 'malawi', 'eswatini', 'lesotho',
  'algeria', 'angola', 'gabon', 'republic-of-the-congo', 'cameroon',
  'comoros', 'djibouti', 'equatorial-guinea', 'ethiopia', 'guinea',
  'guinea-bissau', 'liberia', 'mauritania', 'sierra-leone',
  'zimbabwe', 'mozambique', 'saint-helena',
]);

const OCEANIA_IDS = new Set([
  'australia', 'new-zealand', 'fiji', 'vanuatu', 'french-polynesia',
  'samoa', 'cook-islands', 'palau', 'tonga', 'guam',
  'northern-mariana-islands', 'new-caledonia', 'norfolk-island',
  'micronesia', 'marshall-islands', 'solomon-islands', 'kiribati',
  'tuvalu', 'nauru', 'niue', 'american-samoa',
]);

export function getCountryContinentLabel(country: Country): string {
  const id = country.id;
  if (EUROPE_IDS.has(id)) return 'Europe';
  if (SOUTH_AMERICA_IDS.has(id)) return 'South America';
  if (NORTH_CENTRAL_CARIBBEAN_IDS.has(id)) return 'North & Central America';
  if (SOUTHEAST_ASIA_IDS.has(id)) return 'Southeast Asia';
  if (EAST_SOUTH_ASIA_MIDDLE_EAST_IDS.has(id)) return 'Asia & Middle East';
  if (AFRICA_IDS.has(id)) return 'Africa';
  if (OCEANIA_IDS.has(id)) return 'Oceania';
  return country.region;
}

export function matchesContinentFilter(country: Country, filter: string): boolean {
  if (!filter || filter === 'All') return true;
  const id = country.id;

  switch (filter) {
    case 'Europe':
      return EUROPE_IDS.has(id) || (!AFRICA_IDS.has(id) && !EAST_SOUTH_ASIA_MIDDLE_EAST_IDS.has(id) && country.region === 'Europe');
    case 'Americas':
      return SOUTH_AMERICA_IDS.has(id) || NORTH_CENTRAL_CARIBBEAN_IDS.has(id) || country.region === 'Americas';
    case 'North & Central America':
      return NORTH_CENTRAL_CARIBBEAN_IDS.has(id);
    case 'South America':
      return SOUTH_AMERICA_IDS.has(id);
    case 'Southeast Asia':
      return SOUTHEAST_ASIA_IDS.has(id);
    case 'Asia & Middle East':
      return SOUTHEAST_ASIA_IDS.has(id) || EAST_SOUTH_ASIA_MIDDLE_EAST_IDS.has(id);
    case 'Africa':
      return AFRICA_IDS.has(id);
    case 'Oceania':
      return OCEANIA_IDS.has(id);
    default:
      return country.region === filter;
  }
}

export const CONTINENT_FILTER_OPTIONS: { value: ContinentFilter; label: string }[] = [
  { value: 'All', label: 'All Continents' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Americas', label: 'Americas (All)' },
  { value: 'North & Central America', label: 'North & Central America' },
  { value: 'South America', label: 'South America' },
  { value: 'Southeast Asia', label: 'Southeast Asia' },
  { value: 'Asia & Middle East', label: 'Asia & Middle East' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Oceania', label: 'Oceania' },
];

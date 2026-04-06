// ======== CONFIG ========
const CONFIG = {
  maxFileSize: 10 * 1024 * 1024,
  sampleRows: 150,
  scanDuration: 2000,
  scanMessages: [
    'Detecting column types...',
    'Checking for case issues...',
    'Scanning phone numbers...',
    'Identifying date formats...',
    'Looking for duplicates...',
    'Checking email validity...',
    'Analysing address patterns...',
    'Mapping state and city codes...',
    'Building your cleaning plan...'
  ],
  stateFuzzyThreshold: 0.8,
  cityFuzzyThreshold: 0.8,
  duplicateSimilarityThreshold: 0.85,
  previewRows: 20,
  reviewKeepOriginalOnFlaggedFailure: true
};

const appState = {
  currentScreen: 1,
  sourceFileName: 'sample_data.xlsx',
  rawRows: [],
  headers: [],
  columnProfiles: [],
  selectedColumns: new Set(),
  cleaningConfig: {
    dateFormat: 'DD-MM-YYYY',
    nameFormat: 'titleCase',
    phoneFormat: 'raw',
    duplicateAction: 'keepFirst'
  },
  processed: null,
  scanTimer: null,
  scanMessageTimer: null
};

const DOM = {};

// ======== STATE INTELLIGENCE ========
const STATE_INTELLIGENCE = {
  'tn': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'tamil nadu': 'Tamil Nadu',
  'tamilnad': 'Tamil Nadu',
  'madras state': 'Tamil Nadu',
  'ap': 'Andhra Pradesh',
  'andhrapradesh': 'Andhra Pradesh',
  'andhra pradesh': 'Andhra Pradesh',
  'andhra': 'Andhra Pradesh',
  'kl': 'Kerala',
  'kerala': 'Kerala',
  'kerela': 'Kerala',
  'kerla': 'Kerala',
  "god's own country": 'Kerala',
  'ka': 'Karnataka',
  'karnataka': 'Karnataka',
  'karnatka': 'Karnataka',
  'karnатака': 'Karnataka',
  'mysore state': 'Karnataka',
  'bangalorestate': 'Karnataka',
  'mh': 'Maharashtra',
  'maharashtra': 'Maharashtra',
  'maharastra': 'Maharashtra',
  'maha': 'Maharashtra',
  'bombay state': 'Maharashtra',
  'dl': 'Delhi',
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'nct': 'Delhi',
  'nct of delhi': 'Delhi',
  'dilli': 'Delhi',
  'wb': 'West Bengal',
  'westbengal': 'West Bengal',
  'west bengal': 'West Bengal',
  'bengal': 'West Bengal',
  'bengal state': 'West Bengal',
  'gj': 'Gujarat',
  'gujarat': 'Gujarat',
  'gujrat': 'Gujarat',
  'rj': 'Rajasthan',
  'rajasthan': 'Rajasthan',
  'rajsthan': 'Rajasthan',
  'rajputana': 'Rajasthan',
  'up': 'Uttar Pradesh',
  'uttarpradesh': 'Uttar Pradesh',
  'uttar pradesh': 'Uttar Pradesh',
  'up state': 'Uttar Pradesh',
  'utter pradesh': 'Uttar Pradesh',
  'u p': 'Uttar Pradesh',
  'mp': 'Madhya Pradesh',
  'madhyapradesh': 'Madhya Pradesh',
  'madhya pradesh': 'Madhya Pradesh',
  'central province': 'Madhya Pradesh',
  'br': 'Bihar',
  'bihar': 'Bihar',
  'bih': 'Bihar',
  'od': 'Odisha',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'odhisha': 'Odisha',
  'tg': 'Telangana',
  'ts': 'Telangana',
  'telangana': 'Telangana',
  'telengana': 'Telangana',
  'telangna': 'Telangana',
  'pb': 'Punjab',
  'punjab': 'Punjab',
  'panjab': 'Punjab',
  'hr': 'Haryana',
  'haryana': 'Haryana',
  'hariyana': 'Haryana',
  'jh': 'Jharkhand',
  'jharkhand': 'Jharkhand',
  'jharkand': 'Jharkhand',
  'uk': 'Uttarakhand',
  'uttarakhand': 'Uttarakhand',
  'uttrakhand': 'Uttarakhand',
  'ukhand': 'Uttarakhand',
  'uttaranchal': 'Uttarakhand',
  'hp': 'Himachal Pradesh',
  'himachalpradesh': 'Himachal Pradesh',
  'himachal': 'Himachal Pradesh',
  'assam': 'Assam',
  'as': 'Assam',
  'asom': 'Assam',
  'cg': 'Chhattisgarh',
  'ct': 'Chhattisgarh',
  'chhattisgarh': 'Chhattisgarh',
  'chatisgarh': 'Chhattisgarh',
  'chhatisgarh': 'Chhattisgarh',
  'chattisgarh': 'Chhattisgarh',
  'ga': 'Goa',
  'goa': 'Goa',
  'tr': 'Tripura',
  'tripura': 'Tripura',
  'mn': 'Manipur',
  'manipur': 'Manipur',
  'ml': 'Meghalaya',
  'meghalaya': 'Meghalaya',
  'nl': 'Nagaland',
  'nagaland': 'Nagaland',
  'ar': 'Arunachal Pradesh',
  'arunachalpradesh': 'Arunachal Pradesh',
  'arunachal pradesh': 'Arunachal Pradesh',
  'arunachal': 'Arunachal Pradesh',
  'mz': 'Mizoram',
  'mizoram': 'Mizoram',
  'sk': 'Sikkim',
  'sikkim': 'Sikkim',
  'jk': 'Jammu & Kashmir',
  'j&k': 'Jammu & Kashmir',
  'jammu kashmir': 'Jammu & Kashmir',
  'jammu and kashmir': 'Jammu & Kashmir',
  'ld': 'Lakshadweep',
  'lakshadweep': 'Lakshadweep',
  'py': 'Puducherry',
  'pondicherry': 'Puducherry',
  'pondi': 'Puducherry',
  'puducherry': 'Puducherry',
  'ch': 'Chandigarh',
  'chandigarh': 'Chandigarh',
  'an': 'Andaman & Nicobar',
  'andaman': 'Andaman & Nicobar',
  'dd': 'Dadra & Nagar Haveli',
  'dn': 'Dadra & Nagar Haveli',
  'la': 'Ladakh',
  'ladakh': 'Ladakh'
};

const STATE_OFFICIAL_VALUES = [...new Set(Object.values(STATE_INTELLIGENCE))];
const stateFuse = new Fuse(STATE_OFFICIAL_VALUES.map((name) => ({ name })), {
  keys: ['name'],
  includeScore: true,
  threshold: 0.35
});

// ======== CITY INTELLIGENCE ========
const CITY_INTELLIGENCE = {
  'bombay': 'Mumbai',
  'mumabi': 'Mumbai',
  'mumbi': 'Mumbai',
  'mum': 'Mumbai',
  'mumbai': 'Mumbai',
  'dilli': 'Delhi',
  'new delhi': 'Delhi',
  'nd': 'Delhi',
  'delhi': 'Delhi',
  'new dilli': 'Delhi',
  'bangalore': 'Bengaluru',
  'bangaluru': 'Bengaluru',
  'bangalure': 'Bengaluru',
  'bengalore': 'Bengaluru',
  'banglore': 'Bengaluru',
  'blr': 'Bengaluru',
  'bengaluru': 'Bengaluru',
  'madras': 'Chennai',
  'chenai': 'Chennai',
  'channai': 'Chennai',
  'chn': 'Chennai',
  'chennai': 'Chennai',
  'hydrabad': 'Hyderabad',
  'hyderbad': 'Hyderabad',
  'hyd': 'Hyderabad',
  'hyderabad': 'Hyderabad',
  'secunderabad': 'Hyderabad',
  'calcutta': 'Kolkata',
  'kolkatta': 'Kolkata',
  'clacutta': 'Kolkata',
  'kkr': 'Kolkata',
  'kolkata': 'Kolkata',
  'poona': 'Pune',
  'puna': 'Pune',
  'pune': 'Pune',
  'ahemdabad': 'Ahmedabad',
  'ahamdabad': 'Ahmedabad',
  'ahemadabad': 'Ahmedabad',
  'ahd': 'Ahmedabad',
  'ahmedabad': 'Ahmedabad',
  'jaipure': 'Jaipur',
  'jaipr': 'Jaipur',
  'jaipur': 'Jaipur',
  'lko': 'Lucknow',
  'lucknow': 'Lucknow',
  'lakhnow': 'Lucknow',
  'chd': 'Chandigarh',
  'chandigarh': 'Chandigarh',
  'cochin': 'Kochi',
  'ernakulam': 'Kochi',
  'kochi': 'Kochi',
  'trivandrum': 'Thiruvananthapuram',
  'thiruvananthapuram': 'Thiruvananthapuram',
  'tvm': 'Thiruvananthapuram',
  'coimbatoor': 'Coimbatore',
  'cbe': 'Coimbatore',
  'kovai': 'Coimbatore',
  'coimbatore': 'Coimbatore',
  'vizag': 'Visakhapatnam',
  'vishakapatnam': 'Visakhapatnam',
  'visakhapatnam': 'Visakhapatnam',
  'vsp': 'Visakhapatnam',
  'nagpur': 'Nagpur',
  'nagpure': 'Nagpur',
  'surat': 'Surat',
  'suart': 'Surat',
  'patna': 'Patna',
  'patana': 'Patna',
  'bhopal': 'Bhopal',
  'bophal': 'Bhopal',
  'indore': 'Indore',
  'indor': 'Indore'
};

const CITY_OFFICIAL_VALUES = [...new Set(Object.values(CITY_INTELLIGENCE))];
const cityFuse = new Fuse(CITY_OFFICIAL_VALUES.map((name) => ({ name })), {
  keys: ['name'],
  includeScore: true,
  threshold: 0.35
});

// ======== EMAIL TYPOS DICTIONARY ========
const EMAIL_TYPOS = {
  gmial: 'gmail',
  gmal: 'gmail',
  gamil: 'gmail',
  yaho: 'yahoo',
  yahooo: 'yahoo',
  outlok: 'outlook',
  outllok: 'outlook',
  hotmal: 'hotmail',
  hotmial: 'hotmail',
  rediffmai: 'rediffmail',
  redifmail: 'rediffmail'
};

const MONTH_MAP = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12
};

const TYPE_LABELS = {
  NAME: 'Name',
  EMAIL: 'Email',
  PHONE: 'Phone',
  DATE: 'Date',
  ADDRESS: 'Address',
  CITY: 'City',
  STATE: 'State',
  PINCODE: 'Pincode',
  AMOUNT: 'Amount',
  PERCENTAGE: 'Percentage',
  GENDER: 'Gender',
  GENERAL_TEXT: 'General Text'
};

// ======== COLUMN TYPE DETECTION ========
function detectColumnType(columnName, sampleValues) {
  const name = normalizeKey(columnName);
  const values = sampleValues.filter((value) => !isBlank(value)).map((value) => String(value).trim());
  const joined = values.join(' | ').toLowerCase();
  const hasWords = (terms) => terms.some((term) => name.includes(term));
  const digitRatio = (text) => {
    const digits = (text.match(/\d/g) || []).length;
    return text ? digits / text.length : 0;
  };
  const mostlyNameLike = values.length > 0 && values.every((value) => {
    const words = value.split(/\s+/).filter(Boolean);
    return words.length >= 1 && words.length <= 5 && !value.includes('@') && digitRatio(value) < 0.3;
  });

  if (hasWords(['name', 'customer', 'client', 'person', 'employee', 'staff', 'contact', 'fname', 'lname', 'full name', 'first name', 'last name']) && mostlyNameLike) return 'NAME';
  if (hasWords(['email', 'mail', 'e-mail']) || values.some((value) => /@.+\./.test(value))) return 'EMAIL';
  if (hasWords(['phone', 'mobile', 'contact', 'cell', 'tel', 'ph', 'number', 'mob']) && values.some((value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12;
  })) return 'PHONE';
  if (
    hasWords(['date', 'dob', 'created', 'joined', 'birth', 'modified', 'timestamp', 'day']) ||
    values.some((value) => /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(value) || /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(value) || /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i.test(value))
  ) return 'DATE';
  if (hasWords(['address', 'addr', 'street', 'location', 'residence', 'locality', 'area', 'landmark']) || /(road|street|nagar|colony|sector|plot|flat|house|floor|building)/i.test(joined)) return 'ADDRESS';
  if (hasWords(['city', 'town', 'district']) && values.some((value) => /^[A-Za-z\s]{1,30}$/.test(value) && value.trim().split(/\s+/).length <= 3)) return 'CITY';
  if (hasWords(['state', 'province']) && values.some((value) => !!STATE_INTELLIGENCE[cleanLookupValue(value)] || STATE_OFFICIAL_VALUES.includes(toTitleCase(value)))) return 'STATE';
  if (hasWords(['pin', 'pincode', 'postal', 'zip']) || values.some((value) => /^\d{6}$/.test(value))) return 'PINCODE';
  if (hasWords(['amount', 'revenue', 'salary', 'price', 'cost', 'fee', 'payment', 'value', 'income', 'total', 'budget', 'sales', 'ctc']) || values.some((value) => /[₹$]|^\d{1,3}(,\d{2,3})+/.test(value))) return 'AMOUNT';
  if (hasWords(['percent', 'rate', 'ratio', 'growth', 'margin']) || values.some((value) => /%$/.test(String(value).trim()) || isPercentageLike(value))) return 'PERCENTAGE';
  if (hasWords(['gender', 'sex']) && values.some((value) => /^(m|f|male|female|boy|girl|other)$/i.test(value))) return 'GENDER';
  return 'GENERAL_TEXT';
}

function analyzeDataset(rows, headers) {
  const profiles = headers.map((header, index) => {
    const values = rows.map((row) => row[header]);
    const sampleValues = getFirstNonNullValues(values, 4);
    const detectedType = detectColumnType(header, sampleValues);
    const nonEmptyCount = values.filter((value) => !isBlank(value)).length;
    return {
      index,
      name: header,
      detectedType,
      overrideType: detectedType,
      issues: inspectColumnIssues(header, values, detectedType),
      selected: true,
      sampleValues,
      nonEmptyCount,
      uncertain: detectedType === 'GENERAL_TEXT' || nonEmptyCount === 0
    };
  });
  appState.columnProfiles = profiles;
  appState.selectedColumns = new Set(profiles.map((profile) => profile.name));
  return profiles;
}

function inspectColumnIssues(columnName, values, detectedType) {
  const counts = new Map();
  const add = (label) => counts.set(label, (counts.get(label) || 0) + 1);

  values.forEach((value) => {
    if (isBlank(value)) return;
    const text = String(value);
    if (text.trim() !== text) add('values with extra spaces');
    if (/\s{2,}/.test(text)) add('values with repeated spaces');
    if (detectedType === 'NAME') {
      if (/[0-9]/.test(text) || /[^A-Za-z\s.'-]/.test(text)) add('invalid symbols detected');
      if (text === text.toUpperCase() || text === text.toLowerCase()) add('values in wrong case');
    } else if (detectedType === 'EMAIL') {
      if (!/@.+\./.test(text.replace(/\s/g, ''))) add('invalid formats detected');
    } else if (detectedType === 'PHONE') {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 12) add('invalid formats detected');
      else if (!/^[6789]/.test(digits.slice(-10))) add('numbers with invalid prefixes');
    } else if (detectedType === 'DATE') {
      if (!parseDateValue(text, inferDatePreference(values), columnName).valid) add('unreadable dates');
    } else if (detectedType === 'ADDRESS') {
      if (!/\d{6}$/.test(text.trim())) add('values missing pincode');
    } else if (detectedType === 'STATE') {
      if (!STATE_INTELLIGENCE[cleanLookupValue(text)] && !STATE_OFFICIAL_VALUES.includes(toTitleCase(text))) add('unknown state variants');
    } else if (detectedType === 'CITY') {
      if (!CITY_INTELLIGENCE[cleanLookupValue(text)] && !CITY_OFFICIAL_VALUES.includes(toTitleCase(text))) add('spelling variations detected');
    } else if (detectedType === 'AMOUNT') {
      if (/[₹$]|rs\.?|lak|crore|cr|k/i.test(text)) add('format inconsistencies');
    }
  });

  return [...counts.entries()].map(([label, count]) => ({ label, count }));
}

// ======== CLEANING FUNCTIONS ========
function cleanName(value, format = 'titleCase') {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank name kept blank' };
    const original = String(value);
    let cleaned = original.trim().replace(/\s+/g, ' ').replace(/\d/g, '').replace(/[^A-Za-z\s.'-]/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.split(' ').map((word) => standardizePrefix(word)).join(' ');
    if (format === 'upperCase') cleaned = cleaned.toUpperCase();
    else if (format === 'lowerCase') cleaned = cleaned.toLowerCase();
    else {
      cleaned = cleaned.split(' ').map((word) => {
        if (/^(Mr\.|Mrs\.|Dr\.|Prof\.)$/i.test(word)) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase().replace(/\.$/, '') + '.';
        return word.split(/([-'`])/).map((part) => /^[A-Za-z]+$/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part).join('');
      }).join(' ');
    }
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
    const flags = [];
    if (cleaned.length < 2) flags.push('Too short');
    if (wordCount > 6) flags.push('Possibly an address in name field');
    return { cleaned, status: flags.length ? 'flagged' : (cleaned === original ? 'unchanged' : 'fixed'), rule: flags[0] || 'Normalized spacing, symbols, and name case' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Name cleaning failed' };
  }
}

function cleanEmail(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank email kept blank' };
    const original = String(value);
    let cleaned = original.replace(/\s+/g, '').toLowerCase().replace(/[^a-z0-9@._\-+]/g, '');
    let typoFixed = false;
    const parts = cleaned.split('@');
    if (parts.length === 2) {
      const [local, domainRaw] = parts;
      const domainParts = domainRaw.split('.');
      if (domainParts.length >= 2 && EMAIL_TYPOS[domainParts[0]]) {
        domainParts[0] = EMAIL_TYPOS[domainParts[0]];
        typoFixed = true;
      }
      cleaned = `${local}@${domainParts.join('.')}`;
    }
    const valid = /^[a-z0-9._\-+]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned) && cleaned.split('@').length === 2;
    if (!valid) return { cleaned: original, status: 'flagged', rule: 'Invalid email' };
    return { cleaned, status: typoFixed ? 'flagged' : (cleaned === original ? 'unchanged' : 'fixed'), rule: typoFixed ? 'Domain typo corrected' : 'Normalized email casing and spacing' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Email cleaning failed' };
  }
}

function cleanPhone(value, format = 'raw') {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank phone kept blank' };
    const original = String(value);
    let digits = original.trim().replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
    if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
    if (digits.length !== 10 || !/^[6789]/.test(digits)) return { cleaned: original, status: 'flagged', rule: 'Invalid phone number' };
    let cleaned = digits;
    if (format === 'spaced') cleaned = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (format === 'dashed') cleaned = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return { cleaned, status: cleaned === original ? 'unchanged' : 'fixed', rule: 'Normalized phone digits and format' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Phone cleaning failed' };
  }
}

function cleanDate(value, outputFormat = 'DD-MM-YYYY', context = {}) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank date kept blank' };
    const parsed = parseDateValue(value, context.preferredDateOrder, context.columnName);
    if (!parsed.valid) return { cleaned: String(value), status: 'flagged', rule: parsed.reason || 'Invalid date' };
    const cleaned = formatDateParts(parsed.day, parsed.month, parsed.year, outputFormat);
    const flags = [];
    if (parsed.year < 1900 || parsed.year > 2100) flags.push('Year out of range');
    if (context.isDob && parsed.dateObj > new Date()) flags.push('DOB in future');
    return { cleaned, status: flags.length ? 'flagged' : (cleaned === String(value) ? 'unchanged' : 'fixed'), rule: flags[0] || `Standardized date to ${outputFormat}` };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Date cleaning failed' };
  }
}

function cleanAddress(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank address kept blank' };
    const original = String(value);
    const lowerWords = new Set(['and', 'of', 'near', 'opp', 'behind', 'next', 'to', 'the', 'in', 'at', 'by']);
    const replacements = { rd: 'Road', st: 'Street', ave: 'Avenue', apt: 'Apartment', blvd: 'Boulevard', nr: 'Near', opp: 'Opposite', soc: 'Society' };
    let cleaned = original.trim().replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\b(\d+\s*)([A-Za-z])/g, '$1, $2');
    cleaned = cleaned.split(/\s+/).map((word, index) => {
      const plain = word.replace(/[.,]/g, '').toLowerCase();
      if (replacements[plain]) return replacements[plain];
      if (lowerWords.has(plain) && index !== 0) return plain;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    cleaned = cleaned.replace(/\s*,\s*/g, ', ').replace(/,\s*,+/g, ', ').replace(/\s{2,}/g, ' ').trim();
    const flags = [];
    if (!/\d{6}$/.test(cleaned)) flags.push('Pincode missing');
    if (cleaned.length < 10) flags.push('Too short');
    return { cleaned, status: flags.length ? 'flagged' : (cleaned === original ? 'unchanged' : 'fixed'), rule: flags[0] || 'Normalized address case, punctuation, and abbreviations' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Address cleaning failed' };
  }
}

function cleanAmount(value, stats = {}) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank amount kept blank' };
    const original = String(value).trim();
    const parsed = parseAmount(original);
    if (parsed === null || Number.isNaN(parsed)) return { cleaned: original, status: 'flagged', rule: 'Invalid amount' };
    const rounded = Math.round(parsed * 100) / 100;
    const flags = [];
    if (rounded < 0) flags.push('Negative amount — verify');
    if (rounded === 0) flags.push('Zero value — verify');
    if (typeof stats.mean === 'number' && typeof stats.stddev === 'number' && stats.stddev > 0) {
      if (rounded > stats.mean + (3 * stats.stddev)) flags.push('Unusually high');
      if (rounded < stats.mean - (3 * stats.stddev) && rounded > 0) flags.push('Unusually low');
    }
    const cleaned = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
    return { cleaned, status: flags.length ? 'flagged' : (cleaned === original ? 'unchanged' : 'fixed'), rule: flags[0] || 'Standardized numeric amount' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Amount cleaning failed' };
  }
}

function cleanGender(value) {
  try {
    if (isBlank(value)) return { cleaned: 'Not Specified', status: 'fixed', rule: 'Blank gender standardized' };
    const original = String(value).trim();
    const normalized = normalizeKey(original);
    const mappings = {
      Male: ['m', 'male', 'man', 'boy', 'gents'],
      Female: ['f', 'female', 'woman', 'girl', 'ladies'],
      Other: ['other', 'others', 'transgender', 'non binary', 'nonbinary', 'nb'],
      'Not Specified': ['', 'null', '-', '?', 'na', 'n a', 'not specified', 'prefer not to say']
    };
    let cleaned = 'Not Specified';
    Object.entries(mappings).forEach(([label, options]) => {
      if (options.includes(normalized)) cleaned = label;
    });
    if (cleaned === 'Not Specified' && !mappings['Not Specified'].includes(normalized) && !mappings.Male.includes(normalized) && !mappings.Female.includes(normalized) && !mappings.Other.includes(normalized)) {
      cleaned = toTitleCase(original);
    }
    return { cleaned, status: cleaned === original ? 'unchanged' : 'fixed', rule: 'Standardized gender values' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Gender cleaning failed' };
  }
}

function cleanState(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank state kept blank' };
    const original = String(value).trim();
    const normalized = cleanLookupValue(original);
    if (STATE_INTELLIGENCE[normalized]) {
      const cleaned = STATE_INTELLIGENCE[normalized];
      return { cleaned, status: cleaned === original ? 'unchanged' : 'fixed', rule: 'Expanded state variation' };
    }
    const fuzzy = stateFuse.search(toTitleCase(original), { limit: 1 })[0];
    if (fuzzy && (1 - (fuzzy.score ?? 1)) >= CONFIG.stateFuzzyThreshold) {
      return { cleaned: fuzzy.item.name, status: 'flagged', rule: 'Auto-corrected (verify)' };
    }
    return { cleaned: original, status: 'flagged', rule: 'Unknown state' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'State cleaning failed' };
  }
}

function cleanCity(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank city kept blank' };
    const original = String(value).trim();
    const normalized = cleanLookupValue(original);
    if (CITY_INTELLIGENCE[normalized]) {
      const cleaned = CITY_INTELLIGENCE[normalized];
      return { cleaned, status: cleaned === original ? 'unchanged' : 'fixed', rule: 'Normalized city variation' };
    }
    const fuzzy = cityFuse.search(toTitleCase(original), { limit: 1 })[0];
    if (fuzzy && (1 - (fuzzy.score ?? 1)) >= CONFIG.cityFuzzyThreshold) {
      return { cleaned: fuzzy.item.name, status: 'flagged', rule: 'Auto-corrected (verify)' };
    }
    const cleaned = toTitleCase(original);
    return { cleaned, status: cleaned === original ? 'unchanged' : 'fixed', rule: 'City formatting normalized' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'City cleaning failed' };
  }
}

function cleanPincode(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank pincode kept blank' };
    const original = String(value);
    const digits = original.replace(/\D/g, '');
    if (/^\d{6}$/.test(digits)) return { cleaned: digits, status: digits === original ? 'unchanged' : 'fixed', rule: 'Normalized pincode digits' };
    return { cleaned: original, status: 'flagged', rule: 'Invalid pincode' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Pincode cleaning failed' };
  }
}

function cleanPercentage(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank percentage kept blank' };
    const original = String(value).trim();
    const numeric = parseFloat(original.replace('%', ''));
    if (Number.isNaN(numeric)) return { cleaned: original, status: 'flagged', rule: 'Invalid percentage' };
    const flags = [];
    if (numeric < 0 || numeric > 100) flags.push('Percentage out of range');
    const cleaned = `${numeric.toFixed(numeric % 1 === 0 ? 0 : 2)}%`;
    return { cleaned, status: flags.length ? 'flagged' : (cleaned === original ? 'unchanged' : 'fixed'), rule: flags[0] || 'Normalized percentage format' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Percentage cleaning failed' };
  }
}

function cleanGeneralText(value) {
  try {
    if (isBlank(value)) return { cleaned: '', status: 'unchanged', rule: 'Blank value kept blank' };
    const original = String(value);
    const cleaned = original.trim().replace(/\s+/g, ' ');
    return { cleaned, status: cleaned === original ? 'unchanged' : 'fixed', rule: 'Trimmed and normalized spacing' };
  } catch (error) {
    return { cleaned: value ?? '', status: 'flagged', rule: 'Text cleaning failed' };
  }
}

function cleanValueByType(type, value, context = {}) {
  switch (type) {
    case 'NAME': return cleanName(value, context.nameFormat);
    case 'EMAIL': return cleanEmail(value);
    case 'PHONE': return cleanPhone(value, context.phoneFormat);
    case 'DATE': return cleanDate(value, context.dateFormat, context);
    case 'ADDRESS': return cleanAddress(value);
    case 'STATE': return cleanState(value);
    case 'CITY': return cleanCity(value);
    case 'PINCODE': return cleanPincode(value);
    case 'AMOUNT': return cleanAmount(value, context.amountStats);
    case 'PERCENTAGE': return cleanPercentage(value);
    case 'GENDER': return cleanGender(value);
    default: return cleanGeneralText(value);
  }
}

// ======== DUPLICATE DETECTION ========
function findDuplicates(rows, keyColIndex) {
  const headers = appState.headers;
  const keyColumn = headers[keyColIndex] || headers[0];
  const exactGroups = new Map();

  rows.forEach((row, index) => {
    const normalized = normalizeDuplicateKey(row[keyColumn]);
    if (!normalized) return;
    if (!exactGroups.has(normalized)) exactGroups.set(normalized, []);
    exactGroups.get(normalized).push(index);
  });

  const exactDuplicates = [];
  exactGroups.forEach((indexes, key) => {
    if (indexes.length > 1) exactDuplicates.push({ key, indexes });
  });

  const uniqueKeys = [...exactGroups.keys()];
  const fuse = new Fuse(uniqueKeys.map((value) => ({ value })), { keys: ['value'], includeScore: true, threshold: 0.2 });
  const fuzzyPairs = [];
  const seenPairs = new Set();

  uniqueKeys.forEach((value) => {
    fuse.search(value, { limit: 5 }).forEach((match) => {
      const other = match.item.value;
      if (other === value) return;
      const similarity = 1 - (match.score ?? 1);
      const pairKey = [value, other].sort().join('|');
      if (similarity > CONFIG.duplicateSimilarityThreshold && !seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        fuzzyPairs.push({ values: [value, other], similarity });
      }
    });
  });

  const duplicateRowIndexes = new Set();
  exactDuplicates.forEach((group) => {
    const keepIndex = appState.cleaningConfig.duplicateAction === 'keepLast' ? group.indexes[group.indexes.length - 1] : group.indexes[0];
    group.indexes.forEach((index) => {
      if (appState.cleaningConfig.duplicateAction !== 'highlightOnly' && index !== keepIndex) duplicateRowIndexes.add(index);
    });
  });

  const highlightedDuplicateIndexes = new Set();
  exactDuplicates.forEach((group) => group.indexes.forEach((index) => highlightedDuplicateIndexes.add(index)));

  return { keyColumn, exactDuplicates, fuzzyPairs, duplicateRowIndexes, highlightedDuplicateIndexes };
}

// ======== DATA PROCESSING ORCHESTRATOR ========
function processDataset() {
  if (!appState.rawRows.length || !appState.headers.length) return;
  const profiles = appState.columnProfiles;
  const keyColIndex = determineDuplicateKeyColumn(profiles);
  const duplicateInfo = findDuplicates(appState.rawRows, keyColIndex);
  const amountStatsByColumn = buildAmountStats(appState.rawRows, profiles);
  const datePreferences = buildDatePreferences(appState.rawRows, profiles);
  const stats = { totalCellsCleaned: 0, issuesAutoFixed: 0, cellsFlagged: 0, duplicatesRemoved: duplicateInfo.duplicateRowIndexes.size, rowsCleaned: 0 };
  const columnSummary = profiles.map((profile) => ({ name: profile.name, type: profile.overrideType, issuesFound: sumCounts(profile.issues), fixed: 0, flagged: 0 }));

  const processedRows = appState.rawRows.map((row, rowIndex) => {
    const original = {};
    const cleaned = {};
    const cellMeta = {};
    let rowHasFixed = false;
    let rowHasFlagged = false;

    profiles.forEach((profile, profileIndex) => {
      const header = profile.name;
      const originalValue = row[header];
      original[header] = originalValue;
      if (!profile.selected) {
        cleaned[header] = originalValue;
        cellMeta[header] = { status: 'unchanged', rule: 'Column skipped', original: originalValue, cleaned: originalValue };
        return;
      }
      const context = {
        nameFormat: appState.cleaningConfig.nameFormat,
        phoneFormat: appState.cleaningConfig.phoneFormat,
        dateFormat: appState.cleaningConfig.dateFormat,
        preferredDateOrder: datePreferences[header],
        columnName: header,
        isDob: /dob|birth/i.test(header),
        amountStats: amountStatsByColumn[header]
      };
      const result = cleanValueByType(profile.overrideType, originalValue, context);
      const finalValue = result.status === 'flagged' && String(result.cleaned) === String(originalValue) ? originalValue : result.cleaned;
      cleaned[header] = finalValue;
      cellMeta[header] = { ...result, original: originalValue, cleaned: finalValue };
      if (result.status === 'fixed') {
        rowHasFixed = true;
        stats.totalCellsCleaned += 1;
        stats.issuesAutoFixed += 1;
        columnSummary[profileIndex].fixed += 1;
      } else if (result.status === 'flagged') {
        rowHasFlagged = true;
        stats.cellsFlagged += 1;
        columnSummary[profileIndex].flagged += 1;
      }
    });

    if (rowHasFixed) stats.rowsCleaned += 1;
    return {
      rowNumber: rowIndex + 1,
      original,
      cleaned,
      cellMeta,
      duplicate: duplicateInfo.highlightedDuplicateIndexes.has(rowIndex),
      removedAsDuplicate: duplicateInfo.duplicateRowIndexes.has(rowIndex),
      rowStatus: rowHasFlagged ? 'flagged' : (rowHasFixed ? 'fixed' : 'unchanged')
    };
  });

  appState.processed = { processedRows, duplicateInfo, stats, columnSummary };
  renderComparison();
  renderSuccessScreen();
}

function determineDuplicateKeyColumn(profiles) {
  const preferred = ['customer id', 'id', 'full name', 'name', 'email', 'mobile', 'phone'];
  for (const candidate of preferred) {
    const match = profiles.find((profile) => normalizeKey(profile.name) === candidate || normalizeKey(profile.name).includes(candidate));
    if (match) return match.index;
  }
  return 0;
}

function buildAmountStats(rows, profiles) {
  const output = {};
  profiles.forEach((profile) => {
    if (profile.overrideType !== 'AMOUNT') return;
    const numericValues = rows.map((row) => parseAmount(row[profile.name])).filter((value) => typeof value === 'number' && !Number.isNaN(value));
    output[profile.name] = calculateMeanStdDev(numericValues);
  });
  return output;
}

function buildDatePreferences(rows, profiles) {
  const output = {};
  profiles.forEach((profile) => {
    if (profile.overrideType !== 'DATE') return;
    output[profile.name] = inferDatePreference(rows.map((row) => row[profile.name]));
  });
  return output;
}

// ======== EXCEL FILE READER ========
async function readUploadedFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (!['csv', 'xlsx', 'xls'].includes(extension)) {
    showToast('Invalid file format — please upload .csv or .xlsx', 'error');
    return;
  }
  if (file.size > CONFIG.maxFileSize) {
    showToast('File is too large — please keep it under 10MB', 'error');
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    initializeDataset(rows, file.name);
  } catch (error) {
    showToast('We could not read that file. Please try another one.', 'error');
  }
}

function initializeDataset(rows, fileName) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const headers = normalizedRows.length ? Object.keys(normalizedRows[0]) : [];
  if (!headers.length) {
    showToast('The file appears empty. Please upload a file with headers.', 'error');
    return;
  }
  appState.sourceFileName = fileName || 'clean_data.xlsx';
  appState.rawRows = normalizedRows.map((row) => {
    const normalizedRow = {};
    headers.forEach((header) => {
      normalizedRow[header] = row[header] ?? '';
    });
    return normalizedRow;
  });
  appState.headers = headers;
  appState.processed = null;
  analyzeDataset(appState.rawRows, appState.headers);
  renderDetectionScreen();
  showToast(`File loaded — ${appState.rawRows.length} rows detected`, 'success');
  startScanSequence();
}

// ======== EXCEL FILE WRITER (CLEAN ONLY) ========
function downloadCleanedFile() {
  if (!appState.processed) return;
  const exportRows = appState.processed.processedRows.filter((row) => !row.removedAsDuplicate).map((row) => row.cleaned);
  const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: appState.headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');
  const baseName = appState.sourceFileName.replace(/\.(csv|xlsx|xls)$/i, '');
  XLSX.writeFile(workbook, `cleaned_${baseName}.xlsx`);
  showToast('Cleaned file downloaded successfully', 'success');
  navigate(6);
}

// ======== SAMPLE DATA GENERATOR ========
function generateSampleData() {
  const firstNames = ['Rajan', 'Priya', 'Amit', 'Sneha', 'Karthik', 'Neha', 'Vikram', 'Ananya', 'Rohit', 'Isha', 'Arjun', 'Meera'];
  const lastNames = ['Kumar', 'Mehta', 'Sharma', 'Reddy', 'Iyer', 'Patel', 'Singh', 'Nair', 'Gupta', 'Jain', 'Verma', 'Das'];
  const cityVariants = [
    ['bangalure', 'bangalore', 'Bengaluru'],
    ['mumabi', 'Bombay', 'mumbai'],
    ['chenai', 'Madras', 'chennai'],
    ['hydrabad', 'Hyd', 'Hyderabad'],
    ['puna', 'Poona', 'Pune'],
    ['ahemdabad', 'Ahmedabad', 'ahd'],
    ['jaipure', 'Jaipur', 'jaipr'],
    ['lakhnow', 'Lucknow', 'lko'],
    ['cochin', 'Kochi', 'ernakulam'],
    ['vizag', 'Visakhapatnam', 'vsp']
  ];
  const stateVariants = [
    ['TN', 'tn', 'Tamilnadu', 'Tamil Nadu'],
    ['AP', 'ap', 'Andhra', 'Andhra Pradesh'],
    ['KL', 'kl', 'Kerela', 'Kerala'],
    ['MH', 'mh', 'Maharastra', 'Maharashtra'],
    ['KA', 'ka', 'Bangalorestate', 'Karnataka'],
    ['UP', 'up', 'Utter Pradesh', 'Uttar Pradesh'],
    ['WB', 'wb', 'Bengal', 'West Bengal'],
    ['GJ', 'gj', 'Gujrat', 'Gujarat'],
    ['TS', 'tg', 'Telengana', 'Telangana'],
    ['DL', 'dilli', 'NCT', 'Delhi']
  ];
  const genders = ['M', 'F', 'Male', 'FEMALE', 'female', 'male', 'Boy', 'Girl', 'm', 'f'];
  const addresses = [
    '12 lake view rd anna nagar chennai 600040',
    '45, MG Road, Pune 411001',
    '108 sector 5 salt lake kolkata 700091',
    '22B Jubilee Hills Hyderabad',
    '7 north street madurai 625001',
    'Flat 3C Palm Residency Kochi 682020',
    'PLOT 88 GREEN PARK DELHI 110016',
    '14 residency road Bengaluru 560025',
    '301 river side colony surat 395003',
    '56 park avenue mumbai 400001'
  ];
  const rows = [];

  for (let index = 1; index <= CONFIG.sampleRows; index += 1) {
    const fname = pick(firstNames);
    const lname = pick(lastNames);
    const baseName = `${fname} ${lname}`;
    let fullName = baseName;
    const nameRand = Math.random();
    if (nameRand < 0.30) fullName = baseName.toUpperCase();
    else if (nameRand < 0.50) fullName = baseName.toLowerCase();
    else if (nameRand < 0.65) fullName = `${fname.toLowerCase()}.${lname.toLowerCase()}`;
    else if (nameRand < 0.75) fullName = `${fname}  ${lname}`;

    const phoneBase = `${randDigit([9, 8, 7, 6])}${randDigits(9)}`;
    let mobile = phoneBase;
    const phoneRand = Math.random();
    if (phoneRand < 0.25) mobile = `+91-${phoneBase.slice(0, 5)}-${phoneBase.slice(5)}`;
    else if (phoneRand < 0.45) mobile = `0${phoneBase}`;
    else if (phoneRand < 0.65) mobile = `${phoneBase.slice(0, 5)} ${phoneBase.slice(5)}`;
    else if (phoneRand > 0.90) mobile = randDigits(8);

    const domain = pick(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']);
    let email = `${fname}.${lname}@${domain}`.toLowerCase();
    const emailRand = Math.random();
    if (emailRand < 0.30) email = email.toUpperCase();
    else if (emailRand < 0.45) email = email.replace('gmail', 'gmial').replace('yahoo', 'yaho').replace('outlook', 'outlok');
    else if (emailRand < 0.55) email = `${fname}.${lname}${domain}`;

    const dobDate = randomDate(new Date(1970, 0, 1), new Date(2002, 11, 31));
    const dobFormats = [
      formatDateParts(dobDate.getDate(), dobDate.getMonth() + 1, dobDate.getFullYear(), 'DD/MM/YYYY'),
      formatDateParts(dobDate.getDate(), dobDate.getMonth() + 1, dobDate.getFullYear(), 'MM-DD-YYYY'),
      `${pad(dobDate.getDate())}-${monthNameShort(dobDate.getMonth() + 1)}-${dobDate.getFullYear()}`,
      formatDateParts(dobDate.getDate(), dobDate.getMonth() + 1, dobDate.getFullYear(), 'YYYY-MM-DD'),
      `${pad(dobDate.getDate())} ${monthNameLong(dobDate.getMonth() + 1)} ${dobDate.getFullYear()}`
    ];

    const salaryBase = 120000 + ((index % 12) * 15000);
    const salaryVariants = [
      `₹${salaryBase.toLocaleString('en-IN')}.00`,
      `${(salaryBase / 100000).toFixed(1)} Lakhs`,
      `Rs. ${salaryBase}`,
      String(salaryBase),
      '-5000'
    ];

    let address = pick(addresses);
    const addressRand = Math.random();
    if (addressRand < 0.30) address = address.toUpperCase();
    else if (addressRand < 0.55) address = address.replace(/,/g, '');
    else if (addressRand < 0.75) address = address.replace(/\d{6}$/, '').trim();

    rows.push({
      'Customer ID': `CUST${String(index).padStart(3, '0')}`,
      'Full Name': fullName,
      'Mobile Number': mobile,
      'Email': email,
      'Date of Birth': pick(dobFormats),
      'Gender': pick(genders),
      'City': pick(pick(cityVariants)),
      'State': pick(pick(stateVariants)),
      'Monthly Salary': pick(salaryVariants),
      'Address': address
    });
  }

  for (let duplicate = 0; duplicate < 10; duplicate += 1) {
    const sourceIndex = duplicate * 7;
    const targetIndex = CONFIG.sampleRows - 1 - duplicate;
    rows[targetIndex]['Customer ID'] = rows[sourceIndex]['Customer ID'];
    rows[targetIndex]['Email'] = rows[sourceIndex]['Email'];
    rows[targetIndex]['Full Name'] = `${rows[sourceIndex]['Full Name']} `;
  }

  initializeDataset(rows, 'sample_messy_data.xlsx');
}

// ======== UI — SCREEN NAVIGATION ========
function navigate(screenNumber, options = {}) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  const target = document.getElementById(`screen${screenNumber}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  appState.currentScreen = screenNumber;

  if (!options.skipHistory) {
    const state = { screen: screenNumber };
    if (options.replace) window.history.replaceState(state, '', `#screen-${screenNumber}`);
    else window.history.pushState(state, '', `#screen-${screenNumber}`);
  }
  if (screenNumber !== 2) clearScanTimers();
}

function startScanSequence() {
  navigate(2);
  renderScanGrid();
  animateScan();
  clearScanTimers();
  let messageIndex = 0;
  DOM.scanMessage.textContent = CONFIG.scanMessages[0];
  appState.scanMessageTimer = window.setInterval(() => {
    messageIndex = (messageIndex + 1) % CONFIG.scanMessages.length;
    DOM.scanMessage.textContent = CONFIG.scanMessages[messageIndex];
  }, 400);
  appState.scanTimer = window.setTimeout(() => {
    clearScanTimers();
    renderDetectionScreen();
    navigate(3);
  }, CONFIG.scanDuration);
}

function clearScanTimers() {
  if (appState.scanTimer) window.clearTimeout(appState.scanTimer);
  if (appState.scanMessageTimer) window.clearInterval(appState.scanMessageTimer);
  appState.scanTimer = null;
  appState.scanMessageTimer = null;
}

function resetApp() {
  appState.sourceFileName = 'sample_data.xlsx';
  appState.rawRows = [];
  appState.headers = [];
  appState.columnProfiles = [];
  appState.selectedColumns = new Set();
  appState.processed = null;
  appState.cleaningConfig = { dateFormat: 'DD-MM-YYYY', nameFormat: 'titleCase', phoneFormat: 'raw', duplicateAction: 'keepFirst' };
  DOM.fileInput.value = '';
  DOM.columnCards.innerHTML = '';
  DOM.plannedChangesList.innerHTML = '';
  DOM.comparisonTableWrapper.innerHTML = '';
  DOM.columnSummary.innerHTML = '';
  DOM.successTableBody.innerHTML = '';
  DOM.summaryStrip.innerHTML = '';
  DOM.comparisonStats.innerHTML = '';
  DOM.selectedColumnsText.textContent = '0 of 0 columns selected for cleaning';
  navigate(1);
}

// ======== UI — COLUMN CARDS RENDERER ========
function renderDetectionScreen() {
  const selectedCount = appState.columnProfiles.filter((profile) => profile.selected).length;
  const totalRows = appState.rawRows.length;
  const totalIssues = appState.columnProfiles.reduce((sum, profile) => sum + sumCounts(profile.issues), 0);
  const autoIdentified = appState.columnProfiles.filter((profile) => profile.detectedType !== 'GENERAL_TEXT').length;

  DOM.scanResultHeadline.textContent = `We scanned your file and found ${appState.columnProfiles.length} columns`;
  DOM.summaryStrip.innerHTML = [
    createStatChip(appState.columnProfiles.length, 'Total columns detected'),
    createStatChip(autoIdentified, 'Columns auto-identified'),
    createStatChip(totalRows, 'Total rows in file'),
    createStatChip(totalIssues, 'Issues found')
  ].join('');

  DOM.columnCards.innerHTML = appState.columnProfiles.map((profile, index) => {
    const issuesMarkup = profile.issues.length
      ? profile.issues.map((issue) => `<div class="issue-row"><strong>${issue.count}</strong><span>${issue.label}</span></div>`).join('')
      : '<p class="muted">No issues detected in the preview sample.</p>';
    const sampleMarkup = profile.sampleValues.length
      ? profile.sampleValues.map((sample) => `<div>${escapeHtml(String(sample))}</div>`).join('')
      : '<div class="muted">No non-empty values found</div>';
    return `
      <article class="column-card">
        <div class="column-card-header">
          <div><strong>${escapeHtml(profile.name)}</strong></div>
          <span class="type-badge">${TYPE_LABELS[profile.overrideType] || profile.overrideType}</span>
        </div>
        <div class="samples-box">${sampleMarkup}</div>
        <div>
          <strong>Issues found</strong>
          <div class="issues-list">${issuesMarkup}</div>
        </div>
        <div class="toggle-row">
          <span>Auto-clean this column</span>
          <label class="toggle-switch">
            <input type="checkbox" data-column-toggle="${index}" ${profile.selected ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        ${profile.uncertain ? `
          <div>
            <label for="override-${index}"><strong>Override detection</strong></label>
            <select id="override-${index}" class="inline-select" data-override="${index}">
              ${Object.entries(TYPE_LABELS).map(([value, label]) => `<option value="${value}" ${profile.overrideType === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>` : ''}
      </article>
    `;
  }).join('');

  DOM.selectedColumnsText.textContent = `${selectedCount} of ${appState.columnProfiles.length} columns selected for cleaning`;
}

function renderPlanScreen() {
  syncConfigFromInputs();
  DOM.plannedChangesList.innerHTML = appState.columnProfiles.filter((profile) => profile.selected).map((profile) => {
    const description = describePlannedChange(profile);
    return `
      <article class="plan-card">
        <div class="plan-header">
          <strong>${iconForType(profile.overrideType)} ${escapeHtml(profile.name)}</strong>
          <span class="status-badge">${TYPE_LABELS[profile.overrideType]}</span>
        </div>
        <p>${description.primary}</p>
        ${description.secondary ? `<p>${description.secondary}</p>` : ''}
        <p><strong>${description.affected}</strong> cells affected</p>
      </article>
    `;
  }).join('');
}

// ======== UI — COMPARISON TABLE RENDERER ========
function renderComparison() {
  if (!appState.processed) return;
  const { stats, columnSummary } = appState.processed;
  DOM.comparisonStats.innerHTML = [
    createComparisonStat(stats.totalCellsCleaned, 'Total cells cleaned'),
    createComparisonStat(stats.issuesAutoFixed, 'Issues auto-fixed'),
    createComparisonStat(stats.cellsFlagged, 'Cells flagged for review'),
    createComparisonStat(stats.duplicatesRemoved, 'Duplicates removed')
  ].join('');

  renderComparisonTable('all');
  DOM.columnSummary.innerHTML = `<div class="mini-summary">${columnSummary.map((item) => {
    const total = Math.max(item.fixed + item.flagged, 1);
    const ratio = Math.round((item.fixed / total) * 100);
    return `
      <div class="mini-summary-item">
        <div class="mini-summary-top">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${item.fixed} fixed · ${item.flagged} flagged</span>
        </div>
        <div class="mini-progress"><span style="width:${ratio}%"></span></div>
      </div>
    `;
  }).join('')}</div>`;

  showToast(`Cleaning complete — ${stats.totalCellsCleaned} cells fixed`, 'success');
  if (stats.cellsFlagged > 0) showToast(`${stats.cellsFlagged} cells flagged for manual review`, 'warning');
}

function renderComparisonTable(filter = 'all') {
  if (!appState.processed) return;
  const rows = appState.processed.processedRows.filter((row) => {
    if (filter === 'changed') return row.rowStatus === 'fixed' || row.rowStatus === 'flagged';
    if (filter === 'flagged') return row.rowStatus === 'flagged';
    if (filter === 'duplicates') return row.duplicate || row.removedAsDuplicate;
    return true;
  });

  const head = `
    <thead>
      <tr>
        <th>#</th>
        ${appState.headers.map((header) => `<th>${escapeHtml(header)}<br><span class="muted">Original</span></th><th>${escapeHtml(header)}<br><span class="muted">Cleaned</span></th>`).join('')}
        <th>Status</th>
      </tr>
    </thead>
  `;

  const body = rows.map((row) => {
    const rowClasses = [row.rowStatus === 'flagged' ? 'row-flagged' : '', row.duplicate ? 'row-duplicate' : ''].filter(Boolean).join(' ');
    const cells = appState.headers.map((header) => {
      const meta = row.cellMeta[header];
      const originalClass = meta.status === 'fixed' ? 'cell-fixed-original' : (meta.status === 'flagged' ? 'cell-flagged' : '');
      const cleanedClass = meta.status === 'fixed' ? 'cell-fixed-cleaned' : (meta.status === 'flagged' ? 'cell-flagged' : '');
      return `<td class="${originalClass}" title="${escapeHtml(meta.rule)}">${escapeHtml(displayValue(row.original[header]))}</td><td class="${cleanedClass}" title="${escapeHtml(meta.rule)}">${escapeHtml(displayValue(row.cleaned[header]))}</td>`;
    }).join('');
    return `<tr class="${rowClasses}"><td>${row.rowNumber}</td>${cells}<td>${renderStatusIcon(row)}</td></tr>`;
  }).join('');

  DOM.comparisonTableWrapper.innerHTML = `<table class="comparison-table">${head}<tbody>${body}</tbody></table>`;
}

function renderSuccessScreen() {
  if (!appState.processed) return;
  const { stats, columnSummary } = appState.processed;
  DOM.successSummary.textContent = `${stats.rowsCleaned} rows cleaned · ${stats.issuesAutoFixed} issues fixed · ${stats.cellsFlagged} flagged for review`;
  DOM.successTableBody.innerHTML = columnSummary.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${TYPE_LABELS[item.type] || item.type}</td>
      <td>${item.issuesFound}</td>
      <td class="fixed-count">${item.fixed}</td>
      <td class="flagged-count">${item.flagged}</td>
    </tr>
  `).join('');
}

// ======== UI — TOAST NOTIFICATIONS ========
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

// ======== EVENT LISTENERS ========
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  buildInitialScanGrid();
  window.history.replaceState({ screen: 1 }, '', '#screen-1');

  DOM.browseFileBtn.addEventListener('click', () => DOM.fileInput.click());
  DOM.uploadCard.addEventListener('click', () => DOM.fileInput.click());
  DOM.uploadCard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      DOM.fileInput.click();
    }
  });
  DOM.fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) readUploadedFile(file);
  });
  DOM.browseFileBtn.addEventListener('click', (event) => event.stopPropagation());
  DOM.sampleDataBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    generateSampleData();
  });
  ['dragenter', 'dragover'].forEach((eventName) => {
    DOM.uploadCard.addEventListener(eventName, (event) => {
      event.preventDefault();
      DOM.uploadCard.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    DOM.uploadCard.addEventListener(eventName, (event) => {
      event.preventDefault();
      DOM.uploadCard.classList.remove('drag-over');
    });
  });
  DOM.uploadCard.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) readUploadedFile(file);
  });
  DOM.howItWorksBtn.addEventListener('click', () => document.getElementById('howItWorksSection').scrollIntoView({ behavior: 'smooth', block: 'start' }));

  document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = Number(button.getAttribute('data-back'));
      if (target === 1 && appState.currentScreen === 6) resetApp();
      else navigate(target);
    });
  });

  DOM.columnCards.addEventListener('change', (event) => {
    const toggleIndex = event.target.getAttribute('data-column-toggle');
    const overrideIndex = event.target.getAttribute('data-override');
    if (toggleIndex !== null) {
      const profile = appState.columnProfiles[Number(toggleIndex)];
      profile.selected = event.target.checked;
      if (profile.selected) appState.selectedColumns.add(profile.name);
      else appState.selectedColumns.delete(profile.name);
      DOM.selectedColumnsText.textContent = `${appState.columnProfiles.filter((item) => item.selected).length} of ${appState.columnProfiles.length} columns selected for cleaning`;
    }
    if (overrideIndex !== null) appState.columnProfiles[Number(overrideIndex)].overrideType = event.target.value;
  });

  DOM.cleanMyDataBtn.addEventListener('click', () => {
    renderPlanScreen();
    navigate(4);
  });
  DOM.startCleaningBtn.addEventListener('click', () => {
    syncConfigFromInputs();
    processDataset();
    navigate(5);
  });
  DOM.downloadBtn.addEventListener('click', downloadCleanedFile);
  DOM.comparisonMainTabs.forEach((button) => button.addEventListener('click', () => {
    DOM.comparisonMainTabs.forEach((tab) => tab.classList.remove('active'));
    button.classList.add('active');
    renderComparisonTable(button.dataset.tab);
  }));

  window.addEventListener('popstate', (event) => navigate(event.state?.screen || 1, { skipHistory: true }));
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

function cacheDom() {
  DOM.toastContainer = document.getElementById('toastContainer');
  DOM.fileInput = document.getElementById('fileInput');
  DOM.uploadCard = document.getElementById('uploadCard');
  DOM.browseFileBtn = document.getElementById('browseFileBtn');
  DOM.sampleDataBtn = document.getElementById('sampleDataBtn');
  DOM.howItWorksBtn = document.getElementById('howItWorksBtn');
  DOM.scanGrid = document.getElementById('scanGrid');
  DOM.scanMessage = document.getElementById('scanMessage');
  DOM.scanProgressBar = document.getElementById('scanProgressBar');
  DOM.scanProgressText = document.getElementById('scanProgressText');
  DOM.scanResultHeadline = document.getElementById('scanResultHeadline');
  DOM.summaryStrip = document.getElementById('summaryStrip');
  DOM.columnCards = document.getElementById('columnCards');
  DOM.selectedColumnsText = document.getElementById('selectedColumnsText');
  DOM.cleanMyDataBtn = document.getElementById('cleanMyDataBtn');
  DOM.plannedChangesList = document.getElementById('plannedChangesList');
  DOM.startCleaningBtn = document.getElementById('startCleaningBtn');
  DOM.comparisonStats = document.getElementById('comparisonStats');
  DOM.comparisonTableWrapper = document.getElementById('comparisonTableWrapper');
  DOM.columnSummary = document.getElementById('columnSummary');
  DOM.downloadBtn = document.getElementById('downloadBtn');
  DOM.successSummary = document.getElementById('successSummary');
  DOM.successTableBody = document.getElementById('successTableBody');
  DOM.comparisonMainTabs = [...document.querySelectorAll('.tab-btn')];
}

function buildInitialScanGrid() {
  DOM.scanGrid.innerHTML = Array.from({ length: 96 }, (_, index) => `<div class="scan-cell" style="animation-delay:${(Math.floor(index / 8) * 0.12).toFixed(2)}s"></div>`).join('');
}

function renderScanGrid() {
  buildInitialScanGrid();
}

function animateScan() {
  DOM.scanProgressBar.style.transition = 'none';
  DOM.scanProgressBar.style.width = '0%';
  DOM.scanProgressText.textContent = 'Analysing... 0%';
  requestAnimationFrame(() => {
    DOM.scanProgressBar.style.transition = `width ${CONFIG.scanDuration}ms linear`;
    DOM.scanProgressBar.style.width = '100%';
  });
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(100, Math.round(((now - start) / CONFIG.scanDuration) * 100));
    DOM.scanProgressText.textContent = `Analysing... ${progress}%`;
    if (progress < 100 && appState.currentScreen === 2) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function handleKeyboardShortcuts(event) {
  if (event.ctrlKey && event.key.toLowerCase() === 'u') {
    event.preventDefault();
    DOM.fileInput.click();
  }
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    handleProceedShortcut();
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    handleBackShortcut();
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'd' && appState.currentScreen === 5) {
    event.preventDefault();
    downloadCleanedFile();
  }
}

function handleProceedShortcut() {
  if (appState.currentScreen === 1) DOM.fileInput.click();
  else if (appState.currentScreen === 3) {
    renderPlanScreen();
    navigate(4);
  } else if (appState.currentScreen === 4) {
    syncConfigFromInputs();
    processDataset();
    navigate(5);
  }
}

function handleBackShortcut() {
  if (appState.currentScreen === 6) {
    resetApp();
    return;
  }
  const backMap = { 3: 1, 4: 3, 5: 3 };
  if (backMap[appState.currentScreen]) navigate(backMap[appState.currentScreen]);
}

function syncConfigFromInputs() {
  appState.cleaningConfig = {
    dateFormat: document.querySelector('input[name="dateFormat"]:checked')?.value || 'DD-MM-YYYY',
    nameFormat: document.querySelector('input[name="nameFormat"]:checked')?.value || 'titleCase',
    phoneFormat: document.querySelector('input[name="phoneFormat"]:checked')?.value || 'raw',
    duplicateAction: document.querySelector('input[name="duplicateAction"]:checked')?.value || 'keepFirst'
  };
}

function describePlannedChange(profile) {
  const affected = Math.max(sumCounts(profile.issues), profile.nonEmptyCount ? Math.ceil(profile.nonEmptyCount * 0.42) : 0);
  const mappings = {
    NAME: { primary: `${affected} names → ${formatNameLabel(appState.cleaningConfig.nameFormat)}, trim spaces, remove symbols`, secondary: null },
    PHONE: { primary: `Remove +91 prefix, dashes, spaces → ${formatPhoneLabel(appState.cleaningConfig.phoneFormat)}`, secondary: `${sumIssue(profile, 'invalid')} phones flagged as invalid length` },
    EMAIL: { primary: 'Lowercase all emails, fix domain typos', secondary: `${sumIssue(profile, 'invalid')} emails flagged as invalid format` },
    DATE: { primary: `Standardise all formats → ${appState.cleaningConfig.dateFormat}`, secondary: null },
    CITY: { primary: 'Fix city spelling variations and abbreviations', secondary: null },
    STATE: { primary: 'Expand abbreviations and aliases to full official state names', secondary: null },
    ADDRESS: { primary: 'Title case, expand abbreviations, and normalize punctuation', secondary: `${sumIssue(profile, 'pincode')} addresses flagged for missing pincode` },
    AMOUNT: { primary: 'Convert symbols and text amounts into normalized numeric values', secondary: null }
  };
  return { ...(mappings[profile.overrideType] || { primary: 'Trim spaces and normalize text patterns', secondary: null }), affected };
}

function createStatChip(value, label) {
  return `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`;
}

function createComparisonStat(value, label) {
  return `<div class="comparison-stat"><strong>${value}</strong><small>${label}</small></div>`;
}

function renderStatusIcon(row) {
  if (row.rowStatus === 'flagged') return '<span class="status-icon status-warning">⚠</span>';
  if (row.rowStatus === 'fixed' || row.rowStatus === 'unchanged') return '<span class="status-icon status-success">✓</span>';
  return '<span class="status-icon status-error">✗</span>';
}

function getFirstNonNullValues(values, limit) {
  return values.filter((value) => !isBlank(value)).slice(0, limit);
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function normalizeKey(value) {
  return String(value || '').toLowerCase().replace(/[_\-\.]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanLookupValue(value) {
  return String(value || '').toLowerCase().replace(/[.\-]/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeDuplicateKey(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function toTitleCase(value) {
  return String(value || '').toLowerCase().split(/\s+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function standardizePrefix(word) {
  const mapping = { mr: 'Mr.', mrs: 'Mrs.', dr: 'Dr.', prof: 'Prof.' };
  const cleaned = word.replace(/\./g, '').toLowerCase();
  return mapping[cleaned] || word;
}

function isPercentageLike(value) {
  const numeric = parseFloat(String(value).replace('%', ''));
  return !Number.isNaN(numeric) && numeric >= 0 && numeric <= 100;
}

function inferDatePreference(values) {
  let dmy = false;
  values.forEach((value) => {
    const match = String(value || '').trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (match && Number(match[1]) > 12) dmy = true;
  });
  return dmy ? 'DMY' : 'MDY';
}

function parseDateValue(value, preferredDateOrder = 'DMY', columnName = '') {
  const raw = String(value).trim();
  if (!raw) return { valid: false, reason: 'Blank date' };
  let day;
  let month;
  let year;
  const normalized = raw.replace(/,/g, ' ').replace(/\s+/g, ' ');
  const yyyyFirst = normalized.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (yyyyFirst) {
    year = Number(yyyyFirst[1]);
    month = Number(yyyyFirst[2]);
    day = Number(yyyyFirst[3]);
  } else {
    const numeric = normalized.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    const alphaDayFirst = normalized.match(/^(\d{1,2})[\s\-]([A-Za-z]+)[\s\-](\d{2,4})$/);
    const alphaMonthFirst = normalized.match(/^([A-Za-z]+)[\s\-](\d{1,2})[\s\-](\d{2,4})$/);
    if (numeric) {
      const part1 = Number(numeric[1]);
      const part2 = Number(numeric[2]);
      year = normalizeYear(Number(numeric[3]));
      if (preferredDateOrder === 'DMY') {
        day = part1;
        month = part2;
      } else {
        month = part1;
        day = part2;
      }
    } else if (alphaDayFirst) {
      day = Number(alphaDayFirst[1]);
      month = MONTH_MAP[alphaDayFirst[2].toLowerCase()];
      year = normalizeYear(Number(alphaDayFirst[3]));
    } else if (alphaMonthFirst) {
      month = MONTH_MAP[alphaMonthFirst[1].toLowerCase()];
      day = Number(alphaMonthFirst[2]);
      year = normalizeYear(Number(alphaMonthFirst[3]));
    }
  }
  if (!day || !month || !year) return { valid: false, reason: 'Unreadable date' };
  if (day > 31 || month > 12 || year < 0) return { valid: false, reason: 'Invalid date parts' };
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getFullYear() !== year || dateObj.getMonth() + 1 !== month || dateObj.getDate() !== day) return { valid: false, reason: 'Invalid calendar date' };
  if (/dob|birth/i.test(columnName) && dateObj > new Date()) return { valid: true, day, month, year, dateObj, reason: 'DOB in future' };
  return { valid: true, day, month, year, dateObj };
}

function normalizeYear(year) {
  return year < 100 ? 2000 + year : year;
}

function formatDateParts(day, month, year, outputFormat) {
  const formats = {
    'DD-MM-YYYY': `${pad(day)}-${pad(month)}-${year}`,
    'MM-DD-YYYY': `${pad(month)}-${pad(day)}-${year}`,
    'YYYY-MM-DD': `${year}-${pad(month)}-${pad(day)}`,
    'DD/MM/YYYY': `${pad(day)}/${pad(month)}/${year}`
  };
  return formats[outputFormat] || formats['DD-MM-YYYY'];
}

function parseAmount(value) {
  if (isBlank(value)) return null;
  let text = String(value).trim().toLowerCase();
  text = text.replace(/[₹₨$£€]/g, '').replace(/rs\.?/g, '').replace(/,/g, '').trim();
  const lakhMatch = text.match(/^(-?\d+(\.\d+)?)\s*(lakh|lakhs|lac|l)$/i);
  const croreMatch = text.match(/^(-?\d+(\.\d+)?)\s*(crore|crores|cr)$/i);
  const kMatch = text.match(/^(-?\d+(\.\d+)?)\s*k$/i);
  const millionMatch = text.match(/^(-?\d+(\.\d+)?)\s*million$/i);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;
  if (croreMatch) return parseFloat(croreMatch[1]) * 10000000;
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  if (millionMatch) return parseFloat(millionMatch[1]) * 1000000;
  const numeric = parseFloat(text);
  return Number.isNaN(numeric) ? null : numeric;
}

function calculateMeanStdDev(values) {
  if (!values.length) return { mean: 0, stddev: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return { mean, stddev: Math.sqrt(variance) };
}

function sumCounts(issues) {
  return issues.reduce((sum, issue) => sum + issue.count, 0);
}

function sumIssue(profile, keyword) {
  return profile.issues.filter((issue) => issue.label.includes(keyword)).reduce((sum, issue) => sum + issue.count, 0);
}

function formatNameLabel(value) {
  if (value === 'upperCase') return 'UPPER CASE';
  if (value === 'lowerCase') return 'lower case';
  return 'Title Case';
}

function formatPhoneLabel(value) {
  if (value === 'spaced') return '98765 43210';
  if (value === 'dashed') return '98765-43210';
  return '10-digit format';
}

function iconForType(type) {
  const icons = { NAME: '[Name icon]', PHONE: '[Phone icon]', EMAIL: '[Email icon]', DATE: '[Calendar icon]', CITY: '[Map icon]', STATE: '[Map icon]', ADDRESS: '[Map icon]', AMOUNT: '[Amount icon]' };
  return icons[type] || '[Fix icon]';
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randDigits(length) {
  let value = '';
  for (let index = 0; index < length; index += 1) value += Math.floor(Math.random() * 10);
  return value;
}

function randDigit(options) {
  return String(pick(options));
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function monthNameShort(month) {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
}

function monthNameLong(month) {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

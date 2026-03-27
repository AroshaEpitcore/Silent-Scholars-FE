// English to Sinhala word dictionary
export const EnglishToSinhala = {
  // Greetings
  hello: "හෙලෝ",
  hi: "හායි",
  goodbye: "ආයුබෝවන්",
  welcome: "සාදරයෙන් පිළිගනිමු",
  thanks: "ස්තූතියි",
  thank: "ස්තූතියි",
  please: "කරුණාකර",
  sorry: "සමාවෙන්න",
  yes: "ඔව්",
  no: "නැහැ",

  // People & Family
  mother: "අම්මා",
  father: "තාත්තා",
  sister: "අක්කා",
  brother: "අයියා",
  child: "දරුවා",
  children: "දරුවන්",
  baby: "බිළිඳා",
  family: "පවුල",
  friend: "යහළුවා",
  person: "පුද්ගලයා",
  people: "ජනයා",
  boy: "පිරිමි ළමයා",
  girl: "ගැහැනු ළමයා",
  man: "මිනිසා",
  woman: "කාන්තාව",

  // Animals
  cat: "බළලා",
  dog: "බල්ලා",
  lion: "සිංහයා",
  cow: "එළදෙනා",
  horse: "අශ්වයා",
  fish: "මාළුවා",
  bird: "කුරුල්ලා",
  elephant: "අලියා",
  monkey: "වඳුරා",
  rabbit: "හාවා",
  snake: "සර්පයා",
  tiger: "කොටියා",
  bear: "වලසා",
  duck: "තාරාවා",
  hen: "කිකිළිය",

  // Colors
  red: "රතු",
  blue: "නිල්",
  green: "කොළ",
  yellow: "කහ",
  black: "කළු",
  white: "සුදු",
  orange: "තැඹිලි",
  pink: "රෝස",
  purple: "දම්",
  brown: "දුඹුරු",

  // Numbers
  one: "එක",
  two: "දෙක",
  three: "තුන",
  four: "හතර",
  five: "පහ",
  six: "හය",
  seven: "හත",
  eight: "අට",
  nine: "නවය",
  ten: "දහය",

  // Body Parts
  hand: "අත",
  eye: "ඇස",
  ear: "කණ",
  nose: "නාසය",
  mouth: "මුව",
  head: "හිස",
  leg: "පාදය",
  foot: "පය",
  face: "මුහුණ",
  hair: "කෙස්",

  // Food & Drink
  food: "ආහාර",
  water: "වතුර",
  milk: "කිරි",
  rice: "බත්",
  bread: "පාන්",
  fruit: "පළතුරු",
  apple: "ඇපල්",
  banana: "කෙසෙල්",
  mango: "අඹ",
  egg: "බිත්තරය",

  // Common Verbs
  eat: "කනවා",
  drink: "බොනවා",
  sleep: "නිදාගනිමු",
  run: "දුවනවා",
  walk: "යනවා",
  sit: "හිනිනවා",
  stand: "හිටගන්නවා",
  read: "කියවනවා",
  write: "ලියනවා",
  play: "සෙල්ලම් කරනවා",
  learn: "ඉගෙනගනිමු",
  teach: "ඉගැන්වීම",
  help: "උදව්",
  love: "ආදරය",
  come: "එනවා",
  go: "යනවා",
  see: "බලනවා",
  hear: "අහනවා",
  speak: "කතා කරනවා",
  listen: "අහනවා",

  // Places
  school: "පාසල",
  home: "නිවස",
  hospital: "රෝහල",
  shop: "කඩය",
  park: "උද්යානය",
  road: "මාර්ගය",
  city: "නගරය",
  village: "ගම",
  country: "රට",
  market: "වෙළඳපොළ",

  // Nature
  sun: "හිරු",
  moon: "සඳ",
  star: "තරුව",
  sky: "අහස",
  rain: "වැස්ස",
  water: "වතුර",
  tree: "ගස",
  flower: "මල",
  river: "ගඟ",
  mountain: "කන්ද",

  // Time
  day: "දිනය",
  night: "රාත්‍රිය",
  morning: "උදෑසන",
  evening: "සවස",
  today: "අද",
  tomorrow: "හෙට",
  week: "සතිය",
  month: "මාසය",
  year: "අවුරුද්ද",

  // Education
  book: "පොත",
  pen: "පෑන",
  paper: "කොළය",
  class: "පන්තිය",
  teacher: "ගුරුවරයා",
  student: "සිසුවා",
  lesson: "පාඩම",
  exam: "විභාගය",
  study: "ඉගෙනීම",
  knowledge: "දැනුම",

  // Signs & Communication
  sign: "සංඥාව",
  language: "භාෂාව",
  word: "වචනය",
  sentence: "වාක්‍යය",
  letter: "අකුර",
  message: "පණිවිඩය",
  name: "නම",

  // Traffic
  traffic: "රථවාහන",
  stop: "නතර",
  go: "යන්න",
  danger: "භයානක",
  speed: "වේගය",
  signal: "සංඥා",
};

export function getSinhala(word) {
  return EnglishToSinhala[word.toLowerCase()] || null;
}

// Reverse map: Sinhala → English
export const SinhalaToEnglish = Object.fromEntries(
  Object.entries(EnglishToSinhala).map(([en, si]) => [si, en])
);

// Check if a word is Sinhala unicode
export function isSinhalaWord(word) {
  return [...word].some(c => c >= '\u0D80' && c <= '\u0DFF');
}

// For a Sinhala word, return the English equivalent (for sign lookup)
export function getEnglishFromSinhala(word) {
  return SinhalaToEnglish[word] || null;
}

export type SpeechNormalizationEngine = 'gemini' | 'turkic_webspeech' | 'latin_fallback';

/**
 * Clean Uzbek word pronunciation dictionary for words that TTS engines
 * frequently distort (e.g. "arra" -> "arlla", "kamalak" -> "kamlag", "tarvuz" -> "tervzz").
 */
const UZBEK_WORD_PRONUNCIATION_MAP: Record<
  string,
  {
    gemini: string;
    turkic: string;
    latinFallback: string;
  }
> = {
  arra: { gemini: 'arra', turkic: 'arra', latinFallback: 'ahr-rah' },
  kamalak: { gemini: 'kamalak', turkic: 'kamalak', latinFallback: 'kah-mah-lahk' },
  tarvuz: { gemini: 'tarvuz', turkic: 'tarvuz', latinFallback: 'tahr-vooz' },
  baraban: { gemini: 'baraban', turkic: 'baraban', latinFallback: 'bah-rah-bahn' },
  daraxt: { gemini: 'daraxt', turkic: 'daraht', latinFallback: 'dah-rahkht' },
  mashina: { gemini: 'mashina', turkic: 'maşina', latinFallback: 'mah-shee-nah' },
  chumoli: { gemini: 'chumoli', turkic: 'çumoli', latinFallback: 'choo-moh-lee' },
  jirafa: { gemini: 'jirafa', turkic: 'cirafa', latinFallback: 'jee-rah-fah' },
  shokolad: { gemini: 'shokolad', turkic: 'şokolad', latinFallback: 'shoh-koh-lahd' },
  samolyot: { gemini: 'samolyot', turkic: 'samolyot', latinFallback: 'sah-mohl-yoht' },
  soyabon: { gemini: 'soyabon', turkic: 'soyabon', latinFallback: 'soh-yah-bohn' },
  shalola: { gemini: 'shalola', turkic: 'şalola', latinFallback: 'shah-loh-lah' },
  choynak: { gemini: 'choynak', turkic: 'çoynak', latinFallback: 'choy-nahk' },
  pishloq: { gemini: 'pishloq', turkic: 'pişlok', latinFallback: 'peesh-lohk' },
  karvon: { gemini: 'karvon', turkic: 'karvon', latinFallback: 'kahr-vohn' },
  musiqa: { gemini: 'musiqa', turkic: 'musika', latinFallback: 'moo-see-kah' },
  qoshiq: { gemini: 'qoshiq', turkic: 'koşık', latinFallback: 'koh-sheek' },
  savat: { gemini: 'savat', turkic: 'savat', latinFallback: 'sah-vaht' },
  shamol: { gemini: 'shamol', turkic: 'şamol', latinFallback: 'shah-mohl' },
  soat: { gemini: 'soat', turkic: 'soat', latinFallback: 'soh-aht' },
  qalam: { gemini: 'qalam', turkic: 'kalam', latinFallback: 'kah-lahm' },
  uzum: { gemini: 'uzum', turkic: 'uzum', latinFallback: 'oo-zoom' },
  olma: { gemini: 'olma', turkic: 'olma', latinFallback: 'ohl-mah' },
  rasm: { gemini: 'rasm', turkic: 'rasm', latinFallback: 'rahs-m' },
  sabzi: { gemini: 'sabzi', turkic: 'sabzi', latinFallback: 'sahb-zee' },
  balon: { gemini: 'balon', turkic: 'balon', latinFallback: 'bah-lohn' },
  chiroq: { gemini: 'chiroq', turkic: 'çirok', latinFallback: 'chee-rohk' },
  zebra: { gemini: 'zebra', turkic: 'zebra', latinFallback: 'zehb-rah' },
  anor: { gemini: 'anor', turkic: 'anor', latinFallback: 'ah-nohr' },
  limon: { gemini: 'limon', turkic: 'limon', latinFallback: 'lee-mohn' },
  qor: { gemini: 'qor', turkic: 'kor', latinFallback: 'kohr' },
  quyosh: { gemini: 'quyosh', turkic: 'kuyoş', latinFallback: 'koo-yohsh' },
  bulut: { gemini: 'bulut', turkic: 'bulut', latinFallback: 'boo-loot' },
  shapka: { gemini: 'shapka', turkic: 'şapka', latinFallback: 'shahp-kah' },
  olcha: { gemini: 'olcha', turkic: 'olça', latinFallback: 'ohl-chah' },
  gul: { gemini: 'gul', turkic: 'gul', latinFallback: 'gool' },
  asal: { gemini: 'asal', turkic: 'asal', latinFallback: 'ah-sahl' },
  tosh: { gemini: 'tosh', turkic: 'toş', latinFallback: 'tohsh' },
  lola: { gemini: 'lola', turkic: 'lola', latinFallback: 'loh-lah' },
  choy: { gemini: 'choy', turkic: 'çoy', latinFallback: 'choy' },
  bahor: { gemini: 'bahor', turkic: 'bahor', latinFallback: 'bah-hohr' },
  daryo: { gemini: 'daryo', turkic: 'daryo', latinFallback: 'dahr-yoh' },
  kitob: { gemini: 'kitob', turkic: 'kitob', latinFallback: 'kee-tohb' },
  xona: { gemini: 'xona', turkic: 'hona', latinFallback: 'hoh-nah' },
  ruchka: { gemini: 'ruchka', turkic: 'ruçka', latinFallback: 'rooch-kah' },
  traktor: { gemini: 'traktor', turkic: 'traktor', latinFallback: 'trahk-tohr' },
  raketa: { gemini: 'raketa', turkic: 'raketa', latinFallback: 'rah-keh-tah' },
  kapalak: { gemini: 'kapalak', turkic: 'kapalak', latinFallback: 'kah-pah-lahk' },
  charhfalak: { gemini: 'charhfalak', turkic: 'çarhfalak', latinFallback: 'chahrkh-fah-lahk' },
  tipratikan: { gemini: 'tipratikan', turkic: 'tipratikan', latinFallback: 'teep-rah-tee-kahn' },
  salom: { gemini: 'salom', turkic: 'salom', latinFallback: 'sah-lohm' },
  osmon: { gemini: 'osmon', turkic: 'osmon', latinFallback: 'ohs-mohn' },
  suv: { gemini: 'suv', turkic: 'suv', latinFallback: 'soov' },
  stol: { gemini: 'stol', turkic: 'stol', latinFallback: 'stohl' },
  issiq: { gemini: 'issiq', turkic: 'issik', latinFallback: 'ees-seek' },
  tovus: { gemini: 'tovus', turkic: 'tovus', latinFallback: 'toh-voos' },
  mushuk: { gemini: 'mushuk', turkic: 'muşuk', latinFallback: 'moo-shook' },
  qush: { gemini: 'qush', turkic: 'kuş', latinFallback: 'koosh' },
  shahar: { gemini: 'shahar', turkic: 'şahar', latinFallback: 'shah-hahr' },
  tish: { gemini: 'tish', turkic: 'tiş', latinFallback: 'teesh' },
  boshliq: { gemini: 'boshliq', turkic: 'boşlık', latinFallback: 'bohsh-leek' },
  shifokor: { gemini: 'shifokor', turkic: 'şifokor', latinFallback: 'shee-foh-kohr' },
  yashil: { gemini: 'yashil', turkic: 'yaşil', latinFallback: 'yah-sheel' },
  kishmish: { gemini: 'kishmish', turkic: 'kişmiş', latinFallback: 'keesh-meesh' },
  bola: { gemini: 'bola', turkic: 'bola', latinFallback: 'boh-lah' },
  tong: { gemini: 'tong', turkic: 'tong', latinFallback: 'tohng' },
  bozor: { gemini: 'bozor', turkic: 'bozor', latinFallback: 'boh-zohr' },
  sandiq: { gemini: 'sandiq', turkic: 'sandık', latinFallback: 'sahn-deek' },
  kaktus: { gemini: 'kaktus', turkic: 'kaktus', latinFallback: 'kahk-toos' },
  sharbat: { gemini: 'sharbat', turkic: 'şarbat', latinFallback: 'shahr-baht' },
  sichqon: { gemini: 'sichqon', turkic: 'siçkon', latinFallback: 'seech-kohn' },
  giloszor: { gemini: 'giloszor', turkic: 'giloszor', latinFallback: 'gee-lohs-zohr' },
  mard: { gemini: 'mard', turkic: 'mard', latinFallback: 'mahrd' },
  sirk: { gemini: 'sirk', turkic: 'sirk', latinFallback: 'seerk' },
  barakalla: { gemini: 'barakalla', turkic: 'barakalla', latinFallback: 'bah-rah-kahl-lah' },
  olov: { gemini: 'olov', turkic: 'olov', latinFallback: 'oh-lohv' },
  tilla: { gemini: 'tilla', turkic: 'tilla', latinFallback: 'teel-lah' },
  kalit: { gemini: 'kalit', turkic: 'kalit', latinFallback: 'kah-leet' },
  pichoq: { gemini: 'pichoq', turkic: 'piçok', latinFallback: 'pee-chohk' },
  chana: { gemini: 'chana', turkic: 'çana', latinFallback: 'chah-nah' },
  tinch: { gemini: 'tinch', turkic: 'tinç', latinFallback: 'teench' },
  "o'rdak": { gemini: 'o‘rdak', turkic: 'ördak', latinFallback: 'ohr-dahk' },
  'o‘rdak': { gemini: 'o‘rdak', turkic: 'ördak', latinFallback: 'ohr-dahk' },
  "jo'ja": { gemini: 'jo‘ja', turkic: 'cöca', latinFallback: 'joh-jah' },
  'jo‘ja': { gemini: 'jo‘ja', turkic: 'cöca', latinFallback: 'joh-jah' },
  "g'oz": { gemini: 'g‘oz', turkic: 'ğoz', latinFallback: 'ghohz' },
  'g‘oz': { gemini: 'g‘oz', turkic: 'ğoz', latinFallback: 'ghohz' },
  "tog'": { gemini: 'tog‘', turkic: 'toğ', latinFallback: 'tohgh' },
  'tog‘': { gemini: 'tog‘', turkic: 'toğ', latinFallback: 'tohgh' },
  "o'rmon": { gemini: 'o‘rmon', turkic: 'örmon', latinFallback: 'ohr-mohn' },
  'o‘rmon': { gemini: 'o‘rmon', turkic: 'örmon', latinFallback: 'ohr-mohn' },
  "to'p": { gemini: 'to‘p', turkic: 'töp', latinFallback: 'tohp' },
  'to‘p': { gemini: 'to‘p', turkic: 'töp', latinFallback: 'tohp' },
  "ko'z": { gemini: 'ko‘z', turkic: 'köz', latinFallback: 'kohz' },
  'ko‘z': { gemini: 'ko‘z', turkic: 'köz', latinFallback: 'kohz' },
  "g'ildirak": { gemini: 'g‘ildirak', turkic: 'ğildirak', latinFallback: 'gheel-dee-rahk' },
  'g‘ildirak': { gemini: 'g‘ildirak', turkic: 'ğildirak', latinFallback: 'gheel-dee-rahk' },
  "qaldirg'och": { gemini: 'qaldirg‘och', turkic: 'kaldirğoç', latinFallback: 'kahl-deer-ghohch' },
  'qaldirg‘och': { gemini: 'qaldirg‘och', turkic: 'kaldirğoç', latinFallback: 'kahl-deer-ghohch' },
};

/**
 * Standardizes Uzbek orthography (o‘, g‘, tutuq belgisi), converts ALL-CAPS
 * tokens (e.g. "KAMALAK", "TARVUZ") into natural lowercase, and cleans
 * punctuation like guillemets/em-dashes so TTS reads Uzbek naturally.
 */
export function normalizeUzbekOrthography(rawText: string): string {
  const cleaned = rawText
    .replace(/o['‘’`ʻʼ]/gi, (m) => (m[0] === 'O' ? 'O‘' : 'o‘'))
    .replace(/g['‘’`ʻʼ]/gi, (m) => (m[0] === 'G' ? 'G‘' : 'g‘'))
    .replace(/[’`ʻʼ]/g, "'")
    .replace(/[«»“”"]/g, ' ')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  // Convert any ALL-CAPS words (>= 2 letters) to lowercase
  return cleaned.replace(/\b[A-ZА-ЯЁO‘G‘]{2,}\b/g, (token) => token.toLowerCase());
}

/**
 * Deterministic filesystem-safe key for static Uzbek audio assets under
 * /audio/uz/{voiceStyle}/{slug}.wav (or .mp3).
 */
export function toUzbekAudioSlug(rawText: string): string {
  const base = normalizeUzbekOrthography(rawText)
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!base) return 'phrase';
  if (base.length <= 40) return base;

  let hash = 2166136261;
  for (let i = 0; i < base.length; i++) {
    hash ^= base.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const shortHash = (hash >>> 0).toString(36);
  return `${base.slice(0, 28)}_${shortHash}`;
}

function applyTurkicTransform(word: string): string {
  return word
    .replace(/o‘/gi, (m) => (m[0] === 'O' ? 'Ö' : 'ö'))
    .replace(/g‘/gi, (m) => (m[0] === 'G' ? 'Ğ' : 'ğ'))
    .replace(/sh/gi, (m) => (m[0] === 'S' ? 'Ş' : 'ş'))
    .replace(/ch/gi, (m) => (m[0] === 'C' ? 'Ç' : 'ç'))
    .replace(/j/gi, (m) => (m[0] === 'J' ? 'C' : 'c'))
    .replace(/q/gi, (m) => (m[0] === 'Q' ? 'K' : 'k'))
    .replace(/x/gi, (m) => (m[0] === 'X' ? 'H' : 'h'))
    .replace(/ng/gi, (m) => (m[0] === 'N' ? 'Ng' : 'ng'));
}

function applyGenericLatinFallback(word: string): string {
  return word
    .toLowerCase()
    .replace(/o‘/g, 'oh')
    .replace(/g‘/g, 'gh')
    .replace(/q/g, 'k')
    .replace(/x/g, 'kh')
    .replace(/a/g, 'ah')
    .replace(/u/g, 'oo')
    .replace(/i/g, 'ee')
    .replace(/e/g, 'eh');
}

/**
 * Prepares Uzbek text for the exact TTS engine being invoked.
 * Spoken text is normalized for accurate Uzbek phonology while UI text remains untouched.
 */
export function normalizeUzbekSpeechForTTS(
  rawText: string,
  engine: SpeechNormalizationEngine = 'gemini'
): string {
  const normalized = normalizeUzbekOrthography(rawText);
  if (!normalized) return '';

  const tokens = normalized.split(' ');
  const mappedTokens = tokens.map((token) => {
    const match = token.match(/^([^A-Za-z0-9‘']*)([A-Za-z‘']+)([^A-Za-z0-9‘']*)$/);
    if (!match) return token;
    const [, prefix, core, suffix] = match;
    const key = core.toLowerCase();
    const override = UZBEK_WORD_PRONUNCIATION_MAP[key];

    if (override) {
      const replacement =
        engine === 'gemini'
          ? override.gemini
          : engine === 'turkic_webspeech'
            ? override.turkic
            : override.latinFallback;
      return `${prefix}${replacement}${suffix}`;
    }

    if (engine === 'turkic_webspeech') {
      return `${prefix}${applyTurkicTransform(core)}${suffix}`;
    }
    if (engine === 'latin_fallback') {
      return `${prefix}${applyGenericLatinFallback(core)}${suffix}`;
    }
    const cleanCore = tokens.length === 1 ? key : core;
    return `${prefix}${cleanCore}${suffix}`;
  });

  return mappedTokens.join(' ').replace(/\s+/g, ' ').trim();
}

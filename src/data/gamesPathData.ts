import { GameStageType } from '../types';

export type SoundMatchSceneVariant = 'hedgehog_basket' | 'lock_key';

export interface SoundMatchOption {
  id: string;
  word: string;
  label: string;
  artKey: string;
  isCorrect: boolean;
}

export interface SoundMatchChallenge {
  sceneVariant: SoundMatchSceneVariant;
  titleUz: string;
  storyUz: string;
  speakPromptUz: string;
  targetLabel: string;
  options: SoundMatchOption[];
}

export type ObstacleKind =
  | 'log'
  | 'boulder'
  | 'bush'
  | 'stream'
  | 'wall'
  | 'cone'
  | 'hay'
  | 'cactus'
  | 'basket'
  | 'fence'
  | 'books'
  | 'puddle';

export interface ObstacleJumpItem {
  id: string;
  word: string;
  syllables: string;
  targetSound: string;
  artKey: string;
  obstacleKind: ObstacleKind;
  obstacleName: string;
  tipUz: string;
}

export interface SyllableWordItem {
  word: string;
  syllables: string[];
  scrambled: string[];
  artKey: string;
  soundLabel: string;
}

export type BreathScenarioKind =
  | 'rocket'
  | 'tractor'
  | 'butterfly'
  | 'ferris_wheel'
  | 'balloon';

export interface BreathChallenge {
  kind: BreathScenarioKind;
  titleUz: string;
  soundCue: string;
  instructionUz: string;
  speakPromptUz: string;
  successUz: string;
}

export interface GameStageConfig {
  stage: number;
  titleUz: string;
  type: GameStageType;
  typeLabelUz: string;
  soundFocus: string;
  soundMatch?: SoundMatchChallenge;
  obstacles?: ObstacleJumpItem[];
  syllableWords?: SyllableWordItem[];
  breathChallenge?: BreathChallenge;
}

const SOUND_MATCH_BANK: SoundMatchChallenge[] = [
  {
    sceneVariant: 'hedgehog_basket',
    titleUz: 'Tipratikan va savati',
    storyUz:
      'Tipratikan o‘tloqda «Sa» yozuvli savatini yo‘qotib qo‘ydi. Har bir savatning ovozini tinglab, to‘g‘risini toping!',
    speakPromptUz:
      'Tipratikanga yordam bering! «Sa» tovushli savatni — «Savat» so‘zini toping!',
    targetLabel: '«Sa» savati',
    options: [
      { id: 'sm1-a', word: 'Lola', label: 'Lola savati', artKey: 'lola', isCorrect: false },
      { id: 'sm1-b', word: 'Savat', label: 'Savat («Sa»)', artKey: 'savat', isCorrect: true },
      { id: 'sm1-c', word: 'Choy', label: 'Choy savati', artKey: 'choy', isCorrect: false },
      { id: 'sm1-d', word: 'Daraxt', label: 'Daraxt savati', artKey: 'daraxt', isCorrect: false },
    ],
  },
  {
    sceneVariant: 'lock_key',
    titleUz: 'Qulf va sehrli kalit',
    storyUz:
      'Sandiq qulfi faqat «Sh» tovushi bilan boshlanadigan kalit bilan ochiladi. Kalitlarni birma-bir tinglang!',
    speakPromptUz:
      'Qulfni ochish uchun «Sh» tovushi bor kalitni — «Shamol»ni tanlang!',
    targetLabel: '«Sh» kaliti',
    options: [
      { id: 'sm2-a', word: 'Shamol', label: 'Shamol kaliti', artKey: 'shamol', isCorrect: true },
      { id: 'sm2-b', word: 'Soat', label: 'Soat kaliti', artKey: 'soat', isCorrect: false },
      { id: 'sm2-c', word: 'Qalam', label: 'Qalam kaliti', artKey: 'qalam', isCorrect: false },
      { id: 'sm2-d', word: 'Uzum', label: 'Uzum kaliti', artKey: 'uzum', isCorrect: false },
    ],
  },
  {
    sceneVariant: 'hedgehog_basket',
    titleUz: 'Tipratikanning rangli savati',
    storyUz:
      'Tipratikan bog‘ yo‘lagida «R» tovushi bilan boshlanadigan savatini qidirmoqda. Avval ovozlarni eshiting!',
    speakPromptUz:
      '«R» tovushi bilan boshlanadigan «Rasm» savatini toping!',
    targetLabel: '«R» savati',
    options: [
      { id: 'sm3-a', word: 'Olma', label: 'Olma savati', artKey: 'olma', isCorrect: false },
      { id: 'sm3-b', word: 'Pishloq', label: 'Pishloq savati', artKey: 'pishloq', isCorrect: false },
      { id: 'sm3-c', word: 'Rasm', label: 'Rasm savati', artKey: 'rasm', isCorrect: true },
      { id: 'sm3-d', word: 'Sabzi', label: 'Sabzi savati', artKey: 'sabzi', isCorrect: false },
    ],
  },
  {
    sceneVariant: 'lock_key',
    titleUz: 'Qulf uchun «Ch» kaliti',
    storyUz:
      'Sehrli qulfga faqat «Ch» tovushli kalit tushadi. Har bir kalitning ovozini tinglab tanlang!',
    speakPromptUz:
      '«Ch» tovushi bor «Chiroq» kalitini tanlang!',
    targetLabel: '«Ch» kaliti',
    options: [
      { id: 'sm4-a', word: 'Balon', label: 'Balon kaliti', artKey: 'balon', isCorrect: false },
      { id: 'sm4-b', word: 'Chiroq', label: 'Chiroq kaliti', artKey: 'chiroq', isCorrect: true },
      { id: 'sm4-c', word: 'Zebra', label: 'Zebra kaliti', artKey: 'zebra', isCorrect: false },
      { id: 'sm4-d', word: 'Anor', label: 'Anor kaliti', artKey: 'anor', isCorrect: false },
    ],
  },
  {
    sceneVariant: 'hedgehog_basket',
    titleUz: 'Tipratikan va «J» savati',
    storyUz:
      'Tipratikan «J» tovushidan boshlanadigan mehmondo‘st savatni istaydi. Har bir savatni tinglab ko‘ring!',
    speakPromptUz:
      '«J» tovushli «Jirafa» savatini toping!',
    targetLabel: '«J» savati',
    options: [
      { id: 'sm5-a', word: 'Mashina', label: 'Mashina savati', artKey: 'mashina', isCorrect: false },
      { id: 'sm5-b', word: 'Tarvuz', label: 'Tarvuz savati', artKey: 'tarvuz', isCorrect: false },
      { id: 'sm5-c', word: 'Savat', label: 'Savat', artKey: 'savat', isCorrect: false },
      { id: 'sm5-d', word: 'Jirafa', label: 'Jirafa savati', artKey: 'jirafa', isCorrect: true },
    ],
  },
  {
    sceneVariant: 'lock_key',
    titleUz: '«L» tovushli oltin kalit',
    storyUz:
      'Xazina sandig‘ini ochish uchun «L» tovushi bilan boshlanadigan kalitni tanlang!',
    speakPromptUz:
      '«L» tovushidan boshlanadigan «Limon» kalitini toping!',
    targetLabel: '«L» kaliti',
    options: [
      { id: 'sm6-a', word: 'Limon', label: 'Limon kaliti', artKey: 'limon', isCorrect: true },
      { id: 'sm6-b', word: 'Qor', label: 'Qor kaliti', artKey: 'qor', isCorrect: false },
      { id: 'sm6-c', word: 'Chumoli', label: 'Chumoli kaliti', artKey: 'chumoli', isCorrect: false },
      { id: 'sm6-d', word: 'Quyosh', label: 'Quyosh kaliti', artKey: 'quyosh', isCorrect: false },
    ],
  },
  {
    sceneVariant: 'hedgehog_basket',
    titleUz: 'Tipratikan va «Z» savati',
    storyUz:
      'O‘tloqdagi to‘rtta savatdan faqat bittasida jarangli «Z» tovushi yashiringan!',
    speakPromptUz: '«Z» tovushli «Zebra» savatini toping!',
    targetLabel: '«Z» savati',
    options: [
      { id: 'sm7-a', word: 'Bulut', label: 'Bulut savati', artKey: 'bulut', isCorrect: false },
      { id: 'sm7-b', word: 'Shapka', label: 'Shapka savati', artKey: 'shapka', isCorrect: false },
      { id: 'sm7-c', word: 'Zebra', label: 'Zebra savati', artKey: 'zebra', isCorrect: true },
      { id: 'sm7-d', word: 'Olcha', label: 'Olcha savati', artKey: 'olcha', isCorrect: false },
    ],
  },
  {
    sceneVariant: 'lock_key',
    titleUz: 'Musiqali qulf kaliti',
    storyUz:
      'Sandiqni ochish uchun «B» va «R» tovushi bor «Baraban» kalitini tinglab toping!',
    speakPromptUz: 'Qulf uchun «Baraban» kalitini tanlang!',
    targetLabel: '«Baraban» kaliti',
    options: [
      { id: 'sm8-a', word: 'Gul', label: 'Gul kaliti', artKey: 'gul', isCorrect: false },
      { id: 'sm8-b', word: 'Baraban', label: 'Baraban kaliti', artKey: 'baraban', isCorrect: true },
      { id: 'sm8-c', word: 'Asal', label: 'Asal kaliti', artKey: 'asal', isCorrect: false },
      { id: 'sm8-d', word: 'Tosh', label: 'Tosh kaliti', artKey: 'tosh', isCorrect: false },
    ],
  },
];

const OBSTACLE_POOL: ObstacleJumpItem[] = [
  {
    id: 'obs-arra',
    word: 'Arra',
    syllables: 'AR - RA',
    targetSound: 'R',
    artKey: 'arra',
    obstacleKind: 'log',
    obstacleName: 'Yog‘och g‘o‘la',
    tipUz: 'Til uchini yuqori tishlar orqasida yengil titrating.',
  },
  {
    id: 'obs-soat',
    word: 'Soat',
    syllables: 'SO - AT',
    targetSound: 'S',
    artKey: 'soat',
    obstacleKind: 'boulder',
    obstacleName: 'Katta tosh',
    tipUz: 'Salqin havo oqimi bilan aniq «S» chiqaring.',
  },
  {
    id: 'obs-quyosh',
    word: 'Quyosh',
    syllables: 'QU - YOSH',
    targetSound: 'Sh',
    artKey: 'quyosh',
    obstacleKind: 'bush',
    obstacleName: 'Gullagan buta',
    tipUz: 'Lablarni yumaloqlab «Sh» tovushini mayin ayting.',
  },
  {
    id: 'obs-lola',
    word: 'Lola',
    syllables: 'LO - LA',
    targetSound: 'L',
    artKey: 'lola',
    obstacleKind: 'stream',
    obstacleName: 'Moviy ariqcha',
    tipUz: 'Til uchini yuqori tishlarga yumshoq bosing.',
  },
  {
    id: 'obs-choy',
    word: 'Choy',
    syllables: 'CHOY',
    targetSound: 'Ch',
    artKey: 'choy',
    obstacleKind: 'wall',
    obstacleName: 'G‘isht devorcha',
    tipUz: 'Til uchini tanglayga bosib qisqa «Ch» oching.',
  },
  {
    id: 'obs-daraxt',
    word: 'Daraxt',
    syllables: 'DA - RAXT',
    targetSound: 'R',
    artKey: 'daraxt',
    obstacleKind: 'log',
    obstacleName: 'Qarag‘ay g‘o‘lasi',
    tipUz: '«Da-raxt» bo‘g‘inlarini shoshilmay ayting.',
  },
  {
    id: 'obs-sabzi',
    word: 'Sabzi',
    syllables: 'SAB - ZI',
    targetSound: 'S',
    artKey: 'sabzi',
    obstacleKind: 'hay',
    obstacleName: 'Somon to‘siq',
    tipUz: '«S» va «Z» tovushlarini aniq ajrating.',
  },
  {
    id: 'obs-mashina',
    word: 'Mashina',
    syllables: 'MA - SHI - NA',
    targetSound: 'Sh',
    artKey: 'mashina',
    obstacleKind: 'cone',
    obstacleName: 'Yo‘l to‘sig‘i',
    tipUz: '«Shi» bo‘g‘inini tiniq eshittiring.',
  },
  {
    id: 'obs-olma',
    word: 'Olma',
    syllables: 'OL - MA',
    targetSound: 'L',
    artKey: 'olma',
    obstacleKind: 'boulder',
    obstacleName: 'Daryo toshi',
    tipUz: '«Ol» bo‘g‘inida tilni tishlar orqasiga tekkizing.',
  },
  {
    id: 'obs-zebra',
    word: 'Zebra',
    syllables: 'ZEB - RA',
    targetSound: 'J/Z',
    artKey: 'zebra',
    obstacleKind: 'cactus',
    obstacleName: 'Tikanli kaktus',
    tipUz: 'Jarangli «Z» va yumshoq «R» ni bog‘lang.',
  },
  {
    id: 'obs-joja',
    word: 'Jo‘ja',
    syllables: 'JO‘ - JA',
    targetSound: 'J/Z',
    artKey: 'joja',
    obstacleKind: 'basket',
    obstacleName: 'To‘qima savat',
    tipUz: 'Ovoz paychalarini ishlatib «J» ayting.',
  },
  {
    id: 'obs-anor',
    word: 'Anor',
    syllables: 'A - NOR',
    targetSound: 'R',
    artKey: 'anor',
    obstacleKind: 'fence',
    obstacleName: 'Bog‘ panjarasi',
    tipUz: 'Oxiridagi «R» tovushini tiniq tugating.',
  },
  {
    id: 'obs-olcha',
    word: 'Olcha',
    syllables: 'OL - CHA',
    targetSound: 'Ch',
    artKey: 'olcha',
    obstacleKind: 'wall',
    obstacleName: 'Pastak devor',
    tipUz: '«Cha» bo‘g‘inini qisqa va aniq chiqaring.',
  },
  {
    id: 'obs-qalam',
    word: 'Qalam',
    syllables: 'QA - LAM',
    targetSound: 'L',
    artKey: 'qalam',
    obstacleKind: 'books',
    obstacleName: 'Kitoblar uyumi',
    tipUz: '«Lam» bo‘g‘inini mayin talaffuz qiling.',
  },
  {
    id: 'obs-shamol',
    word: 'Shamol',
    syllables: 'SHA - MOL',
    targetSound: 'Sh',
    artKey: 'shamol',
    obstacleKind: 'puddle',
    obstacleName: 'Moviy ko‘lmak',
    tipUz: '«Sha» bo‘g‘inida lablarni oldinga cho‘zing.',
  },
];

const SYLLABLE_WORD_POOL: SyllableWordItem[] = [
  { word: 'Baraban', syllables: ['BA', 'RA', 'BAN'], scrambled: ['BAN', 'BA', 'RA'], artKey: 'baraban', soundLabel: 'R' },
  { word: 'Mashina', syllables: ['MA', 'SHI', 'NA'], scrambled: ['NA', 'MA', 'SHI'], artKey: 'mashina', soundLabel: 'Sh' },
  { word: 'Chumoli', syllables: ['CHU', 'MO', 'LI'], scrambled: ['LI', 'CHU', 'MO'], artKey: 'chumoli', soundLabel: 'Ch' },
  { word: 'Kamalak', syllables: ['KA', 'MA', 'LAK'], scrambled: ['LAK', 'MA', 'KA'], artKey: 'kamalak', soundLabel: 'L' },
  { word: 'Tarvuz', syllables: ['TAR', 'VUZ'], scrambled: ['VUZ', 'TAR'], artKey: 'tarvuz', soundLabel: 'R' },
  { word: 'Jirafa', syllables: ['JI', 'RA', 'FA'], scrambled: ['FA', 'JI', 'RA'], artKey: 'jirafa', soundLabel: 'J' },
  { word: 'Shokolad', syllables: ['SHO', 'KO', 'LAD'], scrambled: ['LAD', 'SHO', 'KO'], artKey: 'shokolad', soundLabel: 'Sh' },
  { word: 'Samolyot', syllables: ['SA', 'MOL', 'YOT'], scrambled: ['YOT', 'SA', 'MOL'], artKey: 'samolyot', soundLabel: 'S' },
  { word: 'Soyabon', syllables: ['SO', 'YA', 'BON'], scrambled: ['BON', 'SO', 'YA'], artKey: 'soyabon', soundLabel: 'S' },
  { word: 'Shalola', syllables: ['SHA', 'LO', 'LA'], scrambled: ['LA', 'SHA', 'LO'], artKey: 'shalola', soundLabel: 'L' },
  { word: 'Choynak', syllables: ['CHOY', 'NAK'], scrambled: ['NAK', 'CHOY'], artKey: 'choynak', soundLabel: 'Ch' },
  { word: 'Pishloq', syllables: ['PISH', 'LOQ'], scrambled: ['LOQ', 'PISH'], artKey: 'pishloq', soundLabel: 'Sh' },
  { word: 'Karvon', syllables: ['KAR', 'VON'], scrambled: ['VON', 'KAR'], artKey: 'karvon', soundLabel: 'R' },
  { word: 'Musiqa', syllables: ['MU', 'SI', 'QA'], scrambled: ['QA', 'MU', 'SI'], artKey: 'musiqa', soundLabel: 'S' },
  { word: 'Qoshiq', syllables: ['QO', 'SHIQ'], scrambled: ['SHIQ', 'QO'], artKey: 'qoshiq', soundLabel: 'Sh' },
];

const BREATH_CHALLENGE_BANK: BreathChallenge[] = [
  {
    kind: 'rocket',
    titleUz: 'Raketani uchir!',
    soundCue: 'Puf-puf-puf!',
    instructionUz: 'Mikrofonga «Puf-puf!» deb puflang — raketa olovi kuchayib yulduzlar sari ko‘tariladi!',
    speakPromptUz: 'Mikrofonga puf-puf deb puflab, Kikining raketasini uchiring!',
    successUz: 'Ura! Raketa koinotga ko‘tarildi!',
  },
  {
    kind: 'tractor',
    titleUz: 'Traktorni yurgiz!',
    soundCue: 'Tarr-tarr-tarr!',
    instructionUz: 'Mikrofonga «Tarr-tarr!» deb ayting — traktor sariq yo‘lakdan g‘ildiraklarini aylantirib yuradi!',
    speakPromptUz: 'Tarr-tarr deb ayting va traktorni sariq yo‘lakdan yurgizing!',
    successUz: 'Ajoyib! Traktor marraga yetib keldi!',
  },
  {
    kind: 'butterfly',
    titleUz: 'Kapalakni uchir!',
    soundCue: 'Prr-prr-prr!',
    instructionUz: 'Mayin «Prr-prr» deb puflang — kapalak qanot qoqib gullar sari ko‘tariladi!',
    speakPromptUz: 'Prr-prr deb mayin puflab, kapalakni gullar ustiga uchiring!',
    successUz: 'Go‘zal! Kapalak gullar ustiga qo‘ndi!',
  },
  {
    kind: 'ferris_wheel',
    titleUz: 'Charhfalakni aylantir!',
    soundCue: 'Fuf-fuf-shsh!',
    instructionUz: 'Chuqur nafas olib «Fuf-fuf» deb puflang — bog‘dagi charhfalak kabinalari ravon aylanadi!',
    speakPromptUz: 'Fuf-fuf deb uzoqroq puflab, charhfalakni aylantiring!',
    successUz: 'Zo‘r nafas nazorati! Charhfalak chaqqon aylandi!',
  },
  {
    kind: 'balloon',
    titleUz: 'Havo sharini uchir!',
    soundCue: 'Puf-puf-shsh!',
    instructionUz: 'Mikrofonga «Puf!» deb puflab havo sharini to‘ldiring va osmonga ko‘taring!',
    speakPromptUz: 'Puf deb puflab, havo sharini bulutlar sari ko‘taring!',
    successUz: 'Barakalla! Havo shari ko‘klarga ko‘tarildi!',
  },
];

// Varied mixed sequence across 30 levels:
// Levels 1..4 immediately introduce all 4 game types;
// Levels 5..30 mix and distribute all 4 game types evenly across the winding snake path.
const STAGE_TYPE_ORDER: GameStageType[] = [
  'sound_match',   // 1  (Tipratikan va savati)
  'obstacle_jump', // 2  (5 to‘siqdan sakrash)
  'syllables',     // 3  (Bo‘g‘inlar o‘yini - 5 so‘z)
  'breath_power',  // 4  (Raketa: puf-puf)
  'sound_match',   // 5  (Qulf va kalit)
  'syllables',     // 6
  'breath_power',  // 7  (Traktor: tarr-tarr)
  'obstacle_jump', // 8
  'syllables',     // 9
  'sound_match',   // 10 (Tipratikan va savati)
  'obstacle_jump', // 11
  'breath_power',  // 12 (Kapalak: prr-prr)
  'sound_match',   // 13 (Qulf va kalit)
  'obstacle_jump', // 14
  'breath_power',  // 15 (Charhfalak)
  'syllables',     // 16
  'obstacle_jump', // 17
  'sound_match',   // 18 (Tipratikan va savati)
  'syllables',     // 19
  'breath_power',  // 20 (Havo shari)
  'sound_match',   // 21 (Qulf va kalit)
  'syllables',     // 22
  'obstacle_jump', // 23
  'breath_power',  // 24 (Raketa)
  'syllables',     // 25
  'sound_match',   // 26 (Tipratikan va savati)
  'breath_power',  // 27 (Traktor)
  'obstacle_jump', // 28
  'sound_match',   // 29 (Qulf va kalit)
  'breath_power',  // 30 (Charhfalak)
];

function getTypeLabel(type: GameStageType): string {
  switch (type) {
    case 'sound_match':
      return 'Tovushni top';
    case 'obstacle_jump':
      return '5 to‘siqdan sakra';
    case 'syllables':
      return 'Bo‘g‘inlar o‘yini';
    case 'breath_power':
      return 'Nafas va tovush';
  }
}

function rotateSlice<T>(pool: T[], startOffset: number, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(startOffset + i) % pool.length]);
  }
  return result;
}

let soundMatchCursor = 0;
let obstacleCursor = 0;
let syllableCursor = 0;
let breathCursor = 0;

export const THIRTY_GAME_STAGES: GameStageConfig[] = STAGE_TYPE_ORDER.map(
  (type, index) => {
    const stage = index + 1;

    if (type === 'sound_match') {
      const challenge = SOUND_MATCH_BANK[soundMatchCursor % SOUND_MATCH_BANK.length];
      soundMatchCursor += 1;
      return {
        stage,
        titleUz: challenge.titleUz,
        type,
        typeLabelUz: getTypeLabel(type),
        soundFocus: challenge.targetLabel,
        soundMatch: challenge,
      };
    }

    if (type === 'obstacle_jump') {
      const obstacles = rotateSlice(OBSTACLE_POOL, obstacleCursor * 3, 5);
      obstacleCursor += 1;
      return {
        stage,
        titleUz: `To‘siqdan sakrash (${stage}-bosqich)`,
        type,
        typeLabelUz: getTypeLabel(type),
        soundFocus: '5 ta to‘siq · Mik',
        obstacles,
      };
    }

    if (type === 'syllables') {
      const syllableWords = rotateSlice(SYLLABLE_WORD_POOL, syllableCursor * 3, 5);
      syllableCursor += 1;
      return {
        stage,
        titleUz: `Bo‘g‘inlar o‘yini (5 so‘z)`,
        type,
        typeLabelUz: getTypeLabel(type),
        soundFocus: '5 ta so‘z · Bo‘g‘in',
        syllableWords,
      };
    }

    const breathChallenge =
      BREATH_CHALLENGE_BANK[breathCursor % BREATH_CHALLENGE_BANK.length];
    breathCursor += 1;
    return {
      stage,
      titleUz: breathChallenge.titleUz,
      type,
      typeLabelUz: getTypeLabel(type),
      soundFocus: breathChallenge.soundCue,
      breathChallenge,
    };
  }
);

import {
  DiagnosticLetterScore,
  DiagnosticReport,
  DiagnosticWordItem,
  DiagnosticWordResult,
  SoundKey,
} from '../types';

export const DIAGNOSTIC_WORDS: DiagnosticWordItem[] = [
  // 1. Sonorlar (R, L) — 5 so‘z
  {
    id: 'diag-01',
    order: 1,
    word: 'Arra',
    syllables: 'AR - RA',
    emoji: '🪚',
    targetLetter: 'R',
    mappedSoundKey: 'R',
    soundGroup: 'Sonorlar (R, L)',
    tipUz: 'Til uchini yuqori tishlar orqasiga tekkizib, yengil titrating.',
  },
  {
    id: 'diag-02',
    order: 2,
    word: 'Daraxt',
    syllables: 'DA - RAXT',
    emoji: '🌳',
    targetLetter: 'R',
    mappedSoundKey: 'R',
    soundGroup: 'Sonorlar (R, L)',
    tipUz: 'O‘rtadagi «R» tovushini shoshilmasdan, tiniq ayting.',
  },
  {
    id: 'diag-03',
    order: 3,
    word: 'Rasm',
    syllables: 'RASM',
    emoji: '🎨',
    targetLetter: 'R',
    mappedSoundKey: 'R',
    soundGroup: 'Sonorlar (R, L)',
    tipUz: 'So‘z boshidagi «R» ni dadil va aniq boshlang.',
  },
  {
    id: 'diag-04',
    order: 4,
    word: 'Lola',
    syllables: 'LO - LA',
    emoji: '🌷',
    targetLetter: 'L',
    mappedSoundKey: 'L',
    soundGroup: 'Sonorlar (R, L)',
    tipUz: 'Til uchini yuqori old tishlarning orqasiga yumshoq bosing.',
  },
  {
    id: 'diag-05',
    order: 5,
    word: 'Qalam',
    syllables: 'QA - LAM',
    emoji: '✏️',
    targetLetter: 'L',
    mappedSoundKey: 'L',
    soundGroup: 'Sonorlar (R, L)',
    tipUz: '«L» tovushini mayin va ravon talaffuz qiling.',
  },

  // 2. Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H) — 10 so‘z
  {
    id: 'diag-06',
    order: 6,
    word: 'Soat',
    syllables: 'SO - AT',
    emoji: '⏰',
    targetLetter: 'S',
    mappedSoundKey: 'S',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: 'Tishlarni yaqinlashtirib, salqin havo oqimini chiqaring.',
  },
  {
    id: 'diag-07',
    order: 7,
    word: 'Asal',
    syllables: 'A - SAL',
    emoji: '🍯',
    targetLetter: 'S',
    mappedSoundKey: 'S',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: 'Til uchini pastki tishlar orqasida tutib, toza «S» ayting.',
  },
  {
    id: 'diag-08',
    order: 8,
    word: 'Zebra',
    syllables: 'ZEB - RA',
    emoji: '🦓',
    targetLetter: 'Z',
    mappedSoundKey: 'J/Z',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: '«Z» tovushini ovoz tebranishi bilan jarangdor chiqaring.',
  },
  {
    id: 'diag-09',
    order: 9,
    word: 'Quyosh',
    syllables: 'QU - YOSH',
    emoji: '☀️',
    targetLetter: 'Sh',
    mappedSoundKey: 'Sh',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: 'Lablarni oldinga biroz cho‘zib, iliq havo oqimi bilan «Sh» ayting.',
  },
  {
    id: 'diag-10',
    order: 10,
    word: 'Shamol',
    syllables: 'SHA - MOL',
    emoji: '🌬️',
    targetLetter: 'Sh',
    mappedSoundKey: 'Sh',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: 'Xuddi shamol esgandek mayin va davomli «Sh» tovushi chiqaring.',
  },
  {
    id: 'diag-11',
    order: 11,
    word: 'Jo‘ja',
    syllables: 'JO‘ - JA',
    emoji: '🐥',
    targetLetter: 'J',
    mappedSoundKey: 'J/Z',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: 'Jarangli «J» tovushini lablarni yumaloqlab boshlang.',
  },
  {
    id: 'diag-12',
    order: 12,
    word: 'Choy',
    syllables: 'CHOY',
    emoji: '🫖',
    targetLetter: 'Ch',
    mappedSoundKey: 'Ch',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: 'Til uchini yuqori tanglayga bosib, havoni qisqa va keskin oching.',
  },
  {
    id: 'diag-13',
    order: 13,
    word: 'Olcha',
    syllables: 'OL - CHA',
    emoji: '🍒',
    targetLetter: 'Ch',
    mappedSoundKey: 'Ch',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: '«Ch» ni «Sh» ga cho‘zib yubormasdan qisqa talaffuz qiling.',
  },
  {
    id: 'diag-14',
    order: 14,
    word: 'Xona',
    syllables: 'XO - NA',
    emoji: '🏠',
    targetLetter: 'X',
    mappedSoundKey: 'Sh',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: '«X» tovushini tanglay orqasidan yengil shovqin bilan chiqaring.',
  },
  {
    id: 'diag-15',
    order: 15,
    word: 'Bahor',
    syllables: 'BA - HOR',
    emoji: '🌸',
    targetLetter: 'H',
    mappedSoundKey: 'R',
    soundGroup: 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)',
    tipUz: '«H» tovushini bo‘g‘izdan mayin va yengil nafas bilan chiqaring.',
  },

  // 3. Portlovchi (K, G, Q, G‘, T, D, P, B) — 8 so‘z
  {
    id: 'diag-16',
    order: 16,
    word: 'Kitob',
    syllables: 'KI - TOB',
    emoji: '📚',
    targetLetter: 'K',
    mappedSoundKey: 'Ch',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: '«Ki» bo‘g‘inida til orqasini tanglayga tegizib tez oching.',
  },
  {
    id: 'diag-17',
    order: 17,
    word: 'Gul',
    syllables: 'GUL',
    emoji: '🌺',
    targetLetter: 'G',
    mappedSoundKey: 'L',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: 'Jarangli «G» tovushini bo‘shashmasdan aniq boshlang.',
  },
  {
    id: 'diag-18',
    order: 18,
    word: 'Qor',
    syllables: 'QOR',
    emoji: '❄️',
    targetLetter: 'Q',
    mappedSoundKey: 'R',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: 'Chuqur «Q» tovushini til ildizi bilan qat’iy chiqaring.',
  },
  {
    id: 'diag-19',
    order: 19,
    word: 'G‘oz',
    syllables: 'G‘OZ',
    emoji: '🦢',
    targetLetter: 'G‘',
    mappedSoundKey: 'J/Z',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: '«G‘» tovushini bo‘g‘iz orqasidan yumshoq va jarangli ayting.',
  },
  {
    id: 'diag-20',
    order: 20,
    word: 'Tog‘',
    syllables: 'TOG‘',
    emoji: '⛰️',
    targetLetter: 'T',
    mappedSoundKey: 'S',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: '«T» ni til uchi bilan yuqori tishlarga urib aniq talaffuz qiling.',
  },
  {
    id: 'diag-21',
    order: 21,
    word: 'Daryo',
    syllables: 'DAR - YO',
    emoji: '🌊',
    targetLetter: 'D',
    mappedSoundKey: 'R',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: '«D» tovushini jarangli boshlab, «r» ga silliq o‘ting.',
  },
  {
    id: 'diag-22',
    order: 22,
    word: 'Pishloq',
    syllables: 'PISH - LOQ',
    emoji: '🧀',
    targetLetter: 'P',
    mappedSoundKey: 'Sh',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: 'Ikkala labni jips yopib, «P» ni havo bilan tez oching.',
  },
  {
    id: 'diag-23',
    order: 23,
    word: 'Bola',
    syllables: 'BO - LA',
    emoji: '🧒',
    targetLetter: 'B',
    mappedSoundKey: 'L',
    soundGroup: 'Portlovchi (K, G, Q, G‘, T, D, P, B)',
    tipUz: 'Lablarni yengil juftlab, jarangli «B» tovushini ayting.',
  },

  // 4. Unli va burun (O‘, Ng) — 2 so‘z
  {
    id: 'diag-24',
    order: 24,
    word: 'O‘rdak',
    syllables: 'O‘R - DAK',
    emoji: '🦆',
    targetLetter: 'O‘',
    mappedSoundKey: 'R',
    soundGroup: 'Unli va burun (O‘, Ng)',
    tipUz: 'Lablarni oldinga yumaloqlab, «O‘» tovushini «O» bilan adashtirmang.',
  },
  {
    id: 'diag-25',
    order: 25,
    word: 'Tong',
    syllables: 'TONG',
    emoji: '🌅',
    targetLetter: 'Ng',
    mappedSoundKey: 'L',
    soundGroup: 'Unli va burun (O‘, Ng)',
    tipUz: 'Oxirida «n» va «g» ni alohida emas, yaxlit burun tovushi «ng» qilib ayting.',
  },
];

export const LETTER_TIPS_UZ: Record<string, string> = {
  R: 'Har kuni 3 daqiqa «dr-dr» tebranish mashqini bajaring va «Arra», «Rasm» so‘zlarini bo‘g‘inlab ayting.',
  L: 'Til uchini yuqori old tishlar orqasiga yengil bosib, «la-lo-lu» mashqini takrorlang.',
  S: 'Tishlarni birlashtirib, til uchini pastda tutgan holda salqin «s-s-s» havo chiqaring.',
  Z: 'Qo‘lingizni bo‘g‘zingizga qo‘yib «z-z-z» ovoz tebranishini his qiling.',
  Sh: 'Lablarni oldinga cho‘zib, iliq havo oqimi bilan «sh-sh-sh» mashqini bajaring.',
  J: 'Lablarni yumaloqlab, «jo‘ja», «jirafa» so‘zlarini jarangdor ayting.',
  Ch: 'Til uchini tanglayga bosib, «choy», «olcha» so‘zlarida qisqa va keskin oching.',
  X: 'Tanglay orqasidan mayin shovqin chiqarib, «xona», «xat» so‘zlarini mashq qiling.',
  H: 'Bo‘g‘izdan yengil iliq nafas chiqarib «bahor», «havo» so‘zlarini ayting.',
  K: 'Til orqasini tanglayga tegizib, «kitob», «kamalak» so‘zlarini dadil boshlang.',
  G: 'Ovoz bilan jarangdor «gul», «gilos» so‘zlarini talaffuz qiling.',
  Q: 'Chuqur «q» tovushini «qor», «qalam» so‘zlarida aniq ajrating.',
  'G‘': '«G‘oz», «tog‘» so‘zlarida bo‘g‘iz orqali yumshoq tebranish hosil qiling.',
  T: 'Til uchini yuqori tishlarga urib «tog‘», «tarvuz» so‘zlarini tiniq ayting.',
  D: 'Jarangdor «daryo», «daraxt» so‘zlarida til uchini chaqqon ishlating.',
  P: 'Lablarni jips yopib, «pishloq», «paxta» so‘zlarini havo bilan oching.',
  B: 'Lablarni yumshoq juftlab «bola», «baraban» so‘zlarini ravon ayting.',
  'O‘': 'Lablarni oldinga yumaloqlab «o‘rdak», «o‘rik» so‘zlarini «o» dan farqlang.',
  Ng: '«Tong», «keng» so‘zlarida «ng» tovushini yaxlit burun ohangi bilan yakunlang.',
};

function classifyStatus(score: number): 'excellent' | 'medium' | 'needs_practice' {
  if (score >= 85) return 'excellent';
  if (score >= 60) return 'medium';
  return 'needs_practice';
}

export function computeDiagnosticReport(
  results: DiagnosticWordResult[],
  isDemo = false
): DiagnosticReport {
  const byLetter = new Map<string, DiagnosticWordResult[]>();
  for (const item of results) {
    const arr = byLetter.get(item.targetLetter) || [];
    arr.push(item);
    byLetter.set(item.targetLetter, arr);
  }

  const letterScores: DiagnosticLetterScore[] = [];
  for (const wordItem of DIAGNOSTIC_WORDS) {
    if (letterScores.some((ls) => ls.letter === wordItem.targetLetter)) continue;
    const entries = byLetter.get(wordItem.targetLetter) || [];
    const avgScore =
      entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)
        : 55;

    letterScores.push({
      letter: wordItem.targetLetter,
      mappedSoundKey: wordItem.mappedSoundKey,
      soundGroup: wordItem.soundGroup,
      score: avgScore,
      status: classifyStatus(avgScore),
      wordsTested: entries.length,
      tipUz: LETTER_TIPS_UZ[wordItem.targetLetter] || wordItem.tipUz,
    });
  }

  const overallScore =
    letterScores.length > 0
      ? Math.round(
          letterScores.reduce((sum, l) => sum + l.score, 0) / letterScores.length
        )
      : 0;

  const sortedAsc = [...letterScores].sort((a, b) => a.score - b.score);
  const weakestLetters = sortedAsc.slice(0, 4);
  const recommendedCityFocusLetters = sortedAsc
    .filter((l) => l.score < 85)
    .slice(0, 4)
    .map((l) => l.letter);

  const completedWords = results.filter((r) => !r.skipped).length;

  return {
    id: `diag-report-${Date.now()}`,
    completedAt: new Date().toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    overallScore,
    totalWords: DIAGNOSTIC_WORDS.length,
    completedWords,
    isDemo,
    letterScores,
    weakestLetters,
    recommendedCityFocusLetters:
      recommendedCityFocusLetters.length > 0
        ? recommendedCityFocusLetters
        : sortedAsc.slice(0, 3).map((l) => l.letter),
  };
}

export function buildDemoDiagnosticReport(): DiagnosticReport {
  const demoLetterScores: Record<string, number> = {
    R: 48,
    L: 81,
    S: 72,
    Z: 84,
    Sh: 56,
    J: 79,
    Ch: 74,
    X: 88,
    H: 91,
    K: 94,
    G: 89,
    Q: 76,
    'G‘': 54,
    T: 95,
    D: 92,
    P: 90,
    B: 96,
    'O‘': 86,
    Ng: 67,
  };

  const results: DiagnosticWordResult[] = DIAGNOSTIC_WORDS.map((item, idx) => {
    const base = demoLetterScores[item.targetLetter] ?? 80;
    const jitter = idx % 2 === 0 ? 2 : -2;
    const score = Math.max(30, Math.min(99, base + jitter));
    return {
      wordId: item.id,
      word: item.word,
      targetLetter: item.targetLetter,
      mappedSoundKey: item.mappedSoundKey,
      soundGroup: item.soundGroup,
      score,
      skipped: false,
      transcript: item.word,
    };
  });

  return computeDiagnosticReport(results, true);
}

export function getPersonalizedPracticeWordsForLetters(
  letters: string[]
): { letter: string; word: string; syllables: string; emoji: string; tipUz: string }[] {
  const targetSet = new Set(letters.map((l) => l.toLowerCase()));
  const matched = DIAGNOSTIC_WORDS.filter((w) =>
    targetSet.has(w.targetLetter.toLowerCase())
  );
  const source = matched.length > 0 ? matched : DIAGNOSTIC_WORDS.slice(0, 4);
  return source.map((item) => ({
    letter: item.targetLetter,
    word: item.word,
    syllables: item.syllables,
    emoji: item.emoji,
    tipUz: item.tipUz,
  }));
}

export function mapDiagnosticWeakestToSoundKey(
  report: DiagnosticReport
): SoundKey {
  return report.weakestLetters[0]?.mappedSoundKey || 'R';
}

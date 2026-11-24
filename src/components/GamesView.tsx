import React, { useState } from 'react';
import {
  CheckCircle2,
  Coins,
  Gamepad2,
  Mic,
  Puzzle,
  RefreshCw,
  Sparkles,
  Star,
  Volume2,
  Zap,
} from 'lucide-react';
import { KikiMascot } from './KikiMascot';
import {
  playButtonPop,
  playRetryTone,
  playSuccessChime,
  speakWord,
} from '../utils/soundEffects';
import { analyzePronunciation } from '../utils/speechAnalysis';
import { PracticeWord } from '../types';

interface GamesViewProps {
  sfxEnabled: boolean;
  onRewardEarned: (starsEarned: number, coinsEarned: number) => void;
}

type GameMode = 'detect' | 'syllables' | 'speed';

interface SoundDetectRound {
  targetSound: string;
  hint: string;
  options: { word: string; hasTarget: boolean }[];
}

const DETECT_ROUNDS: SoundDetectRound[] = [
  {
    targetSound: 'R',
    hint: 'Til uchi yengil titraydigan «R» tovushli so‘zni toping!',
    options: [
      { word: 'Soat', hasTarget: false },
      { word: 'Baraban', hasTarget: true },
      { word: 'Lola', hasTarget: false },
      { word: 'Quyosh', hasTarget: false },
    ],
  },
  {
    targetSound: 'Sh',
    hint: 'Qaysi so‘zda mayin shamoldek «Sh» tovushi bor?',
    options: [
      { word: 'Shamol', hasTarget: true },
      { word: 'Olma', hasTarget: false },
      { word: 'Zebra', hasTarget: false },
      { word: 'Qalam', hasTarget: false },
    ],
  },
  {
    targetSound: 'Ch',
    hint: 'Qisqa va jarangli «Ch» tovushi qaysi so‘zda?',
    options: [
      { word: 'Bahor', hasTarget: false },
      { word: 'Asal', hasTarget: false },
      { word: 'Chumoli', hasTarget: true },
      { word: 'Bulut', hasTarget: false },
    ],
  },
  {
    targetSound: 'J/Z',
    hint: 'Jarangli «Z» yoki «J» tovushli so‘zni tanlang!',
    options: [
      { word: 'Choy', hasTarget: false },
      { word: 'Jirafa', hasTarget: true },
      { word: 'Pishloq', hasTarget: false },
      { word: 'Tosh', hasTarget: false },
    ],
  },
  {
    targetSound: 'S',
    hint: 'Salqin havo oqimli «S» tovushi qaysi so‘zda yashiringan?',
    options: [
      { word: 'Sabzi', hasTarget: true },
      { word: 'Daraxt', hasTarget: false },
      { word: 'Olcha', hasTarget: false },
      { word: 'Gul', hasTarget: false },
    ],
  },
];

interface SyllablePuzzle {
  word: string;
  syllables: string[];
  scrambled: string[];
  soundLabel: string;
}

const SYLLABLE_PUZZLES: SyllablePuzzle[] = [
  {
    word: 'BARABAN',
    syllables: ['BA', 'RA', 'BAN'],
    scrambled: ['BAN', 'BA', 'RA'],
    soundLabel: 'R tovushi',
  },
  {
    word: 'MASHINA',
    syllables: ['MA', 'SHI', 'NA'],
    scrambled: ['NA', 'MA', 'SHI'],
    soundLabel: 'Sh tovushi',
  },
  {
    word: 'CHUMOLI',
    syllables: ['CHU', 'MO', 'LI'],
    scrambled: ['LI', 'CHU', 'MO'],
    soundLabel: 'Ch tovushi',
  },
  {
    word: 'KAMALAK',
    syllables: ['KA', 'MA', 'LAK'],
    scrambled: ['LAK', 'MA', 'KA'],
    soundLabel: 'L tovushi',
  },
  {
    word: 'QALDIRG‘OCH',
    syllables: ['QAL', 'DIR', 'G‘OCH'],
    scrambled: ['G‘OCH', 'QAL', 'DIR'],
    soundLabel: 'R · Ch tovushi',
  },
];

const SPEED_CHALLENGES: PracticeWord[] = [
  {
    id: 'sp-1',
    word: 'Arra bilan daraxt kesdik',
    syllables: 'AR-RA · BI-LAN · DA-RAXT',
    targetSound: 'R',
    speechLang: 'uz-UZ',
    exampleUsage: 'Tez aytish raundi: R tovushini tiniq chiqaring!',
    tipUz: 'Har bir R tovushida til uchini bir maromda tebrating.',
  },
  {
    id: 'sp-2',
    word: 'Shamol shoxlarni shildiratdi',
    syllables: 'SHA-MOL · SHOX-LAR-NI',
    targetSound: 'Sh',
    speechLang: 'uz-UZ',
    exampleUsage: 'Tez aytish raundi: Sh tovushini S ga aylantirmang!',
    tipUz: 'Lablarni biroz oldinga cho‘zib mayin gapiring.',
  },
  {
    id: 'sp-3',
    word: 'Oq choynakka ko‘k qopqoq',
    syllables: 'OQ · CHOY-NAK-KA · QOP-QOQ',
    targetSound: 'Ch',
    speechLang: 'uz-UZ',
    exampleUsage: 'Tez aytish raundi: Ch va Q tovushlarini aniq ajrating!',
    tipUz: 'Avval sekin, keyin esa ritm bilan ayting.',
  },
  {
    id: 'sp-4',
    word: 'Sariq sabzi savatda',
    syllables: 'SA-RIQ · SAB-ZI · SA-VAT-DA',
    targetSound: 'S',
    speechLang: 'uz-UZ',
    exampleUsage: 'Tez aytish raundi: barcha S tovushlarini toza ayting!',
    tipUz: 'Tishlarni yaqin tutib salqin havo chiqaring.',
  },
];

export const GamesView: React.FC<GamesViewProps> = ({
  sfxEnabled,
  onRewardEarned,
}) => {
  const [activeGame, setActiveGame] = useState<GameMode>('detect');
  const [sessionStars, setSessionStars] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);

  // Game 1: Sound Detective
  const [detectIdx, setDetectIdx] = useState(0);
  const [detectPicked, setDetectPicked] = useState<string | null>(null);
  const [detectFeedback, setDetectFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Game 2: Syllable Builder
  const [sylIdx, setSylIdx] = useState(0);
  const [chosenIndices, setChosenIndices] = useState<number[]>([]);
  const [sylStatus, setSylStatus] = useState<'idle' | 'won' | 'wrong'>('idle');

  // Game 3: Speed Pronunciation
  const [speedIdx, setSpeedIdx] = useState(0);
  const [speedResult, setSpeedResult] = useState<{
    accuracy: number;
    feedbackUz: string;
    passed: boolean;
  } | null>(null);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  const currentDetect = DETECT_ROUNDS[detectIdx % DETECT_ROUNDS.length];
  const currentPuzzle = SYLLABLE_PUZZLES[sylIdx % SYLLABLE_PUZZLES.length];
  const currentSpeed = SPEED_CHALLENGES[speedIdx % SPEED_CHALLENGES.length];

  const grantReward = (starsAmt: number, coinsAmt: number) => {
    setSessionStars((prev) => prev + starsAmt);
    setSessionCoins((prev) => prev + coinsAmt);
    onRewardEarned(starsAmt, coinsAmt);
  };

  // Handlers for Game 1
  const handleDetectChoice = (word: string, hasTarget: boolean) => {
    setDetectPicked(word);
    if (hasTarget) {
      playSuccessChime(!sfxEnabled);
      if (detectFeedback !== 'correct') {
        grantReward(5, 10);
      }
      setDetectFeedback('correct');
    } else {
      playRetryTone(!sfxEnabled);
      setDetectFeedback('wrong');
    }
  };

  const handleNextDetect = () => {
    playButtonPop(!sfxEnabled);
    setDetectPicked(null);
    setDetectFeedback(null);
    setDetectIdx((prev) => (prev + 1) % DETECT_ROUNDS.length);
  };

  // Handlers for Game 2
  const handlePickSyllable = (scrambledIndex: number) => {
    if (chosenIndices.includes(scrambledIndex) || sylStatus === 'won') return;
    playButtonPop(!sfxEnabled);
    const nextChosen = [...chosenIndices, scrambledIndex];
    setChosenIndices(nextChosen);

    if (nextChosen.length === currentPuzzle.scrambled.length) {
      const assembled = nextChosen.map((i) => currentPuzzle.scrambled[i]).join('');
      if (assembled === currentPuzzle.word) {
        playSuccessChime(!sfxEnabled);
        setSylStatus('won');
        grantReward(8, 15);
        speakWord(currentPuzzle.word, 'uz-UZ');
      } else {
        playRetryTone(!sfxEnabled);
        setSylStatus('wrong');
      }
    } else {
      setSylStatus('idle');
    }
  };

  const handleResetSyllables = () => {
    playButtonPop(!sfxEnabled);
    setChosenIndices([]);
    setSylStatus('idle');
  };

  const handleNextSyllables = () => {
    playButtonPop(!sfxEnabled);
    setChosenIndices([]);
    setSylStatus('idle');
    setSylIdx((prev) => (prev + 1) % SYLLABLE_PUZZLES.length);
  };

  // Handlers for Game 3
  const handleRunSpeedPronunciation = (useMic: boolean) => {
    if (isTestingSpeed) return;
    playButtonPop(!sfxEnabled);
    setSpeedResult(null);

    if (useMic && typeof window !== 'undefined') {
      const SR =
        (window as unknown as {
          SpeechRecognition?: new () => {
            lang: string;
            onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string; confidence?: number } } } }) => void) | null;
            onerror: (() => void) | null;
            start: () => void;
          };
          webkitSpeechRecognition?: new () => {
            lang: string;
            onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string; confidence?: number } } } }) => void) | null;
            onerror: (() => void) | null;
            start: () => void;
          };
        }).SpeechRecognition ||
        (window as unknown as {
          webkitSpeechRecognition?: new () => {
            lang: string;
            onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string; confidence?: number } } } }) => void) | null;
            onerror: (() => void) | null;
            start: () => void;
          };
        }).webkitSpeechRecognition;

      if (SR) {
        try {
          setIsTestingSpeed(true);
          const rec = new SR();
          rec.lang = 'uz-UZ';
          rec.onresult = (e) => {
            setIsTestingSpeed(false);
            const alt = e.results?.[0]?.[0];
            const res = analyzePronunciation(alt?.transcript || '', currentSpeed, {
              recognitionConfidence: alt?.confidence ?? 0.8,
              averageMicEnergy: 0.62,
              isSimulated: false,
            });
            setSpeedResult({
              accuracy: res.accuracy,
              feedbackUz: res.feedbackUz,
              passed: res.passed,
            });
            if (res.passed) {
              playSuccessChime(!sfxEnabled);
              grantReward(10, 15);
            } else {
              playRetryTone(!sfxEnabled);
            }
          };
          rec.onerror = () => {
            setIsTestingSpeed(false);
            // Graceful fallback to simulated round
            const res = analyzePronunciation(currentSpeed.word, currentSpeed, {
              averageMicEnergy: 0.6,
              isSimulated: true,
            });
            setSpeedResult({
              accuracy: res.accuracy,
              feedbackUz: res.feedbackUz,
              passed: res.passed,
            });
            if (res.passed) {
              playSuccessChime(!sfxEnabled);
              grantReward(10, 15);
            }
          };
          rec.start();
          return;
        } catch {
          setIsTestingSpeed(false);
        }
      }
    }

    setIsTestingSpeed(true);
    window.setTimeout(() => {
      setIsTestingSpeed(false);
      const res = analyzePronunciation(currentSpeed.word, currentSpeed, {
        averageMicEnergy: 0.63,
        isSimulated: true,
      });
      setSpeedResult({
        accuracy: res.accuracy,
        feedbackUz: res.feedbackUz,
        passed: res.passed,
      });
      if (res.passed) {
        playSuccessChime(!sfxEnabled);
        grantReward(10, 15);
      } else {
        playRetryTone(!sfxEnabled);
      }
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-6">
      {/* Games Hero Banner */}
      <section className="btn-3d bg-[#58CC02] border-[#46A302] border-2 border-t-[#58CC02] border-x-[#58CC02] rounded-3xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold text-white/95">
              INTERAKTIV O‘YINLAR · SO‘ZAPP
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mt-0.5 flex items-center gap-2">
              <Gamepad2 className="w-7 h-7" />
              <span>Kiki bilan O‘yinlar</span>
            </h1>
            <p className="text-sm text-white/95 font-semibold mt-1">
              O‘ynab o‘rganing! Har bir g‘alaba uchun yulduzchalar va tangalar beriladi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <KikiMascot
              mood="happy"
              size="sm"
              className="!w-16 !h-16"
            />
            <div className="bg-white/20 border-2 border-white/35 rounded-2xl px-4 py-2.5 text-xs font-bold space-y-0.5">
              <div className="text-white/95">Bu sessiya mukofoti:</div>
              <div className="font-display font-bold text-base tabular-nums flex items-center gap-2">
                <span>+{sessionStars} ⭐</span>
                <span>+{sessionCoins} 🪙</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Game Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            setActiveGame('detect');
          }}
          className={`btn-3d rounded-2xl p-4 text-left border-2 transition-all ${
            activeGame === 'detect'
              ? 'bg-[#E5F8FF] border-[#00BFFF] border-b-[5px] border-b-[#008ECC]'
              : 'bg-white border-[#E5E5E5] border-b-[5px] border-b-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900">
            <Sparkles className="w-5 h-5 text-[#00BFFF]" />
            <span>1. Tovushni top</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            To‘g‘ri tovushli so‘zni aniqlang (+5 ⭐ · +10 🪙)
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            setActiveGame('syllables');
          }}
          className={`btn-3d rounded-2xl p-4 text-left border-2 transition-all ${
            activeGame === 'syllables'
              ? 'bg-[#E5F8FF] border-[#00BFFF] border-b-[5px] border-b-[#008ECC]'
              : 'bg-white border-[#E5E5E5] border-b-[5px] border-b-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900">
            <Puzzle className="w-5 h-5 text-[#58CC02]" />
            <span>2. Bo‘g‘inlarni birlashtir</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            So‘z bo‘laklarini to‘g‘ri tering (+8 ⭐ · +15 🪙)
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            setActiveGame('speed');
          }}
          className={`btn-3d rounded-2xl p-4 text-left border-2 transition-all ${
            activeGame === 'speed'
              ? 'bg-[#E5F8FF] border-[#00BFFF] border-b-[5px] border-b-[#008ECC]'
              : 'bg-white border-[#E5E5E5] border-b-[5px] border-b-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900">
            <Zap className="w-5 h-5 text-[#FF9600]" />
            <span>3. Tezkor talaffuz</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Tez aytish raundida sinovdan o‘ting (+10 ⭐ · +15 🪙)
          </p>
        </button>
      </div>

      {/* GAME 1: Tovushni top */}
      {activeGame === 'detect' && (
        <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#008ECC] bg-[#E5F8FF] px-3 py-1 rounded-xl">
              TOVUSH IZQUVAR · {detectIdx + 1}/{DETECT_ROUNDS.length}
            </span>
            <span className="font-display font-bold text-sm text-amber-600 flex items-center gap-1">
              <Star className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
              <span>+5 ⭐</span>
              <Coins className="w-4 h-4 text-[#F59E0B] ml-1" />
              <span>+10</span>
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#00BFFF] text-white font-display font-bold text-4xl shadow-sm">
              {currentDetect.targetSound}
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              {currentDetect.hint}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentDetect.options.map((opt) => {
              const isPicked = detectPicked === opt.word;
              let cardClass =
                'bg-white border-2 border-[#E5E5E5] border-b-[5px] border-b-slate-300 text-slate-900 hover:border-[#00BFFF]';
              if (isPicked) {
                cardClass = opt.hasTarget
                  ? 'bg-[#58CC02] border-[#46A302] text-white'
                  : 'bg-[#FF4B4B] border-[#EA2B2B] text-white';
              }

              return (
                <div key={opt.word} className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDetectChoice(opt.word, opt.hasTarget)}
                    className={`btn-3d rounded-2xl py-4 px-4 font-display font-bold text-lg ${cardClass}`}
                  >
                    {opt.word}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playButtonPop(!sfxEnabled);
                      speakWord(opt.word, 'uz-UZ');
                    }}
                    className="text-xs font-bold text-[#008ECC] hover:underline flex items-center justify-center gap-1 py-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Eshitish</span>
                  </button>
                </div>
              );
            })}
          </div>

          {detectFeedback && (
            <div
              className={`rounded-2xl p-4 border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                detectFeedback === 'correct'
                  ? 'bg-emerald-50 border-[#58CC02] text-[#3B8700]'
                  : 'bg-rose-50 border-[#FF4B4B] text-[#C81E1E]'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  {detectFeedback === 'correct'
                    ? `Barakalla! «${detectPicked}» so‘zida «${currentDetect.targetSound}» tovushi bor! (+5 ⭐, +10 tanga)`
                    : `«${detectPicked}» so‘zida «${currentDetect.targetSound}» tovushi yo‘q. Yana tinglab ko‘ring!`}
                </span>
              </div>
              {detectFeedback === 'correct' && (
                <button
                  type="button"
                  onClick={handleNextDetect}
                  className="btn-3d bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap"
                >
                  Keyingi bosqich →
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* GAME 2: Bo‘g‘inlarni birlashtir */}
      {activeGame === 'syllables' && (
        <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#46A302] bg-emerald-50 px-3 py-1 rounded-xl">
              BO‘G‘INLAR USTASI · {sylIdx + 1}/{SYLLABLE_PUZZLES.length} ({currentPuzzle.soundLabel})
            </span>
            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                speakWord(currentPuzzle.word, 'uz-UZ');
              }}
              className="text-xs font-bold text-[#008ECC] bg-[#E5F8FF] px-3 py-1.5 rounded-xl flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4" />
              <span>So‘zni eshitish</span>
            </button>
          </div>

          <div className="text-center space-y-3">
            <h2 className="font-display font-bold text-xl text-slate-900">
              Bo‘g‘inlarni to‘g‘ri ketma-ketlikda bosing!
            </h2>

            {/* Assembled Word Slots */}
            <div className="flex items-center justify-center gap-2.5 min-h-[60px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-3">
              {currentPuzzle.syllables.map((_, slotIdx) => {
                const pickedIdx = chosenIndices[slotIdx];
                const text =
                  typeof pickedIdx === 'number'
                    ? currentPuzzle.scrambled[pickedIdx]
                    : '___';
                return (
                  <span
                    key={slotIdx}
                    className={`px-4 py-2 rounded-xl font-display font-bold text-lg ${
                      typeof pickedIdx === 'number'
                        ? 'bg-[#00BFFF] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    {text}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Scrambled Syllable Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentPuzzle.scrambled.map((syl, idx) => {
              const used = chosenIndices.includes(idx);
              return (
                <button
                  key={`${syl}-${idx}`}
                  type="button"
                  disabled={used}
                  onClick={() => handlePickSyllable(idx)}
                  className={`btn-3d rounded-2xl px-6 py-3.5 font-display font-bold text-lg border-2 ${
                    used
                      ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'
                      : 'bg-[#FFC800] hover:bg-[#F5BE00] text-slate-900 border-[#E5A500]'
                  }`}
                >
                  {syl}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetSyllables}
              className="btn-3d bg-white text-slate-700 border-2 border-[#E5E5E5] rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Qaytadan terish</span>
            </button>
          </div>

          {sylStatus !== 'idle' && (
            <div
              className={`rounded-2xl p-4 border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                sylStatus === 'won'
                  ? 'bg-emerald-50 border-[#58CC02] text-[#3B8700]'
                  : 'bg-rose-50 border-[#FF4B4B] text-[#C81E1E]'
              }`}
            >
              <span className="font-bold text-sm">
                {sylStatus === 'won'
                  ? `Ajoyib! «${currentPuzzle.word}» so‘zini to‘g‘ri yig‘dingiz! (+8 ⭐, +15 tanga)`
                  : 'Bo‘g‘inlar tartibi biroz boshqacha ekan. «Qaytadan terish» tugmasini bosing!'}
              </span>
              {sylStatus === 'won' && (
                <button
                  type="button"
                  onClick={handleNextSyllables}
                  className="btn-3d bg-[#58CC02] text-white border-[#46A302] rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap"
                >
                  Keyingi so‘z →
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* GAME 3: Tezkor talaffuz raundi */}
      {activeGame === 'speed' && (
        <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl">
              TEZKOR TALAFFUZ · {speedIdx + 1}/{SPEED_CHALLENGES.length}
            </span>
            <span className="text-xs font-extrabold text-[#008ECC]">
              Tovush: «{currentSpeed.targetSound}»
            </span>
          </div>

          <div className="bg-[#E5F8FF]/60 border-2 border-[#00BFFF]/35 rounded-2xl p-5 text-center space-y-2">
            <p className="text-xs font-bold text-[#008ECC]">{currentSpeed.exampleUsage}</p>
            <div className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              {currentSpeed.word}
            </div>
            <p className="text-xs font-semibold text-slate-600">💡 {currentSpeed.tipUz}</p>

            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                speakWord(currentSpeed.word, 'uz-UZ');
              }}
              className="btn-3d mt-2 inline-flex items-center gap-2 bg-white text-[#008ECC] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-xl px-4 py-2 text-xs font-bold"
            >
              <Volume2 className="w-4 h-4" />
              <span>Namuna talaffuzni tinglash</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isTestingSpeed}
              onClick={() => handleRunSpeedPronunciation(true)}
              className="btn-3d bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-2xl px-6 py-3.5 font-display font-bold text-sm sm:text-base flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              <span>{isTestingSpeed ? 'Tinglanmoqda...' : 'Mikrofon bilan aytish'}</span>
            </button>

            <button
              type="button"
              disabled={isTestingSpeed}
              onClick={() => handleRunSpeedPronunciation(false)}
              className="btn-3d bg-white text-[#008ECC] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-2xl px-5 py-3.5 font-display font-bold text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tezkor sinov (Test)</span>
            </button>
          </div>

          {speedResult && (
            <div
              className={`rounded-2xl p-4 border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                speedResult.passed
                  ? 'bg-emerald-50 border-[#58CC02] text-[#3B8700]'
                  : 'bg-rose-50 border-[#FF4B4B] text-[#C81E1E]'
              }`}
            >
              <div className="text-sm font-bold">
                Natija: <span className="tabular-nums">{speedResult.accuracy}%</span> —{' '}
                {speedResult.feedbackUz}{' '}
                {speedResult.passed && '(+10 ⭐, +15 tanga qo‘shildi!)'}
              </div>
              <button
                type="button"
                onClick={() => {
                  playButtonPop(!sfxEnabled);
                  setSpeedResult(null);
                  setSpeedIdx((prev) => (prev + 1) % SPEED_CHALLENGES.length);
                }}
                className="btn-3d bg-[#58CC02] text-white border-[#46A302] rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap"
              >
                Keyingi tez aytish →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

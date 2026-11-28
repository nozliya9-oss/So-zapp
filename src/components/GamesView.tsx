import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  KeyRound,
  Mic,
  Puzzle,
  RotateCcw,
  Shuffle,
  Sparkles,
  Square,
  Star,
  Volume2,
  Wind,
  Zap,
} from 'lucide-react';
import {
  BreathChallenge,
  GameStageConfig,
  ObstacleJumpItem,
  SoundMatchChallenge,
  SyllableWordItem,
  THIRTY_GAME_STAGES,
} from '../data/gamesPathData';
import { GameStageProgress, GameStageType, PracticeWord } from '../types';
import { KikiMascot } from './KikiMascot';
import { MicIssueHelperCard } from './MicIssueHelperCard';
import {
  BasketIllustration,
  ItemIllustration,
  KeyIllustration,
} from './game-scenes/GameItemArtwork';
import {
  HedgehogBasketScene,
  LockKeyScene,
} from './game-scenes/SoundMatchScenes';
import { ObstacleJumpScene } from './game-scenes/ObstacleJumpScene';
import { SyllableBoardScene } from './game-scenes/SyllableBoardScene';
import { BreathPowerScene } from './game-scenes/BreathPowerScenes';
import { SnakePathDecorations } from './game-scenes/SnakePathDecorations';
import { useKikiVoice } from '../context/KikiVoiceContext';
import {
  playButtonPop,
  playLessonCompleteFanfare,
  playRetryTone,
  playSuccessChime,
  prefetchKikiSpeech,
  speakWord,
  stopKikiSpeaking,
  unlockKikiAudio,
} from '../utils/soundEffects';
import {
  analyzePronunciation,
  isSpeechAttemptUnclear,
} from '../utils/speechAnalysis';

interface GamesViewProps {
  sfxEnabled: boolean;
  stageProgress: Record<number, GameStageProgress>;
  onStageComplete: (
    stage: number,
    stars: number,
    scorePct: number,
    bonusCoins: number
  ) => void;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence?: number;
      };
    };
  };
}

interface SpeechRecognitionErrorLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const SNAKE_OFFSETS = [0, -56, -78, -46, 0, 56, 78, 46];

type PathFilterMode =
  | 'all'
  | 'random'
  | 'sound_match'
  | 'syllables_words'
  | 'breath_power';

function seededShuffleStages(
  items: GameStageConfig[],
  seed: number
): GameStageConfig[] {
  const copy = [...items];
  let state = (seed * 1664525 + 1013904223) >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function computeThreeStarRating(scorePct: number): number {
  if (scorePct >= 85) return 3;
  if (scorePct >= 62) return 2;
  if (scorePct >= 35) return 1;
  return 0;
}

function getStageTypeIcon(type: GameStageType, soundVariant?: 'hedgehog_basket' | 'lock_key') {
  if (type === 'sound_match') {
    return soundVariant === 'lock_key' ? KeyRound : Volume2;
  }
  switch (type) {
    case 'obstacle_jump':
      return Zap;
    case 'syllables':
      return Puzzle;
    case 'breath_power':
      return Wind;
  }
}

function getStageColorClasses(
  type: GameStageType,
  completed: boolean,
  isNextActive: boolean
): string {
  if (completed) {
    return 'bg-[#FFC800] border-[#E5A500] text-slate-900';
  }
  if (isNextActive) {
    return 'bg-[#00BFFF] border-[#008ECC] text-white';
  }
  switch (type) {
    case 'sound_match':
      return 'bg-[#38BDF8] border-[#0284C7] text-white';
    case 'obstacle_jump':
      return 'bg-[#58CC02] border-[#46A302] text-white';
    case 'syllables':
      return 'bg-[#8B5CF6] border-[#6D28D9] text-white';
    case 'breath_power':
      return 'bg-[#FF9600] border-[#CC7800] text-white';
  }
}

const ThreeStarRow: React.FC<{ stars: number; size?: 'sm' | 'lg' }> = ({
  stars,
  size = 'sm',
}) => {
  const iconCls = size === 'lg' ? 'w-9 h-9' : 'w-4 h-4';
  return (
    <div
      className="flex items-center justify-center gap-0.5"
      aria-label={`${stars} / 3 yulduz`}
    >
      {[1, 2, 3].map((idx) => (
        <Star
          key={idx}
          className={`${iconCls} ${
            idx <= stars
              ? 'text-[#FFC800] fill-[#FFC800] drop-shadow-xs'
              : 'text-slate-300 dark:text-slate-600 fill-slate-200 dark:fill-slate-700'
          }`}
        />
      ))}
    </div>
  );
};

// ==================== MINI-GAME A: SOUND & SYLLABLE MATCHING ====================
// Scene 1: "Tipratikan va savati" (4 illustrated baskets + speaker per basket)
// Scene 2: "Qulf va kalit" (4 illustrated keys + speaker per key)
const SoundMatchArena: React.FC<{
  challenge: SoundMatchChallenge;
  sfxEnabled: boolean;
  onFinish: (scorePct: number) => void;
}> = ({ challenge, sfxEnabled, onFinish }) => {
  const { voiceStyle } = useKikiVoice();
  const [attempts, setAttempts] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [speakingOptId, setSpeakingOptId] = useState<string | null>(null);
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const correctOption =
    challenge.options.find((opt) => opt.isCorrect) || challenge.options[0];

  useEffect(() => {
    unlockKikiAudio();
    challenge.options.forEach((opt) => {
      prefetchKikiSpeech(opt.word, 'uz-UZ', voiceStyle);
    });
    speakWord(
      challenge.speakPromptUz,
      'uz-UZ',
      () => setIsPromptSpeaking(true),
      () => setIsPromptSpeaking(false),
      voiceStyle
    );
    return () => stopKikiSpeaking();
  }, [challenge, voiceStyle]);

  const handleListenOption = (id: string, word: string) => {
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    speakWord(
      word,
      'uz-UZ',
      () => setSpeakingOptId(id),
      () => setSpeakingOptId(null),
      voiceStyle
    );
  };

  const handleSelectOption = (id: string, isCorrect: boolean, word: string) => {
    if (solved) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isCorrect) {
      playSuccessChime(!sfxEnabled);
      setSolved(true);
      setFeedback(
        challenge.sceneVariant === 'lock_key'
          ? `Barakalla! «${word}» kaliti bilan qulf ochildi!`
          : `Barakalla! Tipratikan «${word}» savatini topdi!`
      );
      const score =
        nextAttempts === 1 ? 100 : nextAttempts === 2 ? 78 : nextAttempts === 3 ? 58 : 40;
      window.setTimeout(() => onFinish(score), 1400);
    } else {
      playRetryTone(!sfxEnabled);
      setWrongIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setFeedback(
        `«${word}» emas ekan! Har bir ovoz tugmasini bosib qayta tinglang.`
      );
    }
  };

  const isLockKey = challenge.sceneVariant === 'lock_key';

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Kiki Prompt Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F0FAFF] dark:bg-slate-900/70 border-2 border-[#BCEEFF] dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center gap-3.5">
          <KikiMascot
            mood={solved ? 'happy' : 'idle'}
            size="sm"
            isSpeaking={isPromptSpeaking}
            className="!w-20 !h-20 shrink-0"
          />
          <div>
            <div className="text-[11px] font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
              {isLockKey ? 'QULF VA KALIT' : 'TIPRATIKAN VA SAVATI'} · {challenge.targetLabel}
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
              {challenge.titleUz}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {challenge.storyUz}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            unlockKikiAudio();
            playButtonPop(!sfxEnabled);
            speakWord(
              challenge.speakPromptUz,
              'uz-UZ',
              () => setIsPromptSpeaking(true),
              () => setIsPromptSpeaking(false),
              voiceStyle
            );
          }}
          className="btn-3d bg-[#00BFFF] hover:bg-[#00AEEC] text-white border-[#008ECC] rounded-xl px-4 py-2.5 font-display font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Volume2 className={`w-4 h-4 ${isPromptSpeaking ? 'animate-pulse' : ''}`} />
          <span>Kikini tinglash</span>
        </button>
      </div>

      {/* Dedicated Multi-Layered Grounded Scene */}
      {isLockKey ? (
        <LockKeyScene targetLabel={challenge.targetLabel} solved={solved} />
      ) : (
        <HedgehogBasketScene
          targetLabel={challenge.targetLabel}
          correctArtKey={correctOption.artKey}
          solved={solved}
        />
      )}

      {/* 4 Illustrated Option Cards (Baskets or Keys), Each With Speaker Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {challenge.options.map((opt, idx) => {
          const isWrong = wrongIds.includes(opt.id);
          const isRightSelected = solved && opt.isCorrect;

          return (
            <div
              key={opt.id}
              className={`rounded-2xl border-2 p-4 flex flex-col gap-3 transition-colors ${
                isRightSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-[#58CC02]'
                  : isWrong
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 opacity-75'
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-[#E5E5E5] dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {isLockKey ? (
                    <KeyIllustration
                      artKey={opt.artKey}
                      toneIndex={idx}
                      isSolved={isRightSelected}
                      isWrong={isWrong}
                    />
                  ) : (
                    <BasketIllustration
                      artKey={opt.artKey}
                      isSolved={isRightSelected}
                      isWrong={isWrong}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight break-words">
                      {opt.label}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Avval ovozini tinglang
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleListenOption(opt.id, opt.word)}
                  aria-label={`${opt.word} ovozini tinglash`}
                  className="btn-3d w-11 h-11 rounded-xl bg-[#E5F8FF] dark:bg-slate-800 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] flex items-center justify-center shrink-0"
                >
                  <Volume2
                    className={`w-5 h-5 ${
                      speakingOptId === opt.id ? 'animate-pulse' : ''
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                disabled={solved || isWrong}
                onClick={() => handleSelectOption(opt.id, opt.isCorrect, opt.word)}
                className={`btn-3d w-full py-2.5 rounded-xl font-display font-bold text-sm ${
                  isRightSelected
                    ? 'bg-[#58CC02] border-[#46A302] text-white'
                    : 'bg-white dark:bg-slate-800 hover:bg-[#E5F8FF] dark:hover:bg-slate-700 text-slate-800 dark:text-white border-2 border-[#E5E5E5] dark:border-slate-600 border-b-[4px] border-b-slate-300 dark:border-b-slate-950'
                }`}
              >
                {isRightSelected
                  ? isLockKey
                    ? '✓ Qulf ochildi!'
                    : '✓ Savat topildi!'
                  : isLockKey
                    ? 'Kalitni tanlash'
                    : 'Savatni tanlash'}
              </button>
            </div>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`rounded-2xl p-3.5 text-sm font-bold flex items-center gap-2 ${
            solved
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#3B8700] dark:text-[#7CE82B] border border-[#58CC02]'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-[#FFC800]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
};

// ==================== MINI-GAME B: 5 OBSTACLES WORD JUMP ====================
const ObstacleJumpArena: React.FC<{
  obstacles: ObstacleJumpItem[];
  sfxEnabled: boolean;
  onFinish: (scorePct: number) => void;
}> = ({ obstacles, sfxEnabled, onFinish }) => {
  const { voiceStyle } = useKikiVoice();
  const [stepIdx, setStepIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micWarning, setMicWarning] = useState<string | null>(null);
  const [micIssueKey, setMicIssueKey] = useState(0);
  const [micIssueHint, setMicIssueHint] = useState<string | null>(null);
  const [heardText, setHeardText] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const triggerMicIssue = (hint?: string) => {
    setMicIssueHint(hint || null);
    setMicIssueKey((prev) => prev + 1);
  };
  const clearMicIssue = () => {
    setMicIssueKey(0);
    setMicIssueHint(null);
  };

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const energySamplesRef = useRef<number[]>([]);
  const unclearAttemptsRef = useRef<number>(0);

  const currentObs = obstacles[stepIdx];

  const cleanupHardware = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (analyserCtxRef.current) {
      analyserCtxRef.current.close().catch(() => {});
      analyserCtxRef.current = null;
    }
  };

  useEffect(() => {
    obstacles.forEach((obs) => {
      prefetchKikiSpeech(obs.word, 'uz-UZ', voiceStyle);
    });
  }, [obstacles, voiceStyle]);

  useEffect(() => {
    if (currentObs) {
      unlockKikiAudio();
      speakWord(currentObs.word, 'uz-UZ', undefined, undefined, voiceStyle);
    }
    return () => {
      cleanupHardware();
      stopKikiSpeaking();
    };
  }, [stepIdx, voiceStyle]);

  const completeObstacleStep = (
    transcript: string,
    confidence: number,
    isSimulated: boolean
  ) => {
    if (!currentObs) return;
    const avgEnergy =
      energySamplesRef.current.length > 0
        ? energySamplesRef.current.reduce((a, b) => a + b, 0) /
          energySamplesRef.current.length
        : 0.6;

    const shim: PracticeWord = {
      id: currentObs.id,
      word: currentObs.word,
      syllables: currentObs.syllables,
      targetSound: currentObs.targetSound,
      speechLang: 'uz-UZ',
      exampleUsage: currentObs.tipUz,
      tipUz: currentObs.tipUz,
    };

    const res = analyzePronunciation(transcript, shim, {
      averageMicEnergy: avgEnergy,
      recognitionConfidence: confidence,
      isSimulated,
    });

    const stepScore = Math.max(65, res.accuracy);
    const nextScores = [...scores, stepScore];
    setScores(nextScores);
    setMicWarning(null);
    unclearAttemptsRef.current = 0;
    clearMicIssue();
    setIsJumping(true);
    playSuccessChime(!sfxEnabled);
    setLastFeedback(
      `Barakalla! Kiki «${currentObs.obstacleName}»dan sakrab o‘tdi! (${stepScore}%)`
    );

    window.setTimeout(() => {
      setIsJumping(false);
      setHeardText(null);
      if (stepIdx < obstacles.length - 1) {
        setStepIdx((prev) => prev + 1);
        unclearAttemptsRef.current = 0;
        clearMicIssue();
        setLastFeedback(null);
      } else {
        const avg = Math.round(
          nextScores.reduce((a, b) => a + b, 0) / nextScores.length
        );
        onFinish(avg);
      }
    }, 840);
  };

  const handleMicSpeak = async () => {
    if (!currentObs || isJumping) return;

    if (isListening) {
      cleanupHardware();
      setIsListening(false);
      setMicWarning(
        `Tinglash to‘xtatildi. «${currentObs.word}» so‘zini aytish uchun mikrofonga qayta bosing.`
      );
      return;
    }

    playButtonPop(!sfxEnabled);
    stopKikiSpeaking();
    setMicWarning(null);
    clearMicIssue();
    setHeardText(null);
    energySamplesRef.current = [];

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      playRetryTone(!sfxEnabled);
      triggerMicIssue('Brauzer jonli so‘z aniqlashni qo‘llamaydi');
      return;
    }

    try {
      setIsListening(true);
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();
        analyserCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const sample = () => {
          if (!analyserCtxRef.current) return;
          analyser.getByteFrequencyData(data);
          const avg =
            data.reduce((a, b) => a + b, 0) / (data.length * 255 || 1);
          energySamplesRef.current.push(avg);
          rafRef.current = requestAnimationFrame(sample);
        };
        rafRef.current = requestAnimationFrame(sample);
      }

      const rec = new SpeechRecognitionCtor();
      recognitionRef.current = rec;
      rec.lang = 'uz-UZ';
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.continuous = false;

      let done = false;
      rec.onresult = (e) => {
        done = true;
        const alternatives = e.results?.[0];
        const peakEnergy =
          energySamplesRef.current.length > 0
            ? Math.max(...energySamplesRef.current)
            : 0;
        const avgEnergy =
          energySamplesRef.current.length > 0
            ? energySamplesRef.current.reduce((a, b) => a + b, 0) /
              energySamplesRef.current.length
            : 0.25;

        const shim: PracticeWord = {
          id: currentObs.id,
          word: currentObs.word,
          syllables: currentObs.syllables,
          targetSound: currentObs.targetSound,
          speechLang: 'uz-UZ',
          exampleUsage: currentObs.tipUz,
          tipUz: currentObs.tipUz,
        };

        let bestTranscript = '';
        let bestConfidence = 0.7;
        let bestAccuracy = 0;

        if (alternatives) {
          for (let i = 0; i < 5; i++) {
            const alt = alternatives[i];
            if (!alt?.transcript?.trim()) break;
            const candidate = alt.transcript.trim();
            const conf = alt.confidence ?? 0.78;
            const analyzed = analyzePronunciation(candidate, shim, {
              averageMicEnergy: Math.max(0.25, avgEnergy),
              recognitionConfidence: conf,
              isSimulated: false,
            });
            if (!bestTranscript || analyzed.accuracy > bestAccuracy) {
              bestTranscript = candidate;
              bestConfidence = conf;
              bestAccuracy = analyzed.accuracy;
            }
          }
        }

        cleanupHardware();
        setIsListening(false);

        const hasActualSpeech =
          bestTranscript.trim().length > 0 &&
          (energySamplesRef.current.length === 0 || peakEnergy >= 0.045);
        const isUnclear = isSpeechAttemptUnclear(
          bestTranscript,
          currentObs.word,
          bestAccuracy
        );

        if (hasActualSpeech && bestAccuracy >= 65 && !isUnclear) {
          unclearAttemptsRef.current = 0;
          clearMicIssue();
          setHeardText(`«${bestTranscript}» (${bestAccuracy}%)`);
          completeObstacleStep(bestTranscript, bestConfidence, false);
        } else if (!bestTranscript && peakEnergy < 0.03) {
          unclearAttemptsRef.current += 1;
          playRetryTone(!sfxEnabled);
          triggerMicIssue('Ovoz yozib olinmadi');
        } else {
          unclearAttemptsRef.current += 1;
          playRetryTone(!sfxEnabled);
          setHeardText(
            bestTranscript
              ? `«${bestTranscript}» (${bestAccuracy}%)`
              : 'So‘z aniq ajratilmadi'
          );
          setMicWarning(
            bestTranscript
              ? `Eshitilgan so‘z: «${bestTranscript}» (${bestAccuracy}%) — «${currentObs.word}» so‘ziga mos kelmadi. Shovqinsiz joyda aniqroq ayting!`
              : `Ovoz aniq tanilmadi. Mikrofonga yaqinroq bo‘lib «${currentObs.word}» so‘zini aniq ayting!`
          );
          if (bestAccuracy < 45 || unclearAttemptsRef.current >= 2) {
            triggerMicIssue('Ketma-ket noaniq talaffuz yoki begona so‘z eshitildi');
          }
        }
      };

      rec.onerror = (event) => {
        done = true;
        cleanupHardware();
        setIsListening(false);
        playRetryTone(!sfxEnabled);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          triggerMicIssue('Mikrofonga ruxsat berilmagan');
        } else if (event.error === 'audio-capture' || event.error === 'not-found') {
          triggerMicIssue('Mikrofon topilmadi');
        } else {
          triggerMicIssue('Ovoz yozib olinmadi');
        }
      };

      rec.onend = () => {
        if (!done) {
          cleanupHardware();
          setIsListening(false);
          playRetryTone(!sfxEnabled);
          triggerMicIssue('Ovoz yozib olinmadi');
        }
      };
      rec.start();
    } catch {
      cleanupHardware();
      setIsListening(false);
      playRetryTone(!sfxEnabled);
      triggerMicIssue('Mikrofon ulanmadi yoki ruxsat berilmagan');
    }
  };

  if (!currentObs) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
        <span className="font-display font-bold text-[#3B8700] dark:text-[#7CE82B] tabular-nums">
          To‘siq {stepIdx + 1} / {obstacles.length} · {currentObs.obstacleName}
        </span>
        <span>So‘zni aniq aytsangiz, Kiki sakraydi</span>
      </div>

      {/* Multi-Layered Custom 5-Obstacle Park Runner Track */}
      <ObstacleJumpScene
        obstacles={obstacles}
        stepIdx={stepIdx}
        isJumping={isJumping}
        isListening={isListening}
      />

      {/* Custom-Illustrated Target Word Card (No plain emoji stickers) */}
      <div className="bg-[#F8FDFF] dark:bg-slate-900/70 border-2 border-[#D4F3FF] dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#BCEEFF] dark:border-slate-700 flex items-center justify-center p-2 shrink-0">
          <ItemIllustration artKey={currentObs.artKey} className="w-20 h-20" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            {currentObs.word}
          </h3>
          <div className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] tracking-widest">
            {currentObs.syllables} · «{currentObs.targetSound}» tovushi
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Maslahat: {currentObs.tipUz}
          </p>
        </div>
      </div>

      {heardText && !lastFeedback && (
        <div className="rounded-2xl bg-[#F0FAFF] dark:bg-slate-900 border border-[#00BFFF]/50 px-3.5 py-2 text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] text-center">
          Eshitilgan so‘z: {heardText}
        </div>
      )}

      {lastFeedback && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-[#58CC02] p-3 text-sm font-bold text-[#3B8700] dark:text-[#7CE82B] text-center">
          {lastFeedback}
        </div>
      )}

      {micWarning && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-[#FFC800] p-3 text-xs font-bold text-amber-900 dark:text-amber-200 text-center">
          {micWarning}
        </div>
      )}

      {micIssueKey > 0 && (
        <MicIssueHelperCard
          issueKey={micIssueKey}
          sfxEnabled={sfxEnabled}
          onRetry={handleMicSpeak}
          onFallbackAction={() => completeObstacleStep(currentObs.word, 0.85, true)}
          fallbackLabel="Sakratish (Test)"
          detailHint={micIssueHint}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => {
            unlockKikiAudio();
            playButtonPop(!sfxEnabled);
            speakWord(currentObs.word, 'uz-UZ', undefined, undefined, voiceStyle);
          }}
          className="btn-3d bg-[#E5F8FF] dark:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC] rounded-2xl py-3 px-4 font-display font-bold text-sm flex items-center justify-center gap-1.5"
        >
          <Volume2 className="w-4 h-4" />
          <span>Eshitish</span>
        </button>

        <button
          type="button"
          disabled={isJumping}
          onClick={handleMicSpeak}
          className={`btn-3d flex-1 rounded-2xl py-3.5 px-5 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${
            isListening
              ? 'bg-[#FF4B4B] border-[#C81E1E] text-white'
              : 'bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white'
          }`}
        >
          {isListening ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Tinglayapman... (To‘xtatish)</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Gapirib Kikini sakrat!</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isJumping || isListening}
          onClick={() => completeObstacleStep(currentObs.word, 0.88, true)}
          className="btn-3d bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border-2 border-[#E5E5E5] dark:border-slate-600 border-b-[5px] border-b-slate-300 dark:border-b-slate-900 rounded-2xl py-3 px-4 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-[#00BFFF]" />
          <span>Sakratish (Test)</span>
        </button>
      </div>
    </div>
  );
};

// ==================== MINI-GAME C: SYLLABLES (5 words) ====================
const SyllablesFiveArena: React.FC<{
  words: SyllableWordItem[];
  sfxEnabled: boolean;
  onFinish: (scorePct: number) => void;
}> = ({ words, sfxEnabled, onFinish }) => {
  const { voiceStyle } = useKikiVoice();
  const [wordIdx, setWordIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solvedWord, setSolvedWord] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const puzzle = words[wordIdx];

  useEffect(() => {
    words.forEach((w) => {
      prefetchKikiSpeech(w.word, 'uz-UZ', voiceStyle);
    });
  }, [words, voiceStyle]);

  useEffect(() => {
    if (puzzle) {
      unlockKikiAudio();
      speakWord(
        puzzle.word,
        'uz-UZ',
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        voiceStyle
      );
    }
    return () => stopKikiSpeaking();
  }, [wordIdx, voiceStyle]);

  if (!puzzle) return null;

  const handlePick = (syl: string) => {
    if (solvedWord || picked.includes(syl)) return;
    playButtonPop(!sfxEnabled);
    const nextPicked = [...picked, syl];
    setPicked(nextPicked);

    if (nextPicked.length === puzzle.syllables.length) {
      const formed = nextPicked.join('');
      if (formed.toLowerCase() === puzzle.word.toLowerCase()) {
        playSuccessChime(!sfxEnabled);
        setSolvedWord(true);
        setFeedback(`Ajoyib! «${puzzle.word}» to‘g‘ri tuzildi!`);
        window.setTimeout(() => {
          if (wordIdx < words.length - 1) {
            setWordIdx((prev) => prev + 1);
            setPicked([]);
            setSolvedWord(false);
            setFeedback(null);
          } else {
            const score = Math.max(40, 100 - mistakes * 12);
            onFinish(score);
          }
        }, 900);
      } else {
        playRetryTone(!sfxEnabled);
        setMistakes((prev) => prev + 1);
        setFeedback('Bo‘g‘inlar tartibi boshqacha edi, yana urinib ko‘ring!');
        window.setTimeout(() => {
          setPicked([]);
        }, 680);
      }
    }
  };

  const handleRemoveSlot = (slotIndex: number) => {
    if (solvedWord) return;
    playButtonPop(!sfxEnabled);
    setPicked((prev) => prev.filter((_, idx) => idx !== slotIndex));
    setFeedback(null);
  };

  return (
    <div className="space-y-4">
      <SyllableBoardScene
        puzzle={puzzle}
        wordIndex={wordIdx}
        totalWords={words.length}
        picked={picked}
        solvedWord={solvedWord}
        isSpeaking={isSpeaking}
        onSpeakWord={() => {
          unlockKikiAudio();
          playButtonPop(!sfxEnabled);
          speakWord(
            puzzle.word,
            'uz-UZ',
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
            voiceStyle
          );
        }}
        onPickSyllable={handlePick}
        onRemoveSlot={handleRemoveSlot}
        onClearAll={() => {
          playButtonPop(!sfxEnabled);
          setPicked([]);
          setFeedback(null);
        }}
      />

      {feedback && (
        <div
          className={`rounded-2xl p-3.5 text-sm font-bold text-center ${
            solvedWord
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#3B8700] dark:text-[#7CE82B] border border-[#58CC02]'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-[#FFC800]'
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

// ==================== MINI-GAME D: BREATH & SOUND POWER SCENES ====================
const BreathPowerArena: React.FC<{
  challenge: BreathChallenge;
  sfxEnabled: boolean;
  onFinish: (scorePct: number) => void;
}> = ({ challenge, sfxEnabled, onFinish }) => {
  const { voiceStyle } = useKikiVoice();
  const [power, setPower] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [micPhase, setMicPhase] = useState<
    'idle' | 'calibrating' | 'listening' | 'blowing'
  >('idle');
  const [isHoldingSim, setIsHoldingSim] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [micIssueKey, setMicIssueKey] = useState(0);
  const [micIssueHint, setMicIssueHint] = useState<string | null>(null);

  const triggerMicIssue = (hint?: string) => {
    setMicIssueHint(hint || null);
    setMicIssueKey((prev) => prev + 1);
  };
  const clearMicIssue = () => {
    setMicIssueKey(0);
    setMicIssueHint(null);
  };

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const simIntervalRef = useRef<number | null>(null);
  const launchedRef = useRef(false);
  const sustainedFramesRef = useRef(0);
  const maxRmsObservedRef = useRef(0);
  const maxPowerObservedRef = useRef(0);
  const micListenStartRef = useRef(0);
  const failedAttemptsRef = useRef(0);

  const stopAllInputs = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    sustainedFramesRef.current = 0;
    setIsMicActive(false);
    setMicPhase('idle');
    setIsHoldingSim(false);
  };

  useEffect(() => {
    unlockKikiAudio();
    speakWord(challenge.speakPromptUz, 'uz-UZ', undefined, undefined, voiceStyle);
    return () => {
      stopAllInputs();
      stopKikiSpeaking();
    };
  }, [challenge, voiceStyle]);

  const triggerLaunch = () => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    stopAllInputs();
    setLaunched(true);
    playSuccessChime(!sfxEnabled);
    window.setTimeout(() => {
      onFinish(100);
    }, 1550);
  };

  const handleToggleMic = async () => {
    if (launched) return;
    if (isMicActive) {
      const elapsedMs = performance.now() - micListenStartRef.current;
      const hadZeroSignal =
        elapsedMs > 1200 && maxRmsObservedRef.current < 0.003 && power === 0;
      const hadInsufficientProgress =
        elapsedMs > 1200 && maxPowerObservedRef.current < 15;
      stopAllInputs();
      if (hadInsufficientProgress) {
        failedAttemptsRef.current += 1;
      }
      if (hadZeroSignal || failedAttemptsRef.current >= 2) {
        playRetryTone(!sfxEnabled);
        triggerMicIssue('Mikrofondan yetarli tovush qabul qilinmadi');
      }
      return;
    }

    playButtonPop(!sfxEnabled);
    stopKikiSpeaking();
    clearMicIssue();
    maxRmsObservedRef.current = 0;
    maxPowerObservedRef.current = power;
    micListenStartRef.current = performance.now();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('NO_MEDIA');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack || audioTrack.readyState === 'ended') {
        throw new Error('NO_ACTIVE_TRACK');
      }
      audioTrack.onended = () => {
        if (!launchedRef.current && audioCtxRef.current) {
          stopAllInputs();
          playRetryTone(!sfxEnabled);
          triggerMicIssue('Mikrofon aloqasi uzilib qoldi');
        }
      };

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      const bins = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.fftSize);
      const calibrationStart = performance.now();
      const freqFloorSamples: number[] = [];
      const rmsFloorSamples: number[] = [];
      let calibratedFreqFloor = 0.05;
      let calibratedRmsFloor = 0.02;
      let calibrationDone = false;

      sustainedFramesRef.current = 0;
      setIsMicActive(true);
      setMicPhase('calibrating');

      const loop = () => {
        if (!audioCtxRef.current || launchedRef.current) return;
        analyser.getByteFrequencyData(bins);
        analyser.getByteTimeDomainData(timeData);

        const freqAvg =
          bins.reduce((a, b) => a + b, 0) / (bins.length * 255 || 1);
        let sqSum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          sqSum += norm * norm;
        }
        const rms = Math.sqrt(sqSum / (timeData.length || 1));
        if (rms > maxRmsObservedRef.current) {
          maxRmsObservedRef.current = rms;
        }

        if (!calibrationDone) {
          freqFloorSamples.push(freqAvg);
          rmsFloorSamples.push(rms);
          if (performance.now() - calibrationStart >= 450) {
            const avgFreqFloor =
              freqFloorSamples.reduce((a, b) => a + b, 0) /
              (freqFloorSamples.length || 1);
            const avgRmsFloor =
              rmsFloorSamples.reduce((a, b) => a + b, 0) /
              (rmsFloorSamples.length || 1);
            calibratedFreqFloor = Math.min(0.14, Math.max(0.03, avgFreqFloor));
            calibratedRmsFloor = Math.min(0.08, Math.max(0.015, avgRmsFloor));
            calibrationDone = true;
            setMicPhase('listening');
          }
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const freqGate = Math.max(0.14, calibratedFreqFloor * 2.25);
        const rmsGate = Math.max(0.055, calibratedRmsFloor * 2.2);
        const isGenuineBlowOrVoice = freqAvg > freqGate && rms > rmsGate;

        if (isGenuineBlowOrVoice) {
          sustainedFramesRef.current += 1;
          if (sustainedFramesRef.current >= 6) {
            failedAttemptsRef.current = 0;
            setMicPhase('blowing');
            const excess = Math.max(0, freqAvg - freqGate);
            const gainStep = Math.min(4.2, excess * 14 + 0.95);
            setPower((prev) => {
              const next = Math.min(100, prev + gainStep);
              if (next > maxPowerObservedRef.current) {
                maxPowerObservedRef.current = next;
              }
              if (next >= 100) {
                window.setTimeout(triggerLaunch, 0);
              }
              return next;
            });
          }
        } else {
          sustainedFramesRef.current = 0;
          setMicPhase('listening');
          setPower((prev) => (prev > 0 ? Math.max(0, prev - 0.35) : 0));

          if (
            performance.now() - micListenStartRef.current > 7000 &&
            maxPowerObservedRef.current < 5 &&
            maxRmsObservedRef.current < 0.01
          ) {
            stopAllInputs();
            playRetryTone(!sfxEnabled);
            triggerMicIssue('Mikrofondan tovush qabul qilinmadi');
            return;
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      stopAllInputs();
      playRetryTone(!sfxEnabled);
      triggerMicIssue('Mikrofon topilmadi yoki ruxsat berilmagan');
    }
  };

  const startHoldSim = () => {
    if (launched || isHoldingSim) return;
    playButtonPop(!sfxEnabled);
    setIsHoldingSim(true);
    simIntervalRef.current = window.setInterval(() => {
      setPower((prev) => {
        const next = Math.min(100, prev + 6);
        if (next >= 100) {
          window.setTimeout(triggerLaunch, 0);
        }
        return next;
      });
    }, 60);
  };

  const stopHoldSim = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsHoldingSim(false);
  };

  const roundedPower = Math.round(power);

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F0FAFF] dark:bg-slate-900/70 border-2 border-[#BCEEFF] dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <KikiMascot
            mood={launched ? 'happy' : isMicActive ? 'listening' : 'idle'}
            size="sm"
            className="!w-20 !h-20 shrink-0"
          />
          <div>
            <div className="text-[11px] font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
              NAFAS VA TOVUSH · «{challenge.soundCue}»
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
              {challenge.titleUz}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {challenge.instructionUz}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            unlockKikiAudio();
            playButtonPop(!sfxEnabled);
            speakWord(
              challenge.speakPromptUz,
              'uz-UZ',
              undefined,
              undefined,
              voiceStyle
            );
          }}
          className="btn-3d bg-white dark:bg-slate-800 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Volume2 className="w-4 h-4" />
          <span>Eshitish</span>
        </button>
      </div>

      {/* Dedicated Multi-Layered Custom Animated Scene */}
      <div
        className={`relative aspect-[16/9] sm:aspect-auto sm:h-64 rounded-3xl border-2 border-[#BCEEFF] dark:border-slate-700 overflow-hidden ${
          challenge.kind === 'rocket'
            ? 'bg-gradient-to-b from-[#090D24] via-[#172554] to-[#1E3A8A]'
            : 'bg-gradient-to-b from-[#38BDF8] via-[#E0F7FF] to-[#22C55E]'
        }`}
      >
        <BreathPowerScene
          kind={challenge.kind}
          power={power}
          launched={launched}
        />

        {isMicActive && !launched && (
          <div
            className={`pointer-events-none absolute top-3 left-3 px-3 py-1 rounded-xl text-[11px] font-extrabold border shadow-xs ${
              micPhase === 'calibrating'
                ? 'bg-amber-50/95 border-[#FFC800] text-amber-800'
                : micPhase === 'blowing'
                  ? 'bg-emerald-50/95 border-[#58CC02] text-[#3B8700]'
                  : 'bg-white/95 border-[#00BFFF]/60 text-[#008ECC]'
            }`}
          >
            {micPhase === 'calibrating'
              ? 'Fon shovqini o‘lchanmoqda... Jim turing'
              : micPhase === 'blowing'
                ? `Puflash qabul qilinmoqda! (${roundedPower}%)`
                : `Tayyor! Mikrofonga yaqinroq qattiq «${challenge.soundCue}» deng`}
          </div>
        )}

        {launched && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#58CC02] text-white font-display font-bold text-sm px-4 py-1.5 rounded-2xl shadow-md whitespace-nowrap">
            {challenge.successUz}
          </div>
        )}
      </div>

      {/* Breath Power Progress Gauge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-300">
          <span>Nafas / tovush quvvati</span>
          <span className="tabular-nums text-[#008ECC] dark:text-[#38BDF8]">
            {roundedPower}%
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-[#E5E5E5] dark:border-slate-600">
          <div
            className="h-full bg-gradient-to-r from-[#00BFFF] to-[#58CC02] rounded-full transition-all duration-100"
            style={{ width: `${roundedPower}%` }}
          />
        </div>
      </div>

      {micIssueKey > 0 && (
        <MicIssueHelperCard
          issueKey={micIssueKey}
          sfxEnabled={sfxEnabled}
          onRetry={handleToggleMic}
          onFallbackAction={startHoldSim}
          fallbackLabel="Bosib puflash (Sinov)"
          detailHint={micIssueHint}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={launched}
          onClick={handleToggleMic}
          className={`btn-3d flex-1 rounded-2xl py-3.5 px-5 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${
            isMicActive
              ? 'bg-[#FF4B4B] border-[#C81E1E] text-white'
              : 'bg-[#00BFFF] hover:bg-[#00AEEC] border-[#008ECC] text-white'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>
            {isMicActive
              ? 'Mikrofon yoqilgan — puflang!'
              : `Mikrofonga «${challenge.soundCue}» deng`}
          </span>
        </button>

        <button
          type="button"
          disabled={launched}
          onMouseDown={startHoldSim}
          onMouseUp={stopHoldSim}
          onMouseLeave={stopHoldSim}
          onTouchStart={startHoldSim}
          onTouchEnd={stopHoldSim}
          onClick={() => {
            if (!launched && power < 100) {
              playButtonPop(!sfxEnabled);
              setPower((prev) => {
                const next = Math.min(100, prev + 34);
                if (next >= 100) window.setTimeout(triggerLaunch, 0);
                return next;
              });
            }
          }}
          className="btn-3d bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-2xl py-3.5 px-5 font-display font-bold text-sm flex items-center justify-center gap-1.5"
        >
          <Wind className="w-4 h-4" />
          <span>Bosib puflash (Sinov)</span>
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN 30-LEVEL SNAKE PATH GAMES VIEW ====================
export const GamesView: React.FC<GamesViewProps> = ({
  sfxEnabled,
  stageProgress,
  onStageComplete,
}) => {
  const [selectedStageNum, setSelectedStageNum] = useState<number | null>(null);
  const [pathFilter, setPathFilter] = useState<PathFilterMode>('all');
  const [shuffleSeed, setShuffleSeed] = useState<number>(1);
  const [completionSummary, setCompletionSummary] = useState<{
    stage: number;
    stars: number;
    scorePct: number;
  } | null>(null);

  const selectedStage: GameStageConfig | null = selectedStageNum
    ? THIRTY_GAME_STAGES.find((s) => s.stage === selectedStageNum) || null
    : null;

  const visibleStages = useMemo(() => {
    switch (pathFilter) {
      case 'random':
        return seededShuffleStages(THIRTY_GAME_STAGES, shuffleSeed);
      case 'sound_match':
        return THIRTY_GAME_STAGES.filter((s) => s.type === 'sound_match');
      case 'syllables_words':
        return THIRTY_GAME_STAGES.filter(
          (s) => s.type === 'syllables' || s.type === 'obstacle_jump'
        );
      case 'breath_power':
        return THIRTY_GAME_STAGES.filter((s) => s.type === 'breath_power');
      case 'all':
      default:
        return THIRTY_GAME_STAGES;
    }
  }, [pathFilter, shuffleSeed]);

  const totalEarnedStars = Object.values(stageProgress).reduce(
    (sum, item) => sum + (item.stars || 0),
    0
  );
  const completedStagesCount = Object.values(stageProgress).filter(
    (item) => item.completed
  ).length;

  const nextActiveStageNum =
    visibleStages.find((s) => !stageProgress[s.stage]?.completed)?.stage ||
    visibleStages[0]?.stage ||
    1;

  const handleStageFinished = (stageNum: number, scorePct: number) => {
    const earnedStars = computeThreeStarRating(scorePct);
    const bonusCoins = earnedStars === 3 ? 15 : earnedStars === 2 ? 10 : 5;
    playLessonCompleteFanfare(!sfxEnabled);
    onStageComplete(stageNum, earnedStars, scorePct, bonusCoins);
    setCompletionSummary({
      stage: stageNum,
      stars: earnedStars,
      scorePct,
    });
  };

  // ==================== STAGE ARENA VIEW ====================
  if (selectedStage) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-12 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              stopKikiSpeaking();
              setCompletionSummary(null);
              setSelectedStageNum(null);
            }}
            className="btn-3d bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[4px] border-b-slate-300 dark:border-b-slate-900 rounded-xl px-4 py-2 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>30 bosqichli xaritaga qaytish</span>
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            <span className="font-display text-[#008ECC] dark:text-[#38BDF8] tabular-nums">
              {selectedStage.stage} / 30 bosqich
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>{selectedStage.typeLabelUz}</span>
          </div>
        </div>

        {completionSummary ? (
          <section className="bg-white dark:bg-slate-800 border-2 border-[#00BFFF] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-md">
            <KikiMascot mood="happy" size="md" className="mx-auto" />
            <div className="flex justify-center">
              <ThreeStarRow stars={completionSummary.stars} size="lg" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
                {completionSummary.stage}-BOSQICH YAKUNLANDI
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
                {completionSummary.stars === 3
                  ? 'A’lo natija! 3 ta yulduz!'
                  : completionSummary.stars === 2
                    ? 'Yaxshi harakat! 2 ta yulduz!'
                    : completionSummary.stars === 1
                      ? 'Barakalla! 1 ta yulduz!'
                      : 'Yana bir marta urinib ko‘ring!'}
              </h2>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
                Aniqlik: {completionSummary.scorePct}% · +{completionSummary.stars} ta yulduzcha
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  unlockKikiAudio();
                  playButtonPop(!sfxEnabled);
                  setCompletionSummary(null);
                }}
                className="btn-3d bg-white dark:bg-slate-700 text-slate-700 dark:text-white border-2 border-[#E5E5E5] dark:border-slate-600 border-b-[5px] border-b-slate-300 dark:border-b-slate-900 rounded-2xl py-3 px-5 font-display font-bold text-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta o‘ynash</span>
              </button>

              {completionSummary.stage < 30 && (
                <button
                  type="button"
                  onClick={() => {
                    unlockKikiAudio();
                    playButtonPop(!sfxEnabled);
                    const next = completionSummary.stage + 1;
                    setCompletionSummary(null);
                    setSelectedStageNum(next);
                  }}
                  className="btn-3d bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-2xl py-3 px-6 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-1.5"
                >
                  <span>Keyingi bosqich ({completionSummary.stage + 1})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playButtonPop(!sfxEnabled);
                  setCompletionSummary(null);
                  setSelectedStageNum(null);
                }}
                className="btn-3d bg-[#00BFFF] hover:bg-[#00AEEC] border-[#008ECC] text-white rounded-2xl py-3 px-5 font-display font-bold text-sm"
              >
                Xaritaga qaytish
              </button>
            </div>
          </section>
        ) : (
          <>
            {selectedStage.type === 'sound_match' && selectedStage.soundMatch && (
              <SoundMatchArena
                key={`sm-${selectedStage.stage}`}
                challenge={selectedStage.soundMatch}
                sfxEnabled={sfxEnabled}
                onFinish={(pct) => handleStageFinished(selectedStage.stage, pct)}
              />
            )}

            {selectedStage.type === 'obstacle_jump' && selectedStage.obstacles && (
              <ObstacleJumpArena
                key={`oj-${selectedStage.stage}`}
                obstacles={selectedStage.obstacles}
                sfxEnabled={sfxEnabled}
                onFinish={(pct) => handleStageFinished(selectedStage.stage, pct)}
              />
            )}

            {selectedStage.type === 'syllables' && selectedStage.syllableWords && (
              <SyllablesFiveArena
                key={`sy-${selectedStage.stage}`}
                words={selectedStage.syllableWords}
                sfxEnabled={sfxEnabled}
                onFinish={(pct) => handleStageFinished(selectedStage.stage, pct)}
              />
            )}

            {selectedStage.type === 'breath_power' && selectedStage.breathChallenge && (
              <BreathPowerArena
                key={`bp-${selectedStage.stage}`}
                challenge={selectedStage.breathChallenge}
                sfxEnabled={sfxEnabled}
                onFinish={(pct) => handleStageFinished(selectedStage.stage, pct)}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // ==================== 30-STAGE WINDING SNAKE ("ILON IZI") PATH MAP ====================
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-6">
      {/* Header Banner */}
      <section className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <KikiMascot mood="happy" size="sm" className="!w-20 !h-20 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-white/95 mb-0.5">
                <Gamepad2 className="w-4 h-4" />
                <span>30 bosqichli ilon izi yo‘li</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                Kiki o‘yinlar xaritasi
              </h1>
              <p className="text-xs sm:text-sm text-white/95 font-semibold mt-0.5">
                4 xil o‘yin turi 30 bosqich bo‘ylab aralashtirilgan. Har bosqichda 3 tagacha yulduz to‘plang!
              </p>
            </div>
          </div>

          <div className="bg-white/20 border-2 border-white/35 rounded-2xl px-4 py-2.5 text-center shrink-0">
            <div className="text-[11px] font-bold text-white/95 tabular-nums">
              Bosqich: {completedStagesCount}/30
            </div>
            <div className="font-display font-bold text-lg tabular-nums flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
              <span>{totalEarnedStars} / 90</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Filter Pills */}
      <div
        role="group"
        aria-label="O‘yin bosqichlarini saralash"
        className="flex flex-wrap items-center gap-2"
      >
        {[
          {
            id: 'all' as PathFilterMode,
            icon: Gamepad2,
            label: 'Hammasi (30)',
            activeCls: 'bg-[#00BFFF] text-white border-[#008ECC]',
            idleCls: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[4px] border-b-slate-300 dark:border-b-slate-950 hover:bg-[#E5F8FF]/70',
          },
          {
            id: 'random' as PathFilterMode,
            icon: Shuffle,
            label: 'Tasodifiy tartib',
            activeCls: 'bg-[#00BFFF] text-white border-[#008ECC]',
            idleCls: 'bg-white dark:bg-slate-800 text-[#0284C7] dark:text-[#38BDF8] border-2 border-[#00BFFF]/45 border-b-[4px] border-b-[#008ECC]/60 hover:bg-[#E5F8FF]',
          },
          {
            id: 'sound_match' as PathFilterMode,
            icon: Volume2,
            label: 'Faqat tovushlar',
            activeCls: 'bg-[#38BDF8] text-white border-[#0284C7]',
            idleCls: 'bg-[#E5F8FF] dark:bg-sky-950/50 text-[#0284C7] dark:text-[#38BDF8] border-2 border-[#00BFFF]/45 border-b-[4px] border-b-[#0284C7]/60 hover:bg-[#D4F3FF]',
          },
          {
            id: 'syllables_words' as PathFilterMode,
            icon: Puzzle,
            label: 'Bo‘g‘inlar va so‘zlar',
            activeCls: 'bg-[#8B5CF6] text-white border-[#6D28D9]',
            idleCls: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-2 border-violet-300/70 border-b-[4px] border-b-violet-400 hover:bg-violet-100',
          },
          {
            id: 'breath_power' as PathFilterMode,
            icon: Wind,
            label: 'Nafas va tovushlar',
            activeCls: 'bg-[#FF9600] text-white border-[#CC7800]',
            idleCls: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-2 border-[#FFC800]/65 border-b-[4px] border-b-amber-500 hover:bg-amber-100',
          },
        ].map((pill) => {
          const Icon = pill.icon;
          const isSelected = pathFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                playButtonPop(!sfxEnabled);
                if (pill.id === 'random') {
                  setShuffleSeed((prev) => prev + 1);
                }
                setPathFilter(pill.id);
              }}
              className={`btn-3d rounded-2xl px-3.5 py-2 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 leading-tight cursor-pointer ${
                isSelected ? pill.activeCls : pill.idleCls
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Winding Snake ("Ilon izi") Path */}
      <section
        aria-label="30 bosqichli ilon izi o‘yinlar yo‘li"
        className="relative bg-gradient-to-b from-[#F0FAFF] via-[#F7FEF9] to-[#F0FAFF] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-2 border-[#BCEEFF] dark:border-slate-800 rounded-3xl py-8 px-4 overflow-hidden"
      >
        <SnakePathDecorations compact={visibleStages.length <= 12} />
        <div className="relative z-10 flex flex-col items-center">
          {visibleStages.map((stageCfg, idx) => {
            const offset = SNAKE_OFFSETS[idx % SNAKE_OFFSETS.length];
            const nextOffset =
              idx < visibleStages.length - 1
                ? SNAKE_OFFSETS[(idx + 1) % SNAKE_OFFSETS.length]
                : offset;
            const progress = stageProgress[stageCfg.stage];
            const earnedStars = progress?.stars || 0;
            const isCompleted = Boolean(progress?.completed);
            const isNextActive = stageCfg.stage === nextActiveStageNum;
            const Icon = getStageTypeIcon(
              stageCfg.type,
              stageCfg.soundMatch?.sceneVariant
            );
            const nodeCls = getStageColorClasses(
              stageCfg.type,
              isCompleted,
              isNextActive
            );

            const openStage = () => {
              unlockKikiAudio();
              playButtonPop(!sfxEnabled);
              setCompletionSummary(null);
              setSelectedStageNum(stageCfg.stage);
            };

            return (
              <div
                key={stageCfg.stage}
                className={`relative flex flex-col items-center w-full mb-9 last:mb-2 ${
                  isNextActive ? 'z-20' : 'z-10'
                }`}
              >
                {/* Curved Snake Road Connector */}
                {idx < visibleStages.length - 1 && (
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 w-[270px] h-[116px] z-0"
                    viewBox="-135 0 270 116"
                    fill="none"
                  >
                    <path
                      d={`M ${offset} 14 C ${offset} 64, ${nextOffset} 52, ${nextOffset} 106`}
                      stroke={isCompleted ? '#FDE68A' : '#E2E8F0'}
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${offset} 14 C ${offset} 64, ${nextOffset} 52, ${nextOffset} 106`}
                      stroke={isCompleted ? '#F59E0B' : '#94A3B8'}
                      strokeWidth="4"
                      strokeDasharray="9 9"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                <div
                  style={{ transform: `translateX(${offset}px)` }}
                  className={`relative flex flex-col items-center ${
                    isNextActive ? 'z-20' : 'z-10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={openStage}
                    aria-label={`${stageCfg.stage}-bosqich: ${stageCfg.titleUz}`}
                    className="node-3d-btn relative z-10 flex flex-col items-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00BFFF]/50 rounded-3xl p-1"
                  >
                    {isNextActive && (
                      <span className="animate-tooltip-bounce mb-1.5 inline-block bg-white dark:bg-slate-800 border-2 border-[#00BFFF] text-[#008ECC] dark:text-[#38BDF8] font-display font-bold text-[11px] tracking-wider px-3 py-0.5 rounded-xl shadow-xs whitespace-nowrap">
                        BOSHLASH
                      </span>
                    )}

                    {/* 0–3 Earned Stars Displayed Directly Above Each Stage */}
                    <span className="mb-1.5 bg-white/95 dark:bg-slate-800/95 border border-[#E5E5E5] dark:border-slate-700 rounded-full px-2.5 py-0.5 shadow-2xs">
                      <ThreeStarRow stars={earnedStars} size="sm" />
                    </span>

                    {/* Stage Node Circle */}
                    <span className="relative flex items-center justify-center">
                      {isNextActive && (
                        <span
                          aria-hidden="true"
                          className="z-0 absolute -inset-2 rounded-full border-4 border-[#00BFFF]/40"
                        />
                      )}
                      <span
                        className={`relative z-10 node-3d-face w-[78px] h-[78px] rounded-full flex flex-col items-center justify-center border-2 border-t-transparent border-x-transparent ${nodeCls}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-display font-bold text-base leading-none mt-1 tabular-nums">
                          {stageCfg.stage}
                        </span>
                      </span>
                    </span>

                    {/* Full Unclipped Label Under Stage */}
                    <span className="mt-1.5 block text-center max-w-[232px] bg-white/95 dark:bg-slate-800/95 hover:bg-[#E5F8FF] dark:hover:bg-slate-800 border border-[#E5E5E5] dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-2xs transition-colors">
                      <span className="block font-display font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {stageCfg.stage}. {stageCfg.titleUz}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {stageCfg.typeLabelUz}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

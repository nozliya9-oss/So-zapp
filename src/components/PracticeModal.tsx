import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Globe,
  Mic,
  RotateCcw,
  Sparkles,
  Square,
  Star,
  Volume2,
  X,
} from 'lucide-react';
import { LessonNode, SoundKey, SpeechAnalysisResult } from '../types';
import { KikiMascot, KikiMood } from './KikiMascot';
import {
  playButtonPop,
  playLessonCompleteFanfare,
  playRetryTone,
  playSuccessChime,
  speakWord,
} from '../utils/soundEffects';
import { analyzePronunciation } from '../utils/speechAnalysis';

interface PracticeModalProps {
  node: LessonNode;
  sfxEnabled: boolean;
  onClose: () => void;
  onWordSuccess: (stars: number) => void;
  onLessonComplete: (payload: {
    node: LessonNode;
    avgAccuracy: number;
    avgPitchHz: number;
    totalStarsEarned: number;
    perSoundScores: Partial<Record<SoundKey, number>>;
  }) => void;
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

const FREQ_BAR_COUNT = 28;

function highlightTargetSound(text: string, targetSound: string): React.ReactNode {
  const primary = targetSound.split('/')[0].trim();
  if (!primary) return text;
  const escaped = primary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    part.toLowerCase() === primary.toLowerCase() ? (
      <span
        key={idx}
        className="text-[#00BFFF] underline decoration-[#00BFFF]/50 decoration-4 underline-offset-4"
      >
        {part}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  node,
  sfxEnabled,
  onClose,
  onWordSuccess,
  onLessonComplete,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isMicTesterActive, setIsMicTesterActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [liveVolumePct, setLiveVolumePct] = useState(0);
  const [livePeakHz, setLivePeakHz] = useState(0);
  const [analysis, setAnalysis] = useState<SpeechAnalysisResult | null>(null);
  const [micWarning, setMicWarning] = useState<string | null>(null);
  const [sessionScores, setSessionScores] = useState<
    { sound: string; accuracy: number; pitchHz: number }[]
  >([]);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [earnedStarsInLesson, setEarnedStarsInLesson] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserCtxRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const simTimerRef = useRef<number | null>(null);
  const energySamplesRef = useRef<number[]>([]);
  const peakCapsRef = useRef<number[]>(Array(FREQ_BAR_COUNT).fill(0));
  const simBinsRef = useRef<number[]>(Array(FREQ_BAR_COUNT).fill(8));

  const currentWord = node.words[wordIndex];
  const progressPercent = lessonFinished
    ? 100
    : Math.round(((wordIndex + (analysis?.passed ? 1 : 0)) / node.words.length) * 100);

  const drawFrequencyGraph = (
    bins: number[],
    mode: 'idle' | 'mic' | 'sim' | 'passed' | 'good'
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((ratio) => {
      const y = Math.round(height * ratio) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    const gap = 5;
    const totalGap = gap * (FREQ_BAR_COUNT - 1);
    const barWidth = Math.max(4, (width - totalGap) / FREQ_BAR_COUNT);

    for (let i = 0; i < FREQ_BAR_COUNT; i++) {
      const val = Math.max(0, Math.min(255, bins[i] || 0));
      const normalized = val / 255;
      const barHeight = Math.max(6, normalized * (height - 14));
      const x = i * (barWidth + gap);
      const y = height - barHeight;

      if (barHeight > peakCapsRef.current[i]) {
        peakCapsRef.current[i] = barHeight;
      } else {
        peakCapsRef.current[i] = Math.max(6, peakCapsRef.current[i] - 1.3);
      }

      let fill = '#CBD5E1';
      if (mode === 'mic') {
        fill = normalized > 0.72 ? '#FF4B4B' : normalized > 0.4 ? '#00BFFF' : '#38BDF8';
      } else if (mode === 'sim') {
        fill = normalized > 0.65 ? '#58CC02' : '#00BFFF';
      } else if (mode === 'passed') {
        fill = '#58CC02';
      } else if (mode === 'good') {
        fill = '#FFC800';
      }

      ctx.fillStyle = fill;
      const radius = Math.min(barWidth / 2, 5);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 2, 2]);
      ctx.fill();

      if (mode === 'mic' || mode === 'sim') {
        const capY = Math.max(2, height - peakCapsRef.current[i] - 4);
        ctx.fillStyle = mode === 'mic' ? '#008ECC' : '#46A302';
        ctx.fillRect(x, capY, barWidth, 2.5);
      }
    }

    ctx.restore();
  };

  const cleanupAudioHardware = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (analyserCtxRef.current) {
      analyserCtxRef.current.close().catch(() => {});
      analyserCtxRef.current = null;
    }
    analyserNodeRef.current = null;
    setLiveVolumePct(0);
    setLivePeakHz(0);
    peakCapsRef.current = Array(FREQ_BAR_COUNT).fill(6);
    drawFrequencyGraph(Array(FREQ_BAR_COUNT).fill(18), 'idle');
  };

  useEffect(() => {
    drawFrequencyGraph(Array(FREQ_BAR_COUNT).fill(18), 'idle');
    return () => {
      cleanupAudioHardware();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isListening && !isMicTesterActive && !isSimulating) {
      const mode =
        analysis?.tier === 'excellent'
          ? 'passed'
          : analysis?.tier === 'good'
            ? 'good'
            : 'idle';
      drawFrequencyGraph(
        Array(FREQ_BAR_COUNT).fill(analysis?.passed ? 86 : 18),
        mode
      );
    }
  }, [analysis, wordIndex]);

  const attachAnalyserStream = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('NO_MEDIA');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    analyserCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);
    analyserNodeRef.current = analyser;

    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const sampleRate = ctx.sampleRate || 48000;
    const nyquist = sampleRate / 2;

    const renderLoop = () => {
      if (!analyserNodeRef.current) return;
      analyserNodeRef.current.getByteFrequencyData(freqData);

      const usefulBins = Math.min(freqData.length, 36);
      const mappedBins: number[] = [];
      let sum = 0;
      let maxVal = 0;
      let maxIdx = 0;

      for (let i = 0; i < FREQ_BAR_COUNT; i++) {
        const srcIdx = Math.min(
          usefulBins - 1,
          Math.floor((i / FREQ_BAR_COUNT) * usefulBins)
        );
        const val = freqData[srcIdx] || 0;
        mappedBins.push(val);
        sum += val;
        if (val > maxVal) {
          maxVal = val;
          maxIdx = srcIdx;
        }
      }

      const avgNorm = sum / (FREQ_BAR_COUNT * 255);
      energySamplesRef.current.push(avgNorm);
      setLiveVolumePct(Math.min(100, Math.round(avgNorm * 165)));

      const hz = maxVal > 18 ? Math.round((maxIdx / freqData.length) * nyquist) : 0;
      setLivePeakHz(hz);

      drawFrequencyGraph(mappedBins, 'mic');
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);
  };

  const kikiMood: KikiMood =
    isListening || isSimulating || isMicTesterActive
      ? 'listening'
      : analysis
        ? analysis.passed
          ? 'happy'
          : 'retry'
        : 'idle';

  const handleListen = () => {
    playButtonPop(!sfxEnabled);
    speakWord(
      currentWord.word,
      currentWord.speechLang,
      () => setIsSpeakingAudio(true),
      () => setIsSpeakingAudio(false)
    );
  };

  const finalizeAnalysis = (result: SpeechAnalysisResult) => {
    setAnalysis(result);
    if (result.passed) {
      playSuccessChime(!sfxEnabled);
      setEarnedStarsInLesson((prev) => prev + result.starsAwarded);
      onWordSuccess(result.starsAwarded);
      setSessionScores((prev) => [
        ...prev,
        {
          sound: currentWord.targetSound,
          accuracy: result.accuracy,
          pitchHz: result.pitchHz,
        },
      ]);
    } else {
      playRetryTone(!sfxEnabled);
    }
  };

  const handleToggleMicTester = async () => {
    if (isMicTesterActive) {
      playButtonPop(!sfxEnabled);
      cleanupAudioHardware();
      setIsMicTesterActive(false);
      return;
    }
    if (isListening || isSimulating) return;

    playButtonPop(!sfxEnabled);
    setMicWarning(null);
    energySamplesRef.current = [];
    try {
      setIsMicTesterActive(true);
      await attachAnalyserStream();
    } catch {
      cleanupAudioHardware();
      setIsMicTesterActive(false);
      setMicWarning(
        'Mikrofon ulanmadi yoki ruxsat berilmadi. «Simulyatsiya (Test)» orqali sinab ko‘rishingiz mumkin.'
      );
    }
  };

  const handleStartMicrophone = async () => {
    if (isListening) {
      cleanupAudioHardware();
      setIsListening(false);
      return;
    }

    if (isMicTesterActive) {
      cleanupAudioHardware();
      setIsMicTesterActive(false);
    }

    playButtonPop(!sfxEnabled);
    setMicWarning(null);
    setAnalysis(null);
    energySamplesRef.current = [];

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setMicWarning(
        'Brauzeringizda jonli ovoz aniqlash qo‘llab-quvvatlanmadi. «Jonli spektr» yoki «Simulyatsiya (Test)» tugmasidan foydalaning.'
      );
      return;
    }

    try {
      setIsListening(true);

      try {
        await attachAnalyserStream();
      } catch {
        simTimerRef.current = window.setInterval(() => {
          const fakeBins = Array.from({ length: FREQ_BAR_COUNT }, (_, idx) => {
            const bell = Math.exp(-Math.pow((idx - 8) / 7, 2));
            return Math.round((45 + Math.random() * 145) * bell + 18);
          });
          drawFrequencyGraph(fakeBins, 'mic');
        }, 50);
      }

      const recognition = new SpeechRecognitionCtor();
      recognitionRef.current = recognition;
      recognition.lang = currentWord.speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.continuous = false;

      let handled = false;

      recognition.onresult = (event) => {
        handled = true;
        const bestAlt = event.results?.[0]?.[0];
        const transcript = bestAlt?.transcript || '';
        const confidence = bestAlt?.confidence ?? 0.82;
        const avgEnergy =
          energySamplesRef.current.length > 0
            ? energySamplesRef.current.reduce((a, b) => a + b, 0) /
              energySamplesRef.current.length
            : 0.55;

        cleanupAudioHardware();
        setIsListening(false);
        const result = analyzePronunciation(transcript, currentWord, {
          averageMicEnergy: avgEnergy,
          recognitionConfidence: confidence,
          isSimulated: false,
        });
        finalizeAnalysis(result);
      };

      recognition.onerror = (event) => {
        handled = true;
        cleanupAudioHardware();
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicWarning(
            'Mikrofonga ruxsat berilmadi. «Simulyatsiya (Test)» tugmasi orqali tekshirishingiz mumkin.'
          );
        } else if (event.error === 'no-speech') {
          setMicWarning(
            'Ovoz eshitilmadi. Mikrofonga yaqinroq gapiring yoki «Simulyatsiya (Test)» tugmasini bosing.'
          );
        } else {
          setMicWarning(
            'Shovqin yoki brauzer cheklovi sababli tahlil qilib bo‘lmadi. «Simulyatsiya (Test)» tugmasini bosing.'
          );
        }
      };

      recognition.onend = () => {
        if (!handled) {
          cleanupAudioHardware();
          setIsListening(false);
        }
      };

      recognition.start();
    } catch {
      cleanupAudioHardware();
      setIsListening(false);
      setMicWarning(
        'Mikrofonni ishga tushirib bo‘lmadi. «Simulyatsiya (Test)» tugmasidan foydalaning.'
      );
    }
  };

  const handleSimulation = (simulateWeak = false) => {
    if (isListening || isSimulating || isMicTesterActive) return;
    playButtonPop(!sfxEnabled);
    setMicWarning(null);
    setAnalysis(null);
    setIsSimulating(true);

    let tick = 0;
    simTimerRef.current = window.setInterval(() => {
      tick += 1;
      const formantPeak = 7 + Math.sin(tick * 0.45) * 4;
      simBinsRef.current = Array.from({ length: FREQ_BAR_COUNT }, (_, idx) => {
        const bell = Math.exp(-Math.pow((idx - formantPeak) / 6.5, 2));
        return Math.round(
          ((simulateWeak ? 40 : 75) + Math.random() * (simulateWeak ? 90 : 160)) * bell + 18
        );
      });
      setLiveVolumePct(Math.round((simulateWeak ? 34 : 54) + Math.sin(tick * 0.5) * 20));
      setLivePeakHz(Math.round(234 + Math.sin(tick * 0.35) * 32));
      drawFrequencyGraph(simBinsRef.current, 'sim');
    }, 55);

    window.setTimeout(() => {
      cleanupAudioHardware();
      setIsSimulating(false);
      const result = analyzePronunciation(currentWord.word, currentWord, {
        averageMicEnergy: simulateWeak ? 0.32 : 0.62,
        isSimulated: true,
        simulateWeak,
      });
      finalizeAnalysis(result);
    }, 1150);
  };

  const finishLessonNow = () => {
    const bonus = node.variant === 'assessment' ? 30 : 20;
    const totalStars = earnedStarsInLesson + bonus;
    setEarnedStarsInLesson(totalStars);
    setLessonFinished(true);
    playLessonCompleteFanfare(!sfxEnabled);

    const allAcc =
      sessionScores.length > 0
        ? Math.round(
            sessionScores.reduce((sum, s) => sum + s.accuracy, 0) / sessionScores.length
          )
        : 84;
    const allPitch =
      sessionScores.length > 0
        ? Math.round(
            sessionScores.reduce((sum, s) => sum + s.pitchHz, 0) / sessionScores.length
          )
        : 244;

    // Group scores per sound for Weekly Assessment records
    const grouped: Record<string, number[]> = {};
    sessionScores.forEach((s) => {
      if (!grouped[s.sound]) grouped[s.sound] = [];
      grouped[s.sound].push(s.accuracy);
    });
    const perSoundScores: Partial<Record<SoundKey, number>> = {};
    (['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'] as SoundKey[]).forEach((key) => {
      if (grouped[key] && grouped[key].length > 0) {
        perSoundScores[key] = Math.round(
          grouped[key].reduce((a, b) => a + b, 0) / grouped[key].length
        );
      }
    });

    onLessonComplete({
      node,
      avgAccuracy: allAcc,
      avgPitchHz: allPitch,
      totalStarsEarned: totalStars,
      perSoundScores,
    });
  };

  const handleNextStep = () => {
    playButtonPop(!sfxEnabled);
    cleanupAudioHardware();
    setIsMicTesterActive(false);
    if (wordIndex < node.words.length - 1) {
      setWordIndex((prev) => prev + 1);
      setAnalysis(null);
      setMicWarning(null);
    } else {
      finishLessonNow();
    }
  };

  const handleRetryWord = () => {
    playButtonPop(!sfxEnabled);
    setAnalysis(null);
    setMicWarning(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={node.title}
    >
      {/* Top Progress Header (No hearts!) */}
      <div className="border-b-2 border-[#E5E5E5] px-4 sm:px-8 py-4 bg-white sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              cleanupAudioHardware();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#E5E5E5] hover:bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"
            aria-label="Mashqdan chiqish"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#58CC02] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm font-extrabold text-slate-700 tabular-nums whitespace-nowrap">
            {lessonFinished ? node.words.length : wordIndex + 1} / {node.words.length} so‘z
          </div>

          <div className="flex items-center gap-1 text-amber-600 font-extrabold text-sm tabular-nums shrink-0">
            <Star className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
            <span>+{earnedStarsInLesson}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto px-4 sm:px-8 py-6">
        {lessonFinished ? (
          <div className="my-auto flex flex-col items-center text-center py-8">
            <KikiMascot mood="happy" size="lg" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-4">
              {node.variant === 'assessment'
                ? 'Haftalik baholash saqlandi!'
                : 'Dars muvaffaqiyatli yakunlandi!'}
            </h2>
            <p className="text-base text-slate-600 font-semibold mt-2 max-w-md">
              {node.variant === 'assessment'
                ? 'Barcha 6 ta tovush bo‘yicha natijalar Logoped va Ota-ona kabinetiga saqlandi.'
                : 'Kiki bilan navbatdagi mashqni bajardingiz. Ovoz biometrikasi tahlili yangilandi.'}
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md mt-7">
              <div className="bg-amber-50 border-2 border-[#FFC800] rounded-2xl p-4">
                <div className="text-xs font-bold text-amber-700">Yulduzlar</div>
                <div className="font-display font-bold text-2xl text-amber-600 mt-1 tabular-nums">
                  +{earnedStarsInLesson} ⭐
                </div>
              </div>
              <div className="bg-emerald-50 border-2 border-[#58CC02] rounded-2xl p-4">
                <div className="text-xs font-bold text-emerald-700">O‘rtacha aniqlik</div>
                <div className="font-display font-bold text-2xl text-[#46A302] mt-1 tabular-nums">
                  {sessionScores.length > 0
                    ? Math.round(
                        sessionScores.reduce((a, b) => a + b.accuracy, 0) /
                          sessionScores.length
                      )
                    : 84}
                  %
                </div>
              </div>
              <div className="bg-[#E5F8FF] border-2 border-[#00BFFF] rounded-2xl p-4">
                <div className="text-xs font-bold text-[#008ECC]">Ohang</div>
                <div className="font-display font-bold text-2xl text-[#008ECC] mt-1 tabular-nums">
                  Me’yorda
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                onClose();
              }}
              className="btn-3d mt-8 w-full max-w-sm bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-2xl py-4 px-6 font-display font-bold text-lg"
            >
              Darslar yo‘liga qaytish
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {/* Lesson Title & Instruction */}
              <div className="text-center sm:text-left">
                <p className="text-xs font-extrabold text-[#008ECC] uppercase tracking-wider">
                  {node.title}
                </p>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1">
                  So‘zni tinglang va aniq talaffuz qiling
                </h2>
              </div>

              {/* Kiki + Target Word Card */}
              <div className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="shrink-0 flex flex-col items-center">
                  <KikiMascot mood={kikiMood} size="md" />
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="inline-block bg-[#E5F8FF] text-[#008ECC] font-extrabold text-xs px-3 py-1 rounded-xl mb-2">
                    Maqsadli tovush: «{currentWord.targetSound}»
                  </div>

                  <div className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-wide">
                    {highlightTargetSound(currentWord.word, currentWord.targetSound)}
                  </div>

                  <div className="mt-1.5 font-display font-bold text-lg sm:text-xl text-slate-500 tracking-widest">
                    {currentWord.syllables}
                  </div>

                  {currentWord.meaningUz && (
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      Ma’nosi: {currentWord.meaningUz}
                    </p>
                  )}

                  <p className="mt-2 text-xs sm:text-sm font-bold text-slate-600">
                    Namuna gap: «{currentWord.exampleUsage}»
                  </p>

                  <p className="mt-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-[#E5E5E5] rounded-2xl px-4 py-2.5">
                    💡 {currentWord.tipUz}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={handleListen}
                      className={`btn-3d bg-[#E5F8FF] hover:bg-[#D4F3FF] text-[#008ECC] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC] rounded-2xl px-5 py-2.5 font-display font-bold text-sm sm:text-base flex items-center gap-2 ${
                        isSpeakingAudio ? 'ring-4 ring-[#00BFFF]/30' : ''
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                      <span>{isSpeakingAudio ? 'Tinglanmoqda...' : '🔊 Eshitish'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Multilingual Contrast Guide */}
              {currentWord.contrastNote && (
                <div className="bg-violet-50/70 border-2 border-violet-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-violet-800 font-display font-bold text-sm mb-2">
                    <Globe className="w-4 h-4" />
                    <span>Ikki tilli talaffuz farqi</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white border border-violet-200 rounded-xl p-3">
                      <div className="font-extrabold text-[#008ECC]">
                        🇺🇿 {currentWord.contrastNote.uzSound}
                      </div>
                      <div className="text-slate-700 font-semibold mt-0.5">
                        {currentWord.contrastNote.uzExample}
                      </div>
                    </div>
                    <div className="bg-white border border-violet-200 rounded-xl p-3">
                      <div className="font-extrabold text-violet-700">
                        🇷🇺 {currentWord.contrastNote.ruSound}
                      </div>
                      <div className="text-slate-700 font-semibold mt-0.5">
                        {currentWord.contrastNote.ruExample}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-violet-900 mt-2">
                    {currentWord.contrastNote.explanation}
                  </p>
                </div>
              )}

              {/* Live Microphone & Real-Time AnalyserNode Frequency Bar Graph */}
              <div className="bg-slate-50 border-2 border-[#E5E5E5] rounded-3xl p-5 flex flex-col items-center text-center">
                <div className="w-full max-w-md flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                  <span className="flex items-center gap-1.5 text-[#008ECC]">
                    <Activity className="w-4 h-4" />
                    <span>Jonli ovoz chastotasi (AnalyserNode)</span>
                  </span>
                  <span className="tabular-nums text-slate-700">
                    {livePeakHz > 0 ? `${livePeakHz} Hz` : '80–4000 Hz'} ·{' '}
                    {liveVolumePct}%
                  </span>
                </div>

                <div className="w-full max-w-md bg-white border-2 border-[#E5E5E5] rounded-2xl p-3 mb-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-24 block"
                    aria-label="Mikrofon kirishining jonli chastota grafigi"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 tabular-nums">
                    <span>Past (80 Hz)</span>
                    <span>Nutq diapazoni (1 kHz)</span>
                    <span>Yuqori (4 kHz)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartMicrophone}
                  disabled={isSimulating}
                  className={`btn-3d w-full max-w-xs rounded-2xl py-4 px-6 font-display font-bold text-lg flex items-center justify-center gap-2.5 ${
                    isListening
                      ? 'bg-[#FF4B4B] hover:bg-[#F43F3F] text-white border-[#EA2B2B]'
                      : 'bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC]'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="w-5 h-5 fill-current" />
                      <span>Tinglayapman... (To‘xtatish)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6" />
                      <span>🎙️ Gapirish</span>
                    </>
                  )}
                </button>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleMicTester}
                    disabled={isListening || isSimulating}
                    className={`text-xs font-bold py-2 px-3 rounded-xl min-h-[38px] flex items-center gap-1.5 border transition-colors disabled:opacity-50 ${
                      isMicTesterActive
                        ? 'bg-[#FFE4E6] text-[#C81E1E] border-[#FF4B4B]'
                        : 'bg-white text-slate-700 border-[#E5E5E5] hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>
                      {isMicTesterActive
                        ? 'Spektr testini to‘xtatish'
                        : 'Jonli spektrni tekshirish'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulation(false)}
                    disabled={isListening || isSimulating || isMicTesterActive}
                    className="text-xs font-bold text-[#008ECC] hover:underline py-2 px-3 rounded-xl min-h-[38px] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isSimulating ? 'Tahlil qilinmoqda...' : 'Simulyatsiya (Test)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulation(true)}
                    disabled={isListening || isSimulating || isMicTesterActive}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline py-2 px-2.5 rounded-xl min-h-[38px] disabled:opacity-50"
                  >
                    Qiyin talaffuz testi (&lt;60%)
                  </button>
                </div>

                {micWarning && (
                  <p className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 max-w-md">
                    {micWarning}
                  </p>
                )}
              </div>

              {/* Real-Time AI Analysis Result Card */}
              {analysis && (
                <div
                  className={`border-2 rounded-3xl p-5 transition-all ${
                    analysis.tier === 'excellent'
                      ? 'bg-emerald-50 border-[#58CC02]'
                      : analysis.tier === 'good'
                        ? 'bg-amber-50 border-[#FFC800]'
                        : 'bg-rose-50 border-[#FF4B4B]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-6 h-6 ${
                          analysis.tier === 'excellent'
                            ? 'text-[#46A302]'
                            : analysis.tier === 'good'
                              ? 'text-amber-600'
                              : 'text-[#EA2B2B]'
                        }`}
                      />
                      <span
                        className={`font-display font-bold text-xl tabular-nums ${
                          analysis.tier === 'excellent'
                            ? 'text-[#46A302]'
                            : analysis.tier === 'good'
                              ? 'text-amber-700'
                              : 'text-[#EA2B2B]'
                        }`}
                      >
                        {analysis.feedbackUz}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white/80 border border-slate-200 px-3 py-1 rounded-xl">
                      Eshitilgan so‘z: «{analysis.transcript}»
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800 mb-4">
                    {analysis.highlightTipUz}
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-white/90 rounded-2xl p-2.5 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500">
                        Talaffuz aniqligi
                      </div>
                      <div className="font-display font-bold text-lg text-slate-900 tabular-nums">
                        {analysis.accuracy}%
                      </div>
                    </div>
                    <div className="bg-white/90 rounded-2xl p-2.5 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500">
                        Tovush balandligi
                      </div>
                      <div className="font-display font-bold text-lg text-slate-900 tabular-nums">
                        {analysis.pitchHz} Hz
                      </div>
                    </div>
                    <div className="bg-white/90 rounded-2xl p-2.5 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500">
                        Intonatsiya
                      </div>
                      <div className="font-display font-bold text-lg text-slate-900 tabular-nums">
                        {analysis.intonationScore}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tactile Action Bar */}
            {analysis && (
              <div
                className={`mt-6 rounded-3xl p-4 sm:p-5 border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  analysis.tier === 'excellent'
                    ? 'bg-[#D7FFB8] border-[#58CC02]'
                    : analysis.tier === 'good'
                      ? 'bg-amber-50 border-[#FFC800]'
                      : 'bg-[#FFE4E6] border-[#FF4B4B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {analysis.passed ? (
                    <>
                      <Star className="w-6 h-6 text-[#FFC800] fill-[#FFC800] shrink-0" />
                      <span className="font-display font-bold text-base text-slate-900">
                        +{analysis.starsAwarded} yulduzcha qo‘shildi!
                      </span>
                    </>
                  ) : (
                    <span className="font-display font-bold text-base text-[#C81E1E]">
                      Til holatini to‘g‘rilab yana bir marta sinab ko‘ring!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {analysis.tier !== 'excellent' && (
                    <button
                      type="button"
                      onClick={handleRetryWord}
                      className={`btn-3d flex-1 sm:flex-initial rounded-2xl py-3 px-5 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap ${
                        analysis.tier === 'retry'
                          ? 'bg-[#FF4B4B] hover:bg-[#F43F3F] text-white border-[#EA2B2B]'
                          : 'bg-white text-slate-700 border-2 border-slate-300'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Qayta urinish</span>
                    </button>
                  )}

                  {analysis.passed && (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-3d flex-1 sm:flex-initial bg-[#58CC02] hover:bg-[#4EC000] text-white border-[#46A302] rounded-2xl py-3 px-7 font-display font-bold text-base whitespace-nowrap"
                    >
                      {wordIndex < node.words.length - 1
                        ? 'Davom etish'
                        : 'Darsni yakunlash'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

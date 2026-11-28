import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Mic,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DIAGNOSTIC_WORDS,
  buildDemoDiagnosticReport,
  computeDiagnosticReport,
} from '../data/diagnosticData';
import {
  DiagnosticReport,
  DiagnosticWordItem,
  DiagnosticWordResult,
  KikiVoiceStyle,
  PracticeWord,
} from '../types';
import { KikiMascot, KikiMood } from './KikiMascot';
import { KikiVoiceControl } from './KikiVoiceControl';
import { MicIssueHelperCard } from './MicIssueHelperCard';
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

interface DiagnosticExamViewProps {
  report: DiagnosticReport | null;
  voiceStyle: KikiVoiceStyle;
  sfxEnabled: boolean;
  onChangeVoiceStyle: (style: KikiVoiceStyle) => void;
  onCompleteReport: (report: DiagnosticReport) => void;
  onGoToCity: () => void;
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

const FREQ_BAR_COUNT = 26;
const PREP_REMINDER_TEXT =
  'Imtihonni boshlashdan oldin shovqinsiz joyga o‘ting va mikrofonga yaqinroq gapiring! Tayyor bo‘lsangiz, imtihonni boshlash tugmasini bosing.';

function highlightTargetLetter(word: string, targetLetter: string): React.ReactNode {
  const escaped = targetLetter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = word.split(regex);
  if (parts.length === 1) return word;

  return parts.map((part, idx) =>
    part.toLowerCase() === targetLetter.toLowerCase() ? (
      <span
        key={idx}
        className="text-[#00BFFF] underline decoration-[#00BFFF]/55 decoration-4 underline-offset-4"
      >
        {part}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function toPracticeWordShim(item: DiagnosticWordItem): PracticeWord {
  return {
    id: item.id,
    word: item.word,
    syllables: item.syllables,
    targetSound: item.targetLetter,
    speechLang: 'uz-UZ',
    exampleUsage: item.tipUz,
    tipUz: item.tipUz,
  };
}

export const DiagnosticExamView: React.FC<DiagnosticExamViewProps> = ({
  report,
  voiceStyle: _propVoiceStyle,
  sfxEnabled,
  onChangeVoiceStyle,
  onCompleteReport,
  onGoToCity,
}) => {
  const { voiceStyle, setVoiceStyle } = useKikiVoice();
  const [phase, setPhase] = useState<'intro' | 'prep' | 'exam' | 'report'>(() =>
    report ? 'report' : 'intro'
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [results, setResults] = useState<DiagnosticWordResult[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    score: number;
    transcript: string;
    feedback: string;
    passed: boolean;
  } | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreparingMic, setIsPreparingMic] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveVolumePct, setLiveVolumePct] = useState(0);
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserCtxRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const simTimerRef = useRef<number | null>(null);
  const simFinishTimerRef = useRef<number | null>(null);
  const energySamplesRef = useRef<number[]>([]);
  const peakCapsRef = useRef<number[]>(Array(FREQ_BAR_COUNT).fill(6));
  const unclearAttemptsRef = useRef<number>(0);

  const currentItem = DIAGNOSTIC_WORDS[wordIndex];

  useEffect(() => {
    if (report && phase === 'intro') {
      setPhase('report');
    }
  }, [report, phase]);

  const drawFrequencyGraph = (
    bins: number[],
    mode: 'idle' | 'mic' | 'sim' | 'good' | 'weak'
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr)
    ) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    [0.3, 0.6].forEach((ratio) => {
      const y = Math.round(height * ratio) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    const gap = 4;
    const totalGap = gap * (FREQ_BAR_COUNT - 1);
    const barWidth = Math.max(4, (width - totalGap) / FREQ_BAR_COUNT);

    for (let i = 0; i < FREQ_BAR_COUNT; i++) {
      const val = Math.max(0, Math.min(255, bins[i] || 0));
      const normalized = val / 255;
      const barHeight = Math.max(5, normalized * (height - 10));
      const x = i * (barWidth + gap);
      const y = height - barHeight;

      if (barHeight > peakCapsRef.current[i]) {
        peakCapsRef.current[i] = barHeight;
      } else {
        peakCapsRef.current[i] = Math.max(5, peakCapsRef.current[i] - 1.2);
      }

      let fill = '#CBD5E1';
      if (mode === 'mic') {
        fill = normalized > 0.7 ? '#FF4B4B' : normalized > 0.35 ? '#00BFFF' : '#38BDF8';
      } else if (mode === 'sim') {
        fill = normalized > 0.65 ? '#58CC02' : '#00BFFF';
      } else if (mode === 'good') {
        fill = '#58CC02';
      } else if (mode === 'weak') {
        fill = '#FFC800';
      }

      ctx.fillStyle = fill;
      const radius = Math.min(barWidth / 2, 4);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 2, 2]);
      ctx.fill();
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
    if (simFinishTimerRef.current) {
      clearTimeout(simFinishTimerRef.current);
      simFinishTimerRef.current = null;
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
    peakCapsRef.current = Array(FREQ_BAR_COUNT).fill(5);
    drawFrequencyGraph(Array(FREQ_BAR_COUNT).fill(18), 'idle');
  };

  // Preload reminder & first word while on intro/prep so voice plays instantly with zero fallback lag
  useEffect(() => {
    if (phase === 'intro') {
      prefetchKikiSpeech(PREP_REMINDER_TEXT, 'uz-UZ', voiceStyle);
      if (DIAGNOSTIC_WORDS[0]) {
        prefetchKikiSpeech(DIAGNOSTIC_WORDS[0].word, 'uz-UZ', voiceStyle);
      }
    }
  }, [phase, voiceStyle]);

  // Auto-speak preparation reminder when opening the prep screen
  useEffect(() => {
    if (phase !== 'prep') return;
    if (DIAGNOSTIC_WORDS[0]) {
      prefetchKikiSpeech(DIAGNOSTIC_WORDS[0].word, 'uz-UZ', voiceStyle);
    }
    speakWord(
      PREP_REMINDER_TEXT,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      voiceStyle
    );

    return () => {
      stopKikiSpeaking();
      setIsSpeaking(false);
    };
  }, [phase, voiceStyle]);

  // Auto-speak current word when advancing inside exam mode (and prefetch next word)
  useEffect(() => {
    if (phase !== 'exam' || !currentItem) return;
    const nextItem = DIAGNOSTIC_WORDS[wordIndex + 1];
    if (nextItem) {
      prefetchKikiSpeech(nextItem.word, 'uz-UZ', voiceStyle);
    }
    speakWord(
      currentItem.word,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      voiceStyle
    );
    drawFrequencyGraph(Array(FREQ_BAR_COUNT).fill(18), 'idle');

    return () => {
      stopKikiSpeaking();
      setIsSpeaking(false);
    };
  }, [phase, wordIndex, voiceStyle]);

  // Cleanup everything on unmount
  useEffect(() => {
    return () => {
      cleanupAudioHardware();
      stopKikiSpeaking();
    };
  }, []);

  const attachAnalyserStream = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('NO_MEDIA');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
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

    const renderLoop = () => {
      if (!analyserNodeRef.current) return;
      analyserNodeRef.current.getByteFrequencyData(freqData);

      const usefulBins = Math.min(freqData.length, 32);
      const mappedBins: number[] = [];
      let sum = 0;

      for (let i = 0; i < FREQ_BAR_COUNT; i++) {
        const srcIdx = Math.min(
          usefulBins - 1,
          Math.floor((i / FREQ_BAR_COUNT) * usefulBins)
        );
        const val = freqData[srcIdx] || 0;
        mappedBins.push(val);
        sum += val;
      }

      const avgNorm = sum / (FREQ_BAR_COUNT * 255);
      energySamplesRef.current.push(avgNorm);
      setLiveVolumePct(Math.min(100, Math.round(avgNorm * 165)));

      drawFrequencyGraph(mappedBins, 'mic');
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);
  };

  const recordWordOutcome = (entry: DiagnosticWordResult) => {
    setResults((prev) => {
      const filtered = prev.filter((r) => r.wordId !== entry.wordId);
      return [...filtered, entry];
    });
  };

  const finalizeDiagnosticExam = (finalResults: DiagnosticWordResult[]) => {
    cleanupAudioHardware();
    stopKikiSpeaking();
    const computed = computeDiagnosticReport(finalResults, false);
    playLessonCompleteFanfare(!sfxEnabled);
    onCompleteReport(computed);
    setPhase('report');
  };

  const handleStartExam = () => {
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    cleanupAudioHardware();
    stopKikiSpeaking();
    setPhase('prep');
  };

  const handleReplayPrepReminder = () => {
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    speakWord(
      PREP_REMINDER_TEXT,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      voiceStyle
    );
  };

  const handleConfirmStartFromPrep = async () => {
    if (isPreparingMic) return;
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    stopKikiSpeaking();
    setIsSpeaking(false);
    cleanupAudioHardware();

    setIsPreparingMic(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        testStream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // Proceed smoothly even if mic prompt is declined; Word 1 offers simulation fallback
    } finally {
      setIsPreparingMic(false);
    }

    setResults([]);
    setWordIndex(0);
    setCurrentEvaluation(null);
    unclearAttemptsRef.current = 0;
    clearMicIssue();
    setPhase('exam');
  };

  const handleDemoFinish = () => {
    playButtonPop(!sfxEnabled);
    cleanupAudioHardware();
    stopKikiSpeaking();
    const demoReport = buildDemoDiagnosticReport();
    playLessonCompleteFanfare(!sfxEnabled);
    onCompleteReport(demoReport);
    setPhase('report');
  };

  const handleReplayWord = () => {
    if (!currentItem) return;
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    speakWord(
      currentItem.word,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      voiceStyle
    );
  };

  const handleVoiceStyleUpdate = (nextStyle: KikiVoiceStyle) => {
    setVoiceStyle(nextStyle);
    onChangeVoiceStyle(nextStyle);
  };

  const evaluateSpeechResult = (
    transcript: string,
    confidence: number,
    isSimulated: boolean
  ) => {
    if (!currentItem) return;
    const avgEnergy =
      energySamplesRef.current.length > 0
        ? energySamplesRef.current.reduce((a, b) => a + b, 0) /
          energySamplesRef.current.length
        : 0.56;

    const shim = toPracticeWordShim(currentItem);
    const analysis = analyzePronunciation(transcript, shim, {
      averageMicEnergy: avgEnergy,
      recognitionConfidence: confidence,
      isSimulated,
    });

    const entry: DiagnosticWordResult = {
      wordId: currentItem.id,
      word: currentItem.word,
      targetLetter: currentItem.targetLetter,
      mappedSoundKey: currentItem.mappedSoundKey,
      soundGroup: currentItem.soundGroup,
      score: analysis.accuracy,
      skipped: false,
      transcript: analysis.transcript,
    };

    recordWordOutcome(entry);
    setCurrentEvaluation({
      score: analysis.accuracy,
      transcript: analysis.transcript,
      feedback: analysis.feedbackUz,
      passed: analysis.accuracy >= 70,
    });

    drawFrequencyGraph(
      Array(FREQ_BAR_COUNT).fill(analysis.accuracy >= 70 ? 84 : 44),
      analysis.accuracy >= 70 ? 'good' : 'weak'
    );

    if (analysis.accuracy >= 70) {
      unclearAttemptsRef.current = 0;
      clearMicIssue();
      playSuccessChime(!sfxEnabled);
    } else {
      playRetryTone(!sfxEnabled);
      if (!isSimulated) {
        const isUnclear = isSpeechAttemptUnclear(
          analysis.transcript,
          currentItem.word,
          analysis.accuracy
        );
        if (isUnclear) {
          unclearAttemptsRef.current += 1;
          if (analysis.accuracy < 45 || unclearAttemptsRef.current >= 2) {
            triggerMicIssue('Ketma-ket noaniq talaffuz yoki begona so‘z eshitildi');
          }
        } else {
          unclearAttemptsRef.current = 0;
        }
      } else {
        unclearAttemptsRef.current = 0;
        clearMicIssue();
      }
    }
  };

  const handleToggleMicrophone = async () => {
    if (!currentItem) return;

    if (isListening) {
      const peakEnergy =
        energySamplesRef.current.length > 0
          ? Math.max(...energySamplesRef.current)
          : 0;
      const sampleCount = energySamplesRef.current.length;
      cleanupAudioHardware();
      setIsListening(false);
      // Stopping manually before recognition finishes counts as unclear if low/no audio
      if (sampleCount > 4 && peakEnergy >= 0.045) {
        unclearAttemptsRef.current += 1;
        if (unclearAttemptsRef.current >= 2) {
          playRetryTone(!sfxEnabled);
          triggerMicIssue('So‘z to‘liq aniqlanmadi');
        } else {
          playRetryTone(!sfxEnabled);
        }
      } else {
        playRetryTone(!sfxEnabled);
        triggerMicIssue('Ovoz yozib olinmadi');
      }
      return;
    }

    if (isSimulating) return;

    playButtonPop(!sfxEnabled);
    stopKikiSpeaking();
    setIsSpeaking(false);
    clearMicIssue();
    setCurrentEvaluation(null);
    energySamplesRef.current = [];

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }).webkitSpeechRecognition;

    try {
      setIsListening(true);
      await attachAnalyserStream();

      if (!SpeechRecognitionCtor) {
        // Fallback: analyze real microphone energy over 1.8s if SpeechRecognition API is absent
        simFinishTimerRef.current = window.setTimeout(() => {
          const peakEnergy =
            energySamplesRef.current.length > 0
              ? Math.max(...energySamplesRef.current)
              : 0;
          cleanupAudioHardware();
          setIsListening(false);
          if (peakEnergy >= 0.045) {
            evaluateSpeechResult(currentItem.word, 0.8, true);
          } else {
            playRetryTone(!sfxEnabled);
            triggerMicIssue('Ovoz yozib olinmadi');
          }
        }, 1800);
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      recognitionRef.current = recognition;
      recognition.lang = 'uz-UZ';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.continuous = false;

      let handled = false;

      recognition.onresult = (event) => {
        handled = true;
        const bestAlt = event.results?.[0]?.[0];
        const transcript = bestAlt?.transcript?.trim() || '';
        const confidence = bestAlt?.confidence ?? 0.82;
        const peakEnergy =
          energySamplesRef.current.length > 0
            ? Math.max(...energySamplesRef.current)
            : 0;
        cleanupAudioHardware();
        setIsListening(false);
        if (!transcript && peakEnergy < 0.035) {
          playRetryTone(!sfxEnabled);
          triggerMicIssue('Ovoz yozib olinmadi');
          return;
        }
        evaluateSpeechResult(transcript, confidence, false);
      };

      recognition.onerror = (event) => {
        handled = true;
        cleanupAudioHardware();
        setIsListening(false);
        playRetryTone(!sfxEnabled);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          triggerMicIssue('Mikrofonga ruxsat berilmagan');
        } else if (event.error === 'audio-capture' || event.error === 'not-found') {
          triggerMicIssue('Mikrofon topilmadi');
        } else {
          unclearAttemptsRef.current += 1;
          triggerMicIssue('Ovoz yozib olinmadi');
        }
      };

      recognition.onend = () => {
        if (!handled) {
          cleanupAudioHardware();
          setIsListening(false);
          playRetryTone(!sfxEnabled);
          unclearAttemptsRef.current += 1;
          triggerMicIssue('Ovoz yozib olinmadi');
        }
      };

      recognition.start();
    } catch {
      cleanupAudioHardware();
      setIsListening(false);
      playRetryTone(!sfxEnabled);
      triggerMicIssue('Mikrofon topilmadi yoki ruxsat berilmagan');
    }
  };

  const handleSimulatedSpeak = () => {
    if (!currentItem || isListening || isSimulating) return;
    playButtonPop(!sfxEnabled);
    stopKikiSpeaking();
    setIsSpeaking(false);
    unclearAttemptsRef.current = 0;
    clearMicIssue();
    setCurrentEvaluation(null);
    setIsSimulating(true);
    energySamplesRef.current = [0.58];

    let tick = 0;
    simTimerRef.current = window.setInterval(() => {
      tick += 1;
      const formantPeak = 7 + Math.sin(tick * 0.45) * 4;
      const bins = Array.from({ length: FREQ_BAR_COUNT }, (_, idx) => {
        const bell = Math.exp(-Math.pow((idx - formantPeak) / 6.2, 2));
        return Math.round((70 + Math.random() * 145) * bell + 20);
      });
      setLiveVolumePct(Math.round(52 + Math.sin(tick * 0.5) * 18));
      drawFrequencyGraph(bins, 'sim');
    }, 55);

    simFinishTimerRef.current = window.setTimeout(() => {
      cleanupAudioHardware();
      setIsSimulating(false);
      evaluateSpeechResult(currentItem.word, 0.85, true);
    }, 1050);
  };

  const handleNextWord = () => {
    if (!currentItem) return;
    playButtonPop(!sfxEnabled);
    cleanupAudioHardware();
    setIsListening(false);
    setIsSimulating(false);

    if (wordIndex < DIAGNOSTIC_WORDS.length - 1) {
      setWordIndex((prev) => prev + 1);
      setCurrentEvaluation(null);
      unclearAttemptsRef.current = 0;
      clearMicIssue();
    } else {
      finalizeDiagnosticExam(results);
    }
  };

  const handleSkipWord = () => {
    if (!currentItem) return;
    playButtonPop(!sfxEnabled);
    cleanupAudioHardware();
    setIsListening(false);
    setIsSimulating(false);

    const skippedEntry: DiagnosticWordResult = {
      wordId: currentItem.id,
      word: currentItem.word,
      targetLetter: currentItem.targetLetter,
      mappedSoundKey: currentItem.mappedSoundKey,
      soundGroup: currentItem.soundGroup,
      score: 52,
      skipped: true,
      transcript: '',
    };

    const nextResults = [
      ...results.filter((r) => r.wordId !== skippedEntry.wordId),
      skippedEntry,
    ];
    setResults(nextResults);

    if (wordIndex < DIAGNOSTIC_WORDS.length - 1) {
      setWordIndex((prev) => prev + 1);
      setCurrentEvaluation(null);
      unclearAttemptsRef.current = 0;
      clearMicIssue();
    } else {
      finalizeDiagnosticExam(nextResults);
    }
  };

  // ==================== 1. INTRO SCREEN ====================
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-5">
        <section className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-7 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <KikiMascot
              mood="happy"
              size="md"
              isSpeaking={isSpeaking}
              className="shrink-0"
            />
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl text-xs font-extrabold tracking-wide mb-2">
                <ClipboardCheck className="w-4 h-4" />
                <span>BIRINCHI IMTIHON · 25 TA SO‘Z</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                Birinchi imtihon — Nutq diagnostikasi
              </h1>
              <p className="text-sm sm:text-base text-white/95 font-semibold mt-2 leading-relaxed">
                Kiki siz bilan 25 ta maxsus o‘zbekcha so‘zni tekshirib, qaysi harf va
                tovushlar ustida ko‘proq mashq qilish kerakligini aniqlab beradi.
              </p>
            </div>
          </div>
        </section>

        {/* Kiki Child Voice Preview & Selector */}
        <KikiVoiceControl
          voiceStyle={voiceStyle}
          sfxEnabled={sfxEnabled}
          onChangeVoiceStyle={handleVoiceStyleUpdate}
        />

        {/* 4 Sound Groups Summary */}
        <section className="bg-white dark:bg-slate-900 border-2 border-[#E5E5E5] dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Imtihonda tekshiriladigan 4 ta tovush guruhi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: '1. Sonorlar (5 so‘z)',
                letters: 'R, L',
                examples: 'Arra, Daraxt, Rasm, Lola, Qalam',
                color:
                  'bg-[#E5F8FF]/70 dark:bg-[#00BFFF]/15 border-[#00BFFF]/40 text-[#008ECC] dark:text-[#38BDF8]',
              },
              {
                title: '2. Sirg‘aluvchi va shovqinli (10 so‘z)',
                letters: 'S, Z, Sh, J, Ch, X, H',
                examples: 'Soat, Zebra, Quyosh, Jo‘ja, Choy, Xona, Bahor',
                color:
                  'bg-emerald-50/70 dark:bg-emerald-950/40 border-[#58CC02]/40 text-[#3B8700] dark:text-[#7CE82B]',
              },
              {
                title: '3. Portlovchi tovushlar (8 so‘z)',
                letters: 'K, G, Q, G‘, T, D, P, B',
                examples: 'Kitob, Gul, Qor, G‘oz, Tog‘, Daryo, Pishloq, Bola',
                color:
                  'bg-amber-50/70 dark:bg-amber-950/40 border-[#FFC800]/50 text-amber-800 dark:text-amber-300',
              },
              {
                title: '4. Unli va burun (2 so‘z)',
                letters: 'O‘, Ng',
                examples: 'O‘rdak, Tong',
                color:
                  'bg-violet-50/70 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300',
              },
            ].map((grp) => (
              <div
                key={grp.title}
                className={`border-2 rounded-2xl p-4 ${grp.color}`}
              >
                <div className="font-display font-bold text-sm">{grp.title}</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                  Harflar: {grp.letters}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {grp.examples}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleStartExam}
              className="btn-3d flex-1 bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-2xl py-3.5 px-6 font-display font-bold text-base flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Imtihonni boshlash (25 so‘z)</span>
            </button>

            <button
              type="button"
              onClick={handleDemoFinish}
              className="btn-3d bg-white dark:bg-slate-800 hover:bg-[#E5F8FF] dark:hover:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC] rounded-2xl py-3.5 px-5 font-display font-bold text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Testni yakunlash (Demo natija)</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ==================== 1.5. PRE-EXAM PREPARATION SCREEN ====================
  if (phase === 'prep') {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-5">
        {/* Top Kiki Narration Banner */}
        <section className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-7 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <KikiMascot
              mood={isSpeaking ? 'happy' : 'idle'}
              size="md"
              isSpeaking={isSpeaking}
              className="shrink-0"
            />
            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl text-xs font-extrabold tracking-wide">
                  <ClipboardCheck className="w-4 h-4" />
                  <span>TAYYORGARLIK ESLATMASI</span>
                </span>

                <span
                  role="status"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold transition-colors ${
                    isSpeaking
                      ? 'bg-[#FFC800] text-slate-900 shadow-xs'
                      : 'bg-white/15 text-white/90'
                  }`}
                >
                  <Volume2
                    className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`}
                  />
                  <span>
                    {isSpeaking
                      ? 'Kiki eslatmani o‘qimoqda...'
                      : 'Kiki eslatmasi tayyor'}
                  </span>
                </span>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                Boshlashdan oldin kichik tayyorgarlik!
              </h1>
              <p className="text-sm sm:text-base text-white/95 font-semibold mt-2 leading-relaxed">
                «{PREP_REMINDER_TEXT}»
              </p>
            </div>
          </div>
        </section>

        {/* Two Visual Reminder Cards */}
        <section className="bg-white dark:bg-slate-900 border-2 border-[#E5E5E5] dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Quiet environment */}
            <div className="bg-[#F0FAFF] dark:bg-[#00BFFF]/15 border-2 border-[#00BFFF]/50 rounded-3xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00BFFF] text-white flex items-center justify-center shadow-xs shrink-0">
                  <VolumeX className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
                    1-ESLATMA
                  </span>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    Shovqinsiz joyga o‘ting
                  </h2>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                Televizor, musiqa yoki baland shovqindan uzoqroq tinch joyni tanlang —
                shunda Kiki har bir harfni aniq eshitadi va to‘g‘ri baholaydi.
              </p>
            </div>

            {/* Card 2: Speak close to microphone */}
            <div className="bg-emerald-50/75 dark:bg-emerald-950/40 border-2 border-[#58CC02]/50 rounded-3xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-[#3B8700] dark:text-[#7CE82B]">
                    2-ESLATMA
                  </span>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    Mikrofonga yaqinroq gapiring
                  </h2>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                Telefon yoki kompyuter mikrofoniga yaqinroq bo‘lib, shoshilmasdan,
                ravon va balandroq ohangda har bir so‘zni talaffuz qiling.
              </p>
            </div>
          </div>

          {/* Primary 3D CTA + Replay + Back */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              disabled={isPreparingMic}
              onClick={handleConfirmStartFromPrep}
              className="btn-3d flex-1 bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-2xl py-4 px-6 font-display font-bold text-base sm:text-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {isPreparingMic ? 'Mikrofon tayyorlanmoqda...' : 'Imtihonni boshlash'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReplayPrepReminder}
              className="btn-3d bg-[#E5F8FF] dark:bg-slate-800 hover:bg-[#D4F3FF] dark:hover:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC] rounded-2xl py-3.5 px-5 font-display font-bold text-sm flex items-center justify-center gap-2"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span>Qayta eslatish</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                stopKikiSpeaking();
                setIsSpeaking(false);
                setPhase(report ? 'report' : 'intro');
              }}
              className="btn-3d bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[5px] border-b-slate-300 dark:border-b-slate-900 rounded-2xl py-3.5 px-4 font-display font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ==================== 2. 25-WORD EXAM SCREEN ====================
  if (phase === 'exam' && currentItem) {
    const progressPct = Math.round(
      ((wordIndex + (currentEvaluation ? 1 : 0)) / DIAGNOSTIC_WORDS.length) * 100
    );
    const kikiMood: KikiMood =
      isListening || isSimulating
        ? 'listening'
        : currentEvaluation
          ? currentEvaluation.passed
            ? 'happy'
            : 'retry'
          : 'idle';

    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-4">
        {/* Progress Header */}
        <section className="bg-white dark:bg-slate-900 border-2 border-[#E5E5E5] dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] border border-[#00BFFF]/50 px-3 py-1 rounded-xl font-display font-bold text-sm tabular-nums">
                {wordIndex + 1} / {DIAGNOSTIC_WORDS.length} so‘z
              </span>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                {currentItem.soundGroup}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDemoFinish}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-[#FFC800] text-amber-900 dark:text-amber-200 text-xs font-extrabold transition-colors"
            >
              Testni yakunlash (Demo natija)
            </button>
          </div>

          <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E5E5] dark:border-slate-700">
            <div
              className="h-full bg-[#00BFFF] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>
        </section>

        {/* Compact Kiki Voice Strip */}
        <KikiVoiceControl
          voiceStyle={voiceStyle}
          sfxEnabled={sfxEnabled}
          onChangeVoiceStyle={handleVoiceStyleUpdate}
          compact
        />

        {/* Active Word Card */}
        <section className="bg-white dark:bg-slate-900 border-2 border-[#00BFFF]/60 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <KikiMascot
                mood={kikiMood}
                size="sm"
                isSpeaking={isSpeaking}
                className="!w-20 !h-20 shrink-0"
              />
              <div>
                <span className="inline-block bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] text-xs font-extrabold px-2.5 py-0.5 rounded-lg">
                  Maqsad harf: «{currentItem.targetLetter}»
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                  {isSpeaking
                    ? 'Kiki so‘zni aytmoqda, diqqat bilan tinglang...'
                    : 'Avval eshiting, so‘ng mikrofonni bosib aniq ayting!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReplayWord}
              className="btn-3d bg-[#E5F8FF] dark:bg-slate-800 hover:bg-[#D4F3FF] dark:hover:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-2xl px-4 py-2.5 font-display font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span>Qayta eshitish</span>
            </button>
          </div>

          {/* Emoji + Word Display */}
          <div className="bg-[#F8FDFF] dark:bg-slate-800 border-2 border-[#D4F3FF] dark:border-slate-700 rounded-3xl py-6 px-4 text-center space-y-2">
            <div className="text-6xl leading-none select-none" aria-hidden="true">
              {currentItem.emoji}
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-wide pt-1">
              {highlightTargetLetter(currentItem.word, currentItem.targetLetter)}
            </h2>
            <div className="text-sm font-extrabold text-[#008ECC] dark:text-[#38BDF8] tracking-widest">
              {currentItem.syllables}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-md mx-auto pt-1">
              💡 {currentItem.tipUz}
            </p>
          </div>

          {/* Real-Time AnalyserNode Frequency Spectrum */}
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
              <span>
                {isListening
                  ? 'Jonli mikrofon to‘lqini'
                  : isSimulating
                    ? 'Sinov ovoz to‘lqini'
                    : 'Ovoz spektri tayyor'}
              </span>
              <span className="tabular-nums text-[#008ECC] dark:text-[#38BDF8]">
                Ovoz kuchi: {liveVolumePct}%
              </span>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-16 block rounded-xl"
              aria-label="Real vaqtdagi mikrofon tovush spektri"
            />
          </div>

          {/* Evaluation Feedback */}
          {currentEvaluation && (
            <div
              className={`rounded-2xl border-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                currentEvaluation.passed
                  ? 'bg-emerald-50 border-[#58CC02] text-emerald-950'
                  : 'bg-amber-50 border-[#FFC800] text-amber-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    currentEvaluation.passed ? 'text-[#46A302]' : 'text-amber-600'
                  }`}
                />
                <div>
                  <div className="font-display font-bold text-sm sm:text-base">
                    Natija: {currentEvaluation.score}% ·{' '}
                    {currentEvaluation.passed ? 'Barakalla!' : 'Mashq qilamiz!'}
                  </div>
                  <p className="text-xs font-semibold mt-0.5">
                    {currentEvaluation.feedback}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextWord}
                className="btn-3d bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-xl px-4 py-2.5 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>
                  {wordIndex === DIAGNOSTIC_WORDS.length - 1
                    ? 'Hisobotni ko‘rish'
                    : 'Keyingi so‘z'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mic Issue Helper Card with Kiki Child Voice Announcement */}
          {micIssueKey > 0 && (
            <MicIssueHelperCard
              issueKey={micIssueKey}
              sfxEnabled={sfxEnabled}
              onRetry={handleToggleMicrophone}
              onFallbackAction={handleSimulatedSpeak}
              fallbackLabel="Simulyatsiya (Test)"
              detailHint={micIssueHint}
            />
          )}

          {/* Primary Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleToggleMicrophone}
              className={`btn-3d flex-1 rounded-2xl py-3.5 px-5 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-[#FF4B4B] hover:bg-[#EA2B2B] border-[#C81E1E] text-white'
                  : 'bg-[#00BFFF] hover:bg-[#00AEEC] border-[#008ECC] text-white'
              }`}
            >
              {isListening ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Yozishni to‘xtatish...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Mikrofonni bosib ayting</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isListening || isSimulating}
              onClick={handleSimulatedSpeak}
              className="btn-3d bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[5px] border-b-slate-300 dark:border-b-slate-900 rounded-2xl py-3.5 px-4 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#00BFFF]" />
              <span>Simulyatsiya</span>
            </button>

            <button
              type="button"
              onClick={handleSkipWord}
              className="btn-3d bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 border-b-[5px] border-b-slate-300 dark:border-b-slate-900 rounded-2xl py-3.5 px-4 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
            >
              <SkipForward className="w-4 h-4" />
              <span>O‘tkazib yuborish</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ==================== 3. DETAILED REPORT SCREEN ====================
  const activeReport = report || buildDemoDiagnosticReport();
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset =
    circumference - (activeReport.overallScore / 100) * circumference;

  const gaugeColor =
    activeReport.overallScore >= 85
      ? '#58CC02'
      : activeReport.overallScore >= 60
        ? '#FFC800'
        : '#F43F5E';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-6">
      {/* Top Circular Score Hero */}
      <section className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-7 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Circular SVG Gauge */}
            <div className="relative w-36 h-36 bg-white rounded-full p-2 shadow-md shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 132 132">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                />
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-3xl text-slate-900 tabular-nums">
                  {activeReport.overallScore}%
                </span>
                <span className="text-[10px] font-extrabold text-slate-500">
                  RAVONLIK
                </span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl text-xs font-extrabold mb-2">
                <Award className="w-4 h-4" />
                <span>
                  NUTQ DIAGNOSTIKASI HISOBOTI{' '}
                  {activeReport.isDemo ? '· DEMO NATIJA' : ''}
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                Umumiy nutq ravonligi: {activeReport.overallScore}%
              </h1>
              <p className="text-sm text-white/95 font-semibold mt-1.5">
                {activeReport.totalWords} ta so‘zdan {activeReport.completedWords} tasi
                talaffuz qilindi · Soat {activeReport.completedAt} da saqlandi.
              </p>
            </div>
          </div>

          <KikiMascot mood="happy" size="sm" className="!w-20 !h-20 shrink-0" />
        </div>
      </section>

      {/* Kiki Voice Control */}
      <KikiVoiceControl
        voiceStyle={voiceStyle}
        sfxEnabled={sfxEnabled}
        onChangeVoiceStyle={onChangeVoiceStyle}
        compact
      />

      {/* Weakest Letters Summary Card */}
      <section className="bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
              Eng ko‘p qiynalgan harflar
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              Kiki tavsiyasi: «So‘zlar shahri»dagi shaxsiy mashq aynan shu tovushlardan
              boshlanadi.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-extrabold px-3 py-1.5 rounded-xl self-start">
            Fokus: {activeReport.recommendedCityFocusLetters.join(', ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeReport.weakestLetters.map((item) => (
            <div
              key={item.letter}
              className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900 rounded-2xl p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  «{item.letter}» tovushi
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${
                    item.status === 'excellent'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.score}%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                💡 {item.tipUz}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Letter-by-Letter Breakdown Grid */}
      <section className="bg-white dark:bg-slate-900 border-2 border-[#E5E5E5] dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
            Harflar bo‘yicha batafsil natija
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              85–100% A’lo
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
              60–84% O‘rtacha
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700">
              &lt;60% Mashq kerak
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeReport.letterScores.map((ls) => {
            const barColor =
              ls.status === 'excellent'
                ? 'bg-[#58CC02]'
                : ls.status === 'medium'
                  ? 'bg-[#FFC800]'
                  : 'bg-rose-500';
            const badgeStyle =
              ls.status === 'excellent'
                ? 'bg-emerald-100 text-emerald-800'
                : ls.status === 'medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-700';
            const statusText =
              ls.status === 'excellent'
                ? 'Yashil · A’lo'
                : ls.status === 'medium'
                  ? 'Sariq · Yaxshi'
                  : 'Qizil · Mashq kerak';

            return (
              <div
                key={ls.letter}
                className="border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-3.5 space-y-2 bg-slate-50/40 dark:bg-slate-800/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-[#E5F8FF] dark:bg-[#00BFFF]/20 border border-[#00BFFF]/40 font-display font-bold text-base text-[#008ECC] dark:text-[#38BDF8] flex items-center justify-center">
                      {ls.letter}
                    </span>
                    <div>
                      <div className="font-display font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                        {ls.score}%
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {ls.wordsTested} so‘z tekshirildi
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${badgeStyle}`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${ls.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onGoToCity();
            }}
            className="btn-3d flex-1 bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-2xl py-3.5 px-5 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            <span>So‘zlar shahrida shaxsiy mashqni boshlash</span>
          </button>

          <button
            type="button"
            onClick={handleStartExam}
            className="btn-3d bg-white dark:bg-slate-800 hover:bg-[#E5F8FF] dark:hover:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC] rounded-2xl py-3.5 px-5 font-display font-bold text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qayta imtihon topshirish</span>
          </button>
        </div>
      </section>
    </div>
  );
};

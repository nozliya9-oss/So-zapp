import { Language } from '../types';

let audioCtx: AudioContext | null = null;
let musicIntervalId: number | null = null;
let musicPlaying = false;
let musicStepIndex = 0;
let activeSpeakTimerId: number | null = null;

// Gentle C-major pentatonic melody notes (Hz)
const MELODY_NOTES = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 659.25, 523.25, 392.0,
  440.0, 523.25, 659.25, 587.33,
  523.25, 392.0, 440.0, 523.25,
];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Pre-warm speechSynthesis voice list if available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
  } catch {
    // Ignore
  }
}

function playSoftMusicNote(freq: number) {
  const ctx = getAudioContext();
  if (!ctx || !musicPlaying) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0005, now);
    gain.gain.linearRampToValueAtTime(0.026, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.58);
  } catch {
    // Ignore autoplay restriction
  }
}

export function startBackgroundMusic(): void {
  if (musicPlaying || typeof window === 'undefined') return;
  musicPlaying = true;
  playSoftMusicNote(MELODY_NOTES[musicStepIndex % MELODY_NOTES.length]);
  musicStepIndex += 1;

  musicIntervalId = window.setInterval(() => {
    if (!musicPlaying) return;
    playSoftMusicNote(MELODY_NOTES[musicStepIndex % MELODY_NOTES.length]);
    musicStepIndex += 1;
  }, 680);
}

export function stopBackgroundMusic(): void {
  musicPlaying = false;
  if (musicIntervalId !== null) {
    clearInterval(musicIntervalId);
    musicIntervalId = null;
  }
}

export function playButtonPop(muted = false): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.055);

    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Ignore audio context restriction errors
  }
}

export function playSuccessChime(muted = false): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.075;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.11, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {
    // Ignore audio context errors
  }
}

export function playRetryTone(muted = false): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [392, 349.23];
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const start = now + idx * 0.11;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  } catch {
    // Ignore audio context errors
  }
}

export function playLessonCompleteFanfare(muted = false): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 659.25, 1046.5];
    const durations = [0.1, 0.1, 0.1, 0.12, 0.38];
    let offset = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, offset);

      gain.gain.setValueAtTime(0.12, offset);
      gain.gain.exponentialRampToValueAtTime(0.001, offset + durations[i]);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(offset);
      osc.stop(offset + durations[i] + 0.02);
      offset += durations[i] * 0.85;
    });
  } catch {
    // Ignore
  }
}

/**
 * Maps Uzbek Latin orthography to Turkish-compatible phonetics ONLY when
 * speaking via a Turkic (tr-TR) fallback voice so sounds like Sh/Ch/O‘/G‘/J
 * sound authentically Uzbek instead of broken.
 */
function toTurkicPhoneticText(uzbekText: string): string {
  return uzbekText
    .replace(/o['‘’`]/gi, (m) => (m[0] === 'O' ? 'Ö' : 'ö'))
    .replace(/g['‘’`]/gi, (m) => (m[0] === 'G' ? 'Ğ' : 'ğ'))
    .replace(/sh/gi, (m) => (m[0] === 'S' ? 'Ş' : 'ş'))
    .replace(/ch/gi, (m) => (m[0] === 'C' ? 'Ç' : 'ç'))
    .replace(/j/gi, (m) => (m[0] === 'J' ? 'C' : 'c'))
    .replace(/q/gi, (m) => (m[0] === 'Q' ? 'K' : 'k'))
    .replace(/x/gi, (m) => (m[0] === 'X' ? 'H' : 'h'));
}

/**
 * Web Audio Uzbek syllable cadence synthesizer:
 * Used ONLY when the user's browser lacks any native uz-UZ or Turkic voice,
 * guaranteeing we NEVER fall back to an English (en-US/en-GB) accent!
 */
function playUzbekSyllableCadence(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  const ctx = getAudioContext();
  const vowelMatches = text.toLowerCase().match(/[aeiouöü]/g) || ['a', 'a'];
  const syllableCount = Math.min(6, Math.max(1, vowelMatches.length));

  const vowelPitchMap: Record<string, number> = {
    a: 392.0,
    e: 440.0,
    i: 523.25,
    o: 349.23,
    u: 329.63,
    ö: 370.0,
    ü: 493.88,
  };

  onStart?.();

  if (ctx) {
    try {
      const now = ctx.currentTime;
      for (let i = 0; i < syllableCount; i++) {
        const ch = vowelMatches[i] || 'a';
        const baseFreq = vowelPitchMap[ch] || 392;
        const start = now + i * 0.21;

        // Warm vocal-like filtered sawtooth/triangle pulse per Uzbek syllable
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.04, start + 0.08);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.96, start + 0.17);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.11, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.19);
      }
    } catch {
      // Ignore
    }
  }

  const totalMs = Math.max(550, syllableCount * 220 + 180);
  if (activeSpeakTimerId !== null) {
    clearTimeout(activeSpeakTimerId);
  }
  activeSpeakTimerId = window.setTimeout(() => {
    activeSpeakTimerId = null;
    onEnd?.();
  }, totalMs);
}

export function speakWord(
  text: string,
  speechLang: 'uz-UZ' | 'ru-RU' | Language = 'uz-UZ',
  onStart?: () => void,
  onEnd?: () => void
): void {
  const normalizedLang =
    speechLang === 'ru' ? 'ru-RU' : speechLang === 'uz' ? 'uz-UZ' : speechLang;

  if (activeSpeakTimerId !== null) {
    clearTimeout(activeSpeakTimerId);
    activeSpeakTimerId = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();

      let chosenVoice: SpeechSynthesisVoice | undefined;
      let textToSpeak = text;

      if (normalizedLang === 'ru-RU') {
        chosenVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ru'));
      } else {
        // Strict Uzbek pronunciation priority:
        // 1. Native Uzbek voice (uz-UZ / uz)
        // 2. Closely related Turkic voice (tr / az / kk / ky) with phonetic mapping
        // NEVER fall back to English (en-*) or undefined browser default!
        chosenVoice = voices.find((v) => v.lang.toLowerCase().startsWith('uz'));
        if (!chosenVoice) {
          const turkicVoice = voices.find((v) => {
            const langLower = v.lang.toLowerCase();
            return (
              langLower.startsWith('tr') ||
              langLower.startsWith('az') ||
              langLower.startsWith('kk') ||
              langLower.startsWith('ky')
            );
          });
          if (turkicVoice) {
            chosenVoice = turkicVoice;
            textToSpeak = toTurkicPhoneticText(text);
          }
        }
      }

      // Guardrail: Explicitly block any English voice or missing voice so Uzbek
      // is NEVER spoken with an English accent!
      if (chosenVoice && !chosenVoice.lang.toLowerCase().startsWith('en')) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
        utterance.rate = 0.84;
        utterance.pitch = 1.05;

        let finished = false;
        const finishOnce = () => {
          if (finished) return;
          finished = true;
          if (activeSpeakTimerId !== null) {
            clearTimeout(activeSpeakTimerId);
            activeSpeakTimerId = null;
          }
          onEnd?.();
        };

        utterance.onstart = () => onStart?.();
        utterance.onend = finishOnce;
        utterance.onerror = () => {
          finishOnce();
          playUzbekSyllableCadence(text);
        };

        onStart?.();
        window.speechSynthesis.speak(utterance);
        activeSpeakTimerId = window.setTimeout(finishOnce, 2600);
        return;
      }
    } catch {
      // Fall through to Uzbek phonetic cadence helper
    }
  }

  // Safe non-English Uzbek phonetic cadence fallback
  playUzbekSyllableCadence(text, onStart, onEnd);
}

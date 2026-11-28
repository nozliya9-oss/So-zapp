import { KikiVoiceStyle, Language } from '../types';
import { normalizeUzbekOrthography } from './uzbekSpeechNormalizer';
import {
  KIKI_VOICE_PROFILES,
  KIKI_VOICE_STORAGE_KEY,
  KikiVoiceProfileConfig,
  getActiveKikiVoiceConfig,
  getKikiVoiceStyle,
  getSharedAudioContext,
  normalizeKikiVoiceStyle,
  prefetchUzVoice,
  setKikiVoiceStyle,
  speakUzVoice,
  stopUzVoice,
  unlockUzAudio,
} from './uzVoiceService';

export {
  KIKI_VOICE_PROFILES,
  KIKI_VOICE_STORAGE_KEY,
  getActiveKikiVoiceConfig,
  getKikiVoiceStyle,
  normalizeKikiVoiceStyle,
  setKikiVoiceStyle,
};
export type { KikiVoiceProfileConfig };

let musicIntervalId: number | null = null;
let musicPlaying = false;
let musicStepIndex = 0;

// Gentle C-major pentatonic melody notes (Hz)
const MELODY_NOTES = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 659.25, 523.25, 392.0,
  440.0, 523.25, 659.25, 587.33,
  523.25, 392.0, 440.0, 523.25,
];

export function unlockKikiAudio(): void {
  unlockUzAudio();
}

function playSoftMusicNote(freq: number) {
  const ctx = getSharedAudioContext();
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
  const ctx = getSharedAudioContext();
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
  const ctx = getSharedAudioContext();
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
  const ctx = getSharedAudioContext();
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
  const ctx = getSharedAudioContext();
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

export function normalizeUzbekForSpeech(uzbekText: string): string {
  return normalizeUzbekOrthography(uzbekText);
}

export function stopKikiSpeaking(): void {
  stopUzVoice();
}

export function prefetchKikiSpeech(
  text: string,
  speechLang: 'uz-UZ' | 'ru-RU' | Language = 'uz-UZ',
  overrideStyle?: KikiVoiceStyle
): void {
  prefetchUzVoice(text, speechLang, overrideStyle);
}

export function speakWord(
  text: string,
  speechLang: 'uz-UZ' | 'ru-RU' | Language = 'uz-UZ',
  onStart?: () => void,
  onEnd?: () => void,
  overrideStyle?: KikiVoiceStyle
): void {
  speakUzVoice(text, speechLang, onStart, onEnd, overrideStyle);
}

import { KikiVoiceStyle, Language } from '../types';
import {
  normalizeUzbekOrthography,
  normalizeUzbekSpeechForTTS,
  toUzbekAudioSlug,
} from './uzbekSpeechNormalizer';

export type UzVoiceSource =
  | 'static_asset'
  | 'uzbek_tts_api'
  | 'uzbek_webspeech'
  | 'cadence_fallback';

export interface UzVoiceStatusSnapshot {
  lastSource: UzVoiceSource | null;
  lastStyle: KikiVoiceStyle;
  lastText: string;
  lastSlug: string;
  lastNotice: string | null;
}

export interface KikiVoiceProfileConfig {
  style: KikiVoiceStyle;
  label: string;
  pitch: number;
  rate: number;
  volume: number;
  geminiVoice: 'Charon' | 'Zephyr';
  playbackPitchMultiplier: number;
}

interface StaticUzbekManifest {
  version?: number;
  basePath?: string;
  entries?: {
    child_boy?: Record<string, string>;
    child_girl?: Record<string, string>;
    shared?: Record<string, string>;
  };
}

export const KIKI_VOICE_STORAGE_KEY = 'kiki_voice_style_v3';
const CACHE_STORAGE_NAME = 'sozapp-uz-voice-v9';
const STATIC_MANIFEST_URL = '/audio/uz/manifest.json';

if (typeof window !== 'undefined' && 'caches' in window) {
  window.caches
    .keys()
    .then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('sozapp-uz-voice-') && k !== CACHE_STORAGE_NAME)
          .map((k) => window.caches.delete(k))
      )
    )
    .catch(() => {});
}

export function normalizeKikiVoiceStyle(style?: string | null): KikiVoiceStyle {
  if (style === 'child_girl' || style === 'soft') {
    return 'child_girl';
  }
  return 'child_boy';
}

export const KIKI_VOICE_PROFILES: Record<KikiVoiceStyle, KikiVoiceProfileConfig> = {
  child_boy: {
    style: 'child_boy',
    label: 'Mitti bola (Kichik o‘g‘il bola)',
    pitch: 1.18,
    rate: 0.96,
    volume: 1.0,
    geminiVoice: 'Charon',
    playbackPitchMultiplier: 1.0,
  },
  child_girl: {
    style: 'child_girl',
    label: 'Kichik qizaloq (Qiz bola)',
    pitch: 1.76,
    rate: 0.93,
    volume: 1.0,
    geminiVoice: 'Zephyr',
    playbackPitchMultiplier: 1.0,
  },
};

function readPersistedVoiceStyle(): KikiVoiceStyle {
  if (typeof window === 'undefined') return 'child_boy';
  try {
    const direct = window.localStorage.getItem(KIKI_VOICE_STORAGE_KEY);
    if (direct) return normalizeKikiVoiceStyle(direct);

    const prevV2 = window.localStorage.getItem('kiki_voice_style_v2');
    if (prevV2) return normalizeKikiVoiceStyle(prevV2);

    const legacyDirect = window.localStorage.getItem('kiki_voice_style_v1');
    if (legacyDirect) return normalizeKikiVoiceStyle(legacyDirect);

    const rawProfile = window.localStorage.getItem('kiki_user_profile_v1');
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile) as { voiceStyle?: string };
      if (parsed?.voiceStyle) {
        return normalizeKikiVoiceStyle(parsed.voiceStyle);
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return 'child_boy';
}

let audioCtx: AudioContext | null = null;
let activeSpeakTimerId: number | null = null;
let pendingSpeechDelayTimerId: number | null = null;
let activeVoiceStyle: KikiVoiceStyle = readPersistedVoiceStyle();
let activeAudioElement: HTMLAudioElement | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeSpeakAbortController: AbortController | null = null;
let activeSpeakRequestId = 0;

let staticManifestPromise: Promise<StaticUzbekManifest | null> | null = null;
let staticManifestCache: StaticUzbekManifest | null = null;

const memoryAudioCache = new Map<string, string>();
const inflightPrefetches = new Map<string, Promise<void>>();
const loggedFallbackNotices = new Set<string>();

let voiceStatus: UzVoiceStatusSnapshot = {
  lastSource: null,
  lastStyle: activeVoiceStyle,
  lastText: '',
  lastSlug: '',
  lastNotice: null,
};
let isCurrentlySpeaking = false;
const statusListeners = new Set<(snapshot: UzVoiceStatusSnapshot) => void>();
const speakingListeners = new Set<(speaking: boolean) => void>();

function setSpeakingState(speaking: boolean) {
  if (isCurrentlySpeaking === speaking) return;
  isCurrentlySpeaking = speaking;
  speakingListeners.forEach((listener) => {
    try {
      listener(speaking);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getIsUzVoiceSpeaking(): boolean {
  return isCurrentlySpeaking;
}

export function subscribeUzVoiceSpeaking(
  listener: (speaking: boolean) => void
): () => void {
  speakingListeners.add(listener);
  return () => speakingListeners.delete(listener);
}

function updateStatus(patch: Partial<UzVoiceStatusSnapshot>) {
  voiceStatus = { ...voiceStatus, ...patch };
  statusListeners.forEach((listener) => {
    try {
      listener(voiceStatus);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getUzVoiceStatus(): UzVoiceStatusSnapshot {
  return voiceStatus;
}

export function subscribeUzVoiceStatus(
  listener: (snapshot: UzVoiceStatusSnapshot) => void
): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function logFallbackOnce(key: string, message: string) {
  if (loggedFallbackNotices.has(key)) return;
  loggedFallbackNotices.add(key);
  console.debug(`[uzVoiceService] ${message}`);
}

export function setKikiVoiceStyle(style: KikiVoiceStyle | string): void {
  const normalized = normalizeKikiVoiceStyle(style);
  activeVoiceStyle = normalized;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KIKI_VOICE_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage write errors
    }
  }
}

export function getKikiVoiceStyle(): KikiVoiceStyle {
  const persisted = readPersistedVoiceStyle();
  if (persisted !== activeVoiceStyle) {
    activeVoiceStyle = persisted;
  }
  return activeVoiceStyle;
}

export function getActiveKikiVoiceConfig(
  overrideStyle?: KikiVoiceStyle | string
): KikiVoiceProfileConfig {
  const style = overrideStyle ? normalizeKikiVoiceStyle(overrideStyle) : getKikiVoiceStyle();
  return KIKI_VOICE_PROFILES[style];
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function unlockUzAudio(): void {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
    } catch {
      // Ignore
    }
  }
}

// Auto-unlock audio cleanly on the user's very first interaction anywhere in the app
if (typeof window !== 'undefined') {
  const unlockOnce = () => {
    unlockUzAudio();
  };
  window.addEventListener('pointerdown', unlockOnce, { passive: true });
  window.addEventListener('keydown', unlockOnce, { passive: true });
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
    } catch {
      // Ignore
    }
  }
}

function cacheInMemory(cacheKey: string, dataUrl: string): void {
  if (memoryAudioCache.size >= 140) {
    const oldest = memoryAudioCache.keys().next().value;
    if (typeof oldest === 'string') {
      memoryAudioCache.delete(oldest);
    }
  }
  memoryAudioCache.set(cacheKey, dataUrl);
}

async function readFromBrowserCache(cacheKey: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    const cache = await window.caches.open(CACHE_STORAGE_NAME);
    const reqUrl = `/__uz_voice_cache__/${encodeURIComponent(cacheKey)}`;
    const matched = await cache.match(reqUrl);
    if (!matched) return null;
    const text = await matched.text();
    if (text.startsWith('data:audio/')) {
      cacheInMemory(cacheKey, text);
      return text;
    }
  } catch {
    // Ignore CacheStorage restriction errors
  }
  return null;
}

async function writeToBrowserCache(cacheKey: string, dataUrl: string): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await window.caches.open(CACHE_STORAGE_NAME);
    const reqUrl = `/__uz_voice_cache__/${encodeURIComponent(cacheKey)}`;
    await cache.put(
      reqUrl,
      new Response(dataUrl, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    );
  } catch {
    // Ignore CacheStorage quota/restriction errors
  }
}

async function loadStaticManifest(): Promise<StaticUzbekManifest | null> {
  if (typeof window === 'undefined') return null;
  if (staticManifestCache) return staticManifestCache;
  if (!staticManifestPromise) {
    staticManifestPromise = fetch(STATIC_MANIFEST_URL, { cache: 'force-cache' })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = (await res.json()) as StaticUzbekManifest;
        staticManifestCache = json;
        return json;
      })
      .catch(() => null);
  }
  return staticManifestPromise;
}

async function resolveStaticAssetDataUrl(
  slug: string,
  style: KikiVoiceStyle
): Promise<string | null> {
  const staticKey = `static:${style}:${slug}`;
  const inMem = memoryAudioCache.get(staticKey);
  if (inMem) return inMem;

  const manifest = await loadStaticManifest();
  const entries = manifest?.entries;
  if (!entries) return null;

  const rawPath = entries[style]?.[slug] || entries.shared?.[slug];
  if (!rawPath) return null;

  const basePath = (manifest?.basePath || '/audio/uz').replace(/\/+$/, '');
  const assetUrl = rawPath.startsWith('/') || rawPath.startsWith('http')
    ? rawPath
    : `${basePath}/${rawPath.replace(/^\/+/, '')}`;

  try {
    const res = await fetch(assetUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Blob read failed'));
      };
      reader.onerror = () => reject(new Error('Blob read error'));
      reader.readAsDataURL(blob);
    });
    cacheInMemory(staticKey, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

function getAvailableVoicesAsync(timeoutMs = 240): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }
  const initial = window.speechSynthesis.getVoices();
  if (initial.length > 0) {
    return Promise.resolve(initial);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener?.('voiceschanged', onChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    const onChanged = () => finish();
    window.speechSynthesis.addEventListener?.('voiceschanged', onChanged);
    window.setTimeout(finish, timeoutMs);
  });
}

function isDisallowedHarshOrAdultVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return /(emel|yelda|filiz|zira|samantha|victoria|alice|milena|karen|moira|tessa|fiona|allison|ava|susan|anna|elena|olga|irina|katya|helena|sabina|david|mark|george|paul|tolga|mehmet|ahmet|baritone|bass|adult|woman|lady|female|google)/i.test(
    name
  );
}

function isPitchResponsiveVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  if (/(child|kid|junior|youth|little|young)/i.test(name)) return true;
  if (voice.localService && !/google/i.test(name)) return true;
  return false;
}

function selectGenderMatchedVoice(
  voices: SpeechSynthesisVoice[],
  style: KikiVoiceStyle
): SpeechSynthesisVoice {
  const boyHint = /(boy|male|man|pavel|yuri|dmitr|maksim|kemal|emre|murat|ali|umar|aziz|bek)/i;
  const girlHint = /(girl|female|child|kid|ayse|zeynep|elif|leyla|gul|madina|darya|svetlana|irina|tatyana)/i;
  const preferred = voices.find((v) =>
    style === 'child_girl' ? girlHint.test(v.name) : boyHint.test(v.name)
  );
  if (preferred) return preferred;
  if (style === 'child_girl' && voices.length > 1) return voices[1];
  return voices[0];
}

/**
 * Strict Uzbek voice policy: NEVER permit English, French, German, or harsh/adult
 * remote female browser voices when speaking Uzbek. Only genuine Uzbek (`uz*`) voices
 * or soft pitch-responsive Turkic (`tr`/`az`/`kk`/`ky`) voices are allowed.
 */
function pickStrictlyValidBrowserVoice(
  voices: SpeechSynthesisVoice[],
  normalizedLang: 'uz-UZ' | 'ru-RU',
  style: KikiVoiceStyle
): { voice: SpeechSynthesisVoice; lang: string; mode: 'uz' | 'turkic' | 'ru' } | null {
  if (normalizedLang === 'ru-RU') {
    const ruVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('ru') &&
        isPitchResponsiveVoice(v) &&
        !isDisallowedHarshOrAdultVoice(v)
    );
    if (ruVoices.length === 0) return null;
    const chosen = selectGenderMatchedVoice(ruVoices, style);
    return { voice: chosen, lang: chosen.lang, mode: 'ru' };
  }

  const uzVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('uz') &&
      !isDisallowedHarshOrAdultVoice(v)
  );
  if (uzVoices.length > 0) {
    const chosen = selectGenderMatchedVoice(uzVoices, style);
    return { voice: chosen, lang: chosen.lang || 'uz-UZ', mode: 'uz' };
  }

  const turkicVoices = voices.filter((v) => {
    const langLower = v.lang.toLowerCase();
    const isTurkic =
      langLower.startsWith('tr') ||
      langLower.startsWith('az') ||
      langLower.startsWith('kk') ||
      langLower.startsWith('ky');
    return isTurkic && isPitchResponsiveVoice(v) && !isDisallowedHarshOrAdultVoice(v);
  });
  if (turkicVoices.length > 0) {
    const chosen = selectGenderMatchedVoice(turkicVoices, style);
    return { voice: chosen, lang: chosen.lang || 'tr-TR', mode: 'turkic' };
  }

  return null;
}

/**
 * Gentle, soft harmonic Uzbek syllable chime used strictly as a clean non-breaking
 * preview fallback when neither static Uzbek audio files, TTS API, nor a genuine
 * Uzbek voice is present — avoiding jarring foreign English or harsh female voices.
 */
function playGentleUzbekCadence(
  text: string,
  style: KikiVoiceStyle,
  slug: string,
  reason: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  const notice = `Mahalliy o‘zbekcha bola ovozi zaxira rejimi faol (${reason}). Tayyor audio fayl uchun /audio/uz/${style}/${slug}.wav qo‘shilishi mumkin.`;
  logFallbackOnce(`${style}:${slug}:${reason}`, notice);
  updateStatus({
    lastSource: 'cadence_fallback',
    lastStyle: style,
    lastText: text,
    lastSlug: slug,
    lastNotice: notice,
  });

  const ctx = getSharedAudioContext();
  const vowelMatches = text.toLowerCase().match(/[aeiouöü]/g) || ['a', 'a'];
  const syllableCount = Math.min(6, Math.max(1, vowelMatches.length));
  const isGirl = style === 'child_girl';
  const pitchFactor = isGirl ? 1.62 : 1.18;
  const stepSec = isGirl ? 0.17 : 0.15;

  const vowelPitchMap: Record<string, number> = {
    a: 392.0,
    e: 440.0,
    i: 523.25,
    o: 349.23,
    u: 329.63,
    ö: 370.0,
    ü: 493.88,
  };

  setSpeakingState(true);
  onStart?.();

  if (ctx) {
    try {
      const now = ctx.currentTime;
      for (let i = 0; i < syllableCount; i++) {
        const ch = vowelMatches[i] || 'a';
        const baseFreq = (vowelPitchMap[ch] || 392) * pitchFactor;
        const start = now + i * stepSec;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.linearRampToValueAtTime(
          baseFreq * (isGirl ? 1.06 : 1.03),
          start + 0.055
        );

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isGirl ? 1900 : 1450, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.065, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + stepSec - 0.01);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + stepSec);
      }
    } catch {
      // Ignore AudioContext restriction errors
    }
  }

  const totalMs = Math.max(460, Math.round(syllableCount * stepSec * 1000 + 160));
  if (activeSpeakTimerId !== null) {
    clearTimeout(activeSpeakTimerId);
  }
  activeSpeakTimerId = window.setTimeout(() => {
    activeSpeakTimerId = null;
    setSpeakingState(false);
    onEnd?.();
  }, totalMs);
}

async function speakWithStrictUzbekBrowserOrCadence(
  text: string,
  normalizedLang: 'uz-UZ' | 'ru-RU',
  style: KikiVoiceStyle,
  slug: string,
  reason: string,
  requestId: number,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  if (requestId !== activeSpeakRequestId) return;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const voices = await getAvailableVoicesAsync();
      if (requestId !== activeSpeakRequestId) return;

      const selected = pickStrictlyValidBrowserVoice(voices, normalizedLang, style);
      if (selected) {
        const textToSpeak =
          selected.mode === 'turkic'
            ? normalizeUzbekSpeechForTTS(text, 'turkic_webspeech')
            : selected.mode === 'uz'
              ? normalizeUzbekSpeechForTTS(text, 'gemini')
              : text.trim();

        pendingSpeechDelayTimerId = window.setTimeout(() => {
          pendingSpeechDelayTimerId = null;
          if (requestId !== activeSpeakRequestId) return;

          try {
            const liveConfig = getActiveKikiVoiceConfig(style);
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            activeUtterance = utterance;

            utterance.voice = selected.voice;
            utterance.lang = selected.lang;
            utterance.rate = liveConfig.rate;
            utterance.pitch = liveConfig.pitch;
            utterance.volume = liveConfig.volume;

            let finished = false;
            const finishOnce = () => {
              if (finished) return;
              finished = true;
              if (activeUtterance === utterance) {
                activeUtterance = null;
              }
              if (activeSpeakTimerId !== null) {
                clearTimeout(activeSpeakTimerId);
                activeSpeakTimerId = null;
              }
              setSpeakingState(false);
              onEnd?.();
            };

            utterance.onstart = () => {
              setSpeakingState(true);
              onStart?.();
            };
            utterance.onend = finishOnce;
            utterance.onerror = () => {
              finishOnce();
            };

            updateStatus({
              lastSource: 'uzbek_webspeech',
              lastStyle: style,
              lastText: text,
              lastSlug: slug,
              lastNotice: null,
            });
            setSpeakingState(true);
            onStart?.();
            window.speechSynthesis.speak(utterance);
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            const estimatedMs = Math.min(14000, Math.max(2200, text.length * 95));
            activeSpeakTimerId = window.setTimeout(finishOnce, estimatedMs);
          } catch {
            playGentleUzbekCadence(text, style, slug, reason, onStart, onEnd);
          }
        }, 55);
        return;
      }
    } catch {
      // Fall through cleanly to cadence fallback
    }
  }

  playGentleUzbekCadence(text, style, slug, reason, onStart, onEnd);
}

export function stopUzVoice(): void {
  activeSpeakRequestId += 1;
  setSpeakingState(false);

  if (activeSpeakAbortController) {
    try {
      activeSpeakAbortController.abort();
    } catch {
      // Ignore
    }
    activeSpeakAbortController = null;
  }
  if (pendingSpeechDelayTimerId !== null) {
    clearTimeout(pendingSpeechDelayTimerId);
    pendingSpeechDelayTimerId = null;
  }
  if (activeSpeakTimerId !== null) {
    clearTimeout(activeSpeakTimerId);
    activeSpeakTimerId = null;
  }
  if (activeBufferSource) {
    try {
      activeBufferSource.onended = null;
      activeBufferSource.stop();
      activeBufferSource.disconnect();
    } catch {
      // Ignore
    }
    activeBufferSource = null;
  }
  if (activeAudioElement) {
    try {
      activeAudioElement.onplay = null;
      activeAudioElement.onended = null;
      activeAudioElement.onerror = null;
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudioElement = null;
  }
  if (activeUtterance) {
    try {
      activeUtterance.onstart = null;
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
    } catch {
      // Ignore
    }
    activeUtterance = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

function getSpeechRequestPayloadText(
  text: string,
  normalizedLang: 'uz-UZ' | 'ru-RU'
): string {
  return normalizedLang === 'uz-UZ'
    ? normalizeUzbekSpeechForTTS(text, 'gemini') || normalizeUzbekOrthography(text)
    : text.trim();
}

export function prefetchUzVoice(
  text: string,
  speechLang: 'uz-UZ' | 'ru-RU' | Language = 'uz-UZ',
  overrideStyle?: KikiVoiceStyle
): void {
  if (typeof window === 'undefined' || !text.trim()) return;
  const normalizedLang: 'uz-UZ' | 'ru-RU' =
    speechLang === 'ru' || speechLang === 'ru-RU' ? 'ru-RU' : 'uz-UZ';
  const style = overrideStyle ? normalizeKikiVoiceStyle(overrideStyle) : getKikiVoiceStyle();
  const payloadText = getSpeechRequestPayloadText(text, normalizedLang);
  const slug = toUzbekAudioSlug(payloadText);
  const cacheKey = `v9:${style}:${normalizedLang}:${payloadText}`;

  if (memoryAudioCache.has(cacheKey) || inflightPrefetches.has(cacheKey)) {
    return;
  }

  const promise = (async () => {
    const staticAsset = await resolveStaticAssetDataUrl(slug, style);
    if (staticAsset) {
      cacheInMemory(cacheKey, staticAsset);
      return;
    }

    const browserCached = await readFromBrowserCache(cacheKey);
    if (browserCached) return;

    const res = await fetch('/api/kiki-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payloadText,
        voiceStyle: style,
        lang: normalizedLang,
        slug,
      }),
    });
    if (!res.ok) return;

    const data = (await res.json()) as {
      audioBase64?: string;
      mimeType?: string;
      fallback?: boolean;
    };
    if (data?.audioBase64 && !data.fallback) {
      const mime = data.mimeType || 'audio/wav';
      const dataUrl = `data:${mime};base64,${data.audioBase64}`;
      cacheInMemory(cacheKey, dataUrl);
      await writeToBrowserCache(cacheKey, dataUrl);
    }
  })()
    .catch(() => {})
    .finally(() => {
      inflightPrefetches.delete(cacheKey);
    });

  inflightPrefetches.set(cacheKey, promise);
}

export function speakUzVoice(
  text: string,
  speechLang: 'uz-UZ' | 'ru-RU' | Language = 'uz-UZ',
  onStart?: () => void,
  onEnd?: () => void,
  overrideStyle?: KikiVoiceStyle
): void {
  const normalizedLang: 'uz-UZ' | 'ru-RU' =
    speechLang === 'ru' || speechLang === 'ru-RU' ? 'ru-RU' : 'uz-UZ';
  const style: KikiVoiceStyle = overrideStyle
    ? normalizeKikiVoiceStyle(overrideStyle)
    : getKikiVoiceStyle();

  // Strictly cancel any playing or queued audio before starting a new utterance
  stopUzVoice();
  const requestId = activeSpeakRequestId;

  const payloadText = getSpeechRequestPayloadText(text, normalizedLang);
  if (!payloadText) {
    onEnd?.();
    return;
  }

  const slug = toUzbekAudioSlug(payloadText);
  const cacheKey = `v9:${style}:${normalizedLang}:${payloadText}`;
  const voiceConfig = getActiveKikiVoiceConfig(style);

  const playViaHtmlAudio = (
    dataUrl: string,
    sourceKind: UzVoiceSource
  ): void => {
    if (requestId !== activeSpeakRequestId) return;
    try {
      const audio = new Audio(dataUrl) as HTMLAudioElement & {
        preservesPitch?: boolean;
        mozPreservesPitch?: boolean;
        webkitPreservesPitch?: boolean;
      };
      audio.preservesPitch = false;
      audio.mozPreservesPitch = false;
      audio.webkitPreservesPitch = false;
      audio.playbackRate = voiceConfig.playbackPitchMultiplier;
      activeAudioElement = audio;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (activeAudioElement === audio) {
          activeAudioElement = null;
        }
        setSpeakingState(false);
        onEnd?.();
      };
      audio.onplay = () => {
        updateStatus({
          lastSource: sourceKind,
          lastStyle: style,
          lastText: text,
          lastSlug: slug,
          lastNotice: null,
        });
        setSpeakingState(true);
        onStart?.();
      };
      audio.onended = finish;
      audio.onerror = () => {
        finish();
        if (requestId === activeSpeakRequestId) {
          void speakWithStrictUzbekBrowserOrCadence(
            text,
            normalizedLang,
            style,
            slug,
            'audio_element_error',
            requestId,
            onStart,
            onEnd
          );
        }
      };
      setSpeakingState(true);
      onStart?.();
      audio.play().catch(() => {
        finish();
        if (requestId === activeSpeakRequestId) {
          void speakWithStrictUzbekBrowserOrCadence(
            text,
            normalizedLang,
            style,
            slug,
            'autoplay_blocked',
            requestId,
            onStart,
            onEnd
          );
        }
      });
    } catch {
      void speakWithStrictUzbekBrowserOrCadence(
        text,
        normalizedLang,
        style,
        slug,
        'audio_init_error',
        requestId,
        onStart,
        onEnd
      );
    }
  };

  const playDataUrl = async (
    dataUrl: string,
    sourceKind: UzVoiceSource
  ): Promise<void> => {
    if (requestId !== activeSpeakRequestId) return;

    const ctx = getSharedAudioContext();
    const base64Part = dataUrl.split(',')[1];
    if (ctx && base64Part) {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        if (requestId !== activeSpeakRequestId) return;

        const binary = window.atob(base64Part);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        if (requestId !== activeSpeakRequestId) return;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = voiceConfig.playbackPitchMultiplier;
        source.connect(ctx.destination);
        activeBufferSource = source;

        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          if (activeBufferSource === source) {
            activeBufferSource = null;
          }
          setSpeakingState(false);
          onEnd?.();
        };

        source.onended = finish;
        updateStatus({
          lastSource: sourceKind,
          lastStyle: style,
          lastText: text,
          lastSlug: slug,
          lastNotice: null,
        });
        setSpeakingState(true);
        onStart?.();
        source.start(0);
        return;
      } catch {
        // Fall through to HTMLAudioElement playback
      }
    }

    playViaHtmlAudio(dataUrl, sourceKind);
  };

  const resolveAndPlay = async (): Promise<void> => {
    if (requestId !== activeSpeakRequestId) return;

    // Tier 1: Local/static Uzbek audio assets manifest (/audio/uz/manifest.json)
    const staticAsset = await resolveStaticAssetDataUrl(slug, style);
    if (requestId !== activeSpeakRequestId) return;
    if (staticAsset) {
      await playDataUrl(staticAsset, 'static_asset');
      return;
    }

    // Wait for matching in-flight prefetch if one is already running
    const pendingPrefetch = inflightPrefetches.get(cacheKey);
    if (pendingPrefetch) {
      await pendingPrefetch;
      if (requestId !== activeSpeakRequestId) return;
    }

    // Tier 2A: In-memory & persistent CacheStorage cache
    const cachedMemory = memoryAudioCache.get(cacheKey);
    if (cachedMemory) {
      await playDataUrl(cachedMemory, 'uzbek_tts_api');
      return;
    }

    const cachedBrowser = await readFromBrowserCache(cacheKey);
    if (requestId !== activeSpeakRequestId) return;
    if (cachedBrowser) {
      await playDataUrl(cachedBrowser, 'uzbek_tts_api');
      return;
    }

    // Tier 2B: Uzbek-capable Server TTS API (/api/kiki-tts)
    const controller = new AbortController();
    activeSpeakAbortController = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('/api/kiki-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          text: payloadText,
          voiceStyle: style,
          lang: normalizedLang,
          slug,
        }),
      });
      clearTimeout(timeoutId);
      if (activeSpeakAbortController === controller) {
        activeSpeakAbortController = null;
      }
      if (requestId !== activeSpeakRequestId) return;

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      const data = (await res.json()) as {
        audioBase64?: string;
        mimeType?: string;
        fallback?: boolean;
        reason?: string;
        provider?: string;
      };

      if (data?.audioBase64 && !data.fallback) {
        const mime = data.mimeType || 'audio/wav';
        const dataUrl = `data:${mime};base64,${data.audioBase64}`;
        cacheInMemory(cacheKey, dataUrl);
        void writeToBrowserCache(cacheKey, dataUrl);
        const srcKind: UzVoiceSource =
          data.provider === 'static_audio_base' ? 'static_asset' : 'uzbek_tts_api';
        await playDataUrl(dataUrl, srcKind);
        return;
      }

      await speakWithStrictUzbekBrowserOrCadence(
        text,
        normalizedLang,
        style,
        slug,
        data?.reason || 'tts_fallback',
        requestId,
        onStart,
        onEnd
      );
    } catch (err) {
      clearTimeout(timeoutId);
      if (activeSpeakAbortController === controller) {
        activeSpeakAbortController = null;
      }
      if (requestId !== activeSpeakRequestId) return;
      const errReason =
        err instanceof Error ? err.message : 'network_or_timeout';
      await speakWithStrictUzbekBrowserOrCadence(
        text,
        normalizedLang,
        style,
        slug,
        errReason,
        requestId,
        onStart,
        onEnd
      );
    }
  };

  void resolveAndPlay();
}

import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  normalizeUzbekSpeechForTTS,
  toUzbekAudioSlug,
} from './src/utils/uzbekSpeechNormalizer';
import { shapeChildVoiceWav } from './server/voiceDsp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  message?: string;
  history?: ChatHistoryMessage[];
  persona?: 'child' | 'parent_therapist';
  useSearch?: boolean;
  fastMode?: boolean;
}

function getSystemInstruction(persona: 'child' | 'parent_therapist'): string {
  if (persona === 'parent_therapist') {
    return (
      "Sen 'So‘zApp' ekotizimidagi Kiki AI yordamchisi va professional logoped-maslahatchisan. " +
      "Foydalanuvchi nima yozsa (salomlashish, xayrlashish masalan 'hayr'/'xayr', minnatdorchilik, ilova qanday ishlashi, bola tarbiyasi " +
      "yoki umumiy savollar), o‘sha xabarning ohangiga mos tabiiy, samimiy va aniq javob ber. " +
      "Qisqa xayrlashuv yoki rahmatga qisqa va iliq javob qaytar, keraksiz shablon qo‘shma. " +
      "Faqat nutq rivoji, tovushlar (R, S, Sh, L, Ch, J/Z), disleksiya yoki mashqlar haqida so‘ralganda amaliy logopedik tavsiyalar ber. Har doim tabiiy o‘zbek tilida yoz."
    );
  }

  return (
    "Sen Kikisan — 'So‘zApp' ilovasidagi mehribon, quvnoq va aqlli ko‘k-oq panda do‘st va AI nutq yordamchisi. " +
    "Sening shioring: 'Kiki bilan kichik harakat — katta natija'. " +
    "MUHIM QOIDA: Foydalanuvchi Senga nima yozsa (masalan: 'salom', 'hayr', 'xayr', 'qalaysan', 'ha', 'xo‘p', ertak so‘rasa, maktab, hayvonlar, " +
    "o‘yinlar yoki istalgan boshqa mavzuda savol bersa), aynan o‘sha xabarga tabiiy, iliq, jonli va bola tushunadigan " +
    "o‘zbek tilida javob ber! Masalan 'hayr' desa samimiy xayrlash, 'salom' desa quvnoq salomlash. " +
    "Har bir javobda majburan R, S, Sh harflari haqida shablon ma’lumot berma — " +
    "faqat foydalanuvchi harflar, tovushlar yoki talaffuz haqida so‘ragandagina tovush mashqlarini tushuntir."
  );
}

function buildConversationalFallback(
  userMessage: string,
  persona: 'child' | 'parent_therapist'
): string {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase().replace(/[!?.]+$/g, '').trim();

  // 1. Farewells (hayr, xayr, ko'rishguncha, bye, poka)
  if (
    /^(hayr|xayr|xayrli tun|hayrli tun|ko‘rishguncha|korishguncha|poka|bye|goodbye|sog‘ bo‘ling|sog‘ bo‘l|omon bo‘l)/i.test(
      lower
    ) ||
    /\b(hayr|xayr|ko‘rishguncha|korishguncha|bye|poka)\b/i.test(lower)
  ) {
    if (persona === 'parent_therapist') {
      return (
        "Xayr, salomat bo‘ling! 🌟 Farzandingiz bilan mashqlarda omad tilayman. Istalgan vaqtda yana savollar bilan qaytishingiz mumkin!"
      );
    }
    return (
      "Xayr, aziz do‘stim! 🐼 Bugun sen bilan suhbatlashish juda maroqli bo‘ldi! " +
      "Ertaga yana ko‘rishamiz — «Kiki bilan kichik harakat — katta natija»! 👋💙"
    );
  }

  // 2. Greetings (salom, assalomu alaykum, etc.)
  if (
    /\b(salom|assalom|assalomu|alaykum|xayrli|hayrli|privet|hello|hi)\b/i.test(lower)
  ) {
    if (persona === 'parent_therapist') {
      return (
        "Va alaykum assalom! So‘zApp ekotizimiga xush kelibsiz 🐼\n" +
        "Men Kiki AI maslahatchisiman. Farzandingizning nutq rivoji, haftalik natijalari yoki istalgan savolingiz bo‘yicha yordam berishga tayyorman. Bugun qaysi mavzuda suhbatlashamiz?"
      );
    }
    return (
      "Salom, aziz do‘stim! 🐼 Men Kikiman — So‘zApp’dagi quvnoq do‘sting!\n" +
      "Bugun kayfiyating qanday? Menga istalgan savolingni berishing, birga suhbatlashishing yoki xohlasang o‘yinlar va tovush mashqlari haqida so‘rashing mumkin!"
    );
  }

  // 3. Brief acknowledgments & conversational fillers (ha, yo'q, xo'p, ok, mayli)
  if (/^(ha|xa|yo‘q|yoq|xo‘p|xop|hop|mayli|ok|oka|tushundim|yaxshi|albatta|bo‘ldi|boldi)$/i.test(lower)) {
    if (lower === 'yo‘q' || lower === 'yoq') {
      return persona === 'parent_therapist'
        ? "Tushunarli! Agar boshqa mavzuda savol yoki yordam kerak bo‘lsa, bemalol yozing."
        : "Xo‘p, hechqisi yo‘q! 😊 Yana qiziq narsa haqida gaplashmoqchi bo‘lsang, men shu yerdaman!";
    }
    return persona === 'parent_therapist'
      ? "Ajoyib! Yana biror savolingiz bo‘lsa, marhamat, yozing."
      : "Zo‘r! 🐼 Yana nima haqida gaplashamiz yoki qaysi o‘yinni muhokama qilamiz?";
  }

  // 4. How are you / status questions
  if (
    /(qalaysan|qandaysan|yaxshimisiz|ishlar|nima gap|ahvoling|tuzukmisiz|nima qilyapsan|nima qilayapsan)/i.test(
      lower
    )
  ) {
    return persona === 'parent_therapist'
      ? "Rahmat, hammasi a’lo! Bolalarning nutqini rivojlantirish va ota-onalarga yordam berish uchun doim tayyorman. Sizda qanday savol bor?"
      : "Menda hammasi zo‘r, rahmat! 🐼 Bugun So‘zlar shahrida yangi binolarni ko‘zdan kechirib, do‘stlarim bilan suhbatlashib o‘tiribman. O‘zingning ishlaring va darslaring qanday ketyapti?";
  }

  // 5. Identity & What can you do / App questions
  if (
    /(kimsan|kim|isming|nima qila olasan|so‘zapp|sozapp|ilova|dastur|yordam)/i.test(lower)
  ) {
    return (
      "Men Kikiman — So‘zApp ilovasining bosh qahramoni va aqlli suhbatdoshingman! 🐼\n\n" +
      "Bu yerda biz birga:\n" +
      "• «Asosiy» bo‘limida 25 so‘zlik imtihon, darslar va haftalik turnirga kiramiz,\n" +
      "• «So‘zlar shahri»da binolar ochib +20 tadan tanga yig‘amiz,\n" +
      "• «O‘yinlar» bo‘limida 30 bosqichli qiziqarli o‘yinlarni o‘ynaymiz,\n" +
      "• Shu chatda esa istalgan mavzuda gaplasha olamiz!"
    );
  }

  // 6. Thanks / Praise
  if (/(rahmat|raxmat|tashakkur|zo‘r|zor|ajoyib|barakalla|super|gap yo‘q)/i.test(lower)) {
    return persona === 'parent_therapist'
      ? "Arzimaydi! Har qanday savolingiz bo‘lsa bemalol murojaat qiling — birgalikda ajoyib natijalarga erishamiz."
      : "Arzimaydi, do‘stim! 🌟 Sen juda aqlli va tirishqoqsan. Yana nimani muhokama qilamiz?";
  }

  // 7. Stories / Jokes / Entertainment requests
  if (/(ertak|hikoya|latifa|qiziq|kulgi|topishmoq)/i.test(lower)) {
    return (
      "Mana senga Kikidan kichkina hikoya: 🐼✨\n\n" +
      "Bir kuni So‘zlar shahridagi ko‘k panda Kiki daraxt ostida qizil olmani ko‘rib qolibdi. " +
      "Olma shamolda sekin tebranib: «Meni aniq va chiroyli aytgan bolaga do‘st bo‘laman!» debdi. " +
      "Shunda Kiki va uning do‘stlari birga kulishib, eng chiroyli so‘zlar bayramini boshlab yuborishibdi!\n\n" +
      "Agar xohlasang, topishmoq ham aytib beraman!"
    );
  }

  // 8. Games / City / Coins / Tournament questions
  if (/(o‘yin|oyin|shahar|bino|tanga|yulduz|turnir|imtihon|dars)/i.test(lower)) {
    return (
      "«O‘yinlar» bo‘limida 30 ta bosqichli ilon izi yo‘li va 4 xil mini-o‘yin kutmoqda! 🎮\n" +
      "«So‘zlar shahri»da esa har bir yangi bino senga +20 tanga beradi, «Asosiy» bo‘limida esa Imtihon, Darslar va Turnir joylashgan!"
    );
  }

  // 9. Tired / Difficulty / Motivation
  if (/(charchadim|qiyin|zerikdim|xafa|uddalay olmayman|qo‘rqyapman)/i.test(lower)) {
    return (
      "Hechqisi yo‘q, do‘stim! Hatto eng tez yuguradigan sportchilar ham biroz dam olishadi. 💙\n" +
      "Esingdami shiorimiz: «Kiki bilan kichik harakat — katta natija»! Bir stakan suv ichib, chuqur nafas ol — xohlasang hozir shunchaki suhbatlashamiz yoki oson o‘yin o‘ynaymiz."
    );
  }

  // 10. Bilingual R vs Р comparison (ONLY when explicitly asked)
  if (
    /(ruscha|o‘zbekcha|farqi|ikkalasi|ikki tilli)/i.test(lower) &&
    /(r|р|tovush|harf|talaffuz)/i.test(lower)
  ) {
    return (
      "O‘zbekcha «R» va ruscha «Р» o‘rtasidagi asosiy farq til uchi tebranishida:\n\n" +
      "1. O‘zbekcha «R» (masalan: Arra, Bahor) mayinroq bo‘lib, til uchi yuqori tanglayga 1–2 marta yengil tegadi.\n" +
      "2. Ruscha «Р» (masalan: Ракета, Рыба) kuchliroq va jarangdor bo‘lib, til uchi 3–4 marta tez titraydi.\n\n" +
      "Mashq: Avval «dr-dr» deb havo chiqaring, so‘ng «Arra — Ракета» juftligini navbat bilan ayting!"
    );
  }

  // 11. Explicit pronunciation/letter questions ONLY
  const asksAboutPronunciation =
    /(tovush|harf|talaffuz|artikul|logoped|bo‘g‘in|mashq)/i.test(lower);

  if (asksAboutPronunciation) {
    if (/\bsh\b|«sh»|"sh"|ш/i.test(lower)) {
      return (
        "«Sh» tovushini tiniq chiqarish uchun oddiy mashq:\n\n" +
        "• Lablaringni oldinga yumaloqlab biroz cho‘z.\n" +
        "• Til uchini yuqori tishlar orqasiga ko‘tar (tishlarga tegmasin).\n" +
        "• Iliq havo oqimini shoshilmasdan chiqar: «Sh-sh-sh».\n\n" +
        "Sinab ko‘r: QU-YOSH, SHA-MOL, MA-SHI-NA!"
      );
    }
    if (/\bch\b|«ch»|"ch"|ч/i.test(lower)) {
      return (
        "«Ch» tovushini aniq aytish uchun:\n\n" +
        "• Til uchini yuqori tanglayga bosib, havoni qisqa va keskin och.\n" +
        "• «Ch» ni «Sh» ga cho‘zib yuborma — u qisqa va jarangli bo‘lishi kerak.\n\n" +
        "Mashq so‘zlari: CHOY, OL-CHA, CHU-MO-LI, CHI-ROQ."
      );
    }
    if (/\bs\b|«s»|"s"|с/i.test(lower)) {
      return (
        "«S» tovushi mashqi:\n\n" +
        "• Tishlaringni yaqinlashtirib, yengil tabassum qil.\n" +
        "• Til uchini pastki tishlar orqasida tutib, salqin havo chiqar: «S-s-s».\n\n" +
        "So‘zlar: SO-AT, SAB-ZI, OS-MON, A-SAL."
      );
    }
    if (/\bl\b|«l»|"l"|л/i.test(lower)) {
      return (
        "«L» tovushini mayin talaffuz qilish siri:\n\n" +
        "• Til uchini yuqori old tishlarning orqa tomoniga yumshoq bos.\n" +
        "• «La-lo-lu» bo‘g‘inlarini kuylagandek ayt: LO-LA, QA-LAM, OL-MA, BU-LUT."
      );
    }
    if (/\b(j|z)\b|«j»|«z»|"j"|"z"/i.test(lower)) {
      return (
        "«J» va «Z» jarangli tovushlari mashqi:\n\n" +
        "• Qo‘lingni bo‘g‘zingga qo‘yib «Z-z-z» va «J-j-j» de — ovoz tebranishini his qilasan!\n" +
        "• Mashq so‘zlari: JO‘-JA, ZEB-RA, U-ZUM, JI-RA-FA."
      );
    }
    if (/\br\b|«r»|"r"|р/i.test(lower)) {
      return (
        "«R» tovushi uchun Kikidan tezkor mashq:\n\n" +
        "1. Til uchini yuqori tishlar orqasiga qo‘yib «D-d-d» deb tez takrorla.\n" +
        "2. Nafas oqimi bilan «Dr-r-r» deb titrat.\n" +
        "3. Bo‘g‘inlab ayt: AR-RA, DA-RAXT, BA-RA-BAN, BA-HOR!"
      );
    }
  }

  // 12. General natural conversation without robotic echoing of short messages
  if (persona === 'parent_therapist') {
    return (
      "Fikringiz uchun rahmat! Har kuni farzandingiz bilan 10–15 daqiqa iliq suhbat qurish va So‘zApp mashqlarini muntazam bajarish nutq ravonligini sezilarli oshiradi. " +
      "Aniq bir yosh, tovush yoki mashq bo‘yicha savolingiz bo‘lsa, bemalol yozib qoldiring!"
    );
  }

  return (
    "Men seni diqqat bilan tinglayapman! 🐼 " +
    "Menga maktab, sevimli mashg‘ulotlaring, hayvonlar, ertaklar yoki xohlagan mavzuying haqida batafsilroq yozib ber — jon deb suhbatlashamiz!"
  );
}

const AUTH_SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

interface TelegramBinding {
  chatId: number;
  username?: string;
  firstName?: string;
  linkedAt: number;
}

interface PendingOtpSession {
  sessionId: string;
  linkRef: string;
  phone: string;
  codeHash: string;
  salt: string;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
  linked: boolean;
  deliveredViaTelegram: boolean;
  previewCode?: string;
  createdAt: number;
}

interface ActiveAuthSession {
  token: string;
  phone: string;
  linkedTelegram: boolean;
  telegramUsername?: string;
  createdAt: number;
  expiresAt: number;
}

interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id?: number;
      type?: string;
    };
    from?: {
      id?: number;
      username?: string;
      first_name?: string;
    };
    contact?: {
      phone_number?: string;
      user_id?: number;
    };
  };
}

const phoneToChatMap = new Map<string, TelegramBinding>();
const pendingOtpSessions = new Map<string, PendingOtpSession>();
const linkRefToSessionId = new Map<string, string>();
const activeAuthSessions = new Map<string, ActiveAuthSession>();
const processedUpdateIds = new Set<number>();

let discoveredBotUsername = '';
let botUsernameDiscoveryPromise: Promise<string> | null = null;
let telegramUpdateOffset = 0;
let telegramPollingActive = false;
let telegramPollingStarted = false;
let activePollAbortController: AbortController | null = null;
let activePollCyclePromise: Promise<void> | null = null;

function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
}

function getTelegramBotUsername(): string {
  if (discoveredBotUsername) return discoveredBotUsername;
  const raw = process.env.TELEGRAM_BOT_USERNAME?.trim() || 'SozAppKikiBot';
  return raw.replace(/^@/, '') || 'SozAppKikiBot';
}

function isLiveTelegramConfigured(): boolean {
  const token = getTelegramBotToken();
  return token.length > 10 && token !== 'MY_TELEGRAM_BOT_TOKEN';
}

function shouldUseTelegramWebhook(): boolean {
  if (!isLiveTelegramConfigured()) return false;
  if (process.env.TELEGRAM_USE_WEBHOOK === 'true') return true;
  if (process.env.TELEGRAM_USE_WEBHOOK === 'false') return false;

  const appUrl = process.env.APP_URL?.trim() || '';
  if (
    process.env.NODE_ENV === 'production' &&
    appUrl.startsWith('https://') &&
    appUrl !== 'MY_APP_URL' &&
    !appUrl.includes('localhost') &&
    !appUrl.includes('ais-dev-') &&
    !appUrl.includes('ais-pre-')
  ) {
    return true;
  }
  return false;
}

function normalizeUzPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits}`;
  }
  return null;
}

function formatUzPhone(normalized: string): string {
  const digits = normalized.replace(/\D/g, '');
  if (digits.length !== 12) return normalized;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

function maskUzPhone(normalized: string): string {
  const formatted = formatUzPhone(normalized);
  const parts = formatted.split(' ');
  if (parts.length !== 5) return formatted;
  return `${parts[0]} ${parts[1]} *** ** ${parts[4]}`;
}

function hashOtpCode(salt: string, code: string): string {
  return crypto
    .createHmac('sha256', AUTH_SESSION_SECRET)
    .update(`${salt}:${code}`)
    .digest('hex');
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function issueNewOtpForSession(session: PendingOtpSession): string {
  const code = generateSixDigitOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  session.codeHash = hashOtpCode(salt, code);
  session.salt = salt;
  session.expiresAt = now + OTP_TTL_MS;
  session.resendAvailableAt = now + RESEND_COOLDOWN_MS;
  session.attempts = 0;
  session.previewCode = isLiveTelegramConfigured() ? undefined : code;
  return code;
}

function cleanupExpiredAuthState(): void {
  const now = Date.now();
  for (const [id, session] of pendingOtpSessions.entries()) {
    if (session.expiresAt < now) {
      pendingOtpSessions.delete(id);
      linkRefToSessionId.delete(session.linkRef);
    }
  }
  for (const [token, authSession] of activeAuthSessions.entries()) {
    if (authSession.expiresAt < now) {
      activeAuthSessions.delete(token);
    }
  }
}

function extractBearerToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (typeof header !== 'string') return null;
  const match = /^Bearer\s+([A-Za-z0-9._-]+)$/.exec(header.trim());
  return match ? match[1] : null;
}

async function sendTelegramBotMessage(
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<{ ok: boolean; errorCode?: number; description?: string }> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, errorCode: 0, description: 'Bot token not configured' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; error_code?: number; description?: string }
      | null;
    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        errorCode: data?.error_code ?? response.status,
        description: data?.description || 'Telegram API error',
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      description: err instanceof Error ? err.message : 'Network error',
    };
  }
}

function buildTelegramOtpHtml(phone: string, code: string): string {
  const formatted = formatUzPhone(phone);
  return (
    `🐼 <b>Salom! So‘zApp kirish kodingiz:</b> <code>${code}</code>\n\n` +
    `📱 Telefon raqamingiz: <b>${formatted}</b>\n` +
    `⏱ Kod 5 daqiqa davomida amal qiladi.\n` +
    `Kodni saytdagi 6 ta katakchaga kiriting yoki nusxalab joylashtiring!`
  );
}

async function discoverTelegramBotUsername(): Promise<string> {
  if (discoveredBotUsername) return discoveredBotUsername;
  if (!isLiveTelegramConfigured()) return getTelegramBotUsername();
  if (botUsernameDiscoveryPromise) return botUsernameDiscoveryPromise;

  botUsernameDiscoveryPromise = (async () => {
    const token = getTelegramBotToken();
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; result?: { username?: string } }
        | null;
      if (res.ok && data?.ok && data.result?.username) {
        discoveredBotUsername = data.result.username.replace(/^@/, '');
      }
    } catch {
      // Fallback to env/default username
    } finally {
      botUsernameDiscoveryPromise = null;
    }
    return getTelegramBotUsername();
  })();

  return botUsernameDiscoveryPromise;
}

async function deleteTelegramWebhookIfNeeded(): Promise<void> {
  const token = getTelegramBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: false }),
    });
  } catch {
    // Ignore transient errors
  }
}

async function fetchTelegramUpdatesBatch(timeoutSeconds: number): Promise<void> {
  const token = getTelegramBotToken();
  if (!token) return;

  const controller = new AbortController();
  activePollAbortController = controller;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        offset: telegramUpdateOffset,
        timeout: timeoutSeconds,
        allowed_updates: ['message'],
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; error_code?: number; result?: TelegramUpdate[] }
      | null;

    if (!response.ok || !data?.ok) {
      if (data?.error_code === 409) {
        await deleteTelegramWebhookIfNeeded();
      }
      return;
    }

    const updates = Array.isArray(data.result) ? data.result : [];
    for (const update of updates) {
      if (typeof update.update_id === 'number') {
        telegramUpdateOffset = Math.max(telegramUpdateOffset, update.update_id + 1);
      }
      await handleTelegramUpdate(update);
    }
  } catch {
    // Aborted intentionally or transient network error
  } finally {
    if (activePollAbortController === controller) {
      activePollAbortController = null;
    }
  }
}

function startTelegramPollingLoop(): void {
  if (telegramPollingStarted || !isLiveTelegramConfigured()) return;
  telegramPollingStarted = true;
  telegramPollingActive = true;

  const loop = async () => {
    while (telegramPollingActive) {
      const cycle = fetchTelegramUpdatesBatch(15);
      activePollCyclePromise = cycle;
      await cycle;
      activePollCyclePromise = null;
      if (telegramPollingActive) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  };

  void loop();
}

async function syncTelegramUpdatesNow(): Promise<void> {
  if (!isLiveTelegramConfigured()) return;

  // Ensure any blocking webhook is removed when explicitly checking getUpdates
  await deleteTelegramWebhookIfNeeded();

  // Interrupt an idle long-poll so we check immediately without 409 conflict
  if (activePollAbortController) {
    activePollAbortController.abort();
  }
  if (activePollCyclePromise) {
    await activePollCyclePromise.catch(() => undefined);
  }

  const immediateCycle = fetchTelegramUpdatesBatch(0);
  activePollCyclePromise = immediateCycle;
  await immediateCycle;
  activePollCyclePromise = null;

  // Ensure background polling is running in preview/fallback mode
  if (!telegramPollingStarted) {
    startTelegramPollingLoop();
  }
}

async function initializeTelegramTransport(): Promise<void> {
  if (!isLiveTelegramConfigured()) return;

  await discoverTelegramBotUsername();

  if (shouldUseTelegramWebhook()) {
    const token = getTelegramBotToken();
    const appUrl = process.env.APP_URL?.trim() || '';
    const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram/webhook`;
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || '';

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          ...(secretToken ? { secret_token: secretToken } : {}),
          allowed_updates: ['message'],
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && data?.ok) {
        console.log(`Telegram webhook ulandi: ${webhookUrl}`);
        return;
      }
    } catch {
      // Fall back to polling below
    }
  }

  // Preview/local/dev fallback: clear webhook and use single-flight getUpdates polling
  await deleteTelegramWebhookIfNeeded();
  startTelegramPollingLoop();
  console.log(`Telegram bot getUpdates polling faol (@${getTelegramBotUsername()})`);
}

async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  if (typeof update?.update_id === 'number') {
    if (processedUpdateIds.has(update.update_id)) return;
    processedUpdateIds.add(update.update_id);
    if (processedUpdateIds.size > 1000) {
      const oldest = processedUpdateIds.values().next().value;
      if (typeof oldest === 'number') {
        processedUpdateIds.delete(oldest);
      }
    }
  }

  const msg = update?.message;
  if (!msg || typeof msg.chat?.id !== 'number') return;

  const chatId = msg.chat.id;
  const username = msg.from?.username;
  const firstName = msg.from?.first_name;
  const text = typeof msg.text === 'string' ? msg.text.trim() : '';

  // 1. Handle /start <linkRef>
  if (text.startsWith('/start')) {
    const startMatch = /^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]+))?/i.exec(text);
    const startParam = startMatch?.[1]?.trim() || '';

    if (startParam && linkRefToSessionId.has(startParam)) {
      const sessionId = linkRefToSessionId.get(startParam)!;
      const session = pendingOtpSessions.get(sessionId);

      if (session && session.expiresAt > Date.now()) {
        phoneToChatMap.set(session.phone, {
          chatId,
          username,
          firstName,
          linkedAt: Date.now(),
        });

        const code = issueNewOtpForSession(session);
        session.linked = true;
        session.deliveredViaTelegram = true;

        await sendTelegramBotMessage(
          chatId,
          `🎉 <b>Kiki Bot muvaffaqiyatli ulandi!</b>\n\n` +
            buildTelegramOtpHtml(session.phone, code)
        );
        return;
      }

      await sendTelegramBotMessage(
        chatId,
        `⏰ Kechirasiz, ushbu bog‘lash havolasining vaqti tugagan.\n\nSo‘zApp saytiga qaytib, <b>«Kod yuborish»</b> tugmasini qaytadan bosing!`
      );
      return;
    }

    await sendTelegramBotMessage(
      chatId,
      `🐼 <b>Salom! Men Kiki — So‘zApp yordamchisi!</b>\n\n` +
        `Hisobingizga kirish uchun So‘zApp saytida telefon raqamingizni kiriting va <b>«Kiki botni ochish va raqamni bog‘lash»</b> tugmasini bosing.\n\n` +
        `Yoki pastdagi tugma orqali telefon raqamingizni yuborishingiz ham mumkin:`,
      {
        keyboard: [
          [{ text: '📱 Telefon raqamimni ulashish', request_contact: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      }
    );
    return;
  }

  // 2. Handle shared Telegram contact (optional fallback binding)
  if (msg.contact?.phone_number) {
    const normalized = normalizeUzPhone(msg.contact.phone_number);
    if (!normalized) {
      await sendTelegramBotMessage(
        chatId,
        `Iltimos, O‘zbekiston telefon raqamini (+998 XX XXX XX XX) ulashing.`
      );
      return;
    }

    phoneToChatMap.set(normalized, {
      chatId,
      username,
      firstName,
      linkedAt: Date.now(),
    });

    // Check if there is an active pending session for this phone
    let matchedSession: PendingOtpSession | undefined;
    for (const sess of pendingOtpSessions.values()) {
      if (sess.phone === normalized && sess.expiresAt > Date.now()) {
        matchedSession = sess;
      }
    }

    if (matchedSession) {
      const code = issueNewOtpForSession(matchedSession);
      matchedSession.linked = true;
      matchedSession.deliveredViaTelegram = true;
      await sendTelegramBotMessage(
        chatId,
        `✅ <b>Raqam ulandi!</b>\n\n` + buildTelegramOtpHtml(normalized, code),
        { remove_keyboard: true }
      );
    } else {
      await sendTelegramBotMessage(
        chatId,
        `✅ <b>${formatUzPhone(normalized)}</b> raqami Kiki botga ulandi!\n\nEndi So‘zApp saytida <b>«Kod yuborish»</b> tugmasini bossangiz, 6 xonali kod shu yerga keladi.`,
        { remove_keyboard: true }
      );
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Step 1 & 2: Request OTP for +998 phone number
  app.post('/api/auth/request-otp', async (req, res) => {
    cleanupExpiredAuthState();
    const body = (req.body || {}) as { phone?: unknown };
    const normalizedPhone = normalizeUzPhone(body.phone);

    if (!normalizedPhone) {
      res.status(400).json({
        error:
          'Iltimos, to‘liq O‘zbekiston telefon raqamini kiriting (+998 XX XXX XX XX).',
      });
      return;
    }

    const botUsername = await discoverTelegramBotUsername();
    const liveTelegram = isLiveTelegramConfigured();
    const existingBinding = phoneToChatMap.get(normalizedPhone);

    const sessionId = crypto.randomBytes(8).toString('hex');
    const linkRef = `sozapp_${sessionId}`;
    const deepLinkUrl = `https://t.me/${botUsername}?start=${linkRef}`;
    const now = Date.now();

    const session: PendingOtpSession = {
      sessionId,
      linkRef,
      phone: normalizedPhone,
      codeHash: '',
      salt: '',
      expiresAt: now + OTP_TTL_MS,
      resendAvailableAt: now + RESEND_COOLDOWN_MS,
      attempts: 0,
      linked: Boolean(existingBinding),
      deliveredViaTelegram: false,
      createdAt: now,
    };

    pendingOtpSessions.set(sessionId, session);
    linkRefToSessionId.set(linkRef, sessionId);

    if (existingBinding) {
      const code = issueNewOtpForSession(session);

      if (liveTelegram) {
        const sent = await sendTelegramBotMessage(
          existingBinding.chatId,
          buildTelegramOtpHtml(normalizedPhone, code)
        );

        if (!sent.ok) {
          // Stale or blocked chat: drop binding and ask user to re-link via deep link
          phoneToChatMap.delete(normalizedPhone);
          session.linked = false;
          session.deliveredViaTelegram = false;

          res.json({
            status: 'needs_link',
            sessionId,
            linkRef,
            deepLinkUrl,
            botUsername,
            phone: normalizedPhone,
            formattedPhone: formatUzPhone(normalizedPhone),
            maskedPhone: maskUzPhone(normalizedPhone),
            telegramMode: 'live',
            messageUz:
              'Kiki botga ulanishni yangilash kerak. Quyidagi tugma orqali Kiki botni oching va Start bosing.',
          });
          return;
        }

        session.deliveredViaTelegram = true;
        res.json({
          status: 'code_sent',
          sessionId,
          deepLinkUrl,
          botUsername,
          phone: normalizedPhone,
          formattedPhone: formatUzPhone(normalizedPhone),
          maskedPhone: maskUzPhone(normalizedPhone),
          resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
          telegramMode: 'live',
          messageUz:
            '6 xonali tasdiqlash kodi Telegramdagi Kiki botingizga yuborildi!',
        });
        return;
      }

      // Preview mode (no TELEGRAM_BOT_TOKEN set) with already-linked phone
      session.deliveredViaTelegram = true;
      res.json({
        status: 'code_sent',
        sessionId,
        deepLinkUrl,
        botUsername,
        phone: normalizedPhone,
        formattedPhone: formatUzPhone(normalizedPhone),
        maskedPhone: maskUzPhone(normalizedPhone),
        resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
        telegramMode: 'preview',
        previewCode: code,
        messageUz:
          'Raqam ulangan! 6 xonali tasdiqlash kodi Kiki botga yuborildi.',
      });
      return;
    }

    // Not linked yet -> Step 2 deep-link prompt
    res.json({
      status: 'needs_link',
      sessionId,
      linkRef,
      deepLinkUrl,
      botUsername,
      phone: normalizedPhone,
      formattedPhone: formatUzPhone(normalizedPhone),
      maskedPhone: maskUzPhone(normalizedPhone),
      telegramMode: liveTelegram ? 'live' : 'preview',
      messageUz:
        'Bu raqam hali Kiki Telegram botiga ulanmagan. Quyidagi tugmani bosib botni oching va Start bosing — Kiki kodni darhol yuboradi!',
    });
  });

  // Poll session binding / code delivery status
  app.get('/api/auth/otp-status', (req, res) => {
    cleanupExpiredAuthState();
    const sessionId =
      typeof req.query.sessionId === 'string' ? req.query.sessionId.trim() : '';

    if (!sessionId || !pendingOtpSessions.has(sessionId)) {
      res.status(404).json({
        error: 'Sessiya topilmadi yoki muddati tugagan. Qaytadan kod yuboring.',
      });
      return;
    }

    const session = pendingOtpSessions.get(sessionId)!;
    const resendInSeconds = Math.max(
      0,
      Math.ceil((session.resendAvailableAt - Date.now()) / 1000)
    );

    res.json({
      sessionId: session.sessionId,
      linked: session.linked,
      codeSent: session.deliveredViaTelegram,
      resendInSeconds,
      telegramMode: isLiveTelegramConfigured() ? 'live' : 'preview',
      ...(isLiveTelegramConfigured() ? {} : { previewCode: session.previewCode }),
    });
  });

  // Step 2 active check / resend via Telegram getUpdates (for AI Studio Preview & webhook fallback)
  app.post('/api/auth/check-telegram', async (req, res) => {
    cleanupExpiredAuthState();
    const body = (req.body || {}) as { sessionId?: unknown };
    const sessionId =
      typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

    if (!sessionId || !pendingOtpSessions.has(sessionId)) {
      res.status(404).json({
        error: 'Sessiya topilmadi yoki muddati tugagan. Raqamni qaytadan kiriting.',
      });
      return;
    }

    const liveTelegram = isLiveTelegramConfigured();
    if (liveTelegram) {
      await syncTelegramUpdatesNow();
    }

    const session = pendingOtpSessions.get(sessionId);
    if (!session) {
      res.status(404).json({
        error: 'Sessiya muddati tugagan. Qaytadan kod yuboring.',
      });
      return;
    }

    const resendInSeconds = Math.max(
      0,
      Math.ceil((session.resendAvailableAt - Date.now()) / 1000)
    );

    if (!liveTelegram) {
      if (session.linked && session.deliveredViaTelegram) {
        res.json({
          status: 'code_sent',
          linked: true,
          codeSent: true,
          resendInSeconds,
          telegramMode: 'preview',
          previewCode: session.previewCode,
          messageUz: 'Kiki Bot bog‘langan! 6 xonali kod tayyor.',
        });
        return;
      }

      res.json({
        status: 'waiting',
        linked: false,
        codeSent: false,
        telegramMode: 'preview',
        messageUz:
          'Serverda TELEGRAM_BOT_TOKEN sozlanmagan. Sinov uchun «Demo: Botni bog‘lash» tugmasidan foydalanishingiz mumkin.',
      });
      return;
    }

    const binding = phoneToChatMap.get(session.phone);

    // Case 1: /start was just processed in syncTelegramUpdatesNow or already delivered
    if (session.linked && session.deliveredViaTelegram) {
      // If user clicked the button again after cooldown, resend a fresh OTP to Telegram
      if (binding && resendInSeconds === 0) {
        const freshCode = issueNewOtpForSession(session);
        const sent = await sendTelegramBotMessage(
          binding.chatId,
          buildTelegramOtpHtml(session.phone, freshCode)
        );
        if (!sent.ok) {
          res.status(502).json({
            error:
              'Telegramga xabar yuborib bo‘lmadi. Kiki botni bloklamaganingizni tekshiring.',
          });
          return;
        }
        res.json({
          status: 'code_sent',
          linked: true,
          codeSent: true,
          resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
          telegramMode: 'live',
          messageUz: 'Yangi 6 xonali kod Kiki Telegram botiga yuborildi!',
        });
        return;
      }

      res.json({
        status: 'code_sent',
        linked: true,
        codeSent: true,
        resendInSeconds,
        telegramMode: 'live',
        messageUz:
          'Kiki Bot muvaffaqiyatli ulandi! 6 xonali kod Telegramingizga yuborildi.',
      });
      return;
    }

    // Case 2: Phone got linked (e.g. via contact share) but OTP wasn't sent for this session yet
    if (binding) {
      const code = issueNewOtpForSession(session);
      const sent = await sendTelegramBotMessage(
        binding.chatId,
        buildTelegramOtpHtml(session.phone, code)
      );
      if (!sent.ok) {
        phoneToChatMap.delete(session.phone);
        session.linked = false;
        session.deliveredViaTelegram = false;
        res.json({
          status: 'waiting',
          linked: false,
          codeSent: false,
          telegramMode: 'live',
          messageUz:
            'Kiki botga xabar yuborilmadi. Botni ochib Start tugmasini qayta bosing.',
        });
        return;
      }

      session.linked = true;
      session.deliveredViaTelegram = true;
      res.json({
        status: 'code_sent',
        linked: true,
        codeSent: true,
        resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
        telegramMode: 'live',
        messageUz: '6 xonali tasdiqlash kodi Telegramingizga yuborildi!',
      });
      return;
    }

    // Case 3: Still waiting for user to press Start in Telegram
    res.json({
      status: 'waiting',
      linked: false,
      codeSent: false,
      telegramMode: 'live',
      messageUz:
        'Telegramda hali /start bosilgani topilmadi. «Kiki botni ochish va raqamni bog‘lash» tugmasini bosib Telegramda Start bosing, so‘ng yana tekshiring.',
    });
  });

  // Preview-only binding endpoint (strictly disabled when real TELEGRAM_BOT_TOKEN exists)
  app.post('/api/auth/preview-bind', (req, res) => {
    if (isLiveTelegramConfigured()) {
      res.status(403).json({
        error: 'Haqiqiy Telegram bot ulangan holatda demo bog‘lash o‘chirilgan.',
      });
      return;
    }

    cleanupExpiredAuthState();
    const body = (req.body || {}) as { sessionId?: unknown };
    const sessionId =
      typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

    if (!sessionId || !pendingOtpSessions.has(sessionId)) {
      res.status(404).json({
        error: 'Sessiya muddati tugagan. Iltimos, «Kod yuborish»ni qayta bosing.',
      });
      return;
    }

    const session = pendingOtpSessions.get(sessionId)!;
    phoneToChatMap.set(session.phone, {
      chatId: Date.now(),
      username: 'kiki_demo_user',
      firstName: 'Azizbek',
      linkedAt: Date.now(),
    });

    const code = issueNewOtpForSession(session);
    session.linked = true;
    session.deliveredViaTelegram = true;

    res.json({
      status: 'code_sent',
      sessionId: session.sessionId,
      linked: true,
      codeSent: true,
      maskedPhone: maskUzPhone(session.phone),
      resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
      telegramMode: 'preview',
      previewCode: code,
      messageUz:
        'Kiki Bot muvaffaqiyatli bog‘landi! 6 xonali tasdiqlash kodi yuborildi.',
    });
  });

  // Resend 6-digit OTP
  app.post('/api/auth/resend-otp', async (req, res) => {
    cleanupExpiredAuthState();
    const body = (req.body || {}) as { sessionId?: unknown };
    const sessionId =
      typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

    if (!sessionId || !pendingOtpSessions.has(sessionId)) {
      res.status(404).json({
        error: 'Sessiya topilmadi yoki muddati tugagan. Raqamni qayta kiriting.',
      });
      return;
    }

    const session = pendingOtpSessions.get(sessionId)!;
    const now = Date.now();
    if (session.resendAvailableAt > now) {
      const waitSec = Math.ceil((session.resendAvailableAt - now) / 1000);
      res.status(429).json({
        error: `Iltimos, qayta yuborishdan oldin ${waitSec} soniya kuting.`,
        resendInSeconds: waitSec,
      });
      return;
    }

    const binding = phoneToChatMap.get(session.phone);
    if (!binding) {
      res.status(400).json({
        error:
          'Avval Kiki Telegram botini ochib, Start tugmasini bosish orqali raqamingizni bog‘lang.',
      });
      return;
    }

    const code = issueNewOtpForSession(session);
    session.linked = true;
    session.deliveredViaTelegram = true;

    if (isLiveTelegramConfigured()) {
      const sent = await sendTelegramBotMessage(
        binding.chatId,
        buildTelegramOtpHtml(session.phone, code)
      );
      if (!sent.ok) {
        res.status(502).json({
          error:
            'Telegramga xabar yuborib bo‘lmadi. Kiki botni bloklamaganingizni tekshirib qayta urining.',
        });
        return;
      }
    }

    res.json({
      status: 'code_sent',
      sessionId: session.sessionId,
      resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
      telegramMode: isLiveTelegramConfigured() ? 'live' : 'preview',
      ...(isLiveTelegramConfigured() ? {} : { previewCode: code }),
      messageUz: 'Yangi 6 xonali kod Kiki Telegram botiga yuborildi!',
    });
  });

  // Step 3: Verify 6-digit OTP & issue Bearer session token
  app.post('/api/auth/verify-otp', (req, res) => {
    cleanupExpiredAuthState();
    const body = (req.body || {}) as { sessionId?: unknown; code?: unknown };
    const sessionId =
      typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const code =
      typeof body.code === 'string' ? body.code.replace(/\D/g, '') : '';

    if (!sessionId || !pendingOtpSessions.has(sessionId)) {
      res.status(404).json({
        error:
          'Kod muddati tugagan yoki sessiya topilmadi. Iltimos, yangi kod yuboring.',
      });
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      res.status(400).json({
        error: 'Iltimos, 6 ta raqamdan iborat tasdiqlash kodini to‘liq kiriting.',
      });
      return;
    }

    const session = pendingOtpSessions.get(sessionId)!;
    if (!session.linked || !session.codeHash) {
      res.status(400).json({
        error:
          'Avval Kiki Telegram botida Start bosib, kodni oling.',
      });
      return;
    }

    if (session.attempts >= MAX_OTP_ATTEMPTS) {
      pendingOtpSessions.delete(sessionId);
      linkRefToSessionId.delete(session.linkRef);
      res.status(429).json({
        error:
          'Juda ko‘p noto‘g‘ri urinish bo‘ldi. Xavfsizlik uchun «Kodni qayta yuborish» orqali yangi kod oling.',
      });
      return;
    }

    const candidateHash = hashOtpCode(session.salt, code);
    if (!timingSafeStringEqual(candidateHash, session.codeHash)) {
      session.attempts += 1;
      const remaining = MAX_OTP_ATTEMPTS - session.attempts;
      res.status(401).json({
        error:
          remaining > 0
            ? `Tasdiqlash kodi noto‘g‘ri. Telegramdagi Kiki bot xabarini tekshiring (${remaining} ta urinish qoldi).`
            : 'Noto‘g‘ri kod urinishlari limiti tugadi. Yangi kod yuboring.',
      });
      return;
    }

    // Valid OTP — consume session and issue auth token
    pendingOtpSessions.delete(sessionId);
    linkRefToSessionId.delete(session.linkRef);

    const binding = phoneToChatMap.get(session.phone);
    const token = crypto.randomBytes(32).toString('hex');
    const authSession: ActiveAuthSession = {
      token,
      phone: session.phone,
      linkedTelegram: Boolean(binding),
      telegramUsername: binding?.username,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    activeAuthSessions.set(token, authSession);

    res.json({
      token,
      user: {
        phone: authSession.phone,
        formattedPhone: formatUzPhone(authSession.phone),
        linkedTelegram: authSession.linkedTelegram,
        telegramUsername: authSession.telegramUsername || null,
      },
    });
  });

  app.get('/api/auth/session', (req, res) => {
    cleanupExpiredAuthState();
    const token = extractBearerToken(req);
    if (!token || !activeAuthSessions.has(token)) {
      res.status(401).json({ authenticated: false });
      return;
    }
    const authSession = activeAuthSessions.get(token)!;
    res.json({
      authenticated: true,
      user: {
        phone: authSession.phone,
        formattedPhone: formatUzPhone(authSession.phone),
        linkedTelegram: authSession.linkedTelegram,
        telegramUsername: authSession.telegramUsername || null,
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = extractBearerToken(req);
    if (token) {
      activeAuthSessions.delete(token);
    }
    res.json({ ok: true });
  });

  // Real Telegram Bot Webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || '';
    if (expectedSecret) {
      const incomingSecret = req.get('x-telegram-bot-api-secret-token') || '';
      if (!incomingSecret || !timingSafeStringEqual(incomingSecret, expectedSecret)) {
        res.status(401).json({ ok: false });
        return;
      }
    }

    try {
      const update = (req.body || {}) as TelegramUpdate;
      await handleTelegramUpdate(update);
    } catch (err) {
      console.error('Telegram webhook xatosi:', err);
    }
    res.json({ ok: true });
  });

  const kikiTtsCache = new Map<
    string,
    { audioBase64: string; mimeType: string; provider: string }
  >();

  function resolveDiskUzbekAudio(
    voiceStyle: 'child_boy' | 'child_girl',
    slug: string
  ): { audioBase64: string; mimeType: string } | null {
    const baseDir = path.join(__dirname, 'public', 'audio', 'uz');
    const folders = [voiceStyle, 'shared'];
    const exts: { ext: string; mimeType: string }[] = [
      { ext: '.wav', mimeType: 'audio/wav' },
      { ext: '.mp3', mimeType: 'audio/mpeg' },
      { ext: '.ogg', mimeType: 'audio/ogg' },
    ];

    for (const folder of folders) {
      for (const { ext, mimeType } of exts) {
        const candidate = path.join(baseDir, folder, `${slug}${ext}`);
        try {
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            const buf = fs.readFileSync(candidate);
            if (buf.length > 0) {
              return { audioBase64: buf.toString('base64'), mimeType };
            }
          }
        } catch {
          // Ignore disk read error for individual candidate
        }
      }
    }
    return null;
  }

  app.post('/api/kiki-tts', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
      const body = (req.body || {}) as {
        text?: unknown;
        voiceStyle?: unknown;
        lang?: unknown;
        slug?: unknown;
      };
      const rawText = typeof body.text === 'string' ? body.text.trim() : '';
      if (!rawText || rawText.length > 500) {
        res.status(400).json({ error: 'Matn 1–500 ta belgidan iborat bo‘lishi kerak.' });
        return;
      }

      const voiceStyle =
        body.voiceStyle === 'child_girl' || body.voiceStyle === 'soft'
          ? 'child_girl'
          : 'child_boy';
      const lang = body.lang === 'ru-RU' ? 'ru-RU' : 'uz-UZ';
      const speechText =
        lang === 'uz-UZ'
          ? normalizeUzbekSpeechForTTS(rawText, 'gemini') || rawText
          : rawText;
      const slug =
        typeof body.slug === 'string' && /^[a-z0-9_]+$/.test(body.slug)
          ? body.slug
          : toUzbekAudioSlug(speechText);
      const assetHint = `/audio/uz/${voiceStyle}/${slug}.wav`;
      const cacheKey = `v9:${voiceStyle}:${lang}:${speechText}`;

      // 1. Check disk-based native Uzbek audio recordings if present
      if (lang === 'uz-UZ') {
        const diskAudio = resolveDiskUzbekAudio(voiceStyle, slug);
        if (diskAudio) {
          res.json({
            audioBase64: diskAudio.audioBase64,
            mimeType: diskAudio.mimeType,
            style: voiceStyle,
            provider: 'static_audio_base',
            slug,
            fallback: false,
          });
          return;
        }
      }

      // 2. Check server memory cache
      const cached = kikiTtsCache.get(cacheKey);
      if (cached) {
        res.json({
          audioBase64: cached.audioBase64,
          mimeType: cached.mimeType,
          style: voiceStyle,
          provider: cached.provider,
          slug,
          fallback: false,
        });
        return;
      }

      // 3. Built-in Gemini TTS when GEMINI_API_KEY is available (warm, gentle native Uzbek child voice)
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.json({ fallback: true, reason: 'local_fallback', slug, assetHint });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const stylePrompt =
        lang === 'ru-RU'
          ? voiceStyle === 'child_girl'
            ? 'Soft, sweet, gentle, cheerful reading voice of a kind young girl — light airy melodic tone, relaxed unhurried pace, speaking clear Russian'
            : 'Calm, playful, cheerful storytelling male voice in a steady low-mid male chest register (never high or feminine), crisp friendly boyish articulation, relaxed unhurried pace, speaking clear Russian'
          : voiceStyle === 'child_girl'
            ? 'Soft, sweet, gentle, cheerful Uzbek reading voice — light melodic tone, relaxed unhurried pace, pure open Uzbek vowels ("a" as in father, rounded "o", clear "u", soft "r"), zero English accent'
            : 'Calm, friendly, playful Uzbek storytelling male voice in a steady natural male chest register (never feminine or falsetto), crisp clear articulation, relaxed unhurried pace, pure open Uzbek vowels ("a" as in father, rounded "o", clear "u", soft "r"), zero English accent';

      const prebuiltVoiceName = voiceStyle === 'child_girl' ? 'Zephyr' : 'Charon';

      const tryTtsModel = async (model: string, withSpeechMetadata: boolean) => {
        const part = withSpeechMetadata
          ? {
              text: speechText,
              speechMetadata: { style: stylePrompt },
            }
          : {
              text: speechText,
            };

        return ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [part] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: prebuiltVoiceName,
                },
              },
            },
          },
        });
      };

      let response;
      let usedModel = 'gemini-3.8-flash-tts';
      let lastErrMsg = '';

      const attempts: Array<{ model: string; meta: boolean }> = [
        { model: 'gemini-3.8-flash-tts', meta: true },
        { model: 'gemini-3.8-flash-lite-tts', meta: true },
        { model: 'gemini-3.8-flash-lite-tts', meta: false },
      ];

      for (const attempt of attempts) {
        try {
          response = await tryTtsModel(attempt.model, attempt.meta);
          if (response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
            usedModel = attempt.model;
            break;
          }
        } catch (modelErr) {
          lastErrMsg =
            modelErr instanceof Error ? modelErr.message : String(modelErr);
          console.error(
            `[uzVoiceService] ${attempt.model} (meta=${attempt.meta}) xatosi:`,
            lastErrMsg
          );
        }
      }

      const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const base64Audio = inlineData?.data;
      const mimeType = inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        res.json({
          fallback: true,
          reason: 'tts_unavailable',
          errorDetail: lastErrMsg.slice(0, 220),
          slug,
          assetHint,
        });
        return;
      }

      if (kikiTtsCache.size >= 140) {
        const oldestKey = kikiTtsCache.keys().next().value;
        if (typeof oldestKey === 'string') {
          kikiTtsCache.delete(oldestKey);
        }
      }

      const sculptedAudioBase64 =
        mimeType.includes('wav')
          ? shapeChildVoiceWav(base64Audio, voiceStyle)
          : base64Audio;

      kikiTtsCache.set(cacheKey, {
        audioBase64: sculptedAudioBase64,
        mimeType,
        provider: usedModel,
      });

      res.json({
        audioBase64: sculptedAudioBase64,
        mimeType,
        style: voiceStyle,
        provider: usedModel,
        slug,
        fallback: false,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[uzVoiceService] Gemini TTS xatosi:', errMsg);
      res.json({ fallback: true, reason: 'tts_unavailable', errorDetail: errMsg.slice(0, 220) });
    }
  });

  app.post('/api/kiki-chat', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
      const body = (req.body || {}) as ChatRequestBody;
      const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
      if (!userMessage) {
        res.status(400).json({ error: 'Xabar matni bo‘sh bo‘lmasligi kerak.' });
        return;
      }

      const persona = body.persona === 'parent_therapist' ? 'parent_therapist' : 'child';
      const useSearch = Boolean(body.useSearch);
      const fastMode = Boolean(body.fastMode);
      const rawHistory = Array.isArray(body.history) ? body.history.slice(-16) : [];

      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'Gemini AI API kaliti (GEMINI_API_KEY) sozlanmagan. Iltimos, Secrets bo‘limidan GEMINI_API_KEY kiriting.',
          code: 'NO_API_KEY',
        });
        return;
      }

      const selectedModel =
        fastMode && !useSearch ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Gemini contents MUST start with a 'user' turn and alternate cleanly
      const filteredHistory = rawHistory.filter(
        (item): item is ChatHistoryMessage =>
          Boolean(item) &&
          (item.role === 'user' || item.role === 'model') &&
          typeof item.text === 'string' &&
          item.text.trim().length > 0
      );

      while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
        filteredHistory.shift();
      }

      const alternatingHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
      for (const item of filteredHistory) {
        const last = alternatingHistory[alternatingHistory.length - 1];
        if (last && last.role === item.role) {
          last.parts[0].text = `${last.parts[0].text}\n${item.text.trim()}`;
        } else {
          alternatingHistory.push({
            role: item.role,
            parts: [{ text: item.text.trim() }],
          });
        }
      }

      if (
        alternatingHistory.length > 0 &&
        alternatingHistory[alternatingHistory.length - 1].role === 'user'
      ) {
        alternatingHistory[alternatingHistory.length - 1].parts[0].text = `${
          alternatingHistory[alternatingHistory.length - 1].parts[0].text
        }\n${userMessage}`;
      } else {
        alternatingHistory.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });
      }

      const systemInstruction = getSystemInstruction(persona);
      let actualModel = selectedModel;
      let usedSearchTool = useSearch;
      let response;

      try {
        response = await ai.models.generateContent({
          model: actualModel,
          contents: alternatingHistory,
          config: {
            systemInstruction,
            ...(usedSearchTool ? { tools: [{ googleSearch: {} }] } : {}),
          },
        });
      } catch (primaryErr) {
        console.warn('Birinchi Gemini chaqiruvi xatosi, qayta urinilmoqda:', primaryErr);
        if (usedSearchTool) {
          usedSearchTool = false;
          try {
            response = await ai.models.generateContent({
              model: actualModel,
              contents: alternatingHistory,
              config: { systemInstruction },
            });
          } catch {
            actualModel = 'gemini-3.1-flash-lite';
            response = await ai.models.generateContent({
              model: actualModel,
              contents: alternatingHistory,
              config: { systemInstruction },
            });
          }
        } else if (actualModel !== 'gemini-3.1-flash-lite') {
          actualModel = 'gemini-3.1-flash-lite';
          response = await ai.models.generateContent({
            model: actualModel,
            contents: alternatingHistory,
            config: { systemInstruction },
          });
        } else {
          throw primaryErr;
        }
      }

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({
          error: 'Gemini AI bo‘sh javob qaytardi. Iltimos, xabaringizni qayta yuboring.',
          code: 'EMPTY_RESPONSE',
        });
        return;
      }

      const rawChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      const seenUris = new Set<string>();

      for (const chunk of rawChunks) {
        const web = chunk?.web;
        if (web?.uri && !seenUris.has(web.uri)) {
          seenUris.add(web.uri);
          sources.push({
            title: web.title || web.uri,
            uri: web.uri,
          });
        }
      }

      res.json({
        reply: replyText,
        model: actualModel,
        sources,
        fallback: false,
        statusLabel: usedSearchTool ? 'Gemini AI + Google Qidiruv' : 'Gemini AI faol',
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error('Gemini chat API xatosi:', detail);
      res.status(502).json({
        error:
          'Gemini AI xizmati bilan bog‘lanishda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.',
        detail,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`So‘zApp serveri http://0.0.0.0:${PORT} da ishlamoqda`);
    void initializeTelegramTransport();
  });
}

startServer();

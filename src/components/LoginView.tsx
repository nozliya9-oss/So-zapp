import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '../types';
import { KikiLogo, KikiMascot, KikiMood } from './KikiMascot';
import { playButtonPop, playSuccessChime } from '../utils/soundEffects';

interface LoginViewProps {
  sfxEnabled: boolean;
  onAuthenticated: (token: string, user: AuthUser) => void;
}

type LoginStep = 'phone' | 'sending' | 'link_bot' | 'otp';

interface RequestOtpResponse {
  status?: 'code_sent' | 'needs_link';
  sessionId?: string;
  linkRef?: string;
  deepLinkUrl?: string;
  botUsername?: string;
  phone?: string;
  formattedPhone?: string;
  maskedPhone?: string;
  resendInSeconds?: number;
  telegramMode?: 'live' | 'preview';
  previewCode?: string;
  messageUz?: string;
  error?: string;
}

interface OtpStatusResponse {
  sessionId?: string;
  linked?: boolean;
  codeSent?: boolean;
  resendInSeconds?: number;
  telegramMode?: 'live' | 'preview';
  previewCode?: string;
  error?: string;
}

interface VerifyOtpResponse {
  token?: string;
  user?: AuthUser;
  error?: string;
}

function formatLocalUzDigits(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 9);
  const p1 = clean.slice(0, 2);
  const p2 = clean.slice(2, 5);
  const p3 = clean.slice(5, 7);
  const p4 = clean.slice(7, 9);
  return [p1, p2, p3, p4].filter(Boolean).join(' ');
}

function extractLocalUzDigits(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length > 9) {
    return digits.slice(3, 12);
  }
  return digits.slice(0, 9);
}

function isSafeTelegramUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 't.me' || parsed.hostname === 'telegram.me')
    );
  } catch {
    return false;
  }
}

export const LoginView: React.FC<LoginViewProps> = ({
  sfxEnabled,
  onAuthenticated,
}) => {
  const [step, setStep] = useState<LoginStep>('phone');
  const [localDigits, setLocalDigits] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [deepLinkUrl, setDeepLinkUrl] = useState<string>('https://t.me/SozAppKikiBot');
  const [botUsername, setBotUsername] = useState<string>('SozAppKikiBot');
  const [formattedPhone, setFormattedPhone] = useState<string>('');
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [telegramMode, setTelegramMode] = useState<'live' | 'preview'>('live');
  const [previewCode, setPreviewCode] = useState<string>('');
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isCheckingLink, setIsCheckingLink] = useState<boolean>(false);
  const [showFallbackHelp, setShowFallbackHelp] = useState<boolean>(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastAutoSubmittedRef = useRef<string>('');

  const fullPhoneDisplay = `+998 ${formatLocalUzDigits(localDigits)}`.trim();
  const isPhoneComplete = localDigits.length === 9;

  // Countdown timer for "Kodni qayta yuborish"
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = window.setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendTimer]);

  // Focus first OTP box when entering Step 3
  useEffect(() => {
    if (step === 'otp') {
      const id = window.setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 80);
      return () => window.clearTimeout(id);
    }
  }, [step]);

  // Poll Telegram link status while on Step 2 (link_bot)
  useEffect(() => {
    if (step !== 'link_bot' || !sessionId) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/auth/otp-status?sessionId=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as OtpStatusResponse;
        if (data.linked && data.codeSent) {
          playSuccessChime(!sfxEnabled);
          setResendTimer(data.resendInSeconds ?? 45);
          if (data.telegramMode) setTelegramMode(data.telegramMode);
          if (data.previewCode) setPreviewCode(data.previewCode);
          setStatusMessage(
            'Kiki Bot muvaffaqiyatli ulandi! 6 xonali kod Telegramingizga yuborildi.'
          );
          setErrorMessage('');
          setOtpDigits(['', '', '', '', '', '']);
          lastAutoSubmittedRef.current = '';
          setStep('otp');
        }
      } catch {
        // Ignore transient network errors during background poll
      }
    };

    const interval = window.setInterval(poll, 1800);
    window.addEventListener('focus', poll);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', poll);
    };
  }, [step, sessionId, sfxEnabled]);

  const verifyOtpCode = useCallback(
    async (codeToVerify: string) => {
      if (!/^\d{6}$/.test(codeToVerify) || !sessionId || isVerifying) return;

      setIsVerifying(true);
      setErrorMessage('');

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, code: codeToVerify }),
        });

        const data = (await res.json().catch(() => ({}))) as VerifyOtpResponse;

        if (!res.ok || !data.token || !data.user) {
          setErrorMessage(
            data.error ||
              'Tasdiqlash kodi noto‘g‘ri. Telegramdagi Kiki bot xabarini tekshirib qayta urining.'
          );
          setIsVerifying(false);
          return;
        }

        playSuccessChime(!sfxEnabled);
        onAuthenticated(data.token, data.user);
      } catch {
        setErrorMessage(
          'Server bilan aloqa uzildi. Iltimos, internetingizni tekshirib qayta urinib ko‘ring.'
        );
        setIsVerifying(false);
      }
    },
    [sessionId, isVerifying, sfxEnabled, onAuthenticated]
  );

  // Auto-verify once all 6 digits are filled
  useEffect(() => {
    if (step !== 'otp') return;
    const joined = otpDigits.join('');
    if (
      joined.length === 6 &&
      /^\d{6}$/.test(joined) &&
      joined !== lastAutoSubmittedRef.current &&
      !isVerifying
    ) {
      lastAutoSubmittedRef.current = joined;
      void verifyOtpCode(joined);
    }
  }, [otpDigits, step, isVerifying, verifyOtpCode]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const extracted = extractLocalUzDigits(e.target.value);
    setLocalDigits(extracted);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPop(!sfxEnabled);

    if (!isPhoneComplete) {
      setErrorMessage(
        'Iltimos, to‘liq O‘zbekiston telefon raqamini kiriting (+998 XX XXX XX XX).'
      );
      return;
    }

    setErrorMessage('');
    setStatusMessage('Kiki Telegram botga kod yuborilmoqda...');
    setStep('sending');

    const startedAt = Date.now();
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+998${localDigits}` }),
      });

      const data = (await res.json().catch(() => ({}))) as RequestOtpResponse;

      // Keep "Kiki Telegram botga kod yuborilmoqda..." clearly visible briefly
      const elapsed = Date.now() - startedAt;
      if (elapsed < 650) {
        await new Promise((resolve) => window.setTimeout(resolve, 650 - elapsed));
      }

      if (!res.ok || !data.sessionId) {
        setStep('phone');
        setStatusMessage('');
        setErrorMessage(
          data.error ||
            'Kod yuborishda xatolik yuz berdi. Telefon raqamingizni tekshirib qayta urining.'
        );
        return;
      }

      setSessionId(data.sessionId);
      setFormattedPhone(data.formattedPhone || `+998 ${formatLocalUzDigits(localDigits)}`);
      setMaskedPhone(data.maskedPhone || `+998 ${formatLocalUzDigits(localDigits)}`);
      setBotUsername(data.botUsername || 'SozAppKikiBot');
      setTelegramMode(data.telegramMode || 'live');
      setPreviewCode(data.previewCode || '');
      setCopiedPreview(false);
      setShowFallbackHelp(false);

      if (data.deepLinkUrl && isSafeTelegramUrl(data.deepLinkUrl)) {
        setDeepLinkUrl(data.deepLinkUrl);
      } else {
        setDeepLinkUrl('https://t.me/SozAppKikiBot');
      }

      if (data.status === 'code_sent') {
        playSuccessChime(!sfxEnabled);
        setResendTimer(data.resendInSeconds ?? 45);
        setStatusMessage(
          data.messageUz ||
            '6 xonali tasdiqlash kodi Telegramdagi Kiki botingizga yuborildi!'
        );
        setOtpDigits(['', '', '', '', '', '']);
        lastAutoSubmittedRef.current = '';
        setStep('otp');
        return;
      }

      // Not linked yet -> Step 2 deep-link
      setStatusMessage(
        data.messageUz ||
          'Raqamingiz hali Kiki botga ulanmagan. Pastdagi tugma orqali botni oching va Start bosing.'
      );
      setStep('link_bot');
    } catch {
      setStep('phone');
      setStatusMessage('');
      setErrorMessage(
        'Serverga ulanib bo‘lmadi. Iltimos, birozdan so‘ng qayta urinib ko‘ring.'
      );
    }
  };

  const handleCheckBotLinkNow = async () => {
    if (!sessionId || isCheckingLink) return;
    playButtonPop(!sfxEnabled);
    setIsCheckingLink(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/check-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json().catch(() => ({}))) as RequestOtpResponse &
        OtpStatusResponse;

      if (!res.ok) {
        setErrorMessage(
          data.error || 'Sessiya muddati tugadi. Raqamni qaytadan kiriting.'
        );
        setIsCheckingLink(false);
        return;
      }

      if (data.telegramMode) setTelegramMode(data.telegramMode);
      if (data.previewCode) setPreviewCode(data.previewCode);

      if (data.linked && data.codeSent) {
        playSuccessChime(!sfxEnabled);
        setResendTimer(data.resendInSeconds ?? 45);
        setStatusMessage(
          data.messageUz ||
            'Kiki Bot muvaffaqiyatli ulandi! 6 xonali kod Telegramingizga yuborildi.'
        );
        setOtpDigits(['', '', '', '', '', '']);
        lastAutoSubmittedRef.current = '';
        setStep('otp');
      } else {
        setErrorMessage(
          data.messageUz ||
            'Bot hali bog‘lanmadi. Telegramda «Kiki botni ochish va raqamni bog‘lash» tugmasini bosgach, Start tugmasini bosing.'
        );
      }
    } catch {
      setErrorMessage('Tekshirishda xatolik yuz berdi. Qayta urinib ko‘ring.');
    } finally {
      setIsCheckingLink(false);
    }
  };

  const handlePreviewBind = async () => {
    if (!sessionId || isCheckingLink) return;
    playButtonPop(!sfxEnabled);
    setIsCheckingLink(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/preview-bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json().catch(() => ({}))) as RequestOtpResponse;

      if (!res.ok) {
        setErrorMessage(data.error || 'Demo bog‘lashda xatolik yuz berdi.');
        setIsCheckingLink(false);
        return;
      }

      playSuccessChime(!sfxEnabled);
      setResendTimer(data.resendInSeconds ?? 45);
      setPreviewCode(data.previewCode || '');
      setCopiedPreview(false);
      setStatusMessage(
        data.messageUz ||
          'Kiki Bot bog‘landi! 6 xonali tasdiqlash kodi yuborildi.'
      );
      setOtpDigits(['', '', '', '', '', '']);
      lastAutoSubmittedRef.current = '';
      setStep('otp');
    } catch {
      setErrorMessage('Server bilan aloqa xatosi yuz berdi.');
    } finally {
      setIsCheckingLink(false);
    }
  };

  const handleResendOtp = async () => {
    if (!sessionId || resendTimer > 0 || isResending) return;
    playButtonPop(!sfxEnabled);
    setIsResending(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json().catch(() => ({}))) as RequestOtpResponse;

      if (!res.ok) {
        if (typeof data.resendInSeconds === 'number') {
          setResendTimer(data.resendInSeconds);
        }
        setErrorMessage(
          data.error || 'Kodni qayta yuborishda xatolik yuz berdi.'
        );
        setIsResending(false);
        return;
      }

      playSuccessChime(!sfxEnabled);
      setResendTimer(data.resendInSeconds ?? 45);
      if (data.previewCode) setPreviewCode(data.previewCode);
      setCopiedPreview(false);
      setOtpDigits(['', '', '', '', '', '']);
      lastAutoSubmittedRef.current = '';
      setStatusMessage(
        data.messageUz || 'Yangi 6 xonali kod Kiki Telegram botiga yuborildi!'
      );
      otpRefs.current[0]?.focus();
    } catch {
      setErrorMessage('Kodni qayta yuborib bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setIsResending(false);
    }
  };

  const applyPastedOrAutofilledDigits = (rawText: string, startIndex = 0) => {
    const cleanDigits = rawText.replace(/\D/g, '');
    if (!cleanDigits) return;

    setErrorMessage('');
    lastAutoSubmittedRef.current = '';

    // If user pasted a full 6-digit code anywhere, fill all 6 boxes from box 0
    if (cleanDigits.length >= 6) {
      const next = cleanDigits.slice(0, 6).split('');
      setOtpDigits(next);
      otpRefs.current[5]?.focus();
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < cleanDigits.length && startIndex + i < 6; i++) {
        next[startIndex + i] = cleanDigits[i];
      }
      return next;
    });

    const nextFocusIdx = Math.min(5, startIndex + cleanDigits.length);
    otpRefs.current[nextFocusIdx]?.focus();
  };

  const handleOtpInputChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length > 1) {
      applyPastedOrAutofilledDigits(clean, index);
      return;
    }

    setErrorMessage('');
    lastAutoSubmittedRef.current = '';

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
        lastAutoSubmittedRef.current = '';
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
        lastAutoSubmittedRef.current = '';
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    applyPastedOrAutofilledDigits(pasted, index);
  };

  const handleCopyPreviewCode = async () => {
    if (!previewCode) return;
    playButtonPop(!sfxEnabled);
    try {
      await navigator.clipboard.writeText(previewCode);
      setCopiedPreview(true);
      window.setTimeout(() => setCopiedPreview(false), 2000);
    } catch {
      // Fallback: fill directly if clipboard permission is blocked
      applyPastedOrAutofilledDigits(previewCode, 0);
    }
  };

  const handleResetToPhone = () => {
    playButtonPop(!sfxEnabled);
    setStep('phone');
    setStatusMessage('');
    setErrorMessage('');
    setPreviewCode('');
    setOtpDigits(['', '', '', '', '', '']);
    lastAutoSubmittedRef.current = '';
  };

  const kikiMood: KikiMood =
    step === 'sending' || step === 'link_bot' || isVerifying
      ? 'listening'
      : errorMessage
        ? 'retry'
        : step === 'otp'
          ? 'happy'
          : 'idle';

  const currentStepNumber = step === 'otp' ? 3 : step === 'link_bot' ? 2 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F8FF] via-white to-[#F0FAFF] flex flex-col justify-between px-4 py-6 sm:py-10">
      {/* Top Brand Lockup */}
      <header className="max-w-lg w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KikiLogo className="w-11 h-11 shrink-0" />
          <div>
            <div className="font-display font-bold text-2xl text-[#008ECC] leading-tight">
              So‘zApp
            </div>
            <div className="text-xs font-bold text-slate-500">
              Kiki bilan kichik harakat — katta natija
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border-2 border-[#BCEEFF] text-xs font-extrabold text-[#008ECC]">
          <Send className="w-3.5 h-3.5 text-[#00BFFF]" />
          <span>Telegram OTP</span>
        </div>
      </header>

      {/* Main Auth Card */}
      <main className="max-w-lg w-full mx-auto my-6">
        {/* Kiki Mascot Banner */}
        <div className="bg-[#00BFFF] border-2 border-[#009EDB] rounded-t-3xl px-5 py-5 text-white flex items-center justify-between gap-4 shadow-sm">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-xl mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentStepNumber}-bosqich / 3</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl leading-snug">
              {step === 'phone' && 'Kiki bilan hisobingizga kiring!'}
              {step === 'sending' && 'Kiki Telegram botga kod yuborilmoqda...'}
              {step === 'link_bot' && 'Kiki botni raqamingizga bog‘lang'}
              {step === 'otp' && '6 xonali kodni kiriting'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-white/90 mt-1">
              {step === 'phone' &&
                'Telefon raqamingizni kiriting — tasdiqlash kodi Telegramdagi Kiki botiga keladi.'}
              {step === 'sending' &&
                'Bir soniya kuting, Kiki sizning Telegram bot ulanishingizni tekshirmoqda.'}
              {step === 'link_bot' &&
                'Botni bir marta ochib Start bosing — Kiki kodni darhol yuboradi.'}
              {step === 'otp' &&
                `Kod ${maskedPhone || formattedPhone} raqami ulangan Telegramga yuborildi.`}
            </p>
          </div>

          <KikiMascot
            mood={kikiMood}
            size="sm"
            className="!w-20 !h-20 sm:!w-24 sm:!h-24 shrink-0"
          />
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white border-x-2 border-b-2 border-[#E5E5E5] rounded-b-3xl p-5 sm:p-7 shadow-lg shadow-sky-100/60 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: 'Telefon raqam' },
              { num: 2, label: 'Telegram bot' },
              { num: 3, label: '6 xonali kod' },
            ].map((item) => {
              const done = currentStepNumber > item.num;
              const active = currentStepNumber === item.num;
              return (
                <div
                  key={item.num}
                  className={`rounded-2xl px-2.5 py-2 border-2 text-center transition-colors ${
                    active
                      ? 'bg-[#E5F8FF] border-[#00BFFF] text-[#008ECC]'
                      : done
                        ? 'bg-emerald-50 border-[#58CC02] text-[#46A302]'
                        : 'bg-slate-50 border-[#E5E5E5] text-slate-400'
                  }`}
                >
                  <div className="font-display font-bold text-xs">
                    {done ? '✓ Tayyor' : `${item.num}-qadam`}
                  </div>
                  <div className="text-[11px] font-bold truncate mt-0.5">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-3.5 flex items-start gap-2.5 text-rose-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold leading-snug">
                {errorMessage}
              </p>
            </div>
          )}

          {/* STEP 1: Phone Input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="uz-phone-input"
                  className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Telefon raqamingiz
                </label>
                <div className="flex items-center rounded-2xl border-2 border-[#BCEEFF] bg-[#F8FDFF] focus-within:border-[#00BFFF] focus-within:bg-white transition-colors overflow-hidden">
                  <div className="flex items-center gap-2 pl-4 pr-3 py-3.5 bg-[#E5F8FF] border-r-2 border-[#BCEEFF] text-[#008ECC] font-display font-bold text-base sm:text-lg shrink-0">
                    <Phone className="w-4 h-4" />
                    <span>+998</span>
                  </div>
                  <input
                    id="uz-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={formatLocalUzDigits(localDigits)}
                    onChange={handlePhoneChange}
                    placeholder="90 123 45 67"
                    className="w-full px-3.5 py-3.5 bg-transparent font-display font-bold text-lg sm:text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none tracking-wide"
                  />
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-2">
                  Namuna: <span className="font-bold text-slate-700">+998 90 123 45 67</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={!isPhoneComplete}
                className="btn-3d w-full py-3.5 px-5 rounded-2xl bg-[#00BFFF] hover:bg-[#00B0ED] border-[#008ECC] text-white font-display font-bold text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Kod yuborish</span>
              </button>
            </form>
          )}

          {/* STEP 1 -> 2 STATUS: Sending to Telegram Bot */}
          {step === 'sending' && (
            <div className="rounded-3xl bg-[#E5F8FF] border-2 border-[#00BFFF] p-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border-2 border-[#BCEEFF] flex items-center justify-center text-[#00BFFF]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="font-display font-bold text-lg text-[#008ECC]">
                Kiki Telegram botga kod yuborilmoqda...
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {fullPhoneDisplay} raqami uchun Telegram ulanishi tekshirilmoqda.
              </p>
            </div>
          )}

          {/* STEP 2: Deep Link to Kiki Bot when phone is not linked yet */}
          {step === 'link_bot' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#E5F8FF] border-2 border-[#BCEEFF] p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#008ECC] uppercase">
                    Raqam: {formattedPhone}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008ECC] bg-white px-2.5 py-0.5 rounded-xl border border-[#BCEEFF]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Kutilmoqda
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                  {statusMessage}
                </p>
              </div>

              <a
                href={deepLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playButtonPop(!sfxEnabled)}
                className="btn-3d w-full py-3.5 px-5 rounded-2xl bg-[#00BFFF] hover:bg-[#00B0ED] border-[#008ECC] text-white font-display font-bold text-base flex items-center justify-center gap-2 text-center"
              >
                <Send className="w-5 h-5 shrink-0" />
                <span>Kiki botni ochish va raqamni bog‘lash</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <div className="rounded-2xl bg-slate-50 border-2 border-[#E5E5E5] p-3.5 space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="font-extrabold text-slate-800">
                  Qanday ulanadi?
                </div>
                <p>1. Yuqoridagi tugmani bosing — Telegramda @{botUsername} ochiladi.</p>
                <p>2. Telegramda pastdagi «Start» tugmasini bosing.</p>
                <p>3. Kiki sizga 6 xonali kod yuboradi va bu sahifa avtomatik ochiladi!</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCheckBotLinkNow}
                  disabled={isCheckingLink}
                  className="btn-3d w-full py-3 px-4 rounded-xl bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white font-display font-bold text-sm flex items-center justify-center gap-2"
                >
                  {isCheckingLink ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 shrink-0" />
                  )}
                  <span>Kodni botga qayta yuborish / ulanishni tekshirish</span>
                </button>

                {telegramMode === 'preview' && (
                  <button
                    type="button"
                    onClick={handlePreviewBind}
                    disabled={isCheckingLink}
                    className="btn-3d w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-900 font-display font-bold text-sm flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Demo: Botni bog‘lash</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetToPhone}
                className="w-full py-2 text-xs font-extrabold text-slate-500 hover:text-[#008ECC] flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Telefon raqamni o‘zgartirish</span>
              </button>
            </div>
          )}

          {/* STEP 3: 6-Box OTP with Auto-Fill & Auto-Login */}
          {step === 'otp' && (
            <div className="space-y-4">
              {statusMessage && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-[#58CC02]/50 p-3.5 flex items-start gap-2.5 text-[#3D8F02]">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-bold leading-snug">
                    {statusMessage}
                  </p>
                </div>
              )}

              {/* Preview Telegram Notification Card (ONLY shown when server is in preview mode without live bot token) */}
              {telegramMode === 'preview' && previewCode && (
                <div className="rounded-2xl bg-[#E5F8FF] border-2 border-[#00BFFF] p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold text-[#008ECC] uppercase">
                      @{botUsername} (Demo xabar)
                    </div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">
                      Tasdiqlash kodingiz:{' '}
                      <span className="font-display text-base text-slate-900 tracking-widest">
                        {previewCode}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPreviewCode}
                    className="btn-3d shrink-0 px-3 py-2 rounded-xl bg-white border-[#BCEEFF] text-[#008ECC] font-display font-bold text-xs flex items-center gap-1.5"
                  >
                    {copiedPreview ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#58CC02]" />
                        <span>Nusxalandi</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nusxalash</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                    6 xonali kodni kiriting
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    Nusxalab joylashtirish mumkin
                  </span>
                </div>

                {/* 6 Separate OTP Boxes */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      aria-label={`${index + 1}-raqam`}
                      value={digit}
                      disabled={isVerifying}
                      onChange={(e) => handleOtpInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={(e) => handleOtpPaste(index, e)}
                      className={`h-13 sm:h-15 w-full rounded-2xl border-2 text-center font-display font-bold text-2xl sm:text-3xl transition-all focus:outline-none tabular-nums ${
                        errorMessage
                          ? 'border-rose-300 bg-rose-50/50 text-rose-700 focus:border-rose-500'
                          : digit
                            ? 'border-[#00BFFF] bg-[#E5F8FF]/60 text-[#008ECC] focus:border-[#008ECC]'
                            : 'border-[#E5E5E5] bg-slate-50 text-slate-900 focus:border-[#00BFFF] focus:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={otpDigits.join('').length !== 6 || isVerifying}
                onClick={() => {
                  playButtonPop(!sfxEnabled);
                  void verifyOtpCode(otpDigits.join(''));
                }}
                className="btn-3d w-full py-3.5 px-5 rounded-2xl bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white font-display font-bold text-base sm:text-lg flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Tekshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Tasdiqlash va kirish</span>
                  </>
                )}
              </button>

              {/* Resend Timer & Fallback Help */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isResending}
                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold transition-colors ${
                    resendTimer > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-[#008ECC] hover:text-[#00BFFF]'
                  }`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {resendTimer > 0
                      ? `Kodni qayta yuborish (${resendTimer}s)`
                      : 'Kodni qayta yuborish'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!sfxEnabled);
                    setShowFallbackHelp((prev) => !prev);
                  }}
                  className="text-xs font-extrabold text-slate-500 hover:text-[#008ECC] text-left sm:text-right"
                >
                  Kod kelmadimi?
                </button>
              </div>

              {showFallbackHelp && (
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-3.5 space-y-2 text-xs font-semibold text-amber-900">
                  <div className="font-extrabold">
                    Agar kod Telegramga kelmagan bo‘lsa:
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Telegramda @{botUsername} botini bloklamaganingizni tekshiring.</li>
                    <li>Botga kirib Start tugmasini qayta bosing.</li>
                    <li>Taymer tugagach «Kodni qayta yuborish» tugmasidan foydalaning.</li>
                  </ul>
                  <a
                    href={deepLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-extrabold text-[#008ECC] hover:underline pt-1"
                  >
                    <span>Kiki botni Telegramda ochish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetToPhone}
                className="w-full py-1.5 text-xs font-extrabold text-slate-500 hover:text-[#008ECC] flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Boshqa raqam bilan kirish</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Trust Note */}
      <footer className="max-w-lg w-full mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#00BFFF] shrink-0" />
          <span>So‘zApp • Telegram Bot orqali xavfsiz kirish</span>
        </div>
      </footer>
    </div>
  );
};

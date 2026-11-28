import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  MessageCircle,
  Send,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Trash2,
  Zap,
} from 'lucide-react';
import { ChatMessage, ChatSource } from '../types';
import { KikiMascot } from './KikiMascot';
import { playButtonPop } from '../utils/soundEffects';

interface KikiChatViewProps {
  sfxEnabled: boolean;
}

const CHILD_SUGGESTIONS = [
  'Salom Kiki! Bugun ahvoling qanday?',
  'Menga qisqa va qiziqarli ertak aytib ber!',
  '«R» tovushini oson aytish uchun mashq ber!',
];

const PARENT_SUGGESTIONS = [
  'Assalomu alaykum! So‘zApp bolamga qanday yordam beradi?',
  '7 yoshli bolada «R» tovushi uchun uy mashqlari qanday?',
  'Disleksiya belgilari bo‘lgan bolalar bilan qanday mashq qilish kerak?',
];

export const KikiChatView: React.FC<KikiChatViewProps> = ({ sfxEnabled }) => {
  const [persona, setPersona] = useState<'child' | 'parent_therapist'>('child');
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusIndicator, setStatusIndicator] = useState<string>('Gemini AI tayyor');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: 'Salom! Men Kikiman 🐼 «Kiki bilan kichik harakat — katta natija»! Men bilan istalgan mavzuda suhbatlashishing yoki nutq mashqlari haqida so‘rashing mumkin.',
    },
  ]);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handlePersonaChange = (nextPersona: 'child' | 'parent_therapist') => {
    if (nextPersona === persona) return;
    playButtonPop(!sfxEnabled);
    setPersona(nextPersona);
    setMessages([
      {
        id: `welcome-${nextPersona}-${Date.now()}`,
        role: 'model',
        text:
          nextPersona === 'child'
            ? 'Salom do‘stim! Men Kikiman 🐼 Menga istalgan savolingni yozishing mumkin — birga suhbatlashamiz!'
            : 'Assalomu alaykum! Men So‘zApp’dagi Kiki AI maslahatchisiman. Istalgan savolingiz yoki farzandingiz nutq rivoji haqida so‘rashingiz mumkin.',
      },
    ]);
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    playButtonPop(!sfxEnabled);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    // Strip leading welcome messages and error bubbles so Gemini receives valid alternating user/model history
    const cleanHistory = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, text: m.text }));
    while (cleanHistory.length > 0 && cleanHistory[0].role !== 'user') {
      cleanHistory.shift();
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/kiki-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: cleanHistory,
          persona,
          useSearch,
          fastMode,
        }),
      });

      const rawText = await res.text();
      let parsed: {
        reply?: string;
        sources?: ChatSource[];
        statusLabel?: string;
        error?: string;
      } | null = null;

      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = null;
      }

      const replyText = parsed?.reply?.trim();
      if (!res.ok || !replyText) {
        const errorText =
          parsed?.error ||
          'Gemini AI javob bera olmadi. Iltimos, ulanish va API kalitini tekshirib qayta urinib ko‘ring.';
        setStatusIndicator('Gemini AI xatosi');
        setMessages((prev) => [
          ...prev,
          {
            id: `model-error-${Date.now()}`,
            role: 'model',
            text: errorText,
            sources: [],
            isError: true,
          },
        ]);
        return;
      }

      setStatusIndicator(
        parsed?.statusLabel || (useSearch ? 'Gemini AI + Google Qidiruv' : 'Gemini AI faol')
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: replyText,
          sources: Array.isArray(parsed?.sources) ? parsed.sources : [],
        },
      ]);
    } catch {
      setStatusIndicator('Ulanish xatosi');
      setMessages((prev) => [
        ...prev,
        {
          id: `model-network-error-${Date.now()}`,
          role: 'model',
          text: 'Server bilan bog‘lanib bo‘lmadi. Iltimos, internetingizni tekshirib qayta urinib ko‘ring.',
          sources: [],
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    playButtonPop(!sfxEnabled);
    setStatusIndicator('Gemini AI tayyor');
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text:
          persona === 'child'
            ? 'Yangi suhbat boshladik! Istalgan mavzuda savol ber — Kiki senga javob beradi!'
            : 'Suhbat yangilandi. Savolingizni yozishingiz mumkin.',
      },
    ]);
  };

  const suggestions = persona === 'child' ? CHILD_SUGGESTIONS : PARENT_SUGGESTIONS;

  return (
    <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-6 pt-2.5 sm:pt-4 pb-[64px] lg:pb-4 flex flex-col min-h-[calc(100dvh-64px)] lg:h-[calc(100dvh-68px)] overflow-x-clip">
      {/* Compact Header & Collapsible Controls */}
      <div className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-2.5 sm:mb-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <KikiMascot
              mood={isLoading ? 'listening' : 'idle'}
              size="sm"
              className="!w-16 !h-16 sm:!w-20 sm:!h-20 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-xl text-slate-900 dark:text-white leading-tight">
                Kiki AI Suhbatdosh
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                <span className="text-[#008ECC] dark:text-[#38BDF8] font-bold">
                  {statusIndicator}
                </span>
                {' · '}
                <span>{persona === 'child' ? 'Bola rejimi' : 'Ota-ona/Logoped'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                setShowMobileControls((prev) => !prev);
              }}
              aria-expanded={showMobileControls}
              className="sm:hidden btn-3d bg-[#E5F8FF] dark:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-xl px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Rejim</span>
              {showMobileControls ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              title="Suhbatni tozalash"
              aria-label="Suhbatni tozalash"
              className="btn-3d bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border-2 border-[#E5E5E5] dark:border-slate-600 border-b-[4px] border-b-slate-300 dark:border-b-slate-900 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Suhbatni tozalash</span>
            </button>
          </div>
        </div>

        {/* Role & Grounding Toggles */}
        <div
          className={`${
            showMobileControls ? 'flex' : 'hidden sm:flex'
          } mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex-wrap items-center justify-between gap-2`}
        >
          <div
            className="inline-flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-[#E5E5E5] dark:border-slate-700 max-w-full overflow-x-auto no-scrollbar"
            role="group"
            aria-label="Suhbat rolini tanlash"
          >
            <button
              type="button"
              onClick={() => handlePersonaChange('child')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all min-h-[32px] ${
                persona === 'child'
                  ? 'bg-[#00BFFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Bola uchun (Kiki)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePersonaChange('parent_therapist')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all min-h-[32px] ${
                persona === 'parent_therapist'
                  ? 'bg-[#00BFFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Ota-ona va Logoped</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                setUseSearch((prev) => !prev);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border-2 flex items-center gap-1 min-h-[32px] whitespace-nowrap transition-colors shrink-0 ${
                useSearch
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-[#58CC02] text-[#3B8700] dark:text-[#7CE82B]'
                  : 'bg-white dark:bg-slate-700 border-[#E5E5E5] dark:border-slate-600 text-slate-500 dark:text-slate-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Qidiruv: {useSearch ? 'Yoqilgan' : 'O‘chiq'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                setFastMode((prev) => !prev);
              }}
              disabled={useSearch}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border-2 flex items-center gap-1 min-h-[32px] whitespace-nowrap transition-colors disabled:opacity-50 shrink-0 ${
                fastMode && !useSearch
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-[#FFC800] text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-700 border-[#E5E5E5] dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{fastMode && !useSearch ? 'Tezkor' : 'Standart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tall, ChatGPT-like Scrollable Conversation Thread */}
      <div className="flex-1 min-h-[360px] sm:min-h-[420px] overflow-y-auto overscroll-contain bg-slate-50/75 dark:bg-slate-900/70 border-2 border-[#E5E5E5] dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base leading-relaxed break-words ${
                  isUser
                    ? 'bg-[#00BFFF] text-white font-semibold rounded-br-sm'
                    : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold rounded-bl-sm'
                      : 'bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-bl-sm'
                }`}
              >
                {msg.isError && (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold mb-1 text-rose-600 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Gemini AI xabar beradi</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                    <div className="text-[11px] font-extrabold text-[#008ECC] dark:text-[#38BDF8] flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Google Qidiruv manbalari:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.slice(0, 4).map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#008ECC] dark:text-[#38BDF8] bg-[#E5F8FF] dark:bg-slate-700 hover:bg-[#D2F2FF] px-2.5 py-1 rounded-lg transition-colors max-w-full"
                        >
                          <span className="truncate max-w-[180px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm font-bold text-[#008ECC] dark:text-[#38BDF8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Kiki javob tayyorlamoqda...</span>
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Always-Visible Sticky Bottom Composer Bar */}
      <div className="sticky bottom-[62px] lg:bottom-0 z-20 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-2 pb-1.5 mt-2 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage(suggestion)}
              className="text-[11px] sm:text-xs font-bold text-[#008ECC] dark:text-[#38BDF8] bg-[#E5F8FF] dark:bg-slate-800 hover:bg-[#D2F2FF] dark:hover:bg-slate-700 border border-[#00BFFF]/40 rounded-xl px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full min-w-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Xabar yozing..."
            aria-label="Xabar yozing"
            disabled={isLoading}
            className="flex-1 min-w-0 rounded-2xl border-2 border-[#E5E5E5] dark:border-slate-700 focus:border-[#00BFFF] focus:outline-none px-3.5 sm:px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Xabar yuborish"
            className="btn-3d bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-2xl px-4 sm:px-5 py-3 font-display font-bold text-sm sm:text-base flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Yuborish</span>
          </button>
        </form>
      </div>
    </div>
  );
};

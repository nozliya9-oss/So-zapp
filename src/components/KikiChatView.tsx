import React, { useEffect, useRef, useState } from 'react';
import {
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

function generateClientConversationalFallback(
  userMessage: string,
  persona: 'child' | 'parent_therapist'
): string {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  if (/\b(salom|assalom|assalomu|alaykum|xayrli|hayrli|privet|hello|hi)\b/i.test(lower)) {
    return persona === 'parent_therapist'
      ? 'Va alaykum assalom! So‘zApp’ga xush kelibsiz 🐼 Farzandingiz nutq rivoji yoki ilova haqida istalgan savolingizni berishingiz mumkin.'
      : 'Salom, aziz do‘stim! 🐼 Men Kikiman! Bugun kayfiyating qanday? Istalgan savolingni yoz — birga suhbatlashamiz!';
  }

  if (/(qalaysan|qandaysan|yaxshimisiz|ishlar|nima gap|ahvoling|tuzukmisiz)/i.test(lower)) {
    return persona === 'parent_therapist'
      ? 'Rahmat, hammasi a’lo! Sizga qanday yordam bera olaman?'
      : 'Menda hammasi a’lo, rahmat! 🐼 Bugun So‘zlar shahrida yangi binolarni ko‘rib chiqyapman. Sening kuning qanday o‘tyapti?';
  }

  if (/(kimsan|isming|nima qila olasan|so‘zapp|sozapp|ilova|dastur)/i.test(lower)) {
    return (
      'Men Kikiman — So‘zApp ilovasining mehribon panda do‘stingman! 🐼\n\n' +
      'Bu yerda darslar, qiziqarli o‘yinlar, So‘zlar shahridagi 10 ta bino va haftalik turnir bor. Menga istalgan mavzuda savol berishing mumkin!'
    );
  }

  if (/(rahmat|raxmat|tashakkur|zo‘r|zor|ajoyib|barakalla|super)/i.test(lower)) {
    return 'Arzimaydi! 🌟 Sen bilan suhbatlashish juda maroqli. Yana nimani muhokama qilamiz?';
  }

  if (/(ertak|hikoya|latifa|qiziq|kulgi|topishmoq)/i.test(lower)) {
    return (
      'Mana Kikidan qisqa ertak: 🐼✨\n\n' +
      'Bir kuni ko‘k panda Kiki So‘zlar shahrida oltin kalit topib olibdi. Oltin kalit faqat yaxshi so‘z aytilganda ochilar ekan. ' +
      'Kiki «Salom, do‘stlar!» degan ekan, barcha eshiklar ochilib, quvnoq musiqa yangrab ketibdi!'
    );
  }

  if (/(o‘yin|oyin|shahar|bino|tanga|yulduz|turnir)/i.test(lower)) {
    return (
      '«O‘yinlar» bo‘limida 3 ta qiziqarli o‘yin bor, «So‘zlar shahri»da esa har bir ochilgan bino senga +20 tanga beradi! 🎮🪙'
    );
  }

  if (/(charchadim|qiyin|zerikdim|xafa|uddalay olmayman)/i.test(lower)) {
    return (
      'Hechqisi yo‘q, do‘stim! «Kiki bilan kichik harakat — katta natija» 💙 Biroz dam ol, keyin esa xohlagan o‘yiningni o‘ynaymiz.'
    );
  }

  const asksAboutPronunciation =
    /(tovush|harf|talaffuz|artikul|logoped|bo‘g‘in|mashq)/i.test(lower);

  if (asksAboutPronunciation) {
    if (/(ruscha|o‘zbekcha|farqi)/i.test(lower)) {
      return (
        'O‘zbekcha «R» va ruscha «Р» farqi:\n\n' +
        '• O‘zbekcha «R» (Arra, Bahor): til uchi 1–2 marta yumshoq tegadi.\n' +
        '• Ruscha «Р» (Ракета, Рыба): til uchi 3–4 marta kuchliroq titraydi.'
      );
    }
    if (/\bsh\b|«sh»|"sh"|ш/i.test(lower)) {
      return '«Sh» tovushi uchun lablarni oldinga biroz cho‘zib, til uchini yuqori tishlar orqasiga ko‘taring: QU-YOSH, SHA-MOL, MA-SHI-NA!';
    }
    if (/\bch\b|«ch»|"ch"|ч/i.test(lower)) {
      return '«Ch» tovushi uchun til uchini yuqori tanglayga bosib havoni qisqa oching: CHOY, OL-CHA, CHI-ROQ!';
    }
    if (/\bs\b|«s»|"s"|с/i.test(lower)) {
      return '«S» tovushi uchun yengil tabassum qilib, salqin havo chiqaring: SO-AT, SAB-ZI, OS-MON!';
    }
    if (/\bl\b|«l»|"l"|л/i.test(lower)) {
      return '«L» tovushi uchun til uchini yuqori old tishlarga yumshoq bosing: LO-LA, QA-LAM, OL-MA!';
    }
    if (/\b(j|z)\b|«j»|«z»|"j"|"z"/i.test(lower)) {
      return '«J» va «Z» tovushlarida ovoz paychalari titraydi: JO‘-JA, ZEB-RA, U-ZUM, JI-RA-FA!';
    }
    if (/\br\b|«r»|"r"|р/i.test(lower)) {
      return '«R» tovushi mashqi: avval tez-tez «d-d-d» deng, keyin «dr-r-r» deb titrating: AR-RA, DA-RAXT, BA-RA-BAN!';
    }
  }

  return persona === 'parent_therapist'
    ? `Savolingiz («${trimmed}») uchun rahmat! Har kuni bola bilan iliq muloqot qilish va So‘zApp mashqlarini muntazam bajarish nutq ravonligini oshiradi. Yana qanday savolingiz bor?`
    : `Juda qiziq savol («${trimmed}»)! 🐼 Men Kikiman — sen bilan maktab, sevimli mashg‘ulotlar, ertaklar yoki istagan mavzungda suhbatlashishga tayyorman. Yana nima haqida gaplashamiz?`;
}

export const KikiChatView: React.FC<KikiChatViewProps> = ({ sfxEnabled }) => {
  const [persona, setPersona] = useState<'child' | 'parent_therapist'>('child');
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusIndicator, setStatusIndicator] = useState<string>('Kiki AI tayyor');

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

    const historyForApi = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/kiki-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          persona,
          useSearch,
          fastMode,
        }),
      });

      const rawText = await res.text();
      let parsed: {
        reply?: string;
        sources?: ChatSource[];
        fallback?: boolean;
        statusLabel?: string;
        error?: string;
      } | null = null;

      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = null;
      }

      if (!res.ok || !parsed || !parsed.reply) {
        const fallbackReply = generateClientConversationalFallback(trimmed, persona);
        setStatusIndicator('Kiki suhbat yordamchisi faol');
        setMessages((prev) => [
          ...prev,
          {
            id: `model-fallback-${Date.now()}`,
            role: 'model',
            text: fallbackReply,
            sources: [],
            isFallback: true,
          },
        ]);
        return;
      }

      setStatusIndicator(
        parsed.statusLabel ||
          (parsed.fallback ? 'Kiki suhbat yordamchisi faol' : 'Gemini AI faol')
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: parsed.reply || generateClientConversationalFallback(trimmed, persona),
          sources: Array.isArray(parsed.sources) ? parsed.sources : [],
          isFallback: Boolean(parsed.fallback),
        },
      ]);
    } catch {
      const fallbackReply = generateClientConversationalFallback(trimmed, persona);
      setStatusIndicator('Kiki suhbat yordamchisi faol');
      setMessages((prev) => [
        ...prev,
        {
          id: `model-offline-${Date.now()}`,
          role: 'model',
          text: fallbackReply,
          sources: [],
          isFallback: true,
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
      <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-2.5 sm:mb-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <KikiMascot
              mood={isLoading ? 'listening' : 'idle'}
              size="sm"
              className="!w-10 !h-10 sm:!w-12 sm:!h-12 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-xl text-slate-900 truncate">
                Kiki AI Suhbatdosh
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                <span className="text-[#008ECC] font-bold">{statusIndicator}</span>
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
              className="sm:hidden btn-3d bg-[#E5F8FF] text-[#008ECC] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-xl px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap"
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
              className="btn-3d bg-white hover:bg-slate-50 text-slate-600 border-2 border-[#E5E5E5] border-b-[4px] border-b-slate-300 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Suhbatni tozalash</span>
            </button>
          </div>
        </div>

        {/* Role & Grounding Toggles (Collapsible on mobile, compact row on desktop) */}
        <div
          className={`${
            showMobileControls ? 'flex' : 'hidden sm:flex'
          } mt-2.5 pt-2.5 border-t border-slate-100 flex-wrap items-center justify-between gap-2`}
        >
          <div
            className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-[#E5E5E5] max-w-full overflow-x-auto no-scrollbar"
            role="group"
            aria-label="Suhbat rolini tanlash"
          >
            <button
              type="button"
              onClick={() => handlePersonaChange('child')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all min-h-[32px] ${
                persona === 'child'
                  ? 'bg-[#00BFFF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-emerald-50 border-[#58CC02] text-[#3B8700]'
                  : 'bg-white border-[#E5E5E5] text-slate-500'
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
                  ? 'bg-amber-50 border-[#FFC800] text-amber-800'
                  : 'bg-white border-[#E5E5E5] text-slate-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{fastMode && !useSearch ? 'Tezkor' : 'Standart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tall, ChatGPT-like Scrollable Conversation Thread */}
      <div className="flex-1 min-h-[360px] sm:min-h-[420px] overflow-y-auto overscroll-contain bg-slate-50/75 border-2 border-[#E5E5E5] rounded-2xl sm:rounded-3xl p-3 sm:p-5 space-y-3.5">
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
                    : 'bg-white border-2 border-[#E5E5E5] text-slate-800 font-semibold rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-extrabold text-[#008ECC] flex items-center gap-1">
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
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#008ECC] bg-[#E5F8FF] hover:bg-[#D2F2FF] px-2.5 py-1 rounded-lg transition-colors max-w-full"
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
            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm font-bold text-[#008ECC] flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Kiki javob tayyorlamoqda...</span>
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Always-Visible Sticky Bottom Composer Bar (Pinned Above Mobile Bottom Nav) */}
      <div className="sticky bottom-[62px] lg:bottom-0 z-20 shrink-0 bg-white/95 backdrop-blur-md pt-2 pb-1.5 mt-2 space-y-2">
        {/* 1-Row Horizontal Scrollable Quick Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage(suggestion)}
              className="text-[11px] sm:text-xs font-bold text-[#008ECC] bg-[#E5F8FF] hover:bg-[#D2F2FF] border border-[#00BFFF]/40 rounded-xl px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input & Prominent 3D Send Button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full min-w-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Xabar yozing..."
            aria-label="Xabar yozing"
            disabled={isLoading}
            className="flex-1 min-w-0 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#00BFFF] focus:outline-none px-3.5 sm:px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 bg-white"
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

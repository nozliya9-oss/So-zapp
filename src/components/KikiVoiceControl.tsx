import React, { useState } from 'react';
import { Sparkles, Volume2 } from 'lucide-react';
import { KikiVoiceStyle } from '../types';
import { KikiMascot } from './KikiMascot';
import { useKikiVoice } from '../context/KikiVoiceContext';
import {
  normalizeKikiVoiceStyle,
  playButtonPop,
  speakWord,
  stopKikiSpeaking,
  unlockKikiAudio,
} from '../utils/soundEffects';

interface KikiVoiceControlProps {
  voiceStyle?: KikiVoiceStyle | string;
  sfxEnabled: boolean;
  onChangeVoiceStyle?: (style: KikiVoiceStyle) => void;
  compact?: boolean;
}

const TEST_PHRASE = 'Salom, men Kikiman! Keling, birga gaplashamiz!';

export const KikiVoiceControl: React.FC<KikiVoiceControlProps> = ({
  voiceStyle: propVoiceStyle,
  sfxEnabled,
  onChangeVoiceStyle,
  compact = false,
}) => {
  const { voiceStyle: contextVoiceStyle, setVoiceStyle } = useKikiVoice();
  const activeStyle = normalizeKikiVoiceStyle(propVoiceStyle || contextVoiceStyle);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSelectStyle = (style: KikiVoiceStyle) => {
    unlockKikiAudio();
    stopKikiSpeaking();
    setIsSpeaking(false);
    playButtonPop(!sfxEnabled);
    setVoiceStyle(style);
    onChangeVoiceStyle?.(style);
  };

  const handleTestVoice = () => {
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    setVoiceStyle(activeStyle);
    speakWord(
      TEST_PHRASE,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      activeStyle
    );
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-2 border-[#BCEEFF] dark:border-slate-700 rounded-2xl ${
        compact ? 'p-3.5' : 'p-4 sm:p-5'
      } flex flex-col sm:flex-row sm:items-center justify-between gap-3.5`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <KikiMascot
          mood={isSpeaking ? 'happy' : 'idle'}
          size="sm"
          isSpeaking={isSpeaking}
          className="!w-20 !h-20 shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00BFFF] shrink-0" />
            <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Kiki ovozi (Kichik bola ovozlari)
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {activeStyle === 'child_girl'
              ? 'Kichik qizaloq ovozi · mayin, shirin va nafis yosh qizaloq ovozi'
              : 'Mitti bola ovozi · quvnoq, jonli va o‘yinqaroq kichkina o‘g‘il bola ovozi'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div
          className="flex flex-wrap items-center bg-[#F0FAFF] dark:bg-slate-800 p-1 rounded-xl border border-[#BCEEFF] dark:border-slate-700 gap-1"
          role="group"
          aria-label="Kiki bola ovozini tanlash"
        >
          <button
            type="button"
            aria-pressed={activeStyle === 'child_boy'}
            onClick={() => handleSelectStyle('child_boy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap ${
              activeStyle === 'child_boy'
                ? 'bg-[#00BFFF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#008ECC]'
            }`}
          >
            Mitti bola
          </button>
          <button
            type="button"
            aria-pressed={activeStyle === 'child_girl'}
            onClick={() => handleSelectStyle('child_girl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap ${
              activeStyle === 'child_girl'
                ? 'bg-[#00BFFF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#008ECC]'
            }`}
          >
            Kichik qizaloq
          </button>
        </div>

        <button
          type="button"
          onClick={handleTestVoice}
          className="btn-3d px-3.5 py-2 rounded-xl bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white font-display font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span>{isSpeaking ? 'Gapirmoqda...' : 'Ovozni sinash'}</span>
        </button>
      </div>
    </div>
  );
};

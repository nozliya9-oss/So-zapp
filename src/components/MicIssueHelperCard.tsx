import React, { useEffect, useState } from 'react';
import { AlertTriangle, Mic, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { KikiMascot } from './KikiMascot';
import { useKikiVoice } from '../context/KikiVoiceContext';
import {
  playButtonPop,
  speakWord,
  stopKikiSpeaking,
  unlockKikiAudio,
} from '../utils/soundEffects';

export const MIC_ISSUE_MESSAGE =
  'Menimcha, sizning mikrofoningizda muammo bor — kattalardan birortasini yordamga chaqiring!';

interface MicIssueHelperCardProps {
  issueKey: number;
  sfxEnabled: boolean;
  onRetry: () => void;
  onFallbackAction?: () => void;
  fallbackLabel?: string;
  detailHint?: string | null;
}

export const MicIssueHelperCard: React.FC<MicIssueHelperCardProps> = ({
  issueKey,
  sfxEnabled,
  onRetry,
  onFallbackAction,
  fallbackLabel,
  detailHint,
}) => {
  const { voiceStyle } = useKikiVoice();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (issueKey <= 0) return;
    unlockKikiAudio();
    speakWord(
      MIC_ISSUE_MESSAGE,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      voiceStyle
    );

    return () => {
      stopKikiSpeaking();
      setIsSpeaking(false);
    };
  }, [issueKey, voiceStyle]);

  const handleReplay = () => {
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    speakWord(
      MIC_ISSUE_MESSAGE,
      'uz-UZ',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      voiceStyle
    );
  };

  const handleRetry = () => {
    unlockKikiAudio();
    playButtonPop(!sfxEnabled);
    stopKikiSpeaking();
    setIsSpeaking(false);
    onRetry();
  };

  return (
    <div
      role="alert"
      className="bg-amber-50/95 dark:bg-amber-950/45 border-2 border-[#FFC800] rounded-3xl p-4 sm:p-5 text-left space-y-3.5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
        <KikiMascot
          mood={isSpeaking ? 'happy' : 'retry'}
          size="sm"
          isSpeaking={isSpeaking}
          className="!w-20 !h-20 shrink-0"
        />

        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-[#FFC800]/25 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Mikrofon yordami</span>
          </div>

          <p className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-amber-100 leading-snug">
            {MIC_ISSUE_MESSAGE}
          </p>

          <p className="text-xs font-semibold text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            <strong>Kattalar uchun maslahat:</strong> Brauzer manzil satridagi qulf/sozlama
            belgisidan mikrofon ruxsatini («Allow») yoqing va qurilma mikrofoni ulanganini
            tekshiring.
            {detailHint ? ` (${detailHint})` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
        <button
          type="button"
          onClick={handleReplay}
          className="btn-3d bg-[#00BFFF] hover:bg-[#00AEEC] border-[#008ECC] text-white rounded-xl px-3.5 py-2 font-display font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span>{isSpeaking ? 'Kiki aytmoqda...' : 'Qayta eshitish'}</span>
        </button>

        <button
          type="button"
          onClick={handleRetry}
          className="btn-3d bg-[#58CC02] hover:bg-[#4EC002] border-[#46A302] text-white rounded-xl px-3.5 py-2 font-display font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <Mic className="w-3.5 h-3.5" />
          <span>Qayta urinish</span>
        </button>

        {onFallbackAction && fallbackLabel && (
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              stopKikiSpeaking();
              setIsSpeaking(false);
              onFallbackAction();
            }}
            className="btn-3d bg-white dark:bg-slate-800 hover:bg-[#E5F8FF] dark:hover:bg-slate-700 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-xl px-3.5 py-2 font-display font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{fallbackLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

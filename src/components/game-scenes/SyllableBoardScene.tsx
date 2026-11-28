import React from 'react';
import { RefreshCw, Volume2 } from 'lucide-react';
import { SyllableWordItem } from '../../data/gamesPathData';
import { KikiMascot } from '../KikiMascot';
import { ItemIllustration } from './GameItemArtwork';

interface SyllableBoardSceneProps {
  puzzle: SyllableWordItem;
  wordIndex: number;
  totalWords: number;
  picked: string[];
  solvedWord: boolean;
  isSpeaking: boolean;
  onSpeakWord: () => void;
  onPickSyllable: (syllable: string) => void;
  onRemoveSlot: (slotIndex: number) => void;
  onClearAll: () => void;
}

/**
 * Tactile Wooden Table & Learning Board Scene for "Bo‘g‘inlar o‘yini" (5 words per stage):
 * Top: Pinned custom-illustrated target word card + Kiki speaker buddy.
 * Middle: Recessed wooden syllable slots with snap-in animation.
 * Bottom: Tactile 3D syllable tiles.
 */
export const SyllableBoardScene: React.FC<SyllableBoardSceneProps> = ({
  puzzle,
  wordIndex,
  totalWords,
  picked,
  solvedWord,
  isSpeaking,
  onSpeakWord,
  onPickSyllable,
  onRemoveSlot,
  onClearAll,
}) => {
  return (
    <div className="rounded-3xl border-2 border-[#D97706]/40 dark:border-slate-700 bg-gradient-to-b from-[#FEF9EC] via-[#FFFDF7] to-[#FEF3C7] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Top Board Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200">
          <span className="tabular-nums text-violet-700 dark:text-violet-300">
            So‘z {wordIndex + 1} / {totalWords}
          </span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-[#008ECC] dark:text-[#38BDF8]">
            «{puzzle.soundLabel}» tovushi
          </span>
        </div>

        <button
          type="button"
          onClick={onSpeakWord}
          className="btn-3d bg-[#00BFFF] hover:bg-[#00AEEC] text-white border-[#008ECC] rounded-xl px-4 py-2 text-xs font-display font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span>So‘zni eshitish</span>
        </button>
      </div>

      {/* Tactile Pinned Word Picture Card + Kiki */}
      <div className="relative bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-2xs">
        {/* Decorative wooden board pins */}
        <span aria-hidden="true" className="hidden sm:block absolute top-3 left-3 w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-[#B45309]" />
        <span aria-hidden="true" className="hidden sm:block absolute top-3 right-3 w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-[#B45309]" />

        <div className="w-24 h-24 rounded-2xl bg-[#F0FAFF] dark:bg-slate-900 border-2 border-[#BCEEFF] dark:border-slate-700 flex items-center justify-center p-2 shrink-0">
          <ItemIllustration artKey={puzzle.artKey} className="w-18 h-18" />
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <KikiMascot
              mood={solvedWord ? 'happy' : 'idle'}
              size="sm"
              isSpeaking={isSpeaking}
              className="!w-16 !h-16 sm:!w-20 sm:!h-20 shrink-0"
            />
            <p className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Kikining so‘zini bo‘g‘inlardan tuzing!
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pastdagi bo‘g‘in kartochkalarini to‘g‘ri tartibda bosing ({puzzle.syllables.length} ta bo‘g‘in).
          </p>
        </div>
      </div>

      {/* Middle: Wooden Learning Table Slots */}
      <div className="bg-[#EAD4AE]/60 dark:bg-slate-950/70 border-2 border-[#D97706]/35 dark:border-slate-700 rounded-2xl p-4 sm:p-5 flex items-center justify-center gap-3 flex-wrap min-h-[92px]">
        {puzzle.syllables.map((_, i) => {
          const placed = picked[i];
          const isNextTarget = !placed && i === picked.length;
          return (
            <button
              key={i}
              type="button"
              disabled={!placed || solvedWord}
              onClick={() => placed && onRemoveSlot(i)}
              aria-label={placed ? `${placed} bo‘g‘inini qaytarish` : `${i + 1}-bo‘sh katak`}
              className={`min-w-[88px] h-14 rounded-2xl border-2 flex items-center justify-center font-display font-bold text-xl px-4 transition-colors ${
                placed
                  ? 'animate-syllable-snap bg-[#00BFFF] border-[#008ECC] text-white shadow-xs cursor-pointer'
                  : isNextTarget
                    ? 'bg-white dark:bg-slate-800 border-dashed border-[#00BFFF] text-[#008ECC]'
                    : 'bg-white/75 dark:bg-slate-800/75 border-dashed border-amber-400/70 dark:border-slate-600 text-slate-400'
              }`}
            >
              {placed || `${i + 1}`}
            </button>
          );
        })}
      </div>

      {/* Bottom: 3D Tactile Syllable Tiles */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {puzzle.scrambled.map((syl) => {
          const used = picked.includes(syl);
          return (
            <button
              key={syl}
              type="button"
              disabled={used || solvedWord}
              onClick={() => onPickSyllable(syl)}
              className={`btn-3d px-6 py-3 rounded-2xl font-display font-bold text-lg sm:text-xl ${
                used
                  ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 opacity-55'
                  : 'bg-white dark:bg-slate-800 hover:bg-[#E5F8FF] dark:hover:bg-slate-700 border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC] text-[#008ECC] dark:text-[#38BDF8]'
              }`}
            >
              {syl}
            </button>
          );
        })}

        <button
          type="button"
          disabled={picked.length === 0 || solvedWord}
          onClick={onClearAll}
          className="px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 disabled:opacity-45 flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tozalash</span>
        </button>
      </div>
    </div>
  );
};

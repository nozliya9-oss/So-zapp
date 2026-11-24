import React from 'react';
import { Building2, Crown, MessageCircle, Play, ShieldCheck, Star, Target } from 'lucide-react';
import { CITY_BUILDINGS } from '../data/lessonsData';
import { LessonNode, UserProfile } from '../types';
import { KikiMascot } from './KikiMascot';
import { playButtonPop } from '../utils/soundEffects';

interface RightPanelProps {
  stars: number;
  todayWordsCompleted: number;
  activeNode: LessonNode | null;
  profile: UserProfile;
  sfxEnabled: boolean;
  onStartActiveLesson: (node: LessonNode) => void;
  onOpenCity: () => void;
  onOpenTournament: () => void;
  onOpenChat: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  stars,
  todayWordsCompleted,
  activeNode,
  profile,
  sfxEnabled,
  onStartActiveLesson,
  onOpenCity,
  onOpenTournament,
  onOpenChat,
}) => {
  const dailyTargetWords = Math.max(10, profile.dailyWordGoal || 10);
  const clampedDone = Math.min(dailyTargetWords, todayWordsCompleted);
  const goalPct = Math.min(100, Math.round((clampedDone / dailyTargetWords) * 100));

  // Find the very NEXT locked building in sequence out of all 10 buildings
  const nextBuilding = CITY_BUILDINGS.find((b) => stars < b.unlockStars) || null;
  const remainingStars = nextBuilding ? Math.max(0, nextBuilding.unlockStars - stars) : 0;
  const nextBuildingPct = nextBuilding
    ? Math.min(100, Math.round((stars / nextBuilding.unlockStars) * 100))
    : 100;

  return (
    <aside className="hidden xl:flex flex-col w-[328px] shrink-0 border-l-2 border-[#E5E5E5] bg-white px-5 py-6 space-y-5">
      {/* Real Actionable Today's Goal */}
      <div className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00BFFF]" />
            <span>Bugungi maqsad</span>
          </h3>
          <span className="text-xs font-extrabold text-[#008ECC] tabular-nums">
            {clampedDone} / {dailyTargetWords} so‘z
          </span>
        </div>

        <p className="text-xs font-bold text-slate-700 mb-2.5">
          {activeNode
            ? `Bugungi tovush: «${activeNode.targetSound}» (${activeNode.dayLabel})`
            : `Asosiy tovush: «${profile.focusSound}»`}
        </p>

        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>

        <p className="text-xs font-semibold text-slate-500 mt-2">
          {clampedDone >= dailyTargetWords
            ? 'Barakalla! Bugungi maqsad to‘liq bajarildi.'
            : `Bugungi mashqni yakunlash uchun yana ${dailyTargetWords - clampedDone} ta so‘zni to‘g‘ri ayting.`}
        </p>

        {activeNode && (
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onStartActiveLesson(activeNode);
            }}
            className="btn-3d w-full mt-3 bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-2xl py-2.5 px-4 font-display font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Bugungi mashqni boshlash</span>
          </button>
        )}
      </div>

      {/* Next Building in So‘zlar Shahri */}
      <div className="bg-[#E5F8FF]/70 border-2 border-[#00BFFF]/40 rounded-3xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#008ECC]" />
            <span>So‘zlar shahri</span>
          </h3>
          <span className="text-xs font-extrabold text-amber-600 tabular-nums">
            {stars} ⭐
          </span>
        </div>

        <div className="flex items-center gap-3 my-2">
          <KikiMascot mood="idle" size="sm" className="!w-14 !h-14 shrink-0" />
          <div className="text-xs font-bold text-slate-700 leading-snug">
            {nextBuilding ? (
              <>
                Keyingi bino:{' '}
                <span className="text-[#008ECC] font-extrabold">{nextBuilding.name}</span>.
                Ochish uchun yana{' '}
                <span className="text-amber-600 font-extrabold tabular-nums">
                  {remainingStars} ⭐
                </span>{' '}
                kerak.
              </>
            ) : (
              <span className="text-[#46A302] font-extrabold">
                Ajoyib! Shahardagi barcha 10 ta bino ochildi!
              </span>
            )}
          </div>
        </div>

        {nextBuilding && (
          <div className="mb-3">
            <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-[#00BFFF]/30">
              <div
                className="h-full bg-[#FFC800] rounded-full transition-all duration-500"
                style={{ width: `${nextBuildingPct}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            onOpenCity();
          }}
          className="btn-3d w-full bg-white hover:bg-slate-50 text-[#008ECC] border-2 border-[#00BFFF] border-b-[4px] border-b-[#008ECC] rounded-2xl py-2 px-4 font-display font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <Star className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
          <span>Shahar xaritasini ko‘rish</span>
        </button>
      </div>

      {/* Tournament & AI Therapist Shortcuts */}
      <div className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#FFC800] fill-[#FFC800]" />
            <span>Haftalik turnir: Top-1</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onOpenTournament();
            }}
            className="text-xs font-extrabold text-[#008ECC] hover:underline"
          >
            Ochish →
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            onOpenChat();
          }}
          className="btn-3d w-full bg-[#58CC02] hover:bg-[#4EC000] text-white border-[#46A302] rounded-xl py-2.5 px-3 font-display font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Kiki AI bilan suhbat</span>
        </button>
      </div>

      {/* Trust & Slogan Reminder */}
      <div className="mt-auto pt-1 text-center px-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#00BFFF] shrink-0" />
          <span>100% xavfsiz bolalar muhiti</span>
        </div>
        <p className="font-display font-bold text-xs text-[#008ECC] mt-1">
          Kiki bilan kichik harakat — katta natija
        </p>
      </div>
    </aside>
  );
};

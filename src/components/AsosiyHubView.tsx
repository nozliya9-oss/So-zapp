import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Lock,
  Sparkles,
  Stethoscope,
  Trophy,
  Video,
  X,
} from 'lucide-react';
import {
  DiagnosticReport,
  HomeSubView,
  LessonNode,
  UserProfile,
} from '../types';
import { KikiMascot } from './KikiMascot';
import { playButtonPop } from '../utils/soundEffects';

interface AsosiyHubViewProps {
  profile: UserProfile;
  stars: number;
  activeNode: LessonNode | null;
  diagnosticReport: DiagnosticReport | null;
  sfxEnabled: boolean;
  onOpenSubView: (view: Exclude<HomeSubView, 'hub'>) => void;
}

export const AsosiyHubView: React.FC<AsosiyHubViewProps> = ({
  profile,
  stars,
  activeNode,
  diagnosticReport,
  sfxEnabled,
  onOpenSubView,
}) => {
  const [lockedNoticeSection, setLockedNoticeSection] = useState<
    'video' | 'therapist' | null
  >(null);

  const handleLockedCardClick = (section: 'video' | 'therapist') => {
    playButtonPop(!sfxEnabled);
    setLockedNoticeSection(section);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-5">
      {/* Kiki Hero Greeting Banner */}
      <section className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <KikiMascot mood="happy" size="md" className="shrink-0 !w-20 !h-20 sm:!w-24 sm:!h-24" />
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl text-xs font-extrabold tracking-wide mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ASOSIY BO‘LIM · SO‘ZAPP</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                Salom, {profile.firstName}!
              </h1>
              <p className="text-sm text-white/95 font-semibold mt-1">
                Kiki bilan kichik harakat — katta natija! Bugun qaysi bo‘limdan boshlaymiz?
              </p>
            </div>
          </div>

          <div className="bg-white/20 border-2 border-white/35 rounded-2xl px-4 py-2.5 text-center shrink-0 self-start sm:self-auto">
            <div className="text-[11px] font-bold text-white/90">Asosiy tovush</div>
            <div className="font-display font-bold text-xl">
              «{profile.focusSound}»
            </div>
          </div>
        </div>
      </section>

      {/* Friendly Inline Notice for Locked Sections */}
      {lockedNoticeSection && (
        <div
          role="status"
          className="bg-amber-50 dark:bg-amber-950/50 border-2 border-[#FFC800] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFC800] text-slate-900 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-amber-100">
                {lockedNoticeSection === 'therapist'
                  ? '«Logoped bilan suhbat» — Bu bo‘lim tez kunda tayyor bo‘ladi'
                  : '«Video darslar» — Bu bo‘lim tez kunda tayyor bo‘ladi'}
              </div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200/90 mt-0.5">
                Hozircha «Imtihon», «Darslar» va «Turnir» bo‘limlaridan bemalol foydalanishingiz mumkin!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLockedNoticeSection(null)}
            className="p-1.5 rounded-xl text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 shrink-0"
            aria-label="Xabarni yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Core Section Cards — Full-Width Vertical Stack */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* a) Imtihon */}
        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            onOpenSubView('diagnostic');
          }}
          className="btn-3d w-full text-left bg-white dark:bg-slate-800/95 hover:bg-[#F0FAFF] dark:hover:bg-slate-800 border-2 border-[#00BFFF] border-b-[6px] border-b-[#008ECC] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E5F8FF] dark:bg-[#00BFFF]/20 border-2 border-[#00BFFF]/40 text-[#008ECC] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Imtihon
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  25 so‘zlik nutq diagnostikasi va harfma-harf talaffuz foizlari hisoboti.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] text-xs font-extrabold tabular-nums whitespace-nowrap shrink-0">
              {diagnosticReport
                ? `${diagnosticReport.overallScore}% natija`
                : '25 ta so‘z'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-sm font-display font-bold text-[#008ECC] dark:text-[#38BDF8]">
            <span>
              {diagnosticReport ? 'Hisobotni ko‘rish / Qayta' : 'Imtihonni boshlash'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* b) Darslar */}
        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            onOpenSubView('lessons');
          }}
          className="btn-3d w-full text-left bg-white dark:bg-slate-800/95 hover:bg-emerald-50/70 dark:hover:bg-slate-800 border-2 border-[#58CC02] border-b-[6px] border-b-[#46A302] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-[#58CC02]/20 border-2 border-[#58CC02]/40 text-[#46A302] dark:text-[#7CE82B] flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Darslar
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {activeNode
                    ? `Navbatdagi dars: ${activeNode.title}`
                    : 'Tovushlar sikli va shaxsiy biriktirilgan mashqlar.'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-[#58CC02]/20 text-[#3B8700] dark:text-[#7CE82B] text-xs font-extrabold whitespace-nowrap shrink-0">
              5 haftalik yo‘l
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-sm font-display font-bold text-[#46A302] dark:text-[#7CE82B]">
            <span>Darslarni ochish</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* c) Turnir */}
        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            onOpenSubView('tournament');
          }}
          className="btn-3d w-full text-left bg-white dark:bg-slate-800/95 hover:bg-amber-50/70 dark:hover:bg-slate-800 border-2 border-[#FF9600] border-b-[6px] border-b-[#CC7800] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 dark:bg-[#FF9600]/20 border-2 border-[#FF9600]/40 text-[#CC7800] dark:text-[#FFC800] flex items-center justify-center shrink-0">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Turnir
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Haftalik yulduzlar musobaqasi va ishtirokchilar reyting jadvali.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-[#FF9600]/20 text-amber-800 dark:text-[#FFC800] text-xs font-extrabold tabular-nums whitespace-nowrap shrink-0">
              Top-1 · {stars} ⭐
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-sm font-display font-bold text-[#CC7800] dark:text-[#FFC800]">
            <span>Turnirga kirish</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* d) Video darslar (Visually locked & muted/grayscale + "Tez kunda" badge + Lock icon) */}
        <button
          type="button"
          onClick={() => handleLockedCardClick('video')}
          aria-label="Video darslar — Tez kunda (qulflangan)"
          className="relative w-full text-left bg-slate-100 dark:bg-slate-800/70 border-2 border-slate-300 dark:border-slate-700 border-b-[6px] border-b-slate-400 dark:border-b-slate-900 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 grayscale opacity-85 hover:opacity-95 transition-opacity cursor-pointer"
        >
          {/* Top "Tez kunda" badge + lock */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Video className="w-7 h-7 sm:w-8 sm:h-8 opacity-50" />
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-slate-700 dark:bg-slate-900 text-white border-2 border-white dark:border-slate-700 flex items-center justify-center shadow-xs">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-600 dark:text-slate-300">
                  Video darslar
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Logoped bilan ko‘rgazmali video mashg‘ulotlar va artikulyatsiya darslari.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-700 dark:bg-slate-900 text-white text-xs font-extrabold shadow-xs whitespace-nowrap shrink-0">
              <Lock className="w-3 h-3" />
              <span>Tez kunda</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {lockedNoticeSection === 'video'
                  ? 'Bu bo‘lim tez kunda tayyor bo‘ladi'
                  : 'Qulflangan bo‘lim'}
              </span>
            </span>
            <span>Tez kunda</span>
          </div>
        </button>

        {/* e) Logoped bilan suhbat (Locked coming-soon card matching Video darslar) */}
        <button
          type="button"
          onClick={() => handleLockedCardClick('therapist')}
          aria-label="Logoped bilan suhbat — Tez kunda (qulflangan)"
          className="relative w-full text-left bg-slate-100 dark:bg-slate-800/70 border-2 border-slate-300 dark:border-slate-700 border-b-[6px] border-b-slate-400 dark:border-b-slate-900 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 grayscale opacity-85 hover:opacity-95 transition-opacity cursor-pointer"
        >
          {/* Top "Tez kunda" badge + lock */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 opacity-50" />
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-slate-700 dark:bg-slate-900 text-white border-2 border-white dark:border-slate-700 flex items-center justify-center shadow-xs">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-600 dark:text-slate-300">
                  Logoped bilan suhbat
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Malakali logoped mutaxassis bilan jonli maslahat va shaxsiy tavsiyalar.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-700 dark:bg-slate-900 text-white text-xs font-extrabold shadow-xs whitespace-nowrap shrink-0">
              <Lock className="w-3 h-3" />
              <span>Tez kunda</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {lockedNoticeSection === 'therapist'
                  ? 'Bu bo‘lim tez kunda tayyor bo‘ladi'
                  : 'Qulflangan bo‘lim'}
              </span>
            </span>
            <span>Tez kunda</span>
          </div>
        </button>
      </div>
    </div>
  );
};

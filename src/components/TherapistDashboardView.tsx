import React from 'react';
import {
  Activity,
  Award,
  ClipboardCheck,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import {
  DiagnosticReport,
  SoundKey,
  SoundStat,
  UserProfile,
  WeeklyAssessmentRecord,
} from '../types';

interface TherapistDashboardViewProps {
  profile: UserProfile;
  soundStats: SoundStat[];
  weeklyAssessments: WeeklyAssessmentRecord[];
  diagnosticReport?: DiagnosticReport | null;
}

const SOUND_KEYS: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];

export const TherapistDashboardView: React.FC<TherapistDashboardViewProps> = ({
  profile,
  soundStats,
  weeklyAssessments,
  diagnosticReport,
}) => {
  const avgAccuracy = Math.round(
    soundStats.reduce((sum, s) => sum + s.accuracy, 0) / Math.max(1, soundStats.length)
  );
  const latestAssessment = weeklyAssessments[weeklyAssessments.length - 1];

  return (
    <div className="space-y-6">
      {/* Therapist Header */}
      <div>
        <p className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
          MUTAXASSIS KUZATUVI · LOGOPED PROFILI
        </p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-[#008ECC] dark:text-[#38BDF8]" />
          <span>Logoped profili va diagnostika</span>
        </h2>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
          O‘quvchi:{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {profile.firstName} {profile.lastName}
          </span>{' '}
          ({profile.age} yosh) · Fokus tovush: «{profile.focusSound}»
        </p>
      </div>

      {/* Clinical Acoustic & 6-Sound Diagnostic Summary */}
      <section className="bg-[#E5F8FF] dark:bg-[#00BFFF]/15 border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[#008ECC] dark:text-[#38BDF8] font-display font-bold text-sm">
              <Activity className="w-5 h-5" />
              <span>Klinik Ovoz Biometrikasi va Talaffuz Tahlili</span>
            </div>
            <p className="font-bold text-base text-slate-900 dark:text-white leading-snug">
              {profile.firstName} 6 ta asosiy tovush (R, S, Sh, L, Ch, J/Z) bo‘yicha o‘rtacha{' '}
              <span className="text-[#008ECC] dark:text-[#38BDF8] font-extrabold tabular-nums">
                {avgAccuracy}%
              </span>{' '}
              aniqlik ko‘rsatmoqda.
              {latestAssessment?.previousWeekScore !== null && latestAssessment && (
                <>
                  {' '}
                  Oxirgi haftalik sinovda{' '}
                  <span className="text-[#46A302] dark:text-[#7CE82B] font-extrabold tabular-nums">
                    {latestAssessment.overallScore - (latestAssessment.previousWeekScore || 0) >= 0
                      ? `+${latestAssessment.overallScore - (latestAssessment.previousWeekScore || 0)}%`
                      : `${latestAssessment.overallScore - (latestAssessment.previousWeekScore || 0)}%`}
                  </span>{' '}
                  o‘zgarish qayd etildi.
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-white dark:bg-slate-800 border border-[#00BFFF]/40 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                6-tovush o‘rtacha
              </div>
              <div className="font-display font-bold text-xl text-[#008ECC] dark:text-[#38BDF8] tabular-nums">
                {avgAccuracy}%
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-[#00BFFF]/40 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Asosiy chastota
              </div>
              <div className="font-display font-bold text-xl text-slate-900 dark:text-white tabular-nums">
                244 Hz
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-[#00BFFF]/40 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Saqlangan sinovlar
              </div>
              <div className="font-display font-bold text-xl text-[#46A302] dark:text-[#7CE82B] tabular-nums">
                {weeklyAssessments.length} ta
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Sound Accuracy Matrix */}
      <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFC800]" />
            <span>6 kunlik sikl tovushlari aniqligi</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            R · S · Sh · L · Ch · J/Z
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {soundStats.map((stat) => {
            const delta = stat.accuracy - stat.previousAccuracy;
            return (
              <div key={stat.sound}>
                <div className="flex items-center justify-between text-sm font-bold mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200">{stat.label}</span>
                  <span className="tabular-nums text-slate-900 dark:text-white">
                    {stat.accuracy}%{' '}
                    <span
                      className={`text-xs font-extrabold ${
                        delta >= 0
                          ? 'text-[#46A302] dark:text-[#7CE82B]'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ({delta >= 0 ? `+${delta}%` : `${delta}%`})
                    </span>
                  </span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-600">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.accuracy}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 25-Word Diagnostic Report Letter Breakdown (if completed) */}
      {diagnosticReport && (
        <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                25 so‘zlik diagnostika bo‘yicha klinik harflar kesimi
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Umumiy ravonlik: {diagnosticReport.overallScore}% · Zaif harflar:{' '}
                {diagnosticReport.weakestLetters.map((w) => w.letter).join(', ')}
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] tabular-nums">
              {diagnosticReport.completedAt}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {diagnosticReport.letterScores.map((ls) => {
              const badgeCls =
                ls.status === 'excellent'
                  ? 'border-[#58CC02]/50 bg-emerald-50/70 dark:bg-emerald-950/40 text-[#3B8700] dark:text-[#7CE82B]'
                  : ls.status === 'medium'
                    ? 'border-[#FFC800]/60 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'border-rose-300 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
              return (
                <div
                  key={ls.letter}
                  className={`border-2 rounded-2xl p-3 text-center ${badgeCls}`}
                >
                  <div className="font-display font-bold text-lg">«{ls.letter}»</div>
                  <div className="font-display font-bold text-base tabular-nums">
                    {ls.score}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Saved Weekly (Yakshanba) Assessment Analytics */}
      <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#FF9600]" />
              <span>Saqlangan Yakshanba haftalik baholash tahlili</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Har yakshanba o‘tkazilgan 6-tovushli sinov natijalari avtomatik saqlanadi
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Haftalar kesimidagi dinamika</span>
          </span>
        </div>

        <div className="space-y-3">
          {[...weeklyAssessments].reverse().map((rec) => {
            const diff =
              rec.previousWeekScore !== null
                ? rec.overallScore - rec.previousWeekScore
                : null;
            return (
              <div
                key={rec.id}
                className="border-2 border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div>
                    <div className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {rec.weekLabel}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {rec.completedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-display font-bold text-lg text-[#008ECC] dark:text-[#38BDF8]">
                      Umumiy: {rec.overallScore}%
                    </span>
                    {diff !== null && (
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                          diff >= 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#46A302] dark:text-[#7CE82B]'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-[#C81E1E] dark:text-rose-300'
                        }`}
                      >
                        {diff >= 0 ? `+${diff}%` : `${diff}%`} oldingi haftaga nisbatan
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
                  {SOUND_KEYS.map((key) => (
                    <div
                      key={key}
                      className="bg-white dark:bg-slate-800 border border-[#E5E5E5] dark:border-slate-700 rounded-xl py-2 px-2 text-center"
                    >
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        «{key}»
                      </div>
                      <div className="font-display font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                        {rec.soundScores[key] ?? 0}%
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {rec.notesUz}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import {
  CheckCircle2,
  Clock,
  HeartHandshake,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { WEEKLY_PRACTICE_MINUTES } from '../data/lessonsData';
import {
  PracticeSession,
  SoundStat,
  UserProfile,
  WeeklyAssessmentRecord,
} from '../types';

interface ParentDashboardViewProps {
  profile: UserProfile;
  stars: number;
  soundStats: SoundStat[];
  weeklyAssessments: WeeklyAssessmentRecord[];
  sessions: PracticeSession[];
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  profile,
  stars,
  soundStats,
  weeklyAssessments,
  sessions,
}) => {
  const totalWeeklyMins = WEEKLY_PRACTICE_MINUTES.reduce((sum, d) => sum + d.minutes, 0);
  const maxMinutes = Math.max(...WEEKLY_PRACTICE_MINUTES.map((d) => d.minutes), 25);
  const latestAssessment = weeklyAssessments[weeklyAssessments.length - 1];
  const strongestSound = [...soundStats].sort((a, b) => b.accuracy - a.accuracy)[0];
  const focusNeededSound = [...soundStats].sort((a, b) => a.accuracy - b.accuracy)[0];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-12 space-y-6">
      {/* Parent Header */}
      <div>
        <p className="text-xs font-extrabold text-[#008ECC]">
          OILA VA RIVOJLANISH KUZATUVI · OTA-ONA KABINETI
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-0.5 flex items-center gap-2">
          <Users className="w-7 h-7 text-[#008ECC]" />
          <span>Ota-ona kabineti</span>
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-0.5">
          Farzandingiz: <span className="font-bold text-slate-900">{profile.firstName} {profile.lastName}</span> · {profile.age} yosh · Jami yulduzlar:{' '}
          <span className="text-amber-600 font-extrabold tabular-nums">{stars} ⭐</span>
        </p>
      </div>

      {/* Family-Friendly Progress Summary */}
      <section className="bg-[#E5F8FF] border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[#008ECC] font-display font-bold text-sm mb-1.5">
          <HeartHandshake className="w-5 h-5" />
          <span>Farzandingiz natijalari bo‘yicha qisqa xulosa</span>
        </div>
        <p className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
          {profile.firstName} bu hafta eng yaxshi natijani «{strongestSound?.sound}» tovushida
          ({strongestSound?.accuracy}%) ko‘rsatdi. Uyda «{focusNeededSound?.sound}» tovushiga
          ({focusNeededSound?.accuracy}%) ko‘proq e’tibor berish tavsiya etiladi.
        </p>

        {latestAssessment && (
          <div className="mt-4 bg-white/90 border border-[#00BFFF]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold text-[#008ECC]">
                Oxirgi Yakshanba baholashi ({latestAssessment.weekLabel})
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {latestAssessment.notesUz}
              </div>
            </div>
            <div className="font-display font-bold text-2xl text-[#46A302] tabular-nums shrink-0">
              {latestAssessment.overallScore}%
            </div>
          </div>
        )}
      </section>

      {/* Weekly Minutes & Home Guidance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00BFFF]" />
              <span>Haftalik mashg‘ulot vaqti</span>
            </h2>
            <span className="text-xs font-extrabold text-[#008ECC] tabular-nums">
              Jami: {totalWeeklyMins} daqiqa
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4">
            {WEEKLY_PRACTICE_MINUTES.map((item) => {
              const heightPct = Math.round((item.minutes / maxMinutes) * 100);
              return (
                <div
                  key={item.day}
                  className="flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <span className="text-[11px] font-extrabold text-slate-600 tabular-nums">
                    {item.minutes}d
                  </span>
                  <div className="w-full max-w-[34px] flex-1 bg-slate-100 rounded-xl flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full bg-[#00BFFF] rounded-lg transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Home Practice Guidance for Parents */}
        <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-3.5">
          <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#58CC02]" />
            <span>Ota-onalar uchun uy tavsiyalari</span>
          </h2>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E5E5E5] flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                <span className="font-bold text-slate-900">Kuniga 10 daqiqa:</span> Bola
                charchab qolmasligi uchun har kunlik 10 so‘zlik mashqni o‘yin tarzida birga
                bajaring.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E5E5E5] flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                <span className="font-bold text-slate-900">Oyna oldida mashq:</span> «R» va
                «Sh» tovushlarida til holatini ko‘rsatish uchun oyna oldida tabassum mashqini
                qiling.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E5E5E5] flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                <span className="font-bold text-slate-900">Yakshanba natijasi:</span> Har
                yakshanba kunlik sinovda barcha 6 ta tovush natijasi avtomatik saqlanadi.
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Child Sessions */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6">
        <h2 className="font-display font-bold text-lg text-slate-900 mb-3">
          Oxirgi bajarilgan mashg‘ulotlar
        </h2>

        <div className="divide-y divide-slate-100">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-sm sm:text-base text-slate-900">
                  {sess.lessonTitle}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {sess.dateLabel} · Tovush: «{sess.targetSound}»
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 tabular-nums">
                <span className="text-sm font-extrabold text-[#46A302]">
                  {sess.accuracy}% aniqlik
                </span>
                <span className="text-sm font-extrabold text-amber-600">
                  +{sess.starsEarned} ⭐
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy & Inclusivity Assurance */}
      <footer className="bg-slate-50 border-2 border-[#E5E5E5] rounded-3xl p-4 sm:p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#E5F8FF] text-[#008ECC] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="font-display font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#008ECC] shrink-0" />
            <span>
              100% shifrlangan bolalar ma’lumotlari • Autizm va disleksiya uchun inklyuziv
              dizayn
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Ovoz tahlillari faqat ota-ona va biriktirilgan logoped uchun ochiq.
          </p>
        </div>
      </footer>
    </div>
  );
};

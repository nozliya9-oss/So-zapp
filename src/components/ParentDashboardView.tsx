import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { WEEKLY_PRACTICE_MINUTES } from '../data/lessonsData';
import {
  DiagnosticReport,
  Language,
  LessonNode,
  PracticeSession,
  SoundKey,
  SoundStat,
  UserProfile,
  WeeklyAssessmentRecord,
} from '../types';
import { playButtonPop } from '../utils/soundEffects';

interface ParentDashboardViewProps {
  profile: UserProfile;
  stars: number;
  soundStats: SoundStat[];
  weeklyAssessments: WeeklyAssessmentRecord[];
  sessions: PracticeSession[];
  diagnosticReport?: DiagnosticReport | null;
  sfxEnabled: boolean;
  onAssignCustomExercise: (node: LessonNode) => void;
  onGoToLessons: () => void;
}

const SOUND_KEYS: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];

const DEFAULT_WORDS_BY_SOUND: Record<SoundKey, string> = {
  R: 'Arra, Daraxt, Baraban, Rasm, Bahor, Anor, Qor, Daryo, Ruchka, Tarvuz',
  S: 'Soat, Sabzi, Osmon, Suv, Asal, Stol, Savat, Issiq, Musiqa, Tovus',
  Sh: 'Quyosh, Mashina, Shamol, Pishloq, Shapka, Qush, Shahar, Mushuk, Tosh, Qoshiq',
  L: 'Lola, Qalam, Olma, Bulut, Limon, Balon, Gul, Bola, Olov, Tilla',
  Ch: 'Choy, Olcha, Chumoli, Kechikma, Pichoq, Chiroq, Qaldirg‘och, Chana, Burchak, Tinch',
  'J/Z': 'Jo‘ja, Zebra, Uzum, Jirafa, Qizil, Javon, Yulduz, Zina, Jurnal, Zanjir',
};

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  profile,
  stars,
  soundStats,
  weeklyAssessments,
  sessions,
  diagnosticReport,
  sfxEnabled,
  onAssignCustomExercise,
  onGoToLessons,
}) => {
  const totalWeeklyMins = WEEKLY_PRACTICE_MINUTES.reduce(
    (sum, d) => sum + d.minutes,
    0
  );
  const maxMinutes = Math.max(...WEEKLY_PRACTICE_MINUTES.map((d) => d.minutes), 25);
  const latestAssessment = weeklyAssessments[weeklyAssessments.length - 1];
  const sortedByWeakest = [...soundStats].sort((a, b) => a.accuracy - b.accuracy);
  const focusNeededSound = sortedByWeakest[0];
  const strongestSound = sortedByWeakest[sortedByWeakest.length - 1];

  // Exercise Assignment Form State (moved here for Parents!)
  const [targetSound, setTargetSound] = useState<SoundKey>(
    focusNeededSound?.sound || 'R'
  );
  const [exerciseLang, setExerciseLang] = useState<Language>('uz');
  const [lessonTitle, setLessonTitle] = useState('');
  const [wordsInput, setWordsInput] = useState(
    DEFAULT_WORDS_BY_SOUND[focusNeededSound?.sound || 'R']
  );
  const [tipInput, setTipInput] = useState(
    'Shoshilmasdan, oyna oldida til holatini nazorat qilib aniq talaffuz qiling.'
  );
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState<string | null>(null);

  const handleSelectQuickSound = (snd: SoundKey) => {
    playButtonPop(!sfxEnabled);
    setTargetSound(snd);
    setWordsInput(DEFAULT_WORDS_BY_SOUND[snd]);
    setLessonTitle(`Ota-ona mashqi: «${snd}» tovushi`);
    setAssignedSuccessMsg(null);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPop(!sfxEnabled);

    const parsedWords = wordsInput
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const fallbackPool = DEFAULT_WORDS_BY_SOUND[targetSound]
      .split(',')
      .map((w) => w.trim());

    const finalWords =
      parsedWords.length >= 10
        ? parsedWords
        : [...parsedWords, ...fallbackPool].slice(0, 10);

    const generatedTitle =
      lessonTitle.trim() || `Ota-ona mashqi: «${targetSound}» tovushi`;

    const newNode: LessonNode = {
      id: `parent-${Date.now()}`,
      weekNumber: 1,
      dayNumber: 1,
      dayLabel: 'Ota-ona biriktirgan mashq',
      language: exerciseLang,
      title: generatedTitle,
      subtitle: `${finalWords.length} ta so‘z · ${finalWords.slice(0, 3).join(', ')}...`,
      targetSound,
      status: 'active',
      variant: 'therapist',
      starsEarned: 0,
      maxStars: 3,
      assignedBy: 'Ota-ona',
      kikiGreeting: `Ota-onangiz siz uchun maxsus «${targetSound}» tovushi mashqini biriktirdi!`,
      words: finalWords.map((w, idx) => ({
        id: `custom-${Date.now()}-${idx}`,
        word: w,
        syllables: w.toUpperCase(),
        targetSound,
        speechLang: exerciseLang === 'ru' ? 'ru-RU' : 'uz-UZ',
        exampleUsage: `${w} so‘zini ravon va shoshilmay ayting.`,
        tipUz: tipInput.trim() || `«${targetSound}» tovushiga urg‘u bering.`,
      })),
    };

    onAssignCustomExercise(newNode);
    setAssignedSuccessMsg(
      `«${generatedTitle}» (${finalWords.length} ta so‘z) «Darslar» bo‘limiga qo‘shildi!`
    );
    setLessonTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Parent Header */}
      <div>
        <p className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
          OILA VA RIVOJLANISH KUZATUVI · OTA-ONA PROFILI
        </p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
          <Users className="w-7 h-7 text-[#008ECC] dark:text-[#38BDF8]" />
          <span>Ota-ona profili va mashq biriktirish</span>
        </h2>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
          Farzandingiz:{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {profile.firstName} {profile.lastName}
          </span>{' '}
          · {profile.age} yosh · Jami yulduzlar:{' '}
          <span className="text-amber-600 dark:text-amber-400 font-extrabold tabular-nums">
            {stars} ⭐
          </span>
        </p>
      </div>

      {/* Family-Friendly Progress Summary */}
      <section className="bg-[#E5F8FF] dark:bg-[#00BFFF]/15 border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[#008ECC] dark:text-[#38BDF8] font-display font-bold text-sm mb-1.5">
          <HeartHandshake className="w-5 h-5" />
          <span>Farzandingiz natijalari bo‘yicha qisqa xulosa</span>
        </div>
        <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
          {profile.firstName} eng yaxshi natijani «{strongestSound?.sound}» tovushida (
          {strongestSound?.accuracy}%) ko‘rsatdi. Hozir eng ko‘p mashq talab qiladigan tovush — «
          {focusNeededSound?.sound}» ({focusNeededSound?.accuracy}%).
        </p>

        {latestAssessment && (
          <div className="mt-4 bg-white/90 dark:bg-slate-800/90 border border-[#00BFFF]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
                Oxirgi Yakshanba baholashi ({latestAssessment.weekLabel})
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {latestAssessment.notesUz}
              </div>
            </div>
            <div className="font-display font-bold text-2xl text-[#46A302] dark:text-[#7CE82B] tabular-nums shrink-0">
              {latestAssessment.overallScore}%
            </div>
          </div>
        )}
      </section>

      {/* Dynamic Sound & Letter Progress Chart (Updates from Diagnostic & Lessons) */}
      <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00BFFF]" />
            <span>Tovushlar bo‘yicha o‘zlashtirish diagrammasi (%)</span>
          </h3>
          {diagnosticReport && (
            <span className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] tabular-nums">
              Diagnostika: {diagnosticReport.overallScore}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {soundStats.map((stat) => {
            const needsHelp = stat.accuracy < 75;
            return (
              <div
                key={stat.sound}
                className="border border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-3.5 bg-slate-50/70 dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
                  <span className="text-slate-800 dark:text-slate-100">{stat.label}</span>
                  <span
                    className={`tabular-nums font-extrabold ${
                      needsHelp
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-[#46A302] dark:text-[#7CE82B]'
                    }`}
                  >
                    {stat.accuracy}% {needsHelp ? '· Mashq kerak' : '· Yaxshi'}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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

        {diagnosticReport && diagnosticReport.weakestLetters.length > 0 && (
          <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4">
            <div className="text-xs font-extrabold text-rose-700 dark:text-rose-300 mb-2">
              25 so‘zlik imtihon asosida eng ko‘p qiynalgan harflar (biriktirish uchun tavsiya):
            </div>
            <div className="flex flex-wrap gap-2">
              {diagnosticReport.weakestLetters.map((item) => (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => handleSelectQuickSound(item.mappedSoundKey)}
                  className="btn-3d bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 rounded-xl px-3 py-1.5 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <span>
                    «{item.letter}» ({item.score}%)
                  </span>
                  <span className="text-[#008ECC] dark:text-[#38BDF8]">+ Mashq tanlash</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Parent Exercise Assigner ("Mashq biriktirish") */}
      <section className="bg-white dark:bg-slate-800 border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#58CC02]" />
              <span>Farzandga shaxsiy mashq biriktirish</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Yuqoridagi natijalarga qarab qiyin harfni tanlang — mashq darhol «Darslar» bo‘limiga qo‘shiladi.
            </p>
          </div>
        </div>

        {/* Smart 1-click weak sound chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            Tezkor tanlov:
          </span>
          {SOUND_KEYS.map((snd) => (
            <button
              key={snd}
              type="button"
              onClick={() => handleSelectQuickSound(snd)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-colors ${
                targetSound === snd
                  ? 'bg-[#00BFFF] text-white border-[#008ECC]'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-[#00BFFF]'
              }`}
            >
              «{snd}» tovushi
            </button>
          ))}
        </div>

        {assignedSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-[#58CC02] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#3B8700] dark:text-[#7CE82B] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{assignedSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                onGoToLessons();
              }}
              className="btn-3d bg-[#00BFFF] text-white border-[#008ECC] rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap self-start sm:self-auto"
            >
              Darslarda ko‘rish
            </button>
          </div>
        )}

        <form onSubmit={handleAssignSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Maqsadli tovush
            </label>
            <select
              value={targetSound}
              onChange={(e) => handleSelectQuickSound(e.target.value as SoundKey)}
              className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
            >
              {SOUND_KEYS.map((snd) => (
                <option key={snd} value={snd}>
                  «{snd}» tovushi
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Mashq tili
            </label>
            <select
              value={exerciseLang}
              onChange={(e) => setExerciseLang(e.target.value as Language)}
              className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
            >
              <option value="uz">🇺🇿 O‘zbek tili</option>
              <option value="ru">🇷🇺 Rus tili</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Mashq nomi (ixtiyoriy)
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder={`Masalan: «${targetSound}» tovushi bo‘yicha shaxsiy mashq`}
              className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Mashq so‘zlari (vergul bilan ajrating)
            </label>
            <input
              type="text"
              value={wordsInput}
              onChange={(e) => setWordsInput(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Ko‘rsatma
            </label>
            <input
              type="text"
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="btn-3d bg-[#58CC02] hover:bg-[#4EC002] text-white border-[#46A302] rounded-2xl px-6 py-3 font-display font-bold text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Mashq biriktirish</span>
            </button>
          </div>
        </form>
      </section>

      {/* Weekly Minutes & Home Guidance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00BFFF]" />
              <span>Haftalik mashg‘ulot vaqti</span>
            </h3>
            <span className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] tabular-nums">
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
                  <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 tabular-nums">
                    {item.minutes}d
                  </span>
                  <div className="w-full max-w-[34px] flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full bg-[#00BFFF] rounded-lg transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Home Practice Guidance */}
        <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-3.5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#58CC02]" />
            <span>Ota-onalar uchun uy tavsiyalari</span>
          </h3>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[#E5E5E5] dark:border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">
                  Kuniga 10 daqiqa:
                </span>{' '}
                Bola charchab qolmasligi uchun har kunlik mashqni o‘yin tarzida birga bajaring.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[#E5E5E5] dark:border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">
                  Oyna oldida mashq:
                </span>{' '}
                «R» va «Sh» tovushlarida til holatini ko‘rsatish uchun oyna oldida tabassum mashqini qiling.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[#E5E5E5] dark:border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">
                  Yakshanba natijasi:
                </span>{' '}
                Har yakshanba kunlik sinovda barcha 6 ta tovush natijasi avtomatik saqlanadi.
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Child Sessions */}
      <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6">
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-3">
          Oxirgi bajarilgan mashg‘ulotlar
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {sess.lessonTitle}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {sess.dateLabel} · Tovush: «{sess.targetSound}»
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 tabular-nums">
                <span className="text-sm font-extrabold text-[#46A302] dark:text-[#7CE82B]">
                  {sess.accuracy}% aniqlik
                </span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  +{sess.starsEarned} ⭐
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

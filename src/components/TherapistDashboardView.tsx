import React, { useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import {
  Language,
  LessonNode,
  SoundKey,
  SoundStat,
  UserProfile,
  WeeklyAssessmentRecord,
} from '../types';
import { playButtonPop } from '../utils/soundEffects';

interface TherapistDashboardViewProps {
  profile: UserProfile;
  soundStats: SoundStat[];
  weeklyAssessments: WeeklyAssessmentRecord[];
  sfxEnabled: boolean;
  onAssignCustomExercise: (node: LessonNode) => void;
  onGoToLessons: () => void;
}

const SOUND_KEYS: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];

export const TherapistDashboardView: React.FC<TherapistDashboardViewProps> = ({
  profile,
  soundStats,
  weeklyAssessments,
  sfxEnabled,
  onAssignCustomExercise,
  onGoToLessons,
}) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [targetSound, setTargetSound] = useState<SoundKey>('R');
  const [exerciseLang, setExerciseLang] = useState<Language>('uz');
  const [lessonTitle, setLessonTitle] = useState('');
  const [wordsInput, setWordsInput] = useState(
    'Traktor, Daryo, Qor, Bahor, Arra, Daraxt, Baraban, Rasm, Anor, Ruchka'
  );
  const [tipInput, setTipInput] = useState(
    'Til uchini yuqori tanglayga tekkizib, yumshoq va aniq talaffuz qiling.'
  );
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState<string | null>(null);

  const avgAccuracy = Math.round(
    soundStats.reduce((sum, s) => sum + s.accuracy, 0) / Math.max(1, soundStats.length)
  );
  const latestAssessment = weeklyAssessments[weeklyAssessments.length - 1];

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPop(!sfxEnabled);

    const parsedWords = wordsInput
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const fallbackPool = [
      'Arra',
      'Daraxt',
      'Baraban',
      'Bahor',
      'Daryo',
      'Qor',
      'Anor',
      'Rasm',
      'Ruchka',
      'Tarvuz',
    ];
    const finalWords =
      parsedWords.length >= 10
        ? parsedWords
        : [...parsedWords, ...fallbackPool].slice(0, 10);

    const generatedTitle =
      lessonTitle.trim() || `Logoped mashqi: «${targetSound}» tovushi`;

    const newNode: LessonNode = {
      id: `therapist-${Date.now()}`,
      weekNumber: 1,
      dayNumber: 1,
      dayLabel: 'Logoped topshirig‘i',
      language: exerciseLang,
      title: generatedTitle,
      subtitle: `${finalWords.length} ta so‘z · ${finalWords.slice(0, 3).join(', ')}...`,
      targetSound,
      status: 'active',
      variant: 'therapist',
      starsEarned: 0,
      maxStars: 3,
      assignedBy: 'Logoped',
      kikiGreeting: `Logoped siz uchun maxsus «${targetSound}» tovushi mashqini biriktirdi!`,
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
      `«${generatedTitle}» (${finalWords.length} ta so‘z) Darslar yo‘liga qo‘shildi!`
    );
    setShowAssignForm(false);
    setLessonTitle('');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-12 space-y-6">
      {/* Therapist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-[#008ECC]">
            MUTAXASSIS ISH JOYI · LOGOPED KABINETI
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-0.5 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-[#008ECC]" />
            <span>Logoped kabineti</span>
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-0.5">
            O‘quvchi: <span className="font-bold text-slate-900">{profile.firstName} {profile.lastName}</span> ({profile.age} yosh)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            setShowAssignForm((prev) => !prev);
            setAssignedSuccessMsg(null);
          }}
          className="btn-3d bg-[#58CC02] hover:bg-[#4EC000] text-white border-[#46A302] rounded-2xl px-5 py-3 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>➕ Yangi mashq biriktirish</span>
        </button>
      </div>

      {/* Custom Task Assigner Form */}
      {assignedSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-[#58CC02] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#3B8700] font-bold text-sm">
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
            Darslar yo‘lida ko‘rish
          </button>
        </div>
      )}

      {showAssignForm && (
        <form
          onSubmit={handleAssignSubmit}
          className="bg-white border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2">
            <h2 className="font-display font-bold text-lg text-slate-900">
              Shaxsiy artikulyatsion topshiriq yaratish
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Kamida 10 ta so‘z kiriting (kamroq bo‘lsa tizim avtomatik 10 tagacha to‘ldiradi).
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Maqsadli tovush
            </label>
            <select
              value={targetSound}
              onChange={(e) => setTargetSound(e.target.value as SoundKey)}
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white focus:border-[#00BFFF] focus:outline-none"
            >
              {SOUND_KEYS.map((snd) => (
                <option key={snd} value={snd}>
                  «{snd}» tovushi
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Mashq tili
            </label>
            <select
              value={exerciseLang}
              onChange={(e) => setExerciseLang(e.target.value as Language)}
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white focus:border-[#00BFFF] focus:outline-none"
            >
              <option value="uz">🇺🇿 O‘zbek tili</option>
              <option value="ru">🇷🇺 Rus tili</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Mashq nomi (ixtiyoriy)
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder='Masalan: "R" tovushi bo‘yicha shaxsiy mashq'
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Mashq so‘zlari (vergul bilan ajrating)
            </label>
            <input
              type="text"
              value={wordsInput}
              onChange={(e) => setWordsInput(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Artikulyatsion ko‘rsatma
            </label>
            <input
              type="text"
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAssignForm(false)}
              className="px-4 py-2.5 rounded-xl border-2 border-[#E5E5E5] text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="btn-3d bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-2xl px-6 py-2.5 font-display font-bold text-sm"
            >
              Darslar yo‘liga qo‘shish
            </button>
          </div>
        </form>
      )}

      {/* Clinical Acoustic & 6-Sound Diagnostic Summary */}
      <section className="bg-[#E5F8FF] border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[#008ECC] font-display font-bold text-sm">
              <Activity className="w-5 h-5" />
              <span>Klinik Ovoz Biometrikasi Diagnostikasi</span>
            </div>
            <p className="font-bold text-base text-slate-900 leading-snug">
              {profile.firstName} 6 ta asosiy tovush (R, S, Sh, L, Ch, J/Z) bo‘yicha o‘rtacha{' '}
              <span className="text-[#008ECC] font-extrabold tabular-nums">{avgAccuracy}%</span>{' '}
              aniqlik ko‘rsatmoqda.
              {latestAssessment?.previousWeekScore !== null && latestAssessment && (
                <>
                  {' '}
                  Oxirgi haftalik sinovda{' '}
                  <span className="text-[#46A302] font-extrabold tabular-nums">
                    +{latestAssessment.overallScore - (latestAssessment.previousWeekScore || 0)}%
                  </span>{' '}
                  o‘sish qayd etildi.
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-white border border-[#00BFFF]/40 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-500">6-tovush o‘rtacha</div>
              <div className="font-display font-bold text-xl text-[#008ECC] tabular-nums">
                {avgAccuracy}%
              </div>
            </div>
            <div className="bg-white border border-[#00BFFF]/40 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-500">Asosiy chastota</div>
              <div className="font-display font-bold text-xl text-slate-900 tabular-nums">
                244 Hz
              </div>
            </div>
            <div className="bg-white border border-[#00BFFF]/40 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-500">Saqlangan sinovlar</div>
              <div className="font-display font-bold text-xl text-[#46A302] tabular-nums">
                {weeklyAssessments.length} ta
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Sound Accuracy Matrix */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFC800]" />
            <span>6 kunlik sikl tovushlari aniqligi</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">R · S · Sh · L · Ch · J/Z</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {soundStats.map((stat) => {
            const delta = stat.accuracy - stat.previousAccuracy;
            return (
              <div key={stat.sound}>
                <div className="flex items-center justify-between text-sm font-bold mb-1.5">
                  <span className="text-slate-800">{stat.label}</span>
                  <span className="tabular-nums text-slate-900">
                    {stat.accuracy}%{' '}
                    <span className="text-xs font-extrabold text-[#46A302]">
                      ({delta >= 0 ? `+${delta}%` : `${delta}%`})
                    </span>
                  </span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
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

      {/* Saved Weekly (Yakshanba) Assessment Analytics */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#FF9600]" />
              <span>Saqlangan Yakshanba haftalik baholash tahlili</span>
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Har yakshanba o‘tkazilgan 6-tovushli sinov natijalari avtomatik saqlanadi
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#008ECC] flex items-center gap-1">
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
                className="border-2 border-slate-100 bg-slate-50/60 rounded-2xl p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div>
                    <div className="font-display font-bold text-base text-slate-900">
                      {rec.weekLabel}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {rec.completedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-display font-bold text-lg text-[#008ECC]">
                      Umumiy: {rec.overallScore}%
                    </span>
                    {diff !== null && (
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                          diff >= 0
                            ? 'bg-emerald-50 text-[#46A302]'
                            : 'bg-rose-50 text-[#C81E1E]'
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
                      className="bg-white border border-[#E5E5E5] rounded-xl py-2 px-2 text-center"
                    >
                      <div className="text-[11px] font-bold text-slate-500">«{key}»</div>
                      <div className="font-display font-bold text-sm text-slate-900 tabular-nums">
                        {rec.soundScores[key] ?? 0}%
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs font-semibold text-slate-600">{rec.notesUz}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

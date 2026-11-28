import React from 'react';
import {
  Info,
  Lock,
  LogOut,
  Moon,
  Music,
  Phone,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  User,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AuthUser,
  DiagnosticReport,
  LessonNode,
  PracticeSession,
  ProfileSubTab,
  SoundKey,
  SoundStat,
  UserProfile,
  WeeklyAssessmentRecord,
} from '../types';
import { KikiLogo, KikiMascot } from './KikiMascot';
import { KikiVoiceControl } from './KikiVoiceControl';
import { ParentDashboardView } from './ParentDashboardView';
import { TherapistDashboardView } from './TherapistDashboardView';
import { playButtonPop } from '../utils/soundEffects';

interface ProfileViewProps {
  profile: UserProfile;
  stars: number;
  coins: number;
  authUser: AuthUser | null;
  activeSubTab: ProfileSubTab;
  onChangeSubTab: (tab: ProfileSubTab) => void;
  soundStats: SoundStat[];
  weeklyAssessments: WeeklyAssessmentRecord[];
  sessions: PracticeSession[];
  diagnosticReport: DiagnosticReport | null;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onAssignCustomExercise: (node: LessonNode) => void;
  onGoToLessons: () => void;
  onLogout: () => void;
}

const SOUND_OPTIONS: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];

const PROFILE_SUB_TABS: {
  id: ProfileSubTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'child', label: 'Bola profili', icon: User },
  { id: 'parent', label: 'Ota-ona profili', icon: Users },
  { id: 'therapist', label: 'Logoped profili', icon: Stethoscope },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  stars,
  coins,
  authUser,
  activeSubTab,
  onChangeSubTab,
  soundStats,
  weeklyAssessments,
  sessions,
  diagnosticReport,
  onUpdateProfile,
  onAssignCustomExercise,
  onGoToLessons,
  onLogout,
}) => {
  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || 'Foydalanuvchi';
  const initials = `${profile.firstName?.[0] || 'K'}${profile.lastName?.[0] || ''}`.toUpperCase();
  const currentTheme = profile.theme || 'light';

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-12 space-y-6">
      {/* Top 4 Sub-Sections Card Switcher */}
      <nav
        aria-label="Profil bo‘limlari"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
      >
        {PROFILE_SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playButtonPop(!profile.sfxEnabled);
                onChangeSubTab(tab.id);
              }}
              className={`btn-3d rounded-2xl px-3.5 py-3 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center leading-tight ${
                isActive
                  ? 'bg-[#00BFFF] text-white border-[#008ECC]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[5px] border-b-slate-300 dark:border-b-slate-950 hover:bg-[#E5F8FF]/60 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================== 1. BOLA PROFILI ==================== */}
      {activeSubTab === 'child' && (
        <div className="space-y-6">
          {/* Hero Summary */}
          <section className="bg-[#E5F8FF] dark:bg-[#00BFFF]/15 border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#00BFFF] border-2 border-white text-white font-display font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
                  BOLA PROFILI
                </p>
                <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mt-0.5">
                  {fullName}
                </h1>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums">
                  {profile.age} yosh · {profile.gender === 'boy' ? 'O‘g‘il bola' : 'Qiz bola'} ·{' '}
                  <span className="text-amber-600 dark:text-amber-400">{stars} ⭐</span> ·{' '}
                  <span className="text-[#008ECC] dark:text-[#38BDF8]">{coins} tanga</span>
                </p>
              </div>
            </div>

            <KikiMascot mood="happy" size="sm" className="!w-20 !h-20 shrink-0" />
          </section>

          {/* Editable Child Profile Fields */}
          <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-5">
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#008ECC] dark:text-[#38BDF8]" />
              <span>Bola ma’lumotlari va mashq maqsadi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ism
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => onUpdateProfile({ firstName: e.target.value })}
                  placeholder="Ismingiz"
                  className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Familiya
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => onUpdateProfile({ lastName: e.target.value })}
                  placeholder="Familiyangiz"
                  className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Yosh (6–12 yosh)
                </label>
                <select
                  value={profile.age}
                  onChange={(e) => onUpdateProfile({ age: Number(e.target.value) })}
                  className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((ageVal) => (
                    <option key={ageVal} value={ageVal}>
                      {ageVal} yosh
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jins
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playButtonPop(!profile.sfxEnabled);
                      onUpdateProfile({ gender: 'boy' });
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                      profile.gender === 'boy'
                        ? 'bg-[#E5F8FF] dark:bg-[#00BFFF]/20 border-[#00BFFF] text-[#008ECC] dark:text-[#38BDF8]'
                        : 'bg-white dark:bg-slate-900 border-[#E5E5E5] dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    O‘g‘il bola
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playButtonPop(!profile.sfxEnabled);
                      onUpdateProfile({ gender: 'girl' });
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                      profile.gender === 'girl'
                        ? 'bg-[#E5F8FF] dark:bg-[#00BFFF]/20 border-[#00BFFF] text-[#008ECC] dark:text-[#38BDF8]'
                        : 'bg-white dark:bg-slate-900 border-[#E5E5E5] dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Qiz bola
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Asosiy diqqat qaratiladigan tovush
                </label>
                <select
                  value={profile.focusSound}
                  onChange={(e) =>
                    onUpdateProfile({ focusSound: e.target.value as SoundKey })
                  }
                  className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
                >
                  {SOUND_OPTIONS.map((snd) => (
                    <option key={snd} value={snd}>
                      «{snd}» tovushi
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kunlik maqsad (so‘zlar soni)
                </label>
                <select
                  value={profile.dailyWordGoal}
                  onChange={(e) =>
                    onUpdateProfile({ dailyWordGoal: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border-2 border-[#E5E5E5] dark:border-slate-700 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-[#00BFFF] focus:outline-none"
                >
                  <option value={10}>10 ta so‘z (Standart)</option>
                  <option value={15}>15 ta so‘z (Faol)</option>
                  <option value={20}>20 ta so‘z (Chempion)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Account & Logout Section ("Hisobdan chiqish" kept intact!) */}
          <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F8FF] dark:bg-[#00BFFF]/20 border-2 border-[#BCEEFF] dark:border-[#00BFFF]/40 text-[#008ECC] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                  Telegram orqali ulangan hisob
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate mt-0.5">
                  {authUser?.formattedPhone || '+998 ••• •• ••'}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008ECC] dark:text-[#38BDF8] mt-0.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {authUser?.telegramUsername
                      ? `Kiki Bot (@${authUser.telegramUsername})`
                      : 'Kiki Bot tasdiqlangan'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playButtonPop(!profile.sfxEnabled);
                onLogout();
              }}
              className="btn-3d px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 border-rose-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Hisobdan chiqish</span>
            </button>
          </section>
        </div>
      )}

      {/* ==================== 2. OTA-ONA PROFILI ==================== */}
      {activeSubTab === 'parent' && (
        <ParentDashboardView
          profile={profile}
          stars={stars}
          soundStats={soundStats}
          weeklyAssessments={weeklyAssessments}
          sessions={sessions}
          diagnosticReport={diagnosticReport}
          sfxEnabled={profile.sfxEnabled}
          onAssignCustomExercise={onAssignCustomExercise}
          onGoToLessons={onGoToLessons}
        />
      )}

      {/* ==================== 3. LOGOPED PROFILI ==================== */}
      {activeSubTab === 'therapist' && (
        <TherapistDashboardView
          profile={profile}
          soundStats={soundStats}
          weeklyAssessments={weeklyAssessments}
          diagnosticReport={diagnosticReport}
        />
      )}

      {/* ==================== 4. SOZLAMALAR ==================== */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Kiki Voice Settings */}
          <KikiVoiceControl
            voiceStyle={profile.voiceStyle}
            sfxEnabled={profile.sfxEnabled}
            onChangeVoiceStyle={(voiceStyle) => onUpdateProfile({ voiceStyle })}
          />

          {/* Theme Switcher ("Tongi rejim" / "Tungi rejim") + Audio & Inclusive Toggles */}
          <section className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
              Ko‘rinish va ovoz sozlamalari
            </h2>

            {/* Theme Mode Switcher */}
            <div className="bg-slate-50 dark:bg-slate-900/70 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#E5F8FF] dark:bg-slate-800 text-[#008ECC] dark:text-[#FFC800] flex items-center justify-center shrink-0">
                  {currentTheme === 'dark' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Ekran rejimi (Tongi / Tungi)
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Kunduzgi yorqin yoki kechki ko‘zga qulay qorong‘u mavzuni tanlang
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!profile.sfxEnabled);
                    onUpdateProfile({ theme: 'light' });
                  }}
                  className={`btn-3d px-4 py-2 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 ${
                    currentTheme === 'light'
                      ? 'bg-[#00BFFF] text-white border-[#008ECC]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[4px] border-b-slate-300 dark:border-b-slate-950'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Tongi rejim</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!profile.sfxEnabled);
                    onUpdateProfile({ theme: 'dark' });
                  }}
                  className={`btn-3d px-4 py-2 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 ${
                    currentTheme === 'dark'
                      ? 'bg-[#00BFFF] text-white border-[#008ECC]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[4px] border-b-slate-300 dark:border-b-slate-950'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Tungi rejim</span>
                </button>
              </div>
            </div>

            {/* 3 Toggles: Musiqa, Tugma ovozlari, Inklyuziv rejim */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* 1. Background Music Toggle */}
              <div className="border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Musiqa
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Orqa fondagi mayin va quvnoq kuy
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!profile.sfxEnabled);
                    onUpdateProfile({ musicEnabled: !profile.musicEnabled });
                  }}
                  className={`btn-3d w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs ${
                    profile.musicEnabled
                      ? 'bg-[#58CC02] text-white border-[#46A302]'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {profile.musicEnabled ? 'Musiqa: Yoqilgan' : 'Musiqa: O‘chirilgan'}
                </button>
              </div>

              {/* 2. Button Sound Effects Toggle */}
              <div className="border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    {profile.sfxEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Tugmalar ovozi
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Bosish va rag‘batlantirish tovushlari
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !profile.sfxEnabled;
                    if (next) playButtonPop(false);
                    onUpdateProfile({ sfxEnabled: next });
                  }}
                  className={`btn-3d w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs ${
                    profile.sfxEnabled
                      ? 'bg-[#00BFFF] text-white border-[#008ECC]'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {profile.sfxEnabled ? 'Tugmalar ovozi: Yoqilgan' : 'Tugmalar ovozi: O‘chiq'}
                </button>
              </div>

              {/* 3. Inclusive Mode Toggle */}
              <div className="border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Inklyuziv rejim
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Autizm va disleksiya uchun sokin ko‘rinish
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!profile.sfxEnabled);
                    onUpdateProfile({ inclusiveMode: !profile.inclusiveMode });
                  }}
                  className={`btn-3d w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs ${
                    profile.inclusiveMode
                      ? 'bg-[#7C3AED] text-white border-[#5B21B6]'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {profile.inclusiveMode ? 'Inklyuziv rejim: Yoqilgan' : 'Inklyuziv rejim: O‘chiq'}
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Information Cards: Ilova haqida, Maxfiylik, Inklyuziv rejim */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Ilova haqida */}
            <article className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <KikiLogo className="w-10 h-10 shrink-0" />
                <div>
                  <div className="text-[11px] font-extrabold text-[#008ECC] dark:text-[#38BDF8] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>ILOVA HAQIDA</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    So‘zApp ekotizimi
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                «So‘zApp» — 6–12 yoshli bolalar uchun nutq rivojlantirish platformasi. 25 so‘zlik
                diagnostika, 5 haftalik darslar, So‘zlar shahri, 30 bosqichli o‘yinlar va Kiki AI
                yordamchisini birlashtiradi.
              </p>
            </article>

            {/* 2. Maxfiylik */}
            <article className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#46A302] dark:text-[#7CE82B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-[#46A302] dark:text-[#7CE82B] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>MAXFIYLIK</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Bolalar xavfsizligi
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                Barcha profil va nutq natijalari himoyalangan. Mikrofon audio oqimi faqat
                brauzerda real vaqtda tahlil qilinadi va begona uchinchi shaxslarga uzatilmaydi.
              </p>
            </article>

            {/* 3. Inklyuziv rejim */}
            <article className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-violet-700 dark:text-violet-300">
                    INKLYUZIV REJIM
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Qulay va sokin dizayn
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                Autizm va disleksiyasi bor bolalar uchun miltillovchi animatsiyalar kamaytiriladi,
                harflar va qatorlar orasidagi masofa kengaytirilib o‘qish osonlashtiriladi.
              </p>
            </article>
          </section>
        </div>
      )}
    </div>
  );
};

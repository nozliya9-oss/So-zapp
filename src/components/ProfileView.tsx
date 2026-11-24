import React from 'react';
import {
  CheckCircle2,
  Mic,
  Music,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SoundKey, UserProfile } from '../types';
import { KikiLogo, KikiMascot } from './KikiMascot';
import { playButtonPop } from '../utils/soundEffects';

interface ProfileViewProps {
  profile: UserProfile;
  stars: number;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
}

const SOUND_OPTIONS: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  stars,
  onUpdateProfile,
}) => {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Foydalanuvchi';
  const initials = `${profile.firstName?.[0] || 'K'}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-12 space-y-6">
      {/* Profile Hero Header */}
      <section className="bg-[#E5F8FF] border-2 border-[#00BFFF] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00BFFF] border-2 border-white text-white font-display font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#008ECC]">FOYDALANUVCHI PROFILI</p>
            <h1 className="font-display font-bold text-2xl text-slate-900 mt-0.5">
              {fullName}
            </h1>
            <p className="text-sm font-bold text-slate-600 mt-0.5">
              {profile.age} yosh · {profile.gender === 'boy' ? 'O‘g‘il bola' : 'Qiz bola'} ·{' '}
              <span className="text-amber-600 tabular-nums">{stars} ⭐</span>
            </p>
          </div>
        </div>

        <KikiMascot mood="happy" size="sm" className="!w-16 !h-16 shrink-0" />
      </section>

      {/* Personal Info & Learning Settings */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-5">
        <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#008ECC]" />
          <span>Shaxsiy ma’lumotlar va mashq sozlamalari</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Ism
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => onUpdateProfile({ firstName: e.target.value })}
              placeholder="Ismingiz"
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Familiya
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => onUpdateProfile({ lastName: e.target.value })}
              placeholder="Familiyangiz"
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#00BFFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Yosh (6–12 yosh)
            </label>
            <select
              value={profile.age}
              onChange={(e) => onUpdateProfile({ age: Number(e.target.value) })}
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white focus:border-[#00BFFF] focus:outline-none"
            >
              {[6, 7, 8, 9, 10, 11, 12].map((ageVal) => (
                <option key={ageVal} value={ageVal}>
                  {ageVal} yosh
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
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
                    ? 'bg-[#E5F8FF] border-[#00BFFF] text-[#008ECC]'
                    : 'bg-white border-[#E5E5E5] text-slate-600'
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
                    ? 'bg-[#E5F8FF] border-[#00BFFF] text-[#008ECC]'
                    : 'bg-white border-[#E5E5E5] text-slate-600'
                }`}
              >
                Qiz bola
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Asosiy diqqat qaratiladigan tovush
            </label>
            <select
              value={profile.focusSound}
              onChange={(e) =>
                onUpdateProfile({ focusSound: e.target.value as SoundKey })
              }
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white focus:border-[#00BFFF] focus:outline-none"
            >
              {SOUND_OPTIONS.map((snd) => (
                <option key={snd} value={snd}>
                  «{snd}» tovushi
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Kunlik maqsad (so‘zlar soni)
            </label>
            <select
              value={profile.dailyWordGoal}
              onChange={(e) =>
                onUpdateProfile({ dailyWordGoal: Number(e.target.value) })
              }
              className="w-full rounded-xl border-2 border-[#E5E5E5] px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white focus:border-[#00BFFF] focus:outline-none"
            >
              <option value={10}>10 ta so‘z (Standart)</option>
              <option value={15}>15 ta so‘z (Faol)</option>
              <option value={20}>20 ta so‘z (Chempion)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Two Separate Audio Controls (Musiqa & Tugma ovozlari) + Inclusive Mode */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-4">
        <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">
          Ovoz va qulaylik sozlamalari
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Background Music Toggle */}
          <div className="border-2 border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5F8FF] text-[#008ECC] flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Musiqa</div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
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
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {profile.musicEnabled ? 'Musiqa: Yoqilgan' : 'Musiqa: O‘chirilgan'}
            </button>
          </div>

          {/* 2. Button Sound Effects Toggle */}
          <div className="border-2 border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                {profile.sfxEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Tugma ovozlari</div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
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
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {profile.sfxEnabled ? 'Tugma ovozlari: Yoqilgan' : 'Tugma ovozlari: O‘chiq'}
            </button>
          </div>

          {/* 3. Inclusive Mode Toggle */}
          <div className="border-2 border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Inklyuziv rejim</div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
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
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {profile.inclusiveMode ? 'Inklyuziv rejim: Yoqilgan' : 'Inklyuziv rejim: O‘chiq'}
            </button>
          </div>
        </div>
      </section>

      {/* Dastur haqida (Moved cleanly from bottom-left sidebar into Profil) */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3.5">
          <KikiLogo className="w-12 h-12 shrink-0" />
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              Dastur haqida — So‘zApp
            </h2>
            <p className="font-display font-bold text-sm text-[#008ECC]">
              «Kiki bilan kichik harakat — katta natija»
            </p>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-600 leading-relaxed">
          «So‘zApp» (Kiki bilan so‘zla) — 6–12 yoshli bolalar uchun sun’iy intellekt asosidagi
          nutq rivojlantirish, 6 kunlik tizimli tovush sikli, interaktiv o‘yinlar va yakshanba
          haftalik baholash ekotizimi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#E5F8FF]/70 border border-[#00BFFF]/30">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#008ECC]" />
              <span>1. Tingla va ayt</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Har kuni 10+ ta so‘z bilan R, S, Sh, L, Ch, J/Z tovushlarini mashq qiling.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-[#58CC02]/30">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#46A302]" />
              <span>2. Yakshanba sinovi</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Har hafta oxirida barcha 6 tovush bo‘yicha natijalar saqlanadi va tahlil qilinadi.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-[#FFC800]/40">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>3. Shaharni qur</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Yulduzlar yig‘ib So‘zlar shahridagi 10 ta binoni ketma-ket oching.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#00BFFF] shrink-0" />
          <span>
            100% shifrlangan bolalar ma’lumotlari • Autizm va disleksiya uchun inklyuziv
            dizayn
          </span>
        </div>
      </section>
    </div>
  );
};

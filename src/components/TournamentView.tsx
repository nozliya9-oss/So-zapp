import React from 'react';
import { Crown, Star, Trophy } from 'lucide-react';
import { UserProfile } from '../types';
import { playButtonPop } from '../utils/soundEffects';

interface TournamentViewProps {
  stars: number;
  profile: UserProfile;
  sfxEnabled: boolean;
  onGoToLessons: () => void;
}

const SilhouetteAvatar: React.FC = () => (
  <div
    className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-end justify-center overflow-hidden shrink-0"
    aria-hidden="true"
  >
    <svg viewBox="0 0 40 40" className="w-9 h-9 text-slate-400" fill="currentColor">
      <circle cx="20" cy="14" r="7" />
      <path d="M7 38 C7 29, 13 25, 20 25 C27 25, 33 29, 33 38 Z" />
    </svg>
  </div>
);

export const TournamentView: React.FC<TournamentViewProps> = ({
  stars,
  profile,
  sfxEnabled,
  onGoToLessons,
}) => {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Foydalanuvchi';
  const initials = `${profile.firstName?.[0] || 'K'}${profile.lastName?.[0] || ''}`.toUpperCase();

  // Only current user has real stars & name; all other slots are honest neutral silhouettes ('--------', 0)
  const emptySlots = [2, 3, 4, 5, 6, 7];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-12 space-y-6">
      {/* Tournament Hero Banner */}
      <section className="btn-3d bg-[#FF9600] border-[#CC7800] border-2 border-t-[#FF9600] border-x-[#FF9600] rounded-3xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold text-white/90">
              HAFTALIK NUTQ TURNIRI
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mt-0.5 flex items-center gap-2">
              <Trophy className="w-7 h-7" />
              <span>Haftalik reyting jadvali</span>
            </h1>
            <p className="text-sm text-white/95 font-semibold mt-1">
              Sizning natijangiz darslar va yakshanba baholashida yig‘ilgan yulduzlar asosida
              hisoblanadi.
            </p>
          </div>

          <div className="bg-white/20 border-2 border-white/35 rounded-2xl px-4 py-3 text-center shrink-0">
            <div className="text-xs font-bold text-white/90">Sizning o‘rningiz</div>
            <div className="font-display font-bold text-2xl tabular-nums">Top-1</div>
          </div>
        </div>
      </section>

      {/* Clean Leaderboard Card */}
      <section className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#FFC800] fill-[#FFC800]" />
            <span>Ishtirokchilar jadvali</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Real foydalanuvchi natijalari
          </span>
        </div>

        <div className="space-y-2">
          {/* Current User Row (Top-1) */}
          <div className="flex items-center justify-between gap-3 py-3.5 px-4 rounded-2xl bg-[#E5F8FF] border-2 border-[#00BFFF]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFC800] text-slate-900 flex items-center justify-center font-display font-bold text-sm tabular-nums shrink-0">
                1
              </div>

              <div className="w-10 h-10 rounded-full bg-[#00BFFF] text-white font-display font-bold text-sm flex items-center justify-center shrink-0 border-2 border-white shadow-xs">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="font-bold text-sm sm:text-base text-slate-900 truncate">
                  {fullName} (Siz)
                </div>
                <div className="text-xs font-bold text-[#008ECC]">
                  Top-1 · {profile.age} yosh · Asosiy tovush: «{profile.focusSound}»
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-display font-bold text-lg text-amber-600 tabular-nums shrink-0">
              <Star className="w-5 h-5 text-[#FFC800] fill-[#FFC800]" />
              <span>{stars}</span>
            </div>
          </div>

          {/* Non-user Placeholder Rows with Silhouette Avatars, '--------', and 0 */}
          {emptySlots.map((rank) => (
            <div
              key={rank}
              className="flex items-center justify-between gap-3 py-3 px-4 rounded-2xl border border-slate-100 bg-slate-50/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-display font-bold text-sm tabular-nums shrink-0">
                  {rank}
                </div>

                <SilhouetteAvatar />

                <div className="min-w-0">
                  <div className="font-bold text-sm sm:text-base text-slate-400 tracking-wider">
                    --------
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    Bo‘sh o‘rin
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-display font-bold text-base text-slate-400 tabular-nums shrink-0">
                <Star className="w-4 h-4 text-slate-300" />
                <span>0</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onGoToLessons();
            }}
            className="btn-3d bg-[#00BFFF] hover:bg-[#00B3F0] text-white border-[#008ECC] rounded-2xl px-6 py-3 font-display font-bold text-sm sm:text-base"
          >
            Yulduzlarni ko‘paytirish uchun darslarga qaytish
          </button>
        </div>
      </section>
    </div>
  );
};

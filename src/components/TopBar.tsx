import React from 'react';
import { Star, User } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { KikiLogo } from './KikiMascot';
import { playButtonPop } from '../utils/soundEffects';

interface TopBarProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  stars: number;
  profile: UserProfile;
  sfxEnabled: boolean;
  onOpenHome: () => void;
  onOpenProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  language,
  onChangeLanguage,
  stars,
  profile,
  sfxEnabled,
  onOpenHome,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-[#E5E5E5] dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile/Tablet Brand Lockup */}
        <button
          type="button"
          onClick={() => {
            playButtonPop(!sfxEnabled);
            onOpenHome();
          }}
          className="flex lg:hidden items-center gap-2 min-h-[44px] pr-1 rounded-xl hover:bg-[#E5F8FF]/60 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="So‘zApp Asosiy sahifa"
        >
          <KikiLogo className="w-9 h-9 shrink-0" />
          <span className="font-display font-bold text-lg text-[#008ECC] dark:text-[#38BDF8] whitespace-nowrap hidden sm:inline">
            So‘zApp
          </span>
        </button>

        {/* Language Switcher */}
        <div
          className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border-2 border-[#E5E5E5] dark:border-slate-700 shrink-0"
          role="group"
          aria-label="Mashq tilini tanlash"
        >
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onChangeLanguage('uz');
            }}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all min-h-[36px] flex items-center gap-1.5 ${
              language === 'uz'
                ? 'bg-[#00BFFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span aria-hidden="true">🇺🇿</span>
            <span>O‘zbek tili</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onChangeLanguage('ru');
            }}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all min-h-[36px] flex items-center gap-1.5 ${
              language === 'ru'
                ? 'bg-[#00BFFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span aria-hidden="true">🇷🇺</span>
            <span>Rus tili</span>
          </button>
        </div>

        {/* Stars & User Profile Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 border-2 border-[#FFC800]/60 rounded-2xl px-2.5 sm:px-3 py-1.5 text-amber-700 dark:text-amber-300 font-extrabold text-xs sm:text-base tabular-nums whitespace-nowrap"
            title="Yulduzchalar"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC800] fill-[#FFC800]" />
            <span>{stars}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onOpenProfile();
            }}
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-2xl border-2 border-[#E5E5E5] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#E5F8FF]/60 dark:hover:bg-slate-700 hover:border-[#00BFFF] flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
          >
            <User className="w-4 h-4 text-[#008ECC] dark:text-[#38BDF8] shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[110px]">
              {profile.firstName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

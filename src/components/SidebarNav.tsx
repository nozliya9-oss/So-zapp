import React from 'react';
import {
  Building2,
  Gamepad2,
  Home,
  MessageCircle,
  User,
} from 'lucide-react';
import { TabId } from '../types';
import { KikiLogo } from './KikiMascot';
import { playButtonPop } from '../utils/soundEffects';

interface SidebarNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  sfxEnabled: boolean;
}

const NAV_ITEMS: {
  id: TabId;
  label: string;
  mobileLabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Asosiy', mobileLabel: 'Asosiy', icon: Home },
  { id: 'city', label: 'So‘zlar shahri', mobileLabel: 'Shahar', icon: Building2 },
  { id: 'games', label: 'O‘yinlar', mobileLabel: 'O‘yinlar', icon: Gamepad2 },
  { id: 'chat', label: 'Kiki AI', mobileLabel: 'Kiki AI', icon: MessageCircle },
  { id: 'profile', label: 'Profil', mobileLabel: 'Profil', icon: User },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  sfxEnabled,
}) => {
  return (
    <>
      {/* Desktop Left Sidebar — Strictly 5 Main Sections */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r-2 border-[#E5E5E5] dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen px-4 py-5 justify-between overflow-y-auto transition-colors">
        <div>
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onSelectTab('home');
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-[#E5F8FF]/60 dark:hover:bg-slate-800 transition-colors text-left mb-6"
          >
            <KikiLogo className="w-11 h-11 shrink-0" />
            <div className="min-w-0">
              <div className="font-display font-bold text-2xl text-[#008ECC] dark:text-[#38BDF8] leading-tight truncate">
                So‘zApp
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                Kiki bilan kichik harakat — katta natija
              </div>
            </div>
          </button>

          {/* 3D Styled 5-Section Navigation */}
          <nav className="space-y-2.5" aria-label="Asosiy bo‘limlar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playButtonPop(!sfxEnabled);
                    onSelectTab(item.id);
                  }}
                  className={`btn-3d w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-display font-bold text-sm sm:text-base whitespace-nowrap text-left ${
                    isActive
                      ? 'bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-[#E5E5E5] dark:border-slate-700 border-b-[5px] border-b-slate-300 dark:border-b-slate-950 hover:bg-slate-50 dark:hover:bg-slate-700/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-[#008ECC] dark:text-[#38BDF8]'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quiet Slogan Footer */}
        <div className="pt-4 px-2 text-center">
          <p className="font-display font-bold text-xs text-[#008ECC] dark:text-[#38BDF8] leading-snug">
            «Kiki bilan kichik harakat — katta natija»
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar — Strictly 5 Main Sections */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-[62px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-[#E5E5E5] dark:border-slate-800 px-1.5 flex items-center transition-colors"
        aria-label="Mobil bo‘limlar"
      >
        <div className="grid grid-cols-5 gap-1 max-w-2xl mx-auto w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playButtonPop(!sfxEnabled);
                  onSelectTab(item.id);
                }}
                className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  isActive
                    ? 'bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] border border-[#00BFFF]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold whitespace-nowrap truncate max-w-full">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

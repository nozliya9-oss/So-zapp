import React from 'react';
import {
  BookOpen,
  Building2,
  Gamepad2,
  MessageCircle,
  Stethoscope,
  Trophy,
  User,
  Users,
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
  { id: 'lessons', label: 'Darslar', mobileLabel: 'Darslar', icon: BookOpen },
  { id: 'city', label: 'So‘zlar shahri', mobileLabel: 'Shahar', icon: Building2 },
  { id: 'games', label: 'O‘yinlar', mobileLabel: 'O‘yinlar', icon: Gamepad2 },
  { id: 'tournament', label: 'Haftalik turnir', mobileLabel: 'Turnir', icon: Trophy },
  { id: 'chat', label: 'Kiki AI', mobileLabel: 'Kiki AI', icon: MessageCircle },
  { id: 'therapist', label: 'Logoped kabineti', mobileLabel: 'Logoped', icon: Stethoscope },
  { id: 'parent', label: 'Ota-ona kabineti', mobileLabel: 'Ota-ona', icon: Users },
  { id: 'profile', label: 'Profil', mobileLabel: 'Profil', icon: User },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  sfxEnabled,
}) => {
  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-[268px] shrink-0 border-r-2 border-[#E5E5E5] bg-white sticky top-0 h-screen px-4 py-5 justify-between overflow-y-auto">
        <div>
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onSelectTab('lessons');
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-[#E5F8FF]/60 transition-colors text-left mb-5"
          >
            <KikiLogo className="w-11 h-11 shrink-0" />
            <div className="min-w-0">
              <div className="font-display font-bold text-2xl text-[#008ECC] leading-tight truncate">
                So‘zApp
              </div>
              <div className="text-[11px] font-bold text-slate-500 truncate">
                Kiki bilan kichik harakat — katta natija
              </div>
            </div>
          </button>

          {/* 3D Styled Main Navigation */}
          <nav className="space-y-2" aria-label="Asosiy bo‘limlar">
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
                  className={`btn-3d w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-display font-bold text-sm whitespace-nowrap text-left ${
                    isActive
                      ? 'bg-[#E5F8FF] text-[#008ECC] border-2 border-[#00BFFF] border-b-[5px] border-b-[#008ECC]'
                      : 'bg-white text-slate-700 border-2 border-[#E5E5E5] border-b-[5px] border-b-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[#008ECC]' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quiet Slogan Footer */}
        <div className="pt-4 px-2 text-center">
          <p className="font-display font-bold text-xs text-[#008ECC] leading-snug">
            «Kiki bilan kichik harakat — katta natija»
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-[62px] bg-white/95 backdrop-blur-md border-t-2 border-[#E5E5E5] px-2 flex items-center"
        aria-label="Mobil bo‘limlar"
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-2xl mx-auto w-full">
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
                className={`min-h-[46px] min-w-[64px] flex-1 rounded-xl flex flex-col items-center justify-center gap-0.5 px-1.5 transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#E5F8FF] text-[#008ECC] border border-[#00BFFF]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold whitespace-nowrap">
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

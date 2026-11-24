import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Coins,
  Gift,
  Lock,
  Sparkles,
  Unlock,
  Volume2,
  X,
} from 'lucide-react';
import { CITY_BUILDINGS } from '../data/lessonsData';
import { CityBuilding, Language } from '../types';
import { KikiMascot } from './KikiMascot';
import {
  playButtonPop,
  playRetryTone,
  playSuccessChime,
  speakWord,
} from '../utils/soundEffects';

interface WordCityViewProps {
  stars: number;
  coins: number;
  claimedBuildingIds: string[];
  language: Language;
  sfxEnabled: boolean;
  onClaimBuildingReward: (building: CityBuilding) => void;
  onAddBonusCoins: (amount: number) => void;
  onGoToLessons: () => void;
}

const MAP_OFFSETS = [0, -56, -72, 0, 68, 54, 0, -60, 48, 0];

const BuildingIllustration: React.FC<{
  building: CityBuilding;
  unlocked: boolean;
}> = ({ building, unlocked }) => {
  const roof = unlocked ? building.roofColor : '#94A3B8';
  const wall = unlocked ? building.wallColor : '#F1F5F9';
  const accent = unlocked ? building.accentColor : '#CBD5E1';

  return (
    <svg
      viewBox="0 0 110 96"
      className="w-24 h-20 drop-shadow-sm select-none"
      aria-hidden="true"
    >
      {/* Ground patch */}
      <ellipse cx="55" cy="88" rx="42" ry="7" fill="rgba(180, 132, 72, 0.25)" />

      {/* Main Wall */}
      <rect
        x="22"
        y="38"
        width="66"
        height="48"
        rx="8"
        fill={wall}
        stroke={roof}
        strokeWidth="3.5"
      />

      {/* Roof */}
      {building.order % 3 === 0 ? (
        <path
          d="M16 42 Q55 10 94 42 Z"
          fill={roof}
          stroke={roof}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ) : building.order === 10 ? (
        <>
          <rect
            x="34"
            y="18"
            width="42"
            height="24"
            rx="4"
            fill={wall}
            stroke={roof}
            strokeWidth="3.5"
          />
          <polygon points="55,4 30,22 80,22" fill={roof} />
          <circle cx="55" cy="14" r="3.5" fill="#FFC800" />
        </>
      ) : (
        <polygon
          points="14,42 55,14 96,42"
          fill={roof}
          stroke={roof}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      {/* Windows */}
      <rect
        x="30"
        y="48"
        width="14"
        height="14"
        rx="3"
        fill="#FFFFFF"
        stroke={accent}
        strokeWidth="2.5"
      />
      <rect
        x="66"
        y="48"
        width="14"
        height="14"
        rx="3"
        fill="#FFFFFF"
        stroke={accent}
        strokeWidth="2.5"
      />

      {/* Door */}
      <path
        d="M47 86 V62 A8 8 0 0 1 63 62 V86 Z"
        fill={accent}
        stroke={roof}
        strokeWidth="2.5"
      />
      <circle cx="59" cy="74" r="2" fill="#FFFFFF" />
    </svg>
  );
};

const SceneryTree: React.FC<{ side: 'left' | 'right'; variant?: number }> = ({
  side,
  variant = 0,
}) => (
  <svg
    viewBox="0 0 64 76"
    aria-hidden="true"
    className={`pointer-events-none hidden sm:block w-14 h-16 opacity-90 ${
      side === 'left' ? 'mr-auto' : 'ml-auto'
    }`}
  >
    <ellipse cx="32" cy="70" rx="16" ry="4" fill="rgba(21, 128, 61, 0.22)" />
    <rect x="27" y="42" width="10" height="27" rx="4" fill="#A16207" />
    {variant % 2 === 0 ? (
      <>
        <circle cx="32" cy="30" r="19" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
        <circle cx="23" cy="24" r="11" fill="#4ADE80" />
      </>
    ) : (
      <>
        <polygon points="32,8 12,48 52,48" fill="#16A34A" stroke="#15803D" strokeWidth="2.5" />
        <polygon points="32,16 17,44 47,44" fill="#4ADE80" opacity="0.65" />
      </>
    )}
  </svg>
);

export const WordCityView: React.FC<WordCityViewProps> = ({
  stars,
  coins,
  claimedBuildingIds,
  language,
  sfxEnabled,
  onClaimBuildingReward,
  onAddBonusCoins,
  onGoToLessons,
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<CityBuilding | null>(null);
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [quizSolvedIds, setQuizSolvedIds] = useState<string[]>([]);

  const unlockedCount = CITY_BUILDINGS.filter((b) => stars >= b.unlockStars).length;
  const maxCityStars = CITY_BUILDINGS[CITY_BUILDINGS.length - 1]?.unlockStars || 560;
  const voicePowerLevel = Math.min(100, Math.round((stars / maxCityStars) * 100));

  const handleOpenBuilding = (building: CityBuilding) => {
    const isUnlocked = stars >= building.unlockStars;
    if (!isUnlocked) return;

    playButtonPop(!sfxEnabled);
    setQuizSelection(null);
    setSelectedBuilding(building);

    const alreadyClaimed = claimedBuildingIds.includes(building.id);
    if (!alreadyClaimed) {
      onClaimBuildingReward(building);
      playSuccessChime(!sfxEnabled);
      setRewardBanner(
        `Tabriklaymiz! «${building.name}» binosi ochildi — sizga +20 tanga mukofot berildi!`
      );
    }
  };

  const handleQuizOption = (building: CityBuilding, optionIdx: number) => {
    setQuizSelection(optionIdx);
    if (optionIdx === building.miniQuiz.correctIndex) {
      playSuccessChime(!sfxEnabled);
      if (!quizSolvedIds.includes(building.id)) {
        setQuizSolvedIds((prev) => [...prev, building.id]);
        onAddBonusCoins(10);
      }
    } else {
      playRetryTone(!sfxEnabled);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14 space-y-5">
      {/* Word City Header Banner */}
      <section className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold text-white/95">
              SO‘ZLAR SHAHRI · 10 TA BINO XARITASI
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mt-0.5">
              Vertikal 2D So‘zlar Shahri
            </h1>
            <p className="text-sm text-white/95 font-semibold mt-1">
              Har bir ochilgan bino ichida qiziqarli topshiriq va <strong>+20 tanga</strong>{' '}
              mukofot bor!
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <KikiMascot
              mood="happy"
              size="sm"
              className="!w-16 !h-16"
            />
            <div className="bg-white/20 border-2 border-white/35 rounded-2xl px-4 py-2.5">
              <div className="text-[11px] font-bold text-white/95">
                Ochilgan binolar: {unlockedCount}/10
              </div>
              <div className="font-display font-bold text-base tabular-nums flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#FFC800]" />
                <span>{coins} tanga</span>
              </div>
              <div className="text-[11px] font-bold text-white/90 tabular-nums">
                Ovoz kuchi: {voicePowerLevel}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Celebration Toast when +20 coins awarded */}
      {rewardBanner && (
        <div
          role="status"
          className="bg-amber-50 border-2 border-[#FFC800] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC800] text-slate-900 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm sm:text-base text-slate-900">
                +20 tanga qo‘shildi! 🪙
              </div>
              <p className="text-xs font-bold text-amber-900">{rewardBanner}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRewardBanner(null)}
            className="text-amber-800 hover:bg-amber-100 rounded-xl p-1.5"
            aria-label="Xabarni yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lush 2D Illustrated Terrain Town Map (Green grass, Sand road, Blue river) */}
      <section
        aria-label="So‘zlar shahri 2D xaritasi"
        className="relative rounded-3xl border-2 border-[#4ADE80] overflow-hidden px-4 py-8"
        style={{
          background:
            'linear-gradient(180deg, #93E5FF 0%, #D9F99D 14%, #86EFAC 45%, #BEF264 75%, #86EFAC 100%)',
        }}
      >
        {/* Illustrated Sky, Hills, Winding Blue River & Bridges SVG Backdrop */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 1900"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full z-0"
        >
          {/* Soft Sunny Sky Band at Top */}
          <rect x="0" y="0" width="800" height="220" fill="#7DD3FC" opacity="0.55" />
          <circle cx="710" cy="70" r="38" fill="#FDE047" opacity="0.85" />
          <ellipse cx="140" cy="65" rx="68" ry="22" fill="#FFFFFF" opacity="0.7" />
          <ellipse cx="520" cy="95" rx="54" ry="18" fill="#FFFFFF" opacity="0.65" />

          {/* Green Rolling Meadows */}
          <ellipse cx="120" cy="480" rx="220" ry="120" fill="#4ADE80" opacity="0.45" />
          <ellipse cx="690" cy="840" rx="240" ry="140" fill="#4ADE80" opacity="0.45" />
          <ellipse cx="140" cy="1280" rx="230" ry="130" fill="#4ADE80" opacity="0.45" />
          <ellipse cx="670" cy="1660" rx="220" ry="120" fill="#4ADE80" opacity="0.45" />

          {/* Winding Blue River & Pond */}
          <path
            d="M -40 420 Q 210 380, 170 620 T 680 960 T 140 1380 T 760 1760"
            fill="none"
            stroke="#00BFFF"
            strokeWidth="44"
            strokeLinecap="round"
            opacity="0.72"
          />
          <path
            d="M -40 420 Q 210 380, 170 620 T 680 960 T 140 1380 T 760 1760"
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="12"
            strokeDasharray="24 28"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Warm Sand Plaza Patches */}
          <ellipse cx="400" cy="240" rx="190" ry="60" fill="#F3D5A5" opacity="0.55" />
          <ellipse cx="400" cy="980" rx="200" ry="65" fill="#F3D5A5" opacity="0.5" />
          <ellipse cx="400" cy="1730" rx="210" ry="70" fill="#F3D5A5" opacity="0.55" />
        </svg>

        <div className="flex flex-col items-center relative z-10">
          {CITY_BUILDINGS.map((building, idx) => {
            const isUnlocked = stars >= building.unlockStars;
            const isClaimed = claimedBuildingIds.includes(building.id);
            const offset = MAP_OFFSETS[idx % MAP_OFFSETS.length];
            const nextOffset =
              idx < CITY_BUILDINGS.length - 1
                ? MAP_OFFSETS[(idx + 1) % MAP_OFFSETS.length]
                : offset;

            return (
              <div
                key={building.id}
                className="relative flex flex-col items-center w-full mb-10 last:mb-2"
              >
                {/* Decorative trees flanking the terrain */}
                <div className="pointer-events-none absolute inset-x-2 top-4 flex justify-between items-center z-0">
                  {idx % 2 === 0 ? (
                    <SceneryTree side="left" variant={idx} />
                  ) : (
                    <div />
                  )}
                  {idx % 2 === 1 ? (
                    <SceneryTree side="right" variant={idx} />
                  ) : (
                    <div />
                  )}
                </div>

                {/* Warm Sand / Earth Winding Road Segment */}
                {idx < CITY_BUILDINGS.length - 1 && (
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 w-[280px] h-[170px] z-0"
                    viewBox="-140 0 280 170"
                    fill="none"
                  >
                    <path
                      d={`M ${offset} 18 C ${offset} 85, ${nextOffset} 75, ${nextOffset} 158`}
                      stroke={isUnlocked ? '#E6BE8A' : '#D6D3D1'}
                      strokeWidth="26"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${offset} 18 C ${offset} 85, ${nextOffset} 75, ${nextOffset} 158`}
                      stroke={isUnlocked ? '#FDE68A' : '#E7E5E4'}
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${offset} 18 C ${offset} 85, ${nextOffset} 75, ${nextOffset} 158`}
                      stroke={isUnlocked ? '#D97706' : '#94A3B8'}
                      strokeWidth="2.5"
                      strokeDasharray="8 9"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Building Node + Name & Short Activity Description Directly Below */}
                <div
                  style={{ transform: `translateX(${offset}px)` }}
                  className="relative z-10 flex flex-col items-center max-w-[260px] text-center"
                >
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    aria-disabled={!isUnlocked}
                    onClick={() => handleOpenBuilding(building)}
                    className={`group relative rounded-3xl p-3 border-2 transition-transform ${
                      isUnlocked
                        ? 'bg-[#FFFDF7] border-[#00BFFF] shadow-md hover:-translate-y-1 cursor-pointer'
                        : 'bg-slate-200/90 border-slate-300 grayscale opacity-75 cursor-not-allowed'
                    }`}
                    aria-label={
                      isUnlocked
                        ? `${building.name} binosini ochish`
                        : `${building.name} — qulflangan bino`
                    }
                  >
                    <div className={isUnlocked ? '' : 'grayscale opacity-70'}>
                      <BuildingIllustration building={building} unlocked={isUnlocked} />
                    </div>

                    {!isUnlocked && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-900/15"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-slate-700/90 text-white flex items-center justify-center shadow-sm border border-white/40">
                          <Lock className="w-5 h-5" />
                        </div>
                      </div>
                    )}

                    <span
                      className={`absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-xl text-[11px] font-extrabold border shadow-xs flex items-center gap-1 ${
                        isUnlocked
                          ? isClaimed
                            ? 'bg-[#58CC02] text-white border-[#46A302]'
                            : 'bg-[#FFC800] text-slate-900 border-[#E5A500] animate-bounce'
                          : 'bg-slate-600 text-white border-slate-700'
                      }`}
                    >
                      {isUnlocked ? (
                        isClaimed ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Ochiq</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-3 h-3" />
                            <span>+20 tanga!</span>
                          </>
                        )
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span className="tabular-nums">{building.unlockStars} ⭐</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Building Name & Short Activity Description Directly Below */}
                  <div
                    className={`mt-2.5 border-2 rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isUnlocked
                        ? 'bg-white/95 border-[#E5E5E5]'
                        : 'bg-slate-100/90 border-slate-300/90'
                    }`}
                  >
                    <div
                      className={`font-display font-bold text-sm sm:text-base leading-tight ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {building.order}. {building.name}
                    </div>
                    <p
                      className={`text-[11px] sm:text-xs font-semibold mt-1 leading-snug ${
                        isUnlocked ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {building.description}
                    </p>
                    <div className="text-[11px] font-extrabold mt-1.5 tabular-nums flex items-center justify-center gap-1.5">
                      {isUnlocked ? (
                        <span className="text-[#008ECC]">
                          {isClaimed ? '🪙 +20 tanga olingan' : '🎁 Kirib +20 tanga oling!'}
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>
                            Qulflangan · {building.unlockStars} ⭐ (
                            {Math.max(0, building.unlockStars - stars)} ⭐ qoldi)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Building Detail & Mini-Activity Modal */}
      {selectedBuilding && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={selectedBuilding.name}
        >
          <div className="bg-white border-2 border-[#E5E5E5] rounded-3xl max-w-lg w-full p-6 relative shadow-xl my-auto">
            <button
              type="button"
              onClick={() => {
                playButtonPop(!sfxEnabled);
                setSelectedBuilding(null);
              }}
              className="absolute top-4 right-4 min-w-[40px] min-h-[40px] rounded-xl border-2 border-[#E5E5E5] flex items-center justify-center text-slate-500 hover:bg-slate-50"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-4 pr-8">
              <BuildingIllustration
                building={selectedBuilding}
                unlocked={stars >= selectedBuilding.unlockStars}
              />
              <div>
                <div className="text-xs font-extrabold text-[#008ECC]">
                  {selectedBuilding.soundFocus}
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900">
                  {selectedBuilding.order}. {selectedBuilding.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                  {selectedBuilding.description}
                </p>
              </div>
            </div>

            {stars >= selectedBuilding.unlockStars ? (
              <div className="space-y-4">
                {/* Coin Status Banner */}
                <div className="bg-amber-50 border border-[#FFC800] rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-[#F59E0B]" />
                    <span>Bino mukofoti (+20 tanga) qo‘shildi!</span>
                  </span>
                  <span className="text-[#46A302] font-extrabold">✓ Olingan</span>
                </div>

                {/* Story Card */}
                <div className="bg-[#E5F8FF]/70 border border-[#00BFFF]/40 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-extrabold text-[#008ECC] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Kiki hikoyasi</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playButtonPop(!sfxEnabled);
                        speakWord(selectedBuilding.storyLine, 'uz-UZ');
                      }}
                      className="text-xs font-bold text-[#008ECC] hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Tinglash</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                    {selectedBuilding.storyLine}
                  </p>
                </div>

                {/* Interactive Mini-Challenge */}
                <div className="bg-emerald-50/70 border-2 border-[#58CC02]/40 rounded-2xl p-4 space-y-2.5">
                  <div className="text-xs font-extrabold text-[#3B8700]">
                    Bino ichidagi mini-topshiriq (+10 tanga):
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedBuilding.miniQuiz.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedBuilding.miniQuiz.options.map((opt, idx) => {
                      const isSelected = quizSelection === idx;
                      const isCorrect = idx === selectedBuilding.miniQuiz.correctIndex;
                      let btnStyle =
                        'bg-white border-2 border-[#E5E5E5] text-slate-800 hover:border-[#00BFFF]';
                      if (isSelected) {
                        btnStyle = isCorrect
                          ? 'bg-[#58CC02] border-[#46A302] text-white'
                          : 'bg-[#FF4B4B] border-[#EA2B2B] text-white';
                      }
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleQuizOption(selectedBuilding, idx)}
                          className={`btn-3d rounded-xl py-2 px-3 text-xs sm:text-sm font-bold transition-colors ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSelection !== null && (
                    <p
                      className={`text-xs font-bold flex items-center gap-1.5 ${
                        quizSelection === selectedBuilding.miniQuiz.correctIndex
                          ? 'text-[#3B8700]'
                          : 'text-[#C81E1E]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        {quizSelection === selectedBuilding.miniQuiz.correctIndex
                          ? selectedBuilding.miniQuiz.praiseUz
                          : 'Yana bir marta diqqat bilan sinab ko‘ring!'}
                      </span>
                    </p>
                  )}
                </div>

                {/* Pronunciation Cards */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-slate-500">
                    Tezkor tinglash va takrorlash kartochkalari:
                  </div>
                  {selectedBuilding.practiceCards.map((card) => (
                    <button
                      key={card.word}
                      type="button"
                      onClick={() => {
                        playButtonPop(!sfxEnabled);
                        speakWord(
                          card.word,
                          /[а-яА-ЯёЁ]/.test(card.word)
                            ? 'ru-RU'
                            : language === 'ru'
                              ? 'ru-RU'
                              : 'uz-UZ'
                        );
                      }}
                      className="btn-3d w-full bg-[#E5F8FF]/70 hover:bg-[#E5F8FF] border-2 border-[#00BFFF]/50 border-b-[4px] border-b-[#008ECC] rounded-2xl p-3 flex items-center justify-between text-left"
                    >
                      <div>
                        <div className="font-display font-bold text-base text-slate-900">
                          {card.word}{' '}
                          <span className="text-xs font-extrabold text-[#008ECC] ml-1.5">
                            ({card.syllables})
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-600 mt-0.5">
                          {card.tip}
                        </div>
                      </div>
                      <Volume2 className="w-5 h-5 text-[#008ECC] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-[#FFC800]/60 rounded-2xl p-4 text-center space-y-3">
                <p className="text-sm font-bold text-amber-900">
                  Ushbu binoni ochish va <strong>+20 tanga</strong> olish uchun yana{' '}
                  <span className="tabular-nums font-extrabold">
                    {selectedBuilding.unlockStars - stars} ⭐
                  </span>{' '}
                  yulduzcha to‘plash kerak.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!sfxEnabled);
                    setSelectedBuilding(null);
                    onGoToLessons();
                  }}
                  className="btn-3d w-full bg-[#FFC800] hover:bg-[#F5BE00] text-slate-900 border-[#E5A500] rounded-2xl py-3 px-5 font-display font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Darslarga o‘tib yulduz yig‘ish</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

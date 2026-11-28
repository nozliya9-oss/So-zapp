import React from 'react';
import { Check } from 'lucide-react';
import { ObstacleJumpItem } from '../../data/gamesPathData';
import { KikiMascot } from '../KikiMascot';
import { ObstacleIllustration } from './GameItemArtwork';

interface ObstacleJumpSceneProps {
  obstacles: ObstacleJumpItem[];
  stepIdx: number;
  isJumping: boolean;
  isListening: boolean;
}

const OBSTACLE_X_PERCENT = [20, 35, 50, 65, 80];

/**
 * Multi-layered 5-obstacle park running track:
 * Sky, clouds, distant hills, trees, and path stay stationary and grounded;
 * ONLY Kiki leaps along a smooth parabolic arc over the active obstacle when the word is spoken clearly.
 */
export const ObstacleJumpScene: React.FC<ObstacleJumpSceneProps> = ({
  obstacles,
  stepIdx,
  isJumping,
  isListening,
}) => {
  // Position Kiki cleanly just before the active obstacle (between ~7% and ~67%)
  const kikiLeftPct = Math.max(7, (OBSTACLE_X_PERCENT[stepIdx] ?? 80) - 13);

  return (
    <div className="relative rounded-3xl border-2 border-[#BCEEFF] dark:border-slate-700 overflow-hidden bg-[#E0F7FF] select-none">
      {/* Stationary Multi-Layered Sky, Clouds, Hills, Trees, and Dirt Track */}
      <div className="relative h-56 sm:h-64 w-full">
        <svg
          viewBox="0 0 720 260"
          preserveAspectRatio="none"
          className="w-full h-full block"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="jumpSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="68%" stopColor="#E0F7FF" />
              <stop offset="100%" stopColor="#F0FDF4" />
            </linearGradient>
            <linearGradient id="jumpPath" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Sky & Sun */}
          <rect width="720" height="260" fill="url(#jumpSky)" />
          <circle cx="640" cy="44" r="24" fill="#FDE047" />
          <circle cx="640" cy="44" r="34" fill="#FEF08A" opacity="0.35" />

          {/* Stationary Clouds */}
          <g fill="#FFFFFF" opacity="0.9">
            <path d="M88 54 C76 54, 74 41, 84 38 C87 28, 102 25, 110 32 C119 26, 134 31, 134 42 C142 44, 141 54, 131 54 Z" />
            <path d="M350 44 C340 44, 338 33, 347 30 C350 21, 364 19, 371 25 C379 20, 392 25, 392 34 C399 36, 398 44, 389 44 Z" />
          </g>

          {/* Stationary Distant Rolling Hills */}
          <path
            d="M0 175 Q170 112 360 156 T720 144 L720 260 L0 260 Z"
            fill="#86EFAC"
          />
          <path
            d="M0 184 Q230 146 470 176 T720 166 L720 260 L0 260 Z"
            fill="#4ADE80"
          />

          {/* Stationary Background Trees */}
          {[
            [52, 130, 18],
            [185, 124, 21],
            [435, 132, 19],
            [585, 122, 22],
          ].map(([tx, ty, r], i) => (
            <g key={i}>
              <rect x={tx - 4} y={ty + 10} width="8" height="26" rx="2" fill="#92400E" />
              <circle cx={tx} cy={ty} r={r} fill="#16A34A" />
              <circle cx={tx - 7} cy={ty - 5} r={r * 0.5} fill="#22C55E" />
            </g>
          ))}

          {/* Grounded Grass Shoulder & Running Path */}
          <rect x="0" y="186" width="720" height="74" fill="#22C55E" />
          <rect x="0" y="200" width="720" height="36" fill="url(#jumpPath)" />
          <line x1="0" y1="200" x2="720" y2="200" stroke="#D97706" strokeWidth="3" />
          <line x1="0" y1="236" x2="720" y2="236" stroke="#B45309" strokeWidth="3" />

          {/* Finish Arch ("MARRA") on Far Right */}
          <g transform="translate(658, 146)">
            <rect x="0" y="0" width="7" height="62" rx="3" fill="#FFFFFF" stroke="#0369A1" strokeWidth="2" />
            <rect x="34" y="0" width="7" height="62" rx="3" fill="#FFFFFF" stroke="#0369A1" strokeWidth="2" />
            <rect x="-2" y="-6" width="46" height="18" rx="5" fill="#00BFFF" stroke="#0369A1" strokeWidth="2" />
            <text x="21" y="6" textAnchor="middle" fontSize="9" fontWeight="800" fill="#FFFFFF">
              MARRA
            </text>
          </g>
        </svg>

        {/* Grounded 5 Sequential Obstacles Along the Path */}
        {obstacles.map((obs, idx) => {
          const leftPct = OBSTACLE_X_PERCENT[idx] ?? 84;
          const isCleared = idx < stepIdx;
          const isCurrent = idx === stepIdx;

          return (
            <div
              key={obs.id}
              style={{ left: `${leftPct}%` }}
              className="absolute bottom-[28px] -translate-x-1/2 flex flex-col items-center z-10"
            >
              {isCleared && (
                <div className="mb-0.5 w-5 h-5 rounded-full bg-[#58CC02] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
              {isCurrent && !isJumping && (
                <div className="mb-0.5 px-1.5 py-0.5 rounded-md bg-white/95 text-[#008ECC] text-[10px] font-extrabold border border-[#00BFFF] shadow-2xs whitespace-nowrap">
                  {obs.word}
                </div>
              )}
              <ObstacleIllustration
                kind={obs.obstacleKind}
                className={`w-12 h-10 sm:w-14 sm:h-12 transition-transform ${
                  isCurrent ? 'scale-105' : isCleared ? 'opacity-75' : 'opacity-95'
                }`}
              />
              <span
                className={`mt-0.5 text-[10px] font-extrabold px-1.5 rounded-full tabular-nums ${
                  isCleared
                    ? 'bg-[#58CC02] text-white'
                    : isCurrent
                      ? 'bg-[#00BFFF] text-white'
                      : 'bg-white/90 text-slate-600'
                }`}
              >
                {idx + 1}
              </span>
            </div>
          );
        })}

        {/* Independent Runner Character Layer: Kiki Panda */}
        <div
          style={{
            left: `${kikiLeftPct}%`,
            transition: 'left 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="absolute bottom-[30px] -translate-x-1/2 z-20"
        >
          <div className={isJumping ? 'animate-kiki-arc-jump' : ''}>
            <KikiMascot
              mood={isJumping ? 'happy' : isListening ? 'listening' : 'idle'}
              size="sm"
              className="!w-16 !h-16 sm:!w-20 sm:!h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

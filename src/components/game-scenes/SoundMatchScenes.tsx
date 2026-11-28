import React from 'react';
import { ItemIllustration } from './GameItemArtwork';

interface HedgehogBasketSceneProps {
  targetLabel: string;
  correctArtKey: string;
  solved: boolean;
}

/**
 * Scene 1 ("Tipratikan va savati"):
 * Grounded stationary meadow & garden path backdrop; ONLY the hedgehog character layer
 * changes expression (sad/waiting -> cheerful) and walks/steps smoothly along the path to the basket.
 */
export const HedgehogBasketScene: React.FC<HedgehogBasketSceneProps> = ({
  targetLabel,
  correctArtKey,
  solved,
}) => {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-auto sm:h-64 rounded-3xl border-2 border-[#BCEEFF] dark:border-slate-700 overflow-hidden bg-gradient-to-b from-[#7DD3FC] via-[#E0F7FF] to-[#16A34A] select-none">
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Tipratikan va savati o‘tloq sahnasi"
      >
        <defs>
          <linearGradient id="meadowSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="65%" stopColor="#E0F7FF" />
            <stop offset="100%" stopColor="#F0FDF4" />
          </linearGradient>
          <linearGradient id="meadowHillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="meadowGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="gardenPath" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* LAYER 1: Stationary Sky, Sun & Clouds */}
        <rect width="640" height="260" fill="url(#meadowSky)" />
        <circle cx="565" cy="48" r="28" fill="#FDE047" />
        <circle cx="565" cy="48" r="38" fill="#FEF08A" opacity="0.4" />
        {/* Stationary Fluffy Clouds */}
        <g fill="#FFFFFF" opacity="0.92">
          <path d="M72 60 C60 60, 58 46, 68 43 C70 32, 86 29, 95 36 C103 28, 120 33, 120 45 C129 47, 128 60, 118 60 Z" />
          <path d="M310 52 C300 52, 298 40, 307 37 C310 27, 325 25, 332 32 C341 26, 355 31, 355 41 C363 43, 362 52, 352 52 Z" />
        </g>

        {/* LAYER 2: Stationary Distant Hills & Trees */}
        <path
          d="M0 175 Q140 120 290 165 T640 155 L640 260 L0 260 Z"
          fill="url(#meadowHillBack)"
        />
        {/* Stationary Meadow Trees */}
        <g>
          <rect x="48" y="132" width="10" height="32" rx="3" fill="#92400E" />
          <circle cx="53" cy="120" r="22" fill="#22C55E" />
          <circle cx="40" cy="128" r="14" fill="#4ADE80" />
          <rect x="572" y="128" width="11" height="34" rx="3" fill="#92400E" />
          <circle cx="578" cy="116" r="24" fill="#16A34A" />
          <circle cx="592" cy="124" r="14" fill="#22C55E" />
        </g>

        {/* LAYER 3: Grounded Foreground Grass & Curved Footpath */}
        <path
          d="M0 175 Q220 155 420 178 T640 168 L640 260 L0 260 Z"
          fill="url(#meadowGround)"
        />
        {/* Grounded Footpath */}
        <path
          d="M65 232 Q220 202 350 220 T520 212"
          fill="none"
          stroke="#B45309"
          strokeWidth="36"
          strokeLinecap="round"
          opacity="0.22"
        />
        <path
          d="M65 229 Q220 199 350 217 T520 209"
          fill="none"
          stroke="url(#gardenPath)"
          strokeWidth="28"
          strokeLinecap="round"
        />
        {/* Meadow Wildflowers */}
        {[
          [92, 198, '#F43F5E'],
          [215, 244, '#FACC15'],
          [388, 195, '#FFFFFF'],
          [442, 242, '#EC4899'],
          [602, 232, '#FACC15'],
        ].map(([x, y, col], idx) => (
          <g key={idx} transform={`translate(${x}, ${y})`}>
            <circle cx="0" cy="0" r="5" fill={String(col)} />
            <circle cx="0" cy="0" r="2" fill="#F59E0B" />
          </g>
        ))}

        {/* LAYER 4: Stationary Target Woven Basket on Right Side of Path */}
        <g transform="translate(476, 134)">
          <ellipse cx="48" cy="84" rx="34" ry="8" fill="#0F172A" opacity="0.2" />
          <path
            d="M22 44 C22 14, 74 14, 74 44"
            fill="none"
            stroke="#78350F"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {solved && (
            <g transform="translate(20, 12) scale(0.85)">
              <ItemIllustration artKey={correctArtKey} />
            </g>
          )}
          <path
            d="M14 45 L82 45 L72 80 C71 84, 25 84, 24 80 Z"
            fill="#F59E0B"
            stroke={solved ? '#15803D' : '#92400E'}
            strokeWidth="3.2"
          />
          <path
            d="M20 56 H76 M22 67 H74 M35 47 V81 M48 47 V81 M61 47 V81"
            stroke="#B45309"
            strokeWidth="2.2"
          />
          <rect
            x="10"
            y="40"
            width="76"
            height="10"
            rx="5"
            fill="#D97706"
            stroke={solved ? '#15803D' : '#92400E'}
            strokeWidth="2.6"
          />
          <rect x="26" y="54" width="44" height="17" rx="5" fill="#FFFFFF" opacity="0.92" />
          <text
            x="48"
            y="66"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill="#0284C7"
          >
            {targetLabel}
          </text>
          {solved && (
            <g>
              <circle cx="14" cy="18" r="5" fill="#FACC15" />
              <circle cx="84" cy="14" r="4" fill="#00BFFF" />
              <circle cx="48" cy="2" r="5.5" fill="#58CC02" />
            </g>
          )}
        </g>

        {/* LAYER 5: Independent Animated Hedgehog Character */}
        <g
          style={{
            transform: solved ? 'translateX(295px)' : 'translateX(0px)',
            transition: 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <g
            transform="translate(88, 152)"
            className={solved ? 'animate-hedgehog-step' : ''}
          >
            {/* Contact shadow */}
            <ellipse cx="48" cy="70" rx="34" ry="7" fill="#0F172A" opacity="0.22" />
            {/* Little legs */}
            <rect x="26" y="58" width="9" height="12" rx="4.5" fill="#92400E" />
            <rect x="52" y="58" width="9" height="12" rx="4.5" fill="#92400E" />
            {/* Spiky brown hedgehog coat */}
            <path
              d="M12 50 C8 32, 19 13, 39 10 C55 8, 69 18, 72 34 L68 58 C50 64, 22 62, 12 50 Z"
              fill="#78350F"
              stroke="#451A03"
              strokeWidth="2.8"
            />
            {/* Spike ridges */}
            <path
              d="M18 26 L10 20 L22 18 L17 9 L29 14 L29 5 L39 12 L46 4 L49 14 L59 9 L57 18"
              fill="#92400E"
              stroke="#451A03"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Warm cream face & snout */}
            <path
              d="M44 26 C57 22, 74 28, 86 42 C88 47, 84 57, 74 59 C60 62, 46 58, 42 46 C40 37, 41 29, 44 26 Z"
              fill="#FDE68A"
              stroke="#92400E"
              strokeWidth="2.6"
            />
            {/* Cute ear */}
            <circle cx="48" cy="28" r="6" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
            {/* Nose */}
            <circle cx="85" cy="43" r="4.2" fill="#1E293B" />

            {/* Expression: Sad/waiting vs Cheerful */}
            {solved ? (
              <>
                <circle cx="63" cy="39" r="3.4" fill="#0F172A" />
                <circle cx="62" cy="38" r="1.2" fill="#FFFFFF" />
                <ellipse cx="59" cy="46" rx="4.2" ry="2.4" fill="#FB7185" opacity="0.65" />
                <path
                  d="M64 49 Q71 55 77 48"
                  fill="none"
                  stroke="#78350F"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle cx="63" cy="40" r="3" fill="#0F172A" />
                <path
                  d="M58 34 L67 36"
                  stroke="#78350F"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
                <path
                  d="M65 52 Q71 48 76 52"
                  fill="none"
                  stroke="#78350F"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>
        </g>
      </svg>

      {/* Clean status ribbon anchored bottom-left */}
      <div className="pointer-events-none absolute left-3 top-3 bg-white/92 dark:bg-slate-900/90 border border-[#00BFFF]/50 rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] shadow-2xs">
        {solved
          ? 'Tipratikan xursand bo‘lib savatiga bordi!'
          : `Tipratikan «${targetLabel}»ni kutmoqda...`}
      </div>
    </div>
  );
};

interface LockKeySceneProps {
  targetLabel: string;
  solved: boolean;
}

/**
 * Scene 2 ("Qulf va kalit"):
 * Stationary stone archway, warm lanterns, and oak treasure chest; ONLY the brass lock
 * shackle and golden key mechanism turn and unlock when the right key is chosen.
 */
export const LockKeyScene: React.FC<LockKeySceneProps> = ({
  targetLabel,
  solved,
}) => {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-auto sm:h-64 rounded-3xl border-2 border-[#BCEEFF] dark:border-slate-700 overflow-hidden bg-gradient-to-b from-[#1E3A5F] via-[#0F172A] to-[#451A03] select-none">
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Qulf va kalit sandiq sahnasi"
      >
        <defs>
          <linearGradient id="alcoveWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3A5F" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* LAYER 1: Stationary Stone Room & Lantern Glow */}
        <rect width="640" height="260" fill="url(#alcoveWall)" />
        {/* Stone bricks */}
        <g stroke="#334155" strokeWidth="2" opacity="0.45">
          <line x1="0" y1="55" x2="640" y2="55" />
          <line x1="0" y1="110" x2="640" y2="110" />
          <line x1="0" y1="165" x2="640" y2="165" />
          <line x1="120" y1="0" x2="120" y2="55" />
          <line x1="320" y1="55" x2="320" y2="110" />
          <line x1="510" y1="0" x2="510" y2="55" />
        </g>
        {/* Warm wooden floor */}
        <rect x="0" y="205" width="640" height="55" fill="#451A03" />
        <line x1="0" y1="205" x2="640" y2="205" stroke="#92400E" strokeWidth="3" />

        {/* Stationary Hanging Lanterns */}
        {[92, 548].map((lx, idx) => (
          <g key={idx}>
            <circle cx={lx} cy="78" r="56" fill="url(#lanternGlow)" />
            <line x1={lx} y1="0" x2={lx} y2="52" stroke="#94A3B8" strokeWidth="3" />
            <rect
              x={lx - 13}
              y="52"
              width="26"
              height="34"
              rx="6"
              fill="#FDE047"
              stroke="#B45309"
              strokeWidth="3"
            />
          </g>
        ))}

        {/* LAYER 2: Stationary Wooden Treasure Chest */}
        <g transform="translate(185, 58)">
          {/* Floor shadow */}
          <ellipse cx="135" cy="156" rx="126" ry="12" fill="#020617" opacity="0.45" />

          {/* Unlocked golden glow inside chest seam */}
          {solved && (
            <ellipse
              cx="135"
              cy="66"
              rx="116"
              ry="14"
              fill="#FDE047"
              opacity="0.7"
            />
          )}

          {/* Chest Domed Lid (completely grounded on chest) */}
          <path
            d="M25 65 C25 22, 245 22, 245 65 Z"
            fill="#D97706"
            stroke="#451A03"
            strokeWidth="4"
          />
          {/* Chest Lower Body */}
          <rect
            x="22"
            y="65"
            width="226"
            height="86"
            rx="12"
            fill="url(#chestWood)"
            stroke="#451A03"
            strokeWidth="4"
          />
          {/* Wood plank lines */}
          <line x1="25" y1="96" x2="245" y2="96" stroke="#451A03" strokeWidth="2.4" opacity="0.5" />
          <line x1="25" y1="126" x2="245" y2="126" stroke="#451A03" strokeWidth="2.4" opacity="0.5" />

          {/* Brass vertical straps */}
          <rect x="46" y="32" width="18" height="119" rx="4" fill="#FACC15" stroke="#92400E" strokeWidth="2.6" />
          <rect x="206" y="32" width="18" height="119" rx="4" fill="#FACC15" stroke="#92400E" strokeWidth="2.6" />

          {/* LAYER 3: ONLY Lock & Key Mechanism Animates */}
          <g transform="translate(107, 50)">
            {/* Stationary mounting plate */}
            <rect
              x="6"
              y="6"
              width="44"
              height="24"
              rx="6"
              fill="#FACC15"
              stroke="#78350F"
              strokeWidth="2.6"
            />

            {/* Animated Shackle (pops upward when unlocked) */}
            <path
              d="M15 36 V24 C15 12, 41 12, 41 24 V36"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="7"
              strokeLinecap="round"
              style={{
                transform: solved ? 'translateY(-14px)' : 'translateY(0px)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
              }}
            />

            {/* Padlock body */}
            <rect
              x="7"
              y="33"
              width="42"
              height="38"
              rx="9"
              fill={solved ? '#4ADE80' : '#FACC15'}
              stroke={solved ? '#15803D' : '#92400E'}
              strokeWidth="3"
            />

            {/* Keyhole */}
            <circle cx="28" cy="49" r="5" fill="#1E293B" />
            <polygon points="25,52 31,52 32.5,63 23.5,63" fill="#1E293B" />

            {/* Turning Golden Key when solved */}
            {solved && (
              <g transform="translate(28, 51)">
                <g className="animate-key-unlock">
                  <rect
                    x="-28"
                    y="-4"
                    width="30"
                    height="8"
                    rx="3"
                    fill="#FEF08A"
                    stroke="#92400E"
                    strokeWidth="2"
                  />
                  <circle
                    cx="-33"
                    cy="0"
                    r="10"
                    fill="#FACC15"
                    stroke="#92400E"
                    strokeWidth="2.4"
                  />
                  <circle cx="-33" cy="0" r="4" fill="#FFFFFF" />
                </g>
              </g>
            )}
          </g>
        </g>
      </svg>

      {/* Clean status ribbon anchored top-left */}
      <div className="pointer-events-none absolute left-3 top-3 bg-slate-900/90 border border-[#00BFFF]/50 rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#38BDF8] shadow-2xs">
        {solved
          ? 'Qulf ochildi! To‘g‘ri kalit topildi!'
          : `Qulf uchun ${targetLabel}ni tanlang`}
      </div>
    </div>
  );
};

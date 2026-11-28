import React from 'react';

/**
 * Six standout, custom-illustrated decorative objects positioned around the
 * bends of the 30-level winding snake ("ilon izi") path in GamesView.
 * Rendered in a low-priority z-0 pointer-events-none layer with gentle motion
 * so level nodes, dashed road path, and 0–3 star badges stay prominent at z-10.
 */
interface SnakePathDecorationsProps {
  compact?: boolean;
}

export const SnakePathDecorations: React.FC<SnakePathDecorationsProps> = ({
  compact = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* 1. Friendly Smiling Sun & Pastel Cloud (near Stage 2, right bend) */}
      <div className="animate-decor-float absolute top-[3.5%] right-2 sm:right-7 w-16 h-16 sm:w-24 sm:h-24 opacity-95">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
          <defs>
            <radialGradient id="decorSunGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <linearGradient id="decorCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          {/* Warm sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="68"
              y1="14"
              x2="68"
              y2="24"
              stroke="#FBBF24"
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${deg} 68 48)`}
            />
          ))}
          {/* Sun orb */}
          <circle cx="68" cy="48" r="24" fill="url(#decorSunGrad)" stroke="#F59E0B" strokeWidth="2.5" />
          {/* Sun face */}
          <circle cx="60" cy="45" r="2.6" fill="#78350F" />
          <circle cx="76" cy="45" r="2.6" fill="#78350F" />
          <ellipse cx="55.5" cy="50" rx="3.4" ry="2" fill="#FB7185" opacity="0.55" />
          <ellipse cx="80.5" cy="50" rx="3.4" ry="2" fill="#FB7185" opacity="0.55" />
          <path d="M 61 52 Q 68 58 75 52" fill="none" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
          {/* Soft pastel foreground cloud */}
          <path
            d="M 24 88 C 14 88 8 81 8 73 C 8 65 15 59 23 59 C 26 50 35 45 45 47 C 52 47 59 52 61 60 C 69 60 76 66 76 74 C 76 82 69 88 60 88 Z"
            fill="url(#decorCloudGrad)"
            stroke="#BAE6FD"
            strokeWidth="2.5"
          />
          <path d="M 24 72 Q 36 66 50 71" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>

      {/* 2. Cute Bunny Friend Holding a Carrot (near Stage 7, left bend) */}
      {!compact && (
      <div className="animate-decor-bob absolute top-[19.5%] left-2 sm:left-7 w-16 h-20 sm:w-24 sm:h-28 opacity-95">
        <svg viewBox="0 0 110 130" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="bunnyFur" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
            <linearGradient id="carrotOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          {/* Bunny shadow */}
          <ellipse cx="55" cy="120" rx="30" ry="6" fill="#0284C7" opacity="0.14" />
          {/* Left & Right Ears */}
          <ellipse cx="41" cy="28" rx="9" ry="22" transform="rotate(-10 41 28)" fill="url(#bunnyFur)" stroke="#CBD5E1" strokeWidth="2.5" />
          <ellipse cx="41" cy="30" rx="4.5" ry="14" transform="rotate(-10 41 30)" fill="#FDA4AF" />
          <ellipse cx="69" cy="28" rx="9" ry="22" transform="rotate(10 69 28)" fill="url(#bunnyFur)" stroke="#CBD5E1" strokeWidth="2.5" />
          <ellipse cx="69" cy="30" rx="4.5" ry="14" transform="rotate(10 69 30)" fill="#FDA4AF" />
          {/* Body / Sky-blue tee */}
          <path d="M 32 82 C 32 70 78 70 78 82 L 82 110 C 82 116 28 116 28 110 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
          <path d="M 34 94 H 76" stroke="#BAE6FD" strokeWidth="3.5" />
          {/* Head */}
          <circle cx="55" cy="58" r="22" fill="url(#bunnyFur)" stroke="#CBD5E1" strokeWidth="2.5" />
          {/* Eyes & Nose */}
          <circle cx="46" cy="55" r="3" fill="#1E293B" />
          <circle cx="47" cy="53.8" r="1" fill="#FFFFFF" />
          <circle cx="64" cy="55" r="3" fill="#1E293B" />
          <circle cx="65" cy="53.8" r="1" fill="#FFFFFF" />
          <ellipse cx="40" cy="61" rx="4" ry="2.2" fill="#FDA4AF" opacity="0.7" />
          <ellipse cx="70" cy="61" rx="4" ry="2.2" fill="#FDA4AF" opacity="0.7" />
          <polygon points="52,60 58,60 55,64" fill="#FB7185" />
          <path d="M 50 66 Q 55 70 60 66" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          {/* Leafy Carrot */}
          <g transform="translate(66 76) rotate(22)">
            <path d="M 10 0 Q 6 -10 12 -13 Q 16 -8 14 0" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
            <path d="M 14 0 Q 19 -11 23 -9 Q 21 -2 17 2" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
            <path d="M 5 2 L 22 4 L 12 34 C 11 37 8 37 7 34 Z" fill="url(#carrotOrange)" stroke="#C2410C" strokeWidth="2" />
            <line x1="9" y1="10" x2="15" y2="11" stroke="#FED7AA" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="10" y1="18" x2="15" y2="19" stroke="#FED7AA" strokeWidth="1.8" strokeLinecap="round" />
          </g>
          {/* Paws */}
          <circle cx="34" cy="92" r="6" fill="url(#bunnyFur)" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="72" cy="93" r="6" fill="url(#bunnyFur)" stroke="#CBD5E1" strokeWidth="2" />
        </svg>
      </div>
      )}

      {/* 3. Colorful Wooden Toy Train (near Stage 12, right bend) */}
      {!compact && (
      <div className="animate-decor-sway absolute top-[36.5%] right-2 sm:right-6 w-20 h-16 sm:w-28 sm:h-24 opacity-95">
        <svg viewBox="0 0 140 105" className="w-full h-full drop-shadow-sm">
          {/* Puff of steam clouds */}
          <circle cx="32" cy="24" r="7" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <circle cx="44" cy="17" r="9" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <circle cx="58" cy="13" r="6" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="1.8" />
          {/* Wooden base & coupling */}
          <rect x="72" y="70" width="12" height="6" rx="2" fill="#64748B" />
          <rect x="16" y="72" width="112" height="8" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Engine Chimney & Boiler */}
          <rect x="26" y="32" width="12" height="18" rx="3" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
          <rect x="23" y="29" width="18" height="6" rx="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.8" />
          <rect x="22" y="47" width="38" height="26" rx="6" fill="#00BFFF" stroke="#0284C7" strokeWidth="2.2" />
          {/* Engine Cab */}
          <rect x="46" y="34" width="28" height="39" rx="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.2" />
          <rect x="52" y="40" width="16" height="14" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <rect x="43" y="30" width="34" height="6" rx="3" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
          {/* Trailing Toy Car with Wooden Blocks */}
          <rect x="86" y="42" width="16" height="14" rx="3" fill="#A78BFA" stroke="#7C3AED" strokeWidth="2" />
          <rect x="104" y="46" width="16" height="10" rx="3" fill="#34D399" stroke="#059669" strokeWidth="2" />
          <rect x="82" y="54" width="42" height="19" rx="5" fill="#58CC02" stroke="#3B8700" strokeWidth="2.2" />
          {/* Wheels */}
          {[32, 59, 93, 114].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="83" r="10" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              <circle cx={cx} cy="83" r="4.5" fill="#FACC15" />
            </g>
          ))}
        </svg>
      </div>
      )}

      {/* 4. Ringed Pastel Planet & Twinkling Stars (near Stage 17, left bend) */}
      <div className={`animate-decor-float absolute ${compact ? 'top-[42%]' : 'top-[54%]'} left-2 sm:left-7 w-18 h-16 sm:w-26 sm:h-24 opacity-95`}>
        <svg viewBox="0 0 130 110" className="w-full h-full drop-shadow-sm">
          <defs>
            <radialGradient id="planetOrb" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#DDD6FE" />
              <stop offset="55%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#5B21B6" />
            </radialGradient>
            <linearGradient id="planetRing" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>
          {/* Back half of ring */}
          <path
            d="M 18 65 C 12 46, 112 24, 116 43"
            fill="none"
            stroke="url(#planetRing)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Planet Sphere */}
          <circle cx="65" cy="54" r="28" fill="url(#planetOrb)" stroke="#6D28D9" strokeWidth="2.2" />
          {/* Cute craters/stripes */}
          <ellipse cx="53" cy="45" rx="7" ry="4" fill="#EDE9FE" opacity="0.45" />
          <circle cx="75" cy="64" r="4.5" fill="#4C1D95" opacity="0.28" />
          {/* Front half of ring */}
          <path
            d="M 18 65 C 24 84, 120 62, 116 43"
            fill="none"
            stroke="url(#planetRing)"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          {/* 4-point twinkling stars */}
          <path d="M 24 22 L 26.5 29.5 L 34 32 L 26.5 34.5 L 24 42 L 21.5 34.5 L 14 32 L 21.5 29.5 Z" fill="#FACC15" />
          <path d="M 106 76 L 108 81.5 L 113.5 83.5 L 108 85.5 L 106 91 L 104 85.5 L 98.5 83.5 L 104 81.5 Z" fill="#38BDF8" />
          <circle cx="98" cy="20" r="3" fill="#FDE047" />
        </svg>
      </div>

      {/* 5. Mini Red-and-Blue Rocket (near Stage 22, right bend) */}
      {!compact && (
      <div className="animate-decor-bob absolute top-[71%] right-2 sm:right-8 w-16 h-20 sm:w-22 sm:h-28 opacity-95">
        <svg viewBox="0 0 110 135" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="miniRocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
          <g transform="rotate(14 55 68)">
            {/* Exhaust glow */}
            <path d="M 46 95 Q 55 124 64 95 Z" fill="#FACC15" />
            <path d="M 49 95 Q 55 113 61 95 Z" fill="#EF4444" />
            {/* Side Fins */}
            <path d="M 38 72 L 22 92 L 38 89 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
            <path d="M 72 72 L 88 92 L 72 89 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
            {/* Nozzle */}
            <rect x="44" y="88" width="22" height="8" rx="3" fill="#475569" />
            {/* Main Fuselage */}
            <path
              d="M 55 14 C 72 32 76 58 72 88 L 38 88 C 34 58 38 32 55 14 Z"
              fill="url(#miniRocketBody)"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
            {/* Nose Cone */}
            <path d="M 55 14 C 63 23 68 31 70 39 L 40 39 C 42 31 47 23 55 14 Z" fill="#00BFFF" stroke="#0284C7" strokeWidth="2.2" />
            {/* Porthole */}
            <circle cx="55" cy="58" r="11" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
            <circle cx="55" cy="58" r="7" fill="#38BDF8" />
            <circle cx="52.5" cy="55.5" r="2.2" fill="#FFFFFF" />
            {/* Bottom Accent Stripe */}
            <rect x="39" y="77" width="32" height="5" rx="2" fill="#EF4444" />
          </g>
        </svg>
      </div>
      )}

      {/* 6. Striped Hot-Air Balloon (near Stage 27, left bend) */}
      <div className={`animate-decor-sway absolute ${compact ? 'top-[78%]' : 'top-[86.5%]'} left-2 sm:left-7 w-16 h-20 sm:w-24 sm:h-28 opacity-95`}>
        <svg viewBox="0 0 110 135" className="w-full h-full drop-shadow-sm">
          {/* Ropes */}
          <line x1="43" y1="86" x2="46" y2="103" stroke="#92400E" strokeWidth="2" />
          <line x1="67" y1="86" x2="64" y2="103" stroke="#92400E" strokeWidth="2" />
          {/* Envelope */}
          <path
            d="M 55 10 C 80 10 92 30 88 54 C 84 72 70 84 68 88 L 42 88 C 40 84 26 72 22 54 C 18 30 30 10 55 10 Z"
            fill="#00BFFF"
            stroke="#0284C7"
            strokeWidth="2.5"
          />
          {/* Colorful curved stripes */}
          <path
            d="M 55 10 C 69 14 75 34 72 56 C 70 72 64 82 62 88 L 48 88 C 46 82 40 72 38 56 C 35 34 41 14 55 10 Z"
            fill="#FACC15"
          />
          <path
            d="M 55 10 C 60 15 62 34 61 56 C 60 72 58 82 57 88 L 53 88 C 52 82 50 72 49 56 C 48 34 50 15 55 10 Z"
            fill="#FF6B6B"
          />
          <path
            d="M 55 10 C 80 10 92 30 88 54 C 84 72 70 84 68 88 L 42 88 C 40 84 26 72 22 54 C 18 30 30 10 55 10 Z"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.5"
          />
          {/* Basket */}
          <rect x="42" y="102" width="26" height="19" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="2.2" />
          <line x1="42" y1="109" x2="68" y2="109" stroke="#F59E0B" strokeWidth="2" />
          <line x1="51" y1="102" x2="51" y2="121" stroke="#92400E" strokeWidth="1.5" />
          <line x1="59" y1="102" x2="59" y2="121" stroke="#92400E" strokeWidth="1.5" />
          {/* Little cloud puff */}
          <path
            d="M 74 30 C 74 26 78 23 82 23 C 85 19 91 19 94 23 C 98 23 101 26 101 30 C 101 34 98 36 94 36 L 80 36 C 77 36 74 34 74 30 Z"
            fill="#FFFFFF"
            stroke="#BAE6FD"
            strokeWidth="1.8"
          />
        </svg>
      </div>
    </div>
  );
};

import React from 'react';
import { BreathScenarioKind } from '../../data/gamesPathData';

interface BreathSceneProps {
  kind: BreathScenarioKind;
  power: number; // 0..100
  launched: boolean;
}

/**
 * Dedicated multi-layered custom scenes for Breath & Sound-Power mini-games:
 * ONLY the active character/vehicle/wheel mechanism animates smoothly based on genuine breath/sound power;
 * all background layers (space, moon, farm hills, yellow path, park sky, support stand) stay completely stationary.
 */
export const BreathPowerScene: React.FC<BreathSceneProps> = ({
  kind,
  power,
  launched,
}) => {
  const effectivePower = launched ? 100 : Math.min(100, Math.max(0, power));

  // ==================== 1. ROCKET ("puf-puf") ====================
  if (kind === 'rocket') {
    const rocketLiftPx = Math.min(112, effectivePower * 0.96 + (launched ? 12 : 0));
    const flameScale = effectivePower > 3 ? 0.55 + effectivePower / 95 : 0;

    return (
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Koinot va raketa sahnasi"
      >
        <defs>
          <linearGradient id="spaceSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#090D24" />
            <stop offset="65%" stopColor="#172554" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        {/* Stationary Space Backdrop, Stars, Planet & Crescent Moon */}
        <rect width="640" height="260" fill="url(#spaceSky)" />
        {[
          [56, 36, 2.4], [118, 82, 1.8], [164, 34, 2.8], [238, 64, 2],
          [395, 42, 2.2], [448, 88, 1.8], [584, 114, 2.2], [86, 152, 2],
          [204, 134, 1.6], [490, 158, 2], [596, 184, 1.8],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#FFFFFF" opacity="0.88" />
        ))}

        {/* Stationary Ringed Planet */}
        <g transform="translate(115, 76)">
          <circle cx="0" cy="0" r="22" fill="#38BDF8" />
          <ellipse
            cx="0"
            cy="2"
            rx="38"
            ry="8"
            transform="rotate(-14)"
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="4"
          />
        </g>

        {/* Stationary Crescent Moon */}
        <g transform="translate(535, 58)">
          <circle cx="0" cy="0" r="25" fill="#FDE047" />
          <circle cx="10" cy="-5" r="21" fill="#13224E" />
        </g>

        {/* Stationary Launchpad Platform */}
        <rect x="0" y="226" width="640" height="34" fill="#334155" />
        <rect x="240" y="216" width="160" height="14" rx="4" fill="#64748B" />
        <rect x="268" y="168" width="10" height="48" fill="#475569" />

        {/* INDEPENDENT MOVING LAYER: Rocket + Exhaust Flame */}
        <g
          style={{
            transform: `translate3d(0, ${-rocketLiftPx}px, 0)`,
            transition: 'transform 120ms ease-out',
          }}
        >
          <g transform="translate(320, 175)">
            {/* Dynamic Flame Plume */}
            {effectivePower > 3 && (
              <g
                transform={`translate(0, 34) scale(${0.8 + effectivePower / 180}, ${flameScale})`}
              >
                <g className="animate-flame-flicker">
                  <path
                    d="M-14 0 C-18 22, -6 42, 0 56 C6 42, 18 22, 14 0 Z"
                    fill="#F97316"
                  />
                  <path
                    d="M-8 0 C-10 14, -3 28, 0 38 C3 28, 10 14, 8 0 Z"
                    fill="#FDE047"
                  />
                </g>
              </g>
            )}

            {/* Rocket Fins */}
            <polygon points="-22,12 -36,36 -18,32" fill="#EF4444" stroke="#991B1B" strokeWidth="2.2" />
            <polygon points="22,12 36,36 18,32" fill="#EF4444" stroke="#991B1B" strokeWidth="2.2" />
            {/* Nozzle */}
            <rect x="-12" y="28" width="24" height="8" rx="3" fill="#475569" />
            {/* Rocket Body */}
            <path
              d="M0 -48 C18 -26, 22 4, 20 28 L-20 28 C-22 4, -18 -26, 0 -48 Z"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="3"
            />
            {/* Red Nose Cone */}
            <path
              d="M0 -48 C10 -36, 14 -24, 16 -18 L-16 -18 C-14 -24, -10 -36, 0 -48 Z"
              fill="#00BFFF"
            />
            {/* Porthole Window */}
            <circle cx="0" cy="-2" r="10" fill="#7DD3FC" stroke="#0369A1" strokeWidth="3" />
            <circle cx="-3" cy="-5" r="3" fill="#FFFFFF" opacity="0.8" />
          </g>
        </g>
      </svg>
    );
  }

  // ==================== 2. TRACTOR ("tarr-tarr") ====================
  if (kind === 'tractor') {
    const travelPx = effectivePower * 3.7;
    const spinDurSec =
      effectivePower > 5 ? Math.max(0.45, 2.2 - effectivePower * 0.016) : 0;

    return (
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Ferma va sariq yo‘lakda traktor sahnasi"
      >
        <defs>
          <linearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#E0F7FF" />
            <stop offset="100%" stopColor="#DCFCE7" />
          </linearGradient>
        </defs>

        {/* Stationary Farm Backdrop: Sky, Sun, Barn, Silo, Hills & Trees */}
        <rect width="640" height="260" fill="url(#farmSky)" />
        <circle cx="565" cy="46" r="24" fill="#FDE047" />
        {/* Stationary Clouds */}
        <path
          d="M112 52 C102 52, 100 41, 109 38 C112 29, 126 27, 133 34 C142 28, 155 33, 155 43 C162 45, 161 52, 152 52 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        {/* Rolling Green Farm Hills */}
        <path d="M0 164 Q160 112 340 152 T640 144 L640 260 L0 260 Z" fill="#86EFAC" />
        <path d="M0 176 Q210 148 420 172 T640 165 L640 260 L0 260 Z" fill="#22C55E" />

        {/* Stationary Red Barn & Silo */}
        <g transform="translate(465, 96)">
          <rect x="52" y="10" width="22" height="58" rx="6" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <path d="M52 16 C52 2, 74 2, 74 16 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <polygon points="0,24 28,2 56,24 56,68 0,68" fill="#EF4444" stroke="#991B1B" strokeWidth="2.4" />
          <rect x="18" y="40" width="20" height="28" fill="#FEF3C7" stroke="#92400E" strokeWidth="2" />
          <line x1="18" y1="40" x2="38" y2="68" stroke="#92400E" strokeWidth="1.8" />
          <line x1="38" y1="40" x2="18" y2="68" stroke="#92400E" strokeWidth="1.8" />
        </g>

        {/* Stationary Orchard Trees */}
        {[58, 134, 346].map((tx, idx) => (
          <g key={idx}>
            <rect x={tx - 4} y="142" width="8" height="28" rx="2" fill="#92400E" />
            <circle cx={tx} cy="130" r="20" fill="#16A34A" />
          </g>
        ))}

        {/* Prominent Grounded Yellow Path ("sariq yo‘lak") */}
        <rect x="0" y="186" width="640" height="74" fill="#16A34A" />
        <rect x="0" y="198" width="640" height="44" fill="#FACC15" />
        <line x1="0" y1="198" x2="640" y2="198" stroke="#CA8A04" strokeWidth="3" />
        <line x1="0" y1="242" x2="640" y2="242" stroke="#A16207" strokeWidth="3" />
        <line
          x1="0"
          y1="220"
          x2="640"
          y2="220"
          stroke="#FEF08A"
          strokeWidth="3"
          strokeDasharray="18 16"
        />

        {/* INDEPENDENT MOVING LAYER: Tractor + Rotating Wheels */}
        <g
          style={{
            transform: `translate3d(${travelPx}px, 0, 0)`,
            transition: 'transform 110ms ease-out',
          }}
        >
          <g transform="translate(86, 146)">
            {/* Shadow on yellow path */}
            <ellipse cx="48" cy="74" rx="48" ry="7" fill="#78350F" opacity="0.28" />
            {/* Exhaust chimney & chug puff */}
            <rect x="64" y="10" width="7" height="24" rx="2" fill="#334155" />
            {effectivePower > 8 && (
              <circle
                cx="66"
                cy={-2 - (effectivePower % 14)}
                r={5 + effectivePower / 32}
                fill="#FFFFFF"
                opacity="0.82"
              />
            )}
            {/* Cab */}
            <rect x="14" y="8" width="38" height="32" rx="6" fill="#00BFFF" stroke="#0369A1" strokeWidth="2.6" />
            <rect x="20" y="14" width="26" height="18" rx="3" fill="#E0F2FE" />
            {/* Hood */}
            <rect x="46" y="26" width="42" height="26" rx="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2.6" />
            <rect x="50" y="32" width="20" height="6" rx="2" fill="#FCA5A5" />

            {/* Rear Big Wheel (ONLY Wheel Rotates) */}
            <g transform="translate(28, 55)">
              <g
                className={spinDurSec > 0 ? 'animate-wheel-spin' : ''}
                style={{ '--spin-dur': `${spinDurSec || 4}s` } as React.CSSProperties}
              >
                <circle cx="0" cy="0" r="20" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="10" fill="#FACC15" />
                <line x1="-10" y1="0" x2="10" y2="0" stroke="#92400E" strokeWidth="2.4" />
                <line x1="0" y1="-10" x2="0" y2="10" stroke="#92400E" strokeWidth="2.4" />
              </g>
            </g>

            {/* Front Small Wheel (ONLY Wheel Rotates) */}
            <g transform="translate(78, 61)">
              <g
                className={spinDurSec > 0 ? 'animate-wheel-spin' : ''}
                style={{ '--spin-dur': `${spinDurSec ? spinDurSec * 0.72 : 4}s` } as React.CSSProperties}
              >
                <circle cx="0" cy="0" r="13" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="6" fill="#FACC15" />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#92400E" strokeWidth="2" />
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#92400E" strokeWidth="2" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    );
  }

  // ==================== 3. BUTTERFLY ("prr-prr") ====================
  if (kind === 'butterfly') {
    const flyX = effectivePower * 3.1;
    const flyY = -Math.sin((effectivePower / 100) * Math.PI * 0.78) * 68 - effectivePower * 0.35;
    const wingDur = effectivePower > 5 ? Math.max(0.16, 0.58 - effectivePower * 0.004) : 0.65;

    return (
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Bog‘ va kapalak sahnasi"
      >
        <defs>
          <linearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="72%" stopColor="#ECFEFF" />
            <stop offset="100%" stopColor="#DCFCE7" />
          </linearGradient>
        </defs>

        {/* Stationary Garden Backdrop */}
        <rect width="640" height="260" fill="url(#gardenSky)" />
        <circle cx="88" cy="48" r="24" fill="#FDE047" />
        {/* Stationary Bushes & Meadow */}
        <path d="M0 198 Q180 170 370 192 T640 182 L640 260 L0 260 Z" fill="#4ADE80" />
        <rect x="0" y="210" width="640" height="50" fill="#22C55E" />

        {/* Stationary Blooming Flowers on the Right */}
        {[
          { x: 468, y: 120, petal: '#F43F5E', h: 105 },
          { x: 528, y: 98, petal: '#8B5CF6', h: 125 },
          { x: 576, y: 132, petal: '#FB923C', h: 95 },
        ].map((fl, i) => (
          <g key={i}>
            <path
              d={`M${fl.x} ${fl.y + fl.h} Q${fl.x - 10} ${fl.y + fl.h / 2} ${fl.x} ${fl.y}`}
              stroke="#15803D"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M${fl.x} ${fl.y + 42} Q${fl.x - 22} ${fl.y + 28} ${fl.x - 24} ${fl.y + 40} Q${fl.x - 10} ${fl.y + 50} ${fl.x} ${fl.y + 44}`}
              fill="#16A34A"
            />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <circle
                key={deg}
                cx={fl.x}
                cy={fl.y - 14}
                r="10"
                fill={fl.petal}
                transform={`rotate(${deg} ${fl.x} ${fl.y})`}
              />
            ))}
            <circle cx={fl.x} cy={fl.y} r="9" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          </g>
        ))}

        {/* INDEPENDENT MOVING LAYER: Flapping Butterfly Moving Toward Flowers */}
        <g
          style={{
            transform: `translate3d(${flyX}px, ${flyY}px, 0)`,
            transition: 'transform 120ms ease-out',
          }}
        >
          <g transform="translate(135, 178)">
            {/* Left Wings (flapping independently) */}
            <g
              className="animate-wing-left"
              style={{ '--wing-dur': `${wingDur}s` } as React.CSSProperties}
            >
              <path
                d="M-3 -4 C-38 -36, -54 -6, -34 10 C-18 22, -4 10, -3 2 Z"
                fill="#00BFFF"
                stroke="#0369A1"
                strokeWidth="2.4"
              />
              <path
                d="M-3 4 C-28 8, -32 34, -14 34 C-4 34, -2 18, -3 8 Z"
                fill="#38BDF8"
                stroke="#0369A1"
                strokeWidth="2.2"
              />
              <circle cx="-27" cy="-9" r="5" fill="#FDE047" />
            </g>

            {/* Right Wings (flapping independently) */}
            <g
              className="animate-wing-right"
              style={{ '--wing-dur': `${wingDur}s` } as React.CSSProperties}
            >
              <path
                d="M3 -4 C38 -36, 54 -6, 34 10 C18 22, 4 10, 3 2 Z"
                fill="#00BFFF"
                stroke="#0369A1"
                strokeWidth="2.4"
              />
              <path
                d="M3 4 C28 8, 32 34, 14 34 C4 34, 2 18, 3 8 Z"
                fill="#38BDF8"
                stroke="#0369A1"
                strokeWidth="2.2"
              />
              <circle cx="27" cy="-9" r="5" fill="#FDE047" />
            </g>

            {/* Thorax & Antennae */}
            <ellipse cx="0" cy="6" rx="4.5" ry="18" fill="#1E293B" />
            <circle cx="0" cy="-14" r="5" fill="#1E293B" />
            <path d="M-2 -18 Q-10 -28 -14 -26" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M2 -18 Q10 -28 14 -26" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    );
  }

  // ==================== 4. FERRIS WHEEL ("Charhfalak") ====================
  if (kind === 'ferris_wheel') {
    const isTurning = effectivePower > 6 || launched;
    const spinDuration = isTurning
      ? Math.max(1.8, 8.5 - effectivePower * 0.065)
      : 0;
    const cabinAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    const cabinColors = [
      '#EF4444',
      '#00BFFF',
      '#FACC15',
      '#58CC02',
      '#8B5CF6',
      '#F97316',
      '#EC4899',
      '#14B8A6',
    ];

    return (
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Bog‘ va charhfalak sahnasi"
      >
        <defs>
          <linearGradient id="parkSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="70%" stopColor="#E0F7FF" />
            <stop offset="100%" stopColor="#DCFCE7" />
          </linearGradient>
        </defs>

        {/* Stationary Park Sky, Clouds, Trees & Lawn */}
        <rect width="640" height="260" fill="url(#parkSky)" />
        <circle cx="96" cy="48" r="22" fill="#FDE047" />
        <g fill="#FFFFFF" opacity="0.9">
          <path d="M475 56 C465 56, 463 45, 472 42 C475 33, 489 31, 496 38 C505 32, 518 37, 518 47 C525 49, 524 56, 515 56 Z" />
        </g>

        {/* Stationary Park Trees */}
        {[82, 148, 495, 562].map((tx, idx) => (
          <g key={idx}>
            <rect x={tx - 4} y="168" width="8" height="36" rx="2" fill="#92400E" />
            <circle cx={tx} cy="154" r="24" fill={idx % 2 === 0 ? '#22C55E' : '#16A34A'} />
          </g>
        ))}

        {/* Stationary Park Grass & Base Platform */}
        <rect x="0" y="200" width="640" height="60" fill="#22C55E" />
        <rect x="225" y="220" width="190" height="14" rx="5" fill="#94A3B8" stroke="#475569" strokeWidth="2.4" />

        {/* STATIONARY Support A-Frame Stand */}
        <line x1="320" y1="116" x2="255" y2="222" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
        <line x1="320" y1="116" x2="385" y2="222" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
        <line x1="274" y1="190" x2="366" y2="190" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />

        {/* ONLY THE FERRIS WHEEL RIM, SPOKES & CABINS ROTATE AROUND HUB (320, 116) */}
        <g transform="translate(320, 116)">
          <g
            className={isTurning ? 'animate-wheel-spin' : ''}
            style={
              isTurning
                ? ({ '--spin-dur': `${spinDuration}s` } as React.CSSProperties)
                : undefined
            }
          >
            {/* Spokes */}
            {cabinAngles.map((deg) => (
              <line
                key={`sp-${deg}`}
                x1="0"
                y1="0"
                x2={Math.cos((deg * Math.PI) / 180) * 82}
                y2={Math.sin((deg * Math.PI) / 180) * 82}
                stroke="#0284C7"
                strokeWidth="3"
              />
            ))}

            {/* Outer & Inner Rims */}
            <circle cx="0" cy="0" r="82" fill="none" stroke="#00BFFF" strokeWidth="6" />
            <circle cx="0" cy="0" r="66" fill="none" stroke="#38BDF8" strokeWidth="2.5" />

            {/* 8 Cabins counter-rotating to stay upright */}
            {cabinAngles.map((deg, idx) => {
              const cx = Math.cos((deg * Math.PI) / 180) * 82;
              const cy = Math.sin((deg * Math.PI) / 180) * 82;
              return (
                <g key={`cab-${deg}`} transform={`translate(${cx}, ${cy})`}>
                  <g
                    className={isTurning ? 'animate-cabin-upright' : ''}
                    style={
                      isTurning
                        ? ({ '--spin-dur': `${spinDuration}s` } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#334155" strokeWidth="2.4" />
                    <rect
                      x="-12"
                      y="10"
                      width="24"
                      height="18"
                      rx="6"
                      fill={cabinColors[idx % cabinColors.length]}
                      stroke="#1E293B"
                      strokeWidth="2"
                    />
                    <rect x="-8" y="13" width="16" height="6" rx="2" fill="#FFFFFF" opacity="0.75" />
                  </g>
                </g>
              );
            })}
          </g>

          {/* Stationary Central Hub Cap */}
          <circle cx="0" cy="0" r="11" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
        </g>
      </svg>
    );
  }

  // ==================== 5. HOT AIR BALLOON ("puf-puf-shsh") ====================
  const balloonLiftPx = effectivePower * 0.56;
  const balloonScale = 0.78 + (effectivePower / 100) * 0.22;

  return (
    <svg
      viewBox="0 0 640 260"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block"
      role="img"
      aria-label="Havo shari sahnasi"
    >
      <defs>
        <linearGradient id="balloonSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="72%" stopColor="#E0F7FF" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
      </defs>
      <rect width="640" height="260" fill="url(#balloonSky)" />
      <circle cx="556" cy="50" r="24" fill="#FDE047" />
      <g fill="#FFFFFF" opacity="0.9">
        <path d="M90 66 C78 66, 76 53, 86 50 C89 40, 104 37, 112 44 C121 38, 136 43, 136 54 C144 56, 143 66, 133 66 Z" />
        <path d="M440 84 C430 84, 428 73, 437 70 C440 61, 454 59, 461 65 C469 60, 482 65, 482 74 C489 76, 488 84, 479 84 Z" />
      </g>
      <path d="M0 198 Q180 165 360 192 T640 182 L640 260 L0 260 Z" fill="#4ADE80" />
      <rect x="0" y="214" width="640" height="46" fill="#22C55E" />

      {/* INDEPENDENT MOVING LAYER: Inflating & Rising Hot Air Balloon */}
      <g
        style={{
          transform: `translate3d(0, ${-balloonLiftPx}px, 0)`,
          transition: 'transform 120ms ease-out',
        }}
      >
        <g
          transform={`translate(320, 178) scale(${balloonScale})`}
          style={{ transition: 'transform 120ms ease-out' }}
        >
          {/* Ropes */}
          <line x1="-14" y1="-22" x2="-9" y2="6" stroke="#78350F" strokeWidth="2" />
          <line x1="14" y1="-22" x2="9" y2="6" stroke="#78350F" strokeWidth="2" />
          {/* Basket */}
          <rect x="-13" y="6" width="26" height="18" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="2.4" />
          {/* Envelope */}
          <path
            d="M0 -106 C36 -106, 48 -72, 24 -26 L-24 -26 C-48 -72, -36 -106, 0 -106 Z"
            fill="#00BFFF"
            stroke="#0369A1"
            strokeWidth="3"
          />
          <path
            d="M0 -106 C16 -106, 20 -72, 10 -26 L-10 -26 C-20 -72, -16 -106, 0 -106 Z"
            fill="#FACC15"
          />
          <path
            d="M0 -106 C6 -106, 7 -72, 4 -26 L-4 -26 C-7 -72, -6 -106, 0 -106 Z"
            fill="#EF4444"
          />
        </g>
      </g>
    </svg>
  );
};

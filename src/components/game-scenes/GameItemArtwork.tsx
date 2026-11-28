import React from 'react';
import { ObstacleKind } from '../../data/gamesPathData';

interface ItemIllustrationProps {
  artKey: string;
  className?: string;
}

/**
 * Custom multi-layered SVG artwork for every target word, basket item,
 * key medallion, and syllable puzzle card — zero plain emoji stickers.
 */
export const ItemIllustration: React.FC<ItemIllustrationProps> = ({
  artKey,
  className = 'w-14 h-14',
}) => {
  const renderArt = () => {
    switch (artKey) {
      case 'lola':
        return (
          <g>
            <path d="M32 54 L32 32" stroke="#22A046" strokeWidth="4" strokeLinecap="round" />
            <path d="M32 46 Q21 40 20 33 Q28 34 32 42" fill="#4ADE80" stroke="#15803D" strokeWidth="1.8" />
            <path d="M32 43 Q43 37 44 30 Q36 31 32 39" fill="#4ADE80" stroke="#15803D" strokeWidth="1.8" />
            <path d="M21 23 C20 14, 27 11, 32 16 C37 11, 44 14, 43 23 C43 31, 37 35, 32 35 C27 35, 21 31, 21 23 Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="2.2" />
            <path d="M27 15 L32 24 L37 15" fill="#FB7185" opacity="0.7" />
          </g>
        );
      case 'savat':
        return (
          <g>
            <path d="M18 28 C18 14, 46 14, 46 28" fill="none" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 28 L52 28 L46 50 C45 53, 19 53, 18 50 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="10" y="25" width="44" height="6" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
            <path d="M16 36 L48 36 M18 43 L46 43 M25 29 L25 50 M32 29 L32 51 M39 29 L39 50" stroke="#B45309" strokeWidth="1.8" opacity="0.75" />
          </g>
        );
      case 'choy':
      case 'choynak':
        return (
          <g>
            <path d="M44 31 C52 31, 52 43, 44 43" fill="none" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M16 33 L10 28 L13 25 L19 29" fill="#38BDF8" stroke="#0369A1" strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx="31" cy="39" rx="14" ry="13" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.4" />
            <ellipse cx="31" cy="27" rx="8.5" ry="3.5" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
            <circle cx="31" cy="22" r="3" fill="#FFC800" stroke="#B45309" strokeWidth="1.6" />
            <path d="M24 38 Q31 44 38 38" stroke="#E0F2FE" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'daraxt':
        return (
          <g>
            <rect x="28" y="37" width="8" height="17" rx="2" fill="#92400E" stroke="#78350F" strokeWidth="2" />
            <circle cx="32" cy="23" r="13" fill="#22C55E" stroke="#15803D" strokeWidth="2.2" />
            <circle cx="22" cy="29" r="9.5" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
            <circle cx="42" cy="29" r="9.5" fill="#16A34A" stroke="#15803D" strokeWidth="2" />
            <circle cx="29" cy="18" r="4" fill="#86EFAC" opacity="0.55" />
          </g>
        );
      case 'shamol':
        return (
          <g>
            <path d="M12 24 H38 C43 24, 43 16, 37 16 C33 16, 32 19, 34 21" fill="none" stroke="#00BFFF" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M10 33 H47 C52 33, 52 25, 46 25 C42 25, 41 28, 43 30" fill="none" stroke="#0284C7" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M15 42 H36 C41 42, 41 50, 35 50 C31 50, 30 47, 32 45" fill="none" stroke="#38BDF8" strokeWidth="3.6" strokeLinecap="round" />
            <circle cx="51" cy="19" r="2.2" fill="#7DD3FC" />
            <circle cx="47" cy="44" r="2" fill="#7DD3FC" />
          </g>
        );
      case 'soat':
        return (
          <g>
            <circle cx="20" cy="17" r="6" fill="#00BFFF" stroke="#0369A1" strokeWidth="2" />
            <circle cx="44" cy="17" r="6" fill="#00BFFF" stroke="#0369A1" strokeWidth="2" />
            <circle cx="32" cy="34" r="17" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.5" />
            <circle cx="32" cy="34" r="13" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1.5" />
            <path d="M32 34 L32 24 M32 34 L40 37" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="34" r="2.5" fill="#EF4444" />
          </g>
        );
      case 'qalam':
        return (
          <g transform="rotate(-35 32 32)">
            <rect x="26" y="13" width="12" height="33" rx="2" fill="#FACC15" stroke="#B45309" strokeWidth="2.2" />
            <rect x="26" y="11" width="12" height="7" rx="2" fill="#FB7185" stroke="#BE123C" strokeWidth="2" />
            <polygon points="26,46 38,46 32,56" fill="#FDE68A" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="30,52 34,52 32,56" fill="#1E293B" />
          </g>
        );
      case 'uzum':
        return (
          <g>
            <path d="M32 10 Q37 13 34 19" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M34 15 Q43 11 45 17 Q39 21 34 17" fill="#4ADE80" stroke="#15803D" strokeWidth="1.6" />
            {[
              [24, 24], [32, 24], [40, 24],
              [22, 32], [30, 32], [38, 32],
              [26, 40], [34, 40],
              [30, 48],
            ].map(([cx, cy], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="5.5"
                fill="#8B5CF6"
                stroke="#5B21B6"
                strokeWidth="1.8"
              />
            ))}
          </g>
        );
      case 'olma':
      case 'anor':
        return (
          <g>
            <path d="M32 18 Q34 11 38 11" stroke="#78350F" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M33 16 Q42 12 44 17 Q38 22 33 17" fill="#4ADE80" stroke="#15803D" strokeWidth="1.6" />
            <path
              d="M32 22 C24 18, 14 24, 15 36 C16 47, 25 53, 32 50 C39 53, 48 47, 49 36 C50 24, 40 18, 32 22 Z"
              fill={artKey === 'anor' ? '#DC2626' : '#EF4444'}
              stroke="#991B1B"
              strokeWidth="2.2"
            />
            {artKey === 'anor' && (
              <path d="M27 17 L29 22 L35 22 L37 17 L34 19 L32 16 L30 19 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.2" />
            )}
            <ellipse cx="23" cy="30" rx="3" ry="5.5" transform="rotate(-18 23 30)" fill="#FCA5A5" opacity="0.65" />
          </g>
        );
      case 'pishloq':
        return (
          <g>
            <polygon points="12,46 52,46 48,22 14,32" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.4" strokeLinejoin="round" />
            <polygon points="14,32 48,22 34,15" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="24" cy="39" r="3.2" fill="#CA8A04" opacity="0.6" />
            <circle cx="37" cy="34" r="4" fill="#CA8A04" opacity="0.6" />
            <circle cx="43" cy="41" r="2.5" fill="#CA8A04" opacity="0.6" />
          </g>
        );
      case 'rasm':
        return (
          <g>
            <rect x="12" y="14" width="40" height="36" rx="5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
            <rect x="16" y="18" width="32" height="28" rx="2" fill="#E0F2FE" />
            <circle cx="40" cy="25" r="4" fill="#FACC15" />
            <polygon points="16,46 28,29 38,46" fill="#22C55E" />
            <polygon points="28,46 37,33 48,46" fill="#16A34A" />
          </g>
        );
      case 'sabzi':
        return (
          <g>
            <path d="M36 17 Q39 9 44 12 M36 17 Q44 12 47 17 M36 17 Q32 10 37 8" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M30 19 L43 32 L17 50 C14 52, 12 49, 14 46 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M27 26 L32 31 M22 33 L26 37" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'balon':
        return (
          <g>
            <path d="M32 45 Q30 52 34 57" stroke="#64748B" strokeWidth="2" fill="none" />
            <ellipse cx="32" cy="27" rx="15" ry="18" fill="#00BFFF" stroke="#0369A1" strokeWidth="2.4" />
            <polygon points="29,45 35,45 32,48" fill="#0284C7" />
            <ellipse cx="26" cy="21" rx="3.5" ry="6" transform="rotate(-15 26 21)" fill="#BAE6FD" opacity="0.7" />
          </g>
        );
      case 'chiroq':
        return (
          <g>
            <path d="M32 9 L32 15" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
            <rect x="24" y="15" width="16" height="5" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1.8" />
            <ellipse cx="32" cy="32" rx="14" ry="13" fill="#EF4444" stroke="#991B1B" strokeWidth="2.2" />
            <ellipse cx="32" cy="32" rx="6" ry="12" fill="#FBBF24" opacity="0.7" />
            <rect x="25" y="44" width="14" height="5" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1.8" />
            <path d="M32 49 L32 56" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'zebra':
        return (
          <g>
            <ellipse cx="33" cy="34" rx="16" ry="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.4" />
            <path d="M23 23 L29 31 M33 20 L33 30 M43 23 L38 31 M21 38 L29 36 M45 38 L37 36" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="27" cy="31" r="2.2" fill="#0F172A" />
            <circle cx="39" cy="31" r="2.2" fill="#0F172A" />
            <ellipse cx="33" cy="40" rx="7" ry="4.5" fill="#CBD5E1" stroke="#334155" strokeWidth="1.5" />
            <polygon points="21,22 18,13 26,18" fill="#1E293B" />
            <polygon points="45,22 48,13 40,18" fill="#1E293B" />
          </g>
        );
      case 'mashina':
        return (
          <g>
            <path d="M18 32 L24 21 L41 21 L47 32 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.2" strokeLinejoin="round" />
            <rect x="11" y="31" width="42" height="14" rx="5" fill="#00BFFF" stroke="#0369A1" strokeWidth="2.4" />
            <rect x="23" y="24" width="18" height="7" rx="2" fill="#E0F2FE" />
            <circle cx="21" cy="46" r="5.5" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            <circle cx="43" cy="46" r="5.5" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            <circle cx="21" cy="46" r="2" fill="#E2E8F0" />
            <circle cx="43" cy="46" r="2" fill="#E2E8F0" />
          </g>
        );
      case 'tarvuz':
        return (
          <g>
            <path d="M12 27 C12 46, 52 46, 52 27 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.4" />
            <path d="M16 27 C16 42, 48 42, 48 27 Z" fill="#EF4444" />
            <circle cx="25" cy="33" r="1.6" fill="#1E293B" />
            <circle cx="32" cy="35" r="1.6" fill="#1E293B" />
            <circle cx="39" cy="33" r="1.6" fill="#1E293B" />
          </g>
        );
      case 'jirafa':
        return (
          <g>
            <rect x="27" y="29" width="10" height="24" rx="4" fill="#FBBF24" stroke="#B45309" strokeWidth="2.2" />
            <circle cx="32" cy="23" r="11" fill="#FCD34D" stroke="#B45309" strokeWidth="2.2" />
            <line x1="27" y1="13" x2="25" y2="8" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="37" y1="13" x2="39" y2="8" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="25" cy="8" r="2.2" fill="#92400E" />
            <circle cx="39" cy="8" r="2.2" fill="#92400E" />
            <circle cx="28" cy="21" r="2" fill="#1E293B" />
            <circle cx="36" cy="21" r="2" fill="#1E293B" />
            <circle cx="31" cy="39" r="3" fill="#B45309" opacity="0.55" />
            <circle cx="33" cy="48" r="2.5" fill="#B45309" opacity="0.55" />
          </g>
        );
      case 'limon':
        return (
          <g>
            <ellipse cx="32" cy="34" rx="18" ry="13" transform="rotate(-18 32 34)" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.4" />
            <path d="M41 21 Q48 15 51 20 Q45 25 41 21" fill="#4ADE80" stroke="#15803D" strokeWidth="1.6" />
            <ellipse cx="26" cy="30" rx="5" ry="2.2" transform="rotate(-18 26 30)" fill="#FEF08A" />
          </g>
        );
      case 'qor':
        return (
          <g stroke="#00BFFF" strokeWidth="3" strokeLinecap="round">
            <line x1="32" y1="12" x2="32" y2="52" />
            <line x1="14" y1="22" x2="50" y2="42" />
            <line x1="50" y1="22" x2="14" y2="42" />
            <circle cx="32" cy="32" r="4" fill="#E0F2FE" />
          </g>
        );
      case 'chumoli':
        return (
          <g>
            <circle cx="20" cy="36" r="6" fill="#7C2D12" stroke="#431407" strokeWidth="2" />
            <circle cx="32" cy="34" r="5" fill="#9A3412" stroke="#431407" strokeWidth="2" />
            <circle cx="43" cy="29" r="6.5" fill="#9A3412" stroke="#431407" strokeWidth="2" />
            <path d="M44 23 L48 16 M41 22 L42 15" stroke="#431407" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="28" r="1.5" fill="#FFFFFF" />
            <path d="M28 38 L24 47 M33 38 L34 47 M37 37 L41 46" stroke="#431407" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'quyosh':
        return (
          <g>
            <circle cx="32" cy="32" r="13" fill="#FACC15" stroke="#D97706" strokeWidth="2.4" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="32"
                y1="10"
                x2="32"
                y2="15"
                stroke="#F59E0B"
                strokeWidth="3.2"
                strokeLinecap="round"
                transform={`rotate(${deg} 32 32)`}
              />
            ))}
          </g>
        );
      case 'bulut':
        return (
          <g>
            <path
              d="M17 43 C11 43, 9 35, 14 31 C14 23, 23 19, 30 23 C34 17, 45 19, 46 28 C53 29, 54 43, 46 43 Z"
              fill="#FFFFFF"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        );
      case 'shapka':
        return (
          <g>
            <path d="M16 37 C16 20, 44 20, 44 37 Z" fill="#00BFFF" stroke="#0369A1" strokeWidth="2.4" />
            <path d="M16 37 L54 37 C54 42, 46 44, 38 42 L16 42 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <circle cx="30" cy="18" r="3" fill="#FFC800" stroke="#B45309" strokeWidth="1.5" />
          </g>
        );
      case 'olcha':
        return (
          <g>
            <path d="M33 13 L23 36 M33 13 L42 38" stroke="#15803D" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M33 13 Q41 9 43 14 Q37 18 33 13" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
            <circle cx="22" cy="40" r="8.5" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
            <circle cx="42" cy="42" r="8.5" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
            <circle cx="19" cy="37" r="2.2" fill="#FDA4AF" />
            <circle cx="39" cy="39" r="2.2" fill="#FDA4AF" />
          </g>
        );
      case 'gul':
        return (
          <g>
            <line x1="32" y1="32" x2="32" y2="54" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <circle
                key={deg}
                cx="32"
                cy="18"
                r="6.5"
                fill="#F472B6"
                stroke="#BE185D"
                strokeWidth="1.8"
                transform={`rotate(${deg} 32 28)`}
              />
            ))}
            <circle cx="32" cy="28" r="6" fill="#FACC15" stroke="#B45309" strokeWidth="1.8" />
          </g>
        );
      case 'baraban':
        return (
          <g>
            <rect x="14" y="24" width="36" height="24" rx="5" fill="#EF4444" stroke="#991B1B" strokeWidth="2.4" />
            <ellipse cx="32" cy="24" rx="18" ry="6" fill="#FEF3C7" stroke="#92400E" strokeWidth="2.2" />
            <path d="M16 28 L25 46 L32 29 L39 46 L48 28" fill="none" stroke="#FACC15" strokeWidth="2.4" strokeLinejoin="round" />
            <line x1="16" y1="14" x2="28" y2="23" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <line x1="48" y1="14" x2="36" y2="23" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'asal':
        return (
          <g>
            <ellipse cx="32" cy="37" rx="15" ry="15" fill="#F59E0B" stroke="#92400E" strokeWidth="2.4" />
            <rect x="21" y="18" width="22" height="6" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <path d="M22 25 Q26 32 30 26 Q35 34 39 25" fill="#FDE047" />
            <rect x="24" y="34" width="16" height="10" rx="2" fill="#FEF3C7" />
          </g>
        );
      case 'tosh':
        return (
          <g>
            <path d="M13 46 C11 33, 21 20, 34 21 C47 22, 53 33, 50 46 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M20 34 Q27 26 35 28" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'arra':
        return (
          <g>
            <path d="M12 36 L47 22 L51 31 L16 45 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
            <path d="M12 36 L14 40 L18 37 L20 42 L24 38 L27 43 L31 39 L34 44 L38 40" stroke="#334155" strokeWidth="1.8" fill="none" />
            <rect x="44" y="19" width="11" height="15" rx="3" transform="rotate(-22 44 19)" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
          </g>
        );
      case 'joja':
        return (
          <g>
            <circle cx="32" cy="37" r="14" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.2" />
            <circle cx="32" cy="23" r="10" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.2" />
            <circle cx="28" cy="21" r="1.8" fill="#1E293B" />
            <circle cx="36" cy="21" r="1.8" fill="#1E293B" />
            <polygon points="30,25 34,25 32,29" fill="#F97316" />
            <path d="M27 51 L27 55 M37 51 L37 55" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'kamalak':
        return (
          <g fill="none" strokeLinecap="round">
            <path d="M11 45 A21 21 0 0 1 53 45" stroke="#EF4444" strokeWidth="4" />
            <path d="M15 45 A17 17 0 0 1 49 45" stroke="#FACC15" strokeWidth="4" />
            <path d="M19 45 A13 13 0 0 1 45 45" stroke="#22C55E" strokeWidth="4" />
            <path d="M23 45 A9 9 0 0 1 41 45" stroke="#00BFFF" strokeWidth="4" />
          </g>
        );
      case 'shokolad':
        return (
          <g>
            <rect x="18" y="12" width="28" height="40" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="2.4" />
            <line x1="32" y1="12" x2="32" y2="42" stroke="#451A03" strokeWidth="2" />
            <line x1="18" y1="22" x2="46" y2="22" stroke="#451A03" strokeWidth="2" />
            <line x1="18" y1="32" x2="46" y2="32" stroke="#451A03" strokeWidth="2" />
            <rect x="16" y="34" width="32" height="19" rx="3" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
          </g>
        );
      case 'samolyot':
        return (
          <g>
            <path d="M12 34 L52 24 L46 34 L52 40 L12 34 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.4" strokeLinejoin="round" />
            <polygon points="24,31 35,14 40,28" fill="#00BFFF" stroke="#0284C7" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="26,37 35,50 40,36" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" strokeLinejoin="round" />
          </g>
        );
      case 'soyabon':
        return (
          <g>
            <path d="M11 33 C11 16, 53 16, 53 33 Z" fill="#00BFFF" stroke="#0369A1" strokeWidth="2.4" />
            <path d="M22 33 C22 18, 42 18, 42 33" fill="#38BDF8" opacity="0.65" />
            <path d="M32 33 L32 49 C32 54, 24 54, 24 49" fill="none" stroke="#92400E" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        );
      case 'shalola':
        return (
          <g>
            <rect x="11" y="20" width="16" height="32" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />
            <path d="M23 18 C34 18, 39 24, 39 46 L23 46 Z" fill="#00BFFF" stroke="#0284C7" strokeWidth="2" />
            <path d="M29 22 V43 M34 25 V43" stroke="#E0F2FE" strokeWidth="2.4" strokeLinecap="round" />
            <ellipse cx="34" cy="49" rx="18" ry="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          </g>
        );
      case 'karvon':
        return (
          <g>
            <path d="M16 40 C16 28, 26 24, 30 32 C34 22, 42 26, 44 35 L49 27 L52 31 L46 41 L46 51 L41 51 L41 43 L24 43 L24 51 L19 51 L19 42 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="49" cy="29" r="1.4" fill="#1E293B" />
          </g>
        );
      case 'musiqa':
        return (
          <g>
            <path d="M24 43 L24 18 L46 14 L46 39" fill="none" stroke="#8B5CF6" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="20" cy="44" rx="6" ry="4.5" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1.8" />
            <ellipse cx="42" cy="40" rx="6" ry="4.5" fill="#00BFFF" stroke="#0284C7" strokeWidth="1.8" />
          </g>
        );
      case 'qoshiq':
        return (
          <g transform="rotate(35 32 32)">
            <ellipse cx="32" cy="20" rx="9" ry="12" fill="#E2E8F0" stroke="#475569" strokeWidth="2.2" />
            <ellipse cx="30" cy="18" rx="3" ry="5" fill="#FFFFFF" opacity="0.7" />
            <rect x="29" y="31" width="6" height="23" rx="3" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          </g>
        );
      default:
        return (
          <circle cx="32" cy="32" r="18" fill="#00BFFF" stroke="#0284C7" strokeWidth="2.5" />
        );
    }
  };

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {renderArt()}
    </svg>
  );
};

/**
 * Custom woven wicker basket card artwork with the item nestled cleanly inside.
 */
export const BasketIllustration: React.FC<{
  artKey: string;
  isSolved?: boolean;
  isWrong?: boolean;
}> = ({ artKey, isSolved = false, isWrong = false }) => (
  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 96 96" className="w-full h-full" aria-hidden="true">
      {/* Ground shadow */}
      <ellipse cx="48" cy="87" rx="30" ry="5" fill="#0F172A" opacity="0.12" />
      {/* Handle */}
      <path
        d="M22 47 C22 18, 74 18, 74 47"
        fill="none"
        stroke={isWrong ? '#94A3B8' : '#92400E'}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M22 47 C22 18, 74 18, 74 47"
        fill="none"
        stroke={isWrong ? '#CBD5E1' : '#D97706'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Item nestled inside basket */}
      <g transform="translate(24, 17) scale(0.75)">
        <ItemIllustration artKey={artKey} />
      </g>
      {/* Basket body */}
      <path
        d="M15 48 L81 48 L72 82 C71 85, 25 85, 24 82 Z"
        fill={isWrong ? '#CBD5E1' : '#F59E0B'}
        stroke={isSolved ? '#15803D' : isWrong ? '#64748B' : '#92400E'}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Woven basket ribs */}
      <path
        d="M20 58 H76 M22 68 H74 M34 50 V82 M48 50 V82 M62 50 V82"
        stroke={isWrong ? '#94A3B8' : '#B45309'}
        strokeWidth="2"
        opacity="0.7"
      />
      {/* Braided rim */}
      <rect
        x="12"
        y="43"
        width="72"
        height="9"
        rx="4.5"
        fill={isWrong ? '#94A3B8' : '#D97706'}
        stroke={isSolved ? '#15803D' : isWrong ? '#64748B' : '#92400E'}
        strokeWidth="2.4"
      />
      {/* Sky-blue bow accent */}
      <circle
        cx="48"
        cy="47.5"
        r="5"
        fill={isSolved ? '#58CC02' : '#00BFFF'}
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

const KEY_PALETTES = [
  { main: '#FACC15', dark: '#B45309', highlight: '#FEF08A' },
  { main: '#38BDF8', dark: '#0369A1', highlight: '#BAE6FD' },
  { main: '#34D399', dark: '#047857', highlight: '#A7F3D0' },
  { main: '#F472B6', dark: '#BE185D', highlight: '#FBCFE8' },
];

/**
 * Custom ornate key illustration with attached miniature item medallion.
 */
export const KeyIllustration: React.FC<{
  artKey: string;
  toneIndex?: number;
  isSolved?: boolean;
  isWrong?: boolean;
}> = ({ artKey, toneIndex = 0, isSolved = false, isWrong = false }) => {
  const palette = isWrong
    ? { main: '#CBD5E1', dark: '#64748B', highlight: '#F1F5F9' }
    : KEY_PALETTES[toneIndex % KEY_PALETTES.length];

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 96 96" className="w-full h-full" aria-hidden="true">
        {/* Ornate Key Ring / Bow */}
        <circle
          cx="30"
          cy="52"
          r="19"
          fill={palette.main}
          stroke={isSolved ? '#15803D' : palette.dark}
          strokeWidth="3.2"
        />
        <circle
          cx="30"
          cy="52"
          r="13"
          fill="#FFFFFF"
          stroke={palette.dark}
          strokeWidth="2"
        />
        {/* Item emblem inside the key bow */}
        <g transform="translate(17, 39) scale(0.41)">
          <ItemIllustration artKey={artKey} />
        </g>
        {/* Key shaft & teeth */}
        <rect
          x="47"
          y="47"
          width="39"
          height="10"
          rx="4"
          fill={palette.main}
          stroke={isSolved ? '#15803D' : palette.dark}
          strokeWidth="2.8"
        />
        <rect x="52" y="49.5" width="30" height="3" rx="1.5" fill={palette.highlight} />
        <rect
          x="65"
          y="57"
          width="6"
          height="11"
          rx="2"
          fill={palette.main}
          stroke={palette.dark}
          strokeWidth="2.2"
        />
        <rect
          x="76"
          y="57"
          width="7"
          height="14"
          rx="2"
          fill={palette.main}
          stroke={palette.dark}
          strokeWidth="2.2"
        />
      </svg>
    </div>
  );
};

/**
 * Custom grounded obstacle artwork placed along the 5-obstacle runner track.
 */
export const ObstacleIllustration: React.FC<{
  kind: ObstacleKind;
  className?: string;
}> = ({ kind, className = 'w-14 h-12' }) => {
  const renderObstacle = () => {
    switch (kind) {
      case 'log':
        return (
          <g>
            <ellipse cx="36" cy="52" rx="28" ry="5" fill="#0F172A" opacity="0.2" />
            <rect x="10" y="28" width="48" height="22" rx="8" fill="#92400E" stroke="#451A03" strokeWidth="2.6" />
            <ellipse cx="56" cy="39" rx="7" ry="11" fill="#FDE68A" stroke="#78350F" strokeWidth="2.4" />
            <circle cx="56" cy="39" r="3" fill="#B45309" />
            <path d="M16 34 H44 M18 42 H42" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'boulder':
        return (
          <g>
            <ellipse cx="36" cy="52" rx="27" ry="5" fill="#0F172A" opacity="0.2" />
            <path d="M11 49 C9 33, 21 18, 37 19 C53 20, 61 33, 59 49 Z" fill="#94A3B8" stroke="#334155" strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M21 31 Q29 24 38 26" stroke="#E2E8F0" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M14 48 Q22 41 30 48" fill="#4ADE80" opacity="0.8" />
          </g>
        );
      case 'bush':
        return (
          <g>
            <ellipse cx="36" cy="52" rx="28" ry="5" fill="#0F172A" opacity="0.18" />
            <circle cx="23" cy="40" r="12" fill="#22C55E" stroke="#15803D" strokeWidth="2.4" />
            <circle cx="48" cy="40" r="12" fill="#16A34A" stroke="#15803D" strokeWidth="2.4" />
            <circle cx="36" cy="30" r="14" fill="#4ADE80" stroke="#15803D" strokeWidth="2.4" />
            <circle cx="28" cy="29" r="3" fill="#F43F5E" />
            <circle cx="43" cy="33" r="3" fill="#FACC15" />
            <circle cx="23" cy="42" r="2.5" fill="#FFFFFF" />
          </g>
        );
      case 'stream':
      case 'puddle':
        return (
          <g>
            <ellipse cx="36" cy="46" rx="28" ry="10" fill="#00BFFF" stroke="#0284C7" strokeWidth="2.6" />
            <ellipse cx="34" cy="44" rx="18" ry="5" fill="#7DD3FC" opacity="0.7" />
            <path d="M22 45 Q28 41 34 45 M38 47 Q44 43 50 47" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'wall':
        return (
          <g>
            <ellipse cx="36" cy="53" rx="28" ry="4.5" fill="#0F172A" opacity="0.2" />
            <rect x="11" y="23" width="50" height="27" rx="3" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2.4" />
            <line x1="11" y1="32" x2="61" y2="32" stroke="#FECACA" strokeWidth="2" />
            <line x1="11" y1="41" x2="61" y2="41" stroke="#FECACA" strokeWidth="2" />
            <line x1="27" y1="23" x2="27" y2="32" stroke="#FECACA" strokeWidth="2" />
            <line x1="45" y1="23" x2="45" y2="32" stroke="#FECACA" strokeWidth="2" />
            <line x1="36" y1="32" x2="36" y2="41" stroke="#FECACA" strokeWidth="2" />
          </g>
        );
      case 'cone':
        return (
          <g>
            <ellipse cx="36" cy="52" rx="24" ry="4.5" fill="#0F172A" opacity="0.2" />
            <rect x="15" y="44" width="42" height="7" rx="3" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />
            <polygon points="22,44 50,44 41,15 31,15" fill="#FB923C" stroke="#9A3412" strokeWidth="2.4" strokeLinejoin="round" />
            <polygon points="27,31 45,31 43,23 29,23" fill="#FFFFFF" />
          </g>
        );
      case 'hay':
        return (
          <g>
            <ellipse cx="36" cy="52" rx="26" ry="5" fill="#0F172A" opacity="0.18" />
            <rect x="13" y="24" width="46" height="25" rx="7" fill="#FACC15" stroke="#A16207" strokeWidth="2.4" />
            <line x1="26" y1="24" x2="26" y2="49" stroke="#B45309" strokeWidth="2.5" />
            <line x1="46" y1="24" x2="46" y2="49" stroke="#B45309" strokeWidth="2.5" />
          </g>
        );
      case 'cactus':
        return (
          <g>
            <ellipse cx="36" cy="52" rx="20" ry="4.5" fill="#0F172A" opacity="0.18" />
            <rect x="30" y="16" width="12" height="35" rx="6" fill="#22C55E" stroke="#15803D" strokeWidth="2.2" />
            <path d="M30 34 H21 C18 34, 18 24, 21 24" fill="none" stroke="#16A34A" strokeWidth="7" strokeLinecap="round" />
            <path d="M42 30 H50 C53 30, 53 20, 50 20" fill="none" stroke="#16A34A" strokeWidth="7" strokeLinecap="round" />
          </g>
        );
      case 'books':
        return (
          <g>
            <ellipse cx="36" cy="53" rx="26" ry="4.5" fill="#0F172A" opacity="0.18" />
            <rect x="13" y="40" width="46" height="10" rx="3" fill="#00BFFF" stroke="#0369A1" strokeWidth="2" />
            <rect x="16" y="30" width="40" height="10" rx="3" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
            <rect x="19" y="20" width="34" height="10" rx="3" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
          </g>
        );
      case 'fence':
        return (
          <g>
            <ellipse cx="36" cy="53" rx="28" ry="4.5" fill="#0F172A" opacity="0.18" />
            <rect x="11" y="30" width="50" height="6" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="2" />
            <rect x="17" y="19" width="9" height="32" rx="3" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
            <rect x="31" y="19" width="9" height="32" rx="3" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
            <rect x="45" y="19" width="9" height="32" rx="3" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
          </g>
        );
      case 'basket':
      default:
        return (
          <g>
            <ellipse cx="36" cy="53" rx="24" ry="4.5" fill="#0F172A" opacity="0.18" />
            <path d="M16 29 L56 29 L50 50 L22 50 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="14" y="25" width="44" height="6" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 72 58" className={className} aria-hidden="true">
      {renderObstacle()}
    </svg>
  );
};

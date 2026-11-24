import React, { useState } from 'react';

export type KikiMood = 'idle' | 'happy' | 'retry' | 'listening';

interface KikiMascotProps {
  mood?: KikiMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const KikiLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-10 h-10',
  alt = 'So‘zApp — Kiki logotipi',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/assets/kiki-app-icon.png"
        alt={alt}
        onError={() => setImgFailed(true)}
        draggable={false}
        className={`${className} object-contain bg-transparent select-none`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} select-none bg-transparent`}
      aria-label={alt}
      role="img"
    >
      {/* Rounded square pure white icon with bold Deep Sky Blue border */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="24"
        fill="#FFFFFF"
        stroke="#00A6EB"
        strokeWidth="7"
      />
      {/* Sky-blue panda eye patches */}
      <ellipse
        cx="33"
        cy="52"
        rx="14.5"
        ry="18.5"
        transform="rotate(-12 33 52)"
        fill="#00BFFF"
        stroke="#0077B6"
        strokeWidth="2.2"
      />
      <ellipse
        cx="67"
        cy="52"
        rx="14.5"
        ry="18.5"
        transform="rotate(12 67 52)"
        fill="#00BFFF"
        stroke="#0077B6"
        strokeWidth="2.2"
      />
      {/* Glossy black eyes with two white catchlights */}
      <circle cx="34" cy="52" r="9.6" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
      <circle cx="66" cy="52" r="9.6" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
      <circle cx="34.5" cy="52" r="7.4" fill="#090D14" />
      <circle cx="65.5" cy="52" r="7.4" fill="#090D14" />
      <circle cx="31.8" cy="49.2" r="2.4" fill="#FFFFFF" />
      <circle cx="62.8" cy="49.2" r="2.4" fill="#FFFFFF" />
      <circle cx="37.4" cy="54.8" r="1.2" fill="#FFFFFF" />
      <circle cx="68.4" cy="54.8" r="1.2" fill="#FFFFFF" />
      {/* Nose & w-shaped smile */}
      <ellipse cx="50" cy="63.5" rx="5.5" ry="3.6" fill="#090D14" />
      <ellipse cx="50" cy="62.3" rx="3.2" ry="1.2" fill="#38BDF8" opacity="0.5" />
      <line
        x1="50"
        y1="66.8"
        x2="50"
        y2="71.2"
        stroke="#0077B6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M42 70.5 Q46 75.5 50 71 Q54 75.5 58 70.5"
        fill="none"
        stroke="#0077B6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const KikiMascot: React.FC<KikiMascotProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClass =
    size === 'sm'
      ? 'w-16 h-16'
      : size === 'lg'
        ? 'w-36 h-36 sm:w-44 sm:h-44'
        : 'w-28 h-28 sm:w-32 sm:h-32';

  const moodAnimClass =
    mood === 'happy'
      ? 'animate-kiki-happy'
      : mood === 'retry'
        ? 'animate-kiki-retry'
        : mood === 'listening'
          ? 'animate-kiki-listen'
          : 'animate-kiki-idle';

  if (!imgFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center bg-transparent ${className}`}
      >
        <img
          src="/assets/kiki-mascot.png"
          alt="Kiki — So‘zApp nutq yordamchisi"
          onError={() => setImgFailed(true)}
          draggable={false}
          className={`${sizeClass} ${moodAnimClass} object-contain bg-transparent select-none pointer-events-none`}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-transparent ${className}`}
    >
      {/* Transparent-background full-body Kiki fallback SVG */}
      <svg
        viewBox="0 0 200 212"
        className={`${sizeClass} ${moodAnimClass} select-none pointer-events-none bg-transparent`}
        role="img"
        aria-label="Kiki panda qahramoni"
      >
        {/* Ears */}
        <circle
          cx="52"
          cy="43"
          r="21.5"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        <circle cx="57" cy="46" r="11.5" fill="#0098D6" />

        <circle
          cx="148"
          cy="43"
          r="21.5"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        <circle cx="143" cy="46" r="11.5" fill="#0098D6" />

        {/* Left Arm */}
        <path
          d="M 65 130 C 49 140, 41 162, 49 170 C 55 176, 65 170, 68 158 Z"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Arm */}
        <path
          d="M 135 130 C 151 140, 159 162, 151 170 C 145 176, 135 170, 132 158 Z"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Chubby Body & Legs */}
        <path
          d="M 65 128 L 135 128 C 142 146, 142 172, 135 190 C 131 199, 113 200, 108 190 C 106 185, 105 180, 100 180 C 95 180, 94 185, 92 190 C 87 200, 69 199, 65 190 C 58 172, 58 146, 65 128 Z"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle Inner Leg & Shoulder Shading */}
        <path
          d="M 67 132 Q 100 144 133 132 L 130 140 Q 100 150 70 140 Z"
          fill="#0098D6"
          opacity="0.55"
        />

        {/* White Belly Patch with clean dark sky-blue outline */}
        <path
          d="M 67 159 C 67 141, 133 141, 133 159 C 133 176, 118 183, 100 183 C 82 183, 67 176, 67 159 Z"
          fill="#EAF5FB"
          stroke="#0077B6"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 70 165 Q 100 182 130 165 Q 123 181 100 181 Q 77 181 70 165 Z"
          fill="#CFE7F5"
          opacity="0.75"
        />

        {/* Round Panda Head */}
        <path
          d="M 100 22 C 142 22, 166 50, 166 84 C 166 118, 138 136, 100 136 C 62 136, 34 118, 34 84 C 34 50, 58 22, 100 22 Z"
          fill="#FFFFFF"
          stroke="#0077B6"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />

        {/* Subtle Cool Chin Shading */}
        <path
          d="M 41 96 Q 100 136 159 96 Q 146 132 100 133 Q 54 132 41 96 Z"
          fill="#DCEFF8"
          opacity="0.7"
        />

        {/* Tilted Sky-Blue Eye Patches with bold outline */}
        <ellipse
          cx="68"
          cy="86"
          rx="20"
          ry="24.5"
          transform="rotate(-14 68 86)"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="3.2"
        />
        <ellipse
          cx="132"
          cy="86"
          rx="20"
          ry="24.5"
          transform="rotate(14 132 86)"
          fill="#00BFFF"
          stroke="#0077B6"
          strokeWidth="3.2"
        />

        {/* Big Glossy Black Eyes with Two White Catchlights Each */}
        <circle cx="69" cy="86" r="14.2" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2.8" />
        <circle cx="131" cy="86" r="14.2" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2.8" />
        <circle cx="70" cy="86" r="11.4" fill="#090D14" />
        <circle cx="130" cy="86" r="11.4" fill="#090D14" />

        {/* Two crisp white catchlights per eye */}
        <circle cx="65.8" cy="81.8" r="3.7" fill="#FFFFFF" />
        <circle cx="125.8" cy="81.8" r="3.7" fill="#FFFFFF" />
        <circle cx="74.6" cy="90.4" r="1.9" fill="#FFFFFF" />
        <circle cx="134.6" cy="90.4" r="1.9" fill="#FFFFFF" />

        {/* Small Dark Nose with Soft Top Highlight */}
        <ellipse
          cx="100"
          cy="101.5"
          rx="7.6"
          ry="4.8"
          fill="#090D14"
          stroke="#0077B6"
          strokeWidth="1.8"
        />
        <ellipse cx="100" cy="99.7" rx="4.2" ry="1.5" fill="#38BDF8" opacity="0.5" />

        {/* Cute w-shaped Smile */}
        <line
          x1="100"
          y1="106"
          x2="100"
          y2="112"
          stroke="#0077B6"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d={
            mood === 'happy'
              ? 'M 87 110.5 Q 93.5 120 100 112 Q 106.5 120 113 110.5'
              : mood === 'retry'
                ? 'M 89 112 Q 94.5 115 100 112 Q 105.5 115 111 112'
                : 'M 88 110.5 Q 94 118 100 112 Q 106 118 112 110.5'
          }
          fill="none"
          stroke="#0077B6"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

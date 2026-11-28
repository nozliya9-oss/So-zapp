import React, { useEffect, useId, useState } from 'react';
import {
  getIsUzVoiceSpeaking,
  subscribeUzVoiceSpeaking,
} from '../utils/uzVoiceService';

export type KikiMood = 'idle' | 'happy' | 'retry' | 'listening';
type KikiLiveGesture = 'none' | 'wave' | 'scratch' | 'jump';

interface KikiMascotProps {
  mood?: KikiMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isSpeaking?: boolean;
  syncWithGlobalVoice?: boolean;
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
  isSpeaking = false,
  syncWithGlobalVoice = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const [globalVoiceSpeaking, setGlobalVoiceSpeaking] = useState<boolean>(() =>
    getIsUzVoiceSpeaking()
  );
  const [liveGesture, setLiveGesture] = useState<KikiLiveGesture>('none');

  useEffect(() => {
    if (!syncWithGlobalVoice) return;
    setGlobalVoiceSpeaking(getIsUzVoiceSpeaking());
    return subscribeUzVoiceSpeaking((speaking) => {
      setGlobalVoiceSpeaking(speaking);
    });
  }, [syncWithGlobalVoice]);

  const effectiveSpeaking = Boolean(
    isSpeaking || (syncWithGlobalVoice && globalVoiceSpeaking)
  );

  // Spaced-out occasional living gestures: scratch head -> wave paw -> playful hop
  // Starts calmly at rest, pauses naturally between actions (~9s apart), and pauses during listening/speaking.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    )?.matches;
    if (
      prefersReduced ||
      mood === 'listening' ||
      mood === 'retry' ||
      effectiveSpeaking
    ) {
      setLiveGesture('none');
      return;
    }

    const sequence: KikiLiveGesture[] = ['scratch', 'wave', 'jump'];
    let stepIndex = 0;
    let activeTimeoutId: number | null = null;

    const triggerGesture = () => {
      const nextGesture = sequence[stepIndex % sequence.length];
      stepIndex += 1;
      setLiveGesture(nextGesture);
      if (activeTimeoutId !== null) {
        clearTimeout(activeTimeoutId);
      }
      activeTimeoutId = window.setTimeout(
        () => {
          setLiveGesture('none');
        },
        nextGesture === 'jump' ? 1500 : 2150
      );
    };

    // Calm pause at startup before first expressive action, then spaced intervals
    const staggerMs = (uid.charCodeAt(0) % 5) * 350;
    const initTimer = window.setTimeout(triggerGesture, 3800 + staggerMs);
    const intervalId = window.setInterval(triggerGesture, 9200);

    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalId);
      if (activeTimeoutId !== null) {
        clearTimeout(activeTimeoutId);
      }
    };
  }, [mood, effectiveSpeaking, uid]);

  const sizeClass =
    size === 'sm'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : size === 'lg'
        ? 'w-36 h-36 sm:w-44 sm:h-44'
        : 'w-28 h-28 sm:w-32 sm:h-32';

  const bodyAnimClass = effectiveSpeaking
    ? 'animate-kiki-speak'
    : liveGesture === 'jump'
      ? 'animate-kiki-jump-once'
      : mood === 'retry'
        ? 'animate-kiki-retry'
        : mood === 'listening'
          ? 'animate-kiki-listen'
          : mood === 'happy'
            ? 'animate-kiki-happy'
            : 'animate-kiki-idle';

  const isJumpingNow = liveGesture === 'jump';
  const isWaving = liveGesture === 'wave';
  const isScratching = liveGesture === 'scratch';

  const leftArmAnimClass = isJumpingNow
    ? 'kiki-arm-cheer-left'
    : isWaving
      ? 'kiki-arm-wave'
      : 'kiki-arm-left-idle';

  const rightArmAnimClass = isJumpingNow
    ? 'kiki-arm-cheer-right'
    : isScratching
      ? 'kiki-arm-scratch'
      : 'kiki-arm-right-idle';

  const [spriteFallback, setSpriteFallback] = useState(false);

  const renderLeftArm = () => (
    <g transform="translate(160, 346)">
      <g className={`kiki-arm-left ${leftArmAnimClass}`}>
        <image
          href="/assets/kiki-arm-left.png"
          x="-160"
          y="-346"
          width="512"
          height="512"
          onError={() => setSpriteFallback(true)}
        />
      </g>
    </g>
  );

  const renderRightArm = () => (
    <g transform="translate(356, 346)">
      <g className={`kiki-arm-right ${rightArmAnimClass}`}>
        <image
          href="/assets/kiki-arm-right.png"
          x="-356"
          y="-346"
          width="512"
          height="512"
          onError={() => setSpriteFallback(true)}
        />
      </g>
    </g>
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center aspect-square shrink-0 bg-transparent select-none ${sizeClass} ${className}`}
    >
      {effectiveSpeaking && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-1.5 top-1/4 w-3 h-7 rounded-full border-l-[3px] border-[#00BFFF]/85 animate-ping"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1.5 top-1/4 w-3 h-7 rounded-full border-r-[3px] border-[#00BFFF]/85 animate-ping"
          />
        </>
      )}

      {/* Exact User Panda Character Rigged with Living Movements */}
      <svg
        viewBox="52 6 408 498"
        preserveAspectRatio="xMidYMid meet"
        className={`w-full h-full select-none pointer-events-none bg-transparent overflow-visible ${bodyAnimClass}`}
        role="img"
        aria-label="Kiki panda qahramoni"
      >
        {/* Subtle Ground Shadow */}
        <ellipse
          cx="256"
          cy="494"
          rx={isJumpingNow ? 84 : 104}
          ry="11"
          fill="#086488"
          opacity={isJumpingNow ? 0.08 : 0.14}
        />

        {spriteFallback ? (
          <image
            href="/assets/kiki-mascot.png"
            x="0"
            y="0"
            width="512"
            height="512"
          />
        ) : (
          <>
            {/* Articulated Left & Right Arms (behind body except foreground scratch) */}
            {renderLeftArm()}
            {!isScratching && renderRightArm()}

            {/* Exact User Panda Body + Head Layer with Living Face Overlays */}
            <g
              className={`kiki-head-group ${
                isScratching ? 'kiki-head-scratch' : 'kiki-part-torso'
              }`}
            >
              <image
                href="/assets/kiki-body-noarms.png"
                x="0"
                y="0"
                width="512"
                height="512"
                onError={() => setSpriteFallback(true)}
              />

              {/* Frequent Smooth Eye Blink Cover (stays strictly inside blue eye patches) */}
              <g className="kiki-closed-lid" aria-hidden="true">
                <ellipse cx="179.5" cy="193" rx="50" ry="49" fill="#05BEFC" />
                <path
                  d="M 142 195 Q 179.5 220 217 195"
                  fill="none"
                  stroke="#086488"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <ellipse cx="335.5" cy="193" rx="50" ry="49" fill="#05BEFC" />
                <path
                  d="M 298 195 Q 335.5 220 373 195"
                  fill="none"
                  stroke="#086488"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              </g>

              {/* Audio-Synced Mouth Animation (active only while voice/audio plays; otherwise exact resting smile shows) */}
              {effectiveSpeaking && (
                <g aria-hidden="true">
                  <rect
                    x="219"
                    y="246"
                    width="77"
                    height="30"
                    rx="14"
                    fill="#FFFFFF"
                  />
                  <line
                    x1="257.5"
                    y1="246"
                    x2="257.5"
                    y2="253"
                    stroke="#086488"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <g className="kiki-mouth-speaking">
                    <path
                      d="M 230 253 Q 257.5 250 285 253 C 285 277, 274 285, 257.5 285 C 241 285, 230 277, 230 253 Z"
                      fill="#083A5C"
                      stroke="#086488"
                      strokeWidth="5.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 240 272 Q 257.5 262 275 272 Q 267 283 257.5 283 Q 248 283 240 272 Z"
                      fill="#FB7185"
                    />
                  </g>
                </g>
              )}
            </g>

            {/* Foreground Right Arm When Scratching Head */}
            {isScratching && renderRightArm()}
          </>
        )}
      </svg>
    </div>
  );
};

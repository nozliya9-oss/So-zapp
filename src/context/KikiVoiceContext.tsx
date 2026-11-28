import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { KikiVoiceStyle } from '../types';
import {
  KIKI_VOICE_PROFILES,
  KikiVoiceProfileConfig,
  getKikiVoiceStyle,
  normalizeKikiVoiceStyle,
  setKikiVoiceStyle,
} from '../utils/soundEffects';

interface KikiVoiceContextValue {
  voiceStyle: KikiVoiceStyle;
  voiceConfig: KikiVoiceProfileConfig;
  setVoiceStyle: (style: KikiVoiceStyle) => void;
}

const KikiVoiceContext = createContext<KikiVoiceContextValue | null>(null);

export const KikiVoiceProvider: React.FC<{
  initialStyle?: KikiVoiceStyle | string;
  onSyncProfileStyle?: (style: KikiVoiceStyle) => void;
  children: React.ReactNode;
}> = ({ initialStyle, onSyncProfileStyle, children }) => {
  const [voiceStyle, setVoiceStyleState] = useState<KikiVoiceStyle>(() =>
    initialStyle ? normalizeKikiVoiceStyle(initialStyle) : getKikiVoiceStyle()
  );

  useEffect(() => {
    setKikiVoiceStyle(voiceStyle);
  }, [voiceStyle]);

  useEffect(() => {
    if (initialStyle) {
      const normalized = normalizeKikiVoiceStyle(initialStyle);
      setVoiceStyleState(normalized);
      setKikiVoiceStyle(normalized);
    }
  }, [initialStyle]);

  const setVoiceStyle = (nextStyle: KikiVoiceStyle) => {
    const normalized = normalizeKikiVoiceStyle(nextStyle);
    setKikiVoiceStyle(normalized);
    setVoiceStyleState(normalized);
    onSyncProfileStyle?.(normalized);
  };

  const value = useMemo<KikiVoiceContextValue>(
    () => ({
      voiceStyle,
      voiceConfig: KIKI_VOICE_PROFILES[voiceStyle],
      setVoiceStyle,
    }),
    [voiceStyle]
  );

  return (
    <KikiVoiceContext.Provider value={value}>
      {children}
    </KikiVoiceContext.Provider>
  );
};

export function useKikiVoice(): KikiVoiceContextValue {
  const ctx = useContext(KikiVoiceContext);
  if (ctx) return ctx;
  const fallbackStyle = getKikiVoiceStyle();
  return {
    voiceStyle: fallbackStyle,
    voiceConfig: KIKI_VOICE_PROFILES[fallbackStyle],
    setVoiceStyle: (style) => setKikiVoiceStyle(style),
  };
}

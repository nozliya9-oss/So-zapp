export type Language = 'uz' | 'ru';

export type TabId = 'home' | 'city' | 'games' | 'chat' | 'profile';

export type HomeSubView = 'hub' | 'diagnostic' | 'lessons' | 'tournament';

export type ProfileSubTab = 'child' | 'parent' | 'therapist' | 'settings';

export type ThemeMode = 'light' | 'dark';

export type GameStageType =
  | 'sound_match'
  | 'obstacle_jump'
  | 'syllables'
  | 'breath_power';

export interface GameStageProgress {
  stage: number;
  stars: number; // 0..3
  bestScore: number; // 0..100
  completed: boolean;
}

export type KikiVoiceStyle = 'child_boy' | 'child_girl';

export type SoundKey = 'R' | 'S' | 'Sh' | 'L' | 'Ch' | 'J/Z';

export type NodeStatus = 'completed' | 'active' | 'unlocked';

export type NodeVariant = 'standard' | 'assessment' | 'multilingual' | 'therapist';

export interface ChatSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: ChatSource[];
  isFallback?: boolean;
  isError?: boolean;
}

export interface PracticeWord {
  id: string;
  word: string;
  syllables: string;
  targetSound: string;
  speechLang: 'uz-UZ' | 'ru-RU';
  exampleUsage: string;
  tipUz: string;
  contrastNote?: {
    uzSound: string;
    uzExample: string;
    ruSound: string;
    ruExample: string;
    explanation: string;
  };
  meaningUz?: string;
}

export interface LessonNode {
  id: string;
  weekNumber: number;
  dayNumber: number; // 1..6 = focused sounds, 7 = Yakshanba assessment
  dayLabel: string;
  language: Language;
  title: string;
  subtitle: string;
  targetSound: string;
  status: NodeStatus;
  variant: NodeVariant;
  starsEarned: number;
  maxStars: number;
  kikiGreeting: string;
  words: PracticeWord[];
  assignedBy?: string;
}

export interface WeekCurriculum {
  weekNumber: number;
  title: string;
  subtitle: string;
  nodes: LessonNode[];
}

export interface SpeechAnalysisResult {
  transcript: string;
  accuracy: number;
  pitchHz: number;
  intonationScore: number;
  clarityScore: number;
  tier: 'retry' | 'good' | 'excellent';
  passed: boolean;
  starsAwarded: number;
  feedbackUz: string;
  highlightTipUz: string;
  isSimulated: boolean;
}

export interface SoundStat {
  sound: SoundKey;
  label: string;
  accuracy: number;
  previousAccuracy: number;
  color: string;
}

export interface WeeklyAssessmentRecord {
  id: string;
  weekNumber: number;
  weekLabel: string;
  completedAt: string;
  overallScore: number;
  previousWeekScore: number | null;
  soundScores: Record<SoundKey, number>;
  notesUz: string;
}

export interface PracticeSession {
  id: string;
  dateLabel: string;
  lessonTitle: string;
  targetSound: string;
  accuracy: number;
  pitchHz: number;
  starsEarned: number;
}

export interface CityBuilding {
  id: string;
  order: number;
  name: string;
  description: string;
  unlockStars: number;
  soundFocus: string;
  roofColor: string;
  wallColor: string;
  accentColor: string;
  storyLine: string;
  miniQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    praiseUz: string;
  };
  practiceCards: { word: string; syllables: string; tip: string }[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'boy' | 'girl';
  focusSound: SoundKey;
  dailyWordGoal: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  inclusiveMode: boolean;
  voiceStyle?: KikiVoiceStyle;
  theme?: ThemeMode;
}

export interface AuthUser {
  phone: string;
  formattedPhone: string;
  linkedTelegram: boolean;
  telegramUsername: string | null;
}

export type DiagnosticSoundGroup =
  | 'Sonorlar (R, L)'
  | 'Sirg‘aluvchi va shovqinli (S, Z, Sh, J, Ch, X, H)'
  | 'Portlovchi (K, G, Q, G‘, T, D, P, B)'
  | 'Unli va burun (O‘, Ng)';

export interface DiagnosticWordItem {
  id: string;
  order: number;
  word: string;
  syllables: string;
  emoji: string;
  targetLetter: string;
  mappedSoundKey: SoundKey;
  soundGroup: DiagnosticSoundGroup;
  tipUz: string;
}

export interface DiagnosticWordResult {
  wordId: string;
  word: string;
  targetLetter: string;
  mappedSoundKey: SoundKey;
  soundGroup: DiagnosticSoundGroup;
  score: number;
  skipped: boolean;
  transcript: string;
}

export interface DiagnosticLetterScore {
  letter: string;
  mappedSoundKey: SoundKey;
  soundGroup: DiagnosticSoundGroup;
  score: number;
  status: 'excellent' | 'medium' | 'needs_practice';
  wordsTested: number;
  tipUz: string;
}

export interface DiagnosticReport {
  id: string;
  completedAt: string;
  overallScore: number;
  totalWords: number;
  completedWords: number;
  isDemo: boolean;
  letterScores: DiagnosticLetterScore[];
  weakestLetters: DiagnosticLetterScore[];
  recommendedCityFocusLetters: string[];
}

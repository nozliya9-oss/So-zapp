export type Language = 'uz' | 'ru';

export type TabId =
  | 'lessons'
  | 'city'
  | 'games'
  | 'tournament'
  | 'chat'
  | 'therapist'
  | 'parent'
  | 'profile';

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
}

import { useEffect, useState } from 'react';
import {
  DEFAULT_PROFILE,
  INITIAL_SESSIONS,
  INITIAL_SOUND_STATS,
  INITIAL_WEEKLY_ASSESSMENTS,
  buildInitialCurriculum,
} from './data/lessonsData';
import {
  CityBuilding,
  Language,
  LessonNode,
  PracticeSession,
  SoundKey,
  SoundStat,
  TabId,
  UserProfile,
  WeekCurriculum,
  WeeklyAssessmentRecord,
} from './types';
import { SidebarNav } from './components/SidebarNav';
import { TopBar } from './components/TopBar';
import { LessonsPath } from './components/LessonsPath';
import { WordCityView } from './components/WordCityView';
import { GamesView } from './components/GamesView';
import { TournamentView } from './components/TournamentView';
import { KikiChatView } from './components/KikiChatView';
import { TherapistDashboardView } from './components/TherapistDashboardView';
import { ParentDashboardView } from './components/ParentDashboardView';
import { ProfileView } from './components/ProfileView';
import { RightPanel } from './components/RightPanel';
import { PracticeModal } from './components/PracticeModal';
import { startBackgroundMusic, stopBackgroundMusic } from './utils/soundEffects';

const STORAGE_KEYS = {
  PROFILE: 'kiki_user_profile_v1',
  ASSESSMENTS: 'kiki_weekly_assessments_v1',
  STARS: 'kiki_stars_v2',
  COINS: 'kiki_coins_v2',
  CLAIMED_BUILDINGS: 'kiki_claimed_buildings_v2',
};

function loadStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>('uz');
  const [activeTab, setActiveTab] = useState<TabId>('lessons');

  const [profile, setProfile] = useState<UserProfile>(() =>
    loadStoredJson<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
  );
  const [stars, setStars] = useState<number>(() =>
    loadStoredJson<number>(STORAGE_KEYS.STARS, 45)
  );
  const [coins, setCoins] = useState<number>(() =>
    loadStoredJson<number>(STORAGE_KEYS.COINS, 20)
  );
  const [claimedBuildingIds, setClaimedBuildingIds] = useState<string[]>(() =>
    loadStoredJson<string[]>(STORAGE_KEYS.CLAIMED_BUILDINGS, [
      'b1-tovushlar-kutubxonasi',
    ])
  );
  const [weeklyAssessments, setWeeklyAssessments] = useState<WeeklyAssessmentRecord[]>(
    () =>
      loadStoredJson<WeeklyAssessmentRecord[]>(
        STORAGE_KEYS.ASSESSMENTS,
        INITIAL_WEEKLY_ASSESSMENTS
      )
  );

  const [uzWeeks, setUzWeeks] = useState<WeekCurriculum[]>(() =>
    buildInitialCurriculum('uz')
  );
  const [ruWeeks, setRuWeeks] = useState<WeekCurriculum[]>(() =>
    buildInitialCurriculum('ru')
  );
  const [customNodes, setCustomNodes] = useState<LessonNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<LessonNode | null>(null);

  const [todayWordsCompleted, setTodayWordsCompleted] = useState<number>(3);
  const [soundStats, setSoundStats] = useState<SoundStat[]>(INITIAL_SOUND_STATS);
  const [sessions, setSessions] = useState<PracticeSession[]>(INITIAL_SESSIONS);

  // Persist profile, stars, coins, claimed buildings, and weekly assessments
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.STARS, JSON.stringify(stars));
    } catch {
      // Ignore
    }
  }, [stars]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.COINS, JSON.stringify(coins));
    } catch {
      // Ignore
    }
  }, [coins]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.CLAIMED_BUILDINGS,
        JSON.stringify(claimedBuildingIds)
      );
    } catch {
      // Ignore
    }
  }, [claimedBuildingIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.ASSESSMENTS,
        JSON.stringify(weeklyAssessments)
      );
    } catch {
      // Ignore
    }
  }, [weeklyAssessments]);

  // Background Music lifecycle controlled strictly by profile.musicEnabled
  useEffect(() => {
    if (profile.musicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => {
      stopBackgroundMusic();
    };
  }, [profile.musicEnabled]);

  const currentWeeks = language === 'uz' ? uzWeeks : ruWeeks;
  const currentCustomNodes = customNodes.filter((n) => n.language === language);
  const activeNode =
    currentWeeks.flatMap((w) => w.nodes).find((n) => n.status === 'active') ||
    currentWeeks[0]?.nodes[0] ||
    null;

  const handleUpdateProfile = (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const handleWordSuccess = (wordStars: number) => {
    setStars((prev) => prev + wordStars);
    setTodayWordsCompleted((prev) => prev + 1);
  };

  const handleClaimBuildingReward = (building: CityBuilding) => {
    if (claimedBuildingIds.includes(building.id)) return;
    setClaimedBuildingIds((prev) => [...prev, building.id]);
    setCoins((prev) => prev + 20);
  };

  const handleGameRewardEarned = (starsEarned: number, coinsEarned: number) => {
    setStars((prev) => prev + starsEarned);
    setCoins((prev) => prev + coinsEarned);
  };

  const handleLessonComplete = ({
    node,
    avgAccuracy,
    avgPitchHz,
    totalStarsEarned,
    perSoundScores,
  }: {
    node: LessonNode;
    avgAccuracy: number;
    avgPitchHz: number;
    totalStarsEarned: number;
    perSoundScores: Partial<Record<SoundKey, number>>;
  }) => {
    const bonus = node.variant === 'assessment' ? 30 : 20;
    setStars((prev) => prev + bonus);
    setCoins((prev) => prev + 15);

    const markCompleted = (weeks: WeekCurriculum[]): WeekCurriculum[] => {
      let promoteNext = false;
      return weeks.map((week) => ({
        ...week,
        nodes: week.nodes.map((n) => {
          if (n.id === node.id) {
            promoteNext = true;
            return { ...n, status: 'completed', starsEarned: n.maxStars };
          }
          if (promoteNext && n.status === 'unlocked') {
            promoteNext = false;
            return { ...n, status: 'active' };
          }
          return n;
        }),
      }));
    };

    if (node.language === 'uz') {
      setUzWeeks((prev) => markCompleted(prev));
    } else {
      setRuWeeks((prev) => markCompleted(prev));
    }

    // Update sound stats
    setSoundStats((prev) =>
      prev.map((stat) => {
        const directScore = perSoundScores[stat.sound];
        if (typeof directScore === 'number') {
          return {
            ...stat,
            previousAccuracy: stat.accuracy,
            accuracy: Math.min(98, Math.round((stat.accuracy + directScore) / 2)),
          };
        }
        if (stat.sound === node.targetSound) {
          return {
            ...stat,
            previousAccuracy: stat.accuracy,
            accuracy: Math.min(98, Math.round((stat.accuracy + avgAccuracy) / 2)),
          };
        }
        return stat;
      })
    );

    // Save Weekly Sunday Assessment persistently if Day 7 assessment was completed
    if (node.variant === 'assessment') {
      const prevRecord = weeklyAssessments[weeklyAssessments.length - 1];
      const soundKeys: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];
      const fullSoundScores = {} as Record<SoundKey, number>;

      soundKeys.forEach((key) => {
        const statMatch = soundStats.find((s) => s.sound === key);
        fullSoundScores[key] =
          perSoundScores[key] ?? statMatch?.accuracy ?? avgAccuracy;
      });

      const overallScore = Math.round(
        soundKeys.reduce((sum, k) => sum + fullSoundScores[k], 0) / soundKeys.length
      );

      const newRecord: WeeklyAssessmentRecord = {
        id: `assess-${Date.now()}`,
        weekNumber: node.weekNumber,
        weekLabel: `${node.weekNumber}-hafta (Yakshanba baholash)`,
        completedAt: 'Hozirgina',
        overallScore,
        previousWeekScore: prevRecord ? prevRecord.overallScore : null,
        soundScores: fullSoundScores,
        notesUz: `${node.weekNumber}-hafta yakshanba sinovi yakunlandi. Barcha 6 ta tovush bo‘yicha natijalar saqlandi.`,
      };

      setWeeklyAssessments((prev) => [...prev, newRecord]);
    }

    // Add to recent sessions log
    const newSession: PracticeSession = {
      id: `sess-${Date.now()}`,
      dateLabel: 'Hozirgina',
      lessonTitle: node.title,
      targetSound: node.targetSound,
      accuracy: avgAccuracy,
      pitchHz: avgPitchHz,
      starsEarned: totalStarsEarned,
    };
    setSessions((prev) => [newSession, ...prev.slice(0, 7)]);
  };

  const handleAssignCustomExercise = (newNode: LessonNode) => {
    setCustomNodes((prev) => [newNode, ...prev]);
    setLanguage(newNode.language);
  };

  const showRightPanel =
    activeTab === 'lessons' ||
    activeTab === 'city' ||
    activeTab === 'games' ||
    activeTab === 'tournament';

  return (
    <div
      className={`min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row ${
        profile.inclusiveMode ? 'inclusive-mode bg-slate-50/40' : ''
      }`}
    >
      {/* Left Navigation Sidebar (Desktop) & Bottom Nav (Mobile) */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        sfxEnabled={profile.sfxEnabled}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          language={language}
          onChangeLanguage={setLanguage}
          stars={stars}
          coins={coins}
          profile={profile}
          sfxEnabled={profile.sfxEnabled}
          onOpenProfile={() => setActiveTab('profile')}
        />

        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0">
            {activeTab === 'lessons' && (
              <LessonsPath
                language={language}
                weeks={currentWeeks}
                customNodes={currentCustomNodes}
                onSelectNode={(node) => setSelectedNode(node)}
                sfxEnabled={profile.sfxEnabled}
              />
            )}

            {activeTab === 'city' && (
              <WordCityView
                stars={stars}
                coins={coins}
                claimedBuildingIds={claimedBuildingIds}
                language={language}
                sfxEnabled={profile.sfxEnabled}
                onClaimBuildingReward={handleClaimBuildingReward}
                onAddBonusCoins={(amount) => setCoins((prev) => prev + amount)}
                onGoToLessons={() => setActiveTab('lessons')}
              />
            )}

            {activeTab === 'games' && (
              <GamesView
                sfxEnabled={profile.sfxEnabled}
                onRewardEarned={handleGameRewardEarned}
              />
            )}

            {activeTab === 'tournament' && (
              <TournamentView
                stars={stars}
                profile={profile}
                sfxEnabled={profile.sfxEnabled}
                onGoToLessons={() => setActiveTab('lessons')}
              />
            )}

            {activeTab === 'chat' && <KikiChatView sfxEnabled={profile.sfxEnabled} />}

            {activeTab === 'therapist' && (
              <TherapistDashboardView
                profile={profile}
                soundStats={soundStats}
                weeklyAssessments={weeklyAssessments}
                sfxEnabled={profile.sfxEnabled}
                onAssignCustomExercise={handleAssignCustomExercise}
                onGoToLessons={() => setActiveTab('lessons')}
              />
            )}

            {activeTab === 'parent' && (
              <ParentDashboardView
                profile={profile}
                stars={stars}
                soundStats={soundStats}
                weeklyAssessments={weeklyAssessments}
                sessions={sessions}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                stars={stars}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </main>

          {/* Right Actionable Goal & Next-Building Panel */}
          {showRightPanel && (
            <RightPanel
              stars={stars}
              todayWordsCompleted={todayWordsCompleted}
              activeNode={activeNode}
              profile={profile}
              sfxEnabled={profile.sfxEnabled}
              onStartActiveLesson={(node) => setSelectedNode(node)}
              onOpenCity={() => setActiveTab('city')}
              onOpenTournament={() => setActiveTab('tournament')}
              onOpenChat={() => setActiveTab('chat')}
            />
          )}
        </div>
      </div>

      {/* Live AI Speech Practice Modal */}
      {selectedNode && (
        <PracticeModal
          node={selectedNode}
          sfxEnabled={profile.sfxEnabled}
          onClose={() => setSelectedNode(null)}
          onWordSuccess={handleWordSuccess}
          onLessonComplete={handleLessonComplete}
        />
      )}
    </div>
  );
}

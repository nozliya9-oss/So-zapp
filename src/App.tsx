import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  DEFAULT_PROFILE,
  INITIAL_SESSIONS,
  INITIAL_SOUND_STATS,
  INITIAL_WEEKLY_ASSESSMENTS,
  buildInitialCurriculum,
} from './data/lessonsData';
import {
  AuthUser,
  CityBuilding,
  DiagnosticReport,
  GameStageProgress,
  HomeSubView,
  Language,
  LessonNode,
  PracticeSession,
  ProfileSubTab,
  SoundKey,
  SoundStat,
  TabId,
  UserProfile,
  WeekCurriculum,
  WeeklyAssessmentRecord,
} from './types';
import { mapDiagnosticWeakestToSoundKey } from './data/diagnosticData';
import { SidebarNav } from './components/SidebarNav';
import { TopBar } from './components/TopBar';
import { AsosiyHubView } from './components/AsosiyHubView';
import { LessonsPath } from './components/LessonsPath';
import { DiagnosticExamView } from './components/DiagnosticExamView';
import { WordCityView } from './components/WordCityView';
import { GamesView } from './components/GamesView';
import { TournamentView } from './components/TournamentView';
import { KikiChatView } from './components/KikiChatView';
import { ProfileView } from './components/ProfileView';
import { RightPanel } from './components/RightPanel';
import { PracticeModal } from './components/PracticeModal';
import { LoginView } from './components/LoginView';
import { KikiVoiceProvider } from './context/KikiVoiceContext';
import {
  normalizeKikiVoiceStyle,
  playButtonPop,
  setKikiVoiceStyle,
  startBackgroundMusic,
  stopBackgroundMusic,
} from './utils/soundEffects';

const STORAGE_KEYS = {
  PROFILE: 'kiki_user_profile_v1',
  ASSESSMENTS: 'kiki_weekly_assessments_v1',
  STARS: 'kiki_stars_v2',
  COINS: 'kiki_coins_v2',
  CLAIMED_BUILDINGS: 'kiki_claimed_buildings_v2',
  DIAGNOSTIC_REPORT: 'kiki_diagnostic_report_v1',
  GAME_STAGES: 'kiki_game_stages_v1',
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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [homeSubView, setHomeSubView] = useState<HomeSubView>('hub');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('child');

  const [profile, setProfile] = useState<UserProfile>(() => {
    const loaded = loadStoredJson<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    return {
      ...loaded,
      voiceStyle: normalizeKikiVoiceStyle(loaded.voiceStyle),
    };
  });
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
  const [diagnosticReport, setDiagnosticReport] =
    useState<DiagnosticReport | null>(() =>
      loadStoredJson<DiagnosticReport | null>(STORAGE_KEYS.DIAGNOSTIC_REPORT, null)
    );
  const [gameStageProgress, setGameStageProgress] = useState<
    Record<number, GameStageProgress>
  >(() =>
    loadStoredJson<Record<number, GameStageProgress>>(STORAGE_KEYS.GAME_STAGES, {})
  );

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

  // Persist diagnostic report
  useEffect(() => {
    try {
      if (diagnosticReport) {
        window.localStorage.setItem(
          STORAGE_KEYS.DIAGNOSTIC_REPORT,
          JSON.stringify(diagnosticReport)
        );
      }
    } catch {
      // Ignore
    }
  }, [diagnosticReport]);

  // Persist game stages progress
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.GAME_STAGES,
        JSON.stringify(gameStageProgress)
      );
    } catch {
      // Ignore
    }
  }, [gameStageProgress]);

  // Synchronize Tongi rejim (light) / Tungi rejim (dark) with document root
  useEffect(() => {
    const isDark = profile.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [profile.theme]);

  // Synchronize Kiki voice style globally
  useEffect(() => {
    setKikiVoiceStyle(normalizeKikiVoiceStyle(profile.voiceStyle));
  }, [profile.voiceStyle]);

  // Background Music lifecycle controlled strictly by authentication and profile.musicEnabled
  useEffect(() => {
    if (authToken && profile.musicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => {
      stopBackgroundMusic();
    };
  }, [authToken, profile.musicEnabled]);

  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setHomeSubView('hub');
    }
  };

  const handleAuthenticated = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setAuthUser(user);
    setActiveTab('home');
    setHomeSubView('hub');
  };

  const handleLogout = () => {
    const tokenToRevoke = authToken;
    setAuthToken(null);
    setAuthUser(null);
    setSelectedNode(null);
    setActiveTab('home');
    setHomeSubView('hub');
    if (tokenToRevoke) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenToRevoke}`,
        },
      }).catch(() => {
        // Ignore network errors on logout cleanup
      });
    }
  };

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

  const handleGameStageComplete = (
    stage: number,
    starsEarned: number,
    scorePct: number,
    bonusCoins: number
  ) => {
    setGameStageProgress((prev) => {
      const existing = prev[stage];
      return {
        ...prev,
        [stage]: {
          stage,
          completed: true,
          stars: Math.max(existing?.stars || 0, starsEarned),
          bestScore: Math.max(existing?.bestScore || 0, scorePct),
        },
      };
    });
    setStars((prev) => prev + starsEarned);
    setCoins((prev) => prev + bonusCoins);
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

  const handleCompleteDiagnosticReport = (report: DiagnosticReport) => {
    setDiagnosticReport(report);
    const weakestSound = mapDiagnosticWeakestToSoundKey(report);
    setProfile((prev) => ({ ...prev, focusSound: weakestSound }));
    setStars((prev) => prev + 25);

    const grouped: Record<string, number[]> = {};
    report.letterScores.forEach((ls) => {
      if (!grouped[ls.mappedSoundKey]) grouped[ls.mappedSoundKey] = [];
      grouped[ls.mappedSoundKey].push(ls.score);
    });

    setSoundStats((prev) =>
      prev.map((stat) => {
        const scores = grouped[stat.sound];
        if (!scores || scores.length === 0) return stat;
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        return {
          ...stat,
          previousAccuracy: stat.accuracy,
          accuracy: avg,
        };
      })
    );
  };

  const showRightPanel =
    activeTab === 'city' ||
    activeTab === 'games' ||
    (activeTab === 'home' && homeSubView !== 'diagnostic');

  const subViewTitle =
    homeSubView === 'diagnostic'
      ? 'Birinchi imtihon — Nutq diagnostikasi'
      : homeSubView === 'lessons'
        ? 'Darslar yo‘li'
        : homeSubView === 'tournament'
          ? 'Haftalik turnir'
          : '';

  if (!authToken || !authUser) {
    return (
      <LoginView
        sfxEnabled={profile.sfxEnabled}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <KikiVoiceProvider
      initialStyle={normalizeKikiVoiceStyle(profile.voiceStyle)}
      onSyncProfileStyle={(voiceStyle) => handleUpdateProfile({ voiceStyle })}
    >
      <div
        className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors ${
          profile.inclusiveMode ? 'inclusive-mode bg-slate-50/40 dark:bg-slate-900' : ''
        }`}
      >
        {/* Left Navigation Sidebar (Desktop) & Bottom Nav (Mobile) — 5 Sections */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          sfxEnabled={profile.sfxEnabled}
        />

        {/* Main Content Shell */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            language={language}
            onChangeLanguage={setLanguage}
            stars={stars}
            profile={profile}
            sfxEnabled={profile.sfxEnabled}
            onOpenHome={() => handleSelectTab('home')}
            onOpenProfile={() => setActiveTab('profile')}
          />

          <div className="flex-1 flex min-w-0">
            <main className="flex-1 min-w-0">
              {/* SECTION 1: ASOSIY (Main Hub + Sub-views) */}
              {activeTab === 'home' && homeSubView === 'hub' && (
                <AsosiyHubView
                  profile={profile}
                  stars={stars}
                  activeNode={activeNode}
                  diagnosticReport={diagnosticReport}
                  sfxEnabled={profile.sfxEnabled}
                  onOpenSubView={(view) => setHomeSubView(view)}
                />
              )}

              {activeTab === 'home' && homeSubView !== 'hub' && (
                <div>
                  <div className="bg-white/95 dark:bg-slate-900/95 border-b border-[#E5E5E5] dark:border-slate-800 px-3 sm:px-6 py-2.5">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          playButtonPop(!profile.sfxEnabled);
                          setHomeSubView('hub');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5F8FF] dark:bg-[#00BFFF]/20 text-[#008ECC] dark:text-[#38BDF8] font-display font-bold text-xs sm:text-sm hover:bg-[#D4F3FF] dark:hover:bg-[#00BFFF]/30 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Asosiyga qaytish</span>
                      </button>
                      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 text-right leading-tight">
                        {subViewTitle}
                      </span>
                    </div>
                  </div>

                  {homeSubView === 'diagnostic' && (
                    <DiagnosticExamView
                      report={diagnosticReport}
                      voiceStyle={normalizeKikiVoiceStyle(profile.voiceStyle)}
                      sfxEnabled={profile.sfxEnabled}
                      onChangeVoiceStyle={(voiceStyle) =>
                        handleUpdateProfile({ voiceStyle })
                      }
                      onCompleteReport={handleCompleteDiagnosticReport}
                      onGoToCity={() => setActiveTab('city')}
                    />
                  )}

                  {homeSubView === 'lessons' && (
                    <LessonsPath
                      language={language}
                      weeks={currentWeeks}
                      customNodes={currentCustomNodes}
                      onSelectNode={(node) => setSelectedNode(node)}
                      sfxEnabled={profile.sfxEnabled}
                      diagnosticReport={diagnosticReport}
                      onOpenDiagnostic={() => setHomeSubView('diagnostic')}
                    />
                  )}

                  {homeSubView === 'tournament' && (
                    <TournamentView
                      stars={stars}
                      profile={profile}
                      sfxEnabled={profile.sfxEnabled}
                      onGoToLessons={() => setHomeSubView('lessons')}
                    />
                  )}
                </div>
              )}

              {/* SECTION 2: SO‘ZLAR SHAHRI */}
              {activeTab === 'city' && (
                <WordCityView
                  stars={stars}
                  coins={coins}
                  claimedBuildingIds={claimedBuildingIds}
                  language={language}
                  sfxEnabled={profile.sfxEnabled}
                  diagnosticReport={diagnosticReport}
                  onClaimBuildingReward={handleClaimBuildingReward}
                  onAddBonusCoins={(amount) => setCoins((prev) => prev + amount)}
                  onGoToLessons={() => {
                    setActiveTab('home');
                    setHomeSubView('lessons');
                  }}
                  onOpenDiagnostic={() => {
                    setActiveTab('home');
                    setHomeSubView('diagnostic');
                  }}
                />
              )}

              {/* SECTION 3: O‘YINLAR (30-Stage Path) */}
              {activeTab === 'games' && (
                <GamesView
                  sfxEnabled={profile.sfxEnabled}
                  stageProgress={gameStageProgress}
                  onStageComplete={handleGameStageComplete}
                />
              )}

              {/* SECTION 4: KIKI AI */}
              {activeTab === 'chat' && <KikiChatView sfxEnabled={profile.sfxEnabled} />}

              {/* SECTION 5: PROFIL (4 Sub-tabs) */}
              {activeTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  stars={stars}
                  coins={coins}
                  authUser={authUser}
                  activeSubTab={profileSubTab}
                  onChangeSubTab={setProfileSubTab}
                  soundStats={soundStats}
                  weeklyAssessments={weeklyAssessments}
                  sessions={sessions}
                  diagnosticReport={diagnosticReport}
                  onUpdateProfile={handleUpdateProfile}
                  onAssignCustomExercise={handleAssignCustomExercise}
                  onGoToLessons={() => {
                    setActiveTab('home');
                    setHomeSubView('lessons');
                  }}
                  onLogout={handleLogout}
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
                onOpenTournament={() => {
                  setActiveTab('home');
                  setHomeSubView('tournament');
                }}
                onOpenChat={() => setActiveTab('chat')}
              />
            )}
          </div>
        </div>

        {/* Live AI Speech Practice Modal */}
        {selectedNode && (
          <PracticeModal
            key={selectedNode.id}
            node={selectedNode}
            sfxEnabled={profile.sfxEnabled}
            onClose={() => setSelectedNode(null)}
            onWordSuccess={handleWordSuccess}
            onLessonComplete={handleLessonComplete}
          />
        )}
      </div>
    </KikiVoiceProvider>
  );
}

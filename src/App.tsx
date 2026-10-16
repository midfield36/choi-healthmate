import React, { useState } from 'react';
import { Home, Sparkles, ClipboardEdit, TrendingUp, MapPin, Smartphone, FileCode2, Dumbbell, ShieldCheck, Users } from 'lucide-react';
import { HomeTab } from './components/HomeTab';
import { AICoachTab } from './components/AICoachTab';
import { WorkoutLogTab } from './components/WorkoutLogTab';
import { BodyRecordTab } from './components/BodyRecordTab';
import { GymSearchTab } from './components/GymSearchTab';
import { CommunityTab } from './components/CommunityTab';
import { TechSpecViewer } from './components/TechSpecViewer';
import { WorkoutLogItem, WorkoutRoutineResponse, LoggedExercise, BodyRecord, RoutineFeedback } from './types/healthmate';

export default function App() {
  const [viewMode, setViewMode] = useState<'mobile' | 'techSpec'>('mobile');
  const [activeTab, setActiveTab] = useState<'home' | 'aiCoach' | 'workoutLog' | 'bodyRecord' | 'community' | 'gymSearch'>('home');

  // User Profile state (persisted in localStorage)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('healthmate_user_name') || '김헬스';
    } catch {
      return '김헬스';
    }
  });

  const [userLevel, setUserLevel] = useState<string>(() => {
    try {
      return localStorage.getItem('healthmate_user_level') || '초급';
    } catch {
      return '초급';
    }
  });

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    try {
      localStorage.setItem('healthmate_user_name', newName);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateUserLevel = (newLevel: string) => {
    setUserLevel(newLevel);
    try {
      localStorage.setItem('healthmate_user_level', newLevel);
    } catch (e) {
      console.warn(e);
    }
  };

  // Routine feedback state (for AI coaching adaptation loop)
  const [lastFeedback, setLastFeedback] = useState<RoutineFeedback | null>(null);

  const handleSaveFeedback = (feedback: RoutineFeedback) => {
    setLastFeedback(feedback);
  };

  // Initial mock workout data for immediate rich experience
  const [savedLogs, setSavedLogs] = useState<WorkoutLogItem[]>([
    {
      id: 'log_init_1',
      date: '2026-10-14',
      routineTitle: '등 & 이두 당기기 집중 루틴',
      durationMinutes: 48,
      exercises: [
        {
          name: '랫 풀 다운 (머신)',
          sets: [
            { setNumber: 1, weight: 35, reps: 15, completed: true },
            { setNumber: 2, weight: 45, reps: 12, completed: true },
            { setNumber: 3, weight: 50, reps: 10, completed: true },
          ],
        },
        {
          name: '시티드 케이블 로우',
          sets: [
            { setNumber: 1, weight: 35, reps: 12, completed: true },
            { setNumber: 2, weight: 40, reps: 12, completed: true },
            { setNumber: 3, weight: 40, reps: 10, completed: true },
          ],
        },
        {
          name: '이지바 바이셉 컬',
          sets: [
            { setNumber: 1, weight: 15, reps: 12, completed: true },
            { setNumber: 2, weight: 20, reps: 10, completed: true },
          ],
        },
      ],
      memo: '광배근 하부 타깃 자극 훌륭함. 케이블 로우 시 복압 잘 잡힘.',
    },
    {
      id: 'log_init_2',
      date: '2026-10-12',
      routineTitle: '하체 밸런스 기초 루틴',
      durationMinutes: 52,
      exercises: [
        {
          name: '45도 파워 레그 프레스',
          sets: [
            { setNumber: 1, weight: 80, reps: 15, completed: true },
            { setNumber: 2, weight: 120, reps: 12, completed: true },
            { setNumber: 3, weight: 140, reps: 10, completed: true },
          ],
        },
        {
          name: '시티드 레그 익스텐션',
          sets: [
            { setNumber: 1, weight: 30, reps: 15, completed: true },
            { setNumber: 2, weight: 35, reps: 12, completed: true },
          ],
        },
      ],
      memo: '무릎 통증 없이 사두근 고립 완료.',
    },
  ]);

  // Current active workout session state in WorkoutLogTab
  const [currentSession, setCurrentSession] = useState<{
    routineTitle: string;
    exercises: LoggedExercise[];
  }>({
    routineTitle: '가슴 & 삼두 기초 자극 정복',
    exercises: [
      {
        name: '시티드 체스트 프레스 머신',
        sets: [
          { setNumber: 1, weight: 30, reps: 15, completed: true },
          { setNumber: 2, weight: 35, reps: 12, completed: true },
          { setNumber: 3, weight: 40, reps: 10, completed: false },
        ],
      },
      {
        name: '인클라인 덤벨 프레스',
        sets: [
          { setNumber: 1, weight: 12, reps: 12, completed: false },
          { setNumber: 2, weight: 14, reps: 10, completed: false },
          { setNumber: 3, weight: 14, reps: 10, completed: false },
        ],
      },
      {
        name: '케이블 트라이셉스 푸시다운',
        sets: [
          { setNumber: 1, weight: 15, reps: 15, completed: false },
          { setNumber: 2, weight: 20, reps: 12, completed: false },
        ],
      },
    ],
  });

  // Body record initial dataset
  const [bodyRecords, setBodyRecords] = useState<BodyRecord[]>([
    { id: 'b1', date: '2026-09-15', weight: 74.2, skeletalMuscleMass: 32.4, bodyFatPercentage: 19.8 },
    { id: 'b2', date: '2026-09-25', weight: 73.5, skeletalMuscleMass: 32.7, bodyFatPercentage: 19.1 },
    { id: 'b3', date: '2026-10-05', weight: 73.0, skeletalMuscleMass: 33.0, bodyFatPercentage: 18.4 },
    { id: 'b4', date: '2026-10-15', weight: 72.4, skeletalMuscleMass: 33.3, bodyFatPercentage: 17.6 },
  ]);

  // Handler: When user clicks "이 루틴으로 바로 운동 시작하기" in AI Coach
  const handleApplyRoutineToLog = (routine: WorkoutRoutineResponse) => {
    const convertedExercises: LoggedExercise[] = routine.exercises.map((ex) => ({
      name: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: 20,
        reps: 12,
        completed: false,
      })),
    }));

    setCurrentSession({
      routineTitle: routine.routineTitle,
      exercises: convertedExercises,
    });

    setActiveTab('workoutLog');
  };

  const handleSaveLog = (newLog: WorkoutLogItem) => {
    setSavedLogs((prev) => [newLog, ...prev]);
  };

  const handleAddBodyRecord = (newRecord: BodyRecord) => {
    setBodyRecords((prev) => [...prev, newRecord]);
  };

  const handleStartTodayWorkout = () => {
    setActiveTab('workoutLog');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Navigation Header & Mode Switcher */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 font-black flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              헬스메이트 <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">MVP 1차</span>
            </h1>
            <p className="text-[10px] text-neutral-400 hidden sm:block">전국 헬스인을 위한 AI 맞춤 운동 코치 & 통합 관리</p>
          </div>
        </div>

        {/* Mode Selector Toggle: Mobile Simulator vs Technical Specification */}
        <div className="flex items-center bg-neutral-800/90 p-1 rounded-xl border border-neutral-700/60">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">모바일 앱 체험</span>
            <span className="xs:hidden">체험</span>
          </button>
          <button
            onClick={() => setViewMode('techSpec')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'techSpec'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">기술 설계서</span>
            <span className="xs:hidden">설계서</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {viewMode === 'techSpec' ? (
          <TechSpecViewer />
        ) : (
          /* Mobile App Device Simulator Frame */
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 sm:rounded-3xl shadow-2xl flex flex-col h-[820px] max-h-[92vh] overflow-hidden relative">
            {/* Status Bar simulation on mobile */}
            <div className="bg-neutral-950 px-5 pt-3 pb-2 flex justify-between items-center text-[11px] font-semibold text-neutral-400 select-none">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                <div className="w-5 h-2.5 border border-neutral-500 rounded-sm p-0.5 flex items-center">
                  <div className="w-3 h-full bg-emerald-400 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 scrollbar-none">
              {activeTab === 'home' && (
                <HomeTab
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  recentLogs={savedLogs}
                  onStartTodayWorkout={handleStartTodayWorkout}
                  userName={userName}
                  onUpdateUserName={handleUpdateUserName}
                  userLevel={userLevel}
                  onUpdateUserLevel={handleUpdateUserLevel}
                />
              )}

              {activeTab === 'aiCoach' && (
                <AICoachTab
                  onApplyRoutineToLog={handleApplyRoutineToLog}
                  lastFeedback={lastFeedback}
                  onSaveFeedback={handleSaveFeedback}
                />
              )}

              {activeTab === 'workoutLog' && (
                <WorkoutLogTab
                  currentWorkout={currentSession}
                  onSaveLog={handleSaveLog}
                  savedLogs={savedLogs}
                />
              )}

              {activeTab === 'bodyRecord' && (
                <BodyRecordTab records={bodyRecords} onAddRecord={handleAddBodyRecord} />
              )}

              {activeTab === 'community' && (
                <CommunityTab userName={userName} userLevel={userLevel} />
              )}

              {activeTab === 'gymSearch' && <GymSearchTab />}
            </div>

            {/* Bottom Navigation Tabs: 6 Core Modules */}
            <nav className="absolute bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 px-1 py-1.5 z-30">
              <div className="grid grid-cols-6 gap-0.5">
                {/* 1. 홈 */}
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Home className="w-4.5 h-4.5 mb-0.5" />
                  <span className="text-[9.5px]">홈</span>
                </button>

                {/* 2. AI 코치 */}
                <button
                  onClick={() => setActiveTab('aiCoach')}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'aiCoach' ? 'text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Sparkles className="w-4.5 h-4.5 mb-0.5" />
                  <span className="text-[9.5px]">AI 코치</span>
                </button>

                {/* 3. 일지/분석 */}
                <button
                  onClick={() => setActiveTab('workoutLog')}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'workoutLog' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ClipboardEdit className="w-4.5 h-4.5 mb-0.5" />
                  <span className="text-[9.5px]">일지/분석</span>
                </button>

                {/* 4. 신체변화 */}
                <button
                  onClick={() => setActiveTab('bodyRecord')}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'bodyRecord' ? 'text-blue-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <TrendingUp className="w-4.5 h-4.5 mb-0.5" />
                  <span className="text-[9.5px]">신체변화</span>
                </button>

                {/* 5. 커뮤니티 */}
                <button
                  onClick={() => setActiveTab('community')}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'community' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Users className="w-4.5 h-4.5 mb-0.5" />
                  <span className="text-[9.5px]">커뮤니티</span>
                </button>

                {/* 6. 헬스장 */}
                <button
                  onClick={() => setActiveTab('gymSearch')}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'gymSearch' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <MapPin className="w-4.5 h-4.5 mb-0.5" />
                  <span className="text-[9.5px]">헬스장</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, Trash2, Save, Play, Pause, RotateCcw, Calendar, History, Dumbbell, BarChart3, TrendingUp, Award, ArrowUpRight, Flame } from 'lucide-react';
import { WorkoutLogItem, LoggedExercise, WorkoutSet } from '../types/healthmate';

interface WorkoutLogTabProps {
  currentWorkout: {
    routineTitle: string;
    exercises: LoggedExercise[];
  };
  onSaveLog: (log: WorkoutLogItem) => void;
  savedLogs: WorkoutLogItem[];
}

export const WorkoutLogTab: React.FC<WorkoutLogTabProps> = ({
  currentWorkout,
  onSaveLog,
  savedLogs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'session' | 'analytics' | 'history'>('session');
  const [routineTitle, setRoutineTitle] = useState(currentWorkout.routineTitle || '오늘의 자유 운동');
  const [exercises, setExercises] = useState<LoggedExercise[]>(currentWorkout.exercises);
  const [memo, setMemo] = useState('');

  // Synchronize when currentWorkout changes (e.g. sent from AI Coach)
  useEffect(() => {
    if (currentWorkout.exercises.length > 0) {
      setRoutineTitle(currentWorkout.routineTitle);
      setExercises(currentWorkout.exercises);
    }
  }, [currentWorkout]);

  // Workout Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Rest Timer state
  const [restSeconds, setRestSeconds] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);

  // Analytics states
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('시티드 체스트 프레스');
  const [analyticsMetric, setAnalyticsMetric] = useState<'weight' | 'volume'>('weight');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'1m' | '3m' | 'all'>('1m');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    let restInterval: any = null;
    if (isRestActive && restSeconds > 0) {
      restInterval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0 && isRestActive) {
      setIsRestActive(false);
    }
    return () => clearInterval(restInterval);
  }, [isRestActive, restSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setIsRestActive(true);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    const next = [...exercises];
    const targetSet = next[exIdx].sets[setIdx];
    targetSet.completed = !targetSet.completed;
    setExercises(next);

    if (targetSet.completed) {
      startRestTimer(60);
    }
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', val: number) => {
    const next = [...exercises];
    next[exIdx].sets[setIdx][field] = val;
    setExercises(next);
  };

  const handleAddSet = (exIdx: number) => {
    const next = [...exercises];
    const currentSets = next[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1];
    next[exIdx].sets.push({
      setNumber: currentSets.length + 1,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 12,
      completed: false,
    });
    setExercises(next);
  };

  const handleDeleteSet = (exIdx: number, setIdx: number) => {
    const next = [...exercises];
    next[exIdx].sets.splice(setIdx, 1);
    next[exIdx].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setExercises(next);
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '새 운동 종목',
        sets: [
          { setNumber: 1, weight: 20, reps: 12, completed: false },
          { setNumber: 2, weight: 20, reps: 12, completed: false },
          { setNumber: 3, weight: 20, reps: 12, completed: false },
        ],
      },
    ]);
  };

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveWorkout = () => {
    const durationMin = Math.max(1, Math.round(timerSeconds / 60)) || 45;
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: WorkoutLogItem = {
      id: 'log_' + Date.now(),
      date: todayStr,
      routineTitle,
      durationMinutes: durationMin,
      exercises,
      memo: memo.trim() || undefined,
    };
    onSaveLog(newLog);
    setSavedSuccess(true);
    setIsTimerRunning(false);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveSubTab('history');
    }, 1200);
  };

  // Mock progress dataset for exercise growth charts
  const exerciseGrowthData: Record<string, { date: string; maxWeight: number; totalVolume: number }[]> = {
    '시티드 체스트 프레스': [
      { date: '09/18', maxWeight: 35, totalVolume: 1260 },
      { date: '09/25', maxWeight: 40, totalVolume: 1440 },
      { date: '10/02', maxWeight: 42.5, totalVolume: 1530 },
      { date: '10/09', maxWeight: 45, totalVolume: 1620 },
      { date: '10/16', maxWeight: 50, totalVolume: 1850 },
    ],
    '랫 풀 다운': [
      { date: '09/18', maxWeight: 35, totalVolume: 1350 },
      { date: '09/25', maxWeight: 40, totalVolume: 1500 },
      { date: '10/02', maxWeight: 45, totalVolume: 1680 },
      { date: '10/09', maxWeight: 50, totalVolume: 1800 },
      { date: '10/16', maxWeight: 55, totalVolume: 2050 },
    ],
    '45도 레그 프레스': [
      { date: '09/18', maxWeight: 100, totalVolume: 3600 },
      { date: '09/25', maxWeight: 120, totalVolume: 4320 },
      { date: '10/02', maxWeight: 130, totalVolume: 4680 },
      { date: '10/09', maxWeight: 140, totalVolume: 5100 },
      { date: '10/16', maxWeight: 160, totalVolume: 5800 },
    ],
  };

  const currentChartPoints = exerciseGrowthData[selectedExerciseName] || exerciseGrowthData['시티드 체스트 프레스'];
  const chartValues = currentChartPoints.map((p) =>
    analyticsMetric === 'weight' ? p.maxWeight : p.totalVolume
  );

  const minVal = Math.min(...chartValues) * 0.9;
  const maxVal = Math.max(...chartValues) * 1.1;
  const range = maxVal - minVal || 1;

  const chartWidth = 320;
  const chartHeight = 130;
  const paddingX = 25;
  const paddingY = 20;

  const svgPoints = currentChartPoints.map((p, i) => {
    const val = analyticsMetric === 'weight' ? p.maxWeight : p.totalVolume;
    const x = paddingX + (i / Math.max(currentChartPoints.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minVal) / range) * (chartHeight - paddingY * 2);
    return { x, y, val, date: p.date };
  });

  const pathD = svgPoints.length > 0
    ? `M ${svgPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const initialVal = chartValues[0];
  const latestVal = chartValues[chartValues.length - 1];
  const growthRate = (((latestVal - initialVal) / initialVal) * 100).toFixed(1);

  return (
    <div className="space-y-4 pb-8">
      {/* 3 Sub-tabs: Session vs Analytics vs History */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('session')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'session'
              ? 'bg-emerald-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          운동 진행
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'analytics'
              ? 'bg-emerald-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          성과 분석
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'history'
              ? 'bg-emerald-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          히스토리
        </button>
      </div>

      {/* VIEW 1: Ongoing Workout Session */}
      {activeSubTab === 'session' && (
        <div className="space-y-4">
          {/* Workout Timer & Rest Timer Bar */}
          <div className="grid grid-cols-2 gap-3">
            {/* Stopwatch */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] text-neutral-400 font-medium">운동 진행 시간</span>
              <div className="text-2xl font-black text-white font-mono my-1">
                {formatTime(timerSeconds)}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500 text-neutral-950 font-bold'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-neutral-950" />}
                  {isTimerRunning ? '일시정지' : '시작'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="p-1 px-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 rounded-lg text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Rest Countdown */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-neutral-400 font-medium">세트 간 휴식</span>
                {isRestActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div
                className={`text-2xl font-black font-mono my-1 ${
                  isRestActive ? 'text-emerald-400' : 'text-neutral-500'
                }`}
              >
                {formatTime(restSeconds)}
              </div>
              <div className="flex gap-1 pt-1">
                {[30, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startRestTimer(sec)}
                    className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-semibold cursor-pointer"
                  >
                    {sec}초
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Routine Title Input */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5">
            <label className="text-[11px] text-neutral-400 font-semibold block mb-1">
              오늘의 운동 루틴 명칭
            </label>
            <input
              type="text"
              value={routineTitle}
              onChange={(e) => setRoutineTitle(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Exercises & Sets */}
          <div className="space-y-3">
            {exercises.map((ex, exIdx) => (
              <div
                key={exIdx}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      {exIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => {
                        const next = [...exercises];
                        next[exIdx].name = e.target.value;
                        setExercises(next);
                      }}
                      className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-neutral-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const next = [...exercises];
                      next.splice(exIdx, 1);
                      setExercises(next);
                    }}
                    className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-neutral-400 px-1">
                  <div className="col-span-2 text-center">세트</div>
                  <div className="col-span-4 text-center">무게(kg)</div>
                  <div className="col-span-4 text-center">반복(회)</div>
                  <div className="col-span-2 text-center">완료</div>
                </div>

                {/* Set Rows */}
                <div className="space-y-2">
                  {ex.sets.map((s, sIdx) => (
                    <div
                      key={sIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors ${
                        s.completed ? 'bg-emerald-950/20 border border-emerald-800/40' : 'bg-neutral-800/60'
                      }`}
                    >
                      <div className="col-span-2 text-center text-xs font-bold text-neutral-300">
                        {s.setNumber}
                      </div>

                      <div className="col-span-4">
                        <input
                          type="number"
                          value={s.weight}
                          onChange={(e) =>
                            handleUpdateSet(exIdx, sIdx, 'weight', Number(e.target.value))
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-center text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="col-span-4">
                        <input
                          type="number"
                          value={s.reps}
                          onChange={(e) =>
                            handleUpdateSet(exIdx, sIdx, 'reps', Number(e.target.value))
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-center text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSet(exIdx, sIdx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            s.completed
                              ? 'bg-emerald-500 text-neutral-950 font-black'
                              : 'bg-neutral-700/80 hover:bg-neutral-600 text-neutral-400'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> 세트 추가
                  </button>
                  {ex.sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSet(exIdx, ex.sets.length - 1)}
                      className="text-neutral-500 hover:text-red-400 text-[11px] cursor-pointer"
                    >
                      마지막 세트 삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Exercise Button */}
          <button
            type="button"
            onClick={handleAddExercise}
            className="w-full py-2.5 border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 새로운 운동 종목 추가
          </button>

          {/* Memo Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5">
            <label className="text-[11px] text-neutral-400 font-semibold block mb-1">
              오늘 운동 메모 & 피드백
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 벤치프레스 60kg 성공, 오른쪽 어깨 워밍업에 더 신경쓸 것"
              rows={2}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Save Workout Button */}
          <button
            type="button"
            onClick={handleSaveWorkout}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-neutral-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {savedSuccess ? '운동 일지 저장 완료!' : '오늘 운동 완료 및 일지 저장'}
          </button>
        </div>
      )}

      {/* VIEW 2: Analytics & Exercise-specific Growth Charts */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4">
          {/* Multi-Period Volume Comparison Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                주간 운동 성과 비교 (이번 주 vs 지난 주)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +12.4% 성장 중
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-750">
                <span className="text-[10px] text-neutral-400 block mb-0.5">주간 총 볼륨</span>
                <div className="text-base font-black text-white">18,450 kg</div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 지난주 대비 +1,850kg
                </span>
              </div>
              <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-750">
                <span className="text-[10px] text-neutral-400 block mb-0.5">완료 세트 수</span>
                <div className="text-base font-black text-white">54 세트</div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 지난주 대비 +6세트
                </span>
              </div>
              <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-750">
                <span className="text-[10px] text-neutral-400 block mb-0.5">총 운동 시간</span>
                <div className="text-base font-black text-white">215 분</div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 지난주 대비 +25분
                </span>
              </div>
              <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-750">
                <span className="text-[10px] text-neutral-400 block mb-0.5">주간 출석률</span>
                <div className="text-base font-black text-white">4일 / 4일</div>
                <span className="text-[10px] text-orange-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  <Flame className="w-3 h-3" /> 목표 100% 달성
                </span>
              </div>
            </div>
          </div>

          {/* Exercise-Specific Growth Chart Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white">종목별 성장 추이 그래프</h4>
                <p className="text-[10px] text-neutral-400">선택한 종목의 무게 및 볼륨 발전선</p>
              </div>

              {/* Metric & Period Toggle */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <div className="flex bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
                  <button
                    onClick={() => setAnalyticsMetric('weight')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      analyticsMetric === 'weight'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    최고 중량
                  </button>
                  <button
                    onClick={() => setAnalyticsMetric('volume')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      analyticsMetric === 'volume'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    총 볼륨
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise Selection Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['시티드 체스트 프레스', '랫 풀 다운', '45도 레그 프레스'].map((exName) => (
                <button
                  key={exName}
                  onClick={() => setSelectedExerciseName(exName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedExerciseName === exName
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  {exName}
                </button>
              ))}
            </div>

            {/* Growth Stat Banner */}
            <div className="flex items-center justify-between bg-neutral-800/50 p-2.5 rounded-xl text-xs">
              <span className="text-neutral-300 font-medium">
                {selectedExerciseName} 성장률
              </span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">
                  {initialVal}{analyticsMetric === 'weight' ? 'kg' : 'kg·rep'} → <strong className="text-white">{latestVal}{analyticsMetric === 'weight' ? 'kg' : 'kg·rep'}</strong>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                  +{growthRate}% ▲
                </span>
              </div>
            </div>

            {/* SVG Interactive Line Chart */}
            <div className="w-full flex justify-center py-2">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 overflow-visible">
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#2e2e2e" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#2e2e2e" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#3e3e3e" />

                {/* Area under curve */}
                {svgPoints.length > 0 && (
                  <path
                    d={`${pathD} L ${svgPoints[svgPoints.length - 1].x},${chartHeight - paddingY} L ${svgPoints[0].x},${chartHeight - paddingY} Z`}
                    fill="url(#growthGradient)"
                  />
                )}

                {/* Path line */}
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data dots */}
                {svgPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#171717" strokeWidth="2" />
                    <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                      {p.val}
                    </text>
                    <text x={p.x} y={chartHeight - 4} textAnchor="middle" fill="#888" fontSize="8">
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Muscle Split Volume Distribution */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-neutral-300 block">
              부위별 세트 볼륨 밸런스 (최근 7일)
            </span>
            {[
              { label: '가슴 (Chest)', percent: 32, sets: '17세트', color: 'bg-emerald-500' },
              { label: '등 (Back)', percent: 28, sets: '15세트', color: 'bg-purple-500' },
              { label: '하체 (Legs)', percent: 25, sets: '14세트', color: 'bg-blue-500' },
              { label: '어깨/팔 (Shoulders/Arms)', percent: 15, sets: '8세트', color: 'bg-amber-500' },
            ].map((part) => (
              <div key={part.label} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-300">{part.label}</span>
                  <span className="text-neutral-400 font-semibold">{part.sets} ({part.percent}%)</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full ${part.color} rounded-full`} style={{ width: `${part.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Past History Log List */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-300">저장된 운동 일지 히스토리</span>
            <span className="text-xs text-neutral-500">총 {savedLogs.length}회 완료</span>
          </div>

          {savedLogs.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 text-xs">
              기록된 운동일지가 없습니다. 첫 운동을 완료해보세요!
            </div>
          ) : (
            savedLogs.map((log) => {
              const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
              const completedSets = log.exercises.reduce(
                (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
                0
              );
              return (
                <div
                  key={log.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-neutral-400">{log.date}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {log.durationMinutes}분 소요
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{log.routineTitle}</h4>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400">
                      {completedSets} / {totalSets} 세트 완수
                    </span>
                  </div>

                  <div className="bg-neutral-800/60 rounded-xl p-3 space-y-2">
                    {log.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="flex justify-between text-xs">
                        <span className="text-neutral-300 font-medium">
                          {ex.name} ({ex.sets.length}세트)
                        </span>
                        <span className="text-neutral-400">
                          {ex.sets.map((s) => `${s.weight}kg×${s.reps}`).join(' · ')}
                        </span>
                      </div>
                    ))}
                    {log.memo && (
                      <div className="text-[11px] text-neutral-400 italic pt-2 border-t border-neutral-700/60">
                        💬 "{log.memo}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

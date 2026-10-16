import React, { useState } from 'react';
import { Sparkles, Dumbbell, ShieldAlert, ChevronDown, ChevronUp, RotateCcw, CheckCircle, ArrowRight, Play, Info, Video, ExternalLink, Star, ThumbsUp, AlertTriangle, MessageSquare, History } from 'lucide-react';
import { UserLevel, WorkoutGoal, WorkoutPlace, WorkoutRoutineResponse, RoutineFeedback, ExerciseDetail } from '../types/healthmate';
import { generateAIWorkoutRoutine } from '../services/geminiCoach';

interface AICoachTabProps {
  onApplyRoutineToLog: (routine: WorkoutRoutineResponse) => void;
  lastFeedback?: RoutineFeedback | null;
  onSaveFeedback: (feedback: RoutineFeedback) => void;
}

export const AICoachTab: React.FC<AICoachTabProps> = ({
  onApplyRoutineToLog,
  lastFeedback,
  onSaveFeedback,
}) => {
  // Input states
  const [level, setLevel] = useState<UserLevel>('beginner');
  const [goal, setGoal] = useState<WorkoutGoal>('hypertrophy');
  const [place, setPlace] = useState<WorkoutPlace>('gym');
  const [targetSplit, setTargetSplit] = useState<string>('가슴/삼두');
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [limitations, setLimitations] = useState<string>('');

  // Deep Personalization states
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(['어깨 회전근개', '손목 관절']);
  const [equipmentPreference, setEquipmentPreference] = useState<string>('머신 위주(안전 고립)');
  const [selectedAvoids, setSelectedAvoids] = useState<string[]>(['딥스 제외']);
  const [syncPastHistory, setSyncPastHistory] = useState<boolean>(true);

  // Execution states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutineResponse | null>(null);
  const [expandedGuideIndex, setExpandedGuideIndex] = useState<number | null>(0);
  const [appliedMessage, setAppliedMessage] = useState<boolean>(false);

  // Video & Detailed Guide Modal State
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<ExerciseDetail | null>(null);

  // Feedback Form State (for completing routine)
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackDifficulty, setFeedbackDifficulty] = useState<'too_easy' | 'just_right' | 'too_hard'>('just_right');
  const [feedbackSatisfaction, setFeedbackSatisfaction] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSavedToast, setFeedbackSavedToast] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setAppliedMessage(false);
    try {
      const result = await generateAIWorkoutRoutine({
        level,
        goal,
        place,
        targetSplit,
        durationMinutes,
        limitations: limitations.trim() || undefined,
        lastFeedback,
        injuryHistory: selectedInjuries.filter((i) => i !== '건강 (부상 없음)'),
        equipmentPreference,
        avoidEquipments: selectedAvoids,
        pastWorkoutSummary: syncPastHistory
          ? '최근 3회: 체스트프레스(45kg) 완료, 랫풀다운(50kg) 완료, 주간 누적 18,450kg 달성'
          : undefined,
      });
      setGeneratedRoutine(result);
      setExpandedGuideIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToWorkout = () => {
    if (generatedRoutine) {
      onApplyRoutineToLog(generatedRoutine);
      setAppliedMessage(true);
      setTimeout(() => setAppliedMessage(false), 2500);
    }
  };

  const handleOpenVideoSearch = (exercise: ExerciseDetail) => {
    const query = exercise.videoSearchQuery || `${exercise.name} 올바른 자세 꿀팁`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedRoutine) return;

    const newFeedback: RoutineFeedback = {
      id: 'fb_' + Date.now(),
      routineTitle: generatedRoutine.routineTitle,
      difficulty: feedbackDifficulty,
      satisfaction: feedbackSatisfaction,
      feedbackText: feedbackText.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    onSaveFeedback(newFeedback);
    setShowFeedbackModal(false);
    setFeedbackSavedToast(true);
    setTimeout(() => setFeedbackSavedToast(false), 3000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/60 via-neutral-900 to-neutral-900 border border-purple-800/40 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI 맞춤 운동 코치</h2>
              <p className="text-xs text-neutral-400">자세 영상 가이드 & 피드백 기반 자동 보정</p>
            </div>
          </div>
          {lastFeedback && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              ✓ 피드백 반영 모드
            </span>
          )}
        </div>
      </div>

      {/* Active Feedback Loop Reminder Banner */}
      {lastFeedback && (
        <div className="bg-neutral-900/90 border border-purple-500/40 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">최근 운동 피드백 반영 활성화됨</span>
              <span className="text-[10px] text-neutral-400">{lastFeedback.date}</span>
            </div>
            <p className="text-neutral-300 text-[11px] mt-0.5">
              체감 난이도: <strong className="text-purple-300">{lastFeedback.difficulty === 'too_easy' ? '너무 쉬움 (강도 상향)' : lastFeedback.difficulty === 'too_hard' ? '너무 힘듦 (피로도 완화)' : '적당함'}</strong>
              {lastFeedback.feedbackText && ` · "${lastFeedback.feedbackText}"`}
            </p>
          </div>
        </div>
      )}

      {/* Input Form Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        {/* 1. 수준 선택 */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-2">
            1. 나의 운동 수준
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'beginner', label: '초급자', desc: '머신/자세 위주' },
              { id: 'intermediate', label: '중급자', desc: '타깃 근비대' },
              { id: 'advanced', label: '상급자', desc: '고중량 과부하' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLevel(item.id as UserLevel)}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  level === item.id
                    ? 'bg-purple-600/25 border-purple-500 text-white shadow-sm'
                    : 'bg-neutral-800/60 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 운동 목적 */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-2">2. 운동 목적</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'hypertrophy', label: '근비대 (벌크업)', icon: '💪' },
              { id: 'fat_loss', label: '체지방 감소 (다이어트)', icon: '🔥' },
              { id: 'strength', label: '근력 & 스트렝스 향상', icon: '🏋️' },
              { id: 'rehab', label: '체형 교정 & 기초 재활', icon: '🧘' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGoal(item.id as WorkoutGoal)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  goal === item.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-neutral-800/60 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 운동 장소 & 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-2">3. 운동 장소</label>
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value as WorkoutPlace)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="gym">피트니스 센터 (헬스장)</option>
              <option value="home">홈트레이닝 (맨몸/덤벨)</option>
              <option value="outdoor">야외/공원 (철봉)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-2">4. 희망 시간</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value={30}>30분 (고밀도 집중)</option>
              <option value={50}>50분 (표준 전신/분할)</option>
              <option value={75}>75분 (충분한 볼륨)</option>
            </select>
          </div>
        </div>

        {/* 4. 분할 부위 선택 */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-2">5. 오늘 집중할 부위</label>
          <div className="flex flex-wrap gap-1.5">
            {['가슴/삼두', '등/이두', '하체/엉덩이', '어깨/복근', '전신 서킷'].map((split) => (
              <button
                key={split}
                type="button"
                onClick={() => setTargetSplit(split)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  targetSplit === split
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                {split}
              </button>
            ))}
          </div>
        </div>

        {/* 5. 부상 및 신체 제약사항 */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            부상 이력 및 관절 보호 부위 (다중 선택)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              '어깨 회전근개',
              '허리 요추 디스크',
              '손목 관절',
              '무릎 연골',
              '팔꿈치 엘보',
              '건강 (부상 없음)',
            ].map((inj) => {
              const isSelected = selectedInjuries.includes(inj);
              return (
                <button
                  key={inj}
                  type="button"
                  onClick={() => {
                    if (inj === '건강 (부상 없음)') {
                      setSelectedInjuries(isSelected ? [] : ['건강 (부상 없음)']);
                    } else {
                      const filtered = selectedInjuries.filter((i) => i !== '건강 (부상 없음)');
                      setSelectedInjuries(
                        isSelected ? filtered.filter((i) => i !== inj) : [...filtered, inj]
                      );
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-xs'
                      : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {inj}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
            placeholder="기타 특이사항 (예: 쇄골 수술 이력, 오른쪽 고관절 가동 범위 제한)"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* 6. 기구 선호도 & 기피 운동 */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-3">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              6. 선호 기구 구성
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['머신 위주(안전 고립)', '프리웨이트(바벨/덤벨)', '케이블 머신 위주'].map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setEquipmentPreference(pref)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    equipmentPreference === pref
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                      : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              기피/제외하고 싶은 운동 (루틴에서 배제)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['딥스 제외', '바벨 백스쿼트 제외', '비하인드 넥프레스 제외', '루마니안 데드리프트 제외'].map((avoid) => {
                const isAvoided = selectedAvoids.includes(avoid);
                return (
                  <button
                    key={avoid}
                    type="button"
                    onClick={() => {
                      setSelectedAvoids(
                        isAvoided ? selectedAvoids.filter((a) => a !== avoid) : [...selectedAvoids, avoid]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                      isAvoided
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {isAvoided ? `✕ ${avoid}` : `+ ${avoid}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Past History Sync Toggle */}
          <div className="bg-neutral-850 p-2.5 rounded-xl border border-neutral-750 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">과거 운동 기록 AI 학습 연동</span>
              <span className="text-[10px] text-neutral-400">최근 3회 운동 볼륨(18,450kg) 및 중량 데이터를 분석하여 점진적 과부하 반영</span>
            </div>
            <input
              type="checkbox"
              checked={syncPastHistory}
              onChange={(e) => setSyncPastHistory(e.target.checked)}
              className="w-4 h-4 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Gemini AI 코치가 피드백을 반영하여 설계 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>AI 맞춤 운동 프로그램 생성하기</span>
            </>
          )}
        </button>
      </div>

      {feedbackSavedToast && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>피드백이 저장되었습니다! 다음 AI 추천 시 볼륨과 강도에 자동 반영됩니다.</span>
        </div>
      )}

      {/* Generated Routine Output */}
      {generatedRoutine && (
        <div className="space-y-4 pt-2">
          {/* Header Card */}
          <div className="bg-neutral-900 border border-purple-700/50 rounded-2xl p-4 relative overflow-hidden shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {generatedRoutine.targetLevel === 'beginner' ? '초급자 전용' : generatedRoutine.targetLevel === 'intermediate' ? '중급자 맞춤' : '상급자 프로그램'}
              </span>
              <span className="text-xs text-neutral-400">
                총 {generatedRoutine.estimatedDurationMinutes}분 소요
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{generatedRoutine.routineTitle}</h3>
            <p className="text-xs text-neutral-300 leading-relaxed mb-2">{generatedRoutine.summary}</p>

            {/* AI Adaptation Note (if feedback was reflected) */}
            {generatedRoutine.aiAdaptationNote && (
              <div className="bg-purple-950/40 border border-purple-600/40 rounded-xl p-2.5 text-[11px] text-purple-200 leading-relaxed flex items-start gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{generatedRoutine.aiAdaptationNote}</span>
              </div>
            )}

            {/* Actions: Start Today's Workout + Feedback Button */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleApplyToWorkout}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-neutral-950" />
                이 루틴으로 바로 오늘 운동 시작하기 (운동일지 복사)
              </button>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="수행 후 난이도 피드백 남기기"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                운동 피드백 남기기
              </button>
            </div>
            {appliedMessage && (
              <div className="mt-2 text-center text-xs text-emerald-400 font-semibold animate-pulse">
                ✓ 운동일지에 해당 루틴의 종목과 세트가 세팅되었습니다!
              </div>
            )}
          </div>

          {/* Warm-Up Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🔥 본운동 전 웜업 & 동적 스트레칭</span>
            </h4>
            <ul className="space-y-1.5">
              {generatedRoutine.warmUp.map((w, idx) => (
                <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-bold text-neutral-200">
                본운동 프로그램 ({generatedRoutine.exercises.length}개 종목)
              </h4>
              <span className="text-[11px] text-neutral-400">자세 영상 가이드 제공</span>
            </div>

            {generatedRoutine.exercises.map((exercise, idx) => {
              const isExpanded = expandedGuideIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="text-sm font-bold text-white">{exercise.name}</h5>
                      </div>
                      <span className="text-[11px] text-purple-400 font-medium">
                        타깃: {exercise.targetMuscle}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        {exercise.sets}세트 × {exercise.reps}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        세트 간 휴식 {exercise.restSeconds}초
                      </div>
                    </div>
                  </div>

                  {/* Equipment & Video Quick Action Bar */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-neutral-300 font-medium flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-neutral-400" />
                      기구: {exercise.equipment}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Video Guide Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedExerciseForModal(exercise)}
                        className="px-2 py-1 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="자세 가이드 & 영상 보기"
                      >
                        <Video className="w-3 h-3" />
                        자세 영상 가이드
                      </button>

                      {/* Accordion trigger */}
                      <button
                        type="button"
                        onClick={() => setExpandedGuideIndex(isExpanded ? null : idx)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 font-semibold cursor-pointer"
                      >
                        {isExpanded ? '가이드 접기' : '상세 보기'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Guide Card */}
                  {isExpanded && (
                    <div className="mt-3 bg-neutral-800/70 border border-neutral-750 rounded-xl p-3 space-y-2.5 text-xs">
                      <div>
                        <span className="font-bold text-emerald-400 block mb-1">
                          📌 초보자 기구 세팅법:
                        </span>
                        <p className="text-neutral-300 leading-relaxed text-[11px]">
                          {exercise.equipmentGuide}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-neutral-200 block mb-1">
                          💡 핵심 자세 & 호흡 팁:
                        </span>
                        <ul className="space-y-1 text-neutral-300 text-[11px]">
                          {exercise.executionTips.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5">
                              <span className="text-purple-400 font-bold">-</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Step by step preview */}
                      {exercise.stepGuide && exercise.stepGuide.length > 0 && (
                        <div className="pt-2 border-t border-neutral-700/60">
                          <span className="font-bold text-amber-400 block mb-1.5">
                            📋 3단계 수행 가이드:
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {exercise.stepGuide.map((sg) => (
                              <div key={sg.step} className="bg-neutral-850 p-2 rounded-lg text-[11px]">
                                <span className="font-bold text-neutral-200 mr-1.5">
                                  {sg.step}단계 ({sg.title}):
                                </span>
                                <span className="text-neutral-400">{sg.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Common mistakes */}
                      {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                        <div className="pt-2 border-t border-neutral-700/60">
                          <span className="font-bold text-red-400 block mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            초보자 주의 실수:
                          </span>
                          <ul className="space-y-0.5 text-neutral-400 text-[11px]">
                            {exercise.commonMistakes.map((cm, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1">
                                <span className="text-red-400 font-bold">✕</span>
                                <span>{cm}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {exercise.alternativeExercise && (
                        <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-700/60">
                          <span className="font-semibold text-neutral-300">대체 운동: </span>
                          {exercise.alternativeExercise}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cool-Down Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🧘 본운동 후 쿨다운 & 스트레칭</span>
            </h4>
            <ul className="space-y-1.5">
              {generatedRoutine.coolDown.map((c, idx) => (
                <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Video & Posture Detailed Modal */}
      {selectedExerciseForModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {selectedExerciseForModal.targetMuscle}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedExerciseForModal.name} 자세 가이드
                </h3>
              </div>
              <button
                onClick={() => setSelectedExerciseForModal(null)}
                className="text-neutral-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Video Search Callout Card */}
            <div className="bg-gradient-to-br from-red-950/30 to-neutral-850 border border-red-600/40 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <Video className="w-4 h-4" />
                <span>유튜브 정확한 자세 영상 바로보기</span>
              </div>
              <p className="text-neutral-300 text-xs leading-relaxed">
                검증된 피트니스 전문가의 올바른 기구 세팅 궤적과 부상 방지 팁을 유튜브 고화질 영상으로 즉시 확인하세요.
              </p>
              <button
                onClick={() => handleOpenVideoSearch(selectedExerciseForModal)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition cursor-pointer"
              >
                <span>YouTube에서 "{selectedExerciseForModal.videoSearchQuery || selectedExerciseForModal.name}" 영상 재생</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step-by-Step Posture Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-300">단계별 정확한 수행 가이드</h4>
              {selectedExerciseForModal.stepGuide && selectedExerciseForModal.stepGuide.length > 0 ? (
                selectedExerciseForModal.stepGuide.map((sg) => (
                  <div key={sg.step} className="bg-neutral-800/70 border border-neutral-750 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                        {sg.step}
                      </span>
                      <span className="text-xs font-bold text-white">{sg.title}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed pl-7">{sg.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-neutral-800/70 p-3 rounded-xl text-xs text-neutral-300">
                  {selectedExerciseForModal.equipmentGuide}
                </div>
              )}
            </div>

            {/* Mistakes & Safety Warnings */}
            {selectedExerciseForModal.commonMistakes && (
              <div className="bg-neutral-850 border border-neutral-750 p-3 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  초보자가 자주 하는 위험한 자세 (주의)
                </span>
                <ul className="space-y-1 text-xs text-neutral-400">
                  {selectedExerciseForModal.commonMistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelectedExerciseForModal(null)}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Routine Feedback & Adaptation Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">운동 난이도 & 만족도 피드백</h3>
                  <p className="text-[11px] text-neutral-400">다음 AI 루틴 설계에 즉시 반영됩니다</p>
                </div>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-neutral-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* Difficulty selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  체감 운동 난이도는 어떠셨나요?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'too_easy', label: '너무 쉬움', sub: '강도 올림' },
                    { id: 'just_right', label: '딱 적당함', sub: '현 상태 유지' },
                    { id: 'too_hard', label: '너무 힘듦', sub: '피로도 완화' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeedbackDifficulty(item.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        feedbackDifficulty === item.id
                          ? 'bg-purple-600/30 border-purple-500 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Satisfaction */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  루틴 구성 만족도
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackSatisfaction(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackSatisfaction
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-1">
                    {feedbackSatisfaction}점 / 5점
                  </span>
                </div>
              </div>

              {/* Text feedback */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  추가 피드백 (선택)
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="예: 어깨에 약간 뻐근함이 있었어요, 벤치프레스는 세트를 늘려도 될 것 같아요"
                  rows={2}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  피드백 제출 및 반영
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

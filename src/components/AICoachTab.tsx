import React, { useState } from 'react';
import { Sparkles, Dumbbell, ShieldAlert, ChevronDown, ChevronUp, RotateCcw, CheckCircle, ArrowRight, Play, Info } from 'lucide-react';
import { UserLevel, WorkoutGoal, WorkoutPlace, WorkoutRoutineResponse } from '../types/healthmate';
import { generateAIWorkoutRoutine } from '../services/geminiCoach';

interface AICoachTabProps {
  onApplyRoutineToLog: (routine: WorkoutRoutineResponse) => void;
}

export const AICoachTab: React.FC<AICoachTabProps> = ({ onApplyRoutineToLog }) => {
  // Input states
  const [level, setLevel] = useState<UserLevel>('beginner');
  const [goal, setGoal] = useState<WorkoutGoal>('hypertrophy');
  const [place, setPlace] = useState<WorkoutPlace>('gym');
  const [targetSplit, setTargetSplit] = useState<string>('가슴/삼두');
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [limitations, setLimitations] = useState<string>('');

  // Execution states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutineResponse | null>(null);
  const [expandedGuideIndex, setExpandedGuideIndex] = useState<number | null>(0);
  const [appliedMessage, setAppliedMessage] = useState<boolean>(false);

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

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/60 via-neutral-900 to-neutral-900 border border-purple-800/40 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI 맞춤 운동 코치</h2>
            <p className="text-xs text-neutral-400">Google AI Studio Gemini 기반 맞춤 루틴 설계</p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        {/* 1. 수준 선택 */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-2">
            1. 나의 운동 수준 (난이도 및 기구 숙련도)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'beginner', label: '초급자', desc: '0~6개월 머신 위주' },
              { id: 'intermediate', label: '중급자', desc: '6개월~2년 자극 위주' },
              { id: 'advanced', label: '상급자', desc: '2년+ 고중량 과부하' },
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
            신체 특이사항 / 주의 부위 (선택)
          </label>
          <input
            type="text"
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
            placeholder="예: 허리 디스크 초기 증상, 오른쪽 손목 불편"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
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
              <span>Gemini AI 코치가 루틴을 조율 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>AI 맞춤 운동 프로그램 생성하기</span>
            </>
          )}
        </button>
      </div>

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
            <p className="text-xs text-neutral-300 leading-relaxed">{generatedRoutine.summary}</p>

            {/* Apply Action */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={handleApplyToWorkout}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-neutral-950" />
                이 루틴으로 바로 오늘 운동 시작하기 (운동일지 복사)
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
              <span className="text-[11px] text-neutral-400">기구 사용법 터치하여 확인</span>
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

                  {/* Equipment summary & Accordion trigger */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-medium flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-neutral-400" />
                      기구: {exercise.equipment}
                    </span>
                    <button
                      onClick={() => setExpandedGuideIndex(isExpanded ? null : idx)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 font-semibold cursor-pointer"
                    >
                      {isExpanded ? '가이드 접기' : '기구 사용법 및 팁 보기'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
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
    </div>
  );
};

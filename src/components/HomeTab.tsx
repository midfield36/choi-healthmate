import React, { useState } from 'react';
import { Sparkles, ClipboardEdit, TrendingUp, MapPin, Play, Flame, Award, ChevronRight, CheckCircle2, Clock, Edit3, Check, X, User, Camera } from 'lucide-react';
import { WorkoutLogItem } from '../types/healthmate';

interface HomeTabProps {
  onNavigateTab: (tabId: 'home' | 'aiCoach' | 'dietAI' | 'workoutLog' | 'bodyRecord' | 'community' | 'gymSearch') => void;
  recentLogs: WorkoutLogItem[];
  onStartTodayWorkout: () => void;
  userName: string;
  onUpdateUserName: (newName: string) => void;
  userLevel?: string;
  onUpdateUserLevel?: (newLevel: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  recentLogs,
  onStartTodayWorkout,
  userName,
  onUpdateUserName,
  userLevel = '초급',
  onUpdateUserLevel,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempLevel, setTempLevel] = useState(userLevel);

  const handleOpenEdit = () => {
    setTempName(userName);
    setTempLevel(userLevel);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempName.trim();
    if (trimmed) {
      onUpdateUserName(trimmed);
    }
    if (onUpdateUserLevel && tempLevel) {
      onUpdateUserLevel(tempLevel);
    }
    setIsEditingProfile(false);
  };

  const avatarInitial = userName.trim() ? userName.trim().charAt(0) : '김';

  return (
    <div className="space-y-5 pb-6">
      {/* User Greeting & Stats Banner */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700/60 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={handleOpenEdit}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="레벨 및 이름 변경"
              >
                <span>{userLevel} 헬스메이트</span>
                <span className="text-[10px] opacity-70">✎</span>
              </button>
              <span className="flex items-center text-xs text-orange-400 font-medium">
                <Flame className="w-3.5 h-3.5 mr-0.5 fill-orange-400" />
                3일 연속 출석
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h2
                onClick={handleOpenEdit}
                className="text-xl font-bold tracking-tight text-white hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
                title="클릭하여 이름 변경"
              >
                <span>{userName} 님, 반갑습니다!</span>
              </h2>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="p-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-emerald-400 border border-neutral-700/60 transition-colors cursor-pointer"
                title="이름 수정하기"
                aria-label="이름 수정하기"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">오늘도 목표 근육을 성실히 채워보세요.</p>
          </div>

          {/* Avatar with click-to-edit indicator */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner hover:scale-105 hover:border-emerald-400 transition-all cursor-pointer relative group"
            title="프로필 이름 변경"
          >
            {avatarInitial}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-neutral-800 border border-neutral-600 rounded-full flex items-center justify-center text-[9px] text-neutral-300 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
              ✎
            </span>
          </button>
        </div>

        {/* Weekly Target Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-700/60">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-neutral-300">주간 목표 (주 4회 달성)</span>
            <span className="text-emerald-400 font-bold">3회 / 4회 (75%)</span>
          </div>
          <div className="w-full h-2 bg-neutral-700/70 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '75%' }} />
          </div>
          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-neutral-750/50">
            <span className="text-[11px] text-neutral-400">전국 출석 챌린지 14위 달리는 중 🏆</span>
            <button
              onClick={() => onNavigateTab('community')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              커뮤니티 챌린지 보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Recommended Workout Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">오늘의 추천 프로그램</span>
          </div>
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 약 50분
          </span>
        </div>

        <div className="flex flex-col gap-1 mb-3">
          <h3 className="text-lg font-bold text-white">가슴 & 삼두 기초 자극 정복</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            체스트 프레스 머신, 인클라인 덤벨 프레스, 펙덱 플라이, 케이블 푸시다운 (총 4개 운동 13세트)
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onStartTodayWorkout}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-neutral-950 font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-neutral-950" />
            오늘 운동 바로 시작하기
          </button>
          <button
            onClick={() => onNavigateTab('aiCoach')}
            className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl text-xs font-medium border border-neutral-700 transition cursor-pointer"
          >
            루틴 변경
          </button>
        </div>
      </div>

      {/* Vision AI Diet Analyzer Quick Banner */}
      <div
        onClick={() => onNavigateTab('dietAI')}
        className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-teal-950/40 border border-emerald-500/40 hover:border-emerald-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                NEW 비전 AI
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                식단 사진 분석 & 칼로리 계산
              </h4>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              음식 사진 한 장으로 탄·단·지 영양소 자동 분석
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* 4 Quick Menus */}
      <div>
        <h4 className="text-sm font-bold text-neutral-300 mb-3 px-1">빠른 실행 메뉴</h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Quick Menu 1: AI Custom Routine */}
          <button
            onClick={() => onNavigateTab('aiCoach')}
            className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 rounded-2xl flex flex-col items-start text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">AI 맞춤 루틴</span>
            <span className="text-xs text-neutral-400 mt-1">목표·수준별 실시간 코칭</span>
          </button>

          {/* Quick Menu 2: Workout Log */}
          <button
            onClick={() => onNavigateTab('workoutLog')}
            className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 rounded-2xl flex flex-col items-start text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <ClipboardEdit className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">운동일지 작성</span>
            <span className="text-xs text-neutral-400 mt-1">세트·무게·휴식 기록</span>
          </button>

          {/* Quick Menu 3: Body Record */}
          <button
            onClick={() => onNavigateTab('bodyRecord')}
            className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 rounded-2xl flex flex-col items-start text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">신체 변화 그래프</span>
            <span className="text-xs text-neutral-400 mt-1">체중·골격근·체지방</span>
          </button>

          {/* Quick Menu 4: Gym Search */}
          <button
            onClick={() => onNavigateTab('gymSearch')}
            className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 rounded-2xl flex flex-col items-start text-left transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">주변 헬스장 찾기</span>
            <span className="text-xs text-neutral-400 mt-1">일일권·시설·거리 검색</span>
          </button>
        </div>
      </div>

      {/* Recent Workout Logs Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-neutral-200">최근 운동 기록</h4>
          <button
            onClick={() => onNavigateTab('workoutLog')}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
          >
            전체보기 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-6 text-center text-neutral-500 text-xs">
            아직 완료된 운동 일지가 없습니다. 오늘 운동을 완료해보세요!
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentLogs.slice(0, 2).map((log) => (
              <div
                key={log.id}
                className="bg-neutral-800/60 border border-neutral-750 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{log.routineTitle}</h5>
                    <p className="text-xs text-neutral-400">
                      {log.date} · {log.durationMinutes}분 완료 ({log.exercises.length}개 종목)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-700/60 text-neutral-300">
                  완료
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile & Name Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">프로필 & 이름 변경</h3>
                  <p className="text-[11px] text-neutral-400">앱에서 표시될 사용자 정보를 설정합니다</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-neutral-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Live Preview Avatar */}
              <div className="flex items-center gap-3 bg-neutral-800/60 p-3 rounded-xl border border-neutral-750">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner">
                  {tempName.trim() ? tempName.trim().charAt(0) : '김'}
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {tempLevel} 헬스메이트
                  </span>
                  <div className="text-sm font-bold text-white">
                    {tempName.trim() || '이름을 입력하세요'} 님
                  </div>
                  <span className="text-[11px] text-neutral-400">홈 화면 미리보기</span>
                </div>
              </div>

              {/* Name Input Field */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  사용자 이름 / 닉네임
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="예: 김헬스, 박피트니스"
                  maxLength={15}
                  autoFocus
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  최대 15자까지 입력할 수 있습니다.
                </span>
              </div>

              {/* Level Selection */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  운동 숙련도 등급
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['초급', '중급', '고급'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTempLevel(lvl)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        tempLevel === lvl
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-xs'
                          : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!tempName.trim()}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-neutral-950 rounded-xl text-xs font-black transition cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

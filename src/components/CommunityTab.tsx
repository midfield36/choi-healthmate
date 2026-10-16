import React, { useState } from 'react';
import { Users, Trophy, Flame, Target, Award, Search, Clock, MapPin, Send, Check, Heart, MessageCircle, Sparkles, Filter } from 'lucide-react';
import { ChallengeItem, LeaderboardUser, WorkoutPartner } from '../types/healthmate';

interface CommunityTabProps {
  userName: string;
  userLevel: string;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ userName, userLevel }) => {
  const [activeSubSection, setActiveSubSection] = useState<'challenges' | 'leaderboard' | 'partners'>('challenges');

  // 1. Challenges State
  const [challenges, setChallenges] = useState<ChallengeItem[]>([
    {
      id: 'c1',
      title: '주 4회 헬스장 출석 챌린지',
      category: '출석',
      description: '이번 주 4회 이상 운동일지를 기록하고 꾸준함의 골드 뱃지를 획득하세요!',
      rewardBadge: '🔥 불꽃 출석러',
      participantsCount: 1420,
      daysLeft: 3,
      myProgress: 75, // 3/4
      targetGoal: '3회 완료 / 4회 목표',
      isJoined: true,
    },
    {
      id: 'c2',
      title: '주간 2만 kg 누적 볼륨 돌파',
      category: '볼륨',
      description: '세트와 반복수를 채워 총 20,000kg 이상의 볼륨을 넘기는 고중량 과부하 미션',
      rewardBadge: '💪 볼륨 킹',
      participantsCount: 890,
      daysLeft: 5,
      myProgress: 92, // 18,450 / 20,000
      targetGoal: '18,450kg / 20,000kg',
      isJoined: true,
    },
    {
      id: 'c3',
      title: '100일 린매스업 바디프로필 챌린지',
      category: '다이어트',
      description: '체지방 -3% 감량과 골격근 유지에 도전하는 헬스메이트 전국 연합 챌린지',
      rewardBadge: '🏆 명예의 전당',
      participantsCount: 2310,
      daysLeft: 38,
      myProgress: 45,
      targetGoal: '45일차 순항 중',
      isJoined: false,
    },
  ]);

  // 2. Leaderboard State
  const [leaderboardCategory, setLeaderboardCategory] = useState<'volume' | 'streak'>('volume');
  const [cheeredUsers, setCheeredUsers] = useState<Record<number, boolean>>({});

  const volumeLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: '강철근육', avatarText: '강', level: '상급', weeklyVolumeKg: 42800, attendanceStreak: 12, badge: '🥇 1위' },
    { rank: 2, name: '벌크업요정', avatarText: '벌', level: '중급', weeklyVolumeKg: 38500, attendanceStreak: 9, badge: '🥈 2위' },
    { rank: 3, name: '스쿼트마스터', avatarText: '스', level: '상급', weeklyVolumeKg: 36200, attendanceStreak: 15, badge: '🥉 3위' },
    { rank: 4, name: '헬린이탈출기', avatarText: '탈', level: '중급', weeklyVolumeKg: 29400, attendanceStreak: 7, badge: 'TOP 5' },
    { rank: 5, name: '테헤란로덤벨', avatarText: '테', level: '중급', weeklyVolumeKg: 26100, attendanceStreak: 6, badge: 'TOP 5' },
    { rank: 14, name: userName || '김헬스', avatarText: userName?.charAt(0) || '김', level: userLevel, weeklyVolumeKg: 18450, attendanceStreak: 3, badge: '내 순위', isMe: true },
  ];

  // 3. Workout Partners State
  const [partnerGoalFilter, setPartnerGoalFilter] = useState<string>('전체');
  const [partners, setPartners] = useState<WorkoutPartner[]>([
    {
      id: 'p1',
      name: '이진호',
      avatarText: '이',
      level: '중급자',
      goal: '근비대 (가슴/등 집중)',
      preferredTime: '평일 저녁 20:00~21:30',
      preferredGym: '머슬팩토리 강남본점',
      distanceKm: 0.4,
      bio: '퇴근 후 저녁에 서로 보조해주면서 벤치/스쿼트 마지막 세트 밀어주실 파트너 환영합니다!',
      matchScore: 98,
      status: 'active_now',
    },
    {
      id: 'p2',
      name: '박서연',
      avatarText: '박',
      level: '초급자',
      goal: '체지방 감량 & 체형 교정',
      preferredTime: '평일 새벽 06:30~07:30',
      preferredGym: '에이블짐 역삼점',
      distanceKm: 0.7,
      bio: '아침 공복 웨이트 및 유산소 루틴 꾸준히 같이 출석체크하며 의지 북돋아주실 분 구해요.',
      matchScore: 92,
      status: 'online',
    },
    {
      id: 'p3',
      name: '정현우',
      avatarText: '정',
      level: '상급자',
      goal: '3대 500 스트렝스',
      preferredTime: '주말 오전 10:00~12:00',
      preferredGym: '짐박스 신논현점',
      distanceKm: 1.1,
      bio: '파워리프팅 자세 피드백 교환하고 RPE 8~9 고중량 세트 안전하게 같이 칠 분 찾습니다.',
      matchScore: 86,
      status: 'offline',
    },
  ]);

  const handleToggleJoinChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isJoined: !c.isJoined, participantsCount: c.isJoined ? c.participantsCount - 1 : c.participantsCount + 1 } : c
      )
    );
  };

  const handleCheerRanker = (rank: number) => {
    setCheeredUsers((prev) => ({ ...prev, [rank]: !prev[rank] }));
  };

  const handleTogglePartnerRequest = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isRequested: !p.isRequested } : p))
    );
  };

  const filteredPartners = partners.filter((p) => {
    if (partnerGoalFilter === '전체') return true;
    return p.goal.includes(partnerGoalFilter);
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-neutral-900 to-neutral-900 border border-indigo-800/40 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">커뮤니티 & 소셜 파트너</h2>
            <p className="text-xs text-neutral-400">목표 달성 챌린지 · 주간 랭킹 · 운동 메이트 찾기</p>
          </div>
        </div>
      </div>

      {/* 3 Sub-tabs */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubSection('challenges')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubSection === 'challenges'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          챌린지 ({challenges.filter((c) => c.isJoined).length}참여)
        </button>
        <button
          onClick={() => setActiveSubSection('leaderboard')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubSection === 'leaderboard'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          리더보드
        </button>
        <button
          onClick={() => setActiveSubSection('partners')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubSection === 'partners'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          파트너 찾기
        </button>
      </div>

      {/* SECTION 1: Challenges */}
      {activeSubSection === 'challenges' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-200">진행 중인 전국 챌린지</span>
            <span className="text-[11px] text-indigo-400">함께 달성 시 뱃지 지급</span>
          </div>

          {challenges.map((c) => (
            <div
              key={c.id}
              className={`bg-neutral-900 border rounded-2xl p-4 space-y-3 transition-all ${
                c.isJoined ? 'border-indigo-600/40 shadow-sm' : 'border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {c.category}
                    </span>
                    <span className="text-xs text-neutral-400">D-{c.daysLeft}일 남음</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.title}</h4>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {c.rewardBadge}
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">{c.description}</p>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-400">내 달성도: <strong className="text-white">{c.targetGoal}</strong></span>
                  <span className="text-indigo-400 font-bold">{c.myProgress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${c.myProgress}%` }}
                  />
                </div>
              </div>

              {/* Footer info & Join action */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  현재 {c.participantsCount.toLocaleString()}명 도전 중
                </span>
                <button
                  onClick={() => handleToggleJoinChallenge(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    c.isJoined
                      ? 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {c.isJoined ? '참여 중 ✓' : '챌린지 참여하기'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: Leaderboard */}
      {activeSubSection === 'leaderboard' && (
        <div className="space-y-3">
          {/* My Rank Highlight Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-neutral-900 border border-indigo-600/50 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-indigo-300 font-black text-sm">
                14위
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{userName} 님</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {userLevel}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  이번 주 누적 볼륨: <strong className="text-white">18,450 kg</strong> (상위 5%)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              🔥 3일 연속
            </span>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-xs font-bold text-neutral-300">이번 주 전국 랭킹 TOP 5</span>
            <span className="text-[11px] text-neutral-500">매주 일요일 자정 갱신</span>
          </div>

          {/* Ranking list */}
          <div className="space-y-2">
            {volumeLeaderboard.filter((u) => !u.isMe).map((user) => {
              const isCheered = cheeredUsers[user.rank];
              return (
                <div
                  key={user.rank}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        user.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : user.rank === 2
                          ? 'bg-neutral-400/20 text-neutral-200 border border-neutral-400/40'
                          : user.rank === 3
                          ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {user.rank}
                    </div>

                    <div className="w-9 h-9 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-sm border border-neutral-700">
                      {user.avatarText}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{user.name}</span>
                        <span className="text-[10px] text-neutral-400">({user.level})</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        누적 볼륨 <strong className="text-neutral-200">{user.weeklyVolumeKg.toLocaleString()}kg</strong> · {user.attendanceStreak}일 연속
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheerRanker(user.rank)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      isCheered
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                        : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isCheered ? 'fill-pink-400 text-pink-400' : ''}`} />
                    <span>{isCheered ? '응원완료' : '응원'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: Workout Partners Finder */}
      {activeSubSection === 'partners' && (
        <div className="space-y-3">
          {/* Goal Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['전체', '근비대', '체지방 감량', '스트렝스'].map((f) => (
              <button
                key={f}
                onClick={() => setPartnerGoalFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  partnerGoalFilter === f
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
            <span>내 주변 매칭 가능한 헬스메이트</span>
            <span>{filteredPartners.length}명 대기 중</span>
          </div>

          {/* Partner Cards */}
          <div className="space-y-3">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-base">
                      {partner.avatarText}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{partner.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {partner.level}
                        </span>
                        {partner.status === 'active_now' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="지금 운동 중" />
                        )}
                      </div>
                      <span className="text-xs text-indigo-400 font-medium">
                        {partner.goal}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {partner.matchScore}% 일치
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-800/50 p-2.5 rounded-xl">
                  "{partner.bio}"
                </p>

                <div className="space-y-1 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>선호 시간: {partner.preferredTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>주 활동지: {partner.preferredGym} ({partner.distanceKm * 1000}m)</span>
                  </div>
                </div>

                {/* Connect Action */}
                <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePartnerRequest(partner.id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      partner.isRequested
                        ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {partner.isRequested ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>메이트 신청 완료</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>함께 운동하기 신청</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

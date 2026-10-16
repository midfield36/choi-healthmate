import React, { useState } from 'react';
import { Users, Trophy, Flame, Target, Award, Search, Clock, MapPin, Send, Check, Heart, MessageCircle, Sparkles, Filter, Plus, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { ChallengeItem, LeaderboardUser, WorkoutPartner, CommunityPost } from '../types/healthmate';

interface CommunityTabProps {
  userName: string;
  userLevel: string;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ userName, userLevel }) => {
  const [activeSubSection, setActiveSubSection] = useState<'challenges' | 'feed' | 'leaderboard' | 'partners'>('challenges');

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
      isVerifiedToday: false,
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
      isVerifiedToday: true,
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

  // 2. Q&A and Goal Share Posts
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'post_1',
      authorName: '벌크업꿈나무',
      authorLevel: '초급자',
      authorAvatar: '벌',
      category: '질문',
      title: '벤치프레스 할 때 오른쪽 손목이 자꾸 꺾이는데 팁이 있을까요?',
      content: '빈봉으로 할 땐 괜찮은데 40kg 넘어가면 손목이 뒤로 꺾이면서 통증이 옵니다. 그립 잡는 위치나 불독 그립 사용법이 궁금합니다.',
      likesCount: 14,
      commentsCount: 6,
      createdAt: '15분 전',
      isTrainerAnswered: true,
    },
    {
      id: 'post_2',
      authorName: '강철헬서',
      authorLevel: '상급자',
      authorAvatar: '강',
      category: '인증',
      title: '오늘 AI 가슴&삼두 루틴 완료! 펌핑감 최고네요 🔥',
      content: 'AI 코치가 추천해준 인클라인 덤벨프레스 30도 세팅으로 진행했더니 윗가슴 자극점 바로 잡혔습니다. 다들 오운완 화이팅입니다!',
      workoutSummary: '가슴&삼두 루틴 · 13세트 완료 · 52분 소요',
      likesCount: 28,
      commentsCount: 4,
      createdAt: '1시간 전',
    },
    {
      id: 'post_3',
      authorName: '식단마스터',
      authorLevel: '중급자',
      authorAvatar: '식',
      category: '식단',
      title: '비전 AI로 분석해본 오늘 점심 닭가슴살 볶음밥입니다 🥑',
      content: '사진 찍자마자 단백질 42g 바로 계산해주네요. 벌크업 목표 단백질량 채우기 편해서 요즘 매 끼니 기록 중입니다.',
      likesCount: 19,
      commentsCount: 2,
      createdAt: '3시간 전',
    },
  ]);

  // New Post Modal State
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newPostCategory, setNewPostCategory] = useState<'인증' | '질문' | '식단' | '팁'>('질문');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // 3. Leaderboard State
  const [cheeredUsers, setCheeredUsers] = useState<Record<number, boolean>>({});

  const volumeLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: '강철근육', avatarText: '강', level: '상급', weeklyVolumeKg: 42800, attendanceStreak: 12, badge: '🥇 1위' },
    { rank: 2, name: '벌크업요정', avatarText: '벌', level: '중급', weeklyVolumeKg: 38500, attendanceStreak: 9, badge: '🥈 2위' },
    { rank: 3, name: '스쿼트마스터', avatarText: '스', level: '상급', weeklyVolumeKg: 36200, attendanceStreak: 15, badge: '🥉 3위' },
    { rank: 4, name: '헬린이탈출기', avatarText: '탈', level: '중급', weeklyVolumeKg: 29400, attendanceStreak: 7, badge: 'TOP 5' },
    { rank: 5, name: '테헤란로덤벨', avatarText: '테', level: '중급', weeklyVolumeKg: 26100, attendanceStreak: 6, badge: 'TOP 5' },
    { rank: 14, name: userName || '김헬스', avatarText: userName?.charAt(0) || '김', level: userLevel, weeklyVolumeKg: 18450, attendanceStreak: 3, badge: '내 순위', isMe: true },
  ];

  // 4. Workout Partners State
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

  const handleVerifyChallengeToday = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isVerifiedToday: true,
              myProgress: Math.min(100, c.myProgress + 25),
              targetGoal: '오늘 인증 완료! (4회 / 4회 달성)',
            }
          : c
      )
    );
  };

  const handleToggleLikePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newPost: CommunityPost = {
      id: 'post_' + Date.now(),
      authorName: userName || '김헬스',
      authorLevel: userLevel || '초급',
      authorAvatar: userName ? userName.charAt(0) : '김',
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      likesCount: 1,
      commentsCount: 0,
      createdAt: '방금 전',
      isLiked: true,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">커뮤니티 & 소셜 파트너</h2>
              <p className="text-xs text-neutral-400">목표 챌린지 · 헬스 Q&A 게시판 · 리더보드 · 파트너 매칭</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            글쓰기
          </button>
        </div>
      </div>

      {/* 4 Sub-tabs */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubSection('challenges')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubSection === 'challenges'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          챌린지
        </button>
        <button
          onClick={() => setActiveSubSection('feed')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubSection === 'feed'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Q&A 피드
        </button>
        <button
          onClick={() => setActiveSubSection('leaderboard')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubSection === 'leaderboard'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          랭킹
        </button>
        <button
          onClick={() => setActiveSubSection('partners')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubSection === 'partners'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          메이트
        </button>
      </div>

      {/* SECTION 1: Challenges */}
      {activeSubSection === 'challenges' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-200">진행 중인 전국 챌린지</span>
            <span className="text-[11px] text-indigo-400">오운완 인증 시 즉시 반영</span>
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

              {/* Footer info & Actions */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  현재 {c.participantsCount.toLocaleString()}명 도전 중
                </span>

                <div className="flex items-center gap-2">
                  {c.isJoined && (
                    <button
                      onClick={() => handleVerifyChallengeToday(c.id)}
                      disabled={c.isVerifiedToday}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        c.isVerifiedToday
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-neutral-950 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{c.isVerifiedToday ? '오늘 인증 완료' : '오늘 운동 인증'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleJoinChallenge(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      c.isJoined
                        ? 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {c.isJoined ? '참여 중' : '참여하기'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: Goal Sharing & Q&A Board */}
      {activeSubSection === 'feed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-200">헬스 Q&A 및 오운완 피드</span>
            <span className="text-[11px] text-neutral-400">총 {posts.length}개의 이야기</span>
          </div>

          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 hover:border-neutral-700 transition-all"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 text-white font-bold flex items-center justify-center text-xs">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{post.authorName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                        {post.authorLevel}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500">{post.createdAt}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    post.category === '질문'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : post.category === '식단'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : post.category === '인증'
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {post.category}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{post.title}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">{post.content}</p>
              </div>

              {/* Attached Workout Badge */}
              {post.workoutSummary && (
                <div className="bg-neutral-850 border border-neutral-750 p-2 rounded-xl text-[11px] text-neutral-300 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{post.workoutSummary}</span>
                </div>
              )}

              {/* Trainer Verified Callout */}
              {post.isTrainerAnswered && (
                <div className="bg-emerald-950/40 border border-emerald-600/40 p-2.5 rounded-xl text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 block">
                      공인 수석 트레이너 검증 답변 완료:
                    </span>
                    <p className="text-[11px] text-neutral-300 leading-relaxed mt-0.5">
                      "손바닥 아래 도톰한 지지면(척골 라인)에 바벨을 얹는 불독 그립을 적용하면 손목 꺾임이 해소됩니다. 덤벨 프레스로 손목 안정근을 함께 강화하세요."
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <button
                  onClick={() => handleToggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition cursor-pointer ${
                    post.isLiked ? 'text-pink-400 font-bold' : 'hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>댓글 {post.commentsCount}개</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: Leaderboard */}
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

      {/* SECTION 4: Workout Partners */}
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

      {/* Write New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">커뮤니티 글쓰기 & Q&A</h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-neutral-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">카테고리</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['질문', '인증', '식단', '팁'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewPostCategory(cat)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        newPostCategory === cat
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">제목</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="예: 덤벨 숄더프레스 팔꿈치 각도 질문"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">내용</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="질문이나 오늘의 운동 후기, 식단 팁을 자세히 적어주세요."
                  rows={3}
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  게시글 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

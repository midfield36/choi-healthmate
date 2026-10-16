import React, { useState } from 'react';
import { Search, MapPin, Star, Phone, Clock, Filter, Navigation, Check } from 'lucide-react';
import { Gym } from '../types/healthmate';

const MOCK_GYMS: Gym[] = [
  {
    id: 'gym_1',
    name: '머슬팩토리 휘트니스 강남본점',
    address: '서울특별시 강남구 테헤란로 152 지하 1층',
    distanceKm: 0.35,
    rating: 4.9,
    reviewCount: 142,
    tags: ['24시간 운영', '일일권 2만원', '해머스트렝스 풀셋', '무료주차 2시간'],
    phone: '02-555-1234',
    monthlyFee: '월 80,000원~',
    dailyPassFee: '20,000원',
    is24Hours: true,
  },
  {
    id: 'gym_2',
    name: '에이블짐 피트니스 역삼점',
    address: '서울특별시 강남구 역삼로 204 3층',
    distanceKm: 0.62,
    rating: 4.8,
    reviewCount: 98,
    tags: ['일일권 가능', '파워랙 5대', '사우나 완비', 'PT 전문'],
    phone: '02-567-8901',
    monthlyFee: '월 75,000원~',
    dailyPassFee: '22,000원',
    is24Hours: false,
  },
  {
    id: 'gym_3',
    name: '짐박스 피트니스 신논현점',
    address: '서울특별시 서초구 강남대로 455 지하 2층',
    distanceKm: 0.89,
    rating: 4.9,
    reviewCount: 230,
    tags: ['24시간 운영', '구독형 월 4만원대', '뉴텍 챔피언존', '샤워실 개별부스'],
    phone: '02-789-0123',
    monthlyFee: '월 48,000원~',
    dailyPassFee: '15,000원',
    is24Hours: true,
  },
  {
    id: 'gym_4',
    name: '골드짐 보디빌딩 아카데미',
    address: '서울특별시 강남구 논현로 312 2층',
    distanceKm: 1.2,
    rating: 4.7,
    reviewCount: 64,
    tags: ['보디빌딩 전문', '일일권 가능', '아스널 스트렝스', '선수 레슨'],
    phone: '02-345-6789',
    monthlyFee: '월 90,000원~',
    dailyPassFee: '25,000원',
    is24Hours: false,
  },
];

export const GymSearchTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('전체');

  const filterTags = ['전체', '24시간 운영', '일일권', 'PT 전문', '주차'];

  const filteredGyms = MOCK_GYMS.filter((gym) => {
    const matchesSearch =
      gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTag === '전체') return true;
    if (selectedTag === '24시간 운영') return gym.is24Hours;
    if (selectedTag === '일일권') return gym.tags.some((t) => t.includes('일일권'));
    if (selectedTag === 'PT 전문') return gym.tags.some((t) => t.includes('PT') || t.includes('레슨'));
    if (selectedTag === '주차') return gym.tags.some((t) => t.includes('주차'));

    return true;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white">주변 헬스장 찾기</h2>
        <p className="text-xs text-neutral-400">내 위치 기반 일일권 및 시설 검색</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="헬스장 이름 또는 동/도로명 검색"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedTag === tag
                ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Count & Location note */}
      <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-emerald-400" />
          현재 위치: 서울시 강남구 역삼동
        </span>
        <span>검색 결과 {filteredGyms.length}개</span>
      </div>

      {/* Gym Cards */}
      <div className="space-y-3">
        {filteredGyms.map((gym) => (
          <div
            key={gym.id}
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 space-y-3 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{gym.name}</h3>
                  {gym.is24Hours && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      24시
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {gym.rating}
                  </span>
                  <span>({gym.reviewCount})</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{gym.distanceKm * 1000}m</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-white">{gym.monthlyFee}</div>
                <div className="text-[10px] text-neutral-400">일일권 {gym.dailyPassFee}</div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{gym.address}</span>
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {gym.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-750"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
              <a
                href={`tel:${gym.phone}`}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                전화 문의
              </a>
              <button
                onClick={() => alert(`${gym.name} 길안내 좌표 연동 (카카오맵 / 네이버지도)`)}
                className="flex-1 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                길찾기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Scale, Activity, Percent, Calendar } from 'lucide-react';
import { BodyRecord } from '../types/healthmate';

interface BodyRecordTabProps {
  records: BodyRecord[];
  onAddRecord: (record: BodyRecord) => void;
}

export const BodyRecordTab: React.FC<BodyRecordTabProps> = ({ records, onAddRecord }) => {
  const [metricType, setMetricType] = useState<'weight' | 'skeletalMuscleMass' | 'bodyFatPercentage'>('weight');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [weight, setWeight] = useState(72.5);
  const [muscle, setMuscle] = useState(33.2);
  const [fat, setFat] = useState(17.8);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const latestRecord = records[records.length - 1] || {
    weight: 72.5,
    skeletalMuscleMass: 33.2,
    bodyFatPercentage: 17.8,
    date: '2026-10-15',
  };

  const prevRecord = records[records.length - 2] || latestRecord;

  const diffWeight = (latestRecord.weight - prevRecord.weight).toFixed(1);
  const diffMuscle = (latestRecord.skeletalMuscleMass - prevRecord.skeletalMuscleMass).toFixed(1);
  const diffFat = (latestRecord.bodyFatPercentage - prevRecord.bodyFatPercentage).toFixed(1);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({
      id: 'body_' + Date.now(),
      date,
      weight: Number(weight),
      skeletalMuscleMass: Number(muscle),
      bodyFatPercentage: Number(fat),
    });
    setShowAddModal(false);
  };

  // SVG Chart calculation
  const values = records.map((r) => r[metricType]);
  const minVal = Math.min(...values) * 0.96;
  const maxVal = Math.max(...values) * 1.04;
  const range = maxVal - minVal || 1;

  const chartWidth = 320;
  const chartHeight = 130;
  const paddingX = 25;
  const paddingY = 20;

  const points = records.map((r, i) => {
    const x = paddingX + (i / Math.max(records.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((r[metricType] - minVal) / range) * (chartHeight - paddingY * 2);
    return { x, y, val: r[metricType], date: r.date.slice(5) };
  });

  const pathD = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <div className="space-y-4 pb-8">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">신체 변화 그래프</h2>
          <p className="text-xs text-neutral-400">인바디 및 체성분 변화 추적</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          신체 기록 추가
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Weight */}
        <div
          onClick={() => setMetricType('weight')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            metricType === 'weight'
              ? 'bg-neutral-800 border-emerald-500 shadow-sm'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 mb-1">
            <Scale className="w-3 h-3 text-emerald-400" /> 체중
          </div>
          <div className="text-base font-black text-white">{latestRecord.weight} kg</div>
          <div className="text-[10px] mt-1 flex items-center">
            {Number(diffWeight) <= 0 ? (
              <span className="text-emerald-400 font-bold">{diffWeight} kg</span>
            ) : (
              <span className="text-orange-400 font-bold">+{diffWeight} kg</span>
            )}
          </div>
        </div>

        {/* Skeletal Muscle */}
        <div
          onClick={() => setMetricType('skeletalMuscleMass')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            metricType === 'skeletalMuscleMass'
              ? 'bg-neutral-800 border-emerald-500 shadow-sm'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 mb-1">
            <Activity className="w-3 h-3 text-purple-400" /> 골격근량
          </div>
          <div className="text-base font-black text-white">{latestRecord.skeletalMuscleMass} kg</div>
          <div className="text-[10px] mt-1 flex items-center">
            {Number(diffMuscle) >= 0 ? (
              <span className="text-purple-400 font-bold">+{diffMuscle} kg</span>
            ) : (
              <span className="text-neutral-400 font-bold">{diffMuscle} kg</span>
            )}
          </div>
        </div>

        {/* Body Fat */}
        <div
          onClick={() => setMetricType('bodyFatPercentage')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            metricType === 'bodyFatPercentage'
              ? 'bg-neutral-800 border-emerald-500 shadow-sm'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 mb-1">
            <Percent className="w-3 h-3 text-blue-400" /> 체지방률
          </div>
          <div className="text-base font-black text-white">{latestRecord.bodyFatPercentage}%</div>
          <div className="text-[10px] mt-1 flex items-center">
            {Number(diffFat) <= 0 ? (
              <span className="text-blue-400 font-bold">{diffFat}%</span>
            ) : (
              <span className="text-orange-400 font-bold">+{diffFat}%</span>
            )}
          </div>
        </div>
      </div>

      {/* SVG Interactive Trend Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-neutral-200">
            {metricType === 'weight'
              ? '체중 변화 추이 (kg)'
              : metricType === 'skeletalMuscleMass'
              ? '골격근량 변화 추이 (kg)'
              : '체지방률 변화 추이 (%)'}
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">최근 기록 추세</span>
        </div>

        <div className="w-full flex justify-center py-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
            {/* Grid Lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#333" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#333" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#444" />

            {/* Gradient fill */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            {points.length > 0 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`}
                fill="url(#chartGradient)"
              />
            )}

            {/* Main Path */}
            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#10b981" stroke="#171717" strokeWidth="2" />
                <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  {p.val}
                </text>
                <text x={p.x} y={chartHeight - 4} textAnchor="middle" fill="#888" fontSize="9">
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* History Log List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-neutral-300 mb-3">상세 기록 히스토리</h4>
        <div className="space-y-2">
          {records.slice().reverse().map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-2.5 bg-neutral-800/60 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-semibold text-neutral-300">{rec.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{rec.weight} kg</span>
                <span className="text-purple-400 font-medium">근육 {rec.skeletalMuscleMass}kg</span>
                <span className="text-blue-400 font-medium">체지방 {rec.bodyFatPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">신체 스펙 기록 추가</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">측정 날짜</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">골격근량 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={muscle}
                  onChange={(e) => setMuscle(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">체지방률 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  required
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-xl text-xs font-black cursor-pointer shadow-md shadow-emerald-500/20"
                >
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

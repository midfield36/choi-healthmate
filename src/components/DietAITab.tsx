import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Utensils, Check, Clock, AlertCircle, Apple, Flame, ChevronRight, Plus, RefreshCw, BarChart2 } from 'lucide-react';
import { DietMealAnalysis, WorkoutGoal } from '../types/healthmate';
import { analyzeMealImage } from '../services/geminiDiet';

interface DietAITabProps {
  userGoal: WorkoutGoal;
  savedMeals: DietMealAnalysis[];
  onSaveMeal: (meal: DietMealAnalysis) => void;
}

export const DietAITab: React.FC<DietAITabProps> = ({ userGoal, savedMeals, onSaveMeal }) => {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedPreset, setSelectedPreset] = useState<string>('닭가슴살 샐러드');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DietMealAnalysis | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);

  const presets = [
    { id: '닭가슴살 샐러드', name: '닭가슴살 샐러드', icon: '🥗', calories: '380 kcal' },
    { id: '소고기 볶음밥', name: '소고기 우둔살 볶음밥', icon: '🥩', calories: '560 kcal' },
    { id: '연어 아보카도 포케', name: '연어 아보카도 포케', icon: '🥑', calories: '490 kcal' },
    { id: '통삼겹 구이와 된장찌개', name: '통삼겹 구이 & 찌개', icon: '🥓', calories: '780 kcal' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setSelectedPreset('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMealImage({
        imageBase64: uploadedImage || undefined,
        presetDishName: selectedPreset || undefined,
        userGoal,
        mealType,
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDiary = () => {
    if (analysisResult) {
      onSaveMeal(analysisResult);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 2500);
    }
  };

  // Nutrition Totals for today
  const totalCaloriesToday = savedMeals.reduce((acc, m) => acc + m.estimatedCalories, 0);
  const totalProteinToday = savedMeals.reduce((acc, m) => acc + m.proteinGrams, 0);
  const targetCalories = userGoal === 'hypertrophy' ? 2600 : userGoal === 'fat_loss' ? 1800 : 2200;
  const targetProtein = 130; // 130g target

  return (
    <div className="space-y-4 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-neutral-900 border border-emerald-800/40 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">비전 AI 식단 & 영양 분석</h2>
            <p className="text-xs text-neutral-400">음식 사진 1장으로 칼로리, 탄·단·지, 목표별 조언 도출</p>
          </div>
        </div>
      </div>

      {/* Daily Nutrition Summary Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            오늘의 누적 영양 섭취량
          </span>
          <span className="text-xs font-bold text-emerald-400">
            {totalCaloriesToday} / {targetCalories} kcal ({Math.min(100, Math.round((totalCaloriesToday / targetCalories) * 100))}%)
          </span>
        </div>

        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalCaloriesToday / targetCalories) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-neutral-800/80">
          <span className="text-neutral-400">
            누적 단백질: <strong className="text-white">{totalProteinToday.toFixed(1)}g</strong> / {targetProtein}g
          </span>
          <span className="text-emerald-400 font-semibold">
            {savedMeals.length}끼 식단 기록됨
          </span>
        </div>
      </div>

      {/* Input Card: Photo Upload or Preset Selection */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        {/* Meal Type Selection */}
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1.5">
            식사 분류
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'breakfast', label: '아침' },
              { id: 'lunch', label: '점심' },
              { id: 'dinner', label: '저녁' },
              { id: 'snack', label: '간식/보충제' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setMealType(t.id as any)}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mealType === t.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload Zone */}
        <div>
          <label className="text-xs font-bold text-neutral-300 block mb-1.5">
            음식 사진 업로드 또는 프리셋 선택
          </label>

          {uploadedImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-neutral-950 p-2 text-center">
              <img
                src={uploadedImage}
                alt="Uploaded Meal"
                className="max-h-48 mx-auto rounded-xl object-cover"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-4 right-4 px-2 py-1 bg-neutral-900/90 text-neutral-300 text-[10px] rounded-lg border border-neutral-700 hover:text-white"
              >
                사진 변경
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-neutral-700 hover:border-emerald-500/80 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-neutral-850/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">음식 사진 직접 촬영 / 파일 선택</span>
              <span className="text-[10px] text-neutral-400">JPG, PNG 형식 지원 (모바일 카메라 지원)</span>
            </label>
          )}
        </div>

        {/* Or Select from 4 Popular Test Presets */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-2 font-medium">
            사진이 없으신가요? 인기 식단 프리셋으로 즉시 체험:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPreset(p.id);
                  setUploadedImage(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedPreset === p.id && !uploadedImage
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-neutral-800/70 border-neutral-750 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{p.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-neutral-400">{p.calories}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
              <span>Gemini 비전 AI가 칼로리와 영양소를 계산 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>AI 비전 식단 정밀 분석하기</span>
            </>
          )}
        </button>
      </div>

      {saveSuccessToast && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>오늘의 식단 일지에 성공적으로 기록되었습니다!</span>
        </div>
      )}

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="bg-neutral-900 border border-emerald-600/50 rounded-2xl p-4 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {analysisResult.mealType === 'breakfast' ? '아침 식단' : analysisResult.mealType === 'lunch' ? '점심 식단' : analysisResult.mealType === 'dinner' ? '저녁 식단' : '간식'}
                </span>
                <span className="text-xs text-neutral-400">비전 AI 검증 완료</span>
              </div>
              <h3 className="text-base font-bold text-white">{analysisResult.dishName}</h3>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-emerald-400 font-mono">
                {analysisResult.estimatedCalories} <span className="text-xs font-bold text-neutral-300">kcal</span>
              </div>
            </div>
          </div>

          {/* 3 Macro Bars */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-neutral-300 block">3대 영양소 분석 (Macronutrients)</span>
            
            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> 단백질 (Protein)
                </span>
                <span className="text-purple-300 font-bold">{analysisResult.proteinGrams}g</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (analysisResult.proteinGrams / 50) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 탄수화물 (Carbs)
                </span>
                <span className="text-amber-300 font-bold">{analysisResult.carbsGrams}g</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (analysisResult.carbsGrams / 80) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> 지방 (Fat)
                </span>
                <span className="text-blue-300 font-bold">{analysisResult.fatGrams}g</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, (analysisResult.fatGrams / 40) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Tailored Nutrition Advice */}
          <div className="bg-neutral-850 border border-neutral-750 p-3 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-emerald-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              목표 맞춤 AI 영양 코칭 가이드
            </span>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              {analysisResult.aiAdvice}
            </p>
          </div>

          {/* Add to Today's Diary Action */}
          <button
            onClick={handleSaveToDiary}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            이 식단을 오늘 식단 일지에 기록하기
          </button>
        </div>
      )}

      {/* Logged Meals List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-200">오늘 기록된 식단 히스토리</span>
          <span className="text-[11px] text-neutral-500">{savedMeals.length}개 완료</span>
        </div>

        {savedMeals.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            오늘 아직 기록된 식단이 없습니다. 식사 사진을 분석하여 기록해보세요!
          </div>
        ) : (
          <div className="space-y-2">
            {savedMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-neutral-800/60 border border-neutral-750 p-3 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-700 text-neutral-300">
                      {meal.mealType === 'breakfast' ? '아침' : meal.mealType === 'lunch' ? '점심' : meal.mealType === 'dinner' ? '저녁' : '간식'}
                    </span>
                    <h5 className="font-bold text-white">{meal.dishName}</h5>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    단백질 {meal.proteinGrams}g · 탄수화물 {meal.carbsGrams}g · 지방 {meal.fatGrams}g
                  </span>
                </div>
                <span className="font-bold text-emerald-400 font-mono">
                  {meal.estimatedCalories} kcal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

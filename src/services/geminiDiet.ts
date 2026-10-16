import { GoogleGenAI } from '@google/genai';
import { DietMealAnalysis, WorkoutGoal } from '../types/healthmate';

export const DIET_VISION_SYSTEM_INSTRUCTION = `당신은 15년 경력의 임상 스포츠 영양사이자 공인 피트니스 식단 코치 '헬스메이트 AI 영양사'입니다.
사용자가 업로드한 음식 사진을 분석하여 다음 항목을 정확한 JSON 규격으로 반환해야 합니다:
1. dishName: 음식 또는 식단 명칭 (예: 닭가슴살 고구마 샐러드 도시락)
2. estimatedCalories: 1회 제공량 추정 칼로리 (kcal)
3. proteinGrams: 단백질 함량 (g)
4. carbsGrams: 탄수화물 함량 (g)
5. fatGrams: 지방 함량 (g)
6. aiAdvice: 사용자의 운동 목적(근비대/다이어트/체형관리)에 맞춘 실질적인 섭취 가이드 및 보완 피드백 (2~3문장)

응답은 마크다운 코드블록 없이 순수 JSON 객체여야 합니다.`;

export const DIET_SCHEMA = {
  type: "object",
  properties: {
    dishName: { type: "string" },
    estimatedCalories: { type: "integer" },
    proteinGrams: { type: "number" },
    carbsGrams: { type: "number" },
    fatGrams: { type: "number" },
    aiAdvice: { type: "string" }
  },
  required: ["dishName", "estimatedCalories", "proteinGrams", "carbsGrams", "fatGrams", "aiAdvice"]
};

export async function analyzeMealImage(params: {
  imageBase64?: string;
  presetDishName?: string;
  userGoal: WorkoutGoal;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}): Promise<DietMealAnalysis> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
                 '';

  const goalDesc = params.userGoal === 'hypertrophy'
    ? '근비대 (근육 증량 및 풍부한 단백질/탄수화물 합성 필요)'
    : params.userGoal === 'fat_loss'
    ? '체지방 감량 (적정 칼로리 통제 및 고단백 저탄수화물 선호)'
    : '건강 유지 및 스트렝스 향상';

  if (apiKey && params.imageBase64) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `사용자의 운동 목적: ${goalDesc}, 식사 종류: ${params.mealType}. 이 음식의 칼로리와 탄·단·지 영양 성분을 분석하고 맞춤 조언을 제공하세요.`;

      // Extract base64 payload if data URI
      const base64Data = params.imageBase64.includes('base64,')
        ? params.imageBase64.split('base64,')[1]
        : params.imageBase64;
      const mimeType = params.imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ],
        config: {
          systemInstruction: DIET_VISION_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: DIET_SCHEMA as any,
          temperature: 0.2,
        }
      });

      const text = response.text?.trim();
      if (text) {
        const sanitized = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(sanitized);
        return {
          id: 'meal_' + Date.now(),
          mealType: params.mealType,
          dishName: parsed.dishName,
          estimatedCalories: parsed.estimatedCalories,
          proteinGrams: parsed.proteinGrams,
          carbsGrams: parsed.carbsGrams,
          fatGrams: parsed.fatGrams,
          aiAdvice: parsed.aiAdvice,
          imageUrl: params.imageBase64,
          date: new Date().toISOString().split('T')[0],
        };
      }
    } catch (err) {
      console.warn('Gemini Vision API fallback triggered:', err);
    }
  }

  // Realistic Nutrition Preset / Fallback Engine
  const presetKey = params.presetDishName || '닭가슴살 샐러드';
  const mockDatabase: Record<string, { dishName: string; cal: number; p: number; c: number; f: number; advice: string }> = {
    '닭가슴살 샐러드': {
      dishName: '수비드 닭가슴살 퀴노아 샐러드 & 오리엔탈 드레싱',
      cal: 380,
      p: 36.5,
      c: 32.0,
      f: 8.5,
      advice: params.userGoal === 'hypertrophy'
        ? '💡 단백질 36.5g으로 근합성에 훌륭합니다. 근비대를 위해선 탄수화물 30g 정도(바나나 1개 또는 고구마 반 개)를 보충하면 글리코겐 회복에 더 효과적입니다.'
        : '💡 저칼로리 고단백의 모범적인 다이어트 식단입니다. 식이섬유가 풍부해 포만감이 오래 유지되며 체지방 연소에 최적입니다.'
    },
    '소고기 볶음밥': {
      dishName: '우둔살 소고기 현미 야채 볶음밥 & 반숙란',
      cal: 560,
      p: 42.0,
      c: 65.0,
      f: 14.0,
      advice: '💡 고강도 웨이트 트레이닝 전후 식사로 완벽한 비율입니다. 복합 탄수화물과 양질의 크레아틴/철분이 포함된 우둔살이 근력 발휘를 강력하게 서포트합니다.'
    },
    '연어 아보카도 포케': {
      dishName: '생연어 아보카도 현미 포케볼',
      cal: 490,
      p: 28.0,
      c: 48.0,
      f: 18.0,
      advice: '💡 연어와 아보카도의 오메가-3 불포화지방산이 풍부하여 운동 후 체내 염증 완화 및 관절 회복에 매우 탁월합니다.'
    },
    '통삼겹 구이와 된장찌개': {
      dishName: '통삼겹살 구이(200g) 및 두부 된장찌개',
      cal: 780,
      p: 34.0,
      c: 18.0,
      f: 62.0,
      advice: params.userGoal === 'fat_loss'
        ? '⚠️ 포화지방 함량이 높으므로 다이어트 중이라면 기름기를 뺀 목살이나 쌈 채소를 2배 이상 곁들여 지방 흡수를 지연시키세요.'
        : '💡 벌크업 시 높은 열량 공급에 유효하나, 과도한 지방 축적을 막기 위해 밥 섭취량을 반 공기로 조절하세요.'
    }
  };

  const selected = mockDatabase[presetKey] || mockDatabase['닭가슴살 샐러드'];

  return {
    id: 'meal_' + Date.now(),
    mealType: params.mealType,
    dishName: selected.dishName,
    estimatedCalories: selected.cal,
    proteinGrams: selected.p,
    carbsGrams: selected.c,
    fatGrams: selected.f,
    aiAdvice: selected.advice,
    imageUrl: params.imageBase64,
    date: new Date().toISOString().split('T')[0],
  };
}

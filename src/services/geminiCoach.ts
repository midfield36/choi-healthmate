import { GoogleGenAI } from '@google/genai';
import { UserLevel, WorkoutGoal, WorkoutPlace, WorkoutRoutineResponse } from '../types/healthmate';

// System prompt designed for Google AI Studio / Gemini API
export const HEALTHMATE_SYSTEM_INSTRUCTION = `당신은 15년 경력의 공인 수석 피트니스 코치이자 스포츠 생체역학 전문가 '헬스메이트 AI'입니다.
사용자의 신체 수준(초급/중급/고급), 운동 목적(근비대/체지방 감소/스트렝스/재활), 운동 장소(헬스장/홈트레이닝/야외), 선호 부위 및 시간을 바탕으로 과학적이고 부상 없는 최적의 맞춤 운동 프로그램을 구성해야 합니다.

[작성 및 안전 원칙]
1. 수준별 난이도 조절:
   - 초급자(beginner): 머신 및 맨몸 위주, 12~15회 고반복, 명확하고 상세한 기구 세팅법 제공.
   - 중급자(intermediate): 프리웨이트+머신 복합, 8~12회 타깃 근비대 자극 위주.
   - 고급자(advanced): 복합 다관절 운동, 점진적 과부하, 6~10회 고강도 스트렝스/근비대 루틴.
2. 기구 사용법(equipmentGuide): 초보자도 바로 헬스장 머신을 쓸 수 있도록 의자 높이, 그립 위치, 궤적 조절법을 2~3문장으로 구체적으로 서술할 것.
3. 실행 팁(executionTips): 호흡법(수축 시 날숨, 이완 시 들숨)과 부상 위험 부위(허리, 어깨, 무릎 등) 주의사항을 포함할 것.
4. 출력 형식: 마크다운 코드블록(\`\`\`json)이나 일반 텍스트 없이, 순수한 JSON 객체 형식만 반환해야 합니다.`;

// JSON Schema definition for Gemini responseSchema
export const WORKOUT_ROUTINE_SCHEMA = {
  type: "object",
  properties: {
    routineTitle: { type: "string", description: "루틴의 명확하고 동기부여되는 이름 (예: 초보자 가슴&삼두 기초 정복 루틴)" },
    summary: { type: "string", description: "이 루틴의 목적과 핵심 효과를 설명하는 1~2문장 요약" },
    targetLevel: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
    estimatedDurationMinutes: { type: "integer", description: "예상 총 소요시간 (분)" },
    warmUp: {
      type: "array",
      items: { type: "string" },
      description: "본운동 전 동적 스트레칭 및 웜업 단계 (2~3개)"
    },
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "운동 공식 명칭 (예: 랫 풀 다운, 인클라인 덤벨 프레스)" },
          targetMuscle: { type: "string", description: "주 타깃 근육 (예: 광배근, 대흉근 상부, 대퇴사두근)" },
          sets: { type: "integer", description: "세트 수 (예: 3~5)" },
          reps: { type: "string", description: "반복 횟수 (예: 12-15회, 8-10회)" },
          restSeconds: { type: "integer", description: "세트 간 권장 휴식 시간 (초 단위, 예: 60, 90)" },
          equipment: { type: "string", description: "사용 기구 (예: 체스트 프레스 머신, 덤벨, 바벨, 맨몸)" },
          equipmentGuide: { type: "string", description: "초보자를 위한 기구 세팅 및 의자 높이, 핀 조절 가이드" },
          executionTips: {
            type: "array",
            items: { type: "string" },
            description: "자세, 호흡법, 수축/이완 요령 (2~3개)"
          },
          alternativeExercise: { type: "string", description: "해당 기구가 없을 때 대체 가능한 운동" }
        },
        required: ["name", "targetMuscle", "sets", "reps", "restSeconds", "equipment", "equipmentGuide", "executionTips"]
      }
    },
    coolDown: {
      type: "array",
      items: { type: "string" },
      description: "본운동 후 정적 스트레칭 및 쿨다운 단계 (2~3개)"
    }
  },
  required: ["routineTitle", "summary", "targetLevel", "estimatedDurationMinutes", "warmUp", "exercises", "coolDown"]
};

export interface GenerateWorkoutParams {
  level: UserLevel;
  goal: WorkoutGoal;
  place: WorkoutPlace;
  targetSplit: string; // e.g., "가슴/삼두", "하체/엉덩이", "등/이두", "전신"
  durationMinutes: number; // e.g., 50
  limitations?: string; // e.g., "허리 디스크 초기 주의", "무릎 통증"
}

export async function generateAIWorkoutRoutine(params: GenerateWorkoutParams): Promise<WorkoutRoutineResponse> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
                 '';

  const userPrompt = `[사용자 프로필 및 요청]
- 운동 수준: ${params.level === 'beginner' ? '초급자 (헬스 0~6개월, 기구 사용법 미숙)' : params.level === 'intermediate' ? '중급자 (헬스 6개월~2년, 3대 운동 및 기본 자세 숙지)' : '상급자 (헬스 2년 이상, 고강도 점진적 과부하 가능)'}
- 운동 목적: ${params.goal === 'hypertrophy' ? '근비대 (근육량 증가 및 볼륨감)' : params.goal === 'fat_loss' ? '체지방 감소 및 린매스업' : params.goal === 'strength' ? '근력 및 스트렝스 향상' : '체형 교정 및 재활'}
- 운동 장소: ${params.place === 'gym' ? '헬스장 (피트니스 센터 머신 및 프리웨이트 완비)' : params.place === 'home' ? '홈트레이닝 (맨몸 및 덤벨/밴드)' : '야외 공원/철봉'}
- 선호 운동 부위: ${params.targetSplit}
- 1회 운동 희망 시간: ${params.durationMinutes}분
- 신체 특이사항/부상: ${params.limitations || '특이사항 없음 (건강)'}

위 조건에 꼭 맞는 맞춤형 데일리 운동 루틴을 JSON 스키마에 맞춰 생성해주세요.`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: HEALTHMATE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: WORKOUT_ROUTINE_SCHEMA as any,
          temperature: 0.2, // Low temperature for consistent structured execution
        }
      });

      const text = response.text?.trim();
      if (text) {
        // Strip markdown backticks if any slipped through
        const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson) as WorkoutRoutineResponse;
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini API call returned an error or API key quota exceeded, falling back to dynamic algorithm routine generator:', err);
    }
  }

  // Graceful realistic fallback tailored to user parameters (runs when offline or key not supplied)
  return getRealisticFallbackRoutine(params);
}

export function getRealisticFallbackRoutine(params: GenerateWorkoutParams): WorkoutRoutineResponse {
  const isBeginner = params.level === 'beginner';
  const isIntermediate = params.level === 'intermediate';

  if (params.targetSplit.includes('가슴') || params.targetSplit.includes('상체') || params.targetSplit.includes('삼두')) {
    return {
      routineTitle: isBeginner ? "초보자를 위한 가슴&삼두 안전 머신 정복 루틴" : isIntermediate ? "중급자 팩토럴 근비대 집중 푸시 루틴" : "상급자 고강도 체스트 & 트라이셉스 헤비 루틴",
      summary: `${params.level === 'beginner' ? '안전한 머신 위주로 흉근의 자극점을 잡고' : '다양한 각도의 압축 자극을 통해'} 가슴 대흉근과 삼두근을 균형 있게 발달시키는 맞춤 프로그램입니다.`,
      targetLevel: params.level,
      estimatedDurationMinutes: params.durationMinutes,
      warmUp: [
        "어깨 관절 회전 운동 (Arm Circles) 15회 x 2세트",
        "견갑골 숄더 블레이드 모빌리티 및 밴드 풀 어파트 20회",
        "가벼운 흉곽 확장 동적 스트레칭 3분"
      ],
      exercises: [
        {
          name: isBeginner ? "시티드 체스트 프레스 머신" : "바벨 벤치 프레스",
          targetMuscle: "대흉근 중간부 (가슴 전체)",
          sets: isBeginner ? 3 : 4,
          reps: isBeginner ? "12-15회" : "8-10회",
          restSeconds: isBeginner ? 60 : 90,
          equipment: isBeginner ? "체스트 프레스 머신" : "올림픽 바벨 & 평벤치",
          equipmentGuide: isBeginner
            ? "안장 높이를 조절하여 손잡이가 가슴 중앙(젖꼭지 라인)에 오도록 맞추고, 발바닥을 바닥에 밀착시킵니다."
            : "눈이 바벨 수직 아래에 위치하도록 눕고, 그립은 어깨너비보다 1.5배 넓게 잡습니다.",
          executionTips: [
            "가슴을 위로 열고 견갑골(날개뼈)을 살짝 모아 고정합니다.",
            "밀어낼 때 호흡을 내쉬고, 버티며 원위치할 때 숨을 들이마십니다.",
            "팔꿈치가 어깨 위로 과도하게 들리지 않도록 45~60도 각도를 유지하세요."
          ],
          alternativeExercise: "덤벨 플랫 벤치 프레스 or 푸시업"
        },
        {
          name: "인클라인 덤벨 프레스",
          targetMuscle: "대흉근 상부 (윗가슴)",
          sets: 3,
          reps: isBeginner ? "12회" : "10-12회",
          restSeconds: 60,
          equipment: "각도 조절 벤치 (30도 설정) 및 덤벨",
          equipmentGuide: "벤치 등받이 각도를 30도 내외로 설정합니다. 45도 이상 올라가면 어깨(전면 삼각근) 개입이 과해지니 주의하세요.",
          executionTips: [
            "덤벨을 가슴 윗선 높이로 내리며 흉곽을 팽창시킵니다.",
            "밀어올릴 때 양 덤벨이 부딪히지 않게 수직 궤적을 유지합니다.",
            "허리가 과도하게 꺾이지 않도록 복압을 유지합니다."
          ],
          alternativeExercise: "인클라인 체스트 프레스 머신"
        },
        {
          name: isBeginner ? "펙 덱 플라이 머신" : "케이블 크로스 오버",
          targetMuscle: "대흉근 안쪽 및 가슴 고립",
          sets: 3,
          reps: "12-15회",
          restSeconds: 60,
          equipment: isBeginner ? "펙 덱 플라이 머신" : "케이블 머신",
          equipmentGuide: isBeginner
            ? "의자 높이를 맞춰 팔꿈치가 어깨보다 살짝 낮은 위치에 패드가 닿도록 조절합니다."
            : "케이블 도르래를 가슴 상단에 맞추고 한 발을 앞으로 내딛어 중심을 잡습니다.",
          executionTips: [
            "큰 나무를 껴안는다는 느낌으로 팔꿈치를 살짝 굽힌 채 모아줍니다.",
            "가슴 안쪽을 1초간 강하게 쥐어짜듯 수축합니다.",
            "어깨가 앞으로 말려 나가지 않도록 등을 곧게 폅니다."
          ],
          alternativeExercise: "덤벨 플라이"
        },
        {
          name: "케이블 트라이셉스 푸시다운",
          targetMuscle: "상완삼두근 (팔 뒤쪽 외측두)",
          sets: 3,
          reps: isBeginner ? "12-15회" : "10-12회",
          restSeconds: 45,
          equipment: "케이블 머신 & 로프 or 일자 바",
          equipmentGuide: "도르래를 가장 높은 위치에 걸고 로프나 스트레이트 바를 장착합니다.",
          executionTips: [
            "팔꿈치를 옆구리에 단단히 고정하고 아래로만 펴냅니다.",
            "끝까지 내렸을 때 로프를 바깥쪽으로 벌리며 삼두근을 수축합니다.",
            "반동을 쓰지 않고 삼두근의 힘으로만 컨트롤합니다."
          ],
          alternativeExercise: "덤벨 킥백 or 오버헤드 덤벨 익스텐션"
        }
      ],
      coolDown: [
        "벽을 짚고 하는 가슴 전면 스트레칭 좌/우 각 20초",
        "머리 뒤로 팔을 넘겨 삼두근 늘려주기 좌/우 각 20초",
        "심호흡과 함께 림프 이완 2분"
      ]
    };
  }

  // Default: 하체 또는 전신 루틴
  return {
    routineTitle: isBeginner ? "초보자를 위한 하체 & 코어 밸런스 기초 루틴" : "하체 볼륨 & 둔근 타깃 파워 루틴",
    summary: "신체의 주 엔진인 대퇴사두근, 햄스트링, 둔근을 체계적으로 자극하여 대사율을 극대화하는 프로그램입니다.",
    targetLevel: params.level,
    estimatedDurationMinutes: params.durationMinutes,
    warmUp: [
      "고관절 회전 모빌리티 (Hip Circles) 15회",
      "자체 체중 에어 스쿼트 15회",
      "발목 관절 가동성 스트레칭 2분"
    ],
    exercises: [
      {
        name: isBeginner ? "레그 프레스 머신" : "바벨 백 스쿼트",
        targetMuscle: "대퇴사두근 및 둔근 (허벅지&엉덩이)",
        sets: 4,
        reps: isBeginner ? "12-15회" : "8-10회",
        restSeconds: 90,
        equipment: isBeginner ? "45도 파워 레그 프레스" : "스쿼트 랙 & 바벨",
        equipmentGuide: isBeginner
          ? "등받이에 엉덩이와 등을 빈틈없이 밀착하고, 발은 발판 중앙에 골반 너비로 11자보다 살짝 바깥을 보게 둡니다."
          : "안전바를 명치 아래 높이로 설정하고 승모근 상단에 바벨을 견착합니다.",
        executionTips: [
          "무릎이 안쪽으로 모이지 않도록 발가락 방향과 일치하게 굽힙니다.",
          "다리를 완전히 다 펴서 관절을 잠그지(Lock-out) 말고 95%만 폅니다.",
          "복압을 단단히 유지해 허리 부담을 줄입니다."
        ],
        alternativeExercise: "고블렛 스쿼트 (덤벨 지참)"
      },
      {
        name: "시티드 레그 익스텐션",
        targetMuscle: "대퇴사두근 (허벅지 앞쪽 분리도)",
        sets: 3,
        reps: "12-15회",
        restSeconds: 60,
        equipment: "레그 익스텐션 머신",
        equipmentGuide: "등받이를 조절해 무릎 관절 회전축이 머신의 회전축과 일치하게 하고, 발목 패드를 복사뼈 바로 위에 닿게 세팅합니다.",
        executionTips: [
          "손잡이를 꽉 잡고 엉덩이가 들리지 않게 아래로 고정합니다.",
          "발끝을 몸쪽으로 당긴 상태에서 무릎을 펴 정점에서 1초 정지합니다.",
          "내릴 때 무게를 통제하며 천천히 이완합니다."
        ],
        alternativeExercise: "덤벨 런지"
      },
      {
        name: "라잉 레그 컬",
        targetMuscle: "대퇴이두근 (허벅지 뒤쪽 햄스트링)",
        sets: 3,
        reps: "12-15회",
        restSeconds: 60,
        equipment: "라잉 레그 컬 머신",
        equipmentGuide: "엎드렸을 때 패드가 아킬레스건 바로 위에 위치하도록 롤러 길이를 조절합니다.",
        executionTips: [
          "허리가 과도하게 꺾여 뜨지 않도록 골반을 패드에 밀착합니다.",
          "발꿈치가 엉덩이에 닿을 듯이 빠르게 당긴 후 천천히 내립니다.",
          "햄스트링의 긴장을 놓지 않습니다."
        ],
        alternativeExercise: "루마니안 데드리프트 (덤벨)"
      }
    ],
    coolDown: [
      "허벅지 앞쪽 쿼드 폼롤러 스트레칭 2분",
      "햄스트링 및 종아리 좌식 전굴 스트레칭 30초 x 2회",
      "골반 비둘기 자세 (Pigeon Pose) 좌/우 각 30초"
    ]
  };
}

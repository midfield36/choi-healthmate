import { GoogleGenAI } from '@google/genai';
import { UserLevel, WorkoutGoal, WorkoutPlace, WorkoutRoutineResponse, RoutineFeedback } from '../types/healthmate';

// System prompt designed for Google AI Studio / Gemini API
export const HEALTHMATE_SYSTEM_INSTRUCTION = `당신은 15년 경력의 공인 수석 피트니스 코치이자 스포츠 생체역학 전문가 '헬스메이트 AI'입니다.
사용자의 신체 수준(초급/중급/고급), 운동 목적(근비대/체지방 감소/스트렝스/재활), 운동 장소(헬스장/홈트레이닝/야외), 선호 부위 및 시간을 바탕으로 과학적이고 부상 없는 최적의 맞춤 운동 프로그램을 구성해야 합니다.
특히 사용자가 직전 운동 후 제출한 난이도(너무 쉬움/적당함/너무 힘듦) 및 피드백이 제공되면, 이를 적극적으로 반영하여 볼륨, 세트, 중량 가이드, 휴식시간을 미세 조정하고 그 반영 사항을 'aiAdaptationNote'에 명시해야 합니다.

[작성 및 안전 원칙]
1. 수준별 난이도 조절:
   - 초급자(beginner): 머신 및 맨몸 위주, 12~15회 고반복, 명확하고 상세한 기구 세팅법 제공.
   - 중급자(intermediate): 프리웨이트+머신 복합, 8~12회 타깃 근비대 자극 위주.
   - 고급자(advanced): 복합 다관절 운동, 점진적 과부하, 6~10회 고강도 스트렝스/근비대 루틴.
2. 기구 사용법(equipmentGuide): 초보자도 바로 헬스장 머신을 쓸 수 있도록 의자 높이, 그립 위치, 궤적 조절법을 2~3문장으로 구체적으로 서술할 것.
3. 단계별 자세 가이드(stepGuide): 1단계(준비/셋업), 2단계(동작 수행), 3단계(수축 및 복귀)의 구체적 동작 설명 포함.
4. 초보자 흔한 실수(commonMistakes): 어깨 들림, 손목 꺾임, 반동 사용 등 위험 요인 2가지 경고.
5. 출력 형식: 마크다운 코드블록(\`\`\`json)이나 일반 텍스트 없이, 순수한 JSON 객체 형식만 반환해야 합니다.`;

// JSON Schema definition for Gemini responseSchema
export const WORKOUT_ROUTINE_SCHEMA = {
  type: "object",
  properties: {
    routineTitle: { type: "string", description: "루틴의 명확하고 동기부여되는 이름 (예: 초보자 가슴&삼두 기초 정복 루틴)" },
    summary: { type: "string", description: "이 루틴의 목적과 핵심 효과를 설명하는 1~2문장 요약" },
    aiAdaptationNote: { type: "string", description: "사용자의 지난 피드백(난이도/만족도)을 어떻게 분석하고 반영했는지 설명하는 코칭 메모" },
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
          name: { type: "string", description: "운동 공식 명칭" },
          targetMuscle: { type: "string", description: "주 타깃 근육" },
          sets: { type: "integer", description: "세트 수" },
          reps: { type: "string", description: "반복 횟수" },
          restSeconds: { type: "integer", description: "세트 간 권장 휴식 시간(초)" },
          equipment: { type: "string", description: "사용 기구" },
          equipmentGuide: { type: "string", description: "초보자를 위한 기구 세팅 가이드" },
          executionTips: {
            type: "array",
            items: { type: "string" },
            description: "자세, 호흡법, 수축/이완 요령"
          },
          alternativeExercise: { type: "string", description: "대체 운동" },
          videoSearchQuery: { type: "string", description: "유튜브 등에서 올바른 자세 검색용 키워드" },
          commonMistakes: {
            type: "array",
            items: { type: "string" },
            description: "초보자가 자주 범하는 잘못된 자세 2가지"
          },
          stepGuide: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "integer" },
                title: { type: "string" },
                description: { type: "string" }
              },
              required: ["step", "title", "description"]
            }
          }
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
  lastFeedback?: RoutineFeedback | null; // User feedback loop
}

export async function generateAIWorkoutRoutine(params: GenerateWorkoutParams): Promise<WorkoutRoutineResponse> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
                 '';

  let feedbackSection = '';
  if (params.lastFeedback) {
    const diffMap = {
      too_easy: '너무 쉬움 (운동 강도 및 볼륨 상향 요청)',
      just_right: '적당함 (현재 페이스 유지)',
      too_hard: '너무 힘듦 (피로도 완화 및 휴식시간 연장 요청)'
    };
    feedbackSection = `\n[사용자 직전 피드백 반영 요청]
- 이전 루틴 체감 난이도: ${diffMap[params.lastFeedback.difficulty]}
- 이전 만족도: ${params.lastFeedback.satisfaction}/5점
- 사용자 한줄 소감: "${params.lastFeedback.feedbackText || '없음'}"
* AI 코칭 지시: 위 피드백을 토대로 이번 세트수/반복수/휴식시간을 최적화하고, 'aiAdaptationNote'에 어떤 피드백을 수렴하여 개선했는지 구체적으로 적어주세요.`;
  }

  const userPrompt = `[사용자 프로필 및 요청]
- 운동 수준: ${params.level === 'beginner' ? '초급자 (헬스 0~6개월, 기구 사용법 미숙)' : params.level === 'intermediate' ? '중급자 (헬스 6개월~2년, 3대 운동 및 기본 자세 숙지)' : '상급자 (헬스 2년 이상, 고강도 점진적 과부하 가능)'}
- 운동 목적: ${params.goal === 'hypertrophy' ? '근비대 (근육량 증가 및 볼륨감)' : params.goal === 'fat_loss' ? '체지방 감소 및 린매스업' : params.goal === 'strength' ? '근력 및 스트렝스 향상' : '체형 교정 및 재활'}
- 운동 장소: ${params.place === 'gym' ? '헬스장 (피트니스 센터 머신 및 프리웨이트 완비)' : params.place === 'home' ? '홈트레이닝 (맨몸 및 덤벨/밴드)' : '야외 공원/철봉'}
- 선호 운동 부위: ${params.targetSplit}
- 1회 운동 희망 시간: ${params.durationMinutes}분
- 신체 특이사항/부상: ${params.limitations || '특이사항 없음 (건강)'}${feedbackSection}

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
          temperature: 0.2,
        }
      });

      const text = response.text?.trim();
      if (text) {
        const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson) as WorkoutRoutineResponse;
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini API call warning, using dynamic algorithmic fallback:', err);
    }
  }

  // Graceful realistic fallback tailored to user parameters and feedback
  return getRealisticFallbackRoutine(params);
}

export function getRealisticFallbackRoutine(params: GenerateWorkoutParams): WorkoutRoutineResponse {
  const isBeginner = params.level === 'beginner';
  const isIntermediate = params.level === 'intermediate';
  const feedback = params.lastFeedback;

  let adaptationNote = '사용자 프로필 기반으로 과학적인 자극점을 잡는 기본 맞춤 루틴입니다.';
  let setModifier = 0;
  let restModifier = 0;

  if (feedback) {
    if (feedback.difficulty === 'too_easy') {
      adaptationNote = `💡 지난 운동이 다소 수월했다는 피드백("${feedback.feedbackText || '쉬웠음'}")을 반영하여, 주요 종목의 세트 수를 1세트씩 추가하고 타깃 고립도를 높였습니다.`;
      setModifier = 1;
      restModifier = -10;
    } else if (feedback.difficulty === 'too_hard') {
      adaptationNote = `💡 지난 운동이 다소 버거웠다는 피드백("${feedback.feedbackText || '힘들었음'}")을 수용하여 세트 간 휴식시간을 15초 더 늘리고 관절 안정화 머신 위주로 무게 부담을 완화했습니다.`;
      setModifier = -1;
      restModifier = 15;
    } else {
      adaptationNote = `💡 이전 운동 만족도(${feedback.satisfaction}점)가 우수하여 현재 자극 수준을 유지하면서 핵심 부위 집중도를 극대화했습니다.`;
    }
  }

  if (params.targetSplit.includes('가슴') || params.targetSplit.includes('상체') || params.targetSplit.includes('삼두')) {
    return {
      routineTitle: isBeginner ? "초보자를 위한 가슴&삼두 안전 머신 정복 루틴" : isIntermediate ? "중급자 팩토럴 근비대 집중 푸시 루틴" : "상급자 고강도 체스트 & 트라이셉스 헤비 루틴",
      summary: `${params.level === 'beginner' ? '안전한 머신 위주로 흉근의 자극점을 잡고' : '다양한 각도의 압축 자극을 통해'} 가슴 대흉근과 삼두근을 균형 있게 발달시키는 맞춤 프로그램입니다.`,
      aiAdaptationNote: adaptationNote,
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
          sets: Math.max(3, (isBeginner ? 3 : 4) + setModifier),
          reps: isBeginner ? "12-15회" : "8-10회",
          restSeconds: Math.max(45, (isBeginner ? 60 : 90) + restModifier),
          equipment: isBeginner ? "체스트 프레스 머신" : "올림픽 바벨 & 평벤치",
          equipmentGuide: isBeginner
            ? "안장 높이를 조절하여 손잡이가 가슴 중앙(젖꼭지 라인)에 오도록 맞추고, 발바닥을 바닥에 밀착시킵니다."
            : "눈이 바벨 수직 아래에 위치하도록 눕고, 그립은 어깨너비보다 1.5배 넓게 잡습니다.",
          executionTips: [
            "가슴을 위로 열고 견갑골(날개뼈)을 살짝 모아 고정합니다.",
            "밀어낼 때 호흡을 내쉬고, 버티며 원위치할 때 숨을 들이마십니다.",
            "팔꿈치가 어깨 위로 과도하게 들리지 않도록 45~60도 각도를 유지하세요."
          ],
          alternativeExercise: "덤벨 플랫 벤치 프레스 or 푸시업",
          videoSearchQuery: "체스트 프레스 머신 올바른 자세 자극 꿀팁",
          commonMistakes: [
            "밀어낼 때 어깨가 앞으로 튀어나가며 승모근이 솟구치는 현상",
            "손목이 뒤로 90도 꺾여 관절에 부하가 집중되는 현상"
          ],
          stepGuide: [
            { step: 1, title: "셋업", description: "의자 높이를 유두선에 맞추고 견갑골을 등받이에 단단히 고정합니다." },
            { step: 2, title: "수축", description: "호흡을 내쉬며 손바닥 아래 도톰한 부위로 지긋이 밀어 가슴을 쥐어짭니다." },
            { step: 3, title: "이완", description: "2~3초간 가슴 근육이 늘어나는 텐션을 버티며 천천히 되돌아옵니다." }
          ]
        },
        {
          name: "인클라인 덤벨 프레스",
          targetMuscle: "대흉근 상부 (윗가슴)",
          sets: Math.max(3, 3 + setModifier),
          reps: isBeginner ? "12회" : "10-12회",
          restSeconds: Math.max(45, 60 + restModifier),
          equipment: "각도 조절 벤치 (30도 설정) 및 덤벨",
          equipmentGuide: "벤치 등받이 각도를 30도 내외로 설정합니다. 45도 이상 올라가면 전면 삼각근 개입이 과해집니다.",
          executionTips: [
            "덤벨을 가슴 윗선 높이로 내리며 흉곽을 팽창시킵니다.",
            "밀어올릴 때 양 덤벨이 부딪히지 않게 수직 궤적을 유지합니다.",
            "허리가 과도하게 꺾이지 않도록 복압을 유지합니다."
          ],
          alternativeExercise: "인클라인 체스트 프레스 머신",
          videoSearchQuery: "인클라인 덤벨 프레스 윗가슴 자극법",
          commonMistakes: [
            "벤치 각도를 너무 높여 가슴보다 어깨로만 미는 현상",
            "내려올 때 팔꿈치가 뒤로 과하게 빠져 회전근개에 충격을 주는 자세"
          ],
          stepGuide: [
            { step: 1, title: "덤벨 안착", description: "무릎을 튕겨 덤벨을 어깨 윗선에 안전하게 올리고 눕습니다." },
            { step: 2, title: "상방 압축", description: "윗가슴의 수축감을 느끼며 팔을 모아 올립니다." },
            { step: 3, title: "통제된 신장", description: "가슴 상부가 팽팽하게 당겨질 때까지 통제하며 내립니다." }
          ]
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
          alternativeExercise: "덤벨 플라이",
          videoSearchQuery: "펙덱플라이 안쪽 가슴 모으기 가이드",
          commonMistakes: [
            "팔꿈치를 완전히 펴서 팔꿈치 관절에 과부하를 주는 실수",
            "모을 때 등이 둥글게 굽어 가슴 수축이 풀리는 실수"
          ],
          stepGuide: [
            { step: 1, title: "그립 및 아치", description: "가슴을 활짝 열고 팔꿈치를 살짝 구부려 패드에 댑니다." },
            { step: 2, title: "포옹 수축", description: "원호를 그리며 가슴골을 쥐어짜듯 모아줍니다." },
            { step: 3, title: "텐션 유지 이완", description: "중량이 닿기 직전까지만 서서히 늘려줍니다." }
          ]
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
          alternativeExercise: "덤벨 킥백 or 오버헤드 덤벨 익스텐션",
          videoSearchQuery: "케이블 푸시다운 삼두 불태우기 꿀팁",
          commonMistakes: [
            "팔꿈치가 앞뒤로 흔들리며 어깨와 체중으로 누르는 현상",
            "손목을 과도하게 꺾어 전완근에만 힘이 들어가는 현상"
          ],
          stepGuide: [
            { step: 1, title: "팔꿈치 고정", description: "상체를 살짝 숙이고 팔꿈치를 몸통 옆에 못 박듯 고정합니다." },
            { step: 2, title: "수직 신전", description: "호흡을 내쉬며 바닥 방향으로 팔을 쭉 뻗어 삼두근을 압축합니다." },
            { step: 3, title: "90도 복귀", description: "팔꿈치가 딸려 올라가지 않도록 직각까지만 접어 올립니다." }
          ]
        }
      ],
      coolDown: [
        "벽을 짚고 하는 가슴 전면 스트레칭 좌/우 각 20초",
        "머리 뒤로 팔을 넘겨 삼두근 늘려주기 좌/우 각 20초",
        "심호흡과 함께 림프 이완 2분"
      ]
    };
  }

  // Default: 하체 루틴
  return {
    routineTitle: isBeginner ? "초보자를 위한 하체 & 코어 밸런스 기초 루틴" : "하체 볼륨 & 둔근 타깃 파워 루틴",
    summary: "신체의 주 엔진인 대퇴사두근, 햄스트링, 둔근을 체계적으로 자극하여 대사율을 극대화하는 프로그램입니다.",
    aiAdaptationNote: adaptationNote,
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
        sets: Math.max(3, 4 + setModifier),
        reps: isBeginner ? "12-15회" : "8-10회",
        restSeconds: Math.max(60, 90 + restModifier),
        equipment: isBeginner ? "45도 파워 레그 프레스" : "스쿼트 랙 & 바벨",
        equipmentGuide: isBeginner
          ? "등받이에 엉덩이와 등을 밀착하고 발은 발판 중앙에 골반 너비로 11자보다 살짝 바깥을 보게 둡니다."
          : "안전바를 명치 아래 높이로 설정하고 승모근 상단에 바벨을 견착합니다.",
        executionTips: [
          "무릎이 안쪽으로 모이지 않도록 발가락 방향과 일치하게 굽힙니다.",
          "다리를 완전히 펴 관절을 잠그지(Lock-out) 말고 95%만 폅니다.",
          "복압을 단단히 유지해 허리 부담을 줄입니다."
        ],
        alternativeExercise: "고블렛 스쿼트 (덤벨 지참)",
        videoSearchQuery: "레그프레스 머신 무릎 안 아픈 발위치 꿀팁",
        commonMistakes: [
          "발판을 밀 때 무릎을 100% 튕겨 펴서 연골에 충격을 주는 행동",
          "내려올 때 엉덩이가 말려 올라가 요추에 부담을 주는 현상"
        ],
        stepGuide: [
          { step: 1, title: "발 위치", description: "골반 너비로 발판 중앙에 위치하고 엉덩이를 시트에 밀착합니다." },
          { step: 2, title: "복압 지지", description: "숨을 들이마셔 복압을 채우고 무릎이 90도가 될 때까지 내립니다." },
          { step: 3, title: "뒤꿈치 추진", description: "발뒤꿈치로 발판을 힘차게 밀어 올리며 무릎을 살짝 굽힌 채 멈춥니다." }
        ]
      },
      {
        name: "시티드 레그 익스텐션",
        targetMuscle: "대퇴사두근 (허벅지 앞쪽 분리도)",
        sets: 3,
        reps: "12-15회",
        restSeconds: 60,
        equipment: "레그 익스텐션 머신",
        equipmentGuide: "무릎 관절 회전축이 머신의 회전축과 일치하게 등받이를 맞추고, 발목 패드를 복사뼈 바로 위에 세팅합니다.",
        executionTips: [
          "손잡이를 꽉 잡고 엉덩이가 들리지 않게 아래로 고정합니다.",
          "발끝을 몸쪽으로 당긴 상태에서 무릎을 펴 정점에서 1초 정지합니다.",
          "내릴 때 무게를 통제하며 천천히 이완합니다."
        ],
        alternativeExercise: "덤벨 런지",
        videoSearchQuery: "레그 익스텐션 대퇴사두근 자극 극대화",
        commonMistakes: ["반동으로 차올려 정점 수축 없이 내려놓는 실수"],
        stepGuide: [
          { step: 1, title: "패드 조절", description: "발목 복사뼈 위에 롤러를 닿게 하고 엉덩이를 뒤에 밀착합니다." },
          { step: 2, title: "신전 정지", description: "허벅지 앞쪽 근육을 쥐어짜며 차올려 1초간 정지합니다." },
          { step: 3, title: "천천히 복귀", description: "무게를 버티며 3초간 서서히 내려놓습니다." }
        ]
      }
    ],
    coolDown: [
      "허벅지 앞쪽 쿼드 폼롤러 스트레칭 2분",
      "햄스트링 및 종아리 좌식 전굴 스트레칭 30초 x 2회",
      "골반 비둘기 자세 (Pigeon Pose) 좌/우 각 30초"
    ]
  };
}

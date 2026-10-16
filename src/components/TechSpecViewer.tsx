import React, { useState } from 'react';
import { Copy, Check, FileText, Code2, Database, Cpu, ShieldCheck } from 'lucide-react';

export const TechSpecViewer: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto text-neutral-200 text-xs sm:text-sm">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Technical Architecture & Implementation Spec</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          헬스메이트 1차 MVP 기술 설계 및 구현 가이드
        </h1>
        <p className="text-neutral-400 text-xs mt-1">
          15년 차 시니어 풀스택 모바일 아키텍트의 크로스 플랫폼 & Google AI Studio(Gemini API) 연동 명세서
        </p>
      </div>

      {/* Section 1 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> 1. 기술 스택 및 시스템 아키텍처
          </h2>
        </div>

        <div className="space-y-3 leading-relaxed text-neutral-300">
          <h3 className="font-bold text-white text-sm">1.1 프레임워크 및 인프라 선정 사유</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-300">
            <li>
              <strong className="text-white">크로스 플랫폼 클라이언트 (React Native with Expo / Flutter):</strong> iOS/Android 단일 코드베이스로 빠른 배포 가능. 백엔드가 동일한 REST/JSON 계약을 따르며, 피트니스 앱 특유의 스톱워치, 백그라운드 타이머, 로컬 알림(휴식 알림)과 하드웨어 가속 차트 렌더링에 최적화.
            </li>
            <li>
              <strong className="text-white">백엔드 & BFF (Node.js TypeScript + Express / Firebase Cloud Functions):</strong> Gemini API 호출 보안(API Key 숨김 및 프록시), 요청 파라미터 검증, JWT 인증 처리.
            </li>
            <li>
              <strong className="text-white">데이터베이스 (PostgreSQL / Supabase or Cloud Firestore):</strong> 유저 프로필, 일별 운동 세트 로그, 신체 스펙(인바디) 시계열 데이터의 관계형 무결성 보장 및 빠른 쿼리.
            </li>
            <li>
              <strong className="text-white">AI 엔진 (Google AI Studio - Gemini 2.5 Flash):</strong> 지연시간(Latency) 최소화와 구조화된 JSON Schema 강제 출력(Structured Outputs) 지원. 세트/반복수/기구사용법을 100% 정형 포맷으로 보장.
            </li>
          </ul>

          <h3 className="font-bold text-white text-sm pt-2">1.2 시스템 데이터 흐름도 (Data Flow)</h3>
          <div className="p-3 bg-neutral-950 rounded-xl font-mono text-[11px] text-neutral-300 border border-neutral-800 overflow-x-auto whitespace-pre">
{`[모바일 클라이언트 (App)]
      │  1. 사용자 입력 전송 (수준: 초급, 목적: 근비대, 장소: 헬스장, 시간: 50분)
      ▼
[보안 BFF 백엔드 API (/api/coach/generate)]
      │  2. 유저 인증 검증 + 프롬프트 템플릿 주입 + System Instruction 결합
      ▼
[Google AI Studio (Gemini 2.5 Flash API)]
      │  3. Structured JSON Schema 기반 연산 (세트/반복/기구사용법/휴식초)
      ▼
[보안 BFF 백엔드] ──(4. 스키마 유효성 검증)──► [모바일 클라이언트]
      │                                                │ 5. 오늘 운동 시작
      ▼                                                ▼
[데이터베이스 (PostgreSQL)] ◄──────── [운동일지 완료 & 세트 기록 저장]`}
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> 2. 데이터베이스 스키마 (1차 MVP 기준)
          </h2>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-neutral-300">
            관계형 무결성과 시계열 조회를 고려한 PostgreSQL DDL 설계 (Users, Workouts, WorkoutLogs, BodyRecords):
          </p>

          <pre className="p-3 bg-neutral-950 rounded-xl font-mono text-[11px] text-emerald-300 border border-neutral-800 overflow-x-auto leading-relaxed">
{`-- 1. 사용자 테이블 (Users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    goal VARCHAR(30) NOT NULL DEFAULT 'hypertrophy', -- 'hypertrophy', 'fat_loss', 'strength', 'rehab'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 운동 일지 마스터 (WorkoutLogs)
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    routine_title VARCHAR(100) NOT NULL,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 운동 일지 세부 세트 (WorkoutLogSets)
CREATE TABLE workout_log_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL,
    set_number INTEGER NOT NULL,
    weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 신체 변화 및 인바디 기록 (BodyRecords)
CREATE TABLE body_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2) NOT NULL,
    skeletal_muscle_kg NUMERIC(5, 2),
    body_fat_percentage NUMERIC(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 빠른 조회를 위한 인덱스
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, workout_date DESC);
CREATE INDEX idx_body_records_user_date ON body_records(user_id, record_date DESC);`}
          </pre>
        </div>
      </div>

      {/* Section 3 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> 3. Google AI 스튜디오 통합 설계 (Gemini API)
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <h3 className="font-bold text-white text-sm">3.1 System Instruction (시스템 지시문)</h3>
          <div className="p-3 bg-neutral-950 rounded-xl text-neutral-300 font-mono text-[11px] border border-neutral-800 whitespace-pre-wrap">
{`당신은 15년 경력의 공인 수석 피트니스 코치이자 스포츠 생체역학 전문가 '헬스메이트 AI'입니다.
사용자의 신체 수준(초급/중급/고급), 운동 목적(근비대/체지방 감소/스트렝스/재활), 운동 장소(헬스장/홈트레이닝/야외), 선호 부위 및 시간을 바탕으로 과학적이고 부상 없는 최적의 맞춤 운동 프로그램을 구성해야 합니다.

[작성 및 안전 원칙]
1. 수준별 난이도 조절:
   - 초급자(beginner): 머신 및 맨몸 위주, 12~15회 고반복, 명확하고 상세한 기구 세팅법 제공.
   - 중급자(intermediate): 프리웨이트+머신 복합, 8~12회 타깃 근비대 자극 위주.
   - 고급자(advanced): 복합 다관절 운동, 점진적 과부하, 6~10회 고강도 스트렝스/근비대 루틴.
2. 기구 사용법(equipmentGuide): 초보자도 바로 헬스장 머신을 쓸 수 있도록 의자 높이, 그립 위치, 궤적 조절법을 2~3문장으로 구체적으로 서술할 것.
3. 실행 팁(executionTips): 호흡법(수축 시 날숨, 이완 시 들숨)과 부상 위험 부위(허리, 어깨, 무릎 등) 주의사항을 포함할 것.
4. 출력 형식: 마크다운 코드블록이나 불필요한 텍스트 없이, 순수한 JSON 객체 형식만 반환해야 합니다.`}
          </div>

          <h3 className="font-bold text-white text-sm pt-2">3.2 입/출력 예시 및 JSON Schema (Gemini Structured Outputs)</h3>
          <p className="text-neutral-400">
            Gemini 2.5 Flash의 responseSchema에 바인딩하여 100% 문법 에러 없는 파싱을 강제합니다:
          </p>
          <pre className="p-3 bg-neutral-950 rounded-xl font-mono text-[11px] text-amber-300 border border-neutral-800 overflow-x-auto">
{`{
  "routineTitle": "초보자 가슴&삼두 머신 기초 정복 루틴",
  "summary": "안전한 궤적의 머신 위주로 가슴 대흉근에 올바른 자극을 전달하는 프로그램",
  "targetLevel": "beginner",
  "estimatedDurationMinutes": 50,
  "warmUp": ["어깨 회전 스트레칭 20회", "밴드 풀 어파트 15회 x 2세트"],
  "exercises": [
    {
      "name": "시티드 체스트 프레스 머신",
      "targetMuscle": "대흉근 중간부 (가슴)",
      "sets": 3,
      "reps": "12-15회",
      "restSeconds": 60,
      "equipment": "체스트 프레스 머신",
      "equipmentGuide": "안장 높이를 조절하여 손잡이가 젖꼭지 라인에 오도록 맞추고 발을 바닥에 밀착시킵니다.",
      "executionTips": ["가슴을 활짝 열고 견갑골을 고정합니다", "밀어낼 때 호흡을 내쉽니다", "팔꿈치가 어깨보다 위로 들리지 않게 주의"],
      "alternativeExercise": "덤벨 플랫 벤치 프레스"
    }
  ],
  "coolDown": ["벽 짚고 가슴 스트레칭 좌우 20초", "삼두근 후면 스트레칭"]
}`}
          </pre>
        </div>
      </div>

      {/* Section 4 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <Code2 className="w-4 h-4" /> 4. 핵심 소스 코드 (AI 연동 및 프론트엔드)
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <h3 className="font-bold text-white text-sm">4.1 Gemini API 클라이언트 연동 모듈</h3>
          <pre className="p-3 bg-neutral-950 rounded-xl font-mono text-[11px] text-neutral-300 border border-neutral-800 overflow-x-auto">
{`// services/geminiCoach.ts
import { GoogleGenAI } from '@google/genai';

export async function requestWorkoutRoutine(userParams: {
  level: string;
  goal: string;
  place: string;
  targetSplit: string;
  durationMinutes: number;
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: \`수준: \${userParams.level}, 목적: \${userParams.goal}, 장소: \${userParams.place}, 부위: \${userParams.targetSplit}, 시간: \${userParams.durationMinutes}분\`,
    config: {
      systemInstruction: HEALTHMATE_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: WORKOUT_ROUTINE_SCHEMA,
      temperature: 0.2
    }
  });
  return JSON.parse(response.text.trim());
}`}
          </pre>
        </div>
      </div>

      {/* Section 5 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 5. 보안 및 확장성 고려사항
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-white">API Key 보안 격리:</strong> 클라이언트 번들 내 Gemini API Key를 직접 하드코딩하지 않고, Express/Next.js/Cloud Run 프록시 서버 환경변수로 격리하여 무단 탈취 및 쿼터 남용을 차단.
            </li>
            <li>
              <strong className="text-white">신체 및 건강 민감 데이터 보호:</strong> 체중, 골격근량 등 건강 수치는 암호화(AES-256) 전송 및 저장, 익명화된 ID 매핑을 통해 개인정보보호법(PIPA/HIPAA) 규정 준수.
            </li>
            <li>
              <strong className="text-white">2차/3차 확장 대비 모듈형 설계:</strong>
              <div className="mt-1 text-neutral-400">
                - 2차: Gemini Multimodal(Vision)을 통한 <strong>식단 사진 칼로리/영양소 자동 분석</strong> 기능 추가 용이<br />
                - 3차: 인근 헬스장 <strong>일일권 간편 결제(PG 연동) 및 PT 트레이너 일지 공유 시스템</strong> 연계 가능한 API 구조
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Section 6: Major Enhancement Architectures */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base font-bold text-indigo-400 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> 6. MVP 고도화 및 신규 기능 기술 명세
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-emerald-400 font-bold text-sm">6.1 AI 맞춤 코치 강화 & 피드백 루프 (Adaptive Reinforcement)</h4>
            <p>
              - <strong>자세 가이드 & 영상 연동:</strong> 각 운동별 <code>stepGuide(셋업-수축-이완)</code> 및 <code>commonMistakes(초보자 실수 방지)</code> 메타데이터를 구조화하고, 딥링크를 통해 검증된 YouTube 튜토리얼을 1초 내 재생.<br />
              - <strong>지능형 피드백 루프:</strong> 운동 수행 후 사용자가 체감 난이도(너무 쉬움/적당함/너무 힘듦)와 만족도(1~5점)를 기록하면, 다음 프롬프트에 <code>lastFeedback</code> 매개변수로 주입되어 세트 수(±1세트), 휴식 시간(±15초), 운동 강도가 지능적으로 자동 보정됨.
            </p>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-blue-400 font-bold text-sm">6.2 운동일지 및 시각화 고도화 (Multi-Period Analytics)</h4>
            <p>
              - <strong>주간/월간 중량 및 볼륨 비교:</strong> 이번 주 vs 지난 주 총 누적 볼륨(kg), 완료 세트 수, 운동 시간을 비교하고 성장률(+12.4% ▲)을 실시간 집계.<br />
              - <strong>종목별 성장 추이 그래프:</strong> 체스트 프레스, 랫풀다운, 레그프레스 등 특정 종목을 선택하여 1RM 최고 중량과 세션별 총 볼륨 변화 곡선을 SVG 차트로 가시화.
            </p>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-indigo-400 font-bold text-sm">6.3 커뮤니티, 챌린지 및 Q&A 아키텍처</h4>
            <p>
              - <strong>목표 달성 챌린지:</strong> 주 4회 출석, 2만kg 볼륨, 바디프로필 등 단체 미션 참여 및 진행률 트래킹.<br />
              - <strong>오운완 피드 & Q&A 게시판:</strong> 사용자 간 질문(손목 통증, 식단 구성 등) 등록 및 공인 트레이너 검증 답변 뱃지 제공.<br />
              - <strong>헬스메이트 매칭:</strong> 운동 목표(근비대/다이어트), 선호 시간대(새벽/저녁), 활동 헬스장 거리 기반 매칭 스코어(Match Score) 산출 및 파트너 신청 인터랙션.
            </p>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-teal-400 font-bold text-sm">6.4 비전 AI 멀티모달 식단 분석 (Vision AI Nutrition Pipeline)</h4>
            <p>
              - <strong>Gemini 2.5 Flash Vision Multimodal:</strong> 업로드된 음식 사진을 인라인 Base64로 전송하여 메뉴명, 1회 제공량 칼로리, 탄수화물·단백질·지방(g)을 정형화된 JSON Schema로 파싱.<br />
              - <strong>목표별 실시간 영양 조언:</strong> 근비대(Hypertrophy) 유저에게는 근합성 글리코겐 보충 가이드를, 다이어트(Fat-loss) 유저에게는 포화지방 제한 및 식이섬유 보완 피드백을 실시간 제공.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

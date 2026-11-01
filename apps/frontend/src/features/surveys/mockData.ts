import type { Answers, MyResponseStatus, Survey } from './types.ts';

/**
 * 개발용 예시 설문. documents/test_UI 시안의 예시를 옮겼다.
 * 마감일은 오늘을 기준으로 잡아 언제 열어도 진행 중·마감 설문이 함께 보인다.
 */

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 0, 0);
  return date.toISOString();
}

export const mockSurveys: Survey[] = [
  {
    id: 'lunch-2026-10',
    title: '10월 급식 만족도 조사',
    department: '생활복지부',
    audience: '전교생',
    identity: 'anonymous',
    closesAt: daysFromNow(1),
    questions: [
      {
        id: 'q1',
        type: 'scale',
        title: '10월 급식에 전반적으로 얼마나 만족했나요?',
        required: true,
        steps: 5,
        minLabel: '전혀 만족하지 않음',
        maxLabel: '매우 만족',
      },
      {
        id: 'q2',
        type: 'multiple',
        title: '아쉬웠던 점을 모두 골라주세요.',
        required: false,
        options: ['양', '간', '메뉴 다양성', '배식 시간', '없음'],
      },
      {
        id: 'q3',
        type: 'text',
        title: '다음 달 급식에 바라는 점이 있다면 적어주세요.',
        required: false,
        maxLength: 500,
        placeholder: '선택 사항입니다.',
      },
    ],
  },
  {
    id: 'sports-day-2026',
    title: '2학기 체육대회 종목 선호 조사',
    department: '체육부',
    audience: '전교생',
    identity: 'anonymous',
    closesAt: daysFromNow(4),
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '올해 체육대회에서 가장 참여하고 싶은 단체 종목은 무엇인가요?',
        required: true,
        options: ['피구', '축구', '줄다리기', '반 대항 계주', '농구'],
      },
      {
        id: 'q2',
        type: 'multiple',
        title: '새로 추가됐으면 하는 종목을 골라주세요.',
        required: false,
        maxSelections: 2,
        options: [
          '족구',
          '배드민턴 복식',
          '단체 줄넘기',
          '교내 e스포츠',
          '추가 종목 필요 없음',
        ],
      },
      {
        id: 'q3',
        type: 'scale',
        title: '작년 체육대회 진행 방식에 얼마나 만족했나요?',
        required: true,
        steps: 5,
        minLabel: '전혀 만족하지 않음',
        maxLabel: '매우 만족',
      },
      {
        id: 'q4',
        type: 'single',
        title: '결승 경기는 언제 진행하는 게 좋을까요?',
        required: true,
        options: ['오전 (1~4교시)', '오후 (5~7교시)', '상관없음'],
      },
      {
        id: 'q5',
        type: 'single',
        title: '반별 응원 도구 지원금은 어떻게 쓰는 게 좋을까요?',
        required: false,
        options: [
          '반 티셔츠 제작에 보태기',
          '응원 도구 구입',
          '학년 공동 응원으로 모아서 쓰기',
        ],
      },
      {
        id: 'q6',
        type: 'text',
        title: '체육대회와 관련해 학생회에 하고 싶은 말이 있다면 적어주세요.',
        required: false,
        maxLength: 500,
        placeholder:
          '선택 사항입니다. 개인을 특정할 수 있는 내용은 적지 말아주세요.',
      },
    ],
  },
  {
    id: 'dorm-laundry-2026',
    title: '기숙사 세탁실 이용 시간 개선 설문',
    department: '생활복지부',
    audience: '기숙사 생활 학생',
    identity: 'student-id',
    closesAt: daysFromNow(7),
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '세탁실을 주로 이용하는 시간대는 언제인가요?',
        required: true,
        options: [
          '18:00 이전',
          '18:00~21:00',
          '21:00~22:00',
          '22:00 이후를 원함',
        ],
      },
      {
        id: 'q2',
        type: 'single',
        title: '이용 종료 시각을 23:00로 늦추면 이용하겠나요?',
        required: true,
        options: ['자주 이용하겠다', '가끔 이용하겠다', '이용하지 않겠다'],
      },
      {
        id: 'q3',
        type: 'text',
        title: '세탁실 이용에 불편한 점을 적어주세요.',
        required: false,
        maxLength: 500,
      },
    ],
  },
  {
    id: 'council-review-2026-1',
    title: '1학기 학생회 활동 평가',
    department: '기획부',
    audience: '전교생',
    identity: 'anonymous',
    closesAt: daysFromNow(-20),
    questions: [
      {
        id: 'q1',
        type: 'scale',
        title: '1학기 학생회 활동에 얼마나 만족했나요?',
        required: true,
        steps: 5,
        minLabel: '전혀 만족하지 않음',
        maxLabel: '매우 만족',
      },
    ],
  },
  {
    id: 'festival-booth-2026',
    title: '축제 부스 운영 방식 설문',
    department: '문화부',
    audience: '전교생',
    identity: 'anonymous',
    closesAt: daysFromNow(-41),
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '부스 운영 시간은 어느 쪽이 좋나요?',
        required: true,
        options: ['오전만', '오후만', '하루 종일'],
      },
    ],
  },
];

/** 개발용 내 응답 기록 */
export const mockMyResponses: Record<
  string,
  { status: MyResponseStatus; answers: Answers }
> = {
  'lunch-2026-10': {
    status: 'submitted',
    answers: { q1: 4, q2: ['배식 시간'] },
  },
  'council-review-2026-1': { status: 'submitted', answers: { q1: 3 } },
};

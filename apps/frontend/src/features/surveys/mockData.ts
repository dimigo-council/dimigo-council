import type { Answers, MyResponseStatus, Survey } from './types.ts';

/**
 * 개발용 예시 설문. Figma(설문)의 예시를 옮겼다. 응답 수는 Figma의 참여율에 맞췄다.
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
    id: 'dimi-sports-2026',
    title: '디미체전 운영 만족도 조사',
    intro: '디미체전 종목과 진행에 대한 여러분의 의견을 들려주세요.',
    department: '생활스포츠부',
    audience: '전교생',
    collectsClass: false,
    activity: { id: '24', title: '디미체전 운영 개선' },
    closesAt: daysFromNow(2),
    responses: 397,
    target: 640,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '디미체전 운영에 얼마나 만족했나요?',
        required: true,
        options: ['매우 만족', '만족', '보통', '불만족'],
      },
      {
        id: 'q2',
        type: 'multiple',
        title: '가장 개선이 필요한 부분을 모두 골라 주세요.',
        required: true,
        options: ['종목 구성', '경기 일정', '진행 방식'],
      },
      {
        id: 'q3',
        type: 'short',
        title: '가장 기억에 남는 종목은 무엇인가요?',
        required: false,
        maxLength: 100,
      },
      {
        id: 'q4',
        type: 'long',
        title: '내년 디미체전에 바라는 점을 자유롭게 적어 주세요.',
        required: false,
        maxLength: 1000,
      },
    ],
  },
  {
    id: 'suneung-cheer-2026',
    title: '수능 응원 이벤트 의견 조사',
    intro: '수능 응원 이벤트에서 하고 싶은 활동을 골라주세요.',
    department: '홍보부',
    audience: '1학년, 2학년',
    collectsClass: false,
    activity: { id: '25', title: '수능 응원 이벤트 운영' },
    closesAt: daysFromNow(5),
    responses: 307,
    target: 640,
    questions: [
      {
        id: 'q1',
        type: 'multiple',
        title: '수능 응원 이벤트에서 하고 싶은 활동을 모두 골라주세요.',
        required: true,
        options: [
          '응원 현수막',
          '간식 나눔',
          '응원 메시지 롤링페이퍼',
          '교문 응원',
        ],
      },
      {
        id: 'q2',
        type: 'long',
        title: '선배들에게 전하고 싶은 응원 한마디를 적어주세요.',
        required: false,
        maxLength: 200,
      },
    ],
  },
  {
    id: 'lunch-2026-11',
    title: '11월 급식 만족도 정기 조사',
    intro: '메뉴, 양, 배식 시간 등 급식 전반에 대해 평가해주세요.',
    department: '바른생활부',
    audience: '전교생',
    collectsClass: false,
    activity: { id: '26', title: '11월 급식 만족도 조사' },
    closesAt: daysFromNow(6),
    responses: 224,
    target: 640,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '11월 급식에 전반적으로 얼마나 만족했나요?',
        required: true,
        options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'],
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
        type: 'long',
        title: '다음 달 급식에 바라는 점이 있다면 적어주세요.',
        required: false,
        maxLength: 500,
        placeholder: '선택 사항입니다.',
      },
    ],
  },
  {
    id: 'parcel-time-2026',
    title: '택배 수령 시간 확대 의견 수렴',
    intro: '택배 보관함 수령 시간대에 대한 의견을 모읍니다.',
    department: '총무부',
    audience: '전교생',
    collectsClass: true,
    activity: { id: '27', title: '택배 보관함 수령 시간 확대' },
    closesAt: daysFromNow(9),
    responses: 134,
    target: 640,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '택배를 주로 찾고 싶은 시간대는 언제인가요?',
        required: true,
        options: ['점심시간', '저녁시간', '저녁 자습 후', '상관없음'],
      },
      {
        id: 'q2',
        type: 'long',
        title: '택배 보관함 이용에 불편한 점을 적어주세요.',
        required: false,
        maxLength: 500,
      },
    ],
  },
  {
    id: 'sns-2026',
    title: '학생회 SNS 운영 방향 설문',
    intro: '학생회 공식 계정에서 보고 싶은 콘텐츠를 조사했어요.',
    department: '홍보부',
    audience: '전교생',
    collectsClass: false,
    activity: { id: '19', title: '학생회 SNS 운영 방향 개선' },
    closesAt: daysFromNow(-25),
    responses: 557,
    target: 640,
    questions: [
      {
        id: 'q1',
        type: 'multiple',
        title: '학생회 계정에서 보고 싶은 콘텐츠를 골라주세요.',
        required: true,
        options: ['활동 소식', '행사 사진', '급식 메뉴', '설문 결과'],
      },
    ],
  },
  {
    id: 'art-festival-2026',
    title: '예술제 프로그램 수요 조사',
    intro: '예술제에서 보고 싶은 프로그램을 조사했어요.',
    department: '환경예술부',
    audience: '전교생',
    collectsClass: false,
    activity: { id: '18', title: '예술제 운영 계획 수립' },
    closesAt: daysFromNow(-20),
    responses: 474,
    target: 640,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '예술제에서 가장 보고 싶은 프로그램은 무엇인가요?',
        required: true,
        options: ['밴드 공연', '댄스 공연', '전시', '연극'],
      },
    ],
  },
];

/** 개발용 내 응답 기록 */
export const mockMyResponses: Record<
  string,
  { status: MyResponseStatus; answers: Answers }
> = {
  'lunch-2026-11': {
    status: 'submitted',
    answers: { q1: '만족', q2: ['배식 시간'] },
  },
  'sns-2026': { status: 'submitted', answers: { q1: ['활동 소식'] } },
};

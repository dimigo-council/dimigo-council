import { mockSurveys } from '../surveys/mockData.ts';
import type { AdminSurvey } from './types.ts';

/**
 * 개발용 예시 설문 (학생회 화면). 공개된 설문은 학생 화면 설문 예시(features/surveys)에
 * 만든 사람과 공개일을 붙였고, 작성 중·예약 설문은 설문 만들기 화면을 보려고 만든 예시다.
 */

function daysFrom(days: number, hours = 9, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const published: Record<
  string,
  Pick<AdminSurvey, 'owner'> & { openedDaysAgo: number }
> = {
  'dimi-sports-2026': { owner: '조원', openedDaysAgo: 10 },
  'suneung-cheer-2026': { owner: '문세희', openedDaysAgo: 6 },
  'lunch-2026-11': { owner: '최유나', openedDaysAgo: 5 },
  'parcel-time-2026': { owner: '정민준', openedDaysAgo: 2 },
  'sns-2026': { owner: '문세희', openedDaysAgo: 40 },
  'art-festival-2026': { owner: '김호태', openedDaysAgo: 34 },
};

export const mockAdminSurveys: AdminSurvey[] = [
  ...mockSurveys.map((survey) => {
    const extra = published[survey.id];
    return {
      ...survey,
      stage: 'published' as const,
      owner: extra.owner,
      opensAt: daysFrom(-extra.openedDaysAgo),
      savedAt: daysFrom(-extra.openedDaysAgo - 1, 17),
      reviewRequested: true,
    };
  }),
  {
    id: 'exam-study-room-2026',
    title: '시험 기간 자습실 수요 조사',
    department: '바른생활부',
    owner: '최유나',
    audience: '전교생',
    collectsClass: false,
    stage: 'draft',
    intro:
      '시험 2주 전 자습실 연장 운영이 필요한지 알아보려고 합니다. 이름은 수집하지 않으며 바른생활부만 결과를 확인합니다.',
    opensAt: daysFrom(4),
    closesAt: daysFrom(11, 23, 59),
    savedAt: daysFrom(-1, 14, 20),
    responses: 0,
    target: 640,
    reviewRequested: false,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '시험 기간에 자습실을 이용하나요?',
        required: true,
        options: ['거의 매일', '일주일에 2~3번', '거의 안 함'],
      },
      {
        id: 'q2',
        type: 'single',
        title: '연장 운영한다면 몇 시까지가 좋을까요?',
        required: true,
        options: ['22:00', '22:30', '23:00', '연장 필요 없음'],
      },
      {
        id: 'q3',
        type: 'multiple',
        title: '자습실에서 불편한 점을 모두 골라주세요.',
        required: false,
        options: ['콘센트 부족', '좌석 부족', '소음', '조명', '냉난방'],
      },
      {
        id: 'q4',
        type: 'single',
        title: '연장 운영이 성적 관리에 도움이 될 것 같나요?',
        required: true,
        options: ['매우 그렇다', '그렇다', '보통이다', '아니다'],
      },
      {
        id: 'q5',
        type: 'long',
        title: '그 밖에 바라는 점을 자유롭게 적어주세요.',
        required: false,
        maxLength: 500,
      },
    ],
  },
  {
    id: 'club-fair-2026',
    title: '동아리 박람회 부스 배치 의견',
    department: '문예창작부',
    owner: '한도윤',
    audience: '동아리 부장',
    collectsClass: true,
    stage: 'draft',
    intro: '',
    closesAt: daysFrom(12, 23, 59),
    savedAt: daysFrom(-3, 21, 5),
    responses: 0,
    target: 38,
    reviewRequested: false,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '원하는 부스 위치를 골라주세요.',
        required: true,
        options: ['본관 1층 로비', '체육관', ''],
      },
    ],
  },
  {
    id: 'dec-meeting-2026',
    title: '12월 학생회 회의 의제 의견 수렴',
    department: '기록부',
    owner: '오주하',
    audience: '전교생',
    collectsClass: true,
    activity: { id: '24', title: '디미체전 운영 개선' },
    stage: 'scheduled',
    intro: '12월 학생회 회의에서 다뤘으면 하는 이야기를 받습니다.',
    opensAt: daysFrom(3),
    closesAt: daysFrom(10, 23, 59),
    savedAt: daysFrom(-2, 19, 40),
    responses: 0,
    target: 640,
    reviewRequested: true,
    questions: [
      {
        id: 'q1',
        type: 'multiple',
        title: '회의에서 다뤘으면 하는 주제를 골라주세요.',
        required: true,
        maxSelections: 2,
        options: ['급식', '시설', '행사', '학습'],
      },
      {
        id: 'q2',
        type: 'long',
        title: '구체적인 의견이 있으면 적어주세요.',
        required: false,
        maxLength: 500,
      },
    ],
  },
];

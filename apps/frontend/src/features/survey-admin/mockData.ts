import { mockSurveys } from '../surveys/mockData.ts';
import type { AdminSurvey } from './types.ts';

/**
 * 개발용 예시 설문 (업무공간). 공개된 설문은 학생 화면 설문 예시(features/surveys)에
 * 응답 수 등을 붙였고, 작성 중인 "시험 기간 자습실 수요 조사"는 documents/test_UI 시안(설문 편집)의 예시를 옮겼다.
 */

function daysFrom(days: number, hours = 9, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const published: Record<
  string,
  Pick<AdminSurvey, 'owner' | 'responses' | 'target'> & {
    openedDaysAgo: number;
  }
> = {
  'lunch-2026-10': {
    owner: '오지후',
    responses: 412,
    target: 640,
    openedDaysAgo: 6,
  },
  'sports-day-2026': {
    owner: '최유나',
    responses: 287,
    target: 640,
    openedDaysAgo: 3,
  },
  'dorm-laundry-2026': {
    owner: '이서준',
    responses: 133,
    target: 210,
    openedDaysAgo: 5,
  },
  'council-review-2026-1': {
    owner: '윤채원',
    responses: 498,
    target: 640,
    openedDaysAgo: 34,
  },
  'festival-booth-2026': {
    owner: '강민재',
    responses: 521,
    target: 640,
    openedDaysAgo: 55,
  },
};

export const mockAdminSurveys: AdminSurvey[] = [
  ...mockSurveys.map((survey) => {
    const extra = published[survey.id];
    return {
      ...survey,
      stage: 'published' as const,
      owner: extra.owner,
      intro: '',
      opensAt: daysFrom(-extra.openedDaysAgo),
      savedAt: daysFrom(-extra.openedDaysAgo - 1, 17),
      responses: extra.responses,
      target: extra.target,
      reviewRequested: true,
    };
  }),
  {
    id: 'exam-study-room-2026',
    title: '시험 기간 자습실 수요 조사',
    department: '학습부',
    owner: '최민호',
    audience: '전교생',
    identity: 'anonymous',
    stage: 'draft',
    intro:
      '시험 2주 전 자습실 연장 운영이 필요한지 알아보려고 합니다. 응답은 익명으로 처리되며 학습부만 결과를 확인합니다.',
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
        type: 'scale',
        title: '연장 운영이 성적 관리에 도움이 될 것 같나요?',
        required: true,
        steps: 5,
        minLabel: '전혀 아니다',
        maxLabel: '매우 그렇다',
      },
      {
        id: 'q5',
        type: 'text',
        title: '그 밖에 바라는 점을 자유롭게 적어주세요.',
        required: false,
        maxLength: 500,
      },
    ],
  },
  {
    id: 'club-fair-2026',
    title: '동아리 박람회 부스 배치 의견',
    department: '문화부',
    owner: '강민재',
    audience: '동아리 부장',
    identity: 'named',
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
    id: 'nov-meeting-2026',
    title: '11월 정기회의 의제 의견 수렴',
    department: '기획부',
    owner: '윤채원',
    audience: '전교생',
    identity: 'student-id',
    stage: 'scheduled',
    intro: '11월 정기회의에서 다뤘으면 하는 이야기를 받습니다.',
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
        title: '정기회의에서 다뤘으면 하는 주제를 골라주세요.',
        required: true,
        maxSelections: 2,
        options: ['급식', '시설', '행사', '학습'],
      },
      {
        id: 'q2',
        type: 'text',
        title: '구체적인 의견이 있으면 적어주세요.',
        required: false,
        maxLength: 500,
      },
    ],
  },
];

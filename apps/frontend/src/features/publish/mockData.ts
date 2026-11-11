import type { PublishItem } from './types.ts';

/** 개발용 예시 공개 검토. 안건 A-26-027은 안건 예시(features/agendas)에서 "공개 검토 중"이다. */

function daysAgo(days: number, hours = 17) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

export const mockPublishItems: PublishItem[] = [
  {
    id: 'P-26-041',
    kind: '안건',
    title: '3층 자습실 콘센트 증설',
    preview:
      '자습실 좌석에 비해 콘센트가 부족하다는 건의가 9건 들어와 안건으로 등록했습니다. 학습부가 행정실에 증설이 가능한지 문의하고 있습니다.',
    department: '학습부',
    requester: '정다은',
    requestedAt: daysAgo(0, 10),
    status: '공개 검토 중',
    agenda: { id: 'A-26-027', title: '3층 자습실 콘센트 증설' },
  },
  {
    id: 'P-26-040',
    kind: '진행 기록',
    title: '사감실 2차 면담 일정 확정',
    preview:
      '세탁실 이용 시간 조정을 위해 다음 주 화요일 사감 선생님과 두 번째 면담을 합니다. 설문 결과(22시 이후 이용 희망 61%)를 함께 전달합니다.',
    department: '생활복지부',
    requester: '이서준',
    requestedAt: daysAgo(1),
    status: '공개 검토 중',
    agenda: { id: 'A-26-031', title: '기숙사 세탁실 이용 시간 개선' },
  },
  {
    id: 'P-26-039',
    kind: '설문 결과',
    title: '1학기 학생회 활동 만족도 조사 결과',
    preview:
      '498명이 응답했습니다. 가장 만족한 활동은 체육대회(42%), 가장 아쉬운 점은 건의 답변 속도(37%)였습니다. 2학기에는 건의 답변을 7일 안에 하도록 바꿉니다.',
    department: '기획부',
    requester: '윤채원',
    requestedAt: daysAgo(2),
    status: '공개 검토 중',
  },
  {
    id: 'P-26-036',
    kind: '진행 기록',
    title: '정기 학생회의에서 매점 연장 요청안 의결',
    preview:
      '점심시간 매점 운영을 12:40까지 늘려 달라는 요청안을 의결했습니다. 다음 주에 학교에 공문으로 요청합니다.',
    department: '생활복지부',
    requester: '오지후',
    requestedAt: daysAgo(6),
    status: '게시됨',
    agenda: { id: 'A-26-022', title: '매점 점심시간 운영 연장' },
    reviewer: '김하린',
    decidedAt: daysAgo(5, 9),
  },
  {
    id: 'P-26-035',
    kind: '안건',
    title: '2학기 체육대회 종목 선정',
    preview:
      '2학기 체육대회 종목을 학생 설문으로 정합니다. 설문은 체육부가 진행하고 결과는 이곳에 올립니다.',
    department: '체육부',
    requester: '박도윤',
    requestedAt: daysAgo(8),
    status: '게시됨',
    agenda: { id: 'A-26-029', title: '2학기 체육대회 종목 선정' },
    reviewer: '한서윤',
    decidedAt: daysAgo(7, 9),
  },
  {
    id: 'P-26-034',
    kind: '진행 기록',
    title: '층별 소음 민원 기록 확인',
    preview:
      '3층 기숙사생 일부가 밤늦게 세탁기를 돌려 시끄럽다는 민원을 확인했습니다.',
    department: '생활복지부',
    requester: '이서준',
    requestedAt: daysAgo(9),
    status: '수정 요청',
    agenda: { id: 'A-26-031', title: '기숙사 세탁실 이용 시간 개선' },
    reviewer: '김하린',
    decidedAt: daysAgo(8, 9),
    note: '민원을 낸 학생이 특정될 수 있어요. 층 정보는 빼고 올려주세요.',
  },
];

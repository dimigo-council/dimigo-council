import type { InboxSuggestion } from './types.ts';

/**
 * 개발용 예시 건의. 학생 화면 "내 건의" 예시(features/suggestions)와 같은 건의도 섞여 있다.
 * 날짜는 오늘을 기준으로 잡는다.
 */

function daysAgo(days: number, hours = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

export const mockInbox: InboxSuggestion[] = [
  {
    id: 'S-26-0414',
    category: '시설',
    title: '본관 2층 정수기 물이 미지근해요',
    body: '본관 2층 정수기에서 냉수를 눌러도 미지근한 물이 나옵니다. 점심시간 뒤에는 특히 심해요.',
    identity: 'anonymous',
    status: '접수 대기',
    receivedAt: daysAgo(0, 9),
    updatedAt: daysAgo(0, 9),
  },
  {
    id: 'S-26-0413',
    category: '급식',
    title: '수요일 간식 메뉴를 미리 알려주세요',
    body: '수요일 간식이 무엇인지 미리 알면 매점에서 따로 사 먹지 않아도 될 것 같아요. 식단표에 같이 적어주면 좋겠습니다.',
    identity: 'named',
    author: '1학년 4반 서도현',
    status: '접수 대기',
    receivedAt: daysAgo(0, 8),
    updatedAt: daysAgo(0, 8),
  },
  {
    id: 'S-26-0411',
    category: '행사',
    title: '체육대회 응원석을 학년별로 나눠주세요',
    body: '작년에는 반별로 섞여 앉아서 응원이 잘 안 됐어요. 학년별로 구역을 나누면 좋겠습니다.',
    identity: 'anonymous',
    status: '접수 대기',
    receivedAt: daysAgo(1, 19),
    updatedAt: daysAgo(1, 19),
  },
  {
    id: 'S-26-0409',
    category: '기숙사',
    title: '기숙사 3층 복도 조명이 깜빡여요',
    body: '3층 동쪽 복도 끝 조명이 며칠째 깜빡입니다. 밤에 지나갈 때 어지러워요.',
    identity: 'anonymous',
    status: '접수 대기',
    receivedAt: daysAgo(1, 22),
    updatedAt: daysAgo(1, 22),
  },
  {
    id: 'S-26-0406',
    category: '학습',
    title: '시험 기간 자습실 운영 시간을 늘려주세요',
    body: '시험 2주 전부터는 자습실이 일찍 닫혀서 기숙사로 돌아가야 합니다. 23시까지 운영하면 좋겠습니다.',
    identity: 'named',
    author: '2학년 1반 남궁윤',
    status: '접수 대기',
    receivedAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'S-26-0404',
    category: '학생회 운영',
    title: '회의록을 더 빨리 올려주세요',
    body: '정기회의 회의록이 일주일 넘게 지나서 올라올 때가 많아요. 결정된 내용을 빨리 알고 싶습니다.',
    identity: 'anonymous',
    status: '접수 대기',
    receivedAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'S-26-0402',
    category: '급식',
    title: '급식 국 간이 너무 짜요',
    body: '요즘 국이 계속 짜게 나와서 거의 남기게 됩니다. 조리실에 전달 부탁드려요.',
    identity: 'anonymous',
    status: '접수 대기',
    receivedAt: daysAgo(1, 13),
    updatedAt: daysAgo(1, 13),
  },
  {
    id: 'S-26-0388',
    category: '시설',
    title: '3층 자습실 콘센트가 부족합니다',
    body: '3층 자습실에 콘센트가 4개뿐이라 노트북을 쓰려면 자리 싸움이 납니다.',
    identity: 'named',
    author: '2학년 3반 김하린',
    status: '검토 중',
    receivedAt: daysAgo(7),
    updatedAt: daysAgo(1),
    department: '학습부',
    handler: '정다은',
  },
  {
    id: 'S-26-0379',
    category: '기숙사',
    title: '세탁실 건조기가 부족해요',
    body: '저녁 시간마다 건조기 대기가 길어 젖은 빨래를 들고 기다려야 합니다.',
    identity: 'anonymous',
    status: '검토 중',
    receivedAt: daysAgo(9),
    updatedAt: daysAgo(4),
    department: '생활복지부',
    handler: '이서준',
  },
  {
    id: 'S-26-0371',
    category: '기숙사',
    title: '기숙사 세탁실 이용 시간을 늘려주세요',
    body: '세탁실이 22시에 닫혀서 운동 후 빨래를 못 합니다.',
    identity: 'anonymous',
    status: '안건 채택',
    receivedAt: daysAgo(16),
    updatedAt: daysAgo(5),
    department: '생활복지부',
    handler: '이서준',
    agenda: { id: 'A-26-031', title: '기숙사 세탁실 이용 시간 개선' },
    answer:
      '같은 건의가 여러 건 들어와 안건으로 묶었습니다. 진행 상황은 학생회 활동에서 볼 수 있습니다.',
  },
  {
    id: 'S-26-0352',
    category: '시설',
    title: '매점 카드 결제가 자주 안 됩니다',
    body: '점심시간에 카드 단말기가 자주 멈춰 줄이 길어집니다.',
    identity: 'named',
    author: '2학년 3반 김하린',
    status: '답변 완료',
    receivedAt: daysAgo(25),
    updatedAt: daysAgo(18),
    department: '생활복지부',
    handler: '오지후',
    answer:
      '매점 운영자에게 전달해 단말기를 새것으로 바꿨습니다. 그 뒤로도 멈추면 다시 알려주세요.',
  },
  {
    id: 'S-26-0317',
    category: '기타',
    title: '교복 대신 생활복 등교를 허용해주세요',
    body: '생활복으로도 등교할 수 있게 해주세요.',
    identity: 'anonymous',
    status: '반려',
    receivedAt: daysAgo(40),
    updatedAt: daysAgo(33),
    department: '생활복지부',
    handler: '이서준',
    answer:
      '복장 규정은 학교 생활규정 개정이 필요해 학생회가 바로 정할 수 없습니다. 내년 규정 개정 의견 수렴 때 다시 올려주세요.',
  },
];

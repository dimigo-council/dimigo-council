import type { Suggestion } from './types.ts';

/**
 * 개발용 예시 건의. documents/test_UI 시안(내 건의, 건의 상세)의 예시를 옮겼다.
 * 날짜는 오늘을 기준으로 잡는다.
 */

function daysAgo(days: number, hour = 12, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const mockSuggestions: Suggestion[] = [
  {
    id: 'S-26-0402',
    category: '급식',
    title: '급식 국 간이 너무 짜요',
    identity: 'anonymous',
    status: '접수 대기',
    submittedAt: daysAgo(1, 13, 5),
    updatedAt: daysAgo(1, 13, 5),
    photos: [],
    messages: [
      {
        id: 'm1',
        from: 'me',
        original: true,
        at: daysAgo(1, 13, 5),
        body: '요즘 점심 국이 계속 짜게 나옵니다. 간을 조금만 줄여주시면 좋겠습니다.',
      },
    ],
    history: [{ status: '접수 대기', at: daysAgo(1, 13, 5) }],
    notify: { status: true, agenda: true },
  },
  {
    id: 'S-26-0388',
    category: '시설',
    title: '3층 자습실 콘센트가 부족합니다',
    identity: 'named',
    status: '검토 중',
    department: '학습부',
    submittedAt: daysAgo(7, 19, 20),
    updatedAt: daysAgo(1, 16, 40),
    photos: [],
    messages: [
      {
        id: 'm1',
        from: 'me',
        original: true,
        at: daysAgo(7, 19, 20),
        body: '3층 자습실에 콘센트가 4개뿐이라 노트북을 충전하려면 자리를 옮겨야 합니다. 콘센트를 늘려주세요.',
      },
      {
        id: 'm2',
        from: 'council',
        department: '학습부',
        staffName: '정다은',
        at: daysAgo(1, 16, 40),
        body: '행정실에 증설 가능 여부를 문의했습니다. 답을 받는 대로 알려드릴게요.',
      },
    ],
    history: [
      { status: '접수 대기', at: daysAgo(7, 19, 20) },
      { status: '검토 중', at: daysAgo(5), note: '학습부 확인' },
    ],
    notify: { status: true, agenda: true },
  },
  {
    id: 'S-26-0371',
    category: '기숙사',
    title: '기숙사 세탁실 이용 시간을 늘려주세요',
    identity: 'anonymous',
    status: '안건 채택',
    department: '생활복지부',
    submittedAt: daysAgo(16, 21, 48),
    updatedAt: daysAgo(5, 17, 32),
    photos: [],
    messages: [
      {
        id: 'm1',
        from: 'me',
        original: true,
        at: daysAgo(16, 21, 48),
        body: '저녁 자습 끝나고 9시 반부터 10시 사이에 세탁기를 쓰려고 하면 항상 자리가 없습니다. 이용 시간을 11시까지 늘리거나 층별로 시간을 나눠주면 좋겠습니다.',
      },
      {
        id: 'm2',
        from: 'council',
        department: '생활복지부',
        staffName: '이서준',
        at: daysAgo(14, 12, 10),
        body: '확인했습니다. 비슷한 건의가 여러 건 들어와 있어서 함께 검토하고 있습니다. 사감 선생님과 이용 시간 조정이 가능한지 먼저 협의하겠습니다.',
      },
      {
        id: 'm3',
        from: 'council',
        department: '생활복지부',
        staffName: '이서준',
        at: daysAgo(5, 17, 32),
        body: '정기 회의에서 안건으로 채택했습니다. 실제 이용 시간대를 파악하려고 기숙사생 대상 설문을 진행합니다. 설문에 참여해주시면 결정에 반영됩니다.',
        action: { label: '설문 참여하기', to: '/surveys/dorm-laundry-2026' },
      },
    ],
    history: [
      { status: '접수 대기', at: daysAgo(16, 21, 48) },
      { status: '검토 중', at: daysAgo(14, 12, 10), note: '생활복지부 확인' },
      { status: '안건 채택', at: daysAgo(5, 17, 32) },
    ],
    linkedAgenda: {
      id: 'A-26-031',
      title: '기숙사 세탁실 이용 시간 개선',
      stage: '추진',
      stageNote: '기숙사생 설문 진행 중',
      suggestionCount: 15,
    },
    notify: { status: true, agenda: true },
  },
  {
    id: 'S-26-0352',
    category: '시설',
    title: '매점 카드 결제가 자주 안 됩니다',
    identity: 'named',
    status: '답변 완료',
    department: '생활복지부',
    submittedAt: daysAgo(25, 12, 30),
    updatedAt: daysAgo(19, 15, 0),
    photos: [],
    messages: [
      {
        id: 'm1',
        from: 'me',
        original: true,
        at: daysAgo(25, 12, 30),
        body: '점심시간에 매점 카드 단말기가 자주 멈춰서 현금이 없으면 살 수가 없습니다.',
      },
      {
        id: 'm2',
        from: 'council',
        department: '생활복지부',
        staffName: '이서준',
        at: daysAgo(19, 15, 0),
        body: '단말기 통신 문제로 확인돼 교체했습니다. 같은 문제가 또 생기면 이 건의에 추가 의견으로 알려주세요.',
      },
    ],
    history: [
      { status: '접수 대기', at: daysAgo(25, 12, 30) },
      { status: '검토 중', at: daysAgo(23), note: '생활복지부 확인' },
      { status: '답변 완료', at: daysAgo(19, 15, 0) },
    ],
    notify: { status: true, agenda: false },
  },
  {
    id: 'S-26-0317',
    category: '행사',
    title: '동아리 홍보 기간을 1주 늘려주세요',
    identity: 'anonymous',
    status: '반려',
    department: '기획부',
    submittedAt: daysAgo(40, 18, 0),
    updatedAt: daysAgo(34, 11, 0),
    photos: [],
    messages: [
      {
        id: 'm1',
        from: 'me',
        original: true,
        at: daysAgo(40, 18, 0),
        body: '동아리 홍보 기간이 1주라 신입생이 둘러볼 시간이 부족합니다. 2주로 늘려주세요.',
      },
      {
        id: 'm2',
        from: 'council',
        department: '기획부',
        staffName: '윤서진',
        at: daysAgo(34, 11, 0),
        body: '확정된 학사 일정과 겹쳐 올해는 어렵습니다. 내년 일정을 세울 때 다시 검토하겠습니다.',
      },
    ],
    history: [
      { status: '접수 대기', at: daysAgo(40, 18, 0) },
      { status: '검토 중', at: daysAgo(38), note: '기획부 확인' },
      { status: '반려', at: daysAgo(34, 11, 0) },
    ],
    notify: { status: true, agenda: false },
  },
];

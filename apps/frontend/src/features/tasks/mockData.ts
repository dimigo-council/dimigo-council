import type { Task } from './types.ts';

/**
 * 개발용 예시 업무. T-0412는 documents/test_UI 시안(업무, 업무 상세)의 예시를 옮겼다.
 * 날짜는 오늘을 기준으로 잡아 언제 열어도 마감 지남·일주일 안·그 뒤 업무가 함께 보인다.
 */

function daysFrom(days: number, hours = 18, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const sportsDay = { id: 'A-26-029', title: '2학기 체육대회 종목 선정' };
const laundry = { id: 'A-26-031', title: '기숙사 세탁실 이용 시간 개선' };
const outlets = { id: 'A-26-027', title: '3층 자습실 콘센트 증설' };
const budget = { id: 'A-26-032', title: '2학기 학생회비 집행 내역 공개' };
const leftovers = { id: 'A-26-033', title: '급식 잔반 줄이기 캠페인' };

export const mockTasks: Task[] = [
  {
    id: 'T-0412',
    title: '체육대회 종목 설문 문항 확정',
    status: '진행 중',
    department: '체육부',
    requester: '박도윤',
    assignees: ['김하린', '최유나'],
    agenda: sportsDay,
    dueAt: daysFrom(-2, 23, 59),
    body: '체육부가 정리한 후보 종목 9개 중 설문에 넣을 종목을 확정하고, 문항 6개를 최종 검토해 설문 관리에 올려주세요.\n\n작년 결과 보고서에서 "결승 시간대가 너무 늦다"는 의견이 많았으니 시간대 문항을 꼭 넣어주세요.',
    visibility: '학생회 내부',
    checklist: [
      {
        id: 'c1',
        text: '설문 후보 종목 7개 확정',
        done: true,
        owner: '최유나',
      },
      { id: 'c2', text: '시간대 문항 추가', done: true, owner: '김하린' },
      {
        id: 'c3',
        text: '문항 6개 최종 검토 (체육부장)',
        done: false,
        owner: '박도윤',
      },
      {
        id: 'c4',
        text: '설문 관리에 등록 후 공개 예약',
        done: false,
        owner: '김하린',
      },
    ],
    outputs: [
      {
        id: 'o1',
        kind: 'survey',
        title: '2학기 체육대회 종목 선호 조사',
        meta: '설문 · 진행 중',
        to: '/work/surveys',
      },
      {
        id: 'o2',
        kind: 'file',
        title: '후보종목_운동장사용가능여부.xlsx',
        meta: '최유나 · 24KB',
      },
    ],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '박도윤',
        at: daysFrom(-7, 14, 2),
        text: '김하린, 최유나에게 업무를 배정했습니다.',
      },
      {
        id: 'a2',
        kind: 'comment',
        author: '최유나',
        at: daysFrom(-4, 20, 15),
        text: '후보 종목 9개 중 운동장 사용이 어려운 2개는 뺐습니다. 나머지 7개로 문항 초안 올려둘게요.',
      },
      {
        id: 'a3',
        kind: 'event',
        author: '김하린',
        at: daysFrom(-3, 9, 40),
        text: '상태를 진행 중으로 바꿨습니다.',
      },
      {
        id: 'a4',
        kind: 'comment',
        author: '박도윤',
        at: daysFrom(-1, 18, 3),
        text: '마감이 지났는데 혹시 막힌 부분 있으면 말해주세요. 설문은 이번 주 안에 열고 싶어요.',
      },
    ],
  },
  {
    id: 'T-0415',
    title: '10월 4주차 회의록 공개본 검토',
    status: '검토 요청',
    department: '회장단',
    requester: '한서윤',
    assignees: ['김하린'],
    group: '정기 회의 운영',
    dueAt: daysFrom(1),
    body: '회의록에서 개인 이름과 내부 논의를 뺀 공개본입니다. 학생 화면에 나가기 전에 한 번 더 봐주세요.',
    visibility: '공개 검토 중',
    checklist: [
      { id: 'c1', text: '개인 이름 지우기', done: true, owner: '한서윤' },
      { id: 'c2', text: '결정 사항 문장 다듬기', done: false, owner: '김하린' },
    ],
    outputs: [
      {
        id: 'o1',
        kind: 'file',
        title: '10월4주차_정기회의_공개본.docx',
        meta: '한서윤 · 31KB',
      },
    ],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '한서윤',
        at: daysFrom(-2, 16, 20),
        text: '상태를 검토 요청으로 바꿨습니다.',
      },
    ],
  },
  {
    id: 'T-0409',
    title: '세탁실 설문 안내 카드뉴스 게시',
    status: '할 일',
    department: '생활복지부',
    requester: '이서준',
    assignees: ['김하린', '이서준'],
    agenda: laundry,
    dueAt: daysFrom(2),
    body: '기숙사 세탁실 설문이 열렸다는 안내를 카드뉴스 3장으로 만들어 학생회 계정에 올려주세요. 설문 링크와 마감일을 꼭 넣어주세요.',
    visibility: '학생회 내부',
    checklist: [
      { id: 'c1', text: '카드뉴스 문안 작성', done: false, owner: '이서준' },
      { id: 'c2', text: '디자인 및 게시', done: false, owner: '김하린' },
    ],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '이서준',
        at: daysFrom(-3, 11, 5),
        text: '김하린, 이서준에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0417',
    title: '11월 정기회의 안건 목록 취합',
    status: '진행 중',
    department: '회장단',
    requester: '한서윤',
    assignees: ['김하린'],
    group: '정기 회의 운영',
    dueAt: daysFrom(4),
    body: '부서별로 11월 정기회의에 올릴 안건을 받아 한 장으로 정리해주세요.',
    visibility: '학생회 내부',
    checklist: [
      { id: 'c1', text: '부서별 안건 요청', done: true, owner: '김하린' },
      { id: 'c2', text: '안건 목록 정리', done: false, owner: '김하린' },
    ],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '한서윤',
        at: daysFrom(-2, 10, 0),
        text: '김하린에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0403',
    title: '반별 응원 지원금 집행 계획 작성',
    status: '할 일',
    department: '체육부',
    requester: '박도윤',
    assignees: ['김하린', '박도윤'],
    agenda: sportsDay,
    dueAt: daysFrom(9),
    body: '반별 응원 도구 지원금을 어떻게 나눌지 기준과 집행 일정을 정리해주세요.',
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '박도윤',
        at: daysFrom(-5, 15, 30),
        text: '김하린, 박도윤에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0418',
    title: '자습실 콘센트 행정실 회신 확인',
    status: '할 일',
    department: '학습부',
    requester: '정다은',
    assignees: ['김하린'],
    agenda: outlets,
    dueAt: daysFrom(10),
    body: '행정실에 보낸 콘센트 증설 문의의 회신을 받아 안건 진행 기록에 남겨주세요.',
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '정다은',
        at: daysFrom(-1, 13, 10),
        text: '김하린에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0396',
    title: '축제 부스 운영 결과 보고서 작성',
    status: '완료',
    department: '문화부',
    requester: '강민재',
    assignees: ['김하린', '박지민'],
    group: '2학기 축제',
    dueAt: daysFrom(-10),
    doneAt: daysFrom(-11, 17, 0),
    body: '축제 부스 운영 방식 변경 결과를 보고서로 정리해주세요.',
    visibility: '전체 공개',
    checklist: [
      { id: 'c1', text: '부스별 운영 결과 취합', done: true, owner: '박지민' },
      { id: 'c2', text: '보고서 작성', done: true, owner: '김하린' },
    ],
    outputs: [
      {
        id: 'o1',
        kind: 'file',
        title: '축제부스_운영결과_보고서.pdf',
        meta: '김하린 · 1.2MB',
      },
    ],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '김하린',
        at: daysFrom(-11, 17, 0),
        text: '상태를 완료로 바꿨습니다.',
      },
    ],
  },
  {
    id: 'T-0410',
    title: '학생회비 영수증 정리',
    status: '진행 중',
    department: '회장단',
    requester: '김하린',
    assignees: ['박지민'],
    agenda: budget,
    dueAt: daysFrom(3),
    body: '1학기 이월분을 포함해 2학기 학생회비 영수증을 날짜순으로 정리해주세요.',
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '김하린',
        at: daysFrom(-3, 12, 0),
        text: '박지민에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0411',
    title: '집행 내역 공개 양식 만들기',
    status: '할 일',
    department: '회장단',
    requester: '김하린',
    assignees: ['한서윤'],
    agenda: budget,
    dueAt: daysFrom(6),
    body: '학생 화면에 올릴 집행 내역 표 양식을 만들어주세요. 항목, 금액, 날짜, 영수증 여부가 들어가야 합니다.',
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '김하린',
        at: daysFrom(-3, 12, 5),
        text: '한서윤에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0414',
    title: '급식실 잔반 측정 방법 조사',
    status: '할 일',
    department: '생활복지부',
    requester: '이서준',
    assignees: ['오지후'],
    agenda: leftovers,
    dueAt: daysFrom(5),
    body: '다른 학교에서 잔반을 어떻게 재는지 조사해 캠페인 기준으로 쓸 방법을 두 가지 이상 찾아주세요.',
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '이서준',
        at: daysFrom(-2, 9, 0),
        text: '오지후에게 업무를 배정했습니다.',
      },
    ],
  },
  {
    id: 'T-0405',
    title: '세탁실 이용 시간대 설문 결과 정리',
    status: '완료',
    department: '생활복지부',
    requester: '이서준',
    assignees: ['오지후'],
    agenda: laundry,
    dueAt: daysFrom(-4),
    doneAt: daysFrom(-4, 16, 0),
    body: '설문 응답을 시간대별로 묶어 사감실 제출용 표로 정리해주세요.',
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [
      {
        id: 'a1',
        kind: 'event',
        author: '오지후',
        at: daysFrom(-4, 16, 0),
        text: '상태를 완료로 바꿨습니다.',
      },
    ],
  },
];

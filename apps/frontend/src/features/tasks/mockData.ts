import { withIGa } from '../../lib/korean.ts';
import type { Task, TaskLog } from './types.ts';

/**
 * 개발용 예시 업무. Figma(학생회 / 업무, 업무 상세)의 예시를 옮겼다.
 * 날짜는 오늘을 기준으로 잡아 언제 열어도 오늘 마감·예정 업무가 함께 보인다.
 */

function daysFrom(days: number, hours = 18) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

const sportsDay = { id: '24', title: '디미체전 운영 개선' };
const cheering = { id: '25', title: '수능 응원 이벤트 운영' };
const studySpace = { id: '22', title: '대화형 공부 공간 조성' };
const artFestival = { id: '18', title: '예술제 운영 계획 수립' };

const assigned = (
  assigner: string,
  assignee: string,
  days: number,
): TaskLog => ({
  id: 'l1',
  at: daysFrom(days, 10),
  label: '배정',
  text:
    assigner === assignee
      ? `${withIGa(assigner)} 업무를 만들었어요.`
      : `${withIGa(assigner)} ${assignee}에게 업무를 배정했어요.`,
  status: '예정됨',
});

export const mockTasks: Task[] = [
  {
    id: '31',
    title: '디미체전 만족도 설문 제작',
    activity: sportsDay,
    assigner: '박성현',
    department: '생활스포츠부',
    assignee: '조원',
    startAt: daysFrom(-6),
    dueAt: daysFrom(1),
    status: '진행 중',
    logs: [
      assigned('박성현', '조원', -6),
      {
        id: 'l2',
        at: daysFrom(-5, 15),
        label: '진행 중',
        text: '문항 초안을 작성하기 시작했어요.',
        status: '진행 중',
      },
      {
        id: 'l3',
        at: daysFrom(-4, 11),
        label: '수정',
        text: '조원이 마감일을 하루 늦췄어요.',
      },
      {
        id: 'l4',
        at: daysFrom(-3, 20),
        label: '진행 중',
        text: '4문항 중 2문항을 정리했어요.',
        status: '진행 중',
      },
    ],
  },
  {
    id: '30',
    title: '디미체전 결과 안내문 게시',
    activity: sportsDay,
    assigner: '박성현',
    department: '홍보부',
    assignee: '문세희',
    startAt: daysFrom(-16),
    dueAt: daysFrom(-14),
    status: '완료',
    logs: [
      assigned('박성현', '문세희', -16),
      {
        id: 'l2',
        at: daysFrom(-14, 17),
        label: '완료',
        text: '안내문을 학급 게시판과 홈 공지에 올렸어요.',
        status: '완료',
      },
    ],
  },
  {
    id: '32',
    title: '디미체전 활동 기록 작성',
    activity: sportsDay,
    assigner: '박성현',
    department: '생활스포츠부',
    assignee: '박성현',
    startAt: daysFrom(-4),
    dueAt: daysFrom(1),
    status: '진행 중',
    logs: [
      assigned('박성현', '박성현', -4),
      {
        id: 'l2',
        at: daysFrom(-2, 19),
        label: '진행 중',
        text: '회의록과 협의 결과를 모으고 있어요.',
        status: '진행 중',
      },
    ],
  },
  {
    id: '33',
    title: '수능 응원 이벤트 운영안',
    tag: '행사',
    assigner: '이서연',
    department: '환경예술부',
    assignee: '김호태',
    startAt: daysFrom(-5),
    dueAt: daysFrom(0),
    status: '진행 중',
    logs: [
      assigned('이서연', '김호태', -5),
      {
        id: 'l2',
        at: daysFrom(-3, 16),
        label: '진행 중',
        text: '응원 현수막과 간식 나눔 순서를 정리했어요.',
        status: '진행 중',
      },
    ],
  },
  {
    id: '35',
    title: '질의 #131 답변 초안 작성',
    tag: '질의',
    assigner: '이서연',
    department: '환경예술부',
    assignee: '김호태',
    startAt: daysFrom(-1),
    dueAt: daysFrom(2),
    status: '예정됨',
    logs: [assigned('이서연', '김호태', -1)],
  },
  {
    id: '34',
    title: '12월 학생회 회의 활동지 준비',
    tag: '회의',
    assigner: '오주하',
    department: '기록부',
    assignee: '김호태',
    startAt: daysFrom(0),
    dueAt: daysFrom(8),
    status: '예정됨',
    logs: [assigned('오주하', '김호태', 0)],
  },
  {
    id: '37',
    title: '예술제 포스터 디자인',
    activity: artFestival,
    assigner: '김호태',
    department: '환경예술부',
    assignee: '김호태',
    startAt: daysFrom(0),
    dueAt: daysFrom(6),
    status: '예정됨',
    logs: [assigned('김호태', '김호태', 0)],
  },
  {
    id: '36',
    title: '학생회 SNS 카드뉴스 제작',
    tag: '홍보',
    assigner: '문세희',
    department: '홍보부',
    assignee: '문세희',
    startAt: daysFrom(-3),
    dueAt: daysFrom(5),
    status: '진행 중',
    logs: [
      assigned('문세희', '문세희', -3),
      {
        id: 'l2',
        at: daysFrom(-1, 21),
        label: '진행 중',
        text: '카드뉴스 6장 중 3장을 만들었어요.',
        status: '진행 중',
      },
    ],
  },
  {
    id: '28',
    title: '대화형 공부 공간 활동 기록',
    activity: studySpace,
    assigner: '최유나',
    department: '바른생활부',
    assignee: '김호태',
    startAt: daysFrom(-10),
    dueAt: daysFrom(1),
    status: '검토 요청',
    logs: [
      assigned('최유나', '김호태', -10),
      {
        id: 'l2',
        at: daysFrom(-1, 22),
        label: '검토 요청',
        text: '활동 기록 초안을 올렸어요. 확인 부탁해요.',
        status: '검토 요청',
      },
    ],
  },
  {
    id: '29',
    title: '11월 학생회 회의록',
    tag: '회의',
    assigner: '이서연',
    department: '기록부',
    assignee: '오주하',
    startAt: daysFrom(-12),
    dueAt: daysFrom(3),
    status: '검토 요청',
    logs: [
      assigned('이서연', '오주하', -12),
      {
        id: 'l2',
        at: daysFrom(-2, 18),
        label: '검토 요청',
        text: '회의록 정리를 마쳤어요.',
        status: '검토 요청',
      },
    ],
  },
  {
    id: '27',
    title: '수능 응원 이벤트 설문 배포',
    activity: cheering,
    assigner: '문세희',
    department: '홍보부',
    assignee: '문세희',
    startAt: daysFrom(-18),
    dueAt: daysFrom(-16),
    status: '완료',
    logs: [
      assigned('문세희', '문세희', -18),
      {
        id: 'l2',
        at: daysFrom(-16, 12),
        label: '완료',
        text: '학급 단톡방에 설문 링크를 보냈어요.',
        status: '완료',
      },
    ],
  },
  {
    id: '26',
    title: '택배 보관함 정리 일정 공유',
    tag: '공지',
    assigner: '정민준',
    department: '총무부',
    assignee: '김호태',
    startAt: daysFrom(-4),
    dueAt: daysFrom(-2),
    status: '완료',
    logs: [
      assigned('정민준', '김호태', -4),
      {
        id: 'l2',
        at: daysFrom(-2, 13),
        label: '완료',
        text: '정리 일정을 공지했어요.',
        status: '완료',
      },
    ],
  },
];

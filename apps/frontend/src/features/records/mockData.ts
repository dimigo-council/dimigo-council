import type { ActivityRecord } from './types.ts';

/**
 * 개발용 예시 활동 기록. Figma(활동 기록 목록)의 예시를 옮겼다.
 * TODO: 실제 PDF가 배포되면 file을 각 파일 경로로 바꾼다. 지금은 모두 같은 예시 PDF를 연다.
 */

const day = (date: string) => `${date}T12:00:00+09:00`;
const sample = '/records/sample.pdf';

export const mockRecords: ActivityRecord[] = [
  {
    id: 'r8',
    title: '디미체전 운영 결과',
    publishedAt: day('2026-11-13'),
    file: sample,
  },
  {
    id: 'r7',
    title: '11월 학생회 회의록',
    publishedAt: day('2026-11-07'),
    file: sample,
  },
  {
    id: 'r6',
    title: '10월 급식 만족도 조사 결과',
    publishedAt: day('2026-11-05'),
    file: sample,
  },
  {
    id: 'r4',
    title: '화장실 핸드타월 비치량 확대 중간 점검',
    publishedAt: day('2026-11-04'),
    file: sample,
  },
  {
    id: 'r5',
    title: '예술제 운영 계획',
    publishedAt: day('2026-11-04'),
    file: sample,
  },
  {
    id: 'r3',
    title: '대화형 공부 공간 조성 결과',
    publishedAt: day('2026-11-03'),
    file: sample,
  },
  {
    id: 'r2',
    title: '학생회 SNS 운영 방향 개선 결과',
    publishedAt: day('2026-10-30'),
    file: sample,
  },
  {
    id: 'r1',
    title: '2학기 학생회 예산 집행 내역',
    publishedAt: day('2026-10-28'),
    file: sample,
  },
];

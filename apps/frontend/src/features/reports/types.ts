import type { statusTone } from '../../components/kit/index.ts';

/** KIT 상태 매핑의 보고서 상태 */
export type ReportStatus = keyof typeof statusTone.report;

export const reportKinds = [
  '회의록',
  '결과 보고서',
  '활동 보고서',
  '회계 보고',
] as const;
export type ReportKind = (typeof reportKinds)[number];

export interface Report {
  id: string;
  title: string;
  kind: ReportKind;
  status: ReportStatus;
  department: string;
  author: string;
  /** 검토 요청을 받은 사람 */
  reviewer?: string;
  agenda?: { id: string; title: string };
  /** 본문. 문단은 빈 줄로 나눈다. 목록에서는 앞부분만 보인다. */
  body: string;
  updatedAt: string;
}

export interface NewReportInput {
  title: string;
  kind: ReportKind;
  body: string;
  agenda?: { id: string; title: string };
  author: string;
  department: string;
}

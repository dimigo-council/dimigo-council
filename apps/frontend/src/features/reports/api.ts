import { adjustAgendaCounts } from '../agendas/api.ts';
import { mockReports } from './mockData.ts';
import type { NewReportInput, Report } from './types.ts';

/**
 * 보고서 API (업무공간).
 * TODO: 백엔드 보고서 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const reports = structuredClone(mockReports);
let nextNumber = 25;

function find(id: string) {
  const report = reports.find((item) => item.id === id);
  if (!report) {
    throw new Response('보고서를 찾을 수 없습니다.', { status: 404 });
  }
  return report;
}

export async function listReports(): Promise<Report[]> {
  return structuredClone(reports).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function getReport(id: string): Promise<Report> {
  return structuredClone(find(id));
}

export async function createReport(input: NewReportInput): Promise<string> {
  const id = `R-26-${String(nextNumber++).padStart(3, '0')}`;
  reports.push({
    id,
    title: input.title.trim(),
    kind: input.kind,
    status: '작성 중',
    department: input.department,
    author: input.author,
    ...(input.agenda && { agenda: input.agenda }),
    body: input.body.trim(),
    updatedAt: new Date().toISOString(),
  });
  if (input.agenda) await adjustAgendaCounts(input.agenda.id, { reports: 1 });
  return id;
}

export async function updateReportBody(
  id: string,
  body: string,
): Promise<void> {
  const report = find(id);
  if (report.status === '완료') {
    throw new Error('완료된 보고서는 고칠 수 없습니다.');
  }
  report.body = body.trim();
  report.updatedAt = new Date().toISOString();
}

/** 작성 중인 보고서를 검토 요청으로 넘긴다. */
export async function requestReportReview(
  id: string,
  reviewer: string,
): Promise<void> {
  const report = find(id);
  report.status = '검토 요청';
  report.reviewer = reviewer;
  report.updatedAt = new Date().toISOString();
}

/** 검토 요청받은 보고서를 확인해 완료로 바꾼다. */
export async function approveReport(id: string): Promise<void> {
  const report = find(id);
  report.status = '완료';
  report.updatedAt = new Date().toISOString();
}

/** 검토 요청을 거두고 다시 작성 중으로 돌린다. */
export async function returnReport(id: string): Promise<void> {
  const report = find(id);
  report.status = '작성 중';
  report.updatedAt = new Date().toISOString();
}

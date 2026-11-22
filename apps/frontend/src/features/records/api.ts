import { mockRecords } from './mockData.ts';
import type { ActivityRecord } from './types.ts';

/**
 * 활동 기록 API. 목록과 PDF는 사이트 관리자가 정적 파일로 배포한다.
 * TODO: 배포 방식이 정해지면 목록을 정적 JSON(예: /records/index.json)에서 읽도록 바꾼다.
 */
export const isMockApi = true;

export async function listRecords(): Promise<ActivityRecord[]> {
  return structuredClone(mockRecords).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function getRecord(id: string): Promise<ActivityRecord> {
  const record = mockRecords.find((item) => item.id === id);
  if (!record) {
    throw new Response('활동 기록을 찾을 수 없습니다.', { status: 404 });
  }
  return structuredClone(record);
}

import { api, listAll, notFoundAs } from '../../lib/api.ts';
import { numericId } from '../activities/api.ts';
import type { DepartmentRef } from '../members/types.ts';
import type {
  Answers,
  Question,
  SurveySummary,
  SurveyWithResponse,
} from './types.ts';

/**
 * 설문 API (백엔드 /surveys). 학생에게는 게시된 설문만 온다.
 * 응답은 한 번만 낼 수 있고 고칠 수 없다. 서버는 누가 어떤 답을 냈는지 저장하지 않아
 * 내 답은 돌려받지 못한다. 제출 전 이어 쓰기는 이 화면 안에서만 기억한다.
 */

/** 서버의 설문 (목록·상세 공통) */
export interface SurveyResponseBody {
  id: number;
  title: string;
  intro: string;
  department: DepartmentRef | null;
  owner: { id: string; name: string | null } | null;
  grades: number[];
  audience: string;
  collectsClass: boolean;
  activity: { id: number; title: string } | null;
  opensAt: string | null;
  closesAt: string | null;
  stage: 'draft' | 'scheduled' | 'published';
  status: '작성 중' | '예정' | '진행 중' | '마감';
  isClosed: boolean;
  questionCount: number;
  responses: number;
  target: number;
  participationRate: number;
  myStatus: 'none' | 'submitted';
  canRespond: boolean;
  reviewRequested: boolean;
  savedAt: string;
  questions?: Question[];
  deadline?: string | null;
}

const notFound = notFoundAs('설문을 찾을 수 없습니다.');

/** 제출하기 전까지 이어 쓰는 답 (새로고침하면 사라진다) */
const drafts = new Map<string, Answers>();
/** 설문을 처음 연 시각 (응답 시간) */
const openedAt = new Map<string, number>();

function toSummary(row: SurveyResponseBody): SurveySummary {
  const id = String(row.id);
  return {
    id,
    title: row.title,
    intro: row.intro,
    department: row.department?.name ?? '',
    audience: row.audience,
    collectsClass: row.collectsClass,
    ...(row.activity && {
      activity: { id: String(row.activity.id), title: row.activity.title },
    }),
    closesAt: row.closesAt ?? row.savedAt,
    responses: row.responses,
    target: row.target,
    questionCount: row.questionCount,
    isClosed: row.isClosed,
    myStatus:
      row.myStatus === 'submitted'
        ? 'submitted'
        : drafts.has(id)
          ? 'draft'
          : 'none',
    canRespond: row.canRespond,
  };
}

/** 게시된 설문 (진행 중, 마감). 학생회에게 오는 작성 중·예약 설문은 뺀다. */
export async function listSurveys(): Promise<SurveySummary[]> {
  const rows = await listAll<SurveyResponseBody>('/surveys');
  return rows.filter((row) => row.stage === 'published').map(toSummary);
}

/** 서버의 설문 그대로 (학생회 설문 관리가 함께 쓴다) */
export function fetchSurvey(id: string) {
  return api<SurveyResponseBody>(`/surveys/${numericId(id)}`).catch(notFound);
}

export async function getSurvey(id: string): Promise<SurveyWithResponse> {
  const row = await fetchSurvey(id);
  if (row.stage !== 'published') {
    throw new Response('아직 게시하지 않은 설문입니다.', { status: 404 });
  }
  const summary = toSummary(row);
  if (!openedAt.has(summary.id)) openedAt.set(summary.id, Date.now());
  return {
    ...summary,
    questions: row.questions ?? [],
    myAnswers: structuredClone(drafts.get(summary.id) ?? {}),
  };
}

/** 제출 전 답을 이 화면 안에 기억한다. */
export async function saveDraft(id: string, answers: Answers): Promise<void> {
  drafts.set(id, structuredClone(answers));
}

export async function submitResponse(
  id: string,
  answers: Answers,
): Promise<void> {
  const started = openedAt.get(id);
  await api(`/surveys/${numericId(id)}/responses`, {
    method: 'POST',
    body: {
      answers,
      ...(started && {
        durationSeconds: Math.min(
          86_400,
          Math.round((Date.now() - started) / 1000),
        ),
      }),
    },
  });
  drafts.delete(id);
  openedAt.delete(id);
}

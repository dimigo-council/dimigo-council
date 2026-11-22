import { api, listAll, notFoundAs } from '../../lib/api.ts';
import { numericId } from '../activities/api.ts';
import { fetchSurvey, type SurveyResponseBody } from '../surveys/api.ts';
import type { Question } from '../surveys/types.ts';
import type {
  AdminSurvey,
  QuestionResult,
  SurveyDraft,
  SurveyResponse,
  SurveyResults,
} from './types.ts';

/**
 * 설문 관리 API (학생회 화면, 백엔드 /surveys).
 * 새 설문은 작성 중으로 만들어지고, 게시하면 학생 화면 설문(features/surveys)에 나간다.
 * 서버에는 부서장 검토 요청, 최근 임시 저장 불러오기, 개별 응답 보기·분석 제외도 있지만 화면에서 뺐다.
 */

const notFound = notFoundAs('설문을 찾을 수 없습니다.');

function toAdminSurvey(row: SurveyResponseBody): AdminSurvey {
  const deadline = row.deadline ?? row.closesAt;
  // 마감일 전에 응답 받기를 끄면 closesAt이 그 시각으로 앞당겨진다.
  const closedEarly =
    row.closesAt && deadline && row.closesAt !== deadline
      ? row.closesAt
      : undefined;
  return {
    id: String(row.id),
    title: row.title,
    intro: row.intro,
    department: row.department?.name ?? '',
    owner: row.owner?.name ?? '',
    audience: row.audience,
    collectsClass: row.collectsClass,
    ...(row.activity && {
      activity: { id: String(row.activity.id), title: row.activity.title },
    }),
    ...(row.opensAt && { opensAt: row.opensAt }),
    ...(deadline && { closesAt: deadline }),
    ...(closedEarly && { closedAt: closedEarly }),
    stage: row.stage,
    savedAt: row.savedAt,
    reviewRequested: row.reviewRequested,
    questions: row.questions ?? [],
    responses: row.responses,
    target: row.target,
  };
}

export async function getAdminSurvey(id: string): Promise<AdminSurvey> {
  return toAdminSurvey(await fetchSurvey(id));
}

const firstQuestion: Question = {
  id: 'q1',
  type: 'single',
  title: '',
  required: true,
  options: ['', ''],
};

/** 설문 만들기: 빈 작성 중 설문을 만든다. 부서는 서버가 만든 사람의 부서로 정한다. */
export async function createSurveyDraft(): Promise<string> {
  const created = await api<SurveyResponseBody>('/surveys', {
    method: 'POST',
    body: {
      title: '',
      intro: '',
      grades: [1, 2, 3],
      collectsClass: false,
      questions: [firstQuestion],
    },
  });
  return String(created.id);
}

/** 응답 대상 글자("전교생", "1학년, 2학년") → 학년 */
function gradesOf(audience: string): (1 | 2 | 3)[] {
  const all = [1, 2, 3] as const;
  if (audience === '전교생') return [...all];
  const picked = all.filter((grade) => audience.includes(`${grade}학년`));
  return picked.length > 0 ? picked : [...all];
}

/** 임시 저장. 저장한 시각을 돌려준다. */
export async function saveSurveyDraft(
  id: string,
  draft: SurveyDraft,
): Promise<string> {
  const saved = await api<SurveyResponseBody>(`/surveys/${numericId(id)}`, {
    method: 'PATCH',
    body: {
      title: draft.title.trim(),
      intro: draft.intro.trim(),
      activityId: draft.activity ? numericId(draft.activity.id) : null,
      grades: gradesOf(draft.audience),
      collectsClass: draft.collectsClass,
      opensAt: draft.opensAt ?? null,
      closesAt: draft.closesAt ?? null,
      questions: draft.questions,
    },
  });
  return saved.savedAt;
}

/**
 * 게시. 시작일이 오늘 이후면 그날 공개되도록 예약되고, 아니면 바로 공개된다.
 * 서버가 제목·연결 활동·마감일·문항을 확인하고, 모자라면 이유를 돌려준다.
 */
export async function scheduleSurvey(id: string): Promise<void> {
  await api(`/surveys/${numericId(id)}/publish`, { method: 'POST' });
}

interface ResultsResponse {
  survey: SurveyResponseBody;
  respondents: number;
  target: number;
  participationRate: number;
  daysLeft: number | null;
  questions: QuestionResult[];
}

/** 설문 결과: 서버가 분석한 문항별 결과 */
export async function getSurveyResults(id: string): Promise<SurveyResults> {
  const [results, survey] = await Promise.all([
    api<ResultsResponse>(`/surveys/${numericId(id)}/results`).catch(notFound),
    getAdminSurvey(id),
  ]);
  return {
    survey,
    respondents: results.respondents,
    target: results.target,
    participationRate: results.participationRate,
    daysLeft: results.daysLeft,
    questions: results.questions,
  };
}

interface ResponseRow {
  id: string;
  submittedAt: string;
  durationSeconds: number | null;
  grade: number | null;
  classNumber: number | null;
  answers: SurveyResponse['answers'];
  excluded: boolean;
}

/** 결과 내보내기(CSV)용 응답 전체. 제출 순서대로. */
export async function listResponsesForExport(
  id: string,
): Promise<SurveyResponse[]> {
  const rows = await listAll<ResponseRow>(
    `/surveys/${numericId(id)}/responses`,
  );
  return rows.map((row, index) => ({
    id: row.id,
    number: index + 1,
    submittedAt: row.submittedAt,
    ...(row.durationSeconds != null && {
      durationSeconds: row.durationSeconds,
    }),
    ...(row.grade != null && { grade: row.grade }),
    ...(row.classNumber != null && { classNumber: row.classNumber }),
    answers: row.answers,
    excluded: row.excluded,
  }));
}

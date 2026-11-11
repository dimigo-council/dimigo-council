import { listPublishedSurveys } from '../survey-admin/api.ts';
import { mockMyResponses } from './mockData.ts';
import type {
  Answers,
  Survey,
  SurveySummary,
  SurveyWithResponse,
} from './types.ts';

/**
 * 설문 API.
 * TODO: 백엔드 설문 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 설문 자체는 업무공간 설문 관리(features/survey-admin)에서 공개한 것을 받는다.
 * 지금은 메모리에만 저장하므로 새로고침하면 응답이 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const myResponses = structuredClone(mockMyResponses);

function isClosed(survey: Pick<Survey, 'closesAt'>, now = new Date()) {
  return new Date(survey.closesAt) < now;
}

export async function listSurveys(): Promise<SurveySummary[]> {
  const surveys = await listPublishedSurveys();
  return surveys.map(({ questions, ...survey }) => ({
    ...survey,
    questionCount: questions.length,
    isClosed: isClosed(survey),
    myStatus: myResponses[survey.id]?.status ?? 'none',
  }));
}

export async function getSurvey(id: string): Promise<SurveyWithResponse> {
  const survey = (await listPublishedSurveys()).find((item) => item.id === id);
  if (!survey) {
    throw new Response('설문을 찾을 수 없습니다.', { status: 404 });
  }
  const mine = myResponses[id];
  return {
    ...survey,
    isClosed: isClosed(survey),
    myStatus: mine?.status ?? 'none',
    myAnswers: structuredClone(mine?.answers ?? {}),
  };
}

export async function saveDraft(id: string, answers: Answers): Promise<void> {
  if (myResponses[id]?.status === 'submitted') {
    // 제출한 응답을 고치다 나가면 제출본은 그대로 둔다.
    return;
  }
  myResponses[id] = { status: 'draft', answers: structuredClone(answers) };
}

export async function submitResponse(
  id: string,
  answers: Answers,
): Promise<void> {
  const survey = await getSurvey(id);
  if (survey.isClosed) {
    throw new Error('마감된 설문입니다.');
  }
  myResponses[id] = { status: 'submitted', answers: structuredClone(answers) };
}

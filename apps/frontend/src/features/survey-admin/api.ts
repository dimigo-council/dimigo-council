import type { Survey } from '../surveys/types.ts';
import { mockAdminSurveys } from './mockData.ts';
import { mockResponses } from './responseMock.ts';
import type {
  AdminSurvey,
  SurveyDraft,
  SurveyResponse,
  SurveyResults,
} from './types.ts';

/**
 * 설문 관리 API (업무공간).
 * TODO: 백엔드 설문 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장한다. 공개한 설문은 listPublishedSurveys로 학생 화면 설문(features/surveys)에 나간다.
 */
export const isMockApi = true;

const surveys = structuredClone(mockAdminSurveys);
let nextNumber = 1;
/** 설문 id → 응답. 결과를 처음 열 때 예시 응답으로 채운다. */
const responses = new Map<string, SurveyResponse[]>();

function find(id: string) {
  const survey = surveys.find((item) => item.id === id);
  if (!survey) {
    throw new Response('설문을 찾을 수 없습니다.', { status: 404 });
  }
  return survey;
}

function editable(survey: AdminSurvey) {
  if (survey.stage === 'published') {
    throw new Error('공개된 설문은 고칠 수 없습니다.');
  }
  return survey;
}

export async function listAdminSurveys(): Promise<AdminSurvey[]> {
  return structuredClone(surveys);
}

export async function getAdminSurvey(id: string): Promise<AdminSurvey> {
  return structuredClone(find(id));
}

export async function createSurveyDraft(
  owner: string,
  department: string,
): Promise<string> {
  const id = `new-survey-${nextNumber++}`;
  surveys.push({
    id,
    title: '',
    department,
    owner,
    audience: '전교생',
    identity: 'anonymous',
    stage: 'draft',
    intro: '',
    savedAt: new Date().toISOString(),
    responses: 0,
    target: 640,
    reviewRequested: false,
    questions: [
      {
        id: 'q1',
        type: 'single',
        title: '',
        required: true,
        options: ['', ''],
      },
    ],
  });
  return id;
}

/** 자동 저장. 저장한 시각을 돌려준다. */
export async function saveSurveyDraft(
  id: string,
  draft: SurveyDraft,
): Promise<string> {
  const survey = editable(find(id));
  Object.assign(survey, structuredClone(draft));
  survey.savedAt = new Date().toISOString();
  return survey.savedAt;
}

export async function requestSurveyReview(id: string): Promise<void> {
  editable(find(id)).reviewRequested = true;
}

/** 공개 예약. 공개일이 이미 지났으면 바로 공개한다. */
export async function scheduleSurvey(id: string): Promise<void> {
  const survey = editable(find(id));
  const opensAt = survey.opensAt ?? new Date().toISOString();
  survey.opensAt = opensAt;
  survey.stage = new Date(opensAt) > new Date() ? 'scheduled' : 'published';
}

/** 공개 예약을 취소하고 작성 중으로 돌린다. */
export async function unscheduleSurvey(id: string): Promise<void> {
  const survey = find(id);
  if (survey.stage !== 'scheduled') {
    throw new Error('예약된 설문만 취소할 수 있습니다.');
  }
  survey.stage = 'draft';
}

/** 학생 화면에 나가는 설문: 공개된 설문을 학생 화면 모양으로 바꾼다. features/surveys가 이 함수로 설문을 받는다. */
export async function listPublishedSurveys(): Promise<Survey[]> {
  return structuredClone(
    surveys.flatMap(
      ({
        id,
        title,
        department,
        audience,
        identity,
        closesAt,
        closedAt,
        questions,
        stage,
      }) =>
        stage === 'published' && closesAt
          ? [
              {
                id,
                title,
                department,
                audience,
                identity,
                closesAt: closedAt ?? closesAt,
                questions,
              },
            ]
          : [],
    ),
  );
}

function responsesOf(survey: AdminSurvey) {
  let list = responses.get(survey.id);
  if (!list) {
    list = mockResponses(survey);
    responses.set(survey.id, list);
  }
  return list;
}

function published(id: string) {
  const survey = find(id);
  if (survey.stage !== 'published') {
    throw new Response('아직 공개하지 않은 설문입니다.', { status: 404 });
  }
  return survey;
}

/** 설문 결과: 설문과 제출된 응답 전체. 분석(요약·교차표)은 화면에서 계산한다. */
export async function getSurveyResults(id: string): Promise<SurveyResults> {
  const survey = published(id);
  return structuredClone({ survey, responses: responsesOf(survey) });
}

/**
 * 응답 받기 켜기·끄기. 끄면 마감일 전이어도 바로 마감되고 학생 화면에도 마감으로 보인다.
 * 마감일이 지난 설문은 다시 켤 수 없다.
 */
export async function setAcceptingResponses(
  id: string,
  accepting: boolean,
): Promise<void> {
  const survey = published(id);
  if (!accepting) {
    survey.closedAt ??= new Date().toISOString();
    return;
  }
  if (survey.closesAt && new Date(survey.closesAt) < new Date()) {
    throw new Error('마감일이 지난 설문은 다시 열 수 없습니다.');
  }
  survey.closedAt = undefined;
}

export async function setResponseExcluded(
  surveyId: string,
  responseId: string,
  excluded: boolean,
): Promise<void> {
  const response = responsesOf(published(surveyId)).find(
    (item) => item.id === responseId,
  );
  if (!response) throw new Error('응답을 찾을 수 없습니다.');
  response.excluded = excluded;
}

/** 응답 하나를 지운다. 되돌릴 수 없다. 응답 번호는 그대로 둔다. */
export async function deleteResponse(
  surveyId: string,
  responseId: string,
): Promise<void> {
  const survey = published(surveyId);
  const list = responsesOf(survey).filter((item) => item.id !== responseId);
  responses.set(survey.id, list);
  survey.responses = list.length;
}

export async function deleteAllResponses(surveyId: string): Promise<void> {
  const survey = published(surveyId);
  responses.set(survey.id, []);
  survey.responses = 0;
}

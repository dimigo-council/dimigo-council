import { useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import {
  Badge,
  Button,
  Notice,
  statusTone,
  Switch,
} from '../../components/kit/index.ts';
import { formatDate } from '../../lib/date.ts';
import { daysLeft, identityLabel } from '../surveys/format.ts';
import { getSurveyResults, setAcceptingResponses } from './api.ts';
import { surveyStatus } from './format.ts';
import {
  formatDuration,
  formatRatio,
  median,
  responsesCsv,
  responsesIncludedInAnalysis,
} from './results.ts';
import type { AdminSurvey, SurveyResponse, SurveyResults } from './types.ts';
import '../surveys/surveys.css';
import './survey-admin.css';
import './survey-results.css';

export async function surveyResultsLoader({ params }: LoaderFunctionArgs) {
  return getSurveyResults(params.surveyId ?? '');
}

export interface ResultsContext extends SurveyResults {
  /** 응답을 바꾼 뒤(제외·삭제) 다시 불러온다 */
  reload: () => Promise<void>;
}

/** 요약·질문·개별 보기 화면이 결과를 받는다 */
export function useResults() {
  return useOutletContext<ResultsContext>();
}

/** 탭마다 주소가 따로 있어 탭끼리 링크로 이어 볼 수 있다. */
export function surveyResultsPaths(surveyId: string) {
  const summary = `/work/surveys/${surveyId}/results`;
  return {
    summary,
    questions: `${summary}/questions`,
    responses: `${summary}/responses`,
  };
}

function isPastDeadline(survey: AdminSurvey) {
  if (!survey.closesAt) return false;
  return new Date(survey.closesAt) < new Date();
}

function errorMessage(cause: unknown) {
  if (cause instanceof Error) return cause.message;
  return String(cause);
}

function downloadCsv({ survey, responses }: SurveyResults) {
  const blob = new Blob([responsesCsv(survey, responses)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${survey.title} 응답.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** 응답 받기 스위치: 마감일 전이면 직접 닫았다가 다시 열 수 있다. */
function useAcceptingToggle(
  survey: AdminSurvey,
  isAccepting: boolean,
  reload: () => Promise<void>,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleAccepting = async () => {
    setIsSaving(true);
    setError('');
    try {
      await setAcceptingResponses(survey.id, !isAccepting);
      await reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, error, toggleAccepting };
}

function closingDescription(survey: AdminSurvey) {
  if (survey.closedAt) return `${formatDate(survey.closedAt, true)} 직접 마감`;
  if (survey.closesAt) return `${formatDate(survey.closesAt, true)} 마감`;
  return '';
}

function SurveyMeta({ survey }: { survey: AdminSurvey }) {
  const status = surveyStatus(survey);
  return (
    <span className="meta-row">
      <Badge tone={statusTone.survey[status]}>{status}</Badge>
      <span>{closingDescription(survey)}</span>
      <span>
        {survey.department}, {survey.owner}
      </span>
      <span>
        {survey.audience} · {identityLabel[survey.identity]}
      </span>
    </span>
  );
}

function RemainingPeriod({
  isAccepting,
  daysUntilDeadline,
}: {
  isAccepting: boolean;
  daysUntilDeadline: number | undefined;
}) {
  if (!isAccepting || daysUntilDeadline === undefined) return '마감';
  if (daysUntilDeadline === 0) return '오늘 마감';
  return (
    <>
      {daysUntilDeadline}
      <small>일</small>
    </>
  );
}

function responseRateText(responseCount: number, target: number) {
  if (!target) return '—';
  return formatRatio(responseCount / target);
}

function medianDurationText(includedResponses: SurveyResponse[]) {
  if (includedResponses.length === 0) return '—';
  const durations = includedResponses.map(
    (response) => response.durationSeconds,
  );
  return formatDuration(median(durations));
}

/** 머리글 아래 핵심 숫자: 응답 수, 응답률, 남은 기간, 응답 시간 */
function ResultFacts({
  survey,
  responses,
  isAccepting,
}: {
  survey: AdminSurvey;
  responses: SurveyResponse[];
  isAccepting: boolean;
}) {
  const includedResponses = responsesIncludedInAnalysis(responses);
  const daysUntilDeadline = survey.closesAt
    ? daysLeft(survey.closesAt)
    : undefined;

  return (
    <dl className="result-facts">
      <div>
        <dt>응답</dt>
        <dd>
          {responses.length}
          <small>/ {survey.target}명</small>
        </dd>
      </div>
      <div>
        <dt>응답률</dt>
        <dd>{responseRateText(responses.length, survey.target)}</dd>
      </div>
      <div>
        <dt>{isAccepting ? '남은 기간' : '상태'}</dt>
        <dd>
          <RemainingPeriod
            isAccepting={isAccepting}
            daysUntilDeadline={daysUntilDeadline}
          />
        </dd>
      </div>
      <div>
        <dt>응답 시간 (중앙값)</dt>
        <dd>{medianDurationText(includedResponses)}</dd>
      </div>
    </dl>
  );
}

function ResultTabs({
  surveyId,
  responseCount,
}: {
  surveyId: string;
  responseCount: number;
}) {
  const paths = surveyResultsPaths(surveyId);
  return (
    <nav className="tabs result-tabs" aria-label="응답 보기 방식">
      <NavLink className="tabs__tab" to={paths.summary} end>
        요약
      </NavLink>
      <NavLink className="tabs__tab" to={paths.questions}>
        질문
      </NavLink>
      <NavLink className="tabs__tab" to={paths.responses}>
        개별 보기
        <span className="count">{responseCount}</span>
      </NavLink>
    </nav>
  );
}

/** 설문 결과: 머리글(응답 받기·내려받기)과 요약·질문·개별 보기 탭 */
export function SurveyResultsLayout() {
  const results = useLoaderData<typeof surveyResultsLoader>();
  const { survey, responses } = results;
  const revalidator = useRevalidator();
  const reload = () => revalidator.revalidate();

  const isAccepting = surveyStatus(survey) === '진행 중';
  const pastDeadline = isPastDeadline(survey);
  const { isSaving, error, toggleAccepting } = useAcceptingToggle(
    survey,
    isAccepting,
    reload,
  );
  const cannotReopenAfterDeadline = !isAccepting && pastDeadline;
  const closedBeforeDeadline = !isAccepting && !pastDeadline;
  const hasResponses = responses.length > 0;

  return (
    <>
      <nav className="breadcrumb" aria-label="경로">
        <Link to="/work/surveys">설문</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">결과</span>
      </nav>
      <PageHeader
        title={survey.title}
        description={<SurveyMeta survey={survey} />}
        actions={
          <>
            <Switch
              className="result-accepting"
              label="응답 받기"
              checked={isAccepting}
              disabled={isSaving || cannotReopenAfterDeadline}
              onChange={() => void toggleAccepting()}
            />
            <Button
              disabled={!hasResponses}
              onClick={() => downloadCsv(results)}
            >
              CSV 내려받기
            </Button>
            <Button onClick={() => window.print()}>인쇄</Button>
            <Link className="btn btn--primary" to="/work/reports/new">
              결과로 보고서 쓰기
            </Link>
          </>
        }
      />

      {error && (
        <Notice tone="warn" role="alert">
          {error}
        </Notice>
      )}
      {closedBeforeDeadline && (
        <Notice tone="neutral" className="result-closed">
          응답을 받지 않고 있습니다. 학생 화면에는 마감으로 보입니다. 마감일(
          {survey.closesAt && formatDate(survey.closesAt)}) 전까지는 다시 켤 수
          있습니다.
        </Notice>
      )}

      <ResultFacts
        survey={survey}
        responses={responses}
        isAccepting={isAccepting}
      />
      <ResultTabs surveyId={survey.id} responseCount={responses.length} />

      {hasResponses ? (
        <Outlet context={{ ...results, reload } satisfies ResultsContext} />
      ) : (
        <p className="empty-state result-empty">아직 들어온 응답이 없습니다.</p>
      )}
    </>
  );
}

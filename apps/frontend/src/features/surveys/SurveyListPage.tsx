import { Link, useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import {
  Badge,
  ListGroup,
  ListRow,
  Notice,
  Tabs,
} from '../../components/kit/index.ts';
import { formatDate } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { isMockApi, listSurveys } from './api.ts';
import {
  daysLeft,
  estimatedMinutes,
  formatDday,
  identityLabel,
} from './format.ts';
import type { SurveySummary } from './types.ts';
import './surveys.css';

export async function surveyListLoader() {
  return listSurveys();
}

type SurveyTab = 'open' | 'mine' | 'closed';
const surveyTabs: SurveyTab[] = ['open', 'mine', 'closed'];

const emptyText: Record<SurveyTab, string> = {
  open: '지금 진행 중인 설문이 없습니다.',
  mine: '아직 응답한 설문이 없습니다.',
  closed: '마감된 설문이 없습니다.',
};

function SurveyActions({ survey }: { survey: SurveySummary }) {
  const to = `/surveys/${survey.id}`;
  if (survey.isClosed) return null;
  if (survey.myStatus === 'submitted') {
    return (
      <>
        <Badge tone="success">응답 완료</Badge>
        <Link className="btn btn--secondary btn--sm" to={to}>
          응답 수정
        </Link>
      </>
    );
  }
  return (
    <Link className="btn btn--primary" to={to}>
      {survey.myStatus === 'draft' ? '이어서 응답' : '응답하기'}
    </Link>
  );
}

function SurveyRow({ survey }: { survey: SurveySummary }) {
  const days = daysLeft(survey.closesAt);
  return (
    <ListRow
      title={
        <Link className="list-row__link" to={`/surveys/${survey.id}`}>
          {survey.title}
        </Link>
      }
      meta={[
        survey.audience,
        `${survey.questionCount}문항, 약 ${estimatedMinutes(survey.questionCount)}분`,
        identityLabel[survey.identity],
        survey.department,
      ]}
      aside={
        survey.isClosed ? (
          <>
            <Badge tone="success">마감</Badge>
            <span>{formatDate(survey.closesAt)} 마감</span>
          </>
        ) : (
          <>
            <strong
              className={
                days <= 1 ? 'survey-dday survey-dday--soon' : 'survey-dday'
              }
            >
              {formatDday(days)}
            </strong>
            <span>{formatDate(survey.closesAt)} 마감</span>
          </>
        )
      }
      actions={<SurveyActions survey={survey} />}
    />
  );
}

export function SurveyListPage() {
  const surveys = useLoaderData<typeof surveyListLoader>();
  const [tab, setTab] = useSearchParamOption('tab', surveyTabs, 'open');

  const byDeadline = (a: SurveySummary, b: SurveySummary) =>
    a.closesAt.localeCompare(b.closesAt);
  const groups: Record<SurveyTab, SurveySummary[]> = {
    open: surveys.filter((s) => !s.isClosed).sort(byDeadline),
    mine: surveys.filter((s) => s.myStatus === 'submitted').sort(byDeadline),
    closed: surveys.filter((s) => s.isClosed).sort((a, b) => byDeadline(b, a)),
  };
  const visible = groups[tab];

  return (
    <>
      <PageHeader
        title="설문"
        description="학생회가 진행하는 설문입니다. 마감 전까지는 응답을 고칠 수 있습니다."
      />

      <Tabs
        aria-label="설문 보기"
        idPrefix="surveys"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'open', label: '진행 중', count: groups.open.length },
          {
            value: 'mine',
            label: '내가 응답한 설문',
            count: groups.mine.length,
          },
          {
            value: 'closed',
            label: '마감된 설문',
            count: groups.closed.length,
          },
        ]}
      />

      <div
        className="survey-panel"
        role="tabpanel"
        id={`surveys-panel-${tab}`}
        aria-labelledby={`surveys-tab-${tab}`}
      >
        {visible.length > 0 ? (
          <ListGroup>
            {visible.map((survey) => (
              <SurveyRow key={survey.id} survey={survey} />
            ))}
          </ListGroup>
        ) : (
          <p className="empty-state">{emptyText[tab]}</p>
        )}
      </div>

      <Notice tone="neutral" className="survey-cta">
        <span>
          설문에 없는 이야기가 있나요? 건의는 기간 상관없이 언제든 받습니다.
        </span>
        <Link className="text-link" to="/suggestions/new">
          건의하기
        </Link>
      </Notice>

      {import.meta.env.DEV && isMockApi && (
        <p className="dev-note">
          개발용 예시 데이터입니다. 새로고침하면 응답이 처음 상태로 돌아갑니다.
        </p>
      )}
    </>
  );
}

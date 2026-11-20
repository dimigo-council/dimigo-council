import { Link, useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Badge } from '../../dimi-ui-kit/index.ts';
import {
  ButtonLink,
  EmptyState,
  ListGroup,
  ListRow,
  ListRowLink,
  Tabs,
} from '../../components/ui/index.ts';
import { formatDate } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listSurveys } from './api.ts';
import {
  daysLeft,
  estimatedMinutes,
  formatDday,
  identityLabel,
} from './format.ts';
import type { SurveySummary } from './types.ts';
import * as S from './styles.ts';

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
        <Badge theme="grayscale">응답 완료</Badge>
        <ButtonLink size="small" to={to}>
          응답 수정
        </ButtonLink>
      </>
    );
  }
  return (
    <ButtonLink theme="accent" variant="primary" to={to}>
      {survey.myStatus === 'draft' ? '이어서 응답' : '응답하기'}
    </ButtonLink>
  );
}

function SurveyRow({ survey }: { survey: SurveySummary }) {
  const days = daysLeft(survey.closesAt);
  return (
    <ListRow
      title={
        <ListRowLink as={Link} to={`/surveys/${survey.id}`}>
          {survey.title}
        </ListRowLink>
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
            <Badge theme="grayscale">마감</Badge>
            <span>{formatDate(survey.closesAt)} 마감</span>
          </>
        ) : (
          <>
            <S.SurveyDday $soon={days <= 1}>{formatDday(days)}</S.SurveyDday>
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
      <PageHeader title="설문" visuallyHidden />

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

      <S.SurveyPanel
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
          <EmptyState>{emptyText[tab]}</EmptyState>
        )}
      </S.SurveyPanel>
    </>
  );
}

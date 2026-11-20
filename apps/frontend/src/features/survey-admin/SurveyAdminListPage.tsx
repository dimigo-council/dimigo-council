import { useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import {
  FilterBar,
  FilterSelect,
} from '../../components/intranet/FilterSelect.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import { Badge, Button, Input } from '../../dimi-ui-kit/index.ts';
import {
  EmptyState,
  ListGroup,
  ListRowLink,
  ListRowMain,
  ListRowMeta,
  ListRowTitle,
  PageToolbar,
  statusTone,
  Tabs,
} from '../../components/ui/index.ts';
import { formatDate, formatDateTime } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listMembers } from '../members/api.ts';
import { identityLabel } from '../surveys/format.ts';
import { createSurveyDraft, listAdminSurveys } from './api.ts';
import { surveyStatus } from './format.ts';
import type { AdminSurvey } from './types.ts';
import * as S from './styles.ts';
import { iconSearch } from '../../dimi-ui-kit/icons';

export async function surveyAdminListLoader() {
  const [surveys, members] = await Promise.all([
    listAdminSurveys(),
    listMembers(),
  ]);
  return { surveys, members };
}

type Tab = 'open' | 'preparing' | 'closed';
const tabs: Tab[] = ['open', 'preparing', 'closed'];
const inTab: Record<Tab, (survey: AdminSurvey) => boolean> = {
  open: (survey) => surveyStatus(survey) === '진행 중',
  preparing: (survey) => survey.stage !== 'published',
  closed: (survey) => surveyStatus(survey) === '마감',
};
const emptyText: Record<Tab, string> = {
  open: '지금 진행 중인 설문이 없습니다.',
  preparing: '준비 중인 설문이 없습니다.',
  closed: '마감된 설문이 없습니다.',
};

function SurveyRow({ survey }: { survey: AdminSurvey }) {
  const status = surveyStatus(survey);
  let date = `${formatDateTime(survey.savedAt)} 저장`;
  if (survey.stage === 'scheduled' && survey.opensAt) {
    date = `${formatDate(survey.opensAt)} 공개`;
  } else if (survey.stage === 'published' && survey.closesAt) {
    date = `${formatDate(survey.closesAt)} 마감`;
  }
  return (
    <S.SurveyAdminRow>
      <ListRowMain>
        <ListRowTitle>
          <ListRowLink
            as={Link}
            to={
              survey.stage === 'published'
                ? `/work/surveys/${survey.id}/results`
                : `/work/surveys/${survey.id}/edit`
            }
          >
            {survey.title || '제목 없는 설문'}
          </ListRowLink>
        </ListRowTitle>
        <ListRowMeta>
          <span>
            {survey.department}, {survey.owner}
          </span>
          <span>{survey.audience}</span>
          <span>{survey.questions.length}문항</span>
          <span>{identityLabel[survey.identity]}</span>
        </ListRowMeta>
      </ListRowMain>
      {survey.stage === 'published' && (
        <S.SurveyAdminRowMeter>
          <Meter
            label="응답 수"
            value={survey.responses}
            max={survey.target}
            text={`${survey.responses}명`}
          />
        </S.SurveyAdminRowMeter>
      )}
      <Badge theme={statusTone.survey[status]}>{status}</Badge>
      <S.SurveyAdminRowDate>{date}</S.SurveyAdminRowDate>
    </S.SurveyAdminRow>
  );
}

export function SurveyAdminListPage() {
  const { surveys, members } = useLoaderData<typeof surveyAdminListLoader>();
  const session = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useSearchParamOption('tab', tabs, 'open');
  const [department, setDepartment] = useState('');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const myDepartment =
    members.find((member) => member.name === session.name)?.department ??
    '회장단';
  const departments = [...new Set(surveys.map((survey) => survey.department))];

  const onCreate = async () => {
    setCreating(true);
    try {
      const id = await createSurveyDraft(session.name, myDepartment);
      await navigate(`/work/surveys/${id}/edit`);
    } finally {
      setCreating(false);
    }
  };

  const keyword = query.trim();
  const visible = surveys
    .filter(
      (survey) =>
        inTab[tab](survey) &&
        (!department || survey.department === department) &&
        (!keyword || survey.title.includes(keyword)),
    )
    .sort((a, b) =>
      tab === 'preparing'
        ? b.savedAt.localeCompare(a.savedAt)
        : (a.closesAt ?? '').localeCompare(b.closesAt ?? '') *
          (tab === 'closed' ? -1 : 1),
    );
  const count = (key: Tab) => surveys.filter(inTab[key]).length;

  return (
    <>
      <PageHeader title="설문 관리" visuallyHidden />

      <Tabs
        aria-label="설문 보기"
        idPrefix="survey-admin"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'open', label: '진행 중', count: count('open') },
          { value: 'preparing', label: '준비 중', count: count('preparing') },
          { value: 'closed', label: '마감', count: count('closed') },
        ]}
      />

      <S.SurveyAdminPanel
        role="tabpanel"
        id={`survey-admin-panel-${tab}`}
        aria-labelledby={`survey-admin-tab-${tab}`}
      >
        <PageToolbar>
          <FilterBar>
            <FilterSelect
              label="부서"
              value={department}
              onChange={setDepartment}
            >
              <option value="">전체</option>
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </FilterSelect>
            <Input
              type="search"
              leadingIcon={iconSearch}
              aria-label="설문 찾기"
              placeholder="설문 제목으로 찾기"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </FilterBar>
          <Button
            theme="accent"
            variant="primary"
            disabled={creating}
            onClick={() => void onCreate()}
          >
            <PlusIcon />
            설문 만들기
          </Button>
        </PageToolbar>

        {visible.length > 0 ? (
          <ListGroup aria-label="설문 목록">
            {visible.map((survey) => (
              <SurveyRow key={survey.id} survey={survey} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState>
            {department || keyword
              ? '조건에 맞는 설문이 없습니다.'
              : emptyText[tab]}
          </EmptyState>
        )}
      </S.SurveyAdminPanel>
    </>
  );
}

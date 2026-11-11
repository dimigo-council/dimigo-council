import { useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { FilterSelect } from '../../components/intranet/FilterSelect.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import {
  Badge,
  Button,
  ListGroup,
  statusTone,
  Tabs,
} from '../../components/kit/index.ts';
import { formatDate, formatDateTime } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listMembers } from '../members/api.ts';
import { identityLabel } from '../surveys/format.ts';
import { createSurveyDraft, listAdminSurveys } from './api.ts';
import { surveyStatus } from './format.ts';
import type { AdminSurvey } from './types.ts';
import './survey-admin.css';

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
    <li className="list-row survey-admin-row">
      <div className="list-row__main">
        <h3 className="list-row__title">
          <Link
            className="list-row__link"
            to={
              survey.stage === 'published'
                ? `/work/surveys/${survey.id}/results`
                : `/work/surveys/${survey.id}/edit`
            }
          >
            {survey.title || '제목 없는 설문'}
          </Link>
        </h3>
        <div className="list-row__meta">
          <span>
            {survey.department}, {survey.owner}
          </span>
          <span>{survey.audience}</span>
          <span>{survey.questions.length}문항</span>
          <span>{identityLabel[survey.identity]}</span>
        </div>
      </div>
      {survey.stage === 'published' && (
        <span className="survey-admin-row__meter">
          <Meter
            label="응답 수"
            value={survey.responses}
            max={survey.target}
            text={`${survey.responses}명`}
          />
        </span>
      )}
      <Badge tone={statusTone.survey[status]}>{status}</Badge>
      <span className="survey-admin-row__date">{date}</span>
    </li>
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

      <div
        className="survey-admin-panel"
        role="tabpanel"
        id={`survey-admin-panel-${tab}`}
        aria-labelledby={`survey-admin-tab-${tab}`}
      >
        <div className="page-toolbar">
          <div className="filter-bar">
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
            <input
              type="search"
              className="field__control filter-bar__search"
              aria-label="설문 찾기"
              placeholder="설문 제목으로 찾기"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button
            variant="primary"
            disabled={creating}
            onClick={() => void onCreate()}
          >
            <PlusIcon />
            설문 만들기
          </Button>
        </div>

        {visible.length > 0 ? (
          <ListGroup aria-label="설문 목록">
            {visible.map((survey) => (
              <SurveyRow key={survey.id} survey={survey} />
            ))}
          </ListGroup>
        ) : (
          <p className="empty-state">
            {department || keyword
              ? '조건에 맞는 설문이 없습니다.'
              : emptyText[tab]}
          </p>
        )}
      </div>
    </>
  );
}

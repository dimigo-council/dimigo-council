import { useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { FilterSelect } from '../../components/intranet/FilterSelect.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import { Avatar, Badge, statusTone, Tabs } from '../../components/kit/index.ts';
import { formatShortDate } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listAgendas } from './api.ts';
import { originLabel, reachedStage } from './format.ts';
import {
  agendaOrigins,
  agendaStages,
  stoppedStatuses,
  type Agenda,
  type AgendaVisibility,
} from './types.ts';
import './agendas.css';

export async function agendaListLoader() {
  return listAgendas();
}

type Tab = 'open' | 'done' | 'stopped' | 'all';
const tabs: Tab[] = ['open', 'done', 'stopped', 'all'];
const inTab: Record<Tab, (agenda: Agenda) => boolean> = {
  open: (a) => a.status !== '완료' && !stoppedStatuses.includes(a.status),
  done: (a) => a.status === '완료',
  stopped: (a) => stoppedStatuses.includes(a.status),
  all: () => true,
};

const visibilities: AgendaVisibility[] = [
  '학생회 내부',
  '공개 검토 중',
  '전체 공개',
];

/** 다섯 칸 막대: 지나온 단계까지 채운다. 보류·부결이면 멈춘 단계까지 회색. */
function StageBar({ agenda }: { agenda: Agenda }) {
  const reached = reachedStage(agenda);
  const filled = reached ? agendaStages.indexOf(reached) + 1 : 0;
  const stopped = stoppedStatuses.includes(agenda.status);
  return (
    <span className="stage-bar">
      <span
        className="stage-bar__track"
        data-stopped={stopped || undefined}
        aria-hidden="true"
      >
        {agendaStages.map((stage, index) => (
          <span key={stage} data-on={index < filled || undefined} />
        ))}
      </span>
      <span className="stage-bar__label">
        {agenda.status}
        {stopped && reached && (
          <span className="stage-bar__note">{reached}에서</span>
        )}
      </span>
    </span>
  );
}

export function AgendaListPage() {
  const agendas = useLoaderData<typeof agendaListLoader>();
  const [tab, setTab] = useSearchParamOption('tab', tabs, 'open');

  const [department, setDepartment] = useState('');
  const [origin, setOrigin] = useState('');
  const [visibility, setVisibility] = useState('');
  const [query, setQuery] = useState('');

  const departments = [...new Set(agendas.map((a) => a.department))];
  const keyword = query.trim();
  const visible = agendas.filter(
    (a) =>
      inTab[tab](a) &&
      (!department || a.department === department) &&
      (!origin || a.origins.some((item) => item === origin)) &&
      (!visibility || a.visibility === visibility) &&
      (!keyword || a.id.includes(keyword) || a.title.includes(keyword)),
  );
  const filtered = Boolean(department || origin || visibility || keyword);

  return (
    <>
      <PageHeader title="안건" visuallyHidden />

      <Tabs
        aria-label="안건 보기"
        idPrefix="agendas"
        value={tab}
        onChange={setTab}
        items={[
          {
            value: 'open',
            label: '진행 중',
            count: agendas.filter(inTab.open).length,
          },
          {
            value: 'done',
            label: '완료',
            count: agendas.filter(inTab.done).length,
          },
          {
            value: 'stopped',
            label: '보류·부결',
            count: agendas.filter(inTab.stopped).length,
          },
          { value: 'all', label: '전체', count: agendas.length },
        ]}
      />

      <div
        className="agenda-board"
        role="tabpanel"
        id={`agendas-panel-${tab}`}
        aria-labelledby={`agendas-tab-${tab}`}
      >
        <div className="filter-bar">
          <FilterSelect
            label="담당"
            value={department}
            onChange={setDepartment}
          >
            <option value="">전체 부서</option>
            {departments.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="출처" value={origin} onChange={setOrigin}>
            <option value="">전체</option>
            {agendaOrigins.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="공개"
            value={visibility}
            onChange={setVisibility}
          >
            <option value="">전체</option>
            {visibilities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <input
            type="search"
            className="field__control filter-bar__search"
            aria-label="안건 찾기"
            placeholder="번호, 안건 이름으로 찾기"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {visible.length > 0 ? (
          <div className="table-wrap" tabIndex={0} aria-label="안건 목록">
            <table className="data-table agenda-table">
              <thead>
                <tr>
                  <th scope="col">번호</th>
                  <th scope="col">안건</th>
                  <th scope="col">출처</th>
                  <th scope="col">담당</th>
                  <th scope="col">단계</th>
                  <th scope="col">업무</th>
                  <th scope="col">공개</th>
                  <th scope="col" className="data-table__num">
                    최근 변경
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((agenda) => (
                  <tr key={agenda.id}>
                    <td className="data-table__muted">{agenda.id}</td>
                    <th scope="row">
                      <Link
                        className="data-table__link"
                        to={`/work/agendas/${agenda.id}`}
                      >
                        {agenda.title}
                      </Link>
                    </th>
                    <td className="data-table__muted">{originLabel(agenda)}</td>
                    <td>
                      <span className="owner">
                        <Avatar name={agenda.department} aria-hidden="true" />
                        {agenda.department}
                      </span>
                    </td>
                    <td>
                      <StageBar agenda={agenda} />
                    </td>
                    <td>
                      {agenda.tasks.total > 0 ? (
                        <Meter
                          label={`${agenda.title} 업무 완료`}
                          value={agenda.tasks.done}
                          max={agenda.tasks.total}
                        />
                      ) : (
                        <span className="data-table__muted">없음</span>
                      )}
                    </td>
                    <td>
                      <Badge tone={statusTone.visibility[agenda.visibility]}>
                        {agenda.visibility}
                      </Badge>
                    </td>
                    <td className="data-table__num data-table__muted">
                      {formatShortDate(agenda.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">
            {filtered
              ? '조건에 맞는 안건이 없습니다.'
              : '이 보기에 해당하는 안건이 없습니다.'}
          </p>
        )}
        <p className="agenda-board__note">
          단계는 등록, 검토, 결정, 추진, 완료 순서입니다. 보류·부결된 안건은
          멈춘 단계까지 회색으로 표시합니다.
        </p>
      </div>
    </>
  );
}

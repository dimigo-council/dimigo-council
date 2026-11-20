import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import {
  FilterBar,
  FilterSelect,
} from '../../components/intranet/FilterSelect.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import { Badge, Input } from '../../dimi-ui-kit/index.ts';
import {
  DataCell,
  DataTable,
  DataTableLink,
  EmptyState,
  Owner,
  PersonAvatar,
  statusTone,
  TableWrap,
  Tabs,
} from '../../components/ui/index.ts';
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
import * as S from './styles.ts';
import { iconSearch } from '../../dimi-ui-kit/icons';

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
    <S.StageBar>
      <S.StageBarTrack aria-hidden="true">
        {agendaStages.map((stage, index) => (
          <S.StageBarStep key={stage} $on={index < filled} $stopped={stopped} />
        ))}
      </S.StageBarTrack>
      <S.StageBarLabel>
        {agenda.status}
        {stopped && reached && <S.StageBarNote>{reached}에서</S.StageBarNote>}
      </S.StageBarLabel>
    </S.StageBar>
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

      <S.AgendaBoard
        role="tabpanel"
        id={`agendas-panel-${tab}`}
        aria-labelledby={`agendas-tab-${tab}`}
      >
        <FilterBar>
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
          <Input
            type="search"
            leadingIcon={iconSearch}
            aria-label="안건 찾기"
            placeholder="번호, 안건 이름으로 찾기"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </FilterBar>

        {visible.length > 0 ? (
          <TableWrap tabIndex={0} aria-label="안건 목록">
            <DataTable>
              <thead>
                <tr>
                  <th scope="col">번호</th>
                  <th scope="col">안건</th>
                  <th scope="col">출처</th>
                  <th scope="col">담당</th>
                  <th scope="col">단계</th>
                  <th scope="col">업무</th>
                  <th scope="col">공개</th>
                  <DataCell as="th" scope="col" $num>
                    최근 변경
                  </DataCell>
                </tr>
              </thead>
              <tbody>
                {visible.map((agenda) => (
                  <tr key={agenda.id}>
                    <DataCell $muted>{agenda.id}</DataCell>
                    <th scope="row">
                      <DataTableLink to={`/work/agendas/${agenda.id}`}>
                        {agenda.title}
                      </DataTableLink>
                    </th>
                    <DataCell $muted>{originLabel(agenda)}</DataCell>
                    <td>
                      <Owner>
                        <PersonAvatar
                          name={agenda.department}
                          aria-hidden="true"
                        />
                        {agenda.department}
                      </Owner>
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
                        <DataCell as="span" $muted>
                          없음
                        </DataCell>
                      )}
                    </td>
                    <td>
                      <Badge theme={statusTone.visibility[agenda.visibility]}>
                        {agenda.visibility}
                      </Badge>
                    </td>
                    <DataCell $num $muted>
                      {formatShortDate(agenda.updatedAt)}
                    </DataCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </TableWrap>
        ) : (
          <EmptyState>
            {filtered
              ? '조건에 맞는 안건이 없습니다.'
              : '이 보기에 해당하는 안건이 없습니다.'}
          </EmptyState>
        )}
        <S.AgendaBoardNote>
          단계는 등록, 검토, 결정, 추진, 완료 순서입니다. 보류·부결된 안건은
          멈춘 단계까지 회색으로 표시합니다.
        </S.AgendaBoardNote>
      </S.AgendaBoard>
    </>
  );
}

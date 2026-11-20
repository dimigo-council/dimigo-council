import { Link, useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Badge } from '../../dimi-ui-kit/index.ts';
import {
  ChoiceGroup,
  EmptyState,
  ListGroupRoot,
  ListRowAside,
  ListRowLink,
  ListRowMain,
  ListRowMeta,
  ListRowTitle,
  statusTone,
} from '../../components/ui/index.ts';
import { formatRelative } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listPublicAgendas } from './api.ts';
import { originLabel } from '../agendas/format.ts';
import { finishedStatuses } from '../agendas/types.ts';
import type { PublicAgenda } from './types.ts';
import * as S from './styles.ts';

export async function activityListLoader() {
  return listPublicAgendas();
}

type Filter = 'all' | 'open' | 'done';
const filters: Filter[] = ['all', 'open', 'done'];

function AgendaRow({ agenda }: { agenda: PublicAgenda }) {
  const { problem, decision, now } = agenda.summary;
  return (
    <S.AgendaRow>
      <ListRowMain>
        <ListRowTitle as="h2">
          <ListRowLink as={Link} to={`/activity/${agenda.id}`}>
            {agenda.title}
          </ListRowLink>
        </ListRowTitle>
        <ListRowMeta>
          <span>{agenda.id}</span>
          <span>{agenda.department}</span>
          <span>{originLabel(agenda)}</span>
          {agenda.includesMine && <Badge theme="accent">내 건의 포함</Badge>}
        </ListRowMeta>
      </ListRowMain>
      <ListRowAside>
        <Badge theme={statusTone.agenda[agenda.status]}>{agenda.status}</Badge>
        <span>{formatRelative(agenda.updatedAt)}</span>
      </ListRowAside>
      <S.AgendaRowSummary>{now ?? decision ?? problem}</S.AgendaRowSummary>
    </S.AgendaRow>
  );
}

export function ActivityListPage() {
  const agendas = useLoaderData<typeof activityListLoader>();
  const [filter, setFilter] = useSearchParamOption('filter', filters, 'all');

  const done = agendas.filter((a) => finishedStatuses.includes(a.status));
  const open = agendas.filter((a) => !finishedStatuses.includes(a.status));
  const visible = { all: agendas, open, done }[filter];

  return (
    <>
      <PageHeader title="학생회 활동" visuallyHidden />

      <ChoiceGroup
        aria-label="안건 보기"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'all', label: `전체 ${agendas.length}` },
          { value: 'open', label: `진행 중 ${open.length}` },
          { value: 'done', label: `끝난 안건 ${done.length}` },
        ]}
      />

      <S.AgendaList>
        {visible.length > 0 ? (
          <ListGroupRoot aria-label="공개 안건 목록">
            {visible.map((agenda) => (
              <AgendaRow key={agenda.id} agenda={agenda} />
            ))}
          </ListGroupRoot>
        ) : (
          <EmptyState>
            {agendas.length === 0
              ? '아직 공개된 안건이 없습니다.'
              : '이 보기에 해당하는 안건이 없습니다.'}
          </EmptyState>
        )}
      </S.AgendaList>
    </>
  );
}

import { Link, useLoaderData } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import {
  Badge,
  SegmentedControl,
  statusTone,
  Tag,
} from '../../components/kit/index.ts';
import { formatRelative } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { isMockApi, listPublicAgendas } from './api.ts';
import { originLabel } from '../agendas/format.ts';
import { finishedStatuses } from '../agendas/types.ts';
import type { PublicAgenda } from './types.ts';
import './activity.css';

export async function activityListLoader() {
  return listPublicAgendas();
}

type Filter = 'all' | 'open' | 'done';
const filters: Filter[] = ['all', 'open', 'done'];

function AgendaRow({ agenda }: { agenda: PublicAgenda }) {
  const { problem, decision, now } = agenda.summary;
  return (
    <li className="list-row agenda-row">
      <div className="list-row__main">
        <h2 className="list-row__title">
          <Link className="list-row__link" to={`/activity/${agenda.id}`}>
            {agenda.title}
          </Link>
        </h2>
        <div className="list-row__meta">
          <span>{agenda.id}</span>
          <span>{agenda.department}</span>
          <span>{originLabel(agenda)}</span>
          {agenda.includesMine && <Tag className="tag--mine">내 건의 포함</Tag>}
        </div>
      </div>
      <div className="list-row__aside">
        <Badge tone={statusTone.agenda[agenda.status]}>{agenda.status}</Badge>
        <span>{formatRelative(agenda.updatedAt)}</span>
      </div>
      <p className="agenda-row__summary">{now ?? decision ?? problem}</p>
    </li>
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
      <PageHeader
        title="학생회 활동"
        description="공개된 안건의 검토부터 결과까지의 기록입니다. 학생회 내부 기록은 공개 범위에 따라 빠질 수 있습니다."
      />

      <SegmentedControl
        aria-label="안건 보기"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'all', label: `전체 ${agendas.length}` },
          { value: 'open', label: `진행 중 ${open.length}` },
          { value: 'done', label: `끝난 안건 ${done.length}` },
        ]}
      />

      <div className="agenda-list">
        {visible.length > 0 ? (
          <ul className="list-group" aria-label="공개 안건 목록">
            {visible.map((agenda) => (
              <AgendaRow key={agenda.id} agenda={agenda} />
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            {agendas.length === 0
              ? '아직 공개된 안건이 없습니다.'
              : '이 보기에 해당하는 안건이 없습니다.'}
          </p>
        )}
      </div>

      {import.meta.env.DEV && isMockApi && (
        <p className="dev-note">
          개발용 예시 데이터입니다. 안건은 업무공간에서 공개로 표시한 것만
          보입니다.
        </p>
      )}
    </>
  );
}

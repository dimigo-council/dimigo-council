import { useState } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { FilterSelect } from '../../components/intranet/FilterSelect.tsx';
import {
  Badge,
  Button,
  statusTone,
  Tabs,
  Tag,
} from '../../components/kit/index.ts';
import { formatRelative } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { approveReport, listReports } from './api.ts';
import { reportKinds, type Report } from './types.ts';
import './reports.css';

export async function reportListLoader() {
  return listReports();
}

type Tab = 'drafting' | 'review' | 'done' | 'all';
const tabs: Tab[] = ['drafting', 'review', 'done', 'all'];
const inTab: Record<Tab, (report: Report) => boolean> = {
  drafting: (report) => report.status === '작성 중',
  review: (report) => report.status === '검토 요청',
  done: (report) => report.status === '완료',
  all: () => true,
};
const emptyText: Record<Tab, string> = {
  drafting: '작성 중인 보고서가 없습니다.',
  review: '검토를 기다리는 보고서가 없습니다.',
  done: '완료된 보고서가 없습니다.',
  all: '아직 보고서가 없습니다.',
};

function ReportRow({
  report,
  canApprove,
  busy,
  onApprove,
}: {
  report: Report;
  canApprove: boolean;
  busy: boolean;
  onApprove: () => void;
}) {
  return (
    <li className="list-row list-row--excerpt">
      <div className="list-row__main">
        <h3 className="list-row__title">
          <Link className="list-row__link" to={`/work/reports/${report.id}`}>
            {report.title}
          </Link>
        </h3>
        <div className="list-row__meta">
          <span>{report.id}</span>
          <Tag>{report.kind}</Tag>
          <span>
            {report.department}, {report.author}
          </span>
          {report.agenda && (
            <Link
              className="text-link"
              to={`/work/agendas/${report.agenda.id}`}
            >
              {report.agenda.id} {report.agenda.title}
            </Link>
          )}
        </div>
      </div>
      <div className="list-row__aside">
        <Badge tone={statusTone.report[report.status]}>{report.status}</Badge>
        <span>
          {report.status === '검토 요청' && report.reviewer
            ? `${report.reviewer} 검토`
            : formatRelative(report.updatedAt)}
        </span>
      </div>
      {canApprove && (
        <div className="list-row__actions">
          <Button size="sm" disabled={busy} onClick={onApprove}>
            확인 완료
          </Button>
        </div>
      )}
      <p className="list-row__excerpt">{report.body}</p>
    </li>
  );
}

export function ReportListPage() {
  const reports = useLoaderData<typeof reportListLoader>();
  const session = useSession();
  const revalidator = useRevalidator();
  const [tab, setTab] = useSearchParamOption('tab', tabs, 'drafting');
  const [kind, setKind] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const onApprove = async (id: string) => {
    setBusy(true);
    try {
      await approveReport(id);
      await revalidator.revalidate();
    } finally {
      setBusy(false);
    }
  };

  const keyword = query.trim();
  const visible = reports.filter(
    (report) =>
      inTab[tab](report) &&
      (!kind || report.kind === kind) &&
      (!keyword ||
        report.id.includes(keyword) ||
        report.title.includes(keyword) ||
        report.agenda?.id.includes(keyword)),
  );
  const count = (key: Tab) => reports.filter(inTab[key]).length;

  return (
    <>
      <PageHeader title="보고서" visuallyHidden />

      <Tabs
        aria-label="보고서 보기"
        idPrefix="reports"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'drafting', label: '작성 중', count: count('drafting') },
          { value: 'review', label: '검토 요청', count: count('review') },
          { value: 'done', label: '완료', count: count('done') },
          { value: 'all', label: '전체', count: reports.length },
        ]}
      />

      <div
        className="report-panel"
        role="tabpanel"
        id={`reports-panel-${tab}`}
        aria-labelledby={`reports-tab-${tab}`}
      >
        <div className="page-toolbar">
          <div className="filter-bar">
            <FilterSelect label="종류" value={kind} onChange={setKind}>
              <option value="">전체</option>
              {reportKinds.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </FilterSelect>
            <input
              type="search"
              className="field__control filter-bar__search"
              aria-label="보고서 찾기"
              placeholder="번호, 제목, 안건 번호로 찾기"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Link className="btn btn--primary" to="/work/reports/new">
            <PlusIcon />
            보고서 쓰기
          </Link>
        </div>

        {visible.length > 0 ? (
          <ul className="list-group" aria-label="보고서 목록">
            {visible.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                busy={busy}
                canApprove={
                  report.status === '검토 요청' &&
                  report.reviewer === session.name
                }
                onApprove={() => void onApprove(report.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            {kind || keyword
              ? '조건에 맞는 보고서가 없습니다.'
              : emptyText[tab]}
          </p>
        )}
      </div>
    </>
  );
}

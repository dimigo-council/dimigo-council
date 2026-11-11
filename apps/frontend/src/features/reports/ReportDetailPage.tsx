import { useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import {
  Avatar,
  Badge,
  Button,
  Notice,
  Select,
  statusTone,
  Tag,
  TextArea,
} from '../../components/kit/index.ts';
import { formatDateTime } from '../../lib/date.ts';
import { listMembers } from '../members/api.ts';
import type { Member } from '../members/types.ts';
import {
  approveReport,
  getReport,
  requestReportReview,
  returnReport,
  updateReportBody,
} from './api.ts';
import type { Report } from './types.ts';
import './reports.css';

export async function reportLoader({ params }: LoaderFunctionArgs) {
  const [report, members] = await Promise.all([
    getReport(params.reportId ?? ''),
    listMembers(),
  ]);
  return { report, members };
}

export function ReportDetailPage() {
  const { report, members } = useLoaderData<typeof reportLoader>();
  return <ReportDetail key={report.id} report={report} members={members} />;
}

function ReportDetail({
  report,
  members,
}: {
  report: Report;
  members: Member[];
}) {
  return (
    <>
      <nav className="breadcrumb" aria-label="경로">
        <Link to="/work/reports">보고서</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{report.id}</span>
      </nav>
      <PageHeader
        title={report.title}
        description={
          <span className="meta-row">
            <Badge tone={statusTone.report[report.status]}>
              {report.status}
            </Badge>
            <Tag>{report.kind}</Tag>
            <span>
              {report.department} · {report.author}
            </span>
            <span>{formatDateTime(report.updatedAt)} 수정</span>
          </span>
        }
        actions={
          report.agenda && (
            <Link
              className="btn btn--secondary"
              to={`/work/agendas/${report.agenda.id}`}
            >
              안건 보기
            </Link>
          )
        }
      />

      <div className="split-layout">
        <div className="split-layout__main">
          <ReportBody report={report} />
        </div>
        <aside className="split-layout__aside">
          <section className="panel" aria-label="보고서 정보">
            <dl className="info-list">
              <dt>작성</dt>
              <dd className="owner">
                <Avatar name={report.author} aria-hidden="true" />
                {report.author}
              </dd>
              {report.reviewer && (
                <>
                  <dt>검토</dt>
                  <dd className="owner">
                    <Avatar name={report.reviewer} aria-hidden="true" />
                    {report.reviewer}
                  </dd>
                </>
              )}
              {report.agenda && (
                <>
                  <dt>안건</dt>
                  <dd>
                    <Link
                      className="text-link"
                      to={`/work/agendas/${report.agenda.id}`}
                    >
                      {report.agenda.id} {report.agenda.title}
                    </Link>
                  </dd>
                </>
              )}
            </dl>
          </section>
          <ReviewPanel report={report} members={members} />
        </aside>
      </div>
    </>
  );
}

function ReportBody({ report }: { report: Report }) {
  const revalidator = useRevalidator();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(report.body);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const editable = report.status !== '완료';

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    setStatus('saving');
    try {
      await updateReportBody(report.id, draft);
      await revalidator.revalidate();
      setEditing(false);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="panel" aria-labelledby="report-body-title">
      <div className="panel__title panel__title--split">
        <h2 className="panel__heading" id="report-body-title">
          내용
        </h2>
        {editable && !editing && (
          <Button
            variant="ghost"
            size="sm"
            className="panel__action"
            onClick={() => {
              setDraft(report.body);
              setEditing(true);
            }}
          >
            고치기
          </Button>
        )}
      </div>
      {editing ? (
        <form className="panel__body" onSubmit={onSubmit}>
          <TextArea
            label="내용"
            rows={10}
            maxLength={5000}
            showCount
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          {status === 'error' && (
            <Notice tone="warn" role="alert">
              저장하지 못했습니다. 잠시 후 다시 시도해주세요.
            </Notice>
          )}
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={status === 'saving'}
            >
              저장
            </Button>
          </div>
        </form>
      ) : (
        <div className="panel__prose">
          {report.body ? (
            report.body
              .split(/\n\s*\n/)
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="panel__prose-empty">아직 적은 내용이 없습니다.</p>
          )}
        </div>
      )}
    </section>
  );
}

function ReviewPanel({
  report,
  members,
}: {
  report: Report;
  members: Member[];
}) {
  const session = useSession();
  const revalidator = useRevalidator();
  // 검토는 회장단과 작성 부서의 부장이 한다
  const reviewers = members.filter(
    (member) =>
      member.name !== report.author &&
      (member.department === '회장단' ||
        (member.department === report.department &&
          member.position === '부장')),
  );
  const [reviewer, setReviewer] = useState(reviewers[0]?.name ?? '');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      await revalidator.revalidate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="review-title">
      <h2 className="panel__title" id="review-title">
        검토
      </h2>
      <div className="panel__body">
        {report.status === '작성 중' && (
          <>
            <Select
              label="검토할 사람"
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
            >
              {reviewers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} ({member.department} {member.position})
                </option>
              ))}
            </Select>
            <Button
              variant="primary"
              block
              disabled={busy || !reviewer || !report.body}
              onClick={() =>
                void run(() => requestReportReview(report.id, reviewer))
              }
            >
              검토 요청 보내기
            </Button>
            {!report.body && (
              <p className="report-review__hint">
                내용을 적은 뒤 검토를 요청할 수 있습니다.
              </p>
            )}
          </>
        )}
        {report.status === '검토 요청' &&
          (report.reviewer === session.name ? (
            <>
              <p className="report-review__hint">
                {report.author}님이 검토를 요청했습니다.
              </p>
              <Button
                variant="primary"
                block
                disabled={busy}
                onClick={() => void run(() => approveReport(report.id))}
              >
                확인 완료
              </Button>
              <Button
                block
                disabled={busy}
                onClick={() => void run(() => returnReport(report.id))}
              >
                다시 작성하도록 돌려보내기
              </Button>
            </>
          ) : (
            <>
              <p className="report-review__hint">
                {report.reviewer}님이 검토하고 있습니다.
              </p>
              <Button
                block
                disabled={busy}
                onClick={() => void run(() => returnReport(report.id))}
              >
                검토 요청 거두기
              </Button>
            </>
          ))}
        {report.status === '완료' && (
          <p className="report-review__hint">
            {report.reviewer}님이 확인한 보고서입니다. 더 고칠 수 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}

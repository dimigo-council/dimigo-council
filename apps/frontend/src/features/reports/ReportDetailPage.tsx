import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { Badge, Button, TextButton } from '../../dimi-ui-kit/index.ts';
import {
  Notice,
  PersonAvatar,
  Select,
  statusTone,
  TextArea,
  ButtonLink,
  Breadcrumb,
  MetaRow,
  SplitLayout,
  SplitMain,
  SplitAside,
  Panel,
  PanelTitle,
  PanelHeading,
  PanelBody,
  PanelProse,
  PanelProseEmpty,
  panelAction,
  InfoList,
  Owner,
  TextLink,
  FormActions,
} from '../../components/ui/index.ts';
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
import * as S from './styles.ts';

const PanelAction = styled(TextButton)`
  ${panelAction}
`;

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
      <Breadcrumb aria-label="경로">
        <Link to="/work/reports">보고서</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{report.id}</span>
      </Breadcrumb>
      <PageHeader
        title={report.title}
        description={
          <MetaRow>
            <Badge theme={statusTone.report[report.status]}>
              {report.status}
            </Badge>
            <Badge>{report.kind}</Badge>
            <span>
              {report.department} · {report.author}
            </span>
            <span>{formatDateTime(report.updatedAt)} 수정</span>
          </MetaRow>
        }
        actions={
          report.agenda && (
            <ButtonLink to={`/work/agendas/${report.agenda.id}`}>
              안건 보기
            </ButtonLink>
          )
        }
      />

      <SplitLayout>
        <SplitMain>
          <ReportBody report={report} />
        </SplitMain>
        <SplitAside>
          <Panel aria-label="보고서 정보">
            <InfoList>
              <dt>작성</dt>
              <Owner as="dd">
                <PersonAvatar name={report.author} aria-hidden="true" />
                {report.author}
              </Owner>
              {report.reviewer && (
                <>
                  <dt>검토</dt>
                  <Owner as="dd">
                    <PersonAvatar name={report.reviewer} aria-hidden="true" />
                    {report.reviewer}
                  </Owner>
                </>
              )}
              {report.agenda && (
                <>
                  <dt>안건</dt>
                  <dd>
                    <TextLink to={`/work/agendas/${report.agenda.id}`}>
                      {report.agenda.id} {report.agenda.title}
                    </TextLink>
                  </dd>
                </>
              )}
            </InfoList>
          </Panel>
          <ReviewPanel report={report} members={members} />
        </SplitAside>
      </SplitLayout>
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
    <Panel aria-labelledby="report-body-title">
      <PanelTitle as="div" $split>
        <PanelHeading id="report-body-title">내용</PanelHeading>
        {editable && !editing && (
          <PanelAction
            size="small"
            onClick={() => {
              setDraft(report.body);
              setEditing(true);
            }}
          >
            고치기
          </PanelAction>
        )}
      </PanelTitle>
      {editing ? (
        <PanelBody as="form" onSubmit={onSubmit}>
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
          <FormActions>
            <TextButton onClick={() => setEditing(false)}>취소</TextButton>
            <Button
              type="submit"
              theme="accent"
              variant="primary"
              disabled={status === 'saving'}
            >
              저장
            </Button>
          </FormActions>
        </PanelBody>
      ) : (
        <PanelProse>
          {report.body ? (
            report.body
              .split(/\n\s*\n/)
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <PanelProseEmpty>아직 적은 내용이 없습니다.</PanelProseEmpty>
          )}
        </PanelProse>
      )}
    </Panel>
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
    <Panel aria-labelledby="review-title">
      <PanelTitle id="review-title">검토</PanelTitle>
      <PanelBody>
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
              theme="accent"
              variant="primary"
              fullWidth
              disabled={busy || !reviewer || !report.body}
              onClick={() =>
                void run(() => requestReportReview(report.id, reviewer))
              }
            >
              검토 요청 보내기
            </Button>
            {!report.body && (
              <S.ReviewHint>
                내용을 적은 뒤 검토를 요청할 수 있습니다.
              </S.ReviewHint>
            )}
          </>
        )}
        {report.status === '검토 요청' &&
          (report.reviewer === session.name ? (
            <>
              <S.ReviewHint>
                {report.author}님이 검토를 요청했습니다.
              </S.ReviewHint>
              <Button
                theme="accent"
                variant="primary"
                fullWidth
                disabled={busy}
                onClick={() => void run(() => approveReport(report.id))}
              >
                확인 완료
              </Button>
              <Button
                fullWidth
                disabled={busy}
                onClick={() => void run(() => returnReport(report.id))}
              >
                다시 작성하도록 돌려보내기
              </Button>
            </>
          ) : (
            <>
              <S.ReviewHint>
                {report.reviewer}님이 검토하고 있습니다.
              </S.ReviewHint>
              <Button
                fullWidth
                disabled={busy}
                onClick={() => void run(() => returnReport(report.id))}
              >
                검토 요청 거두기
              </Button>
            </>
          ))}
        {report.status === '완료' && (
          <S.ReviewHint>
            {report.reviewer}님이 확인한 보고서입니다. 더 고칠 수 없습니다.
          </S.ReviewHint>
        )}
      </PanelBody>
    </Panel>
  );
}

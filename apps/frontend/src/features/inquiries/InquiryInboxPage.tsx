import { useState } from 'react';
import {
  useLoaderData,
  useLocation,
  useRevalidator,
  useSearchParams,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { Button, Icon, TextButton } from '../../dimi-ui-kit/index.ts';
import { iconArrowForwardIos } from '../../dimi-ui-kit/icons';
import {
  ButtonLink,
  CardTitle,
  EmptyState,
  FilterChips,
  Notice,
  ScopeBadge,
  Select,
  SelectControl,
  TextArea,
  TextLink,
  TwoColumn,
} from '../../components/ui/index.ts';
import { errorMessage } from '../../lib/api.ts';
import { formatFullDate } from '../../lib/date.ts';
import { linkInquiry, listActivities } from '../activities/api.ts';
import { activityNo } from '../activities/format.ts';
import type { Activity } from '../activities/types.ts';
import { listDepartments } from '../members/api.ts';
import type { Department } from '../members/types.ts';
import { answerInquiry, listCouncilInquiries } from './api.ts';
import { inquiryNo } from './format.ts';
import { InquiryItem, InquiryThread, StatusBadge } from './InquiryItem.tsx';
import {
  inquiryStatuses,
  type InquiryStatus,
  type InquiryView,
} from './types.ts';
import * as S from './styles.ts';

/** 학생회 질의함: 모든 질의. 익명 질의는 학생회에도 작성자가 보이지 않는다. */
export async function inquiryInboxLoader() {
  const [inquiries, activities, departments] = await Promise.all([
    listCouncilInquiries(),
    listActivities(),
    listDepartments(),
  ]);
  return {
    inquiries,
    activities,
    departments: departments.map((item) => item.name),
  };
}

type Filter = 'all' | InquiryStatus;
const filters: Filter[] = ['all', ...inquiryStatuses];

export function InquiryInboxPage() {
  const { inquiries, activities, departments } =
    useLoaderData<typeof inquiryInboxLoader>();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();

  const filter = filters.find((item) => item === params.get('status')) ?? 'all';
  const visible = inquiries.filter(
    (inquiry) => filter === 'all' || inquiry.status === filter,
  );
  const selected =
    inquiries.find((inquiry) => inquiry.id === params.get('id')) ?? visible[0];

  const linkFor = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('id', id);
    return `${pathname}?${next.toString()}`;
  };

  return (
    <>
      <PageHeader title="질문과 건의" />
      <TwoColumn $aside="480px">
        <S.ListCard aria-labelledby="inbox-title">
          <S.ListHead>
            <CardTitle id="inbox-title">질의 목록</CardTitle>
            <FilterChips
              aria-label="처리 상태"
              value={filter}
              onChange={(value) =>
                setParams(
                  (current) => {
                    const next = new URLSearchParams(current);
                    if (value === 'all') next.delete('status');
                    else next.set('status', value);
                    return next;
                  },
                  { replace: true },
                )
              }
              items={filters.map((value) => ({
                value,
                label: value === 'all' ? '전체' : value,
              }))}
            />
          </S.ListHead>
          {visible.length > 0 ? (
            <S.List aria-label="질의 목록">
              {visible.map((inquiry) => (
                <InquiryItem
                  key={inquiry.id}
                  inquiry={inquiry}
                  open={selected?.id === inquiry.id}
                  to={linkFor(inquiry.id)}
                  footer={
                    inquiry.activity && (
                      <TextLink to={`/work/activities/${inquiry.activity.id}`}>
                        연결된 활동 보기
                        <Icon icon={iconArrowForwardIos} size={14} />
                      </TextLink>
                    )
                  }
                />
              ))}
            </S.List>
          ) : (
            <EmptyState>이 상태의 질의가 없어요.</EmptyState>
          )}
        </S.ListCard>

        {selected && (
          <HandlePanel
            key={selected.id}
            inquiry={selected}
            activities={activities}
            departments={departments}
          />
        )}
      </TwoColumn>
    </>
  );
}

/** 오른쪽 처리 패널: 담당 부서, 답변, 반려하기 · 답변 보내기 · 처리 완료 · 활동 연결 */
function HandlePanel({
  inquiry,
  activities,
  departments,
}: {
  inquiry: InquiryView;
  activities: Activity[];
  departments: string[];
}) {
  const revalidator = useRevalidator();
  const session = useSession();
  const [department, setDepartment] = useState<Department>(
    inquiry.department ??
      (session.department && departments.includes(session.department)
        ? session.department
        : ''),
  );
  const [answer, setAnswer] = useState('');
  const [linking, setLinking] = useState(false);
  const [activityId, setActivityId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // 처리 완료와 반려는 되돌릴 수 없다.
  const final = inquiry.status === '처리 완료' || inquiry.status === '반려';

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setAnswer('');
      await revalidator.revalidate();
    } catch (caught) {
      setError(errorMessage(caught, '처리하지 못했어요.'));
    } finally {
      setBusy(false);
    }
  };

  const onReject = () => {
    if (!answer.trim()) {
      setError('반려 사유를 답변에 적어주세요.');
      return;
    }
    void run(() => answerInquiry(inquiry.id, '반려', answer, department));
  };

  const onLink = () => {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;
    void run(async () => {
      await linkInquiry(activity.id, inquiry);
      setLinking(false);
    });
  };

  return (
    <S.SideCard aria-labelledby="handle-title">
      <S.PanelHead>
        <StatusBadge inquiry={inquiry} />
        <span>{inquiryNo(inquiry.id)}</span>
      </S.PanelHead>
      <S.PanelTitle id="handle-title">{inquiry.title}</S.PanelTitle>
      <S.Facts>
        <dt>작성자</dt>
        <dd>
          {inquiry.author
            ? `${inquiry.author} · ${inquiry.authorClass}`
            : '익명 (이름·학년·반 비공개)'}
        </dd>
        <dt>공개 범위</dt>
        <dd>
          <ScopeBadge scope={inquiry.scope} /> 작성자만 바꿀 수 있어요
        </dd>
        <dt>접수일</dt>
        <dd>{formatFullDate(inquiry.submittedAt)}</dd>
        {inquiry.activity && (
          <>
            <dt>연결 활동</dt>
            <dd>
              <TextLink to={`/work/activities/${inquiry.activity.id}`}>
                {activityNo(inquiry.activity.id)} {inquiry.activity.title}
              </TextLink>
            </dd>
          </>
        )}
      </S.Facts>
      <InquiryThread inquiry={inquiry} showQuestion={false} />
      <S.Divider />
      <Select
        label="담당 부서"
        value={department}
        onChange={(event) => setDepartment(event.target.value)}
      >
        <option value="">담당 부서 미정</option>
        {departments.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <TextArea
        label="답변"
        rows={4}
        maxLength={1000}
        placeholder="학생에게 보낼 답변을 적어 주세요. 질의한 학생에게만 보여요."
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
      />
      {error && (
        <Notice tone="warn" role="alert">
          {error}
        </Notice>
      )}
      <S.Actions>
        <TextButton
          theme="negative"
          disabled={busy || final}
          onClick={onReject}
        >
          반려하기
        </TextButton>
        <Button
          disabled={busy || final || !answer.trim()}
          onClick={() =>
            void run(() =>
              answerInquiry(inquiry.id, '답변 완료', answer, department),
            )
          }
        >
          답변 보내기
        </Button>
        <Button
          disabled={busy || final || (!answer.trim() && !inquiry.answer)}
          onClick={() =>
            void run(() =>
              answerInquiry(inquiry.id, '처리 완료', answer, department),
            )
          }
        >
          처리 완료
        </Button>
      </S.Actions>
      {linking ? (
        <S.LinkRow>
          <SelectControl
            aria-label="연결할 활동"
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
          >
            <option value="">활동을 골라주세요</option>
            {activities
              .filter((activity) => activity.id !== inquiry.activity?.id)
              .map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activityNo(activity.id)} {activity.title}
                </option>
              ))}
          </SelectControl>
          <Button onClick={() => setLinking(false)}>취소</Button>
          <Button
            theme="accent"
            variant="primary"
            disabled={!activityId || busy}
            onClick={onLink}
          >
            연결
          </Button>
        </S.LinkRow>
      ) : (
        <S.Actions>
          <span />
          <Button onClick={() => setLinking(true)}>기존 활동에 연결</Button>
          <ButtonLink
            theme="accent"
            variant="primary"
            to={`/work/activities/new?inquiry=${inquiry.id}`}
          >
            활동으로 등록
          </ButtonLink>
        </S.Actions>
      )}
    </S.SideCard>
  );
}

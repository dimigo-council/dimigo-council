import { useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { useBasePath, useIsCouncil } from '../../app/mode.ts';
import { getSession, useSession } from '../../app/session.ts';
import { Timeline } from '../../components/intranet/Timeline.tsx';
import { Badge, Button, Icon, TextButton } from '../../dimi-ui-kit/index.ts';
import {
  iconAdd,
  iconArticle,
  iconAssignment,
  iconCalendarToday,
  iconDelete,
  iconGroups,
  iconLink,
  iconPerson,
  iconPersonAdd,
  iconShare,
} from '../../dimi-ui-kit/icons';
import {
  Breadcrumbs,
  ButtonLink,
  Card,
  CardAside,
  CardHead,
  CardTitle,
  ControlMark,
  FormActions,
  Notice,
  OptionCard,
  ScopeBadge,
  Select,
  statusTone,
  TextField,
  TwoColumn,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import { formatFullDate, formatShortDate } from '../../lib/date.ts';
import {
  listCouncilInquiries,
  listStudentInquiries,
} from '../inquiries/api.ts';
import type { InquiryView } from '../inquiries/types.ts';
import { listSurveys } from '../surveys/api.ts';
import type { SurveySummary } from '../surveys/types.ts';
import { listTasks } from '../tasks/api.ts';
import type { Task } from '../tasks/types.ts';
import {
  addHistory,
  deleteHistory,
  getActivity,
  getPublicActivity,
  setActivityScope,
} from './api.ts';
import { activityNo } from './format.ts';
import {
  activityScopes,
  historyKinds,
  type Activity,
  type ActivityScope,
  type HistoryKind,
} from './types.ts';
import * as S from './styles.ts';

async function linked(activity: Activity, inquiries: InquiryView[]) {
  const surveys = await listSurveys();
  return {
    activity,
    inquiries: inquiries.filter((inquiry) =>
      activity.inquiryIds.includes(inquiry.id),
    ),
    surveys: surveys.filter((survey) => survey.activity.id === activity.id),
  };
}

/** 학생 화면: 전체 공개 활동만. 업무는 보여주지 않는다. */
export async function activityLoader({ params }: LoaderFunctionArgs) {
  const session = getSession();
  const activity = await getPublicActivity(params.activityId ?? '');
  return {
    ...(await linked(activity, await listStudentInquiries(session.name))),
    tasks: [] as Task[],
  };
}

export async function councilActivityLoader({ params }: LoaderFunctionArgs) {
  const session = getSession();
  const [activity, inquiries, tasks] = await Promise.all([
    getActivity(params.activityId ?? ''),
    listCouncilInquiries(session.name),
    listTasks(),
  ]);
  return {
    ...(await linked(activity, inquiries)),
    tasks: tasks.filter((task) => task.activity?.id === activity.id),
  };
}

export function ActivityDetailPage() {
  const data = useLoaderData<typeof activityLoader>();
  return <ActivityDetail key={data.activity.id} {...data} />;
}

function ActivityDetail({
  activity,
  inquiries,
  surveys,
  tasks,
}: {
  activity: Activity;
  inquiries: InquiryView[];
  surveys: SurveySummary[];
  tasks: Task[];
}) {
  const council = useIsCouncil();
  const base = useBasePath();
  const [composing, setComposing] = useState(false);

  // 예정된 이력은 맨 뒤, 날짜가 있는 마지막 이력이 지금 단계다.
  const lastDated = activity.history
    .map((item) => Boolean(item.at))
    .lastIndexOf(true);

  return (
    <>
      <title>{`${activity.title} | 디미고 학생회`}</title>
      <Breadcrumbs
        items={[
          { label: '활동', to: base('/activities') },
          { label: activity.title },
        ]}
      />

      <S.HeadCard>
        <S.HeadMain>
          <S.HeadBadges>
            <Badge theme={statusTone.activity[activity.status]}>
              {activity.status}
            </Badge>
            {council && <ScopeBadge scope={activity.scope} />}
            <span>{activityNo(activity.id)}</span>
          </S.HeadBadges>
          <S.HeadTitle>{activity.title}</S.HeadTitle>
          <S.HeadDescription>{activity.description}</S.HeadDescription>
          <S.HeadMeta>
            <li>
              <Icon icon={iconGroups} size={16} />
              담당 {activity.department}
            </li>
            <li>
              <Icon icon={iconPerson} size={16} />
              담당자 {activity.owner}
            </li>
            <li>
              <Icon icon={iconCalendarToday} size={16} />
              등록 {formatFullDate(activity.registeredAt)}
            </li>
            {activity.inquiryIds.length > 0 && (
              <li>
                <Icon icon={iconLink} size={16} />
                연결 질의{' '}
                {activity.inquiryIds
                  .map((id) => {
                    const inquiry = inquiries.find((item) => item.id === id);
                    return inquiry
                      ? `#${id} · 공감 ${inquiry.likes}`
                      : `#${id}`;
                  })
                  .join(', ')}
              </li>
            )}
          </S.HeadMeta>
        </S.HeadMain>
        <S.HeadActions>
          <ShareButton title={activity.title} />
          {council && (
            <ButtonLink
              theme="accent"
              variant="primary"
              to={`/work/tasks/new?activity=${activity.id}`}
            >
              <Icon icon={iconPersonAdd} size={20} />
              업무 배정
            </ButtonLink>
          )}
        </S.HeadActions>
      </S.HeadCard>

      <TwoColumn $aside="380px">
        <S.TimelineCard aria-labelledby="history-title">
          <CardHead>
            <CardTitle id="history-title">추진 이력</CardTitle>
            {council && !composing && (
              <TextButton
                leadingIcon={iconAdd}
                onClick={() => setComposing(true)}
              >
                이력 추가
              </TextButton>
            )}
          </CardHead>
          {composing && (
            <HistoryForm
              activityId={activity.id}
              onDone={() => setComposing(false)}
            />
          )}
          {activity.history.length > 0 ? (
            <Timeline
              items={activity.history.map((item, index) => ({
                id: item.id,
                at: item.at,
                dateLabel: '예정',
                kind: item.kind,
                title: item.title,
                body: item.body,
                state: !item.at
                  ? 'planned'
                  : index === lastDated
                    ? 'current'
                    : 'done',
                foot: item.link && (
                  <S.ChipLink to={base(item.link.to)}>
                    <Icon icon={iconArticle} size={16} />
                    {item.link.label}
                  </S.ChipLink>
                ),
                action: council && (
                  <DeleteHistoryButton
                    activityId={activity.id}
                    historyId={item.id}
                    title={item.title}
                  />
                ),
              }))}
            />
          ) : (
            <S.Empty>아직 추진 이력이 없어요.</S.Empty>
          )}
        </S.TimelineCard>

        <S.Side>
          <PlanCard activity={activity} />
          {council && <TasksCard activity={activity} tasks={tasks} />}
          {council && <ScopeCard activity={activity} />}
          {inquiries.length > 0 && (
            <Card aria-labelledby="inquiries-title">
              <CardHead>
                <CardTitle id="inquiries-title">연결된 질의</CardTitle>
              </CardHead>
              <S.MiniList>
                {inquiries.map((inquiry) => (
                  <li key={inquiry.id}>
                    <S.MiniTitleLink to={base(`/inquiries?id=${inquiry.id}`)}>
                      #{inquiry.id} {inquiry.title}
                    </S.MiniTitleLink>
                    <Badge
                      size="small"
                      theme={statusTone.inquiry[inquiry.status]}
                    >
                      {inquiry.status}
                    </Badge>
                  </li>
                ))}
              </S.MiniList>
            </Card>
          )}
          <Card aria-labelledby="surveys-title">
            <CardHead>
              <CardTitle id="surveys-title">연결된 설문</CardTitle>
            </CardHead>
            {surveys.length > 0 ? (
              <S.MiniList>
                {surveys.map((survey) => (
                  <li key={survey.id}>
                    <S.SurveyIcon aria-hidden="true">
                      <Icon icon={iconAssignment} size={24} />
                    </S.SurveyIcon>
                    <S.SurveyText>
                      <Link
                        to={
                          council
                            ? `/work/surveys/${survey.id}/results`
                            : base(`/surveys/${survey.id}`)
                        }
                      >
                        {survey.title}
                      </Link>
                      <span>
                        {formatShortDate(survey.closesAt)} 마감 ·{' '}
                        {survey.questionCount}문항
                      </span>
                    </S.SurveyText>
                    {council ? (
                      <ButtonLink
                        size="small"
                        to={`/work/surveys/${survey.id}/results`}
                      >
                        <Icon icon={iconArticle} size={16} />
                        바로가기
                      </ButtonLink>
                    ) : (
                      <Badge theme={survey.isClosed ? 'grayscale' : 'solid'}>
                        {survey.isClosed ? '마감' : '진행 중'}
                      </Badge>
                    )}
                  </li>
                ))}
              </S.MiniList>
            ) : (
              <S.Empty>연결된 설문이 없어요.</S.Empty>
            )}
          </Card>
        </S.Side>
      </TwoColumn>
    </>
  );
}

function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState('');
  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('링크를 복사했어요');
    } catch {
      setStatus('');
    }
  };
  return (
    <>
      <S.ShareStatus role="status">{status}</S.ShareStatus>
      <Button onClick={() => void onShare()}>
        <Icon icon={iconShare} size={20} />
        공유
      </Button>
    </>
  );
}

function PlanCard({ activity }: { activity: Activity }) {
  const plan = activity.plan;
  return (
    <Card aria-labelledby="plan-title">
      <CardHead>
        <CardTitle id="plan-title">활동 계획서</CardTitle>
        {plan && (
          <CardAside>
            작성 {plan.author} · {formatShortDate(plan.writtenAt)}
          </CardAside>
        )}
      </CardHead>
      {plan ? (
        <S.PlanList>
          <dt>활동명</dt>
          <dd>{activity.title}</dd>
          <dt>기간</dt>
          <dd>{plan.period}</dd>
          <dt>진행 방법</dt>
          <dd>
            <ol>
              {plan.steps.map((step, index) => (
                <li key={step.title}>
                  <strong>
                    {index + 1}. {step.title}
                  </strong>
                  <span>{step.body}</span>
                </li>
              ))}
            </ol>
          </dd>
          <dt>협조·허가</dt>
          <dd>{plan.cooperation}</dd>
          <dt>담당 인원</dt>
          <dd>
            <ul>
              {plan.staff.map((member) => (
                <li key={member.role}>
                  {member.role} {member.name}
                </li>
              ))}
            </ul>
          </dd>
          <dt>소요 비용</dt>
          <dd>{plan.cost}</dd>
          <dt>우려 사항</dt>
          <dd>{plan.concerns}</dd>
        </S.PlanList>
      ) : (
        <S.Empty>아직 활동 계획서가 없어요.</S.Empty>
      )}
    </Card>
  );
}

function TasksCard({ activity, tasks }: { activity: Activity; tasks: Task[] }) {
  const done = tasks.filter((task) => task.status === '완료').length;
  return (
    <Card aria-labelledby="tasks-title">
      <CardHead>
        <CardTitle id="tasks-title">
          활동 {activityNo(activity.id)}의 업무
        </CardTitle>
        {tasks.length > 0 && (
          <CardAside>
            {done} / {tasks.length} 완료
          </CardAside>
        )}
      </CardHead>
      {tasks.length > 0 ? (
        <S.MiniList>
          {tasks.map((task) => (
            <li key={task.id}>
              <ControlMark type="checkfill" checked={task.status === '완료'} />
              <S.MiniTitle
                as={Link}
                to={`/work/tasks/${task.id}`}
                $done={task.status === '완료'}
              >
                {task.title}
                <VisuallyHidden>, {task.status}</VisuallyHidden>
              </S.MiniTitle>
              <S.MiniAside>{task.assignee}</S.MiniAside>
            </li>
          ))}
        </S.MiniList>
      ) : (
        <S.Empty>배정된 업무가 없어요.</S.Empty>
      )}
    </Card>
  );
}

const scopeDescription: Record<ActivityScope, string> = {
  '전체 공개': '모든 학생이 추진 과정과 결과를 볼 수 있어요',
  학생회: '학생회 임원만 볼 수 있어요',
};

function ScopeCard({ activity }: { activity: Activity }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const [error, setError] = useState('');
  const editable = activity.owner === session.name;

  const onChange = async (scope: ActivityScope) => {
    try {
      await setActivityScope(activity.id, scope, session.name);
      setError('');
      await revalidator.revalidate();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '바꾸지 못했어요.');
    }
  };

  return (
    <Card aria-labelledby="scope-title">
      <CardHead>
        <CardTitle id="scope-title">공개 범위</CardTitle>
        <CardAside>담당자만 변경 가능</CardAside>
      </CardHead>
      <S.ScopeOptions role="radiogroup" aria-labelledby="scope-title">
        {activityScopes.map((scope) => (
          <OptionCard
            key={scope}
            name="activity-scope"
            title={scope}
            description={scopeDescription[scope]}
            checked={activity.scope === scope}
            disabled={!editable}
            onChange={() => void onChange(scope)}
          />
        ))}
      </S.ScopeOptions>
      {error && (
        <Notice tone="warn" role="alert">
          {error}
        </Notice>
      )}
    </Card>
  );
}

function DeleteHistoryButton({
  activityId,
  historyId,
  title,
}: {
  activityId: string;
  historyId: string;
  title: string;
}) {
  const revalidator = useRevalidator();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button size="small" onClick={() => setConfirming(true)}>
        <Icon icon={iconDelete} size={16} />
        이력 삭제
      </Button>
    );
  }
  return (
    <FormActions role="group" aria-label={`${title} 삭제 확인`}>
      <Button size="small" onClick={() => setConfirming(false)}>
        취소
      </Button>
      <Button
        size="small"
        theme="negative"
        variant="primary"
        onClick={() =>
          void deleteHistory(activityId, historyId).then(() =>
            revalidator.revalidate(),
          )
        }
      >
        삭제
      </Button>
    </FormActions>
  );
}

function todayInput() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function HistoryForm({
  activityId,
  onDone,
}: {
  activityId: string;
  onDone: () => void;
}) {
  const revalidator = useRevalidator();
  const [kind, setKind] = useState<HistoryKind>('회의');
  const [date, setDate] = useState(todayInput());
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await addHistory(activityId, {
        kind,
        at: new Date(`${date}T12:00:00`).toISOString(),
        title,
        body,
      });
      await revalidator.revalidate();
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <S.HistoryForm onSubmit={onSubmit} aria-label="이력 추가">
      <S.HistoryFormRow>
        <Select
          label="유형"
          value={kind}
          onChange={(event) => {
            const next = historyKinds.find(
              (item) => item === event.target.value,
            );
            if (next) setKind(next);
          }}
        >
          {historyKinds.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <TextField
          label="날짜"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <TextField
          label="제목"
          maxLength={60}
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </S.HistoryFormRow>
      <TextField
        label="설명"
        optional
        maxLength={200}
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <FormActions>
        <Button onClick={onDone}>취소</Button>
        <Button
          type="submit"
          theme="accent"
          variant="primary"
          disabled={!title.trim() || saving}
        >
          이력 추가
        </Button>
      </FormActions>
    </S.HistoryForm>
  );
}

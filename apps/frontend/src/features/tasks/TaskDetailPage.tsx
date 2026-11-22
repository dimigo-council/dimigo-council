import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { Timeline } from '../../components/intranet/Timeline.tsx';
import {
  Badge,
  Button,
  Icon,
  Input,
  type KitIcon,
} from '../../dimi-ui-kit/index.ts';
import {
  iconArticle,
  iconAssignment,
  iconCalendarToday,
  iconGroups,
  iconLink,
  iconPerson,
  iconPersonAdd,
} from '../../dimi-ui-kit/icons';
import {
  Breadcrumbs,
  ButtonLink,
  Card,
  CardAside,
  CardHead,
  CardTitle,
  ControlMark,
  SelectControl,
  statusTone,
  TwoColumn,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import { formatFullDate } from '../../lib/date.ts';
import { listActivities } from '../activities/api.ts';
import { activityNo } from '../activities/format.ts';
import * as A from '../activities/styles.ts';
import type { Activity } from '../activities/types.ts';
import { errorMessage } from '../../lib/api.ts';
import { listDepartments, listMembers } from '../members/api.ts';
import type { Department, Member } from '../members/types.ts';
import { listSurveys } from '../surveys/api.ts';
import { addTaskLog, getTask, listTasks, updateTask } from './api.ts';
import { fromDateInput, toDateInput } from './format.ts';
import { taskStatuses, type Task, type TaskStatus } from './types.ts';
import * as S from './styles.ts';

export async function taskLoader({ params }: LoaderFunctionArgs) {
  const task = await getTask(params.taskId ?? '');
  const activityId = task.activity?.id;
  const [siblings, surveys, activities, members, departments] =
    await Promise.all([
      activityId ? listTasks({ activityId }) : Promise.resolve([]),
      activityId ? listSurveys() : Promise.resolve([]),
      listActivities(),
      listMembers(),
      listDepartments(),
    ]);
  return {
    task,
    siblings,
    surveys: surveys.filter((survey) => survey.activity?.id === activityId),
    activities,
    members,
    departments: departments.map((item) => item.name),
  };
}

export function TaskDetailPage() {
  const data = useLoaderData<typeof taskLoader>();
  return <TaskDetail key={data.task.id} {...data} />;
}

function TaskDetail({
  task,
  siblings,
  surveys,
  activities,
  members,
  departments,
}: Awaited<ReturnType<typeof taskLoader>>) {
  const [editing, setEditing] = useState(false);
  const lastIndex = task.logs.length - 1;
  const doneCount = siblings.filter((item) => item.status === '완료').length;

  return (
    <>
      <title>{`${task.title} | 디미고 학생회`}</title>
      <Breadcrumbs
        items={[{ label: '업무', to: '/work/tasks' }, { label: task.title }]}
      />

      <A.HeadCard>
        {editing ? (
          <EditForm
            task={task}
            activities={activities}
            members={members}
            departments={departments}
            onDone={() => setEditing(false)}
          />
        ) : (
          <>
            <A.HeadMain>
              <A.HeadBadges>
                <Badge theme={statusTone.task[task.status]}>
                  {task.status}
                </Badge>
                <span>업무 #{task.id}</span>
              </A.HeadBadges>
              <A.HeadTitle>{task.title}</A.HeadTitle>
              <A.HeadMeta>
                <li>
                  <Icon icon={iconGroups} size={16} />
                  담당 부서 {task.department || '없음'}
                </li>
                <li>
                  <Icon icon={iconPerson} size={16} />
                  담당자 {task.assignee || '없음'}
                </li>
                <li>
                  <Icon icon={iconPersonAdd} size={16} />
                  배정자 {task.assigner || '없음'}
                </li>
                <li>
                  <Icon icon={iconCalendarToday} size={16} />
                  시작 {formatFullDate(task.startAt)}
                </li>
                <li>
                  <Icon icon={iconCalendarToday} size={16} />
                  마감 {formatFullDate(task.dueAt)}
                </li>
                {task.activity && (
                  <li>
                    <Link to={`/work/activities/${task.activity.id}`}>
                      활동 {activityNo(task.activity.id)} {task.activity.title}
                    </Link>
                  </li>
                )}
              </A.HeadMeta>
            </A.HeadMain>
            <A.HeadActions>
              <Button onClick={() => setEditing(true)}>수정</Button>
            </A.HeadActions>
          </>
        )}
      </A.HeadCard>

      <TwoColumn $aside="380px">
        <A.TimelineCard aria-labelledby="logs-title">
          <CardHead>
            <CardTitle id="logs-title">진행 기록</CardTitle>
          </CardHead>
          <Timeline
            items={task.logs.map((log, index) => ({
              id: log.id,
              at: log.at,
              kind: log.label,
              title: log.text,
              state: index === lastIndex ? 'current' : 'done',
            }))}
          />
          <LogForm task={task} />
        </A.TimelineCard>

        <A.Side>
          {task.activity && (
            <Card aria-labelledby="siblings-title">
              <CardHead>
                <CardTitle id="siblings-title">
                  활동 {activityNo(task.activity.id)}의 업무
                </CardTitle>
                <CardAside>
                  {doneCount} / {siblings.length} 완료
                </CardAside>
              </CardHead>
              <A.MiniList>
                {siblings.map((item) => (
                  <li key={item.id}>
                    <ControlMark
                      type="checkfill"
                      checked={item.status === '완료'}
                    />
                    <A.MiniTitle
                      as={Link}
                      to={`/work/tasks/${item.id}`}
                      $done={item.status === '완료'}
                      aria-current={item.id === task.id ? 'page' : undefined}
                    >
                      {item.title}
                      <VisuallyHidden>, {item.status}</VisuallyHidden>
                    </A.MiniTitle>
                    <A.MiniAside>{item.assignee}</A.MiniAside>
                  </li>
                ))}
              </A.MiniList>
            </Card>
          )}
          <Card aria-labelledby="task-surveys-title">
            <CardHead>
              <CardTitle id="task-surveys-title">연결된 설문</CardTitle>
            </CardHead>
            {surveys.length > 0 ? (
              <A.MiniList>
                {surveys.map((survey) => (
                  <li key={survey.id}>
                    <A.SurveyIcon aria-hidden="true">
                      <Icon icon={iconAssignment} size={24} />
                    </A.SurveyIcon>
                    <A.MiniTitle>{survey.title}</A.MiniTitle>
                    <ButtonLink
                      size="small"
                      to={`/work/surveys/${survey.id}/results`}
                    >
                      <Icon icon={iconArticle} size={16} />
                      바로가기
                    </ButtonLink>
                  </li>
                ))}
              </A.MiniList>
            ) : (
              <A.Empty>
                {task.activity
                  ? '연결된 활동에 설문이 없어요.'
                  : '활동에 연결되지 않은 업무예요.'}
              </A.Empty>
            )}
          </Card>
        </A.Side>
      </TwoColumn>
    </>
  );
}

/** 기록 추가: 상태와 바뀐 내용 한 줄. 남긴 상태가 업무의 현재 상태가 된다. */
function LogForm({ task }: { task: Task }) {
  const revalidator = useRevalidator();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      await addTaskLog(task.id, status, text);
      setText('');
      await revalidator.revalidate();
    } catch (caught) {
      setError(errorMessage(caught, '기록하지 못했어요.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <S.LogForm onSubmit={onSubmit} aria-label="기록 추가">
      <SelectControl
        aria-label="상태"
        value={status}
        onChange={(event) => {
          const next = taskStatuses.find((item) => item === event.target.value);
          if (next) setStatus(next);
        }}
      >
        {taskStatuses.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </SelectControl>
      <Input
        aria-label="바뀐 내용"
        placeholder="바뀐 내용을 한 줄로 적어 주세요"
        maxLength={100}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        type="submit"
        theme="accent"
        variant="primary"
        disabled={!text.trim() || saving}
      >
        기록
      </Button>
      {error && <S.EditError role="alert">{error}</S.EditError>}
    </S.LogForm>
  );
}

function EditForm({
  task,
  activities,
  members,
  departments,
  onDone,
}: {
  task: Task;
  activities: Activity[];
  members: Member[];
  departments: string[];
  onDone: () => void;
}) {
  const revalidator = useRevalidator();
  const [title, setTitle] = useState(task.title);
  const [activityId, setActivityId] = useState(task.activity?.id ?? '');
  const [department, setDepartment] = useState<Department>(task.department);
  const [assignee, setAssignee] = useState(task.assigneeId ?? '');
  const [start, setStart] = useState(toDateInput(task.startAt));
  const [due, setDue] = useState(toDateInput(task.dueAt));
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('업무 제목을 적어주세요.');
      return;
    }
    const activity = activities.find((item) => item.id === activityId);
    try {
      await updateTask(task.id, {
        title,
        activity: activity && { id: activity.id, title: activity.title },
        department,
        assigneeId: assignee,
        startAt: fromDateInput(start),
        dueAt: fromDateInput(due),
      });
    } catch (caught) {
      setError(errorMessage(caught, '저장하지 못했어요.'));
      return;
    }
    await revalidator.revalidate();
    onDone();
  };

  const inline = (
    id: string,
    icon: KitIcon,
    label: string,
    control: ReactNode,
  ) => (
    <S.InlineField>
      <label htmlFor={id}>
        <Icon icon={icon} size={16} />
        {label}
      </label>
      {control}
    </S.InlineField>
  );

  // Figma 업무 상세 / 수정 중: 제목 · 담당(부서·담당자·배정자) · 일정(시작·마감) 줄, 오른쪽 위 취소·저장
  return (
    <S.EditForm onSubmit={onSubmit} aria-label="업무 수정">
      <A.HeadMain>
        <A.HeadBadges>
          <Badge theme={statusTone.task[task.status]}>{task.status}</Badge>
          <span>업무 #{task.id}</span>
        </A.HeadBadges>
        <S.EditRow>
          {inline(
            'edit-title',
            iconPerson,
            '제목',
            <S.EditTitle>
              <Input
                id="edit-title"
                maxLength={60}
                value={title}
                error={Boolean(error)}
                onClear={() => setTitle('')}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError('');
                }}
              />
            </S.EditTitle>,
          )}
          {/* 연결된 활동도 고칠 수 있다 (기능 명세서 TSK-U1). Figma 수정 화면에는 없다. */}
          {inline(
            'edit-activity',
            iconLink,
            '활동',
            <SelectControl
              id="edit-activity"
              value={activityId}
              onChange={(event) => setActivityId(event.target.value)}
            >
              <option value="">연결 안함</option>
              {activities.map((item) => (
                <option key={item.id} value={item.id}>
                  {activityNo(item.id)} · {item.title}
                </option>
              ))}
            </SelectControl>,
          )}
        </S.EditRow>
        {error && <S.EditError role="alert">{error}</S.EditError>}
        <S.EditRow>
          {inline(
            'edit-department',
            iconGroups,
            '담당 부서',
            <SelectControl
              id="edit-department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">부서 없음</option>
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectControl>,
          )}
          {inline(
            'edit-assignee',
            iconPerson,
            '담당자',
            <SelectControl
              id="edit-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            >
              {!assignee && <option value="">담당자 없음</option>}
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </SelectControl>,
          )}
          {inline(
            'edit-assigner',
            iconPersonAdd,
            '배정자',
            <Input
              id="edit-assigner"
              value={task.assigner}
              readOnly
              disabled
            />,
          )}
        </S.EditRow>
        <S.EditRow>
          {inline(
            'edit-start',
            iconCalendarToday,
            '시작',
            <Input
              id="edit-start"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />,
          )}
          {inline(
            'edit-due',
            iconCalendarToday,
            '마감',
            <Input
              id="edit-due"
              type="date"
              min={start}
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />,
          )}
        </S.EditRow>
        <S.StatusHint>바꾼 내용은 진행 기록에 자동으로 남아요.</S.StatusHint>
      </A.HeadMain>
      <A.HeadActions>
        <Button onClick={onDone}>취소</Button>
        <Button type="submit" theme="accent" variant="primary">
          저장
        </Button>
      </A.HeadActions>
    </S.EditForm>
  );
}

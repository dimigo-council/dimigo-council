import { useId, useState, type FormEvent } from 'react';
import styled from 'styled-components';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { ReportIcon, SurveyIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { Meter } from '../../components/intranet/Meter.tsx';
import {
  Badge,
  Button,
  TextButton,
  Input,
  TextArea as KitTextArea,
} from '../../dimi-ui-kit/index.ts';
import {
  Checkbox,
  ChoiceGroup,
  Notice,
  PersonAvatar,
  statusTone,
  TextArea,
  ButtonLink,
  SelectControl,
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
  FieldRoot,
  FieldLabel,
  FieldFoot,
  FieldHint,
  InfoList,
  InfoListInline,
  Owner,
  TextLink,
  FormActions,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import { formatDate, formatDateTime } from '../../lib/date.ts';
import {
  addChecklistItem,
  addTaskComment,
  getTask,
  toggleChecklistItem,
  updateTaskBody,
  updateTaskStatus,
} from './api.ts';
import { dueLabel, dueTone, isOverdue } from './format.ts';
import { taskStatuses, type Task, type TaskStatus } from './types.ts';
import * as S from './styles.ts';

const PanelAction = styled(TextButton)`
  ${panelAction}
`;

export async function taskLoader({ params }: LoaderFunctionArgs) {
  return getTask(params.taskId ?? '');
}

const statusHint: Record<TaskStatus, string> = {
  '할 일': '시작하면 진행 중으로 바꿔주세요.',
  '진행 중': '끝나면 검토 요청을 보내주세요.',
  '검토 요청': '요청한 사람이 확인하면 완료로 바꿉니다.',
  완료: '끝난 업무입니다. 다시 열려면 진행 중으로 바꾸세요.',
};

export function TaskDetailPage() {
  const task = useLoaderData<typeof taskLoader>();
  return <TaskDetail key={task.id} task={task} />;
}

function TaskDetail({ task }: { task: Task }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const statusLabelId = useId();
  const [saving, setSaving] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try {
      await action();
      await revalidator.revalidate();
    } finally {
      setSaving(false);
    }
  };

  const overdue = isOverdue(task);

  return (
    <>
      <Breadcrumb aria-label="경로">
        <Link to="/work/tasks">업무</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{task.id}</span>
      </Breadcrumb>
      <PageHeader
        title={task.title}
        description={
          <MetaRow>
            <span>{task.department} 요청</span>
            {overdue ? (
              <Badge theme="negative">마감 {dueLabel(task)}</Badge>
            ) : (
              <span>
                {task.status === '완료'
                  ? dueLabel(task)
                  : `${formatDate(task.dueAt)} 마감`}
              </span>
            )}
          </MetaRow>
        }
        actions={
          task.agenda && (
            <ButtonLink to={`/work/agendas/${task.agenda.id}`}>
              안건 보기
            </ButtonLink>
          )
        }
      />

      <SplitLayout>
        <SplitMain>
          <Panel $padded aria-labelledby={statusLabelId}>
            <FieldRoot>
              <FieldLabel as="h2" id={statusLabelId}>
                상태
              </FieldLabel>
              <ChoiceGroup
                aria-labelledby={statusLabelId}
                name="task-status"
                value={task.status}
                onChange={(next) =>
                  void run(() => updateTaskStatus(task.id, next, session.name))
                }
                items={taskStatuses.map((status) => ({
                  value: status,
                  label: status,
                  disabled: saving,
                }))}
              />
              <FieldFoot>
                <FieldHint>{statusHint[task.status]}</FieldHint>
              </FieldFoot>
            </FieldRoot>
          </Panel>

          <BodyPanel task={task} />
          <ChecklistPanel task={task} />

          <ActivityPanel task={task} />
        </SplitMain>

        <SplitAside>
          <Panel aria-label="업무 정보">
            <InfoList>
              <dt>담당</dt>
              <InfoListInline>
                {task.assignees.map((name) => (
                  <Owner key={name}>
                    <PersonAvatar name={name} aria-hidden="true" />
                    {name}
                  </Owner>
                ))}
              </InfoListInline>
              <dt>요청</dt>
              <Owner as="dd">
                <PersonAvatar name={task.requester} aria-hidden="true" />
                {task.requester}
              </Owner>
              <dt>마감</dt>
              <S.TaskDue $tone={dueTone(task)}>
                {formatDate(task.dueAt)}
              </S.TaskDue>
              <dt>{task.agenda ? '안건' : '묶음'}</dt>
              <dd>
                {task.agenda ? (
                  <TextLink to={`/work/agendas/${task.agenda.id}`}>
                    {task.agenda.id} {task.agenda.title}
                  </TextLink>
                ) : (
                  task.group
                )}
              </dd>
              <dt>공개 범위</dt>
              <dd>
                <Badge theme={statusTone.visibility[task.visibility]}>
                  {task.visibility}
                </Badge>
              </dd>
            </InfoList>
          </Panel>

          {task.outputs.length > 0 && (
            <Panel aria-labelledby="outputs-title">
              <PanelTitle id="outputs-title">산출물</PanelTitle>
              <S.OutputList>
                {task.outputs.map((output) => (
                  <li key={output.id}>
                    {output.kind === 'survey' ? <SurveyIcon /> : <ReportIcon />}
                    <S.OutputText>
                      {output.to ? (
                        <S.OutputTitleLink to={output.to}>
                          {output.title}
                        </S.OutputTitleLink>
                      ) : (
                        <S.OutputTitle>{output.title}</S.OutputTitle>
                      )}
                      <S.OutputMeta>{output.meta}</S.OutputMeta>
                    </S.OutputText>
                  </li>
                ))}
              </S.OutputList>
            </Panel>
          )}
        </SplitAside>
      </SplitLayout>
    </>
  );
}

function BodyPanel({ task }: { task: Task }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.body);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    setStatus('saving');
    try {
      await updateTaskBody(task.id, draft, session.name);
      await revalidator.revalidate();
      setEditing(false);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Panel aria-labelledby="task-body-title">
      <PanelTitle as="div" $split>
        <PanelHeading id="task-body-title">내용</PanelHeading>
        {!editing && (
          <PanelAction
            size="small"
            onClick={() => {
              setDraft(task.body);
              setEditing(true);
            }}
          >
            {task.body ? '고치기' : '내용 쓰기'}
          </PanelAction>
        )}
      </PanelTitle>
      {editing ? (
        <PanelBody as="form" onSubmit={onSubmit}>
          <TextArea
            label="내용"
            rows={6}
            maxLength={2000}
            showCount
            autoFocus
            placeholder="무엇을, 왜 해야 하는지 적어주세요. 문단은 빈 줄로 나눕니다."
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
          {task.body ? (
            task.body
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

function ChecklistPanel({ task }: { task: Task }) {
  const revalidator = useRevalidator();
  const inputId = useId();
  const ownerId = useId();
  const [text, setText] = useState('');
  const [owner, setOwner] = useState(task.assignees[0] ?? '');
  const [saving, setSaving] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try {
      await action();
      await revalidator.revalidate();
    } finally {
      setSaving(false);
    }
  };

  const onAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || saving) return;
    void run(async () => {
      await addChecklistItem(task.id, text, owner);
      setText('');
    });
  };

  const doneCount = task.checklist.filter((item) => item.done).length;

  return (
    <Panel aria-labelledby="checklist-title">
      <PanelTitle as="div" $split>
        <PanelHeading id="checklist-title">체크리스트</PanelHeading>
        {task.checklist.length > 0 && (
          <S.ChecklistMeter>
            <Meter
              label="체크리스트 완료"
              value={doneCount}
              max={task.checklist.length}
            />
          </S.ChecklistMeter>
        )}
      </PanelTitle>
      {task.checklist.length > 0 && (
        <S.Checklist>
          {task.checklist.map((item) => (
            <li key={item.id}>
              <Checkbox
                label={item.text}
                checked={item.done}
                disabled={saving}
                onChange={(event) =>
                  void run(() =>
                    toggleChecklistItem(task.id, item.id, event.target.checked),
                  )
                }
              />
              <S.ChecklistOwner>{item.owner}</S.ChecklistOwner>
            </li>
          ))}
        </S.Checklist>
      )}
      <S.ChecklistAdd onSubmit={onAdd}>
        <VisuallyHidden as="label" htmlFor={inputId}>
          새 항목
        </VisuallyHidden>
        <Input
          id={inputId}
          maxLength={80}
          placeholder="할 일 추가"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <VisuallyHidden as="label" htmlFor={ownerId}>
          맡을 사람
        </VisuallyHidden>
        <SelectControl
          id={ownerId}
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        >
          {task.assignees.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </SelectControl>
        <Button type="submit" disabled={saving || !text.trim()}>
          추가
        </Button>
      </S.ChecklistAdd>
    </Panel>
  );
}

function ActivityPanel({ task }: { task: Task }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const commentId = useId();
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim() || status === 'saving') return;
    setStatus('saving');
    try {
      await addTaskComment(task.id, session.name, comment);
      setComment('');
      setStatus('idle');
      await revalidator.revalidate();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Panel aria-labelledby="activity-title">
      <PanelTitle id="activity-title">활동</PanelTitle>
      <S.Activity>
        {task.activity.map((entry) => (
          <S.ActivityItem key={entry.id}>
            <PersonAvatar name={entry.author} aria-hidden="true" />
            <S.ActivityBody>
              {entry.kind === 'event' ? (
                <S.ActivityLine>
                  <strong>{entry.author}</strong>님이 {entry.text}{' '}
                  <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                </S.ActivityLine>
              ) : (
                <>
                  <S.ActivityLine>
                    <strong>{entry.author}</strong>{' '}
                    <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                  </S.ActivityLine>
                  <S.ActivityComment>{entry.text}</S.ActivityComment>
                </>
              )}
            </S.ActivityBody>
          </S.ActivityItem>
        ))}
      </S.Activity>
      <S.CommentForm onSubmit={onSubmit}>
        <PersonAvatar name={session.name} aria-hidden="true" />
        <S.CommentField>
          <VisuallyHidden as="label" htmlFor={commentId}>
            댓글
          </VisuallyHidden>
          <KitTextArea
            id={commentId}
            placeholder="댓글 남기기"
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          {status === 'error' && (
            <Notice tone="warn" role="alert">
              남기지 못했습니다. 잠시 후 다시 시도해주세요.
            </Notice>
          )}
          <FormActions>
            <Button
              type="submit"
              disabled={!comment.trim() || status === 'saving'}
            >
              댓글 달기
            </Button>
          </FormActions>
        </S.CommentField>
      </S.CommentForm>
    </Panel>
  );
}

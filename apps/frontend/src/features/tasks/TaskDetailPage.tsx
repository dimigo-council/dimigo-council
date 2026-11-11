import { useId, useState, type FormEvent } from 'react';
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
  Avatar,
  Badge,
  Button,
  Checkbox,
  Notice,
  SegmentedControl,
  statusTone,
  TextArea,
} from '../../components/kit/index.ts';
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
import './tasks.css';

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
      <nav className="breadcrumb" aria-label="경로">
        <Link to="/work/tasks">업무</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{task.id}</span>
      </nav>
      <PageHeader
        title={task.title}
        description={
          <span className="meta-row">
            <span>{task.department} 요청</span>
            {overdue ? (
              <Badge tone="danger">마감 {dueLabel(task)}</Badge>
            ) : (
              <span>
                {task.status === '완료'
                  ? dueLabel(task)
                  : `${formatDate(task.dueAt)} 마감`}
              </span>
            )}
          </span>
        }
        actions={
          task.agenda && (
            <Link
              className="btn btn--secondary"
              to={`/work/agendas/${task.agenda.id}`}
            >
              안건 보기
            </Link>
          )
        }
      />

      <div className="split-layout task-detail">
        <div className="split-layout__main">
          <section
            className="panel panel--padded"
            aria-labelledby={statusLabelId}
          >
            <div className="field">
              <h2 className="field__label" id={statusLabelId}>
                상태
              </h2>
              <SegmentedControl
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
              <div className="field__foot">
                <span className="field__hint">{statusHint[task.status]}</span>
              </div>
            </div>
          </section>

          <BodyPanel task={task} />
          <ChecklistPanel task={task} />

          <ActivityPanel task={task} />
        </div>

        <aside className="split-layout__aside">
          <section className="panel" aria-label="업무 정보">
            <dl className="info-list">
              <dt>담당</dt>
              <dd className="info-list__inline">
                {task.assignees.map((name) => (
                  <span key={name} className="owner">
                    <Avatar name={name} aria-hidden="true" />
                    {name}
                  </span>
                ))}
              </dd>
              <dt>요청</dt>
              <dd className="owner">
                <Avatar name={task.requester} aria-hidden="true" />
                {task.requester}
              </dd>
              <dt>마감</dt>
              <dd className="task-due" data-tone={dueTone(task)}>
                {formatDate(task.dueAt)}
              </dd>
              <dt>{task.agenda ? '안건' : '묶음'}</dt>
              <dd>
                {task.agenda ? (
                  <Link
                    className="text-link"
                    to={`/work/agendas/${task.agenda.id}`}
                  >
                    {task.agenda.id} {task.agenda.title}
                  </Link>
                ) : (
                  task.group
                )}
              </dd>
              <dt>공개 범위</dt>
              <dd>
                <Badge tone={statusTone.visibility[task.visibility]}>
                  {task.visibility}
                </Badge>
              </dd>
            </dl>
          </section>

          {task.outputs.length > 0 && (
            <section className="panel" aria-labelledby="outputs-title">
              <h2 className="panel__title" id="outputs-title">
                산출물
              </h2>
              <ul className="output-list">
                {task.outputs.map((output) => (
                  <li key={output.id}>
                    {output.kind === 'survey' ? <SurveyIcon /> : <ReportIcon />}
                    <span className="output-list__text">
                      {output.to ? (
                        <Link className="output-list__title" to={output.to}>
                          {output.title}
                        </Link>
                      ) : (
                        <span className="output-list__title">
                          {output.title}
                        </span>
                      )}
                      <span className="output-list__meta">{output.meta}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
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
    <section className="panel" aria-labelledby="task-body-title">
      <div className="panel__title panel__title--split">
        <h2 className="panel__heading" id="task-body-title">
          내용
        </h2>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            className="panel__action"
            onClick={() => {
              setDraft(task.body);
              setEditing(true);
            }}
          >
            {task.body ? '고치기' : '내용 쓰기'}
          </Button>
        )}
      </div>
      {editing ? (
        <form className="panel__body" onSubmit={onSubmit}>
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
          {task.body ? (
            task.body
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
    <section className="panel" aria-labelledby="checklist-title">
      <div className="panel__title panel__title--split">
        <h2 className="panel__heading" id="checklist-title">
          체크리스트
        </h2>
        {task.checklist.length > 0 && (
          <span className="task-checklist__meter">
            <Meter
              label="체크리스트 완료"
              value={doneCount}
              max={task.checklist.length}
            />
          </span>
        )}
      </div>
      {task.checklist.length > 0 && (
        <ul className="task-checklist">
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
              <span className="task-checklist__owner">{item.owner}</span>
            </li>
          ))}
        </ul>
      )}
      <form className="task-checklist__add" onSubmit={onAdd}>
        <label className="visually-hidden" htmlFor={inputId}>
          새 항목
        </label>
        <input
          id={inputId}
          className="field__control"
          maxLength={80}
          placeholder="할 일 추가"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <label className="visually-hidden" htmlFor={ownerId}>
          맡을 사람
        </label>
        <select
          id={ownerId}
          className="field__control task-checklist__owner-select"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        >
          {task.assignees.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <Button type="submit" disabled={saving || !text.trim()}>
          추가
        </Button>
      </form>
    </section>
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
    <section className="panel" aria-labelledby="activity-title">
      <h2 className="panel__title" id="activity-title">
        활동
      </h2>
      <ol className="task-activity">
        {task.activity.map((entry) => (
          <li
            key={entry.id}
            className="task-activity__item"
            data-kind={entry.kind}
          >
            <Avatar name={entry.author} aria-hidden="true" />
            <div className="task-activity__body">
              {entry.kind === 'event' ? (
                <p className="task-activity__line">
                  <strong>{entry.author}</strong>님이 {entry.text}{' '}
                  <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                </p>
              ) : (
                <>
                  <p className="task-activity__line">
                    <strong>{entry.author}</strong>{' '}
                    <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                  </p>
                  <p className="task-activity__comment">{entry.text}</p>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
      <form className="task-comment" onSubmit={onSubmit}>
        <Avatar name={session.name} aria-hidden="true" />
        <div className="task-comment__field">
          <label className="visually-hidden" htmlFor={commentId}>
            댓글
          </label>
          <textarea
            id={commentId}
            className="field__control comment-input"
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
          <div className="form-actions">
            <Button
              type="submit"
              disabled={!comment.trim() || status === 'saving'}
            >
              댓글 달기
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

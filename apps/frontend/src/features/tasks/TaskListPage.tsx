import { useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { FilterSelect } from '../../components/intranet/FilterSelect.tsx';
import {
  AvatarGroup,
  Badge,
  Button,
  Chip,
  Notice,
  Select,
  statusTone,
  Tabs,
  TextArea,
  TextField,
} from '../../components/kit/index.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listAgendas } from '../agendas/api.ts';
import { finishedStatuses, type Agenda } from '../agendas/types.ts';
import { listMembers } from '../members/api.ts';
import type { Member } from '../members/types.ts';
import { createTask, listTasks } from './api.ts';
import {
  dueLabel,
  dueTone,
  taskGroup,
  taskGroupLabel,
  taskGroups,
} from './format.ts';
import type { Task } from './types.ts';
import './tasks.css';

export async function taskListLoader() {
  const [tasks, agendas, members] = await Promise.all([
    listTasks(),
    listAgendas(),
    listMembers(),
  ]);
  return { tasks, agendas, members };
}

type Tab = 'mine' | 'council' | 'all' | 'requested';
const tabs: Tab[] = ['mine', 'council', 'all', 'requested'];

/** 안건 없이 하는 업무를 고르는 값 */
const NO_AGENDA = '-';

export function TaskStatusIcon({ status }: { status: Task['status'] }) {
  return (
    <span className="task-status" data-status={status} aria-hidden="true" />
  );
}

export function TaskRow({ task }: { task: Task }) {
  return (
    <li className="list-row task-row">
      <TaskStatusIcon status={task.status} />
      <div className="list-row__main">
        <h3 className="list-row__title">
          <Link className="list-row__link" to={`/work/tasks/${task.id}`}>
            {task.title}
          </Link>
        </h3>
        <div className="list-row__meta">
          {task.agenda ? (
            <>
              <span>{task.agenda.id}</span>
              <span>{task.agenda.title}</span>
            </>
          ) : (
            <span>{task.group}</span>
          )}
        </div>
      </div>
      <Badge tone={statusTone.task[task.status]}>{task.status}</Badge>
      <AvatarGroup names={task.assignees} />
      <span className="task-row__due" data-tone={dueTone(task)}>
        {dueLabel(task)}
      </span>
    </li>
  );
}

function toDateInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function NewTaskForm({
  agendas,
  members,
  defaultAgendaId,
  onCancel,
}: {
  agendas: Agenda[];
  members: Member[];
  defaultAgendaId?: string;
  onCancel: () => void;
}) {
  const session = useSession();
  const navigate = useNavigate();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [agendaId, setAgendaId] = useState(
    agendas.some((agenda) => agenda.id === defaultAgendaId)
      ? (defaultAgendaId ?? NO_AGENDA)
      : NO_AGENDA,
  );
  const [assignee, setAssignee] = useState(session.name);
  const [due, setDue] = useState(toDateInput(nextWeek));
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    if (!title.trim()) {
      setError('업무 이름을 적어주세요.');
      return;
    }
    const agenda = agendas.find((item) => item.id === agendaId);
    setStatus('saving');
    try {
      const id = await createTask({
        title,
        body,
        ...(agenda && { agenda: { id: agenda.id, title: agenda.title } }),
        assignee,
        dueAt: new Date(`${due}T18:00`).toISOString(),
        requester: session.name,
        department:
          members.find((member) => member.name === session.name)?.department ??
          '회장단',
      });
      await navigate(`/work/tasks/${id}`);
    } catch {
      setStatus('error');
    }
  };

  return (
    <form
      className="panel panel--padded new-task"
      aria-label="새 업무"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="new-task__fields">
        <TextField
          label="업무 이름"
          value={title}
          maxLength={60}
          error={error}
          autoFocus
          onChange={(event) => {
            setTitle(event.target.value);
            setError(undefined);
          }}
        />
        <Select
          label="안건"
          value={agendaId}
          onChange={(event) => setAgendaId(event.target.value)}
        >
          <option value={NO_AGENDA}>안건 없음</option>
          {agendas.map((agenda) => (
            <option key={agenda.id} value={agenda.id}>
              {agenda.id} {agenda.title}
            </option>
          ))}
        </Select>
        <Select
          label="담당"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
        >
          {members.map((member) => (
            <option key={member.id} value={member.name}>
              {member.name} ({member.department})
            </option>
          ))}
        </Select>
        <TextField
          label="마감"
          type="date"
          value={due}
          required
          onChange={(event) => setDue(event.target.value)}
        />
      </div>
      <TextArea
        label="내용"
        optional
        rows={4}
        maxLength={2000}
        showCount
        placeholder="무엇을, 왜 해야 하는지 적어주세요. 문단은 빈 줄로 나눕니다."
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      {status === 'error' && (
        <Notice tone="warn" role="alert">
          만들지 못했습니다. 잠시 후 다시 시도해주세요.
        </Notice>
      )}
      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" variant="primary" disabled={status === 'saving'}>
          만들기
        </Button>
      </div>
    </form>
  );
}

export function TaskListPage() {
  const { tasks, agendas, members } = useLoaderData<typeof taskListLoader>();
  const session = useSession();
  const [tab, setTab] = useSearchParamOption('tab', tabs, 'mine');
  const [agendaFilter, setAgendaFilter] = useState('');
  const [hideDone, setHideDone] = useState(false);
  const [query, setQuery] = useState('');
  // 안건 화면의 "업무 만들기"는 ?new&agenda=A-26-027 로 들어온다
  const [searchParams] = useSearchParams();
  const [creating, setCreating] = useState(searchParams.has('new'));

  const inTab: Record<Tab, (task: Task) => boolean> = {
    mine: (task) => task.assignees.includes(session.name),
    council: (task) => task.department === '회장단',
    all: () => true,
    requested: (task) => task.requester === session.name,
  };
  const openCount = (key: Tab) =>
    tasks.filter((task) => inTab[key](task) && task.status !== '완료').length;

  const keyword = query.trim();
  const visible = tasks.filter(
    (task) =>
      inTab[tab](task) &&
      (!hideDone || task.status !== '완료') &&
      (!agendaFilter ||
        (agendaFilter === NO_AGENDA
          ? !task.agenda
          : task.agenda?.id === agendaFilter)) &&
      (!keyword || task.id.includes(keyword) || task.title.includes(keyword)),
  );
  const grouped = taskGroups
    .map((group) => ({
      group,
      items: visible
        .filter((task) => taskGroup(task) === group)
        .sort((a, b) =>
          group === 'done'
            ? (b.doneAt ?? '').localeCompare(a.doneAt ?? '')
            : a.dueAt.localeCompare(b.dueAt),
        ),
    }))
    .filter(({ items }) => items.length > 0);
  const taskAgendas = agendas.filter((agenda) =>
    tasks.some((task) => task.agenda?.id === agenda.id),
  );

  return (
    <>
      <PageHeader title="업무" visuallyHidden />

      <Tabs
        aria-label="업무 보기"
        idPrefix="tasks"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'mine', label: '내 업무', count: openCount('mine') },
          { value: 'council', label: '회장단', count: openCount('council') },
          { value: 'all', label: '전체', count: openCount('all') },
          {
            value: 'requested',
            label: '내가 요청한 업무',
            count: openCount('requested'),
          },
        ]}
      />

      <div
        className="task-panel"
        role="tabpanel"
        id={`tasks-panel-${tab}`}
        aria-labelledby={`tasks-tab-${tab}`}
      >
        <div className="page-toolbar">
          <div className="filter-bar">
            <FilterSelect
              label="안건"
              value={agendaFilter}
              onChange={setAgendaFilter}
            >
              <option value="">전체</option>
              {taskAgendas.map((agenda) => (
                <option key={agenda.id} value={agenda.id}>
                  {agenda.title}
                </option>
              ))}
              <option value={NO_AGENDA}>안건 없음</option>
            </FilterSelect>
            <Chip selected={hideDone} onClick={() => setHideDone(!hideDone)}>
              완료 숨기기
            </Chip>
            <input
              type="search"
              className="field__control filter-bar__search"
              aria-label="업무 찾기"
              placeholder="번호, 업무 이름으로 찾기"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button
            variant="primary"
            aria-expanded={creating}
            onClick={() => setCreating(!creating)}
          >
            <PlusIcon />
            업무 만들기
          </Button>
        </div>

        {creating && (
          <NewTaskForm
            agendas={agendas.filter(
              (agenda) => !finishedStatuses.includes(agenda.status),
            )}
            defaultAgendaId={searchParams.get('agenda') ?? undefined}
            members={members}
            onCancel={() => setCreating(false)}
          />
        )}

        {grouped.length > 0 ? (
          <div className="task-board">
            {grouped.map(({ group, items }) => (
              <section key={group} aria-labelledby={`task-group-${group}`}>
                <h2 className="task-board__group" id={`task-group-${group}`}>
                  {taskGroupLabel[group]}
                  <span className="count">{items.length}</span>
                </h2>
                <ul className="list-group">
                  {items.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            {keyword || agendaFilter || hideDone
              ? '조건에 맞는 업무가 없습니다.'
              : '이 보기에 해당하는 업무가 없습니다.'}
          </p>
        )}
      </div>
    </>
  );
}

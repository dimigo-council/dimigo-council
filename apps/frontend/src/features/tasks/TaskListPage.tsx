import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { Badge, Icon } from '../../dimi-ui-kit/index.ts';
import { iconCalendarToday, iconMore } from '../../dimi-ui-kit/icons';
import {
  ButtonLink,
  ChipSelect,
  FilterChips,
  PersonAvatar,
} from '../../components/ui/index.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { activityNo } from '../activities/format.ts';
import { listDepartments } from '../members/api.ts';
import { listTasks } from './api.ts';
import { dueLabel, isDueSoon, taskTag } from './format.ts';
import { taskStatuses, type Task } from './types.ts';
import * as S from './styles.ts';

export async function taskListLoader() {
  const [tasks, departments] = await Promise.all([
    listTasks(),
    listDepartments(),
  ]);
  return { tasks, departments: departments.map((item) => item.name) };
}

type Scope = 'mine' | 'all';
const scopes: Scope[] = ['mine', 'all'];

function TaskCard({ task }: { task: Task }) {
  const tag = taskTag(task);
  return (
    <S.TaskCard $done={task.status === '완료'}>
      <S.CardTop>
        {tag ? <Badge size="small">{tag}</Badge> : <span />}
        {/* Figma 카드의 ⋯: 메뉴는 설계되지 않아 업무 상세로 간다. */}
        <S.CardMore
          to={`/work/tasks/${task.id}`}
          aria-label={`${task.title} 더보기`}
        >
          <Icon icon={iconMore} size={20} />
        </S.CardMore>
      </S.CardTop>
      <S.CardTitleLink to={`/work/tasks/${task.id}`}>
        {task.title}
      </S.CardTitleLink>
      <S.CardFoot $soon={isDueSoon(task)}>
        <Icon icon={iconCalendarToday} size={16} />
        {dueLabel(task)}
        {task.assignee && <PersonAvatar name={task.assignee} />}
      </S.CardFoot>
    </S.TaskCard>
  );
}

/** 업무 보드: 예정됨 · 진행 중 · 검토 요청 · 완료 열 */
export function TaskListPage() {
  const { tasks, departments } = useLoaderData<typeof taskListLoader>();
  const session = useSession();
  const [scope, setScope] = useSearchParamOption('view', scopes, 'mine');
  const [department, setDepartment] = useState('');
  const [activity, setActivity] = useState('');

  const activities = [
    ...new Map(
      tasks.flatMap((task) =>
        task.activity ? [[task.activity.id, task.activity] as const] : [],
      ),
    ).values(),
  ];

  const visible = tasks.filter(
    (task) =>
      (scope === 'all' || task.assigneeId === session.id) &&
      (!department || task.department === department) &&
      (!activity || task.activity?.id === activity),
  );

  return (
    <>
      <PageHeader
        title="업무"
        actions={
          <ButtonLink theme="accent" variant="primary" to="/work/tasks/new">
            <PlusIcon />
            업무 추가
          </ButtonLink>
        }
      />

      <S.Toolbar>
        <FilterChips
          aria-label="업무 보기"
          value={scope}
          onChange={setScope}
          items={[
            { value: 'mine', label: '내 업무' },
            { value: 'all', label: '전체 업무' },
          ]}
        />
        <ChipSelect
          aria-label="부서"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        >
          <option value="">부서: 전체</option>
          {departments.map((item) => (
            <option key={item} value={item}>
              부서: {item}
            </option>
          ))}
        </ChipSelect>
        <ChipSelect
          aria-label="활동"
          value={activity}
          onChange={(event) => setActivity(event.target.value)}
        >
          <option value="">활동: 전체</option>
          {activities.map((item) => (
            <option key={item.id} value={item.id}>
              활동: {activityNo(item.id)} {item.title}
            </option>
          ))}
        </ChipSelect>
      </S.Toolbar>

      <S.Board aria-label="업무 보드">
        {taskStatuses.map((status) => {
          const column = visible.filter((task) => task.status === status);
          const id = `task-column-${status}`;
          return (
            <S.Column key={status} aria-labelledby={id}>
              <S.ColumnTitle id={id} $status={status}>
                {status}
                <span>{column.length}</span>
              </S.ColumnTitle>
              {column.length > 0 ? (
                <S.Cards>
                  {column.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </S.Cards>
              ) : (
                <S.EmptyColumn>업무가 없어요</S.EmptyColumn>
              )}
            </S.Column>
          );
        })}
      </S.Board>
    </>
  );
}

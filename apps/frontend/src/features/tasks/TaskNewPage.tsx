import { useState, type FormEvent } from 'react';
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { useSession } from '../../app/session.ts';
import { Button } from '../../dimi-ui-kit/index.ts';
import {
  Breadcrumbs,
  ButtonLink,
  CardTitle,
  FieldFoot,
  FieldHint,
  FieldLabel,
  FieldRoot,
  FilterChips,
  Notice,
  Select,
  TextField,
} from '../../components/ui/index.ts';
import { listActivities } from '../activities/api.ts';
import { activityNo } from '../activities/format.ts';
import * as A from '../activities/styles.ts';
import { listDepartments, listMembers } from '../members/api.ts';
import type { Department } from '../members/types.ts';
import { errorMessage } from '../../lib/api.ts';
import { createTask } from './api.ts';
import { fromDateInput, toDateInput } from './format.ts';
import { taskStatuses, type TaskStatus } from './types.ts';

/** 업무 추가. 활동 상세의 "업무 배정"은 ?activity=24로 들어와 그 활동을 골라 둔다. */
export async function taskNewLoader({ request }: LoaderFunctionArgs) {
  const [activities, members, departments] = await Promise.all([
    listActivities(),
    listMembers(),
    listDepartments(),
  ]);
  return {
    activities: activities.filter((activity) => activity.status !== '완료'),
    members,
    departments: departments.map((item) => item.name),
    activityId: new URL(request.url).searchParams.get('activity') ?? '',
  };
}

const NO_ACTIVITY = '';

export function TaskNewPage() {
  const { activities, members, departments, activityId } =
    useLoaderData<typeof taskNewLoader>();
  const session = useSession();
  const navigate = useNavigate();
  const today = toDateInput(new Date());
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [title, setTitle] = useState('');
  const [activity, setActivity] = useState(
    activities.some((item) => item.id === activityId)
      ? activityId
      : NO_ACTIVITY,
  );
  const [department, setDepartment] = useState<Department>(
    session.department && departments.includes(session.department)
      ? session.department
      : '',
  );
  const [assignee, setAssignee] = useState(
    members.some((member) => member.id === session.id) ? session.id : '',
  );
  const [start, setStart] = useState(today);
  const [due, setDue] = useState(toDateInput(nextWeek));
  const [status, setStatus] = useState<TaskStatus>('예정됨');
  const [error, setError] = useState<{ title?: string; due?: string }>({});
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving === 'saving') return;
    const next = {
      title: title.trim() ? undefined : '업무 제목을 적어주세요.',
      due:
        due && due >= start
          ? undefined
          : '마감일은 시작일과 같거나 뒤여야 해요.',
    };
    setError(next);
    if (next.title || next.due) return;
    const picked = activities.find((item) => item.id === activity);
    setSaving('saving');
    try {
      const id = await createTask({
        title,
        ...(picked && { activity: { id: picked.id, title: picked.title } }),
        department,
        assigneeId: assignee,
        startAt: fromDateInput(start),
        dueAt: fromDateInput(due),
        status,
      });
      await navigate(`/work/tasks/${id}`);
    } catch (caught) {
      setSaving('error');
      setSaveError(
        errorMessage(caught, '저장하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    }
  };

  return (
    <>
      <title>업무 추가 | 디미고 학생회</title>
      <Breadcrumbs
        items={[{ label: '업무', to: '/work/tasks' }, { label: '업무 추가' }]}
      />
      <A.PageTitle>업무 추가</A.PageTitle>

      <A.Form onSubmit={onSubmit} noValidate>
        <A.FormGrid>
          <A.FormCard aria-labelledby="task-info">
            <CardTitle id="task-info">업무 정보</CardTitle>
            <TextField
              label="업무 제목"
              maxLength={60}
              autoFocus
              value={title}
              error={error.title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError((prev) => ({ ...prev, title: undefined }));
              }}
            />
            <Select
              label="연결된 활동"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              <option value={NO_ACTIVITY}>연결 안함</option>
              {activities.map((item) => (
                <option key={item.id} value={item.id}>
                  활동 {activityNo(item.id)} · {item.title}
                </option>
              ))}
            </Select>
          </A.FormCard>

          <A.FormCard aria-labelledby="task-schedule">
            <CardTitle id="task-schedule">담당 및 일정</CardTitle>
            <Select
              label="담당 부서"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">부서 없음</option>
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
            <Select
              label="담당자"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            >
              {!assignee && <option value="">나 (배정자)</option>}
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.department
                    ? `${member.name} (${member.department})`
                    : member.name}
                </option>
              ))}
            </Select>
            <TextField
              label="시작일"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
            <TextField
              label="마감일"
              type="date"
              min={start}
              value={due}
              error={error.due}
              onChange={(event) => {
                setDue(event.target.value);
                setError((prev) => ({ ...prev, due: undefined }));
              }}
            />
            <FieldRoot>
              <FieldLabel as="span" id="task-status">
                상태
              </FieldLabel>
              <FilterChips
                aria-label="상태"
                value={status}
                onChange={setStatus}
                items={taskStatuses.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
              <FieldFoot>
                <FieldHint>
                  시작일은 오늘 날짜로 채워져요. 상태는 업무 상세에서도 바꿀 수
                  있어요.
                </FieldHint>
              </FieldFoot>
            </FieldRoot>
          </A.FormCard>
        </A.FormGrid>

        {saving === 'error' && (
          <Notice tone="warn" role="alert">
            {saveError}
          </Notice>
        )}

        <A.FormButtons>
          <ButtonLink to="/work/tasks">취소</ButtonLink>
          <Button
            type="submit"
            theme="accent"
            variant="primary"
            disabled={saving === 'saving'}
          >
            업무 저장
          </Button>
        </A.FormButtons>
      </A.Form>
    </>
  );
}

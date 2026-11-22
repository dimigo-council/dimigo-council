import { useState } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router';
import { useSession } from '../app/session.ts';
import {
  Card,
  CardHead,
  CardTitle,
  Checkbox,
  MoreLink,
  Notice,
  Stack,
  TwoColumn,
} from '../components/ui/index.ts';
import { api, errorMessage } from '../lib/api.ts';
import { formatShortDate } from '../lib/date.ts';
import { listActivities } from '../features/activities/api.ts';
import { ActivityStatusCard } from '../features/activities/ActivityStatusCard.tsx';
import { listSurveys } from '../features/surveys/api.ts';
import { UrgentSurveyCard } from '../features/surveys/UrgentSurveyCard.tsx';
import { setTaskDone, listTasks } from '../features/tasks/api.ts';
import { daysUntilDue } from '../features/tasks/format.ts';
import type { Task } from '../features/tasks/types.ts';
import * as S from './homeStyles.ts';

/** GET /home/council (HOM-05, HOM-06) */
interface CouncilHome {
  summary: { checkToday: number; newInquiries: number };
  metrics: {
    openSurveys: { value: number; startedThisWeek: number };
    pendingInquiries: { value: number; receivedLast7Days: number };
    activeActivities: { value: number; completedThisMonth: number };
    myTasks: { value: number; dueToday: number };
  };
}

/** 학생회 홈 (HOM-05~09). 숫자는 서버가 세고, 목록은 목록 API에서 받는다. */
export async function councilHomeLoader() {
  const [home, activities, surveys, myTasks] = await Promise.all([
    api<CouncilHome>('/home/council'),
    listActivities({ hideOnHold: true }),
    listSurveys(),
    listTasks({ mine: true }),
  ]);
  const { metrics } = home;
  return {
    activities,
    surveys,
    myTasks,
    summary: home.summary,
    metrics: [
      {
        label: '진행 중인 설문',
        value: metrics.openSurveys.value,
        note: `이번 주 새로 시작 ${metrics.openSurveys.startedThisWeek}건`,
      },
      {
        label: '처리 대기 질의',
        value: metrics.pendingInquiries.value,
        note: `최근 7일 ${metrics.pendingInquiries.receivedLast7Days}건 접수`,
      },
      {
        label: '추진 중인 활동',
        value: metrics.activeActivities.value,
        note: `이번 달 완료 ${metrics.activeActivities.completedThisMonth}건`,
      },
      {
        label: '나의 업무',
        value: metrics.myTasks.value,
        note: `오늘 마감 ${metrics.myTasks.dueToday}건`,
      },
    ],
  };
}

function dueText(task: Task) {
  if (task.status === '완료') return '완료';
  const days = daysUntilDue(task);
  if (days === 0) return '오늘';
  if (days < 0) return `${formatShortDate(task.dueAt)} 지남`;
  return formatShortDate(task.dueAt);
}

function MyTasksCard({ tasks }: { tasks: Task[] }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const [error, setError] = useState('');
  // 할 일을 마감 순으로 먼저, 끝난 업무는 아래에 하나만 남긴다.
  const open = tasks.filter((task) => task.status !== '완료');
  const done = tasks.filter((task) => task.status === '완료').slice(-1);
  const shown = [...open.slice(0, 3), ...done];

  return (
    <Card aria-labelledby="my-tasks-title">
      <CardHead>
        <CardTitle id="my-tasks-title">나의 업무</CardTitle>
        <MoreLink size="small" to="/work/tasks">
          업무 보드
        </MoreLink>
      </CardHead>
      {shown.length > 0 ? (
        <S.TaskList>
          {shown.map((task) => (
            <S.TaskItem key={task.id} $done={task.status === '완료'}>
              <Checkbox
                label={task.title}
                checked={task.status === '완료'}
                onChange={(event) => {
                  setError('');
                  void setTaskDone(task.id, event.target.checked, session.name)
                    .catch((caught: unknown) =>
                      setError(errorMessage(caught, '바꾸지 못했어요.')),
                    )
                    .then(() => revalidator.revalidate());
                }}
              />
              <S.TaskDue
                as={Link}
                to={`/work/tasks/${task.id}`}
                aria-label={`${task.title} 상세, ${dueText(task)}`}
                $today={dueText(task) === '오늘'}
              >
                {dueText(task)}
              </S.TaskDue>
            </S.TaskItem>
          ))}
        </S.TaskList>
      ) : (
        <S.Empty>맡은 업무가 없어요.</S.Empty>
      )}
      {error && (
        <Notice tone="warn" role="alert">
          {error}
        </Notice>
      )}
    </Card>
  );
}

export function CouncilHomePage() {
  const { activities, surveys, myTasks, summary, metrics } =
    useLoaderData<typeof councilHomeLoader>();
  const session = useSession();

  return (
    <>
      <title>학생회 홈 | 디미고 학생회</title>
      <S.Greeting>
        <div>
          <h1>안녕하세요, {session.name}님</h1>
          <p>
            오늘 확인할 업무 {summary.checkToday}건과 새로 접수된 질의{' '}
            {summary.newInquiries}건이 있어요.
          </p>
        </div>
      </S.Greeting>

      <S.Metrics aria-label="주요 지표">
        {metrics.map((metric) => (
          <S.Metric key={metric.label}>
            <h2>{metric.label}</h2>
            <S.MetricValue>
              {metric.value}
              <span>건</span>
            </S.MetricValue>
            <p>{metric.note}</p>
          </S.Metric>
        ))}
      </S.Metrics>

      <TwoColumn>
        <ActivityStatusCard
          activities={activities}
          moreTo="/work/activities"
          activityTo={(activity) => `/work/activities/${activity.id}`}
        />
        <Stack>
          <UrgentSurveyCard
            surveys={surveys}
            respondTo={(survey) => `/work/surveys/${survey.id}`}
          />
          <MyTasksCard tasks={myTasks} />
        </Stack>
      </TwoColumn>
    </>
  );
}

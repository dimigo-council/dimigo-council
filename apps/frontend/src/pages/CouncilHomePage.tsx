import { Link, useLoaderData, useRevalidator } from 'react-router';
import { getSession, useSession } from '../app/session.ts';
import {
  Card,
  CardHead,
  CardTitle,
  Checkbox,
  MoreLink,
  Stack,
  TwoColumn,
} from '../components/ui/index.ts';
import { dayDiff, formatShortDate } from '../lib/date.ts';
import { listActivities } from '../features/activities/api.ts';
import { ActivityStatusCard } from '../features/activities/ActivityStatusCard.tsx';
import { listCouncilInquiries } from '../features/inquiries/api.ts';
import { listAdminSurveys } from '../features/survey-admin/api.ts';
import { surveyStatus } from '../features/survey-admin/format.ts';
import { listSurveys } from '../features/surveys/api.ts';
import {
  openByDeadline,
  UrgentSurveyCard,
} from '../features/surveys/UrgentSurveyCard.tsx';
import { setTaskDone, listTasks } from '../features/tasks/api.ts';
import { daysUntilDue } from '../features/tasks/format.ts';
import type { Task } from '../features/tasks/types.ts';
import * as S from './homeStyles.ts';

/** 학생회 홈 (HOM-05~09) */
export async function councilHomeLoader() {
  const session = getSession();
  const [activities, surveys, adminSurveys, inquiries, tasks] =
    await Promise.all([
      listActivities(),
      listSurveys(),
      listAdminSurveys(),
      listCouncilInquiries(session.name),
      listTasks(),
    ]);
  const now = new Date();
  const withinDays = (iso: string | undefined, days: number) =>
    Boolean(iso) && dayDiff(new Date(iso!), now) < days;

  const myTasks = tasks.filter((task) => task.assignee === session.name);
  const myOpen = myTasks.filter((task) => task.status !== '완료');
  const waiting = inquiries.filter((inquiry) => inquiry.status === '접수');
  const thisMonth = (iso?: string) =>
    Boolean(iso) &&
    new Date(iso!).getMonth() === now.getMonth() &&
    new Date(iso!).getFullYear() === now.getFullYear();

  return {
    activities,
    surveys,
    myTasks,
    summary: {
      checkToday: myOpen.filter((task) => daysUntilDue(task) <= 3).length,
      newInquiries: waiting.filter((inquiry) =>
        withinDays(inquiry.submittedAt, 7),
      ).length,
    },
    metrics: [
      {
        label: '진행 중인 설문',
        value: openByDeadline(surveys).length,
        note: `이번 주 새로 시작 ${
          adminSurveys.filter(
            (survey) =>
              surveyStatus(survey) === '진행 중' &&
              withinDays(survey.opensAt, 7),
          ).length
        }건`,
      },
      {
        label: '처리 대기 질의',
        value: waiting.length,
        note: `최근 7일 ${
          waiting.filter((inquiry) => withinDays(inquiry.submittedAt, 7)).length
        }건 접수`,
      },
      {
        label: '추진 중인 활동',
        value: activities.filter((activity) => activity.status === '추진 중')
          .length,
        note: `이번 달 완료 ${
          activities.filter(
            (activity) =>
              activity.status === '완료' &&
              thisMonth(
                [...activity.history].reverse().find((item) => item.at)?.at,
              ),
          ).length
        }건`,
      },
      {
        label: '나의 업무',
        value: myOpen.length,
        note: `오늘 마감 ${
          myOpen.filter((task) => daysUntilDue(task) === 0).length
        }건`,
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
                onChange={(event) =>
                  void setTaskDone(
                    task.id,
                    event.target.checked,
                    session.name,
                  ).then(() => revalidator.revalidate())
                }
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

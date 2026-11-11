import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLoaderData } from 'react-router';
import { Avatar, Count } from '../components/kit/index.ts';
import { listAgendas } from '../features/agendas/api.ts';
import { finishedStatuses } from '../features/agendas/types.ts';
import { listInbox } from '../features/inbox/api.ts';
import { listPublishItems } from '../features/publish/api.ts';
import { listTasks } from '../features/tasks/api.ts';
import { BrandMark } from './BrandMark.tsx';
import {
  AgendaIcon,
  ChevronLeftIcon,
  EyeIcon,
  InboxIcon,
  PeopleIcon,
  ReportIcon,
  SurveyIcon,
  TaskIcon,
} from './icons.tsx';
import { getSession, useSession } from './session.ts';

interface NavCount {
  value: number;
  alert?: boolean;
}

/** 사이드바 숫자. 회색은 진행 중인 개수, 주황(alert)은 누군가 처리해야 하는 개수. */
export async function workLayoutLoader() {
  const session = getSession();
  const [tasks, agendas, inbox, publish] = await Promise.all([
    listTasks(),
    listAgendas(),
    listInbox(),
    listPublishItems(),
  ]);
  const counts: Partial<Record<string, NavCount>> = {
    '/work/tasks': {
      value: tasks.filter(
        (task) =>
          task.assignees.includes(session.name) && task.status !== '완료',
      ).length,
    },
    '/work/agendas': {
      value: agendas.filter(
        (agenda) => !finishedStatuses.includes(agenda.status),
      ).length,
    },
    '/work/suggestions': {
      value: inbox.filter((item) => item.status === '접수 대기').length,
      alert: true,
    },
    '/work/publish': {
      value: publish.filter((item) => item.status === '공개 검토 중').length,
      alert: true,
    },
  };
  return counts;
}

interface WorkNavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const workNav: WorkNavItem[] = [
  { to: '/work/tasks', label: '업무', icon: <TaskIcon /> },
  { to: '/work/agendas', label: '안건', icon: <AgendaIcon /> },
  { to: '/work/suggestions', label: '건의 접수함', icon: <InboxIcon /> },
  { to: '/work/surveys', label: '설문', icon: <SurveyIcon /> },
  { to: '/work/reports', label: '보고서', icon: <ReportIcon /> },
];

const manageNav: WorkNavItem[] = [
  { to: '/work/publish', label: '공개 검토', icon: <EyeIcon /> },
  { to: '/work/members', label: '구성원·권한', icon: <PeopleIcon /> },
];

function SideNavList({ items }: { items: WorkNavItem[] }) {
  const counts = useLoaderData<typeof workLayoutLoader>();
  return (
    <ul className="sidenav__list">
      {items.map((item) => {
        const count = counts[item.to];
        return (
          <li key={item.to}>
            <NavLink className="sidenav__link" to={item.to}>
              {item.icon}
              <span>{item.label}</span>
              {count && count.value > 0 && (
                <Count value={count.value} alert={count.alert} />
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

/** 학생회 업무공간: 왼쪽 사이드바 + 본문 */
export function WorkLayout() {
  const session = useSession();

  return (
    <div className="work-shell">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <aside className="sidenav">
        <Link className="shell-brand sidenav__brand" to="/work/tasks">
          <BrandMark />
          학생회 업무공간
        </Link>
        <nav className="sidenav__nav" aria-label="업무공간 메뉴">
          <SideNavList items={workNav} />
          <h2 className="sidenav__group">관리</h2>
          <SideNavList items={manageNav} />
        </nav>
        <div className="sidenav__foot">
          <Link className="sidenav__back" to="/surveys">
            <ChevronLeftIcon />
            학생 화면으로
          </Link>
          <div className="sidenav__user">
            <Avatar name={session.name} size="lg" />
            <span>
              <strong>{session.name}</strong>
              {session.councilRole && <span>{session.councilRole}</span>}
            </span>
          </div>
        </div>
      </aside>

      <main id="main" className="work-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

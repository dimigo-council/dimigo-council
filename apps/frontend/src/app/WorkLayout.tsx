import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLoaderData } from 'react-router';
import styled, { css } from 'styled-components';
import { Count, PersonAvatar } from '../components/ui/index.ts';
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
import { koreanWrap, ShellBrand, SkipLink } from './shell.ts';

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

const narrow = '@media (max-width: 900px)';

/* 업무공간 */
const Shell = styled.div`
  ${koreanWrap}
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.background.secondary};

  ${narrow} {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
  }
  @media print {
    display: block;
  }
`;

const SideNav = styled.aside`
  ${({ theme: t }) => css`
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100dvh;
    padding: 16px 10px;
    border-right: 1px solid ${t.colors.core.outline};
    background: ${t.colors.background.primary};

    ${narrow} {
      position: relative;
      height: auto;
      padding: 12px 16px 0;
      border-right: 0;
      border-bottom: 1px solid ${t.colors.core.outline};
    }
    @media print {
      display: none;
    }
  `}
`;

const SideNavBrand = styled(ShellBrand)`
  padding: 4px 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.core.outline};

  ${narrow} {
    padding: 4px 0 12px;
    border-bottom: 0;
  }
`;

const SideNavNav = styled.nav`
  flex: 1;
  padding-top: 8px;
  overflow-y: auto;

  ${narrow} {
    display: flex;
    gap: 4px;
    padding: 0 0 8px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SideNavListRoot = styled.ul`
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${narrow} {
    display: flex;
  }
`;

const SideNavCount = styled(Count)<{ $current: boolean }>`
  margin-left: auto;
  ${({ theme, $current, alert }) =>
    $current &&
    !alert &&
    css`
      color: ${theme.colors.core.glyph.inverted.primary};
      opacity: 0.7;
    `}
`;

const SideNavLink = styled(NavLink)`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 38px;
    padding: 0 10px;
    border-radius: ${t.radius.m};
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    text-decoration: none;

    &:hover {
      background: ${t.colors.components.fill.primary};
      color: ${t.colors.core.glyph.primary};
    }
    &[aria-current='page'] {
      background: ${t.colors.components.fill.inverted.primary};
      color: ${t.colors.core.glyph.inverted.primary};
      font-weight: 700;
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 1px;
    }

    ${narrow} {
      white-space: nowrap;
    }
  `}
`;

const SideNavGroup = styled.h2`
  ${({ theme: t }) => css`
    margin: 20px 10px 6px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    font-weight: 700;

    ${narrow} {
      display: none;
    }
  `}
`;

const SideNavFoot = styled.div`
  display: grid;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};

  ${narrow} {
    position: absolute;
    top: 12px;
    right: 16px;
    padding: 0;
    border-top: 0;
  }
`;

const SideNavBack = styled(Link)`
  ${({ theme: t }) => css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    text-decoration: none;

    &:hover {
      color: ${t.colors.core.glyph.primary};
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 1px;
    }
  `}
`;

const SideNavUser = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 6px;
    font-size: ${t.font.size.callout};

    > span:last-child {
      display: grid;
    }
    > span:last-child > span {
      color: ${t.colors.core.glyph.tertiary};
      font-size: ${t.font.size.footnote};
    }

    ${narrow} {
      display: none;
    }
  `}
`;

const Main = styled.main`
  width: 100%;
  max-width: 1240px;
  padding: 32px 32px 64px;

  ${narrow} {
    padding: 24px 16px 56px;
  }
`;

function SideNavList({ items }: { items: WorkNavItem[] }) {
  const counts = useLoaderData<typeof workLayoutLoader>();
  return (
    <SideNavListRoot>
      {items.map((item) => {
        const count = counts[item.to];
        return (
          <li key={item.to}>
            <SideNavLink to={item.to}>
              {({ isActive }) => (
                <>
                  {item.icon}
                  <span>{item.label}</span>
                  {count && count.value > 0 && (
                    <SideNavCount
                      value={count.value}
                      alert={count.alert}
                      $current={isActive}
                    />
                  )}
                </>
              )}
            </SideNavLink>
          </li>
        );
      })}
    </SideNavListRoot>
  );
}

/** 학생회 업무공간: 왼쪽 사이드바 + 본문 */
export function WorkLayout() {
  const session = useSession();

  return (
    <Shell>
      <SkipLink href="#main">본문으로 건너뛰기</SkipLink>
      <SideNav>
        <SideNavBrand to="/work/tasks">
          <BrandMark />
          학생회 업무공간
        </SideNavBrand>
        <SideNavNav aria-label="업무공간 메뉴">
          <SideNavList items={workNav} />
          <SideNavGroup>관리</SideNavGroup>
          <SideNavList items={manageNav} />
        </SideNavNav>
        <SideNavFoot>
          <SideNavBack to="/surveys">
            <ChevronLeftIcon />
            학생 화면으로
          </SideNavBack>
          <SideNavUser>
            <PersonAvatar name={session.name} size="medium" />
            <span>
              <strong>{session.name}</strong>
              {session.councilRole && <span>{session.councilRole}</span>}
            </span>
          </SideNavUser>
        </SideNavFoot>
      </SideNav>

      <Main id="main" tabIndex={-1}>
        <Outlet />
      </Main>
    </Shell>
  );
}

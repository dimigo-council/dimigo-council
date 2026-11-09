import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import {
  AgendaListPage,
  agendaListLoader,
} from '../features/agendas/AgendaListPage.tsx';
import {
  AgendaWorkPage,
  agendaWorkLoader,
} from '../features/agendas/AgendaWorkPage.tsx';
import {
  ActivityListPage,
  activityListLoader,
} from '../features/activity/ActivityListPage.tsx';
import {
  AgendaDetailPage,
  agendaLoader,
} from '../features/activity/AgendaDetailPage.tsx';
import {
  SurveyListPage,
  surveyListLoader,
} from '../features/surveys/SurveyListPage.tsx';
import {
  SurveyResponsePage,
  surveyLoader,
} from '../features/surveys/SurveyResponsePage.tsx';
import {
  NewSuggestionPage,
  newSuggestionLoader,
} from '../features/suggestions/NewSuggestionPage.tsx';
import {
  SuggestionDetailPage,
  suggestionLoader,
} from '../features/suggestions/SuggestionDetailPage.tsx';
import {
  SuggestionListPage,
  suggestionListLoader,
} from '../features/suggestions/SuggestionListPage.tsx';
import { HomePage } from '../pages/HomePage.tsx';
import { NotFoundPage } from '../pages/NotFoundPage.tsx';
import {
  PlaceholderPage,
  type PlaceholderPageProps,
} from '../pages/PlaceholderPage.tsx';
import { RouteErrorPage } from '../pages/RouteErrorPage.tsx';
import { StudentLayout } from './StudentLayout.tsx';
import { WorkLayout } from './WorkLayout.tsx';

type PlaceholderRoute = PlaceholderPageProps & { path: string };

function toRoutes(items: PlaceholderRoute[]): RouteObject[] {
  return items.map(({ path, ...page }) => ({
    path,
    element: <PlaceholderPage {...page} />,
  }));
}

// 화면 제목·설명은 documents/test_UI 시안의 문구를 따른다.
const workPages: PlaceholderRoute[] = [
  {
    path: 'tasks',
    title: '업무',
    description:
      '안건과 학생회 활동에 필요한 일을 나누고 진행 상황을 관리합니다.',
    design: '업무 · work tasks',
  },
  {
    path: 'tasks/:taskId',
    title: '업무 상세',
    design: '업무 상세 · work tasks id',
  },
  { path: 'suggestions', title: '건의 접수함' },
  { path: 'surveys', title: '설문 관리' },
  {
    path: 'surveys/:surveyId/edit',
    title: '설문 편집',
    design: '설문 편집 · work surveys id edit',
  },
  { path: 'reports', title: '보고서' },
  { path: 'publish', title: '공개 검토' },
  { path: 'members', title: '구성원·권한' },
];

const devRoutes: RouteObject[] = [];
if (import.meta.env.DEV) {
  const KitPreview = lazy(() => import('../components/kit/KitPreview.tsx'));
  devRoutes.push({
    path: 'kit',
    element: (
      <Suspense>
        <KitPreview />
      </Suspense>
    ),
  });
}

export const router = createBrowserRouter([
  { index: true, element: <HomePage /> },
  {
    path: 'login',
    element: (
      <main className="standalone-main">
        <PlaceholderPage title="로그인" design="로그인 · login" />
      </main>
    ),
  },
  {
    element: <StudentLayout />,
    HydrateFallback: () => null,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: 'surveys',
            loader: surveyListLoader,
            element: <SurveyListPage />,
          },
          {
            path: 'surveys/:surveyId',
            loader: surveyLoader,
            element: <SurveyResponsePage />,
          },
          {
            path: 'suggestions',
            loader: suggestionListLoader,
            element: <SuggestionListPage />,
          },
          {
            path: 'suggestions/new',
            loader: newSuggestionLoader,
            element: <NewSuggestionPage />,
          },
          {
            path: 'suggestions/:suggestionId',
            loader: suggestionLoader,
            element: <SuggestionDetailPage />,
          },
          {
            path: 'activity',
            loader: activityListLoader,
            element: <ActivityListPage />,
          },
          {
            path: 'activity/:agendaId',
            loader: agendaLoader,
            element: <AgendaDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: 'work',
    element: <WorkLayout />,
    HydrateFallback: () => null,
    children: [
      { index: true, element: <Navigate to="tasks" replace /> },
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: 'agendas',
            loader: agendaListLoader,
            element: <AgendaListPage />,
          },
          {
            path: 'agendas/:agendaId',
            loader: agendaWorkLoader,
            element: <AgendaWorkPage />,
          },
          ...toRoutes(workPages),
        ],
      },
    ],
  },
  ...devRoutes,
  { path: '*', element: <NotFoundPage /> },
]);

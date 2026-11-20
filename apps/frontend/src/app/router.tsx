import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { RouteErrorPage } from '../pages/RouteErrorPage.tsx';
import { StandaloneMain } from './shell.ts';
import { StudentLayout } from './StudentLayout.tsx';
import { WorkLayout, workLayoutLoader } from './WorkLayout.tsx';

const devRoutes: RouteObject[] = [];
if (import.meta.env.DEV) {
  const DimiUiKitPreview = lazy(
    () => import('../dimi-ui-kit/DimiUiKitPreview.tsx'),
  );
  // /kit was the old hand-made kit's preview; it now shows the real kit too.
  for (const path of ['dimi-ui-kit', 'kit']) {
    devRoutes.push({
      path,
      element: (
        <Suspense>
          <DimiUiKitPreview />
        </Suspense>
      ),
    });
  }
}

export const router = createBrowserRouter([
  {
    index: true,
    HydrateFallback: () => null,
    lazy: async () => ({
      Component: (await import('../pages/HomePage.tsx')).HomePage,
    }),
  },
  {
    path: 'login',
    HydrateFallback: () => null,
    lazy: async () => {
      const { PlaceholderPage } = await import('../pages/PlaceholderPage.tsx');
      return {
        element: (
          <StandaloneMain>
            <PlaceholderPage title="로그인" design="로그인 · login" />
          </StandaloneMain>
        ),
      };
    },
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
            lazy: async () => {
              const m = await import('../features/surveys/SurveyListPage.tsx');
              return {
                Component: m.SurveyListPage,
                loader: m.surveyListLoader,
              };
            },
          },
          {
            path: 'surveys/:surveyId',
            lazy: async () => {
              const m =
                await import('../features/surveys/SurveyResponsePage.tsx');
              return {
                Component: m.SurveyResponsePage,
                loader: m.surveyLoader,
              };
            },
          },
          {
            path: 'suggestions',
            lazy: async () => {
              const m =
                await import('../features/suggestions/SuggestionListPage.tsx');
              return {
                Component: m.SuggestionListPage,
                loader: m.suggestionListLoader,
              };
            },
          },
          {
            path: 'suggestions/new',
            lazy: async () => {
              const m =
                await import('../features/suggestions/NewSuggestionPage.tsx');
              return {
                Component: m.NewSuggestionPage,
                loader: m.newSuggestionLoader,
              };
            },
          },
          {
            path: 'suggestions/:suggestionId',
            lazy: async () => {
              const m =
                await import('../features/suggestions/SuggestionDetailPage.tsx');
              return {
                Component: m.SuggestionDetailPage,
                loader: m.suggestionLoader,
              };
            },
          },
          {
            path: 'activity',
            lazy: async () => {
              const m =
                await import('../features/activity/ActivityListPage.tsx');
              return {
                Component: m.ActivityListPage,
                loader: m.activityListLoader,
              };
            },
          },
          {
            path: 'activity/:agendaId',
            lazy: async () => {
              const m =
                await import('../features/activity/AgendaDetailPage.tsx');
              return { Component: m.AgendaDetailPage, loader: m.agendaLoader };
            },
          },
        ],
      },
    ],
  },
  {
    path: 'work',
    loader: workLayoutLoader,
    element: <WorkLayout />,
    HydrateFallback: () => null,
    children: [
      { index: true, element: <Navigate to="tasks" replace /> },
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: 'tasks',
            lazy: async () => {
              const m = await import('../features/tasks/TaskListPage.tsx');
              return { Component: m.TaskListPage, loader: m.taskListLoader };
            },
          },
          {
            path: 'tasks/:taskId',
            lazy: async () => {
              const m = await import('../features/tasks/TaskDetailPage.tsx');
              return { Component: m.TaskDetailPage, loader: m.taskLoader };
            },
          },
          {
            path: 'agendas',
            lazy: async () => {
              const m = await import('../features/agendas/AgendaListPage.tsx');
              return {
                Component: m.AgendaListPage,
                loader: m.agendaListLoader,
              };
            },
          },
          {
            path: 'agendas/:agendaId',
            lazy: async () => {
              const m = await import('../features/agendas/AgendaWorkPage.tsx');
              return {
                Component: m.AgendaWorkPage,
                loader: m.agendaWorkLoader,
              };
            },
          },
          {
            path: 'suggestions',
            lazy: async () => {
              const m = await import('../features/inbox/InboxPage.tsx');
              return { Component: m.InboxPage, loader: m.inboxLoader };
            },
          },
          {
            path: 'surveys',
            lazy: async () => {
              const m =
                await import('../features/survey-admin/SurveyAdminListPage.tsx');
              return {
                Component: m.SurveyAdminListPage,
                loader: m.surveyAdminListLoader,
              };
            },
          },
          {
            path: 'surveys/:surveyId/edit',
            lazy: async () => {
              const m =
                await import('../features/survey-admin/SurveyEditPage.tsx');
              return {
                Component: m.SurveyEditPage,
                loader: m.surveyEditLoader,
              };
            },
          },
          {
            path: 'surveys/:surveyId/results',
            lazy: async () => {
              const m =
                await import('../features/survey-admin/SurveyResultsLayout.tsx');
              return {
                Component: m.SurveyResultsLayout,
                loader: m.surveyResultsLoader,
              };
            },
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (
                    await import('../features/survey-admin/SurveyResultsSummaryPage.tsx')
                  ).SurveyResultsSummaryPage,
                }),
              },
              {
                path: 'questions',
                lazy: async () => ({
                  Component: (
                    await import('../features/survey-admin/SurveyResultsQuestionPage.tsx')
                  ).SurveyResultsQuestionPage,
                }),
              },
              {
                path: 'responses',
                lazy: async () => ({
                  Component: (
                    await import('../features/survey-admin/SurveyResultsResponsePage.tsx')
                  ).SurveyResultsResponsePage,
                }),
              },
            ],
          },
          {
            path: 'reports',
            lazy: async () => {
              const m = await import('../features/reports/ReportListPage.tsx');
              return {
                Component: m.ReportListPage,
                loader: m.reportListLoader,
              };
            },
          },
          {
            path: 'reports/new',
            lazy: async () => {
              const m = await import('../features/reports/NewReportPage.tsx');
              return { Component: m.NewReportPage, loader: m.newReportLoader };
            },
          },
          {
            path: 'reports/:reportId',
            lazy: async () => {
              const m =
                await import('../features/reports/ReportDetailPage.tsx');
              return { Component: m.ReportDetailPage, loader: m.reportLoader };
            },
          },
          {
            path: 'publish',
            lazy: async () => {
              const m =
                await import('../features/publish/PublishReviewPage.tsx');
              return {
                Component: m.PublishReviewPage,
                loader: m.publishLoader,
              };
            },
          },
          {
            path: 'members',
            lazy: async () => {
              const m = await import('../features/members/MemberListPage.tsx');
              return {
                Component: m.MemberListPage,
                loader: m.memberListLoader,
              };
            },
          },
        ],
      },
    ],
  },
  ...devRoutes,
  {
    path: '*',
    lazy: async () => ({
      Component: (await import('../pages/NotFoundPage.tsx')).NotFoundPage,
    }),
  },
]);

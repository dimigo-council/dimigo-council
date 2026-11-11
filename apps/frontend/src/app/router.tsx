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
import { InboxPage, inboxLoader } from '../features/inbox/InboxPage.tsx';
import {
  MemberListPage,
  memberListLoader,
} from '../features/members/MemberListPage.tsx';
import {
  PublishReviewPage,
  publishLoader,
} from '../features/publish/PublishReviewPage.tsx';
import {
  NewReportPage,
  newReportLoader,
} from '../features/reports/NewReportPage.tsx';
import {
  ReportDetailPage,
  reportLoader,
} from '../features/reports/ReportDetailPage.tsx';
import {
  ReportListPage,
  reportListLoader,
} from '../features/reports/ReportListPage.tsx';
import {
  SurveyAdminListPage,
  surveyAdminListLoader,
} from '../features/survey-admin/SurveyAdminListPage.tsx';
import {
  SurveyEditPage,
  surveyEditLoader,
} from '../features/survey-admin/SurveyEditPage.tsx';
import { SurveyResultsQuestionPage } from '../features/survey-admin/SurveyResultsQuestionPage.tsx';
import { SurveyResultsResponsePage } from '../features/survey-admin/SurveyResultsResponsePage.tsx';
import {
  SurveyResultsLayout,
  surveyResultsLoader,
} from '../features/survey-admin/SurveyResultsLayout.tsx';
import { SurveyResultsSummaryPage } from '../features/survey-admin/SurveyResultsSummaryPage.tsx';
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
import {
  TaskDetailPage,
  taskLoader,
} from '../features/tasks/TaskDetailPage.tsx';
import {
  TaskListPage,
  taskListLoader,
} from '../features/tasks/TaskListPage.tsx';
import { HomePage } from '../pages/HomePage.tsx';
import { NotFoundPage } from '../pages/NotFoundPage.tsx';
import { PlaceholderPage } from '../pages/PlaceholderPage.tsx';
import { RouteErrorPage } from '../pages/RouteErrorPage.tsx';
import { StudentLayout } from './StudentLayout.tsx';
import { WorkLayout, workLayoutLoader } from './WorkLayout.tsx';

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
            loader: taskListLoader,
            element: <TaskListPage />,
          },
          {
            path: 'tasks/:taskId',
            loader: taskLoader,
            element: <TaskDetailPage />,
          },
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
          {
            path: 'suggestions',
            loader: inboxLoader,
            element: <InboxPage />,
          },
          {
            path: 'surveys',
            loader: surveyAdminListLoader,
            element: <SurveyAdminListPage />,
          },
          {
            path: 'surveys/:surveyId/edit',
            loader: surveyEditLoader,
            element: <SurveyEditPage />,
          },
          {
            path: 'surveys/:surveyId/results',
            loader: surveyResultsLoader,
            element: <SurveyResultsLayout />,
            children: [
              { index: true, element: <SurveyResultsSummaryPage /> },
              { path: 'questions', element: <SurveyResultsQuestionPage /> },
              { path: 'responses', element: <SurveyResultsResponsePage /> },
            ],
          },
          {
            path: 'reports',
            loader: reportListLoader,
            element: <ReportListPage />,
          },
          {
            path: 'reports/new',
            loader: newReportLoader,
            element: <NewReportPage />,
          },
          {
            path: 'reports/:reportId',
            loader: reportLoader,
            element: <ReportDetailPage />,
          },
          {
            path: 'publish',
            loader: publishLoader,
            element: <PublishReviewPage />,
          },
          {
            path: 'members',
            loader: memberListLoader,
            element: <MemberListPage />,
          },
        ],
      },
    ],
  },
  ...devRoutes,
  { path: '*', element: <NotFoundPage /> },
]);

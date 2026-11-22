import { lazy, Suspense } from 'react';
import { createBrowserRouter, redirect, type RouteObject } from 'react-router';
import { RouteErrorPage } from '../pages/RouteErrorPage.tsx';
import { AppLayout } from './AppLayout.tsx';
import { getSession } from './session.ts';

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

/** 로그인 전 화면 (랜딩, 로그인, 회원가입, 약관). 방문자 GNB를 쓴다. */
const visitorRoutes: RouteObject[] = [
  {
    path: 'landing',
    lazy: async () => {
      const m = await import('../pages/LandingPage.tsx');
      return { Component: m.LandingPage, loader: m.landingLoader };
    },
  },
  {
    path: 'login',
    lazy: async () => ({
      Component: (await import('../features/auth/AuthPages.tsx')).LoginPage,
    }),
  },
  {
    path: 'login/code',
    lazy: async () => {
      const { CodePage } = await import('../features/auth/AuthPages.tsx');
      return { Component: () => <CodePage flow="login" /> };
    },
  },
  {
    path: 'signup',
    lazy: async () => ({
      Component: (await import('../features/auth/AuthPages.tsx')).SignupPage,
    }),
  },
  {
    path: 'signup/code',
    lazy: async () => {
      const { CodePage } = await import('../features/auth/AuthPages.tsx');
      return { Component: () => <CodePage flow="signup" /> };
    },
  },
  {
    path: 'signup/info',
    lazy: async () => ({
      Component: (await import('../features/auth/AuthPages.tsx'))
        .SignupInfoPage,
    }),
  },
  {
    path: 'terms',
    lazy: async () => ({
      Component: (await import('../pages/PolicyPage.tsx')).TermsPage,
    }),
  },
  {
    path: 'privacy',
    lazy: async () => ({
      Component: (await import('../pages/PolicyPage.tsx')).PrivacyPage,
    }),
  },
];

/** 학생 화면과 학생회 화면이 같은 컴포넌트를 쓰는 경로 (활동 기록, 설문 응답) */
const sharedPages = {
  records: {
    path: 'records',
    lazy: async () => {
      const m = await import('../features/records/RecordPages.tsx');
      return { Component: m.RecordListPage, loader: m.recordListLoader };
    },
  },
  record: {
    path: 'records/:recordId',
    lazy: async () => {
      const m = await import('../features/records/RecordPages.tsx');
      return { Component: m.RecordViewerPage, loader: m.recordLoader };
    },
  },
  surveyResponse: {
    path: 'surveys/:surveyId',
    lazy: async () => {
      const m = await import('../features/surveys/SurveyResponsePage.tsx');
      return { Component: m.SurveyResponsePage, loader: m.surveyLoader };
    },
  },
} satisfies Record<string, RouteObject>;

const studentRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => {
      const m = await import('../pages/HomePage.tsx');
      return { Component: m.HomePage, loader: m.homeLoader };
    },
  },
  {
    path: 'activities',
    lazy: async () => {
      const m = await import('../features/activities/ActivityListPage.tsx');
      return { Component: m.ActivityListPage, loader: m.activityListLoader };
    },
  },
  {
    path: 'activities/:activityId',
    lazy: async () => {
      const m = await import('../features/activities/ActivityDetailPage.tsx');
      return { Component: m.ActivityDetailPage, loader: m.activityLoader };
    },
  },
  {
    path: 'surveys',
    lazy: async () => {
      const m = await import('../features/surveys/SurveyListPage.tsx');
      return { Component: m.SurveyListPage, loader: m.surveyListLoader };
    },
  },
  sharedPages.surveyResponse,
  ...['inquiries', 'inquiries/new'].map((path): RouteObject => ({
    path,
    lazy: async () => {
      const m = await import('../features/inquiries/InquiryPage.tsx');
      return { Component: m.InquiryPage, loader: m.inquiryListLoader };
    },
  })),
  sharedPages.records,
  sharedPages.record,
];

const councilRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => {
      const m = await import('../pages/CouncilHomePage.tsx');
      return { Component: m.CouncilHomePage, loader: m.councilHomeLoader };
    },
  },
  {
    path: 'activities',
    lazy: async () => {
      const m = await import('../features/activities/ActivityListPage.tsx');
      return {
        Component: m.ActivityListPage,
        loader: m.councilActivityListLoader,
      };
    },
  },
  {
    path: 'activities/new',
    lazy: async () => {
      const m = await import('../features/activities/ActivityNewPage.tsx');
      return { Component: m.ActivityNewPage, loader: m.activityNewLoader };
    },
  },
  {
    path: 'activities/:activityId',
    lazy: async () => {
      const m = await import('../features/activities/ActivityDetailPage.tsx');
      return {
        Component: m.ActivityDetailPage,
        loader: m.councilActivityLoader,
      };
    },
  },
  {
    path: 'tasks',
    lazy: async () => {
      const m = await import('../features/tasks/TaskListPage.tsx');
      return { Component: m.TaskListPage, loader: m.taskListLoader };
    },
  },
  {
    path: 'tasks/new',
    lazy: async () => {
      const m = await import('../features/tasks/TaskNewPage.tsx');
      return { Component: m.TaskNewPage, loader: m.taskNewLoader };
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
    path: 'surveys',
    lazy: async () => {
      const m = await import('../features/surveys/SurveyListPage.tsx');
      return {
        Component: m.SurveyListPage,
        loader: m.councilSurveyListLoader,
      };
    },
  },
  sharedPages.surveyResponse,
  {
    path: 'surveys/:surveyId/edit',
    lazy: async () => {
      const m = await import('../features/survey-admin/SurveyEditPage.tsx');
      return { Component: m.SurveyEditPage, loader: m.surveyEditLoader };
    },
  },
  {
    path: 'surveys/:surveyId/results',
    lazy: async () => {
      const m = await import('../features/survey-admin/SurveyResultsPage.tsx');
      return { Component: m.SurveyResultsPage, loader: m.surveyResultsLoader };
    },
  },
  {
    path: 'inquiries',
    lazy: async () => {
      const m = await import('../features/inquiries/InquiryInboxPage.tsx');
      return { Component: m.InquiryInboxPage, loader: m.inquiryInboxLoader };
    },
  },
  sharedPages.records,
  sharedPages.record,
  {
    // 구성원·권한: GNB에는 없고 주소로만 들어간다.
    path: 'members',
    lazy: async () => {
      const m = await import('../features/members/MemberListPage.tsx');
      return { Component: m.MemberListPage, loader: m.memberListLoader };
    },
  },
];

export const router = createBrowserRouter([
  {
    element: <AppLayout mode="visitor" />,
    HydrateFallback: () => null,
    children: [{ errorElement: <RouteErrorPage />, children: visitorRoutes }],
  },
  {
    path: '/',
    element: <AppLayout mode="student" />,
    HydrateFallback: () => null,
    children: [{ errorElement: <RouteErrorPage />, children: studentRoutes }],
  },
  {
    path: 'work',
    // 학생회 임원만 들어온다.
    loader: () => (getSession().councilRole ? null : redirect('/')),
    element: <AppLayout mode="council" />,
    HydrateFallback: () => null,
    children: [{ errorElement: <RouteErrorPage />, children: councilRoutes }],
  },
  ...devRoutes,
  {
    path: '*',
    lazy: async () => ({
      Component: (await import('../pages/NotFoundPage.tsx')).NotFoundPage,
    }),
  },
]);

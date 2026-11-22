import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router';
import { RouteErrorPage } from '../pages/RouteErrorPage.tsx';
import { AppLayout } from './AppLayout.tsx';
import {
  redirectSignedIn,
  requireCouncil,
  requireMember,
  requirePending,
} from './session.ts';

type Guard = (args: LoaderFunctionArgs) => Response | null;

/**
 * 부모 라우트의 가드와 자식 화면의 로더는 동시에 돈다. 가드에 걸리는 사람에게는
 * 화면 로더가 API를 부르지 않도록, 화면 로더 앞에서도 같은 가드를 확인한다.
 */
function guarded(routes: RouteObject[], guard: Guard): RouteObject[] {
  return routes.map((route) => {
    const { lazy } = route;
    if (typeof lazy !== 'function') return route;
    return {
      ...route,
      lazy: async () => {
        const loaded = await lazy();
        const { loader } = loaded;
        if (typeof loader !== 'function') return loaded;
        return {
          ...loaded,
          loader: (args: LoaderFunctionArgs) => guard(args) ?? loader(args),
        };
      },
    } as RouteObject;
  });
}

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
    loader: redirectSignedIn,
    lazy: async () => ({
      Component: (await import('../features/auth/AuthPages.tsx')).LoginPage,
    }),
  },
  {
    path: 'login/code',
    loader: redirectSignedIn,
    lazy: async () => {
      const { CodePage } = await import('../features/auth/AuthPages.tsx');
      return { Component: () => <CodePage flow="login" /> };
    },
  },
  {
    path: 'signup',
    loader: redirectSignedIn,
    lazy: async () => ({
      Component: (await import('../features/auth/AuthPages.tsx')).SignupPage,
    }),
  },
  {
    path: 'signup/code',
    loader: redirectSignedIn,
    lazy: async () => {
      const { CodePage } = await import('../features/auth/AuthPages.tsx');
      return { Component: () => <CodePage flow="signup" /> };
    },
  },
  {
    path: 'signup/info',
    loader: requirePending,
    lazy: async () => ({
      Component: (await import('../features/auth/AuthPages.tsx'))
        .SignupInfoPage,
    }),
  },
  ...(['signup', 'login'] as const).map((flow): RouteObject => ({
    // Google이 돌려보내는 주소. 백엔드의 GOOGLE_*_REDIRECT_URI와 같아야 한다.
    path: `google/${flow}/callback`,
    lazy: async () => {
      const { GoogleCallbackPage } =
        await import('../features/auth/AuthPages.tsx');
      return { Component: () => <GoogleCallbackPage flow={flow} /> };
    },
  })),
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
    // 로그인하고 회원가입 정보까지 입력한 사람만
    loader: requireMember,
    element: <AppLayout mode="student" />,
    HydrateFallback: () => null,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: guarded(studentRoutes, requireMember),
      },
    ],
  },
  {
    path: 'work',
    // 학생회 임원(isStudentCouncil)만 들어온다.
    loader: requireCouncil,
    element: <AppLayout mode="council" />,
    HydrateFallback: () => null,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: guarded(councilRoutes, requireCouncil),
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

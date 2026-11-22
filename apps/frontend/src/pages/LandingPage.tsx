import { useLoaderData } from 'react-router';
import { ButtonLink } from '../components/ui/index.ts';
import { listPublicActivities } from '../features/activities/api.ts';
import { ActivityStatusCard } from '../features/activities/ActivityStatusCard.tsx';
import * as S from './homeStyles.ts';

/** 랜딩 (LND-01~03). 로그인하지 않은 방문자에게 보이는 첫 화면. */
export async function landingLoader() {
  return listPublicActivities();
}

export function LandingPage() {
  const activities = useLoaderData<typeof landingLoader>();

  return (
    <S.Landing>
      <title>디미고 학생회</title>
      <S.Hero>
        <div>
          <h1>{'디미고 학생회는\n여러분을 위해\n일합니다.'}</h1>
          <p>학생회가 일하는 과정을 실시간으로 확인하세요.</p>
        </div>
        <div>
          <ButtonLink
            size="large"
            theme="accent"
            variant="primary"
            to="/inquiries/new"
          >
            질의하기
          </ButtonLink>
          <ButtonLink size="large" to="/surveys">
            진행 중인 설문
          </ButtonLink>
        </div>
      </S.Hero>
      <ActivityStatusCard
        title="활동 현황"
        activities={activities}
        moreTo="/activities"
        moreLabel="전체 보기"
        activityTo={(activity) => `/activities/${activity.id}`}
      />
    </S.Landing>
  );
}

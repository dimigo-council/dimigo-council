import { useLoaderData } from 'react-router';
import { PlusIcon } from '../app/icons.tsx';
import { getSession, useSession } from '../app/session.ts';
import { Badge } from '../dimi-ui-kit/index.ts';
import {
  ButtonLink,
  Card,
  CardHead,
  CardTitle,
  MoreLink,
  Stack,
  statusTone,
  TwoColumn,
} from '../components/ui/index.ts';
import { formatShortDate } from '../lib/date.ts';
import { listPublicActivities } from '../features/activities/api.ts';
import { ActivityStatusCard } from '../features/activities/ActivityStatusCard.tsx';
import { listStudentInquiries } from '../features/inquiries/api.ts';
import { listSurveys } from '../features/surveys/api.ts';
import {
  openByDeadline,
  UrgentSurveyCard,
} from '../features/surveys/UrgentSurveyCard.tsx';
import * as S from './homeStyles.ts';

/** 학생 홈 (HOM-01~04) */
export async function homeLoader() {
  const session = getSession();
  const [activities, surveys, inquiries] = await Promise.all([
    listPublicActivities(),
    listSurveys(),
    listStudentInquiries(session.name),
  ]);
  return {
    activities,
    surveys,
    myInquiries: inquiries.filter((inquiry) => inquiry.mine),
  };
}

export function HomePage() {
  const { activities, surveys, myInquiries } =
    useLoaderData<typeof homeLoader>();
  const session = useSession();

  const canJoin = openByDeadline(surveys).filter(
    (survey) => survey.myStatus !== 'submitted',
  ).length;
  const answered = myInquiries.filter(
    (inquiry) => inquiry.status === '답변 완료',
  ).length;

  return (
    <>
      <title>홈 | 디미고 학생회</title>
      <S.Greeting>
        <div>
          <h1>안녕하세요, {session.name}님</h1>
          <p>
            참여할 수 있는 설문이 {canJoin}개 있고, 내 질의 {answered}건에
            답변이 달렸어요.
          </p>
        </div>
        <ButtonLink theme="accent" variant="primary" to="/inquiries/new">
          <PlusIcon />
          질의하기
        </ButtonLink>
      </S.Greeting>

      <TwoColumn>
        <ActivityStatusCard
          activities={activities}
          moreTo="/activities"
          activityTo={(activity) => `/activities/${activity.id}`}
        />
        <Stack>
          <UrgentSurveyCard
            surveys={surveys}
            respondTo={(survey) => `/surveys/${survey.id}`}
          />
          <Card aria-labelledby="my-inquiries-title">
            <CardHead>
              <CardTitle id="my-inquiries-title">내 질의</CardTitle>
              <MoreLink size="small" to="/inquiries?mine">
                질문과 건의
              </MoreLink>
            </CardHead>
            {myInquiries.length > 0 ? (
              <S.SideList>
                {myInquiries.slice(0, 3).map((inquiry) => (
                  <S.InquiryItem key={inquiry.id}>
                    <S.ItemLink to={`/inquiries?mine&id=${inquiry.id}`}>
                      {inquiry.title}
                    </S.ItemLink>
                    <S.ItemMeta>
                      <Badge theme={statusTone.inquiry[inquiry.status]}>
                        {inquiry.status}
                      </Badge>
                      {[
                        inquiry.department ?? '담당자 배정 대기',
                        formatShortDate(inquiry.submittedAt),
                      ].join(' · ')}
                    </S.ItemMeta>
                  </S.InquiryItem>
                ))}
              </S.SideList>
            ) : (
              <S.Empty>아직 보낸 질의가 없어요.</S.Empty>
            )}
          </Card>
        </Stack>
      </TwoColumn>
    </>
  );
}

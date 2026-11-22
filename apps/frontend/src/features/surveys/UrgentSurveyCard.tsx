import styled from 'styled-components';
import {
  Card,
  CardAside,
  CardHead,
  CardTitle,
} from '../../components/ui/index.ts';
import { Empty } from '../activities/styles.ts';
import { SurveyCard } from './SurveyCard.tsx';
import type { SurveySummary } from './types.ts';

/* Figma "Deadline Survey": 제목 줄과 카드 사이 16 */
const Head = styled(CardHead)`
  margin-bottom: ${({ theme }) => theme.spacing[400]};
`;

/** 진행 중인 설문을 마감 임박순으로 */
export function openByDeadline(surveys: SurveySummary[]) {
  return surveys
    .filter((survey) => !survey.isClosed)
    .sort((a, b) => a.closesAt.localeCompare(b.closesAt));
}

/** 홈 오른쪽 "마감 임박 설문" 카드 */
export function UrgentSurveyCard({
  surveys,
  respondTo,
}: {
  surveys: SurveySummary[];
  respondTo: (survey: SurveySummary) => string;
}) {
  const open = openByDeadline(surveys);
  const first = open[0];
  return (
    <Card aria-labelledby="urgent-survey-title">
      <Head>
        <CardTitle id="urgent-survey-title">마감 임박 설문</CardTitle>
        <CardAside>{open.length}개 진행 중</CardAside>
      </Head>
      {first ? (
        <SurveyCard survey={first} respondTo={respondTo(first)} plain />
      ) : (
        <Empty>지금 진행 중인 설문이 없어요.</Empty>
      )}
    </Card>
  );
}

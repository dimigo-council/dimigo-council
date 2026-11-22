import { Badge, Button } from '../../dimi-ui-kit/index.ts';
import { ButtonLink, TextButtonLink } from '../../components/ui/index.ts';
import { daysLeft, formatDday, participation } from './format.ts';
import type { SurveySummary } from './types.ts';
import * as S from './styles.ts';

/**
 * 설문 카드: D-n, 제목, 설명, 참여율과 참여하기·결과 보기 버튼.
 * 학생회도 학생과 같은 화면으로 응답한다. resultsTo가 없으면 결과 보기는 누를 수 없다
 * (학생용 설문 결과 화면은 아직 설계되지 않았다. 기능 명세서 7장).
 */
export function SurveyCard({
  survey,
  respondTo,
  resultsTo,
  plain = false,
  headingLevel = 3,
}: {
  survey: SurveySummary;
  respondTo: string;
  resultsTo?: string;
  /** 다른 카드 안에 놓일 때 테두리를 빼고 그린다 (홈 마감 임박 설문) */
  plain?: boolean;
  headingLevel?: 2 | 3;
}) {
  const rate = Math.round(participation(survey) * 100);
  const days = daysLeft(survey.closesAt);
  const titleId = `survey-${survey.id}-title`;

  return (
    <S.SurveyCardRoot $plain={plain} aria-labelledby={titleId}>
      <div>
        {survey.isClosed ? (
          <Badge>마감</Badge>
        ) : (
          <Badge theme="accent">{formatDday(days)}</Badge>
        )}
      </div>
      <S.SurveyCardTitle as={`h${headingLevel}`} id={titleId}>
        {survey.title}
      </S.SurveyCardTitle>
      <S.SurveyCardIntro>{survey.intro}</S.SurveyCardIntro>
      <S.SurveyRate>
        <S.SurveyRateHead>
          <span>참여율</span>
          <strong>{rate}%</strong>
        </S.SurveyRateHead>
        <S.SurveyRateTrack
          role="progressbar"
          aria-label={`${survey.title} 참여율`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rate}
        >
          <S.SurveyRateBar
            $closed={survey.isClosed}
            style={{ width: `${rate}%` }}
          />
        </S.SurveyRateTrack>
      </S.SurveyRate>
      {survey.isClosed ? (
        resultsTo ? (
          <ButtonLink fullWidth to={resultsTo}>
            결과 보기
          </ButtonLink>
        ) : (
          <Button fullWidth disabled title="결과 화면 준비 중">
            결과 보기
          </Button>
        )
      ) : survey.myStatus === 'submitted' ? (
        <Button fullWidth disabled>
          응답 완료
        </Button>
      ) : (
        <ButtonLink theme="accent" fullWidth to={respondTo}>
          {!survey.canRespond
            ? '설문 보기'
            : survey.myStatus === 'draft'
              ? '이어서 참여하기'
              : '참여하기'}
        </ButtonLink>
      )}
      {!survey.isClosed && resultsTo && (
        <S.SurveyCardMore>
          <TextButtonLink size="small" to={resultsTo}>
            중간 결과 보기
          </TextButtonLink>
        </S.SurveyCardMore>
      )}
    </S.SurveyCardRoot>
  );
}

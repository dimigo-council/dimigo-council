import { useState, type ReactNode } from 'react';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Button, TextButton } from '../../dimi-ui-kit/index.ts';
import { Breadcrumbs, ButtonLink } from '../../components/ui/index.ts';
import { formatShortDate } from '../../lib/date.ts';
import { activityNo } from '../activities/format.ts';
import { daysLeft } from '../surveys/format.ts';
import type { Question, TextQuestion } from '../surveys/types.ts';
import { getSurveyResults } from './api.ts';
import { hasChoices, questionTypeLabel } from './format.ts';
import {
  formatRatio,
  responsesCsv,
  responsesIncludedInAnalysis,
  shareOf,
  summarizeChoice,
  textAnswers,
} from './results.ts';
import type { SurveyResponse, SurveyResults } from './types.ts';
import * as S from './styles.ts';

export async function surveyResultsLoader({ params }: LoaderFunctionArgs) {
  return getSurveyResults(params.surveyId ?? '');
}

/** 단답형·장문형은 처음에 이만큼만 보여주고 "더보기"로 늘린다. */
const TEXT_PAGE = 3;

function downloadCsv({ survey, responses }: SurveyResults) {
  const blob = new Blob([responsesCsv(survey, responses)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${survey.title} 응답.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function periodText(opensAt?: string, closesAt?: string) {
  if (!opensAt || !closesAt) return '응답 기간 미정';
  return `응답 기간 ${formatShortDate(opensAt)}–${formatShortDate(closesAt)}`;
}

function remainingText(closesAt?: string, closedAt?: string) {
  if (closedAt || !closesAt) return '마감';
  const days = daysLeft(closesAt);
  if (days < 0) return '마감';
  return days === 0 ? '오늘 마감' : `${days}일`;
}

/** 학생회 / 설문 결과 (SRV-R2) */
export function SurveyResultsPage() {
  const results = useLoaderData<typeof surveyResultsLoader>();
  const { survey } = results;
  const responses = responsesIncludedInAnalysis(results.responses);
  const rate = shareOf(responses.length, survey.target);

  return (
    <>
      <Breadcrumbs
        items={[{ label: '설문', to: '/work/surveys' }, { label: '설문 결과' }]}
      />
      <PageHeader title="설문 결과" tall />
      <S.Sheet aria-labelledby="survey-summary-title">
        <h2 id="survey-summary-title">{survey.title}</h2>
        <S.SummaryText>
          {periodText(survey.opensAt, survey.closesAt)} · 총{' '}
          {survey.questions.length}문항
        </S.SummaryText>
        <S.Stats>
          <div>
            <dt>응답자</dt>
            <dd>{responses.length}명</dd>
          </div>
          <div>
            <dt>참여율</dt>
            <dd>{formatRatio(rate)}</dd>
          </div>
          <div>
            <dt>마감까지</dt>
            <dd>{remainingText(survey.closesAt, survey.closedAt)}</dd>
          </div>
        </S.Stats>
      </S.Sheet>

      {survey.questions.map((question, index) => (
        <QuestionResult
          key={question.id}
          number={index + 1}
          question={question}
          responses={responses}
        />
      ))}

      <S.PageActions>
        <Button onClick={() => downloadCsv(results)}>결과 내보내기</Button>
        {survey.activity && (
          <ButtonLink
            theme="accent"
            variant="primary"
            to={`/work/activities/${survey.activity.id}`}
          >
            활동 {activityNo(survey.activity.id)} 보기
          </ButtonLink>
        )}
      </S.PageActions>
    </>
  );
}

function QuestionResult({
  number,
  question,
  responses,
}: {
  number: number;
  question: Question;
  responses: SurveyResponse[];
}) {
  const titleId = `result-${question.id}-title`;
  const heading = (answered: number, note?: string) => (
    <S.QuestionHeading>
      <h2 id={titleId}>
        문항 {number} · {question.title}
      </h2>
      <p>
        {[questionTypeLabel[question.type], `응답 ${answered}개`, note]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </S.QuestionHeading>
  );

  if (hasChoices(question)) {
    const summary = summarizeChoice(question, responses);
    return (
      <S.Sheet aria-labelledby={titleId}>
        {heading(
          summary.answered,
          question.type === 'multiple'
            ? '응답자 대비 비율이라 합계가 100%를 넘을 수 있습니다'
            : undefined,
        )}
        {summary.rows.map((row) => (
          <S.ResultRow key={row.label}>
            <span>{row.label}</span>
            <S.ResultBar
              role="img"
              aria-label={`${row.label} ${formatRatio(row.ratio)}, ${row.count}명`}
            >
              <span style={{ width: formatRatio(row.ratio) }} />
            </S.ResultBar>
            <span>{formatRatio(row.ratio)}</span>
          </S.ResultRow>
        ))}
      </S.Sheet>
    );
  }

  return (
    <TextResult
      question={question}
      answers={textAnswers(question, responses)}
      titleId={titleId}
      heading={heading}
    />
  );
}

function TextResult({
  question,
  answers,
  titleId,
  heading,
}: {
  question: TextQuestion;
  answers: string[];
  titleId: string;
  heading: (answered: number) => ReactNode;
}) {
  const [shown, setShown] = useState(TEXT_PAGE);
  return (
    <S.Sheet aria-labelledby={titleId}>
      {heading(answers.length)}
      {answers.length > 0 ? (
        <S.TextAnswers $long={question.type === 'long'}>
          {answers.slice(0, shown).map((answer, index) => (
            <li key={index}>{answer}</li>
          ))}
        </S.TextAnswers>
      ) : (
        <S.Empty>아직 적힌 답이 없어요.</S.Empty>
      )}
      {answers.length > shown && (
        <S.MoreRow>
          <TextButton onClick={() => setShown(shown + TEXT_PAGE * 3)}>
            더보기
          </TextButton>
        </S.MoreRow>
      )}
    </S.Sheet>
  );
}

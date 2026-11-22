import { useState, type FormEvent } from 'react';
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useBasePath } from '../../app/mode.ts';
import { Button } from '../../dimi-ui-kit/index.ts';
import { Breadcrumbs } from '../../components/ui/index.ts';
import { formatShortDate } from '../../lib/date.ts';
import { getSurvey, saveDraft, submitResponse } from './api.ts';
import { isAnswered } from './format.ts';
import { QuestionCard } from './QuestionCard.tsx';
import type {
  Answers,
  AnswerValue,
  Question,
  SurveyWithResponse,
} from './types.ts';
import * as S from './styles.ts';

export async function surveyLoader({ params }: LoaderFunctionArgs) {
  return getSurvey(params.surveyId ?? '');
}

/** 한 화면에 보이는 문항 수 (Figma: 1–2 문항, 3–4 문항) */
const PER_PAGE = 2;

export function SurveyResponsePage() {
  const survey = useLoaderData<typeof surveyLoader>();
  // 다른 설문으로 이동하면 입력 상태를 새로 시작한다.
  return <SurveyForm key={survey.id} survey={survey} />;
}

function answerText(value: AnswerValue | undefined) {
  if (!isAnswered(value)) return '답하지 않음';
  return Array.isArray(value) ? value.join(', ') : value;
}

/** 학생 / 설문 참여 (SRV-C3). 두 문항씩 넘기고, 마지막에 답변을 확인한 뒤 제출한다. */
function SurveyForm({ survey }: { survey: SurveyWithResponse }) {
  const navigate = useNavigate();
  const base = useBasePath();
  const [answers, setAnswers] = useState<Answers>(survey.myAnswers);
  const [page, setPage] = useState(0);
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const { questions } = survey;
  const total = questions.length;
  const pageCount = Math.ceil(total / PER_PAGE);
  // 마지막 페이지 다음은 답변 확인 (설계되지 않은 화면, 기능 명세서 7장)
  const reviewing = page === pageCount;
  const shown = questions.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const missing = (list: Question[]) =>
    list.filter((q) => q.required && !isAnswered(answers[q.id]));
  const editing = survey.myStatus === 'submitted';

  const meta = `${survey.isClosed ? '마감' : '진행 중'} · ${total}문항 · ${formatShortDate(survey.closesAt)} 마감`;

  const goTo = (next: number) => {
    setPage(next);
    setTried(false);
    window.scrollTo({ top: 0 });
  };

  const onNext = () => {
    if (!survey.isClosed && missing(shown).length > 0) {
      setTried(true);
      return;
    }
    if (!editing && !survey.isClosed) void saveDraft(survey.id, answers);
    goTo(page + 1);
  };

  const onPrevious = async () => {
    if (page === 0) {
      if (!editing && !survey.isClosed) await saveDraft(survey.id, answers);
      await navigate(base('/surveys'));
      return;
    }
    goTo(page - 1);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reviewing) {
      onNext();
      return;
    }
    if (survey.isClosed || status === 'saving') return;
    setStatus('saving');
    try {
      await submitResponse(survey.id, answers);
      await navigate(base('/surveys'));
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: '설문', to: base('/surveys') },
          { label: '설문 참여' },
        ]}
      />
      <PageHeader title="설문 참여" tall />
      <S.SurveySheet
        onSubmit={onSubmit}
        noValidate
        aria-labelledby="survey-title"
      >
        <S.SurveyMeta>{meta}</S.SurveyMeta>
        <S.SurveyTitle id="survey-title">{survey.title}</S.SurveyTitle>
        {survey.intro && <S.SurveyLead>{survey.intro}</S.SurveyLead>}

        {reviewing ? (
          <S.ReviewList aria-label="내 답변">
            {questions.map((question, index) => (
              <div key={question.id}>
                <dt>
                  {index + 1} / {total} · {question.title}
                </dt>
                <dd>{answerText(answers[question.id])}</dd>
              </div>
            ))}
          </S.ReviewList>
        ) : (
          shown.map((question, index) => {
            const number = page * PER_PAGE + index + 1;
            const unanswered =
              tried && question.required && !isAnswered(answers[question.id]);
            return (
              <QuestionCard
                key={question.id}
                question={question}
                number={number}
                total={total}
                value={answers[question.id]}
                disabled={survey.isClosed}
                error={unanswered ? '이 문항에 답해 주세요.' : undefined}
                onChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: value }))
                }
              />
            );
          })
        )}
        {status === 'error' && (
          <S.QuestionError role="alert">
            제출하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </S.QuestionError>
        )}
      </S.SurveySheet>

      <S.SurveyActions>
        <Button onClick={() => void onPrevious()}>이전</Button>
        {reviewing ? (
          !survey.isClosed && (
            <Button
              theme="accent"
              variant="primary"
              disabled={status === 'saving'}
              onClick={(event) => void onSubmit(event)}
            >
              {editing ? '수정 제출하기' : '제출하기'}
            </Button>
          )
        ) : (
          <Button theme="accent" variant="primary" onClick={onNext}>
            {page === pageCount - 1 ? '답변 확인' : '다음 문항'}
          </Button>
        )}
      </S.SurveyActions>
      <S.SurveyNote>
        {survey.isClosed
          ? '마감된 설문입니다. 응답을 새로 내거나 고칠 수 없습니다.'
          : reviewing
            ? '제출한 뒤에도 마감 전까지 응답을 고칠 수 있습니다.'
            : `${total}문항을 모두 완료한 뒤 답변을 확인하고 제출할 수 있습니다.`}
      </S.SurveyNote>
    </>
  );
}

import { useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { ChevronLeftIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import { Button, Notice } from '../../components/kit/index.ts';
import { formatDate } from '../../lib/date.ts';
import { getSurvey, saveDraft, submitResponse } from './api.ts';
import { estimatedMinutes, identityNotice, isAnswered } from './format.ts';
import { QuestionCard } from './QuestionCard.tsx';
import type { Answers, AnswerValue, SurveyWithResponse } from './types.ts';
import './surveys.css';

export async function surveyLoader({ params }: LoaderFunctionArgs) {
  return getSurvey(params.surveyId ?? '');
}

export function SurveyResponsePage() {
  const survey = useLoaderData<typeof surveyLoader>();
  // 다른 설문으로 이동하면 입력 상태를 새로 시작한다.
  return <SurveyForm key={survey.id} survey={survey} />;
}

function SurveyForm({ survey }: { survey: SurveyWithResponse }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>(survey.myAnswers);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const total = survey.questions.length;
  const answered = survey.questions.filter((q) =>
    isAnswered(answers[q.id]),
  ).length;
  const missing = survey.questions.flatMap((q, i) =>
    q.required && !isAnswered(answers[q.id]) ? [i + 1] : [],
  );
  const canSubmit = !survey.isClosed && missing.length === 0;
  const editing = survey.myStatus === 'submitted';

  const setAnswer = (id: string, value: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || status === 'saving') return;
    setStatus('saving');
    try {
      await submitResponse(survey.id, answers);
      await navigate('/surveys');
    } catch {
      setStatus('error');
    }
  };

  const onLater = async () => {
    if (!editing && !survey.isClosed) {
      await saveDraft(survey.id, answers);
    }
    await navigate('/surveys');
  };

  return (
    <div className="survey-page">
      <Link className="back-link" to="/surveys">
        <ChevronLeftIcon />
        설문 목록
      </Link>

      <PageHeader
        title={survey.title}
        description={
          <span className="meta-row">
            <span>{survey.department}</span>
            <span>{survey.audience} 대상</span>
            <span>{formatDate(survey.closesAt, true)} 마감</span>
            <span>
              {total}문항, 약 {estimatedMinutes(total)}분
            </span>
          </span>
        }
      />

      <div className="survey-intro">
        {survey.isClosed ? (
          <Notice tone="warn">
            마감된 설문입니다. 응답을 새로 내거나 고칠 수 없습니다.
          </Notice>
        ) : (
          <Notice>{identityNotice[survey.identity]}</Notice>
        )}
        <Meter
          value={answered}
          max={total}
          label="응답한 문항"
          text={`${answered} / ${total} 응답`}
        />
      </div>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className="survey-questions" disabled={survey.isClosed}>
          <legend className="visually-hidden">{survey.title} 문항</legend>
          {survey.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
            />
          ))}
        </fieldset>

        {status === 'error' && (
          <Notice tone="warn" role="alert" className="survey-error">
            제출하지 못했습니다. 잠시 후 다시 시도해주세요.
          </Notice>
        )}

        <div className="survey-submit">
          <p className="survey-submit__hint" aria-live="polite">
            {survey.isClosed
              ? '마감된 설문입니다.'
              : missing.length > 0
                ? `필수 문항 ${missing.join(', ')}번에 답하면 제출할 수 있습니다.`
                : '제출한 뒤에도 마감 전까지 응답을 고칠 수 있습니다.'}
          </p>
          <div className="survey-submit__actions">
            <Button onClick={onLater}>
              {editing || survey.isClosed ? '목록으로' : '나중에 하기'}
            </Button>
            {!survey.isClosed && (
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit || status === 'saving'}
              >
                {editing ? '수정 제출하기' : '제출하기'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Badge, Button, Notice } from '../../components/kit/index.ts';
import { formatDate } from '../../lib/date.ts';
import { identityLabel, isAnswered } from '../surveys/format.ts';
import type {
  AnswerValue,
  MultipleChoiceQuestion,
  Question,
  ScaleQuestion,
  SingleChoiceQuestion,
} from '../surveys/types.ts';
import { deleteResponse, setResponseExcluded } from './api.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { questionTypeLabel } from './format.ts';
import {
  formatDuration,
  hasChosenAnswer,
  median,
  respondentLabel,
  responsesIncludedInAnalysis,
  scaleSteps,
  suspiciouslyFastSeconds,
} from './results.ts';
import { StepButton, wrapIndex } from './StepButton.tsx';
import { useResults } from './SurveyResultsLayout.tsx';
import type { AdminSurvey, SurveyResponse } from './types.ts';

function ChosenMark() {
  return <span className="visually-hidden">, 고름</span>;
}

function isOptionChosen(value: AnswerValue, option: string) {
  if (Array.isArray(value)) return value.includes(option);
  return value === option;
}

function ChoiceAnswer({
  question,
  value,
}: {
  question: SingleChoiceQuestion | MultipleChoiceQuestion;
  value: AnswerValue;
}) {
  const boxShape = question.type === 'single' ? 'radio' : 'check';
  return (
    <ul className="answer-view__options">
      {question.options.map((option) => {
        const isChosen = isOptionChosen(value, option);
        return (
          <li key={option} data-picked={isChosen}>
            <span
              className={`choice__box choice__box--${boxShape}`}
              aria-hidden="true"
            />
            {option}
            {isChosen && <ChosenMark />}
          </li>
        );
      })}
    </ul>
  );
}

function ScaleAnswer({
  question,
  value,
}: {
  question: ScaleQuestion;
  value: AnswerValue;
}) {
  return (
    <div className="scale">
      <ol className="answer-view__scale">
        {scaleSteps(question).map((step) => {
          const isChosen = value === step;
          return (
            <li key={step} data-picked={isChosen}>
              {step}
              {isChosen && <ChosenMark />}
            </li>
          );
        })}
      </ol>
      <div className="scale__labels" aria-hidden="true">
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
    </div>
  );
}

function AnswerBody({
  question,
  value,
}: {
  question: Question;
  value: AnswerValue | undefined;
}) {
  if (value === undefined || !isAnswered(value)) {
    return <p className="answer-view__empty">응답하지 않음</p>;
  }
  if (question.type === 'scale') {
    return <ScaleAnswer question={question} value={value} />;
  }
  if (question.type === 'text') {
    return <p className="answer-view__text">{String(value)}</p>;
  }
  return <ChoiceAnswer question={question} value={value} />;
}

/** 응답자가 고른 답을 설문지 모양 그대로, 고칠 수 없게 보여준다 */
function AnswerView({
  question,
  index,
  value,
}: {
  question: Question;
  index: number;
  value: AnswerValue | undefined;
}) {
  const titleId = `answer-${question.id}`;
  return (
    <section className="question answer-view" aria-labelledby={titleId}>
      <h2 className="question__title" id={titleId}>
        <span className="question__number">{index + 1}</span>
        <span>
          {question.title}
          <span className="answer-view__type">
            {questionTypeLabel[question.type]}
          </span>
        </span>
      </h2>
      <AnswerBody question={question} value={value} />
    </section>
  );
}

/** 질문 탭의 "응답 보기"로 들어오면 그 문항에서 그 답을 고른 응답만 넘긴다. */
interface AnswerFilter {
  questionId: string;
  questionNumber: number;
  answer: string;
}

function answerFilterFrom(
  survey: AdminSurvey,
  searchParams: URLSearchParams,
): AnswerFilter | undefined {
  const answer = searchParams.get('a');
  if (answer === null) return undefined;

  const questionId = searchParams.get('q');
  const questionIndex = survey.questions.findIndex(
    (question) => question.id === questionId,
  );
  if (questionIndex === -1) return undefined;

  return {
    questionId: survey.questions[questionIndex].id,
    questionNumber: questionIndex + 1,
    answer,
  };
}

function responsesMatching(
  responses: SurveyResponse[],
  filter: AnswerFilter | undefined,
) {
  if (!filter) return responses;
  return responses.filter((response) =>
    hasChosenAnswer(response, filter.questionId, filter.answer),
  );
}

function positionOfResponse(
  responses: SurveyResponse[],
  responseNumber: number,
) {
  const index = responses.findIndex(
    (response) => response.number === responseNumber,
  );
  if (index === -1) return 0;
  return index;
}

function ResponsePager({
  position,
  total,
  response,
  filter,
  onMove,
}: {
  position: number;
  total: number;
  response: SurveyResponse;
  filter: AnswerFilter | undefined;
  onMove: (position: number) => void;
}) {
  return (
    <div className="result-pager">
      <StepButton
        direction="previous"
        label="이전 응답"
        onClick={() => onMove(position - 1)}
      />
      <span className="result-pager__position">
        응답 <strong>{position + 1}</strong> / {total}
      </span>
      <StepButton
        direction="next"
        label="다음 응답"
        onClick={() => onMove(position + 1)}
      />
      {filter && (
        <span className="result-pager__filter">
          Q{filter.questionNumber} 답이 ‘{filter.answer}’인 응답만
          <Link className="text-link" to={`?n=${response.number}`}>
            전체 보기
          </Link>
        </span>
      )}
      {response.excluded && <Badge tone="warn">분석에서 뺌</Badge>}
    </div>
  );
}

function SuspiciouslyFastNotice({
  durationSeconds,
  typicalDurationSeconds,
}: {
  durationSeconds: number;
  typicalDurationSeconds: number;
}) {
  return (
    <Notice tone="warn">
      응답 시간이 {formatDuration(durationSeconds)}로 보통(
      {formatDuration(typicalDurationSeconds)})보다 훨씬 짧습니다. 읽지 않고
      고른 응답일 수 있어요. 분석에서 빼도 응답은 지워지지 않습니다.
    </Notice>
  );
}

function ResponseInfoPanel({
  survey,
  response,
  isBusy,
  onToggleExcluded,
  onRequestDelete,
}: {
  survey: AdminSurvey;
  response: SurveyResponse;
  isBusy: boolean;
  onToggleExcluded: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <section className="panel" aria-labelledby="response-info">
      <h2 className="panel__title" id="response-info">
        응답 #{response.number}
      </h2>
      <dl className="info-list">
        <dt>제출</dt>
        <dd>{formatDate(response.submittedAt, true)}</dd>
        <dt>응답 시간</dt>
        <dd>{formatDuration(response.durationSeconds)}</dd>
        <dt>응답자</dt>
        <dd>{respondentLabel(survey, response)}</dd>
        <dt>분석</dt>
        <dd>{response.excluded ? '뺌' : '포함'}</dd>
      </dl>
      <div className="panel__body result-response-actions">
        <Button block disabled={isBusy} onClick={onToggleExcluded}>
          {response.excluded ? '분석에 다시 넣기' : '분석에서 빼기'}
        </Button>
        <Button
          variant="danger"
          block
          disabled={isBusy}
          onClick={onRequestDelete}
        >
          이 응답 삭제
        </Button>
      </div>
    </section>
  );
}

function respondentPrivacyNotice(survey: AdminSurvey) {
  if (survey.identity === 'anonymous') {
    return `${identityLabel.anonymous} 설문이라 응답자는 학년만 보입니다.`;
  }
  return '응답자 정보는 응답 대상인지 확인하는 데만 씁니다. 결과를 공유할 때는 CSV의 학번·이름 열을 지워주세요.';
}

/** 개별 보기 탭: 응답을 한 명씩 넘겨 본다 */
export function SurveyResultsResponsePage() {
  const { survey, responses, reload } = useResults();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isBusy, setIsBusy] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const filter = answerFilterFrom(survey, searchParams);
  const browsableResponses = responsesMatching(responses, filter);
  const requestedNumber = Number(searchParams.get('n'));
  const position = positionOfResponse(browsableResponses, requestedNumber);
  const response = browsableResponses[position];

  const showResponse = (responseNumber: number) => {
    const query = new URLSearchParams(searchParams);
    query.set('n', String(responseNumber));
    setSearchParams(query, { replace: true });
  };

  const showResponseAt = (index: number) => {
    const wrappedIndex = wrapIndex(index, browsableResponses.length);
    showResponse(browsableResponses[wrappedIndex].number);
  };

  const runThenReload = async (action: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await action();
      await reload();
    } finally {
      setIsBusy(false);
    }
  };

  if (!response) {
    return (
      <p className="empty-state">
        이 답을 고른 응답이 없습니다.{' '}
        <Link className="text-link" to="?">
          모든 응답 보기
        </Link>
      </p>
    );
  }

  const typicalDurationSeconds = median(
    responsesIncludedInAnalysis(responses).map(
      (included) => included.durationSeconds,
    ),
  );
  const isSuspiciouslyFast = response.durationSeconds < suspiciouslyFastSeconds;
  const shouldWarnFast = isSuspiciouslyFast && !response.excluded;

  const toggleExcluded = () =>
    void runThenReload(() =>
      setResponseExcluded(survey.id, response.id, !response.excluded),
    );

  const deleteCurrentResponse = () =>
    void runThenReload(async () => {
      const nextResponse = browsableResponses[position + 1];
      const previousResponse = browsableResponses[position - 1];
      const responseToShowAfterDelete = nextResponse ?? previousResponse;

      await deleteResponse(survey.id, response.id);
      setIsConfirmingDelete(false);
      if (responseToShowAfterDelete) {
        showResponse(responseToShowAfterDelete.number);
      }
    });

  return (
    <>
      <ResponsePager
        position={position}
        total={browsableResponses.length}
        response={response}
        filter={filter}
        onMove={showResponseAt}
      />

      <div className="split-layout result-layout">
        <div className="split-layout__main">
          {shouldWarnFast && (
            <SuspiciouslyFastNotice
              durationSeconds={response.durationSeconds}
              typicalDurationSeconds={typicalDurationSeconds}
            />
          )}
          <div className="answer-sheet" data-excluded={response.excluded}>
            {survey.questions.map((question, index) => (
              <AnswerView
                key={question.id}
                question={question}
                index={index}
                value={response.answers[question.id]}
              />
            ))}
          </div>
        </div>

        <aside className="split-layout__aside">
          <ResponseInfoPanel
            survey={survey}
            response={response}
            isBusy={isBusy}
            onToggleExcluded={toggleExcluded}
            onRequestDelete={() => setIsConfirmingDelete(true)}
          />
          <Notice tone="neutral">{respondentPrivacyNotice(survey)}</Notice>
        </aside>
      </div>

      <ConfirmDialog
        open={isConfirmingDelete}
        title={`응답 #${response.number}를 삭제할까요?`}
        confirmLabel="삭제"
        busy={isBusy}
        onConfirm={deleteCurrentResponse}
        onClose={() => setIsConfirmingDelete(false)}
      >
        삭제하면 요약과 질문 결과에서도 빠지고 되돌릴 수 없습니다. 결과에서만
        빼려면 ‘분석에서 빼기’를 쓰세요.
      </ConfirmDialog>
    </>
  );
}

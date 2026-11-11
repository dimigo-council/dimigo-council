import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Meter } from '../../components/intranet/Meter.tsx';
import { SegmentedControl, Tag } from '../../components/kit/index.ts';
import { formatDateTime } from '../../lib/date.ts';
import { isAnswered } from '../surveys/format.ts';
import type {
  Question,
  ScaleQuestion,
  TextQuestion,
} from '../surveys/types.ts';
import { questionTypeLabel } from './format.ts';
import {
  formatRatio,
  minimumGroupSize,
  responsesFromGrade,
  responsesIncludedInAnalysis,
  summarizeChoice,
  summarizeScale,
  summarizeText,
  textAnswers,
  visibleGrades,
  type ChoiceSummary,
  type CountRow,
  type TextGroup,
} from './results.ts';
import { StepButton, wrapIndex } from './StepButton.tsx';
import { surveyResultsPaths, useResults } from './SurveyResultsLayout.tsx';
import type { SurveyResponse } from './types.ts';

/** 선택지나 점수로 셀 수 있는 문항 (주관식 제외) */
type CountableQuestion = Exclude<Question, TextQuestion>;

function summarizeCountable(
  question: CountableQuestion,
  responses: SurveyResponse[],
): ChoiceSummary {
  if (question.type === 'scale') return summarizeScale(question, responses);
  return summarizeChoice(question, responses);
}

function answerColumnLabel(question: CountableQuestion) {
  if (question.type === 'scale') return '점수';
  return '선택지';
}

function largestCount(rows: CountRow[]) {
  return Math.max(0, ...rows.map((row) => row.count));
}

function ratioBasisText(question: CountableQuestion, answeredCount: number) {
  if (question.type === 'multiple') {
    return `복수 선택 · 비율은 응답자 ${answeredCount}명 대비`;
  }
  return `비율은 응답 ${answeredCount}개 대비`;
}

/** 개별 보기 탭에서 이 답을 고른 응답만 넘겨 보는 주소 */
function responsesWithAnswerHref(
  responsesHref: string,
  questionId: string,
  answer: string,
) {
  const query = new URLSearchParams({ q: questionId, a: answer });
  return `${responsesHref}?${query}`;
}

function OptionCountRow({
  question,
  row,
  largest,
  responsesHref,
}: {
  question: CountableQuestion;
  row: CountRow;
  largest: number;
  responsesHref: string;
}) {
  const somebodyChose = row.count > 0;
  return (
    <tr>
      <td>{row.label}</td>
      <td className="data-table__num">{row.count}</td>
      <td className="data-table__num">{formatRatio(row.ratio)}</td>
      <td>
        <Meter
          label={`${row.label} 비율`}
          value={row.count}
          max={largest}
          text=""
        />
      </td>
      <td className="data-table__num">
        {somebodyChose && (
          <Link
            className="text-link"
            to={responsesWithAnswerHref(responsesHref, question.id, row.label)}
          >
            응답 보기
          </Link>
        )}
      </td>
    </tr>
  );
}

/** 선택지(또는 점수)별 응답 수와, 그 답을 고른 응답으로 가는 링크 */
function OptionCounts({
  question,
  responses,
  responsesHref,
}: {
  question: CountableQuestion;
  responses: SurveyResponse[];
  responsesHref: string;
}) {
  const summary = summarizeCountable(question, responses);
  const largest = largestCount(summary.rows);
  const answerColumn = answerColumnLabel(question);

  return (
    <section aria-labelledby="option-counts">
      <div className="result-section__head">
        <h3 id="option-counts">{answerColumn}별 응답</h3>
        <span>{ratioBasisText(question, summary.answered)}</span>
      </div>
      <div className="table-wrap">
        <table className="data-table result-table">
          <thead>
            <tr>
              <th scope="col">{answerColumn}</th>
              <th scope="col" className="data-table__num">
                응답 수
              </th>
              <th scope="col" className="data-table__num">
                비율
              </th>
              <th scope="col" className="result-table__bar">
                <span className="visually-hidden">비율 막대</span>
              </th>
              <th scope="col">
                <span className="visually-hidden">개별 응답</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map((row) => (
              <OptionCountRow
                key={row.label}
                question={question}
                row={row}
                largest={largest}
                responsesHref={responsesHref}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface GradeColumn {
  key: string;
  label: string;
  responses: SurveyResponse[];
  summary: ChoiceSummary;
  largest: number;
}

/** 응답자가 충분한 학년마다 한 열, 맨 끝에 전체 열 */
function gradeColumns(
  question: CountableQuestion,
  responses: SurveyResponse[],
): GradeColumn[] {
  const groups = visibleGrades(responses).map((grade) => ({
    key: String(grade),
    label: `${grade}학년`,
    responses: responsesFromGrade(responses, grade),
  }));
  groups.push({ key: 'all', label: '전체', responses });

  return groups.map((group) => {
    const summary = summarizeCountable(question, group.responses);
    return { ...group, summary, largest: largestCount(summary.rows) };
  });
}

function CrossTabCell({ row, largest }: { row: CountRow; largest: number }) {
  const isColumnTop = row.count > 0 && row.count === largest;
  return (
    <td className="data-table__num" data-top={isColumnTop}>
      {formatRatio(row.ratio)}
      <small>{row.count}명</small>
    </td>
  );
}

function AverageScoreRow({
  question,
  columns,
}: {
  question: ScaleQuestion;
  columns: GradeColumn[];
}) {
  return (
    <tr className="result-crosstab__foot">
      <th scope="row">평균 점수</th>
      {columns.map((column) => (
        <td key={column.key} className="data-table__num">
          {summarizeScale(question, column.responses).mean.toFixed(1)}
        </td>
      ))}
    </tr>
  );
}

/** 학년별 교차표: 각 학년 응답자 가운데 그 답을 고른 비율 */
function GradeCrossTable({
  question,
  responses,
}: {
  question: CountableQuestion;
  responses: SurveyResponse[];
}) {
  const columns = gradeColumns(question, responses);
  const answerLabels = columns[0].summary.rows.map((row) => row.label);

  return (
    <section aria-labelledby="grade-table">
      <div className="result-section__head">
        <h3 id="grade-table">학년별로 나눠 보기</h3>
        <span>열마다 가장 높은 값은 굵게</span>
      </div>
      <div className="table-wrap">
        <table className="data-table result-table result-crosstab">
          <thead>
            <tr>
              <th scope="col">{answerColumnLabel(question)}</th>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="data-table__num">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answerLabels.map((answerLabel, answerIndex) => (
              <tr key={answerLabel}>
                <th scope="row">{answerLabel}</th>
                {columns.map((column) => (
                  <CrossTabCell
                    key={column.key}
                    row={column.summary.rows[answerIndex]}
                    largest={column.largest}
                  />
                ))}
              </tr>
            ))}
            {question.type === 'scale' && (
              <AverageScoreRow question={question} columns={columns} />
            )}
            <tr className="result-crosstab__foot">
              <th scope="row">응답</th>
              {columns.map((column) => (
                <td key={column.key} className="data-table__num">
                  {column.summary.answered}명
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="result-section__note">
        {question.type === 'multiple' &&
          '복수 선택이라 열 합이 100%를 넘습니다. '}
        응답자가 {minimumGroupSize}명 미만인 학년은 표에서 빠집니다.
      </p>
    </section>
  );
}

function containsKeyword(text: string, keyword: string) {
  if (!keyword) return true;
  return text.includes(keyword);
}

function NoMatchingAnswers() {
  return <p className="empty-state">찾는 말이 들어간 답이 없습니다.</p>;
}

function TextGroupItem({ group }: { group: TextGroup }) {
  const countText = `${group.count}명 · ${formatRatio(group.ratio)}`;
  const hasVariants = group.variants.length > 1;

  if (!hasVariants) {
    return (
      <div className="text-group">
        <span className="text-group__label">{group.label}</span>
        <span className="text-group__count">{countText}</span>
      </div>
    );
  }

  return (
    <details className="text-group">
      <summary>
        <span className="text-group__label">{group.label}</span>
        <span className="text-group__variants">
          표현 {group.variants.length}가지
        </span>
        <span className="text-group__count">{countText}</span>
      </summary>
      <ul className="text-group__list">
        {group.variants.map((variant) => (
          <li key={variant.text}>
            <span>“{variant.text}”</span>
            <span>{variant.count}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** 같은 답 묶기: 띄어쓰기·문장부호만 다른 답을 하나로 센다 */
function GroupedTextAnswers({
  question,
  responses,
  keyword,
}: {
  question: TextQuestion;
  responses: SurveyResponse[];
  keyword: string;
}) {
  const matchingGroups = summarizeText(question, responses).groups.filter(
    (group) =>
      group.variants.some((variant) => containsKeyword(variant.text, keyword)),
  );
  if (matchingGroups.length === 0) return <NoMatchingAnswers />;

  return (
    <>
      <ul className="text-answer-list">
        {matchingGroups.map((group) => (
          <li key={group.label}>
            <TextGroupItem group={group} />
          </li>
        ))}
      </ul>
      <p className="result-section__note">
        띄어쓰기·문장부호만 다른 답은 같은 답으로 셉니다.
      </p>
    </>
  );
}

/** 하나씩 보기: 최근 응답부터 원문 그대로 */
function RawTextAnswers({
  question,
  responses,
  keyword,
  responsesHref,
}: {
  question: TextQuestion;
  responses: SurveyResponse[];
  keyword: string;
  responsesHref: string;
}) {
  const matchingAnswers = textAnswers(question, responses)
    .filter(({ text }) => containsKeyword(text, keyword))
    .reverse();
  if (matchingAnswers.length === 0) return <NoMatchingAnswers />;

  return (
    <ul className="text-answer-list">
      {matchingAnswers.map(({ response, text }) => (
        <li key={response.id} className="text-raw">
          <p>{text}</p>
          <span className="meta-row">
            <span>{formatDateTime(response.submittedAt)}</span>
            <span>{response.grade}학년</span>
            <Link
              className="text-link"
              to={`${responsesHref}?n=${response.number}`}
            >
              응답 #{response.number}
            </Link>
          </span>
        </li>
      ))}
    </ul>
  );
}

type TextViewMode = 'grouped' | 'raw';

function TextAnswers({
  question,
  responses,
  responsesHref,
}: {
  question: TextQuestion;
  responses: SurveyResponse[];
  responsesHref: string;
}) {
  const [viewMode, setViewMode] = useState<TextViewMode>('grouped');
  const [searchText, setSearchText] = useState('');
  const keyword = searchText.trim();

  return (
    <section aria-label="주관식 답">
      <div className="filter-bar result-text-bar">
        <SegmentedControl
          aria-label="보기 방식"
          value={viewMode}
          onChange={setViewMode}
          items={[
            { value: 'grouped', label: '같은 답 묶기' },
            { value: 'raw', label: '하나씩 보기' },
          ]}
        />
        <input
          type="search"
          className="field__control filter-bar__search"
          aria-label="답 찾기"
          placeholder="답에 들어간 말로 찾기"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {viewMode === 'grouped' ? (
        <GroupedTextAnswers
          question={question}
          responses={responses}
          keyword={keyword}
        />
      ) : (
        <RawTextAnswers
          question={question}
          responses={responses}
          keyword={keyword}
          responsesHref={responsesHref}
        />
      )}
    </section>
  );
}

function QuestionNavigator({
  questions,
  currentIndex,
  onSelect,
}: {
  questions: Question[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="result-question__nav" aria-label="문항">
      <ol>
        {questions.map((question, index) => (
          <li key={question.id}>
            <button
              type="button"
              aria-current={index === currentIndex ? 'true' : undefined}
              onClick={() => onSelect(index)}
            >
              <span className="q-card__number">Q{index + 1}</span>
              <span className="result-question__nav-title">
                {question.title}
              </span>
              <span className="result-question__nav-type">
                {questionTypeLabel[question.type]}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function QuestionDetail({
  question,
  responses,
  responsesHref,
}: {
  question: Question;
  responses: SurveyResponse[];
  responsesHref: string;
}) {
  if (question.type === 'text') {
    return (
      <TextAnswers
        key={question.id}
        question={question}
        responses={responses}
        responsesHref={responsesHref}
      />
    );
  }
  return (
    <>
      <OptionCounts
        question={question}
        responses={responses}
        responsesHref={responsesHref}
      />
      <GradeCrossTable question={question} responses={responses} />
    </>
  );
}

function selectedQuestionIndex(
  questions: Question[],
  questionId: string | null,
) {
  const index = questions.findIndex((question) => question.id === questionId);
  if (index === -1) return 0;
  return index;
}

/** 질문 탭: 문항 하나를 골라 그 문항의 응답을 자세히 본다 */
export function SurveyResultsQuestionPage() {
  const { survey, responses } = useResults();
  const [searchParams, setSearchParams] = useSearchParams();
  const { questions } = survey;
  const includedResponses = responsesIncludedInAnalysis(responses);
  const responsesHref = surveyResultsPaths(survey.id).responses;

  const currentIndex = selectedQuestionIndex(questions, searchParams.get('q'));
  const question = questions[currentIndex];
  const answeredCount = includedResponses.filter((response) =>
    isAnswered(response.answers[question.id]),
  ).length;
  const skippedCount = includedResponses.length - answeredCount;

  const showQuestionAt = (index: number) => {
    const target = questions[wrapIndex(index, questions.length)];
    setSearchParams({ q: target.id }, { replace: true });
  };

  return (
    <div className="result-question">
      <QuestionNavigator
        questions={questions}
        currentIndex={currentIndex}
        onSelect={showQuestionAt}
      />

      <section
        className="panel result-question__body"
        aria-labelledby="q-title"
      >
        <div className="panel__title panel__title--split result-question__head">
          <span className="result-question__pager">
            <StepButton
              direction="previous"
              label="이전 문항"
              onClick={() => showQuestionAt(currentIndex - 1)}
            />
            <span>
              <strong>{currentIndex + 1}</strong> / {questions.length}
            </span>
            <StepButton
              direction="next"
              label="다음 문항"
              onClick={() => showQuestionAt(currentIndex + 1)}
            />
          </span>
          <span className="panel__aside">
            {answeredCount}개 응답
            {skippedCount > 0 && ` · ${skippedCount}명 건너뜀`}
          </span>
        </div>
        <div className="result-question__content">
          <div className="result-question__title">
            <Tag>{questionTypeLabel[question.type]}</Tag>
            <h2 id="q-title">{question.title}</h2>
          </div>
          <QuestionDetail
            question={question}
            responses={includedResponses}
            responsesHref={responsesHref}
          />
        </div>
      </section>
    </div>
  );
}

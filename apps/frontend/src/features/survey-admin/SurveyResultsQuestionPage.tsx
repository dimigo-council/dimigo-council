import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Meter } from '../../components/intranet/Meter.tsx';
import { Badge, Input } from '../../dimi-ui-kit/index.ts';
import {
  ChoiceGroup,
  DataCell,
  EmptyState,
  MetaRow,
  Panel,
  PanelAside,
  TableWrap,
  TextLink,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import * as S from './styles.ts';
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
import { iconSearch } from '../../dimi-ui-kit/icons';

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
      <DataCell $num>{row.count}</DataCell>
      <DataCell $num>{formatRatio(row.ratio)}</DataCell>
      <td>
        <Meter
          label={`${row.label} 비율`}
          value={row.count}
          max={largest}
          text=""
        />
      </td>
      <DataCell $num>
        {somebodyChose && (
          <TextLink
            to={responsesWithAnswerHref(responsesHref, question.id, row.label)}
          >
            응답 보기
          </TextLink>
        )}
      </DataCell>
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
      <S.ResultSectionHead>
        <h3 id="option-counts">{answerColumn}별 응답</h3>
        <span>{ratioBasisText(question, summary.answered)}</span>
      </S.ResultSectionHead>
      <TableWrap>
        <S.ResultTable>
          <thead>
            <tr>
              <th scope="col">{answerColumn}</th>
              <DataCell as="th" scope="col" $num>
                응답 수
              </DataCell>
              <DataCell as="th" scope="col" $num>
                비율
              </DataCell>
              <S.ResultTableBar scope="col">
                <VisuallyHidden>비율 막대</VisuallyHidden>
              </S.ResultTableBar>
              <th scope="col">
                <VisuallyHidden>개별 응답</VisuallyHidden>
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
        </S.ResultTable>
      </TableWrap>
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
    <S.CrosstabCell $num $top={isColumnTop}>
      {formatRatio(row.ratio)}
      <small>{row.count}명</small>
    </S.CrosstabCell>
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
    <S.ResultCrosstabFoot>
      <th scope="row">평균 점수</th>
      {columns.map((column) => (
        <DataCell key={column.key} $num>
          {summarizeScale(question, column.responses).mean.toFixed(1)}
        </DataCell>
      ))}
    </S.ResultCrosstabFoot>
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
      <S.ResultSectionHead>
        <h3 id="grade-table">학년별로 나눠 보기</h3>
        <span>열마다 가장 높은 값은 굵게</span>
      </S.ResultSectionHead>
      <TableWrap>
        <S.ResultCrosstab>
          <thead>
            <tr>
              <th scope="col">{answerColumnLabel(question)}</th>
              {columns.map((column) => (
                <DataCell as="th" key={column.key} scope="col" $num>
                  {column.label}
                </DataCell>
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
            <S.ResultCrosstabFoot>
              <th scope="row">응답</th>
              {columns.map((column) => (
                <DataCell key={column.key} $num>
                  {column.summary.answered}명
                </DataCell>
              ))}
            </S.ResultCrosstabFoot>
          </tbody>
        </S.ResultCrosstab>
      </TableWrap>
      <S.ResultSectionNote>
        {question.type === 'multiple' &&
          '복수 선택이라 열 합이 100%를 넘습니다. '}
        응답자가 {minimumGroupSize}명 미만인 학년은 표에서 빠집니다.
      </S.ResultSectionNote>
    </section>
  );
}

function containsKeyword(text: string, keyword: string) {
  if (!keyword) return true;
  return text.includes(keyword);
}

function NoMatchingAnswers() {
  return <EmptyState>찾는 말이 들어간 답이 없습니다.</EmptyState>;
}

function TextGroupItem({ group }: { group: TextGroup }) {
  const countText = `${group.count}명 · ${formatRatio(group.ratio)}`;
  const hasVariants = group.variants.length > 1;

  if (!hasVariants) {
    return (
      <S.TextGroupRow>
        <S.TextGroupLabel>{group.label}</S.TextGroupLabel>
        <S.TextGroupCount>{countText}</S.TextGroupCount>
      </S.TextGroupRow>
    );
  }

  return (
    <S.TextGroupDetails>
      <summary>
        <S.TextGroupLabel>{group.label}</S.TextGroupLabel>
        <S.TextGroupVariants>
          표현 {group.variants.length}가지
        </S.TextGroupVariants>
        <S.TextGroupCount>{countText}</S.TextGroupCount>
      </summary>
      <S.TextGroupList>
        {group.variants.map((variant) => (
          <li key={variant.text}>
            <span>“{variant.text}”</span>
            <span>{variant.count}</span>
          </li>
        ))}
      </S.TextGroupList>
    </S.TextGroupDetails>
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
      <S.TextAnswerList>
        {matchingGroups.map((group) => (
          <li key={group.label}>
            <TextGroupItem group={group} />
          </li>
        ))}
      </S.TextAnswerList>
      <S.ResultSectionNote>
        띄어쓰기·문장부호만 다른 답은 같은 답으로 셉니다.
      </S.ResultSectionNote>
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
    <S.TextAnswerList>
      {matchingAnswers.map(({ response, text }) => (
        <S.TextRaw as="li" key={response.id}>
          <p>{text}</p>
          <MetaRow>
            <span>{formatDateTime(response.submittedAt)}</span>
            <span>{response.grade}학년</span>
            <TextLink to={`${responsesHref}?n=${response.number}`}>
              응답 #{response.number}
            </TextLink>
          </MetaRow>
        </S.TextRaw>
      ))}
    </S.TextAnswerList>
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
      <S.ResultTextBar>
        <ChoiceGroup
          aria-label="보기 방식"
          value={viewMode}
          onChange={setViewMode}
          items={[
            { value: 'grouped', label: '같은 답 묶기' },
            { value: 'raw', label: '하나씩 보기' },
          ]}
        />
        <Input
          type="search"
          leadingIcon={iconSearch}
          aria-label="답 찾기"
          placeholder="답에 들어간 말로 찾기"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </S.ResultTextBar>

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
    <S.ResultQuestionNav aria-label="문항">
      <ol>
        {questions.map((question, index) => (
          <li key={question.id}>
            <button
              type="button"
              aria-current={index === currentIndex ? 'true' : undefined}
              onClick={() => onSelect(index)}
            >
              <S.QCardNumber>Q{index + 1}</S.QCardNumber>
              <S.ResultQuestionNavTitle>
                {question.title}
              </S.ResultQuestionNavTitle>
              <S.ResultQuestionNavType>
                {questionTypeLabel[question.type]}
              </S.ResultQuestionNavType>
            </button>
          </li>
        ))}
      </ol>
    </S.ResultQuestionNav>
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
    <S.ResultQuestion>
      <QuestionNavigator
        questions={questions}
        currentIndex={currentIndex}
        onSelect={showQuestionAt}
      />

      <Panel aria-labelledby="q-title">
        <S.ResultQuestionHead as="div" $split>
          <S.ResultQuestionPager>
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
          </S.ResultQuestionPager>
          <PanelAside>
            {answeredCount}개 응답
            {skippedCount > 0 && ` · ${skippedCount}명 건너뜀`}
          </PanelAside>
        </S.ResultQuestionHead>
        <S.ResultQuestionContent>
          <S.ResultQuestionTitle>
            <Badge>{questionTypeLabel[question.type]}</Badge>
            <h2 id="q-title">{question.title}</h2>
          </S.ResultQuestionTitle>
          <QuestionDetail
            question={question}
            responses={includedResponses}
            responsesHref={responsesHref}
          />
        </S.ResultQuestionContent>
      </Panel>
    </S.ResultQuestion>
  );
}

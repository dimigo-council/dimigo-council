import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { FilterSelect } from '../../components/intranet/FilterSelect.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import { Button, Notice, Tag } from '../../components/kit/index.ts';
import { formatShortDate } from '../../lib/date.ts';
import { identityNotice } from '../surveys/format.ts';
import type {
  MultipleChoiceQuestion,
  Question,
  ScaleQuestion,
  SingleChoiceQuestion,
  TextQuestion,
} from '../surveys/types.ts';
import { deleteAllResponses } from './api.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { questionTypeLabel } from './format.ts';
import {
  BarChart,
  ColumnChart,
  ResultTable,
  type Column,
} from './ResultCharts.tsx';
import {
  dailyCounts,
  formatRatio,
  grades,
  minimumGroupSize,
  responsesFromGrade,
  responsesIncludedInAnalysis,
  shareOf,
  summarizeChoice,
  summarizeScale,
  summarizeText,
  visibleGrades,
  type CountRow,
  type DayCount,
  type Grade,
} from './results.ts';
import { surveyResultsPaths, useResults } from './SurveyResultsLayout.tsx';
import type { AdminSurvey, SurveyResponse } from './types.ts';

/** 요약 탭에서 주관식은 많이 나온 답 몇 개만 보여주고 나머지는 질문 탭에서 본다 */
const textPreviewCount = 5;

/** 차트와 표 사이를 오가는 보기 상태 */
function useTableView() {
  const [showsTable, setShowsTable] = useState(false);
  const toggleTableView = () => setShowsTable((current) => !current);
  return { showsTable, toggleTableView };
}

function TableViewButton({
  showsTable,
  onToggle,
  className,
}: {
  showsTable: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      aria-pressed={showsTable}
      onClick={onToggle}
    >
      {showsTable ? '차트로 보기' : '표로 보기'}
    </Button>
  );
}

/** 카드 맨 위 한 줄 결론: "가장 많은 답 **급식** 40%" */
function Lead({
  prefix,
  value,
  suffix,
}: {
  prefix: string;
  value: string;
  suffix: string;
}) {
  return (
    <p className="result-card__lead">
      {prefix} <strong>{value}</strong> {suffix}
    </p>
  );
}

function mostChosenRow(rows: CountRow[]) {
  let mostChosen = rows[0];
  for (const row of rows) {
    if (row.count > mostChosen.count) mostChosen = row;
  }
  return mostChosen;
}

interface QuestionResultProps<Kind extends Question = Question> {
  question: Kind;
  index: number;
  /** 학년 필터까지 적용한, 이 카드를 계산할 응답 */
  responses: SurveyResponse[];
  questionsHref: string;
}

/** 문항 카드의 공통 틀: 번호·제목·유형, 응답·건너뜀 수, 표/차트 전환, 결론과 본문 */
function QuestionResultCard({
  question,
  index,
  respondentCount,
  answeredCount,
  note = '',
  tableView,
  lead,
  children,
}: {
  question: Question;
  index: number;
  respondentCount: number;
  answeredCount: number;
  note?: string;
  tableView?: ReturnType<typeof useTableView>;
  lead?: ReactNode;
  children: ReactNode;
}) {
  const titleId = `result-q-${question.id}`;
  const skippedCount = respondentCount - answeredCount;
  const nobodyAnswered = answeredCount === 0;

  return (
    <section className="panel result-card" aria-labelledby={titleId}>
      <div className="result-card__head">
        <div className="result-card__heading">
          <span className="q-card__number">Q{index + 1}</span>
          <h2 className="result-card__title" id={titleId}>
            {question.title}
          </h2>
          <p className="result-card__meta">
            <Tag>{questionTypeLabel[question.type]}</Tag>
            <span>
              {answeredCount}개 응답
              {skippedCount > 0 && ` · ${skippedCount}명 건너뜀`}
              {note && ` · ${note}`}
            </span>
          </p>
        </div>
        {tableView && (
          <TableViewButton
            showsTable={tableView.showsTable}
            onToggle={tableView.toggleTableView}
          />
        )}
      </div>
      {nobodyAnswered ? (
        <p className="result-card__empty">이 문항에 답한 사람이 없습니다.</p>
      ) : (
        <>
          {lead}
          <div className="result-card__body">{children}</div>
        </>
      )}
    </section>
  );
}

function ChoiceLead({
  isMultiple,
  mostChosen,
}: {
  isMultiple: boolean;
  mostChosen: CountRow;
}) {
  const ratio = formatRatio(mostChosen.ratio);
  if (isMultiple) {
    return (
      <Lead
        prefix="가장 많이 고른 항목"
        value={mostChosen.label}
        suffix={`응답자의 ${ratio}`}
      />
    );
  }
  return <Lead prefix="가장 많은 답" value={mostChosen.label} suffix={ratio} />;
}

function ChoiceQuestionResult({
  question,
  index,
  responses,
}: QuestionResultProps<SingleChoiceQuestion | MultipleChoiceQuestion>) {
  const tableView = useTableView();
  const summary = summarizeChoice(question, responses);
  const isMultiple = question.type === 'multiple';

  return (
    <QuestionResultCard
      question={question}
      index={index}
      respondentCount={responses.length}
      answeredCount={summary.answered}
      note={isMultiple ? '복수 선택이라 비율 합이 100%를 넘습니다' : ''}
      tableView={tableView}
      lead={
        <ChoiceLead
          isMultiple={isMultiple}
          mostChosen={mostChosenRow(summary.rows)}
        />
      }
    >
      {tableView.showsTable ? (
        <ResultTable
          caption={question.title}
          firstColumn="선택지"
          rows={summary.rows}
          ratioLabel={isMultiple ? '응답자 대비' : '비율'}
        />
      ) : (
        <BarChart label={question.title} rows={summary.rows} />
      )}
    </QuestionResultCard>
  );
}

function scoreColumns(rows: CountRow[]): Column[] {
  return rows.map((row) => ({
    key: row.label,
    count: row.count,
    axis: row.label,
    value: formatRatio(row.ratio),
    tip: `${row.label}점 ${row.count}명(${formatRatio(row.ratio)})`,
  }));
}

function ScaleQuestionResult({
  question,
  index,
  responses,
}: QuestionResultProps<ScaleQuestion>) {
  const tableView = useTableView();
  const summary = summarizeScale(question, responses);
  const topTwoRange = `${question.steps - 1}–${question.steps}점`;

  return (
    <QuestionResultCard
      question={question}
      index={index}
      respondentCount={responses.length}
      answeredCount={summary.answered}
      tableView={tableView}
      lead={
        <Lead
          prefix="평균"
          value={summary.mean.toFixed(1)}
          suffix={`· 중앙값 ${summary.median} · ${topTwoRange} ${formatRatio(summary.topTwo)}`}
        />
      }
    >
      {tableView.showsTable ? (
        <ResultTable
          caption={question.title}
          firstColumn="점수"
          rows={summary.rows}
        />
      ) : (
        <>
          <ColumnChart
            label={question.title}
            columns={scoreColumns(summary.rows)}
          />
          <div className="scale__labels" aria-hidden="true">
            <span>1 {question.minLabel}</span>
            <span>
              {question.steps} {question.maxLabel}
            </span>
          </div>
        </>
      )}
    </QuestionResultCard>
  );
}

function TextQuestionResult({
  question,
  index,
  responses,
  questionsHref,
}: QuestionResultProps<TextQuestion>) {
  const summary = summarizeText(question, responses);
  const previewGroups = summary.groups.slice(0, textPreviewCount);
  const mostCommon = previewGroups[0];
  const hasRepeatedAnswer = mostCommon !== undefined && mostCommon.count > 1;

  return (
    <QuestionResultCard
      question={question}
      index={index}
      respondentCount={responses.length}
      answeredCount={summary.answered}
      lead={
        hasRepeatedAnswer && (
          <Lead
            prefix="가장 많이 나온 답"
            value={mostCommon.label}
            suffix={`${mostCommon.count}명`}
          />
        )
      }
    >
      <ul className="text-groups">
        {previewGroups.map((group) => (
          <li key={group.label}>
            <span className="text-groups__text">{group.label}</span>
            {group.variants.length > 1 && (
              <span className="text-groups__variants">
                비슷한 표현 {group.variants.length}가지
              </span>
            )}
            <span className="text-groups__count">{group.count}명</span>
          </li>
        ))}
      </ul>
      <Link className="text-link" to={`${questionsHref}?q=${question.id}`}>
        답 {summary.answered}개 모두 보기
      </Link>
    </QuestionResultCard>
  );
}

/** 문항 유형에 맞는 카드를 고른다 */
function QuestionResult({ question, ...rest }: QuestionResultProps) {
  if (question.type === 'scale') {
    return <ScaleQuestionResult question={question} {...rest} />;
  }
  if (question.type === 'text') {
    return <TextQuestionResult question={question} {...rest} />;
  }
  return <ChoiceQuestionResult question={question} {...rest} />;
}

function responsesInSelectedGrade(
  responses: SurveyResponse[],
  selectedGrade: string,
) {
  if (!selectedGrade) return responses;
  return responses.filter(
    (response) => String(response.grade) === selectedGrade,
  );
}

function respondentCountText(selectedGrade: string, count: number) {
  if (!selectedGrade) return `${count}명`;
  return `${selectedGrade}학년 ${count}명`;
}

function GradeFilter({
  selectableGrades,
  selectedGrade,
  onSelectGrade,
  respondentCount,
  excludedCount,
}: {
  selectableGrades: Grade[];
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
  respondentCount: number;
  excludedCount: number;
}) {
  return (
    <div className="filter-bar result-filter">
      <FilterSelect label="학년" value={selectedGrade} onChange={onSelectGrade}>
        <option value="">전체</option>
        {selectableGrades.map((grade) => (
          <option key={grade} value={grade}>
            {grade}학년
          </option>
        ))}
      </FilterSelect>
      <span className="result-filter__note">
        {respondentCountText(selectedGrade, respondentCount)}의 응답으로
        계산했습니다
        {excludedCount > 0 && ` (분석에서 뺀 응답 ${excludedCount}개 제외)`}
      </span>
    </div>
  );
}

/** 날짜 칸이 좁아 첫날·마지막 날 이름과 가장 많은 날의 수만 적는다. */
function dailyColumns(days: DayCount[]): Column[] {
  const peakCount = Math.max(0, ...days.map((day) => day.count));
  const lastIndex = days.length - 1;
  return days.map((day, index) => {
    const date = formatShortDate(day.day);
    const isFirstOrLastDay = index === 0 || index === lastIndex;
    const isPeakDay = day.count === peakCount;
    return {
      key: day.day,
      count: day.count,
      axis: isFirstOrLastDay ? date : '',
      value: isPeakDay ? String(day.count) : '',
      tip: `${date} ${day.count}명`,
    };
  });
}

function dailyRows(days: DayCount[], totalResponses: number): CountRow[] {
  return days.map((day) => ({
    label: formatShortDate(day.day),
    count: day.count,
    ratio: shareOf(day.count, totalResponses),
  }));
}

function DailyResponsesPanel({
  survey,
  responses,
}: {
  survey: AdminSurvey;
  responses: SurveyResponse[];
}) {
  const { showsTable, toggleTableView } = useTableView();
  const days = dailyCounts(responses, survey.opensAt);

  return (
    <section className="panel" aria-labelledby="trend-title">
      <div className="panel__title panel__title--split">
        <h2 className="panel__heading" id="trend-title">
          날짜별 응답
        </h2>
        <TableViewButton
          className="panel__action"
          showsTable={showsTable}
          onToggle={toggleTableView}
        />
      </div>
      <div className="panel__body">
        {showsTable ? (
          <ResultTable
            caption="날짜별 응답"
            firstColumn="날짜"
            ratioLabel="전체 대비"
            rows={dailyRows(days, responses.length)}
          />
        ) : (
          <ColumnChart
            compact
            label="날짜별 응답 수"
            columns={dailyColumns(days)}
          />
        )}
      </div>
    </section>
  );
}

function GradeResponseRow({
  grade,
  count,
  total,
}: {
  grade: Grade;
  count: number;
  total: number;
}) {
  const isTooFewToShow = count < minimumGroupSize;
  return (
    <div className="result-grade">
      <span>{grade}학년</span>
      {isTooFewToShow ? (
        <span className="result-grade__hidden">
          {minimumGroupSize}명 미만이라 숨김
        </span>
      ) : (
        <Meter
          label={`${grade}학년 응답`}
          value={count}
          max={total}
          text={`${count}명`}
        />
      )}
    </div>
  );
}

function GradeResponsesPanel({
  includedResponses,
}: {
  includedResponses: SurveyResponse[];
}) {
  return (
    <section className="panel" aria-labelledby="grade-title">
      <h2 className="panel__title" id="grade-title">
        학년별 응답
      </h2>
      <div className="panel__body">
        {grades.map((grade) => (
          <GradeResponseRow
            key={grade}
            grade={grade}
            count={responsesFromGrade(includedResponses, grade).length}
            total={includedResponses.length}
          />
        ))}
      </div>
      <p className="panel__note">
        응답자가 {minimumGroupSize}명 미만인 학년은 누가 답했는지 짐작할 수 있어
        필터와 교차표에서 뺍니다.
      </p>
    </section>
  );
}

function ResponseManagementPanel({
  onRequestDeleteAll,
}: {
  onRequestDeleteAll: () => void;
}) {
  return (
    <section className="panel" aria-labelledby="manage-title">
      <h2 className="panel__title" id="manage-title">
        응답 관리
      </h2>
      <div className="panel__body">
        <p className="result-manage__text">
          응답을 모두 지우면 되돌릴 수 없습니다. 먼저 CSV로 내려받아 두세요.
        </p>
        <Button variant="danger" block onClick={onRequestDeleteAll}>
          모든 응답 삭제
        </Button>
      </div>
    </section>
  );
}

function DeleteAllResponsesDialog({
  survey,
  responseCount,
  open,
  onClose,
  onDeleted,
}: {
  survey: AdminSurvey;
  responseCount: number;
  open: boolean;
  onClose: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllResponses(survey.id);
      onClose();
      await onDeleted();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title={`응답 ${responseCount}개를 모두 삭제할까요?`}
      confirmLabel={`${responseCount}개 모두 삭제`}
      busy={isDeleting}
      onConfirm={() => void deleteAll()}
      onClose={onClose}
    >
      삭제한 응답은 되돌릴 수 없습니다. 요약·질문·개별 보기에서 모두 사라지고,
      이미 내려받은 CSV나 보고서에 옮긴 내용은 그대로 남습니다.
    </ConfirmDialog>
  );
}

/** 요약 탭: 문항마다 유형에 맞는 차트, 학년 필터, 날짜별 응답 */
export function SurveyResultsSummaryPage() {
  const { survey, responses, reload } = useResults();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);

  const includedResponses = responsesIncludedInAnalysis(responses);
  const filteredResponses = responsesInSelectedGrade(
    includedResponses,
    selectedGrade,
  );
  const excludedCount = responses.length - includedResponses.length;
  const questionsHref = surveyResultsPaths(survey.id).questions;

  return (
    <div className="split-layout result-layout">
      <div className="split-layout__main">
        <GradeFilter
          selectableGrades={visibleGrades(includedResponses)}
          selectedGrade={selectedGrade}
          onSelectGrade={setSelectedGrade}
          respondentCount={filteredResponses.length}
          excludedCount={excludedCount}
        />
        {survey.questions.map((question, index) => (
          <QuestionResult
            key={question.id}
            question={question}
            index={index}
            responses={filteredResponses}
            questionsHref={questionsHref}
          />
        ))}
      </div>

      <aside className="split-layout__aside">
        <DailyResponsesPanel survey={survey} responses={responses} />
        <GradeResponsesPanel includedResponses={includedResponses} />
        <Notice tone="neutral">{identityNotice[survey.identity]}</Notice>
        <ResponseManagementPanel
          onRequestDeleteAll={() => setIsConfirmingDeleteAll(true)}
        />
      </aside>

      <DeleteAllResponsesDialog
        survey={survey}
        responseCount={responses.length}
        open={isConfirmingDeleteAll}
        onClose={() => setIsConfirmingDeleteAll(false)}
        onDeleted={reload}
      />
    </div>
  );
}

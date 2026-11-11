import { formatRatio, shareOf, type CountRow } from './results.ts';

/**
 * 설문 결과 차트. 모두 단일 계열이라 한 가지 색만 쓰고, 가장 큰 값만 진하게 칠한다.
 * 값은 막대 옆에 바로 적고, 같은 내용을 ResultTable(표로 보기)로도 볼 수 있다.
 */

function largestCount(counts: number[]) {
  return Math.max(0, ...counts);
}

/** 응답이 하나라도 있을 때만 가장 큰 막대를 강조한다. */
function isLargest(count: number, largest: number) {
  return largest > 0 && count === largest;
}

function describeRows(label: string, rows: CountRow[]) {
  const rowDescriptions = rows.map(
    (row) => `${row.label} ${row.count}명(${formatRatio(row.ratio)})`,
  );
  return `${label}: ${rowDescriptions.join(', ')}`;
}

/** 가로 막대: 객관식·복수 선택 */
export function BarChart({ label, rows }: { label: string; rows: CountRow[] }) {
  const largest = largestCount(rows.map((row) => row.count));
  return (
    <div
      className="bar-chart"
      role="img"
      aria-label={describeRows(label, rows)}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="bar-chart__row"
          data-top={isLargest(row.count, largest)}
        >
          <span className="bar-chart__label">{row.label}</span>
          <span className="bar-chart__track">
            <span
              className="bar-chart__bar"
              style={{ width: `${shareOf(row.count, largest) * 100}%` }}
            />
          </span>
          <span className="bar-chart__value">
            <b>{formatRatio(row.ratio)}</b> · {row.count}명
          </span>
          <span className="chart-tip">
            {row.label} — {row.count}명 ({formatRatio(row.ratio)})
          </span>
        </div>
      ))}
    </div>
  );
}

export interface Column {
  key: string;
  count: number;
  /** 막대 아래 글자. 비우면 표시하지 않는다. */
  axis: string;
  /** 막대 위 글자. 비우면 표시하지 않는다. */
  value: string;
  tip: string;
}

/** 가장 높은 막대도 위에 값 글자가 들어갈 자리를 남긴다. */
const tallestColumnHeightPercent = 80;

/** 세로 막대: 척도 분포, 날짜별 응답 */
export function ColumnChart({
  label,
  columns,
  compact = false,
}: {
  label: string;
  columns: Column[];
  compact?: boolean;
}) {
  const largest = largestCount(columns.map((column) => column.count));
  const tips = columns.map((column) => column.tip);
  const className = compact
    ? 'column-chart column-chart--compact'
    : 'column-chart';

  return (
    <div
      className={className}
      role="img"
      aria-label={`${label}: ${tips.join(', ')}`}
    >
      {columns.map((column) => {
        const heightPercent =
          shareOf(column.count, largest) * tallestColumnHeightPercent;
        return (
          <div
            key={column.key}
            className="column-chart__col"
            data-top={isLargest(column.count, largest)}
          >
            <span className="column-chart__plot">
              <span className="column-chart__value">{column.value}</span>
              <span
                className="column-chart__bar"
                style={{ height: `${heightPercent}%` }}
              />
            </span>
            <span className="column-chart__axis">{column.axis}</span>
            <span className="chart-tip">{column.tip}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 차트와 같은 내용을 표로 */
export function ResultTable({
  caption,
  firstColumn,
  rows,
  ratioLabel = '비율',
}: {
  caption: string;
  firstColumn: string;
  rows: CountRow[];
  ratioLabel?: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table result-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{firstColumn}</th>
            <th scope="col" className="data-table__num">
              응답 수
            </th>
            <th scope="col" className="data-table__num">
              {ratioLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="data-table__num">{row.count}</td>
              <td className="data-table__num">{formatRatio(row.ratio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

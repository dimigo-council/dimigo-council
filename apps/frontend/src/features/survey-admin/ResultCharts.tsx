import {
  DataCell,
  TableWrap,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import { formatRatio, shareOf, type CountRow } from './results.ts';
import * as S from './styles.ts';

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
    <S.BarChart role="img" aria-label={describeRows(label, rows)}>
      {rows.map((row) => (
        <S.BarChartRow key={row.label} $top={isLargest(row.count, largest)}>
          <S.BarChartLabel>{row.label}</S.BarChartLabel>
          <S.BarChartTrack>
            <S.BarChartBar
              style={{ width: `${shareOf(row.count, largest) * 100}%` }}
            />
          </S.BarChartTrack>
          <S.BarChartValue>
            <b>{formatRatio(row.ratio)}</b> · {row.count}명
          </S.BarChartValue>
          <S.ChartTip>
            {row.label} — {row.count}명 ({formatRatio(row.ratio)})
          </S.ChartTip>
        </S.BarChartRow>
      ))}
    </S.BarChart>
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
  return (
    <S.ColumnChart
      $compact={compact}
      role="img"
      aria-label={`${label}: ${tips.join(', ')}`}
    >
      {columns.map((column) => {
        const heightPercent =
          shareOf(column.count, largest) * tallestColumnHeightPercent;
        return (
          <S.ColumnChartCol
            key={column.key}
            $top={isLargest(column.count, largest)}
          >
            <S.ColumnChartPlot>
              <S.ColumnChartValue>{column.value}</S.ColumnChartValue>
              <S.ColumnChartBar style={{ height: `${heightPercent}%` }} />
            </S.ColumnChartPlot>
            <S.ColumnChartAxis>{column.axis}</S.ColumnChartAxis>
            <S.ChartTip>{column.tip}</S.ChartTip>
          </S.ColumnChartCol>
        );
      })}
    </S.ColumnChart>
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
    <TableWrap>
      <S.ResultTable>
        <VisuallyHidden as="caption">{caption}</VisuallyHidden>
        <thead>
          <tr>
            <th scope="col">{firstColumn}</th>
            <DataCell as="th" scope="col" $num>
              응답 수
            </DataCell>
            <DataCell as="th" scope="col" $num>
              {ratioLabel}
            </DataCell>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <DataCell $num>{row.count}</DataCell>
              <DataCell $num>{formatRatio(row.ratio)}</DataCell>
            </tr>
          ))}
        </tbody>
      </S.ResultTable>
    </TableWrap>
  );
}

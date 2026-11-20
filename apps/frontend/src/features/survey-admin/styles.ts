/* 업무공간 설문: 설문 관리 · 설문 편집 · 설문 결과 (요약 · 질문 · 개별 보기) */
import styled, { css } from 'styled-components';
import {
  ButtonRoot,
  InputBox,
  TextAreaControl,
} from '../../dimi-ui-kit/index.ts';
import { FilterBar } from '../../components/intranet/FilterSelect.tsx';
import { MeterRoot } from '../../components/intranet/Meter.tsx';
import {
  Choice,
  DataCell,
  DataTable,
  EmptyState,
  ListRowItem,
  Notice,
  Panel,
  PanelBody,
  PanelTitle,
  SplitAside,
  SplitLayout,
  SplitMain,
  Switch,
  TabsTrack,
} from '../../components/ui/index.ts';
import { SurveyIntro, SurveyPage } from '../surveys/styles.ts';

const narrow = '@media (max-width: 600px)';

/* ---------- 목록 ---------- */

export const SurveyAdminPanel = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;

export const SurveyAdminRow = styled(ListRowItem)``;

export const SurveyAdminRowMeter = styled.span`
  width: 150px;

  ${narrow} {
    flex-basis: 100%;
  }
`;

export const SurveyAdminRowDate = styled.span`
  ${({ theme: t }) => css`
    min-width: 104px;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;

    ${narrow} {
      min-width: 0;
      margin-left: auto;
    }
  `}
`;

/* ---------- 편집 ---------- */

export const SurveyEdit = styled(SplitLayout)`
  margin-top: 20px;

  ${SplitMain} {
    gap: 12px;
  }
  ${TextAreaControl} {
    min-height: 64px;
  }
`;

export const SurveyEditIntro = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 14px 16px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
  `}
`;

/* 문항 카드: 접으면 한 줄, 펼치면 편집 */
export const QList = styled.ol`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const QCardSummary = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 16px;
    border: 0;
    border-radius: inherit;
    background: none;
    color: ${t.colors.core.glyph.primary};
    font: inherit;
    text-align: left;

    ${narrow} {
      flex-wrap: wrap;
      gap: 6px 10px;
    }
  `}
`;

export const QCardSummaryButton = styled(QCardSummary).attrs({
  as: 'button',
  type: 'button',
})`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.components.fill.primary};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.core.status.accent};
    outline-offset: 2px;
  }
`;

export const QCard = styled.li<{ $open?: boolean }>`
  ${({ theme: t, $open }) => css`
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    ${
      $open &&
      css`
        border-color: ${t.colors.core.glyph.primary};
        box-shadow: 0 0 0 1px ${t.colors.core.glyph.primary};

        ${QCardSummaryButton}:hover {
          background: none;
        }
      `
    }
  `}
`;

export const QCardNumber = styled.span`
  ${({ theme: t }) => css`
    flex: none;
    min-width: 2em;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  `}
`;

export const QCardTitle = styled.span<{ $empty?: boolean }>`
  ${({ theme: t, $empty }) => css`
    flex: 1;
    min-width: 0;
    font-size: ${t.font.size.callout};
    font-weight: 700;
    overflow-wrap: anywhere;
    ${
      $empty &&
      css`
        color: ${t.colors.core.glyph.tertiary};
        font-weight: 400;
      `
    }

    ${narrow} {
      flex-basis: calc(100% - 2em - 10px);
    }
  `}
`;

export const QCardTags = styled.span`
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;

  ${narrow} {
    margin-left: calc(2em + 10px);
  }
`;

export const QCardDetail = styled.p`
  ${({ theme: t }) => css`
    margin: -6px 0 0;
    padding: 0 16px 14px calc(16px + 2em + 14px);
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};

    ${narrow} {
      padding-left: 16px;
    }
  `}
`;

export const QCardBody = styled.div`
  display: grid;
  gap: 16px;
  padding: 4px 16px 16px calc(16px + 2em + 14px);

  ${narrow} {
    padding-left: 16px;
  }
`;

export const QCardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 4px 12px;
`;

export const QCardFoot = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};

  ${Choice} {
    margin-right: auto;
  }
`;

export const QOptions = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const QOption = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;

  ${InputBox} {
    flex: 1;
    min-width: 0;
  }
`;

/** 아이콘만 있는 작은 버튼 (문항 옮기기·지우기, 앞뒤로 넘기기) */
export const PlainIconButton = styled.button`
  ${({ theme: t }) => css`
    display: grid;
    flex: none;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: ${t.radius.xs};
    background: none;
    color: ${t.colors.core.glyph.secondary};
    cursor: pointer;

    &:hover:not(:disabled) {
      background: ${t.colors.components.fill.primary};
      color: ${t.colors.core.glyph.primary};
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
    &:disabled {
      color: ${t.colors.core.glyph.tertiary};
      cursor: not-allowed;
      opacity: 0.5;
    }
  `}
`;

export const QAdd = styled.button`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 14px;
    border: 1px dashed ${t.colors.core.line};
    border-radius: ${t.radius.m};
    background: none;
    color: ${t.colors.core.glyph.secondary};
    font: inherit;
    font-size: ${t.font.size.callout};
    cursor: pointer;

    &:hover {
      border-color: ${t.colors.core.glyph.tertiary};
      background: ${t.colors.background.primary};
      color: ${t.colors.core.glyph.primary};
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
  `}
`;

export const SurveySettings = styled(Panel)`
  display: grid;
  gap: 8px;
`;

/* 공개 전 확인 */
export const PublishChecks = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 16px 18px;
    list-style: none;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
  `}
`;

export const PublishCheck = styled.li<{ $done: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  ${({ theme, $done }) => $done && `color: ${theme.colors.core.glyph.primary};`}
`;

export const PublishChecksAction = styled.div`
  padding: 0 18px 16px;
`;

/* 미리보기 */
export const SurveyPreview = styled(SurveyPage)`
  display: grid;
  gap: 16px;
  margin-top: 24px;

  ${SurveyIntro} {
    margin-bottom: 0;
  }
`;

export const SurveyPreviewTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  font-size: ${({ theme }) => theme.font.size.title};
  font-weight: 800;
`;

export const SurveyPreviewIntro = styled.p`
  margin: -12px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.callout};
  line-height: 1.6;
`;

/* ---------- 결과: 머리글 ---------- */

export const ResultAccepting = styled(Switch)`
  margin-right: 8px;
  font-weight: 700;
`;

export const ResultClosed = styled(Notice)`
  margin-bottom: 16px;
`;

/* 머리글 아래 숫자 줄 */
export const ResultFacts = styled.dl`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    margin: 0 0 20px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    > div {
      padding: 14px 18px;
      border-left: 1px solid ${t.colors.core.outline};
    }
    > div:first-child {
      border-left: 0;
    }
    dt {
      color: ${t.colors.core.glyph.tertiary};
      font-size: ${t.font.size.footnote};
    }
    dd {
      margin: 4px 0 0;
      color: ${t.colors.core.glyph.primary};
      font-size: 1.25rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    small {
      margin-left: 4px;
      color: ${t.colors.core.glyph.secondary};
      font-size: ${t.font.size.callout};
      font-weight: 700;
    }

    ${narrow} {
      > div:nth-child(odd) {
        border-left: 0;
      }
      > div:nth-child(n + 3) {
        border-top: 1px solid ${t.colors.core.outline};
      }
    }
  `}
`;

/* 탭이 주소마다 따로 있어 링크로 그린다 */
export const ResultTabs = styled(TabsTrack)`
  @media print {
    display: none;
  }
`;

export const ResultEmpty = styled(EmptyState)`
  margin-top: 24px;
`;

export const ResultLayout = styled(SplitLayout)`
  grid-template-columns: minmax(0, 1fr) 280px;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }

  /* 인쇄: 결과 차트만 남긴다 */
  @media print {
    grid-template-columns: minmax(0, 1fr);

    > ${SplitAside} {
      display: none;
    }
  }
`;

export const ResultFilter = styled(FilterBar)`
  gap: 8px 12px;

  @media print {
    display: none;
  }
`;

export const ResultFilterNote = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.callout};
`;

/* ---------- 요약: 문항 카드 ---------- */

export const ResultCard = styled(Panel)`
  padding: 18px 20px 20px;

  @media print {
    break-inside: avoid;
  }
`;

export const ResultCardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  ${ButtonRoot} {
    flex: none;
    margin: -4px -8px 0 0;

    @media print {
      display: none;
    }
  }
`;

export const ResultCardHeading = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: 6px 10px;
  min-width: 0;

  ${QCardNumber} {
    min-width: 0;
  }
`;

export const ResultCardTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: 700;
  line-height: 1.5;
`;

export const ResultCardMeta = styled.p`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    grid-column: 2;
    align-items: center;
    gap: 4px 8px;
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
  `}
`;

export const ResultCardLead = styled.p`
  ${({ theme: t }) => css`
    margin: 14px 0 0;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};

    strong {
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const ResultCardBody = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
`;

export const ResultCardEmpty = styled.p`
  margin: 16px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.callout};
`;

export const ResultTable = styled(DataTable)`
  min-width: 0;
`;

/** 표 안 막대 칸 */
export const ResultTableBar = styled.th`
  width: 30%;
`;

/* ---------- 차트 ---------- */

/* 차트 공통: 막대 위에 올리면 나오는 설명 */
export const ChartTip = styled.span`
  ${({ theme: t }) => css`
    position: absolute;
    z-index: 2;
    padding: 5px 8px;
    border-radius: ${t.radius.xs};
    background: ${t.colors.components.fill.inverted.primary};
    color: ${t.colors.core.glyph.inverted.primary};
    font-size: ${t.font.size.footnote};
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `}
`;

/* 가로 막대 */
export const BarChartLabel = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  line-height: 1.4;
`;

export const BarChartTrack = styled.span`
  height: 14px;
`;

export const BarChartBar = styled.span`
  display: block;
  min-width: 2px;
  height: 100%;
  border-radius: 0 ${({ theme }) => theme.radius.xs}
    ${({ theme }) => theme.radius.xs} 0;
  background: ${({ theme }) => theme.colors.core.glyph.tertiary};
`;

export const BarChartValue = styled.span`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.secondary};
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;

    b {
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const BarChartRow = styled.div<{ $top: boolean }>`
  ${({ theme: t, $top }) => css`
    position: relative;
    display: grid;
    grid-template-columns: minmax(7em, 14em) minmax(0, 1fr) 7.5em;
    align-items: center;
    gap: 14px;
    font-size: ${t.font.size.callout};

    ${
      $top &&
      css`
        ${BarChartBar} {
          background: ${t.colors.components.fill.inverted.primary};
        }
      `
    }
    &:hover ${BarChartBar} {
      background: ${t.colors.core.status.accent};
    }
    &:hover ${ChartTip} {
      opacity: 1;
    }

    ${narrow} {
      grid-template-columns: minmax(0, 1fr) 7.5em;
      gap: 4px 12px;

      ${BarChartLabel} {
        grid-column: 1 / -1;
      }
    }
  `}
`;

export const BarChart = styled.div`
  display: grid;
  gap: 10px;

  ${ChartTip} {
    bottom: calc(100% + 4px);
    left: calc(min(14em, 40%) + 14px);
  }
  ${narrow} {
    ${ChartTip} {
      left: 0;
    }
  }
`;

/* 세로 막대 */
export const ColumnChartPlot = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 132px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.core.line};
`;

export const ColumnChartBar = styled.span`
  display: block;
  width: 100%;
  max-width: 56px;
  min-height: 2px;
  border-radius: ${({ theme }) => theme.radius.xs}
    ${({ theme }) => theme.radius.xs} 0 0;
  background: ${({ theme }) => theme.colors.core.glyph.tertiary};
`;

export const ColumnChartValue = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.footnote};
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
`;

export const ColumnChartAxis = styled.span`
  ${({ theme: t }) => css`
    min-height: 1.6em;
    padding-top: 6px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    font-variant-numeric: tabular-nums;
    text-align: center;
    white-space: nowrap;
  `}
`;

export const ColumnChartCol = styled.div<{ $top: boolean }>`
  ${({ theme: t, $top }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;

    ${
      $top &&
      css`
        ${ColumnChartBar} {
          background: ${t.colors.components.fill.inverted.primary};
        }
        ${ColumnChartValue} {
          color: ${t.colors.core.glyph.primary};
          font-weight: 700;
        }
      `
    }
    &:hover ${ColumnChartBar} {
      background: ${t.colors.core.status.accent};
    }
  `}
`;

export const ColumnChart = styled.div<{ $compact: boolean }>`
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 0 8px;

  ${ChartTip} {
    bottom: calc(100% - 132px + 4px);
    left: 50%;
    transform: translateX(-50%);
  }
  ${ColumnChartCol}:first-child ${ChartTip} {
    left: 0;
    transform: none;
  }
  ${ColumnChartCol}:last-child ${ChartTip} {
    right: 0;
    left: auto;
    transform: none;
  }
  ${ColumnChartCol}:hover ${ChartTip} {
    opacity: 1;
  }

  ${({ $compact }) =>
    $compact &&
    css`
      gap: 0 3px;

      ${ColumnChartPlot} {
        height: 88px;
      }
      ${ChartTip} {
        bottom: calc(100% - 88px + 4px);
      }
      ${ColumnChartCol}:first-child ${ColumnChartAxis} {
        text-align: left;
      }
      ${ColumnChartCol}:last-child ${ColumnChartAxis} {
        text-align: right;
      }
    `}
`;

/* 요약: 주관식 많이 나온 답 */
export const TextGroupsVariants = styled.span`
  grid-column: 1;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const TextGroupsCount = styled.span`
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.callout};
  font-variant-numeric: tabular-nums;
`;

export const TextGroups = styled.ul`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 2px 16px;
      padding: 10px 0;
      border-top: 1px solid ${t.colors.core.outline};
      font-size: ${t.font.size.callout};
    }
    li:first-child {
      padding-top: 0;
      border-top: 0;
    }
  `}
`;

/* 요약: 옆 칸 */
export const ResultGrade = styled.div`
  display: grid;
  grid-template-columns: 3.2em minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font-size: ${({ theme }) => theme.font.size.callout};

  ${MeterRoot} {
    flex-direction: row-reverse;
  }
`;

export const ResultGradeHidden = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const ResultManageText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.callout};
  line-height: 1.6;
`;

/* ---------- 질문 탭 ---------- */

export const ResultQuestionNavTitle = styled.span`
  display: -webkit-box;
  overflow: hidden;
  font-size: ${({ theme }) => theme.font.size.callout};
  font-weight: 700;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const ResultQuestionNavType = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const ResultQuestionNav = styled.nav`
  ${({ theme: t }) => css`
    position: sticky;
    top: 16px;

    ol {
      display: grid;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    button {
      display: grid;
      grid-template-columns: 2.4em minmax(0, 1fr);
      gap: 2px 4px;
      width: 100%;
      padding: 9px 10px;
      border: 0;
      border-radius: ${t.radius.m};
      background: none;
      color: ${t.colors.core.glyph.secondary};
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    button:hover {
      background: ${t.colors.components.fill.primary};
    }
    button[aria-current='true'] {
      background: ${t.colors.background.primary};
      box-shadow: inset 0 0 0 1px ${t.colors.core.line};
      color: ${t.colors.core.glyph.primary};
    }
    button:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
    ${QCardNumber} {
      grid-row: 1 / span 2;
      padding-top: 1px;
    }

    @media (max-width: 860px) {
      position: static;
      overflow-x: auto;

      ol {
        grid-auto-columns: 220px;
        grid-auto-flow: column;
      }
    }
  `}
`;

export const ResultQuestion = styled.div`
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  align-items: start;
  gap: 20px;
  margin-top: 24px;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ResultQuestionHead = styled(PanelTitle)`
  align-items: center;
  padding-block: 8px;
  font-weight: 400;
`;

const pager = css`
  ${({ theme: t }) => css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    font-variant-numeric: tabular-nums;

    strong {
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const ResultQuestionPager = styled.span`
  ${pager}
`;

export const ResultQuestionContent = styled.div`
  display: grid;
  gap: 28px;
  padding: 18px 20px 22px;
`;

export const ResultQuestionTitle = styled.div`
  display: grid;
  justify-items: start;
  gap: 6px;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.core.glyph.primary};
    font-size: ${({ theme }) => theme.font.size.headline};
    font-weight: 700;
    line-height: 1.45;
  }
`;

export const ResultSectionHead = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
    margin-bottom: 10px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};

    h3 {
      margin: 0;
      color: ${t.colors.core.glyph.primary};
      font-size: ${t.font.size.callout};
      font-weight: 700;
    }
  `}
`;

export const ResultSectionNote = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const ResultCrosstabFoot = styled.tr``;

export const ResultCrosstab = styled(DataTable)`
  ${({ theme: t }) => css`
    th[scope='row'] {
      color: ${t.colors.core.glyph.primary};
      font-weight: 400;
    }
    td small {
      display: block;
      color: ${t.colors.core.glyph.tertiary};
      font-size: ${t.font.size.footnote};
    }
    ${ResultCrosstabFoot} > * {
      background: ${t.colors.components.fill.primary};
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

/** 교차표 칸: 열에서 가장 많은 값은 굵게 */
export const CrosstabCell = styled(DataCell)<{ $top: boolean }>`
  && {
    ${({ $top }) => $top && 'font-weight: 700;'}
  }
`;

/* 질문 탭: 주관식 */
export const ResultTextBar = styled(FilterBar)`
  margin-bottom: 12px;
`;

export const TextAnswerList = styled.ul`
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.core.outline};
  border-radius: ${({ theme }) => theme.radius.m};
  list-style: none;

  > li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
  }
`;

export const TextGroupLabel = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  font-weight: 700;
`;

export const TextGroupVariants = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
  white-space: nowrap;
`;

export const TextGroupCount = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.callout};
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
`;

const textGroupRow = css`
  display: grid;
  grid-template-columns: 1em minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  font-size: ${({ theme }) => theme.font.size.callout};

  > ${TextGroupCount} {
    grid-column: 4;
  }
`;

/** 표현이 하나뿐인 답: 펼칠 수 있는 답과 줄을 맞춘다 */
export const TextGroupRow = styled.div`
  ${textGroupRow}

  &::before {
    content: '';
  }
`;

export const TextGroupDetails = styled.details`
  ${({ theme: t }) => css`
    display: block;
    padding: 0;

    summary {
      ${textGroupRow}
      cursor: pointer;
      list-style: none;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    summary::before {
      content: '›';
      color: ${t.colors.core.glyph.tertiary};
      font-weight: 700;
      transition: transform 120ms ease-out;
    }
    &[open] summary::before {
      transform: rotate(90deg);
    }
    summary:hover {
      background: ${t.colors.components.fill.primary};
    }
    summary:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: -2px;
    }

    @media (prefers-reduced-motion: reduce) {
      summary::before {
        transition: none;
      }
    }
  `}
`;

export const TextGroupList = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    gap: 6px;
    max-width: 34em;
    margin: 0;
    padding: 0 14px 14px calc(14px + 1em + 12px);
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    list-style: none;

    li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-variant-numeric: tabular-nums;
    }
  `}
`;

export const TextRaw = styled.div`
  display: grid;
  gap: 4px;
  padding: 12px 14px;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.core.glyph.primary};
    font-size: ${({ theme }) => theme.font.size.callout};
    line-height: 1.7;
    white-space: pre-wrap;
  }
`;

/** 다음 화살표: 이전 화살표 아이콘을 뒤집어 쓴다 */
export const NextIconButton = styled(PlainIconButton)`
  svg {
    transform: scaleX(-1);
  }
`;

/* ---------- 개별 보기 ---------- */

export const ResultPager = styled.div`
  ${pager}
  flex-wrap: wrap;
  margin-top: 24px;
`;

export const ResultPagerPosition = styled.span`
  min-width: 6.5em;
  text-align: center;
`;

export const ResultPagerFilter = styled.span`
  ${({ theme: t }) => css`
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 10px;
    margin-left: 8px;
    padding-left: 14px;
    border-left: 1px solid ${t.colors.core.outline};
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/** 개별 보기의 2단: 넘기기 줄 바로 아래 */
export const ResponseLayout = styled(ResultLayout)`
  ${ResultPager} + & {
    margin-top: 16px;
  }
`;

export const AnswerSheet = styled.div<{ $excluded: boolean }>`
  display: grid;
  gap: 12px;
  ${({ $excluded }) => $excluded && 'opacity: 0.55;'}
`;

export const AnswerViewType = styled.span`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
  font-weight: 400;
`;

export const AnswerViewOptions = styled.ul`
  display: grid;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
`;

export const AnswerViewOption = styled.li<{ $picked: boolean }>`
  ${({ theme: t, $picked }) => css`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
    ${
      $picked &&
      css`
        border-color: ${t.colors.core.glyph.primary};
        box-shadow: inset 0 0 0 1px ${t.colors.core.glyph.primary};
        color: ${t.colors.core.glyph.primary};
        font-weight: 700;
      `
    }
  `}
`;

export const AnswerViewScale = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const AnswerViewScaleStep = styled.li<{ $picked: boolean }>`
  ${({ theme: t, $picked }) => css`
    display: grid;
    place-items: center;
    min-height: 44px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    color: ${t.colors.core.glyph.tertiary};
    font-variant-numeric: tabular-nums;
    ${
      $picked &&
      css`
        border-color: ${t.colors.components.fill.inverted.primary};
        background: ${t.colors.components.fill.inverted.primary};
        color: ${t.colors.core.glyph.inverted.primary};
        font-weight: 700;
      `
    }
  `}
`;

export const AnswerViewText = styled.p`
  ${({ theme: t }) => css`
    margin: 14px 0 0;
    padding: 12px 14px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    line-height: 1.7;
    white-space: pre-wrap;
  `}
`;

export const AnswerViewEmpty = styled.p`
  margin: 14px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.callout};
`;

export const ResponseActions = styled(PanelBody)`
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
`;

/* ---------- 응답 삭제 확인 ---------- */

export const ConfirmDialogRoot = styled.dialog`
  ${({ theme: t }) => css`
    width: min(100% - 32px, 440px);
    padding: 0;
    border: 1px solid ${t.colors.core.line};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    color: ${t.colors.core.glyph.primary};

    &::backdrop {
      background: rgb(8 10 12 / 0.5);
    }
  `}
`;

export const ConfirmDialogTitle = styled.h2`
  margin: 0;
  padding: 20px 22px 0;
  font-size: ${({ theme }) => theme.font.size.headline};
  font-weight: 700;
`;

export const ConfirmDialogBody = styled.div`
  padding: 10px 22px 0;
  color: ${({ theme }) => theme.colors.core.glyph.secondary};
  font-size: ${({ theme }) => theme.font.size.callout};
  line-height: 1.6;
`;

export const ConfirmDialogActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 20px 22px;
`;

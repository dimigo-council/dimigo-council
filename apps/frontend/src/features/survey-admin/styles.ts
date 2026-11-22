/* 학생회 설문: 설문 만들기 · 설문 결과 (Figma 학생회 / 설문) */
import styled, { css } from 'styled-components';
import { chipStyles, InputBox } from '../../dimi-ui-kit/index.ts';

/**
 * 흰 카드. Figma 문항 편집·설문 결과 카드는 안쪽 32, 설문 설정은 28.
 * Figma의 자식 간격 18은 kit Spacing에 없어 20으로 쓴다.
 */
export const Sheet = styled.section<{ $compact?: boolean }>`
  ${({ theme: t, $compact }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[500]};
    min-width: 0;
    padding: ${$compact ? t.spacing[600] : t.spacing[700]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    h2 {
      ${t.text.headlineStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

/** 설문 만들기: 문항 편집(760) + 설문 설정(416) */
export const EditorLayout = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 416px;
    align-items: start;
    gap: ${t.spacing[550]};

    @media (max-width: 1000px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `}
`;

export const SideColumn = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[500]};
  `}
`;

/** 제목 위, 입력 아래로 쌓는 칸 (Figma Field: 제목 Callout/Strong, 사이 8) */
export const Field = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[200]};

    > label,
    > span:first-child {
      ${t.text.calloutStrong}
      color: ${t.colors.core.glyph.primary};
    }
    > p {
      ${t.text.paragraphLarge}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

export const FieldLabelText = styled.span`
  ${({ theme: t }) => css`
    ${t.text.calloutStrong}
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const RadioGroup = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[500]};
`;

/** 문항 하나 (Background/Secondary, 안쪽 20, 사이 12) */
export const QuestionBlock = styled.fieldset`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[300]};
    min-width: 0;
    margin: 0;
    padding: ${t.spacing[500]};
    border: 0;
    border-radius: ${t.radius.m};
    background: ${t.colors.background.secondary};
  `}
`;

export const QuestionHead = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};

    > :first-child {
      flex: 1;
      min-width: 0;
    }
  `}
`;

/** 문항 형식 고르기: kit Chip(Outlined) 모양의 select */
export const TypeSelect = styled.select`
  ${({ theme: t }) => css`
    ${chipStyles(t, { theme: 'outlined' })}
    flex: none;
    padding: ${t.spacing[150]} ${t.spacing[300]};
    border: 0;
    font-family: ${t.font.family};
    ${t.text.footnoteRegular}
    color: ${t.colors.core.glyph.secondary};
    cursor: pointer;
  `}
`;

/** 선택지 한 줄: 모양만 보여주는 Control + 입력 */
export const OptionRow = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};

    > ${InputBox} {
      flex: 1;
    }
  `}
`;

export const AnswerPreview = styled.div`
  ${({ theme: t }) => css`
    ${t.text.bodyWeak}
    min-height: 120px;
    box-sizing: border-box;
    padding: ${t.spacing[400]};
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const RowActions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[300]};
  `}
`;

/** 설정 카드 아래 버튼 줄 (임시 저장 · 설문 게시) */
export const EditorActions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    gap: ${t.spacing[500]};
    padding: 0 ${t.spacing[150]};

    > :last-child {
      flex: 1;
    }
  `}
`;

/** 응답 학년: kit OptionPicker 모양, 여러 학년을 고를 수 있다 */
export const GradePicker = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    gap: ${t.spacing[200]};
    padding: ${t.spacing[300]} 0;

    > button {
      flex: 1 1 0;
      min-width: 0;
    }
  `}
`;

export const FormError = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.status.negative};
  `}
`;

/* ---------- 설문 결과 ---------- */

export const SummaryText = styled.p`
  ${({ theme: t }) => css`
    ${t.text.paragraphLarge}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

/** 응답자 · 참여율 · 마감까지 */
export const Stats = styled.dl`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${t.spacing[550]};
    margin: 0;

    > div {
      display: grid;
      gap: ${t.spacing[200]};
      padding: ${t.spacing[500]};
      border-radius: ${t.radius.m};
      background: ${t.colors.background.secondary};
    }
    dt {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.tertiary};
    }
    dd {
      ${t.text.headlineStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    @media (max-width: 700px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `}
`;

export const QuestionHeading = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[150]};

    > h2 {
      ${t.text.headlineStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    > p {
      ${t.text.footnoteRegular}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

/** 선택지별 비율: 이름 150 · 막대 · 비율 80 */
export const ResultRow = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr) 80px;
    align-items: center;
    gap: ${t.spacing[400]};
    max-width: 1042px;
    ${t.text.calloutStrong}
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const ResultBar = styled.span`
  ${({ theme: t }) => css`
    display: block;
    height: 12px;
    overflow: hidden;
    border-radius: ${t.radius.m};
    background: ${t.colors.background.secondary};

    > span {
      display: block;
      height: 100%;
      border-radius: ${t.radius.s};
      background: ${t.colors.core.status.accent};
    }
  `}
`;

/** 단답형·장문형 답 목록 */
export const TextAnswers = styled.ul<{ $long?: boolean }>`
  ${({ theme: t, $long }) => css`
    margin: 0;
    padding: 0;
    list-style: none;

    > li {
      ${$long ? t.text.paragraphSmall : t.text.calloutRegular}
      padding: ${t.spacing[300]} 0;
      border-bottom: 1px solid ${t.colors.core.line};
      color: ${t.colors.core.glyph.primary};
    }
    > li:last-child {
      border-bottom: 0;
    }
  `}
`;

export const MoreRow = styled.div`
  display: flex;
`;

export const Empty = styled.p`
  ${({ theme: t }) => css`
    ${t.text.calloutRegular}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const PageActions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${t.spacing[300]};

    > * {
      min-width: 160px;
    }
  `}
`;

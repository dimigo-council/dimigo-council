/* 설문 목록 · 설문 응답 (업무공간 설문 미리보기·응답 보기도 함께 쓴다) */
import styled, { css } from 'styled-components';
import {
  ChoiceInput,
  FieldCount,
  Notice,
  OptionCardBox,
  OptionCardText,
} from '../../components/ui/index.ts';

export const SurveyPanel = styled.div`
  margin: 20px 0 24px;
`;

export const SurveyDday = styled.strong<{ $soon?: boolean }>`
  ${({ theme: t, $soon }) => css`
    color: ${$soon ? t.colors.core.glyph.accent : t.colors.core.glyph.primary};
    font-size: ${t.font.size.body};
    font-weight: 800;
  `}
`;

/* ---------- 응답 화면 ---------- */

export const SurveyPage = styled.div`
  max-width: 600px;
  margin-inline: auto;
`;

export const SurveyIntro = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 16px;
`;

export const SurveyQuestions = styled.fieldset`
  display: grid;
  gap: 12px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`;

export const Question = styled.section`
  ${({ theme: t }) => css`
    padding: 20px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    ${OptionCardBox} {
      align-items: center;
    }
    ${OptionCardText} {
      padding-top: 0;
    }
  `}
`;

export const QuestionTitle = styled.h2`
  ${({ theme: t }) => css`
    display: flex;
    gap: 10px;
    margin: 0;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.body};
    font-weight: 700;
    line-height: 1.5;
  `}
`;

export const QuestionNumber = styled.span`
  flex: none;
  min-width: 1.2em;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-variant-numeric: tabular-nums;
`;

export const QuestionRequired = styled.span`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
  font-weight: 400;
`;

export const QuestionHint = styled.p`
  margin: 4px 0 0;
  padding-left: calc(1.2em + 10px);
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const QuestionOptions = styled.div`
  margin-top: 14px;
  display: grid;
  gap: 8px;
`;

export const QuestionText = styled.div`
  margin-top: 14px;
  display: grid;
  gap: 6px;

  textarea {
    min-height: 100px;
    padding: 10px 12px;
    line-height: 1.6;
    resize: vertical;
  }
  ${FieldCount} {
    font-size: ${({ theme }) => theme.font.size.footnote};
    text-align: right;
  }
`;

/* ---------- 척도 ---------- */

export const Scale = styled.div`
  margin-top: 14px;
`;

export const ScaleOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  gap: 8px;
`;

export const ScaleItem = styled.label`
  display: flex;
  cursor: pointer;
`;

export const ScaleBox = styled.span`
  ${({ theme: t }) => css`
    display: grid;
    flex: 1;
    place-items: center;
    min-height: 44px;
    border: 1px solid ${t.colors.core.line};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    font-variant-numeric: tabular-nums;

    ${ScaleItem}:hover & {
      background: ${t.colors.components.fill.primary};
    }
    ${ChoiceInput}:checked + & {
      border-color: ${t.colors.components.fill.inverted.primary};
      background: ${t.colors.components.fill.inverted.primary};
      color: ${t.colors.core.glyph.inverted.primary};
      font-weight: 700;
    }
    ${ChoiceInput}:focus-visible + & {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
    ${ChoiceInput}:disabled + & {
      border-color: ${t.colors.core.outline};
      cursor: not-allowed;
    }
    ${ChoiceInput}:disabled:not(:checked) + & {
      background: ${t.colors.components.fill.primary};
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

export const ScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

/* ---------- 제출 줄 ---------- */

export const SurveyError = styled(Notice)`
  margin-top: 16px;
`;

export const SurveySubmit = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
`;

export const SurveySubmitHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.callout};
`;

export const SurveySubmitActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

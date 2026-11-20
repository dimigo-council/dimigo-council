/* 업무공간 안건: 안건 목록 · 안건 상세 */
import styled, { css } from 'styled-components';
import { SplitLayout, SplitMain } from '../../components/ui/index.ts';

/* ---------- 목록 ---------- */

export const AgendaBoard = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;

export const AgendaBoardNote = styled.p`
  margin: -8px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

/* 단계 막대 */
export const StageBar = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const StageBarTrack = styled.span`
  display: inline-flex;
  gap: 2px;
`;

export const StageBarStep = styled.span<{ $on: boolean; $stopped: boolean }>`
  ${({ theme: t, $on, $stopped }) => css`
    width: 10px;
    height: 3px;
    border-radius: 1px;
    background: ${
      !$on
        ? t.colors.core.outline
        : $stopped
          ? t.colors.core.line
          : t.colors.components.fill.inverted.primary
    };
  `}
`;

export const StageBarLabel = styled.span`
  display: inline-flex;
  gap: 6px;
  font-weight: 700;
`;

export const StageBarNote = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-weight: 400;
`;

/* ---------- 상세 ---------- */

export const AdvanceConfirm = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 14px;
    border: 1px solid ${t.colors.core.line};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    p {
      margin: 0 8px 0 0;
      font-size: ${t.font.size.callout};
    }
  `}
`;

export const AgendaTabs = styled.div`
  margin-top: 24px;
`;

export const AgendaSplit = styled(SplitLayout)`
  ${AgendaTabs} + & {
    margin-top: 20px;
  }
  ${AgendaTabs} + & ${SplitMain} {
    align-content: start;
  }
`;

export const RecordComposerInput = styled.textarea`
  ${({ theme: t }) => css`
    display: block;
    width: 100%;
    min-height: 84px;
    padding: 14px 16px;
    border: 0;
    border-bottom: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m} ${t.radius.m} 0 0;
    background: transparent;
    color: ${t.colors.core.glyph.primary};
    font: inherit;
    font-size: ${t.font.size.callout};
    line-height: 1.6;
    resize: vertical;

    &::placeholder {
      color: ${t.colors.core.glyph.tertiary};
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: -2px;
    }
  `}
`;

export const RecordComposerBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding: 12px 14px;
`;

export const RecordComposerHint = styled.p`
  flex: 1 1 200px;
  margin: 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
  line-height: 1.5;
`;

export const DecisionList = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 16px 18px;
    list-style: none;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;

    li {
      position: relative;
      padding-left: 16px;
    }
    li::before {
      content: '';
      position: absolute;
      top: 0.8em;
      left: 0;
      width: 8px;
      height: 2px;
      background: ${t.colors.components.fill.inverted.primary};
    }
  `}
`;

/* 업무·연결된 건의·보고서 탭 */
export const AgendaLinked = styled.div`
  display: grid;
  gap: 12px;
`;

export const AgendaLinkedAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;

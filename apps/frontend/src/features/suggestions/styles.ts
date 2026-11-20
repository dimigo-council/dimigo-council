/* 건의: 내 건의 · 새 건의 · 건의 상세 */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import {
  ButtonLabel,
  Choice,
  ControlBox,
  ListRowItem,
  Panel,
  PanelBody,
} from '../../components/ui/index.ts';

/* ---------- 내 건의 ---------- */

export const SuggestionList = styled.div`
  margin: 16px 0 0;
`;

export const SuggestionRow = styled(ListRowItem)`
  flex-wrap: wrap;
  align-items: flex-start;
`;

export const SuggestionReply = styled.p`
  ${({ theme: t }) => css`
    flex-basis: 100%;
    margin: 0;
    padding: 10px 12px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;

    strong {
      margin-right: 6px;
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

/* ---------- 새 건의 ---------- */

export const SuggestionForm = styled(Panel)`
  display: grid;
  gap: 18px;
  padding: 24px;
`;

export const PhotoPicker = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    padding: 14px 16px;
    border: 1px dashed ${t.colors.core.line};
    border-radius: ${t.radius.m};
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
  `}
`;

export const PhotoPickerText = styled.span`
  flex: 1;
  min-width: 12em;
`;

/** 파일 고르기 버튼. 비활성일 때 kit Button의 채움색은 그대로 둔다. */
export const PhotoPickerButton = styled(ButtonLabel)`
  ${({ theme: t }) => css`
    &:has(input:focus-visible) {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
    &:has(input:disabled) {
      border-color: ${t.colors.core.outline};
      cursor: not-allowed;
    }
  `}
`;

export const PhotoList = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: ${({ theme }) => theme.font.size.callout};

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    overflow-wrap: anywhere;
  }
`;

export const SimilarList = styled.ul`
  display: grid;
  margin: 0;
  padding: 0 18px;
  list-style: none;

  li {
    display: grid;
    gap: 6px;
    padding: 14px 0;
  }
  li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
  }
`;

export const SimilarTitle = styled(Link)`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
  `}
`;

export const SimilarMeta = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const AfterSteps = styled.ol`
  ${({ theme: t }) => css`
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 16px 18px 16px 36px;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;

    li::marker {
      color: ${t.colors.core.glyph.primary};
      font-weight: 700;
    }
    strong {
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

/* ---------- 건의 상세 ---------- */

export const LinkedAgenda = styled.section`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 16px;
    padding: 16px 18px;
    border: 1px solid
      color-mix(in oklab, ${t.colors.core.status.info} 25%, transparent);
    border-radius: ${t.radius.m};
    background: ${t.colors.core.status.translucent.info};
  `}
`;

export const LinkedAgendaLabel = styled.p`
  margin: 0 0 4px;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const LinkedAgendaTitle = styled.h2`
  margin: 0 0 6px;
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: 700;
`;

export const Messages = styled.ol`
  margin: 0;
  padding: 0 18px;
  list-style: none;
`;

export const Message = styled.li`
  display: flex;
  gap: 12px;
  padding: 18px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
  }
`;

export const MessageBody = styled.div`
  display: grid;
  justify-items: start;
  gap: 6px;
  min-width: 0;
`;

export const MessageHead = styled.p`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};

    strong {
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const MessageText = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    line-height: 1.7;
    white-space: pre-wrap;
  `}
`;

export const CommentActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
`;

export const CommentActionsHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const NotifyList = styled(PanelBody)`
  ${Choice} {
    align-items: flex-start;
  }
  ${Choice} ${ControlBox} {
    margin-top: -2px;
  }
`;

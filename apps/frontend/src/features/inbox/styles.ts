/* 업무공간 건의 접수함 */
import styled, { css } from 'styled-components';
import { TextAreaControl } from '../../dimi-ui-kit/index.ts';

export const InboxPanel = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;

export const InboxPanelNote = styled.p`
  margin: -8px 0 0;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const InboxAnswer = styled.p`
  ${({ theme: t }) => css`
    flex-basis: 100%;
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
    white-space: pre-wrap;

    strong {
      margin-right: 4px;
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const InboxResolve = styled.form`
  ${({ theme: t }) => css`
    display: grid;
    flex-basis: 100%;
    gap: 12px;
    padding: 16px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};

    ${TextAreaControl} {
      min-height: 88px;
    }
  `}
`;

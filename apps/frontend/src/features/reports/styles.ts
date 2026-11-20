/* 업무공간 보고서 */
import styled, { css } from 'styled-components';
import { Panel } from '../../components/ui/index.ts';

export const ReportPanel = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;

/* ---------- 보고서 쓰기 ---------- */

export const ReportForm = styled(Panel)`
  display: grid;
  gap: 8px;
  max-width: 760px;
  margin-top: 24px;
`;

export const ReportFormRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 4px 12px;

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* ---------- 검토 ---------- */

export const ReviewHint = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
  `}
`;

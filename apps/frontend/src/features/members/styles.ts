/* 업무공간 구성원·권한 */
import styled, { css } from 'styled-components';
import { DataTable, SelectBox } from '../../components/ui/index.ts';

export const MemberBoard = styled.div`
  display: grid;
  gap: 16px;
`;

export const MemberTable = styled(DataTable)`
  min-width: 640px;

  /* 권한 칸의 작은 선택 상자 */
  ${SelectBox} {
    width: auto;
    min-width: 110px;
    min-height: 32px;
    padding: 0 28px 0 10px;
    font-size: ${({ theme }) => theme.font.size.callout};
  }
`;

export const PermissionNotes = styled.dl`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: 4px 20px;
    margin: -8px 0 0;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};

    div {
      display: flex;
      gap: 6px;
    }
    dt {
      color: ${t.colors.core.glyph.secondary};
      font-weight: 700;
    }
    dd {
      margin: 0;
    }
  `}
`;

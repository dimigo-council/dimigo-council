/* 학생회 구성원·권한 */
import styled, { css } from 'styled-components';
import { Card, DataTable, ListRowItem } from '../../components/ui/index.ts';

export const MemberBoard = styled.div`
  display: grid;
  gap: 16px;
`;

export const MemberTable = styled(DataTable)`
  min-width: 640px;
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

/* ---------- 관리자: 구성원 · 부서 관리 ---------- */

export const AdminBoard = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[550]};
`;

/** 목록 카드: 안쪽 28 (질의함 목록 카드와 같다) */
export const ListCard = styled(Card)`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[400]};
    padding: ${t.spacing[600]};
  `}
`;

export const ListHead = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${t.spacing[300]};
  `}
`;

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

/** 고른 사람 행 */
export const PersonRow = styled(ListRowItem)`
  ${({ theme: t }) => css`
    &[aria-current='true'] {
      background: ${t.colors.background.secondary};
    }
  `}
`;

export const RowBadges = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[100]};
`;

export const ListFoot = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/** 오른쪽 카드: 안쪽 28, 사이 24 (질의함 처리 패널과 같다) */
export const SideCard = styled(Card)`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[550]};
    padding: ${t.spacing[600]};

    @media (min-width: 961px) {
      position: sticky;
      top: 96px;
    }
  `}
`;

export const PanelTitle = styled.h2`
  ${({ theme: t }) => css`
    ${t.text.headlineStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const Facts = styled.dl`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: ${t.spacing[150]} ${t.spacing[400]};
    margin: 0;

    dt {
      color: ${t.colors.core.glyph.tertiary};
    }
    dd {
      margin: 0;
      color: ${t.colors.core.glyph.primary};
      overflow-wrap: anywhere;
    }
  `}
`;

export const Section = styled.section`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[400]};
    padding-top: ${t.spacing[550]};
    border-top: 1px solid ${t.colors.core.outline};
  `}
`;

export const SectionTitle = styled.h3`
  ${({ theme: t }) => css`
    ${t.text.calloutStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const SectionText = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

export const Actions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: ${t.spacing[200]};

    > :first-child:not(:only-child) {
      margin-right: auto;
    }
  `}
`;

/** 확인 문구 아래 취소 · 확인 버튼 */
export const ConfirmActions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    justify-content: flex-end;
    gap: ${t.spacing[200]};
    margin-top: ${t.spacing[300]};
  `}
`;

/** 부서 이름 바꾸기: 입력칸 + 버튼 한 줄 */
export const InlineForm = styled.form`
  ${({ theme: t }) => css`
    display: flex;
    flex: 1;
    align-items: center;
    gap: ${t.spacing[200]};
    min-width: 0;

    > :first-child {
      flex: 1;
      min-width: 0;
    }
  `}
`;

export const DepartmentRow = styled(ListRowItem)`
  flex-wrap: wrap;

  > [role='alert'],
  > [role='status'] {
    flex-basis: 100%;
  }
`;

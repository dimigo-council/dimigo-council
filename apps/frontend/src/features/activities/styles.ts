/* 활동: 활동 목록 · 활동 상세 · 활동 등록 */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { chipStyles } from '../../dimi-ui-kit/index.ts';
import { Card, CardHead, CardTitle, Stack } from '../../components/ui/index.ts';

/** Figma Toolbar: 칩 위아래 4 */
export const Filters = styled.div`
  padding: ${({ theme }) => theme.spacing[100]} 0;
`;

/* ---------- 상세 ---------- */

export const HeadCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[700]};
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const HeadMain = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[300]};
  min-width: 0;
  flex: 1 1 480px;
`;

export const HeadBadges = styled.div`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[200]};
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const HeadTitle = styled.h1`
  ${({ theme: t }) => css`
    ${t.text.titleStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

/** 등록·추가 화면 제목 */
/** Figma "Page heading": 높이 56 (제목 34 + 아래 여백) */
export const PageTitle = styled(HeadTitle)`
  min-height: ${({ theme }) => theme.height[400]};
`;

export const Restored = styled.div``;

export const HeadDescription = styled.p`
  ${({ theme: t }) => css`
    ${t.text.calloutWeak}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

export const HeadMeta = styled.ul`
  ${({ theme: t }) => css`
    ${t.text.calloutRegular}
    display: flex;
    flex-wrap: wrap;
    gap: ${t.spacing[200]} ${t.spacing[550]};
    margin: 0;
    padding: 0;
    color: ${t.colors.core.glyph.secondary};
    list-style: none;

    li {
      display: inline-flex;
      align-items: center;
      gap: ${t.spacing[150]};
    }
    a {
      color: inherit;
    }
  `}
`;

export const HeadActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const ShareStatus = styled.span`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/* 활동 계획서 */
export const PlanList = styled.dl`
  ${({ theme: t }) => css`
    ${t.text.calloutRegular}
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    margin: 0;
    color: ${t.colors.core.glyph.primary};

    /* Figma Row: 위 테두리 Outline, 위아래 12, 이름과 값 사이 16 */
    dt,
    dd {
      padding: ${t.spacing[300]} 0;
      border-top: 1px solid ${t.colors.core.outline};
    }
    dt {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.tertiary};
    }
    dd {
      margin: 0;
      padding-left: ${t.spacing[400]};
    }
    ol,
    ul {
      display: grid;
      gap: ${t.spacing[100]};
      margin: 0;
      padding: 0;
      list-style: none;
    }
    ol {
      gap: ${t.spacing[200]};
    }
    ol li {
      display: grid;
      gap: ${t.spacing[100]};
    }
    ol strong {
      ${t.text.calloutStrong}
    }
    ol span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

/* 업무 · 연결된 질의 · 연결된 설문 */
export const MiniList = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[300]};
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      align-items: center;
      gap: ${t.spacing[300]};
      min-width: 0;
    }
  `}
`;

export const MiniTitle = styled.span<{ $done?: boolean }>`
  ${({ theme: t, $done }) => css`
    ${t.text.calloutRegular}
    flex: 1;
    min-width: 0;
    color: ${$done ? t.colors.core.glyph.tertiary : t.colors.core.glyph.primary};
    ${$done && 'text-decoration: line-through;'}
  `}
`;

export const MiniTitleLink = styled(Link)`
  ${({ theme: t }) => css`
    ${t.text.calloutStrong}
    flex: 1;
    min-width: 0;
    color: ${t.colors.core.glyph.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `}
`;

export const MiniAside = styled.span`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    flex: none;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const SurveyIcon = styled.span`
  ${({ theme: t }) => css`
    display: inline-grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    color: ${t.colors.core.glyph.secondary};
  `}
`;

export const ScopeOptions = styled.div`
  display: grid;
  gap: 8px;
`;

/* 이력 추가 */
export const HistoryForm = styled.form`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[300]};
    margin-bottom: ${t.spacing[550]};
    padding: ${t.spacing[400]};
    border-radius: ${t.radius.l};
    background: ${t.colors.background.secondary};
  `}
`;

export const HistoryFormRow = styled.div`
  display: grid;
  grid-template-columns: 140px 160px minmax(0, 1fr);
  gap: 8px;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Empty = styled.p`
  ${({ theme: t }) => css`
    ${t.text.calloutWeak}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/* ---------- 등록 ---------- */

/** 등록 화면: 내용 카드(760) + 설정 카드(416) */
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 416px;
  align-items: start;
  gap: ${({ theme }) => theme.spacing[550]};

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/** Figma 카드: 안쪽 32. 자식 간격 18은 kit Spacing에 없어 20으로 쓴다. */
export const FormCard = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing[500]};
  padding: ${({ theme }) => theme.spacing[700]};
`;

/** 화면 전체 form: Body처럼 자식 사이 24 */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[550]};
`;

export const LinkedInquiries = styled.div`
  display: grid;
  gap: 8px;
`;

export const LinkedInquiryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  > :first-child {
    flex: 1;
    min-width: 0;
  }
`;

/** 아래 버튼 줄: 임시 저장(140) · 등록(160) */
export const FormButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[300]};

  > :nth-child(1) {
    min-width: 120px;
  }
  > :nth-child(2) {
    min-width: 160px;
  }
`;

/** 추진 이력 카드: 안쪽 32, 제목과 이력 사이 24 */
export const TimelineCard = styled(Card)`
  ${({ theme: t }) => css`
    padding: ${t.spacing[700]};

    ${CardHead} {
      margin-bottom: ${t.spacing[550]};
    }
  `}
`;

/** 오른쪽 카드 열: 카드 제목은 Body/Strong, 제목 줄과 내용 사이 16 */
export const Side = styled(Stack)`
  ${({ theme: t }) => css`
    ${CardTitle} {
      ${t.text.bodyStrong}
    }
    ${CardHead} {
      margin-bottom: ${t.spacing[400]};
    }
  `}
`;

/** 이력의 연결 자료: kit Chip(Outlined) 모양 링크 */
export const ChipLink = styled(Link)`
  ${({ theme: t }) => css`
    ${chipStyles(t, { theme: 'outlined' })}
    align-self: flex-start;
    text-decoration: none;
  `}
`;

export const SurveyText = styled.span`
  ${({ theme: t }) => css`
    display: grid;
    flex: 1;
    gap: ${t.spacing[50]};
    min-width: 0;

    > a {
      ${t.text.calloutStrong}
      color: ${t.colors.core.glyph.primary};
      text-decoration: none;
    }
    > a:hover {
      text-decoration: underline;
    }
    > span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

/* 홈(학생·학생회)과 랜딩이 함께 쓰는 조각 */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';

export const Greeting = styled.header`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${t.spacing[400]};

    > div:first-child {
      display: grid;
      gap: ${t.spacing[150]};
    }

    h1 {
      ${t.text.titleStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
    p {
      ${t.text.bodyWeak}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

export const Metrics = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${t.spacing[500]};
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `}
`;

export const Metric = styled.li`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[400]};
    padding: ${t.spacing[550]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    > h2 {
      ${t.text.calloutRegular}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
    }
    > p {
      ${t.text.footnoteRegular}
      margin: 0;
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

export const MetricValue = styled.strong`
  ${({ theme: t }) => css`
    ${t.text.titleStrong}
    color: ${t.colors.core.glyph.primary};

    > span {
      ${t.text.calloutWeak}
      margin-left: ${t.spacing[100]};
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

/** 홈 오른쪽 "내 질의" · "나의 업무" 목록 */
export const SideList = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing[200]};
  margin: 0;
  padding: ${({ theme }) => theme.spacing[100]} 0 0;
  list-style: none;
`;

export const InquiryItem = styled.li`
  ${({ theme: t }) => css`
    position: relative;
    display: grid;
    gap: ${t.spacing[200]};
    padding: ${t.spacing[400]} 0;
    border-bottom: 1px solid ${t.colors.core.line};

    &:last-child {
      border-bottom: 0;
    }
  `}
`;

export const ItemLink = styled(Link)`
  ${({ theme: t }) => css`
    ${t.text.bodyStrong}
    color: ${t.colors.core.glyph.primary};
    text-decoration: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    &:hover {
      text-decoration: underline;
    }
  `}
`;

export const ItemMeta = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[200]};
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/** 나의 업무: 제목 줄과 첫 업무 사이 8 (제목 줄 아래 4 + 사이 4) */
export const TaskList = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[100]};
    margin: -${t.spacing[100]} 0 0;
    padding: 0;
    list-style: none;
  `}
`;

/** 한 줄: 체크박스 · 제목(Callout) · 마감. 끝난 업무는 흐리게 줄을 긋는다. */
export const TaskItem = styled.li<{ $done?: boolean }>`
  ${({ theme: t, $done }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};
    padding: ${t.spacing[200]} 0;

    label {
      flex: 1;
      gap: ${t.spacing[300]};
      ${
        $done &&
        css`
          color: ${t.colors.core.glyph.tertiary};
          text-decoration: line-through;
        `
      }
    }
  `}
`;

export const TaskDue = styled.span<{ $today?: boolean }>`
  ${({ theme: t, $today }) => css`
    ${t.text.footnoteRegular}
    margin-left: auto;
    color: ${$today ? t.colors.core.glyph.accent : t.colors.core.glyph.tertiary};
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  `}
`;

export const Empty = styled.p`
  ${({ theme: t }) => css`
    ${t.text.calloutWeak}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/* 랜딩: 왼쪽 소개(400) + 오른쪽 활동 현황(776), 사이 24 */
export const Landing = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: 400px minmax(0, 1fr);
    align-items: center;
    gap: ${t.spacing[550]};

    @media (max-width: 960px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `}
`;

export const Hero = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    justify-items: start;
    gap: ${t.spacing[700]};

    > div:first-child {
      display: grid;
      gap: ${t.spacing[400]};
    }
    h1 {
      ${t.text.displayStrong}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
      white-space: pre-line;

      @media (max-width: 600px) {
        ${t.text.titleStrong}
      }
    }
    p {
      ${t.text.bodyRegular}
      margin: 0;
      color: ${t.colors.core.glyph.secondary};
    }
    > div:last-child {
      display: flex;
      flex-wrap: wrap;
      gap: ${t.spacing[300]};
    }
  `}
`;

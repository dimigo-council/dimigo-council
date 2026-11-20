/* 업무공간 업무: 업무 목록 · 업무 상세 */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { BadgeRoot, InputBox } from '../../dimi-ui-kit/index.ts';
import { MeterRoot } from '../../components/intranet/Meter.tsx';
import {
  AvatarGroupRoot,
  Choice,
  ChoiceInput,
  ChoiceLabel,
  commentInput,
  ListGroupRoot,
  ListRowItem,
  ListRowMain,
  Panel,
  SelectBox,
} from '../../components/ui/index.ts';
import type { TaskStatus } from './types.ts';

const narrow = '@media (max-width: 600px)';

/* ---------- 목록 ---------- */

export const TaskPanel = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;

export const NewTaskForm = styled(Panel)`
  display: grid;
  gap: 16px;
`;

export const NewTaskFields = styled.div`
  display: grid;
  grid-template-columns:
    minmax(0, 2fr) minmax(0, 2fr) minmax(0, 1.4fr)
    minmax(0, 1.2fr);
  gap: 4px 12px;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const TaskBoardGroup = styled.h2`
  ${({ theme: t }) => css`
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin: 0;
    padding: 10px 18px;
    border-bottom: 1px solid ${t.colors.core.outline};
    background: ${t.colors.components.fill.primary};
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.footnote};
    font-weight: 700;
  `}
`;

export const TaskBoard = styled.div`
  ${({ theme: t }) => css`
    overflow: hidden;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    ${ListGroupRoot} {
      border: 0;
      border-radius: 0;
    }
    > section + section ${TaskBoardGroup} {
      border-top: 1px solid ${t.colors.core.outline};
    }
  `}
`;

/* 상태 동그라미: 할 일 빈 원, 진행 중 반쯤 찬 원, 검토 요청 점선 원, 완료 찬 원 */
export const TaskStatusMark = styled.span<{ $status: TaskStatus }>`
  ${({ theme: t, $status }) => css`
    flex: none;
    width: 16px;
    height: 16px;
    border: 1.5px solid ${t.colors.core.line};
    border-radius: 50%;
    ${
      $status === '진행 중' &&
      css`
        border-color: ${t.colors.core.status.info};
        background: linear-gradient(
          90deg,
          ${t.colors.core.status.info} 50%,
          transparent 50%
        );
      `
    }
    ${
      $status === '검토 요청' &&
      css`
        border-style: dashed;
        border-color: ${t.colors.core.glyph.accent};
      `
    }
    ${
      $status === '완료' &&
      css`
        border-color: ${t.colors.core.status.positive};
        background: ${t.colors.core.status.positive};
      `
    }
  `}
`;

/* 업무 한 줄: 상태 · 담당자 · 마감을 고정 칸에 두어 줄마다 같은 자리에 오게 한다 */
export const TaskRowItem = styled(ListRowItem)`
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) 72px 70px 104px;

  > ${BadgeRoot}, > ${AvatarGroupRoot} {
    justify-self: start;
  }

  /* 좁은 화면: 제목 줄 아래에 상태 · 담당자 · 마감을 한 줄로 */
  ${narrow} {
    grid-template-columns: 16px 72px auto minmax(0, 1fr);
    row-gap: 10px;

    ${ListRowMain} {
      grid-column: 2 / -1;
    }
    > ${BadgeRoot} {
      grid-column: 2;
    }
  }
`;

export type DueTone = 'danger' | 'warn' | undefined;

const dueStyles = css<{ $tone?: DueTone }>`
  ${({ theme: t, $tone }) => css`
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    /* 정보 목록(dd) 글자색보다 앞선다 */
    ${
      $tone &&
      css`
        && {
          color: ${
            $tone === 'danger'
              ? t.colors.core.status.negative
              : t.colors.core.glyph.accent
          };
          font-weight: 700;
        }
      `
    }
  `}
`;

export const TaskRowDue = styled.span<{ $tone?: DueTone }>`
  ${dueStyles}
  min-width: 104px;
  text-align: right;

  ${narrow} {
    min-width: 0;
  }
`;

export const TaskDue = styled.dd<{ $tone?: DueTone }>`
  ${dueStyles}
`;

/* ---------- 상세 ---------- */

export const ChecklistMeter = styled.span`
  width: 120px;
  font-weight: 400;

  ${MeterRoot} {
    flex-direction: row-reverse;
  }
`;

export const Checklist = styled.ul`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 0 18px;
    list-style: none;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 0;
    }
    li + li {
      border-top: 1px solid ${t.colors.core.outline};
    }
    ${Choice}:has(${ChoiceInput}:checked) ${ChoiceLabel} {
      color: ${t.colors.core.glyph.tertiary};
      text-decoration: line-through;
    }
  `}
`;

export const ChecklistAdd = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px 18px 16px;

  ${Checklist} + & {
    border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
  }
  > ${InputBox} {
    flex: 1;
    min-width: 0;
  }
  ${SelectBox} {
    flex: 0 0 110px;
  }
`;

export const ChecklistOwner = styled.span`
  flex: none;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

export const Activity = styled.ol`
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 18px 18px 4px;
  list-style: none;
`;

export const ActivityItem = styled.li`
  display: flex;
  gap: 10px;
`;

export const ActivityBody = styled.div`
  display: grid;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const ActivityLine = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    padding-top: 2px;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};

    strong {
      color: ${t.colors.core.glyph.primary};
    }
    time {
      margin-left: 4px;
      color: ${t.colors.core.glyph.tertiary};
      font-variant-numeric: tabular-nums;
    }
  `}
`;

export const ActivityComment = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 10px 12px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
    white-space: pre-wrap;
  `}
`;

export const CommentForm = styled.form`
  display: flex;
  gap: 10px;
  padding: 16px 18px 18px;
`;

export const CommentField = styled.div`
  display: grid;
  flex: 1;
  gap: 10px;
  min-width: 0;

  > ${InputBox} {
    ${commentInput}
  }
`;

export const OutputList = styled.ul`
  ${({ theme: t }) => css`
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 16px 18px;
    list-style: none;

    li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      border: 1px solid ${t.colors.core.outline};
      border-radius: ${t.radius.m};
      color: ${t.colors.core.glyph.secondary};
    }
    svg {
      flex: none;
      margin-top: 2px;
    }
  `}
`;

export const OutputText = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const outputTitle = css`
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  font-size: ${({ theme }) => theme.font.size.callout};
  font-weight: 700;
  text-decoration: none;
`;

export const OutputTitle = styled.span`
  ${outputTitle}
`;

export const OutputTitleLink = styled(Link)`
  ${outputTitle}

  &:hover {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.core.status.accent};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radius.xs};
  }
`;

export const OutputMeta = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

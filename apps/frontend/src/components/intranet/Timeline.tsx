import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Badge } from '../../dimi-ui-kit/index.ts';
import { formatShortDate } from '../../lib/date.ts';

export interface TimelineItem {
  id: string;
  /** ISO 날짜. 없으면 dateLabel(예정 등)을 쓴다. */
  at?: string;
  dateLabel?: string;
  /** 날짜 옆 작은 배지 (질의, 회의, 배정, 진행 중 …) */
  kind?: string;
  title: ReactNode;
  body?: ReactNode;
  /** 맨 아래 줄 (회의록 보기 등) */
  foot?: ReactNode;
  /** 오른쪽 버튼 (이력 삭제 등) */
  action?: ReactNode;
  /** done: 지난 기록, current: 가장 최근 기록, planned: 예정된 기록 */
  state?: 'done' | 'current' | 'planned';
}

type State = NonNullable<TimelineItem['state']>;

const List = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li<{ $state: State; $lineOn: boolean }>`
  ${({ theme: t, $state, $lineOn }) => css`
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: ${t.spacing[400]};
    /* Figma Rail 16 + 사이 20, 아래 28 */
    padding: 0 0 ${t.spacing[600]} calc(16px + ${t.spacing[500]});

    /* 세로선: 점 아래부터 다음 기록까지 */
    &::before {
      content: '';
      position: absolute;
      top: 16px;
      bottom: 0;
      left: 7px;
      width: 2px;
      background: ${
        $lineOn
          ? t.colors.core.status.accent
          : t.colors.components.fill.secondary
      };
    }
    &:last-child {
      padding-bottom: 0;
    }
    &:last-child::before {
      display: none;
    }
    /* 점 */
    &::after {
      content: '';
      position: absolute;
      top: 4px;
      left: 2px;
      box-sizing: border-box;
      width: 12px;
      height: 12px;
      border-radius: ${t.radius.circle};
      background: ${
        {
          done: t.colors.core.status.accent,
          current: t.colors.background.primary,
          planned: t.colors.components.fill.secondary,
        }[$state]
      };
      ${
        $state === 'current' &&
        `border: 3px solid ${t.colors.core.status.accent};`
      }
    }
  `}
`;

const Body = styled.div`
  display: grid;
  flex: 1;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing[150]};
  min-width: 0;
`;

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[200]};
`;

const DateText = styled.span<{ $state: State }>`
  ${({ theme: t, $state }) => css`
    ${t.text.footnoteStrong}
    color: ${
      $state === 'current'
        ? t.colors.core.status.accent
        : t.colors.core.glyph.tertiary
    };
    font-variant-numeric: tabular-nums;
  `}
`;

const Title = styled.h3<{ $muted: boolean }>`
  ${({ theme: t, $muted }) => css`
    ${t.text.bodyStrong}
    margin: 0;
    color: ${$muted ? t.colors.core.glyph.tertiary : t.colors.core.glyph.primary};
  `}
`;

const Text = styled.p<{ $muted: boolean }>`
  ${({ theme: t, $muted }) => css`
    ${t.text.calloutRegular}
    margin: 0;
    color: ${$muted ? t.colors.core.glyph.tertiary : t.colors.core.glyph.secondary};
    white-space: pre-wrap;
  `}
`;

const Foot = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[200]};
`;

const Action = styled.div`
  flex: none;
`;

/** 추진 이력·진행 기록: 분홍 세로선과 점으로 이어지는 기록 목록 (오래된 기록이 위). */
export function Timeline({
  items,
  headingLevel = 3,
}: {
  items: TimelineItem[];
  headingLevel?: 2 | 3 | 4;
}) {
  const heading = `h${headingLevel}` as const;
  return (
    <List>
      {items.map((item, index) => {
        const state = item.state ?? 'done';
        const next = items[index + 1];
        const nextState = next?.state ?? 'done';
        return (
          <Item
            key={item.id}
            $state={state}
            $lineOn={state !== 'planned' && nextState !== 'planned'}
          >
            <Body>
              <Head>
                <DateText $state={state}>
                  {item.at ? (
                    <time dateTime={item.at}>{formatShortDate(item.at)}</time>
                  ) : (
                    item.dateLabel
                  )}
                </DateText>
                {item.kind && (
                  <Badge
                    size="small"
                    theme={state === 'current' ? 'accent' : 'grayscale'}
                  >
                    {item.kind}
                  </Badge>
                )}
              </Head>
              <Title as={heading} $muted={state === 'planned'}>
                {item.title}
              </Title>
              {item.body && (
                <Text $muted={state === 'planned'}>{item.body}</Text>
              )}
              {item.foot && <Foot>{item.foot}</Foot>}
            </Body>
            {item.action && <Action>{item.action}</Action>}
          </Item>
        );
      })}
    </List>
  );
}

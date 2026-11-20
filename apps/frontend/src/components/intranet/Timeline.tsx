import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { formatShortDate } from '../../lib/date.ts';

export interface TimelineItem {
  id: string;
  at: string;
  /** 제목 앞에 흐리게 붙는 말 (안건 단계 등) */
  prefix?: string;
  title: string;
  /** 제목 옆 배지 (공개, 내부 등) */
  badge?: ReactNode;
  body?: ReactNode;
  /** 맨 아래 줄 (작성자, 링크 등) */
  foot?: ReactNode;
  /** hollow: 빈 사각형. 업무공간에서 내부 기록을 공개 기록과 구분할 때 쓴다. */
  marker?: 'filled' | 'hollow';
}

const List = styled.ol`
  margin: 0;
  padding: 20px 18px 8px;
  list-style: none;
`;

const Body = styled.div<{ $hollow: boolean }>`
  ${({ theme: t, $hollow }) => css`
    position: relative;
    display: grid;
    justify-items: start;
    gap: 6px;
    padding: 0 0 24px 24px;
    border-left: 1px solid ${t.colors.core.line};

    &::before {
      content: '';
      position: absolute;
      top: 5px;
      left: -5px;
      width: 9px;
      height: 9px;
      border: 2px solid ${t.colors.core.glyph.primary};
      border-radius: 1px;
      background: ${
        $hollow
          ? t.colors.background.primary
          : t.colors.components.fill.inverted.primary
      };
    }
  `}
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 16px;

  &:last-child ${Body} {
    border-left-color: transparent;
  }
`;

const DateText = styled.time`
  ${({ theme: t }) => css`
    padding-top: 2px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
    font-variant-numeric: tabular-nums;
    text-align: right;
  `}
`;

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
`;

const Title = styled.h3`
  ${({ theme: t }) => css`
    margin: 0;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
  `}
`;

const Prefix = styled.span`
  ${({ theme: t }) => css`
    margin-right: 8px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
  `}
`;

const Text = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.7;
    white-space: pre-wrap;
  `}
`;

const Foot = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
  `}
`;

/** I-timeline: 날짜, 사각형 표시, 내용이 세로로 이어지는 기록 목록. 최신 기록이 위에 온다. */
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
      {items.map((item) => (
        <Item key={item.id}>
          <DateText dateTime={item.at}>{formatShortDate(item.at)}</DateText>
          <Body $hollow={item.marker === 'hollow'}>
            <Head>
              <Title as={heading}>
                {item.prefix && <Prefix>{item.prefix}</Prefix>}
                {item.title}
              </Title>
              {item.badge}
            </Head>
            {item.body && <Text>{item.body}</Text>}
            {item.foot && <Foot>{item.foot}</Foot>}
          </Body>
        </Item>
      ))}
    </List>
  );
}

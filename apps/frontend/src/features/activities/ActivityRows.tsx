import { useState } from 'react';
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { Badge, Icon } from '../../dimi-ui-kit/index.ts';
import { iconArrowForwardIos } from '../../dimi-ui-kit/icons';
import {
  Like,
  ListRowAside,
  ListRowItem,
  ListRowLink,
  ListRowMain,
  ListRowMeta,
  ListRowTitle,
  ScopeBadge,
  statusTone,
} from '../../components/ui/index.ts';
import { formatShortDate } from '../../lib/date.ts';
import type { Activity } from './types.ts';

export const ActivityList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Row = styled(ListRowItem)`
  ${({ theme: t }) => css`
    padding-inline: ${t.spacing[500]};

    ${ListRowTitle} {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${t.spacing[200]};
    }
  `}
`;

const Chevron = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.core.glyph.quaternary};
`;

const DateText = styled.span`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

const Aside = styled(ListRowAside)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[400]};
`;

/**
 * 활동 한 줄: 제목 · 상태 · 공개 범위, 담당 부서(와 연계 정보), 등록일.
 * 홈·랜딩·활동 목록이 함께 쓴다.
 */
export function ActivityRow({
  activity,
  to,
  note,
  headingLevel = 3,
}: {
  activity: Activity;
  to: string;
  /** 부서 뒤에 붙는 연계 정보 (질의 #128에서 시작 등) */
  note?: string;
  headingLevel?: 2 | 3;
}) {
  // 활동 공감은 서버에 없어(기능 명세서 밖) 화면 안에서만 켜고 끈다.
  const [liked, setLiked] = useState(false);
  const likes = (activity.likes ?? 0) + (liked ? 1 : 0);
  return (
    <Row>
      <ListRowMain>
        <ListRowTitle as={`h${headingLevel}`}>
          <ListRowLink as={Link} to={to}>
            {activity.title}
          </ListRowLink>
          <Badge theme={statusTone.activity[activity.status]}>
            {activity.status}
          </Badge>
          <ScopeBadge scope={activity.scope} />
        </ListRowTitle>
        <ListRowMeta>
          <span>
            {[activity.department || '담당 부서 미정', note]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </ListRowMeta>
      </ListRowMain>
      <Aside>
        <Like
          count={likes}
          liked={liked}
          onToggle={() => setLiked(!liked)}
          subject={activity.title}
        />
        <DateText>
          <time dateTime={activity.registeredAt}>
            {formatShortDate(activity.registeredAt)}
          </time>
        </DateText>
        <Chevron aria-hidden="true">
          <Icon icon={iconArrowForwardIos} size={16} />
        </Chevron>
      </Aside>
    </Row>
  );
}

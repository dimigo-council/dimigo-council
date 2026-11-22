import { useState } from 'react';
import styled from 'styled-components';
import {
  Card,
  CardHead,
  CardTitle,
  EmptyState,
  FilterChips,
  MoreLink,
} from '../../components/ui/index.ts';
import { ActivityList, ActivityRow } from './ActivityRows.tsx';
import type { Activity } from './types.ts';

/* Figma Filters: 위아래 4, 카드 간격 12 */
const Chips = styled.div`
  padding: ${({ theme }) => theme.spacing[100]} 0;
  margin-bottom: ${({ theme }) => theme.spacing[300]};
`;

const filters = ['all', '검토 중', '추진 중', '완료'] as const;
type Filter = (typeof filters)[number];

/**
 * 홈·랜딩의 "활동 추진 현황": 전체 · 검토 중 · 추진 중 · 완료와 "더보기".
 * 보류 상태의 활동은 보여주지 않는다 (기능 명세서 LND-03, HOM-02).
 */
export function ActivityStatusCard({
  activities,
  title = '활동 추진 현황',
  moreTo,
  moreLabel = '더보기',
  activityTo,
  limit = 5,
}: {
  activities: Activity[];
  title?: string;
  moreTo: string;
  moreLabel?: string;
  activityTo: (activity: Activity) => string;
  limit?: number;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = activities
    .filter((activity) => activity.status !== '보류')
    .filter((activity) => filter === 'all' || activity.status === filter)
    .slice(0, limit);

  return (
    <Card aria-labelledby="activity-status-title">
      <CardHead>
        <CardTitle id="activity-status-title">{title}</CardTitle>
        <MoreLink to={moreTo} aria-label={`${title} ${moreLabel}`}>
          {moreLabel}
        </MoreLink>
      </CardHead>
      <Chips>
        <FilterChips
          aria-label="활동 상태"
          value={filter}
          onChange={setFilter}
          items={filters.map((value) => ({
            value,
            label: value === 'all' ? '전체' : value,
          }))}
        />
      </Chips>
      {shown.length > 0 ? (
        <ActivityList aria-label={title}>
          {shown.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              to={activityTo(activity)}
            />
          ))}
        </ActivityList>
      ) : (
        <EmptyState>이 상태의 활동이 없어요.</EmptyState>
      )}
    </Card>
  );
}

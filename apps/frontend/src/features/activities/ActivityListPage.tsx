import { useLoaderData } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useBasePath, useIsCouncil } from '../../app/mode.ts';
import {
  ButtonLink,
  Card,
  EmptyState,
  FilterChips,
} from '../../components/ui/index.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listSurveys } from '../surveys/api.ts';
import { listTasks } from '../tasks/api.ts';
import {
  getActivityDraft,
  listActivities,
  listPublicActivities,
} from './api.ts';
import { ActivityList, ActivityRow } from './ActivityRows.tsx';
import { activityNote } from './format.ts';
import { activityStatuses, type ActivityStatus } from './types.ts';
import * as S from './styles.ts';

/** 학생 화면: 전체 공개 활동과 연계 정보 */
export async function activityListLoader() {
  const [activities, surveys, tasks] = await Promise.all([
    listPublicActivities(),
    listSurveys(),
    listTasks(),
  ]);
  return {
    activities: activities.map((activity) => ({
      activity,
      note: activityNote(activity, surveys, tasks),
    })),
    hasDraft: false,
  };
}

/** 학생회 화면: 모든 활동. 임시 저장한 활동이 있으면 "불러오기"를 보여준다. */
export async function councilActivityListLoader() {
  const [activities, draft] = await Promise.all([
    listActivities(),
    getActivityDraft(),
  ]);
  return {
    activities: activities.map((activity) => ({
      activity,
      note: undefined as string | undefined,
    })),
    hasDraft: draft !== null,
  };
}

type Filter = 'all' | ActivityStatus;
const filters: Filter[] = ['all', ...activityStatuses];

export function ActivityListPage() {
  const { activities, hasDraft } = useLoaderData<typeof activityListLoader>();
  const council = useIsCouncil();
  const base = useBasePath();
  const [filter, setFilter] = useSearchParamOption('status', filters, 'all');

  const visible = activities.filter(
    ({ activity }) => filter === 'all' || activity.status === filter,
  );

  return (
    <>
      <PageHeader
        title="활동"
        actions={
          council && (
            <>
              {hasDraft && (
                <ButtonLink to="/work/activities/new?draft">
                  불러오기
                </ButtonLink>
              )}
              <ButtonLink
                theme="accent"
                variant="primary"
                to="/work/activities/new"
              >
                <PlusIcon />
                활동 등록
              </ButtonLink>
            </>
          )
        }
      />

      <S.Filters>
        <FilterChips
          aria-label="활동 상태"
          value={filter}
          onChange={setFilter}
          items={filters.map((value) => ({
            value,
            label: value === 'all' ? '전체' : value,
          }))}
        />
      </S.Filters>

      {visible.length > 0 ? (
        <Card>
          <ActivityList aria-label="활동 목록">
            {visible.map(({ activity, note }) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                note={note}
                to={base(`/activities/${activity.id}`)}
                headingLevel={2}
              />
            ))}
          </ActivityList>
        </Card>
      ) : (
        <EmptyState>
          {activities.length === 0
            ? '아직 공개된 활동이 없습니다.'
            : '이 상태의 활동이 없습니다.'}
        </EmptyState>
      )}
    </>
  );
}

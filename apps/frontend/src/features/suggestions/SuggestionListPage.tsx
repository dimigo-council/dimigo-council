import { Link, useLoaderData } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Badge } from '../../dimi-ui-kit/index.ts';
import {
  ButtonLink,
  ChoiceGroup,
  EmptyState,
  ListGroupRoot,
  ListRowAside,
  ListRowLink,
  ListRowMain,
  ListRowMeta,
  ListRowTitle,
  PageToolbar,
  statusTone,
} from '../../components/ui/index.ts';
import { formatRelative, formatShortDate } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listMySuggestions } from './api.ts';
import { openStatuses, type Suggestion } from './types.ts';
import * as S from './styles.ts';

export async function suggestionListLoader() {
  return listMySuggestions();
}

type Filter = 'all' | 'open' | 'done';
const filters: Filter[] = ['all', 'open', 'done'];

function latestReply(suggestion: Suggestion) {
  return [...suggestion.messages]
    .reverse()
    .find((message) => message.from === 'council');
}

function SuggestionRow({ suggestion }: { suggestion: Suggestion }) {
  const reply = latestReply(suggestion);
  return (
    <S.SuggestionRow>
      <ListRowMain>
        <ListRowTitle as="h2">
          <ListRowLink as={Link} to={`/suggestions/${suggestion.id}`}>
            {suggestion.title}
          </ListRowLink>
        </ListRowTitle>
        <ListRowMeta>
          <Badge>{suggestion.category}</Badge>
          <span>{formatShortDate(suggestion.submittedAt)} 제출</span>
          <span>{suggestion.identity === 'anonymous' ? '익명' : '실명'}</span>
        </ListRowMeta>
      </ListRowMain>
      <ListRowAside>
        <Badge theme={statusTone.suggestion[suggestion.status]}>
          {suggestion.status}
        </Badge>
        <span>{formatRelative(suggestion.updatedAt)}</span>
      </ListRowAside>
      <S.SuggestionReply>
        {reply ? (
          <>
            <strong>{reply.department}</strong> {reply.body}
          </>
        ) : (
          <>
            <strong>안내</strong> 담당 부서가 확인하면 검토 중으로 바뀝니다.
            보통 3일 안에 확인합니다.
          </>
        )}
      </S.SuggestionReply>
    </S.SuggestionRow>
  );
}

export function SuggestionListPage() {
  const suggestions = useLoaderData<typeof suggestionListLoader>();
  const [filter, setFilter] = useSearchParamOption('filter', filters, 'all');

  const open = suggestions.filter((s) => openStatuses.includes(s.status));
  const done = suggestions.filter((s) => !openStatuses.includes(s.status));
  const visible = { all: suggestions, open, done }[filter];

  return (
    <>
      <PageHeader title="내 건의" visuallyHidden />

      <PageToolbar>
        <ChoiceGroup
          aria-label="건의 보기"
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: `전체 ${suggestions.length}` },
            { value: 'open', label: `처리 중 ${open.length}` },
            { value: 'done', label: `끝난 건의 ${done.length}` },
          ]}
        />
        <ButtonLink theme="accent" variant="primary" to="/suggestions/new">
          <PlusIcon />새 건의
        </ButtonLink>
      </PageToolbar>

      <S.SuggestionList>
        {visible.length > 0 ? (
          <ListGroupRoot aria-label="내 건의 목록">
            {visible.map((suggestion) => (
              <SuggestionRow key={suggestion.id} suggestion={suggestion} />
            ))}
          </ListGroupRoot>
        ) : (
          <EmptyState>
            {suggestions.length === 0
              ? '아직 낸 건의가 없습니다. 학교생활에서 바뀌었으면 하는 점을 알려주세요.'
              : '이 보기에 해당하는 건의가 없습니다.'}
          </EmptyState>
        )}
      </S.SuggestionList>
    </>
  );
}

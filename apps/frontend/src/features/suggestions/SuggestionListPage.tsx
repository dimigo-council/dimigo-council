import { Link, useLoaderData } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import {
  Badge,
  SegmentedControl,
  statusTone,
  Tag,
} from '../../components/kit/index.ts';
import { formatRelative, formatShortDate } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { isMockApi, listMySuggestions } from './api.ts';
import { openStatuses, type Suggestion } from './types.ts';
import './suggestions.css';

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
    <li className="list-row suggestion-row">
      <div className="list-row__main">
        <h2 className="list-row__title">
          <Link className="list-row__link" to={`/suggestions/${suggestion.id}`}>
            {suggestion.title}
          </Link>
        </h2>
        <div className="list-row__meta">
          <Tag>{suggestion.category}</Tag>
          <span>{formatShortDate(suggestion.submittedAt)} 제출</span>
          <span>{suggestion.identity === 'anonymous' ? '익명' : '실명'}</span>
        </div>
      </div>
      <div className="list-row__aside">
        <Badge tone={statusTone.suggestion[suggestion.status]}>
          {suggestion.status}
        </Badge>
        <span>{formatRelative(suggestion.updatedAt)}</span>
      </div>
      <p className="suggestion-row__reply">
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
      </p>
    </li>
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
      <PageHeader
        title="내 건의"
        description="내가 낸 건의와 처리 상황입니다. 답변이 달리거나 상태가 바뀌면 알림을 보내드립니다."
        actions={
          <Link className="btn btn--primary" to="/suggestions/new">
            <PlusIcon />새 건의
          </Link>
        }
      />

      <p className="status-flow">
        <span>처리 단계</span>
        <span className="status-flow__steps">
          <strong>접수 대기</strong>
          <span aria-hidden="true">›</span>
          <strong>검토 중</strong>
          <span aria-hidden="true">›</span>
          <span>
            <strong>답변 완료</strong>, <strong>안건 채택</strong> 또는{' '}
            <strong>반려</strong>
          </span>
        </span>
      </p>

      <SegmentedControl
        aria-label="건의 보기"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'all', label: `전체 ${suggestions.length}` },
          { value: 'open', label: `처리 중 ${open.length}` },
          { value: 'done', label: `끝난 건의 ${done.length}` },
        ]}
      />

      <div className="suggestion-list">
        {visible.length > 0 ? (
          <ul className="list-group" aria-label="내 건의 목록">
            {visible.map((suggestion) => (
              <SuggestionRow key={suggestion.id} suggestion={suggestion} />
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            {suggestions.length === 0
              ? '아직 낸 건의가 없습니다. 학교생활에서 바뀌었으면 하는 점을 알려주세요.'
              : '이 보기에 해당하는 건의가 없습니다.'}
          </p>
        )}
      </div>

      {import.meta.env.DEV && isMockApi && (
        <p className="dev-note">
          개발용 예시 데이터입니다. 새로고침하면 처음 상태로 돌아갑니다.
        </p>
      )}
    </>
  );
}

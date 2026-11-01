import { useId, useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { ChevronLeftIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Steps, type StepItem } from '../../components/intranet/Steps.tsx';
import {
  Avatar,
  Badge,
  Button,
  Notice,
  statusTone,
  Switch,
  Tag,
} from '../../components/kit/index.ts';
import {
  formatDateTime,
  formatFullDate,
  formatShortDate,
} from '../../lib/date.ts';
import { addComment, getSuggestion, updateNotify } from './api.ts';
import type { Suggestion, SuggestionMessage } from './types.ts';
import './suggestions.css';

export async function suggestionLoader({ params }: LoaderFunctionArgs) {
  return getSuggestion(params.suggestionId ?? '');
}

/** 접수 대기 → 검토 중 → (답변 완료 · 안건 채택 · 반려) */
function toSteps(suggestion: Suggestion): StepItem[] {
  const at = (status: Suggestion['status']) =>
    suggestion.history.find((entry) => entry.status === status);
  const received = at('접수 대기');
  const reviewing = at('검토 중');
  const final = ['답변 완료', '안건 채택', '반려'].includes(suggestion.status)
    ? at(suggestion.status)
    : undefined;

  const note = (entry?: { at: string; note?: string }, suffix?: string) =>
    entry
      ? `${formatShortDate(entry.at)} ${entry.note ?? suffix ?? ''}`.trim()
      : undefined;

  return [
    {
      label: '접수 대기',
      state: suggestion.status === '접수 대기' ? 'current' : 'done',
      note: note(received, '제출'),
    },
    {
      label: '검토 중',
      state: final ? 'done' : reviewing ? 'current' : 'todo',
      note: note(reviewing),
    },
    {
      label: final ? suggestion.status : '답변 또는 안건 채택',
      state: final ? 'current' : 'todo',
      note: note(final),
    },
  ];
}

function Message({ message }: { message: SuggestionMessage }) {
  const mine = message.from === 'me';
  return (
    <li className="message">
      <Avatar name={mine ? '나' : (message.department ?? '학생회')} />
      <div className="message__body">
        <p className="message__head">
          <strong>
            {mine
              ? message.original
                ? '내가 보낸 건의'
                : '추가 의견'
              : message.department}
          </strong>
          {message.staffName && <span>담당 {message.staffName}</span>}
          <time dateTime={message.at}>{formatDateTime(message.at)}</time>
        </p>
        <p className="message__text">{message.body}</p>
        {message.action && (
          <Link className="btn btn--secondary btn--sm" to={message.action.to}>
            {message.action.label}
          </Link>
        )}
      </div>
    </li>
  );
}

export function SuggestionDetailPage() {
  const suggestion = useLoaderData<typeof suggestionLoader>();
  return <SuggestionDetail key={suggestion.id} suggestion={suggestion} />;
}

function SuggestionDetail({ suggestion }: { suggestion: Suggestion }) {
  const revalidator = useRevalidator();
  const commentId = useId();
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState<'idle' | 'saving' | 'error'>('idle');
  const [notify, setNotify] = useState(suggestion.notify);

  const onComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim() || sending === 'saving') return;
    setSending('saving');
    try {
      await addComment(suggestion.id, comment);
      setComment('');
      setSending('idle');
      await revalidator.revalidate();
    } catch {
      setSending('error');
    }
  };

  const toggleNotify = (key: keyof Suggestion['notify'], value: boolean) => {
    setNotify((prev) => ({ ...prev, [key]: value }));
    void updateNotify(suggestion.id, { [key]: value });
  };

  const agenda = suggestion.linkedAgenda;

  return (
    <>
      <Link className="back-link" to="/suggestions">
        <ChevronLeftIcon />내 건의
      </Link>
      <PageHeader
        title={suggestion.title}
        description={
          <span className="meta-row">
            <span>{suggestion.id}</span>
            <span>{formatShortDate(suggestion.submittedAt)} 제출</span>
          </span>
        }
        actions={
          <Badge tone={statusTone.suggestion[suggestion.status]}>
            {suggestion.status}
          </Badge>
        }
      />

      <section className="panel panel--padded" aria-label="처리 단계">
        <Steps aria-label="처리 단계" items={toSteps(suggestion)} />
      </section>

      <div className="split-layout">
        <div className="split-layout__main">
          {agenda && (
            <section className="linked-agenda" aria-labelledby="agenda-title">
              <div>
                <p className="linked-agenda__label">이 건의가 연결된 안건</p>
                <h2 className="linked-agenda__title" id="agenda-title">
                  {agenda.title}
                </h2>
                <p className="meta-row">
                  <span>
                    현재 단계: {agenda.stage}
                    {agenda.stageNote && `, ${agenda.stageNote}`}
                  </span>
                  <span>건의 {agenda.suggestionCount}건 연결</span>
                </p>
              </div>
              <Link className="text-link" to={`/activity/${agenda.id}`}>
                진행 과정 보기
              </Link>
            </section>
          )}

          <section className="panel" aria-labelledby="messages-title">
            <h2
              className="panel__title panel__title--split"
              id="messages-title"
            >
              주고받은 내용
              <span className="count">{suggestion.messages.length}</span>
            </h2>
            <ol className="messages">
              {suggestion.messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </ol>
          </section>

          <form className="panel" onSubmit={onComment}>
            <h2 className="panel__title">
              <label htmlFor={commentId}>추가 의견</label>
            </h2>
            <div className="panel__body">
              <textarea
                id={commentId}
                className="field__control comment-input"
                placeholder="덧붙일 내용이 있으면 남겨주세요. 담당자에게 전달됩니다."
                maxLength={1000}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              {sending === 'error' && (
                <Notice tone="warn" role="alert">
                  보내지 못했습니다. 잠시 후 다시 시도해주세요.
                </Notice>
              )}
              <div className="comment-actions">
                <p className="comment-actions__hint">
                  접수된 건의는 원문을 고칠 수 없어 추가 의견으로 남깁니다.
                </p>
                <Button
                  type="submit"
                  disabled={!comment.trim() || sending === 'saving'}
                >
                  보내기
                </Button>
              </div>
            </div>
          </form>
        </div>

        <aside className="split-layout__aside">
          <section className="panel" aria-labelledby="info-title">
            <h2 className="panel__title" id="info-title">
              건의 정보
            </h2>
            <dl className="info-list">
              <dt>분류</dt>
              <dd>
                <Tag>{suggestion.category}</Tag>
              </dd>
              <dt>담당 부서</dt>
              <dd>{suggestion.department ?? '배정 전'}</dd>
              {suggestion.aboutAgenda && (
                <>
                  <dt>의견 보탠 안건</dt>
                  <dd>
                    <Link
                      className="text-link"
                      to={`/activity/${suggestion.aboutAgenda.id}`}
                    >
                      {suggestion.aboutAgenda.title}
                    </Link>
                  </dd>
                </>
              )}
              <dt>이름 공개</dt>
              <dd>{suggestion.identity === 'anonymous' ? '익명' : '실명'}</dd>
              <dt>제출일</dt>
              <dd>{formatFullDate(suggestion.submittedAt)}</dd>
              <dt>최근 변경</dt>
              <dd>{formatFullDate(suggestion.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel" aria-labelledby="notify-title">
            <h2 className="panel__title" id="notify-title">
              알림
            </h2>
            <div className="panel__body notify-list">
              <Switch
                label="상태가 바뀌면 알림 받기"
                checked={notify.status}
                onChange={(event) =>
                  toggleNotify('status', event.target.checked)
                }
              />
              {agenda && (
                <Switch
                  label="연결된 안건이 진행되면 알림 받기"
                  checked={notify.agenda}
                  onChange={(event) =>
                    toggleNotify('agenda', event.target.checked)
                  }
                />
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

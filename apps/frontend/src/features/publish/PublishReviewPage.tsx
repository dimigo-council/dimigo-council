import { useId, useState, type FormEvent } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import {
  Badge,
  Button,
  statusTone,
  Tabs,
  Tag,
} from '../../components/kit/index.ts';
import { formatDateTime, formatRelative } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listPublishItems, publishItem, requestRevision } from './api.ts';
import type { PublishItem } from './types.ts';
import './publish.css';

export async function publishLoader() {
  return listPublishItems();
}

type Tab = 'pending' | 'decided';
const tabs: Tab[] = ['pending', 'decided'];

function PublishRow({ item }: { item: PublishItem }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const noteId = useId();
  const [revising, setRevising] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      await revalidator.revalidate();
    } finally {
      setBusy(false);
    }
  };

  const onRevise = (event: FormEvent) => {
    event.preventDefault();
    if (!note.trim()) return;
    void run(() => requestRevision(item.id, session.name, note));
  };

  const pending = item.status === '공개 검토 중';

  return (
    <li className="list-row list-row--excerpt">
      <div className="list-row__main">
        <h3 className="list-row__title">{item.title}</h3>
        <div className="list-row__meta">
          <Tag>{item.kind}</Tag>
          <span>
            {item.department}, {item.requester}
          </span>
          {item.agenda && (
            <Link className="text-link" to={`/work/agendas/${item.agenda.id}`}>
              {item.agenda.id}
            </Link>
          )}
        </div>
      </div>
      <div className="list-row__aside">
        <Badge tone={statusTone.visibility[item.status]}>{item.status}</Badge>
        <span>
          {pending
            ? `${formatRelative(item.requestedAt)} 요청`
            : item.decidedAt &&
              `${item.reviewer}, ${formatDateTime(item.decidedAt)}`}
        </span>
      </div>
      {pending && !revising && (
        <div className="list-row__actions">
          <Button size="sm" disabled={busy} onClick={() => setRevising(true)}>
            수정 요청
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={() => void run(() => publishItem(item.id, session.name))}
          >
            게시하기
          </Button>
        </div>
      )}
      <p className="list-row__excerpt publish-preview">{item.preview}</p>
      {item.status === '수정 요청' && item.note && (
        <p className="publish-note">
          <strong>수정 요청</strong> {item.note}
        </p>
      )}
      {revising && (
        <form className="publish-revise" onSubmit={onRevise}>
          <label className="field__label" htmlFor={noteId}>
            무엇을 고쳐야 하나요?
          </label>
          <textarea
            id={noteId}
            className="field__control comment-input"
            maxLength={300}
            placeholder="요청한 사람에게 그대로 전달됩니다."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="form-actions">
            <Button disabled={busy} onClick={() => setRevising(false)}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !note.trim()}
            >
              수정 요청 보내기
            </Button>
          </div>
        </form>
      )}
    </li>
  );
}

export function PublishReviewPage() {
  const items = useLoaderData<typeof publishLoader>();
  const [tab, setTab] = useSearchParamOption('tab', tabs, 'pending');

  const pending = items.filter((item) => item.status === '공개 검토 중');
  const decided = items
    .filter((item) => item.status !== '공개 검토 중')
    .sort((a, b) => (b.decidedAt ?? '').localeCompare(a.decidedAt ?? ''));
  const visible = tab === 'pending' ? pending : decided;

  return (
    <>
      <PageHeader title="공개 검토" visuallyHidden />

      <Tabs
        aria-label="공개 검토 보기"
        idPrefix="publish"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'pending', label: '검토 대기', count: pending.length },
          { value: 'decided', label: '처리함', count: decided.length },
        ]}
      />

      <div
        className="publish-panel"
        role="tabpanel"
        id={`publish-panel-${tab}`}
        aria-labelledby={`publish-tab-${tab}`}
      >
        {visible.length > 0 ? (
          <ul className="list-group" aria-label="공개 검토 목록">
            {visible.map((item) => (
              <PublishRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            {tab === 'pending'
              ? '공개를 기다리는 글이 없습니다.'
              : '아직 처리한 글이 없습니다.'}
          </p>
        )}
        <p className="publish-panel__note">
          게시하면 학생 화면 학생회 활동에 바로 보입니다. 학생 이름이나 학생을
          알아볼 수 있는 내용이 없는지 확인해주세요.
        </p>
      </div>
    </>
  );
}

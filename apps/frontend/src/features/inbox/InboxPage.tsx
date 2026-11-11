import { useId, useState, type FormEvent } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { FilterSelect } from '../../components/intranet/FilterSelect.tsx';
import {
  Badge,
  Button,
  Notice,
  SegmentedControl,
  Select,
  statusTone,
  Tabs,
  Tag,
  TextArea,
} from '../../components/kit/index.ts';
import { formatRelative } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listAgendas } from '../agendas/api.ts';
import { finishedStatuses, type Agenda } from '../agendas/types.ts';
import { listMembers } from '../members/api.ts';
import { suggestionCategories } from '../suggestions/types.ts';
import { listInbox, resolveSuggestion, startReview } from './api.ts';
import type { InboxResult, InboxSuggestion } from './types.ts';
import './inbox.css';

export async function inboxLoader() {
  const [items, members, agendas] = await Promise.all([
    listInbox(),
    listMembers(),
    listAgendas(),
  ]);
  return {
    items,
    members,
    // 끝난 안건에는 새 건의를 묶지 않는다
    agendas: agendas.filter(
      (agenda) => !finishedStatuses.includes(agenda.status),
    ),
  };
}

type Tab = 'pending' | 'reviewing' | 'closed' | 'all';
const tabs: Tab[] = ['pending', 'reviewing', 'closed', 'all'];
const inTab: Record<Tab, (item: InboxSuggestion) => boolean> = {
  pending: (item) => item.status === '접수 대기',
  reviewing: (item) => item.status === '검토 중',
  closed: (item) => item.status !== '접수 대기' && item.status !== '검토 중',
  all: () => true,
};
const emptyText: Record<Tab, string> = {
  pending: '새로 들어온 건의가 없습니다.',
  reviewing: '검토 중인 건의가 없습니다.',
  closed: '처리한 건의가 없습니다.',
  all: '아직 들어온 건의가 없습니다.',
};

const results: InboxResult[] = ['답변 완료', '안건 채택', '반려'];
const answerPlaceholder: Record<InboxResult, string> = {
  '답변 완료': '무엇을 했는지, 앞으로 어떻게 되는지 학생에게 알려주세요.',
  '안건 채택': '어떤 안건으로 다루는지 학생에게 알려주세요.',
  반려: '왜 받아들이기 어려운지, 대신 할 수 있는 일이 있는지 적어주세요.',
};

function ResolveForm({
  item,
  agendas,
  onClose,
}: {
  item: InboxSuggestion;
  agendas: Agenda[];
  onClose: () => void;
}) {
  const session = useSession();
  const revalidator = useRevalidator();
  const resultLabelId = useId();
  const [result, setResult] = useState<InboxResult>('답변 완료');
  const [agendaId, setAgendaId] = useState('');
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState<{ agenda?: string; answer?: string }>(
    {},
  );
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    const agenda = agendas.find((entry) => entry.id === agendaId);
    const next = {
      agenda:
        result === '안건 채택' && !agenda
          ? '묶을 안건을 골라주세요.'
          : undefined,
      answer: answer.trim() ? undefined : '학생에게 보낼 답변을 적어주세요.',
    };
    setErrors(next);
    if (next.agenda || next.answer) return;
    setStatus('saving');
    try {
      await resolveSuggestion(item.id, {
        result,
        answer,
        handler: session.name,
        ...(result === '안건 채택' &&
          agenda && { agenda: { id: agenda.id, title: agenda.title } }),
      });
      await revalidator.revalidate();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form
      className="inbox-resolve"
      aria-label={`${item.id} 처리`}
      onSubmit={onSubmit}
      noValidate
    >
      <div className="field">
        <span className="field__label" id={resultLabelId}>
          처리 결과
        </span>
        <SegmentedControl
          aria-labelledby={resultLabelId}
          value={result}
          onChange={setResult}
          items={results.map((value) => ({ value, label: value }))}
        />
      </div>
      {result === '안건 채택' && (
        <Select
          label="묶을 안건"
          value={agendaId}
          error={errors.agenda}
          onChange={(event) => {
            setAgendaId(event.target.value);
            setErrors((current) => ({ ...current, agenda: undefined }));
          }}
        >
          <option value="">안건 고르기</option>
          {agendas.map((agenda) => (
            <option key={agenda.id} value={agenda.id}>
              {agenda.id} {agenda.title}
            </option>
          ))}
        </Select>
      )}
      <TextArea
        label="학생에게 보낼 답변"
        rows={3}
        maxLength={1000}
        showCount
        placeholder={answerPlaceholder[result]}
        value={answer}
        error={errors.answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          setErrors((current) => ({ ...current, answer: undefined }));
        }}
      />
      {status === 'error' && (
        <Notice tone="warn" role="alert">
          처리하지 못했습니다. 잠시 후 다시 시도해주세요.
        </Notice>
      )}
      <div className="form-actions">
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" variant="primary" disabled={status === 'saving'}>
          {result === '반려' ? '반려하기' : '처리 완료'}
        </Button>
      </div>
    </form>
  );
}

function InboxRow({
  item,
  agendas,
  onStart,
  busy,
}: {
  item: InboxSuggestion;
  agendas: Agenda[];
  onStart: () => void;
  busy: boolean;
}) {
  const [resolving, setResolving] = useState(false);

  return (
    <li className="list-row list-row--excerpt">
      <div className="list-row__main">
        <h3 className="list-row__title">{item.title}</h3>
        <div className="list-row__meta">
          <span>{item.id}</span>
          <Tag>{item.category}</Tag>
          <span>{item.author ?? '익명'}</span>
          <span>
            {item.department
              ? `${item.department}${item.handler ? `, ${item.handler}` : ''}`
              : '배정 전'}
          </span>
          {item.agenda && (
            <Link className="text-link" to={`/work/agendas/${item.agenda.id}`}>
              {item.agenda.id}
            </Link>
          )}
        </div>
      </div>
      <div className="list-row__aside">
        <Badge tone={statusTone.suggestion[item.status]}>{item.status}</Badge>
        <span>{formatRelative(item.updatedAt)}</span>
      </div>
      {item.status === '접수 대기' && (
        <div className="list-row__actions">
          <Button size="sm" disabled={busy} onClick={onStart}>
            내가 검토하기
          </Button>
        </div>
      )}
      {item.status === '검토 중' && !resolving && (
        <div className="list-row__actions">
          <Button size="sm" onClick={() => setResolving(true)}>
            처리하기
          </Button>
        </div>
      )}
      <p className="list-row__excerpt">{item.body}</p>
      {item.answer && (
        <p className="inbox-answer">
          <strong>답변</strong> {item.answer}
        </p>
      )}
      {resolving && item.status === '검토 중' && (
        <ResolveForm
          item={item}
          agendas={agendas}
          onClose={() => setResolving(false)}
        />
      )}
    </li>
  );
}

export function InboxPage() {
  const { items, members, agendas } = useLoaderData<typeof inboxLoader>();
  const session = useSession();
  const revalidator = useRevalidator();
  const [tab, setTab] = useSearchParamOption('tab', tabs, 'pending');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const myDepartment =
    members.find((member) => member.name === session.name)?.department ??
    '회장단';

  const onStart = async (id: string) => {
    setBusy(true);
    try {
      await startReview(id, session.name, myDepartment);
      await revalidator.revalidate();
    } finally {
      setBusy(false);
    }
  };

  const keyword = query.trim();
  const visible = items.filter(
    (item) =>
      inTab[tab](item) &&
      (!category || item.category === category) &&
      (!keyword ||
        item.id.includes(keyword) ||
        item.title.includes(keyword) ||
        item.body.includes(keyword)),
  );
  const count = (key: Tab) => items.filter(inTab[key]).length;

  return (
    <>
      <PageHeader title="건의 접수함" visuallyHidden />

      <Tabs
        aria-label="건의 보기"
        idPrefix="inbox"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'pending', label: '접수 대기', count: count('pending') },
          { value: 'reviewing', label: '검토 중', count: count('reviewing') },
          { value: 'closed', label: '처리 완료', count: count('closed') },
          { value: 'all', label: '전체', count: items.length },
        ]}
      />

      <div
        className="inbox-panel"
        role="tabpanel"
        id={`inbox-panel-${tab}`}
        aria-labelledby={`inbox-tab-${tab}`}
      >
        <div className="filter-bar">
          <FilterSelect label="분류" value={category} onChange={setCategory}>
            <option value="">전체</option>
            {suggestionCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </FilterSelect>
          <input
            type="search"
            className="field__control filter-bar__search"
            aria-label="건의 찾기"
            placeholder="번호, 제목, 내용으로 찾기"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {visible.length > 0 ? (
          <ul className="list-group" aria-label="건의 목록">
            {visible.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                agendas={agendas}
                busy={busy}
                onStart={() => void onStart(item.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            {category || keyword
              ? '조건에 맞는 건의가 없습니다.'
              : emptyText[tab]}
          </p>
        )}
        <p className="inbox-panel__note">
          접수 대기 건의는 3일 안에 맡아주세요. 맡으면 학생 화면에 검토 중으로
          보입니다.
        </p>
      </div>
    </>
  );
}

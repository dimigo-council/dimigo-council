import { useId, useState, type FormEvent } from 'react';
import { useLoaderData, useRevalidator } from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { Badge, Button, TextArea } from '../../dimi-ui-kit/index.ts';
import {
  EmptyState,
  FieldLabel,
  FormActions,
  ListGroupRoot,
  ListRowActions,
  ListRowAside,
  ListRowItem,
  ListRowMain,
  ListRowMeta,
  ListRowTitle,
  statusTone,
  Tabs,
  TextLink,
} from '../../components/ui/index.ts';
import { formatDateTime, formatRelative } from '../../lib/date.ts';
import { useSearchParamOption } from '../../lib/useSearchParamOption.ts';
import { listPublishItems, publishItem, requestRevision } from './api.ts';
import type { PublishItem } from './types.ts';
import * as S from './styles.ts';

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
    <ListRowItem $excerpt>
      <ListRowMain>
        <ListRowTitle>{item.title}</ListRowTitle>
        <ListRowMeta>
          <Badge>{item.kind}</Badge>
          <span>
            {item.department}, {item.requester}
          </span>
          {item.agenda && (
            <TextLink to={`/work/agendas/${item.agenda.id}`}>
              {item.agenda.id}
            </TextLink>
          )}
        </ListRowMeta>
      </ListRowMain>
      <ListRowAside>
        <Badge theme={statusTone.visibility[item.status]}>{item.status}</Badge>
        <span>
          {pending
            ? `${formatRelative(item.requestedAt)} 요청`
            : item.decidedAt &&
              `${item.reviewer}, ${formatDateTime(item.decidedAt)}`}
        </span>
      </ListRowAside>
      {pending && !revising && (
        <ListRowActions>
          <Button
            size="small"
            disabled={busy}
            onClick={() => setRevising(true)}
          >
            수정 요청
          </Button>
          <Button
            theme="accent"
            variant="primary"
            size="small"
            disabled={busy}
            onClick={() => void run(() => publishItem(item.id, session.name))}
          >
            게시하기
          </Button>
        </ListRowActions>
      )}
      <S.PublishPreview>{item.preview}</S.PublishPreview>
      {item.status === '수정 요청' && item.note && (
        <S.PublishNote>
          <strong>수정 요청</strong> {item.note}
        </S.PublishNote>
      )}
      {revising && (
        <S.PublishRevise onSubmit={onRevise}>
          <FieldLabel htmlFor={noteId}>무엇을 고쳐야 하나요?</FieldLabel>
          <TextArea
            id={noteId}
            maxLength={300}
            placeholder="요청한 사람에게 그대로 전달됩니다."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <FormActions>
            <Button disabled={busy} onClick={() => setRevising(false)}>
              취소
            </Button>
            <Button
              type="submit"
              theme="accent"
              variant="primary"
              disabled={busy || !note.trim()}
            >
              수정 요청 보내기
            </Button>
          </FormActions>
        </S.PublishRevise>
      )}
    </ListRowItem>
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

      <S.PublishPanel
        role="tabpanel"
        id={`publish-panel-${tab}`}
        aria-labelledby={`publish-tab-${tab}`}
      >
        {visible.length > 0 ? (
          <ListGroupRoot aria-label="공개 검토 목록">
            {visible.map((item) => (
              <PublishRow key={item.id} item={item} />
            ))}
          </ListGroupRoot>
        ) : (
          <EmptyState>
            {tab === 'pending'
              ? '공개를 기다리는 글이 없습니다.'
              : '아직 처리한 글이 없습니다.'}
          </EmptyState>
        )}
        <S.PublishPanelNote>
          게시하면 학생 화면 학생회 활동에 바로 보입니다. 학생 이름이나 학생을
          알아볼 수 있는 내용이 없는지 확인해주세요.
        </S.PublishPanelNote>
      </S.PublishPanel>
    </>
  );
}

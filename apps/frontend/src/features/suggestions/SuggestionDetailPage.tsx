import { useId, useState, type FormEvent } from 'react';
import styled from 'styled-components';
import {
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { ChevronLeftIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Steps, type StepItem } from '../../components/intranet/Steps.tsx';
import { Badge, Button, InputBox, TextArea } from '../../dimi-ui-kit/index.ts';
import {
  Notice,
  PersonAvatar,
  statusTone,
  Switch,
  BackLink,
  ButtonLink,
  CountText,
  MetaRow,
  Panel,
  PanelTitle,
  PanelBody,
  SplitLayout,
  SplitMain,
  SplitAside,
  InfoList,
  TextLink,
  commentInput,
} from '../../components/ui/index.ts';
import {
  formatDateTime,
  formatFullDate,
  formatShortDate,
} from '../../lib/date.ts';
import { addComment, getSuggestion, updateNotify } from './api.ts';
import type { Suggestion, SuggestionMessage } from './types.ts';
import * as S from './styles.ts';

const CommentBody = styled(PanelBody)`
  > ${InputBox} {
    ${commentInput}
  }
`;

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
    <S.Message>
      <PersonAvatar name={mine ? '나' : (message.department ?? '학생회')} />
      <S.MessageBody>
        <S.MessageHead>
          <strong>
            {mine
              ? message.original
                ? '내가 보낸 건의'
                : '추가 의견'
              : message.department}
          </strong>
          {message.staffName && <span>담당 {message.staffName}</span>}
          <time dateTime={message.at}>{formatDateTime(message.at)}</time>
        </S.MessageHead>
        <S.MessageText>{message.body}</S.MessageText>
        {message.action && (
          <ButtonLink size="small" to={message.action.to}>
            {message.action.label}
          </ButtonLink>
        )}
      </S.MessageBody>
    </S.Message>
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
      <BackLink to="/suggestions">
        <ChevronLeftIcon />내 건의
      </BackLink>
      <PageHeader
        title={suggestion.title}
        description={
          <MetaRow>
            <span>{suggestion.id}</span>
            <span>{formatShortDate(suggestion.submittedAt)} 제출</span>
          </MetaRow>
        }
        actions={
          <Badge theme={statusTone.suggestion[suggestion.status]}>
            {suggestion.status}
          </Badge>
        }
      />

      <Panel $padded aria-label="처리 단계">
        <Steps aria-label="처리 단계" items={toSteps(suggestion)} />
      </Panel>

      <SplitLayout>
        <SplitMain>
          {agenda && (
            <S.LinkedAgenda aria-labelledby="agenda-title">
              <div>
                <S.LinkedAgendaLabel>이 건의가 연결된 안건</S.LinkedAgendaLabel>
                <S.LinkedAgendaTitle id="agenda-title">
                  {agenda.title}
                </S.LinkedAgendaTitle>
                <MetaRow as="p">
                  <span>
                    현재 단계: {agenda.stage}
                    {agenda.stageNote && `, ${agenda.stageNote}`}
                  </span>
                  <span>건의 {agenda.suggestionCount}건 연결</span>
                </MetaRow>
              </div>
              <TextLink to={`/activity/${agenda.id}`}>진행 과정 보기</TextLink>
            </S.LinkedAgenda>
          )}

          <Panel aria-labelledby="messages-title">
            <PanelTitle $split id="messages-title">
              주고받은 내용
              <CountText>{suggestion.messages.length}</CountText>
            </PanelTitle>
            <S.Messages>
              {suggestion.messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </S.Messages>
          </Panel>

          <Panel as="form" onSubmit={onComment}>
            <PanelTitle>
              <label htmlFor={commentId}>추가 의견</label>
            </PanelTitle>
            <CommentBody>
              <TextArea
                id={commentId}
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
              <S.CommentActions>
                <S.CommentActionsHint>
                  접수된 건의는 원문을 고칠 수 없어 추가 의견으로 남깁니다.
                </S.CommentActionsHint>
                <Button
                  type="submit"
                  disabled={!comment.trim() || sending === 'saving'}
                >
                  보내기
                </Button>
              </S.CommentActions>
            </CommentBody>
          </Panel>
        </SplitMain>

        <SplitAside>
          <Panel aria-labelledby="info-title">
            <PanelTitle id="info-title">건의 정보</PanelTitle>
            <InfoList>
              <dt>분류</dt>
              <dd>
                <Badge>{suggestion.category}</Badge>
              </dd>
              <dt>담당 부서</dt>
              <dd>{suggestion.department ?? '배정 전'}</dd>
              {suggestion.aboutAgenda && (
                <>
                  <dt>의견 보탠 안건</dt>
                  <dd>
                    <TextLink to={`/activity/${suggestion.aboutAgenda.id}`}>
                      {suggestion.aboutAgenda.title}
                    </TextLink>
                  </dd>
                </>
              )}
              <dt>이름 공개</dt>
              <dd>{suggestion.identity === 'anonymous' ? '익명' : '실명'}</dd>
              <dt>제출일</dt>
              <dd>{formatFullDate(suggestion.submittedAt)}</dd>
              <dt>최근 변경</dt>
              <dd>{formatFullDate(suggestion.updatedAt)}</dd>
            </InfoList>
          </Panel>

          <Panel aria-labelledby="notify-title">
            <PanelTitle id="notify-title">알림</PanelTitle>
            <S.NotifyList>
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
            </S.NotifyList>
          </Panel>
        </SplitAside>
      </SplitLayout>
    </>
  );
}

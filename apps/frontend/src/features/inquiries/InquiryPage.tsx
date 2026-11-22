import { useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { getSession, useSession } from '../../app/session.ts';
import { Button, Control, Icon, Input } from '../../dimi-ui-kit/index.ts';
import { iconArrowForwardIos } from '../../dimi-ui-kit/icons';
import {
  ButtonLink,
  CardTitle,
  Checkbox,
  ChoiceGroup,
  CountedTextArea,
  EmptyState,
  FilterChips,
  Notice,
  TextLink,
  TwoColumn,
} from '../../components/ui/index.ts';
import { createInquiry, listStudentInquiries, toggleLike } from './api.ts';
import { InquiryItem, LikeToggle } from './InquiryItem.tsx';
import {
  inquiryScopes,
  inquiryStatuses,
  type InquiryScope,
  type InquiryStatus,
} from './types.ts';
import * as S from './styles.ts';

/** 학생 질의함: 전체 공개 질의와 내 질의. /inquiries/new면 오른쪽에 새 질의 작성이 열린다. */
export async function inquiryListLoader() {
  return listStudentInquiries(getSession().name);
}

type Filter = 'all' | InquiryStatus;
const filters: Filter[] = ['all', ...inquiryStatuses];

const BODY_MAX = 1000;

export function InquiryPage() {
  const inquiries = useLoaderData<typeof inquiryListLoader>();
  const session = useSession();
  const revalidator = useRevalidator();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const composing = pathname.endsWith('/new');

  const filter = filters.find((item) => item === params.get('status')) ?? 'all';
  const mineOnly = params.has('mine');
  const openId = params.get('id');

  const setParam = (key: string, value: string | null) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  const visible = inquiries.filter(
    (inquiry) =>
      (filter === 'all' || inquiry.status === filter) &&
      (!mineOnly || inquiry.mine),
  );

  const linkFor = (id: string) => {
    const next = new URLSearchParams(params);
    if (openId === id) next.delete('id');
    else next.set('id', id);
    const query = next.toString();
    return `${pathname}${query ? `?${query}` : ''}`;
  };

  const onLike = (id: string) =>
    void toggleLike(id, session.name).then(() => revalidator.revalidate());

  const list = (
    <S.ListCard aria-labelledby="inquiry-list-title">
      <S.ListHead>
        <CardTitle id="inquiry-list-title">질의 목록</CardTitle>
        <S.ListTools>
          <Checkbox
            label="내 질의만 보기"
            checked={mineOnly}
            onChange={(event) =>
              setParam('mine', event.target.checked ? '' : null)
            }
          />
          <FilterChips
            aria-label="처리 상태"
            value={filter}
            onChange={(value) =>
              setParam('status', value === 'all' ? null : value)
            }
            items={filters.map((value) => ({
              value,
              label: value === 'all' ? '전체' : value,
            }))}
          />
        </S.ListTools>
      </S.ListHead>
      {visible.length > 0 ? (
        <S.List aria-label="질의 목록">
          {visible.map((inquiry) => (
            <InquiryItem
              key={inquiry.id}
              inquiry={inquiry}
              open={openId === inquiry.id}
              to={linkFor(inquiry.id)}
              onToggleLike={() => onLike(inquiry.id)}
              footer={
                <>
                  <LikeToggle
                    inquiry={inquiry}
                    onToggle={() => onLike(inquiry.id)}
                  />
                  {inquiry.activity && (
                    <TextLink to={`/activities/${inquiry.activity.id}`}>
                      연결된 활동 보기
                      <Icon icon={iconArrowForwardIos} size={14} />
                    </TextLink>
                  )}
                </>
              }
            />
          ))}
        </S.List>
      ) : (
        <EmptyState>
          {mineOnly && inquiries.every((inquiry) => !inquiry.mine)
            ? '아직 보낸 질의가 없어요. 학교생활에서 궁금하거나 바뀌었으면 하는 점을 알려주세요.'
            : '이 상태의 질의가 없어요.'}
        </EmptyState>
      )}
    </S.ListCard>
  );

  return (
    <>
      <PageHeader
        title="질문과 건의"
        actions={
          <ButtonLink
            theme="accent"
            variant="primary"
            to={`/inquiries/new${params.size ? `?${params.toString()}` : ''}`}
          >
            <PlusIcon />
            질의 작성하기
          </ButtonLink>
        }
      />
      {composing ? (
        <TwoColumn $aside="480px">
          {list}
          <ComposeCard />
        </TwoColumn>
      ) : (
        list
      )}
    </>
  );
}

const scopeHint: Record<InquiryScope, string> = {
  학생회만: '학생회만 질의 내용과 처리 결과를 볼 수 있어요.',
  '전체 공개':
    '전체 공개 시 다른 학생들도 질의 내용과 처리 결과를 볼 수 있어요.',
};

function ComposeCard() {
  const session = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState<InquiryScope>('학생회만');
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'saving') return;
    const next = {
      title: title.trim() ? undefined : '제목을 적어주세요.',
      body: body.trim() ? undefined : '내용을 적어주세요.',
    };
    setErrors(next);
    if (next.title || next.body) return;
    setStatus('saving');
    try {
      const id = await createInquiry(
        { title, body, scope, anonymous },
        session,
      );
      await navigate(`/inquiries?id=${id}`, { replace: true });
    } catch {
      setStatus('error');
    }
  };

  return (
    <S.SideCard
      as="form"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="compose-title"
    >
      <CardTitle id="compose-title">새 질의 작성</CardTitle>
      <S.ComposeField>
        <label htmlFor="compose-title-input">
          제목<S.Required aria-hidden="true">*</S.Required>
        </label>
        <Input
          id="compose-title-input"
          required
          maxLength={60}
          autoFocus
          value={title}
          error={Boolean(errors.title)}
          aria-describedby={errors.title ? 'compose-title-error' : undefined}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
        />
        {errors.title && (
          <S.ErrorText id="compose-title-error">{errors.title}</S.ErrorText>
        )}
      </S.ComposeField>
      <S.ComposeField>
        <label htmlFor="compose-body-input">
          내용<S.Required aria-hidden="true">*</S.Required>
        </label>
        <CountedTextArea
          id="compose-body-input"
          required
          maxLength={BODY_MAX}
          value={body}
          error={Boolean(errors.body)}
          aria-describedby={
            errors.body ? 'compose-body-error compose-terms' : 'compose-terms'
          }
          onChange={(event) => {
            setBody(event.target.value);
            setErrors((prev) => ({ ...prev, body: undefined }));
          }}
        />
        {errors.body && (
          <S.ErrorText id="compose-body-error">{errors.body}</S.ErrorText>
        )}
        <S.Hint id="compose-terms">
          부적절한 내용 포함 시 실명 파악과 함께 학생부에 이관될 수 있습니다.{' '}
          <Link to="/terms">약관 보기</Link>
        </S.Hint>
      </S.ComposeField>
      <S.ComposeField>
        <span id="compose-scope">공개 범위</span>
        <ChoiceGroup
          aria-labelledby="compose-scope"
          aria-describedby="compose-scope-hint"
          value={scope}
          onChange={(next) => {
            setScope(next);
            if (next === '학생회만') setAnonymous(false);
          }}
          items={inquiryScopes.map((item) => ({ value: item, label: item }))}
        />
        <S.Hint id="compose-scope-hint">{scopeHint[scope]}</S.Hint>
      </S.ComposeField>
      {/* 익명은 전체 공개일 때만 고를 수 있다 (기능 명세서 SGT-C1). Figma는 학생회만에서도 보여준다. */}
      {scope === '전체 공개' && (
        <S.AnonymousBox>
          <div>
            <strong id="compose-anonymous">익명으로 제출</strong>
            <span id="compose-anonymous-hint">
              학생회 임원에게 작성자가 표시되지 않아요
            </span>
          </div>
          <Control
            type="toggle"
            checked={anonymous}
            onChange={setAnonymous}
            aria-labelledby="compose-anonymous"
            aria-describedby="compose-anonymous-hint"
          />
        </S.AnonymousBox>
      )}
      {status === 'error' && (
        <Notice tone="warn" role="alert">
          보내지 못했습니다. 잠시 후 다시 시도해주세요.
        </Notice>
      )}
      <Button
        type="submit"
        size="large"
        theme="accent"
        variant="primary"
        fullWidth
        disabled={status === 'saving'}
      >
        질의 제출하기
      </Button>
    </S.SideCard>
  );
}

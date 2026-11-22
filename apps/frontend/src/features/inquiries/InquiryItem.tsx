import type { ReactNode } from 'react';
import { Steps } from '../../components/intranet/Steps.tsx';
import { Badge, Icon } from '../../dimi-ui-kit/index.ts';
import { iconArrowForwardIos, iconSchool } from '../../dimi-ui-kit/icons';
import {
  Like,
  PersonAvatar,
  ScopeBadge,
  statusTone,
} from '../../components/ui/index.ts';
import { formatShortDate } from '../../lib/date.ts';
import { inquiryMeta, inquirySteps } from './format.ts';
import type { InquiryView } from './types.ts';
import * as S from './styles.ts';

export function StatusBadge({ inquiry }: { inquiry: InquiryView }) {
  return (
    <Badge size="small" theme={statusTone.inquiry[inquiry.status]}>
      {inquiry.status}
    </Badge>
  );
}

/** 공감: 학생은 하트로 켜고 끄고, 학생회는 수만 본다. */
export function LikeToggle({
  inquiry,
  onToggle,
}: {
  inquiry: InquiryView;
  onToggle?: () => void;
}) {
  return (
    <Like
      count={inquiry.likes}
      liked={inquiry.liked}
      onToggle={onToggle}
      subject={inquiry.title}
    />
  );
}

/** 처리 단계, 질의 원문, 답변 */
export function InquiryThread({
  inquiry,
  showQuestion = true,
}: {
  inquiry: InquiryView;
  showQuestion?: boolean;
}) {
  return (
    <>
      <Steps aria-label="처리 단계" items={inquirySteps(inquiry)} />
      {showQuestion && (
        <S.Bubble>
          <PersonAvatar name={inquiry.author ?? '익명'} aria-hidden="true" />
          <S.BubbleBody>
            <span>
              {inquiry.author ?? '익명'} ·{' '}
              {formatShortDate(inquiry.submittedAt)}
            </span>
            <p>{inquiry.body}</p>
          </S.BubbleBody>
        </S.Bubble>
      )}
      {inquiry.answer ? (
        <S.Bubble $tinted={!showQuestion}>
          <Icon icon={iconSchool} size={24} />
          <S.BubbleBody>
            <span>
              {inquiry.answer.department} · {formatShortDate(inquiry.answer.at)}
            </span>
            <p>{inquiry.answer.body}</p>
          </S.BubbleBody>
        </S.Bubble>
      ) : (
        inquiry.status !== '접수' && (
          <S.Hidden>답변은 질의한 학생에게만 보여요.</S.Hidden>
        )
      )}
    </>
  );
}

/**
 * 질의 목록의 한 줄. 고른 질의는 그 자리에서 펼쳐 처리 단계와 내용을 보여준다.
 * meta에 공감 수를 붙이면(학생회) 오른쪽 하트를 그리지 않는다.
 */
export function InquiryItem({
  inquiry,
  open,
  to,
  likesInMeta = false,
  onToggleLike,
  footer,
}: {
  inquiry: InquiryView;
  open: boolean;
  to: string;
  likesInMeta?: boolean;
  onToggleLike?: () => void;
  footer?: ReactNode;
}) {
  const meta = inquiryMeta(inquiry);
  if (likesInMeta) meta.push(`공감 ${inquiry.likes}개`);

  return (
    <S.Item $open={open}>
      <S.Row $open={open}>
        <S.RowMain>
          <S.RowTitle>
            <S.RowLink to={to} aria-expanded={open}>
              {inquiry.title}
            </S.RowLink>
            <StatusBadge inquiry={inquiry} />
            <ScopeBadge scope={inquiry.scope} />
          </S.RowTitle>
          <S.RowMeta>{meta.join(' · ')}</S.RowMeta>
        </S.RowMain>
        <S.RowAside>
          {!likesInMeta && (
            <LikeToggle inquiry={inquiry} onToggle={onToggleLike} />
          )}
          <time dateTime={inquiry.submittedAt}>
            {formatShortDate(inquiry.submittedAt)}
          </time>
          <Icon
            icon={iconArrowForwardIos}
            size={16}
            style={{ transform: open ? 'rotate(90deg)' : undefined }}
          />
        </S.RowAside>
      </S.Row>
      {open && (
        <S.Detail>
          <S.DetailTitle>
            <StatusBadge inquiry={inquiry} />
            {inquiry.title}
          </S.DetailTitle>
          <InquiryThread inquiry={inquiry} />
          {footer && <S.DetailFoot>{footer}</S.DetailFoot>}
        </S.Detail>
      )}
    </S.Item>
  );
}

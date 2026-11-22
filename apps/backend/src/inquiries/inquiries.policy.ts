import { isCouncil, type Viewer } from '#/common/viewer';
import type { InquiryScope, InquiryStatus } from '#/db/schema/index';

type ViewerRef = Pick<Viewer, 'id' | 'permissions'>;

/** 2장 공개 범위: 전체 공개 inquiries are visible to everyone, 학생회만 ones to the council and the author. */
export function canViewInquiry(
  viewer: ViewerRef,
  inquiry: { scope: InquiryScope; authorId: string },
): boolean {
  return (
    inquiry.scope === '전체 공개' ||
    isCouncil(viewer) ||
    inquiry.authorId === viewer.id
  );
}

/**
 * SGT-C1, SGT-R3: anonymous inquiries never show the author's name, grade or
 * class to anyone but the author, council members included.
 */
export function canSeeAuthor(
  viewer: Pick<Viewer, 'id'>,
  inquiry: { anonymous: boolean; authorId: string },
): boolean {
  return inquiry.authorId === viewer.id || !inquiry.anonymous;
}

/**
 * SGT-U1: the answer and the rejection reason are visible only to the author
 * and the council. 7장 leaves wider disclosure open, so this keeps the
 * narrower rule until it is decided.
 */
export function canSeeAnswer(
  viewer: ViewerRef,
  inquiry: { authorId: string },
): boolean {
  return isCouncil(viewer) || inquiry.authorId === viewer.id;
}

/** 공감 is offered only on 전체 공개 inquiries. */
export function canLikeInquiry(
  viewer: ViewerRef,
  inquiry: { scope: InquiryScope; authorId: string },
): boolean {
  return inquiry.scope === '전체 공개' && canViewInquiry(viewer, inquiry);
}

/**
 * 5.4 처리 흐름: 접수 → 답변 완료 → 처리 완료, or 반려 with a reason from 접수 or
 * 답변 완료. 접수 → 처리 완료 is allowed when the answer is sent with it (a
 * question answered and closed at once). 답변 완료 → 답변 완료 rewrites the
 * answer. 처리 완료 and 반려 are final.
 */
const transitions: Record<InquiryStatus, readonly InquiryStatus[]> = {
  접수: ['답변 완료', '처리 완료', '반려'],
  '답변 완료': ['답변 완료', '처리 완료', '반려'],
  '처리 완료': [],
  반려: [],
};

export function canTransitionInquiry(
  from: InquiryStatus,
  to: InquiryStatus,
): boolean {
  return transitions[from].includes(to);
}

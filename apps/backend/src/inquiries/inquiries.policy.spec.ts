import { Permission } from '#/db/schema/index';
import {
  canLikeInquiry,
  canSeeAnswer,
  canSeeAuthor,
  canTransitionInquiry,
  canViewInquiry,
} from './inquiries.policy.ts';

const author = { id: 'author', permissions: 0 };
const other = { id: 'other', permissions: 0 };
const council = { id: 'council', permissions: Permission.isStudentCouncil };

describe('inquiry policy', () => {
  it('hides 학생회만 inquiries from other students', () => {
    const inquiry = { scope: '학생회만' as const, authorId: 'author' };
    expect(canViewInquiry(author, inquiry)).toBe(true);
    expect(canViewInquiry(council, inquiry)).toBe(true);
    expect(canViewInquiry(other, inquiry)).toBe(false);
    expect(
      canViewInquiry(other, { scope: '전체 공개', authorId: 'author' }),
    ).toBe(true);
  });

  it('hides anonymous authors from everyone but the author, council included', () => {
    const inquiry = { anonymous: true, authorId: 'author' };
    expect(canSeeAuthor(author, inquiry)).toBe(true);
    expect(canSeeAuthor(council, inquiry)).toBe(false);
    expect(canSeeAuthor(other, inquiry)).toBe(false);
    expect(canSeeAuthor(other, { anonymous: false, authorId: 'author' })).toBe(
      true,
    );
  });

  it('shows the answer only to the author and the council', () => {
    expect(canSeeAnswer(author, { authorId: 'author' })).toBe(true);
    expect(canSeeAnswer(council, { authorId: 'author' })).toBe(true);
    expect(canSeeAnswer(other, { authorId: 'author' })).toBe(false);
  });

  it('takes 공감 only on 전체 공개 inquiries', () => {
    expect(
      canLikeInquiry(other, { scope: '전체 공개', authorId: 'author' }),
    ).toBe(true);
    expect(
      canLikeInquiry(author, { scope: '학생회만', authorId: 'author' }),
    ).toBe(false);
  });

  it('follows 접수 → 답변 완료 → 처리 완료 or 반려', () => {
    expect(canTransitionInquiry('접수', '답변 완료')).toBe(true);
    expect(canTransitionInquiry('접수', '반려')).toBe(true);
    expect(canTransitionInquiry('답변 완료', '처리 완료')).toBe(true);
    expect(canTransitionInquiry('답변 완료', '반려')).toBe(true);
    expect(canTransitionInquiry('답변 완료', '접수')).toBe(false);
    expect(canTransitionInquiry('처리 완료', '반려')).toBe(false);
    expect(canTransitionInquiry('반려', '답변 완료')).toBe(false);
  });
});

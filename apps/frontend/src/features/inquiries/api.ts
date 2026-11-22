import { api, listAll, notFoundAs } from '../../lib/api.ts';
import { numericId } from '../activities/api.ts';
import { departmentIdOf } from '../members/api.ts';
import type { Department, DepartmentRef } from '../members/types.ts';
import type {
  InquiryScope,
  InquiryStatus,
  InquiryView,
  NewInquiryInput,
} from './types.ts';

/**
 * 질의(질문과 건의) API (백엔드 /inquiries).
 * 익명 작성자 가리기, 답변 노출 범위, 공개 범위 거르기는 서버가 한다.
 */

interface InquiryResponse {
  id: number;
  title: string;
  body: string;
  scope: InquiryScope;
  anonymous: boolean;
  author: string | null;
  authorClass: string | null;
  status: InquiryStatus;
  department: DepartmentRef | null;
  answer: { department: DepartmentRef | null; body: string; at: string } | null;
  rejectReason: string | null;
  statusDates: Partial<Record<InquiryStatus, string>>;
  submittedAt: string;
  likes: number;
  liked: boolean;
  mine: boolean;
  activity: { id: number; title: string } | null;
}

const notFound = notFoundAs('질의를 찾을 수 없습니다.');

function toView(row: InquiryResponse): InquiryView {
  const department = row.department?.name;
  // 화면에는 답변 말풍선 하나만 있어, 반려되면 반려 사유를 그 자리에 보여준다.
  const answer =
    row.status === '반려' && row.rejectReason
      ? {
          department: department ?? '학생회',
          body: row.rejectReason,
          at: row.statusDates.반려 ?? row.submittedAt,
        }
      : row.answer && {
          department: row.answer.department?.name ?? department ?? '학생회',
          body: row.answer.body,
          at: row.answer.at,
        };
  return {
    id: String(row.id),
    title: row.title,
    body: row.body,
    scope: row.scope,
    anonymous: row.anonymous,
    author: row.author,
    authorClass: row.authorClass,
    status: row.status,
    ...(department && { department }),
    ...(answer && { answer }),
    statusDates: row.statusDates,
    submittedAt: row.submittedAt,
    likes: row.likes,
    liked: row.liked,
    mine: row.mine,
    ...(row.activity && {
      activity: { id: String(row.activity.id), title: row.activity.title },
    }),
  };
}

/** 학생 질의함: 전체 공개 질의와 내 질의 (서버가 거른다) */
export async function listStudentInquiries(
  query: { mine?: boolean } = {},
): Promise<InquiryView[]> {
  return (await listAll<InquiryResponse>('/inquiries', query)).map(toView);
}

/** 학생회 질의함: 모든 질의 (학생회 임원이 부르면 서버가 모두 준다) */
export async function listCouncilInquiries(): Promise<InquiryView[]> {
  return (await listAll<InquiryResponse>('/inquiries')).map(toView);
}

export async function getInquiry(id: string): Promise<InquiryView> {
  return toView(
    await api<InquiryResponse>(`/inquiries/${numericId(id)}`).catch(notFound),
  );
}

export async function createInquiry(input: NewInquiryInput): Promise<string> {
  const created = await api<InquiryResponse>('/inquiries', {
    method: 'POST',
    body: {
      title: input.title.trim(),
      body: input.body.trim(),
      scope: input.scope,
      // 익명은 전체 공개일 때만 고를 수 있다.
      anonymous: input.scope === '전체 공개' && input.anonymous,
    },
  });
  return String(created.id);
}

/** 공감 켜기·끄기 (전체 공개 질의만) */
export async function toggleLike(id: string): Promise<void> {
  await api(`/inquiries/${numericId(id)}/like`, { method: 'POST' });
}

/**
 * 학생회 처리. 답변 보내기 → 답변 완료, 처리 완료(답변이 있어야 한다), 반려하기(사유 필수) → 반려.
 * 반려는 body가 사유다. 처리 완료와 반려는 되돌릴 수 없다.
 */
export async function answerInquiry(
  id: string,
  status: Exclude<InquiryStatus, '접수'>,
  body: string,
  department: Department,
): Promise<void> {
  const departmentId = await departmentIdOf(department);
  await api(`/inquiries/${numericId(id)}/answer`, {
    method: 'POST',
    body: {
      status,
      ...(body.trim() && { body: body.trim() }),
      ...(departmentId !== null && { departmentId }),
    },
  });
}

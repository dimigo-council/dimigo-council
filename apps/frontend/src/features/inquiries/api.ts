import type { Department } from '../members/types.ts';
import { mockInquiries } from './mockData.ts';
import type {
  Inquiry,
  InquiryStatus,
  InquiryView,
  NewInquiryInput,
} from './types.ts';

/**
 * 질의(질문과 건의) API.
 * TODO: 백엔드 질의 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 익명 작성자 가리기, 답변 노출 범위, 공개 범위 거르기는 서버가 해야 한다. 지금은 toView가 흉내 낸다.
 * 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const inquiries = structuredClone(mockInquiries);

function find(id: string) {
  const inquiry = inquiries.find((item) => item.id === id);
  if (!inquiry) {
    throw new Response('질의를 찾을 수 없습니다.', { status: 404 });
  }
  return inquiry;
}

const byNewest = (a: Inquiry, b: Inquiry) => Number(b.id) - Number(a.id);

/**
 * viewer: 보는 사람 이름. council이면 학생회 화면이다.
 * 익명 질의는 작성자 본인이 아니면 이름·학년·반을 모두 비운다 (학생회 화면도 마찬가지).
 * 답변은 학생회와 작성자에게만 보인다.
 */
function toView(
  inquiry: Inquiry,
  viewer: string,
  council: boolean,
): InquiryView {
  const { authorName, authorClass, likedBy, answer, ...rest } =
    structuredClone(inquiry);
  const mine = authorName === viewer;
  const showAuthor = mine || !inquiry.anonymous;
  return {
    ...rest,
    author: showAuthor ? authorName : null,
    authorClass: showAuthor ? authorClass : null,
    ...((council || mine) && answer && { answer }),
    mine,
    liked: likedBy.includes(viewer),
  };
}

/** 학생 질의함: 전체 공개 질의와 내 질의 */
export async function listStudentInquiries(
  viewer: string,
): Promise<InquiryView[]> {
  return inquiries
    .filter(
      (inquiry) =>
        inquiry.scope === '전체 공개' || inquiry.authorName === viewer,
    )
    .sort(byNewest)
    .map((inquiry) => toView(inquiry, viewer, false));
}

/** 학생회 질의함: 모든 질의 */
export async function listCouncilInquiries(
  viewer: string,
): Promise<InquiryView[]> {
  return [...inquiries]
    .sort(byNewest)
    .map((inquiry) => toView(inquiry, viewer, true));
}

export async function createInquiry(
  input: NewInquiryInput,
  author: { name: string; affiliation: string },
): Promise<string> {
  const id = String(Math.max(...inquiries.map((item) => Number(item.id))) + 1);
  const now = new Date().toISOString();
  inquiries.push({
    id,
    title: input.title.trim(),
    body: input.body.trim(),
    scope: input.scope,
    // 익명은 전체 공개일 때만 고를 수 있다.
    anonymous: input.scope === '전체 공개' && input.anonymous,
    authorName: author.name,
    authorClass: author.affiliation,
    status: '접수',
    statusDates: { 접수: now },
    submittedAt: now,
    likedBy: [],
    likes: 0,
  });
  return id;
}

/** 공감 켜기·끄기 */
export async function toggleLike(id: string, viewer: string): Promise<void> {
  const inquiry = find(id);
  if (inquiry.likedBy.includes(viewer)) {
    inquiry.likedBy = inquiry.likedBy.filter((name) => name !== viewer);
    inquiry.likes -= 1;
  } else {
    inquiry.likedBy.push(viewer);
    inquiry.likes += 1;
  }
}

export async function setInquiryDepartment(
  id: string,
  department: Department,
): Promise<void> {
  find(id).department = department;
}

/**
 * 학생회 처리. 답변 보내기 → 답변 완료, 처리 완료, 반려하기(사유 필수) → 반려.
 * 답변이나 사유를 함께 보내면 답변을 새로 쓴다.
 */
export async function answerInquiry(
  id: string,
  status: Exclude<InquiryStatus, '접수'>,
  body: string,
  department: Department,
): Promise<void> {
  const inquiry = find(id);
  const now = new Date().toISOString();
  if (body.trim()) {
    inquiry.answer = { department, body: body.trim(), at: now };
    inquiry.statusDates['답변 완료'] ??= now;
  }
  if (status === '반려' && !inquiry.answer) {
    throw new Error('반려 사유를 적어주세요.');
  }
  inquiry.department = department;
  inquiry.status = status;
  inquiry.statusDates[status] ??= now;
}

export async function setInquiryActivity(
  id: string,
  activity: { id: string; title: string },
): Promise<void> {
  find(id).activity = activity;
}

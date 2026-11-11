export type PublishKind = '안건' | '진행 기록' | '설문 결과';

/** KIT 상태 매핑 visibility 중 공개 검토에서 쓰는 상태 */
export type PublishStatus = '공개 검토 중' | '게시됨' | '수정 요청';

/** 학생 화면에 내보내기 전에 회장단이 확인하는 글 */
export interface PublishItem {
  id: string;
  kind: PublishKind;
  title: string;
  /** 학생 화면에 그대로 나갈 내용 */
  preview: string;
  department: string;
  requester: string;
  requestedAt: string;
  status: PublishStatus;
  agenda?: { id: string; title: string };
  /** 게시하거나 수정 요청한 사람 */
  reviewer?: string;
  decidedAt?: string;
  /** 수정 요청 사유 */
  note?: string;
}

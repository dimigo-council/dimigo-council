/** 활동 기록: 사이트 관리자가 정적 파일로 배포한 공개 PDF. 작성·검토·승인 흐름은 없다. */
export interface ActivityRecord {
  id: string;
  title: string;
  publishedAt: string;
  /** public/ 아래 정적 PDF 경로 */
  file: string;
}

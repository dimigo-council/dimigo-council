/** 활동 번호 표시: 24 → #024 */
export function activityNo(id: string) {
  return `#${id.padStart(3, '0')}`;
}

/**
 * 목록의 연계 정보: 질의에서 시작했으면 질의 번호, 아니면 설문 연계.
 * 학생 화면 활동 목록에서 부서 뒤에 붙는다. (업무는 학생회만 볼 수 있어 학생 화면에는 없다.)
 */
export function activityNote(activity: {
  inquiryIds: string[];
  surveyIds: string[];
}) {
  if (activity.inquiryIds.length > 0) {
    return `질의 #${activity.inquiryIds[0]}에서 시작`;
  }
  return activity.surveyIds.length > 0 ? '설문 연계' : undefined;
}

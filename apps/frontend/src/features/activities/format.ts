/** 활동 번호 표시: 24 → #024 */
export function activityNo(id: string) {
  return `#${id.padStart(3, '0')}`;
}

/**
 * 목록의 연계 정보: 질의에서 시작했으면 질의 번호, 아니면 설문 연계, 진행 중인 업무 수.
 * 학생 화면 활동 목록에서 부서 뒤에 붙는다.
 */
export function activityNote(
  activity: { id: string; inquiryIds: string[] },
  surveys: { activity?: { id: string } }[],
  tasks: { activity?: { id: string }; status: string }[],
) {
  if (activity.inquiryIds.length > 0) {
    return `질의 #${activity.inquiryIds[0]}에서 시작`;
  }
  if (surveys.some((survey) => survey.activity?.id === activity.id)) {
    return '설문 연계';
  }
  const openTasks = tasks.filter(
    (task) => task.activity?.id === activity.id && task.status !== '완료',
  ).length;
  return openTasks > 0 ? `업무 ${openTasks}건 진행 중` : undefined;
}

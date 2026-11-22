import type {
  SurveyAnswers,
  SurveyQuestion,
  SurveyStage,
} from '#/db/schema/index';

export type SurveyStatus = '작성 중' | '예정' | '진행 중' | '마감';

interface SurveyTiming {
  stage: SurveyStage;
  opensAt: Date | null;
  closesAt: Date | null;
  closedAt: Date | null;
}

/**
 * 상태값 (2장) is 진행 중 or 마감 for published surveys. Drafts are 작성 중 and
 * published surveys whose 시작일 has not come yet are 예정; students never see either.
 */
export function surveyStatus(
  survey: SurveyTiming,
  now: Date = new Date(),
): SurveyStatus {
  if (survey.stage === 'draft') return '작성 중';
  if (survey.opensAt && survey.opensAt > now) return '예정';
  if (survey.closedAt || (survey.closesAt && survey.closesAt <= now))
    return '마감';
  return '진행 중';
}

/** The frontend's stage: a published survey waiting for its 시작일 is `scheduled`. */
export function surveyStageLabel(
  survey: SurveyTiming,
  now: Date = new Date(),
): 'draft' | 'scheduled' | 'published' {
  if (survey.stage === 'draft') return 'draft';
  return survey.opensAt && survey.opensAt > now ? 'scheduled' : 'published';
}

const ALL_GRADES = [1, 2, 3];

export function audienceLabel(grades: number[]): string {
  const sorted = [...new Set(grades)].sort((a, b) => a - b);
  return sorted.length === ALL_GRADES.length
    ? '전교생'
    : sorted.map((grade) => `${grade}학년`).join(', ');
}

/**
 * SRV-C1, SRV-C3: a survey limited to some grades needs the respondent's grade,
 * and a survey that collects 학년/반 needs both from sign-up. With no grade
 * limit and no 학년/반 collection, anyone signed in may respond.
 */
export function isEligible(
  person: { grade: number | null; class: number | null },
  survey: { grades: number[]; collectsClass: boolean },
): boolean {
  if (survey.collectsClass && (person.grade == null || person.class == null))
    return false;
  const limited = ALL_GRADES.some((grade) => !survey.grades.includes(grade));
  if (
    limited &&
    (person.grade == null || !survey.grades.includes(person.grade))
  )
    return false;
  return true;
}

/** 응답 대상 인원 from counts of onboarded users grouped by grade and whether a class is set. */
export function targetCount(
  groups: { grade: number | null; hasClass: boolean; total: number }[],
  survey: { grades: number[]; collectsClass: boolean },
): number {
  return groups
    .filter((group) =>
      isEligible(
        { grade: group.grade, class: group.hasClass ? 1 : null },
        survey,
      ),
    )
    .reduce((sum, group) => sum + group.total, 0);
}

export function participationRate(responses: number, target: number): number {
  return target === 0 ? 0 : responses / target;
}

/** What still blocks publishing a draft (SRV-C1). Empty when it can be published. */
export function publishProblems(
  survey: {
    title: string;
    activityId: number | null;
    opensAt: Date | null;
    closesAt: Date | null;
    questions: SurveyQuestion[];
  },
  now: Date = new Date(),
): string[] {
  const problems: string[] = [];
  if (!survey.title.trim()) problems.push('제목을 입력하세요.');
  if (survey.activityId == null)
    problems.push('연결 활동을 골라야 설문을 게시할 수 있습니다.');
  if (!survey.closesAt) problems.push('마감일을 정하세요.');
  else if (survey.closesAt <= (survey.opensAt ?? now))
    problems.push('마감일은 시작일과 지금보다 뒤여야 합니다.');
  else if (survey.closesAt <= now)
    problems.push('마감일은 지금보다 뒤여야 합니다.');
  if (survey.questions.length === 0)
    problems.push('문항을 하나 이상 넣으세요.');
  survey.questions.forEach((question, index) => {
    const label = `${index + 1}번 문항`;
    if (!question.title.trim()) problems.push(`${label}의 질문을 입력하세요.`);
    if (question.type === 'single' || question.type === 'multiple') {
      const options = question.options.map((option) => option.trim());
      if (options.length < 2 || options.some((option) => !option))
        problems.push(`${label}에 빈칸 없는 선택지를 두 개 이상 넣으세요.`);
      else if (new Set(options).size !== options.length)
        problems.push(`${label}의 선택지가 겹칩니다.`);
      if (
        question.type === 'multiple' &&
        question.maxSelections !== undefined &&
        question.maxSelections > options.length
      )
        problems.push(`${label}의 최대 선택 수가 선택지 수보다 많습니다.`);
    }
  });
  return problems;
}

/**
 * Checks answers against the questions and returns only the answered ones.
 * Blank text answers count as unanswered.
 */
export function checkAnswers(
  questions: SurveyQuestion[],
  answers: SurveyAnswers,
): { answers: SurveyAnswers; problems: string[] } {
  const problems: string[] = [];
  const known = new Map(questions.map((question) => [question.id, question]));
  for (const id of Object.keys(answers))
    if (!known.has(id)) problems.push(`Unknown question ${id}`);
  const cleaned: SurveyAnswers = {};
  for (const question of questions) {
    const value = answers[question.id];
    const problemsBefore = problems.length;
    let answered = false;
    if (question.type === 'single') {
      if (value !== undefined && value !== '') {
        if (typeof value !== 'string' || !question.options.includes(value))
          problems.push(`${question.id}: choose one of the options`);
        else {
          cleaned[question.id] = value;
          answered = true;
        }
      }
    } else if (question.type === 'multiple') {
      if (
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (
          !Array.isArray(value) ||
          new Set(value).size !== value.length ||
          value.some((option) => !question.options.includes(option))
        )
          problems.push(`${question.id}: choose distinct options`);
        else if (
          question.maxSelections !== undefined &&
          value.length > question.maxSelections
        )
          problems.push(
            `${question.id}: choose at most ${question.maxSelections}`,
          );
        else {
          cleaned[question.id] = value;
          answered = true;
        }
      }
    } else if (value !== undefined) {
      if (typeof value !== 'string')
        problems.push(`${question.id}: answer with text`);
      else if (value.trim().length > question.maxLength)
        problems.push(
          `${question.id}: at most ${question.maxLength} characters`,
        );
      else if (value.trim()) {
        cleaned[question.id] = value.trim();
        answered = true;
      }
    }
    if (question.required && !answered && problems.length === problemsBefore)
      problems.push(`${question.id}: required`);
  }
  return { answers: cleaned, problems };
}

export type QuestionResult =
  | {
      id: string;
      title: string;
      type: 'single' | 'multiple';
      answered: number;
      /** ratio is per respondent who answered, so 복수 선택 ratios can add up past 1. */
      rows: { label: string; count: number; ratio: number }[];
    }
  | {
      id: string;
      title: string;
      type: 'short' | 'long';
      answered: number;
      /** In submission order. */
      answers: string[];
    };

/** SRV-R2 문항별 결과 */
export function summarizeQuestions(
  questions: SurveyQuestion[],
  responses: { answers: SurveyAnswers }[],
): QuestionResult[] {
  return questions.map((question) => {
    const values = responses
      .map((response) => response.answers[question.id])
      .filter(
        (value) =>
          value !== undefined &&
          (Array.isArray(value) ? value.length > 0 : value.trim() !== ''),
      );
    if (question.type === 'single' || question.type === 'multiple')
      return {
        id: question.id,
        title: question.title,
        type: question.type,
        answered: values.length,
        rows: question.options.map((option) => {
          const count = values.filter((value) =>
            Array.isArray(value) ? value.includes(option) : value === option,
          ).length;
          return {
            label: option,
            count,
            ratio: values.length === 0 ? 0 : count / values.length,
          };
        }),
      };
    return {
      id: question.id,
      title: question.title,
      type: question.type,
      answered: values.length,
      answers: values.filter(
        (value): value is string => typeof value === 'string',
      ),
    };
  });
}

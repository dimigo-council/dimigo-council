import type { Question } from '../surveys/types.ts';
import type { AdminSurvey, AdminSurveyStatus, SurveyDraft } from './types.ts';

export function surveyStatus(
  survey: Pick<AdminSurvey, 'stage' | 'closesAt' | 'closedAt'>,
  now = new Date(),
): AdminSurveyStatus {
  if (survey.stage === 'draft') return '작성 중';
  if (survey.stage === 'scheduled') return '예약';
  if (survey.closedAt) return '마감';
  return survey.closesAt && new Date(survey.closesAt) < now
    ? '마감'
    : '진행 중';
}

export const questionTypeLabel: Record<Question['type'], string> = {
  single: '객관식',
  multiple: '복수 선택',
  scale: '척도',
  text: '주관식',
};

export const audiences = [
  '전교생',
  '1학년',
  '2학년',
  '3학년',
  '기숙사 생활 학생',
  '동아리 부장',
];

/** 검토해 줄 사람. 학습부 → 학습부장 */
export function reviewerLabel(department: string) {
  return department === '회장단' ? '회장' : `${department}장`;
}

export function hasChoices(
  question: Question,
): question is Extract<Question, { options: string[] }> {
  return question.type === 'single' || question.type === 'multiple';
}

export interface PublishCheck {
  label: string;
  done: boolean;
}

/** 공개 전 확인. 모두 통과해야 공개 예약을 할 수 있다. */
export function publishChecks(
  draft: SurveyDraft,
  survey: Pick<AdminSurvey, 'department' | 'reviewRequested'>,
  now = new Date(),
): PublishCheck[] {
  const { questions, opensAt, closesAt } = draft;
  return [
    {
      label: '필수 문항이 1개 이상 있음',
      done: questions.some((question) => question.required),
    },
    {
      label: '제목·선택지가 빈 문항 없음',
      done:
        questions.length > 0 &&
        questions.every(
          (question) =>
            question.title.trim() &&
            (!hasChoices(question) ||
              (question.options.length >= 2 &&
                question.options.every((option) => option.trim()))),
        ),
    },
    {
      label: '응답 대상과 기간 설정됨',
      done: Boolean(
        draft.title.trim() &&
        draft.audience &&
        opensAt &&
        closesAt &&
        opensAt < closesAt &&
        new Date(closesAt) > now,
      ),
    },
    {
      label: `${reviewerLabel(survey.department)}에게 검토 요청`,
      done: survey.reviewRequested,
    },
  ];
}

/** 날짜 입력값(2026-11-05)과 ISO 시각 사이 변환. 공개는 그날 9시, 마감은 그날 23:59. */
export function toDateInput(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInput(value: string, edge: 'open' | 'close') {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date =
    edge === 'open'
      ? new Date(year, month - 1, day, 9, 0)
      : new Date(year, month - 1, day, 23, 59);
  return date.toISOString();
}

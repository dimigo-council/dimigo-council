import type { SurveyQuestion } from '#/db/schema/index';
import {
  audienceLabel,
  checkAnswers,
  isEligible,
  publishProblems,
  summarizeQuestions,
  surveyStageLabel,
  surveyStatus,
  targetCount,
} from './surveys.policy.ts';

const now = new Date('2026-11-20T00:00:00Z');
const past = new Date('2026-11-10T00:00:00Z');
const future = new Date('2026-11-30T00:00:00Z');

const questions: SurveyQuestion[] = [
  {
    id: 'q1',
    type: 'single',
    title: '좋아요?',
    required: true,
    options: ['예', '아니요'],
  },
  {
    id: 'q2',
    type: 'multiple',
    title: '고르세요',
    required: false,
    options: ['A', 'B', 'C'],
    maxSelections: 2,
  },
  { id: 'q3', type: 'short', title: '한마디', required: false, maxLength: 10 },
  { id: 'q4', type: 'long', title: '의견', required: false, maxLength: 100 },
];

describe('surveyStatus', () => {
  const published = { stage: 'published' as const, closedAt: null };

  it('derives 작성 중, 예정, 진행 중 and 마감', () => {
    expect(
      surveyStatus(
        { ...published, stage: 'draft', opensAt: null, closesAt: null },
        now,
      ),
    ).toBe('작성 중');
    expect(
      surveyStatus({ ...published, opensAt: future, closesAt: future }, now),
    ).toBe('예정');
    expect(
      surveyStatus({ ...published, opensAt: past, closesAt: future }, now),
    ).toBe('진행 중');
    expect(
      surveyStatus({ ...published, opensAt: past, closesAt: past }, now),
    ).toBe('마감');
    expect(
      surveyStatus(
        { ...published, opensAt: past, closesAt: future, closedAt: past },
        now,
      ),
    ).toBe('마감');
    expect(
      surveyStageLabel(
        { ...published, opensAt: future, closesAt: future },
        now,
      ),
    ).toBe('scheduled');
  });
});

describe('eligibility', () => {
  it('limits grades and requires 학년/반 when the survey collects them', () => {
    const everyone = { grades: [1, 2, 3], collectsClass: false };
    const seconds = { grades: [2], collectsClass: false };
    const withClass = { grades: [1, 2, 3], collectsClass: true };
    expect(isEligible({ grade: null, class: null }, everyone)).toBe(true);
    expect(isEligible({ grade: 2, class: null }, seconds)).toBe(true);
    expect(isEligible({ grade: 1, class: 3 }, seconds)).toBe(false);
    expect(isEligible({ grade: null, class: null }, seconds)).toBe(false);
    expect(isEligible({ grade: 2, class: null }, withClass)).toBe(false);
    expect(isEligible({ grade: 2, class: 4 }, withClass)).toBe(true);
    expect(audienceLabel([1, 2, 3])).toBe('전교생');
    expect(audienceLabel([2, 1])).toBe('1학년, 2학년');
  });

  it('counts the eligible users as 응답 대상 인원', () => {
    const groups = [
      { grade: 1, hasClass: true, total: 200 },
      { grade: 2, hasClass: false, total: 10 },
      { grade: 2, hasClass: true, total: 190 },
      { grade: null, hasClass: false, total: 5 },
    ];
    expect(
      targetCount(groups, { grades: [1, 2, 3], collectsClass: false }),
    ).toBe(405);
    expect(targetCount(groups, { grades: [2], collectsClass: false })).toBe(
      200,
    );
    expect(
      targetCount(groups, { grades: [1, 2, 3], collectsClass: true }),
    ).toBe(390);
  });
});

describe('publishProblems', () => {
  const ready = {
    title: '설문',
    activityId: 1,
    opensAt: null,
    closesAt: future,
    questions,
  };

  it('accepts a complete survey', () => {
    expect(publishProblems(ready, now)).toEqual([]);
  });

  it('requires a linked activity, a deadline and filled questions', () => {
    expect(publishProblems({ ...ready, activityId: null }, now)).toContain(
      '연결 활동을 골라야 설문을 게시할 수 있습니다.',
    );
    expect(publishProblems({ ...ready, closesAt: past }, now)).toHaveLength(1);
    expect(publishProblems({ ...ready, questions: [] }, now)).toHaveLength(1);
    expect(
      publishProblems(
        {
          ...ready,
          questions: [
            {
              id: 'q1',
              type: 'single',
              title: '',
              required: true,
              options: ['예', ''],
            },
          ],
        },
        now,
      ),
    ).toHaveLength(2);
  });
});

describe('checkAnswers', () => {
  it('keeps valid answers and drops blank text', () => {
    expect(
      checkAnswers(questions, {
        q1: '예',
        q2: ['A', 'C'],
        q3: '  좋아요 ',
        q4: ' ',
      }),
    ).toEqual({
      answers: { q1: '예', q2: ['A', 'C'], q3: '좋아요' },
      problems: [],
    });
  });

  it('rejects unknown questions, bad options and missing required answers', () => {
    expect(checkAnswers(questions, {}).problems).toEqual(['q1: required']);
    expect(checkAnswers(questions, { q1: '몰라요' }).problems).toHaveLength(1);
    expect(
      checkAnswers(questions, { q1: '예', q2: ['A', 'B', 'C'] }).problems,
    ).toEqual(['q2: choose at most 2']);
    expect(
      checkAnswers(questions, { q1: '예', q2: ['A', 'A'] }).problems,
    ).toHaveLength(1);
    expect(
      checkAnswers(questions, { q1: '예', q3: '열한 글자가 넘는 답입니다' })
        .problems,
    ).toEqual(['q3: at most 10 characters']);
    expect(checkAnswers(questions, { q1: '예', q9: 'x' }).problems).toEqual([
      'Unknown question q9',
    ]);
  });
});

describe('summarizeQuestions', () => {
  it('counts choices and lists text answers', () => {
    const [single, multiple, short, long] = summarizeQuestions(questions, [
      { answers: { q1: '예', q2: ['A', 'B'], q3: '좋음' } },
      { answers: { q1: '예', q2: ['A'] } },
      { answers: { q1: '아니요', q3: '별로' } },
    ]);
    expect(single).toEqual({
      id: 'q1',
      title: '좋아요?',
      type: 'single',
      answered: 3,
      rows: [
        { label: '예', count: 2, ratio: 2 / 3 },
        { label: '아니요', count: 1, ratio: 1 / 3 },
      ],
    });
    expect(multiple).toMatchObject({
      answered: 2,
      rows: [
        { label: 'A', count: 2, ratio: 1 },
        { label: 'B', count: 1, ratio: 0.5 },
        { label: 'C', count: 0, ratio: 0 },
      ],
    });
    expect(short).toMatchObject({ answered: 2, answers: ['좋음', '별로'] });
    expect(long).toMatchObject({ answered: 0, answers: [] });
  });
});

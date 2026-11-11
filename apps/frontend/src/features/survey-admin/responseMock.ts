import type {
  AnswerValue,
  Answers,
  MultipleChoiceQuestion,
  Question,
  ScaleQuestion,
  SingleChoiceQuestion,
} from '../surveys/types.ts';
import type { AdminSurvey, SurveyResponse } from './types.ts';

/**
 * 개발용 예시 응답. 공개된 설문마다 응답 수(responses)만큼 만든다.
 * 설문 id로 난수 씨앗을 정해 새로고침해도 같은 응답이 나온다.
 * 문항별 경향(tendencies)은 결과 화면이 그럴듯해 보이도록 손으로 정했다.
 */

/** 객관식·척도: 선택지별 상대 비중. 복수 선택: 선택지마다 고를 확률. 주관식: [답, 비중] */
type QuestionTendency = number[] | [string, number][];
type SurveyTendencies = Record<string, QuestionTendency>;

const tendenciesBySurvey: Record<string, SurveyTendencies> = {
  'lunch-2026-10': {
    q1: [6, 14, 34, 32, 14],
    q2: [0.32, 0.21, 0.47, 0.38, 0.12],
    q3: [
      ['배식 시간이 너무 짧아요', 9],
      ['배식 시간이 너무 짧아요.', 4],
      ['배식시간이 너무 짧아요', 3],
      ['국이 너무 싱거워요', 6],
      ['국이 너무 싱거워요!', 2],
      ['고기 반찬이 더 자주 나왔으면 좋겠어요', 7],
      ['샐러드바가 있으면 좋겠습니다', 5],
      ['샐러드 바가 있으면 좋겠습니다', 2],
      ['줄이 너무 길어요', 6],
      ['면 요리를 늘려주세요', 4],
      ['과일 후식이 자주 나왔으면 해요', 3],
      ['알레르기 성분 표시를 크게 해주세요', 2],
      ['석식 양이 부족해요', 3],
    ],
  },
  'sports-day-2026': {
    q1: [24, 31, 12, 22, 11],
    q2: [0.28, 0.36, 0.18, 0.41, 0.09],
    q3: [5, 9, 28, 38, 20],
    q4: [44, 31, 25],
    q5: [38, 34, 28],
    q6: [
      ['반 대항 계주는 꼭 남겨주세요', 6],
      ['반 대항 계주 꼭 남겨주세요', 3],
      ['응원전 시간을 늘려주세요', 5],
      ['그늘막을 더 설치해주세요', 4],
      ['그늘막 더 설치해 주세요', 2],
      ['물을 충분히 준비해주세요', 3],
      ['결승은 전교생이 볼 수 있게 해주세요', 3],
      ['심판을 공정하게 봐주세요', 2],
    ],
  },
  'dorm-laundry-2026': {
    q1: [9, 24, 52, 15],
    q2: [48, 33, 19],
    q3: [
      ['건조기가 부족해요', 8],
      ['건조기가 부족해요.', 3],
      ['건조기 부족', 4],
      ['세탁기를 쓰려고 오래 기다려요', 6],
      ['세탁기 대기 시간이 길어요', 4],
      ['22시 이후에는 소리가 방까지 들려요', 3],
      ['세제가 없을 때가 많아요', 3],
      ['예약 기능이 있으면 좋겠어요', 4],
      ['예약 기능이 있으면 좋겠어요!', 2],
      ['빨래 바구니가 부족해요', 2],
    ],
  },
  'council-review-2026-1': { q1: [4, 10, 31, 40, 15] },
  'festival-booth-2026': { q1: [12, 30, 58] },
};

const sampleNames = [
  '김도윤',
  '이서연',
  '박지호',
  '최하은',
  '정민준',
  '강예린',
  '조현우',
  '윤소율',
];

const gradeWeights = [36, 34, 30];
const classCount = 6;
const studentsPerClass = 28;

/** 성의 없이 첫 선택지만 골라 아주 빨리 내는 응답자의 비율 */
const carelessRespondentChance = 0.03;

/** 선택 문항을 건너뛸 확률. 주관식은 절반 넘게 비워 둔다. */
const textSkipChance = 0.55;
const choiceSkipChance = 0.08;

/** 복수 선택 문항에 경향이 없을 때 선택지마다 고를 확률 */
const defaultPickChance = 0.3;

type Random = () => number;

/** 씨앗이 같으면 늘 같은 순서로 0~1 난수를 낸다 (mulberry32). */
function createSeededRandom(seed: string): Random {
  let state = 0;
  for (const character of seed) {
    state = (state * 31 + character.charCodeAt(0)) | 0;
  }
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(items: T[], weights: number[], random: Random) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let remaining = random() * totalWeight;
  for (let index = 0; index < items.length; index++) {
    remaining -= weights[index];
    if (remaining < 0) return items[index];
  }
  return items[items.length - 1];
}

function randomIntegerFrom(minimum: number, count: number, random: Random) {
  return minimum + Math.floor(random() * count);
}

function equalWeights(items: unknown[], weight: number) {
  return items.map(() => weight);
}

function skipsOptionalQuestion(question: Question, random: Random) {
  if (question.required) return false;
  const skipChance =
    question.type === 'text' ? textSkipChance : choiceSkipChance;
  return random() < skipChance;
}

function carelessAnswer(question: Question): AnswerValue {
  switch (question.type) {
    case 'single':
      return question.options[0];
    case 'multiple':
      return [question.options[0]];
    case 'scale':
      return 1;
    case 'text':
      return 'ㅇ';
  }
}

function generateSingleChoice(
  question: SingleChoiceQuestion,
  weights: number[] | undefined,
  random: Random,
) {
  const optionWeights = weights ?? equalWeights(question.options, 1);
  return pickWeighted(question.options, optionWeights, random);
}

function generateMultipleChoice(
  question: MultipleChoiceQuestion,
  pickChances: number[] | undefined,
  random: Random,
) {
  const chances =
    pickChances ?? equalWeights(question.options, defaultPickChance);
  const chosen = question.options.filter(
    (_, index) => random() < chances[index],
  );
  if (chosen.length === 0) {
    chosen.push(pickWeighted(question.options, chances, random));
  }
  if (!question.maxSelections) return chosen;
  return chosen.slice(0, question.maxSelections);
}

function generateScale(
  question: ScaleQuestion,
  weights: number[] | undefined,
  random: Random,
) {
  const steps = Array.from({ length: question.steps }, (_, index) => index + 1);
  const stepWeights = weights ?? equalWeights(steps, 1);
  return pickWeighted(steps, stepWeights, random);
}

function generateText(
  answerPool: [string, number][] | undefined,
  random: Random,
) {
  if (!answerPool) return undefined;
  const texts = answerPool.map(([text]) => text);
  const weights = answerPool.map(([, weight]) => weight);
  return pickWeighted(texts, weights, random);
}

function generateAnswer(
  question: Question,
  tendency: QuestionTendency | undefined,
  random: Random,
  isCareless: boolean,
): AnswerValue | undefined {
  if (skipsOptionalQuestion(question, random)) return undefined;
  if (isCareless) return carelessAnswer(question);

  switch (question.type) {
    case 'single':
      return generateSingleChoice(
        question,
        tendency as number[] | undefined,
        random,
      );
    case 'multiple':
      return generateMultipleChoice(
        question,
        tendency as number[] | undefined,
        random,
      );
    case 'scale':
      return generateScale(question, tendency as number[] | undefined, random);
    case 'text':
      return generateText(tendency as [string, number][] | undefined, random);
  }
}

function generateAnswers(
  survey: AdminSurvey,
  tendencies: SurveyTendencies,
  random: Random,
  isCareless: boolean,
) {
  const answers: Answers = {};
  for (const question of survey.questions) {
    const tendency = tendencies[question.id];
    const value = generateAnswer(question, tendency, random, isCareless);
    if (value !== undefined) answers[question.id] = value;
  }
  return answers;
}

interface ResponsePeriod {
  start: number;
  end: number;
}

function responsePeriod(survey: AdminSurvey, opensAt: string, now: Date) {
  const deadline = survey.closedAt ?? survey.closesAt ?? now;
  return {
    start: new Date(opensAt).getTime(),
    end: Math.min(now.getTime(), new Date(deadline).getTime()),
  };
}

/** 공개 직후에 몰리고 뒤로 갈수록 줄어든다. */
function randomSubmissionTime(period: ResponsePeriod, random: Random) {
  const progress = random() ** 1.7;
  return new Date(period.start + (period.end - period.start) * progress);
}

function generateDurationSeconds(
  survey: AdminSurvey,
  isCareless: boolean,
  random: Random,
) {
  if (isCareless) return randomIntegerFrom(9, 10, random);
  const expectedSeconds = 40 + survey.questions.length * 18;
  return Math.round(expectedSeconds + random() * 160);
}

type UnnumberedResponse = Omit<SurveyResponse, 'id' | 'number'>;

/** 난수를 쓰는 순서가 바뀌면 같은 씨앗에서도 다른 응답이 나오므로 순서를 지킨다. */
function generateResponse(
  survey: AdminSurvey,
  tendencies: SurveyTendencies,
  period: ResponsePeriod,
  random: Random,
): UnnumberedResponse {
  const submittedAt = randomSubmissionTime(period, random);
  const isCareless = random() < carelessRespondentChance;
  const grade = pickWeighted<1 | 2 | 3>([1, 2, 3], gradeWeights, random);
  const answers = generateAnswers(survey, tendencies, random, isCareless);
  const classNumber = randomIntegerFrom(1, classCount, random);
  const seatNumber = randomIntegerFrom(1, studentsPerClass, random);
  const durationSeconds = generateDurationSeconds(survey, isCareless, random);

  let studentId: string | undefined;
  if (survey.identity !== 'anonymous') {
    studentId = `${grade}${classNumber}${String(seatNumber).padStart(2, '0')}`;
  }
  let name: string | undefined;
  if (survey.identity === 'named') {
    name = sampleNames[randomIntegerFrom(0, sampleNames.length, random)];
  }

  return {
    submittedAt: submittedAt.toISOString(),
    durationSeconds,
    grade,
    studentId,
    name,
    answers,
    excluded: false,
  };
}

function bySubmittedAt(earlier: UnnumberedResponse, later: UnnumberedResponse) {
  return earlier.submittedAt.localeCompare(later.submittedAt);
}

export function mockResponses(
  survey: AdminSurvey,
  now = new Date(),
): SurveyResponse[] {
  if (survey.stage !== 'published' || !survey.opensAt) return [];

  const random = createSeededRandom(survey.id);
  const tendencies = tendenciesBySurvey[survey.id] ?? {};
  const period = responsePeriod(survey, survey.opensAt, now);

  const responses = Array.from({ length: survey.responses }, () =>
    generateResponse(survey, tendencies, period, random),
  );

  return responses.sort(bySubmittedAt).map((response, index) => ({
    id: `${survey.id}-r${index + 1}`,
    number: index + 1,
    ...response,
  }));
}

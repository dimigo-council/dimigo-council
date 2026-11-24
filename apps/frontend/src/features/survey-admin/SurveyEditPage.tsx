import { useId, useState } from 'react';
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Button, Input, Option, TextButton } from '../../dimi-ui-kit/index.ts';
import {
  Breadcrumbs,
  ButtonLink,
  ControlMark,
  OptionCard,
  SelectControl,
} from '../../components/ui/index.ts';
import { ApiError, errorMessage } from '../../lib/api.ts';
import { listActivities } from '../activities/api.ts';
import { activityNo } from '../activities/format.ts';
import type { Activity } from '../activities/types.ts';
import type { Question } from '../surveys/types.ts';
import { getAdminSurvey, saveSurveyDraft, scheduleSurvey } from './api.ts';
import {
  fromDateInput,
  hasChoices,
  questionTypeLabel,
  toDateInput,
} from './format.ts';
import type { AdminSurvey, SurveyDraft } from './types.ts';
import * as S from './styles.ts';

export async function surveyEditLoader({ params }: LoaderFunctionArgs) {
  const [survey, activities] = await Promise.all([
    getAdminSurvey(params.surveyId ?? ''),
    listActivities(),
  ]);
  return { survey, activities };
}

const questionTypes = Object.keys(questionTypeLabel) as Question['type'][];
const allGrades = [1, 2, 3] as const;
type Grade = (typeof allGrades)[number];

/** 응답 학년 ↔ 응답 대상 글자 ("전교생", "1학년, 2학년") */
function gradesOf(audience: string): Grade[] {
  if (audience === '전교생') return [...allGrades];
  const picked = allGrades.filter((grade) => audience.includes(`${grade}학년`));
  return picked.length > 0 ? picked : [...allGrades];
}

function audienceOf(grades: Grade[]) {
  if (grades.length === allGrades.length) return '전교생';
  return grades.map((grade) => `${grade}학년`).join(', ');
}

function toDraft(survey: AdminSurvey): SurveyDraft {
  const {
    title,
    intro,
    audience,
    collectsClass,
    activity,
    opensAt,
    closesAt,
    questions,
  } = survey;
  return {
    title,
    intro,
    audience,
    collectsClass,
    activity,
    opensAt,
    closesAt,
    questions,
  };
}

/** 형식을 바꿔도 질문은 두고, 선택지는 단일·복수 선택 사이에서만 이어 쓴다. */
function changeType(question: Question, type: Question['type']): Question {
  const base = {
    id: question.id,
    title: question.title,
    required: question.required,
  };
  if (type === 'single' || type === 'multiple') {
    const options = hasChoices(question) ? question.options : ['', ''];
    return { ...base, type, options };
  }
  return { ...base, type, maxLength: type === 'short' ? 100 : 1000 };
}

function nextQuestionId(questions: Question[]) {
  const numbers = questions.map((question) =>
    Number(question.id.replace(/\D/g, '') || 0),
  );
  return `q${Math.max(0, ...numbers) + 1}`;
}

/** 게시하기 전에 채워야 하는 것. 비어 있으면 게시할 수 있다. */
function publishProblems(draft: SurveyDraft) {
  const problems: string[] = [];
  if (!draft.title.trim()) problems.push('설문 제목을 적어 주세요.');
  if (!draft.activity)
    problems.push('연결할 활동을 선택해야 설문을 게시할 수 있어요.');
  if (!draft.opensAt || !draft.closesAt || draft.opensAt >= draft.closesAt)
    problems.push('시작일과 마감일을 확인해 주세요.');
  const incomplete = draft.questions.some(
    (question) =>
      !question.title.trim() ||
      (hasChoices(question) &&
        (question.options.length < 2 ||
          question.options.some((option) => !option.trim()))),
  );
  if (incomplete) problems.push('질문과 옵션을 모두 적어 주세요.');
  return problems;
}

export function SurveyEditPage() {
  const { survey, activities } = useLoaderData<typeof surveyEditLoader>();
  return (
    <SurveyEditor key={survey.id} survey={survey} activities={activities} />
  );
}

/** 학생회 / 설문 만들기 */
function SurveyEditor({
  survey,
  activities,
}: {
  survey: AdminSurvey;
  activities: Activity[];
}) {
  const navigate = useNavigate();
  const readOnly = survey.stage !== 'draft';
  const [draft, setDraft] = useState(() => toDraft(survey));
  const [status, setStatus] = useState<'idle' | 'saved' | 'busy'>('idle');
  const [problems, setProblems] = useState<string[]>([]);

  const update = (patch: Partial<SurveyDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setStatus('idle');
  };
  const grades = gradesOf(draft.audience);
  const pageTitle = readOnly ? '설문 보기' : '설문 만들기';

  /** 서버가 돌려준 이유(게시 조건 등)를 그대로 보여준다. */
  const showError = (caught: unknown, fallback: string) => {
    setStatus('idle');
    setProblems(
      caught instanceof ApiError && caught.status === 400
        ? caught.messages
        : [errorMessage(caught, fallback)],
    );
  };

  const onSave = async () => {
    setStatus('busy');
    setProblems([]);
    try {
      await saveSurveyDraft(survey.id, draft);
      setStatus('saved');
    } catch (caught) {
      showError(caught, '저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const onPublish = async () => {
    const found = publishProblems(draft);
    setProblems(found);
    if (found.length > 0) return;
    setStatus('busy');
    try {
      await saveSurveyDraft(survey.id, draft);
      await scheduleSurvey(survey.id);
      await navigate('/work/surveys');
    } catch (caught) {
      showError(caught, '게시하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[{ label: '설문', to: '/work/surveys' }, { label: pageTitle }]}
      />
      <PageHeader
        tall
        title={pageTitle}
        actions={
          readOnly && (
            <ButtonLink
              theme="accent"
              variant="primary"
              to={`/work/surveys/${survey.id}/results`}
            >
              결과 보기
            </ButtonLink>
          )
        }
      />
      <S.EditorLayout>
        <S.Sheet aria-labelledby="survey-content-title">
          <h2 id="survey-content-title">설문 내용</h2>
          <S.Field>
            <label htmlFor="survey-title">설문 제목</label>
            <Input
              id="survey-title"
              maxLength={60}
              placeholder="설문 제목을 적어 주세요"
              value={draft.title}
              disabled={readOnly}
              onChange={(event) => update({ title: event.target.value })}
            />
          </S.Field>
          <S.Field>
            <label htmlFor="survey-intro">설명</label>
            <Input
              id="survey-intro"
              maxLength={200}
              placeholder="설문을 왜 하는지 적어 주세요"
              value={draft.intro}
              disabled={readOnly}
              onChange={(event) => update({ intro: event.target.value })}
            />
          </S.Field>
          <S.Field>
            <label htmlFor="survey-activity">연결 활동</label>
            <SelectControl
              id="survey-activity"
              aria-describedby="survey-activity-hint"
              value={draft.activity?.id ?? ''}
              disabled={readOnly}
              onChange={(event) => {
                const picked = activities.find(
                  (activity) => activity.id === event.target.value,
                );
                update({
                  activity: picked && { id: picked.id, title: picked.title },
                });
              }}
            >
              <option value="">활동을 골라 주세요</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  활동 {activityNo(activity.id)} · {activity.title}
                </option>
              ))}
            </SelectControl>
            <p id="survey-activity-hint">
              연결할 활동을 선택해야 설문을 게시할 수 있어요.
            </p>
          </S.Field>
          <QuestionsEditor
            questions={draft.questions}
            readOnly={readOnly}
            onChange={(questions) => update({ questions })}
          />
        </S.Sheet>

        <S.SideColumn>
          <S.Sheet $compact aria-labelledby="survey-settings-title">
            <h2 id="survey-settings-title">설문 설정</h2>
            <S.Field>
              <label htmlFor="survey-opens">시작일</label>
              <Input
                id="survey-opens"
                type="date"
                value={toDateInput(draft.opensAt)}
                disabled={readOnly}
                onChange={(event) =>
                  update({ opensAt: fromDateInput(event.target.value, 'open') })
                }
              />
            </S.Field>
            <S.Field>
              <label htmlFor="survey-closes">마감일</label>
              <Input
                id="survey-closes"
                type="date"
                value={toDateInput(draft.closesAt)}
                disabled={readOnly}
                onChange={(event) =>
                  update({
                    closesAt: fromDateInput(event.target.value, 'close'),
                  })
                }
              />
            </S.Field>
            <S.RadioGroup
              role="radiogroup"
              aria-labelledby="collects-class-label"
            >
              <S.FieldLabelText id="collects-class-label">
                학년/반 수집 여부
              </S.FieldLabelText>
              <OptionCard
                name="collects-class"
                title="학년/반 비수집"
                checked={!draft.collectsClass}
                disabled={readOnly}
                onChange={() =>
                  update({ collectsClass: false, audience: '전교생' })
                }
              />
              <OptionCard
                name="collects-class"
                title="학년/반 수집"
                description="회원가입 때 학년·반을 입력한 학생만 응답할 수 있어요."
                checked={draft.collectsClass}
                disabled={readOnly}
                onChange={() => update({ collectsClass: true })}
              />
            </S.RadioGroup>
            {draft.collectsClass && (
              <S.Field>
                <span id="grades-label">응답 학년</span>
                <S.GradePicker role="group" aria-labelledby="grades-label">
                  {allGrades.map((grade) => {
                    const on = grades.includes(grade);
                    return (
                      <Option
                        key={grade}
                        role="checkbox"
                        aria-checked={on}
                        selected={on}
                        disabled={readOnly || (on && grades.length === 1)}
                        onClick={() =>
                          update({
                            audience: audienceOf(
                              on
                                ? grades.filter((g) => g !== grade)
                                : [...grades, grade].sort((a, b) => a - b),
                            ),
                          })
                        }
                      >
                        {grade}학년
                      </Option>
                    );
                  })}
                </S.GradePicker>
                <p>선택한 학년의 학생만 응답할 수 있어요.</p>
              </S.Field>
            )}
            {problems.length > 0 && (
              <div role="alert">
                {problems.map((problem) => (
                  <S.FormError key={problem}>{problem}</S.FormError>
                ))}
              </div>
            )}
          </S.Sheet>
          {!readOnly && (
            <S.EditorActions>
              <Button
                size="large"
                disabled={status === 'busy'}
                onClick={() => void onSave()}
              >
                {status === 'saved' ? '저장됨' : '임시 저장'}
              </Button>
              <Button
                size="large"
                theme="accent"
                variant="primary"
                disabled={status === 'busy'}
                onClick={() => void onPublish()}
              >
                설문 게시
              </Button>
            </S.EditorActions>
          )}
        </S.SideColumn>
      </S.EditorLayout>
    </>
  );
}

function QuestionsEditor({
  questions,
  readOnly,
  onChange,
}: {
  questions: Question[];
  readOnly: boolean;
  onChange: (questions: Question[]) => void;
}) {
  const replace = (index: number, question: Question) =>
    onChange(questions.map((q, i) => (i === index ? question : q)));

  return (
    <>
      {questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          index={index}
          question={question}
          readOnly={readOnly}
          onChange={(next) => replace(index, next)}
          onDelete={
            questions.length > 1
              ? () => onChange(questions.filter((_, i) => i !== index))
              : undefined
          }
        />
      ))}
      {!readOnly && (
        <S.RowActions>
          <Button
            onClick={() =>
              onChange([
                ...questions,
                {
                  id: nextQuestionId(questions),
                  type: 'single',
                  title: '',
                  required: true,
                  options: ['', ''],
                },
              ])
            }
          >
            문항 추가
          </Button>
        </S.RowActions>
      )}
    </>
  );
}

function QuestionEditor({
  question,
  index,
  readOnly,
  onChange,
  onDelete,
}: {
  question: Question;
  index: number;
  readOnly: boolean;
  onChange: (question: Question) => void;
  onDelete?: () => void;
}) {
  const id = useId();
  const number = index + 1;

  return (
    <S.QuestionBlock aria-label={`문항 ${number}`} disabled={readOnly}>
      <S.QuestionHead>
        <Input
          aria-label={`문항 ${number} 질문`}
          maxLength={100}
          placeholder="질문을 적어 주세요"
          value={question.title}
          onChange={(event) =>
            onChange({ ...question, title: event.target.value })
          }
        />
        <S.TypeSelect
          aria-label={`문항 ${number} 형식`}
          value={question.type}
          onChange={(event) =>
            onChange(
              changeType(question, event.target.value as Question['type']),
            )
          }
        >
          {questionTypes.map((type) => (
            <option key={type} value={type}>
              {questionTypeLabel[type]}
            </option>
          ))}
        </S.TypeSelect>
      </S.QuestionHead>

      {hasChoices(question) &&
        question.options.map((option, i) => (
          <S.OptionRow key={i}>
            <ControlMark
              type={question.type === 'single' ? 'radio' : 'checkfill'}
              checked={false}
            />
            <Input
              aria-label={`문항 ${number} 옵션 ${i + 1}`}
              maxLength={60}
              placeholder={`옵션 ${i + 1}`}
              value={option}
              onChange={(event) =>
                onChange({
                  ...question,
                  options: question.options.map((item, j) =>
                    j === i ? event.target.value : item,
                  ),
                })
              }
            />
          </S.OptionRow>
        ))}

      {question.type === 'short' && (
        <Input
          id={`${id}-preview`}
          aria-label="단답형 답 미리보기"
          placeholder="응답자가 짧게 답변합니다"
          disabled
        />
      )}
      {question.type === 'long' && (
        <S.AnswerPreview aria-hidden="true">
          응답자가 자유롭게 답변합니다
        </S.AnswerPreview>
      )}

      {!readOnly && (
        <S.RowActions>
          {hasChoices(question) && (
            <Button
              size="small"
              onClick={() =>
                onChange({ ...question, options: [...question.options, ''] })
              }
            >
              옵션 추가
            </Button>
          )}
          {onDelete && (
            <TextButton size="small" theme="negative" onClick={onDelete}>
              문항 삭제
            </TextButton>
          )}
        </S.RowActions>
      )}
    </S.QuestionBlock>
  );
}

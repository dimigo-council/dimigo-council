import { useEffect, useId, useState } from 'react';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { CloseIcon, PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Meter } from '../../components/intranet/Meter.tsx';
import {
  Badge,
  Button,
  Notice,
  SegmentedControl,
  Select,
  statusTone,
  Switch,
  Tabs,
  Tag,
  TextArea,
  TextField,
} from '../../components/kit/index.ts';
import { formatDate, formatDateTime } from '../../lib/date.ts';
import { identityLabel, identityNotice } from '../surveys/format.ts';
import { QuestionCard } from '../surveys/QuestionCard.tsx';
import type { Answers, Question, SurveyIdentity } from '../surveys/types.ts';
import {
  getAdminSurvey,
  requestSurveyReview,
  saveSurveyDraft,
  scheduleSurvey,
  unscheduleSurvey,
} from './api.ts';
import {
  audiences,
  fromDateInput,
  hasChoices,
  publishChecks,
  questionTypeLabel,
  reviewerLabel,
  surveyStatus,
  toDateInput,
} from './format.ts';
import type { AdminSurvey, SurveyDraft } from './types.ts';
import '../surveys/surveys.css';
import './survey-admin.css';

export async function surveyEditLoader({ params }: LoaderFunctionArgs) {
  return getAdminSurvey(params.surveyId ?? '');
}

const questionTypes = Object.keys(questionTypeLabel) as Question['type'][];
const identities = Object.keys(identityLabel) as SurveyIdentity[];

function toDraft(survey: AdminSurvey): SurveyDraft {
  const { title, intro, audience, identity, opensAt, closesAt, questions } =
    survey;
  return { title, intro, audience, identity, opensAt, closesAt, questions };
}

/** 유형을 바꿔도 제목·필수 여부는 두고, 선택지는 객관식↔복수 선택 사이에서만 이어 쓴다. */
function changeType(question: Question, type: Question['type']): Question {
  const base = {
    id: question.id,
    title: question.title,
    required: question.required,
  };
  const options = hasChoices(question) ? question.options : ['', ''];
  switch (type) {
    case 'single':
      return { ...base, type, options };
    case 'multiple':
      return { ...base, type, options };
    case 'scale':
      return {
        ...base,
        type,
        steps: 5,
        minLabel: '전혀 아니다',
        maxLabel: '매우 그렇다',
      };
    case 'text':
      return { ...base, type, maxLength: 500 };
  }
}

function nextQuestionId(questions: Question[]) {
  const numbers = questions.map((question) =>
    Number(question.id.replace(/\D/g, '') || 0),
  );
  return `q${Math.max(0, ...numbers) + 1}`;
}

export function SurveyEditPage() {
  const survey = useLoaderData<typeof surveyEditLoader>();
  return <SurveyEditor key={survey.id} survey={survey} />;
}

type EditTab = 'questions' | 'settings';

function SurveyEditor({ survey }: { survey: AdminSurvey }) {
  const revalidator = useRevalidator();
  const readOnly = survey.stage === 'published';
  const [draft, setDraft] = useState(() => toDraft(survey));
  const [savedJson, setSavedJson] = useState(() =>
    JSON.stringify(toDraft(survey)),
  );
  const [savedAt, setSavedAt] = useState(survey.savedAt);
  const [saveFailed, setSaveFailed] = useState(false);
  const [tab, setTab] = useState<EditTab>('questions');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  // 고친 뒤 0.8초 동안 더 고치지 않으면 자동 저장한다.
  const json = JSON.stringify(draft);
  const dirty = !readOnly && json !== savedJson;
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      saveSurveyDraft(survey.id, JSON.parse(json) as SurveyDraft).then(
        (at) => {
          setSavedAt(at);
          setSavedJson(json);
          setSaveFailed(false);
        },
        () => setSaveFailed(true),
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [survey.id, json, dirty]);

  const update = (patch: Partial<SurveyDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await saveSurveyDraft(survey.id, draft);
      setSavedJson(json);
      await action();
      await revalidator.revalidate();
    } finally {
      setBusy(false);
    }
  };

  const status = surveyStatus(survey);
  const checks = publishChecks(draft, survey);
  const ready = checks.every((check) => check.done);
  const opensLater =
    draft.opensAt !== undefined && new Date(draft.opensAt) > new Date();

  let saveText = `${formatDateTime(savedAt)} 자동 저장됨`;
  if (saveFailed) saveText = '저장하지 못했습니다. 연결을 확인해주세요.';
  else if (dirty) saveText = '저장 중…';

  return (
    <>
      <nav className="breadcrumb" aria-label="경로">
        <Link to="/work/surveys">설문</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{status}</span>
      </nav>
      <PageHeader
        title={draft.title || '제목 없는 설문'}
        description={
          <span className="meta-row">
            <Badge tone={statusTone.survey[status]}>{status}</Badge>
            <span>
              {survey.owner} · {survey.department}
            </span>
            {readOnly ? (
              <span>
                {survey.opensAt && `${formatDate(survey.opensAt)} 공개`}
              </span>
            ) : (
              <span role="status">{saveText}</span>
            )}
          </span>
        }
        actions={
          readOnly ? (
            <>
              <Link className="btn btn--secondary" to={`/surveys/${survey.id}`}>
                학생 화면 보기
              </Link>
              <Link
                className="btn btn--primary"
                to={`/work/surveys/${survey.id}/results`}
              >
                결과 보기
              </Link>
            </>
          ) : (
            <>
              <Button
                aria-pressed={preview}
                onClick={() => setPreview((value) => !value)}
              >
                {preview ? '편집으로 돌아가기' : '학생 화면 미리보기'}
              </Button>
              {survey.stage === 'draft' && (
                <Button
                  variant="primary"
                  disabled={!ready || busy}
                  onClick={() => void run(() => scheduleSurvey(survey.id))}
                >
                  {opensLater ? '공개 예약' : '지금 공개'}
                </Button>
              )}
              {survey.stage === 'scheduled' && (
                <Button
                  disabled={busy}
                  onClick={() => void run(() => unscheduleSurvey(survey.id))}
                >
                  예약 취소
                </Button>
              )}
            </>
          )
        }
      />

      {readOnly ? (
        <PublishedView survey={survey} />
      ) : preview ? (
        <SurveyPreview draft={draft} />
      ) : (
        <>
          <Tabs
            aria-label="설문 편집"
            idPrefix="survey-edit"
            value={tab}
            onChange={setTab}
            items={[
              {
                value: 'questions',
                label: '문항',
                count: draft.questions.length,
              },
              { value: 'settings', label: '응답 설정' },
            ]}
          />
          <div className="split-layout survey-edit">
            <div
              className="split-layout__main"
              role="tabpanel"
              id={`survey-edit-panel-${tab}`}
              aria-labelledby={`survey-edit-tab-${tab}`}
            >
              {tab === 'questions' ? (
                <QuestionsEditor draft={draft} update={update} />
              ) : (
                <SettingsEditor
                  draft={draft}
                  update={update}
                  scheduled={survey.stage === 'scheduled'}
                />
              )}
            </div>
            <aside className="split-layout__aside">
              <section className="panel" aria-labelledby="checks-title">
                <div className="panel__title panel__title--split">
                  <h2 className="panel__heading" id="checks-title">
                    공개 전 확인
                  </h2>
                  <span className="panel__aside">
                    {checks.filter((check) => check.done).length} /{' '}
                    {checks.length}
                  </span>
                </div>
                <ul className="publish-checks">
                  {checks.map((check) => (
                    <li key={check.label} data-done={check.done}>
                      <span
                        className="choice__box choice__box--check"
                        aria-hidden="true"
                      />
                      {check.label}
                      <span className="visually-hidden">
                        {check.done ? ', 완료' : ', 아직'}
                      </span>
                    </li>
                  ))}
                </ul>
                {!survey.reviewRequested && (
                  <div className="publish-checks__action">
                    <Button
                      block
                      disabled={busy}
                      onClick={() =>
                        void run(() => requestSurveyReview(survey.id))
                      }
                    >
                      {reviewerLabel(survey.department)}에게 검토 요청
                    </Button>
                  </div>
                )}
              </section>
              {survey.stage === 'scheduled' && survey.opensAt && (
                <Notice tone="info">
                  {formatDate(survey.opensAt)}에 학생 화면에 공개됩니다. 그
                  전까지는 고칠 수 있습니다.
                </Notice>
              )}
              <Notice tone="warn">
                공개 후에는 문항을 바꿀 수 없습니다. 응답이 들어온 뒤 문항이
                바뀌면 결과를 비교할 수 없기 때문입니다.
              </Notice>
            </aside>
          </div>
        </>
      )}
    </>
  );
}

interface EditorProps {
  draft: SurveyDraft;
  update: (patch: Partial<SurveyDraft>) => void;
}

function QuestionsEditor({ draft, update }: EditorProps) {
  const { questions } = draft;
  const [openId, setOpenId] = useState<string | null>(questions[0]?.id ?? null);

  const setQuestions = (next: Question[]) => update({ questions: next });
  const replace = (index: number, question: Question) =>
    setQuestions(questions.map((q, i) => (i === index ? question : q)));
  const insertAt = (index: number, question: Question) => {
    setQuestions([
      ...questions.slice(0, index),
      question,
      ...questions.slice(index),
    ]);
    setOpenId(question.id);
  };

  return (
    <>
      <TextArea
        label="설문 안내문"
        showCount
        rows={2}
        maxLength={300}
        placeholder="설문을 왜 하는지, 결과를 어떻게 쓰는지 적어주세요."
        value={draft.intro}
        onChange={(event) => update({ intro: event.target.value })}
      />
      <ol className="q-list" aria-label="문항">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            index={index}
            question={question}
            open={openId === question.id}
            onToggle={() =>
              setOpenId((current) =>
                current === question.id ? null : question.id,
              )
            }
            onChange={(next) => replace(index, next)}
            onDuplicate={() =>
              insertAt(index + 1, {
                ...structuredClone(question),
                id: nextQuestionId(questions),
              })
            }
            onDelete={
              questions.length > 1
                ? () => setQuestions(questions.filter((_, i) => i !== index))
                : undefined
            }
          />
        ))}
      </ol>
      <button
        type="button"
        className="q-add"
        onClick={() =>
          insertAt(questions.length, {
            id: nextQuestionId(questions),
            type: 'single',
            title: '',
            required: true,
            options: ['', ''],
          })
        }
      >
        <PlusIcon />
        문항 추가
      </button>
    </>
  );
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (question: Question) => void;
  onDuplicate: () => void;
  onDelete?: () => void;
}

function QuestionSummary({
  question,
  index,
}: {
  question: Question;
  index: number;
}) {
  return (
    <>
      <span className="q-card__number">Q{index + 1}</span>
      <span
        className={
          question.title
            ? 'q-card__title'
            : 'q-card__title q-card__title--empty'
        }
      >
        {question.title || '문항 제목을 적어주세요'}
      </span>
      <span className="q-card__tags">
        <Tag>{questionTypeLabel[question.type]}</Tag>
        {question.required && <Badge tone="warn">필수</Badge>}
      </span>
    </>
  );
}

function QuestionEditor({
  question,
  index,
  open,
  onToggle,
  onChange,
  onDuplicate,
  onDelete,
}: QuestionEditorProps) {
  const id = useId();
  const bodyId = `${id}-body`;
  const typeLabelId = `${id}-type`;
  const optionsLabelId = `${id}-options`;

  return (
    <li className="q-card" data-open={open}>
      <button
        type="button"
        className="q-card__summary"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <QuestionSummary question={question} index={index} />
      </button>
      {open && (
        <div className="q-card__body" id={bodyId}>
          <TextField
            label="문항"
            maxLength={100}
            placeholder="무엇을 물어볼까요?"
            value={question.title}
            onChange={(event) =>
              onChange({ ...question, title: event.target.value })
            }
          />

          <div className="field">
            <span className="field__label" id={typeLabelId}>
              유형
            </span>
            <SegmentedControl
              aria-labelledby={typeLabelId}
              value={question.type}
              onChange={(type) => onChange(changeType(question, type))}
              items={questionTypes.map((type) => ({
                value: type,
                label: questionTypeLabel[type],
              }))}
            />
          </div>

          {hasChoices(question) && (
            <div className="field">
              <span className="field__label" id={optionsLabelId}>
                선택지
              </span>
              <ul className="q-options" aria-labelledby={optionsLabelId}>
                {question.options.map((option, i) => (
                  <li key={i} className="q-option">
                    <span
                      className={`choice__box choice__box--${question.type === 'single' ? 'radio' : 'check'}`}
                      aria-hidden="true"
                    />
                    <input
                      className="field__control"
                      aria-label={`선택지 ${i + 1}`}
                      maxLength={60}
                      placeholder={`선택지 ${i + 1}`}
                      value={option}
                      onChange={(event) =>
                        onChange({
                          ...question,
                          options: question.options.map((o, j) =>
                            j === i ? event.target.value : o,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`선택지 ${i + 1} 지우기`}
                      disabled={question.options.length <= 2}
                      onClick={() =>
                        onChange({
                          ...question,
                          options: question.options.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <CloseIcon />
                    </button>
                  </li>
                ))}
              </ul>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={question.options.length >= 10}
                  onClick={() =>
                    onChange({
                      ...question,
                      options: [...question.options, ''],
                    })
                  }
                >
                  <PlusIcon />
                  선택지 추가
                </Button>
              </div>
              {question.type === 'multiple' && (
                <div className="q-card__row">
                  <Select
                    label="최대 선택"
                    value={question.maxSelections ?? ''}
                    onChange={(event) =>
                      onChange({
                        ...question,
                        maxSelections: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                  >
                    <option value="">제한 없음</option>
                    {question.options.slice(1).map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}개
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          )}

          {question.type === 'scale' && (
            <div className="q-card__row">
              <Select
                label="단계"
                value={question.steps}
                onChange={(event) =>
                  onChange({ ...question, steps: Number(event.target.value) })
                }
              >
                {[3, 4, 5, 7, 10].map((steps) => (
                  <option key={steps} value={steps}>
                    {steps}단계
                  </option>
                ))}
              </Select>
              <TextField
                label="가장 낮은 값"
                maxLength={20}
                value={question.minLabel}
                onChange={(event) =>
                  onChange({ ...question, minLabel: event.target.value })
                }
              />
              <TextField
                label="가장 높은 값"
                maxLength={20}
                value={question.maxLabel}
                onChange={(event) =>
                  onChange({ ...question, maxLabel: event.target.value })
                }
              />
            </div>
          )}

          {question.type === 'text' && (
            <div className="q-card__row">
              <Select
                label="최대 글자 수"
                value={question.maxLength}
                onChange={(event) =>
                  onChange({
                    ...question,
                    maxLength: Number(event.target.value),
                  })
                }
              >
                {[100, 200, 500, 1000].map((length) => (
                  <option key={length} value={length}>
                    {length}자
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="q-card__foot">
            <Switch
              label="필수 응답"
              checked={question.required}
              onChange={(event) =>
                onChange({ ...question, required: event.target.checked })
              }
            />
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              복제
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="q-card__delete"
              disabled={!onDelete}
              onClick={onDelete}
            >
              삭제
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function SettingsEditor({
  draft,
  update,
  scheduled,
}: EditorProps & { scheduled: boolean }) {
  const identityLabelId = useId();
  const audienceOptions = audiences.includes(draft.audience)
    ? audiences
    : [draft.audience, ...audiences];

  return (
    <section className="panel panel--padded survey-settings">
      <TextField
        label="설문 제목"
        maxLength={60}
        placeholder="예: 시험 기간 자습실 수요 조사"
        value={draft.title}
        onChange={(event) => update({ title: event.target.value })}
      />
      <Select
        label="응답 대상"
        value={draft.audience}
        onChange={(event) => update({ audience: event.target.value })}
      >
        {audienceOptions.map((audience) => (
          <option key={audience}>{audience}</option>
        ))}
      </Select>
      <div className="field">
        <span className="field__label" id={identityLabelId}>
          응답자 정보
        </span>
        <SegmentedControl
          aria-labelledby={identityLabelId}
          value={draft.identity}
          onChange={(identity) => update({ identity })}
          items={identities.map((identity) => ({
            value: identity,
            label: identityLabel[identity],
          }))}
        />
        <div className="field__foot">
          <span className="field__hint">{identityNotice[draft.identity]}</span>
        </div>
      </div>
      <div className="q-card__row">
        <TextField
          type="date"
          label="공개일"
          hint={
            scheduled ? '바꾸면 새 공개일에 공개됩니다.' : '오전 9시에 공개'
          }
          value={toDateInput(draft.opensAt)}
          onChange={(event) =>
            update({ opensAt: fromDateInput(event.target.value, 'open') })
          }
        />
        <TextField
          type="date"
          label="마감일"
          hint="그날 23:59까지 받습니다."
          min={toDateInput(draft.opensAt)}
          value={toDateInput(draft.closesAt)}
          onChange={(event) =>
            update({ closesAt: fromDateInput(event.target.value, 'close') })
          }
        />
      </div>
    </section>
  );
}

/** 학생에게 보이는 모습. 고른 답은 저장하지 않는다. */
function SurveyPreview({ draft }: { draft: SurveyDraft }) {
  const [answers, setAnswers] = useState<Answers>({});
  const questions = draft.questions.map((question) =>
    hasChoices(question)
      ? {
          ...question,
          options: [...new Set(question.options.filter((o) => o.trim()))],
        }
      : question,
  );

  return (
    <div className="survey-page survey-preview">
      <Notice tone="neutral">
        학생에게 보이는 모습입니다. 미리보기에서 고른 답은 저장되지 않습니다.
      </Notice>
      <div className="survey-intro">
        <h2 className="survey-preview__title">
          {draft.title || '제목 없는 설문'}
        </h2>
        {draft.intro && <p className="survey-preview__intro">{draft.intro}</p>}
        <Notice tone="info">{identityNotice[draft.identity]}</Notice>
      </div>
      <div className="survey-questions">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id]}
            onChange={(value) =>
              setAnswers((current) => ({ ...current, [question.id]: value }))
            }
          />
        ))}
      </div>
    </div>
  );
}

function PublishedView({ survey }: { survey: AdminSurvey }) {
  return (
    <div className="split-layout survey-edit">
      <div className="split-layout__main">
        <Notice tone="neutral">
          공개된 설문은 문항을 바꿀 수 없습니다. 바꿔야 하면 새 설문을
          만들어주세요.
        </Notice>
        {survey.intro && <p className="survey-edit__intro">{survey.intro}</p>}
        <ol className="q-list" aria-label="문항">
          {survey.questions.map((question, index) => (
            <li key={question.id} className="q-card">
              <div className="q-card__summary">
                <QuestionSummary question={question} index={index} />
              </div>
              <p className="q-card__detail">
                {hasChoices(question) && question.options.join(', ')}
                {question.type === 'scale' &&
                  `${question.steps}단계, ${question.minLabel} ~ ${question.maxLabel}`}
                {question.type === 'text' && `최대 ${question.maxLength}자`}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <aside className="split-layout__aside">
        <section className="panel" aria-labelledby="responses-title">
          <h2 className="panel__title" id="responses-title">
            응답 현황
          </h2>
          <div className="panel__body">
            <Meter
              label="응답 수"
              value={survey.responses}
              max={survey.target}
              text={`${survey.responses} / ${survey.target}명`}
            />
          </div>
          <dl className="info-list survey-edit__info">
            <dt>응답 대상</dt>
            <dd>{survey.audience}</dd>
            <dt>응답자 정보</dt>
            <dd>{identityLabel[survey.identity]}</dd>
            {survey.opensAt && (
              <>
                <dt>공개</dt>
                <dd>{formatDate(survey.opensAt)}</dd>
              </>
            )}
            {survey.closesAt && (
              <>
                <dt>마감</dt>
                <dd>{formatDate(survey.closesAt, true)}</dd>
              </>
            )}
          </dl>
        </section>
      </aside>
    </div>
  );
}

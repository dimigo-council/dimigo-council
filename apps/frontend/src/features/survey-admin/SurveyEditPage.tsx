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
import { Badge, Button, TextButton, Input } from '../../dimi-ui-kit/index.ts';
import {
  ChoiceGroup,
  ControlMark,
  Notice,
  Select,
  statusTone,
  Switch,
  Tabs,
  TextArea,
  TextField,
  ButtonLink,
  Breadcrumb,
  MetaRow,
  SplitMain,
  SplitAside,
  Panel,
  PanelTitle,
  PanelHeading,
  PanelAside,
  PanelBody,
  InfoList,
  FieldRoot,
  FieldLabel,
  FieldFoot,
  FieldHint,
  VisuallyHidden,
} from '../../components/ui/index.ts';
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
import { SurveyIntro, SurveyQuestions } from '../surveys/styles.ts';
import * as S from './styles.ts';

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
      <Breadcrumb aria-label="경로">
        <Link to="/work/surveys">설문</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{status}</span>
      </Breadcrumb>
      <PageHeader
        title={draft.title || '제목 없는 설문'}
        description={
          <MetaRow>
            <Badge theme={statusTone.survey[status]}>{status}</Badge>
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
          </MetaRow>
        }
        actions={
          readOnly ? (
            <>
              <ButtonLink to={`/surveys/${survey.id}`}>
                학생 화면 보기
              </ButtonLink>
              <ButtonLink
                theme="accent"
                variant="primary"
                to={`/work/surveys/${survey.id}/results`}
              >
                결과 보기
              </ButtonLink>
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
                  theme="accent"
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
          <S.SurveyEdit>
            <SplitMain
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
            </SplitMain>
            <SplitAside>
              <Panel aria-labelledby="checks-title">
                <PanelTitle as="div" $split>
                  <PanelHeading id="checks-title">공개 전 확인</PanelHeading>
                  <PanelAside>
                    {checks.filter((check) => check.done).length} /{' '}
                    {checks.length}
                  </PanelAside>
                </PanelTitle>
                <S.PublishChecks>
                  {checks.map((check) => (
                    <S.PublishCheck key={check.label} $done={check.done}>
                      <ControlMark type="checkfill" checked={check.done} />
                      {check.label}
                      <VisuallyHidden>
                        {check.done ? ', 완료' : ', 아직'}
                      </VisuallyHidden>
                    </S.PublishCheck>
                  ))}
                </S.PublishChecks>
                {!survey.reviewRequested && (
                  <S.PublishChecksAction>
                    <Button
                      fullWidth
                      disabled={busy}
                      onClick={() =>
                        void run(() => requestSurveyReview(survey.id))
                      }
                    >
                      {reviewerLabel(survey.department)}에게 검토 요청
                    </Button>
                  </S.PublishChecksAction>
                )}
              </Panel>
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
            </SplitAside>
          </S.SurveyEdit>
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
      <S.QList aria-label="문항">
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
      </S.QList>
      <S.QAdd
        type="button"
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
      </S.QAdd>
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
      <S.QCardNumber>Q{index + 1}</S.QCardNumber>
      <S.QCardTitle $empty={!question.title}>
        {question.title || '문항 제목을 적어주세요'}
      </S.QCardTitle>
      <S.QCardTags>
        <Badge>{questionTypeLabel[question.type]}</Badge>
        {question.required && <Badge theme="accent">필수</Badge>}
      </S.QCardTags>
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
    <S.QCard $open={open}>
      <S.QCardSummaryButton
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <QuestionSummary question={question} index={index} />
      </S.QCardSummaryButton>
      {open && (
        <S.QCardBody id={bodyId}>
          <TextField
            label="문항"
            maxLength={100}
            placeholder="무엇을 물어볼까요?"
            value={question.title}
            onChange={(event) =>
              onChange({ ...question, title: event.target.value })
            }
          />

          <FieldRoot>
            <FieldLabel as="span" id={typeLabelId}>
              유형
            </FieldLabel>
            <ChoiceGroup
              aria-labelledby={typeLabelId}
              value={question.type}
              onChange={(type) => onChange(changeType(question, type))}
              items={questionTypes.map((type) => ({
                value: type,
                label: questionTypeLabel[type],
              }))}
            />
          </FieldRoot>

          {hasChoices(question) && (
            <FieldRoot>
              <FieldLabel as="span" id={optionsLabelId}>
                선택지
              </FieldLabel>
              <S.QOptions aria-labelledby={optionsLabelId}>
                {question.options.map((option, i) => (
                  <S.QOption key={i}>
                    <ControlMark
                      type={question.type === 'single' ? 'radio' : 'checkfill'}
                      checked={false}
                    />
                    <Input
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
                    <S.PlainIconButton
                      type="button"
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
                    </S.PlainIconButton>
                  </S.QOption>
                ))}
              </S.QOptions>
              <div>
                <TextButton
                  size="small"
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
                </TextButton>
              </div>
              {question.type === 'multiple' && (
                <S.QCardRow>
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
                </S.QCardRow>
              )}
            </FieldRoot>
          )}

          {question.type === 'scale' && (
            <S.QCardRow>
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
            </S.QCardRow>
          )}

          {question.type === 'text' && (
            <S.QCardRow>
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
            </S.QCardRow>
          )}

          <S.QCardFoot>
            <Switch
              label="필수 응답"
              checked={question.required}
              onChange={(event) =>
                onChange({ ...question, required: event.target.checked })
              }
            />
            <TextButton size="small" onClick={onDuplicate}>
              복제
            </TextButton>
            <TextButton size="small" disabled={!onDelete} onClick={onDelete}>
              삭제
            </TextButton>
          </S.QCardFoot>
        </S.QCardBody>
      )}
    </S.QCard>
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
    <S.SurveySettings $padded>
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
      <FieldRoot>
        <FieldLabel as="span" id={identityLabelId}>
          응답자 정보
        </FieldLabel>
        <ChoiceGroup
          aria-labelledby={identityLabelId}
          value={draft.identity}
          onChange={(identity) => update({ identity })}
          items={identities.map((identity) => ({
            value: identity,
            label: identityLabel[identity],
          }))}
        />
        <FieldFoot>
          <FieldHint>{identityNotice[draft.identity]}</FieldHint>
        </FieldFoot>
      </FieldRoot>
      <S.QCardRow>
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
      </S.QCardRow>
    </S.SurveySettings>
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
    <S.SurveyPreview>
      <Notice tone="neutral">
        학생에게 보이는 모습입니다. 미리보기에서 고른 답은 저장되지 않습니다.
      </Notice>
      <SurveyIntro>
        <S.SurveyPreviewTitle>
          {draft.title || '제목 없는 설문'}
        </S.SurveyPreviewTitle>
        {draft.intro && (
          <S.SurveyPreviewIntro>{draft.intro}</S.SurveyPreviewIntro>
        )}
        <Notice tone="info">{identityNotice[draft.identity]}</Notice>
      </SurveyIntro>
      <SurveyQuestions as="div">
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
      </SurveyQuestions>
    </S.SurveyPreview>
  );
}

function PublishedView({ survey }: { survey: AdminSurvey }) {
  return (
    <S.SurveyEdit>
      <SplitMain>
        <Notice tone="neutral">
          공개된 설문은 문항을 바꿀 수 없습니다. 바꿔야 하면 새 설문을
          만들어주세요.
        </Notice>
        {survey.intro && <S.SurveyEditIntro>{survey.intro}</S.SurveyEditIntro>}
        <S.QList aria-label="문항">
          {survey.questions.map((question, index) => (
            <S.QCard key={question.id}>
              <S.QCardSummary>
                <QuestionSummary question={question} index={index} />
              </S.QCardSummary>
              <S.QCardDetail>
                {hasChoices(question) && question.options.join(', ')}
                {question.type === 'scale' &&
                  `${question.steps}단계, ${question.minLabel} ~ ${question.maxLabel}`}
                {question.type === 'text' && `최대 ${question.maxLength}자`}
              </S.QCardDetail>
            </S.QCard>
          ))}
        </S.QList>
      </SplitMain>
      <SplitAside>
        <Panel aria-labelledby="responses-title">
          <PanelTitle id="responses-title">응답 현황</PanelTitle>
          <PanelBody>
            <Meter
              label="응답 수"
              value={survey.responses}
              max={survey.target}
              text={`${survey.responses} / ${survey.target}명`}
            />
          </PanelBody>
          <InfoList>
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
          </InfoList>
        </Panel>
      </SplitAside>
    </S.SurveyEdit>
  );
}

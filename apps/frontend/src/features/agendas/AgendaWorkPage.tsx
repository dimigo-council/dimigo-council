import { useId, useState, type FormEvent } from 'react';
import {
  Link,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useSession } from '../../app/session.ts';
import { Steps } from '../../components/intranet/Steps.tsx';
import { Timeline } from '../../components/intranet/Timeline.tsx';
import { Badge, Button, TextButton } from '../../dimi-ui-kit/index.ts';
import {
  ChoiceGroup,
  ListGroup,
  ListRow,
  PersonAvatar,
  statusTone,
  Tabs,
  ButtonLink,
  Breadcrumb,
  MetaRow,
  Panel,
  PanelTitle,
  PanelAside,
  SplitMain,
  SplitAside,
  InfoList,
  Owner,
  TextLink,
  EmptyState,
  ListRowLink,
  ListGroupRoot,
  VisuallyHidden,
} from '../../components/ui/index.ts';
import {
  formatFullDate,
  formatRelative,
  formatShortDate,
} from '../../lib/date.ts';
import { withRo } from '../../lib/korean.ts';
import { listInbox } from '../inbox/api.ts';
import { listReports } from '../reports/api.ts';
import { listTasks } from '../tasks/api.ts';
import { TaskRow } from '../tasks/TaskListPage.tsx';
import { TaskBoard } from '../tasks/styles.ts';
import { addRecord, advanceStage, getAgenda } from './api.ts';
import { agendaSteps, originLabel } from './format.ts';
import {
  agendaStages,
  finishedStatuses,
  type Agenda,
  type AgendaRecord,
} from './types.ts';
import * as S from './styles.ts';

export async function agendaWorkLoader({ params }: LoaderFunctionArgs) {
  const id = params.agendaId ?? '';
  const [agenda, tasks, inbox, reports] = await Promise.all([
    getAgenda(id),
    listTasks(),
    listInbox(),
    listReports(),
  ]);
  return {
    agenda,
    tasks: tasks.filter((task) => task.agenda?.id === id),
    suggestions: inbox.filter((item) => item.agenda?.id === id),
    reports: reports.filter((report) => report.agenda?.id === id),
  };
}

type Linked = Omit<Awaited<ReturnType<typeof agendaWorkLoader>>, 'agenda'>;

type Tab = 'records' | 'tasks' | 'suggestions' | 'reports';
type RecordVisibility = AgendaRecord['visibility'];

export function AgendaWorkPage() {
  const { agenda, ...linked } = useLoaderData<typeof agendaWorkLoader>();
  return <AgendaWork key={agenda.id} agenda={agenda} linked={linked} />;
}

function AgendaWork({ agenda, linked }: { agenda: Agenda; linked: Linked }) {
  const [tab, setTab] = useState<Tab>('records');
  const isPublic = agenda.visibility === '전체 공개';

  return (
    <>
      <Breadcrumb aria-label="경로">
        <Link to="/work/agendas">안건</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{agenda.id}</span>
      </Breadcrumb>
      <PageHeader
        title={agenda.title}
        description={
          <MetaRow>
            <span>{agenda.department}</span>
            <span>담당 {agenda.owner}</span>
            <span>
              {agenda.suggestionCount > 0
                ? `건의 ${agenda.suggestionCount}건에서 시작`
                : originLabel(agenda)}
            </span>
            <Badge theme={statusTone.visibility[agenda.visibility]}>
              {agenda.visibility}
            </Badge>
          </MetaRow>
        }
        actions={
          <>
            {isPublic && (
              <ButtonLink to={`/activity/${agenda.id}`}>
                학생 화면에서 보기
              </ButtonLink>
            )}
            <AdvanceStage agenda={agenda} />
          </>
        }
      />

      <Panel $padded aria-label="진행 단계">
        <Steps
          aria-label="진행 단계"
          items={agendaSteps(agenda, {
            currentNote:
              agenda.tasks.total > 0
                ? `업무 ${agenda.tasks.done} / ${agenda.tasks.total}`
                : '진행 중',
            expectedSuffix: '목표',
          })}
        />
      </Panel>

      <S.AgendaTabs>
        <Tabs
          aria-label="안건 내용"
          idPrefix="agenda"
          value={tab}
          onChange={setTab}
          items={[
            {
              value: 'records',
              label: '진행 기록',
              count: agenda.records.length,
            },
            { value: 'tasks', label: '업무', count: agenda.tasks.total },
            {
              value: 'suggestions',
              label: '연결된 건의',
              count: agenda.suggestionCount,
            },
            { value: 'reports', label: '보고서', count: agenda.reportCount },
          ]}
        />
      </S.AgendaTabs>

      <S.AgendaSplit>
        <SplitMain
          role="tabpanel"
          id={`agenda-panel-${tab}`}
          aria-labelledby={`agenda-tab-${tab}`}
        >
          {tab === 'records' ? (
            <>
              {!finishedStatuses.includes(agenda.status) && (
                <RecordComposer agenda={agenda} />
              )}
              <Panel aria-label="진행 기록">
                <Timeline
                  headingLevel={2}
                  items={agenda.records.map((record) => ({
                    id: record.id,
                    at: record.at,
                    prefix: record.stage,
                    title: record.title,
                    body: record.body,
                    marker:
                      record.visibility === 'public' ? 'filled' : 'hollow',
                    badge: (
                      <Badge
                        theme={
                          record.visibility === 'public' ? 'solid' : 'grayscale'
                        }
                      >
                        {record.visibility === 'public' ? '공개' : '내부'}
                      </Badge>
                    ),
                    foot: (
                      <>
                        <span>{record.author}</span>
                        {record.link && (
                          <TextLink to={record.link.to}>
                            {record.link.label}
                          </TextLink>
                        )}
                      </>
                    ),
                  }))}
                />
              </Panel>
            </>
          ) : (
            <LinkedList tab={tab} agenda={agenda} linked={linked} />
          )}
        </SplitMain>

        <SplitAside>
          <Panel aria-labelledby="agenda-info-title">
            <PanelTitle id="agenda-info-title">안건 정보</PanelTitle>
            <InfoList>
              <dt>번호</dt>
              <dd>{agenda.id}</dd>
              <dt>담당</dt>
              <Owner as="dd">
                <PersonAvatar name={agenda.owner} aria-hidden="true" />
                {agenda.department}, {agenda.owner}
              </Owner>
              <dt>출처</dt>
              <dd>{originLabel(agenda)}</dd>
              {agenda.survey && (
                <>
                  <dt>관련 설문</dt>
                  <dd>
                    <TextLink to={agenda.survey.to}>
                      {agenda.survey.title}
                    </TextLink>
                  </dd>
                </>
              )}
              <dt>공개 범위</dt>
              <dd>
                <Badge theme={statusTone.visibility[agenda.visibility]}>
                  {agenda.visibility}
                </Badge>
              </dd>
              <dt>등록</dt>
              <dd>
                {formatFullDate(agenda.registeredAt)}, {agenda.registeredBy}
              </dd>
            </InfoList>
          </Panel>

          {agenda.decisions && agenda.decisions.length > 0 && (
            <Panel aria-labelledby="decisions-title">
              <PanelTitle $split id="decisions-title">
                결정 사항
                {agenda.stageDates.결정 && (
                  <PanelAside>
                    {formatShortDate(agenda.stageDates.결정)}
                  </PanelAside>
                )}
              </PanelTitle>
              <S.DecisionList>
                {agenda.decisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </S.DecisionList>
            </Panel>
          )}
        </SplitAside>
      </S.AgendaSplit>
    </>
  );
}

/** "다음 단계로": 한 번 더 확인받고 넘긴다. 넘긴 사실은 내부 기록으로 남는다. */
function AdvanceStage({ agenda }: { agenda: Agenda }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  if (finishedStatuses.includes(agenda.status)) return null;
  const next =
    agendaStages[agendaStages.findIndex((s) => s === agenda.status) + 1];

  const onAdvance = async () => {
    setStatus('saving');
    try {
      await advanceStage(agenda.id, session.name);
      setConfirming(false);
      setStatus('idle');
      await revalidator.revalidate();
    } catch {
      setStatus('error');
    }
  };

  if (!confirming) {
    return (
      <Button
        theme="accent"
        variant="primary"
        onClick={() => setConfirming(true)}
      >
        다음 단계로
      </Button>
    );
  }
  return (
    <S.AdvanceConfirm role="group" aria-label="단계 넘기기 확인">
      <p>
        <strong>{agenda.status}</strong>에서 <strong>{withRo(next)}</strong>{' '}
        넘깁니다.
        {status === 'error' && ' 넘기지 못했습니다. 다시 시도해주세요.'}
      </p>
      <TextButton size="small" onClick={() => setConfirming(false)}>
        취소
      </TextButton>
      <Button
        theme="accent"
        variant="primary"
        size="small"
        disabled={status === 'saving'}
        onClick={() => void onAdvance()}
      >
        넘기기
      </Button>
    </S.AdvanceConfirm>
  );
}

function RecordComposer({ agenda }: { agenda: Agenda }) {
  const session = useSession();
  const revalidator = useRevalidator();
  const inputId = useId();
  const hintId = useId();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<RecordVisibility>('internal');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const hiddenCount =
    agenda.records.filter((record) => record.visibility === 'internal').length +
    (visibility === 'internal' ? 1 : 0);
  const hint =
    visibility === 'internal'
      ? `학생회 구성원만 봅니다. 학생 화면에는 "내부 기록 ${hiddenCount}건"으로만 표시됩니다.`
      : agenda.visibility === '전체 공개'
        ? '학생 화면의 진행 기록에 바로 나갑니다. 이름과 개인 정보는 적지 마세요.'
        : '안건이 전체 공개가 되면 학생 화면에 함께 나갑니다.';

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const [title, ...rest] = text.trim().split('\n');
    if (!title || status === 'saving') return;
    setStatus('saving');
    try {
      await addRecord(agenda.id, {
        title: title.trim(),
        body: rest.join('\n').trim() || undefined,
        visibility,
        author: session.name,
      });
      setText('');
      setStatus('idle');
      await revalidator.revalidate();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Panel as="form" onSubmit={onSubmit}>
      <VisuallyHidden as="label" htmlFor={inputId}>
        진행 기록
      </VisuallyHidden>
      <S.RecordComposerInput
        id={inputId}
        placeholder="무엇이 진행됐는지 남겨주세요. 첫 줄이 제목이 됩니다. 회의, 면담, 결정 사항 등"
        aria-describedby={hintId}
        maxLength={1000}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <S.RecordComposerBar>
        <ChoiceGroup
          aria-label="기록 공개 범위"
          name="record-visibility"
          value={visibility}
          onChange={setVisibility}
          items={[
            { value: 'internal', label: '내부 기록' },
            { value: 'public', label: '공개 기록' },
          ]}
        />
        <S.RecordComposerHint id={hintId}>
          {status === 'error'
            ? '남기지 못했습니다. 잠시 후 다시 시도해주세요.'
            : hint}
        </S.RecordComposerHint>
        <Button
          type="submit"
          theme="accent"
          variant="primary"
          disabled={!text.trim() || status === 'saving'}
        >
          기록 남기기
        </Button>
      </S.RecordComposerBar>
    </Panel>
  );
}

/** 업무·연결된 건의·보고서 탭 */
function LinkedList({
  tab,
  agenda,
  linked,
}: {
  tab: Exclude<Tab, 'records'>;
  agenda: Agenda;
  linked: Linked;
}) {
  const open = !finishedStatuses.includes(agenda.status);

  let list;
  if (tab === 'tasks') {
    list = linked.tasks.length > 0 && (
      <TaskBoard>
        <ListGroupRoot aria-label="이 안건의 업무">
          {linked.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ListGroupRoot>
      </TaskBoard>
    );
  } else if (tab === 'suggestions') {
    list = linked.suggestions.length > 0 && (
      <ListGroup aria-label="연결된 건의">
        {linked.suggestions.map((item) => (
          <ListRow
            key={item.id}
            title={item.title}
            meta={[
              item.id,
              <Badge key="category">{item.category}</Badge>,
              item.author ?? '익명',
            ]}
            aside={
              <>
                <Badge theme={statusTone.suggestion[item.status]}>
                  {item.status}
                </Badge>
                <span>{formatRelative(item.receivedAt)} 접수</span>
              </>
            }
          />
        ))}
      </ListGroup>
    );
  } else {
    list = linked.reports.length > 0 && (
      <ListGroup aria-label="이 안건의 보고서">
        {linked.reports.map((report) => (
          <ListRow
            key={report.id}
            title={
              <ListRowLink as={Link} to={`/work/reports/${report.id}`}>
                {report.title}
              </ListRowLink>
            }
            meta={[
              report.id,
              <Badge key="kind">{report.kind}</Badge>,
              report.author,
            ]}
            aside={
              <>
                <Badge theme={statusTone.report[report.status]}>
                  {report.status}
                </Badge>
                <span>{formatRelative(report.updatedAt)}</span>
              </>
            }
          />
        ))}
      </ListGroup>
    );
  }

  const emptyText = {
    tasks: '이 안건에 묶인 업무가 없습니다.',
    suggestions: '이 안건에 묶인 건의가 없습니다.',
    reports: '이 안건의 보고서가 없습니다.',
  }[tab];
  const action =
    open &&
    {
      tasks: (
        <ButtonLink size="small" to={`/work/tasks?new&agenda=${agenda.id}`}>
          업무 만들기
        </ButtonLink>
      ),
      suggestions: (
        <ButtonLink size="small" to="/work/suggestions?tab=reviewing">
          건의 접수함에서 묶기
        </ButtonLink>
      ),
      reports: (
        <ButtonLink size="small" to="/work/reports/new">
          보고서 쓰기
        </ButtonLink>
      ),
    }[tab];

  return (
    <S.AgendaLinked>
      {list || <EmptyState>{emptyText}</EmptyState>}
      {action && <S.AgendaLinkedAction>{action}</S.AgendaLinkedAction>}
    </S.AgendaLinked>
  );
}

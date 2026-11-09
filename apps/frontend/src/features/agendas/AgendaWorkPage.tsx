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
import {
  Avatar,
  Badge,
  Button,
  Notice,
  SegmentedControl,
  statusTone,
  Tabs,
} from '../../components/kit/index.ts';
import { formatFullDate, formatShortDate } from '../../lib/date.ts';
import { withRo } from '../../lib/korean.ts';
import { addRecord, advanceStage, getAgenda } from './api.ts';
import { agendaSteps, originLabel } from './format.ts';
import {
  agendaStages,
  finishedStatuses,
  type Agenda,
  type AgendaRecord,
} from './types.ts';
import './agendas.css';

export async function agendaWorkLoader({ params }: LoaderFunctionArgs) {
  return getAgenda(params.agendaId ?? '');
}

type Tab = 'records' | 'tasks' | 'suggestions' | 'reports';
type RecordVisibility = AgendaRecord['visibility'];

export function AgendaWorkPage() {
  const agenda = useLoaderData<typeof agendaWorkLoader>();
  return <AgendaWork key={agenda.id} agenda={agenda} />;
}

function AgendaWork({ agenda }: { agenda: Agenda }) {
  const [tab, setTab] = useState<Tab>('records');
  const isPublic = agenda.visibility === '전체 공개';

  return (
    <>
      <nav className="breadcrumb" aria-label="경로">
        <Link to="/work/agendas">안건</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{agenda.id}</span>
      </nav>
      <PageHeader
        title={agenda.title}
        description={
          <span className="meta-row">
            <span>{agenda.department}</span>
            <span>담당 {agenda.owner}</span>
            <span>
              {agenda.suggestionCount > 0
                ? `건의 ${agenda.suggestionCount}건에서 시작`
                : originLabel(agenda)}
            </span>
            <Badge tone={statusTone.visibility[agenda.visibility]}>
              {agenda.visibility}
            </Badge>
          </span>
        }
        actions={
          <>
            {isPublic && (
              <Link
                className="btn btn--secondary"
                to={`/activity/${agenda.id}`}
              >
                학생 화면에서 보기
              </Link>
            )}
            <AdvanceStage agenda={agenda} />
          </>
        }
      />

      <section className="panel panel--padded" aria-label="진행 단계">
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
      </section>

      <div className="agenda-tabs">
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
      </div>

      <div className="split-layout">
        <div
          className="split-layout__main"
          role="tabpanel"
          id={`agenda-panel-${tab}`}
          aria-labelledby={`agenda-tab-${tab}`}
        >
          {tab === 'records' ? (
            <>
              {!finishedStatuses.includes(agenda.status) && (
                <RecordComposer agenda={agenda} />
              )}
              <section className="panel" aria-label="진행 기록">
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
                        tone={
                          record.visibility === 'public' ? 'info' : 'default'
                        }
                      >
                        {record.visibility === 'public' ? '공개' : '내부'}
                      </Badge>
                    ),
                    foot: (
                      <>
                        <span>{record.author}</span>
                        {record.link && (
                          <Link className="text-link" to={record.link.to}>
                            {record.link.label}
                          </Link>
                        )}
                      </>
                    ),
                  }))}
                />
              </section>
            </>
          ) : (
            <Notice tone="neutral">
              {
                {
                  tasks: `업무 화면을 만들면 이 안건의 업무 ${agenda.tasks.total}건이 여기에 나옵니다.`,
                  suggestions: `건의 접수함을 만들면 연결된 건의 ${agenda.suggestionCount}건이 여기에 나옵니다.`,
                  reports: `보고서 화면을 만들면 이 안건의 보고서 ${agenda.reportCount}건이 여기에 나옵니다.`,
                }[tab]
              }
            </Notice>
          )}
        </div>

        <aside className="split-layout__aside">
          <section className="panel" aria-labelledby="agenda-info-title">
            <h2 className="panel__title" id="agenda-info-title">
              안건 정보
            </h2>
            <dl className="info-list">
              <dt>번호</dt>
              <dd>{agenda.id}</dd>
              <dt>담당</dt>
              <dd className="owner">
                <Avatar name={agenda.owner} aria-hidden="true" />
                {agenda.department}, {agenda.owner}
              </dd>
              <dt>출처</dt>
              <dd>{originLabel(agenda)}</dd>
              {agenda.survey && (
                <>
                  <dt>관련 설문</dt>
                  <dd>
                    <Link className="text-link" to={agenda.survey.to}>
                      {agenda.survey.title}
                    </Link>
                  </dd>
                </>
              )}
              <dt>공개 범위</dt>
              <dd>
                <Badge tone={statusTone.visibility[agenda.visibility]}>
                  {agenda.visibility}
                </Badge>
              </dd>
              <dt>등록</dt>
              <dd>
                {formatFullDate(agenda.registeredAt)}, {agenda.registeredBy}
              </dd>
            </dl>
          </section>

          {agenda.decisions && agenda.decisions.length > 0 && (
            <section className="panel" aria-labelledby="decisions-title">
              <h2
                className="panel__title panel__title--split"
                id="decisions-title"
              >
                결정 사항
                {agenda.stageDates.결정 && (
                  <span className="panel__aside">
                    {formatShortDate(agenda.stageDates.결정)}
                  </span>
                )}
              </h2>
              <ul className="decision-list">
                {agenda.decisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
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
      <Button variant="primary" onClick={() => setConfirming(true)}>
        다음 단계로
      </Button>
    );
  }
  return (
    <div className="advance-confirm" role="group" aria-label="단계 넘기기 확인">
      <p>
        <strong>{agenda.status}</strong>에서 <strong>{withRo(next)}</strong>{' '}
        넘깁니다.
        {status === 'error' && ' 넘기지 못했습니다. 다시 시도해주세요.'}
      </p>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        취소
      </Button>
      <Button
        variant="primary"
        size="sm"
        disabled={status === 'saving'}
        onClick={() => void onAdvance()}
      >
        넘기기
      </Button>
    </div>
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
    <form className="panel record-composer" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor={inputId}>
        진행 기록
      </label>
      <textarea
        id={inputId}
        className="record-composer__input"
        placeholder="무엇이 진행됐는지 남겨주세요. 첫 줄이 제목이 됩니다. 회의, 면담, 결정 사항 등"
        aria-describedby={hintId}
        maxLength={1000}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="record-composer__bar">
        <SegmentedControl
          aria-label="기록 공개 범위"
          name="record-visibility"
          value={visibility}
          onChange={setVisibility}
          items={[
            { value: 'internal', label: '내부 기록' },
            { value: 'public', label: '공개 기록' },
          ]}
        />
        <p className="record-composer__hint" id={hintId}>
          {status === 'error'
            ? '남기지 못했습니다. 잠시 후 다시 시도해주세요.'
            : hint}
        </p>
        <Button
          type="submit"
          variant="primary"
          disabled={!text.trim() || status === 'saving'}
        >
          기록 남기기
        </Button>
      </div>
    </form>
  );
}

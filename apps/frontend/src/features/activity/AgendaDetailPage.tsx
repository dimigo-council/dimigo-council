import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { ChevronLeftIcon, LockIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Steps } from '../../components/intranet/Steps.tsx';
import { Timeline } from '../../components/intranet/Timeline.tsx';
import { Badge, statusTone, Tag } from '../../components/kit/index.ts';
import { formatFullDate, formatShortDate } from '../../lib/date.ts';
import { getPublicAgenda } from './api.ts';
import { agendaSteps, originLabel } from '../agendas/format.ts';
import './activity.css';

export async function agendaLoader({ params }: LoaderFunctionArgs) {
  return getPublicAgenda(params.agendaId ?? '');
}

export function AgendaDetailPage() {
  const agenda = useLoaderData<typeof agendaLoader>();
  const { problem, decision, now } = agenda.summary;

  return (
    <>
      <Link className="back-link" to="/activity">
        <ChevronLeftIcon />
        학생회 활동
      </Link>
      <PageHeader
        title={agenda.title}
        description={
          <span className="meta-row">
            <span>{agenda.id}</span>
            <span>{agenda.department}</span>
            <span>
              {agenda.suggestionCount > 0
                ? `건의 ${agenda.suggestionCount}건에서 시작`
                : originLabel(agenda)}
            </span>
            <span>{formatShortDate(agenda.updatedAt)} 업데이트</span>
          </span>
        }
        actions={
          <Badge tone={statusTone.agenda[agenda.status]}>{agenda.status}</Badge>
        }
      />

      <section className="panel panel--padded" aria-label="진행 단계">
        <Steps
          aria-label="진행 단계"
          items={agendaSteps(agenda, {
            currentNote: '진행 중',
            expectedSuffix: '예정',
          })}
        />
      </section>

      <div className="split-layout">
        <div className="split-layout__main">
          <section className="panel" aria-labelledby="summary-title">
            <h2 className="panel__title" id="summary-title">
              한눈에 보기
            </h2>
            <dl className="agenda-summary">
              <dt>문제</dt>
              <dd>{problem}</dd>
              {decision && (
                <>
                  <dt>결정</dt>
                  <dd>{decision}</dd>
                </>
              )}
              {now && (
                <>
                  <dt>{agenda.status === '완료' ? '결과' : '지금 하는 일'}</dt>
                  <dd>{now}</dd>
                </>
              )}
            </dl>
          </section>

          <section className="panel" aria-labelledby="records-title">
            <h2 className="panel__title panel__title--split" id="records-title">
              진행 기록
              <span className="panel__aside">
                공개 기록 {agenda.records.length}건
              </span>
            </h2>
            <Timeline
              items={agenda.records.map((record) => ({
                id: record.id,
                at: record.at,
                prefix: record.stage,
                title: record.title,
                body: record.body,
                foot: record.link && (
                  <Link className="text-link" to={record.link.to}>
                    {record.link.label}
                  </Link>
                ),
              }))}
            />
            {agenda.hiddenRecordCount > 0 && (
              <p className="hidden-records">
                <LockIcon />
                학생회 내부 기록 {agenda.hiddenRecordCount}건은 공개 범위에 따라
                표시되지 않습니다.
              </p>
            )}
          </section>
        </div>

        <aside className="split-layout__aside">
          <section className="panel" aria-labelledby="agenda-info-title">
            <h2 className="panel__title" id="agenda-info-title">
              안건 정보
            </h2>
            <dl className="info-list">
              <dt>담당</dt>
              <dd>{agenda.department}</dd>
              <dt>시작</dt>
              <dd className="info-list__inline">
                {originLabel(agenda)}
                {agenda.includesMine && (
                  <Tag className="tag--mine">내 건의 포함</Tag>
                )}
              </dd>
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
              <dt>등록일</dt>
              <dd>{formatFullDate(agenda.registeredAt)}</dd>
            </dl>
          </section>

          {agenda.related.length > 0 && (
            <section className="panel" aria-labelledby="related-title">
              <h2 className="panel__title" id="related-title">
                관련 기록
              </h2>
              <ul className="related-list">
                {agenda.related.map((item) => (
                  <li key={item.title}>
                    {item.to ? (
                      <Link className="related-list__title" to={item.to}>
                        {item.title}
                      </Link>
                    ) : (
                      <span className="related-list__title">{item.title}</span>
                    )}
                    <span className="meta-row">
                      <span>{item.kind}</span>
                      <span>{formatShortDate(item.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {agenda.status !== '완료' && agenda.status !== '부결' && (
            <Link
              className="btn btn--secondary btn--block"
              to={`/suggestions/new?agenda=${agenda.id}`}
            >
              이 안건에 의견 보태기
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}

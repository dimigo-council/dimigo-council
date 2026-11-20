import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { ChevronLeftIcon, LockIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { Steps } from '../../components/intranet/Steps.tsx';
import { Timeline } from '../../components/intranet/Timeline.tsx';
import { Badge } from '../../dimi-ui-kit/index.ts';
import {
  statusTone,
  BackLink,
  ButtonLink,
  MetaRow,
  Panel,
  PanelTitle,
  PanelAside,
  SplitLayout,
  SplitMain,
  SplitAside,
  InfoList,
  InfoListInline,
  TextLink,
} from '../../components/ui/index.ts';
import { formatFullDate, formatShortDate } from '../../lib/date.ts';
import { getPublicAgenda } from './api.ts';
import { agendaSteps, originLabel } from '../agendas/format.ts';
import * as S from './styles.ts';

export async function agendaLoader({ params }: LoaderFunctionArgs) {
  return getPublicAgenda(params.agendaId ?? '');
}

export function AgendaDetailPage() {
  const agenda = useLoaderData<typeof agendaLoader>();
  const { problem, decision, now } = agenda.summary;

  return (
    <>
      <BackLink to="/activity">
        <ChevronLeftIcon />
        학생회 활동
      </BackLink>
      <PageHeader
        title={agenda.title}
        description={
          <MetaRow>
            <span>{agenda.id}</span>
            <span>{agenda.department}</span>
            <span>
              {agenda.suggestionCount > 0
                ? `건의 ${agenda.suggestionCount}건에서 시작`
                : originLabel(agenda)}
            </span>
            <span>{formatShortDate(agenda.updatedAt)} 업데이트</span>
          </MetaRow>
        }
        actions={
          <Badge theme={statusTone.agenda[agenda.status]}>
            {agenda.status}
          </Badge>
        }
      />

      <Panel $padded aria-label="진행 단계">
        <Steps
          aria-label="진행 단계"
          items={agendaSteps(agenda, {
            currentNote: '진행 중',
            expectedSuffix: '예정',
          })}
        />
      </Panel>

      <SplitLayout>
        <SplitMain>
          <Panel aria-labelledby="summary-title">
            <PanelTitle id="summary-title">한눈에 보기</PanelTitle>
            <S.AgendaSummary>
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
            </S.AgendaSummary>
          </Panel>

          <Panel aria-labelledby="records-title">
            <PanelTitle $split id="records-title">
              진행 기록
              <PanelAside>공개 기록 {agenda.records.length}건</PanelAside>
            </PanelTitle>
            <Timeline
              items={agenda.records.map((record) => ({
                id: record.id,
                at: record.at,
                prefix: record.stage,
                title: record.title,
                body: record.body,
                foot: record.link && (
                  <TextLink to={record.link.to}>{record.link.label}</TextLink>
                ),
              }))}
            />
            {agenda.hiddenRecordCount > 0 && (
              <S.HiddenRecords>
                <LockIcon />
                학생회 내부 기록 {agenda.hiddenRecordCount}건은 공개 범위에 따라
                표시되지 않습니다.
              </S.HiddenRecords>
            )}
          </Panel>
        </SplitMain>

        <SplitAside>
          <Panel aria-labelledby="agenda-info-title">
            <PanelTitle id="agenda-info-title">안건 정보</PanelTitle>
            <InfoList>
              <dt>담당</dt>
              <dd>{agenda.department}</dd>
              <dt>시작</dt>
              <InfoListInline>
                {originLabel(agenda)}
                {agenda.includesMine && (
                  <Badge theme="accent">내 건의 포함</Badge>
                )}
              </InfoListInline>
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
              <dt>등록일</dt>
              <dd>{formatFullDate(agenda.registeredAt)}</dd>
            </InfoList>
          </Panel>

          {agenda.related.length > 0 && (
            <Panel aria-labelledby="related-title">
              <PanelTitle id="related-title">관련 기록</PanelTitle>
              <S.RelatedList>
                {agenda.related.map((item) => (
                  <li key={item.title}>
                    {item.to ? (
                      <S.RelatedTitleLink to={item.to}>
                        {item.title}
                      </S.RelatedTitleLink>
                    ) : (
                      <S.RelatedTitle>{item.title}</S.RelatedTitle>
                    )}
                    <MetaRow>
                      <span>{item.kind}</span>
                      <span>{formatShortDate(item.at)}</span>
                    </MetaRow>
                  </li>
                ))}
              </S.RelatedList>
            </Panel>
          )}

          {agenda.status !== '완료' && agenda.status !== '부결' && (
            <ButtonLink fullWidth to={`/suggestions/new?agenda=${agenda.id}`}>
              이 안건에 의견 보태기
            </ButtonLink>
          )}
        </SplitAside>
      </SplitLayout>
    </>
  );
}

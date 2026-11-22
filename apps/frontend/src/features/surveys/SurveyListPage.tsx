import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { PlusIcon } from '../../app/icons.tsx';
import { PageHeader } from '../../app/PageHeader.tsx';
import { useBasePath, useIsCouncil } from '../../app/mode.ts';
import { Button } from '../../dimi-ui-kit/index.ts';
import {
  ButtonLink,
  ChipSelect,
  EmptyState,
  Notice,
} from '../../components/ui/index.ts';
import { errorMessage } from '../../lib/api.ts';
import { createSurveyDraft } from '../survey-admin/api.ts';
import { listSurveys } from './api.ts';
import { participation } from './format.ts';
import { SurveyCard } from './SurveyCard.tsx';
import type { SurveySummary } from './types.ts';
import * as S from './styles.ts';

export async function surveyListLoader() {
  return { surveys: await listSurveys(), draftId: null as string | null };
}

/**
 * 학생회 설문 목록: "설문 만들기"가 붙는다.
 * "불러오기"(최근 임시 저장 설문, GET /surveys/drafts/latest)는 아직 연결하지 않아 보이지 않는다.
 */
export async function councilSurveyListLoader() {
  return { surveys: await listSurveys(), draftId: null as string | null };
}

type Sort = 'deadline' | 'rate';

/** 진행 중인 설문을 마감 임박순으로 먼저, 마감된 설문은 최근 마감순으로 뒤에 둔다. */
function sortSurveys(surveys: SurveySummary[], sort: Sort) {
  const open = surveys.filter((survey) => !survey.isClosed);
  const closed = surveys.filter((survey) => survey.isClosed);
  const compare =
    sort === 'rate'
      ? (a: SurveySummary, b: SurveySummary) =>
          participation(b) - participation(a)
      : (a: SurveySummary, b: SurveySummary) =>
          a.closesAt.localeCompare(b.closesAt);
  return [
    ...open.sort(compare),
    ...closed.sort((a, b) =>
      sort === 'rate' ? compare(a, b) : b.closesAt.localeCompare(a.closesAt),
    ),
  ];
}

export function SurveyListPage() {
  const { surveys, draftId } = useLoaderData<typeof surveyListLoader>();
  const council = useIsCouncil();
  const base = useBasePath();
  const navigate = useNavigate();
  const [sort, setSort] = useState<Sort>('deadline');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const onCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const id = await createSurveyDraft();
      await navigate(`/work/surveys/${id}/edit`);
    } catch (caught) {
      setError(errorMessage(caught, '설문을 만들지 못했어요.'));
    } finally {
      setCreating(false);
    }
  };

  const sorted = sortSurveys(surveys, sort);

  return (
    <>
      <PageHeader
        title="설문"
        actions={
          <S.SurveyToolbar>
            <ChipSelect
              aria-label="정렬"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value === 'rate' ? 'rate' : 'deadline')
              }
            >
              <option value="deadline">마감 임박순</option>
              <option value="rate">참여율 높은순</option>
            </ChipSelect>
            {council && (
              <S.SurveyToolbarButtons>
                {draftId && (
                  <ButtonLink to={`/work/surveys/${draftId}/edit`}>
                    불러오기
                  </ButtonLink>
                )}
                <Button
                  theme="accent"
                  variant="primary"
                  disabled={creating}
                  onClick={() => void onCreate()}
                >
                  <PlusIcon />
                  설문 만들기
                </Button>
              </S.SurveyToolbarButtons>
            )}
          </S.SurveyToolbar>
        }
      />

      {error && (
        <Notice tone="warn" role="alert">
          {error}
        </Notice>
      )}

      {sorted.length > 0 ? (
        <S.SurveyGrid aria-label="설문 목록">
          {sorted.map((survey) => (
            <li key={survey.id}>
              <SurveyCard
                survey={survey}
                respondTo={base(`/surveys/${survey.id}`)}
                resultsTo={
                  council ? `/work/surveys/${survey.id}/results` : undefined
                }
              />
            </li>
          ))}
        </S.SurveyGrid>
      ) : (
        <EmptyState>아직 게시된 설문이 없습니다.</EmptyState>
      )}

      <S.SurveyInquiryCta aria-labelledby="survey-inquiry-cta">
        <div>
          <h2 id="survey-inquiry-cta">설문 기간이 아니어도 괜찮아요</h2>
          <p>
            질문과 건의에 의견을 남기시면 학생회가 검토하고 처리 결과를
            알려드려요.
          </p>
        </div>
        <ButtonLink to={base('/inquiries')}>질의하러 가기</ButtonLink>
      </S.SurveyInquiryCta>
    </>
  );
}

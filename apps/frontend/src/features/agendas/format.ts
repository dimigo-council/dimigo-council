import type { StepItem } from '../../components/intranet/Steps.tsx';
import { formatShortDate } from '../../lib/date.ts';
import {
  agendaStages,
  stoppedStatuses,
  type Agenda,
  type AgendaStage,
} from './types.ts';

/** 출처 표시: "건의 15건", "학생회 자체, 설문" */
export function originLabel(
  agenda: Pick<Agenda, 'origins' | 'suggestionCount'>,
) {
  return agenda.origins
    .map((origin) =>
      origin === '건의' ? `건의 ${agenda.suggestionCount}건` : origin,
    )
    .join(', ');
}

/** 마지막으로 들어선 단계. 보류·부결이면 멈춘 단계다. */
export function reachedStage(agenda: Pick<Agenda, 'stageDates'>) {
  return agendaStages.filter((stage) => agenda.stageDates[stage]).at(-1);
}

/**
 * 등록 → 검토 → 결정 → 추진 → 완료.
 * 보류·부결이면 마지막으로 들어선 단계에서 멈춘 것으로 보여준다.
 * currentNote는 진행 중인 단계 아래 말 (학생 화면: 진행 중, 업무공간: 업무 2 / 5).
 */
export function agendaSteps(
  agenda: Pick<
    Agenda,
    'status' | 'stageDates' | 'stageNotes' | 'expectedDoneAt'
  >,
  {
    currentNote,
    expectedSuffix,
  }: { currentNote: string; expectedSuffix: string },
): StepItem[] {
  const current = reachedStage(agenda);
  const stopped = stoppedStatuses.includes(agenda.status);
  const dated = (stage: AgendaStage, at: string) =>
    [formatShortDate(at), agenda.stageNotes?.[stage]].filter(Boolean).join(' ');

  return agendaStages.map((stage) => {
    const at = agenda.stageDates[stage];
    if (at && (agenda.status === '완료' || stage !== current)) {
      return { label: stage, state: 'done', note: dated(stage, at) };
    }
    if (stage === current) {
      return {
        label: stage,
        state: 'current',
        note: stopped ? agenda.status : currentNote,
      };
    }
    return {
      label: stage,
      state: 'todo',
      note:
        stage === '완료' && agenda.expectedDoneAt && !stopped
          ? `${formatShortDate(agenda.expectedDoneAt)} ${expectedSuffix}`
          : undefined,
    };
  });
}

import type { StepItem } from '../../components/intranet/Steps.tsx';
import { formatShortDate } from '../../lib/date.ts';
import type { InquiryView } from './types.ts';

/** 질의 번호 표시: 128 → #128 */
export function inquiryNo(id: string) {
  return `#${id}`;
}

/** 접수 → 답변 완료 → 처리 완료. 반려되면 마지막 단계가 반려가 된다. */
export function inquirySteps(inquiry: InquiryView): StepItem[] {
  const dates = inquiry.statusDates;
  const date = (at?: string) => (at ? formatShortDate(at) : '예정');
  const last = inquiry.status === '반려' ? '반려' : '처리 완료';
  return [
    { label: '접수', state: 'done', note: date(dates.접수) },
    {
      label: '답변 완료',
      state: dates['답변 완료'] ? 'done' : 'todo',
      note: date(dates['답변 완료']),
    },
    {
      label: last,
      state: dates[last] ? 'done' : 'todo',
      note: date(dates[last]),
    },
  ];
}

/** 목록 메타: #128 · 김호태 질의 · 생활스포츠부 답변 */
export function inquiryMeta(inquiry: InquiryView) {
  return [
    `#${inquiry.id}`,
    inquiry.author ? `${inquiry.author} 질의` : '익명',
    inquiry.answer || inquiry.status !== '접수'
      ? inquiry.department && `${inquiry.department} 답변`
      : '담당자 배정 대기',
  ].filter(Boolean) as string[];
}

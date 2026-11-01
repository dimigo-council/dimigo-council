import type { ReactNode } from 'react';
import './intranet.css';

export type StepState = 'done' | 'current' | 'todo';

export interface StepItem {
  label: string;
  state: StepState;
  /** 단계 아래 작은 글씨 (날짜, 담당 등) */
  note?: ReactNode;
}

const stateText: Record<StepState, string> = {
  done: '완료',
  current: '현재 단계',
  todo: '예정',
};

/** I-steps: 안건·건의의 단계. 지난 단계는 채운 사각형, 현재는 빈 사각형, 남은 단계는 흐리게. */
export function Steps({
  items,
  'aria-label': ariaLabel,
}: {
  items: StepItem[];
  'aria-label': string;
}) {
  return (
    <ol className="steps" aria-label={ariaLabel}>
      {items.map((item) => (
        <li
          key={item.label}
          className="steps__item"
          data-state={item.state}
          aria-current={item.state === 'current' ? 'step' : undefined}
        >
          <span className="steps__marker" aria-hidden="true" />
          <span className="steps__label">
            {item.label}
            <span className="visually-hidden">, {stateText[item.state]}</span>
          </span>
          {item.note && <span className="steps__note">{item.note}</span>}
        </li>
      ))}
    </ol>
  );
}

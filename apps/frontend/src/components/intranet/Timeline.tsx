import type { ReactNode } from 'react';
import { formatShortDate } from '../../lib/date.ts';
import './intranet.css';

export interface TimelineItem {
  id: string;
  at: string;
  /** 제목 앞에 흐리게 붙는 말 (안건 단계 등) */
  prefix?: string;
  title: string;
  /** 제목 옆 배지 (공개, 내부 등) */
  badge?: ReactNode;
  body?: ReactNode;
  /** 맨 아래 줄 (작성자, 링크 등) */
  foot?: ReactNode;
  /** hollow: 빈 사각형. 업무공간에서 내부 기록을 공개 기록과 구분할 때 쓴다. */
  marker?: 'filled' | 'hollow';
}

/** I-timeline: 날짜, 사각형 표시, 내용이 세로로 이어지는 기록 목록. 최신 기록이 위에 온다. */
export function Timeline({
  items,
  headingLevel = 3,
}: {
  items: TimelineItem[];
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li
          key={item.id}
          className="timeline__item"
          data-marker={item.marker ?? 'filled'}
        >
          <time className="timeline__date" dateTime={item.at}>
            {formatShortDate(item.at)}
          </time>
          <div className="timeline__body">
            <div className="timeline__head">
              <Heading className="timeline__title">
                {item.prefix && (
                  <span className="timeline__prefix">{item.prefix}</span>
                )}
                {item.title}
              </Heading>
              {item.badge}
            </div>
            {item.body && <p className="timeline__text">{item.body}</p>}
            {item.foot && <div className="timeline__foot">{item.foot}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

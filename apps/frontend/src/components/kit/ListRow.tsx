import type { ReactNode } from 'react';

export function ListGroup({
  children,
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <ul className="list-group" aria-label={ariaLabel}>
      {children}
    </ul>
  );
}

export interface ListRowProps {
  title: ReactNode;
  /**
   * 지정하면 제목이 링크가 되고 행 전체를 눌러도 이동한다.
   * 라우터 Link를 쓰려면 href 대신 title에 className="list-row__link"인 Link를 넣는다.
   */
  href?: string;
  /** 메타 정보. 가운뎃점 없이 간격으로 나뉜다. */
  meta?: ReactNode[];
  /** 오른쪽 정보 (D-4, 마감일, 상태 배지 등) */
  aside?: ReactNode;
  /** 오른쪽 끝 버튼. 행 링크보다 위에 놓여 따로 눌린다. */
  actions?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

export function ListRow({
  title,
  href,
  meta,
  aside,
  actions,
  headingLevel = 3,
}: ListRowProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <li className="list-row">
      <div className="list-row__main">
        <Heading className="list-row__title">
          {href ? (
            <a className="list-row__link" href={href}>
              {title}
            </a>
          ) : (
            title
          )}
        </Heading>
        {meta && meta.length > 0 && (
          <div className="list-row__meta">
            {meta.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        )}
      </div>
      {aside && <div className="list-row__aside">{aside}</div>}
      {actions && <div className="list-row__actions">{actions}</div>}
    </li>
  );
}

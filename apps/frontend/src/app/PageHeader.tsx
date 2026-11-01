import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** 오른쪽 위 주요 동작 (새 건의, 안건 등록 등) */
  actions?: ReactNode;
}

/** 화면 제목. React 19가 <title>을 문서 head로 올려 탭 제목도 함께 바뀐다. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <title>{`${title} | 디미고 학생회`}</title>
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {description && (
          <p className="page-header__description">{description}</p>
        )}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

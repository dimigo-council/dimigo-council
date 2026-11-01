import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** 오른쪽 위 주요 동작 (새 건의, 안건 등록 등) */
  actions?: ReactNode;
  /** 화면에는 보이지 않고 탭 제목과 스크린 리더용 제목만 남긴다. 이때 description과 actions는 쓰지 않는다. */
  visuallyHidden?: boolean;
}

/** 화면 제목. React 19가 <title>을 문서 head로 올려 탭 제목도 함께 바뀐다. */
export function PageHeader({
  title,
  description,
  actions,
  visuallyHidden = false,
}: PageHeaderProps) {
  const documentTitle = <title>{`${title} | 디미고 학생회`}</title>;
  if (visuallyHidden) {
    return (
      <>
        {documentTitle}
        <h1 className="visually-hidden">{title}</h1>
      </>
    );
  }
  return (
    <header className="page-header">
      {documentTitle}
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

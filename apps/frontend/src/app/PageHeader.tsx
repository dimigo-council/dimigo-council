import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { VisuallyHidden } from '../components/ui/VisuallyHidden.ts';

/* 화면 제목 */
const Root = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Text = styled.div`
  min-width: 0;
`;

const Title = styled.h1`
  ${({ theme: t }) => css`
    margin: 0;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.title};
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    overflow-wrap: break-word;
    text-wrap: balance;
  `}
`;

const Description = styled.p`
  ${({ theme: t }) => css`
    margin: 6px 0 0;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
    text-wrap: pretty;
  `}
`;

/** 오른쪽 위 동작 줄. 선택자로 쓴다 (`${PageHeaderActions}`). */
export const PageHeaderActions = styled.div`
  display: flex;
  flex: none;
  gap: 8px;

  /* 인쇄: 설문 결과처럼 본문만 남긴다 */
  @media print {
    display: none;
  }
`;

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
        <VisuallyHidden as="h1">{title}</VisuallyHidden>
      </>
    );
  }
  return (
    <Root>
      {documentTitle}
      <Text>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </Text>
      {actions && <PageHeaderActions>{actions}</PageHeaderActions>}
    </Root>
  );
}

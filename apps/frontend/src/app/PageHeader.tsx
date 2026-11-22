import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { VisuallyHidden } from '../components/ui/VisuallyHidden.ts';

/* 화면 제목 */
const Root = styled.header<{ $tall?: boolean }>`
  display: flex;
  align-items: ${({ $tall }) => ($tall ? 'flex-start' : 'center')};
  min-height: ${({ $tall, theme }) => ($tall ? theme.height[400] : 'auto')};
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[400]};

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Text = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[150]};
  min-width: 0;
`;

const Title = styled.h1`
  ${({ theme: t }) => css`
    ${t.text.titleStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
    overflow-wrap: break-word;
    text-wrap: balance;
  `}
`;

const Description = styled.p`
  ${({ theme: t }) => css`
    ${t.text.bodyWeak}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
    text-wrap: pretty;
  `}
`;

/** 오른쪽 위 동작 줄. 선택자로 쓴다 (`${PageHeaderActions}`). */
export const PageHeaderActions = styled.div`
  display: flex;
  flex: none;
  gap: ${({ theme }) => theme.spacing[300]};

  /* 인쇄: 설문 결과처럼 본문만 남긴다 */
  @media print {
    display: none;
  }
`;

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** 오른쪽 위 주요 동작 (질의 작성하기, 활동 등록 등) */
  actions?: ReactNode;
  /** Figma "Page heading"(높이 56)을 쓰는 상세·작성 화면 */
  tall?: boolean;
  /** 화면에는 보이지 않고 탭 제목과 스크린 리더용 제목만 남긴다. 이때 description과 actions는 쓰지 않는다. */
  visuallyHidden?: boolean;
}

/** 화면 제목. React 19가 <title>을 문서 head로 올려 탭 제목도 함께 바뀐다. */
export function PageHeader({
  title,
  description,
  actions,
  visuallyHidden = false,
  tall = false,
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
    <Root $tall={tall}>
      {documentTitle}
      <Text>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </Text>
      {actions && <PageHeaderActions>{actions}</PageHeaderActions>}
    </Root>
  );
}

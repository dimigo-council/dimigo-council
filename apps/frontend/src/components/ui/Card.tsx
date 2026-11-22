/* Figma 화면의 흰 카드, 카드 제목 줄, "더보기" 링크, 공개 범위 배지, 2단 배치. */
import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styled, { css } from 'styled-components';
import { Badge, Icon, textButtonStyles } from '../../dimi-ui-kit/index.ts';
import {
  iconArrowForwardIos,
  iconGlobe,
  iconLock,
} from '../../dimi-ui-kit/icons';

export const Card = styled.section<{ $flush?: boolean }>`
  ${({ theme: t, $flush }) => css`
    min-width: 0;
    padding: ${$flush ? 0 : t.spacing[550]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
  `}
`;

export const CardHead = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${t.spacing[300]};
    margin-bottom: ${t.spacing[300]};
  `}
`;

export const CardTitle = styled.h2`
  ${({ theme: t }) => css`
    ${t.text.headlineStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

/** 카드 제목 줄 오른쪽 작은 글씨 (3개 진행 중, 2 / 3 완료 등) */
export const CardAside = styled.span`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

const MoreLinkRoot = styled(Link)<{ $size: 'medium' | 'small' }>`
  ${({ theme: t, $size }) => textButtonStyles(t, { size: $size })}
`;

/**
 * 카드 오른쪽 위 링크. 기본은 "더보기 >" (kit TextButton Medium + 화살표),
 * `size="small"`이면 화살표 없는 작은 TextButton ("질문과 건의").
 */
export function MoreLink({
  children = '더보기',
  size = 'medium',
  ...rest
}: Omit<LinkProps, 'children'> & {
  children?: ReactNode;
  size?: 'medium' | 'small';
}) {
  return (
    <MoreLinkRoot $size={size} {...rest}>
      {children}
      {size === 'medium' && <Icon icon={iconArrowForwardIos} size={20} />}
    </MoreLinkRoot>
  );
}

/** 공개 범위 배지: 전체 공개는 지구, 학생회·학생회만은 자물쇠 */
export function ScopeBadge({ scope }: { scope: string }) {
  return (
    <Badge leadingIcon={scope === '전체 공개' ? iconGlobe : iconLock}>
      {scope}
    </Badge>
  );
}

/** 본문 + 오른쪽 카드 열. 좁은 화면에서는 한 줄로 쌓인다. */
export const TwoColumn = styled.div<{ $aside?: string }>`
  ${({ theme: t, $aside = '400px' }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) ${$aside};
    align-items: start;
    gap: ${t.spacing[550]};

    @media (max-width: 960px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `}
`;

export const Stack = styled.div<{ $gap?: number }>`
  display: grid;
  gap: ${({ $gap = 24 }) => `${$gap}px`};
  min-width: 0;
`;

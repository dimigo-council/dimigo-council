import type { HTMLAttributes, LabelHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import styled, { css } from 'styled-components';
import {
  Avatar,
  AvatarRoot,
  ButtonRoot,
  type AvatarProps,
  type BadgeProps,
  textButtonStyles,
  type ButtonLook,
  type TextButtonLook,
} from '../../dimi-ui-kit/index.ts';

/** 상태 배지의 kit Badge 테마. */
export type StatusTone = NonNullable<BadgeProps['theme']>;

/**
 * 도메인 상태 → kit Badge 테마 (Figma 기준).
 * grayscale: 기다리는 상태, accent(분홍): 진행·답변, solid(파랑): 끝난 상태, negative: 보류·반려.
 */
export const statusTone = {
  activity: {
    '검토 중': 'grayscale',
    '추진 중': 'accent',
    완료: 'solid',
    보류: 'negative',
  },
  inquiry: {
    접수: 'grayscale',
    '답변 완료': 'accent',
    '처리 완료': 'solid',
    반려: 'negative',
  },
  task: {
    예정됨: 'grayscale',
    '진행 중': 'accent',
    '검토 요청': 'solid',
    완료: 'solid',
  },
  survey: {
    '작성 중': 'grayscale',
    '진행 중': 'solid',
    예약: 'accent',
    마감: 'grayscale',
  },
} as const satisfies Record<string, Record<string, StatusTone>>;

export interface CountProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** 처리할 일이 쌓였음을 알리는 채워진 숫자 (kit IconButton BadgedText의 숫자 방울) */
  alert?: boolean;
}

/** 숫자 글자 (Count의 모양). 선택자로도 쓴다 (`${CountText}`). */
export const CountText = styled.span<{ $alert?: boolean }>`
  ${({ theme: t, $alert }) => css`
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    font-weight: ${t.font.weight.weak};
    font-variant-numeric: tabular-nums;
    ${
      $alert &&
      css`
        display: inline-grid;
        place-items: center;
        min-width: 18px;
        height: 18px;
        padding: 0 ${t.spacing[100]};
        border-radius: ${t.radius.circle};
        background: ${t.colors.core.status.accent};
        color: ${t.colors.core.onColor.primary};
        font-size: ${t.font.size.caption};
        line-height: ${t.font.lineHeight.caption};
        font-weight: ${t.font.weight.strong};
      `
    }
  `}
`;

export function Count({ value, alert = false, ...rest }: CountProps) {
  return (
    <CountText $alert={alert} {...rest}>
      {value}
    </CountText>
  );
}

/** 이름이 붙은 kit Avatar. 이름은 스크린 리더와 툴팁에 쓴다. */
export function PersonAvatar({
  name,
  size = 'small',
  ...rest
}: Omit<AvatarProps, 'type' | 'src' | 'alt'> & { name: string }) {
  const hidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true';
  return (
    <Avatar
      size={size}
      role={hidden ? undefined : 'img'}
      aria-label={hidden ? undefined : name}
      title={name}
      {...rest}
    />
  );
}

/** 겹쳐 놓은 아바타 묶음. 선택자로 쓴다 (`${AvatarGroupRoot}`). */
export const AvatarGroupRoot = styled.span`
  display: inline-flex;

  > ${AvatarRoot} + ${AvatarRoot} {
    margin-left: calc(${({ theme }) => theme.spacing[150]} * -1);
    outline: 2px solid ${({ theme }) => theme.colors.background.primary};
  }
`;

export function AvatarGroup({ names }: { names: string[] }) {
  return (
    <AvatarGroupRoot>
      {names.map((name) => (
        <PersonAvatar key={name} name={name} />
      ))}
    </AvatarGroupRoot>
  );
}

const lookProps = ({
  size = 'medium',
  theme = 'grayscale',
  variant = 'secondary',
  fullWidth,
}: ButtonLook) => ({
  $size: size,
  $theme: theme,
  $variant: variant,
  $fullWidth: fullWidth,
});

/** kit Button 모양의 라우터 링크. 예: <ButtonLink theme="accent" variant="primary" to="…"> */
export function ButtonLink({
  size,
  theme,
  variant,
  fullWidth,
  ...rest
}: ButtonLook & LinkProps) {
  return (
    <ButtonRoot
      as={Link}
      {...lookProps({ size, theme, variant, fullWidth })}
      {...rest}
    />
  );
}

/** kit Button 모양의 label (파일 고르기처럼 숨긴 input을 여는 버튼). */
export function ButtonLabel({
  size,
  theme,
  variant,
  fullWidth,
  ...rest
}: ButtonLook & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <ButtonRoot
      as="label"
      {...lookProps({ size, theme, variant, fullWidth })}
      {...rest}
    />
  );
}

const TextButtonLinkRoot = styled(Link)<{
  $size: NonNullable<TextButtonLook['size']>;
  $theme: NonNullable<TextButtonLook['theme']>;
}>`
  ${({ theme: t, $size, $theme }) =>
    textButtonStyles(t, { size: $size, theme: $theme })}
`;

/** kit TextButton 모양의 라우터 링크 (폼의 "취소" 등). */
export function TextButtonLink({
  size = 'medium',
  theme = 'grayscale',
  ...rest
}: Omit<TextButtonLook, 'weight'> & LinkProps) {
  return <TextButtonLinkRoot $size={size} $theme={theme} {...rest} />;
}

import type { HTMLAttributes } from 'react';
import {
  Avatar,
  type AvatarProps,
  type BadgeProps,
} from '../../dimi-ui-kit/index.ts';

/** 상태 배지의 kit Badge 테마. */
export type StatusTone = NonNullable<BadgeProps['theme']>;

/**
 * 도메인 상태 → kit Badge 테마.
 * grayscale: 기본·끝난 상태, solid(파랑): 진행, accent(분홍): 손이 필요한 상태, negative: 반려·지연.
 */
export const statusTone = {
  suggestion: {
    '접수 대기': 'grayscale',
    '안건 채택': 'solid',
    '검토 중': 'accent',
    '답변 완료': 'grayscale',
    반려: 'negative',
  },
  agenda: {
    등록: 'grayscale',
    검토: 'solid',
    결정: 'solid',
    추진: 'solid',
    보류: 'accent',
    완료: 'grayscale',
    부결: 'negative',
  },
  task: {
    '할 일': 'grayscale',
    '진행 중': 'solid',
    '검토 요청': 'accent',
    완료: 'grayscale',
    '마감 지남': 'negative',
  },
  survey: {
    '작성 중': 'grayscale',
    '진행 중': 'solid',
    예약: 'accent',
    마감: 'grayscale',
  },
  report: {
    '작성 중': 'grayscale',
    '검토 요청': 'accent',
    완료: 'grayscale',
  },
  visibility: {
    '학생회 내부': 'grayscale',
    '전체 공개': 'solid',
    '공개 검토 중': 'accent',
    게시됨: 'grayscale',
    '수정 요청': 'negative',
  },
} as const satisfies Record<string, Record<string, StatusTone>>;

export interface CountProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** 처리할 일이 쌓였음을 알리는 채워진 숫자 (kit IconButton BadgedText의 숫자 방울) */
  alert?: boolean;
}

export function Count({
  value,
  alert = false,
  className,
  ...rest
}: CountProps) {
  return (
    <span
      className={['count', alert && 'count--alert', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {value}
    </span>
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

export function AvatarGroup({ names }: { names: string[] }) {
  return (
    <span className="avatar-group">
      {names.map((name) => (
        <PersonAvatar key={name} name={name} />
      ))}
    </span>
  );
}

type ButtonLook = {
  size?: 'small' | 'medium' | 'large';
  theme?: 'grayscale' | 'accent' | 'negative';
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
};

/**
 * kit Button 모양을 링크(<Link>)나 label에 입힐 때 펼쳐 넣는 속성.
 * 예: <Link {...buttonLook({ theme: 'accent', variant: 'primary' })} to="…">
 */
export function buttonLook({
  size = 'medium',
  theme = 'grayscale',
  variant = 'secondary',
  fullWidth,
  className,
}: ButtonLook = {}) {
  return {
    className: ['kit-button kit-interactive', className]
      .filter(Boolean)
      .join(' '),
    'data-size': size,
    'data-theme': theme,
    'data-style': variant,
    'data-inverted':
      theme === 'grayscale' && variant === 'primary' ? '' : undefined,
    'data-full-width': fullWidth ? '' : undefined,
  };
}

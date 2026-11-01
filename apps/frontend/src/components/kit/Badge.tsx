import type { HTMLAttributes, ReactNode } from 'react';

/** 상태 매핑의 다섯 톤. 도메인 상태 → 톤 변환은 statusTone을 쓴다. */
export type StatusTone = 'default' | 'info' | 'warn' | 'success' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  children: ReactNode;
}

export function Badge({
  tone = 'default',
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={['badge', `badge--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}

/** KIT 상태 매핑 표: 도메인별 상태 이름 → 톤 */
export const statusTone = {
  suggestion: {
    '접수 대기': 'default',
    '안건 채택': 'info',
    '검토 중': 'warn',
    '답변 완료': 'success',
    반려: 'danger',
  },
  agenda: {
    등록: 'default',
    검토: 'info',
    결정: 'info',
    추진: 'info',
    보류: 'warn',
    완료: 'success',
    부결: 'danger',
  },
  task: {
    '할 일': 'default',
    '진행 중': 'info',
    '검토 요청': 'warn',
    완료: 'success',
    '마감 지남': 'danger',
  },
  survey: {
    '작성 중': 'default',
    '진행 중': 'info',
    예약: 'warn',
    마감: 'success',
  },
  visibility: {
    '학생회 내부': 'default',
    '전체 공개': 'info',
    '공개 검토 중': 'warn',
    게시됨: 'success',
    '수정 요청': 'danger',
  },
} as const satisfies Record<string, Record<string, StatusTone>>;

export function Tag({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={['tag', className].filter(Boolean).join(' ')} {...rest} />
  );
}

export interface CountProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** 처리할 일이 쌓였음을 알리는 채워진 숫자 (예: 건의 접수함 7) */
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

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** 전체 이름. 첫 글자를 보여주고 전체 이름은 스크린 리더와 툴팁에 쓴다. */
  name: string;
  size?: 'md' | 'lg';
}

export function Avatar({ name, size = 'md', className, ...rest }: AvatarProps) {
  return (
    <span
      className={['avatar', size === 'lg' && 'avatar--lg', className]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={name}
      title={name}
      {...rest}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function AvatarGroup({ names }: { names: string[] }) {
  return (
    <span className="avatar-group">
      {names.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </span>
  );
}

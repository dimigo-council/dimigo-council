import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../../dimi-ui-kit/index.ts';
import { iconExclamation, iconInfo } from '../../dimi-ui-kit/icons.ts';

export type NoticeTone = 'info' | 'warn' | 'neutral';

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: NoticeTone;
  children: ReactNode;
}

/** 화면 안의 안내 문구. info: 알아둘 사실, warn: 주의, neutral: 덧붙이는 설명 */
export function Notice({
  tone = 'info',
  className,
  children,
  ...rest
}: NoticeProps) {
  return (
    <div
      className={['notice', `notice--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <Icon icon={tone === 'warn' ? iconExclamation : iconInfo} size={20} />
      <div className="notice__body">{children}</div>
    </div>
  );
}

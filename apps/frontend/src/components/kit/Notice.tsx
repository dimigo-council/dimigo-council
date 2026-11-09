import type { HTMLAttributes, ReactNode } from 'react';

export type NoticeTone = 'info' | 'warn' | 'neutral';

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: NoticeTone;
  children: ReactNode;
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="4.75" r="0.9" fill="currentColor" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M8 1.75 14.75 13.75H1.25Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6v3.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="11.75" r="0.9" fill="currentColor" />
    </svg>
  );
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
      {tone === 'warn' ? <WarnIcon /> : <InfoIcon />}
      <div className="notice__body">{children}</div>
    </div>
  );
}

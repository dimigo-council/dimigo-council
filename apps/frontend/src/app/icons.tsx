import type { ReactNode } from 'react';

/** 업무공간 사이드바용 16px 선 아이콘. 장식이므로 모두 aria-hidden. */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function TaskIcon() {
  return (
    <Icon>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1" />
      <path d="m5.5 8 1.75 1.75L10.5 6.5" />
    </Icon>
  );
}

export function AgendaIcon() {
  return (
    <Icon>
      <path d="M6 4h7.5M6 8h7.5M6 12h7.5" />
      <path d="M2.5 4h.5M2.5 8h.5M2.5 12h.5" />
    </Icon>
  );
}

export function InboxIcon() {
  return (
    <Icon>
      <path d="M2.5 9.5 4 3.5h8l1.5 6v3h-11Z" />
      <path d="M2.5 9.5h3.25l.75 1.5h3l.75-1.5h3.25" />
    </Icon>
  );
}

export function SurveyIcon() {
  return (
    <Icon>
      <rect x="3" y="2.5" width="10" height="11" rx="1" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
    </Icon>
  );
}

export function ReportIcon() {
  return (
    <Icon>
      <path d="M4 2.5h5.5L12.5 5.5v8H4Z" />
      <path d="M9.5 2.5v3h3M6 9h4.5M6 11h3" />
    </Icon>
  );
}

export function EyeIcon() {
  return (
    <Icon>
      <path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z" />
      <circle cx="8" cy="8" r="2" />
    </Icon>
  );
}

export function PeopleIcon() {
  return (
    <Icon>
      <circle cx="6" cy="5.5" r="2.25" />
      <path d="M2 13c.5-2.25 2-3.5 4-3.5s3.5 1.25 4 3.5" />
      <path d="M10.5 3.5a2.25 2.25 0 0 1 0 4.25M12 9.75c1 .5 1.75 1.5 2 3.25" />
    </Icon>
  );
}

export function ChevronLeftIcon() {
  return (
    <Icon>
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </Icon>
  );
}

export function PlusIcon() {
  return (
    <Icon>
      <path d="M8 3v10M3 8h10" />
    </Icon>
  );
}

export function PhotoIcon() {
  return (
    <Icon>
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <circle cx="5.75" cy="6.5" r="1.25" />
      <path d="m2.5 12 3.5-3.5 2.5 2.5 2-2 3 3" />
    </Icon>
  );
}

export function LockIcon() {
  return (
    <Icon>
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon>
      <path d="m4 4 8 8M12 4l-8 8" />
    </Icon>
  );
}

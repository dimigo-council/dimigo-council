import './intranet.css';

export interface MeterProps {
  value: number;
  max: number;
  /** 스크린 리더가 읽는 이름 (예: 응답한 문항) */
  label: string;
  /** 막대 옆 글자. 기본은 "value / max" */
  text?: string;
}

/** I-meter: 진행 정도를 보여주는 단색 막대 */
export function Meter({ value, max, label, text }: MeterProps) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="meter">
      <span className="meter__text">{text ?? `${value} / ${max}`}</span>
      <div
        className="meter__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="meter__bar" style={{ transform: `scaleX(${ratio})` }} />
      </div>
    </div>
  );
}

import styled, { css } from 'styled-components';

/** I-meter. 표 안에서처럼 배치를 바꿀 때 선택자로 쓴다 (`${MeterRoot}`). */
export const MeterRoot = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Text = styled.span`
  ${({ theme: t }) => css`
    flex: none;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  `}
`;

const Track = styled.div`
  flex: 1;
  height: 4px;
  overflow: hidden;
  border-radius: 1px;
  background: ${({ theme }) => theme.colors.core.outline};
`;

const Bar = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.components.fill.inverted.primary};
  transform-origin: left;
  transition: transform 200ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export interface MeterProps {
  value: number;
  max: number;
  /** 스크린 리더가 읽는 이름 (예: 응답한 문항) */
  label: string;
  /** 막대 옆 글자. 기본은 "value / max" */
  text?: string;
  className?: string;
}

/** I-meter: 진행 정도를 보여주는 단색 막대 */
export function Meter({ value, max, label, text, className }: MeterProps) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <MeterRoot className={className}>
      <Text>{text ?? `${value} / ${max}`}</Text>
      <Track
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <Bar style={{ transform: `scaleX(${ratio})` }} />
      </Track>
    </MeterRoot>
  );
}

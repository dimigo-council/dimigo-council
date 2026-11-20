import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import {
  Icon,
  chipStyles,
  controlCheckedStyles,
  controlStyles,
  segmentSelectedStyles,
  segmentStyles,
  segmentedTrackStyles,
} from '../../dimi-ui-kit/index.ts';
import { iconCheck } from '../../dimi-ui-kit/icons';
import { visuallyHidden } from './VisuallyHidden.ts';

/*
 * Form choices drawn with DIMI UI KIT visuals (Control, Segment, Chip) over native inputs,
 * so keyboard, form submission and arrow-key radio groups keep the browser's behavior.
 * The kit's checked styles are mirrored onto `input:checked + <look>`.
 */

/** 보이지 않는 네이티브 input. 바로 뒤 형제가 kit 모양을 그린다. */
export const ChoiceInput = styled.input`
  ${visuallyHidden}
`;

export interface ChoiceProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: ReactNode;
}

type ControlLook = 'checkfill' | 'radio' | 'toggle';

/** kit Control 모양. 선택자로 쓴다 (`${ControlBox}`). */
export const ControlBox = styled.span<{
  $look: ControlLook;
  $checked?: boolean;
}>`
  ${({ theme: t, $look, $checked }) => css`
    ${controlStyles(t, { type: $look, interactive: false })}
    cursor: inherit;
    ${$checked && $look !== 'toggle' && controlCheckedStyles(t, $look)}

    ${ChoiceInput}:checked + & {
      ${controlCheckedStyles(t, $look)}
    }
    ${ChoiceInput}:focus-visible + & {
      box-shadow: 0 0 0 2px ${t.colors.core.status.accent};
      outline: 2px solid ${t.colors.background.primary};
    }
    ${ChoiceInput}:disabled + & {
      opacity: 0.3;
    }

    @media (prefers-reduced-motion: reduce) {
      &::before {
        transition: none;
      }
    }
  `}
`;

function ControlLookBox({ look }: { look: ControlLook }) {
  return (
    <ControlBox $look={look} aria-hidden="true">
      {look === 'checkfill' && <Icon icon={iconCheck} size={20} />}
    </ControlBox>
  );
}

const ChoiceRoot = styled.label`
  ${({ theme: t }) => css`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: ${t.spacing[200]};
    min-height: ${t.height[200]};
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    line-height: ${t.font.lineHeight.callout};
    cursor: pointer;

    &:has(${ChoiceInput}:disabled) {
      color: ${t.colors.core.glyph.tertiary};
      cursor: not-allowed;
    }
  `}
`;

/** 선택지 옆 글자. 선택자로 쓴다 (`${ChoiceLabel}`). */
export const ChoiceLabel = styled.span``;

function ChoiceBase({
  type,
  look,
  label,
  className,
  ...rest
}: ChoiceProps & { type: 'checkbox' | 'radio'; look: ControlLook }) {
  return (
    <ChoiceRoot className={className}>
      <ChoiceInput type={type} {...rest} />
      <ControlLookBox look={look} />
      <ChoiceLabel>{label}</ChoiceLabel>
    </ChoiceRoot>
  );
}

/** 선택지 한 줄의 label. 선택자로 쓴다 (`${Choice}`). */
export { ChoiceRoot as Choice };

/** Kit Control Type=CheckFill. */
export function Checkbox(props: ChoiceProps) {
  return <ChoiceBase type="checkbox" look="checkfill" {...props} />;
}

/** Kit Control Type=Radio. */
export function Radio(props: ChoiceProps) {
  return <ChoiceBase type="radio" look="radio" {...props} />;
}

/** Kit Control Type=Toggle. */
export function Switch(props: ChoiceProps) {
  return <ChoiceBase type="checkbox" role="switch" look="toggle" {...props} />;
}

export interface ChoiceItem<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface ChoiceGroupProps<T extends string> {
  items: ChoiceItem<T>[];
  /** null이면 아무것도 고르지 않은 상태 */
  value: T | null;
  onChange: (value: T) => void;
  /** segmented: kit SegmentedControl 모양. chips: kit Chip 모양의 단일 선택 (건의 분류 등) */
  variant?: 'segmented' | 'chips';
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/* ChoiceGroup: kit SegmentedControl 트랙 또는 kit Chip 줄 */
const GroupRoot = styled.div<{ $chips: boolean }>`
  ${({ theme: t, $chips }) => css`
    ${!$chips && segmentedTrackStyles(t)}
    display: inline-flex;
    max-width: 100%;
    ${
      $chips
        ? css`
            flex-wrap: wrap;
            gap: ${t.spacing[200]};
          `
        : css`
            overflow-x: auto;
            scrollbar-width: none;
          `
    }

    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

const choiceFocus = css`
  ${ChoiceInput}:focus-visible + &::after {
    background: ${({ theme }) => theme.colors.components.interaction.focused};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.core.status.accent};
  }
  ${ChoiceInput}:disabled + & {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const SegmentLook = styled.span`
  ${({ theme: t }) => css`
    ${segmentStyles(t)}
    flex: 1;

    ${ChoiceInput}:checked + & {
      ${segmentSelectedStyles(t)}
    }
  `}
  ${choiceFocus}
`;

const ChipLook = styled.span<{ $invalid?: boolean }>`
  ${({ theme: t, $invalid }) => css`
    ${chipStyles(t, { theme: 'outlined' })}
    padding: ${t.spacing[200]} ${t.spacing[400]};
    font-size: ${t.font.size.callout};
    line-height: ${t.font.lineHeight.callout};

    ${ChoiceInput}:checked + & {
      background: ${t.colors.components.fill.inverted.secondary};
      box-shadow: none;
      color: ${t.colors.core.glyph.inverted.primary};
      font-weight: ${t.font.weight.strong};
    }
    ${
      $invalid &&
      css`
        &,
        ${ChoiceInput}:checked + & {
          box-shadow: inset 0 0 0 1px ${t.colors.core.status.negative};
        }
      `
    }
  `}
  ${choiceFocus}
`;

const GroupItem = styled.label<{ $segmented: boolean }>`
  display: inline-flex;
  cursor: pointer;
  ${({ $segmented }) => $segmented && 'flex: 1 0 auto;'}
`;

/** 한 번에 하나만 고르는 선택. 네이티브 라디오라 방향키로 움직인다. */
export function ChoiceGroup<T extends string>({
  items,
  value,
  onChange,
  variant = 'segmented',
  name,
  ...aria
}: ChoiceGroupProps<T>) {
  const generated = useId();
  const groupName = name ?? generated;
  const chips = variant === 'chips';

  return (
    <GroupRoot $chips={chips} role="radiogroup" {...aria}>
      {items.map((item) => (
        <GroupItem key={item.value} $segmented={!chips}>
          <ChoiceInput
            type="radio"
            name={groupName}
            value={item.value}
            checked={item.value === value}
            disabled={item.disabled}
            onChange={() => onChange(item.value)}
          />
          {chips ? (
            <ChipLook $invalid={aria['aria-invalid'] === true}>
              {item.label}
            </ChipLook>
          ) : (
            <SegmentLook>{item.label}</SegmentLook>
          )}
        </GroupItem>
      ))}
    </GroupRoot>
  );
}

export interface OptionCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'title'
> {
  title: ReactNode;
  description?: ReactNode;
  /** radio: 같은 name끼리 하나만 고른다. checkbox: 여러 개를 고른다. */
  type?: 'radio' | 'checkbox';
}

const OptionCardText = styled.span`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[50]};
    min-width: 0;
    padding-top: ${t.spacing[50]};
  `}
`;

const OptionCardTitle = styled.span`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.body};
    line-height: ${t.font.lineHeight.body};
    font-weight: ${t.font.weight.weak};
    letter-spacing: -0.02em;
  `}
`;

const OptionCardDescription = styled.span`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    line-height: ${t.font.lineHeight.footnote};
  `}
`;

/* OptionCard: kit Option 카드 + Control. 선택되면 Accent 2px 테두리. */
const OptionCardRoot = styled.label`
  ${({ theme: t }) => css`
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: ${t.spacing[300]};
    padding: ${t.spacing[300]} ${t.spacing[400]};
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
    cursor: pointer;

    &:has(${ChoiceInput}:checked) {
      box-shadow: inset 0 0 0 2px ${t.colors.core.status.accent};
    }
    &:has(${ChoiceInput}:checked) ${OptionCardTitle} {
      color: ${t.colors.core.glyph.primary};
      font-weight: ${t.font.weight.strong};
    }
    &:hover:not(:has(${ChoiceInput}:disabled)) {
      background: color-mix(
        in srgb,
        ${t.colors.components.fill.primary},
        ${t.colors.core.glyph.primary} 4%
      );
    }
    &:has(${ChoiceInput}:focus-visible) {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
    ${ChoiceInput}:focus-visible + ${ControlBox} {
      box-shadow: none;
      outline: none;
    }
    &:has(${ChoiceInput}:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
`;

/** 설명이 붙을 수 있는 큰 선택지: kit Option 카드 + Control. */
export function OptionCard({
  title,
  description,
  type = 'radio',
  className,
  ...rest
}: OptionCardProps) {
  return (
    <OptionCardRoot className={className}>
      <ChoiceInput type={type} {...rest} />
      <ControlLookBox look={type === 'radio' ? 'radio' : 'checkfill'} />
      <OptionCardText>
        <OptionCardTitle>{title}</OptionCardTitle>
        {description && (
          <OptionCardDescription>{description}</OptionCardDescription>
        )}
      </OptionCardText>
    </OptionCardRoot>
  );
}

/** 선택지 카드. 선택자로 쓴다 (`${OptionCardBox}`). */
export { OptionCardRoot as OptionCardBox, OptionCardText };

/** 눌리지 않는 kit Control 그림 (체크 목록·응답 보기처럼 상태만 보여줄 때). */
export function ControlMark({
  type,
  checked,
}: {
  type: 'checkfill' | 'radio';
  checked: boolean;
}) {
  return (
    <ControlBox $look={type} $checked={checked} aria-hidden="true">
      {type === 'checkfill' && <Icon icon={iconCheck} size={20} />}
    </ControlBox>
  );
}

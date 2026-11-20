import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Icon, type KitIcon } from './Icon';
import { IconSize } from './IconSize';
import { iconPersonFill, iconSchoolFill } from './icons.generated';
import { interactive } from './styles';

/* ---------- Avatar ---------- */

type AvatarSize = 'small' | 'medium' | 'large';

const avatarDimensions: Record<AvatarSize, [box: number, icon: number]> = {
  small: [24, 20],
  medium: [36, 30],
  large: [48, 40],
};

/** The Avatar's <span>. Use it as a selector (`${AvatarRoot}`). */
export const AvatarRoot = styled.span<{
  $type: 'person' | 'classroom';
  $size: AvatarSize;
}>`
  ${({ theme: t, $type, $size }) => {
    const box = `${avatarDimensions[$size][0]}px`;
    const classroomRadius = {
      small: t.radius.xs,
      medium: t.radius.m,
      large: t.radius.xl,
    };
    return css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      overflow: hidden;
      box-sizing: border-box;
      background: ${t.colors.components.fill.secondary};
      box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
      color: ${t.colors.core.glyph.tertiary};
      width: ${box};
      height: ${box};
      border-radius: ${
        $type === 'person' ? t.radius.circle : classroomRadius[$size]
      };

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;
  }}
`;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person is round; Classroom is a rounded square. */
  type?: 'person' | 'classroom';
  size?: AvatarSize;
  /** Kit Fill=Image. Without it the kit's Fill=Icon placeholder is shown. */
  src?: string;
  alt?: string;
}

/** DIMI UI KIT "Avatar". */
export function Avatar({
  type = 'person',
  size = 'medium',
  src,
  alt = '',
  ...rest
}: AvatarProps) {
  return (
    <AvatarRoot $type={type} $size={size} {...rest}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <Icon
          icon={type === 'person' ? iconPersonFill : iconSchoolFill}
          size={avatarDimensions[size][1]}
        />
      )}
    </AvatarRoot>
  );
}

/* ---------- Divider ---------- */

const DividerRoot = styled.hr<{ $size: 'small' | 'medium' | 'large' }>`
  flex: none;
  width: 100%;
  margin: 0;
  border: 0;
  background: ${({ theme }) => theme.colors.core.line};
  height: ${({ $size }) =>
    ({ small: '1px', medium: '4px', large: '8px' })[$size]};
`;

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  size?: 'small' | 'medium' | 'large';
}

/** DIMI UI KIT "Divider": 1px, 4px or 8px of Core/Line. */
export function Divider({ size = 'small', ...rest }: DividerProps) {
  return <DividerRoot $size={size} {...rest} />;
}

/* ---------- Option ---------- */

const OptionSub = styled.span`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    line-height: ${t.font.lineHeight.footnote};
    font-weight: ${t.font.weight.weak};
  `}
`;

const OptionLabel = styled.span`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.body};
    line-height: ${t.font.lineHeight.body};
    font-weight: ${t.font.weight.weak};
  `}
`;

/** The Option's <button>. Use it as a selector (`${OptionRoot}`). */
export const OptionRoot = styled.button<{ $selected: boolean }>`
  ${({ theme: t, $selected }) => css`
    ${interactive(t)}
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: 0;
    margin: 0;
    padding: ${t.spacing[300]} ${t.spacing[400]};
    border-radius: ${t.radius.s};
    background: ${t.colors.components.fill.primary};
    box-shadow: inset 0 0 0 ${$selected ? '2px' : '1px'}
      ${$selected ? t.colors.core.status.accent : t.colors.core.outline};
    font-family: ${t.font.family};
    letter-spacing: -0.02em;
    text-align: center;
    appearance: none;

    ${
      $selected &&
      css`
        ${OptionSub} {
          color: ${t.colors.core.glyph.secondary};
        }
        ${OptionLabel} {
          color: ${t.colors.core.glyph.primary};
          font-weight: ${t.font.weight.strong};
        }
      `
    }
  `}
`;

export interface OptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kit "Activated". */
  selected?: boolean;
  subLabel?: ReactNode;
  children: ReactNode;
}

/** DIMI UI KIT "Option": a selectable card with an optional sub-label above the label. */
export function Option({
  selected = false,
  subLabel,
  type = 'button',
  children,
  ...rest
}: OptionProps) {
  return (
    <OptionRoot
      type={type}
      role="radio"
      aria-checked={selected}
      $selected={selected}
      {...rest}
    >
      {subLabel && <OptionSub>{subLabel}</OptionSub>}
      <OptionLabel>{children}</OptionLabel>
    </OptionRoot>
  );
}

/* ---------- Segment ---------- */

export interface SegmentLook {
  /** Kit "Activated". */
  selected?: boolean;
  /** The segment is itself a button or link (with the Interaction overlay). */
  interactive?: boolean;
}

/** Selected look of a Segment. */
export const segmentSelectedStyles = (t: DefaultTheme) => css`
  background: ${t.colors.components.translucent.interactive};
  color: ${t.colors.core.glyph.primary};
  font-weight: ${t.font.weight.strong};
`;

/** The kit Segment's look. Also used for tab links and native radio labels. */
export const segmentStyles = (
  t: DefaultTheme,
  { selected = false, interactive: own = true }: SegmentLook = {},
) => css`
  ${own && interactive(t)}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${t.spacing[200]};
  box-sizing: border-box;
  border: 0;
  margin: 0;
  padding: ${t.spacing[200]} ${t.spacing[300]};
  border-radius: ${t.radius.s};
  background: transparent;
  color: ${t.colors.core.glyph.quaternary};
  font-family: ${t.font.family};
  font-size: ${t.font.size.body};
  line-height: ${t.font.lineHeight.body};
  font-weight: ${t.font.weight.weak};
  letter-spacing: -0.02em;
  white-space: nowrap;
  appearance: none;
  ${selected && segmentSelectedStyles(t)}
`;

/** The Segment's <button>. Use it as a selector (`${SegmentRoot}`). */
export const SegmentRoot = styled.button<{ $selected: boolean }>`
  ${({ theme: t, $selected }) => segmentStyles(t, { selected: $selected })}
`;

export interface SegmentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kit "Activated". */
  selected?: boolean;
  leadingIcon?: KitIcon;
  children: ReactNode;
}

/** DIMI UI KIT "Segment": one tab of a SegmentedControl. */
export function Segment({
  selected = false,
  leadingIcon,
  type = 'button',
  children,
  ...rest
}: SegmentProps) {
  return (
    <SegmentRoot
      type={type}
      role="tab"
      aria-selected={selected}
      $selected={selected}
      {...rest}
    >
      <IconSize value={20}>
        {leadingIcon && <Icon icon={leadingIcon} />}
        {children}
      </IconSize>
    </SegmentRoot>
  );
}

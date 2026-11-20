import type { ButtonHTMLAttributes } from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Icon, type KitIcon } from './Icon';
import { IconSize } from './IconSize';
import {
  iconCheck,
  iconHeart,
  iconHeartFill,
  iconStar,
  iconStarFill,
} from './icons.generated';
import { interactive } from './styles';

export type ControlType =
  'toggle' | 'checkfill' | 'radio' | 'heart' | 'star' | 'check';

export interface ControlLook {
  type: ControlType;
  checked?: boolean;
  disabled?: boolean;
  /** The control is itself a button (with the Interaction overlay). */
  interactive?: boolean;
}

/** Checked look of the filled controls (Toggle, CheckFill, Radio). */
export const controlCheckedStyles = (t: DefaultTheme, type: ControlType) => {
  const c = t.colors;
  switch (type) {
    case 'toggle':
      return css`
        background: ${c.core.status.accent};
        &::before {
          transform: translateX(24px);
        }
      `;
    case 'checkfill':
      return css`
        background: ${c.core.status.accent};
        color: ${c.core.onColor.primary};
      `;
    case 'radio':
      return css`
        background: ${c.core.status.accent};
      `;
    default:
      return css``;
  }
};

/** The kit Control's look. Also used to draw native checkboxes, radios and switches. */
export const controlStyles = (
  t: DefaultTheme,
  {
    type,
    checked = false,
    disabled = false,
    interactive: own = true,
  }: ControlLook,
) => {
  const c = t.colors;
  const types: Record<ControlType, ReturnType<typeof css>> = {
    toggle: css`
      width: 48px;
      height: 24px;
      border-radius: ${t.radius.s};
      background: ${c.components.translucent.primary};

      &::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: ${t.radius.xs};
        background: ${c.core.onColor.primary};
        transition: transform 160ms ease;
      }
    `,
    checkfill: css`
      width: 24px;
      height: 24px;
      padding: 2px;
      border-radius: ${t.radius.xs};
      background: ${c.components.translucent.primary};
      color: ${disabled ? c.core.onColor.tertiary : c.core.onColor.secondary};
    `,
    radio: css`
      width: 24px;
      height: 24px;
      border-radius: ${t.radius.circle};
      background: ${c.components.translucent.primary};

      &::before {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: ${t.radius.circle};
        background: ${c.core.onColor.primary};
      }
    `,
    check: css`
      color: ${
        disabled
          ? c.components.translucent.secondary
          : c.components.translucent.primary
      };
    `,
    heart: css`
      ${disabled && `color: ${c.core.glyph.tertiary};`}
    `,
    star: css`
      ${disabled && `color: ${c.core.glyph.tertiary};`}
    `,
  };
  // Disabled colors per type, as drawn in the kit.
  const checkedTypes: Record<ControlType, ReturnType<typeof css>> = {
    toggle: controlCheckedStyles(t, 'toggle'),
    checkfill: css`
      ${controlCheckedStyles(t, 'checkfill')}
      ${disabled && `color: ${c.core.onColor.secondary};`}
    `,
    radio: controlCheckedStyles(t, 'radio'),
    check: css`
      color: ${c.core.status.accent};
      ${disabled && 'opacity: 0.3;'}
    `,
    heart: css`
      color: ${
        disabled ? c.core.status.translucent.accent : c.core.status.accent
      };
    `,
    star: css`
      color: ${
        disabled ? c.core.status.translucent.warning : c.core.status.warning
      };
    `,
  };
  const overlayInset = type === 'toggle' ? '0' : '-2px';
  return css`
    ${
      own &&
      interactive(t, {
        inset: overlayInset,
        radius: type === 'radio' ? 'circle' : 's',
      })
    }
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    box-sizing: border-box;
    border: 0;
    margin: 0;
    padding: 0;
    background: none;
    color: ${c.core.glyph.primary};
    appearance: none;
    ${types[type]}
    ${checked && checkedTypes[type]}
    ${disabled && (type === 'toggle' || type === 'radio') && 'opacity: 0.3;'}
  `;
};

/** The Control's root. Use it as a selector (`${ControlRoot}`). */
export const ControlRoot = styled.button<{
  $type: ControlType;
  $checked: boolean;
  $disabled?: boolean;
}>`
  ${({ theme: t, $type, $checked, $disabled }) =>
    controlStyles(t, { type: $type, checked: $checked, disabled: $disabled })}
`;

export interface ControlProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type'
> {
  type: ControlType;
  /** Kit "Status". */
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Accessible name when there is no visible label wired with aria-labelledby. */
  label?: string;
}

const icons: Partial<Record<ControlType, [off: KitIcon, on: KitIcon]>> = {
  heart: [iconHeart, iconHeartFill],
  star: [iconStar, iconStarFill],
  check: [iconCheck, iconCheck],
  checkfill: [iconCheck, iconCheck],
};

/**
 * DIMI UI KIT "Control": Toggle, CheckFill (checkbox), Radio, Heart, Star and Check.
 * Toggle uses role="switch", Radio role="radio", the rest role="checkbox".
 */
export function Control({
  type,
  checked,
  onChange,
  label,
  disabled,
  onClick,
  ...rest
}: ControlProps) {
  const role =
    type === 'toggle' ? 'switch' : type === 'radio' ? 'radio' : 'checkbox';
  const pair = icons[type];
  return (
    <ControlRoot
      type="button"
      role={role}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      $type={type}
      $checked={checked}
      $disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented)
          onChange?.(type === 'radio' ? true : !checked);
      }}
      {...rest}
    >
      <IconSize value={type === 'checkfill' ? 20 : 24}>
        {pair && <Icon icon={checked ? pair[1] : pair[0]} />}
      </IconSize>
    </ControlRoot>
  );
}

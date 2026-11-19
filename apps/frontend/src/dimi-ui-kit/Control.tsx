import type { ButtonHTMLAttributes } from 'react';
import { Icon, type KitIcon } from './Icon';
import {
  iconCheck,
  iconHeart,
  iconHeartFill,
  iconStar,
  iconStarFill,
} from './icons.generated';
import { cx } from './cx';

export type ControlType =
  'toggle' | 'checkfill' | 'radio' | 'heart' | 'star' | 'check';

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
  className,
  onClick,
  ...rest
}: ControlProps) {
  const role =
    type === 'toggle' ? 'switch' : type === 'radio' ? 'radio' : 'checkbox';
  const pair = icons[type];
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cx('kit-control kit-interactive', className)}
      data-type={type}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented)
          onChange?.(type === 'radio' ? true : !checked);
      }}
      {...rest}
    >
      {pair && <Icon icon={checked ? pair[1] : pair[0]} />}
    </button>
  );
}

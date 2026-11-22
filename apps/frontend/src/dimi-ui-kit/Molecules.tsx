import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Button, ButtonRoot, type ButtonProps } from './Button';
import { Icon, type KitIcon } from './Icon';
import { IconSize } from './IconSize';
import { iconArrowBackIos } from './icons.generated';
import { Input, type InputProps } from './Input';
import { Option, OptionRoot, Segment, SegmentRoot } from './Misc';
import { SymbolCouncil } from './Brand';
import { Text } from './Text';
import { interactive, resetButton } from './styles';
import type { KitTextStyle } from './theme';

/* ---------- Navigation/NavigationBar ---------- */

export interface NavigationAction {
  icon: KitIcon;
  label: string;
  onClick?: () => void;
}

export interface NavigationBarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  /** Page: back arrow + title. IndexText: title only. IndexLogo: council symbol. */
  type?: 'page' | 'index-text' | 'index-logo';
  title?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  primary?: NavigationAction;
  secondary?: NavigationAction;
}

const NavigationBarRoot = styled.header<{ $logo: boolean }>`
  ${({ theme: t, $logo }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};
    box-sizing: border-box;
    width: 100%;
    padding: ${t.spacing[400]} ${t.spacing[500]};
    ${$logo && 'justify-content: space-between;'}
  `}
`;

const NavigationBarBack = styled.button`
  ${({ theme: t }) => css`
    ${interactive(t)}
    ${resetButton}
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

const NavigationBarTitle = styled.h1`
  ${({ theme: t }) => css`
    ${t.text.titleStrong}
    flex: 1;
    min-width: 0;
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

const NavigationBarActions = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};
    color: ${t.colors.core.glyph.primary};
  `}
`;

const NavigationBarAction = styled.button`
  ${({ theme: t }) => css`
    ${interactive(t, { inset: '-2px', radius: 's' })}
    ${resetButton}
    display: inline-flex;
  `}
`;

/** DIMI UI KIT "Navigation/NavigationBar" (mobile top bar). */
export function NavigationBar({
  type = 'page',
  title,
  onBack,
  backLabel = '뒤로',
  primary,
  secondary,
  ...rest
}: NavigationBarProps) {
  const actions = [primary, secondary].filter((a): a is NavigationAction =>
    Boolean(a),
  );
  return (
    <NavigationBarRoot $logo={type === 'index-logo'} {...rest}>
      {type === 'page' && (
        <NavigationBarBack
          type="button"
          aria-label={backLabel}
          onClick={onBack}
        >
          <Icon icon={iconArrowBackIos} size={20} />
        </NavigationBarBack>
      )}
      {type === 'index-logo' ? (
        <SymbolCouncil size={32} />
      ) : (
        <NavigationBarTitle>{title}</NavigationBarTitle>
      )}
      {actions.length > 0 && (
        <NavigationBarActions>
          {actions.map((a) => (
            <NavigationBarAction
              key={a.label}
              type="button"
              aria-label={a.label}
              onClick={a.onClick}
            >
              <Icon icon={a.icon} size={28} />
            </NavigationBarAction>
          ))}
        </NavigationBarActions>
      )}
    </NavigationBarRoot>
  );
}

/* ---------- Control/SegmentedControl ---------- */

export interface SegmentItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: KitIcon;
}

export interface SegmentedControlProps<T extends string> {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

const SegmentedControlRoot = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[400]};
`;

/** The track that holds Segments (kit SegmentedControl without its outer padding). */
export const segmentedTrackStyles = (t: DefaultTheme) => css`
  display: flex;
  gap: ${t.spacing[100]};
  padding: ${t.spacing[100]};
  border-radius: ${t.radius.m};
  background: ${t.colors.components.translucent.secondary};
`;

const SegmentedControlTrack = styled.div`
  ${({ theme: t }) => segmentedTrackStyles(t)}

  > ${SegmentRoot} {
    flex: 1 1 0;
    min-width: 0;
  }
`;

/** DIMI UI KIT "Control/SegmentedControl" (Double … Septuple: any number of segments). */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <SegmentedControlRoot className={className}>
      <SegmentedControlTrack role="tablist" aria-label={label}>
        {items.map((item) => (
          <Segment
            key={item.value}
            selected={item.value === value}
            leadingIcon={item.icon}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </Segment>
        ))}
      </SegmentedControlTrack>
    </SegmentedControlRoot>
  );
}

/* ---------- Control/OptionPicker ---------- */

export interface OptionPickerItem<T extends string> {
  value: T;
  label: ReactNode;
  subLabel?: ReactNode;
}

export interface OptionPickerProps<T extends string> {
  items: OptionPickerItem<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Horizontal stacks the options vertically, as the kit's "Double Horizontal" does. */
  direction?: 'row' | 'column';
  label?: string;
  className?: string;
}

const OptionPickerRoot = styled.div<{ $column: boolean }>`
  ${({ theme: t, $column }) => css`
    display: flex;
    gap: ${t.spacing[200]};
    box-sizing: border-box;
    width: 100%;
    padding: ${t.spacing[300]} ${t.spacing[400]};
    ${$column && 'flex-direction: column;'}

    > ${OptionRoot} {
      flex: 1 1 0;
      min-width: 0;
    }
  `}
`;

/** DIMI UI KIT "Control/OptionPicker". */
export function OptionPicker<T extends string>({
  items,
  value,
  onChange,
  direction = 'row',
  label,
  className,
}: OptionPickerProps<T>) {
  return (
    <OptionPickerRoot
      className={className}
      $column={direction === 'column'}
      role="radiogroup"
      aria-label={label}
    >
      {items.map((item) => (
        <Option
          key={item.value}
          selected={item.value === value}
          subLabel={item.subLabel}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Option>
      ))}
    </OptionPickerRoot>
  );
}

/* ---------- Input/InputField ---------- */

export interface InputFieldProps extends Omit<InputProps, 'title'> {
  title?: ReactNode;
  /** Helper text under the input. Shown in Negative when `error` is set. */
  subLabel?: ReactNode;
}

const InputFieldGroup = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    padding: ${t.spacing[200]} ${t.spacing[400]};
  `}
`;

const InputFieldTitle = styled.label`
  ${({ theme: t }) => css`
    ${t.text.calloutRegular}
    padding: 0 ${t.spacing[100]} ${t.spacing[200]};
    color: ${t.colors.core.glyph.secondary};
  `}
`;

const InputFieldSub = styled.p<{ $error?: boolean }>`
  ${({ theme: t, $error }) => css`
    ${t.text.footnoteWeak}
    margin: 0;
    padding: ${t.spacing[200]} ${t.spacing[100]} 0;
    color: ${$error ? t.colors.core.status.negative : t.colors.core.glyph.quaternary};
  `}
`;

const InputFieldRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[200]};

  > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;

/** DIMI UI KIT "Input/InputField" (Type=Single): title, input and helper text. */
export function InputField({
  title,
  subLabel,
  error,
  id,
  className,
  ...rest
}: InputFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = subLabel ? `${inputId}-help` : undefined;
  return (
    <InputFieldGroup className={className}>
      {title && <InputFieldTitle htmlFor={inputId}>{title}</InputFieldTitle>}
      <Input id={inputId} error={error} aria-describedby={helpId} {...rest} />
      {subLabel && (
        <InputFieldSub id={helpId} $error={error}>
          {subLabel}
        </InputFieldSub>
      )}
    </InputFieldGroup>
  );
}

export interface InputFieldDoubleProps {
  title?: ReactNode;
  subLabel?: ReactNode;
  first: InputProps & { 'aria-label': string };
  second: InputProps & { 'aria-label': string };
  className?: string;
}

/** DIMI UI KIT "Input/InputField" (Type=Double): two inputs side by side. */
export function InputFieldDouble({
  title,
  subLabel,
  first,
  second,
  className,
}: InputFieldDoubleProps) {
  return (
    <InputFieldGroup className={className} role="group">
      {title && <InputFieldTitle as="span">{title}</InputFieldTitle>}
      <InputFieldRow>
        <Input {...first} />
        <Input {...second} />
      </InputFieldRow>
      {subLabel && <InputFieldSub as="span">{subLabel}</InputFieldSub>}
    </InputFieldGroup>
  );
}

/* ---------- Inform/Toast ---------- */

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  icon?: KitIcon;
  children: ReactNode;
}

const ToastRoot = styled.div`
  ${({ theme: t }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${t.spacing[200]};
    box-sizing: border-box;
    padding: ${t.spacing[300]} ${t.spacing[550]};
    border-radius: ${t.radius.circle};
    background: ${t.colors.components.fill.primary};
    box-shadow:
      inset 0 0 0 1px ${t.colors.core.outline},
      ${t.shadow.floating};
    color: ${t.colors.core.glyph.primary};
  `}
`;

/** DIMI UI KIT "Inform/Toast". Positioning and timing are up to the caller. */
export function Toast({ icon, children, ...rest }: ToastProps) {
  return (
    <ToastRoot role="status" {...rest}>
      {icon && <Icon icon={icon} size={24} />}
      <Text $style="calloutRegular">{children}</Text>
    </ToastRoot>
  );
}

/* ---------- Inform/Header ---------- */

export interface HeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'content'
> {
  size?: 'large' | 'small';
  subTitle?: ReactNode;
  title: ReactNode;
  content?: ReactNode;
  /** Heading level for the title. */
  as?: 'h1' | 'h2' | 'h3';
}

const HeaderRoot = styled.header`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[100]};
    box-sizing: border-box;
    width: 100%;
    padding: ${t.spacing[300]} ${t.spacing[500]};
  `}
`;

const HeaderSub = styled.span<{ $style: KitTextStyle }>`
  ${({ theme: t, $style }) => css`
    ${t.text[$style]}
    color: ${t.colors.core.glyph.secondary};
  `}
`;

const HeaderTitle = styled.h2<{ $style: KitTextStyle }>`
  ${({ theme: t, $style }) => css`
    ${t.text[$style]}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

const HeaderContent = styled.p<{ $style: KitTextStyle }>`
  ${({ theme: t, $style }) => css`
    ${t.text[$style]}
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

/** DIMI UI KIT "Inform/Header". */
export function Header({
  size = 'large',
  subTitle,
  title,
  content,
  as: heading = 'h2',
  ...rest
}: HeaderProps) {
  const large = size === 'large';
  return (
    <HeaderRoot {...rest}>
      {subTitle && (
        <HeaderSub $style={large ? 'footnoteWeak' : 'captionWeak'}>
          {subTitle}
        </HeaderSub>
      )}
      <HeaderTitle
        as={heading}
        $style={large ? 'headlineStrong' : 'bodyStrong'}
      >
        {title}
      </HeaderTitle>
      {content && (
        <HeaderContent $style={large ? 'paragraphLarge' : 'paragraphSmall'}>
          {content}
        </HeaderContent>
      )}
    </HeaderRoot>
  );
}

/* ---------- Inform/SectionHeader ---------- */

export interface SectionHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  size?: 'small' | 'medium' | 'large';
  title: ReactNode;
  leftIcon?: KitIcon;
  rightIcon?: KitIcon;
  /** Type=Value: text on the right. */
  value?: ReactNode;
  /** Type=Custom: any element on the right (e.g. a TextButton). */
  trailing?: ReactNode;
  as?: 'h2' | 'h3' | 'h4';
}

type SectionSize = 'small' | 'medium' | 'large';

const SectionHeaderRoot = styled.div<{ $size: SectionSize }>`
  ${({ theme: t, $size }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};
    box-sizing: border-box;
    width: 100%;
    padding: ${{ small: t.spacing[100], medium: t.spacing[400], large: t.spacing[500] }[$size]}
      ${t.spacing[500]};
  `}
`;

const SectionHeaderTitle = styled.h2<{ $size: SectionSize }>`
  ${({ theme: t, $size }) => css`
    ${
      $size === 'large'
        ? t.text.titleStrong
        : $size === 'medium'
          ? t.text.headlineStrong
          : t.text.calloutRegular
    }
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    gap: ${$size === 'small' ? t.spacing[200] : t.spacing[300]};
    margin: 0;
    color: ${$size === 'small' ? t.colors.core.glyph.secondary : t.colors.core.glyph.primary};
  `}
`;

const SectionHeaderValue = styled.span<{ $size: SectionSize }>`
  ${({ theme: t, $size }) => css`
    ${$size === 'small' ? t.text.footnoteWeak : t.text.calloutRegular}
    flex: none;
    color: ${$size === 'small' ? t.colors.core.glyph.tertiary : t.colors.core.status.accent};
  `}
`;

const SectionHeaderTrailing = styled.span`
  display: inline-flex;
  flex: none;
`;

/** DIMI UI KIT "Inform/SectionHeader". */
export function SectionHeader({
  size = 'medium',
  title,
  leftIcon,
  rightIcon,
  value,
  trailing,
  as: heading = 'h2',
  ...rest
}: SectionHeaderProps) {
  return (
    <SectionHeaderRoot $size={size} {...rest}>
      <IconSize value={size === 'large' ? 20 : 16}>
        <SectionHeaderTitle as={heading} $size={size}>
          {leftIcon && <Icon icon={leftIcon} />}
          {title}
          {rightIcon && <Icon icon={rightIcon} />}
        </SectionHeaderTitle>
        {value !== undefined && (
          <SectionHeaderValue $size={size}>{value}</SectionHeaderValue>
        )}
        {trailing && (
          <IconSize value={20}>
            <SectionHeaderTrailing>{trailing}</SectionHeaderTrailing>
          </IconSize>
        )}
      </IconSize>
    </SectionHeaderRoot>
  );
}

/* ---------- List/ValueList ---------- */

type ValueTheme = 'outlined' | 'active' | 'disabled';

const ValueListRoot = styled.div`
  ${({ theme: t }) => css`
    box-sizing: border-box;
    width: 100%;
    padding: ${t.spacing[200]} ${t.spacing[400]};
  `}
`;

interface ValueCardProps {
  $row: boolean;
  $theme: ValueTheme;
}

const valueCardStyles = (
  t: DefaultTheme,
  { $row, $theme }: ValueCardProps,
) => css`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: ${t.spacing[400]} ${t.spacing[500]};
  border-radius: ${t.radius.m};
  background: ${t.colors.components.fill.primary};
  box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
  text-align: left;
  ${
    $row
      ? css`
          align-items: center;
          gap: ${t.spacing[300]};
        `
      : css`
          flex-direction: column;
          gap: ${t.spacing[150]};
        `
  }
  ${
    $theme === 'active' &&
    css`
      background: ${t.colors.core.status.accent};
      box-shadow: inset 0 0 0 1px ${t.colors.core.status.accent};
    `
  }
    ${
    $theme === 'disabled' &&
    css`
      background: ${t.colors.components.translucent.tertiary};
      box-shadow: none;
    `
  }
`;

const ValueListCard = styled.div<ValueCardProps>`
  ${({ theme, ...p }) => valueCardStyles(theme, p)}
`;

const ValueListButton = styled.button<ValueCardProps>`
  ${({ theme: t, ...p }) => css`
    ${interactive(t)}
    ${resetButton}
    ${valueCardStyles(t, p)}
  `}
`;

interface ValuePartProps {
  $style: KitTextStyle;
  $theme: ValueTheme;
}

const valueColor = (
  t: DefaultTheme,
  theme: ValueTheme,
  normal: string,
  disabled: string,
) =>
  theme === 'active'
    ? t.colors.core.onColor.primary
    : theme === 'disabled'
      ? disabled
      : normal;

const ValueListHead = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[300]};
`;

const ValueListTitle = styled.span<ValuePartProps>`
  ${({ theme: t, $style, $theme }) => css`
    ${t.text[$style]}
    flex: 1;
    min-width: 0;
    color: ${valueColor(t, $theme, t.colors.core.glyph.primary, t.colors.core.glyph.tertiary)};
  `}
`;

const ValueListSub = styled.span<ValuePartProps>`
  ${({ theme: t, $style, $theme }) => css`
    ${t.text[$style]}
    flex: none;
    color: ${valueColor(t, $theme, t.colors.core.glyph.tertiary, t.colors.core.glyph.quaternary)};
  `}
`;

const ValueListContent = styled.span<ValuePartProps & { $strong?: boolean }>`
  ${({ theme: t, $style, $theme, $strong }) => css`
    ${t.text[$style]}
    color: ${valueColor(t, $theme, t.colors.core.glyph.secondary, t.colors.core.glyph.quaternary)};
    ${$strong && `font-weight: ${t.font.weight.strong};`}
  `}
`;

export interface ValueListProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'title' | 'content'
> {
  /** Horizontal: one line (sub-title, title, value). Vertical: title row over a paragraph. */
  direction?: 'row' | 'column';
  /** Outlined (default), Active (accent fill) or Disabled. */
  theme?: ValueTheme;
  title: ReactNode;
  subTitle?: ReactNode;
  content?: ReactNode;
}

/** DIMI UI KIT "List/ValueList". Renders a button when onClick is given, else a plain block. */
export function ValueList({
  direction = 'row',
  theme = 'outlined',
  title,
  subTitle,
  content,
  className,
  onClick,
  ...rest
}: ValueListProps) {
  const row = direction === 'row';
  const body = row ? (
    <>
      {subTitle && (
        <ValueListSub $style="calloutWeak" $theme={theme}>
          {subTitle}
        </ValueListSub>
      )}
      <ValueListTitle $style="bodyStrong" $theme={theme}>
        {title}
      </ValueListTitle>
      {content && (
        <ValueListContent
          $style="calloutRegular"
          $theme={theme}
          $strong={theme === 'active'}
        >
          {content}
        </ValueListContent>
      )}
    </>
  ) : (
    <>
      <ValueListHead>
        <ValueListTitle $style="headlineStrong" $theme={theme}>
          {title}
        </ValueListTitle>
        {subTitle && (
          <ValueListSub $style="footnoteWeak" $theme={theme}>
            {subTitle}
          </ValueListSub>
        )}
      </ValueListHead>
      {content && (
        <ValueListContent $style="paragraphSmall" $theme={theme}>
          {content}
        </ValueListContent>
      )}
    </>
  );
  return (
    <ValueListRoot className={className}>
      {onClick ? (
        <ValueListButton
          type="button"
          disabled={theme === 'disabled'}
          aria-pressed={theme === 'active'}
          onClick={onClick}
          $row={row}
          $theme={theme}
          {...rest}
        >
          {body}
        </ValueListButton>
      ) : (
        <ValueListCard $row={row} $theme={theme}>
          {body}
        </ValueListCard>
      )}
    </ValueListRoot>
  );
}

/* ---------- List/ItemList ---------- */

const itemListStyles = (t: DefaultTheme, large: boolean) => css`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: ${t.spacing[400]} ${t.spacing[400]} ${t.spacing[400]}
    ${t.spacing[500]};
  text-align: left;
  gap: ${large ? t.spacing[400] : t.spacing[300]};
`;

const ItemListRoot = styled.div<{ $large: boolean }>`
  ${({ theme, $large }) => itemListStyles(theme, $large)}
`;

const ItemListButton = styled.button<{ $large: boolean }>`
  ${({ theme: t, $large }) => css`
    ${interactive(t)}
    ${resetButton}
    ${itemListStyles(t, $large)}
  `}
`;

const ItemListLeading = styled.span`
  display: inline-flex;
  flex: none;
  color: ${({ theme }) => theme.colors.core.glyph.primary};
`;

const ItemListBody = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing[50]};
`;

const ItemListText = styled.span<{ $style: KitTextStyle; $title?: boolean }>`
  ${({ theme: t, $style, $title }) => css`
    ${t.text[$style]}
    color: ${$title ? t.colors.core.glyph.primary : t.colors.core.glyph.secondary};
  `}
`;

const ItemListTrailing = styled.span`
  display: inline-flex;
  flex: none;
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
`;

export interface ItemListProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'content'
> {
  size?: 'large' | 'small';
  title: ReactNode;
  subTitle?: ReactNode;
  content?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}

/** DIMI UI KIT "List/ItemList". */
export function ItemList({
  size = 'large',
  title,
  subTitle,
  content,
  leading,
  trailing,
  onClick,
  className,
  ...rest
}: ItemListProps) {
  const large = size === 'large';
  const inner = (
    <>
      {leading && (
        <IconSize value={large ? 28 : 24}>
          <ItemListLeading>{leading}</ItemListLeading>
        </IconSize>
      )}
      <ItemListBody>
        {subTitle && (
          <ItemListText $style={large ? 'calloutRegular' : 'footnoteWeak'}>
            {subTitle}
          </ItemListText>
        )}
        <ItemListText $style={large ? 'headlineStrong' : 'bodyStrong'} $title>
          {title}
        </ItemListText>
        {content && (
          <ItemListText $style={large ? 'paragraphLarge' : 'paragraphSmall'}>
            {content}
          </ItemListText>
        )}
      </ItemListBody>
      {trailing && (
        <IconSize value={large ? 24 : 20}>
          <ItemListTrailing>{trailing}</ItemListTrailing>
        </IconSize>
      )}
    </>
  );
  return onClick ? (
    <ItemListButton
      type="button"
      className={className}
      $large={large}
      onClick={onClick}
    >
      {inner}
    </ItemListButton>
  ) : (
    <ItemListRoot className={className} $large={large} {...rest}>
      {inner}
    </ItemListRoot>
  );
}

/* ---------- Button/ButtonGroup and Button/ActionButton ---------- */

const ButtonGroupRoot = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[200]};
    box-sizing: border-box;
    width: 100%;
    padding: ${t.spacing[300]} ${t.spacing[400]};
  `}
`;

const ButtonGroupRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[200]};

  > ${ButtonRoot} {
    flex: 1 1 0;
    min-width: 0;
  }
`;

const ButtonGroupSub = styled.span`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    padding: ${t.spacing[100]} ${t.spacing[100]} 0;
    color: ${t.colors.core.glyph.secondary};
  `}
`;

export interface ButtonGroupProps {
  /** Buttons in order. Their size/theme/variant are fixed by the group type. */
  buttons: Array<Omit<ButtonProps, 'size' | 'theme' | 'variant' | 'fullWidth'>>;
  /** Vertical stacks each button on its own row ("Double Horizontal" in the kit). */
  direction?: 'row' | 'column';
  subLabel?: ReactNode;
  className?: string;
}

/** DIMI UI KIT "Button/ButtonGroup": Medium · Grayscale · Secondary buttons with an optional sub-label. */
export function ButtonGroup({
  buttons,
  direction = 'row',
  subLabel,
  className,
}: ButtonGroupProps) {
  const items = buttons.map((b, i) => (
    <Button
      key={i}
      size="medium"
      theme="grayscale"
      variant="secondary"
      fullWidth
      {...b}
    />
  ));
  return (
    <ButtonGroupRoot className={className}>
      {direction === 'row' ? <ButtonGroupRow>{items}</ButtonGroupRow> : items}
      {subLabel && <ButtonGroupSub>{subLabel}</ButtonGroupSub>}
    </ButtonGroupRoot>
  );
}

export interface ActionButtonProps {
  primary: Omit<ButtonProps, 'size' | 'theme' | 'variant' | 'fullWidth'>;
  secondary?: Omit<ButtonProps, 'size' | 'theme' | 'variant' | 'fullWidth'>;
  direction?: 'row' | 'column';
  subLabel?: ReactNode;
  className?: string;
}

/** DIMI UI KIT "Button/ActionButton": the Large Accent call to action, optionally with a secondary. */
export function ActionButton({
  primary,
  secondary,
  direction = 'row',
  subLabel,
  className,
}: ActionButtonProps) {
  const main = (
    <Button
      size="large"
      theme="accent"
      variant="primary"
      fullWidth
      {...primary}
    />
  );
  const alt = secondary && (
    <Button
      size="large"
      theme="accent"
      variant="secondary"
      fullWidth
      {...secondary}
    />
  );
  return (
    <ButtonGroupRoot className={className}>
      {direction === 'row' && alt ? (
        <ButtonGroupRow>
          {main}
          {alt}
        </ButtonGroupRow>
      ) : (
        <>
          {main}
          {alt}
        </>
      )}
      {subLabel && <ButtonGroupSub>{subLabel}</ButtonGroupSub>}
    </ButtonGroupRoot>
  );
}

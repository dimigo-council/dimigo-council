/**
 * DIMI UI KIT for React — theme, text styles, icons, brand marks, atoms and molecules,
 * copied from the kit's Figma file (uZ34cJKP9YvpxDijYhRiSZ). Styled with styled-components.
 *
 * Wrap the app once:
 *   <KitThemeProvider>
 *     <KitGlobalStyle />
 *     …
 *   </KitThemeProvider>
 *
 * Regenerate after the kit changes:
 *   node scripts/gen-kit-tokens.mjs && npx prettier --write src/dimi-ui-kit/theme.generated.ts
 *   node scripts/gen-kit-assets.mjs <kit-assets.json from the "DIMI Kit Export" plugin>
 */
export {
  createKitTheme,
  textStyle,
  type KitTheme,
  type KitMode,
  type KitColors,
  type KitTextScale,
  type KitTextStyle,
} from './theme';
export {
  KitThemeProvider,
  type KitThemeProviderProps,
} from './KitThemeProvider';
export { useKitTheme, type KitThemeControls } from './KitThemeContext';
export { KitGlobalStyle } from './GlobalStyle';
export { Text } from './Text';
export { IconSize } from './IconSize';
export { interactive, resetButton, type InteractiveOptions } from './styles';
export { Icon, IconSvg, type IconProps } from './Icon';
export type { KitIcon } from './icon-type';
// Icons are separate named exports: import { iconSearch } from './dimi-ui-kit/icons'.
export {
  BrandMark,
  LogoCouncil,
  SymbolCouncil,
  SymbolDimigo,
  SymbolDimigoin,
  type BrandMarkProps,
} from './Brand';
export {
  Button,
  ButtonRoot,
  TextButton,
  IconButton,
  buttonStyles,
  textButtonStyles,
  type ButtonLook,
  type TextButtonLook,
  type ButtonProps,
  type TextButtonProps,
  type IconButtonProps,
} from './Button';
export {
  Badge,
  BadgeRoot,
  Chip,
  chipStyles,
  type ChipLook,
  type BadgeProps,
  type ChipProps,
} from './Badge';
export {
  Input,
  InputBox,
  InputControl,
  TextArea,
  TextAreaControl,
  inputBoxStyles,
  inputFieldStyles,
  type InputBoxLook,
  type InputProps,
  type TextAreaProps,
} from './Input';
export {
  Control,
  ControlRoot,
  controlStyles,
  controlCheckedStyles,
  type ControlLook,
  type ControlProps,
  type ControlType,
} from './Control';
export {
  Avatar,
  AvatarRoot,
  Divider,
  Option,
  OptionRoot,
  Segment,
  SegmentRoot,
  segmentStyles,
  segmentSelectedStyles,
  type SegmentLook,
  type AvatarProps,
  type DividerProps,
  type OptionProps,
  type SegmentProps,
} from './Misc';
export {
  NavigationBar,
  SegmentedControl,
  segmentedTrackStyles,
  OptionPicker,
  InputField,
  InputFieldDouble,
  Toast,
  Header,
  SectionHeader,
  ValueList,
  ItemList,
  ButtonGroup,
  ActionButton,
  type NavigationBarProps,
  type SegmentedControlProps,
  type OptionPickerProps,
  type InputFieldProps,
  type InputFieldDoubleProps,
  type ToastProps,
  type HeaderProps,
  type SectionHeaderProps,
  type ValueListProps,
  type ItemListProps,
  type ButtonGroupProps,
  type ActionButtonProps,
} from './Molecules';

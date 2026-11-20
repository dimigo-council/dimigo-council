import styled from 'styled-components';
import type { KitTextStyle } from './theme';

/**
 * Text in one of the 23 kit text styles: `<Text $style="bodyStrong">`, or `<Text as="h2" …>`.
 * Inside a styled component, interpolate `theme.text.bodyStrong` (or `textStyle('bodyStrong')`).
 */
export const Text = styled.span<{ $style: KitTextStyle }>`
  ${({ theme, $style }) => theme.text[$style]}
`;

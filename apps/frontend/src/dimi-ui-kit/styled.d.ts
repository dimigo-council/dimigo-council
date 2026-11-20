import 'styled-components';
import type { KitTheme } from './theme';

declare module 'styled-components' {
  // The kit theme is the only theme in the app.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends KitTheme {}
}

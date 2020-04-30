import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    accentColor: string;
    backgroundColor: string;
    borderColor: string;
    modalOverlayColor: string;
    mutedTextColor: string;
    panelBackgroundColor: string;
    shadowColor: string;
    textColor: string;
  }
}

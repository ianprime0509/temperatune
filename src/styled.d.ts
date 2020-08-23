import "styled-components";

import { FontSize } from "./theme";

declare module "styled-components" {
  export interface DefaultTheme {
    accentColor: string;
    backgroundColor: string;
    borderColor: string;
    linkColor: string;
    linkVisitedColor: string;
    modalOverlayColor: string;
    mutedTextColor: string;
    panelBackgroundColor: string;
    shadowColor: string;
    textColor: string;
    tuneBackgroundLuminosity: string;
    fontSizes: Record<FontSize, number>;
  }
}

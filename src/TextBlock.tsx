import styled from "styled-components/macro";

import { FontSize } from "./theme";

export interface TextBlockProps {
  align?: "left" | "center" | "right";
  fontSize?: FontSize;
  selectable?: boolean;
}

/** A block element that displays text. */
const TextBlock = styled.div<TextBlockProps>`
  font-size: ${({ fontSize = "normal", theme }) =>
    `${theme.fontSizes[fontSize]}rem`};
  min-height: ${({ fontSize = "normal", theme }) =>
    `${theme.fontSizes[fontSize] * 1.25}rem`};
  text-align: ${({ align = "center" }) => align};
  user-select: ${({ selectable = true }) => (selectable ? "auto" : "none")};
`;

export default TextBlock;

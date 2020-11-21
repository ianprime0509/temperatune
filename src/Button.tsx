import styled, { css } from "styled-components/macro";

import { FontSize } from "./theme";

export interface ButtonProps {
  fontSize?: FontSize;
  isHoverable?: boolean;
  isSelected?: boolean;

  onClick?: () => void;

  [k: string]: any;
}

const hoverStyle = css<{ isSelected?: boolean }>`
  &:hover {
    background: ${({ isSelected = false, theme }) =>
      isSelected ? theme.accentColor : theme.shadowColor};
  }
`;

/** A button with a uniform look and feel. */
export const Button = styled.button<ButtonProps>`
  align-items: center;
  background: ${({ isSelected = false, theme }) =>
    isSelected ? theme.accentColor : "transparent"};
  border: none;
  color: ${({ theme }) => theme.textColor};
  cursor: pointer;
  display: flex;
  font-size: ${({ fontSize = "normal", theme }) =>
    `${theme.fontSizes[fontSize]}rem`};
  justify-content: center;
  line-height: ${({ fontSize = "normal", theme }) =>
    `${theme.fontSizes[fontSize]}rem`};
  margin: 0;
  outline: none;
  padding: 0.5rem;
  transition: background 200ms;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  ${({ isHoverable = true }) => isHoverable && hoverStyle}

  &:focus {
    filter: drop-shadow(0 0 6px ${({ theme }) => theme.accentColor});
  }

  &::-moz-focus-inner {
    border: none;
  }
`;

/**
 * A button label, for situations where there are other elements within the
 * button besides just the label.
 */
export const ButtonLabel = styled.div`
  flex-grow: 1;
`;

/** A button for use in a vertical list. */
export const ListButton = styled(Button)<ButtonProps>`
  justify-content: flex-start;
  text-align: start;
  width: 100%;
`;

export interface ButtonGroupProps {
  columns?: number;
}

/** A group of buttons in a grid pattern. */
export const ButtonGroup = styled.div<ButtonGroupProps>`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(
    ${({ columns }) => columns ?? "auto-fill"},
    minmax(10ch, 1fr)
  );
  padding: 1rem;
`;

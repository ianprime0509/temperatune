import styled, { css } from "styled-components/macro";

interface ButtonProps {
  fontSizeRem?: number;
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

/** The base button component without any border or focus settings. */
const BaseButton = styled.button<ButtonProps>`
  align-items: center;
  background: ${({ isSelected = false, theme }) =>
    isSelected ? theme.accentColor : "transparent"};
  color: ${({ theme }) => theme.textColor};
  cursor: pointer;
  display: flex;
  font-size: ${({ fontSizeRem = 1 }) => `${fontSizeRem}rem`};
  justify-content: center;
  line-height: ${({ fontSizeRem = 1 }) => `${fontSizeRem}rem`};
  margin: 0;
  outline: none;
  padding: 0;
  transition: background 200ms;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  ${({ isHoverable = true }) => isHoverable && hoverStyle}

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

/** An unbordered button. */
export const Button = styled(BaseButton)<ButtonProps>`
  border: none;

  &:focus {
    filter: drop-shadow(0 0 6px ${({ theme }) => theme.accentColor});
  }
`;

/** A bordered button. */
export const BorderedButton = styled(BaseButton)<ButtonProps>`
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 0.5rem;

  &:focus {
    box-shadow: 0 0 12px ${({ theme }) => theme.accentColor};
  }
`;

/** A button for use in a vertical list. */
export const ListButton = styled(BaseButton)<ButtonProps>`
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  border-left: 5px solid transparent;
  border-right: none;
  border-top: none;
  justify-content: flex-start;
  padding: 0.5rem 0 0.5rem 0.5rem;
  text-align: start;
  width: 100%;

  &:focus {
    border-left: 5px solid ${({ theme }) => theme.accentColor};
  }
`;

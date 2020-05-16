/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import styled, { css } from "styled-components/macro";

interface ButtonProps {
  fontSizeRem: number;
  isHoverable: boolean;
  isSelected: boolean;

  onClick?: () => void;

  [k: string]: any;
}

const buttonDefaultProps = {
  fontSizeRem: 1,
  isHoverable: true,
  isSelected: false,
};

const hoverStyle = css<{ isSelected: boolean }>`
  &:hover {
    background: ${({ isSelected, theme }) =>
      isSelected ? theme.accentColor : theme.shadowColor};
  }
`;

/** The base button component without any border or focus settings. */
const BaseButton = styled.button<ButtonProps>`
  align-items: center;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.accentColor : "transparent"};
  color: ${({ theme }) => theme.textColor};
  cursor: pointer;
  display: flex;
  font-size: ${({ fontSizeRem }) => `${fontSizeRem}rem`};
  justify-content: center;
  line-height: ${({ fontSizeRem }) => `${fontSizeRem}rem`};
  margin: 0;
  outline: none;
  padding: 0;
  transition: background 200ms;

  ${({ isHoverable }) => isHoverable && hoverStyle}

  &::-moz-focus-inner {
    border: none;
  }
`;

BaseButton.defaultProps = buttonDefaultProps;

/**
 * A button label, for situations where there are other elements within the
 * button besides just the label.
 */
export const ButtonLabel = styled.div`
  flex: 1 1;
`;

/** An unbordered button. */
export const Button = styled(BaseButton)<ButtonProps>`
  border: none;

  &:focus {
    filter: drop-shadow(0 0 6px ${({ theme }) => theme.accentColor});
  }
`;

Button.defaultProps = buttonDefaultProps;

/** A bordered button. */
export const BorderedButton = styled(BaseButton)<ButtonProps>`
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 0.5rem;

  &:focus {
    box-shadow: 0 0 12px ${({ theme }) => theme.accentColor};
  }
`;

BorderedButton.defaultProps = buttonDefaultProps;

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

/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { ForwardRefExoticComponent, forwardRef, Ref } from 'react';

import './Button.css';

interface ButtonProps {
  fontSizeRem?: number;
  hasBorder?: boolean;
  isFocusable?: boolean;
  isSelected?: boolean;
  label: string;

  onClick?: () => void;

  [k: string]: any;
}

/** A reusable button component with a consistent style. */
const Button: ForwardRefExoticComponent<
  ButtonProps & { ref?: Ref<HTMLDivElement> }
> = forwardRef(
  (
    {
      fontSizeRem = 1,
      hasBorder = false,
      isFocusable = true,
      isSelected = false,
      label,
      onClick,
      ...rest
    },
    forwardedRef
  ) => {
    let fontSize = String(fontSizeRem) + 'rem';

    let className = 'Button';
    if (hasBorder) {
      className += ' bordered';
    }
    if (isSelected) {
      className += ' selected';
    }

    return (
      <div
        ref={forwardedRef}
        role="button"
        className={className}
        style={{ fontSize, lineHeight: fontSize }}
        tabIndex={isFocusable ? 0 : -1}
        onClick={onClick}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick && onClick();
          }
        }}
        {...rest}
      >
        {label}
      </div>
    );
  }
);

export default Button;

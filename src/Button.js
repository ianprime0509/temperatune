/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Button.css';

/** A reusable button component with a consistent style. */
export default class Button extends Component {
  focus() {
    this.innerDiv.focus();
  }

  render() {
    let {
      fontSizeRem,
      hasBorder,
      isFocusable,
      isSelected,
      label,
      onClick,
      ...rest
    } = this.props;
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
        ref={ref => (this.innerDiv = ref)}
        className={className}
        onClick={onClick}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick && onClick();
          }
        }}
        style={{ fontSize, lineHeight: fontSize }}
        tabIndex={isFocusable ? 0 : -1}
        {...rest}
      >
        {label}
      </div>
    );
  }
}

Button.propTypes = {
  fontSizeRem: PropTypes.number,
  hasBorder: PropTypes.bool,
  isFocusable: PropTypes.bool,
  isSelected: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  fontSizeRem: 1,
  hasBorder: false,
  isFocusable: true,
  isSelected: false,
};

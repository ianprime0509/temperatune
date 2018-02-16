/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React from 'react';
import PropTypes from 'prop-types';

import './Button.css';

/** A reusable button component with a consistent style. */
export default function Button(props) {
  let { isFocusable, isSelected, label, onClick, ...rest } = props;

  let className = 'Button';
  if (isSelected) {
    className += ' selected';
  }

  return (
    <div
      className={className}
      onClick={onClick}
      onKeyPress={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick && onClick();
        }
      }}
      tabIndex={isFocusable ? 0 : -1}
      {...rest}
    >
      {label}
    </div>
  );
}

Button.propTypes = {
  isFocusable: PropTypes.bool,
  isSelected: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

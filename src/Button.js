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
  let className = 'Button';
  if (props.isSelected) {
    className += ' selected';
  }

  return (
    <div className={className} onClick={props.onClick}>
      {props.label}
    </div>
  );
}

Button.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

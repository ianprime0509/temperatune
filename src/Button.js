import React from 'react';
import PropTypes from 'prop-types';

import './Button.css';

/** A reusable button component with a consistent style. */
function Button(props) {
  return (
    <div className="Button" onClick={props.onClick}>
      {props.children}
    </div>
  );
}

Button.propTypes = {
  children: PropTypes.element,
  onClick: PropTypes.func,
};

export default Button;

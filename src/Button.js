import React from 'react';
import PropTypes from 'prop-types';

import './Button.css';

/** A reusable button component with a consistent style. */
function Button(props) {
  return (
    <div className="Button">
      {props.children}
    </div>
  );
}

Button.propTypes = {
  children: PropTypes.element,
};

export default Button;

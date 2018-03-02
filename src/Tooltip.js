import React from 'react';
import { Popper, Arrow } from 'react-popper';
import PropTypes from 'prop-types';

import './Tooltip.css';

export default function Tooltip(props) {
  let { children, isOpen, ...rest } = props;

  if (isOpen) {
    return (
      <Popper className="Tooltip" placement="top" {...rest}>
        {children}
        <Arrow className="Tooltip-arrow" />
      </Popper>
    );
  } else {
    return null;
  }
}

Tooltip.propTypes = {
  children: PropTypes.node,
  isOpen: PropTypes.bool.isRequired,
};

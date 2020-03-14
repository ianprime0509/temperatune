import React from 'react';
import { Popper } from 'react-popper';
import PropTypes from 'prop-types';

import './Tooltip.css';

export default function Tooltip({ children, isOpen, ...rest }) {
  if (isOpen) {
    return (
      <Popper
        placement="top"
        modifiers={{
          preventOverflow: {
            boundariesElement: 'viewport',
          },
        }}
      >
        {({ ref, style, placement, arrowProps }) => (
          <div
            ref={ref}
            className="Tooltip"
            style={style}
            data-placement={placement}
            {...rest}
          >
            {children}
            <div
              ref={arrowProps.ref}
              className="Tooltip-arrow"
              style={arrowProps.style}
            />
          </div>
        )}
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

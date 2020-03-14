/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import './SettingsBar.css';

/**
 * The bottom part of the interface, showing the settings button and a button hi
 * to change between the pitch generator and analyser.
 */
export default function SettingsBar({
  isFocusable,
  onSettingsOpen,
  onViewFlip,
  switchIcon,
}) {
  return (
    <div className="SettingsBar">
      <FontAwesomeIcon
        role="button"
        className="SettingsBar-icon"
        icon={faCog}
        size="3x"
        onClick={onSettingsOpen}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSettingsOpen();
          }
        }}
        tabIndex={isFocusable ? 0 : -1}
      />
      <FontAwesomeIcon
        role="button"
        className="SettingsBar-icon"
        icon={switchIcon}
        size="3x"
        onClick={onViewFlip}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onViewFlip();
          }
        }}
        tabIndex={isFocusable ? 0 : -1}
      />
    </div>
  );
}

SettingsBar.propTypes = {
  isFocusable: PropTypes.bool,
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  /** The icon to show for the switch button. */
  switchIcon: PropTypes.object.isRequired,
};

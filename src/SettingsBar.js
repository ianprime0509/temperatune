/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/fontawesome-free-solid';

import './SettingsBar.css';

/**
 * The bottom part of the interface, showing the settings button and a button hi
 * to change between the pitch generator and analyser.
 */
export default function SettingsBar(props) {
  return (
    <div className="SettingsBar">
      <FontAwesomeIcon
        className="SettingsBar-icon"
        icon={faCog}
        size="3x"
        onClick={props.onSettingsOpen}
      />
      <FontAwesomeIcon
        className="SettingsBar-icon"
        icon={props.switchIcon}
        size="3x"
        onClick={props.onViewFlip}
      />
    </div>
  );
}

SettingsBar.propTypes = {
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  /** The icon to show for the switch button. */
  switchIcon: PropTypes.object.isRequired,
};

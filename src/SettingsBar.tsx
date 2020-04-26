/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, IconLookup } from '@fortawesome/free-solid-svg-icons';

import './SettingsBar.css';

interface SettingsBarProps {
  isFocusable: boolean;
  /** The icon to show for the switch button. */
  switchIcon: IconLookup;

  onSettingsOpen?: () => void;
  onViewFlip?: () => void;
}

/**
 * The bottom part of the interface, showing the settings button and a button hi
 * to change between the pitch generator and analyser.
 */
const SettingsBar: FC<SettingsBarProps> = ({
  isFocusable,
  switchIcon,
  onSettingsOpen,
  onViewFlip,
}) => (
  <div className="SettingsBar">
    <FontAwesomeIcon
      role="button"
      className="SettingsBar-icon"
      icon={faCog}
      size="3x"
      tabIndex={isFocusable ? 0 : -1}
      onClick={onSettingsOpen}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSettingsOpen && onSettingsOpen();
        }
      }}
    />
    <FontAwesomeIcon
      role="button"
      className="SettingsBar-icon"
      icon={switchIcon}
      size="3x"
      tabIndex={isFocusable ? 0 : -1}
      onClick={onViewFlip}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onViewFlip && onViewFlip();
        }
      }}
    />
  </div>
);

export default SettingsBar;

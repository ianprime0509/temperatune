import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/fontawesome-free-solid';

import './SettingsBar.css';

/**
 * The bottom part of the interface, showing the settings button and a button hi
 * to change between the pitch generator and analyzer.
 */
function SettingsBar(props) {
  return (
    <div className="SettingsBar">
      <FontAwesomeIcon
        className="SettingsBar-icon"
        icon={faCog}
        size="3x"
        onClick={props.onOpenSettings}
      />
      <FontAwesomeIcon
        className="SettingsBar-icon"
        icon={props.switchIcon}
        size="3x"
        onClick={props.onFlipView}
      />
    </div>
  );
}

SettingsBar.propTypes = {
  onFlipView: PropTypes.func,
  onOpenSettings: PropTypes.func,
  /** The icon to show for the switch button. */
  switchIcon: PropTypes.object.isRequired,
};

export default SettingsBar;

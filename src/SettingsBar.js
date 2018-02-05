import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/fontawesome-free-solid';
import './SettingsBar.css';

/**
 * The bottom part of the interface, showing the settings button and a button
 * to change between the pitch generator and analyzer.
 */
class SettingsBar extends Component {
  render() {
    return (
      <div className="SettingsBar">
        <FontAwesomeIcon className="SettingsBar-icon" icon={faCog} size="3x" />
        <FontAwesomeIcon
          className="SettingsBar-icon"
          icon={this.props.switchIcon}
          size="3x"
        />
      </div>
    );
  }
}

SettingsBar.propTypes = {
  /** The icon to show for the switch button. */
  switchIcon: PropTypes.object.isRequired,
};

export default SettingsBar;

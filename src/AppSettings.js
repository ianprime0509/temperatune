/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './AppSettings.css';

/**
 * A item in a settings list with a consistent style.
 */
export function SettingsItem(props) {
  let className = 'SettingsItem';
  if (props.isSelected) {
    className += ' selected';
  }

  return (
    <div className={className} onClick={props.onClick}>
      {props.children}
    </div>
  );
}

SettingsItem.propTypes = {
  children: PropTypes.string,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

/**
 * A setting which can be clicked/tapped to expand a list of sub-settings.
 */
export class SettingsExpanderGroup extends Component {
  constructor() {
    super();
    this.state = {
      isExpanded: false,
    };
  }

  render() {
    let innerClassName = 'SettingsExpanderGroup-inner';
    if (this.state.isExpanded) {
      innerClassName += ' expanded';
    }

    return (
      <div>
        <SettingsItem
          isSelected={this.state.isExpanded}
          onClick={this._handleExpandToggle.bind(this)}
        >
          {this.props.label}
        </SettingsItem>
        <div className={innerClassName}>
          <div className="SettingsExpanderGroup-inner-bar" />
          <div className="SettingsExpanderGroup-inner-children">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }

  _handleExpandToggle() {
    this.setState(state => {
      return { isExpanded: !state.isExpanded };
    });
  }
}

SettingsExpanderGroup.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  label: PropTypes.string.isRequired,
};

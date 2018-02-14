/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/fontawesome-free-solid';

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
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
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

  handleExpandToggle() {
    this.setState(state => {
      return { isExpanded: !state.isExpanded };
    });
  }

  render() {
    let caretClassName = 'SettingsExpanderGroup-caret';
    if (this.state.isExpanded) {
      caretClassName += ' rotated';
    }
    let innerClassName = 'SettingsExpanderGroup-inner';
    if (this.state.isExpanded) {
      innerClassName += ' expanded';
    }

    return (
      <div>
        <SettingsItem onClick={this.handleExpandToggle.bind(this)}>
          <div className="SettingsExpanderGroup-label">
            <div className="SettingsExpanderGroup-label-text">
              {this.props.label}
            </div>
            <FontAwesomeIcon className={caretClassName} icon={faCaretRight} />
          </div>
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
}

SettingsExpanderGroup.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  label: PropTypes.string.isRequired,
};

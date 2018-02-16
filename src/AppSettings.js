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
  let { children, isFocusable, isSelected, onClick, ...rest } = props;

  let className = 'SettingsItem';
  if (isSelected) {
    className += ' selected';
  }

  return (
    <div
      className={className}
      onClick={onClick}
      onKeyPress={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick && onClick();
        }
      }}
      tabIndex={isFocusable ? 0 : -1}
      {...rest}
    >
      {children}
    </div>
  );
}

SettingsItem.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  isFocusable: PropTypes.bool,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
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
    let { children, isFocusable, label, ...rest } = this.props;

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
        <SettingsItem
          onClick={this.handleExpandToggle.bind(this)}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              this.handleExpandToggle();
            }
          }}
          tabIndex={isFocusable ? 0 : -1}
          {...rest}
        >
          <div className="SettingsExpanderGroup-label">
            <div className="SettingsExpanderGroup-label-text">{label}</div>
            <FontAwesomeIcon className={caretClassName} icon={faCaretRight} />
          </div>
        </SettingsItem>
        <div
          aria-expanded={this.state.isExpanded}
          aria-hidden={!this.state.isExpanded}
          className={innerClassName}
        >
          <div className="SettingsExpanderGroup-inner-bar" />
          <div className="SettingsExpanderGroup-inner-children">
            {React.Children.map(children, child => {
              return React.cloneElement(child, {
                isFocusable: isFocusable && this.state.isExpanded,
              });
            })}
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
  isFocusable: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

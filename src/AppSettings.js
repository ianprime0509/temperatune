/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Caret, Content as ExpandingContent } from './Expand';

import './AppSettings.css';

/**
 * A item in a settings list with a consistent style.
 */
export function SettingsItem(props) {
  let { children, isSelected, onClick, ...rest } = props;

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
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

/**
 * A settings item that, when clicked, opens a file selection dialog.
 */
export class SettingsFileChooser extends Component {
  handleFileSelect() {
    this.props.onFileSelect && this.props.onFileSelect(this.input.files[0]);
  }

  render() {
    let { label, onFileSelect, ...rest } = this.props;
    return (
      <SettingsItem onClick={() => this.input && this.input.click()} {...rest}>
        <input
          id="fileInput"
          ref={ref => (this.input = ref)}
          onChange={() => {
            this.handleFileSelect();
            this.input.value = '';
          }}
          style={{ height: 0, opacity: 0, width: 0 }}
          tabIndex={-1}
          type="file"
        />
        <span>{label}</span>
      </SettingsItem>
    );
  }
}

SettingsFileChooser.propTypes = {
  label: PropTypes.string.isRequired,
  /**
   * A function that will be called when a file is selected.  The `File` object
   * corresponding to the chosen file will be passed as the only object.
   */
  onFileSelect: PropTypes.func,
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
    let { children, label, ...rest } = this.props;

    return (
      <div>
        <SettingsItem
          aria-expanded={this.state.isExpanded}
          onClick={() => this.handleExpandToggle()}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              this.handleExpandToggle();
            }
          }}
          {...rest}
        >
          <div className="SettingsExpanderGroup-label">
            <div className="SettingsExpanderGroup-label-text">{label}</div>
            <Caret isExpanded={this.state.isExpanded} />
          </div>
        </SettingsItem>
        <ExpandingContent isExpanded={this.state.isExpanded}>
          {children}
        </ExpandingContent>
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

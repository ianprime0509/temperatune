/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import {
  Manager as PopperManager,
  Reference as PopperReference,
} from 'react-popper';
import PropTypes from 'prop-types';
import uniqueId from 'lodash.uniqueid';

import { Caret, Content as ExpandingContent } from './Expand';
import Tooltip from './Tooltip';

import './AppSettings.css';

/**
 * A item in a settings list with a consistent style.
 */
export class SettingsItem extends Component {
  constructor() {
    super();
    this.state = {
      isTooltipOpen: false,
    };
  }

  handleTooltipClose() {
    this.setState({ isTooltipOpen: false });
  }

  handleTooltipOpen() {
    this.setState({ isTooltipOpen: true });
  }

  render() {
    let { children, isSelected, onClick, tooltip, ...rest } = this.props;

    let className = 'SettingsItem';
    if (isSelected) {
      className += ' selected';
    }

    let shouldShowTooltip = !!tooltip && this.state.isTooltipOpen;
    let tooltipId = uniqueId('tooltip-');
    let targetRestProps = {};
    if (shouldShowTooltip) {
      targetRestProps['aria-describedby'] = tooltipId;
    }

    return (
      <PopperManager>
        <PopperReference>
          {({ ref }) => (
            <div
              ref={ref}
              className={className}
              onBlur={() => this.handleTooltipClose()}
              onClick={onClick}
              onFocus={() => this.handleTooltipOpen()}
              onKeyPress={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick && onClick();
                }
              }}
              onMouseEnter={() => this.handleTooltipOpen()}
              onMouseLeave={() => this.handleTooltipClose()}
              {...rest}
              {...targetRestProps}
            >
              {children}
            </div>
          )}
        </PopperReference>
        <Tooltip id={tooltipId} isOpen={shouldShowTooltip}>
          {tooltip}
        </Tooltip>
      </PopperManager>
    );
  }
}

SettingsItem.propTypes = {
  children: PropTypes.node,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  tooltip: PropTypes.string,
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

SettingsFileChooser.defaultProps = {
  tabIndex: 0,
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
  children: PropTypes.node,
  label: PropTypes.string.isRequired,
};

SettingsExpanderGroup.defaultProps = {
  tabIndex: 0,
};

/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useRef, useState } from 'react';
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
export function SettingsItem({
  children,
  isSelected,
  onClick,
  tooltip,
  ...rest
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  let className = 'SettingsItem';
  if (isSelected) {
    className += ' selected';
  }

  const shouldShowTooltip = !!tooltip && isTooltipOpen;
  const tooltipId = uniqueId('tooltip-');
  const targetRestProps = {};
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
            onBlur={() => setIsTooltipOpen(false)}
            onClick={onClick}
            onFocus={() => setIsTooltipOpen(true)}
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClick && onClick();
              }
            }}
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
            {...rest}
            {...targetRestProps}
          >
            {children}
          </div>
        )}
      </PopperReference>
      <Tooltip role="tooltip" id={tooltipId} isOpen={shouldShowTooltip}>
        {tooltip}
      </Tooltip>
    </PopperManager>
  );
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
export function SettingsFileChooser({ label, onFileSelect, ...rest }) {
  const inputRef = useRef(null);

  return (
    <SettingsItem
      onClick={() => inputRef.current && inputRef.current.click()}
      {...rest}
    >
      <input
        id="fileInput"
        ref={inputRef}
        onChange={() => {
          onFileSelect && onFileSelect(inputRef.current.files[0]);
          inputRef.current.value = '';
        }}
        style={{ height: 0, opacity: 0, width: 0 }}
        tabIndex={-1}
        type="file"
      />
      <span>{label}</span>
    </SettingsItem>
  );
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
export function SettingsExpanderGroup({ children, label, ...rest }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <SettingsItem
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsExpanded(!isExpanded);
          }
        }}
        {...rest}
      >
        <div className="SettingsExpanderGroup-label">
          <div className="SettingsExpanderGroup-label-text">{label}</div>
          <Caret isExpanded={isExpanded} />
        </div>
      </SettingsItem>
      <ExpandingContent isExpanded={isExpanded}>{children}</ExpandingContent>
    </div>
  );
}

SettingsExpanderGroup.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string.isRequired,
};

SettingsExpanderGroup.defaultProps = {
  tabIndex: 0,
};

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
import cloneDeep from 'lodash.clonedeep';
import uniqueId from 'lodash.uniqueid';

import AppError from './AppError';
import { Caret, Content as ExpandingContent } from './Expand';
import { Modal } from './Modal';
import Tooltip from './Tooltip';

import { version as VERSION } from '../package.json';

import './AppSettings.css';
import { Temperament } from 'temperament';

/** The app settings modal. */
export default function AppSettings({
  isOpen,
  onClose,
  onError,
  onTemperamentAdd,
  onTemperamentSelect,
  selectedTemperament,
  temperaments,
}) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} title="Settings">
      <div className="AppSettings-container">
        <ExpanderGroup label={`Temperament: ${selectedTemperament.name}`}>
          {temperaments.map((temperament) => (
            <SettingsItem
              key={temperament.name}
              isSelected={temperament.name === selectedTemperament.name}
              onClick={() => onTemperamentSelect(temperament)}
              tabIndex={0}
              tooltip={temperament.description}
            >
              {temperament.name}
            </SettingsItem>
          ))}
          <TemperamentFileChooser
            label="Choose file"
            onError={onError}
            onTemperamentSelect={onTemperamentAdd}
            tooltip="Add your own temperament."
          />
        </ExpanderGroup>
        <ReferencePitchChooser
          onTemperamentUpdate={onTemperamentSelect}
          selectedTemperament={selectedTemperament}
        />
        <ExpanderGroup label="About Temperatune">
          <p>Version: {VERSION}</p>
          <p>
            Temperatune is hosted on GitHub: you can browse its source code{' '}
            <a href="https://github.com/ianprime0509/temperatune">here</a>. For
            more information on defining your own temperaments, see{' '}
            <a href="https://github.com/ianprime0509/temperament/blob/master/README.md">
              this README
            </a>
            .
          </p>
        </ExpanderGroup>
      </div>
    </Modal>
  );
}

AppSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onTemperamentAdd: PropTypes.func.isRequired,
  onTemperamentSelect: PropTypes.func.isRequired,
  selectedTemperament: PropTypes.instanceOf(Temperament).isRequired,
  temperaments: PropTypes.arrayOf(PropTypes.instanceOf(Temperament)).isRequired,
};

/** A item in a settings list with a consistent style. */
function SettingsItem({ children, isSelected, onClick, tooltip, ...rest }) {
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
            onKeyPress={(e) => {
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

/** A settings item for choosing the reference pitch of the selected temperament. */
function ReferencePitchChooser({
  onTemperamentUpdate,
  selectedTemperament,
  ...rest
}) {
  const pitchInputRef = useRef(null);

  const handlePitchChange = () => {
    const pitchText = pitchInputRef.current.value.trim();
    if (/^[0-9]+$/.test(pitchText)) {
      const temperament = cloneDeep(selectedTemperament);
      temperament.referencePitch = parseInt(pitchText, 10);
      onTemperamentUpdate(temperament);
    }
  };

  return (
    <SettingsItem>
      Reference pitch:
      <input
        ref={pitchInputRef}
        className="ReferencePitchChooser-input"
        onBlur={handlePitchChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handlePitchChange();
          }
        }}
        pattern="[0-9]*"
        placeholder={selectedTemperament.referencePitch}
        tabIndex={0}
        type="text"
        {...rest}
      />
      Hz
    </SettingsItem>
  );
}

ReferencePitchChooser.propTypes = {
  onTemperamentUpdate: PropTypes.func.isRequired,
  selectedTemperament: PropTypes.instanceOf(Temperament).isRequired,
};

/** A settings item that, when clicked, opens a file selection dialog. */
function FileChooser({ label, onFileSelect, ...rest }) {
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

FileChooser.propTypes = {
  label: PropTypes.string.isRequired,
  /**
   * A function that will be called when a file is selected.  The `File` object
   * corresponding to the chosen file will be passed as the only object.
   */
  onFileSelect: PropTypes.func,
};

FileChooser.defaultProps = {
  tabIndex: 0,
};

/** A specialized `FileChooser` for temperaments. */
function TemperamentFileChooser({
  label,
  onError,
  onTemperamentSelect,
  ...rest
}) {
  return (
    <FileChooser
      label={label}
      onFileSelect={(file) =>
        loadTemperament(file)
          .then(onTemperamentSelect)
          .catch((e) => onError && onError(e))
      }
      {...rest}
    />
  );
}

TemperamentFileChooser.propTypes = {
  label: PropTypes.string.isRequired,
  onError: PropTypes.func,
  onTemperamentSelect: PropTypes.func.isRequired,
};

/** Loads a temperament from a file. */
async function loadTemperament(file) {
  let json;
  try {
    const response = await fetch(URL.createObjectURL(file));
    json = await response.json();
  } catch (e) {
    throw new AppError(
      'Could not process input file. Please ensure that you selected the correct file and try again.',
      String(e)
    );
  }

  try {
    return new Temperament(json);
  } catch (e) {
    throw new AppError('Invalid temperament input.', String(e));
  }
}

/** A setting that can be clicked or tapped to expand a list of sub-settings. */
function ExpanderGroup({ children, label, ...rest }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <SettingsItem
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyPress={(e) => {
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

ExpanderGroup.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string.isRequired,
};

ExpanderGroup.defaultProps = {
  tabIndex: 0,
};

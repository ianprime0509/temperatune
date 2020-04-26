/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useRef, useState, FC, ReactNode } from 'react';
import { usePopper } from 'react-popper';
import cloneDeep from 'lodash.clonedeep';
import uniqueId from 'lodash.uniqueid';

import AppError from './AppError';
import { Caret, Content as ExpandingContent } from './Expand';
import { Modal } from './Modal';

import { version as VERSION } from '../package.json';

import './AppSettings.css';
import { Temperament } from 'temperament';

interface SettingsItemProps {
  children: ReactNode;
  isSelected?: boolean;
  tooltip?: string;

  onClick?: () => void;

  [k: string]: any;
}

/** A item in a settings list with a consistent style. */
const SettingsItem: FC<SettingsItemProps> = ({
  children,
  isSelected = false,
  onClick,
  tooltip,
  ...rest
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  let className = 'SettingsItem';
  if (isSelected) {
    className += ' selected';
  }

  const shouldShowTooltip = tooltip && isTooltipOpen;
  const tooltipId = uniqueId('tooltip-');
  const targetRestProps: { [k: string]: any } = {};
  if (shouldShowTooltip) {
    targetRestProps['aria-describedby'] = tooltipId;
  }

  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>(null);
  const [tooltipElement, setTooltipElement] = useState<HTMLDivElement | null>(
    null
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, tooltipElement, {
    placement: 'top',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'preventOverflow' },
    ],
  });

  return (
    <>
      <div
        ref={setReferenceElement}
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

      {shouldShowTooltip && (
        <div
          ref={setTooltipElement}
          role="tooltip"
          className="Tooltip"
          style={styles.popper}
          {...attributes.popper}
          {...rest}
        >
          {tooltip}
          <div
            ref={setArrowElement}
            aria-hidden="true"
            className="Tooltip-arrow"
            style={styles.arrow}
            {...attributes.arrow}
          />
        </div>
      )}
    </>
  );
};

interface ReferencePitchChooserProps {
  selectedTemperament: Temperament;

  onTemperamentUpdate?: (temperament: Temperament) => void;

  [k: string]: any;
}

/** A settings item for choosing the reference pitch of the selected temperament. */
const ReferencePitchChooser: FC<ReferencePitchChooserProps> = ({
  onTemperamentUpdate,
  selectedTemperament,
  ...rest
}) => {
  const pitchInputRef = useRef<HTMLInputElement | null>(null);

  const handlePitchChange = () => {
    const pitchInput = pitchInputRef.current;
    if (!pitchInput) return;

    const pitchText = pitchInput.value.trim();
    if (/^[0-9]+$/.test(pitchText)) {
      const temperament = cloneDeep(selectedTemperament);
      temperament.referencePitch = parseInt(pitchText, 10);
      onTemperamentUpdate && onTemperamentUpdate(temperament);
    }
  };

  return (
    <SettingsItem>
      Reference pitch:
      <input
        ref={pitchInputRef}
        className="ReferencePitchChooser-input"
        pattern="[0-9]*"
        placeholder={selectedTemperament.referencePitch.toString()}
        tabIndex={0}
        type="text"
        onBlur={handlePitchChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handlePitchChange();
          }
        }}
        {...rest}
      />
      Hz
    </SettingsItem>
  );
};

interface FileChooserProps {
  label: string;
  tabIndex?: number;

  /**
   * A function that will be called when a file is selected.  The `File` object
   * corresponding to the chosen file will be passed as the only object.
   */
  onFileSelect?: (file: File) => void;

  [k: string]: any;
}

/** A settings item that, when clicked, opens a file selection dialog. */
const FileChooser: FC<FileChooserProps> = ({
  label,
  tabIndex = 0,
  onFileSelect,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <SettingsItem
      tabIndex={tabIndex}
      onClick={() => inputRef.current && inputRef.current.click()}
      {...rest}
    >
      <input
        id="fileInput"
        ref={inputRef}
        style={{ height: 0, opacity: 0, width: 0 }}
        tabIndex={-1}
        type="file"
        onChange={() => {
          if (!inputRef.current) return;

          if (onFileSelect) {
            const file = inputRef.current.files?.[0];
            file && onFileSelect(file);
          }
          inputRef.current.value = '';
        }}
      />
      <span>{label}</span>
    </SettingsItem>
  );
};

/** Loads a temperament from a file. */
const loadTemperament = async (file: File) => {
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
};

interface TemperamentFileChooserProps {
  label: string;

  onError?: (error: Error) => void;
  onTemperamentSelect?: (temperament: Temperament) => void;

  [k: string]: any;
}

/** A specialized `FileChooser` for temperaments. */
const TemperamentFileChooser: FC<TemperamentFileChooserProps> = ({
  label,
  onError,
  onTemperamentSelect,
  ...rest
}) => (
  <FileChooser
    label={label}
    onFileSelect={(file) =>
      loadTemperament(file).then(onTemperamentSelect).catch(onError)
    }
    {...rest}
  />
);

interface ExpanderGroupProps {
  children: ReactNode;
  label: string;
  tabIndex?: number;

  [k: string]: any;
}

/** A setting that can be clicked or tapped to expand a list of sub-settings. */
const ExpanderGroup: FC<ExpanderGroupProps> = ({
  children,
  label,
  tabIndex = 0,
  ...rest
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <SettingsItem
        aria-expanded={isExpanded}
        tabIndex={tabIndex}
        onClick={() => setIsExpanded(!isExpanded)}
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
};

interface AppSettingsProps {
  isOpen: boolean;
  selectedTemperament: Temperament;
  temperaments: Temperament[];

  onClose: () => void;
  onError?: (error: Error) => void;
  onTemperamentAdd: (temperament: Temperament) => void;
  onTemperamentSelect: (temperament: Temperament) => void;
}

/** The app settings modal. */
const AppSettings: FC<AppSettingsProps> = ({
  isOpen,
  onClose,
  onError,
  onTemperamentAdd,
  onTemperamentSelect,
  selectedTemperament,
  temperaments,
}) => (
  <Modal isOpen={isOpen} onRequestClose={onClose} title="Settings">
    <div className="AppSettings-container">
      <ExpanderGroup label={`Temperament: ${selectedTemperament.name}`}>
        {temperaments.map((temperament) => (
          <SettingsItem
            key={temperament.name}
            isSelected={temperament.name === selectedTemperament.name}
            tabIndex={0}
            tooltip={temperament.description}
            onClick={() => onTemperamentSelect(temperament)}
          >
            {temperament.name}
          </SettingsItem>
        ))}
        <TemperamentFileChooser
          label="Choose file"
          tooltip="Add your own temperament."
          onError={onError}
          onTemperamentSelect={onTemperamentAdd}
        />
      </ExpanderGroup>
      <ReferencePitchChooser
        selectedTemperament={selectedTemperament}
        onTemperamentUpdate={onTemperamentSelect}
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

export default AppSettings;

/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useRef, useState, FC, ReactNode } from "react";
import { usePopper } from "react-popper";
import styled from "styled-components/macro";
import cloneDeep from "lodash.clonedeep";
import uniqueId from "lodash.uniqueid";
import { Temperament } from "temperament";

import AppError from "./AppError";
import { ButtonLabel, ListButton } from "./Button";
import { Caret, Content as ExpandingContent } from "./Expand";
import { Modal } from "./Modal";
import { Theme } from "./theme";

import { version as VERSION } from "../package.json";

const Tooltip = styled.div`
  background: #111;
  border-radius: 5px;
  color: #eee;
  max-width: 20rem;
  padding: 0.5rem;
`;

const TooltipArrow = styled.div`
  &,
  &::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: -1;
  }

  &::before {
    content: "";
    transform: rotate(45deg);
    background: #111;
  }

  ${Tooltip}[data-popper-placement='top'] > & {
    bottom: -4px;
  }

  ${Tooltip}[data-popper-placement='bottom'] > & {
    top: -4px;
  }

  ${Tooltip}[data-popper-placement='left'] > & {
    right: -4px;
  }

  ${Tooltip}[data-popper-placement='right'] > & {
    left: -4px;
  }
`;

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

  const shouldShowTooltip = tooltip && isTooltipOpen;
  const tooltipId = uniqueId("tooltip-");
  const targetRestProps: { [k: string]: any } = {};
  if (shouldShowTooltip) {
    targetRestProps["aria-describedby"] = tooltipId;
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
    placement: "top",
    modifiers: [
      { name: "arrow", options: { element: arrowElement } },
      { name: "preventOverflow" },
      { name: "offset", options: { offset: [0, 8] } },
    ],
  });

  return (
    <>
      <ListButton
        ref={setReferenceElement}
        fontSizeRem={1.5}
        isSelected={isSelected}
        onBlur={() => setIsTooltipOpen(false)}
        onClick={onClick}
        onFocus={() => setIsTooltipOpen(true)}
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        {...rest}
        {...targetRestProps}
      >
        {children}
      </ListButton>

      {shouldShowTooltip && (
        <Tooltip
          id={tooltipId}
          ref={setTooltipElement}
          role="tooltip"
          style={styles.popper}
          {...attributes.popper}
        >
          {tooltip}
          <TooltipArrow
            ref={setArrowElement}
            aria-hidden="true"
            style={styles.arrow}
            {...attributes.arrow}
          />
        </Tooltip>
      )}
    </>
  );
};

const PitchInput = styled.input.attrs({
  type: "text",
  pattern: "[0-9]*",
})`
  background: ${({ theme }) => theme.backgroundColor};
  border: 2px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textColor};
  font-size: 1.5rem;
  margin: 0 0.5rem;
  text-align: right;
  width: 5rem;

  &:focus {
    box-shadow: 0 0 8px ${({ theme }) => theme.accentColor};
  }

  &::placeholder {
    color: ${({ theme }) => theme.mutedTextColor};
  }
`;

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
    <SettingsItem as="div">
      Reference pitch:
      <PitchInput
        ref={pitchInputRef}
        placeholder={selectedTemperament.referencePitch.toString()}
        onBlur={handlePitchChange}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
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

const HiddenFileInput = styled.input.attrs({ tabIndex: -1, type: "file" })`
  height: 0;
  opacity: 0;
  width: 0;
`;

/** A settings item that, when clicked, opens a file selection dialog. */
const FileChooser: FC<FileChooserProps> = ({
  label,
  tabIndex = 0,
  onFileSelect,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = uniqueId("file-input-");

  return (
    <SettingsItem
      tabIndex={tabIndex}
      onClick={() => inputRef.current && inputRef.current.click()}
      {...rest}
    >
      <HiddenFileInput
        id={inputId}
        ref={inputRef}
        onChange={() => {
          if (!inputRef.current) return;

          if (onFileSelect) {
            const file = inputRef.current.files?.[0];
            file && onFileSelect(file);
          }
          inputRef.current.value = "";
        }}
      />
      <label htmlFor={inputId}>{label}</label>
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
      "Could not process input file. Please ensure that you selected the correct file and try again.",
      String(e)
    );
  }

  try {
    return new Temperament(json);
  } catch (e) {
    throw new AppError("Invalid temperament input.", String(e));
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
    <>
      <SettingsItem
        aria-expanded={isExpanded}
        tabIndex={tabIndex}
        onClick={() => setIsExpanded(!isExpanded)}
        {...rest}
      >
        <ButtonLabel>{label}</ButtonLabel>
        <Caret isExpanded={isExpanded} />
      </SettingsItem>
      <ExpandingContent isExpanded={isExpanded}>{children}</ExpandingContent>
    </>
  );
};

const SettingsContainer = styled.div`
  height: calc(100% - 3rem);
  max-height: 100%;
  max-width: 100%;
  width: 35rem;

  @media (min-height: 30rem) {
    min-height: 25rem;
  }
`;

interface AppSettingsProps {
  isOpen: boolean;
  selectedTemperament: Temperament;
  selectedTheme: Theme;
  temperaments: Temperament[];
  themes: Theme[];

  onClose: () => void;
  onError?: (error: Error) => void;
  onTemperamentAdd: (temperament: Temperament) => void;
  onTemperamentSelect: (temperament: Temperament) => void;
  onThemeSelect: (theme: Theme) => void;
}

/** The app settings modal. */
const AppSettings: FC<AppSettingsProps> = ({
  isOpen,
  selectedTemperament,
  selectedTheme,
  temperaments,
  themes,
  onClose,
  onError,
  onTemperamentAdd,
  onTemperamentSelect,
  onThemeSelect,
}) => (
  <Modal isOpen={isOpen} onRequestClose={onClose} title="Settings">
    <SettingsContainer>
      <ExpanderGroup label={`Temperament: ${selectedTemperament.name}`}>
        {temperaments.map((temperament) => (
          <SettingsItem
            key={temperament.name}
            isSelected={temperament.name === selectedTemperament.name}
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
      <ExpanderGroup label={`Theme: ${selectedTheme.name}`}>
        {themes.map((theme) => (
          <SettingsItem
            key={theme.name}
            isSelected={theme.name === selectedTheme.name}
            onClick={() => onThemeSelect(theme)}
          >
            {theme.name}
          </SettingsItem>
        ))}
      </ExpanderGroup>
      <ExpanderGroup label="About Temperatune">
        <p>Version: {VERSION}</p>
        <p>
          Temperatune is hosted on GitHub: you can browse its source code{" "}
          <a href="https://github.com/ianprime0509/temperatune">here</a>. For
          more information on defining your own temperaments, see{" "}
          <a href="https://github.com/ianprime0509/temperament/blob/master/README.md">
            this README
          </a>
          .
        </p>
      </ExpanderGroup>
    </SettingsContainer>
  </Modal>
);

export default AppSettings;

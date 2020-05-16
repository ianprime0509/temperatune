/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, IconLookup } from "@fortawesome/free-solid-svg-icons";

import { Button } from "./Button";
import { PanelRow } from "./Panel";

interface SettingsBarProps {
  /** The icon to show for the switch button. */
  switchIcon: IconLookup;

  onSettingsOpen?: () => void;
  onViewFlip?: () => void;
}

/**
 * The bottom part of the interface, showing the settings button and a button hi
 * to change between the pitch generator and analyser.
 */
const SettingsBar: FC<SettingsBarProps> = ({
  switchIcon,
  onSettingsOpen,
  onViewFlip,
}) => (
  <PanelRow>
    <Button isHoverable={false} onClick={onSettingsOpen}>
      <FontAwesomeIcon icon={faCog} size="3x" />
    </Button>
    <Button isHoverable={false} onClick={onViewFlip}>
      <FontAwesomeIcon icon={switchIcon} size="3x" />
    </Button>
  </PanelRow>
);

export default SettingsBar;

import React, { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, IconLookup } from "@fortawesome/free-solid-svg-icons";

import { Button } from "./Button";
import { PanelGroup } from "./Panel";

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
  <PanelGroup direction="row">
    <Button isHoverable={false} onClick={onSettingsOpen}>
      <FontAwesomeIcon icon={faCog} size="3x" />
    </Button>
    <Button isHoverable={false} onClick={onViewFlip}>
      <FontAwesomeIcon icon={switchIcon} size="3x" />
    </Button>
  </PanelGroup>
);

export default SettingsBar;

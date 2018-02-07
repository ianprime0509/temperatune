import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faMicrophone, faPause, faPlay } from '@fortawesome/fontawesome-free-solid';

import AppModal from './AppModal';
import Button from './Button';
import SettingsBar from './SettingsBar';

import './PitchGenerator.css';

/** The playback control. */
function PlaybackControl(props) {
  const icon = props.isPlaying ? faPause : faPlay;
  return (
    <div className="PlaybackControl">
      <FontAwesomeIcon
        icon={icon}
        size="10x"
        className="PlaybackControl-icon"
        onClick={props.onClick}
      />
    </div>
  );
}

PlaybackControl.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

/** The "panel" containing the pitch generator interface. */
class PitchGenerator extends Component {
  constructor() {
    super();
    this.state = {
      isPlaying: false,
      notesModalIsOpen: false,
      octavesModalIsOpen: false,
    };
  }

  /** Return an array of the note names in the current temperament. */
  getNoteNames() {
    return ['C', 'D', 'E'];
  }

  /** Return an array of the accessible octaves in the current temperament. */
  getOctaves() {
    return [...Array(10).keys()];
  }

  handleCloseOctavesModal() {
    this.setState({ octavesModalIsOpen: false });
  }

  handleCloseNotesModal() {
    this.setState({ notesModalIsOpen: false });
  }

  handleOpenNotesModal() {
    this.setState({ notesModalIsOpen: true });
  }

  handleOpenOctavesModal() {
    this.setState({ octavesModalIsOpen: true });
  }

  handlePlaybackClick() {
    this.setState({ isPlaying: !this.state.isPlaying });
  }

  render() {
    return (
      <div className="PitchGenerator">
        <div className="PitchGenerator-controls">
          <Button
            label="A"
            onClick={this.handleOpenNotesModal.bind(this)}
          />
          <Button
            label="4"
            onClick={this.handleOpenOctavesModal.bind(this)}
          />
        </div >
        <PlaybackControl
          isPlaying={this.state.isPlaying}
          onClick={this.handlePlaybackClick.bind(this)}
        />
        <SettingsBar
          switchIcon={faMicrophone}
          onFlipView={this.props.onFlipView}
          onOpenSettings={this.props.onOpenSettings}
        />
        <AppModal
          isOpen={this.state.notesModalIsOpen}
          onRequestClose={this.handleCloseNotesModal.bind(this)}
          title="Select note"
        >
          <div className="App-notes">
            {this.getNoteNames().map(note =>
              <Button key={note} label={note} />
            )}
          </div>
        </AppModal>
        <AppModal
          isOpen={this.state.octavesModalIsOpen}
          onRequestClose={this.handleCloseOctavesModal.bind(this)}
          title="Select octave"
        >
          <div className="App-octaves">
            {this.getOctaves().map(octave =>
              <Button key={octave} label={String(octave)} />
            )}
          </div>
        </AppModal>
      </div >
    );
  }
}

PitchGenerator.propTypes = {
  onFlipView: PropTypes.func,
  onOpenSettings: PropTypes.func,
};

export default PitchGenerator;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faPause,
  faPlay,
} from '@fortawesome/fontawesome-free-solid';

import AppModal from './AppModal';
import Button from './Button';
import SettingsBar from './SettingsBar';
import Temperament, { prettifyNoteName } from './Temperament';

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

  handleNoteSelect(note) {
    this.props.onNoteSelect(note);
    this.handleNotesModalClose();
  }

  handleNotesModalClose() {
    this.setState({ notesModalIsOpen: false });
  }

  handleNotesModalOpen() {
    this.setState({ notesModalIsOpen: true });
  }

  handleOctaveSelect(octave) {
    this.props.onOctaveSelect(octave);
    this.handleOctavesModalClose();
  }

  handleOctavesModalClose() {
    this.setState({ octavesModalIsOpen: false });
  }

  handleOctavesModalOpen() {
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
            label={prettifyNoteName(this.props.selectedNote)}
            onClick={this.handleNotesModalOpen.bind(this)}
          />
          <Button
            label={String(this.props.selectedOctave)}
            onClick={this.handleOctavesModalOpen.bind(this)}
          />
        </div >
        <PlaybackControl
          isPlaying={this.state.isPlaying}
          onClick={this.handlePlaybackClick.bind(this)}
        />
        <SettingsBar
          switchIcon={faMicrophone}
          onViewFlip={this.props.onViewFlip}
          onSettingsOpen={this.props.onSettingsOpen}
        />
        <AppModal
          isOpen={this.state.notesModalIsOpen}
          onRequestClose={this.handleNotesModalClose.bind(this)}
          title="Select note"
        >
          <div className="App-notes">
            {this.props.temperament.getNoteNames().map(note =>
              <Button
                key={note}
                label={prettifyNoteName(note)}
                onClick={() => this.handleNoteSelect(note)}
              />
            )}
          </div>
        </AppModal>
        <AppModal
          isOpen={this.state.octavesModalIsOpen}
          onRequestClose={this.handleOctavesModalClose.bind(this)}
          title="Select octave"
        >
          <div className="App-octaves">
            {this.getOctaves().map(octave =>
              <Button
                key={octave}
                label={String(octave)}
                onClick={() => this.handleOctaveSelect(octave)}
              />
            )}
          </div>
        </AppModal>
      </div >
    );
  }
}

PitchGenerator.propTypes = {
  onNoteSelect: PropTypes.func,
  onOctaveSelect: PropTypes.func,
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  selectedNote: PropTypes.string,
  selectedOctave: PropTypes.number,
  temperament: PropTypes.instanceOf(Temperament),
};

export default PitchGenerator;

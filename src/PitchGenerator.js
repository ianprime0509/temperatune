/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faPause,
  faPlay,
} from '@fortawesome/fontawesome-free-solid';

import { Modal } from './Modal';
import Button from './Button';
import SettingsBar from './SettingsBar';
import Temperament, { prettifyNoteName } from './Temperament';

import './PitchGenerator.css';

/** The playback control. */
function PlaybackControl(props) {
  let { isFocusable, isPlaying, onClick, ...rest } = props;
  const icon = isPlaying ? faPause : faPlay;
  return (
    <div className="PlaybackControl">
      <FontAwesomeIcon
        icon={icon}
        className="PlaybackControl-icon"
        onClick={props.onClick}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            props.onClick && props.onClick();
          }
        }}
        tabIndex={isFocusable ? 0 : -1}
        {...rest}
      />
    </div>
  );
}

PlaybackControl.propTypes = {
  isFocusable: PropTypes.bool,
  isPlaying: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

/** The "panel" containing the pitch generator interface. */
export default class PitchGenerator extends Component {
  constructor() {
    super();
    this.state = {
      audioContext: new window.AudioContext(),
      notesModalIsOpen: false,
      octavesModalIsOpen: false,
      oscillator: null,
    };
  }

  handleAlertOpen(title, description) {
    this.props.onAlertOpen && this.props.onAlertOpen(title, description);
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

  render() {
    let pitch =
      Math.round(
        10 *
        this.props.temperament.getPitch(
          this.props.selectedNote,
          this.props.selectedOctave
        )
      ) / 10;

    return (
      <div className="PitchGenerator">
        <div className="PitchGenerator-controls">
          <Button
            fontSizeRem={5}
            isFocusable={this.props.isFocusable}
            label={prettifyNoteName(this.props.selectedNote)}
            onClick={this.handleNotesModalOpen.bind(this)}
          />
          <Button
            fontSizeRem={5}
            isFocusable={this.props.isFocusable}
            label={String(this.props.selectedOctave)}
            onClick={this.handleOctavesModalOpen.bind(this)}
          />
        </div>
        <PlaybackControl
          isFocusable={this.props.isFocusable}
          isPlaying={this.props.isPlaying}
          onClick={this.props.onPlayToggle}
        />
        <span className="PitchGenerator-pitch">{`${pitch} Hz`}</span>
        <SettingsBar
          isFocusable={this.props.isFocusable}
          switchIcon={faMicrophone}
          onViewFlip={this.props.onViewFlip}
          onSettingsOpen={this.props.onSettingsOpen}
        />
        <Modal
          isOpen={this.state.notesModalIsOpen}
          onRequestClose={this.handleNotesModalClose.bind(this)}
          title="Select note"
        >
          <div className="PitchGenerator-notes">
            {this.props.temperament
              .getNoteNames()
              .map(note => (
                <Button
                  key={note}
                  fontSizeRem={5}
                  isSelected={note === this.props.selectedNote}
                  label={prettifyNoteName(note)}
                  onClick={() => this.handleNoteSelect(note)}
                  tabIndex={0}
                />
              ))}
          </div>
        </Modal>
        <Modal
          isOpen={this.state.octavesModalIsOpen}
          onRequestClose={this.handleOctavesModalClose.bind(this)}
          title="Select octave"
        >
          <div className="PitchGenerator-octaves">
            {this.props.temperament
              .getOctaveRange(2)
              .map(octave => (
                <Button
                  key={octave}
                  fontSizeRem={5}
                  isSelected={octave === this.props.selectedOctave}
                  label={String(octave)}
                  onClick={() => this.handleOctaveSelect(octave)}
                  tabIndex={0}
                />
              ))}
          </div>
        </Modal>
      </div>
    );
  }
}

PitchGenerator.propTypes = {
  isFocusable: PropTypes.bool,
  isPlaying: PropTypes.bool,
  onAlertOpen: PropTypes.func,
  onNoteSelect: PropTypes.func,
  onOctaveSelect: PropTypes.func,
  onPlayToggle: PropTypes.func,
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  selectedNote: PropTypes.string,
  selectedOctave: PropTypes.number,
  temperament: PropTypes.instanceOf(Temperament),
};

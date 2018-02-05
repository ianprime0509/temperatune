import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faMicrophone, faPause, faPlay } from '@fortawesome/fontawesome-free-solid';

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
      isPlaying: false
    };
  }

  handlePlaybackClick() {
    this.setState({ isPlaying: !this.state.isPlaying });
  }

  render() {
    return (
      <div className="PitchGenerator">
        <div className="PitchGenerator-controls">
          <Button><span>A</span></Button>
          <Button><span>4</span></Button>
        </div>
        <PlaybackControl
          isPlaying={this.state.isPlaying}
          onClick={this.handlePlaybackClick.bind(this)}
        />
        <SettingsBar switchIcon={faMicrophone} />
      </div>
    );
  }
}

export default PitchGenerator;

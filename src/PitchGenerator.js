import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingsBar from './SettingsBar';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faMicrophone, faPause, faPlay } from '@fortawesome/fontawesome-free-solid';
import './PitchGenerator.css';

/** The playback control. */
function PlaybackControl(props) {
  const icon = props.isPlaying ? faPause : faPlay;
  let style = {};
  if (props.grow) {
    style.flexGrow = props.grow;
  }
  return (
    <div className="PlaybackControl" style={style}>
      <FontAwesomeIcon icon={icon} size="10x" />
    </div>
  );
}

PlaybackControl.propTypes = {
  grow: PropTypes.number,
  isPlaying: PropTypes.bool.isRequired,
};

/** The "panel" containing the pitch generator interface. */
class PitchGenerator extends Component {
  constructor() {
    super();
    this.state = {
      isPlaying: false
    };
  }

  render() {
    return (
      <div className="PitchGenerator">
        <div className="PitchGenerator-controls">
          <div className="PitchGenerator-control" />
          <div className="PitchGenerator-control" />
        </div>
        <PlaybackControl isPlaying={this.state.isPlaying} grow={2} />
        <SettingsBar switchIcon={faMicrophone} />
      </div>
    );
  }
}

export default PitchGenerator;

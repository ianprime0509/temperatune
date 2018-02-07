import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { faMusic } from '@fortawesome/fontawesome-free-solid';

import SettingsBar from './SettingsBar';

import './PitchAnalyzer.css';

class PitchAnalyzer extends Component {
  render() {
    return (
      <div className="PitchAnalyzer">
        <span className="PitchAnalyzer-note">A</span>
        <SettingsBar
          switchIcon={faMusic}
          onSettingsOpen={this.props.onSettingsOpen}
          onViewFlip={this.props.onViewFlip}
        />
      </div>
    );
  }
}

PitchAnalyzer.propTypes = {
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
};

export default PitchAnalyzer;

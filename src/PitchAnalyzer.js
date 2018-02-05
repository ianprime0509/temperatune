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
          onFlipView={this.props.onFlipView}
          onOpenSettings={this.props.onOpenSettings}
        />
      </div>
    );
  }
}

PitchAnalyzer.propTypes = {
  onFlipView: PropTypes.func,
  onOpenSettings: PropTypes.func,
};

export default PitchAnalyzer;

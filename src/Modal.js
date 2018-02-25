/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';
import uniqueId from 'lodash.uniqueid';

import Button from './Button';
import { Caret, Content as ExpandingContent } from './Expand';

import './Modal.css';

/** A modal dialog with a consistent style. */
export function Modal(props) {
  return (
    <ReactModal
      className={{
        base: 'Modal-content',
        afterOpen: 'Modal-content--after-open',
        beforeClose: 'Modal-content--before-close',
      }}
      overlayClassName="Modal-overlay"
      closeTimeoutMS={200}
      contentLabel={props.title}
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
    >
      <div className="Modal-titlebar">
        <span className="Modal-title">{props.title}</span>
        <FontAwesomeIcon
          icon={faTimes}
          size="2x"
          className="Modal-close"
          onClick={props.onRequestClose}
        />
      </div>
      <div className="Modal-children">{props.children}</div>
    </ReactModal>
  );
}

Modal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

/**
 * An alert popup with a title, description and optional details.
 */
export class Alert extends Component {
  constructor() {
    super();
    this.state = {
      areDetailsExpanded: false,
      descriptionId: uniqueId('alert-description-'),
    };
  }

  handleDetailsClick() {
    this.setState(state => {
      return { areDetailsExpanded: !state.areDetailsExpanded };
    });
  }

  render() {
    let { description, details, isOpen, title } = this.props;

    return (
      <Modal
        aria={{ describedby: this.state.descriptionId }}
        isOpen={isOpen}
        onRequestClose={this.props.handleAlertClose}
        title={title}
      >
        <div className="Alert-content">
          <div className="Alert-description" id={this.state.descriptionId}>
            <p>{description}</p>
            <div
              className="Alert-details-expander"
              onClick={this.handleDetailsClick.bind(this)}
              onKeyPress={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.handleDetailsClick();
                }
              }}
              tabIndex={0}
            >
              Details
              <Caret isExpanded={this.state.areDetailsExpanded} />
            </div>
            <ExpandingContent isExpanded={this.state.areDetailsExpanded}>
              <p className="Alert-details">{details}</p>
            </ExpandingContent>
          </div>
          <Button
            fontSizeRem={1.5}
            label="OK"
            onClick={this.props.handleAlertClose}
            tabIndex={0}
          />
        </div>
      </Modal>
    );
  }
}

Alert.propTypes = {
  description: PropTypes.string.isRequired,
  details: PropTypes.string,
  handleAlertClose: PropTypes.func,
  title: PropTypes.string.isRequired,
};

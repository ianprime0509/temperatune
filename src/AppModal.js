import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';

import './AppModal.css';

/** A modal dialog with a consistent style. */
export default function AppModal(props) {
  return (
    <Modal
      className={{
        base: 'AppModal-content',
        afterOpen: 'AppModal-content--after-open',
        beforeClose: 'AppModal-content--before-close',
      }}
      overlayClassName="AppModal-overlay"
      closeTimeoutMS={200}
      contentLabel={props.title}
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
    >
      <div className="AppModal-titlebar">
        <span className="AppModal-title">{props.title}</span>
        <FontAwesomeIcon
          icon={faTimes}
          size="2x"
          className="AppModal-close"
          onClick={props.onRequestClose}
        />
      </div>
      <div className="AppModal-children">{props.children}</div>
    </Modal>
  );
}

AppModal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  title: PropTypes.string.required,
};

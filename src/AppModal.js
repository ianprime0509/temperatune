import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';

import './AppModal.css';

/** A modal dialog with a consistent style. */
function AppModal(props) {
  return (
    <Modal
      className="AppModal-content"
      overlayClassName="AppModal-overlay"
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
    >
      <FontAwesomeIcon
        icon={faTimes}
        size="2x"
        className="AppModal-close"
        onClick={props.onRequestClose}
      />
      {props.children}
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
};

export default AppModal;

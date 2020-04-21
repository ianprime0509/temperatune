/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useRef, useState } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import uniqueId from 'lodash.uniqueid';

import Button from './Button';
import { Caret, Content as ExpandingContent } from './Expand';

import './Modal.css';

/** A modal dialog with a consistent style. */
export function Modal({
  aria,
  children,
  isOpen,
  onRequestClose,
  title,
  ...rest
}) {
  const titleId = uniqueId('modal-title-');

  return (
    <ReactModal
      aria={{ ...aria, labelledby: titleId }}
      className={{
        base: 'Modal-content',
        afterOpen: 'Modal-content--after-open',
        beforeClose: 'Modal-content--before-close',
      }}
      overlayClassName="Modal-overlay"
      closeTimeoutMS={200}
      contentLabel={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      {...rest}
    >
      <div className="Modal-titlebar">
        <span id={titleId} className="Modal-title">
          {title}
        </span>
        <FontAwesomeIcon
          role="button"
          icon={faTimes}
          size="2x"
          className="Modal-close"
          onClick={onRequestClose}
        />
      </div>
      <div className="Modal-children">{children}</div>
    </ReactModal>
  );
}

Modal.propTypes = {
  aria: PropTypes.objectOf(PropTypes.string),
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
export function Alert({
  description,
  details,
  handleAlertClose,
  isOpen,
  title,
}) {
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);
  const descriptionId = uniqueId('alert-description-');
  const okButtonRef = useRef(null);

  let alertDetailsStyle = details ? {} : { display: 'none' };

  return (
    <Modal
      role="alert"
      aria={{ describedby: descriptionId }}
      isOpen={isOpen}
      onAfterOpen={() => okButtonRef.current.focus()}
      onRequestClose={handleAlertClose}
      title={title}
    >
      <div className="Alert-content">
        <div className="Alert-description" id={descriptionId}>
          <p>{description}</p>
          <div style={alertDetailsStyle}>
            <div
              aria-expanded={areDetailsExpanded}
              className="Alert-details-expander"
              onClick={() => setAreDetailsExpanded(!areDetailsExpanded)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setAreDetailsExpanded(!areDetailsExpanded);
                }
              }}
              tabIndex={0}
            >
              <span className="Alert-details-expander-label">Details</span>
              <Caret isExpanded={areDetailsExpanded} />
            </div>
            <ExpandingContent isExpanded={areDetailsExpanded}>
              <p className="Alert-details-content">{details}</p>
            </ExpandingContent>
          </div>
        </div>
        <Button
          ref={okButtonRef}
          fontSizeRem={1.5}
          hasBorder={true}
          label="OK"
          onClick={handleAlertClose}
          tabIndex={0}
        />
      </div>
    </Modal>
  );
}

Alert.propTypes = {
  description: PropTypes.string.isRequired,
  details: PropTypes.string,
  handleAlertClose: PropTypes.func,
  isOpen: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

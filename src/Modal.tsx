/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useRef, useState, ReactNode, FC } from 'react';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import uniqueId from 'lodash.uniqueid';

import Button from './Button';
import { Caret, Content as ExpandingContent } from './Expand';

import './Modal.css';

interface ModalPropTypes {
  aria?: { [k: string]: string };
  children: ReactNode;
  isOpen: boolean;
  title: string;

  onRequestClose?: () => void;

  [k: string]: any;
}

/** A modal dialog with a consistent style. */
export const Modal: FC<ModalPropTypes> = ({
  aria,
  children,
  isOpen,
  onRequestClose,
  title,
  ...rest
}) => {
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
};

interface AlertProps {
  description: string;
  details?: string;
  isOpen: boolean;
  title: string;

  handleAlertClose?: () => void;
}

/**
 * An alert popup with a title, description and optional details.
 */
export const Alert: FC<AlertProps> = ({
  description,
  details,
  handleAlertClose,
  isOpen,
  title,
}) => {
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);
  const descriptionId = uniqueId('alert-description-');
  const okButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Modal
      role="alert"
      aria={{ describedby: descriptionId }}
      isOpen={isOpen}
      title={title}
      onAfterOpen={() => okButtonRef.current && okButtonRef.current.focus()}
      onRequestClose={handleAlertClose}
    >
      <div className="Alert-content">
        <div className="Alert-description" id={descriptionId}>
          <p>{description}</p>
          {details && (
            <div>
              <div
                aria-expanded={areDetailsExpanded}
                className="Alert-details-expander"
                tabIndex={0}
                onClick={() => setAreDetailsExpanded(!areDetailsExpanded)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setAreDetailsExpanded(!areDetailsExpanded);
                  }
                }}
              >
                <span className="Alert-details-expander-label">Details</span>
                <Caret isExpanded={areDetailsExpanded} />
              </div>
              <ExpandingContent isExpanded={areDetailsExpanded}>
                <p className="Alert-details-content">{details}</p>
              </ExpandingContent>
            </div>
          )}
        </div>
        <Button
          ref={okButtonRef}
          fontSizeRem={1.5}
          hasBorder={true}
          label="OK"
          tabIndex={0}
          onClick={handleAlertClose}
        />
      </div>
    </Modal>
  );
};

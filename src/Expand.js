/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/fontawesome-free-solid';

import './Expand.css';

/** A caret used to indicate expanding content. */
export function Caret(props) {
  let className = 'Caret';
  if (props.isExpanded) {
    className += ' expanded';
  }

  return <FontAwesomeIcon className={className} icon={faCaretRight} />;
}

Caret.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
};

/** An expanding content box. */
export function Content(props) {
  let { children, isExpanded } = props;

  let className = 'Content';
  if (isExpanded) {
    className += ' expanded';
  }

  return (
    <div
      aria-expanded={isExpanded}
      aria-hidden={!isExpanded}
      className={className}
    >
      <div className="Content-bar" />
      <div className="Content-children">{children}</div>
    </div>
  );
}

Content.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  isExpanded: PropTypes.bool.isRequired,
};
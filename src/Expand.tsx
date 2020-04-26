/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { FC, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import AnimateHeight from 'react-animate-height';

import './Expand.css';

interface CaretProps {
  isExpanded: boolean;
}

/** A caret used to indicate expanding content. */
export const Caret: FC<CaretProps> = ({ isExpanded }) => {
  let className = 'Caret';
  if (isExpanded) {
    className += ' expanded';
  }

  return (
    <FontAwesomeIcon
      aria-hidden="true"
      className={className}
      icon={faCaretRight}
    />
  );
};

interface ContentProps {
  children: ReactNode;
  isExpanded: boolean;
}

/** An expanding content box. */
export const Content: FC<ContentProps> = ({ children, isExpanded }) => (
  <AnimateHeight aria-hidden={!isExpanded} height={isExpanded ? 'auto' : 0}>
    <div className="Content">
      <div className="Content-bar" />
      <div className="Content-children">{children}</div>
    </div>
  </AnimateHeight>
);

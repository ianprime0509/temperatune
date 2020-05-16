/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { FC, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconLookup, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import AnimateHeight from "react-animate-height";
import styled from "styled-components/macro";

interface CaretProps {
  isExpanded: boolean;
}

/** A caret used to indicate expanding content. */
export const Caret = styled(
  ({ className, icon }: { className?: string; icon: IconLookup }) => (
    <FontAwesomeIcon className={className} icon={icon} />
  )
).attrs({
  "aria-hidden": true,
  icon: faCaretRight,
})<CaretProps>`
  margin: 0 0.75rem;
  transform: ${({ isExpanded }) =>
    isExpanded ? "rotate(90deg)" : "rotate(0deg)"};
  transition: transform 200ms;
`;

const ContentContainer = styled.div`
  display: flex;
  overflow: hidden;
  width: 100%;
`;

const ContentChildren = styled.div`
  border-left: 0.2rem solid ${({ theme }) => theme.borderColor};
  padding-left: 0.5rem;
  width: 100%;
`;

interface ContentProps {
  children: ReactNode;
  isExpanded: boolean;
}

/** An expanding content box. */
export const Content: FC<ContentProps> = ({ children, isExpanded }) => (
  <AnimateHeight aria-hidden={!isExpanded} height={isExpanded ? "auto" : 0}>
    <ContentContainer>
      <ContentChildren>{children}</ContentChildren>
    </ContentContainer>
  </AnimateHeight>
);

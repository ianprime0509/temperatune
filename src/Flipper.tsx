/*
 * Copyright 2020 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { ReactNode, forwardRef } from "react";
import styled from "styled-components/macro";

interface FlipperProps {
  isFlipped: boolean;
}

interface ContainerProps extends FlipperProps {
  className?: string;
  front: ReactNode;
  back: ReactNode;
}

// Using a variant of https://davidwalsh.name/css-flip for the flip animation
const OuterContainer = styled.div`
  perspective: 1000px;
`;

const InnerContainer = styled.div<FlipperProps>`
  display: flex;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  width: 100%;

  ${({ isFlipped }) => isFlipped && "transform: rotateY(180deg);"}

  @media (orientation: landscape) and (max-height: 20rem) {
    ${({ isFlipped }) => isFlipped && "transform: rotateX(180deg);"}
  }
`;

const Face = styled.div`
  backface-visibility: hidden;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

const Front = styled(Face).attrs(({ isFlipped }: FlipperProps) => ({
  "aria-hidden": isFlipped,
}))<FlipperProps>`
  transform: rotateY(0deg);
  z-index: 2;

  @media (orientation: landscape) and (max-height: 20rem) {
    transform: rotateX(0deg);
  }
`;

const Back = styled(Face).attrs(({ isFlipped }: FlipperProps) => ({
  "aria-hidden": !isFlipped,
}))<FlipperProps>`
  transform: rotateY(180deg);

  @media (orientation: landscape) and (max-height: 20rem) {
    transform: rotateX(180deg);
  }
`;

const Flipper = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, isFlipped, front, back }, ref) => (
    <OuterContainer ref={ref} className={className}>
      <InnerContainer isFlipped={isFlipped}>
        <Front isFlipped={isFlipped}>{front}</Front>
        <Back isFlipped={isFlipped}>{back}</Back>
      </InnerContainer>
    </OuterContainer>
  )
);

export default Flipper;

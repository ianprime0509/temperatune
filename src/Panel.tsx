import styled from "styled-components/macro";

export type Direction = "column" | "row";

const swapDirection = (direction: Direction): Direction =>
  direction === "column" ? "row" : "column";

export interface PanelGroupProps {
  direction?: Direction;
  forceDirection?: boolean;
  grow?: number;
  spaceBetween?: boolean;
}

export const PanelGroup = styled.div<PanelGroupProps>`
  align-items: ${({ spaceBetween = true }) =>
    spaceBetween ? "space-between" : "center"};
  display: flex;
  flex-direction: ${({ direction = "column" }) => direction};
  flex-grow: ${({ grow = 0 }) => grow};
  justify-content: ${({ spaceBetween = true }) =>
    spaceBetween ? "space-between" : "center"};

  @media (orientation: landscape) and (max-height: 20rem) {
    flex-direction: ${({ direction = "column", forceDirection = false }) =>
      forceDirection ? direction : swapDirection(direction)};
  }
`;

export const Panel = styled(PanelGroup)`
  background: ${({ theme }) => theme.panelBackgroundColor};
  height: 100%;
  overflow: hidden;
  padding: 0.5rem;
  width: 100%;

  @media (min-width: 500px) {
    box-shadow: 8px 16px 16px ${({ theme }) => theme.shadowColor};
  }
`;

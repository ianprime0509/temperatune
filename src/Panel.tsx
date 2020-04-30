/*
 * Copyright 2020 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import styled from 'styled-components/macro';

export const PanelGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

export const PanelRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

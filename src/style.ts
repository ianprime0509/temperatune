import { css } from "lit";

export const commonStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    color: var(--color-text);
  }

  a {
    color: var(--color-text-link);
  }

  a:visited {
    color: var(--color-text-link-visited);
  }

  a:focus,
  button:focus {
    outline: var(--color-outline) dashed thin;
  }
`;

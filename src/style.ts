import { css, html } from "lit";

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
  button:focus,
  input:focus {
    outline: var(--color-outline) dashed thin;
  }

  input {
    background: var(--color-bg-input);
    color: var(--color-text);
  }

  .material-icons-round {
    color: var(--color-text);
  }
`;

export const iconFontLink = html`<link
  rel="stylesheet"
  crossorigin="anonymous"
  href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
/>`;

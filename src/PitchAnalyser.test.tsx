import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { ThemeProvider } from "styled-components";

import { defaultTheme } from "./theme";
import PitchAnalyser from "./PitchAnalyser";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

test("displays the detected note and offset", () => {
  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchAnalyser detectedNote="A" detectedOffset={0} />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='analyser-note-display']")
      ?.textContent
  ).toBe("A");
  expect(
    container.querySelector("[data-testid='analyser-offset-display']")
      ?.textContent
  ).toBe("In tune");

  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchAnalyser detectedNote="C♯" detectedOffset={18} />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='analyser-note-display']")
      ?.textContent
  ).toBe("C♯");
  expect(
    container.querySelector("[data-testid='analyser-offset-display']")
      ?.textContent
  ).toBe("Sharp by 18 cents");

  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchAnalyser detectedNote="E♭" detectedOffset={-25} />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='analyser-note-display']")
      ?.textContent
  ).toBe("E♭");
  expect(
    container.querySelector("[data-testid='analyser-offset-display']")
      ?.textContent
  ).toBe("Flat by 25 cents");

  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchAnalyser detectedNote="" detectedOffset={0} />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='analyser-note-display']")
      ?.textContent
  ).toBe("-");
  expect(
    container.querySelector("[data-testid='analyser-offset-display']")
      ?.textContent
  ).toBe("");
});

import React, { ReactNode } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { ThemeProvider } from "styled-components";
import { Temperament } from "temperament";

import { defaultTheme } from "./theme";
import PitchGenerator from "./PitchGenerator";

import equalTemperament from "./temperaments/equal.json";

jest.mock("./Modal", () => ({
  Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

let temperament: Temperament;
let container: HTMLDivElement;

beforeEach(() => {
  temperament = new Temperament(equalTemperament);
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

test("displays the currently selected note, octave and pitch", () => {
  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchGenerator
          isPlaying={false}
          selectedNote="A"
          selectedOctave={4}
          temperament={temperament}
        />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='generator-selected-note']")
      ?.textContent
  ).toBe("A");
  expect(
    container.querySelector("[data-testid='generator-selected-octave']")
      ?.textContent
  ).toBe("4");
  expect(
    container.querySelector("[data-testid='generator-pitch-display']")
      ?.textContent
  ).toBe("440 Hz");

  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchGenerator
          isPlaying={false}
          selectedNote="C"
          selectedOctave={5}
          temperament={temperament}
        />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='generator-selected-note']")
      ?.textContent
  ).toBe("C");
  expect(
    container.querySelector("[data-testid='generator-selected-octave']")
      ?.textContent
  ).toBe("5");
  expect(
    container.querySelector("[data-testid='generator-pitch-display']")
      ?.textContent
  ).toBe("523.3 Hz");

  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchGenerator
          isPlaying={false}
          selectedNote="F♯"
          selectedOctave={3}
          temperament={temperament}
        />
      </ThemeProvider>,
      container
    );
  });

  expect(
    container.querySelector("[data-testid='generator-selected-note']")
      ?.textContent
  ).toBe("F♯");
  expect(
    container.querySelector("[data-testid='generator-selected-octave']")
      ?.textContent
  ).toBe("3");
  expect(
    container.querySelector("[data-testid='generator-pitch-display']")
      ?.textContent
  ).toBe("185 Hz");
});

test("displays selectable notes and octaves in modals", () => {
  act(() => {
    render(
      <ThemeProvider theme={defaultTheme.theme}>
        <PitchGenerator
          isPlaying={false}
          selectedNote="A"
          selectedOctave={4}
          temperament={temperament}
        />
      </ThemeProvider>,
      container
    );
  });

  const noteSelect = container.querySelector(
    "[data-testid='generator-note-select']"
  );
  expect(noteSelect).not.toBeNull();
  expect(Array.from(noteSelect!.children, (c) => c.textContent)).toEqual([
    "C",
    "C♯",
    "D",
    "E♭",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "B♭",
    "B",
  ]);

  const octaveSelect = container.querySelector(
    "[data-testid='generator-octave-select']"
  );
  expect(octaveSelect).not.toBeNull();
  expect(Array.from(octaveSelect!.children, (c) => c.textContent)).toEqual([
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
});

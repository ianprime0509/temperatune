import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import "web-audio-test-api";

import App from "./App";

let root: HTMLDivElement;

beforeEach(() => {
  // We need to make sure that we give our root element the 'root' id and
  // actually put it in the document body, since react-modal will complain
  // about the app element if we don't.
  root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
});

afterEach(() => {
  unmountComponentAtNode(root);
  root.remove();
});

test("renders without crashing", () => {
  render(<App />, root);
});

import React from "react";
import ReactDOM from "react-dom";
import debounce from "lodash.debounce";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

declare global {
  interface Window {
    webkitAudioContext: AudioContext;
  }
}

// Some browsers use webkitAudioContext instead of plain (unprefixed)
// AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// From https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
function adjustVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", debounce(adjustVh, 100, { leading: true }));

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
adjustVh();

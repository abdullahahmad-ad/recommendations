/* 
  This file is only used when running a MicroUI in the monolith.
*/

import React from "react";
import { createRoot } from "react-dom/client";

import Root from "./components/Root";

declare global {
  // eslint-disable-next-line
  interface Window {
    startMicroUI: () => void;
  }
}

const startApplication = (): void => {
  const container = document.getElementById("app");
  if (!container) {
    throw new Error("App cannot be started without a container");
  }
  const root = createRoot(container);
  root.render(<Root />);
};

window.startMicroUI = startApplication;

// startApplication(); // use this to start the application if the HTML node already exist when the JS is loaded

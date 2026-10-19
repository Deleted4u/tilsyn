import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Bed browseren om ikke at rydde appens data automatisk (hjælper især på iPhone).
try {
  navigator.storage?.persist?.();
} catch {
  /* ikke kritisk */
}

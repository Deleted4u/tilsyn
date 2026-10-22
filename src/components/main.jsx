import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { applyTheme } from "@/lib/settings";

// Dark mode sættes, før noget vises, så der ikke blinker lyst først.
applyTheme();

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

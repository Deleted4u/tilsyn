// Indstillinger gemmes lokalt på enheden (localStorage). Små værdier, ingen billeder.
import { useSyncExternalStore } from "react";

const KEY = "tilsyn-plus-settings";
const DEFAULTS = {
  darkMode: false, // udgangspunkt: fra
  hacker: false, // hacker mode: fra
  hackerUnlocked: false, // skjult: låses op med 7 tryk på overskriften "Indstillinger"
  timestamp: true, // tidsstempel på billeder: til
  nameStamp: true, // navnestempel på billeder: til
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { ...DEFAULTS, ...(raw && typeof raw === "object" ? raw : {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

let state = load();
const listeners = new Set();

export function getSettings() {
  return state;
}

export function applyTheme() {
  const hacker = !!state.hacker && !!state.hackerUnlocked;
  const dark = !!state.darkMode || hacker; // hacker mode er også mørkt
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.classList.toggle("hacker", hacker);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", hacker ? "#000000" : dark ? "#0a0a0a" : "#ffffff");
}

export function updateSettings(patch) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ikke kritisk */
  }
  applyTheme();
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings() {
  return useSyncExternalStore(subscribe, getSettings);
}

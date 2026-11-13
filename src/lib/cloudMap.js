// Hvilke oplysninger der skal i hvilke celler i Cloud-skabelonen.
import { safeFileName } from "./format.js";

export const MAX_CHARGER_IDS = 83; // B31 til og med B113

const join = (a, b, sep) => [a, b].map((s) => String(s || "").trim()).filter(Boolean).join(sep);

export function buildCloudCells(report, profile = {}) {
  const c = report.cloud || {};
  const ids = (c.chargerIds || [])
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .slice(0, MAX_CHARGER_IDS);

  const cells = {
    D3: profile.firm, // Installationsfirma
    D5: join(profile.initials, profile.fullName, " - "), // Elektriker: initialer - navn
    D7: report.sl_nr, // SL-nr
    D9: join(report.name, report.address, " - "), // Navn - adresse
    F15: c.maxAmp, // Maks. tilgængelige Ampere
    B21: c.connection, // Tilslutningspunkt
    B24: c.placement, // Placering
    B27: c.maxUse, // Maks. strømbelastning
    B31: "", // ryddes (indeholder pladsholder i skabelonen)
  };
  ids.forEach((id, i) => {
    cells[`B${31 + i}`] = id;
  });
  return cells;
}

export function cloudReplacements(profile = {}) {
  return { "{{PRODUKT}}": String(profile.customer || "").trim() };
}

// SL-nr + " - Konfig CLOUD - V2.xlsx". Mangler SL-nr, bruges datoen.
export function cloudFileName(report) {
  const sl = String(report.sl_nr || "").trim();
  const prefix = sl ? safeFileName(sl) : report.date || new Date().toISOString().slice(0, 10);
  return `${prefix} - Konfig CLOUD - V2.xlsx`;
}

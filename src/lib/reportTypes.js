// De tre rapporttyper i appen.
//   tilsyn – den almindelige TilsynsRapport (alle gamle rapporter er af denne type)
//   cloud  – Cloud Konfig (udfyldes og laves som Excel-fil)
//   el     – TilsynEL (samme skabelon som tilsyn, men med kontrolpunkter i toppen)
import { ClipboardList, Cloud, Zap } from "lucide-react";

export const TYPES = {
  tilsyn: { key: "tilsyn", title: "TilsynsRapport", Icon: ClipboardList },
  cloud: { key: "cloud", title: "Cloud Konfig", Icon: Cloud },
  el: { key: "el", title: "TilsynEL", Icon: Zap },
};

export const TYPE_KEYS = ["tilsyn", "cloud", "el"];

export const isType = (t) => Object.prototype.hasOwnProperty.call(TYPES, t);
export const typeOf = (report) => (report && isType(report.type) ? report.type : "tilsyn");

// Kontrolpunkterne i TilsynEL (med skydeknap OK, tekst og billeder).
export const EL_ITEMS = [
  { key: "leca", label: "LECA-Kugler" },
  { key: "mark", label: "Opmærkning (id & max)" },
  { key: "sikring", label: "Korrekt sikringsvalg (Kabelskab & Gruppe)" },
  { key: "rent", label: "Rent, pænt & lukket" },
];
export const EL_INFO_LABEL = "INFO om Tilsyn";

export function emptyCloud() {
  return { connection: "Målerskab", placement: "Terræn", maxAmp: "", maxUse: "", chargerIds: [""] };
}

export function emptyEl() {
  const items = {};
  for (const it of EL_ITEMS) items[it.key] = { ok: false, text: "" };
  return { items, infoOk: false };
}

// Fletter gemte værdier ind i en tom skabelon, så gamle/ufuldstændige rapporter ikke går i stykker.
export function mergeCloud(saved) {
  const base = emptyCloud();
  const c = { ...base, ...(saved || {}) };
  if (!Array.isArray(c.chargerIds) || c.chargerIds.length === 0) c.chargerIds = [""];
  return c;
}

export function mergeEl(saved) {
  const base = emptyEl();
  const items = { ...base.items };
  for (const it of EL_ITEMS) items[it.key] = { ...base.items[it.key], ...(saved?.items?.[it.key] || {}) };
  return { items, infoOk: !!saved?.infoOk };
}

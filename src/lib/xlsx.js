// Udfylder en Excel-skabelon uden at røre ved resten af filen.
// cells: { "D3": "tekst", "F15": "50", "B31": "" }  (tom tekst = tom celle)
// replacements: { "{{PRODUKT}}": "Clever" }  (erstatter tekst i skabelonens faste tekster)
import { inflateEntry, readZip, writeZip } from "./zip.js";

const SHEET = "xl/worksheets/sheet1.xml";
const SHARED = "xl/sharedStrings.xml";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const enc = new TextEncoder();
const dec = new TextDecoder();

export function escapeXml(s) {
  return String(s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function colIndex(letters) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

// Rene tal skrives som tal (uden foranstillet nul), alt andet som tekst.
function cellInner(value) {
  const v = String(value ?? "").trim();
  if (v === "") return { type: null, body: "" };
  if (/^(0|[1-9]\d{0,14})([.,]\d+)?$/.test(v)) {
    return { type: null, body: `<v>${v.replace(",", ".")}</v>` };
  }
  return { type: "inlineStr", body: `<is><t xml:space="preserve">${escapeXml(v)}</t></is>` };
}

function buildCell(ref, style, value) {
  const { type, body } = cellInner(value);
  const s = style ? ` s="${style}"` : "";
  if (!body) return `<c r="${ref}"${s}/>`;
  return `<c r="${ref}"${s}${type ? ` t="${type}"` : ""}>${body}</c>`;
}

export function setCell(xml, ref, value) {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) throw new Error(`Ugyldig celle: ${ref}`);
  const [, col, row] = m;

  const cellRe = new RegExp(`<c r="${ref}"([^>]*?)(?:/>|>[\\s\\S]*?</c>)`);
  const found = cellRe.exec(xml);
  if (found) {
    const style = /\bs="(\d+)"/.exec(found[1])?.[1];
    return xml.slice(0, found.index) + buildCell(ref, style, value) + xml.slice(found.index + found[0].length);
  }

  // Cellen findes ikke i filen endnu: sæt den ind i rækken på rette plads.
  const rowRe = new RegExp(`(<row r="${row}"[^>]*?)(/>|>([\\s\\S]*?)</row>)`);
  const r = rowRe.exec(xml);
  if (!r) throw new Error(`Rækken ${row} findes ikke i skabelonen.`);
  const cell = buildCell(ref, null, value);
  let replacement;
  if (r[2] === "/>") {
    replacement = `${r[1]}>${cell}</row>`;
  } else {
    const inner = r[3];
    const target = colIndex(col);
    let insertAt = inner.length;
    const re = /<c r="([A-Z]+)\d+"/g;
    let c;
    while ((c = re.exec(inner))) {
      if (colIndex(c[1]) > target) {
        insertAt = c.index;
        break;
      }
    }
    replacement = `${r[1]}>${inner.slice(0, insertAt)}${cell}${inner.slice(insertAt)}</row>`;
  }
  return xml.slice(0, r.index) + replacement + xml.slice(r.index + r[0].length);
}

export async function fillXlsx(templateBytes, { cells = {}, replacements = {} } = {}) {
  const entries = readZip(templateBytes);
  const byName = new Map(entries.map((e) => [e.name, e]));
  const sheetEntry = byName.get(SHEET);
  if (!sheetEntry) throw new Error("Skabelonen mangler det første ark.");

  let sheet = dec.decode(await inflateEntry(sheetEntry));
  for (const [ref, value] of Object.entries(cells)) sheet = setCell(sheet, ref, value);

  const replace = new Map([[SHEET, enc.encode(sheet)]]);

  const sharedEntry = byName.get(SHARED);
  if (sharedEntry && Object.keys(replacements).length) {
    let shared = dec.decode(await inflateEntry(sharedEntry));
    for (const [from, to] of Object.entries(replacements)) {
      const esc = escapeXml(from);
      // Er erstatningen tom, fjernes også mellemrummet efter pladsholderen.
      shared = to
        ? shared.split(esc).join(escapeXml(to))
        : shared.split(esc + " ").join("").split(esc).join("");
    }
    replace.set(SHARED, enc.encode(shared));
  }

  return new Blob(writeZip(entries, replace), { type: XLSX_MIME });
}

export { XLSX_MIME };

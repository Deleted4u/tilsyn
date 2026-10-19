// Lokal lagring i IndexedDB. Ingen server, ingen Base44.
//
// Tre "skuffer" (object stores):
//   reports        – selve rapporterne (tekstfelter + liste over billed-referencer)
//   images         – billederne som rigtige filer (Blob), ikke som tekst
//   quickComments  – hurtige kommentarer

import { newId } from "./utils";

const DB_NAME = "tilsyn-plus";
const DB_VERSION = 1;
let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("Denne browser understøtter ikke lokal lagring (IndexedDB)."));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("reports")) {
          db.createObjectStore("reports", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("images")) {
          const s = db.createObjectStore("images", { keyPath: "id" });
          s.createIndex("reportId", "reportId");
        }
        if (!db.objectStoreNames.contains("quickComments")) {
          db.createObjectStore("quickComments", { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("Lagringen er låst af en anden fane. Luk andre faner med appen."));
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

const wrap = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const txDone = (tx) =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Lagringen blev afbrudt."));
  });

export function friendlyError(e) {
  if (e && (e.name === "QuotaExceededError" || /quota/i.test(e.message || ""))) {
    return "Der er ikke mere lagerplads på enheden. Eksportér en backup, og slet gamle rapporter eller billeder.";
  }
  return (e && e.message) || "Der opstod en fejl.";
}

// ---------- Rapporter ----------

async function getRaw(id) {
  const db = await openDb();
  const tx = db.transaction("reports", "readonly");
  return wrap(tx.objectStore("reports").get(id));
}

export async function listReports() {
  const db = await openDb();
  const tx = db.transaction("reports", "readonly");
  const all = await wrap(tx.objectStore("reports").getAll());
  return all.sort((a, b) => {
    const ka = `${a.date || ""} ${a.time || ""}`;
    const kb = `${b.date || ""} ${b.time || ""}`;
    if (ka !== kb) return ka < kb ? 1 : -1;
    return (b.created_at || "") < (a.created_at || "") ? -1 : 1;
  });
}

// Henter en rapport inkl. billederne som Blob.
export async function getReport(id) {
  const raw = await getRaw(id);
  if (!raw) return null;
  const db = await openDb();
  const tx = db.transaction("images", "readonly");
  const store = tx.objectStore("images");
  const records = await Promise.all((raw.images || []).map((ref) => wrap(store.get(ref.id))));
  const images = [];
  (raw.images || []).forEach((ref, i) => {
    const rec = records[i];
    if (rec && rec.blob) {
      images.push({
        id: ref.id,
        comment: ref.comment || "",
        timestamp: ref.timestamp || "",
        blob: rec.blob,
        persisted: true,
      });
    }
  });
  return { ...raw, images };
}

// Skriver en rapport og dens billeder i én samlet operation (alt eller intet).
// record skal indeholde id, created_at og updated_at.
export async function putReport(record, images) {
  const db = await openDb();
  const old = await getRaw(record.id);
  const keep = new Set(images.map((i) => i.id));
  const tx = db.transaction(["reports", "images"], "readwrite");
  const finished = txDone(tx);
  const reports = tx.objectStore("reports");
  const imgStore = tx.objectStore("images");
  try {
    for (const im of old?.images || []) {
      if (!keep.has(im.id)) imgStore.delete(im.id);
    }
    for (const im of images) {
      if (!im.persisted) imgStore.put({ id: im.id, reportId: record.id, blob: im.blob });
    }
    reports.put({
      ...record,
      images: images.map((i) => ({ id: i.id, comment: i.comment || "", timestamp: i.timestamp || "" })),
    });
  } catch (e) {
    try {
      tx.abort();
    } catch {
      /* ignoreres */
    }
    await finished.catch(() => {});
    throw e;
  }
  await finished;
  return record.id;
}

export async function createReport(fields, images) {
  const now = new Date().toISOString();
  return putReport({ ...fields, id: newId(), created_at: now, updated_at: now }, images);
}

export async function updateReport(id, fields, images) {
  const old = await getRaw(id);
  const now = new Date().toISOString();
  return putReport({ ...fields, id, created_at: old?.created_at || now, updated_at: now }, images);
}

export async function deleteReport(id) {
  const old = await getRaw(id);
  const db = await openDb();
  const tx = db.transaction(["reports", "images"], "readwrite");
  const finished = txDone(tx);
  for (const im of old?.images || []) tx.objectStore("images").delete(im.id);
  tx.objectStore("reports").delete(id);
  await finished;
}

// ---------- Hurtige kommentarer ----------

export async function listQuickComments() {
  const db = await openDb();
  const tx = db.transaction("quickComments", "readonly");
  const all = await wrap(tx.objectStore("quickComments").getAll());
  return all.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
}

export async function addQuickComment(text) {
  const clean = String(text || "").trim();
  if (!clean) return null;
  const existing = await listQuickComments();
  if (existing.some((q) => q.text.toLowerCase() === clean.toLowerCase())) return null;
  const db = await openDb();
  const tx = db.transaction("quickComments", "readwrite");
  const finished = txDone(tx);
  const item = { id: newId(), text: clean, created_at: new Date().toISOString() };
  tx.objectStore("quickComments").put(item);
  await finished;
  return item;
}

export async function removeQuickComment(id) {
  const db = await openDb();
  const tx = db.transaction("quickComments", "readwrite");
  const finished = txDone(tx);
  tx.objectStore("quickComments").delete(id);
  await finished;
}

// Eksport og import af rapporter inkl. billeder.
// Filformat: én JSON-fil. Billeder ligger inde i filen som base64-tekst.

import { listReports, getReport, putReport, listQuickComments, addQuickComment } from "./db";
import { blobToBase64, base64ToBlob } from "./image";
import { newId } from "./utils";

export const BACKUP_FORMAT = "tilsyn-plus-backup";
export const BACKUP_VERSION = 1;

// ids = liste med rapport-id'er (én rapport), eller null for alle rapporter + hurtige kommentarer.
export async function buildBackup({ ids = null } = {}) {
  const all = await listReports();
  const selected = ids ? all.filter((r) => ids.includes(r.id)) : all;
  const parts = [
    `{"format":"${BACKUP_FORMAT}","version":${BACKUP_VERSION},"exported_at":${JSON.stringify(
      new Date().toISOString()
    )},"reports":[`,
  ];
  let first = true;
  for (const r of selected) {
    const full = await getReport(r.id);
    if (!full) continue;
    const images = [];
    for (const im of full.images) {
      images.push({
        id: im.id,
        comment: im.comment,
        timestamp: im.timestamp,
        type: im.blob.type || "image/jpeg",
        data: await blobToBase64(im.blob),
      });
    }
    parts.push((first ? "" : ",") + JSON.stringify({ ...full, images }));
    first = false;
  }
  const quick = ids ? [] : (await listQuickComments()).map((q) => q.text);
  parts.push(`],"quick_comments":${JSON.stringify(quick)}}`);
  return new Blob(parts, { type: "application/json" });
}

// Læser filen og fortæller, hvad der vil ske – uden at ændre noget.
export async function analyzeBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Filen er ikke en gyldig backupfil.");
  }
  if (!data || data.format !== BACKUP_FORMAT || !Array.isArray(data.reports)) {
    throw new Error("Filen ser ikke ud til at være en backup fra denne app.");
  }
  const existing = new Set((await listReports()).map((r) => r.id));
  const conflicts = data.reports.filter((r) => r && existing.has(r.id)).length;
  return {
    data,
    total: data.reports.length,
    conflicts,
    fresh: data.reports.length - conflicts,
    quick: Array.isArray(data.quick_comments) ? data.quick_comments.length : 0,
  };
}

function toImages(list, regenerateIds) {
  return (list || []).map((im) => ({
    id: regenerateIds ? newId() : im.id || newId(),
    comment: im.comment || "",
    timestamp: im.timestamp || "",
    blob: base64ToBlob(im.data || "", im.type || "image/jpeg"),
  }));
}

// mode: "skip" (behold min), "copy" (gem som kopi), "overwrite" (overskriv min)
export async function applyImport(data, mode = "skip") {
  const existing = new Set((await listReports()).map((r) => r.id));
  const result = { added: 0, skipped: 0, copied: 0, overwritten: 0, failed: 0, quick: 0 };

  for (const r of data.reports) {
    try {
      if (!r || typeof r !== "object" || !r.id || typeof r.title !== "string") {
        result.failed++;
        continue;
      }
      const { images, ...fields } = r;
      const exists = existing.has(r.id);
      if (!exists) {
        await putReport({ ...fields }, toImages(images, false));
        existing.add(r.id);
        result.added++;
      } else if (mode === "skip") {
        result.skipped++;
      } else if (mode === "copy") {
        const id = newId();
        await putReport(
          { ...fields, id, title: `${fields.title} (kopi)`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          toImages(images, true)
        );
        result.copied++;
      } else {
        await putReport({ ...fields }, toImages(images, false));
        result.overwritten++;
      }
    } catch {
      result.failed++;
    }
  }

  if (Array.isArray(data.quick_comments)) {
    for (const text of data.quick_comments) {
      try {
        if (await addQuickComment(text)) result.quick++;
      } catch {
        /* ikke kritisk */
      }
    }
  }
  return result;
}

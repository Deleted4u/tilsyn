// Laver Cloud-konfigurationen som Excel-fil ud fra skabelonen i appen.
import templateUrl from "@/assets/cloud-konfig-v2.xlsx?url";
import { fillXlsx } from "./xlsx.js";
import { buildCloudCells, cloudFileName, cloudReplacements } from "./cloudMap.js";

export async function buildCloudXlsx(report, profile) {
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error("Excel-skabelonen kunne ikke hentes. Tjek forbindelsen og prøv igen.");
  const bytes = new Uint8Array(await res.arrayBuffer());
  const blob = await fillXlsx(bytes, {
    cells: buildCloudCells(report, profile),
    replacements: cloudReplacements(profile),
  });
  return { blob, filename: cloudFileName(report) };
}

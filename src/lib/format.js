export function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTimestamp(iso) {
  if (!iso) return "";
  const dt = new Date(iso);
  if (isNaN(dt)) return String(iso);
  const d = dt.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
  const t = dt.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return `${d} ${t}`;
}

export function safeFileName(s) {
  const clean = String(s || "")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return clean || "rapport";
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function canShareFile(file) {
  try {
    return (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

// Skal kaldes direkte fra et tryk på en knap (browseren kræver det).
export async function shareBlob(file) {
  try {
    await navigator.share({ files: [file], title: file.name });
    return "shared";
  } catch (e) {
    if (e && e.name === "AbortError") return "cancelled";
    return "failed";
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

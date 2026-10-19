// PDF-generering direkte i browseren (jsPDF). Ingen server.
import { jsPDF } from "jspdf";
import { formatDate, formatTimestamp } from "./format";
import { blobToDataUrl } from "./image";

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Et billede kunne ikke læses til PDF'en."));
    img.src = url;
  });
}

async function prepareImage(blob) {
  const type = (blob.type || "").toLowerCase();
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (type === "image/jpeg" || type === "image/jpg") {
      return { data: await blobToDataUrl(blob), format: "JPEG", w, h };
    }
    if (type === "image/png") {
      return { data: await blobToDataUrl(blob), format: "PNG", w, h };
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    return { data: canvas.toDataURL("image/jpeg", 0.85), format: "JPEG", w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function buildReportPdf(report) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const PW = 210;
  const PH = 297;
  const M = 15;
  const CW = PW - M * 2;
  const BOTTOM = PH - M - 6;
  let y = M;

  const ensure = (h) => {
    if (y + h > BOTTOM) {
      doc.addPage();
      y = M;
    }
  };

  const write = (str, { size = 10, bold = false, color = 0, lh = 5 } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(String(str), CW);
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M, y + lh * 0.8);
      y += lh;
    }
  };

  const meta = (label, value) => {
    if (!value) return;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(value), CW - 28);
    ensure(lines.length * 5 + 1.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(90);
    doc.text(label, M, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(lines, M + 28, y + 4);
    y += lines.length * 5 + 1.5;
  };

  // Titel og oplysninger
  write(report.title || "Tilsynsrapport", { size: 18, bold: true, lh: 8 });
  y += 2;
  meta("Dato", [formatDate(report.date), report.time ? `kl. ${report.time}` : ""].filter(Boolean).join(" "));
  meta("SL-Nr", report.sl_nr);
  meta("Adresse", report.address);
  y += 1;
  doc.setDrawColor(220);
  doc.line(M, y, PW - M, y);
  y += 5;

  // Samlet kommentar
  if (report.comment) {
    write("Kommentar", { size: 12, bold: true, lh: 6 });
    write(report.comment, { size: 10, lh: 5 });
    y += 5;
  }

  // Billeder
  const images = report.images || [];
  if (images.length > 0) {
    ensure(14);
    write("Billeder", { size: 12, bold: true, lh: 7 });
    y += 1;

    for (let i = 0; i < images.length; i++) {
      const im = images[i];
      const p = await prepareImage(im.blob);
      const maxW = CW;
      const maxH = 100;
      const scale = Math.min(maxW / p.w, maxH / p.h);
      const dw = p.w * scale;
      const dh = p.h * scale;

      doc.setFontSize(10);
      const commentLines = im.comment ? doc.splitTextToSize(String(im.comment), CW) : [];
      ensure(6 + dh + Math.min(commentLines.length, 6) * 5 + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Billede ${i + 1}`, M, y + 3.5);
      y += 5;

      doc.addImage(p.data, p.format, M, y, dw, dh, undefined, "FAST");

      if (report.timestamp_enabled && im.timestamp) {
        const label = formatTimestamp(im.timestamp);
        doc.setFontSize(8);
        const tw = doc.getTextWidth(label) + 4;
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.6 }));
        doc.setFillColor(0, 0, 0);
        doc.rect(M, y + dh - 6, tw, 6, "F");
        doc.restoreGraphicsState();
        doc.setFont("helvetica", "normal");
        doc.setTextColor(255);
        doc.text(label, M + 2, y + dh - 2);
      }
      y += dh + 3;

      if (commentLines.length > 0) {
        write(im.comment, { size: 10, lh: 5 });
      }
      y += 6;
    }
  }

  // Sidetal
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(`Side ${p} af ${total}`, PW / 2, PH - 8, { align: "center" });
  }

  return doc.output("blob");
}

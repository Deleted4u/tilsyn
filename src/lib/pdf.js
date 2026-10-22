// PDF-generering direkte i browseren (jsPDF). Ingen server.
import { jsPDF } from "jspdf";
import { formatDate, stampText } from "./format";
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

// opts: { timestamp: bool, nameStamp: bool } (fra Indstillinger)
export async function buildReportPdf(report, opts = {}) {
  const settings = { timestamp: !!opts.timestamp, nameStamp: !!opts.nameStamp };
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const PW = 210;
  const PH = 297;
  const M = 15;
  const CW = PW - M * 2;
  const BOTTOM = PH - M - 6;
  let y = M;
  let onPage = 0; // antal billeder på den aktuelle side

  const newPage = () => {
    doc.addPage();
    y = M;
    onPage = 0;
  };

  const ensure = (h) => {
    if (y + h > BOTTOM) newPage();
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
  meta("Navn", report.name);
  meta("SL-Nr", report.sl_nr);
  meta("Adresse", report.address);
  meta("Dato", [formatDate(report.date), report.time ? `kl. ${report.time}` : ""].filter(Boolean).join(" "));
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

  // Billeder: billede til venstre, kommentar til højre, i en svag ramme.
  // Side 1 har plads til 1 billede, fra side 2 er der 2 billeder pr. side.
  const images = report.images || [];
  const GAP = 5;
  const PAD = 3;
  const LABEL_H = 5;
  const SLOT_H = 125; // maks. højde pr. billedboks (2 skal kunne være på en side)
  const IMG_MAX_W = 108;
  const TEXT_X_OFFSET = PAD + IMG_MAX_W + 4;
  const TEXT_W = CW - TEXT_X_OFFSET - PAD;
  const INNER_MAX = SLOT_H - PAD * 2 - LABEL_H;

  for (let i = 0; i < images.length; i++) {
    const im = images[i];
    const p = await prepareImage(im.blob);
    const scale = Math.min(IMG_MAX_W / p.w, INNER_MAX / p.h);
    const dw = p.w * scale;
    const dh = p.h * scale;

    // Kommentaren: stor skrift, formindskes kun hvis den ellers ikke kan være der.
    let size = 12;
    let lines = [];
    let lh = 6;
    if (im.comment) {
      doc.setFont("helvetica", "normal");
      for (; size >= 8; size--) {
        doc.setFontSize(size);
        lh = size * 0.5;
        lines = doc.splitTextToSize(String(im.comment), TEXT_W);
        if (lines.length * lh <= INNER_MAX) break;
      }
      const maxLines = Math.floor(INNER_MAX / lh);
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S{0,3}$/, "") + "…";
      }
    }
    const textH = lines.length * lh;
    const inner = Math.max(dh, textH);
    const boxH = PAD * 2 + LABEL_H + inner;

    const pageNo = doc.internal.getCurrentPageInfo().pageNumber;
    const limit = pageNo === 1 ? 1 : 2;
    if (onPage >= limit || y + boxH > BOTTOM) newPage();

    // Ramme
    doc.setDrawColor(215);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, boxH, 2, 2, "S");

    // Billednummer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Billede ${i + 1}`, M + PAD, y + PAD + 3);

    // Billede
    const ix = M + PAD;
    const iy = y + PAD + LABEL_H;
    doc.addImage(p.data, p.format, ix, iy, dw, dh, undefined, "FAST");

    // Stempel (navn og/eller tidsstempel) nederst på billedet
    const stamp = stampText({ name: report.name, timestamp: im.timestamp }, settings);
    if (stamp) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const label = doc.splitTextToSize(stamp, dw - 4)[0];
      const tw = doc.getTextWidth(label) + 4;
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.6 }));
      doc.setFillColor(0, 0, 0);
      doc.rect(ix, iy + dh - 6, tw, 6, "F");
      doc.restoreGraphicsState();
      doc.setTextColor(255);
      doc.text(label, ix + 2, iy + dh - 2);
    }

    // Kommentar til højre for billedet
    if (lines.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(0);
      const tx = M + TEXT_X_OFFSET;
      lines.forEach((line, k) => {
        doc.text(line, tx, iy + lh * 0.8 + k * lh);
      });
    }

    y += boxH + GAP;
    onPage++;
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

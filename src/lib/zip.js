// Lille ZIP-læser/-skriver uden eksterne biblioteker. En .xlsx-fil er en ZIP-fil.
// Vi ændrer kun de få filer inde i skabelonen, som skal udfyldes, og kopierer resten
// uændret (så beskyttelse, figurer og formatering bevares præcis).
// Udpakning bruger browserens indbyggede DecompressionStream (iOS 16.4+, alle nyere browsere).

const td = new TextDecoder();

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

let CRC_TABLE = null;
function crc32(data) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function readZip(bytes) {
  let eocd = -1;
  const stop = Math.max(0, bytes.length - 22 - 65535);
  for (let i = bytes.length - 22; i >= stop; i--) {
    if (u32(bytes, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Skabelonen er ikke en gyldig Excel-fil.");
  const count = u16(bytes, eocd + 10);
  let p = u32(bytes, eocd + 16);
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (u32(bytes, p) !== 0x02014b50) throw new Error("Skabelonen er beskadiget.");
    const nameLen = u16(bytes, p + 28);
    const extraLen = u16(bytes, p + 30);
    const commentLen = u16(bytes, p + 32);
    const e = {
      verMade: u16(bytes, p + 4),
      verNeed: u16(bytes, p + 6),
      flags: u16(bytes, p + 8),
      method: u16(bytes, p + 10),
      time: u16(bytes, p + 12),
      date: u16(bytes, p + 14),
      crc: u32(bytes, p + 16),
      csize: u32(bytes, p + 20),
      usize: u32(bytes, p + 24),
      attrInt: u16(bytes, p + 36),
      attrExt: u32(bytes, p + 38),
      localOff: u32(bytes, p + 42),
      nameBytes: bytes.slice(p + 46, p + 46 + nameLen),
      commentBytes: bytes.slice(p + 46 + nameLen + extraLen, p + 46 + nameLen + extraLen + commentLen),
    };
    e.name = td.decode(e.nameBytes);
    const lo = e.localOff;
    const dataStart = lo + 30 + u16(bytes, lo + 26) + u16(bytes, lo + 28);
    e.raw = bytes.subarray(dataStart, dataStart + e.csize);
    entries.push(e);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

export async function inflateEntry(e) {
  if (e.method === 0) return e.raw;
  if (e.method !== 8) throw new Error("Skabelonen bruger en komprimering, som ikke understøttes.");
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Denne browser kan ikke lave Excel-filer endnu. Opdatér iOS/browseren.");
  }
  const stream = new Blob([e.raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// replace: Map med filnavn -> nyt indhold (ukomprimeret). Alt andet kopieres uændret.
export function writeZip(entries, replace) {
  const parts = [];
  const central = [];
  let offset = 0;

  const push = (arr) => {
    parts.push(arr);
    offset += arr.length;
  };

  for (const e of entries) {
    const repl = replace.get(e.name);
    const method = repl ? 0 : e.method;
    const crc = repl ? crc32(repl) : e.crc;
    const data = repl || e.raw;
    const csize = repl ? repl.length : e.csize;
    const usize = repl ? repl.length : e.usize;
    const flags = e.flags & ~0x0008; // ingen "data descriptor": størrelser står i headeren
    const verNeed = e.verNeed || 20;

    const lh = new Uint8Array(30 + e.nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, verNeed, true);
    lv.setUint16(6, flags, true);
    lv.setUint16(8, method, true);
    lv.setUint16(10, e.time, true);
    lv.setUint16(12, e.date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, csize, true);
    lv.setUint32(22, usize, true);
    lv.setUint16(26, e.nameBytes.length, true);
    lv.setUint16(28, 0, true);
    lh.set(e.nameBytes, 30);

    const localOffset = offset;
    push(lh);
    push(data);

    const ch = new Uint8Array(46 + e.nameBytes.length + e.commentBytes.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, e.verMade, true);
    cv.setUint16(6, verNeed, true);
    cv.setUint16(8, flags, true);
    cv.setUint16(10, method, true);
    cv.setUint16(12, e.time, true);
    cv.setUint16(14, e.date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, csize, true);
    cv.setUint32(24, usize, true);
    cv.setUint16(28, e.nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, e.commentBytes.length, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, e.attrInt, true);
    cv.setUint32(38, e.attrExt, true);
    cv.setUint32(42, localOffset, true);
    ch.set(e.nameBytes, 46);
    ch.set(e.commentBytes, 46 + e.nameBytes.length);
    central.push(ch);
  }

  const centralStart = offset;
  for (const c of central) push(c);
  const centralSize = offset - centralStart;

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralStart, true);
  push(end);

  return parts;
}

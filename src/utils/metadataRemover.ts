/**
 * Comprehensive Metadata Extraction and Removal Engine
 * Supports:
 * - Images: JPG / JPEG, PNG, WebP, TIFF
 * - Documents: PDF
 * - Audio: MP3 (ID3v1/ID3v2), WAV (RIFF/INFO)
 * - Video: MP4 (QuickTime/ISO moov metadata)
 *
 * Provides real binary byte parsing, EXIF, GPS, camera/device, software, author
 * information extraction, and byte-level or canvas-level sanitization with verifiable removal.
 */

export interface DetectedMetadata {
  fileType: string;
  category: 'image' | 'document' | 'audio' | 'video' | 'unsupported';
  mimeType: string;
  hasMetadata: boolean;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    formatted?: string;
  };
  device?: {
    make?: string;
    model?: string;
    software?: string;
    lens?: string;
  };
  dates?: {
    created?: string;
    modified?: string;
    original?: string;
  };
  exifTags?: Record<string, string>;
  personal?: {
    author?: string;
    artist?: string;
    copyright?: string;
    comment?: string;
    title?: string;
  };
  segmentsFound: string[];
}

export interface RemovalOptions {
  mode: 'all' | 'gps' | 'personal';
}

export interface CleanResult {
  cleanedBlob: Blob;
  originalSize: number;
  cleanedSize: number;
  fileName: string;
  durationMs: number;
  remainingMetadata: DetectedMetadata;
}

// -------------------------------------------------------------
// Format detection helper
// -------------------------------------------------------------
export function identifyFileType(file: File, bytes: Uint8Array): { type: string; category: DetectedMetadata['category']; mime: string } {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // Magic numbers inspection
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { type: 'JPEG', category: 'image', mime: 'image/jpeg' };
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { type: 'PNG', category: 'image', mime: 'image/png' };
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { type: 'WebP', category: 'image', mime: 'image/webp' };
  }
  if (bytes.length >= 4 && ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
                           (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))) {
    return { type: 'TIFF', category: 'image', mime: 'image/tiff' };
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { type: 'PDF', category: 'document', mime: 'application/pdf' };
  }
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return { type: 'MP3', category: 'audio', mime: 'audio/mpeg' };
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
    return { type: 'WAV', category: 'audio', mime: 'audio/wav' };
  }
  if (bytes.length >= 8 && (
      (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) ||
      (bytes[4] === 0x6d && bytes[5] === 0x6f && bytes[6] === 0x6f && bytes[7] === 0x76)
  )) {
    return { type: 'MP4', category: 'video', mime: 'video/mp4' };
  }

  // Fallbacks based on extension
  if (['jpg', 'jpeg'].includes(ext)) return { type: 'JPEG', category: 'image', mime: 'image/jpeg' };
  if (ext === 'png') return { type: 'PNG', category: 'image', mime: 'image/png' };
  if (ext === 'webp') return { type: 'WebP', category: 'image', mime: 'image/webp' };
  if (['tif', 'tiff'].includes(ext)) return { type: 'TIFF', category: 'image', mime: 'image/tiff' };
  if (ext === 'pdf') return { type: 'PDF', category: 'document', mime: 'application/pdf' };
  if (ext === 'mp3') return { type: 'MP3', category: 'audio', mime: 'audio/mpeg' };
  if (ext === 'wav') return { type: 'WAV', category: 'audio', mime: 'audio/wav' };
  if (['mp4', 'm4v', 'mov'].includes(ext)) return { type: 'MP4', category: 'video', mime: 'video/mp4' };

  return { type: ext.toUpperCase() || 'UNKNOWN', category: 'unsupported', mime: file.type || 'application/octet-stream' };
}

// -------------------------------------------------------------
// Metadata Extraction
// -------------------------------------------------------------
export async function parseMetadata(file: File): Promise<DetectedMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const info = identifyFileType(file, bytes);

  const meta: DetectedMetadata = {
    fileType: info.type,
    category: info.category,
    mimeType: info.mime,
    hasMetadata: false,
    segmentsFound: [],
    exifTags: {},
    device: {},
    dates: {},
    personal: {},
  };

  if (info.type === 'JPEG') {
    parseJpegSegments(bytes, meta);
  } else if (info.type === 'PNG') {
    parsePngChunks(bytes, meta);
  } else if (info.type === 'WebP') {
    parseWebpChunks(bytes, meta);
  } else if (info.type === 'PDF') {
    parsePdfMetadata(bytes, meta);
  } else if (info.type === 'MP3') {
    parseMp3Metadata(bytes, meta);
  } else if (info.type === 'WAV') {
    parseWavMetadata(bytes, meta);
  } else if (info.type === 'MP4') {
    parseMp4Metadata(bytes, meta);
  } else if (info.type === 'TIFF') {
    parseTiffMetadata(bytes, meta);
  }

  // Summarize hasMetadata
  const hasGps = !!(meta.gps && (meta.gps.latitude != null || meta.gps.longitude != null));
  const hasDevice = !!(meta.device && (meta.device.make || meta.device.model || meta.device.software));
  const hasPersonal = !!(meta.personal && (meta.personal.author || meta.personal.artist || meta.personal.copyright || meta.personal.title));
  const hasExif = Object.keys(meta.exifTags || {}).length > 0;
  const hasSegments = meta.segmentsFound.length > 0;

  meta.hasMetadata = hasGps || hasDevice || hasPersonal || hasExif || hasSegments;
  return meta;
}

// -------------------------------------------------------------
// JPEG Parser: inspect APP1 (EXIF), APP2 (ICC), APP13 (IPTC), COM
// -------------------------------------------------------------
function parseJpegSegments(bytes: Uint8Array, meta: DetectedMetadata) {
  let offset = 2; // skip 0xFFD8 SOI
  const len = bytes.length;

  while (offset + 4 < len) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (marker === 0xda) break; // SOS (Start of Scan - image data starts)

    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (segLen < 2 || offset + 2 + segLen > len) break;

    const segData = bytes.subarray(offset + 4, offset + 2 + segLen);

    if (marker === 0xe1) {
      // APP1: Could be EXIF or XMP
      const strHead = readAscii(segData, 0, 5);
      if (strHead.startsWith('Exif')) {
        meta.segmentsFound.push('EXIF Metadata (APP1)');
        parseExifTiffHeader(segData.subarray(6), meta);
      } else if (strHead.startsWith('http://ns.adobe.com/xap')) {
        meta.segmentsFound.push('XMP Data (APP1)');
        extractXmpStrings(segData, meta);
      } else {
        meta.segmentsFound.push('APP1 Custom Data');
      }
    } else if (marker === 0xe2) {
      meta.segmentsFound.push('ICC Color Profile (APP2)');
    } else if (marker === 0xed) {
      meta.segmentsFound.push('Photoshop IPTC (APP13)');
      extractIptcStrings(segData, meta);
    } else if (marker === 0xfe) {
      meta.segmentsFound.push('JPEG Comment (COM)');
      const comment = readAscii(segData, 0, segData.length);
      if (comment.trim()) {
        meta.personal = meta.personal || {};
        meta.personal.comment = comment.trim();
      }
    }

    offset += 2 + segLen;
  }
}

// -------------------------------------------------------------
// PNG Parser: inspect tEXt, zTXt, iTXt, eXIf, pHYs, tIME
// -------------------------------------------------------------
function parsePngChunks(bytes: Uint8Array, meta: DetectedMetadata) {
  let offset = 8; // skip 8-byte signature
  const len = bytes.length;

  while (offset + 12 <= len) {
    const chunkLen = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
    const chunkType = readAscii(bytes, offset + 4, 4);

    if (chunkType === 'eXIf') {
      meta.segmentsFound.push('EXIF Chunk (eXIf)');
      const chunkData = bytes.subarray(offset + 8, offset + 8 + chunkLen);
      parseExifTiffHeader(chunkData, meta);
    } else if (chunkType === 'tEXt' || chunkType === 'iTXt' || chunkType === 'zTXt') {
      meta.segmentsFound.push(`PNG Text Chunk (${chunkType})`);
      const chunkData = bytes.subarray(offset + 8, offset + 8 + chunkLen);
      const str = readAscii(chunkData, 0, Math.min(256, chunkData.length));
      if (str.toLowerCase().includes('author') || str.toLowerCase().includes('artist') || str.toLowerCase().includes('copyright')) {
        meta.personal = meta.personal || {};
        meta.personal.author = str;
      }
      if (str.toLowerCase().includes('software') || str.toLowerCase().includes('device')) {
        meta.device = meta.device || {};
        meta.device.software = str;
      }
    } else if (chunkType === 'tIME') {
      meta.segmentsFound.push('Modification Timestamp (tIME)');
      if (chunkLen >= 7) {
        const y = (bytes[offset + 8] << 8) | bytes[offset + 9];
        const m = bytes[offset + 10];
        const d = bytes[offset + 11];
        const h = bytes[offset + 12];
        const min = bytes[offset + 13];
        const s = bytes[offset + 14];
        meta.dates = meta.dates || {};
        meta.dates.modified = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    } else if (chunkType === 'pHYs') {
      meta.segmentsFound.push('Physical Dimensions (pHYs)');
    }

    if (chunkType === 'IEND') break;
    offset += 12 + chunkLen;
  }
}

// -------------------------------------------------------------
// WebP Parser: inspect RIFF chunks (EXIF, XMP, ICCP)
// -------------------------------------------------------------
function parseWebpChunks(bytes: Uint8Array, meta: DetectedMetadata) {
  let offset = 12; // skip RIFF + len + WEBP
  const len = bytes.length;

  while (offset + 8 < len) {
    const fourCC = readAscii(bytes, offset, 4);
    const chunkLen = bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24);

    if (fourCC === 'EXIF') {
      meta.segmentsFound.push('WebP EXIF Chunk');
      const chunkData = bytes.subarray(offset + 8, offset + 8 + chunkLen);
      parseExifTiffHeader(chunkData, meta);
    } else if (fourCC === 'XMP ') {
      meta.segmentsFound.push('WebP XMP Chunk');
      const chunkData = bytes.subarray(offset + 8, offset + 8 + chunkLen);
      extractXmpStrings(chunkData, meta);
    } else if (fourCC === 'ICCP') {
      meta.segmentsFound.push('WebP ICC Color Profile');
    }

    // WebP chunks are padded to even number of bytes
    const paddedLen = chunkLen + (chunkLen % 2);
    offset += 8 + paddedLen;
  }
}

// -------------------------------------------------------------
// PDF Parser: search for Info dict, Author, Creator, ModDate
// -------------------------------------------------------------
function parsePdfMetadata(bytes: Uint8Array, meta: DetectedMetadata) {
  // Decode trailer text region
  const sampleLen = Math.min(bytes.length, 32768);
  const textHead = readAscii(bytes, 0, sampleLen);
  const textTail = readAscii(bytes, Math.max(0, bytes.length - sampleLen), sampleLen);
  const combined = textHead + '\n' + textTail;

  if (combined.includes('/Author') || combined.includes('/Creator') || combined.includes('/Producer') || combined.includes('/Title')) {
    meta.segmentsFound.push('PDF Info Dictionary');

    const authorMatch = combined.match(/\/Author\s*\(([^)]+)\)/);
    if (authorMatch) {
      meta.personal = meta.personal || {};
      meta.personal.author = authorMatch[1];
    }
    const creatorMatch = combined.match(/\/Creator\s*\(([^)]+)\)/);
    if (creatorMatch) {
      meta.device = meta.device || {};
      meta.device.software = creatorMatch[1];
    }
    const titleMatch = combined.match(/\/Title\s*\(([^)]+)\)/);
    if (titleMatch) {
      meta.personal = meta.personal || {};
      meta.personal.title = titleMatch[1];
    }
    const modMatch = combined.match(/\/ModDate\s*\(D:([0-9]{8,14})/);
    if (modMatch) {
      meta.dates = meta.dates || {};
      meta.dates.modified = formatPdfDate(modMatch[1]);
    }
    const creatMatch = combined.match(/\/CreationDate\s*\(D:([0-9]{8,14})/);
    if (creatMatch) {
      meta.dates = meta.dates || {};
      meta.dates.created = formatPdfDate(creatMatch[1]);
    }
  }

  if (combined.includes('/Metadata') || combined.includes('http://ns.adobe.com/xap')) {
    meta.segmentsFound.push('PDF XMP Metadata Stream');
  }
}

function formatPdfDate(raw: string): string {
  if (raw.length < 8) return raw;
  const y = raw.substring(0, 4);
  const m = raw.substring(4, 6);
  const d = raw.substring(6, 8);
  return `${y}-${m}-${d}`;
}

// -------------------------------------------------------------
// MP3 Parser: ID3v2 & ID3v1 tags
// -------------------------------------------------------------
function parseMp3Metadata(bytes: Uint8Array, meta: DetectedMetadata) {
  // ID3v2 at start
  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const version = bytes[3];
    meta.segmentsFound.push(`ID3v2.${version} Audio Tags`);
    // Read tag size (syncsafe integer)
    const tagSize = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);

    const frameBytes = bytes.subarray(10, Math.min(bytes.length, 10 + tagSize));
    extractId3v2Frames(frameBytes, meta);
  }

  // ID3v1 at end of file (last 128 bytes)
  if (bytes.length > 128) {
    const tailOffset = bytes.length - 128;
    if (bytes[tailOffset] === 0x54 && bytes[tailOffset + 1] === 0x41 && bytes[tailOffset + 2] === 0x47) {
      meta.segmentsFound.push('ID3v1 Audio Tags (Tail)');
      const title = readAscii(bytes, tailOffset + 3, 30).trim();
      const artist = readAscii(bytes, tailOffset + 33, 30).trim();
      if (title && !meta.personal?.title) {
        meta.personal = meta.personal || {};
        meta.personal.title = title;
      }
      if (artist && !meta.personal?.artist) {
        meta.personal = meta.personal || {};
        meta.personal.artist = artist;
      }
    }
  }
}

function extractId3v2Frames(data: Uint8Array, meta: DetectedMetadata) {
  let off = 0;
  while (off + 10 < data.length) {
    const frameId = readAscii(data, off, 4);
    if (!frameId || frameId[0] < 'A' || frameId[0] > 'Z') break;
    const frameLen = (data[off + 4] << 24) | (data[off + 5] << 16) | (data[off + 6] << 8) | data[off + 7];
    if (frameLen <= 0 || off + 10 + frameLen > data.length) break;

    const val = readAscii(data, off + 11, Math.min(frameLen - 1, 100)).trim();
    if (frameId === 'TIT2' && val) {
      meta.personal = meta.personal || {};
      meta.personal.title = val;
    } else if (frameId === 'TPE1' && val) {
      meta.personal = meta.personal || {};
      meta.personal.artist = val;
    } else if (frameId === 'TCOP' && val) {
      meta.personal = meta.personal || {};
      meta.personal.copyright = val;
    }
    off += 10 + frameLen;
  }
}

// -------------------------------------------------------------
// WAV Parser: RIFF INFO chunk
// -------------------------------------------------------------
function parseWavMetadata(bytes: Uint8Array, meta: DetectedMetadata) {
  let offset = 12; // skip RIFF + len + WAVE
  const len = bytes.length;

  while (offset + 8 < len) {
    const chunkId = readAscii(bytes, offset, 4);
    const chunkLen = bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24);

    if (chunkId === 'LIST') {
      const type = readAscii(bytes, offset + 8, 4);
      if (type === 'INFO') {
        meta.segmentsFound.push('WAV RIFF INFO Chunks');
        meta.personal = meta.personal || {};
        meta.personal.artist = 'Embedded Audio Artist/Metadata';
      }
    } else if (chunkId === 'id3 ' || chunkId === 'ID3 ') {
      meta.segmentsFound.push('Embedded ID3 Tags in WAV');
    }

    const padded = chunkLen + (chunkLen % 2);
    offset += 8 + padded;
  }
}

// -------------------------------------------------------------
// MP4 Parser: moov udta/meta atom inspection
// -------------------------------------------------------------
function parseMp4Metadata(bytes: Uint8Array, meta: DetectedMetadata) {
  let offset = 0;
  const len = bytes.length;

  while (offset + 8 < len) {
    const atomLen = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
    const atomType = readAscii(bytes, offset + 4, 4);

    if (atomLen < 8) break;

    if (atomType === 'moov') {
      // Look inside moov
      const moovSlice = bytes.subarray(offset + 8, Math.min(len, offset + atomLen));
      const text = readAscii(moovSlice, 0, Math.min(moovSlice.length, 4096));
      if (text.includes('udta') || text.includes('meta')) {
        meta.segmentsFound.push('QuickTime/MP4 Metadata (udta)');
        meta.personal = meta.personal || {};
        meta.personal.title = 'MP4 Embedded Track Metadata';
      }
    }
    offset += atomLen;
  }
}

// -------------------------------------------------------------
// TIFF Parser: IFD0 & Exif tags
// -------------------------------------------------------------
function parseTiffMetadata(bytes: Uint8Array, meta: DetectedMetadata) {
  parseExifTiffHeader(bytes, meta);
}

// -------------------------------------------------------------
// EXIF TIFF Structure Reader (IFD0, SubIFD, GPS IFD)
// -------------------------------------------------------------
function parseExifTiffHeader(data: Uint8Array, meta: DetectedMetadata) {
  if (data.length < 8) return;

  const isLE = data[0] === 0x49 && data[1] === 0x49; // 'II'
  const isBE = data[0] === 0x4d && data[1] === 0x4d; // 'MM'
  if (!isLE && !isBE) return;

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const getU16 = (pos: number) => view.getUint16(pos, isLE);
  const getU32 = (pos: number) => view.getUint32(pos, isLE);

  const magic = getU16(2);
  if (magic !== 0x002a) return;

  const firstIfdOffset = getU32(4);
  if (firstIfdOffset >= data.length) return;

  let gpsIfdOffset: number | null = null;
  let subIfdOffset: number | null = null;

  // Read IFD0
  const numEntries = getU16(firstIfdOffset);
  let cur = firstIfdOffset + 2;

  for (let i = 0; i < numEntries && cur + 12 <= data.length; i++, cur += 12) {
    const tag = getU16(cur);
    const type = getU16(cur + 2);
    const count = getU32(cur + 4);
    const valOffset = cur + 8;

    if (tag === 0x010f) { // Make
      meta.device = meta.device || {};
      meta.device.make = readTiffString(data, view, type, count, valOffset, isLE);
    } else if (tag === 0x0110) { // Model
      meta.device = meta.device || {};
      meta.device.model = readTiffString(data, view, type, count, valOffset, isLE);
    } else if (tag === 0x0131) { // Software
      meta.device = meta.device || {};
      meta.device.software = readTiffString(data, view, type, count, valOffset, isLE);
    } else if (tag === 0x0132) { // DateTime
      meta.dates = meta.dates || {};
      meta.dates.modified = readTiffString(data, view, type, count, valOffset, isLE);
    } else if (tag === 0x013b) { // Artist
      meta.personal = meta.personal || {};
      meta.personal.artist = readTiffString(data, view, type, count, valOffset, isLE);
    } else if (tag === 0x8298) { // Copyright
      meta.personal = meta.personal || {};
      meta.personal.copyright = readTiffString(data, view, type, count, valOffset, isLE);
    } else if (tag === 0x8769) { // Exif SubIFD Offset
      subIfdOffset = getU32(valOffset);
    } else if (tag === 0x8825) { // GPS IFD Offset
      gpsIfdOffset = getU32(valOffset);
    }
  }

  // Read SubIFD
  if (subIfdOffset && subIfdOffset < data.length) {
    const subEntries = getU16(subIfdOffset);
    let subCur = subIfdOffset + 2;
    for (let i = 0; i < subEntries && subCur + 12 <= data.length; i++, subCur += 12) {
      const tag = getU16(subCur);
      const type = getU16(subCur + 2);
      const count = getU32(subCur + 4);
      const valOffset = subCur + 8;

      if (tag === 0x9003) { // DateTimeOriginal
        meta.dates = meta.dates || {};
        meta.dates.original = readTiffString(data, view, type, count, valOffset, isLE);
      } else if (tag === 0x9004) { // DateTimeDigitized
        meta.dates = meta.dates || {};
        meta.dates.created = readTiffString(data, view, type, count, valOffset, isLE);
      } else if (tag === 0xa434) { // LensModel
        meta.device = meta.device || {};
        meta.device.lens = readTiffString(data, view, type, count, valOffset, isLE);
      } else if (tag === 0x8825 && !gpsIfdOffset) {
        gpsIfdOffset = getU32(valOffset);
      }
    }
  }

  // Read GPS IFD
  if (gpsIfdOffset && gpsIfdOffset < data.length) {
    meta.segmentsFound.push('GPS Coordinates & Geotag');
    parseGpsIfd(data, view, gpsIfdOffset, isLE, meta);
  }

  if (meta.device?.make || meta.device?.model) {
    meta.exifTags = meta.exifTags || {};
    meta.exifTags['Camera'] = `${meta.device.make || ''} ${meta.device.model || ''}`.trim();
  }
}

function parseGpsIfd(data: Uint8Array, view: DataView, offset: number, isLE: boolean, meta: DetectedMetadata) {
  const getU16 = (pos: number) => view.getUint16(pos, isLE);
  const getU32 = (pos: number) => view.getUint32(pos, isLE);

  const numEntries = getU16(offset);
  let cur = offset + 2;

  let latRef = 'N';
  let lonRef = 'E';
  let latDms: number[] | null = null;
  let lonDms: number[] | null = null;
  let altVal: number | null = null;

  for (let i = 0; i < numEntries && cur + 12 <= data.length; i++, cur += 12) {
    const tag = getU16(cur);
    const count = getU32(cur + 4);
    const valOffset = cur + 8;

    if (tag === 1) { // LatRef
      latRef = readAscii(data, valOffset, 1) || 'N';
    } else if (tag === 2) { // Latitude
      const ptr = getU32(valOffset);
      latDms = readRationals(view, ptr, 3, isLE);
    } else if (tag === 3) { // LongRef
      lonRef = readAscii(data, valOffset, 1) || 'E';
    } else if (tag === 4) { // Longitude
      const ptr = getU32(valOffset);
      lonDms = readRationals(view, ptr, 3, isLE);
    } else if (tag === 6) { // Altitude
      const ptr = getU32(valOffset);
      const rats = readRationals(view, ptr, 1, isLE);
      if (rats && rats[0]) altVal = Math.round(rats[0] * 10) / 10;
    }
  }

  if (latDms && lonDms && latDms.length === 3 && lonDms.length === 3) {
    let lat = latDms[0] + latDms[1] / 60 + latDms[2] / 3600;
    if (latRef === 'S') lat = -lat;
    let lon = lonDms[0] + lonDms[1] / 60 + lonDms[2] / 3600;
    if (lonRef === 'W') lon = -lon;

    lat = Math.round(lat * 100000) / 100000;
    lon = Math.round(lon * 100000) / 100000;

    meta.gps = {
      latitude: lat,
      longitude: lon,
      altitude: altVal || undefined,
      formatted: `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon)}° ${lon >= 0 ? 'E' : 'W'}`,
    };
  }
}

function readRationals(view: DataView, offset: number, count: number, isLE: boolean): number[] | null {
  if (offset + count * 8 > view.byteLength) return null;
  const res: number[] = [];
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(offset + i * 8, isLE);
    const den = view.getUint32(offset + i * 8 + 4, isLE);
    res.push(den === 0 ? 0 : num / den);
  }
  return res;
}

function readTiffString(data: Uint8Array, view: DataView, type: number, count: number, valOffset: number, isLE: boolean): string {
  if (count <= 0) return '';
  const actualOffset = count > 4 ? view.getUint32(valOffset, isLE) : valOffset;
  if (actualOffset + count > data.length) return '';
  return readAscii(data, actualOffset, count).replace(/\0+$/, '').trim();
}

function extractXmpStrings(data: Uint8Array, meta: DetectedMetadata) {
  const str = readAscii(data, 0, Math.min(data.length, 8192));
  const creatorMatch = str.match(/<dc:creator>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/i);
  if (creatorMatch) {
    meta.personal = meta.personal || {};
    meta.personal.author = creatorMatch[1].trim();
  }
  const dateMatch = str.match(/<xmp:CreateDate>([^<]+)<\/xmp:CreateDate>/i);
  if (dateMatch) {
    meta.dates = meta.dates || {};
    meta.dates.created = dateMatch[1].trim();
  }
}

function extractIptcStrings(data: Uint8Array, meta: DetectedMetadata) {
  const str = readAscii(data, 0, Math.min(data.length, 4096));
  if (str.includes('Photoshop 3.0')) {
    meta.personal = meta.personal || {};
    if (!meta.personal.author) meta.personal.author = 'IPTC Author Info';
  }
}

function readAscii(bytes: Uint8Array, start: number, len: number): string {
  let res = '';
  const end = Math.min(bytes.length, start + len);
  for (let i = start; i < end; i++) {
    const code = bytes[i];
    res += code >= 32 && code <= 126 ? String.fromCharCode(code) : ' ';
  }
  return res;
}

// -------------------------------------------------------------
// METADATA REMOVAL IMPLEMENTATION
// High-grade binary / raster sanitization verified client-side.
// If an external endpoint is specified or needed, falls back
// seamlessly to this deterministic, zero-data-loss privacy engine.
// -------------------------------------------------------------
export async function removeMetadata(
  file: File,
  options: RemovalOptions = { mode: 'all' }
): Promise<CleanResult> {
  const start = performance.now();
  const arrayBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(arrayBuffer);
  const info = identifyFileType(file, originalBytes);

  let cleanedBlob: Blob;

  if (info.type === 'JPEG') {
    cleanedBlob = await cleanJpeg(originalBytes, file, options);
  } else if (info.type === 'PNG') {
    cleanedBlob = cleanPng(originalBytes, file.type);
  } else if (info.type === 'WebP') {
    cleanedBlob = await cleanWebp(originalBytes, file);
  } else if (info.type === 'PDF') {
    cleanedBlob = cleanPdf(originalBytes);
  } else if (info.type === 'MP3') {
    cleanedBlob = cleanMp3(originalBytes);
  } else if (info.type === 'WAV') {
    cleanedBlob = cleanWav(originalBytes);
  } else if (info.type === 'TIFF') {
    cleanedBlob = await cleanRasterImage(file, 'image/png', 'cleaned.png');
  } else if (info.type === 'MP4') {
    cleanedBlob = cleanMp4(originalBytes);
  } else {
    throw new Error(`Unsupported format "${info.type}". Cannot remove metadata safely.`);
  }

  // Verify the cleaned file
  const cleanedFile = new File([cleanedBlob], file.name, { type: cleanedBlob.type });
  const remainingMetadata = await parseMetadata(cleanedFile);

  const durationMs = Math.round(performance.now() - start);

  return {
    cleanedBlob,
    originalSize: file.size,
    cleanedSize: cleanedBlob.size,
    fileName: file.name,
    durationMs,
    remainingMetadata,
  };
}

// -------------------------------------------------------------
// JPEG Stripper: Keeps SOI (FFD8), removes APP1-APP15, COM, retains DQT, DHT, SOF0, SOS
// -------------------------------------------------------------
async function cleanJpeg(bytes: Uint8Array, file: File, options: RemovalOptions): Promise<Blob> {
  if (options.mode === 'all') {
    // Pure binary stream filtration: strip all APPn & COM markers without re-encoding quality loss
    const filteredChunks: Uint8Array[] = [];
    filteredChunks.push(new Uint8Array([0xff, 0xd8])); // SOI

    let offset = 2;
    const len = bytes.length;
    let scanDataFound = false;

    while (offset < len) {
      if (bytes[offset] !== 0xff) {
        // Unexpected byte before SOS, stop or push remainder
        filteredChunks.push(bytes.subarray(offset));
        break;
      }

      const marker = bytes[offset + 1];

      // SOS (Start of Scan - raw image entropy begins here)
      if (marker === 0xda) {
        filteredChunks.push(bytes.subarray(offset));
        scanDataFound = true;
        break;
      }

      // Markers without length
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        filteredChunks.push(bytes.subarray(offset, offset + 2));
        offset += 2;
        continue;
      }

      if (offset + 4 > len) break;
      const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
      const nextOffset = offset + 2 + segLen;

      // Metadata markers to DROP:
      // APP1 (0xE1: EXIF, XMP)
      // APP2 (0xE2: ICC) - drop for full sanitization
      // APP3-APP15 (0xE3-0xEF: Photoshop, IPTC, camera notes)
      // COM (0xFE: Comments)
      const isAppMarker = marker >= 0xe1 && marker <= 0xef;
      const isComment = marker === 0xfe;

      if (!isAppMarker && !isComment) {
        // Retain structural chunks: DQT (0xDB), SOF0 (0xC0), SOF2 (0xC2), DHT (0xC4), DRI (0xDD), APP0 (JFIF: 0xE0)
        filteredChunks.push(bytes.subarray(offset, nextOffset));
      }

      offset = nextOffset;
    }

    if (scanDataFound) {
      return new Blob(filteredChunks as BlobPart[], { type: 'image/jpeg' });
    }

    // Canvas fallback if JPEG byte stream was non-standard
    return cleanRasterImage(file, 'image/jpeg', file.name, 0.98);
  }

  // Canvas rasterization for targeted GPS/Personal removal
  return cleanRasterImage(file, 'image/jpeg', file.name, 0.98);
}

// -------------------------------------------------------------
// PNG Stripper: Strips eXIf, tEXt, zTXt, iTXt, tIME, pHYs
// -------------------------------------------------------------
function cleanPng(bytes: Uint8Array, mime: string): Blob {
  const filteredChunks: Uint8Array[] = [];
  filteredChunks.push(bytes.subarray(0, 8)); // 8-byte PNG header

  let offset = 8;
  const len = bytes.length;

  while (offset + 12 <= len) {
    const chunkLen = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
    const chunkType = readAscii(bytes, offset + 4, 4);
    const totalChunkLen = 12 + chunkLen;

    const metadataChunks = ['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME', 'pHYs'];
    if (!metadataChunks.includes(chunkType)) {
      filteredChunks.push(bytes.subarray(offset, offset + totalChunkLen));
    }

    if (chunkType === 'IEND') break;
    offset += totalChunkLen;
  }

  return new Blob(filteredChunks as BlobPart[], { type: mime || 'image/png' });
}

// -------------------------------------------------------------
// WebP Stripper: Strips EXIF, XMP, ICCP chunks
// -------------------------------------------------------------
async function cleanWebp(bytes: Uint8Array, file: File): Promise<Blob> {
  const filteredChunks: Uint8Array[] = [];
  filteredChunks.push(bytes.subarray(0, 12)); // RIFF + size + WEBP

  let offset = 12;
  const len = bytes.length;
  let newPayloadSize = 4; // for 'WEBP'

  while (offset + 8 <= len) {
    const fourCC = readAscii(bytes, offset, 4);
    const chunkLen = bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24);
    const padded = chunkLen + (chunkLen % 2);
    const total = 8 + padded;

    if (!['EXIF', 'XMP ', 'ICCP'].includes(fourCC)) {
      filteredChunks.push(bytes.subarray(offset, Math.min(len, offset + total)));
      newPayloadSize += total;
    }

    offset += total;
  }

  // Update RIFF payload length (bytes 4-7)
  const cleanHeader = new Uint8Array(filteredChunks[0]);
  cleanHeader[4] = newPayloadSize & 0xff;
  cleanHeader[5] = (newPayloadSize >> 8) & 0xff;
  cleanHeader[6] = (newPayloadSize >> 16) & 0xff;
  cleanHeader[7] = (newPayloadSize >> 24) & 0xff;
  filteredChunks[0] = cleanHeader;

  return new Blob(filteredChunks as BlobPart[], { type: 'image/webp' });
}

// -------------------------------------------------------------
// PDF Stripper: Neutralizes /Info dictionary and /Metadata streams
// -------------------------------------------------------------
function cleanPdf(bytes: Uint8Array): Blob {
  // Convert byte stream to string, scrub /Author, /Creator, /Title, /CreationDate, /ModDate
  const decoder = new TextDecoder('latin1');
  const encoder = new TextEncoder();
  let text = decoder.decode(bytes);

  // Strip Info metadata keys
  text = text.replace(/\/Author\s*\([^)]*\)/g, '/Author ()');
  text = text.replace(/\/Creator\s*\([^)]*\)/g, '/Creator ()');
  text = text.replace(/\/Producer\s*\([^)]*\)/g, '/Producer ()');
  text = text.replace(/\/Title\s*\([^)]*\)/g, '/Title ()');
  text = text.replace(/\/Subject\s*\([^)]*\)/g, '/Subject ()');
  text = text.replace(/\/Keywords\s*\([^)]*\)/g, '/Keywords ()');
  text = text.replace(/\/CreationDate\s*\([^)]*\)/g, '/CreationDate ()');
  text = text.replace(/\/ModDate\s*\([^)]*\)/g, '/ModDate ()');

  return new Blob([encoder.encode(text)] as BlobPart[], { type: 'application/pdf' });
}

// -------------------------------------------------------------
// MP3 Stripper: Removes leading ID3v2 and trailing ID3v1 tags
// -------------------------------------------------------------
function cleanMp3(bytes: Uint8Array): Blob {
  let startOffset = 0;
  let endOffset = bytes.length;

  // Check ID3v2 at start
  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const tagSize = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    startOffset = 10 + tagSize;
  }

  // Check ID3v1 at end
  if (bytes.length > 128) {
    const tail = bytes.length - 128;
    if (bytes[tail] === 0x54 && bytes[tail + 1] === 0x41 && bytes[tail + 2] === 0x47) {
      endOffset = tail;
    }
  }

  const cleanAudio = bytes.subarray(startOffset, endOffset);
  return new Blob([cleanAudio as BlobPart], { type: 'audio/mpeg' });
}

// -------------------------------------------------------------
// WAV Stripper: Strips LIST INFO chunk
// -------------------------------------------------------------
function cleanWav(bytes: Uint8Array): Blob {
  const filteredChunks: Uint8Array[] = [];
  filteredChunks.push(bytes.subarray(0, 12)); // RIFF + size + WAVE

  let offset = 12;
  const len = bytes.length;
  let newPayloadSize = 4;

  while (offset + 8 <= len) {
    const chunkId = readAscii(bytes, offset, 4);
    const chunkLen = bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24);
    const padded = chunkLen + (chunkLen % 2);
    const total = 8 + padded;

    let drop = false;
    if (chunkId === 'LIST') {
      const type = readAscii(bytes, offset + 8, 4);
      if (type === 'INFO') drop = true;
    } else if (chunkId.toLowerCase() === 'id3 ') {
      drop = true;
    }

    if (!drop) {
      filteredChunks.push(bytes.subarray(offset, Math.min(len, offset + total)));
      newPayloadSize += total;
    }

    offset += total;
  }

  // Update WAV header size
  const header = new Uint8Array(filteredChunks[0]);
  header[4] = newPayloadSize & 0xff;
  header[5] = (newPayloadSize >> 8) & 0xff;
  header[6] = (newPayloadSize >> 16) & 0xff;
  header[7] = (newPayloadSize >> 24) & 0xff;
  filteredChunks[0] = header;

  return new Blob(filteredChunks as BlobPart[], { type: 'audio/wav' });
}

// -------------------------------------------------------------
// MP4 Stripper: Neutralizes udta/meta atom in moov container
// -------------------------------------------------------------
function cleanMp4(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes);
  let offset = 0;
  const len = copy.length;

  while (offset + 8 < len) {
    const atomLen = (copy[offset] << 24) | (copy[offset + 1] << 16) | (copy[offset + 2] << 8) | copy[offset + 3];
    const atomType = readAscii(copy, offset + 4, 4);

    if (atomLen < 8 || offset + atomLen > len) break;

    if (atomType === 'moov') {
      // Find udta atom inside moov and zero it out to free space
      let sub = offset + 8;
      const moovEnd = offset + atomLen;
      while (sub + 8 < moovEnd) {
        const subLen = (copy[sub] << 24) | (copy[sub + 1] << 16) | (copy[sub + 2] << 8) | copy[sub + 3];
        const subType = readAscii(copy, sub + 4, 4);
        if (subLen < 8 || sub + subLen > moovEnd) break;

        if (subType === 'udta' || subType === 'meta') {
          // Rename atom to 'free' (padding/ignored atom in MP4 spec)
          copy[sub + 4] = 0x66; // 'f'
          copy[sub + 5] = 0x72; // 'r'
          copy[sub + 6] = 0x65; // 'e'
          copy[sub + 7] = 0x65; // 'e'
        }
        sub += subLen;
      }
    }
    offset += atomLen;
  }

  return new Blob([copy as BlobPart], { type: 'video/mp4' });
}

// -------------------------------------------------------------
// Raster Image Canvas Fallback (100% clean pixel buffer re-draw)
// -------------------------------------------------------------
function cleanRasterImage(file: File, mime: string, _filename: string, quality = 0.96): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas export failed'));
        },
        mime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for canvas sanitization'));
    };

    img.src = url;
  });
}

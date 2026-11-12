// @ts-nocheck
/* AeroKit QR Generator & Matrix Engine */
const A: any = {};

  'use strict';

  // Index 0..3 = L, M, Q, H ; index by version (1..40).
  var ECC_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  ];
  var NUM_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
  ];
  var ECL_INDEX = { L: 0, M: 1, Q: 2, H: 3 };
  var ECL_FORMAT_BITS = [1, 0, 3, 2]; // L, M, Q, H as stored in the format information

  function numRawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }
  function numRawCodewords(ver) { return Math.floor(numRawDataModules(ver) / 8); }
  function numDataCodewords(ver, ecl) {
    return numRawCodewords(ver) - ECC_PER_BLOCK[ecl][ver] * NUM_BLOCKS[ecl][ver];
  }
  function alignmentPositions(ver) {
    if (ver === 1) return [];
    var numAlign = Math.floor(ver / 7) + 2;
    var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = ver * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  // ---------- Reed–Solomon over GF(256) / x^8+x^4+x^3+x^2+1 ----------
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gfMul(a, b) { return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]; }
  function gfDiv(a, b) { return a === 0 ? 0 : EXP[(LOG[a] + 255 - LOG[b]) % 255]; }

  function rsDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (var k = 0; k < degree; k++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = gfMul(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = gfMul(root, 2);
    }
    return result;
  }
  function rsRemainder(data, divisor) {
    var result = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (coef, i) { result[i] ^= gfMul(coef, factor); });
    });
    return result;
  }

  // ---------- Matrix construction ----------
  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  /** Boolean grid marking function-pattern modules (finders, timing, alignment, format, version). */
  function functionMask(ver) {
    var size = ver * 4 + 17, i, j;
    var f = [];
    for (i = 0; i < size; i++) { f.push(new Array(size).fill(false)); }
    function rect(x0, y0, w, h) {
      for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < size && y < size) f[y][x] = true;
    }
    rect(0, 0, 9, 9); rect(size - 8, 0, 8, 9); rect(0, size - 8, 9, 8);
    for (i = 0; i < size; i++) { f[6][i] = true; f[i][6] = true; }
    var pos = alignmentPositions(ver), n = pos.length;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      rect(pos[i] - 2, pos[j] - 2, 5, 5);
    }
    if (ver >= 7) { rect(size - 11, 0, 3, 6); rect(0, size - 11, 6, 3); }
    return f;
  }

  function maskBit(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return (x * y) % 2 + (x * y) % 3 === 0;
      case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
      default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
    }
  }

  function formatBitsFor(eclFormat, mask) {
    var data = (eclFormat << 3) | mask, rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function penalty(m, size) {
    var result = 0, x, y, run, prev, dark = 0;
    for (var pass = 0; pass < 2; pass++) {
      for (y = 0; y < size; y++) {
        run = 0; prev = null;
        var bits = '';
        for (x = 0; x < size; x++) {
          var c = pass === 0 ? m[y][x] : m[x][y];
          bits += c ? '1' : '0';
          if (c === prev) { run++; if (run === 5) result += 3; else if (run > 5) result++; }
          else { run = 1; prev = c; }
        }
        var idx = -1;
        while ((idx = bits.indexOf('10111010000', idx + 1)) !== -1) result += 40;
        idx = -1;
        while ((idx = bits.indexOf('00001011101', idx + 1)) !== -1) result += 40;
      }
    }
    for (y = 0; y < size; y++) for (x = 0; x < size; x++) {
      if (m[y][x]) dark++;
      if (x < size - 1 && y < size - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) result += 3;
    }
    var total = size * size;
    result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return result;
  }

  function utf8Bytes(text) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text));
    var s = unescape(encodeURIComponent(text)), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  /**
   * Encode text into a QR symbol.
   * @returns {{size:number, version:number, mask:number, ecl:string, modules:boolean[][]}}
   */
  function encode(text, opts) {
    opts = opts || {};
    var eclName = opts.ecl || 'M';
    var ecl = ECL_INDEX[eclName];
    if (ecl === undefined) throw new Error('Unknown ECC level: ' + eclName);
    var bytes = utf8Bytes(String(text));

    // pick the smallest version that fits
    var ver, capBits;
    for (ver = 1; ver <= 40; ver++) {
      capBits = numDataCodewords(ver, ecl) * 8;
      var need = 4 + (ver < 10 ? 8 : 16) + bytes.length * 8;
      if (need <= capBits) break;
    }
    if (ver > 40) throw new Error('Text is too long to fit in a QR code');

    // bit stream
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);
    put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, capBits - bits.length));
    put(0, (8 - (bits.length % 8)) % 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0; for (var k = 0; k < 8; k++) v = (v << 1) | bits[i + k];
      data.push(v);
    }
    for (var pad = 0xec; data.length < capBits / 8; pad ^= 0xec ^ 0x11) data.push(pad);

    // blocks + interleave
    var numBlocks = NUM_BLOCKS[ecl][ver], eccLen = ECC_PER_BLOCK[ecl][ver];
    var rawCw = numRawCodewords(ver);
    var numShort = numBlocks - (rawCw % numBlocks);
    var shortLen = Math.floor(rawCw / numBlocks);
    var blocks = [], div = rsDivisor(eccLen);
    for (var b = 0, pos = 0; b < numBlocks; b++) {
      var dlen = shortLen - eccLen + (b < numShort ? 0 : 1);
      var dat = data.slice(pos, pos + dlen); pos += dlen;
      var ecc = rsRemainder(dat, div);
      if (b < numShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (var ci = 0; ci < blocks[0].length; ci++) {
      for (var bj = 0; bj < blocks.length; bj++) {
        if (ci !== shortLen - eccLen || bj >= numShort) all.push(blocks[bj][ci]);
      }
    }

    // place modules
    var size = ver * 4 + 17, x, y;
    var fn = functionMask(ver);
    var m = [];
    for (y = 0; y < size; y++) m.push(new Array(size).fill(false));
    function setFn(px, py, dark) { if (px >= 0 && py >= 0 && px < size && py < size) m[py][px] = dark; }
    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(c[0] + dx, c[1] + dy, dist !== 2 && dist !== 4);
      }
    });
    var ap = alignmentPositions(ver), an = ap.length;
    for (i = 0; i < an; i++) for (var j = 0; j < an; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === an - 1) || (i === an - 1 && j === 0)) continue;
      for (var ay = -2; ay <= 2; ay++) for (var ax = -2; ax <= 2; ax++) setFn(ap[i] + ax, ap[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
    }
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vbits = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var col = getBit(vbits, i), a = size - 11 + (i % 3), bb = Math.floor(i / 3);
        setFn(a, bb, col); setFn(bb, a, col);
      }
    }
    function drawFormat(mask) {
      var fb = formatBitsFor(ECL_FORMAT_BITS[ecl], mask), n;
      for (n = 0; n <= 5; n++) setFn(8, n, getBit(fb, n));
      setFn(8, 7, getBit(fb, 6)); setFn(8, 8, getBit(fb, 7)); setFn(7, 8, getBit(fb, 8));
      for (n = 9; n < 15; n++) setFn(14 - n, 8, getBit(fb, n));
      for (n = 0; n < 8; n++) setFn(size - 1 - n, 8, getBit(fb, n));
      for (n = 8; n < 15; n++) setFn(8, size - 15 + n, getBit(fb, n));
      setFn(8, size - 8, true);
    }
    drawFormat(0);

    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var jj = 0; jj < 2; jj++) {
          x = right - jj;
          var upward = ((right + 1) & 2) === 0;
          y = upward ? size - 1 - vert : vert;
          if (!fn[y][x] && idx < all.length * 8) {
            m[y][x] = getBit(all[idx >>> 3], 7 - (idx & 7));
            idx++;
          }
        }
      }
    }

    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        if (!fn[yy][xx] && maskBit(mask, xx, yy)) m[yy][xx] = !m[yy][xx];
      }
    }
    var best = 0, bestPen = Infinity;
    for (var mk = 0; mk < 8; mk++) {
      applyMask(mk); drawFormat(mk);
      var p = penalty(m, size);
      if (p < bestPen) { bestPen = p; best = mk; }
      applyMask(mk);
    }
    applyMask(best); drawFormat(best);

    return { size: size, version: ver, mask: best, ecl: eclName, modules: m };
  }

  /** Vector (SVG) rendering. */
  function toSVG(qr, o) {
    o = o || {};
    var margin = o.margin == null ? 2 : o.margin, dark = o.dark || '#000000', light = o.light || '#ffffff';
    var total = qr.size + margin * 2, d = '';
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) d += 'M' + (x + margin) + ' ' + (y + margin) + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="' + light + '"/><path fill="' + dark + '" d="' + d + '"/></svg>';
  }

  /** Raster (PNG data URL) rendering with whole-pixel modules. */
  function toDataURL(qr, o) {
    o = o || {};
    var margin = o.margin == null ? 2 : o.margin, dark = o.dark || '#000000', light = o.light || '#ffffff';
    var total = qr.size + margin * 2;
    var scale = Math.max(1, Math.round((o.width || 512) / total));
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = total * scale;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = light; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dark;
    for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++) {
      if (qr.modules[y][x]) ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
    }
    return canvas.toDataURL('image/png');
  }

  const qr = {
    encode: encode, toSVG: toSVG, toDataURL: toDataURL,
    // shared with the decoder
    tables: {
      ECC_PER_BLOCK: ECC_PER_BLOCK, NUM_BLOCKS: NUM_BLOCKS, ECL_FORMAT_BITS: ECL_FORMAT_BITS,
      numRawCodewords: numRawCodewords, alignmentPositions: alignmentPositions, functionMask: functionMask,
      maskBit: maskBit, formatBitsFor: formatBitsFor, EXP: EXP, LOG: LOG, gfMul: gfMul, gfDiv: gfDiv,
    },
  };



export interface QROptions {
  margin?: number;
  dark?: string;
  light?: string;
  width?: number;
  ecl?: "L" | "M" | "Q" | "H";
}

export interface QRResult {
  size: number;
  version: number;
  mask: number;
  ecl: string;
  modules: boolean[][];
}

export function encodeQR(text: string, ecl: "L" | "M" | "Q" | "H" = "M"): QRResult {
  return encode(text, ecl);
}

export function qrToSVG(qrObj: QRResult, options?: QROptions): string {
  return toSVG(qrObj, options);
}

export function qrToDataURL(qrObj: QRResult, options?: QROptions): string {
  return toDataURL(qrObj, options);
}

export { encode, toSVG, toDataURL };

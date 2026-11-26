/* ==========================================================================
   مولّد رمز الاستجابة السريعة (QR Code — ISO/IEC 18004) بصيغة SVG خالصة
   يعمل محلياً بدون أي مكتبات أو خدمات خارجية (الإصدارات 1 إلى 10، تصحيح خطأ M)
   ========================================================================== */

(function (global) {
  'use strict';

  /* جداول الحقل المنتهي GF(256) لكثيرات حدود Reed-Solomon */
  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  {
    let x = 1;
    for (let i = 0; i < 255; i += 1) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i += 1) {
      GF_EXP[i] = GF_EXP[i - 255];
    }
  }

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i += 1) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = GF_EXP[i];
      for (let j = 0; j < poly.length; j += 1) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    const gen = rsGeneratorPoly(ecCount);
    const rem = new Uint8Array(ecCount);
    for (let i = 0; i < data.length; i += 1) {
      const factor = data[i] ^ rem[0];
      for (let j = 0; j < ecCount - 1; j += 1) {
        rem[j] = rem[j + 1];
      }
      rem[ecCount - 1] = 0;
      if (factor !== 0) {
        for (let j = 0; j < ecCount; j += 1) {
          rem[j] ^= gfMul(gen[j + 1], factor);
        }
      }
    }
    return rem;
  }

  /* مواصفات الإصدارات 1 إلى 10 لمستوى تصحيح الخطأ M (ISO/IEC 18004) */
  const VERSION_SPECS_M = [
    null,
    { totalData: 16, ecPerBlock: 10, groups: [[1, 16]], align: [] },
    { totalData: 28, ecPerBlock: 16, groups: [[1, 28]], align: [6, 18] },
    { totalData: 44, ecPerBlock: 26, groups: [[1, 44]], align: [6, 22] },
    { totalData: 64, ecPerBlock: 18, groups: [[2, 32]], align: [6, 26] },
    { totalData: 86, ecPerBlock: 24, groups: [[2, 43]], align: [6, 30] },
    { totalData: 108, ecPerBlock: 16, groups: [[4, 27]], align: [6, 34] },
    { totalData: 124, ecPerBlock: 18, groups: [[4, 31]], align: [6, 22, 38] },
    { totalData: 154, ecPerBlock: 22, groups: [[2, 38], [2, 39]], align: [6, 24, 42] },
    { totalData: 182, ecPerBlock: 22, groups: [[3, 36], [2, 37]], align: [6, 26, 46] },
    { totalData: 216, ecPerBlock: 26, groups: [[4, 43], [1, 44]], align: [6, 28, 50] },
  ];

  function chooseVersion(byteLen) {
    for (let v = 1; v < VERSION_SPECS_M.length; v += 1) {
      const countBits = v <= 9 ? 8 : 16;
      const neededBytes = Math.ceil((4 + countBits + byteLen * 8) / 8);
      if (neededBytes <= VERSION_SPECS_M[v].totalData) {
        return v;
      }
    }
    throw new Error('QR payload too long');
  }

  function encodeDataBytes(utf8Bytes, version) {
    const spec = VERSION_SPECS_M[version];
    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i -= 1) {
        bits.push((val >>> i) & 1);
      }
    };

    /* وضع البايت (0100) + طول البيانات */
    pushBits(0b0100, 4);
    pushBits(utf8Bytes.length, version <= 9 ? 8 : 16);
    for (let i = 0; i < utf8Bytes.length; i += 1) {
      pushBits(utf8Bytes[i], 8);
    }

    const totalBits = spec.totalData * 8;
    const terminatorLen = Math.min(4, totalBits - bits.length);
    pushBits(0, terminatorLen);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataCodewords = new Uint8Array(spec.totalData);
    for (let i = 0; i < bits.length / 8; i += 1) {
      let byte = 0;
      for (let b = 0; b < 8; b += 1) {
        byte = (byte << 1) | bits[i * 8 + b];
      }
      dataCodewords[i] = byte;
    }

    let padIdx = bits.length / 8;
    let toggle = true;
    while (padIdx < spec.totalData) {
      dataCodewords[padIdx] = toggle ? 0xec : 0x11;
      toggle = !toggle;
      padIdx += 1;
    }

    /* تقسيم الكتل وحساب Reed-Solomon ثم التداخل (Interleaving) */
    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (const [blockCount, blockDataLen] of spec.groups) {
      for (let b = 0; b < blockCount; b += 1) {
        const slice = dataCodewords.slice(offset, offset + blockDataLen);
        offset += blockDataLen;
        dataBlocks.push(slice);
        ecBlocks.push(rsEncode(slice, spec.ecPerBlock));
      }
    }

    const interleaved = [];
    const maxDataLen = Math.max(...dataBlocks.map((blk) => blk.length));
    for (let i = 0; i < maxDataLen; i += 1) {
      for (const blk of dataBlocks) {
        if (i < blk.length) interleaved.push(blk[i]);
      }
    }
    for (let i = 0; i < spec.ecPerBlock; i += 1) {
      for (const ec of ecBlocks) {
        interleaved.push(ec[i]);
      }
    }
    return interleaved;
  }

  function computeFormatBits(maskPattern) {
    /* مستوى التصحيح M = 00 */
    const data = (0b00 << 3) | (maskPattern & 0x7);
    let rem = data << 10;
    for (let i = 14; i >= 10; i -= 1) {
      if ((rem >>> i) & 1) {
        rem ^= 0x537 << (i - 10);
      }
    }
    return ((data << 10) | rem) ^ 0x5412;
  }

  function computeVersionBits(version) {
    let rem = version << 12;
    for (let i = 17; i >= 12; i -= 1) {
      if ((rem >>> i) & 1) {
        rem ^= 0x1f25 << (i - 12);
      }
    }
    return (version << 12) | rem;
  }

  function maskMatches(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function buildBaseMatrix(version) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Uint8Array(size));
    const isFunc = Array.from({ length: size }, () => new Uint8Array(size));

    const setFunc = (r, c, dark) => {
      if (r < 0 || c < 0 || r >= size || c >= size) return;
      modules[r][c] = dark ? 1 : 0;
      isFunc[r][c] = 1;
    };

    const drawFinder = (top, left) => {
      for (let dr = -1; dr <= 7; dr += 1) {
        for (let dc = -1; dc <= 7; dc += 1) {
          const r = top + dr;
          const c = left + dc;
          if (r < 0 || c < 0 || r >= size || c >= size) continue;
          const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const isCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFunc(r, c, inOuter && (isBorder || isCenter));
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    /* أنماط التوقيت */
    for (let i = 8; i < size - 8; i += 1) {
      setFunc(6, i, i % 2 === 0);
      setFunc(i, 6, i % 2 === 0);
    }

    /* أنماط المحاذاة */
    const alignCoords = VERSION_SPECS_M[version].align;
    for (let i = 0; i < alignCoords.length; i += 1) {
      for (let j = 0; j < alignCoords.length; j += 1) {
        const cr = alignCoords[i];
        const cc = alignCoords[j];
        const overlapsFinder =
          (i === 0 && j === 0) ||
          (i === 0 && j === alignCoords.length - 1) ||
          (i === alignCoords.length - 1 && j === 0);
        if (overlapsFinder) continue;
        for (let dr = -2; dr <= 2; dr += 1) {
          for (let dc = -2; dc <= 2; dc += 1) {
            const dist = Math.max(Math.abs(dr), Math.abs(dc));
            setFunc(cr + dr, cc + dc, dist !== 1);
          }
        }
      }
    }

    /* حجز مواقع معلومات التنسيق والوحدة الداكنة الثابتة */
    for (let i = 0; i <= 8; i += 1) {
      if (i !== 6) {
        setFunc(8, i, false);
        setFunc(i, 8, false);
      }
    }
    for (let i = 0; i < 8; i += 1) {
      setFunc(8, size - 1 - i, false);
      if (i < 7) setFunc(size - 1 - i, 8, false);
    }
    setFunc(size - 8, 8, true);

    /* حجز معلومات الإصدار للإصدارات >= 7 */
    if (version >= 7) {
      const vBits = computeVersionBits(version);
      for (let i = 0; i < 18; i += 1) {
        const bit = (vBits >>> i) & 1;
        const a = Math.floor(i / 3);
        const b = size - 11 + (i % 3);
        setFunc(a, b, bit === 1);
        setFunc(b, a, bit === 1);
      }
    }

    return { size, modules, isFunc };
  }

  function applyFormatInfo(modules, size, maskPattern) {
    const bits = computeFormatBits(maskPattern);
    const getBit = (idx) => (bits >>> idx) & 1;

    /* حول المحدد العلوي الأيسر */
    for (let c = 0; c <= 5; c += 1) modules[8][c] = getBit(14 - c);
    modules[8][7] = getBit(8);
    modules[8][8] = getBit(7);
    modules[7][8] = getBit(6);
    for (let r = 5; r >= 0; r -= 1) modules[r][8] = getBit(r);

    /* المحدد السفلي الأيسر (البت 14 إلى 8) والعلوي الأيمن (البت 7 إلى 0) */
    for (let i = 0; i < 7; i += 1) modules[size - 1 - i][8] = getBit(14 - i);
    for (let i = 0; i < 8; i += 1) modules[8][size - 8 + i] = getBit(7 - i);
  }

  function placeCodewords(modules, isFunc, size, codewords) {
    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    let upward = true;

    for (let col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col = 5;
      for (let step = 0; step < size; step += 1) {
        const row = upward ? size - 1 - step : step;
        for (let dc = 0; dc < 2; dc += 1) {
          const c = col - dc;
          if (isFunc[row][c]) continue;
          let bit = 0;
          if (bitIdx < totalBits) {
            bit = (codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1;
            bitIdx += 1;
          }
          modules[row][c] = bit;
        }
      }
      upward = !upward;
    }
  }

  function penaltyScore(modules, size) {
    let score = 0;
    /* النمط المتتابع أفقياً وعمودياً */
    for (let r = 0; r < size; r += 1) {
      let run = 1;
      for (let c = 1; c < size; c += 1) {
        if (modules[r][c] === modules[r][c - 1]) {
          run += 1;
        } else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    for (let c = 0; c < size; c += 1) {
      let run = 1;
      for (let r = 1; r < size; r += 1) {
        if (modules[r][c] === modules[r - 1][c]) {
          run += 1;
        } else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    /* مربعات 2×2 */
    let dark = 0;
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (modules[r][c]) dark += 1;
        if (r + 1 < size && c + 1 < size) {
          const v = modules[r][c];
          if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
            score += 3;
          }
        }
      }
    }
    const pctDiff = Math.abs((dark * 100) / (size * size) - 50);
    score += Math.floor(pctDiff / 5) * 10;
    return score;
  }

  function generateMatrix(text) {
    const utf8Bytes = new TextEncoder().encode(String(text || ''));
    const version = chooseVersion(utf8Bytes.length);
    const codewords = encodeDataBytes(utf8Bytes, version);
    const { size, modules: base, isFunc } = buildBaseMatrix(version);
    placeCodewords(base, isFunc, size, codewords);

    let bestMask = 0;
    let bestScore = Infinity;
    let bestMatrix = null;

    for (let mask = 0; mask < 8; mask += 1) {
      const candidate = base.map((row) => new Uint8Array(row));
      for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) {
          if (!isFunc[r][c] && maskMatches(mask, r, c)) {
            candidate[r][c] ^= 1;
          }
        }
      }
      applyFormatInfo(candidate, size, mask);
      const s = penaltyScore(candidate, size);
      if (s < bestScore) {
        bestScore = s;
        bestMask = mask;
        bestMatrix = candidate;
      }
    }

    return { size, matrix: bestMatrix, version, mask: bestMask };
  }

  function renderSvg(text, { sizePx = 204, quietZone = 4, darkColor = '#231F29', lightColor = '#FFFFFF', ariaLabel = 'رمز الاستجابة السريعة QR للانضمام للغرفة' } = {}) {
    const { size, matrix } = generateMatrix(text);
    const viewSize = size + quietZone * 2;
    const paths = [];
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (matrix[r][c]) {
          paths.push(`M${c + quietZone},${r + quietZone}h1v1h-1z`);
        }
      }
    }
    return `<svg class="event-qr-svg" xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges" role="img" aria-label="${ariaLabel}"><rect width="${viewSize}" height="${viewSize}" fill="${lightColor}"/><path d="${paths.join('')}" fill="${darkColor}"/></svg>`;
  }

  global.QrSvg = { generateMatrix, renderSvg };
})(typeof window !== 'undefined' ? window : globalThis);

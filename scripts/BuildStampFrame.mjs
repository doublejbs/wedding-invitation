// Turns the stamp-paper photo (white perforated stamp on black) into the greeting's transparent stamp frame.
//
// Usage (from the project root): node scripts/BuildStampFrame.mjs <source.png> [output.png]
//   source: an 8-bit, non-interlaced RGB or RGBA PNG (the kept original is docs/cover-studies/textures/stamp-frame-source.png)
//   output: defaults to docs/cover-studies/textures/stamp-frame.png
//
// What it does, with Node's own modules only (zlib decodes and encodes the PNG; no packages, no browser):
// 1. Crops to the paper: the bounding box of the pixels bright enough to be paper, so the perforation teeth are kept
//    whole and the faint compression ringing outside the paper edge is dropped.
// 2. Makes the black transparent. Paper far from the cut edge stays fully opaque, texture shading included. Pixels on
//    the cut edge (the antialiased rim of each hole) get alpha = brightness / nearby paper brightness and their color
//    is un-premultiplied, so on black the result composites back to the original pixel: no stair steps, no dark or
//    light fringe.
// 3. Prints the measurements the CSS uses (paper size, tooth depth).
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = join(ROOT, 'docs', 'cover-studies', 'textures', 'stamp-frame.png');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// Paper is 160-255 in brightness, the background 0; anything at or above this is paper.
const PAPER_THRESHOLD = 100;
// Darker than this is background noise and becomes fully transparent.
const NOISE_FLOOR = 6;
// Paper pixels within this many pixels of the background count as the cut edge.
const EDGE_RADIUS = 2;
// Paper brightness is averaged over this radius to un-premultiply an edge pixel.
const PAPER_SAMPLE_RADIUS = 6;

const fail = (message) => {
  console.error(`BuildStampFrame failed: ${message}`);
  process.exit(1);
};

const readChunks = (bytes) => {
  const chunks = [];
  let offset = PNG_SIGNATURE.length;

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += length + 12;
  }

  return chunks;
};

const paeth = (left, up, upLeft) => {
  const estimate = left + up - upLeft;
  const toLeft = Math.abs(estimate - left);
  const toUp = Math.abs(estimate - up);
  const toUpLeft = Math.abs(estimate - upLeft);

  if (toLeft <= toUp && toLeft <= toUpLeft) {
    return left;
  }

  if (toUp <= toUpLeft) {
    return up;
  }

  return upLeft;
};

// Returns { width, height, rgb } with 3 bytes per pixel (alpha, if any, is dropped: the source is opaque).
const decodePng = (bytes) => {
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail('not a PNG file');
  }

  const chunks = readChunks(bytes);
  const header = chunks.find((chunk) => chunk.type === 'IHDR').data;
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const bitDepth = header[8];
  const colorType = header[9];
  const interlace = header[12];

  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    fail(`expected an 8-bit non-interlaced RGB or RGBA PNG (bit depth ${bitDepth}, color type ${colorType}, interlace ${interlace})`);
  }

  const channels = colorType === 2 ? 3 : 4;
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(chunks.filter((chunk) => chunk.type === 'IDAT').map((chunk) => chunk.data)));
  const pixels = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];

    for (let x = 0; x < stride; x += 1) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      const predictors = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)];

      if (filter > 4) {
        fail(`unknown PNG row filter ${filter}`);
      }

      pixels[y * stride + x] = (value + predictors[filter]) & 0xff;
    }
  }

  const rgb = Buffer.alloc(width * height * 3);

  for (let index = 0; index < width * height; index += 1) {
    pixels.copy(rgb, index * 3, index * channels, index * channels + 3);
  }

  return { width, height, rgb };
};

const makeChunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, checksum]);
};

// Encodes RGBA with the Paeth filter on every row (good for photographic texture).
const encodePng = (width, height, rgba) => {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 4;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= 4 ? rgba[y * stride + x - 4] : 0;
      const up = y > 0 ? rgba[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= 4 ? rgba[(y - 1) * stride + x - 4] : 0;
      raw[y * (stride + 1) + 1 + x] = (rgba[y * stride + x] - paeth(left, up, upLeft)) & 0xff;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);

  return Buffer.concat([
    PNG_SIGNATURE,
    makeChunk('IHDR', header),
    makeChunk('IDAT', deflateSync(raw, { level: 9 })),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
};

const main = async () => {
  const [sourceArg, outputArg] = process.argv.slice(2);

  if (!sourceArg) {
    fail('usage: node scripts/BuildStampFrame.mjs <source.png> [output.png]');
  }

  const source = decodePng(await readFile(resolve(sourceArg)));
  const outputPath = resolve(outputArg ?? DEFAULT_OUTPUT);
  const brightnessAt = (x, y) => {
    const index = (y * source.width + x) * 3;

    return 0.2126 * source.rgb[index] + 0.7152 * source.rgb[index + 1] + 0.0722 * source.rgb[index + 2];
  };

  // 1. The paper's bounding box.
  let left = source.width;
  let right = -1;
  let top = source.height;
  let bottom = -1;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      if (brightnessAt(x, y) >= PAPER_THRESHOLD) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < 0) {
    fail('no paper found (nothing brighter than the background)');
  }

  const width = right - left + 1;
  const height = bottom - top + 1;
  const brightness = new Float64Array(width * height);
  const isPaper = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = brightnessAt(x + left, y + top);
      brightness[y * width + x] = value;
      isPaper[y * width + x] = value >= PAPER_THRESHOLD ? 1 : 0;
    }
  }

  // 2a. Inner paper: paper with no background within EDGE_RADIUS. Outside the crop counts as background.
  const isInner = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let inner = isPaper[y * width + x] === 1;

      for (let dy = -EDGE_RADIUS; dy <= EDGE_RADIUS && inner; dy += 1) {
        for (let dx = -EDGE_RADIUS; dx <= EDGE_RADIUS && inner; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          const inside = nx >= 0 && ny >= 0 && nx < width && ny < height;

          if (inside && isPaper[ny * width + nx] === 0) {
            inner = false;
          }
        }
      }

      isInner[y * width + x] = inner ? 1 : 0;
    }
  }

  let innerSum = 0;
  let innerCount = 0;

  for (let index = 0; index < width * height; index += 1) {
    if (isInner[index] === 1) {
      innerSum += brightness[index];
      innerCount += 1;
    }
  }

  const meanPaper = innerSum / innerCount;

  // 2b. Alpha and un-premultiplied color for every pixel.
  const rgba = Buffer.alloc(width * height * 4);
  let edgePixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const sourceIndex = ((y + top) * source.width + x + left) * 3;
      const color = source.rgb.subarray(sourceIndex, sourceIndex + 3);

      if (isInner[index] === 1) {
        rgba.set([color[0], color[1], color[2], 255], index * 4);
        continue;
      }

      let sum = 0;
      let count = 0;

      for (let dy = -PAPER_SAMPLE_RADIUS; dy <= PAPER_SAMPLE_RADIUS; dy += 1) {
        for (let dx = -PAPER_SAMPLE_RADIUS; dx <= PAPER_SAMPLE_RADIUS; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && ny >= 0 && nx < width && ny < height && isInner[ny * width + nx] === 1) {
            sum += brightness[ny * width + nx];
            count += 1;
          }
        }
      }

      const paperBrightness = count > 0 ? sum / count : meanPaper;
      const alpha = Math.min(1, Math.max(0, (brightness[index] - NOISE_FLOOR) / (paperBrightness - NOISE_FLOOR)));

      if (alpha <= 0) {
        rgba.set([0, 0, 0, 0], index * 4);
        continue;
      }

      const unpremultiply = (channel) => Math.min(255, Math.round(channel / alpha));
      rgba.set([unpremultiply(color[0]), unpremultiply(color[1]), unpremultiply(color[2]), Math.round(alpha * 255)], index * 4);
      edgePixels += alpha < 1 ? 1 : 0;
    }
  }

  await writeFile(outputPath, encodePng(width, height, rgba));

  // 3. Measurements for the CSS: tooth depth is how far the deepest hole reaches in from each edge.
  const toothDepth = (scan) => {
    let deepest = 0;

    scan((depthOf) => {
      deepest = Math.max(deepest, depthOf);
    });

    return deepest;
  };
  const depthFromLeft = toothDepth((report) => {
    for (let y = 0; y < height; y += 1) {
      let x = 0;

      while (x < width && isPaper[y * width + x] === 0) {
        x += 1;
      }

      report(x);
    }
  });
  const depthFromTop = toothDepth((report) => {
    for (let x = 0; x < width; x += 1) {
      let y = 0;

      while (y < height && isPaper[y * width + x] === 0) {
        y += 1;
      }

      report(y);
    }
  });

  console.log(`source ${source.width}x${source.height}, paper crop x ${left}-${right}, y ${top}-${bottom}`);
  console.log(`wrote ${outputPath}: ${width}x${height} RGBA, ${edgePixels} semi-transparent edge pixels, mean paper brightness ${meanPaper.toFixed(1)}`);
  console.log(`tooth depth: ${depthFromLeft}px from the sides (${((depthFromLeft / width) * 100).toFixed(2)}% of width), ${depthFromTop}px from top and bottom (${((depthFromTop / height) * 100).toFixed(2)}% of height)`);
};

await main();

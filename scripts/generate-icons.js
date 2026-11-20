import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(size, maskable = false) {
  const width = size;
  const height = size;
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (maskable ? 0.38 : 0.44);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep atmospheric gradient background (Dark indigo / deep violet / cyan accent)
      const gradY = y / height;
      let r = Math.floor(10 + 20 * gradY);
      let g = Math.floor(14 + 35 * gradY);
      let b = Math.floor(30 + 80 * gradY);
      let a = 255;

      // Glow circle in center
      if (dist < radius) {
        const factor = 1 - (dist / radius);
        // Sun / Nebula glow
        const sunDist = Math.sqrt((x - cx * 0.9) ** 2 + (y - cy * 0.9) ** 2);
        const sunRadius = radius * 0.55;
        
        if (sunDist < sunRadius) {
          const sf = 1 - (sunDist / sunRadius);
          // Golden/Amber/Cyan radiant gradient
          r = Math.min(255, Math.floor(r + 240 * sf));
          g = Math.min(255, Math.floor(g + 180 * sf));
          b = Math.min(255, Math.floor(b + 90 * sf * (1 - gradY) + 200 * sf * gradY));
        } else {
          r = Math.min(255, Math.floor(r + 40 * factor));
          g = Math.min(255, Math.floor(g + 90 * factor));
          b = Math.min(255, Math.floor(b + 180 * factor));
        }

        // Atmospheric crescent ring
        const ringDist = Math.abs(dist - radius * 0.75);
        if (ringDist < 6) {
          const rf = 1 - (ringDist / 6);
          r = Math.min(255, Math.floor(r + 180 * rf));
          g = Math.min(255, Math.floor(g + 220 * rf));
          b = Math.min(255, Math.floor(b + 255 * rf));
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Header chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // Color type 6: RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = createChunk('IHDR', ihdrData);
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate PNG icons
fs.writeFileSync(path.join(outDir, 'icon-192.png'), generatePng(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), generatePng(512));
fs.writeFileSync(path.join(outDir, 'icon-maskable.png'), generatePng(512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePng(180));

// Generate pristine SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#141c2e" />
      <stop offset="100%" stop-color="#070a12" />
    </linearGradient>
    <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffb703" />
      <stop offset="50%" stop-color="#fb8500" />
      <stop offset="100%" stop-color="#ff4d6d" />
    </linearGradient>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#b8c2d6" stop-opacity="0.75" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" rx="120" fill="url(#bg)" />

  <!-- Ambient Outer Glow -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="url(#ringGrad)" stroke-width="2" opacity="0.3" />
  <circle cx="256" cy="256" r="140" fill="none" stroke="url(#ringGrad)" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.4" />

  <!-- Sun with Glow -->
  <circle cx="210" cy="210" r="70" fill="url(#sunGlow)" filter="url(#glow)" />

  <!-- Orbiting Ray Dots -->
  <circle cx="120" cy="210" r="5" fill="#ffb703" opacity="0.8" />
  <circle cx="210" cy="120" r="5" fill="#ffb703" opacity="0.8" />
  <circle cx="300" cy="210" r="5" fill="#ffb703" opacity="0.8" />
  <circle cx="274" cy="146" r="4" fill="#fb8500" opacity="0.7" />
  <circle cx="146" cy="274" r="4" fill="#fb8500" opacity="0.7" />

  <!-- Stylized Modern Glassmorphic Cloud -->
  <g filter="url(#glow)">
    <path d="M210 340 
             H340 
             a 55 55 0 0 0 10 -109 
             a 70 70 0 0 0 -130 -25 
             a 60 60 0 0 0 -60 55 
             a 50 50 0 0 0 50 79 Z" 
          fill="url(#cloudGrad)" />
  </g>

  <!-- Atmosphere Sparkles -->
  <path d="M370 160 L374 175 L389 179 L374 183 L370 198 L366 183 L351 179 L366 175 Z" fill="#38bdf8" opacity="0.9" />
  <path d="M140 370 L143 380 L153 383 L143 386 L140 396 L137 386 L127 383 L137 380 Z" fill="#c084fc" opacity="0.8" />
</svg>`;

fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
console.log('✅ Generated all icons successfully in assets/icons/');

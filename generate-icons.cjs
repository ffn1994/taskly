// Run with: node generate-icons.js
const { deflateSync } = require('zlib');
const fs = require('fs');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeB = Buffer.from(type);
  const lenB = Buffer.alloc(4); lenB.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeB, data]);
  const crcB = Buffer.alloc(4); crcB.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([lenB, typeB, data, crcB]);
}

function makePNG(size, bg, fg) {
  const [br, bg2, bb] = bg;
  const [fr, fg2, fb] = fg;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  const raw = Buffer.alloc(size * (1 + size * 3));
  const cx = size / 2, cy = size / 2, r = size * 0.3;

  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const inCircle = dx * dx + dy * dy < r * r;
      const px = y * (1 + size * 3) + 1 + x * 3;
      raw[px]     = inCircle ? fr : br;
      raw[px + 1] = inCircle ? fg2 : bg2;
      raw[px + 2] = inCircle ? fb : bb;
    }
  }

  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0))]);
}

const navy = [30, 42, 74];   // #1E2A4A
const blue = [74, 144, 217]; // #4A90D9

fs.writeFileSync('public/icon-192.png', makePNG(192, navy, blue));
fs.writeFileSync('public/icon-512.png', makePNG(512, navy, blue));
fs.writeFileSync('public/apple-touch-icon.png', makePNG(180, navy, blue));
console.log('✅ Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png');

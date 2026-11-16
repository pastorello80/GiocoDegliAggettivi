import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';

await mkdir('public/icons', { recursive: true });
const icon = await readFile('public/favicon.svg');
await Promise.all([
  ...[192, 512].map(size => sharp(icon).resize(size, size).png().toFile(`public/icons/icon-${size}.png`)),
  sharp(icon).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png'),
  sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#ed6543"/></svg>'))
    .composite([{ input: await sharp(icon).resize(360, 360).png().toBuffer(), left: 76, top: 76 }])
    .png().toFile('public/icons/icon-maskable-512.png'),
]);

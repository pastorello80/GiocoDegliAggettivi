import { mkdir, writeFile } from 'node:fs/promises';

const files = {
  'dm-sans-400.ttf': 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf',
  'dm-sans-500.ttf': 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAkJxhTg.ttf',
  'dm-sans-600.ttf': 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAfJthTg.ttf',
  'dm-sans-700.ttf': 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthTg.ttf',
  'dm-serif-display.ttf': 'https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2K_c.ttf',
  'dm-serif-display-italic.ttf': 'https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFhOHM81r4j6k0gjAW3mujVU2B2G_Vx1w.ttf',
  'DM-Sans-OFL.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt',
  'DM-Serif-Display-OFL.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmserifdisplay/OFL.txt',
};
await mkdir('public/fonts', { recursive: true });
await Promise.all(Object.entries(files).map(async ([name, url]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font download failed: ${name} (${response.status})`);
  await writeFile(`public/fonts/${name}`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}`);
}));

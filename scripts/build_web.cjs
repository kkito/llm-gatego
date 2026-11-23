// Placeholder; full esbuild bundle added in Task 15.
const esbuild = require('esbuild');
const fs = require('fs');

if (!fs.existsSync('web/src/app.ts')) {
  console.log('web/src/app.ts not found yet — skipping build (added in Task 15)');
  process.exit(0);
}
esbuild.buildSync({
  entryPoints: ['web/src/app.ts'], bundle: true, format: 'iife',
  globalName: 'GwWeb', outfile: 'web/dist/assets/app.js', target: 'es2020',
});
fs.mkdirSync('internal/server/dist/assets', { recursive: true });
for (const name of fs.readdirSync('web/dist')) {
  const src = 'web/dist/' + name;
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync('internal/server/dist/' + name, { recursive: true });
    for (const f of fs.readdirSync(src)) fs.copyFileSync(src + '/' + f, 'internal/server/dist/' + name + '/' + f);
  } else fs.copyFileSync(src, 'internal/server/dist/' + name);
}

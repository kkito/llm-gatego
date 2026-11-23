const esbuild = require('esbuild');
const fs = require('fs');

const entries = [
  ['web/src/admin.ts', 'web/dist/assets/admin.js'],
];
for (const [entry, out] of entries) {
  esbuild.buildSync({ entryPoints: [entry], bundle: true, format: 'iife', outfile: out, target: 'es2020' });
}
fs.mkdirSync('web/dist', { recursive: true });
fs.copyFileSync('web/index.html', 'web/dist/index.html');
fs.mkdirSync('internal/server/dist/assets', { recursive: true });
for (const name of fs.readdirSync('web/dist')) {
  const src = 'web/dist/' + name;
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync('internal/server/dist/' + name, { recursive: true });
    for (const f of fs.readdirSync(src)) fs.copyFileSync(src + '/' + f, 'internal/server/dist/' + name + '/' + f);
  } else fs.copyFileSync(src, 'internal/server/dist/' + name);
}

const esbuild = require('esbuild');
const fs = require('fs');

const entries = [
  ['web/src/admin.ts', 'web/dist/assets/admin.js'],
];
for (const [entry, out] of entries) {
  esbuild.buildSync({ entryPoints: [entry], bundle: true, format: 'iife', outfile: out, target: 'es2020' });
}
fs.mkdirSync('web/dist', { recursive: true });
const globalCSS = fs.readFileSync('web/src/styles/tokens.ts', 'utf8').match(/globalCSSString = `([\s\S]*?)`/)[1];
fs.writeFileSync('web/dist/index.html', fs.readFileSync('web/index.html', 'utf8').replace('<!-- GLOBAL_CSS -->', `<style>${globalCSS}</style>`));
fs.mkdirSync('internal/server/dist/assets', { recursive: true });
for (const name of fs.readdirSync('web/dist')) {
  const src = 'web/dist/' + name;
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync('internal/server/dist/' + name, { recursive: true });
    for (const f of fs.readdirSync(src)) fs.copyFileSync(src + '/' + f, 'internal/server/dist/' + name + '/' + f);
  } else fs.copyFileSync(src, 'internal/server/dist/' + name);
}

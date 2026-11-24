const esbuild = require('esbuild');
const fs = require('fs');

// Build outputs are generated artifacts. Clean them first so stale files
// such as old CSS bundles never leak into the embedded Go assets.
fs.rmSync('web/dist', { recursive: true, force: true });
fs.mkdirSync('web/dist/assets', { recursive: true });
fs.rmSync('internal/server/dist', { recursive: true, force: true });
fs.mkdirSync('internal/server/dist/assets', { recursive: true });
fs.writeFileSync('internal/server/dist/.gitkeep', '');

const entries = [
  ['web/src/admin.ts', 'web/dist/assets/admin.js'],
];
for (const [entry, out] of entries) {
  esbuild.buildSync({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', outfile: out, target: 'es2020' });
}
fs.mkdirSync('web/dist', { recursive: true });
const globalCSS = fs.readFileSync('web/src/styles/tokens.ts', 'utf8').match(/globalCSSString = `([\s\S]*?)`/)[1];
const minifiedCSS = esbuild.transformSync(globalCSS, { loader: 'css', minify: true }).code;
const minifyHTML = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
fs.writeFileSync('web/dist/index.html', minifyHTML(fs.readFileSync('web/index.html', 'utf8').replace('<!-- GLOBAL_CSS -->', `<style>${minifiedCSS}</style>`)));
if (fs.existsSync('web/static/favicon.ico')) fs.copyFileSync('web/static/favicon.ico', 'web/dist/favicon.ico');
fs.mkdirSync('internal/server/dist/assets', { recursive: true });
for (const name of fs.readdirSync('web/dist')) {
  const src = 'web/dist/' + name;
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync('internal/server/dist/' + name, { recursive: true });
    for (const f of fs.readdirSync(src)) fs.copyFileSync(src + '/' + f, 'internal/server/dist/' + name + '/' + f);
  } else fs.copyFileSync(src, 'internal/server/dist/' + name);
}

// Placeholder; full esbuild bundle added in Task 15.
const esbuild = require('esbuild');
const fs = require('fs');

if (!fs.existsSync('web/src/app.ts')) {
  console.log('web/src/app.ts not found yet — skipping build (added in Task 15)');
  process.exit(0);
}
esbuild.buildSync({
  entryPoints: ['web/src/app.ts'], bundle: true, format: 'iife',
  globalName: 'GwWeb', outfile: 'web/dist/gw-web.js', target: 'es2020',
});

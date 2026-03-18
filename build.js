import * as esbuild from 'esbuild';
import fs from 'fs';

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Build standard unminified version
esbuild.build({
  entryPoints: ['packages/simplijs/src/index.js'],
  bundle: true,
  outfile: 'dist/simplijs.js',
  format: 'iife',
  globalName: 'SimpliJS',
}).then(() => console.log('Built dist/simplijs.js'));

// Build ESM version
esbuild.build({
  entryPoints: ['packages/simplijs/src/index.js'],
  bundle: true,
  outfile: 'dist/simplijs.esm.js',
  format: 'esm',
}).then(() => console.log('Built dist/simplijs.esm.js'));

// Build minified version
esbuild.build({
  entryPoints: ['packages/simplijs/src/index.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/simplijs.min.js',
  format: 'iife',
  globalName: 'SimpliJS',
}).then(() => {
  const stats = fs.statSync('dist/simplijs.min.js');
  console.log(`Built dist/simplijs.min.js (${(stats.size / 1024).toFixed(2)} KB)`);
});

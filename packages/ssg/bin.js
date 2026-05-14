#!/usr/bin/env node
/**
 * @simplijs/ssg CLI
 */
import { generateSSG } from './index.js';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') options.root = args[++i];
  if (args[i] === '--output') options.outDir = args[++i];
  if (args[i] === '--baseUrl') options.baseUrl = args[++i];
}

const root = options.root || process.cwd();
const outDir = options.outDir || path.join(root, 'dist');
const entryFile = path.join(root, 'index.html');

if (!fs.existsSync(entryFile)) {
  console.error(`❌ Entry file not found: ${entryFile}`);
  process.exit(1);
}

// Basic discovery of routes in a real app would be from a config file
// For demo, we export a default config
const routes = {
  '/': '<h1>Welcome to SimpliJS (SSG)</h1>',
  '/about': '<h1>About SimpliJS</h1>',
  '/docs': '<h1>Documentation</h1>'
};

generateSSG({
  entryFile,
  outDir,
  routes,
  baseUrl: options.baseUrl || '',
  minify: true
}).then(() => {
  console.log(`✨ Built successfully to: ${outDir}`);
}).catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

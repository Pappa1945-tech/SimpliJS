/**
 * SimpliJS SSG Tool (Static Site Generator)
 * Crawls a SimpliJS application and generates static HTML files.
 */
import fs from 'fs';
import path from 'path';
import { renderToString, renderToStaticMarkup } from './src/ssr.js';
import { serializeHead, resetHead } from './src/seo.js';

async function generateSSG(options = {}) {
  const {
    entryFile = 'index.html',
    outDir = 'dist',
    routes = {},
    baseUrl = '', // e.g. 'https://example.com'
    minify = true,
    preload = [], // e.g. ['/src/index.js', '/styles/main.css']
    rss = null    // e.g. { title: 'Feed', description: '...', items: [...] }
  } = options;

  console.log('🚀 [SimpliJS SSG] Starting build...');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const template = fs.readFileSync(entryFile, 'utf8');
  const renderedRoutes = [];
  const allInternalLinks = [];

  // Helper for basic HTML minification
  const minifyHtml = (html) => {
    if (!minify) return html;
    return html
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  };

  // Helper to process a route
  const processRoute = async (routePath, contentFn) => {
    console.log(`  📄 Rendering: ${routePath}`);
    resetHead();
    
    let content = '';
    if (typeof contentFn === 'function') {
      content = await contentFn();
    } else {
      content = contentFn;
    }

    // Advanced: Inject Preload tags
    let headHtml = '';
    if (preload.length > 0) {
      preload.forEach(path => {
         const ext = path.split('.').pop();
         if (ext === 'js') {
           headHtml += `  <link rel="modulepreload" href="${path}">\n`;
         } else if (ext === 'css') {
           headHtml += `  <link rel="preload" href="${path}" as="style">\n`;
         }
      });
    }

    // Inject Head content
    headHtml += serializeHead();

    // Inject Canonical URL if baseUrl is provided
    if (baseUrl) {
      const canonicalUrl = `${baseUrl}${routePath === '/' ? '' : routePath}`;
      headHtml += `  <link rel="canonical" href="${canonicalUrl}">\n`;
    }

    // Inject Global State for Hydration
    if (options.state) {
      const stateScript = `\n  <script>window.__SIMPLI_STATE__ = ${JSON.stringify(options.state)};</script>\n`;
      headHtml += stateScript;
    }

    let html = renderToStaticMarkup(content, headHtml, template);
    
    // Add data-hydrating attribute to the app root for the hydration system
    html = html.replace('id="app"', 'id="app" data-hydrating="true"');
    const linkMatches = html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/g);
    for (const match of linkMatches) {
      let href = match[1];
      if (href.startsWith('/') && !href.startsWith('//')) {
        allInternalLinks.push({ from: routePath, to: href.split('#')[0].split('?')[0] });
      }
    }

    html = minifyHtml(html);
    
    // Create folder structure if needed
    const normalizedPath = routePath.endsWith('/') ? routePath : `${routePath}/`;
    const targetDir = path.join(outDir, routePath === '/' ? '' : routePath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(path.join(targetDir, 'index.html'), html);
    renderedRoutes.push(routePath);
  };

  // 1. Process explicit routes
  for (const [routePath, contentFn] of Object.entries(routes)) {
    if (routePath === '*' || routePath.startsWith('#')) continue;
    await processRoute(routePath, contentFn);
  }

  // 2. Generate Sitemap
  if (baseUrl) {
    console.log('  🗺️  Generating sitemap.xml...');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${renderedRoutes.map(r => `  <url>
    <loc>${baseUrl}${r === '/' ? '' : r}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);

    console.log('  🤖 Generating robots.txt...');
    const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml`;
    fs.writeFileSync(path.join(outDir, 'robots.txt'), robots);
  }

  // 3. Generate RSS Feed
  if (rss && baseUrl) {
    console.log('  📻 Generating rss.xml...');
    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${rss.title}</title>
  <link>${baseUrl}</link>
  <description>${rss.description}</description>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${(rss.items || []).map(item => `
  <item>
    <title>${item.title}</title>
    <link>${baseUrl}${item.url}</link>
    <description>${item.description}</description>
    <pubDate>${item.date || new Date().toUTCString()}</pubDate>
    <guid>${baseUrl}${item.url}</guid>
  </item>`).join('')}
</channel>
</rss>`;
    fs.writeFileSync(path.join(outDir, 'rss.xml'), feed);
  }

  // 4. Validate Internal Links
  console.log('  🔍 Validating internal links...');
  let brokenCount = 0;
  const validRoutes = new Set(renderedRoutes);
  allInternalLinks.forEach(link => {
    // Basic check: is the target in renderedRoutes?
    // Note: We might need to handle assets too, but for now focus on routes.
    const target = link.to === '' ? '/' : link.to;
    if (!validRoutes.has(target) && !target.includes('.')) {
      console.warn(`  ⚠️  Broken link found: ${link.from} -> ${link.to}`);
      brokenCount++;
    }
  });
  if (brokenCount > 0) {
    console.warn(`  🚩 Found ${brokenCount} potentially broken internal links.`);
  } else {
    console.log('  ✅ No broken internal links found.');
  }

  // 5. Copy Assets
  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(file => {
      const curSrc = path.join(src, file);
      const curDest = path.join(dest, file);
      if (fs.lstatSync(curSrc).isDirectory()) {
         copyDir(curSrc, curDest);
      } else {
         fs.copyFileSync(curSrc, curDest);
      }
    });
  };

  if (options.include) {
    options.include.forEach(dir => {
      console.log(`  📂 Copying assets: ${dir}`);
      copyDir(dir, path.join(outDir, dir));
    });
  }

  console.log('✅ [SimpliJS SSG] Build complete!');
}

// Export for programmatic use
export { generateSSG };

import { pathToFileURL } from 'url';

/**
 * CLI Usage: node ssg.js <config-file>
 */
if (process.argv[1].endsWith('ssg.js')) {
  const configPath = path.resolve(process.argv[2] || './ssg.config.js');
  if (fs.existsSync(configPath)) {
    import(pathToFileURL(configPath).href).then(m => generateSSG(m.default || m));
  } else {
    console.error(`❌ [SimpliJS SSG] Config file not found: ${configPath}`);
    console.log('Usage: node ssg.js [config-file]');
  }
}

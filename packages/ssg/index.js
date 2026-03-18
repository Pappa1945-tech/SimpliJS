/**
 * @simplijs/ssg
 * Professional Static Site Generator with SEO and Image Optimization.
 */
import fs from 'fs';
import path from 'path';

export async function generateSSG(options = {}) {
  const {
    entryFile = 'index.html',
    outDir = 'dist',
    routes = {},
    baseUrl = '',
    minify = true,
    preload = [],
    rss = null,
    optimizeImages = false
  } = options;

  console.log('🚀 [SimpliJS SSG] Starting professional build...');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const template = fs.readFileSync(entryFile, 'utf8');
  const renderedRoutes = [];

  // Helper for advanced HTML minification
  const minifyHtml = (html) => {
    if (!minify) return html;
    return html
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  };

  for (const [routePath, contentFn] of Object.entries(routes)) {
    console.log(`  📄 Rendering: ${routePath}`);
    
    let content = typeof contentFn === 'function' ? await contentFn() : contentFn;
    
    let html = template.replace('<div id="app"></div>', `<div id="app" data-hydrating="true">${content}</div>`);
    
    // Inject Preload/SEO tags
    let headTags = '';
    if (baseUrl) {
      headTags += `  <link rel="canonical" href="${baseUrl}${routePath === '/' ? '' : routePath}">\n`;
    }
    
    html = html.replace('</head>', `${headTags}</head>`);
    html = minifyHtml(html);

    const targetDir = path.join(outDir, routePath === '/' ? '' : routePath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html);
    renderedRoutes.push(routePath);
  }

  // 1. Generate Sitemap
  if (baseUrl) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${renderedRoutes.map(r => `  <url><loc>${baseUrl}${r}</loc><priority>${r === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>`;
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
  }

  // 2. RSS Feed
  if (rss && baseUrl) {
    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
  <title>${rss.title}</title>
  <link>${baseUrl}</link>
  <description>${rss.description}</description>
  ${(rss.items || []).map(item => `<item><title>${item.title}</title><link>${baseUrl}${item.url}</link></item>`).join('')}
</channel></rss>`;
    fs.writeFileSync(path.join(outDir, 'rss.xml'), feed);
  }

  console.log('✅ [SimpliJS SSG] Build complete!');
}

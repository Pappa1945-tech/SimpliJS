/**
 * SimpliJS SEO Module
 * Manages document head (title, meta, links) for SSR and Client-side
 */

let headConfig = {
  title: '',
  meta: [],
  links: [],
  jsonLd: null
};

export const useHead = (config) => {
  const newConfig = typeof config === 'function' ? config() : config;
  
  // Merge meta tags
  if (newConfig.meta) {
    headConfig.meta = [...headConfig.meta, ...newConfig.meta];
  }
  // Merge links
  if (newConfig.links) {
    headConfig.links = [...headConfig.links, ...newConfig.links];
  }
  // Title and other properties overwrite
  if (newConfig.title !== undefined) headConfig.title = newConfig.title;
  if (newConfig.jsonLd !== undefined) headConfig.jsonLd = newConfig.jsonLd;

  if (typeof window !== 'undefined') {
    updateHead();
  }
};

/**
 * High-level SEO helper for common meta tags
 */
export const setSEO = (seo) => {
  const { title, description, image, url, type = 'website', twitterHandle } = seo;
  
  const meta = [
    { name: 'description', content: description },
    // OpenGraph
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ];

  if (twitterHandle) {
    meta.push({ name: 'twitter:site', content: twitterHandle });
  }

  useHead({ title, meta });
};

/**
 * Structured Data (JSON-LD) helper
 */
export const setJsonLd = (data) => {
  headConfig.jsonLd = data;
  if (typeof window !== 'undefined') {
    let script = document.getElementById('simpli-jsonld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'simpli-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
};

/**
 * Advanced SEO: Theme Color
 */
export const setThemeColor = (color) => {
  useHead({
    meta: [{ name: 'theme-color', content: color }]
  });
};

/**
 * Advanced SEO: Social Icons (Favicon, Apple Touch Icon)
 */
export const setSocialIcons = (icons = {}) => {
  const links = [];
  if (icons.favicon) links.push({ rel: 'icon', href: icons.favicon });
  if (icons.apple) links.push({ rel: 'apple-touch-icon', href: icons.apple });
  if (icons.manifest) links.push({ rel: 'manifest', href: icons.manifest });
  
  useHead({ links });
};

/**
 * Advanced SEO: Breadcrumbs (JSON-LD)
 */
export const setBreadcrumbs = (items) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  setJsonLd(jsonLd);
};

function updateHead() {
  if (headConfig.title) document.title = headConfig.title;

  // Update Meta Tags
  headConfig.meta.forEach(m => {
    let el = document.querySelector(`meta[name="${m.name}"]`) || 
             document.querySelector(`meta[property="${m.property}"]`);
    
    if (!el) {
      el = document.createElement('meta');
      if (m.name) el.setAttribute('name', m.name);
      if (m.property) el.setAttribute('property', m.property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', m.content);
  });

  // Update Link Tags
  headConfig.links.forEach(l => {
    let el = document.querySelector(`link[rel="${l.rel}"][href="${l.href}"]`);
    if (!el) {
      el = document.createElement('link');
      Object.keys(l).forEach(k => el.setAttribute(k, l[k]));
      document.head.appendChild(el);
    }
  });
}

/**
 * Serializes current head state to HTML string for SSR
 */
export function serializeHead() {
  let tags = '';
  if (headConfig.title) tags += `<title>${headConfig.title}</title>\n`;
  
  headConfig.meta.forEach(m => {
    const attrs = Object.entries(m).map(([k, v]) => `${k}="${v}"`).join(' ');
    tags += `  <meta ${attrs}>\n`;
  });

  headConfig.links.forEach(l => {
    const attrs = Object.entries(l).map(([k, v]) => `${k}="${v}"`).join(' ');
    tags += `  <link ${attrs}>\n`;
  });

  if (headConfig.jsonLd) {
    tags += `  <script type="application/ld+json" id="simpli-jsonld">\n${JSON.stringify(headConfig.jsonLd, null, 2)}\n  </script>\n`;
  }

  return tags;
}

export function resetHead() {
  headConfig = { title: '', meta: [], links: [], jsonLd: null };
}

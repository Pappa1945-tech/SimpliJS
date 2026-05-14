const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, m => ESCAPE_MAP[m]);
}

export function renderToString(template, options = {}) {
  let html = typeof template === 'function' ? template() : template;

  if (options.data) {
    // Basic interpolation for SSR with XSS protection
    html = html.replace(/\{(.+?)\}/g, (_, exp) => {
      const key = exp.trim();
      let value = options.data[key];
      
      if (value === undefined) return `{${exp}}`;
      
      // If it's a "raw" request (not implemented yet, but keeping for future)
      // or if it's already a string that looks like HTML we might want to skip?
      // No, for "professional" SSR, safety is default.
      return escapeHTML(String(value));
    });
  }

  return html.trim();
}

/**
 * Wraps the rendered content in a full HTML document
 */
export function renderToStaticMarkup(content, headHtml = '', template = null) {
  if (template) {
    return template
      .replace('<!-- simpli-head -->', headHtml)
      .replace('<!-- simpli-app -->', content);
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>
  <div id="app">${content}</div>
  <script type="module" src="/src/index.js"></script>
</body>
</html>
  `.trim();
}

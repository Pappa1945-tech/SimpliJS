/**
 * @simplijs/devtools
 * Visual debugging bridge for SimpliJS.
 */

export function initDevTools(app, options = {}) {
  if (typeof window === 'undefined') return;

  const {
    enableFloatingUI = true,
    bridge = true
  } = options;

  console.log('🔧 [SimpliJS DevTools] Initializing...');

  const devState = {
    components: [],
    history: [],
    performance: []
  };

  // 1. Component Inspector Bridge
  function scanComponents() {
    devState.components = [];
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el.tagName.includes('-') || el.hasAttribute('s-component') || el.hasAttribute('s-state')) {
        devState.components.push({
          tag: el.tagName.toLowerCase(),
          props: el._props || {},
          id: el.id || el.getAttribute('s-state') || 'anonymous'
        });
      }
    });
    window.postMessage({ type: 'SIMPLI_DEVTOOLS_COMPONENTS', data: devState.components }, '*');
  }

  // 2. State Timeline Bridge
  if (window.Simpli && window.Simpli.vault) {
      // Hook into vault if present
  }

  // 3. Floating UI (Optional)
  if (enableFloatingUI) {
    const ui = document.createElement('div');
    ui.id = 'simpli-devtools-ui';
    ui.style = `
      position: fixed; bottom: 10px; right: 10px;
      width: 300px; height: 400px;
      background: #1e1e1e; color: #fff;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 9999; font-family: monospace; display: flex; flex-direction: column;
      overflow: hidden; border: 1px solid #333;
    `;
    ui.innerHTML = `
      <div style="padding: 10px; background: #333; cursor: move; display: flex; justify-content: space-between;">
        <span>SimpliJS DevTools</span>
        <button onclick="document.getElementById('simpli-devtools-ui').style.display='none'" style="background:none; border:none; color:#fff; cursor:pointer;">×</button>
      </div>
      <div id="simpli-devtools-content" style="flex: 1; overflow-y: auto; padding: 10px; font-size: 12px;">
        <div style="color: #888;">Scanning components...</div>
      </div>
    `;
    document.body.appendChild(ui);

    setInterval(() => {
      scanComponents();
      const content = document.getElementById('simpli-devtools-content');
      if (content) {
        content.innerHTML = `
          <div style="margin-bottom: 10px;">
            <strong>Components (${devState.components.length})</strong>
            ${devState.components.map(c => `<div style="padding: 2px 0; color: #4fc3f7;">&lt;${c.tag}&gt;${c.id !== 'anonymous' ? ` (#${c.id})` : ''}</div>`).join('')}
          </div>
        `;
      }
    }, 2000);
    scanComponents();
  }

  window.SimpliDevTools = {
    scan: scanComponents,
    getState: () => devState,
    exportState: () => JSON.stringify(devState)
  };
}

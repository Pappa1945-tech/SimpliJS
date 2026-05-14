/**
 * SimpliJS DevTools v1.0.0
 * Lightweight state inspector and mutation logger.
 */

export function initDevTools(Simpli) {
  if (typeof document === 'undefined') return;

  console.log("🛠️ [SimpliJS DevTools] Initialized. Press Ctrl+Shift+S to toggle.");

  const style = document.createElement('style');
  style.textContent = `
    #simplijs-devtools {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      max-height: 500px;
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #334155;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      z-index: 999999;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    #simplijs-devtools-header {
      padding: 10px 15px;
      background: #0f172a;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }
    #simplijs-devtools-content {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }
    .simplijs-state-block {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #334155;
    }
    .simplijs-state-title {
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .simplijs-json {
      background: #0f172a;
      padding: 8px;
      border-radius: 6px;
      white-space: pre-wrap;
      word-break: break-all;
      color: #cbd5e1;
    }
    #simplijs-devtools-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      z-index: 999998;
      transition: 0.2s;
    }
    #simplijs-devtools-toggle:hover {
      transform: scale(1.1);
      background: #2563eb;
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'simplijs-devtools';
  panel.innerHTML = `
    <div id="simplijs-devtools-header">
      <span>SimpliJS DevTools v1.0</span>
      <button onclick="document.getElementById('simplijs-devtools').style.display='none'" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
    </div>
    <div id="simplijs-devtools-content">
      <div id="simplijs-state-list"></div>
    </div>
  `;
  document.body.appendChild(panel);

  const toggle = document.createElement('button');
  toggle.id = 'simplijs-devtools-toggle';
  toggle.innerHTML = '🛠️';
  toggle.onclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    if (panel.style.display === 'flex') update();
  };
  document.body.appendChild(toggle);

  function update() {
    const list = document.getElementById('simplijs-state-list');
    if (!list) return;
    list.innerHTML = '';

    const apps = document.querySelectorAll('[s-app]');
    apps.forEach((app, i) => {
      const state = app.__simpliState || {};
      const block = document.createElement('div');
      block.className = 'simplijs-state-block';
      block.innerHTML = `
        <div class="simplijs-state-title">s-app #${i + 1} (${app.tagName.toLowerCase()})</div>
        <div class="simplijs-json">${JSON.stringify(state, (k, v) => k === '__simpliState' ? undefined : v, 2)}</div>
      `;
      list.appendChild(block);
    });
  }

  // Auto-update on mutations
  const observer = new MutationObserver(update);
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
      toggle.click();
    }
  });
}

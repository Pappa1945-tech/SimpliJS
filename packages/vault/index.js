/**
 * @simplijs/vault-pro
 * Professional state management with time-travel and persistence.
 */

export function createVault(initialState, options = {}) {
  const {
    limit = 100,
    storageKey = 'simpli_vault_state',
    persist = false,
    syncTabs = false
  } = options;

  let isTravelling = false;
  let history = [JSON.parse(JSON.stringify(initialState))];
  let currentIndex = 0;
  let pendingSave = false;
  let checkpoints = {};

  // Helper to apply snapshots to reactive state without replacing the proxy
  function applySnapshot(target, snapshot) {
    // Remove keys not in snapshot
    Object.keys(target).forEach(key => {
      if (key !== 'vault' && !(key in snapshot)) delete target[key];
    });
    // Update/Add keys from snapshot
    Object.entries(snapshot).forEach(([key, value]) => {
      if (key !== 'vault') target[key] = value;
    });
  }

  function saveToStorage(data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {}
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const snapshot = JSON.parse(saved);
        applySnapshot(state, snapshot);
        history[0] = snapshot;
      }
    } catch (e) {}
  }

  // Retrieve reactive and effect from global or import
  const { reactive, effect } = window.Simpli || {};
  if (!reactive) {
    throw new Error('SimpliJS not found. Ensure @simplijs/simplijs is loaded.');
  }

  // Separate vault methods to avoid proxy shadowing issues
  const vaultMethods = {
    undo() {
      if (currentIndex > 0) {
        isTravelling = true;
        currentIndex--;
        const snapshot = JSON.parse(JSON.stringify(history[currentIndex]));
        applySnapshot(state, snapshot);
        console.log(`⏪ Undone to index ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    redo() {
      if (currentIndex < history.length - 1) {
        isTravelling = true;
        currentIndex++;
        const snapshot = JSON.parse(JSON.stringify(history[currentIndex]));
        applySnapshot(state, snapshot);
        console.log(`⏩ Redone to index ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    checkpoint(name) {
      const snapshot = JSON.parse(JSON.stringify(state));
      delete snapshot.vault;
      checkpoints[name] = snapshot;
      console.log(`📍 Checkpoint created: ${name}`);
    },
    restore(name) {
      if (checkpoints[name]) {
        isTravelling = true;
        applySnapshot(state, checkpoints[name]);
        console.log(`🎯 Restored to checkpoint: ${name}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    getHistory() {
      return history;
    },
    share() {
      const snapshot = JSON.parse(JSON.stringify(state));
      delete snapshot.vault;
      const shareData = [...history.slice(Math.max(0, currentIndex - 10), currentIndex), snapshot];
      const dbg = btoa(JSON.stringify({ history: shareData, checkpoints }));
      const url = new URL(window.location);
      url.searchParams.set('simpli-vault-debug', dbg);
      return url.toString();
    }
  };

  const state = reactive({
    ...initialState,
    vault: vaultMethods
  }, () => {
    if (isTravelling || pendingSave) return;
    pendingSave = true;
    
    Promise.resolve().then(() => {
      pendingSave = false;
      if (isTravelling) return;
      
      const snapshot = JSON.parse(JSON.stringify(state));
      delete snapshot.vault;
      
      const last = history[currentIndex];
      if (JSON.stringify(last) !== JSON.stringify(snapshot)) {
        history = history.slice(Math.max(0, currentIndex + 1 - limit), currentIndex + 1);
        history.push(snapshot);
        currentIndex = history.length - 1;
        if (persist) saveToStorage(snapshot);
      }
    });
  });

  // Tab Sync
  if (syncTabs && typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === storageKey && e.newValue) {
        const snapshot = JSON.parse(e.newValue);
        if (JSON.stringify(snapshot) !== JSON.stringify(state)) {
           isTravelling = true;
           applySnapshot(state, snapshot);
           setTimeout(() => isTravelling = false, 0);
        }
      }
    });
  }

  // Load persistence if enabled
  if (persist) loadFromStorage();

  // Load from URL if present
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const dbg = params.get('simpli-vault-debug');
    if (dbg) {
      try {
        const data = JSON.parse(atob(dbg));
        history = data.history;
        checkpoints = data.checkpoints;
        currentIndex = history.length - 1;
        applySnapshot(state, history[currentIndex]);
        console.log(`🕰️ [SimpliJS Vault]: Loaded state from share link.`);
      } catch (e) {}
    }
  }

  return state;
}

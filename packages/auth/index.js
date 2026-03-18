/**
 * @simplijs/auth
 * Professional authentication and authorization system.
 */

export function createAuth(options = {}) {
  const {
    persist = true,
    storageKey = 'simpli_auth_session',
    onRedirect = (path) => window.location.hash = path
  } = options;

  const { reactive, watch } = window.Simpli || {};
  if (!reactive) throw new Error('SimpliJS not found.');

  const auth = reactive({
    user: null,
    isAuthenticated: false,
    loading: true,
    permissions: []
  });

  // 1. Session Management
  if (persist && typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        auth.user = data.user;
        auth.isAuthenticated = true;
        auth.permissions = data.permissions || [];
      } catch (e) {}
    }
    auth.loading = false;

    watch(() => auth.user, (newVal) => {
      if (newVal) {
        localStorage.setItem(storageKey, JSON.stringify({ user: auth.user, permissions: auth.permissions }));
      } else {
        localStorage.removeItem(storageKey);
      }
    }, { deep: true });
  }

  // 2. Auth Guard for @simplijs/router
  auth.guard = async (path) => {
    if (!auth.isAuthenticated) {
      console.warn(`🔐 [SimpliJS Auth] Access denied to ${path}. Redirecting to login...`);
      onRedirect('/login');
      return false;
    }
    return true;
  };

  // 3. Authorization (Permissions)
  auth.can = (permission) => {
    return auth.permissions.includes(permission) || auth.permissions.includes('*');
  };

  // 4. Social Login Adapters
  auth.social = {
    async loginWithGoogle() {
      console.log('🚀 [SimpliJS Auth] Google login initiated (Adapter)');
      // In a real app, this would redirect to Google OAuth
    },
    async loginWithGitHub() {
      console.log('🚀 [SimpliJS Auth] GitHub login initiated (Adapter)');
    }
  };

  auth.logout = () => {
    auth.user = null;
    auth.isAuthenticated = false;
    auth.permissions = [];
    onRedirect('/');
  };

  return auth;
}

// UI Component Helpers
export const AuthUI = {
  loginForm: (onSubmit) => `
    <div class="simpli-auth-card">
      <h2>Login</h2>
      <form s-submit="${onSubmit}(new FormData($el))">
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Sign In</button>
      </form>
    </div>
  `
};

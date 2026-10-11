/**
 * AUTH UTILITIES & JWT MANAGEMENT
 */
const Auth = {
  TOKEN_KEY: 'project3_jwt_token',
  USER_KEY: 'project3_auth_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setAuth(token, user) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    // Check if token is expired (JWT parse)
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;
      const payload = JSON.parse(atob(payloadBase64));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.clearAuth();
        return false;
      }
      return true;
    } catch {
      return !!token;
    }
  },

  getHeaders() {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async verifyAndGetMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders()
      });

      if (!res.ok) {
        if (res.status === 401) {
          this.logout();
        }
        return null;
      }

      const user = await res.json();
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      console.error('Error fetching /api/auth/me:', err);
      return this.getUser();
    }
  },

  logout() {
    this.clearAuth();
    window.location.href = '/login.html';
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  // Theme Management (Light / Dark)
  initTheme() {
    const saved = localStorage.getItem('project3_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('project3_theme', next);
    return next;
  }
};

// Auto initialize theme
document.addEventListener('DOMContentLoaded', () => {
  Auth.initTheme();
});

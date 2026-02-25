// Authentication Manager
class AuthManager {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
  }

  async isLoggedIn() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    try {
      const response = await fetch('/auth/check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
          return true;
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }

    // Clear invalid token
    this.clearAuth();
    return false;
  }

  async login(email, password) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem(this.tokenKey, data.token);
        localStorage.setItem(this.userKey, JSON.stringify(data.user));
        this.updateNavigation();
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      
      if (token) {
        await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      window.location.href = '/';
    }
  }

  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getUsername() {
    const user = this.getUser();
    return user ? user.username : 'User';
  }

  async updateNavigation() {
    const isLoggedIn = await this.isLoggedIn();
    
    // Update all auth buttons across the page
    const authButtons = document.querySelectorAll('[data-auth-button]');
    authButtons.forEach(btn => {
      this.updateAuthButton(btn, isLoggedIn);
    });

    // Update navbar links
    const navLinks = document.querySelectorAll('[data-auth-link]');
    navLinks.forEach(link => {
      this.updateAuthLink(link, isLoggedIn);
    });
  }

  updateAuthButton(btn, isLoggedIn) {
    if (isLoggedIn) {
      btn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
      btn.classList.add('logout-btn');
      btn.classList.remove('login-btn');
      btn.onclick = () => {
        if (confirm('Are you sure you want to logout?')) {
          this.logout();
        }
      };
    } else {
      btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
      btn.classList.add('login-btn');
      btn.classList.remove('logout-btn');
      btn.onclick = (e) => {
        e.preventDefault();
        window.location.href = '/login';
      };
    }
  }

  updateAuthLink(link, isLoggedIn) {
    if (isLoggedIn) {
      link.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
      link.classList.add('logout-link');
      link.classList.remove('login-link');
      link.href = '#';
      link.onclick = (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          this.logout();
        }
      };
    } else {
      link.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
      link.classList.add('login-link');
      link.classList.remove('logout-link');
      link.href = '/login';
      link.onclick = null;
    }
  }

  showLoginModal() {
    // Redirect to login page instead of showing modal
    window.location.href = '/login';
  }

  loginAsGuest() {
    // Redirect to shop as guest
    window.location.href = '/shop';
  }
}

// Initialize auth manager
const authManager = new AuthManager();

// Update navigation on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  authManager.updateNavigation();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, authManager };
}

/**
 * ADMIN PORTAL LOGIC & ROUTER
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Guard check
  if (!Auth.requireAuth()) return;

  // 2. Fetch logged-in user profile
  const user = await Auth.verifyAndGetMe() || Auth.getUser();
  if (user) {
    updateUserUI(user);
  }

  // 3. Setup Navigation & View Switching
  setupNavigation();

  // 4. Setup Mobile Sidebar & Backdrop
  setupSidebar();

  // 5. Setup Theme Toggle
  setupThemeToggle();

  // 6. Setup Logout
  document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
        Auth.logout();
      }
    });
  });

  // 7. Initial View (Load Dashboard)
  switchView('dashboard', 'Tổng quan');
  loadDashboardStats();
});

function updateUserUI(user) {
  const avatarInitials = (user.fullName || user.username || 'AD').substring(0, 2).toUpperCase();
  
  // Sidebar avatar & info
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) avatarEl.textContent = avatarInitials;

  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = user.fullName || user.username;

  const roleEl = document.getElementById('userRole');
  if (roleEl) roleEl.textContent = user.role || 'User';

  // Header quick info
  const headerUserEl = document.getElementById('headerUserName');
  if (headerUserEl) headerUserEl.textContent = user.fullName || user.username;
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = item.dataset.view;
      const viewTitle = item.dataset.title;
      if (!viewId) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      switchView(viewId, viewTitle);

      // On mobile, close sidebar after clicking nav item
      const sidebar = document.getElementById('adminSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar && backdrop && window.innerWidth <= 992) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
      }
    });
  });
}

function switchView(viewId, viewTitle) {
  // Update views
  const views = document.querySelectorAll('.admin-view');
  views.forEach(v => v.classList.remove('active'));

  const activeView = document.getElementById(`view-${viewId}`);
  if (activeView) {
    activeView.classList.add('active');
  }

  // Update breadcrumb
  const breadcrumbEl = document.getElementById('currentBreadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.textContent = viewTitle || viewId;
  }

  // If switched to Users view, load data
  if (viewId === 'users') {
    loadUsersTable();
  }
}

function setupSidebar() {
  const toggleBtn = document.getElementById('btnToggleSidebar');
  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
    });
  }
}

function setupThemeToggle() {
  const toggleBtn = document.getElementById('btnToggleTheme');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const newTheme = Auth.toggleTheme();
      updateThemeIcon(newTheme);
    });
    updateThemeIcon(localStorage.getItem('project3_theme') || 'dark');
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('btnToggleTheme');
  if (!toggleBtn) return;
  toggleBtn.innerHTML = theme === 'light' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
}

async function loadDashboardStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: Auth.getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const elUsers = document.getElementById('statTotalUsers');
      if (elUsers) elUsers.textContent = data.totalUsers ?? '--';

      const elAdmins = document.getElementById('statTotalAdmins');
      if (elAdmins) elAdmins.textContent = data.totalAdmins ?? '--';

      const elOrders = document.getElementById('statTotalOrders');
      if (elOrders) elOrders.textContent = data.totalOrders ?? '--';

      const elRevenue = document.getElementById('statTotalRevenue');
      if (elRevenue) elRevenue.textContent = (data.totalRevenue || 0).toLocaleString('vi-VN') + ' đ';
    }
  } catch (err) {
    console.warn('Could not load stats:', err);
  }
}

async function loadUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/users', {
      headers: Auth.getHeaders()
    });

    if (res.ok) {
      const users = await res.json();
      tbody.innerHTML = '';
      users.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>#${u.id}</strong></td>
          <td>
            <div style="font-weight:600; color:var(--text-main);">${escapeHtml(u.fullName || u.username)}</div>
            <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(u.email)}</div>
          </td>
          <td><code>@${escapeHtml(u.username)}</code></td>
          <td>
            <span style="display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; background:${u.role === 'Admin' ? 'rgba(99,102,241,0.2)' : 'rgba(6,182,212,0.15)'}; color:${u.role === 'Admin' ? '#818cf8' : '#22d3ee'};">
              ${escapeHtml(u.role)}
            </span>
          </td>
          <td>
            <span style="display:inline-block; padding:3px 8px; border-radius:999px; font-size:11px; font-weight:600; background:rgba(16,185,129,0.15); color:#34d399;">
              Hoạt động
            </span>
          </td>
          <td style="color:var(--text-secondary); font-size:13px;">
            ${new Date(u.createdAt).toLocaleDateString('vi-VN')}
          </td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn-action-icon" title="Xem chi tiết" style="width:30px;height:30px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="btn-action-icon" title="Chỉnh sửa" style="width:30px;height:30px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.warn('Could not load users list:', err);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

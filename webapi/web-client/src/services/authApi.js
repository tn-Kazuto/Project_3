/**
 * CoreBackend Authentication API Service
 * Endpoint: http://localhost:5230/api/auth (proxied through /api/auth via Vite)
 */

const API_BASE = '/api/auth';

export const authApi = {
  /**
   * Đăng nhập người dùng (hỗ trợ cả Username hoặc Email)
   * @param {string} usernameOrEmail 
   * @param {string} password 
   */
  async login(usernameOrEmail, password) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: usernameOrEmail.trim(),
          password: password
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        return {
          success: true,
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresAt: data.data.expiresAt,
          message: data.message
        };
      }

      // Xử lý lỗi trả về từ CoreBackend
      const errorMsg = data?.message || 
        (data?.errors && Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
        'Tên đăng nhập hoặc mật khẩu không chính xác.';

      return {
        success: false,
        error: errorMsg
      };
    } catch (err) {
      // Trường hợp CoreBackend chưa bật hoặc lỗi mạng
      return {
        success: false,
        isNetworkError: true,
        error: 'Không thể kết nối đến CoreBackend (http://localhost:5230). Hãy đảm bảo Backend đang chạy với lệnh "dotnet run" tại thư mục CoreBackend.'
      };
    }
  },

  /**
   * Đăng ký tài khoản người dùng mới
   * @param {Object} payload { fullName, email, password, username?, phone? }
   */
  async register({ fullName, email, password, username, phone }) {
    try {
      // Tự động tạo username nếu người dùng chỉ nhập email
      const safeUsername = username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;

      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: safeUsername,
          email: email.trim().toLowerCase(),
          password: password,
          fullName: fullName.trim(),
          phone: phone || null
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        return {
          success: true,
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresAt: data.data.expiresAt,
          message: data.message
        };
      }

      const errorMsg = data?.message ||
        (data?.errors && Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
        'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';

      return {
        success: false,
        error: errorMsg
      };
    } catch (err) {
      return {
        success: false,
        isNetworkError: true,
        error: 'Không thể kết nối đến CoreBackend (http://localhost:5230). Hãy đảm bảo Backend đang chạy với lệnh "dotnet run" tại thư mục CoreBackend.'
      };
    }
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ Token
   * @param {string} token 
   */
  async getProfile(token) {
    try {
      const response = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Đăng xuất & Thu hồi phiên (Revoke Token)
   * @param {string} refreshToken 
   * @param {string} token 
   */
  async logout(refreshToken, token) {
    try {
      await fetch(`${API_BASE}/revoke-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  }
};

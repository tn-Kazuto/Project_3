import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jamesthew_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: handle token expiration
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  renewSubscription: (data) => api.post('/users/subscription/renew', data),
};

export const recipeApi = {
  getAll: (params) => api.get('/recipes', { params }),
  getPaged: (params) => api.get('/recipes/paged', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  getMyRecipes: () => api.get('/recipes/my-recipes'),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  share: (id) => api.post(`/recipes/${id}/share`),
};

export const tipApi = {
  getAll: (params) => api.get('/tips', { params }),
  getPaged: (params) => api.get('/tips/paged', { params }),
  getById: (id) => api.get(`/tips/${id}`),
  getMyTips: () => api.get('/tips/my-tips'),
  create: (data) => api.post('/tips', data),
  update: (id, data) => api.put(`/tips/${id}`, data),
  delete: (id) => api.delete(`/tips/${id}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

export const contestApi = {
  getAll: (params) => api.get('/contests', { params }),
  getById: (id) => api.get(`/contests/${id}`),
  create: (data) => api.post('/contests', data),
  delete: (id) => api.delete(`/contests/${id}`),
  submitEntry: (id, data) => api.post(`/contests/${id}/entries`, data),
  getEntries: (id, params) => api.get(`/contests/${id}/entries`, { params }),
  getCommunityEntries: (id, params) => api.get(`/contests/${id}/community-entries`, { params }),
  voteEntry: (entryId, data) => api.post(`/contests/entries/${entryId}/vote`, data),
  selectWinner: (entryId) => api.put(`/contests/entries/${entryId}/winner`),
};

export const announcementApi = {
  getAll: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const feedbackApi = {
  create: (data) => api.post('/feedbacks', data),
  getByRecipe: (recipeId) => api.get(`/feedbacks/recipe/${recipeId}`),
  getAll: () => api.get('/feedbacks'),
  delete: (id) => api.delete(`/feedbacks/${id}`),
};

export const faqApi = {
  getAll: () => api.get('/faqs'),
  getById: (id) => api.get(`/faqs/${id}`),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getSummary: () => api.get('/notifications/summary'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;


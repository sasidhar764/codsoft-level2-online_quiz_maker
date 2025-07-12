import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.user;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response;
  }
};

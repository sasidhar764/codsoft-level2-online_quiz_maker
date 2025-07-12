import api from './api';

export const quizService = {
  getQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response;
  },

  getQuiz: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response;
  },

  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response;
  },

  submitQuiz: async (quizId, answers, timeSpent) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, {
      quizId,
      answers,
      timeSpent
    });
    return response;
  },

  getMyQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes/user/my-quizzes', { params });
    return response;
  },

  getCategories: async () => {
    const response = await api.get('/quizzes/categories');
    return response;
  },

  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response;
  },

  getTestResult: async (resultId) => {
    const response = await api.get(`/dashboard/results/${resultId}`);
    return response;
  },

  getTestHistory: async (params = {}) => {
    const response = await api.get('/dashboard/history', { params });
    return response;
  }
};

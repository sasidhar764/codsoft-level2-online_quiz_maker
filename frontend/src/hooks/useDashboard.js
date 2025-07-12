import { useQuery } from 'react-query';
import { quizService } from '../services/quiz';

export const useDashboard = () => {
  return useQuery(
    'dashboard',
    quizService.getDashboard,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useTestHistory = (filters = {}) => {
  return useQuery(
    ['test-history', filters],
    () => quizService.getTestHistory(filters),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );
};

export const useTestResult = (resultId) => {
  return useQuery(
    ['test-result', resultId],
    () => quizService.getTestResult(resultId),
    {
      enabled: !!resultId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export default useDashboard;

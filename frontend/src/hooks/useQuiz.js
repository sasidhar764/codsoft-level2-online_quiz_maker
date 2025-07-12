import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { quizService } from '../services/quiz';
import toast from 'react-hot-toast';

export const useQuizzes = (filters = {}) => {
  return useQuery(
    ['quizzes', filters],
    () => quizService.getQuizzes(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useQuiz = (id) => {
  return useQuery(
    ['quiz', id],
    () => quizService.getQuiz(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation(quizService.createQuiz, {
    onSuccess: () => {
      queryClient.invalidateQueries('quizzes');
      queryClient.invalidateQueries('my-quizzes');
      toast.success('Quiz created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    }
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => quizService.updateQuiz(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['quiz', variables.id]);
        queryClient.invalidateQueries('my-quizzes');
        toast.success('Quiz updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update quiz');
      }
    }
  );
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation(quizService.deleteQuiz, {
    onSuccess: () => {
      queryClient.invalidateQueries('quizzes');
      queryClient.invalidateQueries('my-quizzes');
      toast.success('Quiz deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    }
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ quizId, answers, timeSpent }) => 
      quizService.submitQuiz(quizId, answers, timeSpent),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('dashboard');
        queryClient.invalidateQueries('test-history');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit quiz');
      }
    }
  );
};

export const useQuizTimer = (initialTime) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
  }, []);

  return {
    timeLeft,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset,
    stop,
    setTimeLeft
  };
};

export const useQuizProgress = (totalQuestions) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));

  const goToQuestion = useCallback((questionIndex) => {
    if (questionIndex >= 0 && questionIndex < totalQuestions) {
      setCurrentQuestion(questionIndex);
      setVisitedQuestions(prev => new Set([...prev, questionIndex]));
    }
  }, [totalQuestions]);

  const nextQuestion = useCallback(() => {
    goToQuestion(currentQuestion + 1);
  }, [currentQuestion, goToQuestion]);

  const previousQuestion = useCallback(() => {
    goToQuestion(currentQuestion - 1);
  }, [currentQuestion, goToQuestion]);

  const setAnswer = useCallback((questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  }, []);

  const getAnswer = useCallback((questionIndex) => {
    return answers[questionIndex] || null;
  }, [answers]);

  const getProgress = useCallback(() => {
    return Math.round(((currentQuestion + 1) / totalQuestions) * 100);
  }, [currentQuestion, totalQuestions]);

  const getAnsweredCount = useCallback(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isFirstQuestion = currentQuestion === 0;

  return {
    currentQuestion,
    answers,
    visitedQuestions,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    setAnswer,
    getAnswer,
    getProgress,
    getAnsweredCount,
    isLastQuestion,
    isFirstQuestion
  };
};

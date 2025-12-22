import toast from 'react-hot-toast';
import { create } from 'zustand';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface ErrorState {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (code: string) => void;
  clearErrors: () => void;
  showError: (error: Error | AppError) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  addError: (error) => {
    set((state) => ({
      errors: [...state.errors, error],
    }));
  },
  removeError: (code) => {
    set((state) => ({
      errors: state.errors.filter((error) => error.code !== code),
    }));
  },
  clearErrors: () => {
    set({ errors: [] });
  },
  showError: (error) => {
    console.error('Error:', error);
    toast.error(error.message || 'An unexpected error occurred', {
      duration: 5000,
    });
  },
}));

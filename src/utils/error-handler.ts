import type { ErrorInfo } from 'react';
import toast from 'react-hot-toast';

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

export const handleError = (error: Error, errorInfo?: ErrorInfo) => {
  console.error('Error caught by error boundary:', error);
  if (errorInfo) {
    console.error('Component stack:', errorInfo.componentStack);
  }

  toast.error(error.message || 'An unexpected error occurred', {
    duration: 3000, // 3 seconds
    position: 'bottom-right',
  });
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

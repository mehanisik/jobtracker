import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useErrorStore } from '../store/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    useErrorStore.getState().showError(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className='bg-background flex min-h-screen items-center justify-center'>
            <div className='p-8 text-center'>
              <h2 className='text-destructive mb-4 text-2xl font-bold'>Something went wrong</h2>
              <p className='text-muted-foreground mb-4'>
                {this.state.error?.message ?? 'An unexpected error occurred'}
              </p>
              <button
                type='button'
                onClick={() => {
                  window.location.reload();
                }}
                className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2'
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

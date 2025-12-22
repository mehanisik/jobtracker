import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ErrorBoundary } from './components/error-boundary';
import Loader from './components/ui/loading';
import { AuthProvider } from './utils/session-provider';
import { ThemeProvider } from './utils/theme-provider';

const queryClient = new QueryClient();
const DashboardPage = lazy(() => import('./pages/dashboard'));
const AuthPage = lazy(() => import('./pages/auth'));
const NotFoundPage = lazy(() => import('./pages/not-found'));
const PageLayout = lazy(() => import('./components/layout'));
const LeetCodePage = lazy(() => import('./pages/dashboard/leetcode'));
const CategoriesPage = lazy(() => import('./pages/dashboard/leetcode/categories'));
const Applications = lazy(() => import('./pages/dashboard/applications'));
const DocumentsPage = lazy(() => import('./pages/dashboard/documents'));
const JobsPage = lazy(() => import('./pages/dashboard/jobs'));

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route path='/' element={<Navigate to='/dashboard' replace />} />

                  <Route path='auth' element={<AuthPage />} />

                  <Route path='dashboard' element={<PageLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path='leetcode' element={<LeetCodePage />} />
                    <Route path='leetcode/categories' element={<CategoriesPage />} />
                    <Route path='applications' element={<Applications />} />
                    <Route path='documents' element={<DocumentsPage />} />
                    <Route path='jobs' element={<JobsPage />} />
                  </Route>

                  <Route path='*' element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster position='top-right' />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

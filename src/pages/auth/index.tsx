import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router';
import { SignInForm } from '@/components/forms/sign-in-form';
import { SignUpForm } from '@/components/forms/sign-up-form';
import { SocialAuth } from '@/components/forms/social-auth';
import Loader from '@/components/ui/loading';
import { AuthForm } from '@/constants/auth-form.enum';
import useTheme from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth';

function AuthPage() {
  const [formType, setFormType] = useState<AuthForm>(AuthForm.SIGN_IN);
  const { theme, handleThemeChange } = useTheme();
  const { user, isLoading } = useAuthStore();

  if (user) {
    return <Navigate to='/dashboard' />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center'>
      <button
        type='button'
        onClick={() => {
          handleThemeChange(theme === 'light' ? 'dark' : 'light');
        }}
        className='absolute top-4 right-4 rounded-full bg-gray-200 p-2 dark:bg-gray-700'
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Sun /> : <Moon />}
      </button>
      <div className='relative flex w-full flex-col items-center justify-center rounded p-8 md:w-1/2'>
        <div className='mx-auto w-full max-w-sm'>
          <h1 className='mb-4 text-center text-3xl font-bold text-gray-900'>
            {formType === AuthForm.SIGN_IN ? 'Sign in' : 'Sign up'}
          </h1>

          <p className='mb-6 text-center text-gray-500'>
            {formType === AuthForm.SIGN_IN ? 'Sign in with your account' : 'Create your account'}
          </p>

          <SocialAuth />

          <div className='mb-6 flex items-center'>
            <div className='h-px flex-1 bg-gray-300' />
            <span className='mx-2 text-sm text-gray-400'>or continue with email</span>
            <div className='h-px flex-1 bg-gray-300' />
          </div>

          {formType === AuthForm.SIGN_IN && (
            <SignInForm
              onToggleMode={() => {
                setFormType(AuthForm.SIGN_UP);
              }}
            />
          )}
          {formType === AuthForm.SIGN_UP && (
            <SignUpForm
              onToggleMode={() => {
                setFormType(AuthForm.SIGN_IN);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

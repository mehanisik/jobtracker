import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { signInSchema } from '@/schemas/user-schemas';
import { useAuthStore } from '@/store/auth';

interface SignInFormProps {
  onToggleMode: () => void;
}

export const SignInForm = ({ onToggleMode }: SignInFormProps) => {
  const { signIn, resetPassword, isLoading } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: signInSchema,
    onSubmit: async (values) => {
      try {
        await signIn(values.email, values.password);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      }
    },
  });

  const handleResetPassword = async () => {
    try {
      await resetPassword(formik.values.email);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset password email');
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='mb-4'>
        <label htmlFor='email' className='mb-1 block text-sm font-medium text-gray-700'>
          Email
        </label>
        <input
          id='email'
          name='email'
          type='email'
          placeholder='you@example.com'
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.email && formik.errors.email && (
          <p className='mt-1 text-sm text-red-500'>{formik.errors.email}</p>
        )}
      </div>

      <div className='mb-6'>
        <label htmlFor='password' className='mb-1 block text-sm font-medium text-gray-700'>
          Password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          placeholder='••••••••'
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.password && formik.errors.password && (
          <p className='mt-1 text-sm text-red-500'>{formik.errors.password}</p>
        )}
      </div>

      <div className='mb-6 text-right'>
        <button
          type='button'
          onClick={handleResetPassword}
          className='text-sm text-blue-600 hover:underline'
          disabled={isLoading || !formik.values.email}
        >
          Forgot Password?
        </button>
      </div>

      <button
        type='submit'
        className='w-full rounded-md border border-gray-300 px-4 py-3 font-medium hover:cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Sign In'}
      </button>

      <div className='relative mt-4 text-center text-sm text-gray-700'>
        <span>
          Don't have an account?{' '}
          <button type='button' onClick={onToggleMode} className='hover:underline'>
            Sign up
          </button>
        </span>
      </div>
    </form>
  );
};

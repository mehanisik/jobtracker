import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { signUpSchema } from '@/schemas/user-schemas';
import { useAuthStore } from '@/store/auth';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export const SignUpForm = ({ onToggleMode }: SignUpFormProps) => {
  const { signUp, isLoading } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        await signUp(values.email, values.password);
        toast.success('Account created successfully!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create account');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='mb-4'>
        <label htmlFor='username' className='mb-1 block text-sm font-medium text-gray-700'>
          Username
        </label>
        <input
          id='username'
          name='username'
          type='text'
          placeholder='Your username'
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.username && formik.errors.username && (
          <p className='mt-1 text-sm text-red-500'>{formik.errors.username}</p>
        )}
      </div>

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

      <div className='mb-4'>
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

      <div className='mb-6'>
        <label htmlFor='confirmPassword' className='mb-1 block text-sm font-medium text-gray-700'>
          Confirm Password
        </label>
        <input
          id='confirmPassword'
          name='confirmPassword'
          type='password'
          placeholder='••••••••'
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className='mt-1 text-sm text-red-500'>{formik.errors.confirmPassword}</p>
        )}
      </div>

      <button
        type='submit'
        className='w-full rounded-md border border-gray-300 px-4 py-3 font-medium hover:cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Sign Up'}
      </button>

      <div className='relative mt-4 text-center text-sm text-gray-700'>
        <span>
          Already have an account?{' '}
          <button type='button' onClick={onToggleMode} className='hover:underline'>
            Sign in
          </button>
        </span>
      </div>
    </form>
  );
};

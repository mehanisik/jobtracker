import { type InferType, object, ref, string } from 'yup';

export const signInSchema = object({
  email: string().email('Please enter a valid email').required('Email is required'),
  password: string().required('Password is required'),
});

export const signUpSchema = object({
  email: string().email('Please enter a valid email').required('Email is required'),
  password: string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      'Password must contain at least one letter, one number, and one special character',
    )
    .required('Password is required'),
  confirmPassword: string()
    .oneOf([ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export type SignInFormValues = InferType<typeof signInSchema>;
export type SignUpFormValues = InferType<typeof signUpSchema>;

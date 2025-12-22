import { date, type InferType, number, object, string } from 'yup';

export const questionSchema = object({
  title: string().required('Question title is required'),
  difficulty: string().oneOf(['easy', 'medium', 'hard']).required('Difficulty is required'),
  category_id: number().nullable().optional(),
  url: string().url('Please enter a valid URL').optional(),
  notes: string().optional(),
});

export const questionCategorySchema = object({
  name: string().required('Category name is required'),
  user_id: string().required('User ID is required'),
});

export const questionProgressSchema = object({
  user_id: string().required('User ID is required'),
  question_id: number().required('Question ID is required'),
  status: string()
    .oneOf(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const, 'Please select a valid status')
    .required('Status is required'),
  times_solved: number().min(0, 'Times solved cannot be negative').optional(),
  last_solved_at: date().optional(),
});

export type QuestionFormValues = InferType<typeof questionSchema>;
export type QuestionCategoryFormValues = InferType<typeof questionCategorySchema>;
export type QuestionProgressFormValues = InferType<typeof questionProgressSchema>;

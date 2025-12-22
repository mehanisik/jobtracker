import { useFormik } from 'formik';
import { Plus } from 'lucide-react';
import { questionCategorySchema } from '@/schemas/question-schemas';
import { useAuthStore } from '@/store/auth';
import { useQuestionsStore } from '@/store/questions';

export const CategoryForm = () => {
  const { user } = useAuthStore();
  const userId = user?.uid;

  const { createCategory, isLoading } = useQuestionsStore();

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: questionCategorySchema,
    onSubmit: async (values, { resetForm }) => {
      if (!userId) {
        console.error('User ID is missing');
        return;
      }

      try {
        await createCategory({ ...values, user_id: userId });
        resetForm();
      } catch (error) {
        console.error('Failed to create category', error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className='space-y-4'>
      <div>
        <label htmlFor='name' className='text-foreground mb-2 block text-sm font-medium'>
          Category Name
        </label>
        <input
          type='text'
          id='name'
          value={formik.values.name}
          onChange={formik.handleChange}
          className='bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2'
          placeholder='e.g., Arrays, Strings, Trees'
          required
        />
      </div>
      <button
        disabled={isLoading}
        type='submit'
        className='bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-white transition-colors'
      >
        <Plus size={16} /> Create Category
      </button>
    </form>
  );
};

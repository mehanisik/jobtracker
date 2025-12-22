import { useFormik } from 'formik';
import { X } from 'lucide-react';
import { object, string } from 'yup';
import type { Task } from '@/types/db-tables';

export default function TaskForm({
  userId,
  onSubmit,
  onCancel,
}: {
  userId?: string;
  onSubmit?: (task: Omit<Task, 'id' | 'created_at'>) => void;
  onCancel?: () => void;
}) {
  const formik = useFormik({
    initialValues: {
      task_name: '',
    },
    validationSchema: object({
      task_name: string().required('Task name is required'),
    }),
    onSubmit: (values) => {
      onSubmit?.({
        ...values,
        status: 'in progress',
        user_id: userId ?? '',
        task_name: values.task_name,
      });
      formik.resetForm();
    },
  });

  return (
    <div className='mt-2 rounded-lg border p-2'>
      <div className='flex items-center justify-between mb-2'>
        <h4 className='text-sm font-medium'>New Task</h4>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
      <form onSubmit={formik.handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <input
            type='text'
            id='task_name'
            name='task_name'
            placeholder='Enter task name'
            value={formik.values.task_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.task_name && formik.errors.task_name
                ? 'border-destructive w-full rounded-md border p-2'
                : 'w-full rounded-md border p-2'
            }
          />
          {formik.touched.task_name && formik.errors.task_name && (
            <p className='text-sm text-destructive'>{formik.errors.task_name}</p>
          )}
        </div>
        <div className='flex justify-end gap-2'>
          {onCancel && (
            <button
              type='button'
              className='rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type='submit'
            className='rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}

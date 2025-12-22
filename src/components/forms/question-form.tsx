import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { questionSchema } from '@/schemas/question-schemas';
import { useAuthStore } from '@/store/auth';
import { useQuestionsStore } from '@/store/questions';
import type { Question } from '@/types/db-tables';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export const QuestionForm = () => {
  const { categories, createQuestion, fetchQuestions } = useQuestionsStore();
  const { user } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      title: '',
      url: '',
      difficulty: 'medium',
      notes: '',
      category: '',
    },
    validationSchema: questionSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createQuestion({
          title: values.title,
          url: values.url,
          difficulty: values.difficulty as Question['difficulty'],
          notes: values.notes,
          category_id: values.category || null,
          user_id: user?.uid ?? '',
        });
        await fetchQuestions();
        toast.success('Question added successfully!');
        resetForm();
      } catch {
        toast.error('Failed to add question');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label className='text-foreground' htmlFor='title'>
          Title
        </Label>
        <Input id='title' value={formik.values.title} onChange={formik.handleChange} required />
      </div>

      <div className='space-y-2'>
        <Label className='text-foreground' htmlFor='url'>
          URL
        </Label>
        <Input id='url' type='url' value={formik.values.url} onChange={formik.handleChange} />
      </div>

      <div className='space-y-2'>
        <Label className='text-foreground' htmlFor='difficulty'>
          Difficulty
        </Label>
        <Select value={formik.values.difficulty} onValueChange={formik.handleChange}>
          <SelectTrigger>
            <SelectValue placeholder='Select difficulty' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='easy'>Easy</SelectItem>
            <SelectItem value='medium'>Medium</SelectItem>
            <SelectItem value='hard'>Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='category'>Category</Label>
        <Select value={formik.values.category} onValueChange={formik.handleChange}>
          <SelectTrigger>
            <SelectValue placeholder='Select a category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>None</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes'>Notes</Label>
        <Textarea id='notes' value={formik.values.notes} onChange={formik.handleChange} />
      </div>

      <Button type='submit' className='w-full'>
        Add Question
      </Button>
    </form>
  );
};

import { QuestionForm } from '@/components/forms/question-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddQuestionDialog = ({ open, onOpenChange }: AddQuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>
        <QuestionForm />
      </DialogContent>
    </Dialog>
  );
};

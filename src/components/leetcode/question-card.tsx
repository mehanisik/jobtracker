import { CheckCircle2, Circle, CircleDot, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import type { Question, QuestionProgress } from '@/types/db-tables';

interface QuestionCardProps {
  question: Question;
  questionProgress?: QuestionProgress;
  onMarkAsSolved: (questionId: string) => Promise<void>;
}

const difficultyColors = {
  easy: 'text-green-500 dark:text-green-400',
  medium: 'text-yellow-500 dark:text-yellow-400',
  hard: 'text-red-500 dark:text-red-400',
};

export const QuestionCard = ({ question, questionProgress, onMarkAsSolved }: QuestionCardProps) => {
  return (
    <div className='group relative flex items-center gap-3 rounded-lg border bg-card px-4 py-2 shadow-sm transition-all hover:shadow-md'>
      <div className='flex min-w-[24px] items-center justify-center'>
        {questionProgress?.status === 'solved' ? (
          <CheckCircle2 className='h-4 w-4 text-green-500' />
        ) : questionProgress?.status === 'attempted' ? (
          <CircleDot className='h-4 w-4 text-yellow-500' />
        ) : (
          <Circle className='h-4 w-4 text-gray-300' />
        )}
      </div>

      <div className='flex min-w-[40px] items-center justify-center'>
        <span className='text-muted-foreground text-sm font-medium'>{question.id}</span>
      </div>

      <div className='flex flex-1 items-center gap-2'>
        <h3 className='text-foreground truncate text-sm font-medium hover:text-primary'>
          {question.title}
        </h3>
        <span className={`text-xs font-medium ${difficultyColors[question.difficulty ?? 'easy']}`}>
          {question.difficulty}
        </span>
      </div>

      <div className='flex items-center gap-4 text-xs'>
        <div className='text-muted-foreground flex items-center gap-2'>
          {questionProgress?.times_solved ? (
            <span>Solved {questionProgress.times_solved} times</span>
          ) : null}
          {questionProgress?.last_solved_at && (
            <span>• Last: {new Date(questionProgress.last_solved_at).toLocaleDateString()}</span>
          )}
        </div>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => onMarkAsSolved(question.id)}
            className='text-primary hover:text-primary/80 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-primary/10'
          >
            <CheckCircle2 className='h-3 w-3' />
            Mark Solved
          </button>
          <Link
            to={`/dashboard/leetcode/${question.id}`}
            className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors hover:bg-muted'
          >
            <ExternalLink className='h-3 w-3' />
          </Link>
        </div>
      </div>
    </div>
  );
};

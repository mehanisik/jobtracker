import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Question, QuestionCategory, QuestionProgress } from '@/types/db-tables';
import { QuestionCard } from './question-card';

interface CategorySectionProps {
  category: QuestionCategory;
  questions: Question[];
  questionProgress: QuestionProgress[];
  onMarkAsSolved: (questionId: string) => Promise<void>;
}

export const CategorySection = ({
  category,
  questions,
  questionProgress,
  onMarkAsSolved,
}: CategorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const solvedCount = questionProgress.filter((q) => q.status === 'solved').length;
  const progress = Math.round((solvedCount / questions.length) * 100);

  return (
    <div className='space-y-2'>
      <button
        type='button'
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className='flex w-full items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50'
      >
        <div className='flex items-center gap-4'>
          {isExpanded ? (
            <ChevronDown className='h-5 w-5 text-muted-foreground' />
          ) : (
            <ChevronRight className='h-5 w-5 text-muted-foreground' />
          )}
          <div>
            <h3 className='text-lg font-semibold text-card-foreground'>{category.name}</h3>
            <div className='mt-1 flex items-center gap-2 text-sm text-muted-foreground'>
              <span>{questions.length} questions</span>
              <span>•</span>
              <span>{solvedCount} solved</span>
              <span>•</span>
              <span>{progress}% complete</span>
            </div>
          </div>
        </div>
        <div className='flex h-2 w-24 overflow-hidden rounded-full bg-muted'>
          <div
            className='bg-primary transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>

      {isExpanded && (
        <div className='ml-9 space-y-2'>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onMarkAsSolved={onMarkAsSolved}
              questionProgress={questionProgress.find((q) => q.question_id === question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

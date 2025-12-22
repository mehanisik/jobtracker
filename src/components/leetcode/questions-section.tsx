import { BarChart, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import type { Question, QuestionCategory, QuestionProgress } from '@/types/db-tables';

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not attempted';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface QuestionsSectionProps {
  questions: Question[];
  categories: QuestionCategory[];
  progress: QuestionProgress[];
  setIsAddDialogOpen: (isOpen: boolean) => void;
}

function QuestionsSection({
  questions,
  categories,
  progress,
  setIsAddDialogOpen,
}: QuestionsSectionProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { createProgress, updateProgress, resetProgress } = useProgressStore();
  const { user } = useAuthStore();

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'solved')
        return progress.find((p) => p.question_id === question.id)?.status === 'solved';
      if (activeTab === 'unsolved')
        return progress.find((p) => p.question_id === question.id)?.status !== 'solved';
      return true;
    });
  }, [questions, activeTab, progress]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleStatusChange = async (
    questionId: string,
    newStatus: QuestionProgress['status'],
    incrementOnly: boolean = false,
  ) => {
    if (!user?.uid) {
      console.error('User not authenticated');
      return;
    }

    const existingProgress = progress.find((p) => p.question_id === questionId);
    const now = new Date().toISOString();

    try {
      if (!existingProgress) {
        await createProgress({
          question_id: questionId,
          status: newStatus,
          times_solved: newStatus === 'solved' ? 1 : 0,
          last_solved_at: newStatus === 'solved' ? now : null,
        });
      } else {
        await updateProgress(existingProgress.id, {
          status: incrementOnly ? existingProgress.status : newStatus,
          times_solved: incrementOnly
            ? (existingProgress.times_solved ?? 0) + 1
            : newStatus === 'solved'
              ? (existingProgress.times_solved ?? 0) + 1
              : existingProgress.times_solved,
          last_solved_at:
            incrementOnly || newStatus === 'solved' ? now : existingProgress.last_solved_at,
        });
      }
      setIsActionDropdownOpen(null);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getDifficultyColor = (difficulty: Question['difficulty']) => {
    if (difficulty === 'easy') return 'bg-green-600';
    if (difficulty === 'medium') return 'bg-yellow-600';
    if (difficulty === 'hard') return 'bg-red-600';
    return 'bg-gray-600';
  };

  const columns = ['Title', 'Difficulty', 'Category', 'Status', 'Times Solved', 'Last Solved'];

  const renderRow = (question: Question) => {
    const category = categories.find((c) => c.id === question.category_id);
    const questionProgress = progress.find((p) => p.question_id === question.id);

    return {
      Title: (
        <div className='font-medium'>
          {question.url ? (
            <a
              href={question.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'
            >
              {question.title}
            </a>
          ) : (
            question.title
          )}
        </div>
      ),
      Difficulty: (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getDifficultyColor(question.difficulty)}`}
        >
          {question.difficulty
            ? question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)
            : 'N/A'}
        </span>
      ),
      Category: category ? category.name : 'Uncategorized',
      Status: (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            questionProgress?.status === 'solved'
              ? 'bg-blue-100 text-blue-800'
              : questionProgress?.status === 'attempted'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {questionProgress?.status === 'solved'
            ? 'Solved'
            : questionProgress?.status === 'attempted'
              ? 'Attempted'
              : 'Not Started'}
        </span>
      ),
      'Times Solved': questionProgress?.times_solved ?? 0,
      'Last Solved': formatDate(questionProgress?.last_solved_at ?? null),
    };
  };

  const actions = (question: Question) => (
    <div className='relative'>
      <button
        type='button'
        data-dropdown-trigger
        onClick={() => {
          setIsActionDropdownOpen(isActionDropdownOpen === question.id ? null : question.id);
        }}
        className='text-gray-500 hover:text-gray-700 focus:outline-none'
      >
        <span className='sr-only'>Open menu</span>
        <BarChart className='h-4 w-4' />
      </button>

      {isActionDropdownOpen === question.id && (
        <div className='absolute right-0 z-10 mt-1 w-56 rounded-md border bg-white shadow-lg'>
          <div className='py-1'>
            <button
              type='button'
              onClick={() => {
                void handleStatusChange(question.id, 'not started');
              }}
              className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            >
              Mark as Not Started
            </button>
            <button
              type='button'
              onClick={() => {
                void handleStatusChange(question.id, 'attempted');
              }}
              className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            >
              Mark as Attempted
            </button>
            <button
              type='button'
              onClick={() => {
                void handleStatusChange(question.id, 'solved');
              }}
              className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            >
              Mark as Solved
            </button>
            <button
              type='button'
              onClick={() => {
                void handleStatusChange(question.id, 'solved', true);
              }}
              className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            >
              Increment Solved Count
            </button>
            <button
              type='button'
              onClick={async () => {
                if (!user) return;
                try {
                  const p = progress.find((prog) => prog.question_id === question.id);
                  if (p) {
                    await resetProgress(p.id);
                  }
                  setIsActionDropdownOpen(null);
                } catch (error) {
                  console.error('Error resetting progress:', error);
                }
              }}
              className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50'
            >
              Reset Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className='bg-background rounded-lg border shadow-sm'>
      <div className='border-b p-4 pb-0'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Questions</h3>
          <div className='flex space-x-1'>
            <button
              type='button'
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                activeTab === 'all' ? 'bg-accent text-white' : 'bg-background border'
              }`}
              onClick={() => {
                setActiveTab('all');
              }}
            >
              All
            </button>
            <button
              type='button'
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                activeTab === 'solved' ? 'bg-accent text-white' : 'bg-background border'
              }`}
              onClick={() => {
                setActiveTab('solved');
              }}
            >
              Solved
            </button>
            <button
              type='button'
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                activeTab === 'unsolved' ? 'bg-accent text-white' : 'bg-background border'
              }`}
              onClick={() => {
                setActiveTab('unsolved');
              }}
            >
              Unsolved
            </button>
          </div>
        </div>
      </div>
      <div className='p-6'>
        {filteredQuestions.length > 0 ? (
          <DataTable<Question>
            columns={columns}
            data={filteredQuestions}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            renderRow={renderRow}
            actions={actions}
          />
        ) : (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='mb-2 text-gray-500'>No questions found</div>
            <p className='max-w-md text-sm text-gray-500'>
              {questions.length === 0
                ? 'Add your first LeetCode question to start tracking your progress.'
                : 'Try adjusting your filters or search query.'}
            </p>
            {questions.length === 0 && (
              <button
                type='button'
                onClick={() => {
                  setIsAddDialogOpen(true);
                }}
                className='mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Your First Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionsSection;

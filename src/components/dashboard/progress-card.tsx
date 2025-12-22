import { CheckCircle, Code } from 'lucide-react';

interface DifficultyProgress {
  name: string;
  total: number;
  solved: number;
  textColor: string;
}

interface ProgressData {
  totalQuestions: number;
  solvedQuestions: number;
  attemptingQuestions: number;
  difficulties: DifficultyProgress[];
}

interface ProgressCardProps {
  data: ProgressData;
}

export default function ProgressCard({ data }: ProgressCardProps) {
  const { totalQuestions, solvedQuestions, attemptingQuestions, difficulties } = data;
  const totalProgressPercentage =
    totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm md:col-span-3 lg:col-span-7'>
      <div className='p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Code className='h-5 w-5 text-primary' />
            <h3 className='font-medium text-foreground'>Progress Overview</h3>
          </div>
          <div className='flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-sm text-primary dark:bg-primary/25'>
            <CheckCircle className='h-4 w-4' />
            <span>{totalProgressPercentage}% Complete</span>
          </div>
        </div>

        <div className='mb-6 flex flex-col gap-1'>
          <div className='flex items-baseline justify-between'>
            <span className='text-sm text-muted-foreground'>Total Progress</span>
            <div>
              <span className='text-2xl font-semibold text-foreground'>{solvedQuestions}</span>
              <span className='text-muted-foreground'>/</span>
              <span className='text-muted-foreground'>{totalQuestions}</span>
              <span className='ml-1 text-sm text-muted-foreground'>solved</span>
            </div>
          </div>
          <div className='text-sm text-muted-foreground'>
            {attemptingQuestions} questions currently attempting
          </div>
        </div>

        <div className='space-y-4 border-t border-border pt-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>BY DIFFICULTY</h4>

          <div className='grid gap-4 sm:grid-cols-3'>
            {difficulties.map((difficulty) => (
              <div
                key={difficulty.name}
                className='flex flex-col rounded-md border border-border bg-card/50 p-4'
              >
                <span className={`text-sm font-medium ${difficulty.textColor}`}>
                  {difficulty.name}
                </span>
                <div className='mt-1 flex items-baseline'>
                  <span className='text-xl font-semibold text-foreground'>{difficulty.solved}</span>
                  <span className='text-muted-foreground'>/</span>
                  <span className='text-muted-foreground'>{difficulty.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

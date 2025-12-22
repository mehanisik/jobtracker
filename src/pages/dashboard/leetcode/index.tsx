import { ChevronDown, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AddQuestionDialog } from '@/components/leetcode/add-question-dialog';
import QuestionsSection from '@/components/leetcode/questions-section';
import { useProgressStore } from '@/store/progress';
import { useQuestionsStore } from '@/store/questions';
import type { Question } from '@/types/db-tables';

function LeetCodePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Question['difficulty'] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  const { questions, categories, fetchQuestions, fetchCategories } = useQuestionsStore();
  const { progress, fetchProgress } = useProgressStore();

  useEffect(() => {
    void fetchQuestions();
    void fetchCategories();
    void fetchProgress();
  }, [fetchQuestions, fetchCategories, fetchProgress]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDifficultyDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const stats = useMemo(() => {
    const total = questions.length;
    const solved = progress.filter((q) => q.status === 'solved').length;
    const totalTimesSolved = progress.reduce((sum, q) => sum + (q.times_solved ?? 0), 0);

    const easy = questions.filter((q) => q.difficulty === 'easy').length;
    const medium = questions.filter((q) => q.difficulty === 'medium').length;
    const hard = questions.filter((q) => q.difficulty === 'hard').length;

    const easySolved = progress.filter(
      (p) =>
        p.question_id &&
        questions.find((q) => q.id === p.question_id)?.difficulty === 'easy' &&
        p.status === 'solved',
    ).length;
    const mediumSolved = progress.filter(
      (p) =>
        p.question_id &&
        questions.find((q) => q.id === p.question_id)?.difficulty === 'medium' &&
        p.status === 'solved',
    ).length;
    const hardSolved = progress.filter(
      (p) =>
        p.question_id &&
        questions.find((q) => q.id === p.question_id)?.difficulty === 'hard' &&
        p.status === 'solved',
    ).length;

    return {
      total,
      solved,
      totalProgress: total > 0 ? (solved / total) * 100 : 0,
      easy,
      medium,
      hard,
      easySolved,
      mediumSolved,
      hardSolved,
      easyProgress: easy > 0 ? (easySolved / easy) * 100 : 0,
      mediumProgress: medium > 0 ? (mediumSolved / medium) * 100 : 0,
      hardProgress: hard > 0 ? (hardSolved / hard) * 100 : 0,
      totalTimesSolved,
    };
  }, [questions, progress]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = searchQuery
        ? question.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesDifficulty = selectedDifficulty
        ? question.difficulty === selectedDifficulty
        : true;
      const matchesCategory = selectedCategory ? question.category_id === selectedCategory : true;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [questions, searchQuery, selectedDifficulty, selectedCategory]);

  return (
    <div className='w-full'>
      <main className='mx-auto max-w-[100rem] px-6 py-8'>
        <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>LeetCode Progress</h1>
            <p className='mt-1 text-gray-500'>Track your coding interview preparation</p>
          </div>
          <button
            type='button'
            onClick={() => {
              setIsAddDialogOpen(true);
            }}
            className='inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Question
          </button>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='bg-background rounded-lg border p-4 shadow-sm'>
            <div className='pb-2'>
              <h3 className='text-lg font-medium'>Overall Progress</h3>
            </div>
            <div>
              <div className='flex items-end justify-between'>
                <div className='text-3xl font-bold'>
                  {stats.solved}/{stats.total}
                </div>
                <div className='text-xl font-medium text-gray-500'>
                  {stats.totalProgress.toFixed(0)}%
                </div>
              </div>
              <div className='mt-2 h-2 w-full rounded-full bg-gray-100'>
                <div
                  className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                  style={{ width: `${stats.totalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='bg-background rounded-lg border p-4 shadow-sm'>
            <div className='pb-2'>
              <h3 className='text-lg font-medium text-green-500'>Easy</h3>
            </div>
            <div>
              <div className='flex items-end justify-between'>
                <div className='text-3xl font-bold'>
                  {stats.easySolved}/{stats.easy}
                </div>
                <div className='text-xl font-medium text-gray-500'>
                  {stats.easyProgress.toFixed(0)}%
                </div>
              </div>
              <div className='mt-2 h-2 w-full rounded-full bg-gray-100'>
                <div
                  className='h-2 rounded-full bg-green-500 transition-all duration-300'
                  style={{ width: `${stats.easyProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='bg-background rounded-lg border p-4 shadow-sm'>
            <div className='pb-2'>
              <h3 className='text-lg font-medium text-yellow-500'>Medium</h3>
            </div>
            <div>
              <div className='flex items-end justify-between'>
                <div className='text-3xl font-bold'>
                  {stats.mediumSolved}/{stats.medium}
                </div>
                <div className='text-xl font-medium text-gray-500'>
                  {stats.mediumProgress.toFixed(0)}%
                </div>
              </div>
              <div className='mt-2 h-2 w-full rounded-full bg-gray-100'>
                <div
                  className='h-2 rounded-full bg-yellow-500 transition-all duration-300'
                  style={{ width: `${stats.mediumProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='bg-background rounded-lg border p-4 shadow-sm'>
            <div className='pb-2'>
              <h3 className='text-lg font-medium text-red-500'>Hard</h3>
            </div>
            <div>
              <div className='flex items-end justify-between'>
                <div className='text-3xl font-bold'>
                  {stats.hardSolved}/{stats.hard}
                </div>
                <div className='text-xl font-medium text-gray-500'>
                  {stats.hardProgress.toFixed(0)}%
                </div>
              </div>
              <div className='mt-2 h-2 w-full rounded-full bg-gray-100'>
                <div
                  className='h-2 rounded-full bg-red-500 transition-all duration-300'
                  style={{ width: `${stats.hardProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className='mb-6 flex flex-col gap-4 md:flex-row'>
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search questions...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className='w-full rounded-md border py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>

          <div className='flex gap-2'>
            <div className='relative' ref={categoryDropdownRef}>
              <button
                type='button'
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                }}
                className='hover:bg-accent inline-flex w-[180px] items-center justify-between rounded-md border px-4 py-2 text-sm font-medium focus:outline-none'
              >
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : 'All Categories'}
                <ChevronDown className='ml-2 h-4 w-4' />
              </button>

              {isCategoryDropdownOpen && (
                <div className='bg-background absolute z-10 mt-1 w-full rounded-md border shadow-lg'>
                  <div className='py-1'>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className='hover:bg-accent block w-full px-4 py-2 text-left text-sm'
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type='button'
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className='hover:bg-accent block w-full px-4 py-2 text-left text-sm'
                      >
                        {category.name}
                      </button>
                    ))}

                    <Link
                      to='/dashboard/leetcode/categories'
                      className='hover:bg-accent flex w-full items-center justify-center gap-2 px-4 py-2 text-left text-sm'
                    >
                      Add Category <Plus className='ml-2 h-4 w-4' />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className='relative' ref={difficultyDropdownRef}>
              <button
                type='button'
                onClick={() => {
                  setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen);
                }}
                className='hover:bg-accent inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium focus:outline-none'
              >
                <Filter className='h-4 w-4' />
                {selectedDifficulty
                  ? selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)
                  : 'Difficulty'}
              </button>

              {isDifficultyDropdownOpen && (
                <div className='bg-background absolute right-0 z-10 mt-1 w-40 rounded-md border shadow-lg'>
                  <div className='py-1'>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedDifficulty(null);
                        setIsDifficultyDropdownOpen(false);
                      }}
                      className='hover:bg-accent block w-full px-4 py-2 text-left text-sm'
                    >
                      All Difficulties
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedDifficulty('easy');
                        setIsDifficultyDropdownOpen(false);
                      }}
                      className='hover:bg-accent block w-full px-4 py-2 text-left text-sm'
                    >
                      Easy
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedDifficulty('medium');
                        setIsDifficultyDropdownOpen(false);
                      }}
                      className='hover:bg-accent block w-full px-4 py-2 text-left text-sm'
                    >
                      Medium
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedDifficulty('hard');
                        setIsDifficultyDropdownOpen(false);
                      }}
                      className='hover:bg-accent block w-full px-4 py-2 text-left text-sm'
                    >
                      Hard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <QuestionsSection
          questions={filteredQuestions}
          categories={categories}
          progress={progress}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />

        <AddQuestionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </main>
    </div>
  );
}

export default LeetCodePage;

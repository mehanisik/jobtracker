import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import ProgressCard from '@/components/dashboard/progress-card';
import RecentApplications from '@/components/dashboard/recent-applications';
import { StatsSection } from '@/components/dashboard/stats-section';
import TasksWidget from '@/components/dashboard/tasks-widget';
import UpcomingInterviews from '@/components/dashboard/upcoming-interviews';
import { useApplicationsStore } from '@/store/applications';
import { useAuthStore } from '@/store/auth';
import { useInterviewsStore } from '@/store/interviews';
import { useProgressStore } from '@/store/progress';
import { useQuestionsStore } from '@/store/questions';
import { useTasksStore } from '@/store/tasks';

function DashboardPage() {
  const { user } = useAuthStore();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);
  const { applications, fetchApplications } = useApplicationsStore();
  const { interviews, fetchInterviews } = useInterviewsStore();
  const { questions, fetchQuestions } = useQuestionsStore();
  const { progress, fetchProgress } = useProgressStore();
  const { tasks, fetchTasks, updateTask, deleteTask, createTask } = useTasksStore();

  const loadData = useCallback(() => {
    void fetchApplications();
    void fetchInterviews();
    void fetchQuestions();
    void fetchProgress();
    void fetchTasks();
  }, [fetchApplications, fetchInterviews, fetchQuestions, fetchProgress, fetchTasks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statsData = useMemo(() => {
    return {
      totalApplications: applications.length,
      pendingApplications: applications.filter((app) => app.status === 'applied').length,
      rejectedApplications: applications.filter((app) => app.status === 'rejected').length,
      totalInterviews: interviews.length,
      upcomingInterviews: interviews.filter((i) => i.status === 'scheduled').length,
      totalQuestions: questions.length,
      solvedQuestions: progress.filter((p) => p.status === 'solved').length,
    };
  }, [applications, interviews, questions, progress]);

  const progressData = useMemo(() => {
    return {
      totalQuestions: questions.length,
      solvedQuestions: progress.filter((p) => p.status === 'solved').length,
      attemptingQuestions: progress.filter((p) => p.status === 'attempted').length,
      difficulties: [
        { name: 'Easy', textColor: 'text-chart-1 dark:text-chart-1/90' },
        { name: 'Medium', textColor: 'text-chart-2 dark:text-chart-2/90' },
        { name: 'Hard', textColor: 'text-chart-3 dark:text-chart-3/90' },
      ].map((diff) => {
        const total = questions.filter((q) => q.difficulty === diff.name.toLowerCase()).length;
        const solved = progress.filter(
          (p) =>
            p.status === 'solved' &&
            questions.find((q) => q.id === p.question_id)?.difficulty === diff.name.toLowerCase(),
        ).length;

        return {
          ...diff,
          total,
          solved,
        };
      }),
    };
  }, [questions, progress]);

  const recentApplications = useMemo(
    () =>
      applications
        .sort((a, b) => new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime())
        .slice(0, 5)
        .map((app) => ({
          id: app.id,
          company_name: app.company_name,
          position: app.position_title,
          location: app.location,
          status: app.status,
          applied_date: app.date_applied,
        })),
    [applications],
  );

  const upcomingInterviews = useMemo(
    () =>
      interviews
        .filter((i) => i.status === 'scheduled')
        .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())
        .slice(0, 5),
    [interviews],
  );

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(taskId, { status: newStatus });
    },
    [tasks, updateTask],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId);
    },
    [deleteTask],
  );

  return (
    <div className='w-full'>
      <main className='mx-auto max-w-[100rem] px-6 py-8'>
        <div className='mb-8'>
          <h2 className='text-2xl font-bold'>Welcome back, {user?.displayName || 'User'}!</h2>
          <p className='mt-1 text-gray-600'>Here's what's happening with your job search today.</p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <StatsSection data={statsData} />
        </Suspense>

        <div className='mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <div className='space-y-8'>
            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Recent Applications</h3>
                <Link to='/dashboard/applications'>View All</Link>
              </div>

              <RecentApplications applications={recentApplications} />
            </section>

            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Tasks</h3>
                <button
                  type='button'
                  className='rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80'
                  onClick={() => {
                    setIsTaskFormOpen(true);
                  }}
                >
                  Add Task
                </button>
              </div>
              <TasksWidget
                tasks={tasks}
                isOpen={isTaskFormOpen}
                onOpenChange={setIsTaskFormOpen}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={createTask}
              />
            </section>
          </div>

          <div className='space-y-8'>
            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Upcoming Interviews</h3>
                <Link to='/dashboard/interviews'>Schedule Interview</Link>
              </div>
              <Suspense fallback={<div>Loading...</div>}>
                <UpcomingInterviews interviews={upcomingInterviews} />
              </Suspense>
            </section>

            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Study Progress</h3>
                <Link to='/dashboard/questions'>View Questions</Link>
              </div>
              <ProgressCard data={progressData} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
export default DashboardPage;

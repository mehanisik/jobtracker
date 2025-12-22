import { Award, Building, Code, Send } from 'lucide-react';
import { StatsCard } from './stats-card';

interface StatsData {
  totalApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalInterviews: number;
  upcomingInterviews: number;
  totalQuestions: number;
  solvedQuestions: number;
}

interface StatsSectionProps {
  data: StatsData;
}

export function StatsSection({ data }: StatsSectionProps) {
  const {
    totalApplications,
    pendingApplications,
    rejectedApplications,
    totalInterviews,
    upcomingInterviews,
    totalQuestions,
    solvedQuestions,
  } = data;

  const responseRate =
    totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0;

  return (
    <div className='mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      <StatsCard
        title='Total Applications'
        value={totalApplications.toString()}
        trend={{
          value: `${pendingApplications} pending`,
          label: `${rejectedApplications} rejected`,
          positive: true,
        }}
        icon={<Send className='h-4 w-4 text-primary' />}
      />

      <StatsCard
        title='Interviews'
        value={totalInterviews.toString()}
        trend={{
          value: `${upcomingInterviews} upcoming`,
          label: 'scheduled interviews',
          positive: true,
        }}
        icon={<Building className='h-4 w-4 text-accent' />}
      />

      <StatsCard
        title='Response Rate'
        value={`${responseRate}%`}
        trend={{
          value: `${totalInterviews} offers`,
          label: 'received',
          positive: true,
        }}
        icon={<Award className='h-4 w-4 text-secondary' />}
      />

      <StatsCard
        title='LeetCode Problems'
        value={`${solvedQuestions}/${totalQuestions}`}
        icon={<Code className='h-4 w-4 text-primary' />}
      />
    </div>
  );
}

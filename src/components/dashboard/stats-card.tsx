import type { ReactNode } from 'react';

interface TrendProps {
  value: string;
  label: string;
  positive: boolean;
}

interface StatsCardProps {
  title: string;
  value: string;
  trend?: TrendProps;
  icon: ReactNode;
}

export function StatsCard({ title, value, trend, icon }: StatsCardProps) {
  return (
    <div className='bg-card text-card-foreground rounded-lg border shadow-sm transition-all hover:shadow-md'>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
              <div className='text-primary'>{icon}</div>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>{title}</h3>
              <p className='text-2xl font-semibold tracking-tight'>{value}</p>
            </div>
          </div>
          {trend && (
            <div className='flex flex-col items-end'>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className='text-muted-foreground mt-1 text-xs'>{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

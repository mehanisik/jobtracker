import { Building2, Phone, Video } from 'lucide-react';
import type { Interview } from '@/types/db-tables';
import { formatDate } from '@/utils/format-date';

interface UpcomingInterviewsProps {
  interviews: Interview[];
}

export default function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <div className='border-border overflow-hidden rounded-lg border bg-card'>
      <div className='divide-border divide-y'>
        {interviews.length > 0 ? (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className='cursor-pointer p-4 transition-colors hover:bg-muted/50'
            >
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <h3 className='text-sm font-medium text-foreground'>
                    {interview.notes ?? 'Interview'}
                  </h3>
                  <p className='text-muted-foreground text-sm'>{interview.interview_type}</p>
                </div>
                <div className='text-muted-foreground flex items-center gap-2'>
                  {interview.interview_type === 'video' ? (
                    <Video className='h-4 w-4' />
                  ) : interview.interview_type === 'phone' ? (
                    <Phone className='h-4 w-4' />
                  ) : (
                    <Building2 className='h-4 w-4' />
                  )}
                  <span className='text-xs capitalize'>
                    {interview.interview_type.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className='text-muted-foreground mt-3 flex items-center gap-2 text-xs'>
                <div className='flex items-center gap-1.5'>
                  <time dateTime={interview.interview_date}>
                    {formatDate(new Date(interview.interview_date))}
                  </time>
                </div>
                {interview.location && (
                  <>
                    <span>•</span>
                    <span>{interview.location}</span>
                  </>
                )}
                <>
                  <span>•</span>
                  <span className='inline-flex items-center gap-1 capitalize'>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        interview.status === 'scheduled'
                          ? 'bg-primary dark:bg-primary/90'
                          : interview.status === 'completed'
                            ? 'bg-accent dark:bg-accent/90'
                            : 'bg-secondary dark:bg-secondary/90'
                      }`}
                    />
                    {interview.status.toLowerCase()}
                  </span>
                </>
              </div>
            </div>
          ))
        ) : (
          <div className='text-muted-foreground p-8 text-center'>
            <Building2 className='mx-auto mb-3 h-8 w-8 opacity-50' />
            <p className='text-sm font-medium'>No upcoming interviews</p>
            <p className='mt-1 text-xs'>Schedule your next interview to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
}

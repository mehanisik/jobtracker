import { Building, Calendar, CheckCircle2, ExternalLink, Globe, MapPin, Send } from 'lucide-react';
import type { Job } from '@/types/db-tables';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format-date';
import { getStatusColor } from '@/utils/job-status-color';

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => Promise<void>;
  hasApplied?: boolean;
}

export default function JobCard({ job, onApply, hasApplied = false }: JobCardProps) {
  const formattedDate = job.created_at ? formatDate(new Date(job.created_at)) : '';
  const statusColor = getStatusColor(job.status);

  return (
    <div className='group bg-card relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-4'>
          <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110'>
            <Building className='h-6 w-6' />
          </div>
          <div>
            <h3 className='text-foreground group-hover:text-primary text-lg font-semibold transition-colors'>
              {job.position}
            </h3>
            <p className='text-muted-foreground mt-1 text-sm'>{job.company}</p>
          </div>
        </div>
        <button
          type='button'
          onClick={() => onApply(job)}
          disabled={hasApplied}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
            hasApplied
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105',
          )}
        >
          {hasApplied ? (
            <>
              <CheckCircle2 className='h-4 w-4' />
              Applied
            </>
          ) : (
            <>
              <Send className='h-4 w-4' />
              Apply
            </>
          )}
        </button>
      </div>

      {job.description && (
        <p className='text-muted-foreground mt-4 line-clamp-2 text-sm'>{job.description}</p>
      )}

      {job.technologies && job.technologies.length > 0 && (
        <div className='mt-4 flex flex-wrap gap-2'>
          {job.technologies.map((tech: string) => (
            <span
              key={tech}
              className='bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full px-3 py-1 text-xs font-medium transition-colors'
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className='mt-4 flex flex-wrap items-center gap-4'>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
            statusColor,
          )}
        >
          {job.status ?? 'New'}
        </span>

        {job.location && (
          <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
            <MapPin className='h-4 w-4' />
            {job.location}
          </span>
        )}

        {formattedDate && (
          <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
            <Calendar className='h-4 w-4' />
            {formattedDate}
          </span>
        )}
      </div>

      <div className='mt-4 flex flex-wrap gap-3 text-sm'>
        {job.source && (
          <div className='text-muted-foreground flex items-center gap-1.5'>
            <Globe className='h-4 w-4' />
            <span>{job.source}</span>
          </div>
        )}

        {job.url && (
          <a
            href={job.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors'
          >
            <ExternalLink className='h-4 w-4' />
            <span>View Job</span>
          </a>
        )}

        {job.source_url && (
          <a
            href={job.source_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors'
          >
            <ExternalLink className='h-4 w-4' />
            <span>Source</span>
          </a>
        )}
      </div>
    </div>
  );
}

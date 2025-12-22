import { Filter, Search, SlidersHorizontal, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import { VirtuosoGrid } from 'react-virtuoso';
import JobCard from '@/components/job-card';
import { JOB_STATUSES } from '@/constants/job-statuses.constant';
import { useJobApplicationsStore } from '@/store/job-applications';
import { useJobsStore } from '@/store/jobs';
import type { Job } from '@/types/db-tables';

function JobsPage() {
  const { jobs, isLoading, fetchJobs } = useJobsStore();
  const { createOrUpdateJobApplicationFromJob, jobApplications } = useJobApplicationsStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'company'>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (job: Job) => {
    try {
      await createOrUpdateJobApplicationFromJob(job.id, 'applied');
      toast.success('Successfully applied to the job!');
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to apply to the job');
    }
  };

  const jobSources = useMemo(() => {
    const sources = new Set<string>();
    jobs.forEach((job) => {
      if (job.source) {
        sources.add(job.source);
      }
    });
    return Array.from(sources);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Apply search filter
      const matchesSearch =
        job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (job.technologies?.some((tech: string) => {
          return tech.toLowerCase().includes(searchQuery.toLowerCase());
        }) ??
          false);

      // Apply status filter
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      // Apply source filter
      const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [jobs, searchQuery, statusFilter, sourceFilter]);

  const sortedJobs = useMemo(() => {
    return filteredJobs.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime();
      } else if (sortBy === 'status') {
        return (a.status ?? '').localeCompare(b.status ?? '');
      } else {
        return a.company.localeCompare(b.company);
      }
    });
  }, [filteredJobs, sortBy]);

  return (
    <div className='w-full'>
      <main className='mx-auto max-w-[100rem] px-6 py-8'>
        <div className='mb-8'>
          <h1 className='text-foreground mb-2 text-3xl font-bold'>Available Jobs</h1>
          <p className='text-muted-foreground'>Browse and apply to available job opportunities</p>
        </div>

        <div className='mb-6 flex flex-col gap-4 md:flex-row'>
          <div className='relative flex-1'>
            <Search
              className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform'
              size={20}
            />
            <input
              type='text'
              placeholder='Search jobs by title, company, description, or technologies...'
              className='border-input bg-background w-full rounded-md border py-2 pr-4 pl-10'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </div>

          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => {
                setShowFilters(!showFilters);
              }}
              className='border-input bg-background hover:bg-muted flex items-center gap-2 rounded-md border px-4 py-2 transition-colors'
            >
              <SlidersHorizontal size={20} />
              Filters
            </button>

            <Link to='/dashboard/jobs/import'>
              <button
                type='button'
                className='bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors'
              >
                <Upload size={20} />
                Import CSV
              </button>
            </Link>
          </div>
        </div>

        {showFilters && (
          <div className='border-border bg-card mb-6 flex flex-wrap gap-4 rounded-lg border p-4'>
            <div className='flex items-center gap-2'>
              <Filter size={20} className='text-muted-foreground' />
              <select
                className='border-input bg-background rounded-md border px-4 py-2'
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                }}
              >
                <option value='all'>All Statuses</option>
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <select
                className='border-input bg-background rounded-md border px-4 py-2'
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                }}
              >
                <option value='all'>All Sources</option>
                {jobSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <select
                className='border-input bg-background rounded-md border px-4 py-2'
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'date' | 'status' | 'company');
                }}
              >
                <option value='date'>Sort by Date</option>
                <option value='status'>Sort by Status</option>
                <option value='company'>Sort by Company</option>
              </select>
            </div>
          </div>
        )}

        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-foreground text-2xl font-semibold'>Available Jobs</h2>
          <span className='text-muted-foreground text-sm'>
            Found {filteredJobs.length.toLocaleString()} of {jobs.length.toLocaleString()} jobs
          </span>
        </div>

        {isLoading ? (
          <div className='border-muted bg-background flex h-96 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
            <div className='border-primary mb-4 h-12 w-12 animate-spin rounded-full border-b-2'></div>
            <p className='text-muted-foreground text-lg'>Loading available jobs...</p>
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className='border-muted bg-background flex h-96 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
            <div className='bg-muted mb-4 rounded-full p-4'>
              <Upload size={32} className='text-muted-foreground' />
            </div>
            <p className='text-muted-foreground mb-2 text-lg'>No jobs found</p>
            <p className='text-muted-foreground mb-6 text-sm'>
              {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                ? 'No jobs match your search criteria'
                : 'Import jobs from a CSV file to get started'}
            </p>
            <Link to='/dashboard/jobs/import'>
              <button
                type='button'
                className='bg-primary hover:bg-primary/90 rounded-md px-6 py-2 text-white transition-colors'
              >
                Import Jobs
              </button>
            </Link>
          </div>
        ) : (
          <div className='h-[calc(100vh-300px)]'>
            <VirtuosoGrid
              totalCount={sortedJobs.length}
              itemContent={(index) => (
                <JobCard
                  key={sortedJobs[index].id}
                  job={sortedJobs[index]}
                  onApply={handleApply}
                  hasApplied={jobApplications.some((app) => app.job_id === sortedJobs[index].id)}
                />
              )}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default JobsPage;

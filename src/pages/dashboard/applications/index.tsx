import { LayoutGrid, Search, Table as TableIcon, Trash } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { JOB_STATUSES } from '@/constants/job-statuses.constant';
import { useApplicationsStore } from '@/store/applications';
import { useAuthStore } from '@/store/auth';
import { useInterviewsStore } from '@/store/interviews';
import type { JobApplication } from '@/types/db-tables';

const ITEMS_PER_PAGE = 10;

function ApplicationsPage() {
  const { user } = useAuthStore();
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { applications, isLoading, fetchApplications, updateApplication, deleteApplication } =
    useApplicationsStore();
  const { createInterview } = useInterviewsStore();

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteApplication(id);
      } catch (error) {
        console.error('Failed to delete application:', error);
      }
    },
    [deleteApplication],
  );

  const handleStatusChange = useCallback(
    async (id: string, newStatus: string) => {
      await updateApplication(id, { status: newStatus });
      if (newStatus === 'interviewing' && user?.uid) {
        void createInterview({
          interview_date: new Date().toISOString(),
          interview_type: 'phone',
          location: applications.find((app) => app.id === id)?.location ?? '',
          status: 'scheduled',
          user_id: user.uid,
        });
      }
    },
    [updateApplication, user?.uid, createInterview, applications],
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((app: JobApplication) => {
      const matchesSearch =
        search.toLowerCase() === '' ||
        app.company_name.toLowerCase().includes(search.toLowerCase()) ||
        app.position_title.toLowerCase().includes(search.toLowerCase()) ||
        app.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredApplications, currentPage]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage((p) => {
      if (direction === 'prev') {
        return Math.max(1, p - 1);
      }
      return Math.min(totalPages, p + 1);
    });
  };

  const tableActions = (application: JobApplication) => {
    return (
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={() => {
            void handleDelete(application.id);
          }}
          className='text-muted-foreground hover:text-destructive'
        >
          <Trash className='h-4 w-4' />
        </button>
      </div>
    );
  };

  return (
    <div className='w-full'>
      <main className='mx-auto max-w-[100rem] px-6 py-8'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-foreground text-2xl font-bold'>Applications</h1>
        </div>
        {isLoading ? (
          <div className='border-muted bg-background flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
            <p className='text-muted-foreground mb-4 text-lg'>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className='border-muted bg-background flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
            <p className='text-muted-foreground mb-4 text-lg'>No applications found</p>
            <p className='text-muted-foreground text-sm'>
              Add your first application to start tracking
            </p>
          </div>
        ) : (
          <div className='relative'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex gap-2'>
                <div className='border-border flex items-center gap-2 rounded-lg border p-2'>
                  <Search className='text-muted-foreground h-4 w-4' />
                  <input
                    type='text'
                    placeholder='Search'
                    value={search}
                    onChange={handleSearchChange}
                    className='rounded-lg border-none bg-transparent px-4 py-2 outline-none'
                  />
                </div>
                <select
                  className='border-border rounded-lg border bg-transparent px-4 py-2'
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value='all'>All Status</option>
                  {Object.values(JOB_STATUSES).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  className={`border-border rounded-lg border p-2 ${
                    view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-transparent'
                  }`}
                  onClick={() => {
                    setView('grid');
                  }}
                >
                  <LayoutGrid className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setView('table');
                  }}
                  className={`border-border rounded-lg border p-2 ${
                    view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-transparent'
                  }`}
                >
                  <TableIcon className='h-4 w-4' />
                </button>
              </div>
            </div>

            {view === 'table' ? (
              <DataTable<JobApplication>
                columns={['Company', 'Position', 'Location', 'Date Applied', 'Status']}
                data={paginatedApplications}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                actions={tableActions}
                renderRow={(app: JobApplication) => ({
                  Company: app.company_name,
                  Position: app.position_title,
                  Location: app.location,
                  'Date Applied': app.date_applied
                    ? new Date(app.date_applied).toLocaleDateString()
                    : 'N/A',
                  Status: (
                    <select
                      className='border-border rounded border bg-transparent px-2 py-1'
                      value={app.status}
                      onChange={(e) => {
                        void handleStatusChange(app.id, e.target.value as JobApplication['status']);
                      }}
                    >
                      {Object.values(JOB_STATUSES).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ),
                })}
              />
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {paginatedApplications.map((application) => (
                  <div
                    key={application.id}
                    className='bg-card border-border hover:bg-muted/50 rounded-lg border p-4 transition-colors'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div>
                        <h3 className='text-foreground font-medium'>
                          {application.position_title}
                        </h3>
                        <p className='text-muted-foreground text-sm'>{application.company_name}</p>
                      </div>
                      {tableActions(application)}
                    </div>
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm'>{application.location}</p>
                      <p className='text-muted-foreground text-sm'>
                        Applied:{' '}
                        {application.updated_at
                          ? new Date(application.updated_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <div>
                        <select
                          className='border-border w-full rounded border bg-transparent px-2 py-1 text-sm'
                          value={application.status}
                          onChange={(e) => {
                            void handleStatusChange(
                              application.id,
                              e.target.value as JobApplication['status'],
                            );
                          }}
                        >
                          {Object.values(JOB_STATUSES).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ApplicationsPage;

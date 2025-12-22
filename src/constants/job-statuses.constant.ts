export type JobStatus =
  | 'applied'
  | 'archived'
  | 'interviewing'
  | 'new'
  | 'offered'
  | 'rejected'
  | 'saved'
  | 'withdrawn';

export const JOB_STATUSES: JobStatus[] = [
  'applied',
  'archived',
  'interviewing',
  'new',
  'offered',
  'rejected',
  'saved',
  'withdrawn',
];

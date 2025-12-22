import { useState } from 'react';
import type { JobStatus } from '@/constants/job-statuses.constant';

interface Option {
  value: string;
  label: string;
}

interface StatusFormProps<T extends string> {
  id: number;
  initialStatus?: T;
  options: Option[];
  className?: string;
  onStatusChange: (id: number, value: T) => Promise<void> | void;
}

export function StatusForm<T extends JobStatus>({
  id,
  initialStatus,
  options,
  className = 'w-full rounded-md border p-2',
  onStatusChange,
}: StatusFormProps<T>) {
  const [status, setStatus] = useState<T>((initialStatus ?? options[0]?.value) as T);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: T) => {
    try {
      setIsUpdating(true);
      await onStatusChange(id, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error(error);
      setStatus(initialStatus ?? (options[0]?.value as T));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      id={id.toString()}
      className={className}
      value={status}
      onChange={(e) => handleStatusChange(e.target.value as T)}
      disabled={isUpdating}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

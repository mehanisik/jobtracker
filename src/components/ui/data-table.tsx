import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<T> {
  columns: string[];
  data: T[];
  itemsPerPage?: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: 'prev' | 'next') => void;
  actions?: (item: T) => ReactNode;
  renderRow: (item: T) => Record<string, ReactNode>;
}

const ITEMS_PER_PAGE = 10;

export function DataTable<T>({
  columns,
  data,
  itemsPerPage = ITEMS_PER_PAGE,
  currentPage,
  totalPages,
  onPageChange,
  actions,
  renderRow,
}: DataTableProps<T>) {
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return (
    <div className='rounded-lg border border-border overflow-hidden bg-card'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[50px]'>#</TableHead>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
            {actions && <TableHead className='text-right'>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 2 : 1)} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow key={(row as { id?: string }).id || index}>
                <TableCell className='font-medium'>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column}>{renderRow(row)[column]}</TableCell>
                ))}
                {actions && <TableCell className='text-right'>{actions(row)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className='flex items-center justify-between p-4 border-t border-border'>
        <p className='text-sm text-muted-foreground'>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
        </p>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => onPageChange('prev')}
            disabled={currentPage === 1}
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => onPageChange('next')}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}

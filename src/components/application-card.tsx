import { Building, MessageCircle, Trash } from 'lucide-react';
import type { JobApplication } from '@/types/db-tables';
import { formatDate } from '@/utils/format-date';
import { getStatusColor } from '@/utils/job-status-color';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ApplicationCardProps {
  application: JobApplication;
  onDelete?: (id: string) => void;
}

export default function ApplicationCard({ application, onDelete }: ApplicationCardProps) {
  const statusLabel = application.status;

  return (
    <Card className='hover:bg-muted/50 transition-colors'>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary rounded-lg p-2'>
              <Building className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-base'>{application.position_title}</CardTitle>
              <CardDescription>{application.company_name}</CardDescription>
            </div>
          </div>
          {onDelete && (
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground hover:text-destructive'
              onClick={() => onDelete(application.id)}
            >
              <Trash className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline' className={getStatusColor(application.status)}>
            {statusLabel}
          </Badge>
          {application.location && (
            <span className='text-muted-foreground text-xs'>{application.location}</span>
          )}
          <span className='text-muted-foreground text-xs'>
            {application.created_at ? formatDate(new Date(application.created_at)) : ''}
          </span>
        </div>
        <div className='flex items-center gap-4'>
          {application.response_date && (
            <span className='text-muted-foreground inline-flex items-center gap-1 text-sm'>
              <MessageCircle className='h-4 w-4' />
              Interview: {formatDate(new Date(application.response_date))}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

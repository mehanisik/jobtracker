import type { MDXEditorMethods } from '@mdxeditor/editor';
import { Eye, Trash } from 'lucide-react';
import { lazy, Suspense, useRef } from 'react';
import type { Document } from '@/types/db-tables';
import Loader from '../ui/loading';

interface DocumentCardProps {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const MarkdownEditor = lazy(() => import('./markdown'));

function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const markdownRef = useRef<MDXEditorMethods>(null!);

  return (
    <div className='group border-border hover:border-primary relative flex flex-col rounded-lg border transition-colors duration-200'>
      <div className='border-border border-b p-4'>
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1'>
            <h2 className='mb-1 line-clamp-1 text-lg font-semibold'>{document.title}</h2>
            <p className='text-muted-foreground text-xs'>
              Last updated:{' '}
              {document.updated_at ? new Date(document.updated_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className='ml-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
            <button
              type='button'
              onClick={() => {
                onEdit(document);
              }}
              className='hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md p-1.5'
              title='View/Edit'
            >
              <Eye className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={() => {
                onDelete(document.id);
              }}
              className='hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md p-1.5'
              title='Delete'
            >
              <Trash className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
      <div className='flex-1 overflow-hidden p-4'>
        <div className='prose prose-sm dark:prose-invert line-clamp-4 max-w-none'>
          <Suspense fallback={<Loader />}>
            <MarkdownEditor
              markdownRef={markdownRef}
              content={document.content ?? ''}
              readonly={true}
              hideToolbar={true}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;

import type { MDXEditorMethods } from '@mdxeditor/editor';
import { Edit, FileText, Save, SplitSquareHorizontal } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import type { Document } from '@/types/db-tables';
import Loader from '../ui/loading';
import { PDFViewer } from './pdf-viewer';

type ViewMode = 'editor' | 'split' | 'pdf';

interface DocumentEditorProps {
  document: Document;
  onSave: () => void;
  onCancel: () => void;
  onChange: (document: Document) => void;
}

const MarkdownEditor = lazy(() => import('./markdown'));

function DocumentEditor({ document, onSave, onCancel, onChange }: DocumentEditorProps) {
  const markdownRef = useRef<MDXEditorMethods>(null as unknown as MDXEditorMethods);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <input
          type='text'
          placeholder='Document Title'
          value={document.title}
          onChange={(e) => {
            onChange({ ...document, title: e.target.value });
          }}
          className='border-border w-full rounded-lg border bg-transparent px-4 py-2'
        />
        <div className='ml-4 flex gap-2'>
          <button
            type='button'
            className={`border-border rounded-lg border p-2 ${
              viewMode === 'editor' ? 'bg-primary text-primary-foreground' : 'bg-transparent'
            }`}
            onClick={() => {
              setViewMode('editor');
            }}
            title='Edit Mode'
          >
            <Edit className='h-4 w-4' />
          </button>
          <button
            type='button'
            className={`border-border rounded-lg border p-2 ${
              viewMode === 'split' ? 'bg-primary text-primary-foreground' : 'bg-transparent'
            }`}
            onClick={() => {
              setViewMode('split');
            }}
            title='Split View'
          >
            <SplitSquareHorizontal className='h-4 w-4' />
          </button>
          <button
            type='button'
            className={`border-border rounded-lg border p-2 ${
              viewMode === 'pdf' ? 'bg-primary text-primary-foreground' : 'bg-transparent'
            }`}
            onClick={() => {
              setViewMode('pdf');
            }}
            title='Preview Mode'
          >
            <FileText className='h-4 w-4' />
          </button>
        </div>
      </div>

      <div className='border-border h-[calc(100vh-300px)] overflow-hidden rounded-lg border'>
        {viewMode === 'editor' && (
          <Suspense fallback={<Loader />}>
            <MarkdownEditor
              markdownRef={markdownRef}
              content={document.content ?? ''}
              onChange={(content) => {
                onChange({ ...document, content });
              }}
            />
          </Suspense>
        )}
        {viewMode === 'split' && (
          <div className='grid h-full grid-cols-2'>
            <div className='border-border border-r'>
              <Suspense fallback={<Loader />}>
                <MarkdownEditor
                  markdownRef={markdownRef}
                  content={document.content ?? ''}
                  onChange={(content) => {
                    onChange({ ...document, content });
                  }}
                />
              </Suspense>
            </div>
            <PDFViewer document={document} />
          </div>
        )}
        {viewMode === 'pdf' && <PDFViewer document={document} />}
      </div>

      <div className='flex justify-end gap-2'>
        <button
          type='button'
          onClick={onCancel}
          className='border-border rounded-lg border px-4 py-2'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={() => {
            const content = markdownRef.current.getMarkdown();
            onChange({ ...document, content });
            onSave();
          }}
          className='bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2'
        >
          <Save className='h-4 w-4' />
          Save
        </button>
      </div>
    </div>
  );
}

export default DocumentEditor;

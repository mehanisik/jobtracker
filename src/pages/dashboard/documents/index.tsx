import { Eye, LayoutGrid, Plus, Search, Table as TableIcon, Trash } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DocumentCard from '@/components/editor/document-card';
import DocumentEditor from '@/components/editor/document-editor';
import { DataTable } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/auth';
import { useDocumentsStore } from '@/store/documents';
import type { Document } from '@/types/db-tables';

const ITEMS_PER_PAGE = 10;

type ViewMode = 'grid' | 'table';

function DocumentsPage() {
  const { user } = useAuthStore();
  const [view, setView] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Partial<Document>>({
    title: '',
    content: '',
    doc_type: 'markdown',
  });

  const { documents, isLoading, fetchDocuments, deleteDocument, createDocument, updateDocument } =
    useDocumentsStore();

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id) {
        return;
      }
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    },
    [deleteDocument],
  );

  const handleSave = useCallback(async () => {
    try {
      if (currentDocument.id) {
        await updateDocument(currentDocument.id, {
          title: currentDocument.title,
          content: currentDocument.content,
          doc_type: 'markdown',
        });
      } else {
        await createDocument({
          title: currentDocument.title ?? '',
          content: currentDocument.content ?? '',
          user_id: user?.uid ?? '',
          doc_type: 'markdown',
        });
      }
      setIsEditing(false);
      setCurrentDocument({
        title: '',
        content: '',
        doc_type: 'markdown',
      });
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  }, [currentDocument, createDocument, updateDocument, user?.uid]);

  const handleEdit = useCallback((document: Document) => {
    setCurrentDocument({
      id: document.id,
      title: document.title,
      content: document.content,
      doc_type: document.doc_type,
    });
    setIsEditing(true);
  }, []);

  const handleNew = useCallback(() => {
    setCurrentDocument({
      title: '',
      content: '',
      doc_type: 'markdown',
    });
    setIsEditing(true);
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      return (
        search.toLowerCase() === '' ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.content?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [documents, search]);

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage((p) => {
      if (direction === 'prev') {
        return Math.max(1, p - 1);
      }
      return Math.min(totalPages, p + 1);
    });
  };

  const tableActions = (document: Document) => (
    <div className='flex gap-2'>
      <button
        type='button'
        onClick={() => {
          handleEdit(document);
        }}
        className='text-muted-foreground hover:text-primary'
      >
        <Eye className='h-4 w-4' />
      </button>
      <button
        type='button'
        onClick={() => {
          void handleDelete(document.id);
        }}
        className='text-muted-foreground hover:text-destructive'
      >
        <Trash className='h-4 w-4' />
      </button>
    </div>
  );

  return (
    <div className='w-full'>
      <main className='mx-auto max-w-[100rem] px-6 py-8'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-foreground text-2xl font-bold'>Documents</h1>
          {!isEditing && (
            <button
              type='button'
              onClick={handleNew}
              className='bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2'
            >
              <Plus className='h-4 w-4' />
              New Document
            </button>
          )}
        </div>

        {isLoading ? (
          <div className='border-muted bg-background flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
            <p className='text-muted-foreground mb-4 text-lg'>Loading documents...</p>
          </div>
        ) : isEditing ? (
          <DocumentEditor
            document={currentDocument as Document}
            onSave={handleSave}
            onCancel={() => {
              setIsEditing(false);
              setCurrentDocument({
                title: '',
                content: '',
                doc_type: 'markdown',
              });
            }}
            onChange={setCurrentDocument}
          />
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
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    className='rounded-lg border-none bg-transparent px-4 py-2 outline-none'
                  />
                </div>
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

            {view === 'grid' && (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {view === 'table' && (
              <DataTable<Document>
                columns={['Title', 'Content', 'Last Updated']}
                data={filteredDocuments}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                actions={tableActions}
                renderRow={(doc: Document) => ({
                  Title: doc.title,
                  'Last Updated': doc.updated_at
                    ? new Date(doc.updated_at).toLocaleDateString()
                    : 'N/A',
                })}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default DocumentsPage;

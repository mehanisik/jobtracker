import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import type { Document } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  createDocument: (
    document: Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateDocument: (
    id: string,
    document: Partial<Omit<Document, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, documents: [] });
        return;
      }

      const q = query(collection(db, 'documents'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Document[];

      set({ isLoading: false, documents: data });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      });
    }
  },

  createDocument: async (
    docData: Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newDoc = {
        ...docData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'documents'), newDoc);
      set((state) => ({
        isLoading: false,
        documents: [...state.documents, { id: docRef.id, ...newDoc } as Document],
      }));
      toast.success('Document created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create document',
      });
    }
  },

  updateDocument: async (id: string, docData: Partial<Omit<Document, 'id' | 'user_id'>>) => {
    try {
      set({ isLoading: true, error: null });
      const docRef = doc(db, 'documents', id);
      const updateData = {
        ...docData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(docRef, updateData);
      set((state) => ({
        isLoading: false,
        documents: state.documents.map((d) => (d.id === id ? { ...d, ...updateData } : d)),
      }));
      toast.success('Document updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
      });
    }
  },

  deleteDocument: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'documents', id));
      set((state) => ({
        isLoading: false,
        documents: state.documents.filter((d) => d.id !== id),
      }));
      toast.success('Document deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete document',
      });
    }
  },
}));

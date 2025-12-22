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
import type { QuestionProgress } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface ProgressState {
  progress: QuestionProgress[];
  isLoading: boolean;
  error: string | null;
  fetchProgress: () => Promise<void>;
  createProgress: (
    progressData: Omit<QuestionProgress, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateProgress: (
    id: string,
    progressData: Partial<Omit<QuestionProgress, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteProgress: (id: string) => Promise<void>;
  resetProgress: (id: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: [],
  isLoading: false,
  error: null,

  fetchProgress: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, progress: [] });
        return;
      }

      const q = query(collection(db, 'user_question_progress'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const progress = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuestionProgress[];

      set({ isLoading: false, progress });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
      });
    }
  },

  createProgress: async (
    progressData: Omit<QuestionProgress, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const newProgress = {
        ...progressData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'user_question_progress'), newProgress);
      set((state) => ({
        isLoading: false,
        progress: [...state.progress, { id: docRef.id, ...newProgress } as QuestionProgress],
      }));
      toast.success('Progress created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create progress',
      });
    }
  },

  updateProgress: async (
    id: string,
    progressData: Partial<Omit<QuestionProgress, 'id' | 'user_id'>>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const progressRef = doc(db, 'user_question_progress', id);
      const updateData = {
        ...progressData,
        updated_at: new Date().toISOString(),
      } as any; // Cast to bypass literal mismatch if progressData.status is string

      await updateDoc(progressRef, updateData);
      set((state) => ({
        isLoading: false,
        progress: state.progress.map((p) => (p.id === id ? { ...p, ...updateData } : p)),
      }));
      toast.success('Progress updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update progress',
      });
    }
  },

  deleteProgress: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'user_question_progress', id));
      set((state) => ({
        isLoading: false,
        progress: state.progress.filter((p) => p.id !== id),
      }));
      toast.success('Progress deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete progress',
      });
    }
  },

  resetProgress: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const progressRef = doc(db, 'user_question_progress', id);
      const updateData = {
        status: 'not started' as const,
        times_solved: 0,
        last_solved_at: null,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(progressRef, updateData);
      set((state) => ({
        isLoading: false,
        progress: state.progress.map((p) => (p.id === id ? { ...p, ...updateData } : p)),
      }));
      toast.success('Progress reset successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset progress',
      });
    }
  },
}));

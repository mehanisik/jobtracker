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
import type { Question, QuestionCategory } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface QuestionsState {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  categories: QuestionCategory[];
  fetchQuestions: () => Promise<void>;
  createQuestion: (
    question: Omit<Question, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateQuestion: (
    id: string,
    question: Partial<Omit<Question, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (
    category: Omit<QuestionCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateCategory: (
    id: string,
    category: Partial<Omit<QuestionCategory, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useQuestionsStore = create<QuestionsState>((set) => ({
  questions: [],
  isLoading: false,
  error: null,
  categories: [],

  fetchQuestions: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, questions: [] });
        return;
      }

      const q = query(collection(db, 'questions'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const questions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];

      set({ isLoading: false, questions });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch questions',
      });
    }
  },

  createQuestion: async (
    questionData: Omit<Question, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newQuestion = {
        ...questionData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'questions'), newQuestion);
      set((state) => ({
        isLoading: false,
        questions: [...state.questions, { id: docRef.id, ...newQuestion } as Question],
      }));
      toast.success('Question created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create question',
      });
    }
  },

  updateQuestion: async (id: string, questionData: Partial<Omit<Question, 'id' | 'user_id'>>) => {
    try {
      set({ isLoading: true, error: null });
      const questionRef = doc(db, 'questions', id);
      const updateData = {
        ...questionData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(questionRef, updateData);
      set((state) => ({
        isLoading: false,
        questions: state.questions.map((q) => (q.id === id ? { ...q, ...updateData } : q)),
      }));
      toast.success('Question updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update question',
      });
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'questions', id));
      set((state) => ({
        isLoading: false,
        questions: state.questions.filter((q) => q.id !== id),
      }));
      toast.success('Question deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete question',
      });
    }
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, categories: [] });
        return;
      }

      const q = query(collection(db, 'question_categories'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const categories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuestionCategory[];

      set({ isLoading: false, categories });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      });
    }
  },

  createCategory: async (
    categoryData: Omit<QuestionCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newCategory = {
        ...categoryData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'question_categories'), newCategory);
      set((state) => ({
        isLoading: false,
        categories: [...state.categories, { id: docRef.id, ...newCategory } as QuestionCategory],
      }));
      toast.success('Category created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      });
    }
  },

  updateCategory: async (
    id: string,
    categoryData: Partial<Omit<QuestionCategory, 'id' | 'user_id'>>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const categoryRef = doc(db, 'question_categories', id);
      const updateData = {
        ...categoryData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(categoryRef, updateData);
      set((state) => ({
        isLoading: false,
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updateData } : c)),
      }));
      toast.success('Category updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      });
    }
  },

  deleteCategory: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'question_categories', id));
      set((state) => ({
        isLoading: false,
        categories: state.categories.filter((c) => c.id !== id),
      }));
      toast.success('Category deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  },
}));

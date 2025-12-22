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
import type { Task } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'user_id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, tasks: [] });
        return;
      }

      const q = query(collection(db, 'tasks'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      set({ isLoading: false, tasks });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      });
    }
  },

  createTask: async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newTask = {
        ...taskData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      set((state) => ({
        isLoading: false,
        tasks: [...state.tasks, { id: docRef.id, ...newTask } as Task],
      }));
      toast.success('Task created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      });
    }
  },

  updateTask: async (id: string, taskData: Partial<Omit<Task, 'id' | 'user_id'>>) => {
    try {
      set({ isLoading: true, error: null });
      const taskRef = doc(db, 'tasks', id);
      const updateData = {
        ...taskData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(taskRef, updateData);
      set((state) => ({
        isLoading: false,
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updateData } : task)),
      }));
      toast.success('Task updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  },

  deleteTask: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'tasks', id));
      set((state) => ({
        isLoading: false,
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
      toast.success('Task deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      });
    }
  },
}));

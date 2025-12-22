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
import type { Job } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface JobsState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Omit<Job, 'id' | 'user_id'>>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, jobs: [] });
        return;
      }

      const q = query(collection(db, 'jobs'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];

      set({ isLoading: false, jobs });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      });
    }
  },

  createJob: async (jobData: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newJob = {
        ...jobData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'jobs'), newJob);
      set((state) => ({
        isLoading: false,
        jobs: [...state.jobs, { id: docRef.id, ...newJob } as Job],
      }));
      toast.success('Job created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      });
    }
  },

  updateJob: async (id: string, jobData: Partial<Omit<Job, 'id' | 'user_id'>>) => {
    try {
      set({ isLoading: true, error: null });
      const jobRef = doc(db, 'jobs', id);
      const updateData = {
        ...jobData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(jobRef, updateData);
      set((state) => ({
        isLoading: false,
        jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updateData } : job)),
      }));
      toast.success('Job updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
      });
    }
  },

  deleteJob: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'jobs', id));
      set((state) => ({
        isLoading: false,
        jobs: state.jobs.filter((job) => job.id !== id),
      }));
      toast.success('Job deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete job',
      });
    }
  },
}));

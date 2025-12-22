import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import type { JobApplication } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface ApplicationsState {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  recentApplications: JobApplication[] | null;
  fetchRecentApplications: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  createApplication: (
    application: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateApplication: (
    id: string,
    application: Partial<Omit<JobApplication, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: [],
  isLoading: false,
  error: null,
  recentApplications: null,

  fetchApplications: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, applications: [] });
        return;
      }

      const q = query(collection(db, 'job_applications'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const applications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JobApplication[];

      set({ isLoading: false, applications });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
      });
    }
  },

  fetchRecentApplications: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, recentApplications: [] });
        return;
      }

      const q = query(
        collection(db, 'job_applications'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(5),
      );
      const querySnapshot = await getDocs(q);
      const recentApplications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JobApplication[];

      set({ isLoading: false, recentApplications });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recent applications',
      });
    }
  },

  createApplication: async (
    applicationData: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newApplication = {
        ...applicationData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'job_applications'), newApplication);
      set((state) => ({
        isLoading: false,
        applications: [
          ...state.applications,
          { id: docRef.id, ...newApplication } as JobApplication,
        ],
      }));
      toast.success('Application created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create application',
      });
    }
  },

  updateApplication: async (
    id: string,
    applicationData: Partial<Omit<JobApplication, 'id' | 'user_id'>>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const appRef = doc(db, 'job_applications', id);
      const updateData = {
        ...applicationData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(appRef, updateData);
      set((state) => ({
        isLoading: false,
        applications: state.applications.map((app) =>
          app.id === id ? { ...app, ...updateData } : app,
        ),
      }));
      toast.success('Application updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update application',
      });
    }
  },

  deleteApplication: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'job_applications', id));
      set((state) => ({
        isLoading: false,
        applications: state.applications.filter((app) => app.id !== id),
      }));
      toast.success('Application deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete application',
      });
    }
  },
}));

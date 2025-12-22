import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import type { JobStatus } from '@/constants/job-statuses.constant';
import type { Job, JobApplication } from '@/types/db-tables';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface JobApplicationsState {
  jobApplications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  fetchJobApplications: () => Promise<void>;
  createJobApplication: (
    jobApplication: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateJobApplication: (
    id: string,
    jobApplication: Partial<Omit<JobApplication, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteJobApplication: (id: string) => Promise<void>;
  createOrUpdateJobApplicationFromJob: (jobId: string, status: JobStatus) => Promise<void>;
}

export const useJobApplicationsStore = create<JobApplicationsState>((set) => ({
  jobApplications: [],
  isLoading: false,
  error: null,

  fetchJobApplications: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, jobApplications: [] });
        return;
      }

      const q = query(collection(db, 'job_applications'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const jobApplications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JobApplication[];

      set({ isLoading: false, jobApplications });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job applications',
      });
    }
  },

  createJobApplication: async (
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
        jobApplications: [
          ...state.jobApplications,
          { id: docRef.id, ...newApplication } as JobApplication,
        ],
      }));
      toast.success('Job application created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create job application',
      });
    }
  },

  updateJobApplication: async (
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
        jobApplications: state.jobApplications.map((app) =>
          app.id === id ? ({ ...app, ...updateData } as any) : app,
        ),
      }));
      toast.success('Job application updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update job application',
      });
    }
  },

  deleteJobApplication: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'job_applications', id));
      set((state) => ({
        isLoading: false,
        jobApplications: state.jobApplications.filter((app) => app.id !== id),
      }));
      toast.success('Job application deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete job application',
      });
    }
  },

  createOrUpdateJobApplicationFromJob: async (jobId: string, status: JobStatus) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, get the job details
      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        throw new Error('Job not found');
      }

      const jobData = jobSnap.data() as Job;

      // Check if a job application already exists for this job
      const q = query(
        collection(db, 'job_applications'),
        where('job_id', '==', jobId),
        where('user_id', '==', user.uid),
        limit(1),
      );
      const querySnapshot = await getDocs(q);
      const existingAppDoc = querySnapshot.docs[0];

      const today = new Date().toISOString().split('T')[0];

      if (existingAppDoc) {
        const appId = existingAppDoc.id;
        const appRef = doc(db, 'job_applications', appId);
        const updateData = {
          status,
          updated_at: new Date().toISOString(),
        };

        await updateDoc(appRef, updateData);
        set((state) => ({
          isLoading: false,
          jobApplications: state.jobApplications.map((j) =>
            j.id === appId ? ({ ...j, status, updated_at: new Date().toISOString() } as any) : j,
          ),
        }));
      } else {
        const newJobApplication = {
          job_id: jobId,
          position_title: jobData.position,
          company_name: jobData.company,
          location: jobData.location ?? '',
          date_applied: today,
          status,
          user_id: user.uid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'job_applications'), newJobApplication);
        set((state) => ({
          isLoading: false,
          jobApplications: [
            ...state.jobApplications,
            { id: docRef.id, ...newJobApplication } as any,
          ],
        }));
      }
      toast.success('Successfully applied to the job!');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to create or update job application',
      });
    }
  },
}));

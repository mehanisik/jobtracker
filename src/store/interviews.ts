import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import type { Interview } from '@/types/db-tables';
import type { UpcomingInterview } from '@/types/upcoming-interviews';
import { db } from '@/utils/firebase';
import { useAuthStore } from './auth';
import { useErrorStore } from './error-handler';

interface InterviewState {
  interviews: Interview[];
  upcomingInterviews: UpcomingInterview[];
  isLoading: boolean;
  error: string | null;
  fetchInterviews: () => Promise<void>;
  fetchUpcomingInterviews: () => Promise<void>;
  createInterview: (
    interview: Omit<Interview, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  updateInterview: (
    id: string,
    interview: Partial<Omit<Interview, 'id' | 'user_id'>>,
  ) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
}

export const useInterviewsStore = create<InterviewState>((set) => ({
  interviews: [],
  upcomingInterviews: [],
  isLoading: false,
  error: null,

  fetchInterviews: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, interviews: [] });
        return;
      }

      const q = query(collection(db, 'interviews'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const interviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];

      set({ isLoading: false, interviews });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch interviews',
      });
    }
  },

  fetchUpcomingInterviews: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ isLoading: false, upcomingInterviews: [] });
        return;
      }

      // Fetch upcoming interviews
      const now = new Date().toISOString();
      const q = query(
        collection(db, 'interviews'),
        where('user_id', '==', user.uid),
        where('interview_date', '>', now),
        orderBy('interview_date', 'asc'),
      );
      const querySnapshot = await getDocs(q);
      const interviewDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];

      if (interviewDocs.length === 0) {
        set({ isLoading: false, upcomingInterviews: [] });
        return;
      }

      // Fetch all applications to "join" manually
      const appsQ = query(collection(db, 'job_applications'), where('user_id', '==', user.uid));
      const appsSnapshot = await getDocs(appsQ);
      const applications = new Map(appsSnapshot.docs.map((doc) => [doc.id, doc.data()]));

      const upcomingInterviews: UpcomingInterview[] = interviewDocs.map((interview) => {
        const app = applications.get(interview.application_id) as any;
        return {
          interview_id: interview.id,
          interview_date: interview.interview_date,
          interview_type: interview.interview_type,
          location: interview.location || null,
          status: interview.status,
          notes: interview.notes || null,
          company_name: app?.company_name || 'Unknown',
          position_title: app?.position_title || 'Unknown',
          application_location: app?.location || 'Unknown',
          date_applied: app?.date_applied || null,
        };
      });

      set({ isLoading: false, upcomingInterviews });
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch upcoming interviews',
      });
    }
  },

  createInterview: async (
    interviewData: Omit<Interview, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newInterview = {
        ...interviewData,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'interviews'), newInterview);
      set((state) => ({
        isLoading: false,
        interviews: [...state.interviews, { id: docRef.id, ...newInterview } as Interview],
      }));
      toast.success('Interview created successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create interview',
      });
    }
  },

  updateInterview: async (
    id: string,
    interviewData: Partial<Omit<Interview, 'id' | 'user_id'>>,
  ) => {
    try {
      set({ isLoading: true, error: null });
      const interviewRef = doc(db, 'interviews', id);
      const updateData = {
        ...interviewData,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(interviewRef, updateData);
      set((state) => ({
        isLoading: false,
        interviews: state.interviews.map((i) => (i.id === id ? { ...i, ...updateData } : i)),
      }));
      toast.success('Interview updated successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update interview',
      });
    }
  },

  deleteInterview: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'interviews', id));
      set((state) => ({
        isLoading: false,
        interviews: state.interviews.filter((i) => i.id !== id),
      }));
      toast.success('Interview deleted successfully');
    } catch (error) {
      useErrorStore.getState().showError(error as Error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete interview',
      });
    }
  },
}));

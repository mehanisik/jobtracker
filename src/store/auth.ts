import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { auth } from '@/utils/firebase';
import { useErrorStore } from './error-handler';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          set({
            user: userCredential.user,
            isLoading: false,
          });
          toast.success('Account created successfully!');
        } catch (error) {
          useErrorStore.getState().showError(error as Error);
          set({
            error: error instanceof Error ? error.message : 'An error occurred during sign up',
            isLoading: false,
          });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          set({
            user: userCredential.user,
            isLoading: false,
          });
          toast.success('Signed in successfully!');
        } catch (error) {
          useErrorStore.getState().showError(error as Error);
          set({
            error: error instanceof Error ? error.message : 'An error occurred during sign in',
            isLoading: false,
          });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          await firebaseSignOut(auth);
          set({
            user: null,
            isLoading: false,
          });
          toast.success('Signed out successfully!');
        } catch (error) {
          useErrorStore.getState().showError(error as Error);
          set({
            error: error instanceof Error ? error.message : 'An error occurred during sign out',
            isLoading: false,
          });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
          toast.success('Password reset email sent!');
        } catch (error) {
          useErrorStore.getState().showError(error as Error);
          set({
            error: error instanceof Error ? error.message : 'Failed to send reset password email',
            isLoading: false,
          });
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          set({
            user: userCredential.user,
            isLoading: false,
          });
          toast.success('Signed in with Google!');
        } catch (error) {
          useErrorStore.getState().showError(error as Error);
          set({
            error: error instanceof Error ? error.message : 'Failed to sign in with Google',
            isLoading: false,
          });
        }
      },

      signInWithGithub: async () => {
        try {
          set({ isLoading: true, error: null });
          const provider = new GithubAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          set({
            user: userCredential.user,
            isLoading: false,
          });
          toast.success('Signed in with GitHub!');
        } catch (error) {
          useErrorStore.getState().showError(error as Error);
          set({
            error: error instanceof Error ? error.message : 'Failed to sign in with Github',
            isLoading: false,
          });
        }
      },

      refreshSession: async () => {
        // Firebase handles token persistence and refresh automatically
        // We just need to ensure the user state is synced with the current auth state
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            set({ user });
            unsubscribe();
            resolve();
          });
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

import { onAuthStateChanged } from 'firebase/auth';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { auth } from './firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  useEffect(() => {
    // Initial sync
    void refreshSession();

    // Listen for changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useAuthStore.setState({
        user: user,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [refreshSession]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return toast.error(error);
  }

  return <>{children}</>;
}

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';
import { auth } from '../services/firebase';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user ?? null);

      if (!user) {
        clearAuth();
        return;
      }

      try {
        setLoading(true, 'Fetching your profile...');
        const res = await api.get('/api/auth/me');
        setProfile(res.data);
      } catch (err) {
        // Profile not set up yet or some backend error
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [setUser, setProfile, setLoading, clearAuth]);
}


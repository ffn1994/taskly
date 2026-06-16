import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Profile {
  full_name: string;
  working_hours_start: string;
  working_hours_end: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  isGuest: boolean;
  guestName: string;
  setGuestName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PROFILE: Profile = {
  full_name: 'مستخدم',
  working_hours_start: '09:00',
  working_hours_end: '17:00',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestNameState] = useState(
    localStorage.getItem('taskly_guest_name') || 'المستخدم'
  );

  const isGuest = !isSupabaseConfigured() || !user;

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data || DEFAULT_PROFILE);
    } catch {
      setProfile(DEFAULT_PROFILE);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message || null;
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return error?.message || null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const merged = { ...profile, ...data } as Profile;
    setProfile(merged);
    if (isSupabaseConfigured() && user) {
      await supabase.from('profiles').update(data).eq('id', user.id);
    }
    if (data.full_name) {
      localStorage.setItem('taskly_guest_name', data.full_name);
      setGuestNameState(data.full_name);
    }
  };

  const setGuestName = (name: string) => {
    localStorage.setItem('taskly_guest_name', name);
    setGuestNameState(name);
  };

  const displayProfile = profile || { ...DEFAULT_PROFILE, full_name: guestName };

  return (
    <AuthContext.Provider value={{
      user, session, profile: displayProfile, loading,
      signIn, signUp, signOut, updateProfile,
      isGuest, guestName, setGuestName,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

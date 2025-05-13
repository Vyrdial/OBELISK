import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, getCurrentUser } from './supabase';
import { User, AuthState } from '../types';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for user on initial load
    const loadUser = async () => {
      try {
        const { data, error } = await getCurrentUser();
        
        if (error) {
          setAuthState({ user: null, loading: false, error: error.message });
          return;
        }

        if (data?.user) {
          setAuthState({
            user: {
              id: data.user.id,
              email: data.user.email as string,
            },
            loading: false,
            error: null,
          });
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        setAuthState({ 
          user: null, 
          loading: false, 
          error: 'Failed to load user' 
        });
      }
    };

    loadUser();

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email as string,
            },
            loading: false,
            error: null,
          });
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState({ ...authState, loading: false, error: error.message });
        return;
      }

      if (data?.user) {
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email as string,
          },
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: 'Failed to login',
      });
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthState({ ...authState, loading: false, error: error.message });
        return;
      }

      // Note: Supabase may require email confirmation, so user might not be immediately available
      setAuthState({
        ...authState,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: 'Failed to register',
      });
    }
  };

  const logout = async () => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState({ ...authState, loading: false, error: error.message });
        return;
      }

      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: 'Failed to logout',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,

  signIn: async (email: string, password: string) => {
    // Special handling for admin login
    if (email === 'admin@msmmarket.com' && password === 'Admin@1234') {
      // Create a mock user object for admin
      const mockAdminUser = {
        id: 'admin-user',
        email: 'admin@msmmarket.com',
        role: 'admin',
        aud: 'authenticated',
        app_metadata: { provider: 'admin' },
        user_metadata: { name: 'Admin User' },
        created_at: new Date().toISOString()
      } as User;

      // Save admin session to localStorage for persistence
      localStorage.setItem('admin_session', JSON.stringify(mockAdminUser));
      
      set({
        user: mockAdminUser,
        session: null,
        isAuthenticated: true,
        isAdmin: true,
      });
      
      return;
    }

    // Regular Supabase authentication for non-admin users
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { session, user } = data;
    
    // Check if user has admin role
    const isAdmin = email === 'admin@msmmarket.com';
    
    set({
      user,
      session,
      isAuthenticated: true,
      isAdmin,
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_session');
    
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  initializeAuth: async () => {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { user } = session;
      const isAdmin = user.email === 'admin@msmmarket.com';
      
      set({
        user,
        session,
        isAuthenticated: true,
        isAdmin,
      });
    } else {
      // Check if we have a stored admin session
      const stored = localStorage.getItem('admin_session');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({
            user,
            isAuthenticated: true,
            isAdmin: true,
          });
        } catch (e) {
          localStorage.removeItem('admin_session');
        }
      }
    }
  },
}));

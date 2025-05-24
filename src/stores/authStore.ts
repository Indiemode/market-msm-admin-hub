
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// Mock authentication for now - in production this would connect to Supabase
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,

  signIn: async (email: string, password: string) => {
    console.log('Attempting login with:', email, password);
    
    // Mock authentication - replace with actual Supabase auth
    if (email === 'admin@msmmarket.com' && password === 'Admin@1234') {
      const user: User = {
        id: '1',
        email: 'admin@msmmarket.com',
        role: 'admin'
      };
      
      set({
        user,
        isAuthenticated: true,
        isAdmin: true,
      });
    } else {
      throw new Error('Invalid credentials');
    }
  },

  signOut: async () => {
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  initializeAuth: async () => {
    // Check for existing session - in production this would check Supabase session
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      const user = JSON.parse(stored);
      set({
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
      });
    }
  },
}));

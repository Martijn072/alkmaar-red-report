import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WordPressUser {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  token: string;
  supabase_user_id?: string;
}

interface WordPressAuthContextType {
  user: WordPressUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const WordPressAuthContext = createContext<WordPressAuthContextType | undefined>(undefined);

export const useWordPressAuth = () => {
  const context = useContext(WordPressAuthContext);
  if (context === undefined) {
    throw new Error('useWordPressAuth must be used within a WordPressAuthProvider');
  }
  return context;
};

interface WordPressAuthProviderProps {
  children: React.ReactNode;
}

export const WordPressAuthProvider = ({ children }: WordPressAuthProviderProps) => {
  const [user, setUser] = useState<WordPressUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('wordpress_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Validate token expiry
        if (userData.token && new Date(userData.expires) > new Date()) {
          setUser(userData);
        } else {
          localStorage.removeItem('wordpress_user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('wordpress_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call WordPress auth edge function
      const { data, error } = await supabase.functions.invoke('wordpress-auth', {
        body: {
          action: 'login',
          email,
          password
        }
      });

      if (error) throw error;

      if (data.success) {
        const userData = data.user;
        setUser(userData);
        
        // Store in localStorage with expiry
        localStorage.setItem('wordpress_user', JSON.stringify({
          ...userData,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }));

        return { success: true };
      } else {
        return { success: false, error: data.message || 'Inloggen mislukt' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Er is een fout opgetreden' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wordpress-auth', {
        body: {
          action: 'register',
          username,
          email,
          password,
          display_name: displayName
        }
      });

      if (error) throw error;

      if (data.success) {
        // Auto-login after successful registration
        return await login(email, password);
      } else {
        return { success: false, error: data.message || 'Registratie mislukt' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Er is een fout opgetreden' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('wordpress_user');
    
    // Also sign out from Supabase if connected
    await supabase.auth.signOut();
  };

  const value: WordPressAuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <WordPressAuthContext.Provider value={value}>
      {children}
    </WordPressAuthContext.Provider>
  );
};
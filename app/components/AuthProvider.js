"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const createProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId,
          full_name: "",
          avatar_url: ""
        }])
        .select()
        .single();

      console.log('Profile creation attempt:', {
        userId,
        result: data,
        error: error ? JSON.stringify(error) : 'none'
      });

      return { data, error };
    } catch (error) {
      console.error('Caught error during profile creation:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)
            .single();
          
          if (!profile) {
            await createProfile(session.user.id);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Session error:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single();
        
        if (!profile) {
          await createProfile(session.user.id);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "../components/AuthProvider";

export default function Settings() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState({
    fullName: "",
    loading: true,
    error: "",
    success: ""
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
  
      // Log the authenticated user's ID
      console.log("Authenticated User ID:", user.id);
  
      try {
        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Supabase fetch response:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error.message || error);
          throw error;
        }

        if (!data) {
          console.log('No profile found, creating one');
          const { error: createError, data: createData } = await supabase
            .from('profiles')
            .insert([{ user_id: user.id, full_name: "" }]);

          console.log('Profile creation response:', { createData, createError });

          if (createError) {
            console.error('Profile creation error:', createError.message || createError);
            throw createError;
          }
        }

        setState(prev => ({
          ...prev,
          fullName: data?.full_name || "",
          loading: false
        }));
      } catch (error) {
        console.error('Profile error:', error.message || error);
        setState(prev => ({
          ...prev,
          error: `Error loading profile: ${error.message || error}`,
          loading: false
        }));
      }
    }

    loadProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, error: "", success: "" }));

    try {
      const { error, data } = await supabase
        .from('profiles')
        .update({ full_name: state.fullName })
        .eq('user_id', user.id);

      console.log('Profile update response:', { data, error });

      if (error) {
        console.error('Profile update error:', error.message || error);
        throw error;
      }

      setState(prev => ({ ...prev, success: "Profile updated successfully!" }));
    } catch (error) {
      console.error('Update error:', error.message || error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to update profile: ${error.message || error}` 
      }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Please log in to access settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

      {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert variant="default" className="mb-4 border-green-500 text-green-500">
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={state.fullName}
            onChange={(e) => setState(prev => ({ ...prev, fullName: e.target.value }))}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors duration-200"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}



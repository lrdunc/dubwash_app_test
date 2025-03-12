"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { AuthContextType } from "@/types/auth";

interface SettingsFormState {
  fullName: string;
  email: string;
  avatarUrl: string;
  loading: boolean;
  error: string;
  success: string;
}

const MIN_NAME_LENGTH = 3;

export default function SettingsForm() {
  const router = useRouter();
  const { user } = useAuth() as AuthContextType;
  const supabase = createClient();
  
  const [state, setState] = useState<SettingsFormState>({
    fullName: "",
    email: "",
    avatarUrl: "",
    loading: true,
    error: "",
    success: ""
  });

  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      console.log("Fetching profile for user:", user.id);
      
      const { data: profiles, error: countError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id);
        
      console.log("Profile query results:", {
        profiles,
        error: countError,
        count: profiles?.length
      });

      if (countError) {
        console.error("Error checking profiles:", countError);
        setState(prev => ({
          ...prev,
          error: `Error checking profiles: ${countError.message}`,
          loading: false
        }));
        return;
      }

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setState(prev => ({
          ...prev,
          fullName: profile.full_name || "",
          email: user.email || "",
          avatarUrl: profile.avatar_url || "",
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false
        }));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to fetch profile",
        loading: false
      }));
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(prev => ({ ...prev, error: "", success: "" }));

    if (!user) {
      setState(prev => ({ 
        ...prev, 
        error: "You must be logged in to update your profile." 
      }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: state.fullName,
          avatar_url: state.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error("Update error:", error);
        setState(prev => ({ 
          ...prev, 
          error: `Failed to update profile: ${error.message}` 
        }));
        return;
      }

      console.log("Profile updated:", data);
      setState(prev => ({ ...prev, success: "Profile updated successfully!" }));
      
      setTimeout(async () => {
        await router.refresh();
        await fetchUserProfile();
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      console.error("Unexpected error:", err);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to update profile. Please try again." 
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

      <form onSubmit={handleUpdate} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
            <input
              type="text"
              value={state.fullName}
              onChange={(e) => setState(prev => ({ ...prev, fullName: e.target.value }))}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black"
              required
              minLength={MIN_NAME_LENGTH}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email (read-only)
            <input
              type="email"
              value={state.email}
              readOnly
              className="mt-1 block w-full rounded border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed"
            />
          </label>
        </div>

        <button 
          type="submit" 
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors duration-200"
        >
          Update Profile
        </button>
      </form>

      {state.success && (
        <Alert variant="default" className="mt-4 border-green-500 text-green-500">
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
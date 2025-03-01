'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function SetupPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [tableExists, setTableExists] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!userData) {
          router.push('/auth/login');
          return;
        }

        setUser(userData);
        
        // Check if vehicles table exists
        checkVehiclesTable();
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, supabase]);

  const checkVehiclesTable = async () => {
    try {
      setLoading(true);
      
      // Simply try to count vehicles to see if table exists and is accessible
      const { count, error } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log('Error checking vehicles table:', error);
        if (error.message && error.message.includes('does not exist')) {
          setError('The vehicles table does not exist in your database.');
          setTableExists(false);
        } else {
          setError(`Error accessing vehicles table: ${error.message}`);
          setTableExists(null);
        }
      } else {
        setTableExists(true);
        setMessage(`Vehicles table exists and is accessible! Count: ${count}`);
      }
    } catch (error) {
      console.error('Error checking vehicles table:', error);
      setError(`Error checking vehicles table: ${error.message}`);
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const createVehiclesTable = async () => {
    setMessage('To create the vehicles table, please follow the manual setup instructions below.');
    setError(null);
    
    // Instead of trying to create the table programmatically, provide clear instructions
    setTableExists(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center">
            <Link href="/">
              <button className="mr-4 text-white/80 hover:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </button>
            </Link>
            <h2 className="text-2xl font-bold">Database Setup</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md">
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Vehicles Table Status
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {tableExists === null ? 'Checking if vehicles table exists...' :
                 tableExists ? 'Vehicles table exists in your database.' :
                 'Vehicles table does not exist in your database.'}
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={checkVehiclesTable}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Check Table Status'}
                </button>
                
                {!tableExists && (
                  <a
                    href="https://app.supabase.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <span>Go to Supabase Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Manual Setup Instructions
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To create the vehicles table in your Supabase database, follow these steps:
              </p>
              
              <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Go to the <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Navigate to the SQL Editor (in the left sidebar)</li>
                <li>Click &quot;New Query&quot;</li>
                <li>Copy and paste the SQL code below</li>
                <li>Click &quot;Run&quot; to execute the query</li>
                <li>Return to this page and click &quot;Check Table Status&quot; to verify the table was created</li>
              </ol>
              
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-300">
{`-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'sedan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own vehicles
CREATE POLICY "Users can view their own vehicles" 
  ON public.vehicles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own vehicles
CREATE POLICY "Users can insert their own vehicles" 
  ON public.vehicles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own vehicles
CREATE POLICY "Users can update their own vehicles" 
  ON public.vehicles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own vehicles
CREATE POLICY "Users can delete their own vehicles" 
  ON public.vehicles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX vehicles_user_id_idx ON public.vehicles (user_id);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
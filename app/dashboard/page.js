'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') { // Handle no rows found
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: userId,
              full_name: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setProfile(newProfile);
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error managing profile:', error);
      setError('Error managing profile. Please try again.');
    }
  };

  const fetchVehicles = async (userId) => {
    try {
      // First check if the vehicles table exists by using a try-catch approach
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          // If there's an error, it might be because the table doesn't exist
          // Just set empty vehicles array and return silently
          setVehicles([]);
          return;
        }
        
        setVehicles(data || []);
      } catch (innerError) {
        // Catch any unexpected errors and set empty vehicles array
        setVehicles([]);
      }
    } catch (error) {
      // This is a fallback catch - should never be reached but just in case
      setVehicles([]);
    }
  };

  const fetchUpcomingBookings = async (userId) => {
    try {
      // This is a placeholder - implement actual booking fetching when that feature is ready
      setUpcomingBookings([]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

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
        await fetchProfile(userData.id);
        await fetchVehicles(userData.id);
        await fetchUpcomingBookings(userData.id);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchVehicles(session.user.id);
        await fetchUpcomingBookings(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setVehicles([]);
        setUpcomingBookings([]);
      }
    });

    return () => {
      authListener?.unsubscribe && authListener.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg shadow-md max-w-md w-full">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-blue-100">
                Manage your vehicles and car wash bookings all in one place.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-400 flex items-center justify-center border-4 border-white">
                  <span className="text-2xl font-bold text-white">
                    {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vehicles Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Vehicles</h2>
              <Link href="/vehicles/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Add Vehicle
                </button>
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t added any vehicles yet</p>
                <Link href="/vehicles/new">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Your First Vehicle
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {vehicle.color} • {vehicle.vehicle_type}
                      </p>
                    </div>
                    <Link href={`/vehicles/edit/${vehicle.id}`}>
                      <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        Edit
                      </button>
                    </Link>
                  </div>
                ))}
                {vehicles.length > 3 && (
                  <div className="text-center mt-4">
                    <Link href="/vehicles">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline">
                        View All Vehicles
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/search">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Find Services</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search for car wash services near you</p>
                </div>
              </Link>
              
              <Link href="/profile">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Edit Profile</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal information</p>
                </div>
              </Link>
              
              <Link href="/vehicles">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Manage Vehicles</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add or edit your vehicles</p>
                </div>
              </Link>
              
              <Link href="/settings">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                  <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
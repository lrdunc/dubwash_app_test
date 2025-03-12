'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/app/components/ui/Logo';
import { VendorDashboardData, VendorBooking, VendorService } from '@/types/vendor';
import { Database } from '@/types/supabase';

export default function VendorDashboard() {
  const [vendorData, setVendorData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // DEVELOPMENT BYPASS - Comment out authentication for testing
        /*
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          router.push('/auth/vendor-login');
          return;
        }
        */

        // Mock user ID for development
        const mockUserId = '123';

        // Mock vendor profile data for development
        const mockVendorData = {
          profile: {
            id: '1',
            user_id: mockUserId,
            business_name: 'Test Wash Service',
            description: 'Mobile car wash service for testing',
            address: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zip_code: '12345',
            service_radius: 25,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          recent_bookings: [],
          total_earnings: 0,
          total_bookings: 0,
          rating: 4.5,
          services: []
        };

        setVendorData(mockVendorData);
        setLoading(false);

        /* Comment out Supabase queries for testing
        // Get vendor profile
        const { data: profile, error: profileError } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        // Get recent bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(...)
        */
      } catch (err) {
        console.error('Error fetching vendor data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.push('/auth/vendor-login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while signing out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/auth/vendor-login')}
            className="mt-4 text-blue-500 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">No vendor data found. Please complete your profile setup.</p>
          <button
            onClick={() => router.push('/vendor/setup')}
            className="mt-4 text-blue-500 hover:underline"
          >
            Setup Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-300 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/vendor/dashboard">
            <Logo className="h-16 w-16" />
          </Link>
        </div>
        <div className="space-x-4">
          <Link href="/vendor/dashboard">
            <span className="text-black hover:underline cursor-pointer">Dashboard</span>
          </Link>
          <Link href="/vendor/services">
            <span className="text-black hover:underline cursor-pointer">Services</span>
          </Link>
          <Link href="/vendor/bookings">
            <span className="text-black hover:underline cursor-pointer">Bookings</span>
          </Link>
          <Link href="/vendor/profile">
            <span className="text-black hover:underline cursor-pointer">Business Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="border border-black px-4 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {vendorData.profile.business_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your business performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
            <p className="text-3xl font-bold text-green-600">${vendorData.total_earnings.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">{vendorData.total_bookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">{vendorData.rating.toFixed(1)}/5.0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Active Services</h3>
            <p className="text-3xl font-bold text-purple-600">
              {vendorData.services.filter((s: VendorService) => s.is_active).length}
            </p>
          </div>
        </div>

        {/* Recent Bookings and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
                {vendorData.recent_bookings.length === 0 ? (
                  <p className="text-gray-500">No recent bookings</p>
                ) : (
                  <div className="space-y-4">
                    {vendorData.recent_bookings.map((booking) => (
                      <div key={booking.id} className="border-b pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {booking.vehicles.make} {booking.vehicles.model} ({booking.vehicles.year})
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Customer: {booking.profiles.full_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-medium text-gray-900">
                              ${booking.total_price.toFixed(2)}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-4">
                  <Link href="/vendor/bookings">
                    <button className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      View All Bookings
                    </button>
                  </Link>
                  <Link href="/vendor/services">
                    <button className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      Manage Services
                    </button>
                  </Link>
                  <Link href="/vendor/profile">
                    <button className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                      Update Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
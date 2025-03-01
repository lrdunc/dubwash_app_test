'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchVendorData = async (userId) => {
    try {
      // Fetch vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (vendorError) throw vendorError;
      setVendorProfile(vendorData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch recent bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (full_name, email),
          services:service_id (name, price)
        `)
        .eq('vendor_id', userId)
        .order('booking_date', { ascending: false })
        .limit(5);

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      setError('Failed to fetch vendor data. Please try again.');
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
        await fetchVendorData(userData.id);
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
        await fetchVendorData(session.user.id);
      } else {
        setUser(null);
        setVendorProfile(null);
        setServices([]);
        setBookings([]);
      }
    });

    return () => {
      authListener?.unsubscribe && authListener.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-300 p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">DubWash Vendor Dashboard</h1>
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Business Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            {vendorProfile ? (
              <div>
                <p className="font-bold text-lg">{vendorProfile.business_name}</p>
                <p className="text-gray-600 mt-2">{vendorProfile.business_description || 'No description added yet'}</p>
                <div className="mt-4">
                  <p className="text-sm">
                    <span className="font-medium">Service Type:</span> {vendorProfile.is_mobile ? 'Mobile' : 'Fixed Location'}
                  </p>
                  {vendorProfile.service_radius && (
                    <p className="text-sm">
                      <span className="font-medium">Service Radius:</span> {vendorProfile.service_radius} miles
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Rating:</span> {vendorProfile.average_rating ? `${vendorProfile.average_rating}/5` : 'No ratings yet'}
                  </p>
                </div>
                <Link href="/vendor/profile">
                  <button className="mt-4 w-full border border-black py-2 rounded-md hover:bg-black hover:text-white transition">
                    Edit Business Profile
                  </button>
                </Link>
              </div>
            ) : (
              <p>No business profile found. Please create one.</p>
            )}
          </div>

          {/* Services Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Services</h2>
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.slice(0, 3).map((service) => (
                  <div key={service.id} className="border-b pb-2">
                    <p className="font-medium">{service.name}</p>
                    <div className="flex justify-between text-sm">
                      <span>${service.price.toFixed(2)}</span>
                      <span>{service.duration} mins</span>
                    </div>
                  </div>
                ))}
                {services.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{services.length - 3} more services
                  </p>
                )}
                <Link href="/vendor/services">
                  <button className="mt-2 w-full border border-black py-2 rounded-md hover:bg-black hover:text-white transition">
                    Manage Services
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="mb-4">You haven't added any services yet.</p>
                <Link href="/vendor/services/new">
                  <button className="w-full border border-black py-2 rounded-md hover:bg-black hover:text-white transition">
                    Add Your First Service
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Bookings Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <p className="font-medium">{booking.services?.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm">{booking.profiles?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                    </p>
                  </div>
                ))}
                <Link href="/vendor/bookings">
                  <button className="mt-2 w-full border border-black py-2 rounded-md hover:bg-black hover:text-white transition">
                    View All Bookings
                  </button>
                </Link>
              </div>
            ) : (
              <p>No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
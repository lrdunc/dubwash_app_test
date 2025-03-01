'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorServices() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!userData) {
          router.push('/auth/login');
          return;
        }

        setUser(userData);

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('vendor_id', userData.id)
          .order('created_at', { ascending: false });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleToggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, is_active: !service.is_active } 
          : service
      ));
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Services</h2>
          <Link href="/vendor/services/new">
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition">
              Add New Service
            </button>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-medium mb-4">No Services Added Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first car wash service to attract customers.
            </p>
            <Link href="/vendor/services/new">
              <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
                Add Your First Service
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.service_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${service.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.duration} mins</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleServiceStatus(service.id, service.is_active)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link href={`/vendor/services/edit/${service.id}`}>
                        <span className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer">Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
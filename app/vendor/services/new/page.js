'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewService() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState('basic_wash');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);

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
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !description || !serviceType || !price || !duration) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const numericPrice = parseFloat(price);
      const numericDuration = parseInt(duration, 10);

      if (isNaN(numericPrice) || numericPrice <= 0) {
        setError('Please enter a valid price.');
        setSubmitting(false);
        return;
      }

      if (isNaN(numericDuration) || numericDuration <= 0) {
        setError('Please enter a valid duration in minutes.');
        setSubmitting(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('services')
        .insert({
          vendor_id: user.id,
          name,
          description,
          service_type: serviceType,
          price: numericPrice,
          duration: numericDuration,
          is_active: isActive
        })
        .select();

      if (insertError) throw insertError;

      router.push('/vendor/services');
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Failed to create service. Please try again.');
    } finally {
      setSubmitting(false);
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
        <div className="flex items-center mb-6">
          <Link href="/vendor/services">
            <button className="mr-4 text-gray-600 hover:text-black">
              ← Back to Services
            </button>
          </Link>
          <h2 className="text-2xl font-semibold">Add New Service</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g. Premium Car Wash"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Describe what's included in this service..."
                required
              />
            </div>

            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                Service Type *
              </label>
              <select
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="basic_wash">Basic Wash</option>
                <option value="premium_wash">Premium Wash</option>
                <option value="interior_cleaning">Interior Cleaning</option>
                <option value="full_detail">Full Detail</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g. 60"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Service is active and available for booking
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/vendor/services">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
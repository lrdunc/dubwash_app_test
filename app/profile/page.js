'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('User error:', userError);
          throw new Error(userError.message || 'Failed to fetch user data');
        }

        if (!userData) {
          router.push('/auth/login');
          return;
        }

        setUser(userData);

        // Fetch profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') { 
              // Not found is okay, we'll create a new profile later
              console.log('Profile not found, will create on save');
            } else {
              console.error('Profile error:', profileError);
              throw new Error(profileError.message || 'Failed to fetch profile data');
            }
          } else if (profileData) {
            setProfile(profileData);
            
            // Split full name into first and last name
            const fullNameParts = (profileData.full_name || '').split(' ');
            setFirstName(fullNameParts[0] || '');
            setLastName(fullNameParts.slice(1).join(' ') || '');
            
            // Set other form values
            setPhoneNumber(profileData.phone_number || '');
            setAddress(profileData.address || '');
            setCity(profileData.city || '');
            setState(profileData.state || '');
            setZipCode(profileData.zip_code || '');
          }
        } catch (profileFetchError) {
          console.error('Error fetching profile:', profileFetchError);
          setError('Failed to fetch profile data: ' + profileFetchError.message);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load profile: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName) {
      setError('Please enter your first name.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      if (!user || !user.id) {
        throw new Error('User information is missing. Please log in again.');
      }

      // Combine first and last name
      const fullName = `${firstName} ${lastName}`.trim();

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          phone_number: phoneNumber,
          address,
          city,
          state,
          zip_code: zipCode,
          updated_at: new Date().toISOString(),
          // Add created_at if it's a new profile
          created_at: profile ? undefined : new Date().toISOString()
        });

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(updateError.message || 'Failed to update profile');
      }

      setSuccess(true);
      
      // Update the profile state
      setProfile({
        ...profile,
        full_name: fullName,
        phone_number: phoneNumber,
        address,
        city,
        state,
        zip_code: zipCode
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + (error.message || 'Please try again'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">My Profile</h1>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-300 rounded-md">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-black dark:bg-gray-700 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
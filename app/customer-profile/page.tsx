'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import Image from 'next/image';
import { Database } from '@/types/supabase';

interface CustomerProfile {
  name: string;
  phoneNumber: string;
  profilePicture: File | null;
  washAddress: string;
  vehicles: Vehicle[];
  favoriteWasher: string;
  specialInstructions: string;
}

interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

export default function CustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfile>({
    name: '',
    phoneNumber: '',
    profilePicture: null,
    washAddress: '',
    vehicles: [],
    favoriteWasher: '',
    specialInstructions: ''
  });

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

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
          router.push('/auth/customer-login');
          return;
        }

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
            // Split full name into first and last name
            const fullNameParts = (profileData.full_name || '').split(' ');
            setProfile(prev => ({
              ...prev,
              name: fullNameParts[0] || '',
              phoneNumber: profileData.phone_number || '',
              washAddress: profileData.address || '',
              favoriteWasher: profileData.favorite_washer || '',
              specialInstructions: profileData.special_instructions || ''
            }));
          }
        } catch (profileFetchError) {
          console.error('Error fetching profile:', profileFetchError);
          setError('Failed to fetch profile data: ' + (profileFetchError as Error).message);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load profile: ' + ((error as Error).message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle]
    }));
    setNewVehicle({
      make: '',
      model: '',
      year: '',
      color: '',
      licensePlate: ''
    });
  };

  const handleVehicleRemove = (index: number) => {
    setProfile(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.name) {
      setError('Please enter your name.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.name,
          phone_number: profile.phoneNumber,
          address: profile.washAddress,
          favorite_washer: profile.favoriteWasher,
          special_instructions: profile.specialInstructions,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(updateError.message || 'Failed to update profile');
      }

      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + ((error as Error).message || 'Please try again'));
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
        <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">Customer Profile</h1>

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
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  {profile.profilePicture ? (
                    <Image
                      src={URL.createObjectURL(profile.profilePicture)}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      👤
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Wash Address
              </label>
              <input
                type="text"
                name="washAddress"
                value={profile.washAddress}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Special Instructions (Optional)
              </label>
              <textarea
                name="specialInstructions"
                value={profile.specialInstructions}
                onChange={handleProfileChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Favorite Washer (Optional)
              </label>
              <input
                type="text"
                name="favoriteWasher"
                value={profile.favoriteWasher}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
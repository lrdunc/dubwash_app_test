'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Vehicles() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
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

        // Fetch vehicles
        try {
          const { data: vehiclesData, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false });

          if (vehiclesError) {
            console.error('Error fetching vehicles:', vehiclesError);
            
            // Check if the error is related to the table not existing
            if (vehiclesError.message && vehiclesError.message.includes('does not exist')) {
              setError('The vehicles table does not exist in your database. Please go to the setup page to create it.');
            } else {
              setError(`Failed to fetch vehicles: ${vehiclesError.message}`);
            }
            
            setVehicles([]);
          } else {
            setVehicles(vehiclesData || []);
          }
        } catch (innerError) {
          // Handle case where vehicles table might not exist
          console.error('Error fetching vehicles:', innerError);
          setError(`An unexpected error occurred: ${innerError.message}`);
          setVehicles([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const confirmDeleteVehicle = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowConfirmDialog(true);
    setDeleteError(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setVehicleToDelete(null);
    setDeleteError(null);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setDeletingId(vehicleToDelete.id);
      setDeleteError(null);
      
      console.log(`Deleting vehicle: ${vehicleToDelete.year} ${vehicleToDelete.make} ${vehicleToDelete.model}`);
      
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleToDelete.id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      // Update local state
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleToDelete.id));
      setShowConfirmDialog(false);
      setVehicleToDelete(null);
      
      // Show temporary success message (could be implemented with a toast notification)
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setDeleteError(`Failed to delete vehicle: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Try Again
            </button>
            <Link href="/admin/setup">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Go to Setup Page
              </button>
            </Link>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-md">
            <p>If you&apos;re seeing errors about tables not existing, you may need to set up your database first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">My Vehicles</h1>
            <Link href="/vehicles/new">
              <button className="bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-md">
                Add New Vehicle
              </button>
            </Link>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-4 text-gray-800 dark:text-white">No Vehicles Added Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your vehicles to easily book car wash services.
            </p>
            <Link href="/vehicles/new">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
                Add Your First Vehicle
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h2>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Color:</span> {vehicle.color}
                    </p>
                    {vehicle.license_plate && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">License Plate:</span> {vehicle.license_plate}
                      </p>
                    )}
                    {vehicle.vehicle_type && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span> {vehicle.vehicle_type}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href={`/vehicles/edit/${vehicle.id}`}>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => confirmDeleteVehicle(vehicle)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                      disabled={deletingId === vehicle.id}
                    >
                      {deletingId === vehicle.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && vehicleToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete your {vehicleToDelete.year} {vehicleToDelete.make} {vehicleToDelete.model}? 
                This action cannot be undone.
              </p>
              
              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
                  {deleteError}
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={deletingId === vehicleToDelete.id}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                  disabled={deletingId === vehicleToDelete.id}
                >
                  {deletingId === vehicleToDelete.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Vehicle'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { carMakes, carModelsByMake, generateYears } from '../../../data/vehicleData';

export default function EditVehicle() {
  // Use the useParams hook to get the id parameter from the URL
  const params = useParams();
  const vehicleId = params.id;
  
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('sedan');
  
  // Dropdown state
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [years] = useState(generateYears());
  
  // Refs for dropdown containers
  const makeDropdownRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

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

        // Fetch vehicle
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .eq('user_id', userData.id)
          .single();

        if (vehicleError) {
          if (vehicleError.code === 'PGRST116') {
            // No vehicle found or not owned by this user
            router.push('/vehicles');
            return;
          }
          throw vehicleError;
        }

        setVehicle(vehicleData);
        
        // Set form values
        setMake(vehicleData.make || '');
        setModel(vehicleData.model || '');
        setYear(vehicleData.year?.toString() || '');
        setColor(vehicleData.color || '');
        setLicensePlate(vehicleData.license_plate || '');
        setVehicleType(vehicleData.vehicle_type || 'sedan');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch vehicle data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Add click outside listener to close dropdowns
    const handleClickOutside = (event) => {
      if (makeDropdownRef.current && !makeDropdownRef.current.contains(event.target)) {
        setShowMakeDropdown(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [vehicleId, router, supabase]);
  
  // Update available models when make changes
  useEffect(() => {
    if (make) {
      setAvailableModels(carModelsByMake[make] || []);
      // Reset model if the current model isn't available for the new make
      if (model && !carModelsByMake[make]?.includes(model)) {
        setModel('');
      }
    } else {
      setAvailableModels([]);
      setModel('');
    }
  }, [make, model]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!make || !model || !year || !color || !licensePlate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const numericYear = parseInt(year, 10);

      if (isNaN(numericYear) || numericYear < 1900 || numericYear > new Date().getFullYear() + 1) {
        setError('Please enter a valid year.');
        setSubmitting(false);
        return;
      }

      // Create the vehicle update data object
      const vehicleData = {
        make,
        model,
        year: numericYear,
        color,
        license_plate: licensePlate,
        vehicle_type: vehicleType,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating vehicle data:', vehicleData);

      // Directly attempt to update without checking if table exists
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', vehicleId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        
        // Check if the error is related to missing table
        if (updateError.message && updateError.message.includes('does not exist')) {
          setError('The vehicles table does not exist in the database. Please create it first.');
        } else {
          setError(`Failed to update vehicle: ${updateError.message || 'Unknown error'}`);
        }
        return;
      }

      console.log('Vehicle updated successfully');
      router.push('/vehicles');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setError(`Failed to update vehicle: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg shadow-md max-w-md w-full">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          <div className="mt-4 text-center">
            <Link href="/vehicles">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2">
                Back to Vehicles
              </button>
            </Link>
            {error.includes('does not exist') && (
              <Link href="/admin/setup">
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Go to Setup Page
                </button>
              </Link>
            )}
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
          <div className="flex items-center">
            <Link href="/vehicles">
              <button className="mr-4 text-white/80 hover:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Vehicles
              </button>
            </Link>
            <h2 className="text-2xl font-bold">Edit Vehicle</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              <p>{error}</p>
              {error.includes('does not exist') && (
                <div className="mt-2">
                  <Link href="/admin/setup">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                      Go to Setup Page
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={makeDropdownRef}>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="make"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    onFocus={() => setShowMakeDropdown(true)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Select a make"
                    required
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {showMakeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                    <ul className="py-1">
                      {carMakes.map((makeName) => (
                        <li 
                          key={makeName} 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            setMake(makeName);
                            setShowMakeDropdown(false);
                          }}
                        >
                          {makeName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative" ref={modelDropdownRef}>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    onFocus={() => make && setShowModelDropdown(true)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={make ? "Select a model" : "Please select a make first"}
                    required
                    disabled={!make}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {showModelDropdown && make && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                    <ul className="py-1">
                      {availableModels.map((modelName) => (
                        <li 
                          key={modelName} 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            setModel(modelName);
                            setShowModelDropdown(false);
                          }}
                        >
                          {modelName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={yearDropdownRef}>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    onFocus={() => setShowYearDropdown(true)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Select a year"
                    required
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {showYearDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                    <ul className="py-1">
                      {years.map((yearValue) => (
                        <li 
                          key={yearValue} 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            setYear(yearValue.toString());
                            setShowYearDropdown(false);
                          }}
                        >
                          {yearValue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Blue"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Plate *
                </label>
                <input
                  type="text"
                  id="licensePlate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. ABC123"
                  required
                />
              </div>

              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="wagon">Wagon</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/vehicles">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
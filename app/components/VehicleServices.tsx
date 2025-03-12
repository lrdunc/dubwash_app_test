'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface Vehicle {
  id?: string;
  vendor_id?: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface VehicleServicesProps {
  vendorId: string;
  supabase: SupabaseClient<Database>;
}

const VEHICLE_TYPES: Vehicle[] = [
  {
    name: 'Small Car',
    description: 'Compact and subcompact vehicles',
    is_active: false,
  },
  {
    name: 'Medium Car',
    description: 'Standard sedans and crossovers',
    is_active: false,
  },
  {
    name: 'Large Car',
    description: 'SUVs, trucks, and vans',
    is_active: false,
  },
];

export default function VehicleServices({ vendorId, supabase }: VehicleServicesProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLE_TYPES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vendorId) {
      fetchVehicles();
    }
  }, [vendorId]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_vehicles')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Merge with defaults
      const mergedVehicles = VEHICLE_TYPES.map(defaultVehicle => {
        const existing = data?.find(d => d.name === defaultVehicle.name);
        return existing || defaultVehicle;
      });

      setVehicles(mergedVehicles);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching vehicles:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while fetching vehicles');
      }
    }
  };

  const handleToggleVehicle = async (vehicle: Vehicle) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const existing = vehicles.find(v => v.name === vehicle.name);
      
      if (existing?.id) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vendor_vehicles')
          .update({ is_active: !existing.is_active })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vendor_vehicles')
          .insert([
            {
              vendor_id: vendorId,
              name: vehicle.name,
              description: vehicle.description,
              is_active: true,
            },
          ]);

        if (error) throw error;
      }

      // Refresh the vehicles list
      await fetchVehicles();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in handleToggleVehicle:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while updating the vehicle');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Vehicle Types</h2>
        <span className="text-sm text-gray-500">(select at least 1)</span>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.name}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVehicle(vehicle)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    vehicle.is_active
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {vehicle.is_active && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-gray-900">{vehicle.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-7">{vehicle.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
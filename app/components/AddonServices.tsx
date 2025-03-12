'use client';

import { useState, useEffect, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface Addon {
  id?: string;
  name: string;
  category: 'exterior' | 'interior' | 'convenience';
  price: number;
  is_active?: boolean;
  description?: string;
  vendor_id?: string;
}

interface AddonServicesProps {
  vendorId: string;
  supabase: SupabaseClient<Database>;
  addons: Addon[];
  setAddons: (addons: Addon[]) => void;
}

const DEFAULT_ADDONS: Record<string, Addon[]> = {
  exterior: [
    {
      name: 'Spray Wax / Ceramic Coating',
      category: 'exterior',
      price: 0,
    },
    {
      name: 'Tire Shine',
      category: 'exterior',
      price: 0,
    },
    {
      name: 'Wheel & Rim Cleaning',
      category: 'exterior',
      price: 0,
    },
  ],
  interior: [
    {
      name: 'Carpet & Seat Shampooing',
      category: 'interior',
      price: 0,
    },
    {
      name: 'Leather Conditioning',
      category: 'interior',
      price: 0,
    },
    {
      name: 'Odor Elimination / Ozone Treatment',
      category: 'interior',
      price: 0,
    },
    {
      name: 'Interior Steam Cleaning',
      category: 'interior',
      price: 0,
    },
    {
      name: 'Dashboard & Console UV Protectant',
      category: 'interior',
      price: 0,
    },
    {
      name: 'Pet Hair Removal',
      category: 'interior',
      price: 0,
    },
  ],
  convenience: [
    {
      name: 'Express Detailing',
      category: 'convenience',
      price: 0,
    },
    {
      name: 'Paint Protection Film (PPF) Application',
      category: 'convenience',
      price: 0,
    },
    {
      name: 'Scratch & Swirl Removal',
      category: 'convenience',
      price: 0,
    },
    {
      name: 'Engine Bay Cleaning',
      category: 'convenience',
      price: 0,
    },
    {
      name: 'Membership or Monthly Subscription',
      category: 'convenience',
      price: 0,
    },
  ],
};

export default function AddonServices({ vendorId, supabase, addons, setAddons }: AddonServicesProps) {
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const priceInputRef = useRef<HTMLInputElement | null>(null);

  const handleToggleAddon = async (addon: Addon) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      if (!supabase) {
        throw new Error('Supabase client is required');
      }

      if (!addons || !setAddons) {
        throw new Error('Addons state management is required');
      }

      const existing = addons.find(a => a.name === addon.name);
      
      if (existing?.id) {
        // Update existing addon
        const { error } = await supabase
          .from('vendor_addon_services')
          .update({ is_active: !existing.is_active })
          .eq('id', existing.id);

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(error.message || 'Failed to update addon');
        }
      } else {
        // Create new addon
        const { error } = await supabase
          .from('vendor_addon_services')
          .insert([
            {
              vendor_id: vendorId,
              name: addon.name,
              category: addon.category,
              price: 0,
              is_active: true,
              description: addon.name // Using the addon name as a default description
            },
          ]);

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(error.message || 'Failed to create addon');
        }
      }

      // Refresh the addons list
      const { data, error: fetchError } = await supabase
        .from('vendor_addon_services')
        .select('*')
        .eq('vendor_id', vendorId);

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch addons');
      }

      setAddons(data || []);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in handleToggleAddon:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handlePriceUpdate = async (addon: Addon) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const existing = addons.find(a => a.name === addon.name);
      if (!existing?.id) {
        throw new Error('Addon not found');
      }

      const { error } = await supabase
        .from('vendor_addon_services')
        .update({ price: parseFloat(newPrice) || 0 })
        .eq('id', existing.id);

      if (error) throw error;

      // Refresh the addons list
      const { data, error: fetchError } = await supabase
        .from('vendor_addon_services')
        .select('*')
        .eq('vendor_id', vendorId);

      if (fetchError) throw fetchError;
      setAddons(data || []);
      setEditingAddon(null);
      setNewPrice('');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating price:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priceInputRef.current && !priceInputRef.current.contains(event.target as Node)) {
        setEditingAddon(null);
        setNewPrice('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="mt-8 px-4 sm:px-0">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Add-On Services
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">(select desired add-ons)</span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {Object.entries(DEFAULT_ADDONS).map(([category, services]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {category} Add-Ons
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => {
                    const addon = addons.find(a => a.name === service.name);
                    const isEditing = editingAddon?.name === service.name;

                    return (
                      <div
                        key={service.name}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          addon?.is_active
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {service.name}
                            </h4>
                            {addon?.is_active && !isEditing && (
                              <p className="mt-1 text-sm text-gray-600">
                                ${addon.price.toFixed(2)}
                              </p>
                            )}
                            {isEditing && (
                              <div className="mt-1 flex items-center gap-2" ref={priceInputRef}>
                                <input
                                  type="number"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(e.target.value)}
                                  className="w-20 px-2 py-1 text-sm border rounded"
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                />
                                <button
                                  onClick={() => handlePriceUpdate(service)}
                                  className="px-2 py-1 text-xs text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {addon?.is_active && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingAddon(service);
                                  setNewPrice(addon.price.toString());
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleAddon(service)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {addon?.is_active ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
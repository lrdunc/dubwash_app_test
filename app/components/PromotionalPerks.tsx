'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface Perk {
  id?: string;
  vendor_id?: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface PromotionalPerksProps {
  vendorId: string;
  supabase: SupabaseClient<Database>;
}

const DEFAULT_PERKS: Perk[] = [
  {
    name: 'Stamp Book / Wash Pass',
    description: 'Buy 5 washes, get the 6th free',
    is_active: false,
  },
  {
    name: 'Rainy Day Refund',
    description: 'Free rewash if it rains within 24-48 hours',
    is_active: false,
  },
  {
    name: 'Refer-a-Friend Bonus',
    description: 'Get a free add-on or discount when a friend books a wash',
    is_active: false,
  },
  {
    name: 'VIP Wash Club',
    description: 'Monthly subscription for unlimited or discounted washes',
    is_active: false,
  },
  {
    name: 'First-Time Customer Discount',
    description: 'Special price or free upgrade for first-timers',
    is_active: false,
  },
  {
    name: 'Fleet Wash Discounts',
    description: 'Bulk pricing for businesses with multiple vehicles',
    is_active: false,
  },
  {
    name: 'Social Media Check-In Deal',
    description: 'Tag us online for a free add-on or discount',
    is_active: false,
  },
  {
    name: 'Service Upgrade Challenge',
    description: 'Wash five times at the standard level and get a premium wash free',
    is_active: false,
  },
  {
    name: 'Express Lane Pass',
    description: 'Priority scheduling for repeat customers',
    is_active: false,
  },
];

export default function PromotionalPerks({ vendorId, supabase }: PromotionalPerksProps) {
  const [perks, setPerks] = useState<Perk[]>(DEFAULT_PERKS);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (vendorId) {
      fetchPerks();
    }
  }, [vendorId]);

  const fetchPerks = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_promotional_perks')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Merge with defaults
      const mergedPerks = DEFAULT_PERKS.map(defaultPerk => {
        const existing = data?.find(d => d.name === defaultPerk.name);
        return existing || defaultPerk;
      });

      setPerks(mergedPerks);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching perks:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while fetching perks');
      }
    }
  };

  const handleTogglePerk = async (perk: Perk) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      const existing = perks.find(p => p.name === perk.name);
      
      if (existing?.id) {
        // Update existing perk
        const { error } = await supabase
          .from('vendor_promotional_perks')
          .update({ is_active: !existing.is_active })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new perk
        const { error } = await supabase
          .from('vendor_promotional_perks')
          .insert([
            {
              vendor_id: vendorId,
              name: perk.name,
              description: perk.description,
              is_active: true,
            },
          ]);

        if (error) throw error;
      }

      // Refresh the perks list
      await fetchPerks();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in handleTogglePerk:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while updating the perk');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Loyalty & Promotional Perks</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">(select desired perks)</span>
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
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className={`grid grid-cols-1 gap-3 transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {perks.map((perk) => (
          <div
            key={perk.name}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePerk(perk)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    perk.is_active
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {perk.is_active && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-gray-900">{perk.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-7">{perk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
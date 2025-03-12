'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database } from '@/types/supabase';
import { Navbar } from '../components/Navbar';

interface VendorProfile {
  id: string;
  business_name: string;
  business_description: string | null;
  logo_url: string | null;
  is_mobile: boolean;
  service_radius: number;
  average_rating: number | null;
}

interface VendorAreaData {
  vendor_id: string;
  vendor_profiles: VendorProfile;
}

interface Service {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  service_type: string;
}

interface Vendor extends VendorProfile {
  services: Service[];
}

export default function VendorSearch() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!zipCode) {
      setError('Please enter a ZIP code to search.');
      return;
    }

    try {
      setSearching(true);
      setError(null);

      // First, find vendors that service this ZIP code
      let query = supabase
        .from('vendor_service_areas')
        .select(`
          vendor_id,
          vendor_profiles:vendor_id (
            id,
            business_name,
            business_description,
            logo_url,
            is_mobile,
            service_radius,
            average_rating
          )
        `)
        .eq('zip_code', zipCode);

      const { data: vendorAreaData, error: vendorAreaError } = await query;

      if (vendorAreaError) throw vendorAreaError;

      if (!vendorAreaData) {
        setVendors([]);
        setSearching(false);
        return;
      }

      const typedVendorData = vendorAreaData as unknown as VendorAreaData[];
      
      // Extract vendor IDs
      const vendorIds = typedVendorData.map(item => item.vendor_id);

      // If no vendors found in this area
      if (vendorIds.length === 0) {
        setVendors([]);
        setSearching(false);
        return;
      }

      // Now get services for these vendors
      let servicesQuery = supabase
        .from('services')
        .select('*')
        .in('vendor_id', vendorIds);

      // Filter by service type if selected
      if (serviceType) {
        servicesQuery = servicesQuery.eq('service_type', serviceType);
      }

      const { data: servicesData, error: servicesError } = await servicesQuery;

      if (servicesError) throw servicesError;

      if (!servicesData) {
        setVendors([]);
        setSearching(false);
        return;
      }

      const typedServicesData = servicesData as Service[];

      // Filter vendors to only those that have matching services
      const vendorsWithServices = typedVendorData.filter(vendor => 
        typedServicesData.some(service => service.vendor_id === vendor.vendor_id)
      );

      // Group services by vendor
      const vendorsWithServicesData = vendorsWithServices.map(vendor => ({
        ...vendor.vendor_profiles,
        services: typedServicesData.filter(service => 
          service.vendor_id === vendor.vendor_id
        )
      }));

      setVendors(vendorsWithServicesData);
    } catch (error) {
      console.error('Error searching for services:', error);
      setError('Failed to search for services. Please try again.');
    } finally {
      setSearching(false);
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
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Find Mobile Car Wash Services Near You
          </h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Enter your ZIP code to discover professional car wash services available in your area.
          </p>

          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your ZIP code"
                  required
                />
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type (Optional)
                </label>
                <select
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">All Services</option>
                  <option value="basic_wash">Basic Wash</option>
                  <option value="premium_wash">Premium Wash</option>
                  <option value="interior_cleaning">Interior Cleaning</option>
                  <option value="full_detail">Full Detail</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full p-3 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {searching ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : vendors.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Available Services in {zipCode}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {vendor.logo_url ? (
                        <img 
                          src={vendor.logo_url} 
                          alt={vendor.business_name} 
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <span className="text-gray-500 font-bold">{vendor.business_name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{vendor.business_name}</h3>
                        <div className="flex items-center">
                          {vendor.average_rating ? (
                            <>
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm ml-1">{vendor.average_rating.toFixed(1)}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No ratings yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {vendor.business_description || 'No description available.'}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Services:</h4>
                      <ul className="space-y-2">
                        {vendor.services.map((service) => (
                          <li key={service.id} className="text-sm">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-gray-500"> - ${service.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href={`/vendors/${vendor.id}`}
                      className="inline-block w-full text-center py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No services found in this area. Try a different ZIP code.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
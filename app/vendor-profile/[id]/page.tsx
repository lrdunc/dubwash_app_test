'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/app/components/Navbar';
import { Database } from '@/types/supabase';

interface VendorProfile {
  id: string;
  business_name: string;
  business_description: string | null;
  logo_url: string | null;
  is_mobile: boolean;
  service_radius: number | null;
  average_rating: number | null;
  profiles: {
    full_name: string;
    email: string;
    phone_number: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
  vendor_id: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  profiles: {
    full_name: string;
  };
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  user_id: string;
  created_at: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function VendorProfile({ params }: PageProps) {
  const vendorId = params.id;
  const [user, setUser] = useState<any>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;
        setUser(userData);

        // Fetch vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendor_profiles')
          .select(`
            *,
            profiles:id (
              full_name,
              email,
              phone_number
            )
          `)
          .eq('id', vendorId)
          .single();

        if (vendorError) throw vendorError;
        setVendor(vendorData);

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('vendor_id', vendorId)
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles:user_id (full_name)
          `)
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

        // If user is logged in, fetch their vehicles
        if (userData) {
          const { data: vehiclesData, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false });

          if (vehiclesError) throw vehiclesError;
          setVehicles(vehiclesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch vendor information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId, supabase]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Scroll to booking form
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth/customer-login');
      return;
    }

    if (!selectedService || !bookingDate || !bookingTime || !selectedVehicle) {
      setBookingError('Please fill in all required fields.');
      return;
    }

    try {
      setBookingSubmitting(true);
      setBookingError(null);

      // Calculate end time based on service duration
      const startTime = bookingTime;
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          vendor_id: vendorId,
          service_id: selectedService.id,
          vehicle_id: selectedVehicle,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          status: 'pending',
          notes: bookingNotes,
          total_price: selectedService.price
        })
        .select();

      if (error) throw error;

      setBookingSuccess(true);
      setSelectedService(null);
      setBookingDate('');
      setBookingTime('');
      setSelectedVehicle('');
      setBookingNotes('');

      // Scroll to success message
      setTimeout(() => {
        document.getElementById('booking-success')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError('Failed to create booking. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error || 'Vendor not found'}</p>
          <Link href="/vendor-search">
            <button className="mt-4 text-blue-500 hover:underline">
              Back to Search
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Vendor Header */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {vendor.logo_url ? (
                <img 
                  src={vendor.logo_url} 
                  alt={vendor.business_name} 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl font-bold">{vendor.business_name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
              <div className="flex items-center mt-2">
                {vendor.average_rating ? (
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="ml-1 font-medium">{vendor.average_rating.toFixed(1)}</span>
                    <span className="ml-1 text-gray-500">({reviews.length} reviews)</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No ratings yet</span>
                )}
              </div>
              <p className="mt-2 text-gray-600">
                {vendor.is_mobile ? 'Mobile Service' : 'Fixed Location'} 
                {vendor.service_radius ? ` • ${vendor.service_radius} mile radius` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600">
                {vendor.business_description || 'No description provided.'}
              </p>
            </div>

            {/* Services Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              {services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                          <p className="text-gray-500 text-sm mt-2">Duration: {service.duration} minutes</p>
                        </div>
                        <div className="text-lg font-semibold">${service.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services available.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                          <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                        </div>
                        <span className="ml-2 font-medium">{review.profiles.full_name}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div id="booking-form" className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Book a Service</h2>
              
              {bookingSuccess ? (
                <div id="booking-success" className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-600">Booking submitted successfully!</p>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="mt-2 text-sm text-blue-500 hover:underline"
                  >
                    Book another service
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {!user && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-blue-600">
                        Please{' '}
                        <Link href="/auth/customer-login" className="underline">
                          log in
                        </Link>
                        {' '}to book a service.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selected Service
                    </label>
                    {selectedService ? (
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{selectedService.name}</p>
                            <p className="text-sm text-gray-500">{selectedService.duration} minutes</p>
                          </div>
                          <p className="font-semibold">${selectedService.price}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Please select a service from the list above.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle
                    </label>
                    {vehicles.length > 0 ? (
                      <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No vehicles found. Please add a vehicle in your profile.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Any special requests or instructions..."
                    />
                  </div>

                  {bookingError && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-red-600 text-sm">{bookingError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!user || bookingSubmitting || !selectedService}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingSubmitting ? 'Submitting...' : 'Book Now'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
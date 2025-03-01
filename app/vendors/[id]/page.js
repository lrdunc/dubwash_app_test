'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function VendorDetail({ params }) {
  const vendorId = params.id;
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
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

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // Scroll to booking form
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth/login');
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
          <Link href="/search">
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
                    <div key={service.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span>{service.duration} minutes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">${service.price.toFixed(2)}</span>
                          <button
                            onClick={() => handleServiceSelect(service)}
                            className="block mt-2 text-sm bg-black text-white px-4 py-1 rounded hover:bg-gray-800 transition"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services available at the moment.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                        <span className="ml-2 font-medium">{review.profiles?.full_name || 'Anonymous'}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
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
                <div id="booking-success" className="bg-green-50 p-4 rounded-md mb-4">
                  <p className="text-green-600 font-medium">Booking request submitted successfully!</p>
                  <p className="text-green-600 mt-2">The vendor will confirm your booking soon.</p>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
                  >
                    Book Another Service
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {!user && (
                    <div className="bg-yellow-50 p-3 rounded-md mb-4">
                      <p className="text-yellow-700 text-sm">
                        Please <Link href="/auth/login" className="underline font-medium">log in</Link> to book a service.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Service *
                    </label>
                    <select
                      id="service"
                      value={selectedService?.id || ''}
                      onChange={(e) => {
                        const service = services.find(s => s.id === e.target.value);
                        setSelectedService(service || null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={!user}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={!user}
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      id="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={!user}
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle *
                    </label>
                    {vehicles.length > 0 ? (
                      <select
                        id="vehicle"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                        disabled={!user}
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.color})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <select
                          disabled
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        >
                          <option>No vehicles found</option>
                        </select>
                        <Link href="/vehicles/new">
                          <button 
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            disabled={!user}
                          >
                            + Add a vehicle
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Any special requests or instructions..."
                      disabled={!user}
                    />
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-red-50 text-red-500 rounded-md">
                      {bookingError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={bookingSubmitting || !user}
                      className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {bookingSubmitting ? 'Submitting...' : 'Book Now'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
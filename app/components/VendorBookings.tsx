'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { VendorBooking, VendorBookingsProps } from '@/types/vendor';

export default function VendorBookings({ vendorId }: VendorBookingsProps) {
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            vehicles (
              make,
              model,
              year
            ),
            profiles (
              full_name,
              phone_number
            ),
            booking_services (
              service_type,
              service_id,
              price
            )
          `)
          .eq('vendor_id', vendorId)
          .order('booking_date', { ascending: true });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Set up real-time subscription for new bookings
    const subscription = supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [vendorId, supabase]);

  const handleStatusUpdate = async (bookingId: string, newStatus: VendorBooking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicles (
            make,
            model,
            year
          ),
          profiles (
            full_name,
            phone_number
          ),
          booking_services (
            service_type,
            service_id,
            price
          )
        `)
        .eq('vendor_id', vendorId)
        .order('booking_date', { ascending: true });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: VendorBooking['status']): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 px-4 sm:px-0">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No bookings found
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.vehicles.make} {booking.vehicles.model} ({booking.vehicles.year})
                      </h3>
                      <p className="text-sm text-gray-500">
                        Customer: {booking.profiles.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Phone: {booking.profiles.phone_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(booking.booking_date).toLocaleString()}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900">Services:</h4>
                        <ul className="mt-1 text-sm text-gray-500">
                          {booking.booking_services.map((service, index) => (
                            <li key={index}>
                              {service.service_type === 'vehicle' ? 'Basic Wash' : 'Add-on Service'} - ${service.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
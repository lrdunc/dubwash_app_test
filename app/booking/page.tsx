'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface VehicleType {
  id: string;
  name: string;
  price: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface DateSelectionProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

interface TimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

interface BookingSummaryProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  vehicleType: VehicleType | null;
  addons: Addon[];
  onConfirm: () => void;
}

// Date Selection Component
const DateSelection: React.FC<DateSelectionProps> = ({ selectedDate, onDateSelect }) => {
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Select Date</h2>
        <span className="text-xs text-gray-500">(choose a date)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {dates.map((date) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-xs font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xs">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Time Selection Component
const TimeSelection: React.FC<TimeSelectionProps> = ({ selectedDate, selectedTime, onTimeSelect }) => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const formatTime = (time24h: string): string => {
    const [hours] = time24h.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:00${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Select Time</h2>
        <span className="text-xs text-gray-500">(choose a time)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {timeSlots.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              className={`p-2 rounded-lg border-2 transition-colors ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-gray-100 text-gray-900'
              }`}
            >
              <span className="text-xs font-medium">{formatTime(time)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Booking Summary Component
const BookingSummary: React.FC<BookingSummaryProps> = ({ selectedDate, selectedTime, vehicleType, addons, onConfirm }) => {
  const subtotal = vehicleType?.price || 0;
  const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const total = subtotal + addonsTotal;

  const formatTime = (time24h: string | null): string => {
    if (!time24h) return '';
    const [hours] = time24h.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:00${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Booking Summary</h2>
        <span className="text-sm text-gray-500">(review your booking)</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Date & Time</h3>
          <p className="text-sm text-gray-900">
            {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
            {selectedTime && ` at ${formatTime(selectedTime)}`}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Vehicle Type</h3>
          <p className="text-sm text-gray-900">
            {vehicleType?.name} - ${vehicleType?.price?.toFixed(2)}
          </p>
        </div>

        {addons.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Add-ons</h3>
            <ul className="mt-1 space-y-1">
              {addons.map((addon) => (
                <li key={addon.id} className="text-sm text-gray-900">
                  {addon.name} - ${addon.price?.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          {addonsTotal > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-700">Add-ons Total</span>
              <span className="text-gray-900">${addonsTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-medium mt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const handleConfirmBooking = async () => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!selectedDate || !selectedTime || !selectedVehicle) {
        console.error('Please select all required booking details');
        return;
      }

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          vehicle_type_id: selectedVehicle.id,
          booking_date: selectedDate.toISOString(),
          booking_time: selectedTime,
          total_price: selectedVehicle.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0),
          status: 'pending',
          addons: selectedAddons.map(addon => addon.id)
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Redirect to booking confirmation page
      router.push(`/booking/confirmation/${booking.id}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating booking:', error.message);
      } else {
        console.error('An unexpected error occurred while creating the booking');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Book a Wash</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Date and Time Selection */}
            <div className="lg:col-span-2 space-y-6">
              <DateSelection
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              <TimeSelection
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <BookingSummary
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                vehicleType={selectedVehicle}
                addons={selectedAddons}
                onConfirm={handleConfirmBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
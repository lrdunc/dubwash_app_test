'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface BusinessHour {
  id?: string;
  vendor_id: string;
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface BusinessHoursProps {
  vendorId: string;
  supabase: SupabaseClient<Database>;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Generate time slots in 12-hour format with AM/PM
const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for midnight
  const timeString = `${displayHour}:${minute.toString().padStart(2, '0')}${period}`;
  return timeString;
});

// Convert 12-hour format to 24-hour format for database storage
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(/(?=[AP]M)/);
  let [hours, minutes] = time.split(':');
  let hoursNum = parseInt(hours);
  if (modifier === 'PM' && hoursNum < 12) hoursNum += 12;
  if (modifier === 'AM' && hoursNum === 12) hoursNum = 0;
  return `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
};

// Convert 24-hour format to 12-hour format for display
const convertTo12Hour = (time24h: string | null | undefined): string => {
  if (!time24h) return '--:--';
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes}${period}`;
};

export default function BusinessHours({ vendorId, supabase }: BusinessHoursProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHour[] | null>(null);
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (vendorId) {
      fetchBusinessHours();
    }
  }, [vendorId]);

  const fetchBusinessHours = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_business_hours')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // If no hours exist, create default hours
      if (!data || data.length === 0) {
        const defaultHours: BusinessHour[] = DAYS_OF_WEEK.map(day => ({
          vendor_id: vendorId,
          day_of_week: day,
          open_time: '09:00',
          close_time: '17:00',
          is_closed: false
        }));

        const { error: insertError } = await supabase
          .from('vendor_business_hours')
          .insert(defaultHours);

        if (insertError) throw insertError;

        setBusinessHours(defaultHours);
      } else {
        setBusinessHours(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching business hours:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while fetching business hours');
      }
    }
  };

  const handleTimeUpdate = async (day: DayOfWeek, field: 'open_time' | 'close_time', value: string) => {
    try {
      if (!businessHours) return;

      const updatedHours = businessHours.map(hours => {
        if (hours.day_of_week === day) {
          return { ...hours, [field]: convertTo24Hour(value) };
        }
        return hours;
      });

      const { error } = await supabase
        .from('vendor_business_hours')
        .update({ [field]: convertTo24Hour(value) })
        .eq('vendor_id', vendorId)
        .eq('day_of_week', day);

      if (error) throw error;

      setBusinessHours(updatedHours);
      setEditingDay(null);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating business hours:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while updating business hours');
      }
    }
  };

  const handleToggleClosed = async (day: DayOfWeek) => {
    try {
      if (!businessHours) return;

      const dayHours = businessHours.find(h => h.day_of_week === day);
      if (!dayHours) return;

      const newIsClosed = !dayHours.is_closed;

      const { error } = await supabase
        .from('vendor_business_hours')
        .update({ is_closed: newIsClosed })
        .eq('vendor_id', vendorId)
        .eq('day_of_week', day);

      if (error) throw error;

      const updatedHours = businessHours.map(hours => {
        if (hours.day_of_week === day) {
          return { ...hours, is_closed: newIsClosed };
        }
        return hours;
      });

      setBusinessHours(updatedHours);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error toggling closed status:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred while toggling closed status');
      }
    }
  };

  return (
    <div className="mt-8 px-4 sm:px-0">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Business Hours
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">(set your operating hours)</span>
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
            <div className="space-y-4">
              {DAYS_OF_WEEK.map(day => {
                const dayHours = businessHours?.find(h => h.day_of_week === day);
                const isEditing = editingDay === day;

                return (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 w-24">{day}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <select
                            value={convertTo12Hour(dayHours?.open_time)}
                            onChange={(e) => handleTimeUpdate(day, 'open_time', e.target.value)}
                            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1"
                          >
                            {TIME_SLOTS.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-xs text-gray-500">to</span>
                          <select
                            value={convertTo12Hour(dayHours?.close_time)}
                            onChange={(e) => handleTimeUpdate(day, 'close_time', e.target.value)}
                            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1"
                          >
                            {TIME_SLOTS.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-gray-900">
                            {convertTo12Hour(dayHours?.open_time)} - {convertTo12Hour(dayHours?.close_time)}
                          </span>
                          <button
                            onClick={() => setEditingDay(day)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
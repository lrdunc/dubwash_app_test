export type VehicleType = 'small' | 'medium' | 'large';

export type ServiceType = 'basic' | 'premium' | 'deluxe';

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  vehicle_type: VehicleType;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  type: 'basic' | 'premium' | 'deluxe';
  vehicle_types: string[];
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  is_available: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  service_id: string;
  booking_date: string; // ISO date string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  vehicle_id: string;
  service_id: string;
  booking_date: string;
  time_slot: string;
}

export interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  vehicles: Vehicle[];
  services: Service[];
  availableTimeSlots: TimeSlot[];
  isLoading?: boolean;
  error?: string;
} 
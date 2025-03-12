import { User } from './index';
import { Service } from './booking';

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  service_radius?: number;
  rating?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorService extends Service {
  vendor_id: string;
  is_active: boolean;
}

export interface VendorVehicle {
  make: string;
  model: string;
  year: number;
}

export interface VendorCustomer {
  full_name: string;
  phone_number: string;
}

export interface VendorBooking {
  id: string;
  vendor_id: string;
  customer_id: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  vehicles: VendorVehicle;
  profiles: VendorCustomer;
  booking_services: Array<{
    service_type: string;
    service_id: string;
    price: number;
  }>;
}

export interface VendorDashboardData {
  profile: VendorProfile;
  recent_bookings: VendorBooking[];
  total_earnings: number;
  total_bookings: number;
  rating: number;
  services: VendorService[];
}

export interface VendorBookingsProps {
  vendorId: string;
}

export interface VendorPageParams {
  id: string;
} 
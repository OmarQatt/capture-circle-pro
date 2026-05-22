export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'client' | 'location_owner' | 'equipment_provider' | 'model' | 'crew' | 'admin' | 'super_admin';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Location {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  category: string | null;
  price_per_day: number | null;
  price_per_hour: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  featured: boolean;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Equipment {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  condition: string | null;
  daily_rate: number | null;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  images: string[];
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string;
  service_type: 'location' | 'equipment' | 'crew' | 'talent';
  start_date: Date;
  end_date: Date;
  total_price: number | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CrewProfile {
  id: string;
  user_id: string;
  role: string | null;
  bio: string | null;
  daily_rate: number | null;
  experience_years: number | null;
  skills: string[];
  portfolio_urls: string[];
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TalentProfile {
  id: string;
  user_id: string;
  profile_type: string | null;
  bio: string | null;
  gender: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  skin_tone: string | null;
  daily_rate: number | null;
  hourly_rate: number | null;
  experience_years: number | null;
  skills: string[];
  portfolio_urls: string[];
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total?: number; page?: number };
}

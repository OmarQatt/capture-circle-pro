
-- Locations
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Saudi Arabia',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price_per_hour NUMERIC(10,2),
  price_per_day NUMERIC(10,2),
  category TEXT DEFAULT 'studio',
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved locations" ON public.locations FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Owners can insert locations" ON public.locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their locations" ON public.locations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete their locations" ON public.locations FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Equipment
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'camera',
  brand TEXT,
  model TEXT,
  daily_rate NUMERIC(10,2),
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  condition TEXT DEFAULT 'excellent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Owners can insert equipment" ON public.equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update equipment" ON public.equipment FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete equipment" ON public.equipment FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Talent profiles
CREATE TABLE public.talent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL DEFAULT 'model',
  bio TEXT,
  portfolio_urls TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10,2),
  daily_rate NUMERIC(10,2),
  experience_years INTEGER DEFAULT 0,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  skin_tone TEXT,
  age INTEGER,
  gender TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view talent" ON public.talent_profiles FOR SELECT USING (true);
CREATE POLICY "Owners can insert talent" ON public.talent_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update talent" ON public.talent_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_talent_updated_at BEFORE UPDATE ON public.talent_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Crew profiles
CREATE TABLE public.crew_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'camera_operator',
  skills TEXT[] DEFAULT '{}',
  daily_rate NUMERIC(10,2),
  experience_years INTEGER DEFAULT 0,
  portfolio_urls TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crew_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view crew" ON public.crew_profiles FOR SELECT USING (true);
CREATE POLICY "Owners can insert crew" ON public.crew_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update crew" ON public.crew_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_crew_updated_at BEFORE UPDATE ON public.crew_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view bookings" ON public.bookings FOR SELECT USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Equipment condition logs
CREATE TABLE public.equipment_condition_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  log_type TEXT NOT NULL DEFAULT 'pre_rental',
  condition_notes TEXT,
  photos TEXT[] DEFAULT '{}',
  logged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_condition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view condition logs" ON public.equipment_condition_logs FOR SELECT USING (true);
CREATE POLICY "Users can create condition logs" ON public.equipment_condition_logs FOR INSERT WITH CHECK (auth.uid() = logged_by);

-- Availability
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  service_id UUID NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_type, service_id, date)
);
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Auth users can manage availability" ON public.availability FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update availability" ON public.availability FOR UPDATE USING (auth.uid() IS NOT NULL);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Admin policies
CREATE POLICY "Admins can view all locations" ON public.locations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any location" ON public.locations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any booking" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Schema for the company portal database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations table
CREATE TABLE locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Resource requests table
CREATE TABLE resource_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_id UUID REFERENCES locations(id) NOT NULL,
  requested_by UUID REFERENCES users(id) NOT NULL,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('material', 'personnel', 'other')),
  quantity INTEGER NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  insurance_expiry DATE NOT NULL,
  tax_expiry DATE NOT NULL,
  inspection_expiry DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Vehicle documents table
CREATE TABLE vehicle_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_resource_requests_location ON resource_requests(location_id);
CREATE INDEX idx_resource_requests_status ON resource_requests(status);
CREATE INDEX idx_vehicles_location ON vehicles(location_id);
CREATE INDEX idx_vehicles_assigned_to ON vehicles(assigned_to);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can update users" ON users FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Locations policies
CREATE POLICY "Everyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Only admins can manage locations" ON locations FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Resource requests policies
CREATE POLICY "Users can view their location's requests" ON resource_requests FOR SELECT 
  USING (location_id IN (SELECT location_id FROM users WHERE id = auth.uid()) 
    OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Users can create requests" ON resource_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Managers and admins can update requests" ON resource_requests FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager')));

-- Vehicles policies
CREATE POLICY "Everyone can view vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Only admins can manage vehicles" ON vehicles FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Vehicle documents policies
CREATE POLICY "Everyone can view vehicle documents" ON vehicle_documents FOR SELECT USING (true);
CREATE POLICY "Only admins can manage vehicle documents" ON vehicle_documents FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

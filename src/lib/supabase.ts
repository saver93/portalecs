import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  full_name: string
  location_id?: string
  created_at: string
}

export interface Location {
  id: string
  name: string
  address?: string
  created_at: string
}

export interface ResourceRequest {
  id: string
  location_id: string
  requested_by: string
  resource_type: 'material' | 'personnel' | 'other'
  quantity: number
  urgency: 'low' | 'medium' | 'high'
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  license_plate: string
  brand: string
  model: string
  year: number
  location_id?: string
  assigned_to?: string
  insurance_expiry: string
  tax_expiry: string
  inspection_expiry: string
  status: 'available' | 'in_use' | 'maintenance'
  created_at: string
  updated_at: string
}

export interface VehicleDocument {
  id: string
  vehicle_id: string
  document_type: string
  file_url: string
  file_name: string
  uploaded_at: string
}

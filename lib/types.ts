import { Database } from './database.types'

// Database types
export type Hospital = Database['public']['Tables']['hospitals']['Row']
export type HospitalInsert = Database['public']['Tables']['hospitals']['Insert']
export type HospitalUpdate = Database['public']['Tables']['hospitals']['Update']

export type Doctor = Database['public']['Tables']['doctors']['Row']
export type DoctorInsert = Database['public']['Tables']['doctors']['Insert']
export type DoctorUpdate = Database['public']['Tables']['doctors']['Update']

export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']

export type Content = Database['public']['Tables']['contents']['Row']
export type ContentInsert = Database['public']['Tables']['contents']['Insert']
export type ContentUpdate = Database['public']['Tables']['contents']['Update']

export type ContentCategory = Database['public']['Tables']['content_categories']['Row']
export type ContentCategoryInsert = Database['public']['Tables']['content_categories']['Insert']
export type ContentCategoryUpdate = Database['public']['Tables']['content_categories']['Update']

export type AIPersona = Database['public']['Tables']['ai_personas']['Row']
export type AIPersonaInsert = Database['public']['Tables']['ai_personas']['Insert']
export type AIPersonaUpdate = Database['public']['Tables']['ai_personas']['Update']

export type AuditLog = Database['public']['Tables']['user_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['user_logs']['Insert']
export type AuditLogUpdate = Database['public']['Tables']['user_logs']['Update']

// Enhanced Location Types
export interface HospitalLocation {
  // Basic location
  address: string
  city?: string
  state_province?: string
  country: string
  country_code?: string
  zipcode: string
  region?: string
  
  // Coordinates
  latitude?: number
  longitude?: number
  
  // Context
  timezone?: string
  
  // Geocoding metadata
  geocoding_provider?: 'google' | 'openstreetmap' | 'manual'
  geocoding_accuracy?: 'rooftop' | 'range_interpolated' | 'geometric_center' | 'approximate'
  geocoding_confidence?: number
  place_id?: string
  
  // Quality assurance
  is_location_verified?: boolean
  location_verification_date?: string
  location_verification_method?: 'manual' | 'api' | 'user_confirmed'
}

export interface GeocodingResult {
  latitude: number
  longitude: number
  city?: string
  state_province?: string
  country: string
  country_code?: string
  zipcode?: string
  region?: string
  timezone?: string
  accuracy: string
  confidence: number
  place_id?: string
  formatted_address?: string
}

export interface ProximitySearchParams {
  latitude: number
  longitude: number
  radius_km?: number
  limit?: number
}

export interface HospitalWithDistance extends Hospital {
  distance_km?: number
}

// Extended types with relationships
export interface DoctorWithHospital extends Doctor {
  hospital?: Hospital
}

export interface ContentWithCategory extends Content {
  category?: ContentCategory
}

export interface HospitalWithLocation extends Hospital {
  location?: HospitalLocation
  distance_km?: number
}

// Dashboard types
export interface DashboardStats {
  totalHospitals: number
  totalDoctors: number
  totalPatients: number
  totalContents: number
  recentActivity: AuditLog[]
}

// Form types
export interface HospitalFormData {
  hospital_name: string
  address: string
  contact_number: string
  description?: string
  website?: string
  rating?: number
  country: string
  zipcode: string
  is_halal?: boolean
  is_show_price?: boolean
  // Enhanced location fields
  city?: string
  state_province?: string
  latitude?: number
  longitude?: number
  timezone?: string
  country_code?: string
  region?: string
  geocoding_provider?: string
  geocoding_accuracy?: string
  geocoding_confidence?: number
  place_id?: string
  is_location_verified?: boolean
  location_verification_method?: string
}

export interface DoctorFormData {
  name: string
  specialty?: string
  hospital_id?: string
  bio?: string
  experience_years?: number
  rating?: number
}

export interface ContentFormData {
  title: string
  slug?: string
  description?: string
  body?: string
  thumbnail_url?: string
  language?: string
  status?: 'draft' | 'published'
  category_id?: string
}

export interface AIPersonaFormData {
  name: string
  description?: string
  tone?: string
  voice_style?: string
  image_url?: string
  system_prompt?: string
  is_default?: boolean
}

// Filter types
export interface HospitalFilters {
  search?: string
  country?: string
  is_halal?: boolean
  rating?: number
}

export interface DoctorFilters {
  search?: string
  specialty?: string
  hospital_id?: string
}

export interface PatientFilters {
  search?: string
  gender?: string
}

// Patient Management Module Types
export interface PatientSearchFilters {
  searchTerm?: string
  gender?: 'male' | 'female' | 'other'
  ageRange?: {
    min: number
    max: number
  }
  religion?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface DemographicsStats {
  totalPatients: number
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  ageDistribution: {
    '0-17': number
    '18-35': number
    '36-50': number
    '51-65': number
    '65+': number
  }
  religionDistribution: {
    [key: string]: number
  }
  registrationTrends: {
    date: string
    count: number
  }[]
}

export interface ExportConfig {
  fields: string[]
  format: 'csv' | 'pdf' | 'excel'
  filters?: PatientSearchFilters
  includeMetadata: boolean
}

export interface PatientAuditLog {
  id: string
  patient_id: string
  action: string
  user_id: string
  user_email?: string
  metadata: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface PatientExportLog {
  id: string
  user_id: string
  user_email?: string
  export_config: ExportConfig
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  file_path?: string
  file_size?: number
  record_count?: number
  created_at: string
  completed_at?: string
  expires_at: string
}

export interface PatientWithAge extends Patient {
  age: number
  formatted_dob: string
}

export interface PatientStatistics {
  totalCount: number
  newThisMonth: number
  averageAge: number
  mostCommonGender: string
  mostCommonReligion: string
}

export interface ContentFilters {
  search?: string
  status?: string
  category_id?: string
  language?: string
}

export interface AuditLogFilters {
  search?: string
  action?: string
  table_name?: string
  user_id?: string
  date_from?: string
  date_to?: string
}
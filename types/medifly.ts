// Message Types
export interface Message {
  type: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: ActionItem[];
  error?: boolean;
}

export interface ActionItem {
  text: string;
  type: 'hospital' | 'doctor';
  query: string;
  filters?: SearchFilters;
}

// Search Types
export interface SearchFilters {
  specialty?: string;
  location?: string;
  country?: string;
  city?: string;
  minExperience?: number;
  isHalal?: boolean;
  minRating?: number;
  threshold?: number;
  limit?: number;
}

// Database Schema Types (matching your actual schema)

// Hospital Types
export interface Hospital {
  id: string;
  hospital_name: string;
  address?: string;
  country: string;
  contact_number: string;
  description?: string;
  website?: string;
  rating?: number;
  zipcode: string;
  is_halal: boolean;
  is_show_price: boolean;
  city?: string;
  state_province?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  country_code?: string;
  region?: string;
  embedding?: number[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  hospital_id?: string;
  category?: string;
  code?: string;
  icon?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HospitalService {
  id: string;
  hospital_id: string;
  service_id: string;
  base_price?: number;
  service_details?: string;
  is_available: boolean;
  availability_hours?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  icon?: string;
  is_active: boolean;
}

export interface HospitalFacility {
  id: string;
  hospital_id: string;
  facility_id: string;
  capacity?: number;
  equipment_details?: string;
  is_operational: boolean;
  notes?: string;
}

// Doctor Types
export interface Doctor {
  id: string;
  name: string;
  bio?: string;
  experience_years?: number;
  rating?: number;
  email_address?: string;
  phone_number?: string;
  license_number?: string;
  image_url?: string;
  embedding?: number[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface DoctorService {
  id: string;
  doctor_id: string;
  service_id: string;
  is_primary: boolean;
  proficiency_level: string;
  years_experience: number;
  certification_details?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorHospital {
  id: string;
  doctor_id: string;
  hospital_id: string;
  is_primary: boolean;
  department?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorCertification {
  id: string;
  doctor_id: string;
  certification_name: string;
  issuing_organization: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  is_verified: boolean;
  verification_date?: string;
  document_url?: string;
  notes?: string;
}

export interface DoctorLanguage {
  id: string;
  doctor_id: string;
  language_id: string;
  proficiency_level: string;
  is_primary: boolean;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  native_name?: string;
  is_active: boolean;
}

// Search Result Types (transformed for UI)
export interface HospitalResult {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  specialties: string[];
  moreSpecialties: number;
  doctorsAvailable: number;
  priceRange: string;
  type: 'hospital';
  rating: number;
  website?: string;
  phone?: string;
  isHalal?: boolean;
  facilities?: Array<{
    id: string;
    name: string;
    code: string;
    category: string;
    icon?: string;
  }>;
  services?: Array<{
    id: string;
    name: string;
    category?: string;
    description?: string;
    base_price?: number;
    is_available: boolean;
  }>;
  similarity: number;
  description?: string;
  address?: string;
  stateProvince?: string;
}

export interface DoctorResult {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  experience: string;
  experienceYears: number;
  available: boolean;
  type: 'doctor';
  rating: number;
  bio?: string;
  imageUrl?: string;
  licenseNumber?: string;
  certifications?: Array<{
    id: string;
    certification_name: string;
    issuing_organization: string;
    issue_date?: string;
    expiry_date?: string;
    is_verified: boolean;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    code: string;
    proficiency_level: string;
    is_primary: boolean;
  }>;
  services?: Array<{
    id: string;
    name: string;
    category?: string;
    description?: string;
    is_primary: boolean;
    proficiency_level: string;
    years_experience: number;
  }>;
  hospitals?: Array<{
    id: string;
    hospital_name: string;
    city?: string;
    country?: string;
    is_primary: boolean;
    department?: string;
    position?: string;
  }>;
  similarity: number;
  phone?: string;
  email?: string;
}

export type SearchResult = HospitalResult | DoctorResult;

// API Response Types
export interface VectorSearchResponse {
  success: boolean;
  results: SearchResult[];
  count: number;
}

export interface AIResponseData {
  responseText: string;
  searchType: 'hospital' | 'doctor';
  searchQuery: string;
  filters?: SearchFilters;
  actions: ActionItem[];
}

// Supabase RPC Function Parameter Types
export interface HospitalSearchParams {
  query_embedding: number[];
  match_threshold?: number;
  match_count?: number;
  filter_country?: string | null;
  filter_city?: string | null;
  filter_specialty?: string | null;
  filter_is_halal?: boolean | null;
  filter_min_rating?: number | null;
}

export interface DoctorSearchParams {
  query_embedding: number[];
  match_threshold?: number;
  match_count?: number;
  filter_specialty?: string | null;
  filter_country?: string | null;
  filter_city?: string | null;
  filter_min_experience?: number | null;
  filter_min_rating?: number | null;
}

// RPC Function Return Types
export interface HospitalSearchResult {
  id: string;
  hospital_name: string;
  description?: string;
  city?: string;
  country: string;
  website?: string;
  contact_number: string;
  rating?: number;
  is_halal: boolean;
  address?: string;
  state_province?: string;
  facilities: any; // jsonb
  services: any; // jsonb
  doctor_count: number;
  similarity: number;
}

export interface DoctorSearchResult {
  id: string;
  name: string;
  bio?: string;
  experience_years?: number;
  rating?: number;
  phone_number?: string;
  email_address?: string;
  image_url?: string;
  license_number?: string;
  certifications: any; // jsonb
  languages: any; // jsonb
  services: any; // jsonb
  hospitals: any; // jsonb
  similarity: number;
}
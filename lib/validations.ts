import { z } from 'zod'

// Hospital validation schemas
export const hospitalSchema = z.object({
  hospital_name: z.string().min(1, 'Hospital name is required').max(255, 'Name too long'),
  address: z.string().min(1, 'Address is required'),
  contact_number: z.string().min(1, 'Contact number is required').max(50, 'Contact number too long'),
  description: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  rating: z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
  country: z.string().min(1, 'Country is required').max(100, 'Country name too long'),
  zipcode: z.string().min(1, 'Zipcode is required').max(20, 'Zipcode too long'),
  is_halal: z.boolean().default(false),
  is_show_price: z.boolean().default(true),
  // Manual location fields - all required for accurate location data
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  state_province: z.string().max(100, 'State/province name too long').optional(),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  country_code: z.string().length(2, 'Country code must be 2 characters'),
})

// Manual location validation schema
export const hospitalLocationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  state_province: z.string().max(100, 'State/province name too long').optional(),
  country: z.string().min(1, 'Country is required').max(100, 'Country name too long'),
  country_code: z.string().length(2, 'Country code must be 2 characters'),
  zipcode: z.string().min(1, 'Zipcode is required').max(20, 'Zipcode too long'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
})

export const geocodingRequestSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  provider: z.enum(['google', 'openstreetmap', 'fallback']).default('openstreetmap'),
  components: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional(),
})

export const proximitySearchSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  radius_km: z.number().min(0.1, 'Radius must be at least 0.1 km').max(1000, 'Radius cannot exceed 1000 km').default(50),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
})

export const bulkGeocodingSchema = z.object({
  hospital_ids: z.array(z.string().uuid('Invalid hospital ID')).min(1, 'At least one hospital ID is required').max(100, 'Cannot process more than 100 hospitals at once'),
  force_update: z.boolean().default(false),
})

export const hospitalUpdateSchema = hospitalSchema.partial()

export const hospitalInsertSchema = hospitalSchema

// Facility validation schemas
export const facilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required').max(255, 'Name too long'),
  code: z.string().min(1, 'Facility code is required').max(50, 'Code too long'),
  description: z.string().optional(),
  category: z.enum(['Critical Care', 'Emergency', 'Diagnostics', 'Support', 'Surgery', 'Specialized', 'Therapy', 'Amenities']),
  icon: z.string().min(1, 'Icon is required'),
  is_active: z.boolean().default(true),
})

export const facilityUpdateSchema = facilitySchema.partial()

// Service validation schemas
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Name too long'),
  code: z.string().min(1, 'Service code is required').max(20, 'Code too long'),
  description: z.string().optional(),
  category: z.enum(['Specialty', 'General', 'Surgery', 'Emergency', 'Support', 'Diagnostics', 'Therapy']),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
})

export const serviceUpdateSchema = serviceSchema.partial()

// Hospital Facility validation schemas
export const hospitalFacilitySchema = z.object({
  hospital_id: z.string().uuid('Invalid hospital ID'),
  facility_id: z.string().uuid('Invalid facility ID'),
  capacity: z.number().min(0, 'Capacity must be non-negative').optional(),
  equipment_details: z.string().optional(),
  is_operational: z.boolean().default(true),
  notes: z.string().optional(),
})

export const hospitalFacilityUpdateSchema = z.object({
  capacity: z.number().min(0, 'Capacity must be non-negative').optional(),
  equipment_details: z.string().optional(),
  is_operational: z.boolean().optional(),
  notes: z.string().optional(),
})

// Hospital Service validation schemas
export const hospitalServiceSchema = z.object({
  hospital_id: z.string().uuid('Invalid hospital ID'),
  service_id: z.string().uuid('Invalid service ID'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  duration_minutes: z.number().min(0, 'Duration must be non-negative').optional(),
  availability: z.enum(['24/7', 'business_hours', 'appointment_only', 'emergency_only']).default('business_hours'),
  is_available: z.boolean().default(true),
  notes: z.string().optional(),
})

export const hospitalServiceUpdateSchema = z.object({
  price: z.number().min(0, 'Price must be non-negative').optional(),
  duration_minutes: z.number().min(0, 'Duration must be non-negative').optional(),
  availability: z.enum(['24/7', 'business_hours', 'appointment_only', 'emergency_only']).optional(),
  is_available: z.boolean().optional(),
  notes: z.string().optional(),
})

// Package Service validation schemas
export const packageServiceSchema = z.object({
  service_id: z.string().uuid('Invalid service ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  custom_price: z.number().min(0, 'Custom price must be non-negative').optional(),
})

// Hospital Package validation schemas
export const hospitalPackageSchema = z.object({
  hospital_id: z.string().uuid('Invalid hospital ID'),
  name: z.string().min(1, 'Package name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  discount_percentage: z.number().min(0, 'Discount must be non-negative').max(100, 'Discount cannot exceed 100%').default(0),
  validity_days: z.number().min(1, 'Validity must be at least 1 day').optional(),
  is_active: z.boolean().default(true),
  services: z.array(packageServiceSchema).min(1, 'At least one service is required'),
})

export const hospitalPackageUpdateSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  total_price: z.number().min(0, 'Total price must be non-negative').optional(),
  discount_percentage: z.number().min(0, 'Discount must be non-negative').max(100, 'Discount cannot exceed 100%').optional(),
  validity_days: z.number().min(1, 'Validity must be at least 1 day').optional(),
  is_active: z.boolean().optional(),
  services: z.array(packageServiceSchema).optional(),
})

// Standalone Package validation schemas (for unified packages API)
export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  discount_percentage: z.number().min(0, 'Discount must be non-negative').max(100, 'Discount cannot exceed 100%').default(0),
  validity_days: z.number().min(1, 'Validity must be at least 1 day').optional(),
  is_active: z.boolean().default(true),
  hospital_id: z.string().uuid('Invalid hospital ID'),
  services: z.array(packageServiceSchema).min(1, 'At least one service is required'),
})

export const packageUpdateSchema = packageSchema.partial()

// Doctor validation schemas
export const doctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required').max(255, 'Name too long'),
  specialty: z.string().optional(),
  hospital_id: z.string().uuid('Invalid hospital ID').optional(),
  bio: z.string().optional(),
  experience_years: z.number().int().min(0, 'Experience years must be positive').optional(),
  rating: z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
})

export const doctorUpdateSchema = doctorSchema.partial()

// Patient validation schemas (read-only, so minimal validation needed)
export const patientSchema = z.object({
  full_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

// Content validation schemas
export const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  body: z.string().optional(),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  language: z.string().default('en'),
  status: z.enum(['draft', 'published']).default('draft'),
  category_id: z.string().uuid('Invalid category ID').optional(),
})

export const contentUpdateSchema = contentSchema.partial()

// Content Category validation schemas
export const contentCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Name too long'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
})

export const contentCategoryUpdateSchema = contentCategorySchema.partial()

// AI Persona validation schemas
export const aiPersonaSchema = z.object({
  name: z.string().min(1, 'Persona name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'empathetic', 'clinical']).optional(),
  voice_style: z.string().optional(),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  system_prompt: z.string().optional(),
  is_default: z.boolean().default(false),
})

export const aiPersonaUpdateSchema = aiPersonaSchema.partial()

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').refine(
    (email) => email.endsWith('@medifly.ai'),
    'Only @medifly.ai email addresses are allowed'
  ),
})

// Filter validation schemas
export const hospitalFiltersSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  is_halal: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
})

export const facilityFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['Critical Care', 'Emergency', 'Diagnostics', 'Support', 'Surgery', 'Specialized', 'Therapy', 'Amenities']).optional(),
  is_active: z.boolean().optional(),
})

export const serviceFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['Specialty', 'General', 'Surgery', 'Emergency', 'Support', 'Diagnostics', 'Therapy']).optional(),
  is_active: z.boolean().optional(),
})

export const packageFiltersSchema = z.object({
  search: z.string().optional(),
  hospital_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
})

export const doctorFiltersSchema = z.object({
  search: z.string().optional(),
  specialty: z.string().optional(),
  hospital_id: z.string().uuid().optional(),
})

export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

export const contentFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  category_id: z.string().uuid().optional(),
  language: z.string().optional(),
})

export const auditLogFiltersSchema = z.object({
  search: z.string().optional(),
  action: z.string().optional(),
  table_name: z.string().optional(),
  user_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

export const aiPersonaFiltersSchema = z.object({
  search: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'empathetic', 'clinical']).optional(),
  is_default: z.boolean().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['hospitals', 'doctors', 'contents']).optional(),
  limit: z.number().int().min(1).max(50).default(10),
})

// Multi-step hospital creation schema
export const hospitalCreationStepSchema = z.object({
  step: z.number().min(1).max(4),
  data: z.record(z.string(), z.any()),
})

export const hospitalCreationCompleteSchema = z.object({
  hospital: hospitalSchema,
  facilities: z.array(z.object({
    facility_id: z.string().uuid(),
    capacity: z.number().min(0).optional(),
    equipment_details: z.string().optional(),
    is_operational: z.boolean().default(true),
    notes: z.string().optional(),
  })).optional(),
  services: z.array(z.object({
    service_id: z.string().uuid(),
    price: z.number().min(0).optional(),
    duration_minutes: z.number().min(0).optional(),
    availability: z.enum(['24/7', 'business_hours', 'appointment_only', 'emergency_only']).default('business_hours'),
    is_available: z.boolean().default(true),
    notes: z.string().optional(),
  })).optional(),
  packages: z.array(hospitalPackageSchema.omit({ hospital_id: true })).optional(),
})
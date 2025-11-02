export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hospitals: {
        Row: {
          id: string
          hospital_name: string
          address: string
          contact_number: string
          description: string | null
          website: string | null
          rating: number | null
          country: string
          zipcode: string
          is_halal: boolean | null
          is_show_price: boolean | null
          // Enhanced location fields
          city: string | null
          state_province: string | null
          latitude: number | null
          longitude: number | null
          timezone: string | null
          country_code: string | null
          region: string | null
          geocoding_provider: string | null
          geocoding_accuracy: string | null
          geocoding_confidence: number | null
          place_id: string | null
          is_location_verified: boolean | null
          location_verification_date: string | null
          location_verification_method: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          hospital_name: string
          address: string
          contact_number: string
          description?: string | null
          website?: string | null
          rating?: number | null
          country: string
          zipcode: string
          is_halal?: boolean | null
          is_show_price?: boolean | null
          // Enhanced location fields
          city?: string | null
          state_province?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          country_code?: string | null
          region?: string | null
          geocoding_provider?: string | null
          geocoding_accuracy?: string | null
          geocoding_confidence?: number | null
          place_id?: string | null
          is_location_verified?: boolean | null
          location_verification_date?: string | null
          location_verification_method?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          hospital_name?: string
          address?: string
          contact_number?: string
          description?: string | null
          website?: string | null
          rating?: number | null
          country?: string
          zipcode?: string
          is_halal?: boolean | null
          is_show_price?: boolean | null
          // Enhanced location fields
          city?: string | null
          state_province?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          country_code?: string | null
          region?: string | null
          geocoding_provider?: string | null
          geocoding_accuracy?: string | null
          geocoding_confidence?: number | null
          place_id?: string | null
          is_location_verified?: boolean | null
          location_verification_date?: string | null
          location_verification_method?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      doctors: {
        Row: {
          id: string
          name: string
          specialty: string | null
          hospital_id: string | null
          bio: string | null
          experience_years: number | null
          rating: number | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          specialty?: string | null
          hospital_id?: string | null
          bio?: string | null
          experience_years?: number | null
          rating?: number | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          specialty?: string | null
          hospital_id?: string | null
          bio?: string | null
          experience_years?: number | null
          rating?: number | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          email: string
          address: string
          gender: string | null
          dob: string
          religion: string | null
          created_by: string | null
          created_date: string | null
          user_log: string | null
          date_log: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          address: string
          gender?: string | null
          dob: string
          religion?: string | null
          created_by?: string | null
          created_date?: string | null
          user_log?: string | null
          date_log?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          address?: string
          gender?: string | null
          dob?: string
          religion?: string | null
          created_by?: string | null
          created_date?: string | null
          user_log?: string | null
          date_log?: string | null
        }
      }
      contents: {
        Row: {
          id: string
          title: string
          slug: string | null
          description: string | null
          body: string | null
          thumbnail_url: string | null
          language: string | null
          status: string | null
          category_id: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          description?: string | null
          body?: string | null
          thumbnail_url?: string | null
          language?: string | null
          status?: string | null
          category_id?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          description?: string | null
          body?: string | null
          thumbnail_url?: string | null
          language?: string | null
          status?: string | null
          category_id?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      content_categories: {
        Row: {
          id: string
          name: string
          slug: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ai_personas: {
        Row: {
          id: string
          name: string
          description: string | null
          tone: string | null
          voice_style: string | null
          image_url: string | null
          system_prompt: string | null
          is_default: boolean | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          tone?: string | null
          voice_style?: string | null
          image_url?: string | null
          system_prompt?: string | null
          is_default?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          tone?: string | null
          voice_style?: string | null
          image_url?: string | null
          system_prompt?: string | null
          is_default?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          description: string | null
          ip_address: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          description?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          description?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          category: string
          icon: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          category: string
          icon?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          category?: string
          icon?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          category: string
          icon: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          category: string
          icon?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          category?: string
          icon?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      hospital_facilities: {
        Row: {
          id: string
          hospital_id: string
          facility_id: string
          capacity: number | null
          equipment_details: string | null
          is_operational: boolean | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          hospital_id: string
          facility_id: string
          capacity?: number | null
          equipment_details?: string | null
          is_operational?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          hospital_id?: string
          facility_id?: string
          capacity?: number | null
          equipment_details?: string | null
          is_operational?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      hospital_services: {
        Row: {
          id: string
          hospital_id: string
          service_id: string
          base_price: number | null
          service_details: string | null
          is_available: boolean | null
          availability_hours: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          hospital_id: string
          service_id: string
          base_price?: number | null
          service_details?: string | null
          is_available?: boolean | null
          availability_hours?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          hospital_id?: string
          service_id?: string
          base_price?: number | null
          service_details?: string | null
          is_available?: boolean | null
          availability_hours?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      hospital_packages: {
        Row: {
          id: string
          hospital_id: string
          package_name: string
          description: string | null
          total_price: number
          discount_percentage: number | null
          validity_days: number | null
          is_active: boolean | null
          package_type: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          hospital_id: string
          package_name: string
          description?: string | null
          total_price: number
          discount_percentage?: number | null
          validity_days?: number | null
          is_active?: boolean | null
          package_type?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          hospital_id?: string
          package_name?: string
          description?: string | null
          total_price?: number
          discount_percentage?: number | null
          validity_days?: number | null
          is_active?: boolean | null
          package_type?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      package_services: {
        Row: {
          id: string
          package_id: string
          hospital_service_id: string
          quantity: number | null
          service_price: number
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          package_id: string
          hospital_service_id: string
          quantity?: number | null
          service_price: number
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          package_id?: string
          hospital_service_id?: string
          quantity?: number | null
          service_price?: number
          notes?: string | null
          created_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_email: string
          action: string
          table_name: string
          record_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          actor_email: string
          action: string
          table_name: string
          record_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          actor_email?: string
          action?: string
          table_name?: string
          record_id?: string
          timestamp?: string | null
        }
      }
      languages: {
        Row: {
          id: string
          code: string
          name: string
          native_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          native_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          native_name?: string | null
          created_at?: string | null
        }
      }
      doctor_hospitals: {
        Row: {
          id: string
          doctor_id: string
          hospital_id: string
          is_primary: boolean | null
          department: string | null
          position: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean | null
          notes: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          doctor_id: string
          hospital_id: string
          is_primary?: boolean | null
          department?: string | null
          position?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean | null
          notes?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string
          hospital_id?: string
          is_primary?: boolean | null
          department?: string | null
          position?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean | null
          notes?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      doctor_services: {
        Row: {
          id: string
          doctor_id: string
          service_id: string
          is_primary: boolean | null
          proficiency_level: string | null
          years_experience: number | null
          certification_details: string | null
          is_active: boolean | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          doctor_id: string
          service_id: string
          is_primary?: boolean | null
          proficiency_level?: string | null
          years_experience?: number | null
          certification_details?: string | null
          is_active?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string
          service_id?: string
          is_primary?: boolean | null
          proficiency_level?: string | null
          years_experience?: number | null
          certification_details?: string | null
          is_active?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      doctor_languages: {
        Row: {
          id: string
          doctor_id: string
          language_id: string
          proficiency_level: string | null
          is_primary: boolean | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          doctor_id: string
          language_id: string
          proficiency_level?: string | null
          is_primary?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string
          language_id?: string
          proficiency_level?: string | null
          is_primary?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      doctor_certifications: {
        Row: {
          id: string
          doctor_id: string
          certification_name: string
          issuing_organization: string
          certification_number: string | null
          issue_date: string | null
          expiry_date: string | null
          is_verified: boolean | null
          verification_date: string | null
          document_url: string | null
          notes: string | null
          is_active: boolean | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          doctor_id: string
          certification_name: string
          issuing_organization: string
          certification_number?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          is_verified?: boolean | null
          verification_date?: string | null
          document_url?: string | null
          notes?: string | null
          is_active?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string
          certification_name?: string
          issuing_organization?: string
          certification_number?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          is_verified?: boolean | null
          verification_date?: string | null
          document_url?: string | null
          notes?: string | null
          is_active?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
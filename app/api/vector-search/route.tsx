import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { 
  HospitalSearchResult, 
  DoctorSearchResult,
  HospitalResult,
  DoctorResult
} from '@/types/medifly';
import { GoogleGenAI } from '@google/genai'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini client (server-side only)
const geminiApiKey = process.env.GOOGLE_API_KEY;
if (!geminiApiKey) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}
const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type, filters = {} } = body;

    if (!query || !type) {
      return NextResponse.json(
        { message: 'Missing required parameters: query and type' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query);

    // Call the appropriate RPC function based on type
    let results;
    
    if (type === 'hospital') {
      const { data, error } = await supabase.rpc('search_hospitals_vector', {
        query_embedding: embedding,
        match_threshold: filters.threshold || 0.5,
        match_count: filters.limit || 12,
        filter_country: filters.country || null,
        filter_city: filters.city || null,
        filter_specialty: filters.specialty || null,
        filter_is_halal: filters.isHalal || null,
        filter_min_rating: filters.minRating || null
      });

      if (error) {
        console.error('Hospital search error:', error);
        throw new Error(`Hospital search failed: ${error.message}`);
      }

      results = (data as HospitalSearchResult[])?.map(transformHospitalResult) || [];
      
    } else if (type === 'doctor') {
      const { data, error } = await supabase.rpc('search_doctors_vector', {
        query_embedding: embedding,
        match_threshold: filters.threshold || 0.5,
        match_count: filters.limit || 12,
        filter_specialty: filters.specialty || null,
        filter_country: filters.country || null,
        filter_city: filters.city || null,
        filter_min_experience: filters.minExperience || null,
        filter_min_rating: filters.minRating || null
      });

      if (error) {
        console.error('Doctor search error:', error);
        throw new Error(`Doctor search failed: ${error.message}`);
      }

      results = (data as DoctorSearchResult[])?.map(transformDoctorResult) || [];
      
    } else {
      return NextResponse.json(
        { message: 'Invalid search type. Must be "hospital" or "doctor"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      results: results || [],
      count: results?.length || 0
    });

  } catch (error) {
    console.error('Vector search API error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Transform hospital search result to UI format
 */
function transformHospitalResult(item: HospitalSearchResult): HospitalResult {
  // Parse JSONB fields
  const services = Array.isArray(item.services) ? item.services : [];
  const facilities = Array.isArray(item.facilities) ? item.facilities : [];
  
  // Extract unique specialties from services
  const specialties = services
    ? [...new Set(services.map((s: any) => s.category).filter(Boolean))].slice(0, 2)
    : [];
  
  const moreSpecialties = services
    ? Math.max(0, new Set(services.map((s: any) => s.category)).size - 2)
    : 0;

  // Determine price range
  const prices = services
    .map((s: any) => s.base_price)
    .filter((p: any) => p != null && p > 0);
  
  const priceRange = prices.length > 0
    ? `Starting from $${Math.min(...prices).toLocaleString()}`
    : 'Contact for pricing';

  return {
    id: item.id,
    name: item.hospital_name,
    location: [item.city, item.country].filter(Boolean).join(', '),
    city: item.city || '',
    country: item.country,
    specialties,
    moreSpecialties,
    doctorsAvailable: Number(item.doctor_count) || 0,
    priceRange,
    type: 'hospital',
    rating: Number(item.rating) || 0,
    website: item.website,
    phone: item.contact_number,
    isHalal: item.is_halal,
    facilities: facilities.map((f: any) => ({
      id: f.id,
      name: f.name,
      code: f.code,
      category: f.category,
      icon: f.icon
    })),
    services: services.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      base_price: s.base_price,
      is_available: s.is_available
    })),
    similarity: Math.round(item.similarity * 100),
    description: item.description,
    address: item.address,
    stateProvince: item.state_province
  };
}

/**
 * Transform doctor search result to UI format
 */
function transformDoctorResult(item: DoctorSearchResult): DoctorResult {
  // Parse JSONB fields
  const hospitals = Array.isArray(item.hospitals) ? item.hospitals : [];
  const services = Array.isArray(item.services) ? item.services : [];
  const certifications = Array.isArray(item.certifications) ? item.certifications : [];
  const languages = Array.isArray(item.languages) ? item.languages : [];
  
  // Find primary hospital or first hospital
  const primaryHospital = hospitals.find((h: any) => h.is_primary) || hospitals[0];
  
  // Find primary service or first service
  const primaryService = services.find((s: any) => s.is_primary) || services[0];
  
  return {
    id: item.id,
    name: item.name,
    specialty: primaryService?.name || primaryService?.category || 'General Practice',
    hospital: primaryHospital?.hospital_name || 'Independent Practice',
    location: primaryHospital 
      ? `${primaryHospital.city || ''}, ${primaryHospital.country || ''}`.trim()
      : 'Multiple Locations',
    experience: `${item.experience_years || 0} Years`,
    experienceYears: item.experience_years || 0,
    available: true, // Can be enhanced with real availability logic
    type: 'doctor',
    rating: Number(item.rating) || 0,
    bio: item.bio,
    imageUrl: item.image_url,
    licenseNumber: item.license_number,
    certifications: certifications.map((c: any) => ({
      id: c.id,
      certification_name: c.certification_name,
      issuing_organization: c.issuing_organization,
      issue_date: c.issue_date,
      expiry_date: c.expiry_date,
      is_verified: c.is_verified
    })),
    languages: languages.map((l: any) => ({
      id: l.id,
      name: l.name,
      code: l.code,
      proficiency_level: l.proficiency_level,
      is_primary: l.is_primary
    })),
    services: services.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      is_primary: s.is_primary,
      proficiency_level: s.proficiency_level,
      years_experience: s.years_experience
    })),
    hospitals: hospitals.map((h: any) => ({
      id: h.id,
      hospital_name: h.hospital_name,
      city: h.city,
      country: h.country,
      is_primary: h.is_primary,
      department: h.department,
      position: h.position
    })),
    similarity: Math.round(item.similarity * 100),
    phone: item.phone_number,
    email: item.email_address
  };
}

/**
 * Generate embedding from text using Gemini
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await (genAI as any).models.embedContent({
      model: 'text-embedding-004',
      contents: text,
      taskType: 'RETRIEVAL_DOCUMENT',
    });

    const values = response?.embeddings?.[0]?.values;
    if (!values || !Array.isArray(values)) {
      throw new Error('Invalid embedding response from Gemini');
    }
    return values as number[];
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    throw new Error('Failed to generate embedding for search query');
  }
}
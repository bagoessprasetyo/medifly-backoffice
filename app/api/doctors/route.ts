import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.string().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

const doctorFiltersSchema = z.object({
  search: z.string().optional(),
  hospital_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  experience_range: z.string().optional(),
  rating_min: z.number().min(1).max(5).optional(),
  language_id: z.string().uuid().optional(),
  is_verified: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

const doctorInsertSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  email_address: z.string().email().optional(),
  phone_number: z.string().optional(),
  license_number: z.string().optional(),
  image_url: z.string().url().optional(),
  hospitals: z.array(z.object({
    hospital_id: z.string().uuid(),
    is_primary: z.boolean().default(false),
    department: z.string().optional(),
    position: z.string().optional(),
    start_date: z.string().optional(),
  })).optional(),
  services: z.array(z.object({
    service_id: z.string().uuid(),
    is_primary: z.boolean().default(false),
    proficiency_level: z.string().default('intermediate'),
    years_experience: z.number().min(0).default(0),
  })).optional(),
  languages: z.array(z.object({
    language_id: z.string().uuid(),
    proficiency_level: z.string().default('conversational'),
    is_primary: z.boolean().default(false),
  })).optional(),
  certifications: z.array(z.object({
    certification_name: z.string().min(1),
    issuing_organization: z.string().min(1),
    certification_number: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
  })).optional(),
})

// GET /api/doctors - List doctors with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const filters = doctorFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      hospital_id: searchParams.get('hospital_id') || undefined,
      service_id: searchParams.get('service_id') || undefined,
      experience_range: searchParams.get('experience_range') || undefined,
      rating_min: searchParams.get('rating_min') ? parseFloat(searchParams.get('rating_min')!) : undefined,
      language_id: searchParams.get('language_id') || undefined,
      is_verified: searchParams.get('is_verified') ? searchParams.get('is_verified') === 'true' : undefined,
      status: (searchParams.get('status') as 'active' | 'inactive') || undefined,
    })

    const pagination = paginationSchema.parse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    })

    // Build base query with relationships - using separate queries to avoid alias conflicts
    let query = supabase
      .from('doctors')
      .select(`
        *,
        doctor_hospitals (
          id,
          hospital_id,
          is_primary,
          department,
          position,
          start_date,
          end_date,
          is_active,
          notes
        ),
        doctor_services (
          id,
          service_id,
          is_primary,
          proficiency_level,
          years_experience,
          certification_details,
          is_active
        ),
        doctor_languages (
          id,
          language_id,
          proficiency_level,
          is_primary
        ),
        doctor_certifications (
          id,
          certification_name,
          issuing_organization,
          certification_number,
          issue_date,
          expiry_date,
          is_verified,
          verification_date,
          document_url,
          notes
        )
      `, { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email_address.ilike.%${filters.search}%,license_number.ilike.%${filters.search}%`)
    }

    if (filters.hospital_id) {
      query = query.eq('doctor_hospitals.hospital_id', filters.hospital_id)
    }

    if (filters.service_id) {
      query = query.eq('doctor_services.service_id', filters.service_id)
    }

    if (filters.language_id) {
      query = query.eq('doctor_languages.language_id', filters.language_id)
    }

    if (filters.rating_min) {
      query = query.gte('rating', filters.rating_min)
    }

    // Apply experience range filter
    if (filters.experience_range) {
      switch (filters.experience_range) {
        case '0-2':
          query = query.gte('experience_years', 0).lte('experience_years', 2)
          break
        case '3-5':
          query = query.gte('experience_years', 3).lte('experience_years', 5)
          break
        case '6-10':
          query = query.gte('experience_years', 6).lte('experience_years', 10)
          break
        case '11-15':
          query = query.gte('experience_years', 11).lte('experience_years', 15)
          break
        case '16+':
          query = query.gte('experience_years', 16)
          break
      }
    }

    // Apply status filter (based on active hospital associations)
    if (filters.status) {
      const isActive = filters.status === 'active'
      query = query.eq('doctor_hospitals.is_active', isActive)
    }

    // Apply sorting and pagination
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order(pagination.sort_by!, { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    console.log('Executing doctors query with filters:', filters)
    console.log('Pagination:', pagination)
    
    const { data: doctors, error, count } = await query

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ 
        error: 'Failed to fetch doctors', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('Query successful, found doctors:', doctors?.length || 0)

    // Fetch related data separately to avoid join alias issues
    const doctorIds = doctors?.map((d: any) => d.id) || []
    
    // Fetch hospitals data
    const { data: hospitalsData } = await supabase
      .from('hospitals')
      .select('id, name, address, city, country')
    
    // Fetch services data  
    const { data: servicesData } = await supabase
      .from('services')
      .select('id, name, description, category')
      
    // Fetch languages data
    const { data: languagesData } = await supabase
      .from('languages')
      .select('id, name, code, native_name')

    // Transform the data to match our expected structure
    const transformedDoctors = doctors?.map((doctor: any) => {
      // Enrich doctor_hospitals with hospital details
      const enrichedHospitals = doctor.doctor_hospitals?.map((dh: any) => ({
        ...dh,
        hospitals: hospitalsData?.find((h: any) => h.id === dh.hospital_id)
      })) || []
      
      // Enrich doctor_services with service details
      const enrichedServices = doctor.doctor_services?.map((ds: any) => ({
        ...ds,
        services: servicesData?.find((s: any) => s.id === ds.service_id)
      })) || []
      
      // Enrich doctor_languages with language details
      const enrichedLanguages = doctor.doctor_languages?.map((dl: any) => ({
        ...dl,
        languages: languagesData?.find((l: any) => l.id === dl.language_id)
      })) || []

      return {
        ...doctor,
        hospitals: enrichedHospitals,
        services: enrichedServices,
        languages: enrichedLanguages,
        certifications: doctor.doctor_certifications || [],
        primaryHospital: enrichedHospitals?.find((h: any) => h.is_primary),
        primaryService: enrichedServices?.find((s: any) => s.is_primary),
        primaryLanguage: enrichedLanguages?.find((l: any) => l.is_primary),
      }
    }) || []

    return NextResponse.json({
      data: transformedDoctors,
      count: count || 0,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil((count || 0) / pagination.limit),
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/doctors - Create new doctor
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = doctorInsertSchema.parse(body)

    // Start a transaction by creating the doctor first
    const { data: doctor, error: doctorError } = await (supabase as any)
      .from('doctors')
      .insert({
        name: validatedData.name,
        bio: validatedData.bio,
        experience_years: validatedData.experience_years,
        email_address: validatedData.email_address,
        phone_number: validatedData.phone_number,
        license_number: validatedData.license_number,
        image_url: validatedData.image_url,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (doctorError) {
      console.error('Doctor creation error:', doctorError)
      return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 })
    }

    const doctorId = (doctor as any).id

    // Create hospital associations
    if (validatedData.hospitals && validatedData.hospitals.length > 0) {
      const hospitalAssociations = validatedData.hospitals.map(hospital => ({
        doctor_id: doctorId,
        hospital_id: hospital.hospital_id,
        is_primary: hospital.is_primary,
        department: hospital.department,
        position: hospital.position,
        start_date: hospital.start_date,
        is_active: true,
        created_by: user.id,
      }))

      const { error: hospitalError } = await (supabase as any)
        .from('doctor_hospitals')
        .insert(hospitalAssociations)

      if (hospitalError) {
        console.error('Hospital association error:', hospitalError)
        // Clean up the doctor if hospital associations fail
        await supabase.from('doctors').delete().eq('id', doctorId)
        return NextResponse.json({ error: 'Failed to create hospital associations' }, { status: 500 })
      }
    }

    // Create service associations
    if (validatedData.services && validatedData.services.length > 0) {
      const serviceAssociations = validatedData.services.map(service => ({
        doctor_id: doctorId,
        service_id: service.service_id,
        is_primary: service.is_primary,
        proficiency_level: service.proficiency_level,
        years_experience: service.years_experience,
        is_active: true,
        created_by: user.id,
      }))

      const { error: serviceError } = await (supabase as any)
        .from('doctor_services')
        .insert(serviceAssociations)

      if (serviceError) {
        console.error('Service association error:', serviceError)
        return NextResponse.json({ error: 'Failed to create service associations' }, { status: 500 })
      }
    }

    // Create language associations
    if (validatedData.languages && validatedData.languages.length > 0) {
      const languageAssociations = validatedData.languages.map(language => ({
        doctor_id: doctorId,
        language_id: language.language_id,
        proficiency_level: language.proficiency_level,
        is_primary: language.is_primary,
        created_by: user.id,
      }))

      const { error: languageError } = await (supabase as any)
        .from('doctor_languages')
        .insert(languageAssociations)

      if (languageError) {
        console.error('Language association error:', languageError)
        return NextResponse.json({ error: 'Failed to create language associations' }, { status: 500 })
      }
    }

    // Create certifications
    if (validatedData.certifications && validatedData.certifications.length > 0) {
      const certifications = validatedData.certifications.map(cert => ({
        doctor_id: doctorId,
        certification_name: cert.certification_name,
        issuing_organization: cert.issuing_organization,
        certification_number: cert.certification_number,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        is_verified: false,
        created_by: user.id,
      }))

      const { error: certError } = await (supabase as any)
        .from('doctor_certifications')
        .insert(certifications)

      if (certError) {
        console.error('Certification error:', certError)
        return NextResponse.json({ error: 'Failed to create certifications' }, { status: 500 })
      }
    }

    // Fetch the complete doctor with all relationships
    const { data: completeDoctor, error: fetchError } = await supabase
      .from('doctors')
      .select(`
        *,
        doctor_hospitals (
          id,
          hospital_id,
          is_primary,
          department,
          position,
          start_date,
          end_date,
          is_active,
          notes,
          hospitals (
            id,
            name,
            address,
            city,
            country
          )
        ),
        doctor_services (
          id,
          service_id,
          is_primary,
          proficiency_level,
          years_experience,
          certification_details,
          is_active,
          services (
            id,
            name,
            description,
            category
          )
        ),
        doctor_languages (
          id,
          language_id,
          proficiency_level,
          is_primary,
          languages (
            id,
            name,
            code,
            native_name
          )
        ),
        doctor_certifications (
          id,
          certification_name,
          issuing_organization,
          certification_number,
          issue_date,
          expiry_date,
          is_verified,
          verification_date,
          document_url,
          notes
        )
      `)
      .eq('id', doctorId)
      .single()

    if (fetchError) {
      console.error('Fetch complete doctor error:', fetchError)
      return NextResponse.json({ error: 'Doctor created but failed to fetch complete data' }, { status: 500 })
    }

    // Transform the data
    const doctorData = completeDoctor as any
    const transformedDoctor = {
      ...doctorData,
      hospitals: doctorData.doctor_hospitals || [],
      services: doctorData.doctor_services || [],
      languages: doctorData.doctor_languages || [],
      certifications: doctorData.doctor_certifications || [],
      primaryHospital: doctorData.doctor_hospitals?.find((h: any) => h.is_primary),
      primaryService: doctorData.doctor_services?.find((s: any) => s.is_primary),
      primaryLanguage: doctorData.doctor_languages?.find((l: any) => l.is_primary),
    }

    return NextResponse.json(transformedDoctor, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
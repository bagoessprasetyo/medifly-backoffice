import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const doctorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  email_address: z.string().email().optional(),
  phone_number: z.string().optional(),
  license_number: z.string().optional(),
  image_url: z.string().url().optional(),
  hospitals: z.array(z.object({
    id: z.string().uuid().optional(), // For updates
    hospital_id: z.string().uuid(),
    is_primary: z.boolean().default(false),
    department: z.string().optional(),
    position: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_active: z.boolean().default(true),
    notes: z.string().optional(),
  })).optional(),
  services: z.array(z.object({
    id: z.string().uuid().optional(), // For updates
    service_id: z.string().uuid(),
    is_primary: z.boolean().default(false),
    proficiency_level: z.string().default('intermediate'),
    years_experience: z.number().min(0).default(0),
    certification_details: z.string().optional(),
    is_active: z.boolean().default(true),
  })).optional(),
  languages: z.array(z.object({
    id: z.string().uuid().optional(), // For updates
    language_id: z.string().uuid(),
    proficiency_level: z.string().default('conversational'),
    is_primary: z.boolean().default(false),
  })).optional(),
  certifications: z.array(z.object({
    id: z.string().uuid().optional(), // For updates
    certification_name: z.string().min(1),
    issuing_organization: z.string().min(1),
    certification_number: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
    is_verified: z.boolean().optional(),
    document_url: z.string().url().optional(),
    notes: z.string().optional(),
  })).optional(),
})

// GET /api/doctors/[id] - Get single doctor with all relationships
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID
    if (!id || !z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    // Fetch doctor with all relationships
    const { data: doctor, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: 500 })
    }

    // Transform the data with type assertions
    const doctorData = doctor as any
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

    return NextResponse.json(transformedDoctor)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/doctors/[id] - Update doctor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID
    if (!id || !z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = doctorUpdateSchema.parse(body)

    // Check if doctor exists
    const { data: existingDoctor, error: checkError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to check doctor existence' }, { status: 500 })
    }

    // Update doctor basic info
    const doctorUpdateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    if (validatedData.name !== undefined) doctorUpdateData.name = validatedData.name
    if (validatedData.bio !== undefined) doctorUpdateData.bio = validatedData.bio
    if (validatedData.experience_years !== undefined) doctorUpdateData.experience_years = validatedData.experience_years
    if (validatedData.email_address !== undefined) doctorUpdateData.email_address = validatedData.email_address
    if (validatedData.phone_number !== undefined) doctorUpdateData.phone_number = validatedData.phone_number
    if (validatedData.license_number !== undefined) doctorUpdateData.license_number = validatedData.license_number
    if (validatedData.image_url !== undefined) doctorUpdateData.image_url = validatedData.image_url

    const { error: updateError } = await (supabase as any)
      .from('doctors')
      .update(doctorUpdateData)
      .eq('id', id)

    if (updateError) {
      console.error('Doctor update error:', updateError)
      return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 })
    }

    // Update hospital associations if provided
    if (validatedData.hospitals !== undefined) {
      // Delete existing associations
      await supabase
        .from('doctor_hospitals')
        .delete()
        .eq('doctor_id', id)

      // Insert new associations
      if (validatedData.hospitals.length > 0) {
        const hospitalAssociations = validatedData.hospitals.map(hospital => ({
          doctor_id: id,
          hospital_id: hospital.hospital_id,
          is_primary: hospital.is_primary,
          department: hospital.department,
          position: hospital.position,
          start_date: hospital.start_date,
          end_date: hospital.end_date,
          is_active: hospital.is_active,
          notes: hospital.notes,
          created_by: user.id,
        }))

        const { error: hospitalError } = await (supabase as any)
          .from('doctor_hospitals')
          .insert(hospitalAssociations)

        if (hospitalError) {
          console.error('Hospital association error:', hospitalError)
          return NextResponse.json({ error: 'Failed to update hospital associations' }, { status: 500 })
        }
      }
    }

    // Update service associations if provided
    if (validatedData.services !== undefined) {
      // Delete existing associations
      await supabase
        .from('doctor_services')
        .delete()
        .eq('doctor_id', id)

      // Insert new associations
      if (validatedData.services.length > 0) {
        const serviceAssociations = validatedData.services.map(service => ({
          doctor_id: id,
          service_id: service.service_id,
          is_primary: service.is_primary,
          proficiency_level: service.proficiency_level,
          years_experience: service.years_experience,
          certification_details: service.certification_details,
          is_active: service.is_active,
          created_by: user.id,
        }))

        const { error: serviceError } = await (supabase as any)
          .from('doctor_services')
          .insert(serviceAssociations)

        if (serviceError) {
          console.error('Service association error:', serviceError)
          return NextResponse.json({ error: 'Failed to update service associations' }, { status: 500 })
        }
      }
    }

    // Update language associations if provided
    if (validatedData.languages !== undefined) {
      // Delete existing associations
      await supabase
        .from('doctor_languages')
        .delete()
        .eq('doctor_id', id)

      // Insert new associations
      if (validatedData.languages.length > 0) {
        const languageAssociations = validatedData.languages.map(language => ({
          doctor_id: id,
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
          return NextResponse.json({ error: 'Failed to update language associations' }, { status: 500 })
        }
      }
    }

    // Update certifications if provided
    if (validatedData.certifications !== undefined) {
      // Delete existing certifications
      await supabase
        .from('doctor_certifications')
        .delete()
        .eq('doctor_id', id)

      // Insert new certifications
      if (validatedData.certifications.length > 0) {
        const certifications = validatedData.certifications.map(cert => ({
          doctor_id: id,
          certification_name: cert.certification_name,
          issuing_organization: cert.issuing_organization,
          certification_number: cert.certification_number,
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date,
          is_verified: cert.is_verified || false,
          document_url: cert.document_url,
          notes: cert.notes,
          created_by: user.id,
        }))

        const { error: certError } = await (supabase as any)
          .from('doctor_certifications')
          .insert(certifications)

        if (certError) {
          console.error('Certification error:', certError)
          return NextResponse.json({ error: 'Failed to update certifications' }, { status: 500 })
        }
      }
    }

    // Fetch the updated doctor with all relationships
    const { data: updatedDoctor, error: fetchError } = await supabase
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
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Fetch updated doctor error:', fetchError)
      return NextResponse.json({ error: 'Doctor updated but failed to fetch complete data' }, { status: 500 })
    }

    // Transform the data with type assertions
    const updatedDoctorData = updatedDoctor as any
    const transformedDoctor = {
      ...updatedDoctorData,
      hospitals: updatedDoctorData.doctor_hospitals || [],
      services: updatedDoctorData.doctor_services || [],
      languages: updatedDoctorData.doctor_languages || [],
      certifications: updatedDoctorData.doctor_certifications || [],
      primaryHospital: updatedDoctorData.doctor_hospitals?.find((h: any) => h.is_primary),
      primaryService: updatedDoctorData.doctor_services?.find((s: any) => s.is_primary),
      primaryLanguage: updatedDoctorData.doctor_languages?.find((l: any) => l.is_primary),
    }

    return NextResponse.json(transformedDoctor)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/doctors/[id] - Delete doctor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID
    if (!id || !z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    // Check if doctor exists
    const { data: existingDoctor, error: checkError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to check doctor existence' }, { status: 500 })
    }

    // Delete doctor (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Doctor deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Doctor deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { hospitalUpdateSchema } from '@/lib/validations'
// import { createGeocodingService } from '@/lib/services/geocoding' // Service not available
import { z } from 'zod'

// GET /api/hospitals/[id] - Get a specific hospital
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid hospital ID format' }, { status: 400 })
    }

    // Fetch hospital
    const { data: hospital, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'view',
        table_name: 'hospitals',
        record_id: id,
      })

    return NextResponse.json(hospital)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/hospitals/[id] - Update a specific hospital
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid hospital ID format' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = hospitalUpdateSchema.parse(body)

    // Check if hospital exists and get current data
    const { data: existingHospital, error: fetchError } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 })
    }

    // Enhanced location data preparation for updates
    let locationData = { ...validatedData }

    // Check if address has changed and coordinates need updating
    const addressChanged = validatedData.address && validatedData.address !== (existingHospital as any).address
    const coordinatesProvided = validatedData.latitude && validatedData.longitude

    // Note: Geocoding service not available, manual coordinates required
    if (coordinatesProvided) {
      // If coordinates are manually provided, mark as manually verified
      ;(locationData as any).is_location_verified = true
      ;(locationData as any).location_verification_method = 'manual'
    } else if (addressChanged) {
      // If address changed but no coordinates provided, mark as unverified
      ;(locationData as any).is_location_verified = false
      ;(locationData as any).location_verification_method = 'manual'
    }

    // Update hospital
    const { data: hospital, error } = await (supabase as any)
      .from('hospitals')
      .update({
        ...locationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update hospital' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'update',
        table_name: 'hospitals',
        record_id: id,
        details: { 
          address_changed: addressChanged,
          geocoded: !!(locationData as any).geocoding_provider,
          location_verified: (locationData as any).is_location_verified 
        }
      })

    return NextResponse.json(hospital)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hospitals/[id] - Delete a specific hospital
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid hospital ID format' }, { status: 400 })
    }

    // Check if hospital exists and has associated doctors
    const { data: associatedDoctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('id')
      .eq('hospital_id', id)
      .limit(1)

    if (doctorsError) {
      console.error('Database error:', doctorsError)
      return NextResponse.json({ error: 'Failed to check hospital associations' }, { status: 500 })
    }

    if (associatedDoctors && associatedDoctors.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete hospital with associated doctors. Please reassign or remove doctors first.' 
      }, { status: 400 })
    }

    // Check if hospital exists
    const { data: existingHospital, error: fetchError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 })
    }

    // Delete hospital
    const { error } = await supabase
      .from('hospitals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete hospital' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'delete',
        table_name: 'hospitals',
        record_id: id,
      })

    return NextResponse.json({ message: 'Hospital deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
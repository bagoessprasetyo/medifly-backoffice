import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const hospitalFacilitySchema = z.object({
  facility_id: z.string().uuid('Invalid facility ID'),
  capacity: z.number().min(0).optional(),
  equipment_details: z.string().optional(),
  is_operational: z.boolean().optional().default(true),
  notes: z.string().optional(),
})

const hospitalFacilityUpdateSchema = z.object({
  capacity: z.number().min(0).optional(),
  equipment_details: z.string().optional(),
  is_operational: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET /api/hospitals/[id]/facilities - Get hospital facilities
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

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', id)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Get hospital facilities with facility details
    const { data: facilities, error } = await supabase
      .from('hospital_facilities')
      .select(`
        id,
        capacity,
        equipment_details,
        is_operational,
        notes,
        created_at,
        updated_at,
        facilities (
          id,
          name,
          description,
          category,
          is_active
        )
      `)
      .eq('hospital_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching hospital facilities:', error)
      return NextResponse.json({ error: 'Failed to fetch hospital facilities' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: facilities || [] 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hospitals/[id]/facilities - Add facility to hospital
export async function POST(
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
    const body = await request.json()
    
    // Validate request body
    const validationResult = hospitalFacilitySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { facility_id, capacity, equipment_details, is_operational, notes } = validationResult.data

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', id)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Create hospital facility
    const { data: facility, error } = await (supabase as any)
      .from('hospital_facilities')
      .insert({
        facility_id,
        hospital_id: id,
        capacity,
        equipment_details,
        is_operational: is_operational ?? true,
        notes
      })
      .select(`
        *,
        facilities (
          id,
          name,
          code,
          description,
          category,
          icon
        )
      `)
      .single()

    if (error) {
      console.error('Error creating hospital facility:', error)
      return NextResponse.json({ error: 'Failed to create hospital facility' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Hospital facility created successfully',
      data: facility 
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/hospitals/[id]/facilities - Update hospital facility
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
    const body = await request.json()
    const { facility_id, ...updateData } = body
    
    // Validate request body
    const validationResult = hospitalFacilityUpdateSchema.safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', id)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Update hospital facility
    const { data: facility, error } = await (supabase as any)
      .from('hospital_facilities')
      .update(validationResult.data)
      .eq('hospital_id', id)
      .eq('facility_id', facility_id)
      .select(`
        *,
        facilities (
          id,
          name,
          code,
          description,
          category,
          icon
        )
      `)
      .single()

    if (error) {
      console.error('Error updating hospital facility:', error)
      return NextResponse.json({ error: 'Failed to update hospital facility' }, { status: 500 })
    }

    if (!facility || (facility as any).length === 0) {
      return NextResponse.json({ error: 'Hospital facility not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Hospital facility updated successfully',
      data: facility[0] 
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hospitals/[id]/facilities - Remove facility from hospital
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
    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('facility_id')

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', id)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Delete hospital facility
    const { error } = await supabase
      .from('hospital_facilities')
      .delete()
      .eq('hospital_id', id)
      .eq('facility_id', facilityId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to remove facility from hospital' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Facility removed from hospital successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const hospitalServiceSchema = z.object({
  service_id: z.string().uuid('Invalid service ID'),
  price: z.number().min(0).optional(),
  duration_minutes: z.number().min(0).optional(),
  availability: z.enum(['24/7', 'business_hours', 'appointment_only', 'emergency_only']).optional().default('business_hours'),
  is_available: z.boolean().optional().default(true),
  notes: z.string().optional(),
})

const hospitalServiceUpdateSchema = z.object({
  price: z.number().min(0).optional(),
  duration_minutes: z.number().min(0).optional(),
  availability: z.enum(['24/7', 'business_hours', 'appointment_only', 'emergency_only']).optional(),
  is_available: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET /api/hospitals/[id]/services - Get hospital services
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

    const hospitalId = (await params).id

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', hospitalId)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Get hospital services with service details
    const { data: hospitalServices, error } = await supabase
      .from('hospital_services')
      .select(`
        *,
        services (
          id,
          name,
          code,
          description,
          category,
          icon
        )
      `)
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch hospital services' }, { status: 500 })
    }

    return NextResponse.json({ data: hospitalServices || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hospitals/[id]/services - Add service to hospital
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

    const hospitalId = (await params).id
    const body = await request.json()
    
    // Validate request body
    const validatedData = hospitalServiceSchema.parse(body)

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', hospitalId)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Verify service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', validatedData.service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Add service to hospital
    const { data: hospitalService, error } = await (supabase as any)
      .from('hospital_services')
      .insert({
        hospital_id: hospitalId,
        ...validatedData,
      })
      .select(`
        *,
        services (
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
      console.error('Database error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Service already added to this hospital' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add service to hospital' }, { status: 500 })
    }

    return NextResponse.json(hospitalService, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/hospitals/[id]/services - Update hospital service
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

    const hospitalId = (await params).id
    const body = await request.json()
    const { service_id, ...updateData } = body
    
    // Validate request body
    const validatedData = hospitalServiceUpdateSchema.parse(updateData)

    if (!service_id) {
      return NextResponse.json({ error: 'service_id is required' }, { status: 400 })
    }

    // Update hospital service
    const { data: hospitalService, error } = await (supabase as any)
      .from('hospital_services')
      .update(validatedData)
      .eq('hospital_id', hospitalId)
      .eq('service_id', service_id)
      .select(`
        *,
        services (
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
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update hospital service' }, { status: 500 })
    }

    if (!hospitalService) {
      return NextResponse.json({ error: 'Hospital service not found' }, { status: 404 })
    }

    return NextResponse.json(hospitalService)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hospitals/[id]/services - Remove service from hospital
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

    const hospitalId = (await params).id
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service_id')

    if (!serviceId) {
      return NextResponse.json({ error: 'service_id is required' }, { status: 400 })
    }

    // Check if service is used in any packages
    const { data: packageServices, error: checkError } = await supabase
      .from('package_services')
      .select('id')
      .eq('hospital_id', hospitalId)
      .eq('service_id', serviceId)
      .limit(1)

    if (checkError) {
      console.error('Database error:', checkError)
      return NextResponse.json({ error: 'Failed to check service usage' }, { status: 500 })
    }

    if (packageServices && packageServices.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot remove service that is used in packages' 
      }, { status: 409 })
    }

    // Remove service from hospital
    const { error } = await supabase
      .from('hospital_services')
      .delete()
      .eq('hospital_id', hospitalId)
      .eq('service_id', serviceId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to remove service from hospital' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Service removed from hospital successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
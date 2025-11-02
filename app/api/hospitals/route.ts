import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { hospitalSchema, hospitalFiltersSchema, paginationSchema } from '@/lib/validations'
import { Hospital, HospitalInsert } from '@/lib/types'
// import { createGeocodingService } from '@/lib/services/geocoding' // Service not available
import { z } from 'zod'

// GET /api/hospitals - List hospitals with filtering and pagination
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
    const filters = hospitalFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      country: searchParams.get('country') || undefined,
      is_halal: searchParams.get('is_halal') ? searchParams.get('is_halal') === 'true' : undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    })

    const pagination = paginationSchema.parse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    })

    // Build query
    let query = supabase
      .from('hospitals')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`hospital_name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.country) {
      query = query.eq('country', filters.country)
    }
    if (filters.is_halal !== undefined) {
      query = query.eq('is_halal', filters.is_halal)
    }
    if (filters.rating !== undefined) {
      query = query.gte('rating', filters.rating)
    }

    // Apply sorting and pagination
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order(pagination.sort_by!, { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    const { data: hospitals, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 })
    }

    // Create audit log for view action
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'view',
        table_name: 'hospitals',
        record_id: 'list',
      })

    return NextResponse.json({
      data: hospitals || [],
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

// POST /api/hospitals - Create a new hospital
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = hospitalSchema.parse(body)

    // Enhanced location data preparation
    let locationData = { ...validatedData }

    // Handle location verification (simplified without geocoding)
    if (!validatedData.latitude || !validatedData.longitude) {
      // No coordinates provided, mark as unverified
      (locationData as any).is_location_verified = false;
      (locationData as any).location_verification_method = 'manual'
    } else {
      // If coordinates are provided, mark as manually verified
      (locationData as any).is_location_verified = true;
      (locationData as any).location_verification_method = 'manual'
    }

    // Create hospital
    const { data: hospital, error } = await (supabase as any)
      .from('hospitals')
      .insert({
        ...locationData,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create hospital' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'create',
        table_name: 'hospitals',
        record_id: (hospital as any).id,
        details: { 
          geocoded: !!(locationData as any).geocoding_provider,
          location_verified: (locationData as any).is_location_verified 
        }
      })

    return NextResponse.json({ hospital }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
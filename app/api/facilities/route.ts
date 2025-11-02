import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'
import { facilitySchema } from '@/lib/validations'

const facilityFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
})

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.string().default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
})

// GET /api/facilities - List all facilities
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const filters = facilityFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
    })

    const pagination = paginationSchema.parse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sort_by: searchParams.get('sort_by') || 'name',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    })

    // Build query
    let query = supabase
      .from('facilities')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    // Apply sorting and pagination
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order(pagination.sort_by, { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    const { data: facilities, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 })
    }

    return NextResponse.json({
      facilities: facilities || [],
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

// POST /api/facilities - Create a new facility (admin only)
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
    const validatedData = facilitySchema.parse(body)

    // Create facility
    const { data: facility, error } = await (supabase as any)
      .from('facilities')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Facility code already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create facility' }, { status: 500 })
    }

    return NextResponse.json(facility, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/facilities - Update a facility
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // Validate request body (partial update)
    const validatedData = facilitySchema.partial().parse(updateData)

    // Update facility
    const { data: facility, error } = await (supabase as any)
      .from('facilities')
      .update({ ...validatedData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Facility code already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to update facility' }, { status: 500 })
    }

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    return NextResponse.json(facility)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/facilities - Delete a facility
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // Delete facility
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Facility deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
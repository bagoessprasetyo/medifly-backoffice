import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { serviceSchema, serviceUpdateSchema, serviceFiltersSchema, paginationSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/services - Get all services
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
    const filters = serviceFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
    })
    
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'name',
      sort_order: searchParams.get('sort_order') || 'asc',
    })
    
    const offset = (pagination.page - 1) * pagination.limit

    let query = supabase
      .from('services')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting and pagination
    query = query
      .order(pagination.sort_by || 'name', { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    const { data: services, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json({
      services: services || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/services - Create new service
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
    const validatedData = serviceSchema.parse(body)

    // Check if service code already exists
    const { data: existingService } = await supabase
      .from('services')
      .select('id')
      .eq('code', validatedData.code)
      .single()

    if (existingService) {
      return NextResponse.json({ error: 'Service code already exists' }, { status: 409 })
    }

    // Create service
    const { data: service, error } = await (supabase as any)
      .from('services')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }

    // Log audit trail
    await (supabase as any)
      .from('audit_logs')
      .insert({
        table_name: 'services',
        record_id: (service as any).id,
        action: 'INSERT',
        old_values: null,
        new_values: service,
        user_id: user.id,
      })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/services - Update service
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
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Validate request body
    const validatedData = serviceUpdateSchema.parse(updateData)

    // Get current service for audit log
    const { data: currentService, error: currentError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError || !currentService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check if service code already exists (if being updated)
    if (validatedData.code && validatedData.code !== (currentService as any).code) {
      const { data: existingService } = await (supabase as any)
        .from('services')
        .select('id')
        .eq('code', validatedData.code)
        .neq('id', id)
        .single()

      if (existingService) {
        return NextResponse.json({ error: 'Service code already exists' }, { status: 409 })
      }
    }

    // Update service
    const { data: service, error } = await (supabase as any)
      .from('services')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }

    // Log audit trail
    await (supabase as any)
      .from('audit_logs')
      .insert({
        table_name: 'services',
        record_id: (service as any).id,
        action: 'UPDATE',
        old_values: currentService,
        new_values: service,
        user_id: user.id,
      })

    return NextResponse.json(service)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/services - Delete service
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Get current service for audit log
    const { data: currentService, error: currentError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError || !currentService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check if service is being used by any hospital
    const { data: hospitalServices, error: checkError } = await supabase
      .from('hospital_services')
      .select('id')
      .eq('service_id', id)
      .limit(1)

    if (checkError) {
      console.error('Database error:', checkError)
      return NextResponse.json({ error: 'Failed to check service usage' }, { status: 500 })
    }

    if (hospitalServices && hospitalServices.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete service that is being used by hospitals' 
      }, { status: 409 })
    }

    // Delete service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
    }

    // Log audit trail
    await (supabase as any)
      .from('audit_logs')
      .insert({
        table_name: 'services',
        record_id: id,
        action: 'DELETE',
        old_values: currentService,
        new_values: null,
        user_id: user.id,
      })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
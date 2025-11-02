import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { aiPersonaSchema, aiPersonaUpdateSchema, aiPersonaFiltersSchema, paginationSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/ai-personas - Get all AI personas
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
    const filters = aiPersonaFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      tone: searchParams.get('tone') || undefined,
      is_default: searchParams.get('is_default') ? searchParams.get('is_default') === 'true' : undefined,
    })
    
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'name',
      sort_order: searchParams.get('sort_order') || 'asc',
    })
    
    const offset = (pagination.page - 1) * pagination.limit

    let query = supabase
      .from('ai_personas')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.tone) {
      query = query.eq('tone', filters.tone)
    }

    if (filters.is_default !== undefined) {
      query = query.eq('is_default', filters.is_default)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting and pagination
    query = query
      .order(pagination.sort_by || 'name', { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    const { data: personas, error, count } = await (query as any)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch AI personas' }, { status: 500 })
    }

    return NextResponse.json({
      personas: personas || [],
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

// POST /api/ai-personas - Create new AI persona
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
    const validatedData = aiPersonaSchema.parse(body)

    // Check if persona name already exists
    const { data: existingPersona } = await supabase
      .from('ai_personas')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingPersona) {
      return NextResponse.json({ error: 'Persona name already exists' }, { status: 409 })
    }

    // If this persona is being set as default, unset all other defaults
    if (validatedData.is_default) {
      await (supabase as any)
        .from('ai_personas')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Dummy ID for new record
    }

    // Create persona
    const { data: persona, error } = await (supabase as any)
      .from('ai_personas')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create AI persona' }, { status: 500 })
    }

    // Log audit trail
    await (supabase as any)
      .from('audit_logs')
      .insert({
        table_name: 'ai_personas',
        record_id: (persona as any).id,
        action: 'INSERT',
        old_values: null,
        new_values: persona,
        user_id: user.id,
      })

    return NextResponse.json(persona, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/ai-personas - Update AI persona
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
      return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 })
    }

    // Validate request body
    const validatedData = aiPersonaUpdateSchema.parse(updateData)

    // Get current persona for audit log
    const { data: currentPersona, error: currentError } = await supabase
      .from('ai_personas')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError || !currentPersona) {
      return NextResponse.json({ error: 'AI persona not found' }, { status: 404 })
    }

    // Check if persona name already exists (if being updated)
    if (validatedData.name && validatedData.name !== (currentPersona as any).name) {
      const { data: existingPersona } = await supabase
        .from('ai_personas')
        .select('id')
        .eq('name', validatedData.name)
        .neq('id', id)
        .single()

      if (existingPersona) {
        return NextResponse.json({ error: 'Persona name already exists' }, { status: 409 })
      }
    }

    // If this persona is being set as default, unset all other defaults
    if (validatedData.is_default) {
      await (supabase as any)
        .from('ai_personas')
        .update({ is_default: false })
        .neq('id', id)
    }

    // Update persona
    const { data: persona, error } = await (supabase as any)
      .from('ai_personas')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update AI persona' }, { status: 500 })
    }

    // Log audit trail
    await (supabase as any)
      .from('audit_logs')
      .insert({
        table_name: 'ai_personas',
        record_id: (persona as any).id,
        action: 'UPDATE',
        old_values: currentPersona,
        new_values: persona,
        user_id: user.id,
      })

    return NextResponse.json(persona)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/ai-personas - Delete AI persona
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
      return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 })
    }

    // Get current persona for audit log
    const { data: currentPersona, error: currentError } = await supabase
      .from('ai_personas')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError || !currentPersona) {
      return NextResponse.json({ error: 'AI persona not found' }, { status: 404 })
    }

    // Prevent deletion of default persona if it's the only one
    if ((currentPersona as any).is_default) {
      const { data: otherPersonas, error: countError } = await supabase
        .from('ai_personas')
        .select('id')
        .neq('id', id)
        .limit(1)

      if (countError) {
        console.error('Database error:', countError)
        return NextResponse.json({ error: 'Failed to check persona count' }, { status: 500 })
      }

      if (!otherPersonas || otherPersonas.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot delete the only AI persona. Create another persona first.' 
        }, { status: 409 })
      }

      // If deleting default persona and there are others, set the first other as default
      const { data: firstOtherPersona } = await supabase
        .from('ai_personas')
        .select('id')
        .neq('id', id)
        .limit(1)
        .single()

      if (firstOtherPersona) {
        await (supabase as any)
          .from('ai_personas')
          .update({ is_default: true })
          .eq('id', (firstOtherPersona as any).id)
      }
    }

    // Delete persona
    const { error } = await supabase
      .from('ai_personas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete AI persona' }, { status: 500 })
    }

    // Log audit trail
    await (supabase as any)
      .from('audit_logs')
      .insert({
        table_name: 'ai_personas',
        record_id: id,
        action: 'DELETE',
        old_values: currentPersona,
        new_values: null,
        user_id: user.id,
      })

    return NextResponse.json({ message: 'AI persona deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
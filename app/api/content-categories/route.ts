import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { contentCategorySchema, paginationSchema } from '@/lib/validations'
import { ContentCategory } from '@/lib/types'
import { Database } from '@/lib/database.types'
import { z } from 'zod'

const contentCategoryFiltersSchema = z.object({
  search: z.string().optional(),
})

// GET /api/content-categories - List content categories with filtering and pagination
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
    const filters = contentCategoryFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
    })

    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    })

    // Build query
    let query = supabase
      .from('content_categories')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`)
    }

    // Apply sorting and pagination
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1

    const { data, error, count } = await query
      .order(pagination.sort_by || 'created_at', { ascending: pagination.sort_order === 'asc' })
      .range(from, to)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch content categories' }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / pagination.limit)

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/content-categories - Create a new content category
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies()) as ReturnType<typeof createServerSupabaseClient>
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = contentCategorySchema.parse(body)

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('content_categories')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()

    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
    }

    // Create content category
    const insertPayload: Database['public']['Tables']['content_categories']['Insert'] = {
      name: validatedData.name,
      slug: validatedData.slug,
      created_by: user.id,
      updated_by: user.id,
    }
    
    const { data: insertData, error } = await (supabase as any)
      .from('content_categories')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create content category' }, { status: 500 })
    }

    if (!insertData) {
      return NextResponse.json({ error: 'Failed to create content category' }, { status: 500 })
    }

    // Log the action
    await (supabase as any)
      .from('user_logs')
      .insert([{
        user_id: user.id,
        action: 'CREATE',
        table_name: 'content_categories',
        record_id: insertData.id,
        description: `Created content category: ${validatedData.name}`,
      }])

    return NextResponse.json({ data: insertData }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
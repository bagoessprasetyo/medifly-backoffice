import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { contentSchema, contentFiltersSchema, paginationSchema } from '@/lib/validations'
import { Content, ContentInsert } from '@/lib/types'
import { z } from 'zod'

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// GET /api/contents - List contents with filtering and pagination
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
    const filters = contentFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      language: searchParams.get('language') || undefined,
    })

    const pagination = paginationSchema.parse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    })

    // Build query with category join
    let query = supabase
      .from('contents')
      .select(`
        *,
        category:content_categories(id, name, slug)
      `, { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.language) {
      query = query.eq('language', filters.language)
    }

    // Apply sorting and pagination
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order(pagination.sort_by!, { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    const { data: contents, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch contents' }, { status: 500 })
    }

    // Create audit log for view action
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'view',
        table_name: 'contents',
        record_id: 'list',
      })

    return NextResponse.json({
      data: contents || [],
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

// POST /api/contents - Create a new content
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
    const validatedData = contentSchema.parse(body)

    // Auto-generate slug if not provided
    if (!validatedData.slug && validatedData.title) {
      validatedData.slug = generateSlug(validatedData.title)
    }

    // Check if slug already exists
    if (validatedData.slug) {
      const { data: existingContent } = await supabase
        .from('contents')
        .select('id')
        .eq('slug', validatedData.slug)
        .single()

      if (existingContent) {
        // Append timestamp to make slug unique
        validatedData.slug = `${validatedData.slug}-${Date.now()}`
      }
    }

    // Create content
    const { data: content, error } = await (supabase as any)
      .from('contents')
      .insert({
        ...validatedData,
        author_id: user.id,
      })
      .select(`
        *,
        category:content_categories(id, name, slug)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'create',
        table_name: 'contents',
        record_id: (content as any).id,
      })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
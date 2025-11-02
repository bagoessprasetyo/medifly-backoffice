import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { contentUpdateSchema } from '@/lib/validations'
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

// GET /api/contents/[id] - Get a specific content
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
      return NextResponse.json({ error: 'Invalid content ID format' }, { status: 400 })
    }

    // Fetch content with category
    const { data: content, error } = await supabase
      .from('contents')
      .select(`
        *,
        category:content_categories(id, name, slug)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'view',
        table_name: 'contents',
        record_id: id,
      })

    return NextResponse.json(content)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/contents/[id] - Update a specific content
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
      return NextResponse.json({ error: 'Invalid content ID format' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = contentUpdateSchema.parse(body)

    // Check if content exists
    const { data: existingContent, error: fetchError } = await supabase
      .from('contents')
      .select('id, slug, title')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    // Auto-generate slug if title is being updated but slug is not provided
    if (validatedData.title && !validatedData.slug) {
      validatedData.slug = generateSlug(validatedData.title)
    }

    // Check if new slug already exists (excluding current content)
    if (validatedData.slug && validatedData.slug !== (existingContent as any).slug) {
      const { data: slugExists } = await (supabase as any)
        .from('contents')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .single()

      if (slugExists) {
        // Append timestamp to make slug unique
        validatedData.slug = `${validatedData.slug}-${Date.now()}`
      }
    }

    // Update content
    const { data: content, error } = await (supabase as any)
      .from('contents')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        category:content_categories(id, name, slug)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'update',
        table_name: 'contents',
        record_id: id,
      })

    return NextResponse.json(content)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/contents/[id] - Delete a specific content
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
      return NextResponse.json({ error: 'Invalid content ID format' }, { status: 400 })
    }

    // Check if content exists
    const { data: existingContent, error: fetchError } = await supabase
      .from('contents')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    // Delete content
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
    }

    // Create audit log
    await (supabase as any)
      .from('audit_logs')
      .insert({
        actor_email: user.email!,
        action: 'delete',
        table_name: 'contents',
        record_id: id,
      })

    return NextResponse.json({ message: 'Content deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
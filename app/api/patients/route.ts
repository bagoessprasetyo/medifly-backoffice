import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { PatientSearchFilters } from '@/lib/types'
import { z } from 'zod'

// Validation schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.string().default('created_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

const patientFiltersSchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  ageRange: z.string().optional(),
  religion: z.string().optional(),
  dateRange: z.string().optional(),
})

// GET /api/patients - List patients with filtering and pagination
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
    const filters = patientFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      gender: searchParams.get('gender') || undefined,
      ageRange: searchParams.get('ageRange') || undefined,
      religion: searchParams.get('religion') || undefined,
      dateRange: searchParams.get('dateRange') || undefined,
    })

    const pagination = paginationSchema.parse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sort_by: searchParams.get('sort_by') || 'created_date',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    })

    // Build query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender)
    }
    if (filters.religion) {
      query = query.eq('religion', filters.religion)
    }

    // Apply age range filter
    if (filters.ageRange) {
      const currentDate = new Date()
      let minDate: Date, maxDate: Date

      switch (filters.ageRange) {
        case '18-35':
          minDate = new Date(currentDate.getFullYear() - 35, currentDate.getMonth(), currentDate.getDate())
          maxDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate())
          break
        case '36-50':
          minDate = new Date(currentDate.getFullYear() - 50, currentDate.getMonth(), currentDate.getDate())
          maxDate = new Date(currentDate.getFullYear() - 36, currentDate.getMonth(), currentDate.getDate())
          break
        case '51-65':
          minDate = new Date(currentDate.getFullYear() - 65, currentDate.getMonth(), currentDate.getDate())
          maxDate = new Date(currentDate.getFullYear() - 51, currentDate.getMonth(), currentDate.getDate())
          break
        case '65+':
          maxDate = new Date(currentDate.getFullYear() - 65, currentDate.getMonth(), currentDate.getDate())
          query = query.lte('dob', maxDate.toISOString().split('T')[0])
          break
        default:
          break
      }

      if (filters.ageRange !== '65+') {
        query = query
          .gte('dob', minDate!.toISOString().split('T')[0])
          .lte('dob', maxDate!.toISOString().split('T')[0])
      }
    }

    // Apply date range filter for registration date
    if (filters.dateRange) {
      const currentDate = new Date()
      let startDate: Date

      switch (filters.dateRange) {
        case 'last30days':
          startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'last3months':
          startDate = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'last6months':
          startDate = new Date(currentDate.getTime() - 180 * 24 * 60 * 60 * 1000)
          break
        case 'lastyear':
          startDate = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0) // Beginning of time
      }

      query = query.gte('created_date', startDate.toISOString())
    }

    // Apply sorting and pagination
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order(pagination.sort_by!, { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + pagination.limit - 1)

    const { data: patients, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
    }

    // Create audit log for view action
    await (supabase as any)
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'view_list',
        patient_id: null,
        details: { filters, pagination },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })

    return NextResponse.json({
      data: patients || [],
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
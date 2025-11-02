import { supabase } from '@/lib/supabase'

// Audit logging function
export async function createAuditLog(
  action: 'create' | 'update' | 'delete' | 'view',
  tableName: string,
  recordId: string,
  userEmail: string,
  description?: string
) {
  try {
    const auditLog = {
      user_id: userEmail,
      action,
      table_name: tableName,
      record_id: recordId,
      description: description || `${action} operation on ${tableName}`,
      ip_address: null, // Would need to be passed from request
      created_at: new Date().toISOString(),
    }

    // Use any to bypass type checking for audit logs
    const { error } = await (supabase as any)
      .from('user_logs')
      .insert(auditLog)

    if (error) {
      console.error('Failed to create audit log:', error)
    }
  } catch (error) {
    console.error('Audit log creation failed:', error)
  }
}

// Simple database operations without generic constraints
export class DatabaseService {
  constructor(
    private tableName: string,
    private userEmail: string
  ) {}

  async create(data: Record<string, any>): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser()
      
      const insertData = {
        ...data,
        created_by: user?.user?.id,
        updated_by: user?.user?.id,
      }

      // Use any to bypass type checking for dynamic table names
      const { data: result, error } = await (supabase as any)
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        throw error
      }

      // Create audit log
      if (result?.id) {
        await createAuditLog('create', this.tableName, result.id, this.userEmail)
      }

      return result
    } catch (error) {
      console.error('Create operation failed:', error)
      throw error
    }
  }

  async update(id: string, data: Record<string, any>): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser()
      
      const updateData = {
        ...data,
        updated_by: user?.user?.id,
        updated_at: new Date().toISOString(),
      }

      // Use any to bypass type checking for dynamic table names
      const { data: result, error } = await (supabase as any)
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      // Create audit log
      await createAuditLog('update', this.tableName, id, this.userEmail)

      return result
    } catch (error) {
      console.error('Update operation failed:', error)
      throw error
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      // Use any to bypass type checking for dynamic table names
      const { error } = await (supabase as any)
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Database delete error:', error)
        throw error
      }

      // Create audit log
      await createAuditLog('delete', this.tableName, id, this.userEmail)

      return { success: true }
    } catch (error) {
      console.error('Delete operation failed:', error)
      throw error
    }
  }

  async findById(id: string): Promise<any> {
    try {
      // Use any to bypass type checking for dynamic table names
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Database select error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('FindById operation failed:', error)
      throw error
    }
  }

  async findMany(
    filters: Record<string, any> = {},
    options: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<{
    data: any[]
    count: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options
      const offset = (page - 1) * limit

      // Use any to bypass type checking for dynamic table names
      let query = (supabase as any)
        .from(this.tableName)
        .select('*', { count: 'exact' })

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string' && key === 'search') {
            // Basic search implementation
            query = query.or(`name.ilike.%${value}%,title.ilike.%${value}%,description.ilike.%${value}%`)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Database select many error:', error)
        throw error
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('FindMany operation failed:', error)
      throw error
    }
  }
}

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Utility function to format date
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Utility function to format datetime
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
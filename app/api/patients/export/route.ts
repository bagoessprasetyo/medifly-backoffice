import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ExportConfig } from '@/lib/types'
import { z } from 'zod'

// Validation schema for export request
const exportRequestSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  fields: z.array(z.string()).min(1),
  filters: z.object({
    dateRange: z.string().optional(),
    ageRange: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    religion: z.string().optional(),
  }),
  includeHeaders: z.boolean().default(true),
  anonymize: z.boolean().default(false),
  reason: z.string().min(10),
  requestedBy: z.string().min(2),
})

// POST /api/patients/export - Export patient data
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
    const exportConfig = exportRequestSchema.parse(body)

    // Build query based on filters
    let query = supabase
      .from('patients')
      .select(exportConfig.fields.join(', '))

    // Apply filters (same logic as in patients route)
    if (exportConfig.filters.sex) {
      query = query.eq('sex', exportConfig.filters.sex)
    }
    if (exportConfig.filters.religion) {
      query = query.eq('religion', exportConfig.filters.religion)
    }

    // Apply age range filter
    if (exportConfig.filters.ageRange) {
      const currentDate = new Date()
      let minDate: Date, maxDate: Date

      switch (exportConfig.filters.ageRange) {
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

      if (exportConfig.filters.ageRange !== '65+') {
        query = query
          .gte('dob', minDate!.toISOString().split('T')[0])
          .lte('dob', maxDate!.toISOString().split('T')[0])
      }
    }

    // Apply date range filter for registration date
    if (exportConfig.filters.dateRange) {
      const currentDate = new Date()
      let startDate: Date

      switch (exportConfig.filters.dateRange) {
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
          startDate = new Date(0)
      }

      query = query.gte('created_at', startDate.toISOString())
    }

    // Execute query
    const { data: patients, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch patient data for export' }, { status: 500 })
    }

    // Anonymize data if requested
    let processedData: any[] = (patients as any) || []
    if (exportConfig.anonymize) {
      processedData = processedData.map((patient, index) => {
        const anonymized = { ...patient }
        if ((anonymized as any).name) (anonymized as any).name = `Patient ${index + 1}`
        if ((anonymized as any).email) (anonymized as any).email = `patient${index + 1}@anonymized.com`
        if ((anonymized as any).address) (anonymized as any).address = '[REDACTED]'
        return anonymized
      })
    }

    // Generate export data based on format
    let exportData: string
    let contentType: string
    let filename: string

    switch (exportConfig.format) {
      case 'csv':
        // Generate CSV
        const headers = exportConfig.fields
        const csvRows = [
          exportConfig.includeHeaders ? headers.join(',') : null,
          ...processedData.map(patient => 
            headers.map(field => {
              const value = (patient as any)[field as keyof typeof patient]
              return typeof value === 'string' && (value as string).includes(',') 
                ? `"${(value as string).replace(/"/g, '""')}"` 
                : value || ''
            }).join(',')
          )
        ].filter(Boolean)
        
        exportData = csvRows.join('\n')
        contentType = 'text/csv'
        filename = `patients_export_${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'json':
        exportData = JSON.stringify(processedData, null, 2)
        contentType = 'application/json'
        filename = `patients_export_${new Date().toISOString().split('T')[0]}.json`
        break

      case 'pdf':
        // For PDF, we'll return a simplified text format
        // In a real implementation, you'd use a PDF library like jsPDF
        const pdfContent = processedData.map(patient => 
          exportConfig.fields.map(field => 
            `${field}: ${patient[field as keyof typeof patient] || 'N/A'}`
          ).join('\n')
        ).join('\n\n---\n\n')
        
        exportData = `Patient Export Report\nGenerated: ${new Date().toISOString()}\nTotal Records: ${processedData.length}\n\n${pdfContent}`
        contentType = 'text/plain'
        filename = `patients_export_${new Date().toISOString().split('T')[0]}.txt`
        break

      default:
        return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
    }

    // Log the export in patient_export_logs
    await (supabase as any)
      .from('patient_export_logs')
      .insert({
        user_id: user.id,
        export_type: exportConfig.format,
        record_count: processedData.length,
        filters: exportConfig.filters,
        fields_exported: exportConfig.fields,
        reason: exportConfig.reason,
        requested_by: exportConfig.requestedBy,
        anonymized: exportConfig.anonymize,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })

    // Also create audit log
    await (supabase as any)
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'export_data',
        patient_id: null,
        details: {
          format: exportConfig.format,
          record_count: processedData.length,
          fields: exportConfig.fields,
          reason: exportConfig.reason,
          anonymized: exportConfig.anonymize,
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })

    // Return the file as a download
    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(exportData, 'utf8').toString(),
      },
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid export configuration', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/patients/export - Get export history
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get export history
    const { data: exportHistory, error } = await supabase
      .from('patient_export_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch export history' }, { status: 500 })
    }

    return NextResponse.json(exportHistory || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
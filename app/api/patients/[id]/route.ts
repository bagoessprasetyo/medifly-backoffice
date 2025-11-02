import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/patients/[id] - Get individual patient details
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

    const patientId = (await params).id

    // Fetch patient details
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 })
    }

    // Create audit log for individual patient view
    await (supabase as any)
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'view_profile',
        patient_id: patientId,
        details: { patient_name: (patient as any).name },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })

    // Calculate age from date of birth
    const age = (patient as any).dob ? 
      Math.floor((new Date().getTime() - new Date((patient as any).dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
      null

    return NextResponse.json({
      ...(patient as any),
      age
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
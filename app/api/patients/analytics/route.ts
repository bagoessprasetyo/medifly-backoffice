import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/patients/analytics - Get patient demographics analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total patient count
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    // Get gender distribution using the database function
    const { data: genderData, error: genderError } = await supabase
      .rpc('get_gender_distribution')

    if (genderError) {
      console.error('Gender distribution error:', genderError)
    }

    // Get age distribution using the database function
    const { data: ageData, error: ageError } = await supabase
      .rpc('get_age_distribution')

    if (ageError) {
      console.error('Age distribution error:', ageError)
    }

    // Get religion distribution using the database function
    const { data: religionData, error: religionError } = await supabase
      .rpc('get_religion_distribution')

    if (religionError) {
      console.error('Religion distribution error:', religionError)
    }

    // Get registration trends using the database function
    const { data: registrationData, error: registrationError } = await supabase
      .rpc('get_registration_trends')

    if (registrationError) {
      console.error('Registration trends error:', registrationError)
    }

    // Calculate average age
    const { data: avgAgeData } = await supabase
      .from('patients')
      .select('dob')
      .not('dob', 'is', null)

    let averageAge = 0
    if (avgAgeData && avgAgeData.length > 0) {
      const ages = (avgAgeData as any[]).map(patient => {
        const birthDate = new Date((patient as any).dob)
        const today = new Date()
        return Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      })
      averageAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
    }

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: recentRegistrations } = await (supabase as any)
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Create audit log for analytics view
    await (supabase as any)
      .from('patient_audit_logs')
      .insert({
        user_id: user.id,
        action: 'view_analytics',
        patient_id: null,
        details: { analytics_type: 'demographics' },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })

    return NextResponse.json({
      summary: {
        totalPatients: totalPatients || 0,
        averageAge,
        recentRegistrations: recentRegistrations || 0,
      },
      demographics: {
        gender: genderData || [],
        age: ageData || [],
        religion: religionData || [],
      },
      trends: {
        registration: registrationData || [],
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
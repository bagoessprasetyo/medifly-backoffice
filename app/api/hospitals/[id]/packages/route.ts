import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const packageServiceSchema = z.object({
  service_id: z.string().uuid('Invalid service ID'),
  quantity: z.number().min(1).optional().default(1),
  custom_price: z.number().min(0).optional(),
})

const hospitalPackageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(100),
  description: z.string().optional(),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  discount_percentage: z.number().min(0).max(100).optional().default(0),
  validity_days: z.number().min(1).optional(),
  is_active: z.boolean().optional().default(true),
  services: z.array(packageServiceSchema).min(1, 'At least one service is required'),
})

const hospitalPackageUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  total_price: z.number().min(0).optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  validity_days: z.number().min(1).optional(),
  is_active: z.boolean().optional(),
  services: z.array(packageServiceSchema).optional(),
})

// GET /api/hospitals/[id]/packages - Get hospital packages
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

    const hospitalId = (await params).id

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', hospitalId)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Get hospital packages
    const { data: packages, error } = await supabase
      .from('hospital_packages')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch hospital packages' }, { status: 500 })
    }

    // Get package services for each package
    const packagesWithServices = await Promise.all(
      (packages || []).map(async (pkg) => {
        const { data: packageServices, error: servicesError } = await supabase
          .from('package_services')
          .select(`
            *,
            services (
              id,
              name,
              code,
              description,
              category,
              icon
            )
          `)
          .eq('package_id', (pkg as any).id)
          .order('created_at', { ascending: true })

        if (servicesError) {
          console.error('Error fetching package services:', servicesError)
          return { ...(pkg as any), services: [] }
        }

        return { ...(pkg as any), services: packageServices || [] }
      })
    )

    return NextResponse.json({ data: packagesWithServices })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hospitals/[id]/packages - Create hospital package
export async function POST(
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

    const hospitalId = (await params).id
    const body = await request.json()
    
    // Validate request body
    const validatedData = hospitalPackageSchema.parse(body)
    const { services, ...packageData } = validatedData

    // Verify hospital exists
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', hospitalId)
      .single()

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Verify all services exist and belong to the hospital
    const serviceIds = services.map(s => s.service_id)
    const { data: hospitalServices, error: servicesError } = await supabase
      .from('hospital_services')
      .select('service_id')
      .eq('hospital_id', hospitalId)
      .in('service_id', serviceIds)

    if (servicesError) {
      console.error('Database error:', servicesError)
      return NextResponse.json({ error: 'Failed to verify services' }, { status: 500 })
    }

    const availableServiceIds = hospitalServices?.map(hs => (hs as any).service_id) || []
    const missingServices = serviceIds.filter(id => !availableServiceIds.includes(id))

    if (missingServices.length > 0) {
      return NextResponse.json({ 
        error: 'Some services are not available in this hospital',
        missing_services: missingServices
      }, { status: 400 })
    }

    // Create package
    const { data: hospitalPackage, error: packageError } = await (supabase as any)
      .from('hospital_packages')
      .insert({
        hospital_id: hospitalId,
        ...packageData,
      })
      .select()
      .single()

    if (packageError) {
      console.error('Database error:', packageError)
      return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }

    // Add services to package
    const packageServices = services.map(service => ({
      package_id: (hospitalPackage as any).id,
      hospital_id: hospitalId,
      service_id: service.service_id,
      quantity: service.quantity,
      custom_price: service.custom_price,
    }))

    const { data: createdServices, error: servicesInsertError } = await (supabase as any)
      .from('package_services')
      .insert(packageServices)
      .select(`
        *,
        services (
          id,
          name,
          code,
          description,
          category,
          icon
        )
      `)

    if (servicesInsertError) {
      console.error('Database error:', servicesInsertError)
      // Rollback package creation
      await supabase.from('hospital_packages').delete().eq('id', (hospitalPackage as any).id)
      return NextResponse.json({ error: 'Failed to add services to package' }, { status: 500 })
    }

    return NextResponse.json({
      ...(hospitalPackage as any),
      services: createdServices || []
    }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/hospitals/[id]/packages - Update hospital package
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

    const hospitalId = (await params).id
    const body = await request.json()
    const { package_id, services, ...updateData } = body
    
    if (!package_id) {
      return NextResponse.json({ error: 'package_id is required' }, { status: 400 })
    }

    // Validate request body
    const validatedData = hospitalPackageUpdateSchema.parse({ services, ...updateData })

    // Verify package exists and belongs to hospital
    const { data: existingPackage, error: packageError } = await supabase
      .from('hospital_packages')
      .select('*')
      .eq('id', package_id)
      .eq('hospital_id', hospitalId)
      .single()

    if (packageError || !existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Update package
    const { services: newServices, ...packageUpdateData } = validatedData
    const { data: updatedPackage, error: updateError } = await (supabase as any)
      .from('hospital_packages')
      .update(packageUpdateData)
      .eq('id', package_id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
    }

    // Update services if provided
    if (newServices && newServices.length > 0) {
      // Verify all services exist and belong to the hospital
      const serviceIds = newServices.map(s => s.service_id)
      const { data: hospitalServices, error: servicesError } = await supabase
        .from('hospital_services')
        .select('service_id')
        .eq('hospital_id', hospitalId)
        .in('service_id', serviceIds)

      if (servicesError) {
        console.error('Database error:', servicesError)
        return NextResponse.json({ error: 'Failed to verify services' }, { status: 500 })
      }

      const availableServiceIds = hospitalServices?.map(hs => (hs as any).service_id) || []
      const missingServices = serviceIds.filter(id => !availableServiceIds.includes(id))

      if (missingServices.length > 0) {
        return NextResponse.json({ 
          error: 'Some services are not available in this hospital',
          missing_services: missingServices
        }, { status: 400 })
      }

      // Remove existing services
      await supabase
        .from('package_services')
        .delete()
        .eq('package_id', package_id)

      // Add new services
      const packageServices = newServices.map(service => ({
        package_id: package_id,
        hospital_id: hospitalId,
        service_id: service.service_id,
        quantity: service.quantity,
        custom_price: service.custom_price,
      }))

      const { error: servicesInsertError } = await (supabase as any)
        .from('package_services')
        .insert(packageServices)

      if (servicesInsertError) {
        console.error('Database error:', servicesInsertError)
        return NextResponse.json({ error: 'Failed to update package services' }, { status: 500 })
      }
    }

    // Get updated package with services
    const { data: packageServices, error: servicesError } = await supabase
      .from('package_services')
      .select(`
        *,
        services (
          id,
          name,
          code,
          description,
          category,
          icon
        )
      `)
      .eq('package_id', package_id)
      .order('created_at', { ascending: true })

    if (servicesError) {
      console.error('Error fetching package services:', servicesError)
    }

    return NextResponse.json({
      ...(updatedPackage as any),
      services: packageServices || []
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hospitals/[id]/packages - Delete hospital package
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

    const hospitalId = (await params).id
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('package_id')

    if (!packageId) {
      return NextResponse.json({ error: 'package_id is required' }, { status: 400 })
    }

    // Verify package exists and belongs to hospital
    const { data: existingPackage, error: packageError } = await supabase
      .from('hospital_packages')
      .select('*')
      .eq('id', packageId)
      .eq('hospital_id', hospitalId)
      .single()

    if (packageError || !existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Delete package (services will be deleted automatically due to cascade)
    const { error } = await supabase
      .from('hospital_packages')
      .delete()
      .eq('id', packageId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
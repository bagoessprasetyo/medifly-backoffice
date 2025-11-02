import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import { packageSchema, packageUpdateSchema, packageFiltersSchema, paginationSchema } from "@/lib/validations"
import { z } from "zod"

// GET - Fetch packages with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const filtersResult = packageFiltersSchema.safeParse({
      search: searchParams.get("search") || undefined,
      hospital_id: searchParams.get("hospital_id") || undefined,
      is_active: searchParams.get("is_active") === "true" ? true : searchParams.get("is_active") === "false" ? false : undefined,
      min_price: searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : undefined,
      max_price: searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : undefined,
    })

    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
    })

    if (!filtersResult.success || !paginationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      )
    }

    const filters = filtersResult.data
    const pagination = paginationResult.data

    // Build query
    let query = supabase
      .from("hospital_packages")
      .select(`
        *,
        hospitals!inner(
          id,
          name,
          code
        ),
        package_services!inner(
          services!inner(
            id,
            name,
            code,
            category,
            icon
          )
        )
      `)

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.hospital_id) {
      query = query.eq("hospital_id", filters.hospital_id)
    }

    if (filters.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active)
    }

    if (filters.min_price !== undefined) {
      query = query.gte("total_price", filters.min_price)
    }

    if (filters.max_price !== undefined) {
      query = query.lte("total_price", filters.max_price)
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1

    query = query.range(from, to).order("created_at", { ascending: false })

    const { data: packages, error, count } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      )
    }

    // Transform the data to include services array
    const transformedPackages = packages?.map((pkg: any) => ({
      ...pkg,
      services: (pkg as any).package_services?.map((ps: any) => ps.services) || []
    })) || []

    return NextResponse.json({
      packages: transformedPackages,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    })

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new package
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = packageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid package data", details: (validationResult.error as any).errors },
        { status: 400 }
      )
    }

    const { services, ...packageData } = validationResult.data

    // Check if package name already exists for this hospital
    const { data: existingPackage } = await supabase
      .from("hospital_packages")
      .select("id")
      .eq("name", packageData.name)
      .eq("hospital_id", packageData.hospital_id)
      .single()

    if (existingPackage) {
      return NextResponse.json(
        { error: "Package with this name already exists for this hospital" },
        { status: 409 }
      )
    }

    // Create package
    const { data: newPackage, error: packageError } = await (supabase as any)
      .from("hospital_packages")
      .insert([packageData])
      .select()
      .single()

    if (packageError) {
      console.error("Package creation error:", packageError)
      return NextResponse.json(
        { error: "Failed to create package" },
        { status: 500 }
      )
    }

    // Create package-service relationships
    if (services && services.length > 0) {
      const packageServices = services.map(serviceId => ({
        package_id: (newPackage as any).id,
        service_id: serviceId
      }))

      const { error: servicesError } = await (supabase as any)
        .from("package_services")
        .insert(packageServices)

      if (servicesError) {
        console.error("Package services creation error:", servicesError)
        // Rollback package creation
        await supabase.from("hospital_packages").delete().eq("id", (newPackage as any).id)
        return NextResponse.json(
          { error: "Failed to create package services" },
          { status: 500 }
        )
      }
    }

    // Log audit trail
    await (supabase as any).from("audit_logs").insert([{
      table_name: "hospital_packages",
      record_id: (newPackage as any).id,
      action: "INSERT",
      old_values: null,
      new_values: newPackage,
      user_id: user.id
    }])

    return NextResponse.json(
      { message: "Package created successfully", package: newPackage },
      { status: 201 }
    )

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update package
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = packageUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid package data", details: (validationResult.error as any).errors },
        { status: 400 }
      )
    }

    const { id, services, ...packageData } = validationResult.data as any

    // Get existing package for audit log
    const { data: existingPackage, error: fetchError } = await supabase
      .from("hospital_packages")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      )
    }

    // Check if package name already exists for this hospital (excluding current package)
    if (packageData.name && packageData.name !== (existingPackage as any).name) {
      const { data: duplicatePackage } = await supabase
        .from("hospital_packages")
        .select("id")
        .eq("name", packageData.name)
        .eq("hospital_id", packageData.hospital_id || (existingPackage as any).hospital_id)
        .neq("id", id)
        .single()

      if (duplicatePackage) {
        return NextResponse.json(
          { error: "Package with this name already exists for this hospital" },
          { status: 409 }
        )
      }
    }

    // Update package
    const { data: updatedPackage, error: updateError } = await (supabase as any)
      .from("hospital_packages")
      .update(packageData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Package update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update package" },
        { status: 500 }
      )
    }

    // Update package-service relationships if services are provided
    if (services !== undefined) {
      // Delete existing relationships
      await supabase
        .from("package_services")
        .delete()
        .eq("package_id", id)

      // Create new relationships
      if (services.length > 0) {
        const packageServices = services.map((serviceId: any) => ({
          package_id: id,
          service_id: serviceId
        }))

        const { error: servicesError } = await supabase
          .from("package_services")
          .insert(packageServices)

        if (servicesError) {
          console.error("Package services update error:", servicesError)
          return NextResponse.json(
            { error: "Failed to update package services" },
            { status: 500 }
          )
        }
      }
    }

    // Log audit trail
    await (supabase as any).from("audit_logs").insert([{
      table_name: "hospital_packages",
      record_id: id,
      action: "UPDATE",
      old_values: existingPackage,
      new_values: updatedPackage,
      user_id: user.id
    }])

    return NextResponse.json({
      message: "Package updated successfully",
      package: updatedPackage
    })

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete package
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(await cookies())
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get("id")

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      )
    }

    // Get existing package for audit log
    const { data: existingPackage, error: fetchError } = await supabase
      .from("hospital_packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      )
    }

    // Delete package-service relationships first
    await supabase
      .from("package_services")
      .delete()
      .eq("package_id", packageId)

    // Delete package
    const { error: deleteError } = await supabase
      .from("hospital_packages")
      .delete()
      .eq("id", packageId)

    if (deleteError) {
      console.error("Package deletion error:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete package" },
        { status: 500 }
      )
    }

    // Log audit trail
    await (supabase as any).from("audit_logs").insert([{
      table_name: "hospital_packages",
      record_id: packageId,
      action: "DELETE",
      old_values: existingPackage,
      new_values: null,
      user_id: user.id
    }])

    return NextResponse.json({
      message: "Package deleted successfully"
    })

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
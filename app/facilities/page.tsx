"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Building, Loader2, Heart, Stethoscope, Syringe, Zap, FlaskConical, Pill, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { facilitySchema } from "@/lib/validations"
import type { z } from "zod"

type FacilityFormData = z.infer<typeof facilitySchema>

interface Facility {
  id: string
  name: string
  code: string
  description?: string
  category: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const categoryOptions = [
  { value: 'medical_equipment', label: 'Medical Equipment' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'other', label: 'Other' },
]

// Icon options for medical facilities
const iconOptions = [
  { value: 'heart-pulse', label: '💓 Heart Pulse', icon: Heart },
  { value: 'stethoscope', label: '🩺 Stethoscope', icon: Stethoscope },
  { value: 'syringe', label: '💉 Syringe', icon: Syringe },
  { value: 'zap', label: '⚡ Emergency', icon: Zap },
  { value: 'flask', label: '🧪 Laboratory', icon: FlaskConical },
  { value: 'pill', label: '💊 Pharmacy', icon: Pill },
  { value: 'building', label: '🏥 Building', icon: Building },
  { value: 'other', label: '⚕️ Other', icon: MoreHorizontal },
]

// Skeleton Components
const FacilityCardSkeleton = () => (
  <Card className="relative">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div>
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const FacilitiesGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, i) => (
      <FacilityCardSkeleton key={i} />
    ))}
  </div>
)

const HeaderSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="relative w-72">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </CardHeader>
  </Card>
)

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [paginationLoading, setPaginationLoading] = useState(false)

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema) as any,
    defaultValues: {
      name: "",
      code: "",
      description: "",
      category: "Support" as any,
      icon: "building",
      is_active: true,
    },
  })

  // Fetch facilities with pagination
  const fetchFacilities = async (page: number = currentPage, limit: number = itemsPerPage, search?: string) => {
    try {
      if (page === currentPage) {
        setLoading(true)
      } else {
        setPaginationLoading(true)
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: 'name',
        sort_order: 'asc'
      })
      
      if (search) {
        params.append('search', search)
      }
      
      const response = await fetch(`/api/facilities?${params}`)
      if (!response.ok) throw new Error("Failed to fetch facilities")
      
      const data = await response.json()
      setFacilities(data.facilities || [])
      setTotalCount(data.count || 0)
      setTotalPages(data.totalPages || 0)
      setCurrentPage(data.page || page)
    } catch (error) {
      console.error("Error fetching facilities:", error)
      toast.error("Failed to load facilities")
    } finally {
      setLoading(false)
      setPaginationLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        fetchFacilities(1, itemsPerPage, searchQuery)
      } else {
        fetchFacilities(1, itemsPerPage)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, itemsPerPage])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchFacilities(page, itemsPerPage, searchQuery || undefined)
    }
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    fetchFacilities(1, newLimit, searchQuery || undefined)
  }

  const openCreateDialog = () => {
    setEditingFacility(null)
    form.reset({
      name: "",
      code: "",
      description: "",
      category: "Support" as any,
      icon: "building",
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (facility: Facility) => {
    setEditingFacility(facility)
    form.reset({
      name: facility.name,
      code: facility.code,
      description: facility.description || "",
      category: facility.category as any,
      icon: facility.icon || "building",
      is_active: facility.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: FacilityFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting facility data:', data) // Debug log
      
      const url = "/api/facilities"
      const method = editingFacility ? "PUT" : "POST"
      const body = editingFacility 
        ? { ...data, id: editingFacility.id }
        : data

      console.log('Request details:', { method, url, body }) // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      console.log('Response status:', response.status) // Debug log
      
      const responseData = await response.json()
      console.log('Response data:', responseData) // Debug log

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save facility")
      }

      toast.success(editingFacility ? "Facility updated successfully" : "Facility created successfully")
      setIsDialogOpen(false)
      form.reset()
      await fetchFacilities() // Refresh the list
    } catch (error) {
      console.error("Error saving facility:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save facility")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (facilityId: string) => {
    try {
      const response = await fetch("/api/facilities", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: facilityId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete facility")
      }

      toast.success("Facility deleted successfully")
      fetchFacilities()
    } catch (error) {
      console.error("Error deleting facility:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete facility")
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Facilities</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <HeaderSkeleton />
            <FacilitiesGridSkeleton />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Facilities</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Facilities Management</h1>
              <p className="text-muted-foreground">
                Manage and add department facilities across the system.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Facility
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingFacility ? "Edit Facility" : "Add New Facility"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFacility 
                      ? "Update the facility information below."
                      : "Create a new facility that can be assigned to hospitals."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit((data) => handleSubmit(data as any))} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Facility Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter facility name"
                        {...form.register("name")}
                        className="h-10"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="code">Facility Code *</Label>
                      <Input
                        id="code"
                        placeholder="Enter facility code"
                        {...form.register("code")}
                        className="h-10"
                      />
                      {form.formState.errors.code && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.code.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={form.watch("category")} 
                      onValueChange={(value: string) => form.setValue("category", value as FacilityFormData['category'])}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon *</Label>
                    <Select 
                      value={form.watch("icon") || "building"} 
                      onValueChange={(value: string) => form.setValue("icon", value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => {
                          const IconComponent = option.icon
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.icon && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.icon.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Choose an icon to represent this facility
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter facility description"
                      className="min-h-[100px] resize-none"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <DialogFooter className="gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {editingFacility ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        editingFacility ? "Update Facility" : "Create Facility"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Facilities</CardTitle>
                  <CardDescription>
                    {loading ? "Loading..." : `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount} facilities`}
                  </CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search facilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Facilities Grid */}
          {facilities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "No facilities found" : "No facilities yet"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first facility"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={openCreateDialog} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Facility
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : paginationLoading ? (
            <FacilitiesGridSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility: Facility) => {
                const selectedIcon = iconOptions.find(icon => icon.value === facility.icon)
                const IconComponent = selectedIcon?.icon || Building
                
                return (
                  <Card key={facility.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{facility.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Code: {facility.code}
                            </p>
                          </div>
                        </div>
                        <Badge variant={facility.is_active ? "default" : "secondary"}>
                          {facility.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {categoryOptions.find(cat => cat.value === facility.category)?.label || facility.category}
                          </Badge>
                        </div>
                        {facility.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {facility.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(facility)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Facility</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{facility.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(facility.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(facility.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show per page:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || paginationLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={paginationLoading}
                            className="w-10"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || paginationLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Stethoscope, Loader2, Heart, Syringe, Zap, FlaskConical, Pill, MoreHorizontal, Activity, Shield, ChevronLeft, ChevronRight } from "lucide-react"
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
import { serviceSchema } from "@/lib/validations"
import { z } from "zod"

// Create a form-specific schema that makes is_active required
const serviceFormSchema = serviceSchema.extend({
  is_active: z.boolean()
})

type ServiceFormData = z.infer<typeof serviceFormSchema>

interface Service {
  id: string
  name: string
  code: string
  description?: string
  category: 'Specialty' | 'General' | 'Surgery' | 'Emergency' | 'Support' | 'Diagnostics' | 'Therapy'
  icon?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const categoryOptions = [
  { value: 'Specialty', label: 'Specialty' },
  { value: 'General', label: 'General' },
  { value: 'Surgery', label: 'Surgery' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Support', label: 'Support' },
  { value: 'Diagnostics', label: 'Diagnostics' },
  { value: 'Therapy', label: 'Therapy' },
]

// Icon options for medical services
const iconOptions = [
  { value: 'heart-pulse', label: '💓 Heart Pulse', icon: Heart },
  { value: 'stethoscope', label: '🩺 Stethoscope', icon: Stethoscope },
  { value: 'syringe', label: '💉 Syringe', icon: Syringe },
  { value: 'zap', label: '⚡ Emergency', icon: Zap },
  { value: 'flask', label: '🧪 Laboratory', icon: FlaskConical },
  { value: 'pill', label: '💊 Pharmacy', icon: Pill },
  { value: 'activity', label: '📊 Activity', icon: Activity },
  { value: 'shield', label: '🛡️ Shield', icon: Shield },
  { value: 'other', label: '⚕️ Other', icon: MoreHorizontal },
]

// Skeleton Components
const ServiceCardSkeleton = () => (
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

const ServicesGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, i) => (
      <ServiceCardSkeleton key={i} />
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginationLoading, setPaginationLoading] = useState(false)

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      category: "General" as const,
      icon: "stethoscope",
      is_active: true,
    },
  })

  // Fetch services
  const fetchServices = async (page = currentPage, limit = itemsPerPage, search = searchQuery) => {
    try {
      if (page === currentPage && !loading) {
        setPaginationLoading(true)
      } else {
        setLoading(true)
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
      
      const response = await fetch(`/api/services?${params}`)
      if (!response.ok) throw new Error("Failed to fetch services")
      
      const data = await response.json()
      setServices(data.services || [])
      setTotalCount(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / limit))
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
      setPaginationLoading(false)
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchServices(page, itemsPerPage, searchQuery)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    fetchServices(1, newItemsPerPage, searchQuery)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchServices(1, itemsPerPage, searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Since we're using server-side pagination, we don't need client-side filtering
  const filteredServices = services

  const openCreateDialog = () => {
    setEditingService(null)
    form.reset({
      name: "",
      code: "",
      description: "",
      category: "General",
      icon: "stethoscope",
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    form.reset({
      name: service.name,
      code: service.code,
      description: service.description || "",
      category: service.category,
      icon: service.icon || "stethoscope",
      is_active: service.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true)
    try {
      const url = "/api/services"
      const method = editingService ? "PUT" : "POST"
      const body = editingService 
        ? { ...data, id: editingService.id }
        : data

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save service")
      }

      toast.success(editingService ? "Service updated successfully" : "Service created successfully")
      setIsDialogOpen(false)
      fetchServices()
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save service")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete service")
      }

      toast.success("Service deleted successfully")
      fetchServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete service")
    }
  }

  const getIconComponent = (iconName?: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName)
    if (iconOption) {
      const IconComponent = iconOption.icon
      return <IconComponent className="h-5 w-5" />
    }
    return <Stethoscope className="h-5 w-5" />
  }

  const getCategoryLabel = (category: string) => {
    const categoryOption = categoryOptions.find(option => option.value === category)
    return categoryOption?.label || category
  }

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
                  <BreadcrumbLink href="/">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Services</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="space-y-4">
              <HeaderSkeleton />
              <ServicesGridSkeleton />
            </div>
          ) : (
            <>
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">Services</CardTitle>
                      <CardDescription>
                        {paginationLoading ? (
                          "Loading services..."
                        ) : totalCount > 0 ? (
                          `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount} services`
                        ) : (
                          "Manage medical services and their configurations"
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search services..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editingService ? "Edit Service" : "Create New Service"}
                            </DialogTitle>
                            <DialogDescription>
                              {editingService 
                                ? "Update the service information below." 
                                : "Add a new medical service to the system."
                              }
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Service Name</Label>
                                <Input
                                  id="name"
                                  {...form.register("name")}
                                  placeholder="e.g., Blood Test"
                                />
                                {form.formState.errors.name && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="code">Service Code</Label>
                                <Input
                                  id="code"
                                  {...form.register("code")}
                                  placeholder="e.g., BLD001"
                                />
                                {form.formState.errors.code && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.code.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                {...form.register("description")}
                                placeholder="Describe the service..."
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                  value={form.watch("category")}
                                  onValueChange={(value) => form.setValue("category", value as any)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categoryOptions.map((category) => (
                                      <SelectItem key={category.value} value={category.value}>
                                        {category.label}
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
                                <Label htmlFor="icon">Icon</Label>
                                <Select
                                  value={form.watch("icon")}
                                  onValueChange={(value) => form.setValue("icon", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {iconOptions.map((icon) => (
                                      <SelectItem key={icon.value} value={icon.value}>
                                        <div className="flex items-center gap-2">
                                          <icon.icon className="h-4 w-4" />
                                          {icon.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="is_active"
                                {...form.register("is_active")}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor="is_active">Active</Label>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingService ? "Update" : "Create"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Services Grid */}
              {loading || paginationLoading ? (
                <ServicesGridSkeleton />
              ) : filteredServices.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No services found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery 
                        ? "No services match your search criteria." 
                        : "Get started by creating your first service."
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {getIconComponent(service.icon)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{service.code}</p>
                            </div>
                          </div>
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(service.category)}
                            </Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(service)}
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
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the
                                      service &quot;{service.name}&quot;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(service.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(service.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && totalCount > 0 && (
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Items per page:</span>
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
                          const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                          if (pageNumber > totalPages) return null
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={pageNumber === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              disabled={paginationLoading}
                              className="w-8 h-8 p-0"
                            >
                              {pageNumber}
                            </Button>
                          )
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
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
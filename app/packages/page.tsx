"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Package, Loader2, DollarSign, Calendar, Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { packageSchema } from "@/lib/validations"
import type { z } from "zod"

type PackageFormData = z.infer<typeof packageSchema>

interface Service {
  id: string
  name: string
  code: string
  category: string
  icon?: string
  is_active: boolean
}

interface Hospital {
  id: string
  hospital_name: string
  code: string
}

interface Package {
  id: string
  name: string
  description?: string
  total_price: number
  discount_percentage?: number
  validity_days: number
  is_active: boolean
  hospital_id: string
  hospitals?: Hospital
  services?: Service[]
  created_at: string
  updated_at: string
}

// Skeleton Components
const PackageCardSkeleton = () => (
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
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
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

const PackagesGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, i) => (
      <PackageCardSkeleton key={i} />
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

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      total_price: 0,
      discount_percentage: 0,
      validity_days: 30,
      is_active: true,
      hospital_id: "",
      services: [],
    },
  })

  // Fetch data with pagination
  const fetchPackages = async (page = 1, limit = itemsPerPage, search = searchQuery) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setPaginationLoading(true)
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (search) {
        params.append('search', search)
      }
      
      const response = await fetch(`/api/packages?${params}`)
      if (!response.ok) throw new Error("Failed to fetch packages")
      
      const data = await response.json()
      setPackages(data.packages || [])
      setTotalCount(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast.error("Failed to load packages")
    } finally {
      setLoading(false)
      setPaginationLoading(false)
    }
  }

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/hospitals?limit=100")
      if (!response.ok) throw new Error("Failed to fetch hospitals")
      
      const data = await response.json()
      // Fix: hospitals API returns data.data, not data.hospitals
      setHospitals(data.data || [])
    } catch (error) {
      console.error("Error fetching hospitals:", error)
      toast.error("Failed to load hospitals")
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?limit=100&is_active=true")
      if (!response.ok) throw new Error("Failed to fetch services")
      
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Failed to load services")
    }
  }

  useEffect(() => {
    Promise.all([fetchPackages(1, itemsPerPage), fetchHospitals(), fetchServices()])
  }, [])

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchPackages(page, itemsPerPage, searchQuery)
    }
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    fetchPackages(1, newLimit, searchQuery)
  }

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchPackages(1, itemsPerPage, searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, itemsPerPage])

  // Filter packages based on search query (now handled server-side, but keeping for client-side filtering if needed)
  const filteredPackages = packages

  const openCreateDialog = () => {
    setEditingPackage(null)
    setSelectedServices([])
    form.reset({
      name: "",
      description: "",
      total_price: 0,
      discount_percentage: 0,
      validity_days: 30,
      is_active: true,
      hospital_id: "",
      services: [],
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg)
    const serviceIds = pkg.services?.map(s => s.id) || []
    setSelectedServices(serviceIds)
    form.reset({
      name: pkg.name,
      description: pkg.description || "",
      total_price: pkg.total_price,
      discount_percentage: pkg.discount_percentage || 0,
      validity_days: pkg.validity_days,
      is_active: pkg.is_active,
      hospital_id: pkg.hospital_id,
      services: serviceIds.map(id => ({ service_id: id, quantity: 1 })) as any,
    })
    setIsDialogOpen(true)
  }

  const handleServiceToggle = (serviceId: string) => {
    const newSelectedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    
    setSelectedServices(newSelectedServices)
    form.setValue("services", newSelectedServices.map(id => ({ service_id: id, quantity: 1 })) as any)
  }

  const handleSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true)
    try {
      const url = "/api/packages"
      const method = editingPackage ? "PUT" : "POST"
      const body = editingPackage 
        ? { ...data, id: editingPackage.id, services: selectedServices }
        : { ...data, services: selectedServices }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save package")
      }

      toast.success(editingPackage ? "Package updated successfully" : "Package created successfully")
      setIsDialogOpen(false)
      fetchPackages()
    } catch (error) {
      console.error("Error saving package:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save package")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (packageId: string) => {
    try {
      const response = await fetch(`/api/packages?id=${packageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete package")
      }

      toast.success("Package deleted successfully")
      fetchPackages()
    } catch (error) {
      console.error("Error deleting package:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete package")
    }
  }

  const getHospitalName = (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId)
    return hospital?.hospital_name || "Unknown Hospital"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price
    return price - (price * discount / 100)
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
                  <BreadcrumbPage>Packages</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="space-y-4">
              <HeaderSkeleton />
              <PackagesGridSkeleton />
            </div>
          ) : (
            <>
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">Packages</CardTitle>
                      <CardDescription>
                        {paginationLoading ? (
                          "Loading packages..."
                        ) : totalCount > 0 ? (
                          `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount} packages`
                        ) : (
                          "Manage service packages and their configurations"
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search packages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Package
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {editingPackage ? "Edit Package" : "Create New Package"}
                            </DialogTitle>
                            <DialogDescription>
                              {editingPackage 
                                ? "Update the package information below." 
                                : "Add a new service package to the system."
                              }
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={form.handleSubmit((data: any) => handleSubmit(data))} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Package Name</Label>
                                <Input
                                  id="name"
                                  {...form.register("name")}
                                  placeholder="e.g., Health Checkup Package"
                                />
                                {form.formState.errors.name && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="hospital_id">Hospital</Label>
                                <Select
                                  value={form.watch("hospital_id")}
                                  onValueChange={(value) => form.setValue("hospital_id", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select hospital" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hospitals.map((hospital) => (
                                      <SelectItem key={hospital.id} value={hospital.id}>
                                        {hospital.hospital_name} 
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {form.formState.errors.hospital_id && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.hospital_id.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                {...form.register("description")}
                                placeholder="Describe the package..."
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="total_price">Total Price ($)</Label>
                                <Input
                                  id="total_price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...form.register("total_price", {
                                    setValueAs: (value) => parseFloat(value) || 0
                                  })}
                                  placeholder="0.00"
                                />
                                {form.formState.errors.total_price && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.total_price.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="discount_percentage">Discount (%)</Label>
                                <Input
                                  id="discount_percentage"
                                  type="number"
                                  min="0"
                                  max="100"
                                  {...form.register("discount_percentage", {
                                    setValueAs: (value) => parseFloat(value) || 0
                                  })}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="validity_days">Validity (Days)</Label>
                                <Input
                                  id="validity_days"
                                  type="number"
                                  min="1"
                                  {...form.register("validity_days", {
                                    setValueAs: (value) => parseInt(value) || 30
                                  })}
                                  placeholder="30"
                                />
                                {form.formState.errors.validity_days && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.validity_days.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Services Included</Label>
                              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-1 gap-2">
                                  {services.map((service) => (
                                    <div key={service.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={service.id}
                                        checked={selectedServices.includes(service.id)}
                                        onCheckedChange={() => handleServiceToggle(service.id)}
                                      />
                                      <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                          <span>{service.name}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {service.category}
                                          </Badge>
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Selected: {selectedServices.length} service(s)
                              </p>
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
                                {editingPackage ? "Update" : "Create"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Packages Grid */}
              {loading || paginationLoading ? (
                <PackagesGridSkeleton />
              ) : filteredPackages.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery 
                        ? "No packages match your search criteria." 
                        : "Get started by creating your first package."
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Package
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPackages.map((pkg) => (
                    <Card key={pkg.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{pkg.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {pkg.hospitals?.hospital_name || getHospitalName(pkg.hospital_id)}
                              </p>
                            </div>
                          </div>
                          <Badge variant={pkg.is_active ? "default" : "secondary"}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                {pkg.discount_percentage && pkg.discount_percentage > 0 ? (
                                  <>
                                    <span className="text-sm line-through text-muted-foreground">
                                      {formatPrice(pkg.total_price)}
                                    </span>
                                    <span className="font-semibold text-green-600">
                                      {formatPrice(calculateDiscountedPrice(pkg.total_price, pkg.discount_percentage))}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold">
                                    {formatPrice(pkg.total_price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{pkg.validity_days} days</span>
                            </div>
                          </div>
                          
                          {pkg.discount_percentage && pkg.discount_percentage > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {pkg.discount_percentage}% OFF
                            </Badge>
                          )}

                          {pkg.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pkg.description}
                            </p>
                          )}

                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {pkg.services?.length || 0} service(s) included
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(pkg)}
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
                                      package &quot;{pkg.name}&quot;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(pkg.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(pkg.created_at).toLocaleDateString()}
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
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show</span>
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
                        <span className="text-sm text-muted-foreground">per page</span>
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
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={paginationLoading}
                                className="w-10"
                              >
                                {pageNum}
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
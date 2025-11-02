"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Plus, Trash2, Edit2, DollarSign, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description?: string
  base_price?: number
}

interface HospitalService {
  service_id: string
  price?: number
}

interface PackageService {
  service_id: string
  quantity: number
}

interface HospitalPackage {
  id: string
  name: string
  description?: string
  price: number
  services: PackageService[]
}

interface HospitalPackagesStepProps {
  packages: HospitalPackage[]
  selectedServices: HospitalService[]
  onUpdate: (packages: HospitalPackage[]) => void
  onNext: () => void
  onPrevious: () => void
}

// Skeleton loading component for packages
function PackageSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function HospitalPackagesStep({ 
  packages, 
  selectedServices,
  onUpdate, 
  onNext, 
  onPrevious 
}: HospitalPackagesStepProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<HospitalPackage | null>(null)
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: "",
    services: [] as PackageService[]
  })

  // Fetch services from API without pagination limits
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch all services without pagination by setting a high limit
        const response = await fetch("/api/services?limit=100&is_active=true")
        if (!response.ok) throw new Error("Failed to fetch services")
        
        const data = await response.json()
        setServices(data.services || [])
      } catch (error) {
        console.error("Error fetching services:", error)
        toast.error("Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Get available services (only those selected in previous step)
  const availableServices = services.filter(service => 
    selectedServices.some(s => s.service_id === service.id)
  )

  const openCreateDialog = () => {
    setEditingPackage(null)
    setPackageForm({
      name: "",
      description: "",
      price: "",
      services: []
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (pkg: HospitalPackage) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price.toString(),
      services: [...pkg.services]
    })
    setIsDialogOpen(true)
  }

  const handleSavePackage = () => {
    if (!packageForm.name.trim()) {
      toast.error("Package name is required")
      return
    }

    if (!packageForm.price || parseFloat(packageForm.price) <= 0) {
      toast.error("Valid package price is required")
      return
    }

    if (packageForm.services.length === 0) {
      toast.error("At least one service must be selected")
      return
    }

    const newPackage: HospitalPackage = {
      id: editingPackage?.id || `pkg_${Date.now()}`,
      name: packageForm.name.trim(),
      description: packageForm.description.trim() || undefined,
      price: parseFloat(packageForm.price),
      services: packageForm.services
    }

    let updatedPackages: HospitalPackage[]
    if (editingPackage) {
      updatedPackages = packages.map(pkg => 
        pkg.id === editingPackage.id ? newPackage : pkg
      )
    } else {
      updatedPackages = [...packages, newPackage]
    }

    onUpdate(updatedPackages)
    setIsDialogOpen(false)
    toast.success(editingPackage ? "Package updated" : "Package created")
  }

  const handleDeletePackage = (packageId: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== packageId)
    onUpdate(updatedPackages)
    toast.success("Package deleted")
  }

  const handleServiceToggle = (serviceId: string) => {
    const isSelected = packageForm.services.some(s => s.service_id === serviceId)
    
    if (isSelected) {
      setPackageForm(prev => ({
        ...prev,
        services: prev.services.filter(s => s.service_id !== serviceId)
      }))
    } else {
      setPackageForm(prev => ({
        ...prev,
        services: [...prev.services, { service_id: serviceId, quantity: 1 }]
      }))
    }
  }

  const handleQuantityChange = (serviceId: string, quantity: string) => {
    const qty = parseInt(quantity) || 1
    setPackageForm(prev => ({
      ...prev,
      services: prev.services.map(s => 
        s.service_id === serviceId ? { ...s, quantity: qty } : s
      )
    }))
  }

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || "Unknown Service"
  }

  const calculatePackageTotal = (pkg: HospitalPackage) => {
    return pkg.services.reduce((total, pkgService) => {
      const hospitalService = selectedServices.find(s => s.service_id === pkgService.service_id)
      const service = services.find(s => s.id === pkgService.service_id)
      const price = hospitalService?.price || service?.base_price || 0
      return total + (price * pkgService.quantity)
    }, 0)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospital Packages</CardTitle>
          <CardDescription>Loading services...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Package Button Skeleton */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Package List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <PackageSkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Packages</CardTitle>
        <CardDescription>
          Create service packages by combining multiple services. Packages can offer bundled pricing for common treatment combinations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create Package Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Service Packages</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </DialogTitle>
                <DialogDescription>
                  Bundle services together to create a package with special pricing.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Package Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="package-name">Package Name *</Label>
                    <Input
                      id="package-name"
                      placeholder="Enter package name"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="package-description">Description</Label>
                    <Textarea
                      id="package-description"
                      placeholder="Enter package description"
                      value={packageForm.description}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="package-price">Package Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="package-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter package price"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Services Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium">Select Services</h4>
                  {availableServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No services available. Please select services in the previous step first.
                    </p>
                  ) : (
                    <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                      <div className="space-y-3">
                        {availableServices.map((service) => {
                          const isSelected = packageForm.services.some(s => s.service_id === service.id)
                          const quantity = packageForm.services.find(s => s.service_id === service.id)?.quantity || 1
                          const hospitalService = selectedServices.find(s => s.service_id === service.id)
                          const price = hospitalService?.price || service.base_price || 0

                          return (
                            <div key={service.id} className="flex items-center space-x-3 p-2 rounded border">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleServiceToggle(service.id)}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{service.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ${price.toFixed(2)} each
                                </p>
                              </div>
                              {isSelected && (
                                <div className="flex items-center space-x-2">
                                  <Label htmlFor={`qty-${service.id}`} className="text-xs">
                                    Qty:
                                  </Label>
                                  <Input
                                    id={`qty-${service.id}`}
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                                    className="w-16 h-8"
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Selected Services Summary */}
                {packageForm.services.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Package Contents:</h4>
                    <div className="space-y-1">
                      {packageForm.services.map((pkgService) => {
                        const service = services.find(s => s.id === pkgService.service_id)
                        const hospitalService = selectedServices.find(s => s.service_id === pkgService.service_id)
                        const price = hospitalService?.price || service?.base_price || 0
                        
                        return (
                          <div key={pkgService.service_id} className="flex justify-between text-xs">
                            <span>
                              {service?.name} × {pkgService.quantity}
                            </span>
                            <span>${(price * pkgService.quantity).toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePackage}>
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Packages List */}
        {packages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No packages created yet.</p>
            <p className="text-sm">Create your first package to bundle services together.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => {
              const individualTotal = calculatePackageTotal(pkg)
              const savings = individualTotal - pkg.price

              return (
                <Card key={pkg.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{pkg.name}</h4>
                        {pkg.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {pkg.description}
                          </p>
                        )}
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {pkg.services.map((pkgService) => (
                              <Badge key={pkgService.service_id} variant="outline" className="text-xs">
                                {getServiceName(pkgService.service_id)} × {pkgService.quantity}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-green-600">
                              Package Price: ${pkg.price.toFixed(2)}
                            </span>
                            {savings > 0 && (
                              <span className="text-muted-foreground">
                                Individual Total: ${individualTotal.toFixed(2)} 
                                <span className="text-green-600 ml-1">
                                  (Save ${savings.toFixed(2)})
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2">
            Complete Setup
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
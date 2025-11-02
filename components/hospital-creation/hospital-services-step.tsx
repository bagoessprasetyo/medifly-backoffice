"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Search, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description?: string
  category?: string
  base_price?: number
}

interface HospitalService {
  service_id: string
  price?: number
}

interface HospitalServicesStepProps {
  selectedServices: HospitalService[]
  onUpdate: (services: HospitalService[]) => void
  onNext: () => void
  onPrevious: () => void
}

// Skeleton loading component for services
function ServiceSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg">
      <Skeleton className="h-4 w-4" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function HospitalServicesStep({ 
  selectedServices, 
  onUpdate, 
  onNext, 
  onPrevious 
}: HospitalServicesStepProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

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

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = services.map(s => s.category).filter(Boolean) as string[]
    return ["all", ...Array.from(new Set(cats))]
  }, [services])

  // Filter services based on search query and category
  useEffect(() => {
    let filtered = services

    if (selectedCategory !== "all") {
      filtered = filtered.filter(service => service.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredServices(filtered)
  }, [services, searchQuery, selectedCategory])

  const handleServiceToggle = (serviceId: string) => {
    const isSelected = selectedServices.some(s => s.service_id === serviceId)
    
    if (isSelected) {
      const updatedServices = selectedServices.filter(s => s.service_id !== serviceId)
      onUpdate(updatedServices)
    } else {
      const service = services.find(s => s.id === serviceId)
      const newService: HospitalService = {
        service_id: serviceId,
        price: service?.base_price
      }
      onUpdate([...selectedServices, newService])
    }
  }

  const handlePriceChange = (serviceId: string, price: string) => {
    const updatedServices = selectedServices.map(service =>
      service.service_id === serviceId
        ? { ...service, price: price ? parseFloat(price) : undefined }
        : service
    )
    onUpdate(updatedServices)
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.service_id === serviceId)
  }

  const getServicePrice = (serviceId: string) => {
    const selectedService = selectedServices.find(s => s.service_id === serviceId)
    return selectedService?.price?.toString() || ""
  }

  const getSelectedServiceNames = () => {
    return selectedServices.map(selectedService => {
      const service = services.find(s => s.id === selectedService.service_id)
      return service?.name || "Unknown Service"
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Services</CardTitle>
        <CardDescription>
          Select the medical services offered by this hospital and set their prices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {!loading && categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Categories" : category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Services List */}
        <ScrollArea className="h-96">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ServiceSkeleton key={index} />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No services found.</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search terms or category filter.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={service.id}
                    checked={isServiceSelected(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={service.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {service.name}
                    </label>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    {service.category && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {service.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {service.base_price && (
                      <span className="text-xs text-muted-foreground">
                        Base: ${service.base_price.toFixed(2)}
                      </span>
                    )}
                    {isServiceSelected(service.id) && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`price-${service.id}`} className="text-xs">
                          Price:
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            id={`price-${service.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={getServicePrice(service.id)}
                            onChange={(e) => handlePriceChange(service.id, e.target.value)}
                            className="w-24 h-8 pl-6 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Selected Services ({selectedServices.length})</h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedServiceNames().map((name, index) => (
                  <Badge key={`${name}-${index}`} variant="secondary">
                    {name}
                    {selectedServices[index]?.price && (
                      <span className="ml-1">${selectedServices[index].price.toFixed(2)}</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
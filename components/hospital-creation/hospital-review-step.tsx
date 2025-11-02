"use client"

import * as React from "react"
import { useState } from "react"
import { ArrowLeft, Check, Building2, Wrench, Stethoscope, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  name: string
  description?: string
  base_price?: number
}

interface Facility {
  id: string
  name: string
  description?: string
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

interface HospitalReviewStepProps {
  hospitalData: any
  selectedFacilities: string[]
  selectedServices: HospitalService[]
  packages: HospitalPackage[]
  onPrevious: () => void
}

export function HospitalReviewStep({ 
  hospitalData,
  selectedFacilities,
  selectedServices,
  packages,
  onPrevious 
}: HospitalReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [services, setServices] = useState<Service[]>([])
  const router = useRouter()

  // Fetch facilities and services for display
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilitiesRes, servicesRes] = await Promise.all([
          fetch("/api/facilities"),
          fetch("/api/services")
        ])
        
        if (facilitiesRes.ok) {
          const facilitiesData = await facilitiesRes.json()
          setFacilities(facilitiesData.facilities || [])
        }
        
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(servicesData.services || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const getSelectedFacilityNames = () => {
    return facilities
      .filter(f => selectedFacilities.includes(f.id))
      .map(f => f.name)
  }

  const getSelectedServiceNames = () => {
    return services
      .filter(s => selectedServices.some(sel => sel.service_id === s.id))
      .map(s => ({
        name: s.name,
        price: selectedServices.find(sel => sel.service_id === s.id)?.price
      }))
  }

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || "Unknown Service"
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // 1. Create the hospital
      const hospitalResponse = await fetch("/api/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hospitalData),
      })

      if (!hospitalResponse.ok) {
        const errorData = await hospitalResponse.json()
        throw new Error(errorData.error || "Failed to create hospital")
      }

      const { hospital } = await hospitalResponse.json()
      const hospitalId = hospital.id

      // 2. Add facilities to hospital
      if (selectedFacilities.length > 0) {
        for (const facilityId of selectedFacilities) {
          const facilityResponse = await fetch(`/api/hospitals/${hospitalId}/facilities`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              hospital_id: hospitalId,
              facility_id: facilityId 
            }),
          })
          
          if (!facilityResponse.ok) {
            const errorData = await facilityResponse.json()
            console.error("Failed to add facility:", errorData)
            // Continue with other facilities instead of failing completely
          }
        }
      }

      // 3. Add services to hospital
      if (selectedServices.length > 0) {
        for (const service of selectedServices) {
          const serviceResponse = await fetch(`/api/hospitals/${hospitalId}/services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hospital_id: hospitalId,
              service_id: service.service_id,
              price: service.price,
            }),
          })
          
          if (!serviceResponse.ok) {
            const errorData = await serviceResponse.json()
            console.error("Failed to add service:", errorData)
            // Continue with other services instead of failing completely
          }
        }
      }

      // 4. Create packages
      if (packages.length > 0) {
        for (const pkg of packages) {
          const packageData = {
            hospital_id: hospitalId,
            name: pkg.name,
            description: pkg.description,
            total_price: pkg.price,
            services: pkg.services
          }
          
          const packageResponse = await fetch(`/api/hospitals/${hospitalId}/packages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(packageData),
          })
          
          if (!packageResponse.ok) {
            const errorData = await packageResponse.json()
            console.error("Failed to create package:", errorData)
            // Continue with other packages instead of failing completely
          }
        }
      }

      toast.success("Hospital created successfully!")
      router.push("/hospitals")
      
    } catch (error) {
      console.error("Error creating hospital:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create hospital. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>
          Review all the information before creating the hospital. You can go back to make changes if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hospital Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Hospital Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{hospitalData.hospital_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">{hospitalData.contact_number}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium">Address</p>
              <p className="text-sm text-muted-foreground">{hospitalData.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Country</p>
              <p className="text-sm text-muted-foreground">{hospitalData.country}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Zipcode</p>
              <p className="text-sm text-muted-foreground">{hospitalData.zipcode}</p>
            </div>
            {hospitalData.website && (
              <div>
                <p className="text-sm font-medium">Website</p>
                <p className="text-sm text-muted-foreground">{hospitalData.website}</p>
              </div>
            )}
            {hospitalData.rating && (
              <div>
                <p className="text-sm font-medium">Rating</p>
                <p className="text-sm text-muted-foreground">{hospitalData.rating} stars</p>
              </div>
            )}
            <div className="md:col-span-2 flex gap-2">
              {hospitalData.is_halal && (
                <Badge variant="secondary">Halal Certified</Badge>
              )}
              {hospitalData.is_show_price && (
                <Badge variant="secondary">Show Prices</Badge>
              )}
            </div>
            {hospitalData.description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{hospitalData.description}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Facilities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Facilities</h3>
            <Badge variant="outline">{selectedFacilities.length} selected</Badge>
          </div>
          
          {selectedFacilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No facilities selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {getSelectedFacilityNames().map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Services */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Services</h3>
            <Badge variant="outline">{selectedServices.length} selected</Badge>
          </div>
          
          {selectedServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services selected</p>
          ) : (
            <div className="space-y-2">
              {getSelectedServiceNames().map((service, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{service.name}</span>
                  {service.price && (
                    <Badge variant="outline">${service.price.toFixed(2)}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Packages */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Packages</h3>
            <Badge variant="outline">{packages.length} created</Badge>
          </div>
          
          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No packages created</p>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{pkg.name}</h4>
                    <Badge variant="outline">${pkg.price.toFixed(2)}</Badge>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {pkg.services.map((pkgService) => (
                      <Badge key={pkgService.service_id} variant="secondary" className="text-xs">
                        {getServiceName(pkgService.service_id)} × {pkgService.quantity}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Alert */}
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            Ready to create hospital with {selectedFacilities.length} facilities, {selectedServices.length} services, and {packages.length} packages.
          </AlertDescription>
        </Alert>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} disabled={isSubmitting} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Hospital...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Hospital
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Facility {
  id: string
  name: string
  description?: string
  icon?: string
}

interface HospitalFacilitiesStepProps {
  selectedFacilities: string[]
  onUpdate: (facilities: string[]) => void
  onNext: () => void
  onPrevious: () => void
}

// Skeleton loading component for facilities
function FacilitySkeleton() {
  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg">
      <Skeleton className="h-4 w-4" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function HospitalFacilitiesStep({ 
  selectedFacilities, 
  onUpdate, 
  onNext, 
  onPrevious 
}: HospitalFacilitiesStepProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])

  // Fetch facilities from API without pagination limits
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        // Fetch all facilities without pagination by setting a high limit
        const response = await fetch("/api/facilities?limit=100&is_active=true")
        if (!response.ok) throw new Error("Failed to fetch facilities")
        
        const data = await response.json()
        setFacilities(data.facilities || [])
      } catch (error) {
        console.error("Error fetching facilities:", error)
        toast.error("Failed to load facilities")
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  // Filter facilities based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFacilities(facilities)
    } else {
      const filtered = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFacilities(filtered)
    }
  }, [facilities, searchQuery])

  const handleFacilityToggle = (facilityId: string) => {
    const updatedFacilities = selectedFacilities.includes(facilityId)
      ? selectedFacilities.filter(id => id !== facilityId)
      : [...selectedFacilities, facilityId]
    
    onUpdate(updatedFacilities)
  }

  const handleSelectAll = () => {
    if (selectedFacilities.length === filteredFacilities.length) {
      onUpdate([])
    } else {
      onUpdate(filteredFacilities.map(f => f.id))
    }
  }

  const getSelectedFacilityNames = () => {
    return facilities
      .filter(f => selectedFacilities.includes(f.id))
      .map(f => f.name)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Facilities</CardTitle>
        <CardDescription>
          Select the facilities available at this hospital. You can search and filter to find specific facilities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Select All / Deselect All */}
        {!loading && filteredFacilities.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedFacilities.length === filteredFacilities.length ? "Deselect All" : "Select All"}
            </Button>
            <Badge variant="outline">
              {selectedFacilities.length} of {filteredFacilities.length} selected
            </Badge>
          </div>
        )}

        {/* Facilities List */}
        <ScrollArea className="h-96">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <FacilitySkeleton key={index} />
              ))}
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No facilities found.</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search terms.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={facility.id}
                    checked={selectedFacilities.includes(facility.id)}
                    onCheckedChange={() => handleFacilityToggle(facility.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={facility.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {facility.name}
                    </label>
                    {facility.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {facility.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Selected Facilities Summary */}
        {selectedFacilities.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Selected Facilities ({selectedFacilities.length})</h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedFacilityNames().map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
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
"use client"

import * as React from "react"
import { MapPin } from "lucide-react"
import { Control, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CountryPicker } from "@/components/ui/country-picker"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import type { HospitalLocation } from "@/lib/types"

interface LocationPickerProps {
  control: Control<any>
  className?: string
  disabled?: boolean
}

export function LocationPicker({
  control,
  className,
  disabled = false
}: LocationPickerProps) {
  
  const validateCoordinate = (value: string, type: 'latitude' | 'longitude'): boolean => {
    const num = parseFloat(value)
    if (isNaN(num)) return false
    
    if (type === 'latitude') {
      return num >= -90 && num <= 90
    } else {
      return num >= -180 && num <= 180
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Information
        </CardTitle>
        <CardDescription>
          Enter the hospital location details manually. All fields are required for accurate location data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address Input */}
        <FormField
          control={control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter complete hospital address"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coordinates Input */}
        <div className="space-y-4">
          <FormLabel className="text-base font-medium">Coordinates *</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="location.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-90 to 90"
                      disabled={disabled}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? parseFloat(value) : undefined)
                      }}
                      className={cn(
                        field.value && !validateCoordinate(field.value.toString(), 'latitude') 
                          ? "border-red-500" 
                          : ""
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && !validateCoordinate(field.value.toString(), 'latitude') && (
                    <p className="text-sm text-red-500 mt-1">Latitude must be between -90 and 90</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="location.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-180 to 180"
                      disabled={disabled}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value ? parseFloat(value) : undefined)
                      }}
                      className={cn(
                        field.value && !validateCoordinate(field.value.toString(), 'longitude') 
                          ? "border-red-500" 
                          : ""
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && !validateCoordinate(field.value.toString(), 'longitude') && (
                    <p className="text-sm text-red-500 mt-1">Longitude must be between -180 and 180</p>
                  )}
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Location Details */}
        <div className="space-y-4">
          <FormLabel className="text-base font-medium">Location Details *</FormLabel>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter city name"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="location.state_province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter state or province"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="location.zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zipcode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter zipcode"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="location.country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <FormControl>
                  <CountryPicker
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Select country..."
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Summary */}
        <LocationSummary control={control} />
      </CardContent>
    </Card>
  )
}

function LocationSummary({ control }: { control: Control<any> }) {
  const { watch } = useFormContext()
  const locationData = watch("location")

  if (!locationData?.address || !locationData?.latitude || !locationData?.longitude || !locationData?.city || !locationData?.country_code) {
    return null
  }

  return (
    <div className="space-y-2">
      <Separator />
      <FormLabel className="text-base font-medium">Location Summary</FormLabel>
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <FormLabel className="text-muted-foreground">Address</FormLabel>
            <p className="break-words">{locationData.address}</p>
          </div>
          <div>
            <FormLabel className="text-muted-foreground">Coordinates</FormLabel>
            <p className="font-mono">{locationData.latitude?.toFixed(6)}, {locationData.longitude?.toFixed(6)}</p>
          </div>
          <div>
            <FormLabel className="text-muted-foreground">City</FormLabel>
            <p>{locationData.city}</p>
          </div>
          {locationData.state_province && (
            <div>
              <FormLabel className="text-muted-foreground">State/Province</FormLabel>
              <p>{locationData.state_province}</p>
            </div>
          )}
          {locationData.zipcode && (
            <div>
              <FormLabel className="text-muted-foreground">Zipcode</FormLabel>
              <p>{locationData.zipcode}</p>
            </div>
          )}
          <div>
            <FormLabel className="text-muted-foreground">Country</FormLabel>
            <p>{locationData.country_code}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
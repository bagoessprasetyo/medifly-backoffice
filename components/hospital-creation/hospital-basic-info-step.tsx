"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { LocationPicker } from "@/components/ui/location-picker"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { hospitalSchema } from "@/lib/validations"
import { z } from "zod"
import type { HospitalLocation } from "@/lib/types"

// Create a form-specific schema that makes boolean fields required
const hospitalFormSchema = hospitalSchema.extend({
  is_halal: z.boolean(),
  is_show_price: z.boolean()
})

type HospitalFormData = z.infer<typeof hospitalFormSchema>

interface HospitalBasicInfoStepProps {
  data: Partial<HospitalFormData>
  onUpdate: (data: Partial<HospitalFormData>) => void
  onNext: () => void
}

export function HospitalBasicInfoStep({ data, onUpdate, onNext }: HospitalBasicInfoStepProps) {
  const form = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      hospital_name: data.hospital_name || "",
      address: data.address || "",
      contact_number: data.contact_number || "",
      description: data.description || "",
      website: data.website || "",
      rating: data.rating || undefined,
      country: data.country || "",
      zipcode: data.zipcode || "",
      is_halal: data.is_halal || false,
      is_show_price: data.is_show_price !== undefined ? data.is_show_price : true,
    },
  })

  const onSubmit = (formData: HospitalFormData) => {
    onUpdate(formData)
    onNext()
  }

  // Auto-save form data on change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value as Partial<HospitalFormData>)
    })
    return () => subscription.unsubscribe()
  }, [form, onUpdate])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Basic Information</CardTitle>
        <CardDescription>
          Enter the basic details about the hospital including contact information and settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="hospital_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hospital name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information with Enhanced Picker */}
            <div className="space-y-4">
              <LocationPicker
                control={form.control}
              />
              
              {/* Hidden form field to maintain validation */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              

              
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional website URL for the hospital
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0-5" 
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Hospital rating from 0 to 5 stars
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter hospital description, specialties, and other details"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description about the hospital
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hospital Settings</h3>
              
              <FormField
                control={form.control}
                name="is_halal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Halal Certified</FormLabel>
                      <FormDescription>
                        Mark if this hospital is halal certified
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_show_price"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show Prices</FormLabel>
                      <FormDescription>
                        Display service prices to patients
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                Next: Add Facilities
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
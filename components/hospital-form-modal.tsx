"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useCreateHospital, useUpdateHospital } from "@/hooks/use-hospitals"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { hospitalSchema } from "@/lib/validations"
import { toast } from "sonner"
import type { Hospital, HospitalFormData, HospitalLocation } from "@/lib/types"

interface HospitalFormModalProps {
  open: boolean
  onClose: () => void
  hospital?: Hospital | null
}

export function HospitalFormModal({ open, onClose, hospital }: HospitalFormModalProps) {
  const isEditing = !!hospital
  const createHospitalMutation = useCreateHospital()
  const updateHospitalMutation = useUpdateHospital()

  const form = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema) as any,
    defaultValues: {
      hospital_name: "",
      address: "",
      contact_number: "",
      description: "",
      website: "",
      rating: undefined,
      country: "",
      zipcode: "",
      is_halal: false,
      is_show_price: false,
    },
  })

  // Reset form when hospital changes or modal opens/closes
  React.useEffect(() => {
    if (open) {
      if (hospital) {
        form.reset({
          hospital_name: hospital.hospital_name,
          address: hospital.address,
          contact_number: hospital.contact_number || "",
          description: hospital.description || "",
          website: hospital.website || "",
          rating: hospital.rating || undefined,
          country: hospital.country || "",
          zipcode: hospital.zipcode || "",
          is_halal: hospital.is_halal || false,
          is_show_price: hospital.is_show_price || false,
        })
      } else {
        form.reset({
          hospital_name: "",
          address: "",
          contact_number: "",
          description: "",
          website: "",
          rating: undefined,
          country: "",
          zipcode: "",
          is_halal: false,
          is_show_price: false,
        })
      }
    }
  }, [open, hospital, form])

  const onSubmit = async (data: HospitalFormData) => {
    try {
      if (isEditing && hospital) {
        await updateHospitalMutation.mutateAsync({
          id: hospital.id,
          data,
        })
        toast.success("Hospital updated successfully")
      } else {
        await createHospitalMutation.mutateAsync(data)
        toast.success("Hospital created successfully")
      }
      onClose()
    } catch (error) {
      toast.error(isEditing ? "Failed to update hospital" : "Failed to create hospital")
    }
  }

  const isLoading = createHospitalMutation.isPending || updateHospitalMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Hospital" : "Add New Hospital"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the hospital information below." 
              : "Fill in the details to add a new hospital to the system."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((data: any) => onSubmit(data))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_name">Hospital Name *</Label>
              <Input
                id="hospital_name"
                {...form.register("hospital_name")}
                placeholder="Enter hospital name"
                disabled={isLoading}
              />
              {form.formState.errors.hospital_name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.hospital_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                {...form.register("contact_number")}
                placeholder="Enter contact number"
                disabled={isLoading}
              />
              {form.formState.errors.contact_number && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.contact_number.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              {...form.register("address")}
              placeholder="Enter hospital address"
              disabled={isLoading}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-600">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...form.register("country")}
                placeholder="Enter country"
                disabled={isLoading}
              />
              {form.formState.errors.country && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipcode">Zipcode</Label>
              <Input
                id="zipcode"
                {...form.register("zipcode")}
                placeholder="Enter zipcode"
                disabled={isLoading}
              />
              {form.formState.errors.zipcode && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.zipcode.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...form.register("website")}
                placeholder="https://example.com"
                disabled={isLoading}
              />
              {form.formState.errors.website && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.website.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                {...form.register("rating", { valueAsNumber: true })}
                placeholder="4.5"
                disabled={isLoading}
              />
              {form.formState.errors.rating && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.rating.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter hospital description"
              disabled={isLoading}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_halal"
                {...form.register("is_halal")}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
              />
              <Label htmlFor="is_halal" className="text-sm font-medium">
                Halal Certified
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_show_price"
                {...form.register("is_show_price")}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
              />
              <Label htmlFor="is_show_price" className="text-sm font-medium">
                Show Pricing
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Hospital" : "Create Hospital"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
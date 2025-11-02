"use client"

import * as React from "react"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { HospitalBasicInfoStep } from "@/components/hospital-creation/hospital-basic-info-step"
import { HospitalFacilitiesStep } from "@/components/hospital-creation/hospital-facilities-step"
import { HospitalServicesStep } from "@/components/hospital-creation/hospital-services-step"
import { HospitalPackagesStep } from "@/components/hospital-creation/hospital-packages-step"
import { HospitalReviewStep } from "@/components/hospital-creation/hospital-review-step"

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

const steps = [
  { id: 1, name: "Basic Info", description: "Hospital details" },
  { id: 2, name: "Facilities", description: "Available facilities" },
  { id: 3, name: "Services", description: "Medical services" },
  { id: 4, name: "Packages", description: "Service packages" },
  { id: 5, name: "Review", description: "Review & submit" },
]

export default function NewHospitalPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [hospitalData, setHospitalData] = useState<any>({})
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<HospitalService[]>([])
  const [packages, setPackages] = useState<HospitalPackage[]>([])

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleHospitalDataUpdate = (data: any) => {
    setHospitalData((prev: any) => ({ ...prev, ...data }))
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Medifly.AI CMS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/hospitals">
                    Hospitals
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Hospital</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Create New Hospital
              </h1>
              <p className="text-sm text-gray-600">
                Set up a new hospital with facilities, services, and packages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/hospitals">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Hospitals
                </Button>
              </Link>
            </div>
          </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Setup Progress</CardTitle>
            <Badge variant="outline">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <HospitalBasicInfoStep
            data={hospitalData}
            onUpdate={handleHospitalDataUpdate}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <HospitalFacilitiesStep
            selectedFacilities={selectedFacilities}
            onUpdate={setSelectedFacilities}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 3 && (
          <HospitalServicesStep
            selectedServices={selectedServices}
            onUpdate={setSelectedServices}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 4 && (
          <HospitalPackagesStep
            packages={packages}
            selectedServices={selectedServices}
            onUpdate={setPackages}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 5 && (
          <HospitalReviewStep
            hospitalData={hospitalData}
            selectedFacilities={selectedFacilities}
            selectedServices={selectedServices}
            packages={packages}
            onPrevious={handlePrevious}
          />
        )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
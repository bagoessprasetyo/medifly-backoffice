"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  Eye, 
  ArrowLeft,
  Clock,
  Heart,
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { PatientWithAge } from "@/lib/types"

// Mock patient data
const mockPatients: Record<string, PatientWithAge> = {
  "1": {
    id: "1",
    name: "Sarah M. Johnson",
    email: "sarah.johnson@email.com",
    address: "123 Oak Street, Springfield, IL 62701",
    gender: "female",
    dob: "1989-03-15",
    religion: "Christian",
    created_date: "2024-01-15T10:30:00Z",
    created_by: null,
    user_log: null,
    date_log: null,
    age: 34,
    formatted_dob: "March 15, 1989"
  },
  "2": {
    id: "2", 
    name: "Michael R. Chen",
    email: "michael.chen@email.com",
    address: "456 Pine Avenue, Chicago, IL 60601",
    gender: "male",
    dob: "1995-07-22",
    religion: "Buddhist",
    created_date: "2024-01-15T11:45:00Z",
    created_by: null,
    user_log: null,
    date_log: null,
    age: 28,
    formatted_dob: "July 22, 1995"
  },
  "3": {
    id: "3",
    name: "Emma L. Rodriguez",
    email: "emma.rodriguez@email.com", 
    address: "789 Maple Drive, Aurora, IL 60502",
    gender: "female",
    dob: "1978-11-08",
    religion: "Catholic",
    created_date: "2024-01-14T14:20:00Z",
    created_by: null,
    user_log: null,
    date_log: null,
    age: 45,
    formatted_dob: "November 8, 1978"
  }
}

export default function PatientProfilePage() {
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<PatientWithAge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessLogged, setAccessLogged] = useState(false)

  useEffect(() => {
    // Simulate API call to fetch patient data
    const fetchPatient = async () => {
      setIsLoading(true)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const patientData = mockPatients[patientId]
      setPatient(patientData || null)
      setIsLoading(false)
      
      // Log access for audit purposes
      if (patientData) {
        setAccessLogged(true)
        console.log(`Patient profile accessed: ${patientData.name} (ID: ${patientId})`)
      }
    }

    fetchPatient()
  }, [patientId])

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading patient profile...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!patient) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Patient Not Found</h2>
              <p className="text-slate-600 mb-4">The requested patient profile could not be found.</p>
              <Link href="/patients/registry">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Registry
                </Button>
              </Link>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAgeGroup = (age: number) => {
    if (age < 18) return "Minor"
    if (age <= 35) return "Young Adult"
    if (age <= 50) return "Adult"
    if (age <= 65) return "Middle-aged"
    return "Senior"
  }

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
                  <BreadcrumbLink href="/patients">
                    Patients
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/patients/registry">
                    Registry
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{patient.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/patients/registry">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Registry
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  Patient Profile
                </h1>
                <p className="text-slate-600">Demographic information and details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Read-Only Access
              </Badge>
              {accessLogged && (
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Access Logged
                </Badge>
              )}
            </div>
          </div>

          {/* Patient Information Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Primary demographic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Full Name</p>
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email Address</p>
                      <p className="font-semibold text-slate-900">{patient.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-semibold text-slate-900">{patient.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Heart className="h-5 w-5" />
                  Demographics
                </CardTitle>
                <CardDescription>Personal and cultural information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50">
                    <div>
                      <p className="text-sm text-slate-600">Gender</p>
                      <p className="font-semibold text-slate-900 capitalize">{patient.gender}</p>
                    </div>
                    <Badge variant="outline" className={
                      patient.gender === 'male' 
                        ? 'border-blue-200 text-blue-700' 
                        : 'border-pink-200 text-pink-700'
                    }>
                      {patient.gender === 'male' ? 'Male' : 'Female'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-600">Date of Birth</p>
                      <p className="font-semibold text-slate-900">{formatDate(patient.dob)}</p>
                    </div>
                    <Badge variant="secondary">
                      {patient.age} years old
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-600">Age Group</p>
                      <p className="font-semibold text-slate-900">{getAgeGroup(patient.age)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-600">Religion</p>
                      <p className="font-semibold text-slate-900">{patient.religion}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      {patient.religion}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Information */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Clock className="h-5 w-5" />
                Registration Information
              </CardTitle>
              <CardDescription>Account creation and system details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50/50">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Registration Date</p>
                    <p className="font-semibold text-slate-900">{formatDate(patient.created_date!)}</p>
                    <p className="text-xs text-slate-500">
                      {Math.floor((Date.now() - new Date(patient.created_date!).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Patient ID</p>
                    <p className="font-semibold text-slate-900 font-mono">#{patient.id.padStart(6, '0')}</p>
                    <p className="text-xs text-slate-500">Unique identifier</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Compliance */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Shield className="h-5 w-5" />
                Privacy &amp; Compliance
              </CardTitle>
              <CardDescription className="text-amber-700">
                Data access and privacy information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100/50">
                  <Eye className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      Read-Only Access
                    </p>
                    <p className="text-xs text-amber-700">
                      This profile is displayed in read-only mode for privacy protection
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-100/50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Access Logged
                    </p>
                    <p className="text-xs text-green-700">
                      This profile view has been recorded for audit compliance
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    HIPAA Compliant
                  </Badge>
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    Audit Logged
                  </Badge>
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    Data Encrypted
                  </Badge>
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    Privacy Protected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/patients/registry">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registry
              </Button>
            </Link>
            <Link href="/patients/analytics">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
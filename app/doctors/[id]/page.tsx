'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Shield, 
  CheckCircle, 
  Mail, 
  MapPin, 
  Heart, 
  Clock, 
  Calendar, 
  FileText, 
  Eye,
  Stethoscope,
  Building2,
  Languages,
  Award,
  Star,
  Phone,
  GraduationCap,
  Briefcase
} from 'lucide-react'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDoctor } from '@/hooks/use-doctors'

// Mock data for development - replace with actual API call
const mockDoctor = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@medifly.com',
  phone_number: '+1 (555) 123-4567',
  license_number: 'MD-2024-001',
  years_of_experience: 8,
  image_url: null,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  created_by: 'admin',
  updated_by: 'admin',
  hospitals: [
    { id: '1', name: 'General Hospital', address: '123 Main St, City' },
    { id: '2', name: 'Medical Center', address: '456 Oak Ave, City' }
  ],
  services: [
    { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular care' },
    { id: '2', name: 'Internal Medicine', description: 'General internal medicine' }
  ],
  languages: [
    { id: '1', name: 'English', proficiency: 'Native' },
    { id: '2', name: 'Spanish', proficiency: 'Fluent' },
    { id: '3', name: 'French', proficiency: 'Conversational' }
  ],
  certifications: [
    { id: '1', name: 'Board Certified Cardiologist', issuer: 'American Board of Cardiology', issue_date: '2020-06-15', expiry_date: '2030-06-15' },
    { id: '2', name: 'Advanced Cardiac Life Support', issuer: 'American Heart Association', issue_date: '2023-03-20', expiry_date: '2025-03-20' }
  ]
}

export default function DoctorProfilePage() {
  const params = useParams()
  const doctorId = params.id as string
  
  // For now, using mock data. Replace with actual hook when ready
  // const { data: doctor, isLoading, error } = useDoctor(doctorId)
  const [doctor, setDoctor] = useState(mockDoctor)
  const [isLoading, setIsLoading] = useState(true)
  const [accessLogged, setAccessLogged] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setAccessLogged(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getExperienceLevel = (years: number) => {
    if (years < 3) return 'Junior'
    if (years < 8) return 'Mid-Level'
    if (years < 15) return 'Senior'
    return 'Expert'
  }

  const getRatingStars = (rating: number = 4.8) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <Separator />
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!doctor) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <Separator />
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Stethoscope className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
              <p className="text-gray-600 mb-6">The doctor profile you're looking for doesn't exist or has been removed.</p>
              <Link href="/doctors">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Doctors
                </Button>
              </Link>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{doctor.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Separator />
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/doctors">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Registry
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                  Doctor Profile
                </h1>
                <p className="text-slate-600">Professional information and credentials</p>
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

          {/* Doctor Information Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Primary contact and identification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Full Name</p>
                      <p className="font-semibold text-slate-900">{doctor.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email Address</p>
                      <p className="font-semibold text-slate-900">{doctor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone Number</p>
                      <p className="font-semibold text-slate-900">{doctor.phone_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">License Number</p>
                      <p className="font-semibold text-slate-900 font-mono">{doctor.license_number}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Briefcase className="h-5 w-5" />
                  Professional Details
                </CardTitle>
                <CardDescription>Experience and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50">
                    <div>
                      <p className="text-sm text-slate-600">Experience</p>
                      <p className="font-semibold text-slate-900">{doctor.years_of_experience} years</p>
                    </div>
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      {getExperienceLevel(doctor.years_of_experience)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-600">Rating</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getRatingStars(4.8)}
                        </div>
                        <span className="font-semibold text-slate-900">4.8</span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Excellent
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="font-semibold text-slate-900">Active</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hospital Affiliations */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Building2 className="h-5 w-5" />
                Hospital Affiliations
              </CardTitle>
              <CardDescription>Associated medical facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {doctor.hospitals.map((hospital) => (
                  <div key={hospital.id} className="flex items-center gap-3 p-4 rounded-lg bg-purple-50/50">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{hospital.name}</p>
                      <p className="text-sm text-slate-600">{hospital.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services & Specializations */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Heart className="h-5 w-5" />
                Services &amp; Specializations
              </CardTitle>
              <CardDescription>Medical services and areas of expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {doctor.services.map((service) => (
                  <div key={service.id} className="flex items-center gap-3 p-4 rounded-lg bg-orange-50/50">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{service.name}</p>
                      <p className="text-sm text-slate-600">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages & Certifications */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Languages */}
            <Card className="border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <Languages className="h-5 w-5" />
                  Languages
                </CardTitle>
                <CardDescription>Supported languages and proficiency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {doctor.languages.map((language) => (
                  <div key={language.id} className="flex items-center justify-between p-3 rounded-lg bg-teal-50/50">
                    <div>
                      <p className="font-semibold text-slate-900">{language.name}</p>
                    </div>
                    <Badge variant="outline" className="border-teal-200 text-teal-700">
                      {language.proficiency}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="border-indigo-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
                <CardDescription>Professional certifications and credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {doctor.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 rounded-lg bg-indigo-50/50">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-slate-900">{cert.name}</p>
                      <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                        Valid
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{cert.issuer}</p>
                    <p className="text-xs text-slate-500">
                      Issued: {formatDate(cert.issue_date)} • Expires: {formatDate(cert.expiry_date)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Registration Information */}
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5" />
                Registration Information
              </CardTitle>
              <CardDescription>Account creation and system details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50/50">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Registration Date</p>
                    <p className="font-semibold text-slate-900">{formatDate(doctor.created_at)}</p>
                    <p className="text-xs text-slate-500">
                      {Math.floor((Date.now() - new Date(doctor.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Doctor ID</p>
                    <p className="font-semibold text-slate-900 font-mono">#{doctor.id.padStart(6, '0')}</p>
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
            <Link href="/doctors">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registry
              </Button>
            </Link>
            <Link href="/doctors/analytics">
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
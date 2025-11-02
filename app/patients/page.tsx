"use client"

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
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  UserCheck, 
  BarChart3, 
  Shield, 
  Download, 
  TrendingUp, 
  Calendar,
  Activity,
  Eye,
  FileText,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { usePatients } from "@/hooks/use-patients"
import { useMemo } from "react"
import { PatientDashboardSkeleton } from "@/components/patients/patient-dashboard-skeleton"

export default function PatientsPage() {
  // Fetch patient data
  const { data: patientsData, isLoading, error } = usePatients({
    limit: 100,
    page: 1
  })

  // Calculate statistics from real data
  const stats = useMemo(() => {
    if (!patientsData?.data) {
      return {
        totalPatients: 0,
        averageAge: 0,
        genderDistribution: { male: 0, female: 0, other: 0 },
        newRegistrationsThisMonth: 0,
        recentRegistrations: [],
        ageDistribution: {
          '18-35': 0,
          '36-50': 0,
          '51-65': 0,
          'other': 0
        }
      }
    }

    const patients = patientsData.data
    const totalPatients = patients.length
    
    // Calculate average age
    const totalAge = patients.reduce((sum, patient) => sum + (patient.age || 0), 0)
    const averageAge = totalPatients > 0 ? Math.round((totalAge / totalPatients) * 10) / 10 : 0

    // Calculate gender distribution
    const genderCounts = patients.reduce((acc, patient) => {
      const gender = patient.gender?.toLowerCase() || 'other'
      // Ensure gender is one of the valid keys
      const validGender = ['male', 'female', 'other'].includes(gender) ? gender as keyof typeof acc : 'other'
      acc[validGender] = (acc[validGender] || 0) + 1
      return acc
    }, { male: 0, female: 0, other: 0 } as Record<'male' | 'female' | 'other', number>)

    // Calculate new registrations this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const newRegistrationsThisMonth = patients.filter(patient => {
      if (!patient.created_date) return false
      const createdDate = new Date(patient.created_date)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length

    // Get recent registrations (last 5)
    const recentRegistrations = [...patients]
      .sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime())
      .slice(0, 5)

    // Calculate age distribution
    const ageDistribution = patients.reduce((acc, patient) => {
      const age = patient.age || 0
      if (age >= 18 && age <= 35) acc['18-35']++
      else if (age >= 36 && age <= 50) acc['36-50']++
      else if (age >= 51 && age <= 65) acc['51-65']++
      else acc['other']++
      return acc
    }, { '18-35': 0, '36-50': 0, '51-65': 0, 'other': 0 })

    return {
      totalPatients,
      averageAge,
      genderDistribution: genderCounts,
      newRegistrationsThisMonth,
      recentRegistrations,
      ageDistribution
    }
  }, [patientsData])

  // Calculate percentages for display
  const genderPercentages = useMemo(() => {
    const total = stats.totalPatients
    if (total === 0) return { male: 0, female: 0 }
    
    return {
      male: Math.round((stats.genderDistribution.male / total) * 100),
      female: Math.round((stats.genderDistribution.female / total) * 100)
    }
  }, [stats])

  const agePercentages = useMemo(() => {
    const total = stats.totalPatients
    if (total === 0) return { '18-35': 0, '36-50': 0, '51-65': 0, 'other': 0 }
    
    return {
      '18-35': Math.round((stats.ageDistribution['18-35'] / total) * 100),
      '36-50': Math.round((stats.ageDistribution['36-50'] / total) * 100),
      '51-65': Math.round((stats.ageDistribution['51-65'] / total) * 100),
      'other': Math.round((stats.ageDistribution['other'] / total) * 100)
    }
  }, [stats])

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`
  }

  // Show full skeleton loading state when initially loading
  if (isLoading && !patientsData) {
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
                    <BreadcrumbPage>Patients Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <PatientDashboardSkeleton />
        </SidebarInset>
      </SidebarProvider>
    )
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
                  <BreadcrumbPage>Patients Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header Section */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Patient Demographics Dashboard
                </h1>
                <p className="text-slate-600">
                  Secure, read-only access to patient demographic information and analytics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  Read-Only Access
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-100 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : error ? (
                  <div className="text-2xl font-bold text-red-500">Error</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.totalPatients.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="text-green-600">+{stats.newRegistrationsThisMonth}</span> new this month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-green-100 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Average Age</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : error ? (
                  <div className="text-2xl font-bold text-red-500">Error</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">{stats.averageAge}</div>
                    <p className="text-xs text-slate-600">
                      years old
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Gender Distribution</CardTitle>
                <UserCheck className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : error ? (
                  <div className="text-2xl font-bold text-red-500">Error</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">{genderPercentages.female}% F</div>
                    <p className="text-xs text-slate-600">
                      {genderPercentages.male}% Male, {genderPercentages.female}% Female
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-orange-100 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">New Registrations</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : error ? (
                  <div className="text-2xl font-bold text-red-500">Error</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">{stats.newRegistrationsThisMonth}</div>
                    <p className="text-xs text-slate-600">
                      this month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/patients/registry">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Patient Registry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600">
                    Browse complete patient database with advanced search and filtering
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/patients/analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Demographics Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600">
                    Interactive charts and demographic trend analysis
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/patients/export">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600">
                    Secure data export with privacy compliance and audit logging
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-slate-600">All systems compliant</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Patient Registrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Registrations
                </CardTitle>
                <CardDescription>Latest patient demographic entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-500">Failed to load recent registrations</p>
                  </div>
                ) : stats.recentRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No recent registrations found</p>
                  </div>
                ) : (
                  stats.recentRegistrations.map((patient, index) => {
                     const colorClasses = [
                       { bg: 'bg-blue-100', text: 'text-blue-600' },
                       { bg: 'bg-green-100', text: 'text-green-600' },
                       { bg: 'bg-purple-100', text: 'text-purple-600' },
                       { bg: 'bg-orange-100', text: 'text-orange-600' },
                       { bg: 'bg-pink-100', text: 'text-pink-600' }
                     ]
                     const colorClass = colorClasses[index % colorClasses.length]
                     
                     return (
                       <div key={patient.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                         <div className={`w-8 h-8 ${colorClass.bg} rounded-full flex items-center justify-center`}>
                           <UserCheck className={`h-4 w-4 ${colorClass.text}`} />
                         </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{patient.name}</p>
                          <p className="text-xs text-slate-600">
                            {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown'}, {patient.age || 'Unknown'} years
                            {patient.religion && ` • ${patient.religion}`}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {patient.created_date ? formatTimeAgo(patient.created_date) : 'Unknown'}
                        </span>
                      </div>
                    )
                  })
                )}
                <div className="pt-2">
                  <Link href="/patients/registry">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View All Patients
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Demographics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Demographics Overview
                </CardTitle>
                <CardDescription>Key demographic distributions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="w-full h-2 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-500">Failed to load demographics data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Age 18-35</span>
                        <span className="font-medium">{agePercentages['18-35']}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${agePercentages['18-35']}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Age 36-50</span>
                        <span className="font-medium">{agePercentages['36-50']}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${agePercentages['36-50']}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Age 51-65</span>
                        <span className="font-medium">{agePercentages['51-65']}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${agePercentages['51-65']}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Other Ages</span>
                        <span className="font-medium">{agePercentages['other']}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${agePercentages['other']}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-2">
                  <Link href="/patients/analytics">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy and Compliance Notice */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Shield className="h-5 w-5" />
                Privacy &amp; Compliance Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 mb-3">
                This system provides read-only access to patient demographic information in compliance with healthcare privacy regulations. 
                All access is logged for audit purposes.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Audit Logged
                </Badge>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Read-Only Access
                </Badge>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Data Encrypted
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
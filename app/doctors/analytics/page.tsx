"use client"

import { useState, useEffect, useMemo } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Stethoscope, 
  Calendar,
  Shield,
  Download,
  RefreshCw,
  Activity,
  Star,
  Globe,
  MapPin,
  Building2,
  GraduationCap,
  Award,
  Languages,
  Users
} from "lucide-react"
import Link from "next/link"
import { useDoctors } from "@/hooks/use-doctors"
import { Skeleton } from "@/components/ui/skeleton"

// Recharts and shadcn chart imports
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

// Types for doctor analytics
interface DoctorAnalytics {
  totalDoctors: number
  activeDoctors: number
  averageRating: number
  averageExperience: number
  specializationDistribution: { [key: string]: number }
  experienceDistribution: { range: string; count: number }[]
  hospitalAssociations: { [key: string]: number }
  languageDistribution: { [key: string]: number }
  certificationDistribution: { [key: string]: number }
  registrationTrends: { date: string; count: number }[]
}

// Skeleton Components for Analytics
function AnalyticsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
}

function AnalyticsPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header Skeleton */}
      <AnalyticsHeaderSkeleton />

      {/* Key Metrics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCardSkeleton />
        <AnalyticsCardSkeleton />
        <AnalyticsCardSkeleton />
        <AnalyticsCardSkeleton />
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      {/* Insights Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics calculation functions
function calculateDoctorAnalytics(doctors: any[]): DoctorAnalytics {
  if (!doctors || doctors.length === 0) {
    return {
      totalDoctors: 0,
      activeDoctors: 0,
      averageRating: 0,
      averageExperience: 0,
      specializationDistribution: {},
      experienceDistribution: [],
      hospitalAssociations: {},
      languageDistribution: {},
      certificationDistribution: {},
      registrationTrends: []
    }
  }

  const totalDoctors = doctors.length
  const activeDoctors = totalDoctors // Assuming all fetched doctors are active
  
  // Calculate average rating (mock data for now)
  const averageRating = 4.7

  // Calculate average experience
  const totalExperience = doctors.reduce((sum, doctor) => sum + (doctor.years_of_experience || 0), 0)
  const averageExperience = totalExperience / totalDoctors

  // Specialization distribution (from services)
  const specializationDistribution: { [key: string]: number } = {}
  doctors.forEach(doctor => {
    if (doctor.services && Array.isArray(doctor.services)) {
      doctor.services.forEach((service: any) => {
        specializationDistribution[service.services?.name] = (specializationDistribution[service.services?.name] || 0) + 1
      })
    }
  })

  // Experience distribution
  const experienceRanges = [
    { range: '0-2 years', min: 0, max: 2 },
    { range: '3-5 years', min: 3, max: 5 },
    { range: '6-10 years', min: 6, max: 10 },
    { range: '11-15 years', min: 11, max: 15 },
    { range: '16+ years', min: 16, max: 100 }
  ]

  const experienceDistribution = experienceRanges.map(range => ({
    range: range.range,
    count: doctors.filter(d => 
      d.years_of_experience >= range.min && d.years_of_experience <= range.max
    ).length
  }))

  // Hospital associations
  const hospitalAssociations: { [key: string]: number } = {}
  doctors.forEach(doctor => {
    if (doctor.hospitals && Array.isArray(doctor.hospitals)) {
      doctor.hospitals.forEach((hospital: any) => {
        hospitalAssociations[hospital.hospitals?.name] = (hospitalAssociations[hospital.hospitals?.name] || 0) + 1
      })
    }
  })

  // Language distribution
  const languageDistribution: { [key: string]: number } = {}
  doctors.forEach(doctor => {
    if (doctor.languages && Array.isArray(doctor.languages)) {
      doctor.languages.forEach((language: any) => {
        languageDistribution[language.name] = (languageDistribution[language.name] || 0) + 1
      })
    }
  })

  // Certification distribution
  const certificationDistribution: { [key: string]: number } = {}
  doctors.forEach(doctor => {
    if (doctor.certifications && Array.isArray(doctor.certifications)) {
      doctor.certifications.forEach((cert: any) => {
        certificationDistribution[cert.name] = (certificationDistribution[cert.name] || 0) + 1
      })
    }
  })

  // Registration trends (mock data for now)
  const registrationTrends = [
    { date: '2024-01', count: 5 },
    { date: '2024-02', count: 8 },
    { date: '2024-03', count: 12 },
    { date: '2024-04', count: 7 },
    { date: '2024-05', count: 15 },
    { date: '2024-06', count: 10 },
    { date: '2024-07', count: 18 },
    { date: '2024-08', count: 14 },
    { date: '2024-09', count: 20 },
    { date: '2024-10', count: 16 },
    { date: '2024-11', count: 22 },
    { date: '2024-12', count: 19 }
  ]

  return {
    totalDoctors,
    activeDoctors,
    averageRating,
    averageExperience,
    specializationDistribution,
    experienceDistribution,
    hospitalAssociations,
    languageDistribution,
    certificationDistribution,
    registrationTrends
  }
}

export default function DoctorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12months")
  
  // Fetch doctors data for analytics
  const { data: doctorsResponse, isLoading, refetch } = useDoctors({
    limit: 100, // Maximum allowed by API
    page: 1
  })

  // Extract doctors array from response
  const doctors = doctorsResponse?.data || []

  // Calculate analytics from real doctor data with memoization
  const analytics = useMemo(() => {
    return calculateDoctorAnalytics(doctors)
  }, [doctors])

  // Calculate most common specialization
  const mostCommonSpecialization = useMemo(() => {
    const specializations = analytics.specializationDistribution
    if (Object.keys(specializations).length === 0) return { specialization: 'N/A', count: 0 }
    
    const maxCount = Math.max(...Object.values(specializations))
    const mostCommon = Object.entries(specializations).find(([_, count]) => count === maxCount)
    return mostCommon ? { specialization: mostCommon[0], count: mostCommon[1] } : { specialization: 'N/A', count: 0 }
  }, [analytics.specializationDistribution])

  const refreshData = () => {
    refetch()
  }

  // Chart configurations for Recharts
  const specializationChartData = Object.entries(analytics.specializationDistribution)
    .map(([specialization, count], index) => ({
      name: specialization,
      value: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 specializations

  const specializationChartConfig: ChartConfig = Object.keys(analytics.specializationDistribution).reduce((config, specialization, index) => {
    config[specialization] = {
      label: specialization,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return config
  }, {} as ChartConfig)

  const experienceChartData = analytics.experienceDistribution.map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }))

  const experienceChartConfig: ChartConfig = {
    count: {
      label: "Number of Doctors",
      color: "hsl(var(--chart-1))",
    },
  }

  const hospitalChartData = Object.entries(analytics.hospitalAssociations)
    .map(([hospital, count], index) => ({
      name: hospital,
      value: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6 hospitals

  const hospitalChartConfig: ChartConfig = Object.keys(analytics.hospitalAssociations).reduce((config, hospital, index) => {
    config[hospital] = {
      label: hospital,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return config
  }, {} as ChartConfig)

  const languageChartData = Object.entries(analytics.languageDistribution)
    .map(([language, count], index) => ({
      name: language,
      value: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6 languages

  const languageChartConfig: ChartConfig = Object.keys(analytics.languageDistribution).reduce((config, language, index) => {
    config[language] = {
      label: language,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return config
  }, {} as ChartConfig)

  // Process registration trends data
  const trendsChartData = useMemo(() => {
    if (!analytics.registrationTrends || analytics.registrationTrends.length === 0) {
      return []
    }

    return analytics.registrationTrends
      .map(item => {
        const [year, month] = item.date.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          registrations: item.count,
          sortKey: item.date,
        }
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12)
  }, [analytics.registrationTrends])

  const trendsChartConfig: ChartConfig = {
    registrations: {
      label: "New Doctors",
      color: "hsl(var(--chart-1))",
    },
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
                  <BreadcrumbLink href="/doctors">
                    Doctors
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Doctor Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Doctor Analytics
              </h1>
              <p className="text-slate-600">
                Comprehensive doctor network insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Read-Only
              </Badge>
              <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Show skeleton loader when loading */}
          {isLoading ? (
            <AnalyticsPageSkeleton />
          ) : (
            <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-100 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Total Doctors</CardTitle>
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics.totalDoctors.toLocaleString()}</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+12.5%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics.averageRating.toFixed(1)}</div>
                <p className="text-xs text-slate-600">
                  out of 5.0 stars
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Avg Experience</CardTitle>
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics.averageExperience.toFixed(1)}</div>
                <p className="text-xs text-slate-600">
                  years of experience
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Specializations</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{Object.keys(analytics.specializationDistribution).length}</div>
                <p className="text-xs text-slate-600">
                  different specialties
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Specialization Distribution */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <PieChartIcon className="h-5 w-5" />
                  Specialization Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of doctors by medical specialization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={specializationChartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={specializationChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {specializationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Experience Distribution */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BarChart3 className="h-5 w-5" />
                  Experience Distribution
                </CardTitle>
                <CardDescription>
                  Number of doctors by years of experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={experienceChartConfig} className="h-[300px]">
                  <BarChart data={experienceChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="range"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.split(' ')[0]}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Hospital Associations */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Building2 className="h-5 w-5" />
                  Hospital Associations
                </CardTitle>
                <CardDescription>
                  Top hospitals by number of associated doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={hospitalChartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={hospitalChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {hospitalChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card className="border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <Languages className="h-5 w-5" />
                  Language Support
                </CardTitle>
                <CardDescription>
                  Most common languages spoken by doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={languageChartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={languageChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {languageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Registration Trends */}
          <div className="grid gap-6">
            <Card className="border-indigo-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <TrendingUp className="h-5 w-5" />
                  Registration Trends
                </CardTitle>
                <CardDescription>
                  Monthly doctor registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendsChartConfig} className="h-[300px]">
                  <AreaChart data={trendsChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <defs>
                      <linearGradient id="fillRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-registrations)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-registrations)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="registrations"
                      type="natural"
                      fill="url(#fillRegistrations)"
                      fillOpacity={0.4}
                      stroke="var(--color-registrations)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="flex items-center pt-4 text-sm">
                  <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 15.2% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="ml-auto text-muted-foreground">
                    Average: {trendsChartData.length > 0 ? Math.round(trendsChartData.reduce((sum, t) => sum + t.registrations, 0) / trendsChartData.length) : 0} per month
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights and Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Key Insights */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Activity className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>Important trends and observations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-50/50">
                  <p className="text-sm font-medium text-slate-900">Network Coverage</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalDoctors > 0 ? (
                      `${Object.keys(analytics.hospitalAssociations).length} hospitals covered with ${mostCommonSpecialization.specialization} being the most common specialty`
                    ) : (
                      'No doctor data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50/50">
                  <p className="text-sm font-medium text-slate-900">Experience Level</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalDoctors > 0 ? (
                      `Average experience of ${analytics.averageExperience.toFixed(1)} years with ${analytics.experienceDistribution.find(e => e.range === '16+ years')?.count || 0} senior doctors (16+ years)`
                    ) : (
                      'No experience data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50/50">
                  <p className="text-sm font-medium text-slate-900">Language Support</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalDoctors > 0 ? (
                      `${Object.keys(analytics.languageDistribution).length} languages supported across the network`
                    ) : (
                      'No language data available'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/doctors" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View All Doctors
                  </Button>
                </Link>
                <Link href="/doctors/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Add New Doctor
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </CardContent>
            </Card>
          </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
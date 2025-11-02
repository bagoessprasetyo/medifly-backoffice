"use client"

import { useState, useEffect } from "react"
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
  Users, 
  Calendar,
  Shield,
  Download,
  RefreshCw,
  Activity,
  Heart,
  Globe
} from "lucide-react"
import Link from "next/link"
import { DemographicsStats } from "@/lib/types"
import { usePatients } from "@/hooks/use-patients"
import { useMemo } from "react"
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
function calculateAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

function calculateDemographicsFromPatients(patients: any[]): DemographicsStats {
  if (!patients || patients.length === 0) {
    return {
      totalPatients: 0,
      genderDistribution: { male: 0, female: 0, other: 0 },
      ageDistribution: { '0-17': 0, '18-35': 0, '36-50': 0, '51-65': 0, '65+': 0 },
      religionDistribution: {},
      registrationTrends: []
    }
  }

  const totalPatients = patients.length
  
  // Gender distribution
  const genderDistribution = { male: 0, female: 0, other: 0 }
  
  // Age distribution
  const ageDistribution = { '0-17': 0, '18-35': 0, '36-50': 0, '51-65': 0, '65+': 0 }
  
  // Religion distribution
  const religionDistribution: { [key: string]: number } = {}
  
  // Registration trends by month
  const registrationByMonth: { [key: string]: number } = {}
  
  patients.forEach(patient => {
    // Gender
    const gender = patient.gender?.toLowerCase()
    if (gender === 'male') genderDistribution.male++
    else if (gender === 'female') genderDistribution.female++
    else genderDistribution.other++
    
    // Age
    if (patient.dob) {
      const age = calculateAge(patient.dob)
      if (age <= 17) ageDistribution['0-17']++
      else if (age <= 35) ageDistribution['18-35']++
      else if (age <= 50) ageDistribution['36-50']++
      else if (age <= 65) ageDistribution['51-65']++
      else ageDistribution['65+']++
    }
    
    // Religion
    if (patient.religion) {
      religionDistribution[patient.religion] = (religionDistribution[patient.religion] || 0) + 1
    }
    
    // Registration trends
    if (patient.created_date) {
      // Handle TIMESTAMP WITH TIME ZONE format properly
      const date = new Date(patient.created_date)
      if (!isNaN(date.getTime())) {
        // Use YYYY-MM format for consistent parsing
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const monthKey = `${year}-${month}`
        registrationByMonth[monthKey] = (registrationByMonth[monthKey] || 0) + 1
      }
    }
  })
  
  // Convert registration trends to array format
  const registrationTrends = Object.entries(registrationByMonth)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12) // Last 12 months
  
  return {
    totalPatients,
    genderDistribution,
    ageDistribution,
    religionDistribution,
    registrationTrends
  }
}

export default function PatientAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12months")
  
  // Fetch patients data for analytics
  // Note: API has a maximum limit of 100. For production, this should use
  // pagination to fetch all patients or a dedicated analytics API endpoint
  const { data: patientsResponse, isLoading, refetch } = usePatients({
    limit: 100, // Maximum allowed by API (was 10000, but API rejects >100)
    page: 1
  })

  // Extract patients array from response
  const patients = patientsResponse?.data || []

  // Calculate analytics from real patient data with memoization
  const analytics = useMemo(() => {
    return calculateDemographicsFromPatients(patients)
  }, [patients])

  // Calculate average age from patients
  const averageAge = useMemo(() => {
    if (!patients || patients.length === 0) return 0
    
    const validAges = patients
      .filter((patient: any) => patient.dob)
      .map((patient: any) => calculateAge(patient.dob))
    
    if (validAges.length === 0) return 0
    
    const sum = validAges.reduce((acc: number, age: number) => acc + age, 0)
    return Math.round((sum / validAges.length) * 10) / 10 // Round to 1 decimal
  }, [patients])

  // Calculate most common age range
  const mostCommonAgeRange = useMemo(() => {
    const ageRanges = analytics.ageDistribution
    const maxCount = Math.max(...Object.values(ageRanges))
    const mostCommonRange = Object.entries(ageRanges).find(([_, count]) => count === maxCount)
    return mostCommonRange ? { range: mostCommonRange[0], count: mostCommonRange[1] } : { range: '36-50', count: 0 }
  }, [analytics.ageDistribution])

  const refreshData = () => {
    refetch()
  }

  // Chart configurations for Recharts
  const genderChartData = [
    { name: 'Male', value: analytics.genderDistribution.male, fill: 'hsl(var(--chart-1))' },
    { name: 'Female', value: analytics.genderDistribution.female, fill: 'hsl(var(--chart-2))' },
    { name: 'Other', value: analytics.genderDistribution.other, fill: 'hsl(var(--chart-3))' },
  ]

  const genderChartConfig: ChartConfig = {
    Male: {
      label: "Male",
      color: "hsl(var(--chart-1))",
    },
    Female: {
      label: "Female", 
      color: "hsl(var(--chart-2))",
    },
    Other: {
      label: "Other",
      color: "hsl(var(--chart-3))",
    },
  }

  const ageChartData = Object.entries(analytics.ageDistribution).map(([ageGroup, count]) => ({
    ageGroup,
    count,
  }))

  const ageChartConfig: ChartConfig = {
    count: {
      label: "Number of Patients",
      color: "hsl(var(--chart-1))",
    },
  }

  const religionChartData = Object.entries(analytics.religionDistribution).map(([religion, count], index) => ({
    name: religion,
    value: count,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  const religionChartConfig: ChartConfig = Object.keys(analytics.religionDistribution).reduce((config, religion, index) => {
    config[religion] = {
      label: religion,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return config
  }, {} as ChartConfig)

  // Process real registration trends data from patient created_date
  const trendsChartData = useMemo(() => {
    // Always use real data from analytics.registrationTrends
    if (!analytics.registrationTrends || analytics.registrationTrends.length === 0) {
      return [] // Return empty array if no data, don't show fake data
    }

    return analytics.registrationTrends
      .map(item => {
        // The date format from calculateDemographicsFromPatients is "YYYY-MM" (e.g., "2024-01")
        // We need to parse this correctly and convert to display format
        const [year, month] = item.date.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1) // month is 0-indexed in Date constructor
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          registrations: item.count,
          sortKey: item.date, // Keep original for sorting
        }
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey)) // Sort by YYYY-MM format
      .slice(-12) // Show last 12 months
  }, [analytics.registrationTrends])

  const trendsChartConfig: ChartConfig = {
    registrations: {
      label: "New Registrations",
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
                  <BreadcrumbLink href="/patients">
                    Patients
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Demographics Analytics</BreadcrumbPage>
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
                Demographics Analytics
              </h1>
              <p className="text-slate-600">
                Interactive charts and demographic trend analysis
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
                <CardTitle className="text-sm font-medium text-slate-700">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics.totalPatients.toLocaleString()}</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+12.5%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Average Age</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{averageAge}</div>
                <p className="text-xs text-slate-600">
                  years old
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Gender Ratio</CardTitle>
                <Heart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round((analytics.genderDistribution.female / analytics.totalPatients) * 100)}% F
                </div>
                <p className="text-xs text-slate-600">
                  {Math.round((analytics.genderDistribution.male / analytics.totalPatients) * 100)}% Male, {Math.round((analytics.genderDistribution.female / analytics.totalPatients) * 100)}% Female
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Most Common Age</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{mostCommonAgeRange.range}</div>
                <p className="text-xs text-slate-600">
                  {mostCommonAgeRange.count} patients
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  Gender Distribution
                </CardTitle>
                <CardDescription>Patient distribution by gender</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={genderChartConfig} className="h-80">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={genderChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="40%"
                      outerRadius={70}
                    >
                      {genderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Age Distribution
                </CardTitle>
                <CardDescription>Patient count by age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ageChartConfig} className="h-64">
                  <BarChart data={ageChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="ageGroup"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Religion Distribution and Registration Trends */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Religion Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Religion Distribution
                </CardTitle>
                <CardDescription>Patient distribution by religious affiliation</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={religionChartConfig} className="h-80">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={religionChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="40%"
                      outerRadius={70}
                    >
                      {religionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Registration Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Registration Trends
                </CardTitle>
                <CardDescription>Monthly patient registration patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendsChartConfig} className="h-80">
                  <AreaChart
                    accessibilityLayer
                    data={trendsChartData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <ChartTooltip 
                      cursor={false} 
                      content={<ChartTooltipContent 
                        labelKey="month"
                        nameKey="registrations"
                        indicator="dot"
                      />} 
                    />
                    <Area
                      dataKey="registrations"
                      type="monotone"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="flex justify-between items-center mt-4 text-sm text-slate-600">
                  <span>Peak: {trendsChartData.length > 0 ? Math.max(...trendsChartData.map(t => t.registrations)) : 0} registrations</span>
                  <span>Average: {trendsChartData.length > 0 ? Math.round(trendsChartData.reduce((sum, t) => sum + t.registrations, 0) / trendsChartData.length) : 0} per month</span>
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
                  <TrendingUp className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>Demographic analysis highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50/50">
                  <p className="text-sm font-medium text-slate-900">Gender Balance</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalPatients > 0 ? (
                      `Female patients represent ${Math.round((analytics.genderDistribution.female / analytics.totalPatients) * 100)}% of the total population`
                    ) : (
                      'No patient data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50/50">
                  <p className="text-sm font-medium text-slate-900">Age Demographics</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalPatients > 0 ? (
                      `Most patients (${Math.round((mostCommonAgeRange.count / analytics.totalPatients) * 100)}%) fall in the ${mostCommonAgeRange.range} age range`
                    ) : (
                      'No age data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50/50">
                  <p className="text-sm font-medium text-slate-900">Religious Diversity</p>
                  <p className="text-xs text-slate-600">
                    Christian patients represent the largest group (40%), followed by Catholic (20%)
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50/50">
                  <p className="text-sm font-medium text-slate-900">Growth Trend</p>
                  <p className="text-xs text-slate-600">
                    Registration peaked in July with steady growth throughout the year
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
                <CardDescription>Navigate to related sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/patients/registry">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Patient Registry
                  </Button>
                </Link>
                <Link href="/patients/export">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics Data
                  </Button>
                </Link>
                <Link href="/patients">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Notice */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Privacy Notice: All analytics data is aggregated and anonymized. Individual patient information is not displayed in these charts.
                </span>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
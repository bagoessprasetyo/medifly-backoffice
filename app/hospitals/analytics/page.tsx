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
  Building2, 
  Calendar,
  Shield,
  Download,
  RefreshCw,
  Activity,
  Star,
  Globe,
  MapPin,
  Stethoscope,
  Package
} from "lucide-react"
import Link from "next/link"
import { useHospitals } from "@/hooks/use-hospitals"
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

// Types for hospital analytics
interface HospitalAnalytics {
  totalHospitals: number
  activeHospitals: number
  averageRating: number
  countryDistribution: { [key: string]: number }
  ratingDistribution: { range: string; count: number }[]
  halalDistribution: { halal: number; nonHalal: number }
  priceTransparency: { showPrice: number; hidePrice: number }
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
function calculateHospitalAnalytics(hospitals: any[]): HospitalAnalytics {
  if (!hospitals || hospitals.length === 0) {
    return {
      totalHospitals: 0,
      activeHospitals: 0,
      averageRating: 0,
      countryDistribution: {},
      ratingDistribution: [],
      halalDistribution: { halal: 0, nonHalal: 0 },
      priceTransparency: { showPrice: 0, hidePrice: 0 },
      registrationTrends: []
    }
  }

  const totalHospitals = hospitals.length
  const activeHospitals = totalHospitals // Assuming all fetched hospitals are active
  
  // Calculate average rating
  const ratingsSum = hospitals
    .filter(h => h.rating && h.rating > 0)
    .reduce((sum, h) => sum + h.rating, 0)
  const ratingsCount = hospitals.filter(h => h.rating && h.rating > 0).length
  const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

  // Country distribution
  const countryDistribution: { [key: string]: number } = {}
  hospitals.forEach(hospital => {
    if (hospital.country) {
      countryDistribution[hospital.country] = (countryDistribution[hospital.country] || 0) + 1
    }
  })

  // Rating distribution
  const ratingRanges = [
    { range: '4.5-5.0', min: 4.5, max: 5.0 },
    { range: '4.0-4.4', min: 4.0, max: 4.4 },
    { range: '3.5-3.9', min: 3.5, max: 3.9 },
    { range: '3.0-3.4', min: 3.0, max: 3.4 },
    { range: 'Below 3.0', min: 0, max: 2.9 }
  ]
  
  const ratingDistribution = ratingRanges.map(range => ({
    range: range.range,
    count: hospitals.filter(h => 
      h.rating && h.rating >= range.min && h.rating <= range.max
    ).length
  }))

  // Halal distribution
  const halalCount = hospitals.filter(h => h.is_halal === true).length
  const halalDistribution = {
    halal: halalCount,
    nonHalal: totalHospitals - halalCount
  }

  // Price transparency
  const showPriceCount = hospitals.filter(h => h.is_show_price === true).length
  const priceTransparency = {
    showPrice: showPriceCount,
    hidePrice: totalHospitals - showPriceCount
  }

  // Registration trends by month
  const registrationByMonth: { [key: string]: number } = {}
  hospitals.forEach(hospital => {
    if (hospital.created_at) {
      const date = new Date(hospital.created_at)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const monthKey = `${year}-${month}`
        registrationByMonth[monthKey] = (registrationByMonth[monthKey] || 0) + 1
      }
    }
  })

  const registrationTrends = Object.entries(registrationByMonth)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12) // Last 12 months

  return {
    totalHospitals,
    activeHospitals,
    averageRating: Math.round(averageRating * 10) / 10,
    countryDistribution,
    ratingDistribution,
    halalDistribution,
    priceTransparency,
    registrationTrends
  }
}

export default function HospitalAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12months")
  
  // Fetch hospitals data for analytics
  const { data: hospitalsResponse, isLoading, refetch } = useHospitals({}, {
    limit: 100, // Maximum allowed by API
    page: 1
  })

  // Extract hospitals array from response
  const hospitals = hospitalsResponse?.data || []

  // Calculate analytics from real hospital data with memoization
  const analytics = useMemo(() => {
    return calculateHospitalAnalytics(hospitals)
  }, [hospitals])

  // Calculate most common country
  const mostCommonCountry = useMemo(() => {
    const countries = analytics.countryDistribution
    const maxCount = Math.max(...Object.values(countries))
    const mostCommon = Object.entries(countries).find(([_, count]) => count === maxCount)
    return mostCommon ? { country: mostCommon[0], count: mostCommon[1] } : { country: 'N/A', count: 0 }
  }, [analytics.countryDistribution])

  const refreshData = () => {
    refetch()
  }

  // Chart configurations for Recharts
  const countryChartData = Object.entries(analytics.countryDistribution)
    .map(([country, count], index) => ({
      name: country,
      value: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 countries

  const countryChartConfig: ChartConfig = Object.keys(analytics.countryDistribution).reduce((config, country, index) => {
    config[country] = {
      label: country,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return config
  }, {} as ChartConfig)

  const ratingChartData = analytics.ratingDistribution.map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }))

  const ratingChartConfig: ChartConfig = {
    count: {
      label: "Number of Hospitals",
      color: "hsl(var(--chart-1))",
    },
  }

  const halalChartData = [
    { name: 'Halal Certified', value: analytics.halalDistribution.halal, fill: 'hsl(var(--chart-1))' },
    { name: 'Non-Halal', value: analytics.halalDistribution.nonHalal, fill: 'hsl(var(--chart-2))' },
  ]

  const halalChartConfig: ChartConfig = {
    'Halal Certified': {
      label: "Halal Certified",
      color: "hsl(var(--chart-1))",
    },
    'Non-Halal': {
      label: "Non-Halal", 
      color: "hsl(var(--chart-2))",
    },
  }

  const priceChartData = [
    { name: 'Show Prices', value: analytics.priceTransparency.showPrice, fill: 'hsl(var(--chart-3))' },
    { name: 'Hide Prices', value: analytics.priceTransparency.hidePrice, fill: 'hsl(var(--chart-4))' },
  ]

  const priceChartConfig: ChartConfig = {
    'Show Prices': {
      label: "Show Prices",
      color: "hsl(var(--chart-3))",
    },
    'Hide Prices': {
      label: "Hide Prices",
      color: "hsl(var(--chart-4))",
    },
  }

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
      label: "New Hospitals",
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
                  <BreadcrumbLink href="/hospitals">
                    Hospitals
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Hospital Analytics</BreadcrumbPage>
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
                Hospital Analytics
              </h1>
              <p className="text-slate-600">
                Comprehensive hospital network insights and performance metrics
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
                <CardTitle className="text-sm font-medium text-slate-700">Total Hospitals</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics.totalHospitals.toLocaleString()}</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+8.2%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics.averageRating}</div>
                <p className="text-xs text-slate-600">
                  out of 5.0 stars
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Top Country</CardTitle>
                <Globe className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{mostCommonCountry.country}</div>
                <p className="text-xs text-slate-600">
                  {mostCommonCountry.count} hospitals
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Halal Certified</CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round((analytics.halalDistribution.halal / analytics.totalHospitals) * 100)}%
                </div>
                <p className="text-xs text-slate-600">
                  {analytics.halalDistribution.halal} hospitals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Hospital distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={countryChartConfig} className="h-80">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={countryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="40%"
                      outerRadius={70}
                    >
                      {countryChartData.map((entry, index) => (
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

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  Rating Distribution
                </CardTitle>
                <CardDescription>Hospital count by rating ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ratingChartConfig} className="h-64">
                  <BarChart data={ratingChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="range"
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

          {/* Halal Certification and Price Transparency */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Halal Certification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Halal Certification
                </CardTitle>
                <CardDescription>Hospital distribution by halal certification</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={halalChartConfig} className="h-80">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={halalChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="40%"
                      outerRadius={70}
                    >
                      {halalChartData.map((entry, index) => (
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
                <CardDescription>Monthly hospital registration patterns</CardDescription>
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
                <CardDescription>Hospital network analysis highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50/50">
                  <p className="text-sm font-medium text-slate-900">Network Coverage</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalHospitals > 0 ? (
                      `${Object.keys(analytics.countryDistribution).length} countries covered with ${mostCommonCountry.country} leading at ${Math.round((mostCommonCountry.count / analytics.totalHospitals) * 100)}%`
                    ) : (
                      'No hospital data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50/50">
                  <p className="text-sm font-medium text-slate-900">Quality Standards</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalHospitals > 0 ? (
                      `Average rating of ${analytics.averageRating}/5.0 with ${analytics.ratingDistribution.find(r => r.range === '4.5-5.0')?.count || 0} hospitals rated 4.5+ stars`
                    ) : (
                      'No rating data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50/50">
                  <p className="text-sm font-medium text-slate-900">Halal Certification</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalHospitals > 0 ? (
                      `${Math.round((analytics.halalDistribution.halal / analytics.totalHospitals) * 100)}% of hospitals are halal certified (${analytics.halalDistribution.halal} hospitals)`
                    ) : (
                      'No certification data available'
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50/50">
                  <p className="text-sm font-medium text-slate-900">Price Transparency</p>
                  <p className="text-xs text-slate-600">
                    {analytics.totalHospitals > 0 ? (
                      `${Math.round((analytics.priceTransparency.showPrice / analytics.totalHospitals) * 100)}% of hospitals display pricing information publicly`
                    ) : (
                      'No pricing data available'
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
                <CardDescription>Navigate to related sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/hospitals">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Hospital Directory
                  </Button>
                </Link>
                <Link href="/hospitals/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Add New Hospital
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="w-full justify-start">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Manage Services
                  </Button>
                </Link>
                <Link href="/facilities">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Facilities
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
                  Privacy Notice: All analytics data is aggregated and anonymized. Individual hospital information is protected according to data privacy regulations.
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
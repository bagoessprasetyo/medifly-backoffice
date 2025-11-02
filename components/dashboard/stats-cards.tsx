'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, User, Users, FileText } from "lucide-react"
import { StatsCardSkeleton } from "./dashboard-skeleton"

// Type definitions
interface StatItem {
  count: number
  change: string
}

interface StatsData {
  hospitals: StatItem
  doctors: StatItem
  patients: StatItem
  content: StatItem
}

// Simulate data fetching
const fetchStatsData = (): StatsData => {
  return {
    hospitals: { count: 24, change: "+2" },
    doctors: { count: 156, change: "+12" },
    patients: { count: 2847, change: "+89" },
    content: { count: 73, change: "+5" }
  }
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate immediate data loading (no artificial delay)
    const data = fetchStatsData()
    setStats(data)
    setIsLoading(false)
  }, [])

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-blue-100 bg-blue-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Hospitals</CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{stats.hospitals.count}</div>
          <p className="text-xs text-slate-600">
            <span className="text-green-600">{stats.hospitals.change}</span> from last month
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-mint-100 bg-mint-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Active Doctors</CardTitle>
          <User className="h-4 w-4 text-mint-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{stats.doctors.count}</div>
          <p className="text-xs text-slate-600">
            <span className="text-green-600">{stats.doctors.change}</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-100 bg-purple-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Registered Patients</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{stats.patients.count}</div>
          <p className="text-xs text-slate-600">
            <span className="text-green-600">{stats.patients.change}</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-orange-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Published Content</CardTitle>
          <FileText className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{stats.content.count}</div>
          <p className="text-xs text-slate-600">
            <span className="text-green-600">{stats.content.change}</span> from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
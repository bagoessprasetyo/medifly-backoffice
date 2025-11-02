'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { ActivityFeedSkeleton } from "./dashboard-skeleton"

// Type definitions
interface ActivityItem {
  id: number
  type: string
  title: string
  description: string
  time: string
  color: string
}

// Simulate data fetching
const fetchActivityData = (): ActivityItem[] => {
  return [
    {
      id: 1,
      type: "doctor",
      title: "New doctor profile created",
      description: "Dr. Sarah Johnson - Cardiology",
      time: "2 min ago",
      color: "green"
    },
    {
      id: 2,
      type: "content",
      title: "Content published",
      description: '"Managing Diabetes: A Complete Guide"',
      time: "15 min ago",
      color: "blue"
    },
    {
      id: 3,
      type: "hospital",
      title: "Hospital information updated",
      description: "City General Hospital - Contact details",
      time: "1 hour ago",
      color: "purple"
    }
  ]
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate immediate data loading (no artificial delay)
    const data = fetchActivityData()
    setActivities(data)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <ActivityFeedSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates across your CMS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-slate-600">{activity.description}</p>
            </div>
            <span className="text-xs text-slate-500">{activity.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
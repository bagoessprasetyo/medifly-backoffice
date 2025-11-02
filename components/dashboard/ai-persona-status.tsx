'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { AIPersonaStatusSkeleton } from "./dashboard-skeleton"

// Type definitions
interface AIPersonaData {
  systemStatus: string
  responseAccuracy: number
  trainingDataCoverage: number
}

// Simulate data fetching
const fetchAIPersonaData = (): AIPersonaData => {
  return {
    systemStatus: "operational",
    responseAccuracy: 94.2,
    trainingDataCoverage: 87.5
  }
}

export function AIPersonaStatus() {
  const [data, setData] = useState<AIPersonaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate immediate data loading (no artificial delay)
    const aiData = fetchAIPersonaData()
    setData(aiData)
    setIsLoading(false)
  }, [])

  if (isLoading || !data) {
    return <AIPersonaStatusSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-mint-600" />
          AI Persona Status
        </CardTitle>
        <CardDescription>Current AI configuration and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div>
            <p className="text-sm font-medium text-green-800">System Status</p>
            <p className="text-xs text-green-600">All systems operational</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Response Accuracy</span>
            <span className="font-medium">{data.responseAccuracy}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-mint-500 h-2 rounded-full" 
              style={{ width: `${data.responseAccuracy}%` }}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Training Data Coverage</span>
            <span className="font-medium">{data.trainingDataCoverage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${data.trainingDataCoverage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
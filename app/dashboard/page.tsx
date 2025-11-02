
"use client"
import { Suspense } from "react"
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
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { AIPersonaStatus } from "@/components/dashboard/ai-persona-status"
import { 
  StatsCardSkeleton, 
  ActivityFeedSkeleton, 
  AIPersonaStatusSkeleton 
} from "@/components/dashboard/dashboard-skeleton"

export default function Page() {
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Welcome Section */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-mint-50 p-6 border border-blue-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Medifly.AI CMS</h1>
            <p className="text-slate-600">Manage your healthcare content, providers, and AI persona configuration from this central dashboard.</p>
          </div>

          {/* Stats Cards */}
          <Suspense fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          }>
            <StatsCards />
          </Suspense>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Suspense fallback={<ActivityFeedSkeleton />}>
              <ActivityFeed />
            </Suspense>

            {/* AI Persona Status */}
            <Suspense fallback={<AIPersonaStatusSkeleton />}>
              <AIPersonaStatus />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  FileText,
  Bot,
  ClipboardList,
  Settings2,
  Activity,
  Heart,
  Wrench,
  Package,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"

// Medifly.AI CMS navigation data
const data = {
  teams: [
    {
      name: "Medifly.AI",
      logo: Heart,
      plan: "CMS Dashboard",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "Hospitals",
      url: "/hospitals",
      icon: Building2,
      items: [
        {
          title: "All Hospitals",
          url: "/hospitals",
        },
        {
          title: "Add Hospital",
          url: "/hospitals/new",
        },
        {
          title: "Hospital Analytics",
          url: "/hospitals/analytics",
        },
      ],
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: Stethoscope,
      items: [
        {
          title: "Doctor Registry",
          url: "/doctors",
        },
        {
          title: "Add Doctor",
          url: "/doctors/new",
        },
        {
          title: "Doctor Analytics",
          url: "/doctors/analytics",
        },
      ],
    },
    {
      title: "Patients",
      url: "/patients",
      icon: Users,
      items: [
        {
          title: "Dashboard",
          url: "/patients",
        },
        {
          title: "Patient Registry",
          url: "/patients/registry",
        },
        {
          title: "Analytics",
          url: "/patients/analytics",
        },
        {
          title: "Export Center",
          url: "/patients/export",
        },
      ],
    },
    {
      title: "Content",
      url: "/content",
      icon: FileText,
      items: [
        {
          title: "All Content",
          url: "/content",
        },
        {
          title: "Create Content",
          url: "/content/new",
        },
        {
          title: "Categories",
          url: "/content/categories",
        },
        {
          title: "Published",
          url: "/content/published",
        },
      ],
    },
    {
      title: "AI Persona",
      url: "/ai-persona",
      icon: Bot,
      items: [
        {
          title: "Persona Config",
          url: "/ai-persona",
        },
        {
          title: "Voice Settings",
          url: "/ai-persona/voice",
        },
        {
          title: "Training Data",
          url: "/ai-persona/training",
        },
      ],
    },
    {
      title: "Facilities",
      url: "/facilities",
      icon: Wrench,
      items: [
        {
          title: "All Facilities",
          url: "/facilities",
        },
      ],
    },
    {
      title: "Services",
      url: "/services",
      icon: Stethoscope,
      items: [
        {
          title: "All Services",
          url: "/services",
        },
      ],
    },
    {
      title: "Packages",
      url: "/packages",
      icon: Package,
      items: [
        {
          title: "All Packages",
          url: "/packages",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Audit Logs",
      url: "/audit-logs",
      icon: ClipboardList,
    },
    {
      name: "System Health",
      url: "/system",
      icon: Activity,
    },
    {
      name: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.email?.split('@')[0] || "User",
    email: user?.email || "user@medifly.ai",
    avatar: "/avatars/user.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

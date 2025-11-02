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
import { Building2, Stethoscope, User, Users, FileText, Activity, TrendingUp } from "lucide-react"

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-100 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Total Hospitals</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">24</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+2</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-mint-100 bg-mint-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Active Doctors</CardTitle>
                <User className="h-4 w-4 text-mint-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">156</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+12</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Registered Patients</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">2,847</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+89</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Published Content</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">73</div>
                <p className="text-xs text-slate-600">
                  <span className="text-green-600">+5</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates across your CMS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New doctor profile created</p>
                    <p className="text-xs text-slate-600">Dr. Sarah Johnson - Cardiology</p>
                  </div>
                  <span className="text-xs text-slate-500">2 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Content published</p>
                    <p className="text-xs text-slate-600">"Managing Diabetes: A Complete Guide"</p>
                  </div>
                  <span className="text-xs text-slate-500">15 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Hospital information updated</p>
                    <p className="text-xs text-slate-600">City General Hospital - Contact details</p>
                  </div>
                  <span className="text-xs text-slate-500">1 hour ago</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Persona Status */}
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
                    <span className="font-medium">94.2%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-mint-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Training Data Coverage</span>
                    <span className="font-medium">87.5%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

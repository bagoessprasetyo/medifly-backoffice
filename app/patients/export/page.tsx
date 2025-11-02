"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { 
  Download, 
  Shield, 
  FileText, 
  Database,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Filter,
  Settings,
  Lock,
  Eye,
  FileSpreadsheet,
  FileImage
} from "lucide-react"
import { ExportConfig } from "@/lib/types"

// ...

// Add a local interface for the export config used in this component
interface LocalExportConfig {
  format: "csv" | "json" | "pdf"
  fields: string[]
  filters: {
    dateRange: string
    ageRange: string
    sex: string
    religion: string
  }
  includeHeaders: boolean
  anonymize: boolean
  reason: string
  requestedBy: string
}

export default function PatientExportPage() {
  const [exportConfig, setExportConfig] = useState<LocalExportConfig>({
    format: "csv",
    fields: ["name", "email", "sex", "age", "religion"],
    filters: {
      dateRange: "",
      ageRange: "",
      sex: "",
      religion: ""
    },
    includeHeaders: true,
    anonymize: false,
    reason: "",
    requestedBy: ""
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const availableFields = [
    { id: "name", label: "Full Name", sensitive: true },
    { id: "email", label: "Email Address", sensitive: true },
    { id: "address", label: "Address", sensitive: true },
    { id: "sex", label: "Gender", sensitive: false },
    { id: "age", label: "Age", sensitive: false },
    { id: "dob", label: "Date of Birth", sensitive: true },
    { id: "religion", label: "Religion", sensitive: false },
    { id: "created_at", label: "Registration Date", sensitive: false }
  ]

  const handleFieldToggle = (fieldId: string) => {
    setExportConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setExportConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }))
  }

  const handleExport = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the privacy and compliance terms before exporting.")
      return
    }

    if (!exportConfig.reason.trim()) {
      alert("Please provide a reason for this data export.")
      return
    }

    if (!exportConfig.requestedBy.trim()) {
      alert("Please provide your name as the requester.")
      return
    }

    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsExporting(false)
    setExportComplete(true)
    
    // Reset after 5 seconds
    setTimeout(() => {
      setExportComplete(false)
    }, 5000)
  }

  const getEstimatedRecords = () => {
    // Mock calculation based on filters
    let base = 2847
    if (exportConfig.filters.sex) base = Math.floor(base * 0.5)
    if (exportConfig.filters.ageRange) base = Math.floor(base * 0.3)
    if (exportConfig.filters.religion) base = Math.floor(base * 0.4)
    if (exportConfig.filters.dateRange) base = Math.floor(base * 0.2)
    return base
  }

  const getSensitiveFieldsCount = () => {
    return exportConfig.fields.filter(fieldId => 
      availableFields.find(f => f.id === fieldId)?.sensitive
    ).length
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
                  <BreadcrumbPage>Export Center</BreadcrumbPage>
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
                <Download className="h-6 w-6 text-blue-600" />
                Patient Data Export Center
              </h1>
              <p className="text-slate-600">
                Secure data export with privacy compliance and audit logging
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                <Lock className="h-3 w-3 mr-1" />
                Restricted Access
              </Badge>
              <Badge variant="outline" className="border-amber-200 text-amber-700">
                <Shield className="h-3 w-3 mr-1" />
                HIPAA Compliant
              </Badge>
            </div>
          </div>

          {/* Export Status */}
          {exportComplete && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Export Completed Successfully</AlertTitle>
              <AlertDescription className="text-green-700">
                Your patient data export has been generated and logged for audit purposes. 
                The file has been downloaded to your device.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Export Format
                  </CardTitle>
                  <CardDescription>Choose the format for your data export</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        exportConfig.format === 'csv' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setExportConfig(prev => ({ ...prev, format: 'csv' }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <span className="font-medium">CSV</span>
                      </div>
                      <p className="text-xs text-slate-600">Comma-separated values, compatible with Excel</p>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        exportConfig.format === 'json' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setExportConfig(prev => ({ ...prev, format: 'json' }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">JSON</span>
                      </div>
                      <p className="text-xs text-slate-600">JavaScript Object Notation, for developers</p>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        exportConfig.format === 'pdf' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setExportConfig(prev => ({ ...prev, format: 'pdf' }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileImage className="h-5 w-5 text-red-600" />
                        <span className="font-medium">PDF</span>
                      </div>
                      <p className="text-xs text-slate-600">Portable Document Format, for reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Field Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    Field Selection
                  </CardTitle>
                  <CardDescription>Choose which patient data fields to include</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {availableFields.map((field) => (
                      <div key={field.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={field.id}
                          checked={exportConfig.fields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label 
                          htmlFor={field.id} 
                          className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                        >
                          {field.label}
                          {field.sensitive && (
                            <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                              <Lock className="h-2 w-2 mr-1" />
                              Sensitive
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {getSensitiveFieldsCount()} sensitive fields selected
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Sensitive fields require additional justification and will be logged for audit purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    Data Filters
                  </CardTitle>
                  <CardDescription>Apply filters to limit the exported data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="dateRange" className="text-sm font-medium">Date Range</Label>
                      <Select value={exportConfig.filters.dateRange || "all"} onValueChange={(value) => handleFilterChange("dateRange", value === "all" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All dates" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All dates</SelectItem>
                          <SelectItem value="last30days">Last 30 days</SelectItem>
                          <SelectItem value="last3months">Last 3 months</SelectItem>
                          <SelectItem value="last6months">Last 6 months</SelectItem>
                          <SelectItem value="lastyear">Last year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ageRange" className="text-sm font-medium">Age Range</Label>
                      <Select value={exportConfig.filters.ageRange || "all"} onValueChange={(value) => handleFilterChange("ageRange", value === "all" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All ages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ages</SelectItem>
                          <SelectItem value="18-35">18-35 years</SelectItem>
                          <SelectItem value="36-50">36-50 years</SelectItem>
                          <SelectItem value="51-65">51-65 years</SelectItem>
                          <SelectItem value="65+">65+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sex" className="text-sm font-medium">Gender</Label>
                      <Select value={exportConfig.filters.sex || "all"} onValueChange={(value) => handleFilterChange("sex", value === "all" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All genders" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All genders</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="religion" className="text-sm font-medium">Religion</Label>
                      <Select value={exportConfig.filters.religion || "all"} onValueChange={(value) => handleFilterChange("religion", value === "all" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All religions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All religions</SelectItem>
                          <SelectItem value="Christian">Christian</SelectItem>
                          <SelectItem value="Catholic">Catholic</SelectItem>
                          <SelectItem value="Protestant">Protestant</SelectItem>
                          <SelectItem value="Buddhist">Buddhist</SelectItem>
                          <SelectItem value="Jewish">Jewish</SelectItem>
                          <SelectItem value="Muslim">Muslim</SelectItem>
                          <SelectItem value="Hindu">Hindu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Justification */}
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Shield className="h-5 w-5" />
                    Export Justification
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    Required for compliance and audit purposes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="requestedBy" className="text-sm font-medium">Requested By</Label>
                    <Input
                      id="requestedBy"
                      placeholder="Your full name"
                      value={exportConfig.requestedBy}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, requestedBy: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reason" className="text-sm font-medium">Reason for Export</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a detailed justification for this data export..."
                      value={exportConfig.reason}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymize"
                      checked={exportConfig.anonymize}
                      onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, anonymize: checked as boolean }))}
                    />
                    <Label htmlFor="anonymize" className="text-sm">
                      Anonymize sensitive data (recommended for research purposes)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Export Summary
                  </CardTitle>
                  <CardDescription>Review your export configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Format:</span>
                      <Badge variant="outline">{exportConfig.format.toUpperCase()}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Fields:</span>
                      <Badge variant="outline">{exportConfig.fields.length} selected</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Estimated records:</span>
                      <Badge variant="outline">{getEstimatedRecords().toLocaleString()}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Sensitive fields:</span>
                      <Badge variant={getSensitiveFieldsCount() > 0 ? "destructive" : "secondary"}>
                        {getSensitiveFieldsCount()}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Active Filters:</h4>
                    {Object.entries(exportConfig.filters).filter(([_, value]) => value).length === 0 ? (
                      <p className="text-xs text-slate-500">No filters applied</p>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(exportConfig.filters)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="capitalize text-slate-600">{key}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Compliance */}
              <Card className="border-red-200 bg-red-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Lock className="h-5 w-5" />
                    Privacy Compliance
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    Please review and agree to the terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-red-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>All exports are logged for audit purposes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>Data must be used in compliance with HIPAA regulations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>Exported data must be securely stored and disposed of</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-red-600" />
                      <span>Unauthorized sharing is strictly prohibited</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm text-red-800">
                      I agree to the privacy and compliance terms
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Export Button */}
              <Button 
                onClick={handleExport}
                disabled={isExporting || !agreedToTerms || exportConfig.fields.length === 0}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Exporting Data...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Patient Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-600" />
                Recent Exports
              </CardTitle>
              <CardDescription>History of recent data exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Demographics Report - CSV</p>
                      <p className="text-xs text-slate-600">1,247 records • Dr. Sarah Johnson</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">2 hours ago</p>
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      Completed
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Patient Registry - JSON</p>
                      <p className="text-xs text-slate-600">2,847 records • Admin User</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">1 day ago</p>
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      Completed
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <FileImage className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Analytics Report - PDF</p>
                      <p className="text-xs text-slate-600">Summary data • Dr. Michael Chen</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">3 days ago</p>
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      Completed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
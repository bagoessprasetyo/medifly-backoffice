'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Download, RefreshCw, ChevronUp, ChevronDown, MoreHorizontal, Users, Calendar, MapPin, Heart, AlertCircle, Plus, Eye, Edit, Trash2, Loader2, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePatients, usePatientsFilterOptions, type PatientsParams, type PatientWithAge } from '@/hooks/use-patients'
import { useDebounce } from '@/hooks/use-debounce'
import { PatientTableSkeleton, PatientFiltersSkeleton } from '@/components/patients/patient-registry-skeleton'
import { toast } from 'sonner'

interface PatientFilters {
  search: string
  gender: string
  ageRange: string
  religion: string
  status: string
}

type PatientActionType = "view" | "edit" | "delete"

export default function PatientRegistryPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    gender: 'all',
    ageRange: 'all',
    religion: 'all',
    status: 'all'
  })
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pendingAction, setPendingAction] = useState<{ id: string; type: PatientActionType } | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAge | null>(null)

  // Debounce search input for performance
  const debouncedSearch = useDebounce(filters.search, 300)

  // Prepare API parameters
  const apiParams = useMemo((): PatientsParams => {
    const params: PatientsParams = {
      page: currentPage,
      limit: itemsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
    }

    if (debouncedSearch) params.search = debouncedSearch
    if (filters.gender && filters.gender !== 'all') params.gender = filters.gender
    if (filters.religion && filters.religion !== 'all') params.religion = filters.religion
    
    // Convert age range to date range for API
    if (filters.ageRange && filters.ageRange !== 'all') {
      const currentYear = new Date().getFullYear()
      let minYear, maxYear
      switch (filters.ageRange) {
        case "18-35":
          minYear = currentYear - 35
          maxYear = currentYear - 18
          break
        case "36-50":
          minYear = currentYear - 50
          maxYear = currentYear - 36
          break
        case "51-65":
          minYear = currentYear - 65
          maxYear = currentYear - 51
          break
        case "65+":
          minYear = 1900
          maxYear = currentYear - 65
          break
        default:
          break
      }
      if (minYear && maxYear) {
        params.dateRange = `${minYear}-01-01,${maxYear}-12-31`
      }
    }

    return params
  }, [currentPage, itemsPerPage, sortBy, sortOrder, debouncedSearch, filters])

  // Fetch patients data
  const { 
    data: patientsData, 
    patients, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = usePatients(apiParams)

  // Get filter options
  const filterOptions = usePatientsFilterOptions()

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof PatientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      gender: 'all',
      ageRange: 'all',
      religion: 'all',
      status: 'all'
    })
    setCurrentPage(1)
  }, [])

  // Handle data refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast.success('Patient data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh patient data')
    }
  }, [refetch])

  // Handle sort
  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }, [sortBy])

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load patient data')
    }
  }, [error])

  // Calculate pagination info
  const totalPages = patientsData?.totalPages || 0
  const totalCount = patientsData?.count || 0

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get gender badge color
  const getGenderBadgeColor = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'female':
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    }
  }

  // Calculate age from date of birth
  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Check if any filters are active
  const hasActiveFilters = filters.search || (filters.gender !== 'all') || (filters.ageRange !== 'all') || (filters.religion !== 'all')
  
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.gender !== 'all') count++
    if (filters.ageRange !== 'all') count++
    if (filters.religion !== 'all') count++
    return count
  }

  // Patient action handlers
  const isPatientActionPending = (action: PatientActionType, patientId: string) =>
    pendingAction?.id === patientId && pendingAction.type === action

  const isPatientBusy = (patientId: string) => pendingAction?.id === patientId

  const handlePatientAction = (patient: PatientWithAge, actionType: PatientActionType) => {
    setPendingAction({ id: patient.id, type: actionType })
    setTimeout(() => {
      setPendingAction(null)
      switch (actionType) {
        case 'view':
          setSelectedPatient(patient)
          setIsSheetOpen(true)
          break
        case 'edit':
          toast.info(`Edit functionality for ${patient.name} coming soon`)
          break
        case 'delete':
          toast.info(`Delete functionality for ${patient.name} coming soon`)
          break
      }
    }, 500)
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
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Registry</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">

        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Patient Registry
            </h1>
            <p className="text-sm text-gray-600">
              Manage and view all registered patients in your system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isRefetching) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error.message || 'Failed to load patient data. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation and Content */}
        <Tabs value={filters.status} onValueChange={(value) => handleFilterChange('status', value)} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg h-10">
            <TabsTrigger 
              value="all" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              All Status
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="inactive" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Inactive
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              New
            </TabsTrigger>
            <TabsTrigger 
              value="archived" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Archived
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value={filters.status} className="mt-6 space-y-4">
            {/* Unified Filter Bar */}
            {isLoading ? (
              <PatientFiltersSkeleton />
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-3">
                  <Select
                    value={filters.gender}
                    onValueChange={(value) => handleFilterChange('gender', value)}
                  >
                    <SelectTrigger className="w-32 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="All Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gender</SelectItem>
                      {filterOptions.genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.ageRange}
                    onValueChange={(value) => handleFilterChange('ageRange', value)}
                  >
                    <SelectTrigger className="w-32 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="All Age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Age</SelectItem>
                      {filterOptions.ageRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.religion}
                    onValueChange={(value) => handleFilterChange('religion', value)}
                  >
                    <SelectTrigger className="w-36 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="All Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Religion</SelectItem>
                      {filterOptions.religions.map((religion) => (
                        <SelectItem key={religion || ''} value={religion || ''}>
                          {religion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Patient Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="p-6">
                  <PatientTableSkeleton rows={itemsPerPage} />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50">
                        <TableHead 
                          className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Patient Name</span>
                            {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Shipper</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Type</TableHead>
                        <TableHead 
                          className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                          onClick={() => handleSort('gender')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Gender</span>
                            {getSortIcon('gender')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                          onClick={() => handleSort('age')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Age</span>
                            {getSortIcon('age')}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Religion</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients && patients.length > 0 ? (
                        patients.map((patient) => (
                          <TableRow key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                   <span className="text-sm font-medium text-blue-600">
                                     {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                   </span>
                                 </div>
                                 <div>
                                   <div className="font-medium text-gray-900">{patient.name || 'Unknown'}</div>
                                   <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
                                 </div>
                               </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-sm text-gray-900">{patient.address || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge 
                                variant="outline" 
                                className="bg-orange-50 text-orange-600 border-orange-200 font-medium"
                              >
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex gap-1">
                                <Badge 
                                  variant="outline" 
                                  className="bg-blue-50 text-blue-600 border-blue-200 font-medium text-xs"
                                >
                                  Patient
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="bg-yellow-50 text-yellow-600 border-yellow-200 font-medium text-xs"
                                >
                                  Regular
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                               <Badge 
                                 variant="outline" 
                                 className={`${getGenderBadgeColor(patient.gender || '')} font-medium`}
                               >
                                 {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown'}
                               </Badge>
                             </TableCell>
                            <TableCell className="py-4 px-6">
                              <span className="font-medium text-gray-900">{patient.age}</span>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">
                                {patient.religion}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                        onClick={() => handlePatientAction(patient, 'view')}
                                        disabled={isPatientBusy(patient.id)}
                                      >
                                        {isPatientActionPending('view', patient.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View patient details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                        onClick={() => handlePatientAction(patient, 'edit')}
                                        disabled={isPatientBusy(patient.id)}
                                      >
                                        {isPatientActionPending('edit', patient.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Edit className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit patient information</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handlePatientAction(patient, 'delete')}
                                        disabled={isPatientBusy(patient.id)}
                                      >
                                        {isPatientActionPending('delete', patient.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete patient</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="p-3 bg-gray-100 rounded-full">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-gray-900 font-medium">No patients found</p>
                                <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                              </div>
                              {hasActiveFilters && (
                                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Modern Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                          <SelectTrigger className="w-16 h-8 border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 border-gray-300"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0 border-gray-300"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </SidebarInset>

      {/* Patient Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[700px] max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">
              Patient Details
            </SheetTitle>
            <SheetDescription>
              View comprehensive information about {selectedPatient?.name}
            </SheetDescription>
          </SheetHeader>
          
          {selectedPatient && (
            <div className="mt-6 space-y-6">
              {/* Personal Information Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-sm font-medium mt-1">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={getGenderBadgeColor(selectedPatient.gender || '')}>
                          {selectedPatient.gender || 'Not specified'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                      <p className="text-sm mt-1">{formatDate(selectedPatient.dob)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                      <p className="text-sm mt-1">{calculateAge(selectedPatient.dob)} years old</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Religion</Label>
                      <p className="text-sm mt-1">{selectedPatient.religion || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                      <p className="text-sm mt-1">{selectedPatient.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="text-sm mt-1">{selectedPatient.address || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Information Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Patient ID</Label>
                      <p className="text-sm font-mono mt-1">{selectedPatient.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                      <p className="text-sm mt-1">{selectedPatient.created_by || 'System'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                      <p className="text-sm mt-1">{formatDate(selectedPatient.created_date)}</p>
                    </div>
                    {selectedPatient.user_log && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">User Log</Label>
                        <p className="text-sm mt-1">{selectedPatient.user_log}</p>
                      </div>
                    )}
                    {selectedPatient.date_log && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date Log</Label>
                        <p className="text-sm mt-1">{formatDate(selectedPatient.date_log)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  )
}
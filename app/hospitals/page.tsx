"use client"

import { useState, useMemo, useCallback, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Download, RefreshCw, ChevronUp, ChevronDown, MoreHorizontal, Building2, Shield, Star, Globe, AlertCircle, Plus, Eye, Edit, Trash2, Loader2, X, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, Award } from 'lucide-react'
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
import { useHospitals, useDeleteHospital } from "@/hooks/use-hospitals"
import { useDebounce } from '@/hooks/use-debounce'
import { HospitalFormModal } from "@/components/hospital-form-modal"
import { toast } from 'sonner'
import type { Hospital, HospitalFilters } from "@/lib/types"

interface HospitalFiltersState {
  search: string
  country: string
  rating: string
  halalStatus: string
  status: string
}

type HospitalActionType = "view" | "edit" | "delete"

// Skeleton Components
function HospitalFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
      <div className="relative flex-1 max-w-md">
        <div className="h-9 bg-gray-200 rounded-md animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32 h-9 bg-gray-200 rounded-md animate-pulse" />
        <div className="w-32 h-9 bg-gray-200 rounded-md animate-pulse" />
        <div className="w-36 h-9 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  )
}

function HospitalTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded" />
          <div className="w-16 h-6 bg-gray-200 rounded" />
          <div className="w-24 h-6 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HospitalsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<HospitalFiltersState>({
    search: '',
    country: 'all',
    rating: 'all',
    halalStatus: 'all',
    status: 'all'
  })
  const [sortBy, setSortBy] = useState<string>('hospital_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pendingAction, setPendingAction] = useState<{ id: string; type: HospitalActionType } | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)

  // Debounce search input for performance
  const debouncedSearch = useDebounce(filters.search, 300)

  // Prepare API parameters
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
    }

    if (debouncedSearch) params.search = debouncedSearch
    if (filters.country && filters.country !== 'all') params.country = filters.country
    if (filters.halalStatus && filters.halalStatus !== 'all') {
      params.is_halal = filters.halalStatus === 'certified'
    }
    
    return params
  }, [currentPage, itemsPerPage, sortBy, sortOrder, debouncedSearch, filters])

  // Fetch hospitals data
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useHospitals(apiParams)

  const deleteHospitalMutation = useDeleteHospital()

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof HospitalFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      country: 'all',
      rating: 'all',
      halalStatus: 'all',
      status: 'all'
    })
    setCurrentPage(1)
  }, [])

  // Handle data refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast.success('Hospital data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh hospital data')
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
      toast.error(error.message || 'Failed to load hospital data')
    }
  }, [error])

  // Calculate pagination info
  const totalPages = data?.pagination?.totalPages || 0
  const totalCount = data?.pagination?.total || 0

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
  }

  // Get rating display
  const getRatingDisplay = (rating: number | null) => {
    if (!rating) return 'N/A'
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // Check if any filters are active
  const hasActiveFilters = filters.search || (filters.country !== 'all') || (filters.rating !== 'all') || (filters.halalStatus !== 'all')
  
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.country !== 'all') count++
    if (filters.rating !== 'all') count++
    if (filters.halalStatus !== 'all') count++
    return count
  }

  // Hospital action handlers
  const isHospitalActionPending = (action: HospitalActionType, hospitalId: string) =>
    pendingAction?.id === hospitalId && pendingAction.type === action

  const isHospitalBusy = (hospitalId: string) => pendingAction?.id === hospitalId

  const handleHospitalAction = (hospital: Hospital, actionType: HospitalActionType) => {
    setPendingAction({ id: hospital.id, type: actionType })
    setTimeout(() => {
      setPendingAction(null)
      switch (actionType) {
        case 'view':
          setSelectedHospital(hospital)
          setIsSheetOpen(true)
          break
        case 'edit':
          setEditingHospital(hospital)
          setIsFormModalOpen(true)
          break
        case 'delete':
          handleDelete(hospital)
          break
      }
    }, 500)
  }

  const handleDelete = async (hospital: Hospital) => {
    if (window.confirm(`Are you sure you want to delete "${hospital.hospital_name}"?`)) {
      try {
        await deleteHospitalMutation.mutateAsync(hospital.id)
        toast.success("Hospital deleted successfully")
      } catch (error) {
        toast.error("Failed to delete hospital")
      }
    }
  }

  const handleAddNew = () => {
    setEditingHospital(null)
    setIsFormModalOpen(true)
  }

  const handleFormClose = () => {
    setIsFormModalOpen(false)
    setEditingHospital(null)
  }

  const hospitals = data?.data || []

  // Get unique countries for filter
  const uniqueCountries = useMemo(() => {
    const countries = new Set(hospitals.map((h: { country: any }) => h.country).filter(Boolean))
    return Array.from(countries).sort()
  }, [hospitals])

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
                  <BreadcrumbPage>Hospital Management</BreadcrumbPage>
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
              Hospital Management
            </h1>
            <p className="text-sm text-gray-600">
              Manage and view all hospitals in your network
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
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hospital
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error.message || 'Failed to load hospital data. Please try again.'}
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
              value="featured" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Featured
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
              <HospitalFiltersSkeleton />
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search hospitals..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-3">
                  <Select
                    value={filters.country}
                    onValueChange={(value) => handleFilterChange('country', value)}
                  >
                    <SelectTrigger className="w-32 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {uniqueCountries.map((country) => (
                        <SelectItem key={country as string} value={country as string}>
{String(country)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.rating}
                    onValueChange={(value) => handleFilterChange('rating', value)}
                  >
                    <SelectTrigger className="w-32 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.halalStatus}
                    onValueChange={(value) => handleFilterChange('halalStatus', value)}
                  >
                    <SelectTrigger className="w-36 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="Halal Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="certified">Halal Certified</SelectItem>
                      <SelectItem value="not-certified">Not Certified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Hospital Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="p-6">
                  <HospitalTableSkeleton rows={itemsPerPage} />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50">
                        <TableHead 
                          className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                          onClick={() => handleSort('hospital_name')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Hospital Name</span>
                            {getSortIcon('hospital_name')}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Location</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Status</TableHead>
                        <TableHead 
                          className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                          onClick={() => handleSort('rating')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Rating</span>
                            {getSortIcon('rating')}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Halal Certified</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Specialties</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-3 px-6 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hospitals && hospitals.length > 0 ? (
                        hospitals.map((hospital: { id: any; hospital_name: any; email?: any; city: any; country: any; rating: any; is_halal: any; specialties?: any; address?: string; contact_number?: string; description?: string | null; website?: string | null; zipcode?: string; is_show_price?: boolean | null; state_province?: string | null; latitude?: number | null; longitude?: number | null; timezone?: string | null; country_code?: string | null; region?: string | null; geocoding_provider?: string | null; geocoding_accuracy?: string | null; geocoding_confidence?: number | null; place_id?: string | null; is_location_verified?: boolean | null; location_verification_date?: string | null; location_verification_method?: string | null; created_by?: string | null; created_at?: string | null; updated_at?: string | null }) => (
                          <TableRow key={hospital.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                   <Building2 className="h-4 w-4 text-blue-600" />
                                 </div>
                                 <div>
                                   <div className="font-medium text-gray-900">{hospital.hospital_name || 'Unknown'}</div>
                                   <div className="text-sm text-gray-500">{hospital.email || 'No email'}</div>
                                 </div>
                               </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-sm text-gray-900">{hospital.city || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{hospital.country || 'N/A'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeColor(true)}
                              >
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {getRatingDisplay(hospital.rating)}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                               {hospital.is_halal ? (
                                 <Badge 
                                   variant="outline" 
                                   className="bg-green-50 text-green-700 border-green-200 font-medium"
                                 >
                                   <Award className="h-3 w-3 mr-1" />
                                   Certified
                                 </Badge>
                               ) : (
                                 <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">
                                   Not Certified
                                 </Badge>
                               )}
                             </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-sm text-gray-600">
                                {hospital.specialties ? hospital.specialties.slice(0, 2).join(', ') : 'General'}
                                {hospital.specialties && hospital.specialties.length > 2 && '...'}
                              </div>
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
                                        onClick={() => handleHospitalAction(hospital as Hospital, 'view')}
                                        disabled={isHospitalBusy(hospital.id)}
                                      >
                                        {isHospitalActionPending('view', hospital.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View hospital details</p>
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
                                        onClick={() => handleHospitalAction(hospital as Hospital, 'edit')}
                                        disabled={isHospitalBusy(hospital.id)}
                                      >
                                        {isHospitalActionPending('edit', hospital.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Edit className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit hospital information</p>
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
                                        onClick={() => handleHospitalAction(hospital as Hospital, 'delete')}
                                        disabled={isHospitalBusy(hospital.id)}
                                      >
                                        {isHospitalActionPending('delete', hospital.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete hospital</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Building2 className="h-12 w-12 text-gray-300" />
                              <p className="text-gray-500 font-medium">No hospitals found</p>
                              <p className="text-sm text-gray-400">
                                {hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first hospital'}
                              </p>
                              {!hasActiveFilters && (
                                <Button size="sm" className="mt-2" onClick={handleAddNew}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Hospital
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {hospitals.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Showing</span>
                        <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                        <span>to</span>
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span>
                        <span>of</span>
                        <span className="font-medium">{totalCount}</span>
                        <span>hospitals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="h-8 w-8 p-0"
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Hospital Detail Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Hospital Details</SheetTitle>
              <SheetDescription>
                View detailed information about this hospital
              </SheetDescription>
            </SheetHeader>
            {selectedHospital && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedHospital.hospital_name}</h3>
                    <p className="text-sm text-gray-600">{selectedHospital.contact_number}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Location</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedHospital.city}, {selectedHospital.country}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Rating</Label>
                    <div className="mt-1">{getRatingDisplay(selectedHospital.rating)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Halal Certified</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedHospital.is_halal ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Created</Label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedHospital.created_at)}</p>
                  </div>
                </div>

                {selectedHospital.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedHospital.description}</p>
                  </div>
                )}


              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Hospital Form Modal */}
        <HospitalFormModal
          open={isFormModalOpen}
          onClose={handleFormClose}
          hospital={editingHospital}
        />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
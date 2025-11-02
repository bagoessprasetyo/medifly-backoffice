'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Loader2,
  MapPin,
  Calendar,
  Stethoscope,
  GraduationCap,
  Languages,
  Building2,
  Shield
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { DoctorTableSkeleton } from "@/components/doctors/doctor-registry-skeleton"
import { useDoctors, useDoctorsFilterOptions, type DoctorWithRelations } from "@/hooks/use-doctors"

interface DoctorFilters {
  search: string
  specialization: string
  hospital: string
  experienceRange: string
  rating: string
}

type SortField = 'name' | 'experience_years' | 'rating'
type SortOrder = 'asc' | 'desc'

export default function DoctorsRegistryPage() {
  const router = useRouter()
  
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [pendingActions, setPendingActions] = useState<Record<string, string>>({})
  
  const [filters, setFilters] = useState<DoctorFilters>({
    search: '',
    specialization: 'all',
    hospital: 'all',
    experienceRange: 'all',
    rating: 'all'
  })

  // Validated setter for itemsPerPage to ensure it never exceeds 100
  const setValidatedItemsPerPage = useCallback((value: number) => {
    const validatedValue = Math.min(Math.max(value, 1), 100) // Clamp between 1 and 100
    setItemsPerPage(validatedValue)
  }, [])

  // Ensure itemsPerPage is always valid
  useEffect(() => {
    if (itemsPerPage > 100) {
      setItemsPerPage(100)
    } else if (itemsPerPage < 1) {
      setItemsPerPage(25) // Default to 25 if invalid
    }
  }, [itemsPerPage])

  // Data fetching
  const { 
    data: doctorsData, 
    isLoading, 
    error 
  } = useDoctors({
    page: currentPage,
    limit: itemsPerPage,
    search: filters.search,
    service_id: filters.specialization !== 'all' ? filters.specialization : undefined,
    hospital_id: filters.hospital !== 'all' ? filters.hospital : undefined,
    experience_range: filters.experienceRange !== 'all' ? filters.experienceRange : undefined,
    rating_min: filters.rating !== 'all' ? Number(filters.rating) : undefined,
    sort_by: sortField,
    sort_order: sortOrder
  })

  const filterOptions = useDoctorsFilterOptions()

  const doctors = doctorsData?.data || []
  const totalCount = doctorsData?.count || 0
  const totalPages = Math.ceil(totalCount / itemsPerPage)



  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExperienceBadgeColor = (years: number) => {
    if (years >= 15) return 'bg-purple-50 text-purple-700 border-purple-200'
    if (years >= 10) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (years >= 5) return 'bg-green-50 text-green-700 border-green-200'
    return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 text-green-700 border-green-200'
    if (rating >= 4.0) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (rating >= 3.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  // Event handlers
  const handleFilterChange = useCallback((key: keyof DoctorFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }, [sortField])

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />
  }

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      specialization: 'all',
      hospital: 'all',
      experienceRange: 'all',
      rating: 'all'
    })
    setCurrentPage(1)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' || 
           filters.specialization !== 'all' || 
           filters.hospital !== 'all' || 
           filters.experienceRange !== 'all' || 
           filters.rating !== 'all'
  }, [filters])

  const isDoctorBusy = (doctorId: string) => {
    return doctorId in pendingActions
  }

  const isDoctorActionPending = (action: string, doctorId: string) => {
    return pendingActions[doctorId] === action
  }

  const handleDoctorAction = async (doctor: any, action: 'view' | 'edit' | 'delete') => {
    setPendingActions(prev => ({ ...prev, [doctor.id]: action }))
    
    try {
      switch (action) {
        case 'view':
          setSelectedDoctor(doctor)
          setIsSheetOpen(true)
          break
        case 'edit':
          router.push(`/doctors/${doctor.id}/edit`)
          break
        case 'delete':
          // Handle delete logic here
          console.log('Delete doctor:', doctor.id)
          break
      }
    } finally {
      setPendingActions(prev => {
        const newState = { ...prev }
        delete newState[doctor.id]
        return newState
      })
    }
  }

  const handleExport = () => {
    // Export functionality
    console.log('Exporting doctors data...')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Doctors Registry</h1>
              </div>
              <p className="text-gray-600 mt-1">Manage and monitor all registered doctors</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                {totalCount} Total Doctors
              </Badge>
              <Button 
                onClick={() => router.push('/doctors/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </div>
          </div>

          <Tabs defaultValue="registry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registry">Registry</TabsTrigger>
              <TabsTrigger value="analytics" onClick={() => router.push('/doctors/analytics')}>
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registry" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-gray-500" />
                      <CardTitle>Search &amp; Filter</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-gray-600"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Search doctors by name, email, or license..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      className="text-gray-600 border-gray-300"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm text-blue-700 font-medium">
                        Active filters applied - Showing {totalCount} results
                      </span>
                      <Button variant="outline" size="sm" onClick={clearFilters} className="text-blue-600 border-blue-300">
                        Clear all filters
                      </Button>
                    </div>
                  )}

                  {showFilters && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-200">
                      <Select
                        value={filters.specialization}
                        onValueChange={(value) => handleFilterChange('specialization', value)}
                      >
                        <SelectTrigger className="w-full h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="All Specializations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specializations</SelectItem>
                          {filterOptions?.services.map((service: any) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.hospital}
                        onValueChange={(value) => handleFilterChange('hospital', value)}
                      >
                        <SelectTrigger className="w-full h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="All Hospitals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Hospitals</SelectItem>
                          {filterOptions?.hospitals.map((hospital: any) => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.experienceRange}
                        onValueChange={(value) => handleFilterChange('experienceRange', value)}
                      >
                        <SelectTrigger className="w-full h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="All Experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Experience</SelectItem>
                          {filterOptions?.experienceRanges.map((range: string) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.rating}
                        onValueChange={(value) => handleFilterChange('rating', value)}
                      >
                        <SelectTrigger className="w-full h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="All Ratings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                          <SelectItem value="4.0">4.0+ Stars</SelectItem>
                          <SelectItem value="3.5">3.5+ Stars</SelectItem>
                          <SelectItem value="3.0">3.0+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Doctors Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {isLoading ? (
                  <div className="p-6">
                    <DoctorTableSkeleton rows={itemsPerPage} />
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
                              <span>Doctor Name</span>
                              {getSortIcon('name')}
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Specializations</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Hospitals</TableHead>
                          <TableHead 
                            className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                            onClick={() => handleSort('experience_years')}
                          >
                            <div className="flex items-center gap-2">
                              <span>Experience</span>
                              {getSortIcon('experience_years')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer select-none font-semibold text-gray-900 py-3 px-6 text-left"
                            onClick={() => handleSort('rating')}
                          >
                            <div className="flex items-center gap-2">
                              <span>Rating</span>
                              {getSortIcon('rating')}
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Languages</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-3 px-6 text-left">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-3 px-6 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctors && doctors.length > 0 ? (
                          doctors.map((doctor: DoctorWithRelations) => (
                            <TableRow key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{doctor.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{doctor.email_address || 'No email'}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex flex-wrap gap-1">
                                  {doctor.services?.slice(0, 2).map((service: any) => (
                                    <Badge 
                                      key={service.id}
                                      variant="outline" 
                                      className="bg-purple-50 text-purple-600 border-purple-200 font-medium text-xs"
                                    >
                                      {service.services?.name || 'Unknown Service'}
                                    </Badge>
                                  ))}
                                  {doctor.services?.length > 2 && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                                      +{doctor.services.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex flex-wrap gap-1">
                                  {doctor.hospitals?.slice(0, 1).map((hospital: any) => (
                                    <Badge 
                                      key={hospital.id}
                                      variant="outline" 
                                      className="bg-green-50 text-green-600 border-green-200 font-medium text-xs"
                                    >
                                      {hospital.hospitals?.name || 'Unknown Hospital'}
                                    </Badge>
                                  ))}
                                  {doctor.hospitals?.length > 1 && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                                      +{doctor.hospitals.length - 1} more
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Badge 
                                  variant="outline" 
                                  className={`${getExperienceBadgeColor(doctor.experience_years || 0)} font-medium`}
                                >
                                  {doctor.experience_years || 0} years
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Badge 
                                  variant="outline" 
                                  className={`${getRatingBadgeColor(doctor.rating || 0)} font-medium`}
                                >
                                  ⭐ {doctor.rating?.toFixed(1) || '0.0'}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex flex-wrap gap-1">
                                  {doctor.languages?.slice(0, 2).map((language: any) => (
                                    <Badge 
                                      key={language.id}
                                      variant="outline" 
                                      className="bg-blue-50 text-blue-600 border-blue-200 font-medium text-xs"
                                    >
                                      {language.name}
                                    </Badge>
                                  ))}
                                  {doctor.languages?.length > 2 && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                                      +{doctor.languages.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Badge 
                                  variant="outline" 
                                  className="bg-green-50 text-green-600 border-green-200 font-medium"
                                >
                                  Active
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
                                          onClick={() => handleDoctorAction(doctor, 'view')}
                                          disabled={isDoctorBusy(doctor.id)}
                                        >
                                          {isDoctorActionPending('view', doctor.id) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View doctor details</p>
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
                                          onClick={() => handleDoctorAction(doctor, 'edit')}
                                          disabled={isDoctorBusy(doctor.id)}
                                        >
                                          {isDoctorActionPending('edit', doctor.id) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Edit className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit doctor information</p>
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
                                          onClick={() => handleDoctorAction(doctor, 'delete')}
                                          disabled={isDoctorBusy(doctor.id)}
                                        >
                                          {isDoctorActionPending('delete', doctor.id) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete doctor</p>
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
                                  <Stethoscope className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-gray-900 font-medium">No doctors found</p>
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
                          <Select value={itemsPerPage.toString()} onValueChange={(value) => setValidatedItemsPerPage(Number(value))}>
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

      {/* Doctor Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[700px] max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">
              Doctor Details
            </SheetTitle>
            <SheetDescription>
              View comprehensive information about {selectedDoctor?.name}
            </SheetDescription>
          </SheetHeader>
          
          {selectedDoctor && (
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
                      <p className="text-sm font-medium mt-1">{selectedDoctor.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                      <p className="text-sm mt-1">{selectedDoctor.email_address || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                      <p className="text-sm mt-1">{selectedDoctor.phone_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">License Number</Label>
                      <p className="text-sm font-mono mt-1">{selectedDoctor.license_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={getExperienceBadgeColor(selectedDoctor.experience_years || 0)}>
                          {selectedDoctor.experience_years || 0} years
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={getRatingBadgeColor(selectedDoctor.rating || 0)}>
                          ⭐ {selectedDoctor.rating?.toFixed(1) || '0.0'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {selectedDoctor.bio && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Biography</Label>
                      <p className="text-sm mt-1 text-gray-700">{selectedDoctor.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Information Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Specializations</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoctor.services?.map((service: any) => (
                        <Badge 
                          key={service.id}
                          variant="outline" 
                          className="bg-purple-50 text-purple-600 border-purple-200"
                        >
                          {service.services?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Hospitals</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoctor.hospitals?.map((hospital: any) => (
                        <Badge 
                          key={hospital.id}
                          variant="outline" 
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          {hospital.hospitals?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Languages</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoctor.languages?.map((language: any) => (
                        <Badge 
                          key={language.id}
                          variant="outline" 
                          className="bg-blue-50 text-blue-600 border-blue-200"
                        >
                          <Languages className="h-3 w-3 mr-1" />
                          {language.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoctor.certifications?.map((cert: any) => (
                        <Badge 
                          key={cert.id}
                          variant="outline" 
                          className="bg-yellow-50 text-yellow-600 border-yellow-200"
                        >
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {cert.name}
                        </Badge>
                      ))}
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
                      <Label className="text-sm font-medium text-muted-foreground">Doctor ID</Label>
                      <p className="text-sm font-mono mt-1">{selectedDoctor.id}</p>
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
                      <p className="text-sm mt-1">{selectedDoctor.created_by || 'System'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                      <p className="text-sm mt-1">{formatDate(selectedDoctor.created_at)}</p>
                    </div>
                    {selectedDoctor.updated_by && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Updated By</Label>
                        <p className="text-sm mt-1">{selectedDoctor.updated_by}</p>
                      </div>
                    )}
                    {selectedDoctor.updated_at && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Updated Date</Label>
                        <p className="text-sm mt-1">{formatDate(selectedDoctor.updated_at)}</p>
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
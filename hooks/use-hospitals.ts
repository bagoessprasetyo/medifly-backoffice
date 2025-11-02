import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Hospital, HospitalFormData, HospitalFilters } from '@/lib/types'
import { toast } from 'sonner'

// API functions
async function fetchHospitals(
  filters: HospitalFilters = {},
  pagination: {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}
) {
  const params = new URLSearchParams()
  
  // Add filters
  if (filters.search) params.append('search', filters.search)
  if (filters.country) params.append('country', filters.country)
  if (filters.is_halal !== undefined) params.append('is_halal', filters.is_halal.toString())
  if (filters.rating !== undefined) params.append('rating', filters.rating.toString())
  
  // Add pagination
  if (pagination.page) params.append('page', pagination.page.toString())
  if (pagination.limit) params.append('limit', pagination.limit.toString())
  if (pagination.sort_by) params.append('sort_by', pagination.sort_by)
  if (pagination.sort_order) params.append('sort_order', pagination.sort_order)

  const response = await fetch(`/api/hospitals?${params.toString()}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch hospitals')
  }
  
  return response.json()
}

async function fetchHospital(id: string): Promise<Hospital> {
  const response = await fetch(`/api/hospitals/${id}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch hospital')
  }
  
  return response.json()
}

async function createHospital(data: HospitalFormData): Promise<Hospital> {
  const response = await fetch('/api/hospitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create hospital')
  }
  
  return response.json()
}

async function updateHospital(id: string, data: Partial<HospitalFormData>): Promise<Hospital> {
  const response = await fetch(`/api/hospitals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update hospital')
  }
  
  return response.json()
}

async function deleteHospital(id: string): Promise<void> {
  const response = await fetch(`/api/hospitals/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete hospital')
  }
}

// Query keys
export const hospitalKeys = {
  all: ['hospitals'] as const,
  lists: () => [...hospitalKeys.all, 'list'] as const,
  list: (filters: HospitalFilters, pagination: any) => 
    [...hospitalKeys.lists(), { filters, pagination }] as const,
  details: () => [...hospitalKeys.all, 'detail'] as const,
  detail: (id: string) => [...hospitalKeys.details(), id] as const,
}

// Hooks
export function useHospitals(
  filters: HospitalFilters = {},
  pagination: {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}
) {
  return useQuery({
    queryKey: hospitalKeys.list(filters, pagination),
    queryFn: () => fetchHospitals(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: hospitalKeys.detail(id),
    queryFn: () => fetchHospital(id),
    enabled: !!id,
  })
}

export function useCreateHospital() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createHospital,
    onSuccess: (data) => {
      // Invalidate and refetch hospitals list
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() })
      toast.success('Hospital created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create hospital')
    },
  })
}

export function useUpdateHospital() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HospitalFormData> }) =>
      updateHospital(id, data),
    onSuccess: (data, variables) => {
      // Update the specific hospital in cache
      queryClient.setQueryData(hospitalKeys.detail(variables.id), data)
      // Invalidate hospitals list to reflect changes
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() })
      toast.success('Hospital updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update hospital')
    },
  })
}

export function useDeleteHospital() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteHospital,
    onSuccess: (_, id) => {
      // Remove the hospital from cache
      queryClient.removeQueries({ queryKey: hospitalKeys.detail(id) })
      // Invalidate hospitals list
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() })
      toast.success('Hospital deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete hospital')
    },
  })
}
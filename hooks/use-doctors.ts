'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

// Extended Doctor type with relationships
export interface Doctor {
  id: string
  name: string
  bio?: string | null
  experience_years?: number | null
  rating?: number | null
  email_address?: string | null
  phone_number?: string | null
  license_number?: string | null
  image_url?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DoctorHospital {
  id: string
  doctor_id: string
  hospital_id: string
  is_primary: boolean
  department?: string | null
  position?: string | null
  start_date?: string | null
  end_date?: string | null
  is_active: boolean
  notes?: string | null
  hospital?: {
    id: string
    name: string
    address: string
    city?: string
    country: string
  }
}

export interface DoctorService {
  id: string
  doctor_id: string
  service_id: string
  is_primary: boolean
  proficiency_level: string
  years_experience: number
  certification_details?: string | null
  is_active: boolean
  service?: {
    id: string
    name: string
    description?: string
    category?: string
  }
}

export interface DoctorLanguage {
  id: string
  doctor_id: string
  language_id: string
  proficiency_level: string
  is_primary: boolean
  language?: {
    id: string
    name: string
    code: string
    native_name?: string
  }
}

export interface DoctorCertification {
  id: string
  doctor_id: string
  certification_name: string
  issuing_organization: string
  certification_number?: string | null
  issue_date?: string | null
  expiry_date?: string | null
  is_verified: boolean
  verification_date?: string | null
  document_url?: string | null
  notes?: string | null
}

export interface DoctorWithRelations extends Doctor {
  hospitals: DoctorHospital[]
  services: DoctorService[]
  languages: DoctorLanguage[]
  certifications: DoctorCertification[]
  primaryHospital?: DoctorHospital
  primaryService?: DoctorService
  primaryLanguage?: DoctorLanguage
}

export interface DoctorsFilters {
  search?: string
  hospital_id?: string
  service_id?: string
  experience_range?: string
  rating_min?: number
  language_id?: string
  is_verified?: boolean
  status?: 'active' | 'inactive'
}

export interface DoctorsParams extends DoctorsFilters {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface DoctorsResponse {
  data: DoctorWithRelations[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface DoctorInsert {
  name: string
  bio?: string
  experience_years?: number
  email_address?: string
  phone_number?: string
  license_number?: string
  image_url?: string
  hospitals?: Array<{
    hospital_id: string
    is_primary?: boolean
    department?: string
    position?: string
    start_date?: string
  }>
  services?: Array<{
    service_id: string
    is_primary?: boolean
    proficiency_level?: string
    years_experience?: number
  }>
  languages?: Array<{
    language_id: string
    proficiency_level?: string
    is_primary?: boolean
  }>
  certifications?: Array<{
    certification_name: string
    issuing_organization: string
    certification_number?: string
    issue_date?: string
    expiry_date?: string
  }>
}

export interface DoctorUpdate extends Partial<DoctorInsert> {
  id: string
}

async function fetchDoctors(params: DoctorsParams): Promise<DoctorsResponse> {
  const searchParams = new URLSearchParams()
  
  // Add all parameters to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  const response = await fetch(`/api/doctors?${searchParams.toString()}`)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function fetchDoctor(id: string): Promise<DoctorWithRelations> {
  const response = await fetch(`/api/doctors/${id}`)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function createDoctor(data: DoctorInsert): Promise<DoctorWithRelations> {
  const response = await fetch('/api/doctors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function updateDoctor(data: DoctorUpdate): Promise<DoctorWithRelations> {
  const response = await fetch(`/api/doctors/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function deleteDoctor(id: string): Promise<void> {
  const response = await fetch(`/api/doctors/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
}

export function useDoctors(params: DoctorsParams = {}) {
  const queryKey = ['doctors', params]
  
  const query = useQuery({
    queryKey,
    queryFn: () => fetchDoctors(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('4')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })



  return {
    ...query,
    doctors: query.data?.data || [],
    total: query.data?.count || 0,
  }
}

export function useDoctor(id: string) {
  const queryKey = ['doctor', id]
  
  return useQuery({
    queryKey,
    queryFn: () => fetchDoctor(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('4')) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctor', data.id] })
    },
  })
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

// Hook for getting unique filter options
export function useDoctorsFilterOptions() {
  const { data: allDoctors } = useDoctors({ limit: 100 }) // API max: 100
  
  const filterOptions = useMemo(() => {
    if (!allDoctors?.data) {
      return {
        hospitals: [],
        services: [],
        languages: [],
        experienceRanges: ['0-2', '3-5', '6-10', '11-15', '16+'],
        ratings: [1, 2, 3, 4, 5],
        statuses: ['active', 'inactive']
      }
    }

    // Extract unique hospitals
    const hospitals = Array.from(
      new Map(
        allDoctors.data
          .flatMap(d => d.hospitals)
          .filter(h => h.hospital)
          .map(h => [h.hospital!.id, h.hospital!])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    // Extract unique services
    const services = Array.from(
      new Map(
        allDoctors.data
          .flatMap(d => d.services)
          .filter(s => s.service)
          .map(s => [s.service!.id, s.service!])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    // Extract unique languages
    const languages = Array.from(
      new Map(
        allDoctors.data
          .flatMap(d => d.languages)
          .filter(l => l.language)
          .map(l => [l.language!.id, l.language!])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    return {
      hospitals,
      services,
      languages,
      experienceRanges: ['0-2', '3-5', '6-10', '11-15', '16+'],
      ratings: [1, 2, 3, 4, 5],
      statuses: ['active', 'inactive']
    }
  }, [allDoctors?.data])

  return filterOptions
}
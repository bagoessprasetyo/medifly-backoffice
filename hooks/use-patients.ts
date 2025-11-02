'use client'

import { useQuery } from '@tanstack/react-query'
import { Patient } from '@/lib/types'
import { useMemo } from 'react'

export interface PatientsFilters {
  search?: string
  gender?: string
  ageRange?: string
  religion?: string
  dateRange?: string
}

export interface PatientsParams extends PatientsFilters {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PatientsResponse {
  data: Patient[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface PatientWithAge extends Patient {
  age: number
}

// Calculate age from date of birth
function calculateAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

async function fetchPatients(params: PatientsParams): Promise<PatientsResponse> {
  const searchParams = new URLSearchParams()
  
  // Add all parameters to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  const response = await fetch(`/api/patients?${searchParams.toString()}`)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export function usePatients(params: PatientsParams = {}) {
  const queryKey = ['patients', params]
  
  const query = useQuery({
    queryKey,
    queryFn: () => fetchPatients(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - longer stale time for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes - longer garbage collection time
    refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
    refetchOnMount: false, // Only refetch if data is stale
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.message?.includes('4')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  // Transform patients data to include age calculation
  const patientsWithAge = useMemo((): PatientWithAge[] => {
    if (!query.data?.data) return []
    
    return query.data.data.map(patient => ({
      ...patient,
      age: calculateAge(patient.dob)
    }))
  }, [query.data?.data])

  return {
    ...query,
    data: query.data ? {
      ...query.data,
      data: patientsWithAge
    } : undefined,
    patients: patientsWithAge,
  }
}

// Hook for getting unique filter options
export function usePatientsFilterOptions() {
  const { data: allPatients } = usePatients({ limit: 100 }) // Get data for filter options (API max: 100)
  
  const filterOptions = useMemo(() => {
    if (!allPatients?.data) {
      return {
        religions: [],
        genders: ['male', 'female', 'other'],
        ageRanges: ['18-35', '36-50', '51-65', '65+'],
        dateRanges: ['last30days', 'last3months', 'last6months', 'lastyear']
      }
    }

    const religions = Array.from(
      new Set(
        allPatients.data
          .map(p => p.religion)
          .filter(Boolean)
      )
    ).sort()

    return {
      religions,
      genders: ['male', 'female', 'other'],
      ageRanges: ['18-35', '36-50', '51-65', '65+'],
      dateRanges: ['last30days', 'last3months', 'last6months', 'lastyear']
    }
  }, [allPatients?.data])

  return filterOptions
}
'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Session cache to prevent redundant auth calls
let sessionCache: { user: User | null; timestamp: number } | null = null
const CACHE_DURATION = 5000 // 5 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Memoized auth functions to prevent re-creation on every render
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    // Clear cache on sign in
    sessionCache = null
    return { data, error }
  }, [supabase])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    // Clear cache on sign out
    sessionCache = null
    return { error }
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    // Check cache first to avoid redundant calls
    const now = Date.now()
    if (sessionCache && (now - sessionCache.timestamp) < CACHE_DURATION) {
      if (mounted) {
        setUser(sessionCache.user)
        setLoading(false)
      }
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)
        
        // Update cache
        sessionCache = {
          user: currentUser,
          timestamp: Date.now()
        }
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (mounted) {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)
        
        // Update cache
        sessionCache = {
          user: currentUser,
          timestamp: Date.now()
        }
        
        // Check email domain for authenticated users
        if (session?.user?.email && !session.user.email.endsWith('@medifly.ai')) {
          supabase.auth.signOut()
          return
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signOut,
    signUp
  }), [user, loading, signIn, signOut, signUp])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Update the request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Remove from request cookies
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Remove from response cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user session
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Log for debugging
  console.log('Middleware - Path:', request.nextUrl.pathname, 'User:', user?.email || 'none', 'Error:', error?.message || 'none')

  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/hospitals') ||
      request.nextUrl.pathname.startsWith('/doctors') ||
      request.nextUrl.pathname.startsWith('/patients') ||
      request.nextUrl.pathname.startsWith('/contents') ||
      request.nextUrl.pathname.startsWith('/ai-persona') ||
      request.nextUrl.pathname.startsWith('/audit-logs')) {
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user email domain is allowed
    if (user.email && !user.email.endsWith('@medifly.ai')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect root to dashboard if authenticated, otherwise to login
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
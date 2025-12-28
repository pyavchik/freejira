'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/lib/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        // Fetch current user to check Terms acceptance
        const user = await authService.getMe()

        // If user hasn't accepted terms and not already on accept-terms page
        if (!user.acceptedTerms && pathname !== '/accept-terms') {
          router.push('/accept-terms')
          return
        }

        setIsLoading(false)
      } catch (error) {
        // If error fetching user, redirect to login
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <>{children}</>
}


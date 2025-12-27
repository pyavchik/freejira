'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import toast from 'react-hot-toast'


export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    // Don't proceed if no client ID
    if (!clientId || clientId === 'undefined') {
      const buttonElement = document.getElementById('google-signin-button')
      if (buttonElement) {
        buttonElement.style.display = 'none'
      }
      return
    }

    // Check if script already exists
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement
    
    if (!script) {
      // Load Google Sign-In script
      script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    // Initialize Google Sign-In button after script loads
    const initGoogle = () => {
      try {
        if (typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts && (window as any).google.accounts.id) {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLogin,
          })
          
          const buttonElement = document.getElementById('google-signin-button')
          if (buttonElement && !buttonElement.hasChildNodes()) {
            (window as any).google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              width: '300',
              locale: 'en',
            })
          }
        }
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error)
        const buttonElement = document.getElementById('google-signin-button')
        if (buttonElement) {
          buttonElement.style.display = 'none'
        }
      }
    }
    
    // If script already loaded, initialize immediately
    if ((window as any).google && (window as any).google.accounts) {
      initGoogle()
    } else {
      // Wait for script to load
      script.onload = () => {
        initGoogle()
        // Retry after a short delay in case of timing issues
        setTimeout(initGoogle, 500)
      }
      
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script')
        const buttonElement = document.getElementById('google-signin-button')
        if (buttonElement) {
          buttonElement.style.display = 'none'
        }
      }
    }

    return () => {
      // Cleanup is handled by React
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.login(formData.email, formData.password)
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      // Get user-friendly error message
      let errorMessage = 'Login failed. Please check your email and password.'
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || errorMessage
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 8000, // Show for 8 seconds (longer)
        style: {
          background: '#ef4444',
          color: '#fff',
        },
        // Don't auto-dismiss on click - user must click X
        id: 'login-error', // Use same ID to prevent duplicates
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (response: any) => {
    setIsLoading(true)
    try {
      await authService.loginWithGoogle(response.credential)
      toast.success('Logged in with Google successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Google login failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to FreeJira
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <a
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </a>
          </p>
          <p className="mt-1 text-center text-sm">
            <a
              href="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </a>
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div id="google-signin-button" className="flex justify-center mb-4"></div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md bg-red-50 dark:bg-red-900/20 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white ${
                  error
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  // Don't clear error immediately - let user see it
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white ${
                  error
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  // Don't clear error immediately - let user see it
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


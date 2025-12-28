import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login/register page or if it's a login/register request
      const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/google')
      const isOnAuthPage = typeof window !== 'undefined' &&
                          (window.location.pathname === '/login' ||
                           window.location.pathname === '/register')

      // Only redirect if it's not an auth request and we're not already on an auth page
      if (!isAuthRequest && !isOnAuthPage) {
        Cookies.remove('token')
        Cookies.remove('refreshToken')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    // Handle Terms not accepted (optional backend enforcement)
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error?.toLowerCase() || ''
      if (errorMessage.includes('terms')) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/accept-terms') {
          window.location.href = '/accept-terms'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api


import api from './api'
import Cookies from 'js-cookie'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      { name, email, password }
    )
    if (response.data.success) {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
      Cookies.set('token', response.data.data.token, { 
        expires: 7,
        secure: isSecure,
        sameSite: 'strict'
      })
      Cookies.set('refreshToken', response.data.data.refreshToken, {
        expires: 30,
        secure: isSecure,
        sameSite: 'strict'
      })
    }
    return response.data.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      { email, password }
    )
    if (response.data.success) {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
      Cookies.set('token', response.data.data.token, { 
        expires: 7,
        secure: isSecure,
        sameSite: 'strict'
      })
      Cookies.set('refreshToken', response.data.data.refreshToken, {
        expires: 30,
        secure: isSecure,
        sameSite: 'strict'
      })
    }
    return response.data.data
  },

  loginWithGoogle: async (idToken: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/google',
      { idToken }
    )
    if (response.data.success) {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
      Cookies.set('token', response.data.data.token, { 
        expires: 7,
        secure: isSecure,
        sameSite: 'strict'
      })
      Cookies.set('refreshToken', response.data.data.refreshToken, {
        expires: 30,
        secure: isSecure,
        sameSite: 'strict'
      })
    }
    return response.data.data
  },

  logout: () => {
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  getMe: async () => {
    const response = await api.get<{ success: boolean; data: User }>(
      '/auth/me'
    )
    return response.data.data
  },

  isAuthenticated: () => {
    return !!Cookies.get('token')
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<{ success: boolean; data: { message: string; resetToken?: string } }>(
      '/auth/forgot-password',
      { email }
    )
    return response.data.data
  },

  resetPassword: async (resetToken: string, password: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/reset-password',
      { resetToken, password }
    )
    if (response.data.success) {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
      Cookies.set('token', response.data.data.token, { 
        expires: 7,
        secure: isSecure,
        sameSite: 'strict'
      })
      Cookies.set('refreshToken', response.data.data.refreshToken, {
        expires: 30,
        secure: isSecure,
        sameSite: 'strict'
      })
    }
    return response.data.data
  },
}


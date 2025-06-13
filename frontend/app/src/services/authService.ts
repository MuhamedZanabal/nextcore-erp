import axios from 'axios'
import { API_URL } from '@/lib/constants'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    tenantId: string
    roles: string[]
  }
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  tenantName: string
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login'
          return Promise.reject(error)
        }
        
        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        })
        
        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        // Update auth header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  },
  
  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', userData)
    return response.data
  },
  
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/refresh-token', {
      refreshToken,
    })
    return response.data
  },
}
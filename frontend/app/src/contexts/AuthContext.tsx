import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  tenantId: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  tenantName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        // Clear any invalid tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { accessToken, refreshToken, user } = await authService.login(email, password)
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set user data
      setUser(user)
      
      // Redirect to dashboard
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const { accessToken, refreshToken, user } = await authService.register(userData)
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set user data
      setUser(user)
      
      // Redirect to dashboard
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Clear user data
    setUser(null)
    
    // Redirect to login
    navigate('/login')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
import request from '@/utils/request'
import { USE_MOCK, MOCK_CONFIG } from '@/config'
import type { User } from '@/types'

// Mock user data
const mockUser = {
  id: 'user_1',
  email: 'test@example.com',
  name: 'Test User',
  phone: '1234567890',
  role: 'customer'
}

export const authService = {
  // Customer registration
  async registerCustomer(data: any) {
    if (USE_MOCK && MOCK_CONFIG.auth) {
      return {
        user: { ...mockUser, ...data, role: 'customer' }
      }
    }
    
    try {
      const response = await request.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        name: data.username,
        phone: data.phone,
        role: 'customer'
      })
      return response.data
    } catch (error) {
      console.error('Customer registration failed:', error)
      throw error
    }
  },

  // Restaurant registration
  async registerRestaurant(data: any) {
    if (USE_MOCK && MOCK_CONFIG.auth) {
      return {
        user: { ...mockUser, ...data, role: 'restaurant' }
      }
    }

    try {
      const response = await request.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        name: data.username,
        phone: data.phone,
        address: data.address,
        business_license: data.business_license,
        role: 'restaurant'
      })
      return response.data
    } catch (error) {
      console.error('Restaurant registration failed:', error)
      throw error
    }
  },

  // User login
  async login(data: { email: string; password: string }) {
    try {
      const response = await request.post('/api/auth/login', {
        email: data.email,
        password: data.password
      })
      
      // Log the response to help with debugging
      console.log('Login response:', response)
      
      if (response.data?.token) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token)
      }
      
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK && MOCK_CONFIG.auth) {
      return mockUser
    }

    try {
      const response = await request.get('/api/auth/me')
      if (response.status === 'success' && response.data?.user) {
        return response.data.user
      } else {
        throw new Error('Failed to get user info')
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
      throw error
    }
  },

  // Update user profile
  async updateProfile(data: { name: string; phone: string }) {
    if (USE_MOCK && MOCK_CONFIG.auth) {
      const updatedUser = {
        ...mockUser,
        ...data
      }
      return { status: 'success', data: { user: updatedUser } }
    }

    try {
      const response = await request.put('/api/auth/profile', data)
      if (response.status === 'success' && response.data?.user) {
        return response.data
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  },

  // Update password
  async updatePassword(data: { currentPassword: string; newPassword: string }) {
    if (USE_MOCK && MOCK_CONFIG.auth) {
      return { 
        status: 'success', 
        data: { 
          message: 'Password updated successfully' 
        } 
      }
    }

    try {
      const response = await request.put('/api/auth/password', data)
      if (response.status === 'success') {
        return response.data
      } else {
        throw new Error('Failed to update password')
      }
    } catch (error) {
      console.error('Failed to update password:', error)
      throw error
    }
  }
} 
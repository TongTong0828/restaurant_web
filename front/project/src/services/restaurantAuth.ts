import axios from 'axios'
import request from '@/utils/request'
import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://enbytdqrskag.sealoshzh.site'

interface RestaurantLoginData {
  email: string
  password: string
}

interface AuthResponse {
  status: string
  data: {
    token: string
    user: {
      id: number
      email: string
      role: string
      status?: string
      restaurant_id: number
      name: string
    }
  }
}

interface RegisterResponse {
  status: string
  data: {
    restaurant: {
      id: number
      name: string
      description: string
      address: string
      phone: string
      image: string
      delivery_fee: number
      minimum_order: number
      categories: string[]
      opening_hours: {
        [key: string]: { open: string; close: string }
      }
    }
    user: {
      id: number
      email: string
      name: string
      phone: string
      role: string
    }
    token: string
  }
}

interface RestaurantInfo {
  id: number
  name: string
  description: string
  address: string
  phone: string
  image: string
  delivery_fee: number
  minimum_order: number
  categories: string[]
  opening_hours: {
    [key: string]: { open: string; close: string }
  }
}

export const restaurantAuthService = {
  async register(formData: FormData) {
    try {
      const response = await axios.post<RegisterResponse>(`${API_URL}/api/restaurants/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.status === 'success') {
        const authStore = useAuthStore()
        authStore.setToken(response.data.data.token)
        authStore.setUser(response.data.data.user)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Registration failed. Please try again.')
    }
  },

  async login(data: RestaurantLoginData) {
    try {
      const response = await request.post<AuthResponse>('/api/auth/login', {
        email: data.email,
        password: data.password,
        type: 'restaurant'
      })
      
      console.log('Full login response:', response)
      
      if (!response.data) {
        throw new Error('Login failed - No response data')
      }
      
      const { token, user } = response.data
      console.log('Full user data:', user)
      
      if (!user || !token) {
        throw new Error('Login failed - Missing user or token')
      }
      
      // ?????????
      if (user.role !== 'restaurant') {
        throw new Error('This account is not a restaurant account')
      }

      // ??????
      if (user.status === 'suspended') {
        throw new Error('Restaurant account is suspended')
      }

      // ??????
      try {
        const restaurantResponse = await request.get<{ status: string; data: { restaurant: { id: number } } }>(
          `/api/restaurants/${user.id}`
        )
        console.log('Restaurant response:', restaurantResponse)

        // ??????????token
        const authStore = useAuthStore()
        authStore.setToken(token)
        authStore.setUser({
          ...user,
          restaurant_id: user.id // ????ID????ID
        })
        
        console.log('Stored user data with restaurant ID:', authStore.user)
        return response.data
      } catch (error) {
        console.error('Failed to get restaurant info:', error)
        // ????????????????????
        const authStore = useAuthStore()
        authStore.setToken(token)
        authStore.setUser({
          ...user,
          restaurant_id: user.id // ????ID????ID
        })
        return response.data
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Login failed. Please try again.')
    }
  },

  logout() {
    const authStore = useAuthStore()
    authStore.clearToken()
    authStore.clearUser()
  },

  getCurrentUser() {
    const authStore = useAuthStore()
    return authStore.user
  },

  getCurrentRestaurant() {
    const user = this.getCurrentUser()
    return user?.restaurant_id ? user : null
  },

  getToken() {
    const authStore = useAuthStore()
    return authStore.token
  },

  isAuthenticated() {
    return !!this.getToken()
  },

  isRestaurantOwner() {
    const user = this.getCurrentUser()
    return user?.role === 'restaurant'
  },

  async getRestaurantInfo() {
    try {
      const user = this.getCurrentUser()
      if (!user) {
        throw new Error('User not found')
      }

      const response = await request.get<any>(
        `/api/restaurants/${user.id}`
      )
      
      console.log('Raw restaurant response:', response)
      console.log('Restaurant data:', response.data)
      
      if (response.data) {
        // ????ID????ID
        const authStore = useAuthStore()
        authStore.setUser({
          ...user,
          restaurant_id: user.id
        })

        // ?????????
        const restaurantData = response.data.restaurant || response.data
        return {
          id: user.id,
          name: restaurantData.name || user.name,
          description: restaurantData.description || '',
          address: restaurantData.address || '',
          phone: restaurantData.phone || user.phone,
          image: restaurantData.image || '',
          delivery_fee: restaurantData.delivery_fee || 0,
          minimum_order: restaurantData.minimum_order || 0,
          categories: Array.isArray(restaurantData.categories) ? restaurantData.categories : [],
          opening_hours: restaurantData.opening_hours || {
            monday: { open: '', close: '' },
            tuesday: { open: '', close: '' },
            wednesday: { open: '', close: '' },
            thursday: { open: '', close: '' },
            friday: { open: '', close: '' },
            saturday: { open: '', close: '' },
            sunday: { open: '', close: '' }
          }
        }
      }
      throw new Error('Failed to get restaurant info')
    } catch (error: any) {
      console.error('Failed to get restaurant info:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to get restaurant info')
    }
  }
} 
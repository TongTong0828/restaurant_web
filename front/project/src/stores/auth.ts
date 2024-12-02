import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  role: string
  restaurant_id?: number
  status?: string
}

interface AuthState {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isRestaurantOwner: (state) => state.user?.role === 'restaurant',
    currentUser: (state) => state.user,
    currentToken: (state) => state.token
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUser(user: User) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('restaurant')
    }
  }
}) 
import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  name: string
  role: string
  restaurant_id?: number
}

interface UserState {
  user: User | null
  token: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isRestaurant: (state) => state.user?.role === 'restaurant'
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },

    setToken(token: string | null) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    loadUserFromStorage() {
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr)
          this.user = user
          this.token = token
        } catch (e) {
          this.clearUser()
        }
      } else {
        this.clearUser()
      }
    },

    clearUser() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('redirectPath')
    },

    logout() {
      this.clearUser()
    }
  }
}) 
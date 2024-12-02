import { defineStore } from 'pinia'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  restaurantId: string
}

interface CartState {
  items: CartItem[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  actions: {
    addItem(item: Omit<CartItem, 'quantity'>) {
      const existingItem = this.items.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ ...item, quantity: 1 })
      }
    },

    removeItem(itemId: string) {
      const index = this.items.findIndex(item => item.id === itemId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find(i => i.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },

    clearCart() {
      this.items = []
    }
  }
}) 
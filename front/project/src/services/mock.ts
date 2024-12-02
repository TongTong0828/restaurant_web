import { restaurants, menuItems, orders } from '@/mock/data'

// ģ�� API �ӳ�
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockService = {
  async getNearbyRestaurants() {
    await delay(1000)
    return restaurants
  },

  async getRestaurantById(id: string) {
    await delay(500)
    return restaurants.find(r => r.id === id)
  },

  async getRestaurantMenu(id: string) {
    await delay(500)
    return menuItems
  },

  async getOrders() {
    await delay(1000)
    return orders
  },

  async getOrderById(id: string) {
    await delay(500)
    return orders.find(o => o.id === id)
  }
} 
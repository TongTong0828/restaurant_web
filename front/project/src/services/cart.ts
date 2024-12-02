import request from '@/utils/request'
import { USE_MOCK, MOCK_CONFIG } from '@/config'

// 从 localStorage 获取购物车数据
const getLocalCart = () => {
  const cartData = localStorage.getItem('cart')
  return cartData ? JSON.parse(cartData) : { items: [], restaurantId: null }
}

// 保存购物车数据到 localStorage
const saveLocalCart = (cart: any) => {
  localStorage.setItem('cart', JSON.stringify(cart))
}

export const cartService = {
  // 获取购物车
  async getCart() {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      return getLocalCart()
    }
    const response = await request.get('/api/cart')
    return response.data.cart
  },

  // 添加商品到购物车
  async addItem(data: any) {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      const cart = getLocalCart()
      
      // 检查是否是同一家餐厅
      if (cart.items.length > 0 && cart.restaurantId !== data.restaurantId) {
        throw new Error('Cannot add items from different restaurants')
      }

      // 查找是否已存在该商品
      const existingItem = cart.items.find((item: any) => item.id === data.menuItemId)
      if (existingItem) {
        existingItem.quantity += data.quantity
      } else {
        cart.items.push({
          id: data.menuItemId,
          name: data.name,
          price: data.price,
          quantity: data.quantity
        })
        cart.restaurantId = data.restaurantId
      }

      saveLocalCart(cart)
      return cart
    }
    const response = await request.post('/api/cart/items', data)
    return response.data.cart
  },

  // 更新购物车商品数量
  async updateItemQuantity(menuItemId: string, quantity: number) {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      const cart = getLocalCart()
      const item = cart.items.find((item: any) => item.id === menuItemId)
      
      if (!item) {
        throw new Error('Item not found in cart')
      }

      if (quantity === 0) {
        cart.items = cart.items.filter((item: any) => item.id !== menuItemId)
        if (cart.items.length === 0) {
          cart.restaurantId = null
        }
      } else {
        item.quantity = quantity
      }

      saveLocalCart(cart)
      return cart
    }
    const response = await request.put(`/api/cart/items/${menuItemId}`, {
      quantity
    })
    return response.data.cart
  },

  // 清空购物车
  async clearCart() {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      localStorage.removeItem('cart')
      return { items: [], restaurantId: null }
    }
    const response = await request.delete('/api/cart')
    return response.data.cart
  }
} 
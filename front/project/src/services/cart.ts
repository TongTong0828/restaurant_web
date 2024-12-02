import request from '@/utils/request'
import { USE_MOCK, MOCK_CONFIG } from '@/config'

// �� localStorage ��ȡ���ﳵ����
const getLocalCart = () => {
  const cartData = localStorage.getItem('cart')
  return cartData ? JSON.parse(cartData) : { items: [], restaurantId: null }
}

// ���湺�ﳵ���ݵ� localStorage
const saveLocalCart = (cart: any) => {
  localStorage.setItem('cart', JSON.stringify(cart))
}

export const cartService = {
  // ��ȡ���ﳵ
  async getCart() {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      return getLocalCart()
    }
    const response = await request.get('/api/cart')
    return response.data.cart
  },

  // �����Ʒ�����ﳵ
  async addItem(data: any) {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      const cart = getLocalCart()
      
      // ����Ƿ���ͬһ�Ҳ���
      if (cart.items.length > 0 && cart.restaurantId !== data.restaurantId) {
        throw new Error('Cannot add items from different restaurants')
      }

      // �����Ƿ��Ѵ��ڸ���Ʒ
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

  // ���¹��ﳵ��Ʒ����
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

  // ��չ��ﳵ
  async clearCart() {
    if (USE_MOCK && MOCK_CONFIG.orders) {
      localStorage.removeItem('cart')
      return { items: [], restaurantId: null }
    }
    const response = await request.delete('/api/cart')
    return response.data.cart
  }
} 
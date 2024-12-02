import request from '@/utils/request'

export interface OrderItem {
  menuItemId: number
  quantity: number
}

export interface DeliveryInfo {
  name: string
  phone: string
  address: string
  instructions: string
}

export interface CreateOrderRequest {
  restaurantId: string
  items: OrderItem[]
  deliveryInfo: DeliveryInfo
  paymentMethod: 'cash' | 'online'
}

export interface Order {
  id: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
  restaurant: {
    id: string
    name: string
    phone: string
  }
  items: Array<{
    id: number
    name: string
    quantity: number
    price: number
  }>
  total_amount: number
  delivery_info: DeliveryInfo
  created_at: string
}

export interface OrderResponse {
  order: {
    id: number
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
    restaurant: {
      id: string
      name: string
      phone: string
    }
    items: Array<{
      id: number
      name: string
      quantity: number
      price: number
    }>
    total_amount: number
    delivery_info: DeliveryInfo
    created_at: string
  }
}

export interface OrderListResponse {
  orders: Order[]
}

export const orderService = {
  async createOrder(orderData: CreateOrderRequest) {
    const response = await request.post<OrderResponse>('/api/orders', orderData)
    return response.data
  },

  async getUserOrders(status?: string) {
    const params = status ? { status } : {}
    const response = await request.get<OrderListResponse>('/api/auth/orders', { params })
    return response.data
  },

  async getRestaurantOrders(status?: string) {
    const params = status ? { status } : {}
    const response = await request.get<OrderListResponse>('/api/auth/restaurant/orders', { params })
    return response.data
  },

  async updateOrderStatus(orderId: number, status: Order['status']) {
    const response = await request.put<OrderResponse>(`/api/auth/orders/${orderId}/status`, { status })
    return response.data
  },

  async cancelOrder(orderId: number) {
    const response = await request.put<OrderResponse>(`/api/auth/orders/${orderId}/cancel`)
    return response.data
  }
} 
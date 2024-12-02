import request from '@/utils/request'

// 订单状态类型
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled'

// 订单项类型
export interface OrderItem {
  id: number
  name: string
  quantity: number
  price: string
}

// 配送信息类型
export interface DeliveryInfo {
  address: string
  note?: string
}

// 客户信息类型
export interface Customer {
  name: string
  phone: string
}

// 订单类型
export interface Order {
  id: number
  status: OrderStatus
  total_amount: string
  created_at: string
  updated_at?: string
  customer: Customer
  items: OrderItem[]
  delivery_info: DeliveryInfo
}

// 分页信息类型
export interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

// 订单服务
const orderService = {
  // 获取订单列表
  async getOrders(params?: {
    status?: OrderStatus
    page?: number
    limit?: number
  }) {
    try {
      console.log('? Fetching orders with params:', params)
      const response = await request.get<{
        status: string
        data: {
          orders: Order[]
          pagination: Pagination
        }
      }>('/api/auth/restaurant/orders', { params })
      
      console.log('? Orders fetched:', response)
      if (response.status === 'success' && response.data) {
        // 如果orders为空，返回空数组和分页信息
        return {
          orders: response.data.orders || [],
          pagination: response.data.pagination || {
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            total_pages: 0
          }
        }
      }
      throw new Error(response.message || 'Failed to fetch orders')
    } catch (error: any) {
      console.error('? Failed to fetch orders:', {
        error,
        message: error.message,
        response: error.response?.data
      })
      // 如果发生错误，返回空数据而不是抛出错误
      return {
        orders: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          total_pages: 0
        }
      }
    }
  },

  // 获取订单详情
  async getOrderDetail(orderId: number) {
    try {
      console.log('? Fetching order detail:', orderId)
      const response = await request.get<{
        status: string
        data: {
          order: Order
        }
      }>(`/api/auth/restaurant/orders/${orderId}`)
      
      console.log('? Order detail fetched:', response)
      if (response.status === 'success' && response.data?.order) {
        return response.data.order
      }
      throw new Error(response.message || 'Failed to fetch order detail')
    } catch (error: any) {
      console.error('? Failed to fetch order detail:', {
        error,
        message: error.message,
        response: error.response?.data
      })
      throw new Error(error.response?.data?.message || 'Failed to fetch order detail')
    }
  },

  // 更新订单状态
  async updateOrderStatus(orderId: number, status: OrderStatus) {
    try {
      console.log('? Updating order status:', { orderId, status })
      const response = await request.put<{
        status: string
        data: {
          order: {
            id: number
            status: OrderStatus
            updated_at: string
          }
        }
      }>(`/api/auth/restaurant/orders/${orderId}/status`, { status })
      
      console.log('? Order status updated:', response)
      if (response.status === 'success' && response.data?.order) {
        return response.data.order
      }
      throw new Error(response.message || 'Failed to update order status')
    } catch (error: any) {
      console.error('? Failed to update order status:', {
        error,
        message: error.message,
        response: error.response?.data
      })
      throw new Error(error.response?.data?.message || 'Failed to update order status')
    }
  }
}

export { orderService } 
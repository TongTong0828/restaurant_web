import request from '@/utils/request'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://enbytdqrskag.sealoshzh.site'

export interface MenuItem {
  id?: number
  name: string
  description: string
  price: number
  image_url?: string | null
  category: string
  is_available?: boolean
}

interface MenuItemResponse {
  status: string
  data: {
    item: MenuItem
  }
}

interface ImageUploadResponse {
  status: string
  data: {
    url: string
    filename: string
  }
}

export interface RestaurantInfo {
  id: number
  name: string
  description: string
  address: string
  phone: string
  image: string
  categories: string[]
  delivery_fee: number
  minimum_order: number
  opening_hours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  status: 'active' | 'closed' | 'busy'
}

export interface Order {
  id: number
  customer: {
    name: string
    phone: string
    address: string
  }
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
  }>
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface DashboardRestaurant {
  id: number
  name: string
  status: 'active' | 'closed' | 'busy'
  rating: number
}

export interface DashboardOrders {
  total: number
  today: number
  pending: number
  preparing: number
  delivering: number
  completed: number
  cancelled: number
}

export interface DashboardRevenue {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
}

export interface PopularItem {
  id: number
  name: string
  orderCount: number
  revenue: number
}

export interface RecentOrder {
  id: number
  status: string
  total: number
  created_at: string
}

export interface DashboardStatistics {
  averageOrderValue: number
  totalCustomers: number
  repeatCustomers: number
}

export interface DashboardData {
  restaurant: DashboardRestaurant
  orders: DashboardOrders
  revenue: DashboardRevenue
  popularItems: PopularItem[]
  recentOrders: RecentOrder[]
  statistics: DashboardStatistics
}

export interface RestaurantProfile {
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

interface RestaurantResponse {
  status: string
  data: {
    restaurant: RestaurantProfile
  }
}

export const restaurantManagementService = {
  // ��ȡ������Ϣ
  async getRestaurantInfo() {
    try {
      const response = await request.get<{ status: string; data: { restaurant: RestaurantInfo } }>(
        '/api/auth/restaurant/profile'
      )
      if (response.status === 'success') {
        return response.data.restaurant
      }
      throw new Error('Failed to get restaurant info')
    } catch (error: any) {
      console.error('Failed to get restaurant info:', error)
      throw new Error(error.response?.data?.message || 'Failed to get restaurant info')
    }
  },

  // ���²�����Ϣ
  async updateRestaurantInfo(data: Partial<RestaurantInfo>) {
    try {
      const response = await request.put<{ status: string; data: { restaurant: RestaurantInfo } }>(
        '/api/auth/restaurant/profile',
        data
      )
      if (response.status === 'success') {
        return response.data.restaurant
      }
      throw new Error('Failed to update restaurant info')
    } catch (error: any) {
      console.error('Failed to update restaurant info:', error)
      throw new Error(error.response?.data?.message || 'Failed to update restaurant info')
    }
  },

  // ��ȡ�˵��б�
  async getMenuItems(restaurantId: number) {
    try {
      const response = await request.get<{ status: string; data: { items: MenuItem[] } }>(
        `/api/restaurants/${restaurantId}/menu-items`
      )
      if (response.status === 'success') {
        return response.data.items
      }
      throw new Error('Failed to get menu items')
    } catch (error: any) {
      console.error('Failed to get menu items:', error)
      throw new Error(error.response?.data?.message || 'Failed to get menu items')
    }
  },

  // ��Ӳ�Ʒ
  async addMenuItem(restaurantId: number, item: Omit<MenuItem, 'id' | 'image_url' | 'is_available'>) {
    try {
      const token = localStorage.getItem('token')
      console.log('? Adding menu item:', {
        restaurantId,
        item,
        token: token ? `Bearer ${token}` : 'No token found'
      })

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await request.post<MenuItemResponse>(
        `/api/restaurants/${restaurantId}/menu-items`,
        {
          name: item.name,
          description: item.description,
          price: Number(item.price),
          category: item.category
        }
      )
      
      console.log('? Add menu item response:', {
        status: response.status,
        data: response.data,
        rawResponse: response
      })

      // �����Ӧ��ʽ
      if (response.status === 'success') {
        // �����ӳɹ������»�ȡ��Ʒ�б�
        const menuResponse = await request.get<{
          status: string;
          data: { menu_items: Record<string, MenuItem[]>; categories: string[] }
        }>(`/api/restaurants/${restaurantId}/menu-items`)

        if (menuResponse.status === 'success') {
          // �ҵ�����ӵĲ�Ʒ
          const allItems = Object.values(menuResponse.data.menu_items).flat()
          const newItem = allItems[allItems.length - 1] // �����²�Ʒ�����
          console.log('? New menu item:', newItem)
          return newItem
        }
        
        // ����޷���ȡ�²�Ʒ������һ�������ĳɹ���Ӧ
        return {
          id: 0, // ��ʱID
          name: item.name,
          description: item.description,
          price: Number(item.price),
          category: item.category,
          is_available: true
        }
      }
      
      throw new Error(response.message || 'Failed to add menu item')
    } catch (error: any) {
      console.error('? Failed to add menu item:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      })
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Failed to add menu item')
    }
  },

  // �ϴ���ƷͼƬ
  async uploadMenuItemImage(menuItemId: number, imageFile: File) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      console.log('Uploading menu item image:', {
        menuItemId,
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      })

      const token = localStorage.getItem('token')
      console.log('Using API URL:', `${API_URL}/api/upload/menu-item/${menuItemId}/image`)
      
      const response = await axios.post<ImageUploadResponse>(
        `${API_URL}/api/upload/menu-item/${menuItemId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      console.log('Image upload response:', response.data)

      if (response.data.status === 'success') {
        console.log('Image upload successful:', response.data.data)
        return response.data.data
      }
      throw new Error('Failed to upload image')
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  // ���²�Ʒ
  async updateMenuItem(restaurantId: number, menuItemId: number, item: Partial<MenuItem>) {
    try {
      console.log('? Updating menu item:', {
        restaurantId,
        menuItemId,
        item
      })

      const response = await request.put<{
        status: string;
        data: { menuItem: MenuItem };
      }>(
        `/api/restaurants/${restaurantId}/menu-items/${menuItemId}`,
        {
          name: item.name,
          description: item.description,
          price: item.price !== undefined ? Number(item.price) : undefined,
          category: item.category,
          is_available: item.is_available
        }
      )
      
      console.log('? Update menu item response:', response)

      if (response.status === 'success' && response.data?.menuItem) {
        return response.data.menuItem
      }
      throw new Error(response.message || 'Failed to update menu item')
    } catch (error: any) {
      console.error('? Failed to update menu item:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to update menu item')
    }
  },

  // ɾ����Ʒ
  async deleteMenuItem(restaurantId: number, menuItemId: number) {
    try {
      console.log('?? Deleting menu item:', {
        restaurantId,
        menuItemId
      })

      const response = await request.delete(
        `/api/restaurants/${restaurantId}/menu-items/${menuItemId}`
      )
      
      console.log('? Delete menu item response:', {
        status: response?.status,
        data: response?.data,
        rawResponse: response
      })

      // 204 No Content Ҳ�ǳɹ�����Ӧ
      if (response?.status === 'success' || response === null || response === '') {
        return true
      }
      throw new Error(response?.message || 'Failed to delete menu item')
    } catch (error: any) {
      console.error('? Failed to delete menu item:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      })
      
      // �����204 No Content��Ҳ��Ϊ�ǳɹ���
      if (error.response?.status === 204) {
        return true
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to delete menu item')
    }
  },

  // ��ȡ�����б�
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    try {
      console.log('Fetching orders with params:', params)
      const response = await request.get<any>(
        '/api/auth/restaurant/orders',
        { params }
      )
      console.log('Raw orders response:', response)

      // �����Ӧ��ʽ
      if (response) {
        // �����Ӧ�ǿ����飬���ؿ�����
        if (Array.isArray(response) && response.length === 0) {
          return {
            orders: [],
            total: 0
          }
        }

        // �����Ӧ�����飬ֱ��ʹ��
        if (Array.isArray(response)) {
          return {
            orders: response,
            total: response.length
          }
        }

        // �����Ӧ�� data ����
        if (response.data) {
          if (Array.isArray(response.data)) {
            return {
              orders: response.data,
              total: response.data.length
            }
          }
          if (response.data.orders) {
            return {
              orders: response.data.orders,
              total: response.data.total || response.data.orders.length
            }
          }
        }

        // �����Ӧֱ�Ӱ��� orders ����
        if (response.orders) {
          return {
            orders: response.orders,
            total: response.total || response.orders.length
          }
        }
      }

      console.error('Invalid response format:', response)
      return {
        orders: [],
        total: 0
      }
    } catch (error: any) {
      console.error('Failed to get orders:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw new Error(error.response?.data?.message || 'Failed to get orders')
    }
  },

  // ���¶���״̬
  async updateOrderStatus(orderId: number, status: Order['status']) {
    try {
      const response = await request.put<any>(
        `/api/auth/restaurant/orders/${orderId}/status`,
        { status }
      )
      // The backend returns the updated order directly
      if (response) {
        return response
      }
      throw new Error('Failed to update order status')
    } catch (error: any) {
      console.error('Failed to update order status:', error)
      throw new Error(error.response?.data?.message || 'Failed to update order status')
    }
  },

  // ��ȡ�Ǳ�������
  async getDashboardData() {
    try {
      const response = await request.get<{ status: string; data: DashboardData }>(
        '/api/auth/restaurant/dashboard'
      )
      if (response.status === 'success') {
        return response.data
      }
      throw new Error('Failed to get dashboard data')
    } catch (error: any) {
      console.error('Failed to get dashboard data:', error)
      throw new Error(error.response?.data?.message || 'Failed to get dashboard data')
    }
  },

  // ��ȡ������Ϣ
  async getRestaurantProfile(restaurantId: number) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Getting restaurant profile for ID:', restaurantId)
      const response = await request.get<{ status: string; data: { restaurant: RestaurantProfile } }>(
        `/api/restaurants/${restaurantId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      console.log('Get restaurant profile response:', response)
      if (response.status === 'success' && response.data?.restaurant) {
        return response.data
      }
      throw new Error('Failed to get restaurant profile')
    } catch (error: any) {
      console.error('Failed to get restaurant profile:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to get restaurant profile')
    }
  },

  // ���²�����Ϣ
  async updateRestaurantProfile(restaurantId: number, data: Partial<RestaurantProfile>) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Updating restaurant profile...')
      console.log('Restaurant ID:', restaurantId)
      console.log('Update data:', data)

      const response = await request.put<{ status: string; data: { restaurant: RestaurantProfile } }>(
        `/api/restaurants/${restaurantId}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      console.log('Update API response:', response)
      if (response.status === 'success' && response.data?.restaurant) {
        console.log('Update successful, returning updated profile:', response.data.restaurant)
        return response.data.restaurant
      }
      throw new Error('Failed to update restaurant profile')
    } catch (error: any) {
      console.error('Failed to update restaurant profile:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to update restaurant profile')
    }
  },

  // �ϴ�����ͼƬ
  async uploadRestaurantImage(restaurantId: number, formData: FormData) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await request.post<{ status: string; data: { url: string; filename: string } }>(
        `/api/restaurants/${restaurantId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      console.log('Image upload response:', response)
      if (response.status === 'success' && response.data) {
        return response.data
      }
      throw new Error('Failed to upload image')
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to upload image')
    }
  }
} 
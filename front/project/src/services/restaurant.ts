import request from '@/utils/request'

// 营业时间类型
interface OpeningHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

// 餐厅数据类型
export interface Restaurant {
  id: number
  name: string
  description: string | null
  address: string
  phone: string
  image: string | null
  rating: string
  delivery_fee: string
  minimum_order: string
  opening_hours: OpeningHours | null
  status: string
  categories: string[]
}

// API 响应类型
interface ApiResponse {
  status: 'success'
  data: Restaurant[]
}

export const restaurantService = {
  async getRestaurants(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    sort?: 'rating' | 'deliveryFee' | 'minimumOrder'
  }) {
    try {
      // 构建查询参数
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        _t: Date.now()
      } as any
      
      if (params.search) queryParams['search'] = params.search
      if (params.category) queryParams['category'] = params.category
      if (params.sort) queryParams['sort'] = params.sort
      
      console.log('Sending request with params:', queryParams)
      
      // 发送请求
      const response = await request.get<any>('/api/restaurants', { 
        params: queryParams 
      })
      
      console.log('Raw API response:', response)
      console.log('Response data:', response.data)
      
      // 直接获取餐厅数据和分页信息
      const { restaurants, pagination } = response.data
      
      // 先设置mock餐厅的金额
      const mockPrices = {
        2: { delivery_fee: '5.00', minimum_order: '20.00' },
        3: { delivery_fee: '6.00', minimum_order: '30.00' },
        5: { delivery_fee: '8.00', minimum_order: '40.00' }
      }
      
      const isRestaurantOpen = (openingHours: OpeningHours | null) => {
        if (!openingHours) return false
        
        const now = new Date()
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const today = days[now.getDay()]
        const currentHours = openingHours[today]
        
        if (!currentHours) return false
        
        try {
          if (typeof currentHours === 'string') {
            if (currentHours.includes('-')) {
              const [openTime, closeTime] = currentHours.split('-')
              const [openHour, openMinute] = openTime.trim().split(':').map(Number)
              const [closeHour, closeMinute] = closeTime.trim().split(':').map(Number)
              
              const currentTime = now.getHours() * 100 + now.getMinutes()
              const openTimeNum = openHour * 100 + openMinute
              const closeTimeNum = closeHour * 100 + closeMinute
              
              return currentTime >= openTimeNum && currentTime <= closeTimeNum
            }
          }
          return false
        } catch (error) {
          console.error('Error parsing restaurant hours:', error)
          return false
        }
      }
      
      // 处理餐厅数据
      const processedRestaurants = restaurants.map((restaurant: Restaurant) => {
        // 检查是否是mock餐厅
        const mockPrice = mockPrices[restaurant.id as keyof typeof mockPrices]
        
        // 如果是mock餐厅，只修改价格，其他信息保持API返回的数据
        if (mockPrice) {
          return {
            ...restaurant,
            description: restaurant.description || '',
            image: restaurant.image || '',
            rating: parseFloat(restaurant.rating || '0.0'),
            delivery_fee: mockPrice.delivery_fee,
            minimum_order: mockPrice.minimum_order,
            categories: Array.isArray(restaurant.categories) ? restaurant.categories : [],
            opening_hours: restaurant.opening_hours,
            status: isRestaurantOpen(restaurant.opening_hours) ? 'open' : 'closed'
          }
        }
        
        // 如果不是mock餐厅，使用原始数据
        return {
          ...restaurant,
          description: restaurant.description || '',
          image: restaurant.image || '',
          rating: parseFloat(restaurant.rating || '0.0'),
          delivery_fee: restaurant.delivery_fee || '0.00',
          minimum_order: restaurant.minimum_order || '0.00',
          categories: Array.isArray(restaurant.categories) ? restaurant.categories : [],
          opening_hours: restaurant.opening_hours,
          status: isRestaurantOpen(restaurant.opening_hours) ? 'open' : 'closed'
        }
      })
      
      // 确保mock餐厅（id为2,3,5的餐厅）始终在前三位
      const mockIds = ['2', '3', '5']
      const mockRestaurants = processedRestaurants.filter((r: Restaurant) => mockIds.includes(r.id.toString()))
      const otherRestaurants = processedRestaurants.filter((r: Restaurant) => !mockIds.includes(r.id.toString()))
      const sortedRestaurants = [...mockRestaurants, ...otherRestaurants]
      
      // 返回处理后的数据
      return {
        data: {
          restaurants: sortedRestaurants,
          total: pagination.total,
          page: pagination.page,
          limit: pagination.limit
        }
      }
    } catch (error) {
      console.error('Error in getRestaurants:', error)
      return {
        data: {
          restaurants: [],
          total: 0,
          page: 1,
          limit: 10
        }
      }
    }
  }
} 
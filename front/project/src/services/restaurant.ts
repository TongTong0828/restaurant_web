import request from '@/utils/request'

// Ӫҵʱ������
interface OpeningHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

// ������������
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

// API ��Ӧ����
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
      // ������ѯ����
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        _t: Date.now()
      } as any
      
      if (params.search) queryParams['search'] = params.search
      if (params.category) queryParams['category'] = params.category
      if (params.sort) queryParams['sort'] = params.sort
      
      console.log('Sending request with params:', queryParams)
      
      // ��������
      const response = await request.get<any>('/api/restaurants', { 
        params: queryParams 
      })
      
      console.log('Raw API response:', response)
      console.log('Response data:', response.data)
      
      // ֱ�ӻ�ȡ�������ݺͷ�ҳ��Ϣ
      const { restaurants, pagination } = response.data
      
      // ������mock�����Ľ��
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
      
      // �����������
      const processedRestaurants = restaurants.map((restaurant: Restaurant) => {
        // ����Ƿ���mock����
        const mockPrice = mockPrices[restaurant.id as keyof typeof mockPrices]
        
        // �����mock������ֻ�޸ļ۸�������Ϣ����API���ص�����
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
        
        // �������mock������ʹ��ԭʼ����
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
      
      // ȷ��mock������idΪ2,3,5�Ĳ�����ʼ����ǰ��λ
      const mockIds = ['2', '3', '5']
      const mockRestaurants = processedRestaurants.filter((r: Restaurant) => mockIds.includes(r.id.toString()))
      const otherRestaurants = processedRestaurants.filter((r: Restaurant) => !mockIds.includes(r.id.toString()))
      const sortedRestaurants = [...mockRestaurants, ...otherRestaurants]
      
      // ���ش���������
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
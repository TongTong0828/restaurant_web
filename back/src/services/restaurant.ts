import axios from 'axios';

interface RestaurantParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  _t?: number;
}

interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  image: string | null;
  rating: number;
  delivery_fee: number;
  minimum_order: number;
  opening_hours: any;
  status: string;
  categories: string[];
  menu_items?: any;
}

interface ApiResponse {
  status: string;
  data: {
    restaurants: Restaurant[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

function processCategories(categories: any): string[] {
  if (!categories) {
    return [];
  }
  if (Array.isArray(categories)) {
    return categories;
  }
  if (typeof categories === 'string') {
    return categories.split(',').filter(Boolean).map(cat => cat.trim());
  }
  return [];
}

export async function getRestaurants(params: RestaurantParams) {
  try {
    console.log('Sending request with params:', params);
    const response = await axios.get<ApiResponse>('/api/restaurants', { params });
    console.log('Raw API response:', response);

    if (response.data.status !== 'success' || !response.data.data) {
      console.log(' Invalid API response:', response.data);
      return {
        restaurants: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0
      };
    }

    const { restaurants, pagination } = response.data.data;
    
    const processedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      categories: processCategories(restaurant.categories),
      rating: parseFloat(String(restaurant.rating)) || 0,
      delivery_fee: parseFloat(String(restaurant.delivery_fee)) || 0,
      minimum_order: parseFloat(String(restaurant.minimum_order)) || 0
    }));

    return {
      restaurants: processedRestaurants,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      total_pages: pagination.total_pages
    };
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    return {
      restaurants: [],
      total: 0,
      page: 1,
      limit: 10,
      total_pages: 0
    };
  }
} 
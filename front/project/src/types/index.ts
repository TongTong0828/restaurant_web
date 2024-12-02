export interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  phone: string
  image: string
  rating: number
  categories: string[]
  openingHours: {
    open: string
    close: string
  }
  deliveryFee: number
  minimumOrder: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  options?: {
    name: string
    choices: {
      name: string
      price: number
    }[]
  }[]
}

export interface Order {
  id: number | string;
  restaurant: {
    id: number | string;
    name: string;
    image: string;
  };
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
  }>;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  delivery_info: {
    name: string;
    phone: string;
    address: string;
    instructions?: string;
  };
  payment_method: string;
  total_amount: number;
  created_at: string;
} 
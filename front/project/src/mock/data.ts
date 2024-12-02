import type { Restaurant, MenuItem, Order } from '@/types'

export const restaurants: Restaurant[] = [
  {
    id: '2',
    name: 'Chinese Restaurant',
    description: 'Authentic Chinese cuisine with a modern twist',
    address: '123 Main St',
    phone: '555-0123',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    rating: 4.8,
    categories: ['Chinese', 'Asian', 'Fine Dining'],
    opening_hours: {
      monday: '00:00-23:59',
      tuesday: '00:00-23:59',
      wednesday: '00:00-23:59',
      thursday: '00:00-23:59',
      friday: '00:00-23:59',
      saturday: '00:00-23:59',
      sunday: '00:00-23:59'
    },
    deliveryFee: 5,
    minimumOrder: 20
  },
  {
    id: '3',
    name: 'Sushi Restaurant',
    description: 'Premium Japanese sushi and sashimi',
    address: '456 Oak St',
    phone: '555-0124',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    rating: 4.9,
    categories: ['Japanese', 'Sushi', 'Asian'],
    opening_hours: {
      monday: '00:00-23:59',
      tuesday: '00:00-23:59',
      wednesday: '00:00-23:59',
      thursday: '00:00-23:59',
      friday: '00:00-23:59',
      saturday: '00:00-23:59',
      sunday: '00:00-23:59'
    },
    deliveryFee: 6,
    minimumOrder: 30
  },
  {
    id: '5',
    name: 'Pizza Paradise',
    description: 'Authentic Italian pizzas made in wood-fired ovens',
    address: '789 Pine St',
    phone: '555-0125',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800',
    rating: 4.6,
    categories: ['Italian', 'Pizza', 'Western'],
    opening_hours: {
      monday: '00:00-23:59',
      tuesday: '00:00-23:59',
      wednesday: '00:00-23:59',
      thursday: '00:00-23:59',
      friday: '00:00-23:59',
      saturday: '00:00-23:59',
      sunday: '00:00-23:59'
    },
    deliveryFee: 4.50,
    minimumOrder: 25
  }
]

export const menuItems: MenuItem[] = [
  {
    id: '7',
    restaurantId: '2',
    name: 'Kung Pao Chicken',
    description: 'Spicy diced chicken with peanuts and vegetables',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
    category: 'Main Dishes'
  },
  {
    id: '8',
    restaurantId: '2',
    name: 'Kung Pao Shrimp',
    description: 'Spicy wok-fried shrimp with peanuts and vegetables',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    category: 'Main Dishes'
  },
  {
    id: '9',
    restaurantId: '2',
    name: 'Vegetable Spring Rolls',
    description: 'Crispy rolls filled with fresh vegetables',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1548507346-a20ea19de2c7?w=800',
    category: 'Appetizers'
  },
  {
    id: '10',
    restaurantId: '3',
    name: 'California Roll',
    description: 'Crab meat, avocado, and cucumber roll',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    category: 'Rolls'
  },
  {
    id: '11',
    restaurantId: '3',
    name: 'Salmon Nigiri',
    description: 'Fresh salmon over seasoned rice',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800',
    category: 'Nigiri'
  },
  {
    id: '12',
    restaurantId: '3',
    name: 'Vegetable Tempura',
    description: 'Assorted vegetables in crispy tempura batter',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1581167363810-aa89a7b4c29d?w=800',
    category: 'Hot Dishes'
  },
  {
    id: '13',
    restaurantId: '5',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella, basil, and olive oil',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800',
    category: 'Pizzas'
  },
  {
    id: '14',
    restaurantId: '5',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella and tomato sauce',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    category: 'Pizzas'
  },
  {
    id: '15',
    restaurantId: '5',
    name: 'Quattro Formaggi',
    description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and fontina',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    category: 'Pizzas'
  },
  {
    id: '16',
    restaurantId: '5',
    name: 'Garlic Bread',
    description: 'Fresh baked bread with garlic butter and herbs',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800',
    category: 'Sides'
  },
  {
    id: '17',
    restaurantId: '5',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan cheese with caesar dressing',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800',
    category: 'Salads'
  }
]

export const orders: Order[] = [
  {
    id: '1',
    items: [
      {
        id: '1',
        name: 'Sweet and Sour Chicken',
        quantity: 2,
        price: 15.99
      },
      {
        id: '3',
        name: 'Vegetable Spring Rolls',
        quantity: 1,
        price: 6.99
      }
    ],
    status: 'delivered',
    totalAmount: 38.97,
    deliveryAddress: '456 Oak St, Beijing',
    createdAt: '2024-01-20T12:00:00Z',
    restaurantId: '1',
    restaurantName: 'Golden Dragon Restaurant'
  },
  {
    id: '2',
    items: [
      {
        id: '2',
        name: 'Kung Pao Shrimp',
        quantity: 1,
        price: 18.99
      }
    ],
    status: 'preparing',
    totalAmount: 18.99,
    deliveryAddress: '789 Pine St, Beijing',
    createdAt: new Date().toISOString(),
    restaurantId: '1',
    restaurantName: 'Golden Dragon Restaurant'
  }
] 
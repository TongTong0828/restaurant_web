<template>
  <div class="restaurant-detail">
    <template v-if="restaurant">
      <div class="content">
        <!-- Restaurant Header -->
        <div class="restaurant-header">
          <div class="restaurant-info">
            <h1>{{ restaurant.name }}</h1>
            <div class="meta">
              <div class="rating">
                <el-rate
                  v-model="restaurant.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
              <div class="categories">
                {{ restaurant.categories?.join(' | ') }}
              </div>
            </div>
            <div class="details">
              <div class="detail-item">
                <el-icon><Location /></el-icon>
                <span>{{ restaurant.address }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Phone /></el-icon>
                <span>{{ restaurant.phone }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Timer /></el-icon>
                <span>{{ getOpeningHoursText() }}</span>
              </div>
            </div>
          </div>
          <div class="restaurant-image" v-if="restaurant.image">
            <img :src="restaurant.image" :alt="restaurant.name">
          </div>
        </div>

        <!-- Menu Section -->
        <div class="menu-section">
          <h2>Menu</h2>
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="error" class="error-state">
            {{ error }}
          </div>
          <div v-else>
            <div v-for="category in menuCategories" :key="category" class="menu-category">
              <h3 class="category-title">{{ category }}</h3>
              <div class="menu-items">
                <div
                  v-for="item in menuByCategory[category]"
                  :key="item.id"
                  class="menu-item"
                  :class="{ 'unavailable': item.is_available === false }"
                >
                  <div class="item-image">
                    <el-image
                      :src="item.image_url || item.image || '/default-dish.jpg'"
                      :alt="item.name"
                      fit="cover"
                      loading="lazy"
                      :preview-src-list="[item.image_url || item.image].filter(Boolean)"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>Image not available</span>
                        </div>
                      </template>
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><Loading /></el-icon>
                          <span>Loading...</span>
                        </div>
                      </template>
                    </el-image>
                    <div v-if="item.is_available === false" class="unavailable-overlay">
                      Out of Stock
                    </div>
                  </div>
                  <div class="item-info">
                    <h3>{{ item.name }}</h3>
                    <p class="description">{{ item.description }}</p>
                    <div class="price-action">
                      <span class="price">${{ item.price.toFixed(2) }}</span>
                      <el-button
                        type="primary"
                        size="small"
                        @click="addToCart(item)"
                        :disabled="item.is_available === false"
                      >
                        {{ item.is_available === false ? 'Out of Stock' : 'Add to Cart' }}
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Drawer -->
        <el-drawer
          v-model="cartDrawerVisible"
          title="Your Cart"
          direction="rtl"
          size="400px"
        >
          <div class="cart-content">
            <div v-if="cartItems.length" class="cart-items">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="cart-item"
              >
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <span class="price">${{ item.price.toFixed(2) }}</span>
                </div>
                <div class="quantity-control">
                  <el-button
                    type="primary"
                    circle
                    size="small"
                    @click="decreaseQuantity(item)"
                  >-</el-button>
                  <span>{{ item.quantity }}</span>
                  <el-button
                    type="primary"
                    circle
                    size="small"
                    @click="increaseQuantity(item)"
                  >+</el-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-cart">
              Your cart is empty
            </div>

            <div v-if="cartItems.length" class="cart-summary">
              <div class="subtotal">
                <span>Subtotal:</span>
                <span>${{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="delivery-fee">
                <span>Delivery Fee:</span>
                <span>${{ getDeliveryFee() }}</span>
              </div>
              <div class="total">
                <span>Total:</span>
                <span>${{ (cartTotal + getDeliveryFee()).toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="cartItems.length" class="cart-actions">
              <el-button
                type="primary"
                :disabled="cartTotal < getMinimumOrder()"
                @click="proceedToCheckout"
              >
                Proceed to Checkout
              </el-button>
              <div v-if="cartTotal < getMinimumOrder()" class="minimum-order-warning">
                Minimum order amount: ${{ getMinimumOrder() }} (before delivery fee)
              </div>
            </div>
          </div>
        </el-drawer>
      </div>
    </template>
    <template v-else>
      <el-empty description="Restaurant does not exist">
        <template #extra>
          <router-link to="/restaurants">
            <el-button type="primary">Browse other restaurants</el-button>
          </router-link>
        </template>
      </el-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Phone, Timer, Picture, Loading } from '@element-plus/icons-vue'
import { restaurants as mockRestaurants, menuItems as mockMenuItems } from '@/mock/data'
import request from '@/utils/request'
import type { Restaurant, MenuItem } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

interface MenuResponse {
  status: string
  data: {
    menu_items: Record<string, MenuItem[]>
    categories: string[]
  }
}

interface RestaurantResponse {
  status: string
  data: Restaurant
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const restaurant = ref<Restaurant | null>(null)
const menuItems = ref<MenuItem[]>([])
const menuCategories = ref<string[]>([])
const menuByCategory = ref<Record<string, MenuItem[]>>({})
const loading = ref(false)
const error = ref<string | null>(null)
const cartItems = ref<(MenuItem & { quantity: number })[]>([])
const cartDrawerVisible = ref(false)

// Fetch restaurant data from API
const fetchRestaurant = async (restaurantId: string) => {
  try {
    console.log('Fetching restaurant data:', restaurantId)
    const response = await request.get<any>(`/api/restaurants/${restaurantId}`)
    console.log('Restaurant API response:', response)
    
    if (response.status === 'success' && response.data) {
      restaurant.value = response.data.restaurant || response.data
      console.log('Set restaurant data:', restaurant.value)
      return true
    }
    console.log('Invalid restaurant response:', response)
    return false
  } catch (err) {
    console.error('Error fetching restaurant:', err)
    return false
  }
}

// Fetch menu items from API
const fetchMenuItems = async (restaurantId: string) => {
  try {
    loading.value = true
    error.value = null
    console.log('Fetching menu items for restaurant:', restaurantId)
    
    const response = await request.get<any>(`/api/restaurants/${restaurantId}/menu-items`)
    console.log('Menu items response:', response)
    
    if (response.status === 'success') {
      if (response.data.menu_items && typeof response.data.menu_items === 'object') {
        menuByCategory.value = response.data.menu_items
        menuCategories.value = response.data.categories || Object.keys(response.data.menu_items)
        menuItems.value = Object.values(response.data.menu_items).flat()
        
        console.log('Menu data details:', {
          categories: menuCategories.value,
          totalItems: menuItems.value.length,
          itemsByCategory: Object.entries(menuByCategory.value).map(([category, items]) => ({
            category,
            itemCount: items.length,
            sampleItem: items[0]
          }))
        })

        // ºÏ≤ÈÕº∆¨URL
        const itemsWithImages = menuItems.value.filter(item => item.image_url || item.image)
        console.log('Items with images:', {
          total: menuItems.value.length,
          withImages: itemsWithImages.length,
          sampleUrls: itemsWithImages.slice(0, 3).map(item => ({
            id: item.id,
            name: item.name,
            imageUrl: item.image_url || item.image
          }))
        })
      } else {
        error.value = 'Invalid menu items format'
        menuItems.value = []
        menuCategories.value = []
        menuByCategory.value = {}
      }
    }
  } catch (err: any) {
    console.error('Error fetching menu items:', err)
    if (err.response?.status === 404) {
      error.value = 'No menu items available'
    } else {
      error.value = 'Failed to load menu items'
    }
    menuItems.value = []
    menuCategories.value = []
    menuByCategory.value = {}
  } finally {
    loading.value = false
  }
}

// Find restaurant by ID from route params
onMounted(async () => {
  const restaurantId = route.params.id as string
  // Define mock restaurant IDs
  const mockRestaurantIds = ['2', '3', '5']
  
  if (mockRestaurantIds.includes(restaurantId)) {
    // Use mock data for specific mock restaurant IDs
    const mockRestaurant = mockRestaurants.find(r => r.id === restaurantId)
    if (mockRestaurant) {
      restaurant.value = mockRestaurant
      // Use mock menu items
      const mockMenu = mockMenuItems.filter(item => item.restaurantId === restaurantId)
      menuItems.value = mockMenu
      
      // Group mock menu items by category
      menuByCategory.value = mockMenu.reduce((acc, item) => {
        const category = item.category || 'Œ¥∑÷¿‡'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      }, {} as Record<string, MenuItem[]>)
      
      menuCategories.value = Object.keys(menuByCategory.value)
    }
  } else {
    // Fetch restaurant and menu data from API for non-mock restaurants
    console.log('Fetching API data for restaurant:', restaurantId)
    const restaurantExists = await fetchRestaurant(restaurantId)
    console.log('Restaurant exists:', restaurantExists)
    if (restaurantExists) {
      await fetchMenuItems(restaurantId)
    } else {
      error.value = 'Restaurant does not exist'
    }
  }
  
  // Load cart from localStorage
  const cartData = localStorage.getItem('cart')
  if (cartData) {
    const cart = JSON.parse(cartData)
    if (cart.restaurantId === restaurantId) {
      cartItems.value = cart.items
    }
  }
})

// Format time to ensure HH:MM format
const formatTime = (time: string) => {
  if (!time) return ''
  // Split time into hours and minutes
  const [hours, minutes] = time.split(':')
  // Pad with leading zeros if needed
  return `${hours.padStart(2, '0')}:${minutes ? minutes.padStart(2, '0') : '00'}`
}

// Get opening hours text
const getOpeningHoursText = () => {
  if (!restaurant.value?.opening_hours) {
    return 'Open 24/7'
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  const hours = restaurant.value.opening_hours[today]

  // Handle different time formats
  if (hours) {
    if (typeof hours === 'string') {
      // If it's already in HH:MM-HH:MM format
      if (hours.includes('-')) {
        const [open, close] = hours.split('-')
        return `${formatTime(open)}-${formatTime(close)}`
      }
      return hours
    }
    if (typeof hours === 'object' && hours.open && hours.close) {
      return `${formatTime(hours.open)}-${formatTime(hours.close)}`
    }
  }
  
  return 'Closed'
}

// Computed cart total
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + parseFloat(item.price.toString()) * item.quantity, 0)
})

// Cart methods
const addToCart = (item: MenuItem) => {
  // Check if restaurant exists
  if (!restaurant.value || !restaurant.value.id) {
    ElMessage.error('Restaurant information not available')
    return
  }

  // Initialize cart if empty
  if (!cartItems.value.length) {
    cartItems.value = []
  }

  // Check if item already exists in cart
  const existingItem = cartItems.value.find(cartItem => cartItem.id === item.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    // Save complete item information
    cartItems.value.push({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image_url || item.image,
      category: item.category,
      quantity: 1
    })
  }

  // Save cart to localStorage with complete restaurant info
  const restaurantId = restaurant.value.id.toString()
  const cartData = {
    restaurantId,
    restaurant: {
      id: restaurantId,
      name: restaurant.value.name,
      delivery_fee: restaurant.value.delivery_fee || '0',
      minimum_order: restaurant.value.minimum_order || '0'
    },
    items: cartItems.value
  }
  console.log('Saving cart data:', cartData)
  localStorage.setItem('cart', JSON.stringify(cartData))

  cartDrawerVisible.value = true
  ElMessage.success('Item added to cart')
}

const increaseQuantity = (item: MenuItem & { quantity: number }) => {
  item.quantity++
  saveCart()
}

const decreaseQuantity = (item: MenuItem & { quantity: number }) => {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    cartItems.value = cartItems.value.filter(i => i.id !== item.id)
  }
  saveCart()
}

const saveCart = () => {
  if (restaurant.value) {
    const cartData = {
      restaurantId: restaurant.value.id.toString(),
      restaurant: {
        id: restaurant.value.id.toString(),
        name: restaurant.value.name,
        delivery_fee: restaurant.value.delivery_fee || restaurant.value.deliveryFee || '0',
        minimum_order: restaurant.value.minimum_order || restaurant.value.minimumOrder || '0'
      },
      items: cartItems.value
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }
}

const proceedToCheckout = () => {
  if (!authStore.isAuthenticated && !userStore.isLoggedIn) {
    ElMessage.warning('Please login to continue')
    localStorage.setItem('redirectPath', '/checkout')
    router.push({
      path: '/auth/login',
      query: { redirect: '/checkout' }
    })
    return
  }
  
  if (restaurant.value) {
    saveCart()
    router.push('/checkout')
  }
}

// Get delivery fee
const getDeliveryFee = () => {
  if (!restaurant.value) return 0
  // Try both delivery_fee and deliveryFee
  const fee = restaurant.value.delivery_fee || restaurant.value.deliveryFee
  return fee ? parseFloat(fee) : 0
}

// Get minimum order
const getMinimumOrder = () => {
  if (!restaurant.value) return 0
  // Try both minimum_order and minimumOrder
  const minOrder = restaurant.value.minimum_order || restaurant.value.minimumOrder
  return minOrder ? parseFloat(minOrder) : 0
}
</script>

<style scoped lang="scss">
.restaurant-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.restaurant-header {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-bottom: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.restaurant-info {
  padding: 20px;
  
  h1 {
    margin: 0 0 16px 0;
    font-size: 24px;
    color: #303133;
  }
}

.meta {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 20px;
}

.categories {
  color: #606266;
  font-size: 14px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.details {
  margin-top: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.restaurant-image {
  height: 200px;
  overflow: hidden;
  border-radius: 0 8px 8px 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.menu-section {
  margin-top: 40px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  
  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    color: #303133;
  }
}

.menu-category {
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.category-title {
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;
  color: #303133;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.menu-item {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }
  
  &.unavailable {
    opacity: 0.7;
  }
}

.item-image {
  position: relative;
  height: 200px;
  width: 100%;
  background-color: #f5f7fa;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  
  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }
  
  .image-error,
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
  }
  
  .image-placeholder {
    background-color: #f5f7fa;
    .el-icon {
      animation: rotating 2s linear infinite;
    }
  }
  
  .unavailable-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.item-info {
  padding: 15px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #303133;
  }
}

.description {
  color: #606266;
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.4;
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #F56C6C;
}

.loading-state,
.error-state {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.error-state {
  color: #F56C6C;
}

.cart-content {
  padding: 20px;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #EBEEF5;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-summary {
  margin: 20px 0;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
  
  > div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #606266;
  }
}

.total {
  font-weight: bold;
  font-size: 1.2em;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
  color: #303133;
}

.cart-actions {
  margin-top: 20px;
}

.minimum-order-warning {
  margin-top: 10px;
  color: #E6A23C;
  text-align: center;
  font-size: 14px;
}

.empty-cart {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}
</style> 
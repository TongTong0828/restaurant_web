<template>
  <div class="cart-page">
    <h1>Shopping Cart</h1>

    <div v-if="cartItems.length > 0" class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="price">?{{ item.price }}</p>
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
          <div class="item-total">
            ?{{ (item.price * item.quantity).toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-item">
          <span>Subtotal:</span>
          <span>?{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>Delivery Fee:</span>
          <span>?{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div class="summary-item total">
          <span>Total:</span>
          <span>?{{ total.toFixed(2) }}</span>
        </div>

        <div class="actions">
          <el-button @click="$router.push('/restaurants')">
            Continue Shopping
          </el-button>
          <el-button
            type="primary"
            :disabled="!canCheckout"
            @click="proceedToCheckout"
          >
            Proceed to Checkout
          </el-button>
        </div>

        <div v-if="!canCheckout" class="minimum-order-warning">
          Minimum order amount: ?{{ restaurant?.minimumOrder }}
        </div>
      </div>
    </div>

    <el-empty v-else description="Your cart is empty">
      <template #extra>
        <router-link to="/restaurants">
          <el-button type="primary">Browse Restaurants</el-button>
        </router-link>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { restaurants } from '@/mock/data'
import type { Restaurant, MenuItem } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const cartItems = ref<(MenuItem & { quantity: number })[]>([])
const restaurant = ref<Restaurant | null>(null)

// Load cart data from localStorage
const loadCartData = () => {
  const cartData = localStorage.getItem('cart')
  console.log('Raw cart data from localStorage:', cartData)
  
  if (cartData) {
    try {
      const cart = JSON.parse(cartData)
      console.log('Parsed cart data:', cart)
      
      // Check cart data structure
      console.log('Cart validation:', {
        hasRestaurantId: !!cart.restaurantId,
        hasItems: Array.isArray(cart.items),
        hasRestaurant: !!cart.restaurant && !!cart.restaurant.id
      })
      
      if (!cart.restaurantId || !Array.isArray(cart.items)) {
        console.error('Cart validation failed:', {
          restaurantId: cart.restaurantId,
          items: cart.items,
          restaurant: cart.restaurant
        })
        throw new Error('Invalid cart data')
      }

      // Ensure restaurant object has required fields
      if (!cart.restaurant || !cart.restaurant.id || !cart.restaurant.name) {
        console.error('Invalid restaurant data in cart:', cart.restaurant)
        throw new Error('Invalid restaurant data')
      }

      // Use restaurant info from cart data
      restaurant.value = cart.restaurant

      cartItems.value = cart.items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity.toString())
      }))

      console.log('Successfully loaded cart:', {
        restaurant: restaurant.value,
        items: cartItems.value
      })
    } catch (error) {
      console.error('Failed to load cart:', error)
      clearCart()
    }
  }
}

// Save cart data to localStorage
const saveCart = () => {
  if (restaurant.value && cartItems.value.length > 0) {
    const cartData = {
      restaurantId: restaurant.value.id,
      restaurant: restaurant.value,
      items: cartItems.value.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        category: item.category,
        quantity: item.quantity
      }))
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
    console.log('Saved cart:', cartData)
  } else {
    clearCart()
  }
}

// Clear cart
const clearCart = () => {
  cartItems.value = []
  restaurant.value = null
  localStorage.removeItem('cart')
  console.log('Cart cleared')
}

// Cart operations
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

// Computed values
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const deliveryFee = computed(() => {
  return restaurant.value?.deliveryFee || 0
})

const total = computed(() => {
  return subtotal.value + deliveryFee.value
})

const canCheckout = computed(() => {
  return subtotal.value >= (restaurant.value?.minimumOrder || 0)
})

// Navigation
const proceedToCheckout = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Please login to continue')
    router.push({
      path: '/auth/login',
      query: { redirect: '/checkout' }
    })
    return
  }
  router.push('/checkout')
}

// Load cart data on mount
onMounted(() => {
  loadCartData()
})
</script>

<style scoped lang="scss">
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .item-info {
    flex: 1;

    h3 {
      margin: 0 0 4px;
      font-size: 1.1rem;
    }

    .price {
      color: #666;
      margin: 0;
    }
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 24px;
  }

  .item-total {
    font-weight: 500;
    color: var(--el-color-primary);
    min-width: 80px;
    text-align: right;
  }
}

.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    color: #666;

    &.total {
      color: #303133;
      font-weight: 500;
      font-size: 1.2rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #eee;
    }
  }

  .actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;

    .el-button {
      flex: 1;
    }
  }

  .minimum-order-warning {
    margin-top: 12px;
    color: #f56c6c;
    font-size: 0.875rem;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 20px;

    h1 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .quantity-control {
      margin: 0;
    }

    .item-total {
      align-self: flex-end;
    }
  }

  .cart-summary {
    .actions {
      flex-direction: column;
    }
  }
}
</style> 
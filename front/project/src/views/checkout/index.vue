<template>
  <div class="checkout-page">
    <h1>Checkout</h1>

    <div class="checkout-content" v-if="cartItems.length">
      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="restaurant-info">
          <h3>{{ restaurant?.name }}</h3>
          <p>{{ restaurant?.address }}</p>
        </div>

        <div class="items-list">
          <div v-for="item in cartItems" :key="item.id" class="item">
            <span class="quantity">{{ item.quantity }}x</span>
            <span class="name">{{ item.name }}</span>
            <span class="price">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <span>Subtotal:</span>
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span>Delivery Fee:</span>
            <span>${{ deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>Total:</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Form -->
      <div class="delivery-form">
        <h2>Delivery Information</h2>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
        >
          <el-form-item label="Full Name" prop="name">
            <el-input v-model="form.name" placeholder="Enter your full name" />
          </el-form-item>

          <el-form-item label="Phone Number" prop="phone">
            <el-input v-model="form.phone" placeholder="Enter your phone number" />
          </el-form-item>

          <el-form-item label="Delivery Address" prop="address">
            <el-input
              v-model="form.address"
              type="textarea"
              :rows="2"
              placeholder="Enter your delivery address"
            />
          </el-form-item>

          <el-form-item label="Delivery Instructions (Optional)">
            <el-input
              v-model="form.instructions"
              type="textarea"
              :rows="2"
              placeholder="Any special instructions for delivery? (Optional)"
            />
          </el-form-item>

          <el-form-item label="Payment Method" prop="paymentMethod">
            <el-radio-group v-model="form.paymentMethod">
              <el-radio label="cash">Cash on Delivery</el-radio>
              <el-radio label="credit_card">Online Payment</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- Online Payment Form -->
          <template v-if="form.paymentMethod === 'credit_card'">
            <el-form-item label="Card Number" prop="cardNumber">
              <el-input 
                v-model="form.cardNumber" 
                placeholder="Enter your card number"
                maxlength="16"
              />
            </el-form-item>

            <div class="card-details">
              <el-form-item label="Expiry Date" prop="cardExpiry">
                <el-input 
                  v-model="form.cardExpiry" 
                  placeholder="MM/YY"
                  maxlength="5"
                />
              </el-form-item>

              <el-form-item label="CVV" prop="cardCvv">
                <el-input 
                  v-model="form.cardCvv" 
                  placeholder="CVV"
                  maxlength="3"
                  show-password
                />
              </el-form-item>
            </div>

            <el-form-item label="Card Holder Name" prop="cardHolderName">
              <el-input 
                v-model="form.cardHolderName" 
                placeholder="Name on card"
              />
            </el-form-item>
          </template>

          <div class="actions">
            <el-button @click="$router.push('/cart')">Back to Cart</el-button>
            <el-button
              type="primary"
              :loading="loading"
              @click="submitOrder"
              :disabled="!cartItems.length"
            >
              Place Order (${{ total.toFixed(2) }})
            </el-button>
          </div>
        </el-form>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/order'
import request from '@/utils/request'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// Cart data
const cartItems = ref<any[]>([])
const restaurant = ref<any>(null)

// Form data
const form = ref({
  name: '',
  phone: '',
  address: '',
  instructions: '',
  paymentMethod: 'cash',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  cardHolderName: ''
})

// Validation rules
const rules = ref<FormRules>({
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter your phone number', trigger: 'blur' }
  ],
  address: [
    { required: true, message: 'Please enter your address', trigger: 'blur' },
    { min: 5, message: 'Address must be at least 5 characters', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: 'Please select a payment method', trigger: 'change' }
  ],
  cardNumber: [
    {
      required: true,
      message: 'Please enter card number',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.value.paymentMethod === 'credit_card') {
          if (!value) {
            callback(new Error('Please enter card number'))
          } else if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
            callback(new Error('Please enter a valid 16-digit card number'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ],
  cardExpiry: [
    {
      required: true,
      message: 'Please enter expiry date',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.value.paymentMethod === 'credit_card') {
          if (!value) {
            callback(new Error('Please enter expiry date'))
          } else if (!/^\d{2}\/\d{2}$/.test(value)) {
            callback(new Error('Please enter date in MM/YY format'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ],
  cardCvv: [
    {
      required: true,
      message: 'Please enter CVV',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.value.paymentMethod === 'credit_card') {
          if (!value) {
            callback(new Error('Please enter CVV'))
          } else if (!/^\d{3}$/.test(value)) {
            callback(new Error('Please enter a valid 3-digit CVV'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ],
  cardHolderName: [
    {
      required: true,
      message: 'Please enter card holder name',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.value.paymentMethod === 'credit_card') {
          if (!value) {
            callback(new Error('Please enter card holder name'))
          } else if (value.length < 2) {
            callback(new Error('Name must be at least 2 characters'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ]
})

// Computed values
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
})

const deliveryFee = computed(() => {
  return Number(restaurant.value?.delivery_fee) || 0
})

const total = computed(() => {
  return subtotal.value + deliveryFee.value
})

// Load cart data
const loadCartData = () => {
  const cartData = localStorage.getItem('cart')
  console.log('Raw cart data from localStorage:', cartData)
  
  if (!cartData) {
    ElMessage.warning('Your cart is empty')
    router.push('/restaurants')
    return
  }

  try {
    const cart = JSON.parse(cartData)
    console.log('Parsed cart data:', cart)
    
    // Validate cart data
    if (!cart.restaurantId || !Array.isArray(cart.items)) {
      throw new Error('Invalid cart data')
    }

    // If restaurant info is not in cart, try to fetch it
    if (!cart.restaurant) {
      // For mock restaurants, create a basic restaurant object
      restaurant.value = {
        id: cart.restaurantId,
        delivery_fee: 2.00,  // Default delivery fee
        minimum_order: 10.00  // Default minimum order
      }
    } else {
      // Use restaurant info from cart
      restaurant.value = {
        ...cart.restaurant,
        delivery_fee: Number(cart.restaurant.delivery_fee) || 0,
        minimum_order: Number(cart.restaurant.minimum_order) || 0
      }
    }

    // Load cart items
    cartItems.value = cart.items.map(item => ({
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }))

    console.log('Loaded cart data:', {
      restaurant: restaurant.value,
      items: cartItems.value
    })
  } catch (error) {
    console.error('Failed to load cart:', error)
    ElMessage.error('Failed to load cart data')
    router.push('/restaurants')
  }
}

// Submit order
const submitOrder = async () => {
  if (!formRef.value) return

  try {
    // Validate form
    await formRef.value.validate()
    loading.value = true

    if (!restaurant.value) {
      throw new Error('Restaurant not found')
    }

    // Prepare order data according to API documentation
    const orderData = {
      restaurantId: restaurant.value.id,
      items: cartItems.value.map(item => ({
        menuItemId: item.id,
        quantity: Number(item.quantity)
      })),
      deliveryInfo: {
        address: form.value.address,
        phone: form.value.phone
      },
      paymentMethod: form.value.paymentMethod
    }

    // Add payment details if using credit card
    if (form.value.paymentMethod === 'credit_card') {
      const cardNumber = form.value.cardNumber.replace(/\s/g, '')
      orderData.paymentDetails = {
        cardLastFour: cardNumber.slice(-4),
        cardHolderName: form.value.cardHolderName
      }
    }

    console.log('Sending order data:', orderData)

    // Send order to API
    const response = await request.post('/api/orders', orderData)
    console.log('Order response:', response)
    
    if (response.message === 'Order created successfully') {
      // Clear cart after successful order
      localStorage.removeItem('cart')
      
      // Show success message with order details
      await ElMessageBox.alert(
        `Order created successfully!\n\n` +
        `Order Number: ${response.orderNumber}\n` +
        `Order ID: ${response.orderId}`,
        'Order Confirmed',
        {
          confirmButtonText: 'View Orders',
          type: 'success'
        }
      )
      
      // Redirect to orders page
      router.push('/orders')
    } else {
      throw new Error('Failed to create order')
    }
  } catch (error: any) {
    console.error('Failed to create order:', error)
    
    // Handle specific error cases
    if (error.response?.data?.error) {
      switch (error.response.data.error) {
        case 'Minimum order amount is 20.00':
          ElMessage.error(`Order amount too low. Minimum order amount is $20.00`)
          break
        case 'Some menu items are not available':
          ElMessage.error('Some items in your cart are no longer available')
          break
        case 'Restaurant not found or not active':
          ElMessage.error('Restaurant is currently not available')
          break
        case 'Payment details are required for credit card payment':
          ElMessage.error('Please provide valid payment details')
          break
        case 'Delivery information is required':
          ElMessage.error('Please provide delivery information')
          break
        case 'Invalid payment method':
          ElMessage.error('Please select a valid payment method')
          break
        default:
          ElMessage.error(error.response.data.error)
      }
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('Failed to create order. Please try again.')
    }
  } finally {
    loading.value = false
  }
}

// Check authentication and load cart data
onMounted(() => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Please login to continue')
    router.push({
      path: '/auth/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  loadCartData()
})

// Format card number input
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

// Watch card number input for formatting
watch(() => form.value.cardNumber, (val) => {
  if (val) {
    form.value.cardNumber = formatCardNumber(val)
  }
})

// Format expiry date input
const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.slice(0, 2) + '/' + v.slice(2, 4)
  }
  return v
}

// Watch expiry date input for formatting
watch(() => form.value.cardExpiry, (val) => {
  if (val) {
    form.value.cardExpiry = formatExpiryDate(val)
  }
})
</script>

<style scoped lang="scss">
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #303133;
  }
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.order-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;

  h2 {
    margin-bottom: 1.5rem;
    color: #303133;
  }

  .restaurant-info {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0 0 0.5rem;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
      font-size: 0.9rem;
    }
  }

  .items-list {
    margin-bottom: 1.5rem;

    .item {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      color: #606266;

      .quantity {
        color: #409EFF;
        margin-right: 0.75rem;
        min-width: 30px;
      }

      .name {
        flex: 1;
      }

      .price {
        font-weight: 500;
      }
    }
  }

  .summary {
    border-top: 1px solid #eee;
    padding-top: 1rem;

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      color: #606266;

      &.total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed #eee;
        font-weight: bold;
        color: #303133;
        font-size: 1.1rem;
      }
    }
  }
}

.delivery-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 1.5rem;
    color: #303133;
  }

  .card-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 2rem;
}
</style> 
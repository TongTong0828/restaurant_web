<template>
  <div class="order-detail-page">
    <div class="page-header">
      <el-button @click="$router.back()" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        Back
      </el-button>
      <h1>Order Details</h1>
    </div>

    <div class="order-content" v-loading="loading">
      <template v-if="order">
        <el-card class="order-info">
          <template #header>
            <div class="card-header">
              <h3>Order #{{ order.order_number }}</h3>
              <el-tag :type="getStatusType(order.status)">
                {{ formatStatus(order.status) }}
              </el-tag>
            </div>
          </template>

          <!-- Restaurant Info -->
          <div class="info-section">
            <h4>Restaurant Information</h4>
            <div class="restaurant-info">
              <el-image 
                :src="order.restaurant?.image" 
                fit="cover"
                class="restaurant-image"
                @error="(e) => { console.error('Failed to load restaurant image:', e, order.restaurant?.image) }"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="restaurant-details">
                <h5>{{ order.restaurant?.name }}</h5>
                <p>{{ order.restaurant?.address }}</p>
                <p>Tel: {{ order.restaurant?.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="info-section">
            <h4>Order Items</h4>
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <div class="item-info">
                  <span class="item-quantity">{{ item.quantity }}x</span>
                  <span class="item-name">{{ item.name }}</span>
                </div>
                <div class="item-price">
                  <span class="unit-price">${{ item.price }} each</span>
                  <span class="subtotal">${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Info -->
          <div class="info-section">
            <h4>Delivery Information</h4>
            <div class="delivery-info">
              <p><strong>Address:</strong> {{ order.delivery_info?.address }}</p>
              <p><strong>Phone:</strong> {{ order.delivery_info?.phone }}</p>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="info-section">
            <h4>Payment Information</h4>
            <div class="payment-info">
              <p><strong>Payment Method:</strong> {{ formatPaymentMethod(order.payment_method) }}</p>
              <div class="order-summary">
                <div class="summary-item">
                  <span>Subtotal:</span>
                  <span>${{ calculateSubtotal(order.items).toFixed(2) }}</span>
                </div>
                <div class="summary-item">
                  <span>Delivery Fee:</span>
                  <span>${{ Number(order.delivery_fee || 0).toFixed(2) }}</span>
                </div>
                <div class="summary-item total">
                  <span>Total:</span>
                  <span>${{ Number(order.total_amount).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="order-actions" v-if="order.status === 'pending'">
            <el-button type="danger" @click="cancelOrder">Cancel Order</el-button>
          </div>
        </el-card>
      </template>

      <el-empty v-else-if="!loading" description="Order not found" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const order = ref(null)

// Calculate subtotal
const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

// Load order details
const loadOrderDetails = async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    const response = await request.get(`/api/orders/user/${orderId}`)
    console.log('Order API Response:', response)
    if (response && response.id) {
      order.value = response
    } else {
      console.log('Order not found in response:', response)
      ElMessage.warning('Order not found')
    }
  } catch (error) {
    console.error('Failed to load order details:', error)
    ElMessage.error('Failed to load order details')
  } finally {
    loading.value = false
  }
}

// Format status
const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Get status type for tag
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'info',
    ready: 'success',
    delivering: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// Format payment method
const formatPaymentMethod = (method) => {
  switch (method) {
    case 'cash':
      return 'Cash on Delivery'
    case 'credit_card':
      return 'Credit Card'
    default:
      return method
  }
}

// Cancel order
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this order?',
      'Cancel Order',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )

    const response = await request.put(`/api/orders/user/${order.value.id}/cancel`)
    if (response.data?.message === 'Order cancelled successfully') {
      ElMessage.success('Order cancelled successfully')
      loadOrderDetails() // Reload order details
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('Failed to cancel order:', error)
    ElMessage.error(error.response?.data?.message || 'Failed to cancel order')
  }
}

// Load order details on mount
onMounted(() => {
  loadOrderDetails()
})
</script>

<style scoped lang="scss">
.order-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;

    .back-button {
      margin-right: 1rem;
    }

    h1 {
      margin: 0;
      color: #303133;
    }
  }
}

.order-info {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #303133;
    }
  }
}

.info-section {
  margin-bottom: 2rem;

  h4 {
    margin: 0 0 1rem;
    color: #303133;
    font-size: 1.1rem;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.restaurant-info {
  display: flex;
  gap: 1rem;

  .restaurant-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
  }

  .restaurant-details {
    h5 {
      margin: 0 0 0.5rem;
      color: #303133;
    }

    p {
      margin: 0 0 0.25rem;
      color: #606266;
      font-size: 0.9rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.order-items {
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .item-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .item-quantity {
        color: #409EFF;
      }

      .item-name {
        color: #303133;
      }
    }

    .item-price {
      text-align: right;

      .unit-price {
        display: block;
        color: #909399;
        font-size: 0.9rem;
      }

      .subtotal {
        color: #303133;
        font-weight: 500;
      }
    }
  }
}

.delivery-info,
.payment-info {
  p {
    margin: 0 0 0.5rem;
    color: #606266;

    strong {
      color: #303133;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.order-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #EBEEF5;

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #606266;

    &.total {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px dashed #EBEEF5;
      color: #303133;
      font-weight: 500;
      font-size: 1.1rem;
    }
  }
}

.order-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

@media (max-width: 768px) {
  .order-detail-page {
    padding: 10px;
  }

  .restaurant-info {
    flex-direction: column;

    .restaurant-image {
      width: 100%;
      height: 160px;
    }
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    .item-price {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .unit-price {
        display: inline;
        margin-right: 1rem;
      }
    }
  }
}
</style> 
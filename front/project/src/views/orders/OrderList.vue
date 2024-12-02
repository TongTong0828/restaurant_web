<template>
  <div class="orders-page">
    <h1>My Orders</h1>

    <!-- Status Filter -->
    <div class="status-filter">
      <el-radio-group v-model="currentStatus" @change="handleStatusChange">
        <el-radio-button label="">All</el-radio-button>
        <el-radio-button label="pending">Pending</el-radio-button>
        <el-radio-button label="confirmed">Confirmed</el-radio-button>
        <el-radio-button label="preparing">Preparing</el-radio-button>
        <el-radio-button label="ready">Ready</el-radio-button>
        <el-radio-button label="delivering">Delivering</el-radio-button>
        <el-radio-button label="completed">Completed</el-radio-button>
        <el-radio-button label="cancelled">Cancelled</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Orders List -->
    <div class="orders-list" v-loading="loading">
      <el-empty v-if="!orders.length" description="No orders found" />
      
      <div v-else class="order-cards">
        <el-card v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="restaurant-info">
              <el-image 
                :src="order.restaurant_image" 
                fit="cover"
                class="restaurant-image"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="restaurant-details">
                <h3>{{ order.restaurant_name }}</h3>
                <p class="order-number">Order #{{ order.order_number }}</p>
              </div>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusType(order.status)">
                {{ formatStatus(order.status) }}
              </el-tag>
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.item_name" class="order-item">
              <span class="item-quantity">{{ item.quantity }}x</span>
              <span class="item-name">{{ item.item_name }}</span>
              <span class="item-price">${{ item.subtotal }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-info">
              <p class="total-amount">Total: ${{ order.total_amount }}</p>
              <p class="order-time">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="order-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="viewOrderDetail(order.id)"
              >
                View Details
              </el-button>
              <el-button 
                v-if="order.status === 'pending'"
                type="danger" 
                size="small"
                @click="cancelOrder(order.id)"
              >
                Cancel Order
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.total > pagination.limit">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const orders = ref([])
const currentStatus = ref('')

// Pagination
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  total_pages: 0
})

// Load orders
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...(currentStatus.value && { status: currentStatus.value })
    }

    const response = await request.get('/api/orders/user', { params })
    orders.value = response.orders
    pagination.value = {
      ...pagination.value,
      total: response.pagination.total,
      total_pages: response.pagination.total_pages
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
    ElMessage.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

// Format status
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Get status type for tag
const getStatusType = (status: string) => {
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

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// View order detail
const viewOrderDetail = (orderId: number) => {
  router.push(`/orders/${orderId}`)
}

// Cancel order
const cancelOrder = async (orderId: number) => {
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

    const response = await request.put(`/api/orders/user/${orderId}/cancel`)
    if (response.message === 'Order cancelled successfully') {
      ElMessage.success('Order cancelled successfully')
      loadOrders() // Reload orders
    }
  } catch (error: any) {
    if (error === 'cancel') return
    console.error('Failed to cancel order:', error)
    ElMessage.error(error.response?.data?.message || 'Failed to cancel order')
  }
}

// Handle status change
const handleStatusChange = () => {
  pagination.value.page = 1
  loadOrders()
}

// Handle page size change
const handleSizeChange = (size: number) => {
  pagination.value.limit = size
  pagination.value.page = 1
  loadOrders()
}

// Handle page change
const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadOrders()
}

// Load orders on mount
onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.orders-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #303133;
  }
}

.status-filter {
  margin-bottom: 2rem;
  text-align: center;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .restaurant-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .restaurant-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
      }

      .restaurant-details {
        h3 {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
        }

        .order-number {
          margin: 0;
          color: #909399;
          font-size: 0.9rem;
        }
      }
    }
  }

  .order-items {
    margin: 1rem 0;
    padding: 1rem 0;
    border-top: 1px solid #EBEEF5;
    border-bottom: 1px solid #EBEEF5;

    .order-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .item-quantity {
        color: #409EFF;
        margin-right: 0.75rem;
        min-width: 30px;
      }

      .item-name {
        flex: 1;
      }

      .item-price {
        font-weight: 500;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .order-info {
      .total-amount {
        margin: 0 0 0.25rem;
        font-weight: 500;
        font-size: 1.1rem;
      }

      .order-time {
        margin: 0;
        color: #909399;
        font-size: 0.9rem;
      }
    }

    .order-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
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

.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .orders-page {
    padding: 10px;
  }

  .status-filter {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 1rem;

    :deep(.el-radio-group) {
      display: flex;
      gap: 0.5rem;
    }
  }

  .order-card {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;

      .order-status {
        align-self: flex-end;
      }
    }

    .order-footer {
      flex-direction: column;
      gap: 1rem;

      .order-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}
</style> 
<template>
  <div class="orders-page">
    <div class="page-header">
      <h2>Orders Management</h2>
      <div class="filters">
        <el-select
          v-model="filterStatus"
          placeholder="Filter by status"
          clearable
          @change="handleFilterChange"
        >
          <el-option
            v-for="status in orderStatuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>
    </div>

    <div class="table-container">
      <el-table
        :data="orders"
        v-loading="loading"
        border
        stripe
        fit
        highlight-current-row
      >
        <el-table-column prop="id" label="Order ID" width="90" />
        
        <el-table-column label="Customer" width="180">
          <template #default="{ row }">
            <div class="customer-info">
              <div>{{ row.customer.name }}</div>
              <div class="phone">{{ row.customer.phone }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Items" min-width="200">
          <template #default="{ row }">
            <div class="items-list">
              <div v-for="item in row.items" :key="item.id" class="item">
                {{ item.name }} x{{ item.quantity }} (${{ item.price }})
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Total" width="100" align="right">
          <template #default="{ row }">
            ${{ row.total_amount.toFixed(2) }}
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Created At" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                @click="viewOrderDetail(row)"
              >
                View
              </el-button>
              <el-button
                v-if="canUpdateStatus(row.status)"
                type="success"
                link
                @click="updateStatus(row)"
              >
                Update
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Order Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="Order Details"
      width="800px"
    >
      <div v-if="selectedOrder" class="order-detail">
        <div class="section">
          <h3>Customer Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span>{{ selectedOrder.customer.name }}</span>
            </div>
            <div class="info-item">
              <label>Phone:</label>
              <span>{{ selectedOrder.customer.phone }}</span>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <span>{{ selectedOrder.delivery_info.address }}</span>
            </div>
            <div class="info-item" v-if="selectedOrder.delivery_info.note">
              <label>Note:</label>
              <span>{{ selectedOrder.delivery_info.note }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Order Status</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Current Status:</label>
              <el-tag :type="getStatusType(selectedOrder.status)">
                {{ formatStatus(selectedOrder.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>Created At:</label>
              <span>{{ formatDate(selectedOrder.created_at) }}</span>
            </div>
            <div class="info-item" v-if="selectedOrder.updated_at">
              <label>Last Updated:</label>
              <span>{{ formatDate(selectedOrder.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Order Items</h3>
          <el-table :data="selectedOrder.items" style="width: 100%">
            <el-table-column prop="name" label="Item" />
            <el-table-column prop="quantity" label="Qty" width="80" />
            <el-table-column prop="price" label="Price" width="100">
              <template #default="{ row }">
                ${{ Number(row.price).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="Subtotal" width="100">
              <template #default="{ row }">
                ${{ (Number(row.price) * row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="total">
            Total: ${{ Number(selectedOrder.total_amount).toFixed(2) }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Update Status Dialog -->
    <el-dialog
      v-model="showStatusDialog"
      title="Update Order Status"
      width="400px"
    >
      <div v-if="selectedOrder" class="status-update">
        <p>Current Status: 
          <el-tag :type="getStatusType(selectedOrder.status)">
            {{ formatStatus(selectedOrder.status) }}
          </el-tag>
        </p>
        <el-form>
          <el-form-item label="New Status">
            <el-select v-model="newStatus" placeholder="Select new status">
              <el-option
                v-for="status in availableNextStatuses"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showStatusDialog = false">Cancel</el-button>
          <el-button
            type="primary"
            :loading="updating"
            @click="confirmStatusUpdate"
          >
            Update
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { restaurantManagementService } from '@/services/restaurantManagement'
import type { Order } from '@/services/restaurantManagement'

// 状态定义
const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivering', label: 'Delivering' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

// 状态流转定义
const statusTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['delivering'],
  delivering: ['completed'],
  completed: [],
  cancelled: []
}

// 状态样式定义
const statusTypes: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  delivering: 'success',
  completed: 'success',
  cancelled: 'danger'
}

// 页面状态
const loading = ref(false)
const orders = ref<Order[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filterStatus = ref('')

// 弹窗状态
const showDetailDialog = ref(false)
const showStatusDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const newStatus = ref('')
const updating = ref(false)

// 计算下一步可用状态
const availableNextStatuses = computed(() => {
  if (!selectedOrder.value) return []
  const currentStatus = selectedOrder.value.status
  const nextStatuses = statusTransitions[currentStatus] || []
  return orderStatuses.filter(status => nextStatuses.includes(status.value))
})

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true
    console.log('Loading orders with params:', {
      page: currentPage.value,
      limit: pageSize.value,
      status: filterStatus.value
    })

    const response = await restaurantManagementService.getOrders({
      page: currentPage.value,
      limit: pageSize.value,
      status: filterStatus.value || undefined
    })

    console.log('Orders loaded:', response)

    if (response.orders) {
      orders.value = response.orders.map(order => ({
        ...order,
        total_amount: Number(order.total_amount),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price)
        }))
      }))
      total.value = response.total
    } else {
      orders.value = []
      total.value = 0
      console.warn('No orders found in response')
    }
  } catch (error: any) {
    console.error('Failed to load orders:', error)
    orders.value = []
    total.value = 0
    ElMessage.error(error.message || 'Failed to load orders')
  } finally {
    loading.value = false
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadOrders()
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadOrders()
}

const handlePageChange = (val: number) => {
  currentPage.value = val
  loadOrders()
}

// 查看订单详情
const viewOrderDetail = (order: Order) => {
  selectedOrder.value = order
  showDetailDialog.value = true
}

// 更新订单状态
const updateStatus = (order: Order) => {
  selectedOrder.value = order
  newStatus.value = statusTransitions[order.status][0]
  showStatusDialog.value = true
}

// 确认更新状态
const confirmStatusUpdate = async () => {
  if (!selectedOrder.value || !newStatus.value) return
  
  try {
    updating.value = true
    await restaurantManagementService.updateOrderStatus(selectedOrder.value.id, newStatus.value)
    
    ElMessage.success('Order status updated successfully')
    showStatusDialog.value = false
    loadOrders()
  } catch (error: any) {
    console.error('Failed to update order status:', error)
    ElMessage.error(error.message || 'Failed to update order status')
  } finally {
    updating.value = false
  }
}

// 检查是否可以更新状态
const canUpdateStatus = (status: string) => {
  return (statusTransitions[status] || []).length > 0
}

// 获取状态样式
const getStatusType = (status: string) => {
  return statusTypes[status] || 'info'
}

// 格式化状态显示
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// 格式化日期显示
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 初始化加载
onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.orders-page {
  padding: 20px;
  width: calc(100% - 40px);
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  position: relative;

  :deep(.el-table) {
    max-width: calc(100vw - 280px);
    margin: 0 auto;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #303133;
  }

  .filters {
    display: flex;
    gap: 16px;
  }
}

.table-container {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.customer-info {
  .phone {
    color: #666;
    font-size: 0.9em;
  }
}

.items-list {
  .item {
    margin-bottom: 4px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 0 20px;
}

:deep(.el-table) {
  width: 100% !important;
  
  .el-table__header th {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
  
  .el-table__row {
    td {
      padding: 8px 0;
    }
  }

  .el-table__body,
  .el-table__header {
    width: 100% !important;
  }
}

// 响应式布局
@media screen and (max-width: 1200px) {
  .orders-page {
    padding: 15px;
    width: calc(100% - 30px);
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.el-table) {
    max-width: calc(100vw - 240px);
  }
}
</style>
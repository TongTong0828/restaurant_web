<template>
  <div class="restaurant-dashboard">
    <!-- 基础信息卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>Restaurant Status</h3>
              <el-tag :type="getStatusType(dashboardData?.restaurant?.status || 'closed')">
                {{ dashboardData?.restaurant?.status?.toUpperCase() }}
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <h4>{{ dashboardData?.restaurant?.name }}</h4>
            <div class="rating">
              <span>Rating: {{ dashboardData?.restaurant?.rating || 0 }}</span>
              <el-rate
                v-model="rating"
                disabled
                show-score
                text-color="#ff9900"
              />
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>Today's Orders</h3>
            </div>
          </template>
          <div class="card-content">
            <h2 class="highlight">{{ dashboardData?.orders?.today || 0 }}</h2>
            <div class="order-stats">
              <div>
                <span>Pending: {{ dashboardData?.orders?.pending || 0 }}</span>
                <span>Preparing: {{ dashboardData?.orders?.preparing || 0 }}</span>
              </div>
              <div>
                <span>Delivering: {{ dashboardData?.orders?.delivering || 0 }}</span>
                <span>Completed: {{ dashboardData?.orders?.completed || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>Today's Revenue</h3>
            </div>
          </template>
          <div class="card-content">
            <h2 class="highlight">${{ formatMoney(dashboardData?.revenue?.today) }}</h2>
            <div class="revenue-stats">
              <div>This Week: ${{ formatMoney(dashboardData?.revenue?.thisWeek) }}</div>
              <div>This Month: ${{ formatMoney(dashboardData?.revenue?.thisMonth) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>Customer Stats</h3>
            </div>
          </template>
          <div class="card-content">
            <h2 class="highlight">{{ dashboardData?.statistics?.totalCustomers || 0 }}</h2>
            <div class="customer-stats">
              <div>Repeat Customers: {{ dashboardData?.statistics?.repeatCustomers || 0 }}</div>
              <div>Avg. Order: ${{ formatMoney(dashboardData?.statistics?.averageOrderValue) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门商品和最近订单 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>Popular Items</h3>
            </div>
          </template>
          <el-table :data="dashboardData?.popularItems || []" style="width: 100%">
            <el-table-column prop="name" label="Item" />
            <el-table-column prop="orderCount" label="Orders" width="100" />
            <el-table-column prop="revenue" label="Revenue" width="120">
              <template #default="{ row }">
                ${{ formatMoney(row.revenue) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>Recent Orders</h3>
            </div>
          </template>
          <el-table :data="dashboardData?.recentOrders || []" style="width: 100%">
            <el-table-column prop="id" label="Order ID" width="100" />
            <el-table-column prop="status" label="Status" width="120">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)">
                  {{ row.status.toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total" label="Total" width="120">
              <template #default="{ row }">
                ${{ formatMoney(row.total) }}
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="Time">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { restaurantManagementService } from '@/services/restaurantManagement'
import type { DashboardData } from '@/services/restaurantManagement'
import dayjs from 'dayjs'

const dashboardData = ref<DashboardData>()

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    dashboardData.value = await restaurantManagementService.getDashboardData()
  } catch (error: any) {
    ElMessage.error(error.message)
  }
}

// 格式化金额
const formatMoney = (amount?: number) => {
  if (amount === undefined) return '0.00'
  return amount.toFixed(2)
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    closed: 'danger',
    busy: 'warning'
  }
  return types[status] || 'info'
}

const getOrderStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'primary',
    ready: 'success',
    delivering: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 自动刷新数据
let refreshInterval: number

// 添加计算属性来处理评分
const rating = computed(() => {
  const ratingValue = dashboardData.value?.restaurant?.rating
  return ratingValue ? Number(ratingValue) : 0
})

onMounted(() => {
  loadDashboardData()
  // 每5分钟刷新一次数据
  refreshInterval = setInterval(loadDashboardData, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped lang="scss">
.restaurant-dashboard {
  padding: 20px;
  
  .mb-4 {
    margin-bottom: 20px;
  }
  
  .dashboard-card {
    height: 100%;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
      }
    }
    
    .card-content {
      text-align: center;
      
      h2.highlight {
        font-size: 32px;
        color: #409EFF;
        margin: 10px 0;
      }
      
      h4 {
        margin: 0 0 10px;
      }
      
      .rating {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .order-stats,
      .revenue-stats,
      .customer-stats {
        margin-top: 10px;
        font-size: 14px;
        color: #666;
        
        > div {
          margin-top: 5px;
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
  
  :deep(.el-table) {
    .el-button {
      padding: 2px 0;
    }
  }
}
</style> 
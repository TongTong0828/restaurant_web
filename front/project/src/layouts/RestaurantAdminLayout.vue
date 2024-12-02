<template>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="logo">
          <img src="../assets/logo.svg" alt="Logo" />
          <span>FoodieHub</span>
        </router-link>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/restaurant-admin" class="nav-item">
          <el-icon><DataBoard /></el-icon>
          Dashboard
        </router-link>
        <router-link to="/restaurant-admin/menu" class="nav-item">
          <el-icon><Menu /></el-icon>
          Menu Management
        </router-link>
        <router-link to="/restaurant-admin/orders" class="nav-item">
          <el-icon><List /></el-icon>
          Orders
        </router-link>
      </nav>
    </aside>

    <div class="admin-content">
      <header class="admin-header">
        <div class="header-content">
          <h1 class="page-title">{{ currentPage }}</h1>
          
          <el-dropdown @command="handleCommand">
            <span class="user-menu">
              <el-avatar :size="32" :src="userAvatar" />
              <span>{{ userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <router-link to="/restaurant-admin/profile">Profile</router-link>
                </el-dropdown-item>
                <el-dropdown-item command="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DataBoard, Menu, List } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { restaurantAuthService } from '@/services/restaurantAuth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || '')
const userAvatar = computed(() => authStore.user?.avatar || '')
const currentPage = computed(() => {
  switch (route.name) {
    case 'restaurant-dashboard':
      return 'Dashboard'
    case 'restaurant-menu':
      return 'Menu Management'
    case 'restaurant-orders':
      return 'Orders'
    case 'restaurant-profile':
      return 'Profile'
    default:
      return ''
  }
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/restaurant-admin/profile')
      break
    case 'logout':
      authStore.clearAuth()
      router.push('/')
      break
  }
}
</script>

<style scoped lang="scss">
.admin-container {
  min-height: 100vh;
  display: flex;
}

.admin-sidebar {
  width: 260px;
  background: #001529;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;

    img {
      height: 32px;
      margin-right: 8px;
    }
  }
}

.sidebar-nav {
  padding: 20px 0;

  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    transition: all 0.3s;
    gap: 12px;

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    &.router-link-active {
      color: white;
      background: #1890ff;
    }
  }
}

.admin-content {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  background: #f0f2f5;
}

.admin-header {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 24px;
  height: 64px;
  position: fixed;
  top: 0;
  right: 0;
  left: 260px;
  z-index: 100;

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.page-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1f1f1f;
  margin: 0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.main-content {
  padding: 88px 24px 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 
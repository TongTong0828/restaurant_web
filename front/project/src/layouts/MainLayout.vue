<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">
        <router-link to="/">Food Delivery</router-link>
      </div>
      <nav class="nav">
        <!-- 普通用户导航 -->
        <template v-if="!userStore.isRestaurant">
          <router-link to="/restaurants">Restaurants</router-link>
          <router-link to="/orders" v-if="userStore.isLoggedIn">My Orders</router-link>
          <router-link to="/cart">Cart</router-link>
        </template>

        <!-- 餐厅管理员导航 -->
        <template v-if="userStore.isRestaurant">
          <router-link to="/restaurant-admin/dashboard">Dashboard</router-link>
          <router-link to="/restaurant-admin/menu">Menu</router-link>
          <router-link to="/restaurant-admin/orders">Orders</router-link>
          <router-link to="/restaurant-admin/profile">Settings</router-link>
        </template>

        <!-- 用户控制 -->
        <div class="user-controls" v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="user-name">
              {{ userStore.user?.name }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">Profile</el-dropdown-item>
                <el-dropdown-item command="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <template v-else>
          <router-link to="/auth/login">User Login</router-link>
          <router-link to="/auth/register">User Register</router-link>
          <router-link to="/restaurant/login">Restaurant Login</router-link>
          <router-link to="/restaurant/register">Restaurant Register</router-link>
        </template>
      </nav>
    </header>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2023 Food Delivery. All rights reserved.</p>
        <router-link to="/about" class="about-link">
          <el-button link>About</el-button>
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      if (userStore.isRestaurant) {
        router.push('/restaurant-admin/profile')
      } else {
        router.push('/customer/profile')
      }
      break
    case 'logout':
      userStore.logout()
      router.push('/')
      break
  }
}
</script>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    font-size: 1.5rem;
    font-weight: bold;

    a {
      color: #409EFF;
      text-decoration: none;
    }
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 2rem;

    a {
      color: #606266;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #409EFF;
      }

      &.router-link-active {
        color: #409EFF;
      }
    }

    .user-controls {
      margin-left: 1rem;

      .user-name {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f7fa;
}

.footer {
  margin-top: auto;
  padding: 20px;
  background-color: #f5f5f5;
  text-align: center;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.about-link {
  text-decoration: none;
}

.about-link :deep(.el-button) {
  font-size: 14px;
  color: #606266;
}

.about-link :deep(.el-button):hover {
  color: #409EFF;
}
</style> 
<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <img src="../assets/logo.svg" alt="Logo" />
          <span>FoodieHub</span>
        </router-link>
      </div>
      
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.auth-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 480px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;

    img {
      height: 40px;
      margin-right: 12px;
    }
  }
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
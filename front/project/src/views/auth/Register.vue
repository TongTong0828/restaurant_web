<template>
  <div class="register-container">
    <h2>Create Account</h2>
    <p class="subtitle">Please fill in the form to continue</p>

    <el-form
      ref="customerFormRef"
      :model="customerForm"
      :rules="customerRules"
      label-position="top"
      @submit.prevent="handleCustomerSubmit"
    >
      <el-form-item label="Username" prop="username">
        <el-input
          v-model="customerForm.username"
          placeholder="Enter your username"
          size="large"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input
          v-model="customerForm.email"
          placeholder="Enter your email"
          type="email"
          size="large"
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Phone" prop="phone">
        <el-input
          v-model="customerForm.phone"
          placeholder="Enter your phone number"
          size="large"
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input
          v-model="customerForm.password"
          placeholder="Create a password"
          type="password"
          size="large"
          show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <div class="form-footer">
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          class="submit-btn"
        >
          Create Account
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Message, Phone, Lock } from '@element-plus/icons-vue'
import { authService } from '@/services/auth'

const router = useRouter()
const loading = ref(false)
const customerFormRef = ref<FormInstance>()

const customerForm = ref({
  username: '',
  email: '',
  phone: '',
  password: ''
})

const customerRules: FormRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleCustomerSubmit = async () => {
  if (!customerFormRef.value) return
  
  try {
    await customerFormRef.value.validate()
    loading.value = true
    
    await authService.registerCustomer({
      username: customerForm.value.username,
      email: customerForm.value.email,
      phone: customerForm.value.phone,
      password: customerForm.value.password
    })
    
    ElMessage.success('Registration successful')
    router.push('/auth/login')
  } catch (error: any) {
    ElMessage.error(error.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;

  h2 {
    text-align: center;
    margin-bottom: 8px;
    font-size: 24px;
    color: #303133;
  }

  .subtitle {
    text-align: center;
    color: #909399;
    margin-bottom: 32px;
  }

  .form-footer {
    margin-top: 32px;
    
    .submit-btn {
      width: 100%;
    }
  }
}
</style> 
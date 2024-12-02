<template>
  <div class="profile-page">
    <div class="profile-card">
      <h2>Profile Settings</h2>
      
      <!-- Profile Form -->
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="120px"
        class="profile-form"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitProfileForm(profileFormRef)">
            Update Profile
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Password Form -->
      <div class="password-section">
        <h2>Change Password</h2>
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="120px"
          class="profile-form"
        >
          <el-form-item label="Current Password" prop="currentPassword">
            <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              show-password
              placeholder="Enter current password"
            />
          </el-form-item>
          
          <el-form-item label="New Password" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="Enter new password"
            />
          </el-form-item>
          
          <el-form-item label="Confirm Password" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="Confirm new password"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitPasswordForm(passwordFormRef)">
              Update Password
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// Profile form data
const profileForm = reactive({
  name: '',
  phone: ''
})

// Password form data
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Profile validation rules
const profileRules = reactive<FormRules>({
  name: [
    { required: true, message: 'Please input your name', trigger: 'blur' },
    { min: 2, message: 'Length should be at least 2 characters', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please input your phone number', trigger: 'blur' },
    { pattern: /^\d{10,}$/, message: 'Please enter a valid phone number', trigger: 'blur' }
  ]
})

// Password validation rules
const validatePass = (rule: any, value: any, callback: any) => {
  if (passwordForm.newPassword && !value) {
    callback(new Error('Please confirm your password'))
  } else if (passwordForm.newPassword !== value) {
    callback(new Error('Passwords do not match!'))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: 'Current password is required', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'New password is required', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass, trigger: 'blur' }
  ]
})

// Fetch user profile
const fetchUserProfile = async () => {
  try {
    const response = await request.get('/api/auth/me')
    if (response.status === 'success') {
      profileForm.name = response.data.name
      profileForm.phone = response.data.phone || ''
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    ElMessage.error('Failed to load user profile')
  }
}

// Submit profile form
const submitProfileForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const response = await request.put('/api/auth/profile', {
          name: profileForm.name,
          phone: profileForm.phone
        })
        
        if (response.status === 'success') {
          ElMessage.success('Profile updated successfully')
        }
      } catch (error: any) {
        console.error('Failed to update profile:', error)
        ElMessage.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  })
}

// Submit password form
const submitPasswordForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const response = await request.put('/api/auth/password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
        
        if (response.status === 'success') {
          ElMessage.success('Password updated successfully')
          // Clear password form
          passwordForm.currentPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
          // Reset form validation
          formEl.resetFields()
        }
      } catch (error: any) {
        console.error('Failed to update password:', error)
        ElMessage.error(error.response?.data?.message || 'Failed to update password')
      }
    }
  })
}

// Load user profile on mount
onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped lang="scss">
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  
  h2 {
    margin: 0 0 30px 0;
    color: #303133;
    font-size: 24px;
  }
}

.profile-form {
  max-width: 500px;
  
  .el-form-item:last-child {
    margin-bottom: 0;
  }
}

.password-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #EBEEF5;
}

@media (max-width: 768px) {
  .profile-card {
    padding: 20px;
  }
  
  .profile-form {
    :deep(.el-form-item__label) {
      float: none;
      display: block;
      text-align: left;
      padding: 0 0 10px;
    }
  }
}
</style> 
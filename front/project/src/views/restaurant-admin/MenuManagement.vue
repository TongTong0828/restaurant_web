<template>
  <div class="menu-management">
    <div class="page-header">
      <h2>Menu Management</h2>
      <el-button type="primary" @click="showAddDialog = true">Add Item</el-button>
    </div>

    <el-table :data="menuItems" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="description" label="Description" show-overflow-tooltip />
      <el-table-column prop="price" label="Price" width="120">
        <template #default="{ row }">
          ${{ formatMoney(row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="category" label="Category" width="120" />
      <el-table-column label="Image" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.image_url"
            :src="row.image_url"
            :preview-src-list="[row.image_url]"
            fit="cover"
            class="menu-item-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div v-else class="no-image">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="editItem(row)">
            Edit
          </el-button>
          <el-button link type="danger" @click="deleteItem(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingItem.id ? 'Edit Menu Item' : 'Add Menu Item'"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="editingItem"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="editingItem.name" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="editingItem.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Price" prop="price">
          <el-input-number v-model="editingItem.price" :precision="2" :step="0.5" :min="0" />
        </el-form-item>
        <el-form-item label="Category" prop="category">
          <el-select v-model="editingItem.category">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Image" prop="image_url">
          <div class="image-upload">
            <el-upload
              class="upload-component"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :on-error="handleImageError"
              :before-upload="beforeImageUpload"
              name="image"
            >
              <img v-if="editingItem.image_url" :src="editingItem.image_url" class="preview-image">
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
                <span>Click to upload</span>
                <div class="upload-tip">JPG/PNG files less than 5MB</div>
              </div>
            </el-upload>
            <div v-if="editingItem.image_url" class="image-actions">
              <el-button link type="danger" @click="removeImage">
                Remove Image
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">Cancel</el-button>
          <el-button type="primary" @click="saveItem" :loading="saving">
            Save
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { Picture, Plus } from '@element-plus/icons-vue'
import { restaurantManagementService } from '@/services/restaurantManagement'
import { restaurantAuthService } from '@/services/restaurantAuth'
import type { MenuItem } from '@/services/restaurantManagement'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'

const loading = ref(false)
const saving = ref(false)
const menuItems = ref<MenuItem[]>([])
const showAddDialog = ref(false)
const formRef = ref<FormInstance>()
const tempImageFile = ref<File | null>(null)

const authStore = useAuthStore()
const restaurantId = computed(() => {
  const user = authStore.user
  if (!user?.restaurant_id) {
    return 0
  }
  return user.restaurant_id
})

const initializeRestaurant = async () => {
  try {
    if (!restaurantId.value) {
      // 如果没有餐厅ID，尝试获取餐厅信息
      const restaurant = await restaurantAuthService.getRestaurantInfo()
      console.log('Got restaurant info:', restaurant)
    }
    await loadMenuItems()
  } catch (error: any) {
    console.error('Failed to initialize restaurant:', error)
    ElMessage.error('Failed to load restaurant information. Please try logging in again.')
  }
}

onMounted(() => {
  initializeRestaurant()
})

const editingItem = ref<Partial<MenuItem>>({
  name: '',
  description: '',
  price: 0,
  category: '',
  image_url: null
})

const categories = [
  'Hot Dishes',
  'Cold Dishes',
  'Main Course',
  'Soups',
  'Beverages',
  'Alcohol',
  'Specials',
  'Snacks',
  'Set Meals'
]

const rules: FormRules = {
  name: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min: 2, message: 'Length should be at least 2 characters', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Please input description', trigger: 'blur' }
  ],
  price: [
    { required: true, message: 'Please input price', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const price = typeof value === 'string' ? parseFloat(value) : value
        if (isNaN(price) || price <= 0) {
          callback(new Error('Price must be greater than 0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  category: [
    { required: true, message: 'Please select category', trigger: 'change' }
  ]
}

const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = /^image\/(jpeg|png|gif|jpg)$/.test(file.type)
  if (!isImage) {
    ElMessage.error('You can only upload image files!')
    return false
  }

  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('Image size can not exceed 5MB!')
    return false
  }

  tempImageFile.value = file
  editingItem.value.image_url = URL.createObjectURL(file)
  return false
}

const handleImageSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.status === 'success' && response.data?.url) {
    editingItem.value.image_url = response.data.url
    ElMessage.success('Image uploaded successfully')
  } else {
    ElMessage.error(response.message || 'Failed to upload image')
  }
}

const handleImageError: UploadProps['onError'] = (error) => {
  console.error('Upload error:', error)
  let errorMessage = 'Failed to upload image'
  
  if (error.response) {
    const response = error.response.data
    errorMessage = response.message || errorMessage
  }
  
  ElMessage.error(errorMessage)
}

const removeImage = async () => {
  try {
    if (editingItem.value.id) {
      await ElMessageBox.confirm(
        'Are you sure to remove this image?',
        'Warning',
        {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }
      )
      
      await restaurantManagementService.deleteMenuItemImage(editingItem.value.id)
      editingItem.value.image_url = ''
      ElMessage.success('Image removed successfully')
    } else {
      editingItem.value.image_url = ''
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || 'Failed to remove image')
    }
  }
}

const loadMenuItems = async () => {
  try {
    loading.value = true
    console.log('Loading menu items for restaurant:', restaurantId.value)
    
    const response = await request.get(
      `/api/restaurants/${restaurantId.value}/menu-items`
    )
    
    console.log('Menu items response:', response)

    if (response.status === 'success' && response.data) {
      // 将按类别分组的菜品展平为一个数组
      const allItems: MenuItem[] = []
      Object.entries(response.data.menu_items || {}).forEach(([category, items]) => {
        (items as MenuItem[]).forEach(item => {
          allItems.push({
            ...item,
            category // 添加类别信息
          })
        })
      })
      menuItems.value = allItems
      
      // 更新类别列表
      if (response.data.categories) {
        categories.value = response.data.categories
      }
      
      console.log('Processed menu items:', {
        items: menuItems.value,
        categories: categories.value
      })
    } else {
      console.warn('Invalid response format:', response)
      menuItems.value = []
      categories.value = [
        'Hot Dishes',
        'Cold Dishes',
        'Main Course',
        'Soups',
        'Beverages',
        'Alcohol',
        'Specials',
        'Snacks',
        'Set Meals'
      ]
    }
  } catch (error: any) {
    console.error('Failed to load menu items:', error)
    ElMessage.error(error.message || 'Failed to load menu items')
    menuItems.value = []
  } finally {
    loading.value = false
  }
}

const editItem = (item: MenuItem) => {
  editingItem.value = { ...item }
  tempImageFile.value = null
  showAddDialog.value = true
}

const deleteItem = async (item: MenuItem) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to delete this item?',
      'Warning',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )
    
    console.log('?? Deleting menu item:', item)
    const success = await restaurantManagementService.deleteMenuItem(restaurantId.value, item.id!)
    
    if (success) {
      // 从列表中移除
      menuItems.value = menuItems.value.filter(i => i.id !== item.id)
      ElMessage.success('Item deleted successfully')
      // 重新加载菜品列表以确保数据同步
      await loadMenuItems()
    } else {
      throw new Error('Failed to delete item')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('? Failed to delete item:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      ElMessage.error(error.message || 'Failed to delete item')
    }
  }
}

const saveItem = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true

    console.log('? Saving menu item:', {
      id: editingItem.value.id,
      data: {
        name: editingItem.value.name,
        description: editingItem.value.description,
        price: Number(editingItem.value.price),
        category: editingItem.value.category,
        is_available: true
      },
      hasImage: !!tempImageFile.value
    })

    let savedItem: MenuItem
    
    if (editingItem.value.id) {
      console.log('? Updating existing menu item:', editingItem.value.id)
      savedItem = await restaurantManagementService.updateMenuItem(
        restaurantId.value,
        editingItem.value.id,
        {
          name: editingItem.value.name,
          description: editingItem.value.description,
          price: Number(editingItem.value.price),
          category: editingItem.value.category,
          is_available: true
        }
      )
    } else {
      console.log('? Creating new menu item')
      savedItem = await restaurantManagementService.addMenuItem(
        restaurantId.value,
        {
          name: editingItem.value.name!,
          description: editingItem.value.description!,
          price: Number(editingItem.value.price!),
          category: editingItem.value.category!
        }
      )
    }

    console.log('? Menu item saved successfully:', savedItem)

    if (tempImageFile.value) {
      console.log('?? Uploading menu item image for item:', savedItem.id)
      const uploadResult = await restaurantManagementService.uploadMenuItemImage(
        savedItem.id!,
        tempImageFile.value
      )
      console.log('? Image upload completed:', uploadResult)
      savedItem.image_url = uploadResult.url
    }

    // 更新列表
    if (editingItem.value.id) {
      const index = menuItems.value.findIndex(item => item.id === editingItem.value.id)
      if (index !== -1) {
        menuItems.value[index] = savedItem
      }
    } else {
      menuItems.value.push(savedItem)
    }

    ElMessage.success(editingItem.value.id ? 'Item updated successfully' : 'Item added successfully')
    showAddDialog.value = false
    resetForm()
  } catch (error: any) {
    console.error('? Failed to save menu item:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    ElMessage.error(error.message || 'Failed to save item')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  editingItem.value = {
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: null,
    is_available: true
  }
  tempImageFile.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const formatMoney = (amount: number | string | undefined) => {
  if (amount === undefined || amount === '') return '0.00'
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return numAmount.toFixed(2)
}
</script>

<style scoped lang="scss">
.menu-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
    }
  }

  .menu-item-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
  }

  .image-error,
  .no-image {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #909399;
  }

  .image-upload {
    .upload-component {
      :deep(.el-upload) {
        width: 150px;
        height: 150px;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration);

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      .preview-image {
        width: 150px;
        height: 150px;
        object-fit: cover;
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-secondary);

        .el-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
      }
    }

    .image-actions {
      margin-top: 8px;
      text-align: center;
    }
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 
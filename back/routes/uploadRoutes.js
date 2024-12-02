const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth, checkRole } = require('../middleware/auth');

// 上传菜品图片（仅限餐厅用户）
router.post('/menu-item/:menuItemId/image', 
  auth, 
  checkRole('restaurant'), 
  uploadController.uploadMenuItemImage
);

// 删除菜品图片（仅限餐厅用户）
router.delete('/menu-item/:menuItemId/image', 
  auth, 
  checkRole('restaurant'), 
  uploadController.deleteMenuItemImage
);

module.exports = router; 
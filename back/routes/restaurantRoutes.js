const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { auth, restaurantAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 获取所有分类
router.get('/categories', restaurantController.getAllCategories);

// 公开接口
router.get('/', restaurantController.getRestaurants);
router.get('/popular', restaurantController.getPopularRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu-items', restaurantController.getRestaurantMenuItems);

// 注册接口
router.post('/register', 
  upload.single('restaurantImage'),
  restaurantController.registerRestaurant
);

// 需要餐厅认证的接口
router.put('/:id', restaurantAuth, restaurantController.updateRestaurant);
router.put('/:id/status', restaurantAuth, restaurantController.updateRestaurantStatus);

// 餐厅图片上传
router.post('/:id/image',
  restaurantAuth,
  upload.single('restaurantImage'),
  restaurantController.updateRestaurantImage
);

// 菜品相关接口
router.post('/:id/menu-items', restaurantAuth, restaurantController.addMenuItem);
router.put('/:id/menu-items/:itemId', restaurantAuth, restaurantController.updateMenuItem);
router.delete('/:id/menu-items/:itemId', restaurantAuth, restaurantController.deleteMenuItem);

module.exports = router; 
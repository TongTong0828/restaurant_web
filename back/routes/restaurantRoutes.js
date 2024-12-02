const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { auth, restaurantAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ���� multer �洢
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

// ��ȡ���з���
router.get('/categories', restaurantController.getAllCategories);

// �����ӿ�
router.get('/', restaurantController.getRestaurants);
router.get('/popular', restaurantController.getPopularRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu-items', restaurantController.getRestaurantMenuItems);

// ע��ӿ�
router.post('/register', 
  upload.single('restaurantImage'),
  restaurantController.registerRestaurant
);

// ��Ҫ������֤�Ľӿ�
router.put('/:id', restaurantAuth, restaurantController.updateRestaurant);
router.put('/:id/status', restaurantAuth, restaurantController.updateRestaurantStatus);

// ����ͼƬ�ϴ�
router.post('/:id/image',
  restaurantAuth,
  upload.single('restaurantImage'),
  restaurantController.updateRestaurantImage
);

// ��Ʒ��ؽӿ�
router.post('/:id/menu-items', restaurantAuth, restaurantController.addMenuItem);
router.put('/:id/menu-items/:itemId', restaurantAuth, restaurantController.updateMenuItem);
router.delete('/:id/menu-items/:itemId', restaurantAuth, restaurantController.deleteMenuItem);

module.exports = router; 
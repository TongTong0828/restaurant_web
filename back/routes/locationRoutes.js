const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { auth, restaurantAuth } = require('../middleware/auth');

// 地址转换为经纬度
router.post('/geocode', locationController.geocodeAddress);

// 距离和配送时间估算
router.get('/estimate-delivery', locationController.estimateDelivery);

// 查找附近餐厅
router.post('/nearby-restaurants', locationController.findNearbyRestaurants);

// 更新餐厅位置（需要餐厅认证）
router.put('/restaurant', restaurantAuth, locationController.updateRestaurantLocation);

// 更新配送区域（需要餐厅认证）
router.put('/delivery-area', restaurantAuth, locationController.updateDeliveryArea);

// 检查配送可用性
router.post('/check-delivery', locationController.checkDeliveryAvailability);

module.exports = router; 
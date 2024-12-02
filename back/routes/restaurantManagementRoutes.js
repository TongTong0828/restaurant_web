const express = require('express');
const router = express.Router();
const { auth, restaurantAuth } = require('../middleware/auth');
const restaurantManagementController = require('../controllers/restaurantManagementController');
const OrderController = require('../controllers/orderController');

// 仪表盘数据
router.get('/dashboard', restaurantAuth, restaurantManagementController.getDashboardData);

// 订单管理
router.get('/orders', restaurantAuth, OrderController.getRestaurantOrders);
router.get('/orders/:orderId', restaurantAuth, OrderController.getRestaurantOrderDetail);
router.put('/orders/:orderId/status', restaurantAuth, OrderController.updateOrderStatus);

// 菜单管理
router.get('/menu', restaurantAuth, restaurantManagementController.getMenuItems);
router.post('/menu', restaurantAuth, restaurantManagementController.addMenuItem);
router.put('/menu/:itemId', restaurantAuth, restaurantManagementController.updateMenuItem);
router.delete('/menu/:itemId', restaurantAuth, restaurantManagementController.deleteMenuItem);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { auth, restaurantAuth } = require('../middleware/auth');
const restaurantManagementController = require('../controllers/restaurantManagementController');
const OrderController = require('../controllers/orderController');

// �Ǳ�������
router.get('/dashboard', restaurantAuth, restaurantManagementController.getDashboardData);

// ��������
router.get('/orders', restaurantAuth, OrderController.getRestaurantOrders);
router.get('/orders/:orderId', restaurantAuth, OrderController.getRestaurantOrderDetail);
router.put('/orders/:orderId/status', restaurantAuth, OrderController.updateOrderStatus);

// �˵�����
router.get('/menu', restaurantAuth, restaurantManagementController.getMenuItems);
router.post('/menu', restaurantAuth, restaurantManagementController.addMenuItem);
router.put('/menu/:itemId', restaurantAuth, restaurantManagementController.updateMenuItem);
router.delete('/menu/:itemId', restaurantAuth, restaurantManagementController.deleteMenuItem);

module.exports = router; 
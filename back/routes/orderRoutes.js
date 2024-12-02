const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { auth, restaurantAuth } = require('../middleware/auth');

// 用户订单路由
router.post('/', auth, OrderController.createOrder);                    // 创建订单
router.get('/user', auth, OrderController.getUserOrders);              // 获取用户订单列表
router.get('/user/:order_id', auth, OrderController.getUserOrderDetail); // 获取用户订单详情
router.put('/user/:order_id/cancel', auth, OrderController.cancelOrder); // 取消订单

// 餐厅订单路由
router.get('/restaurant', restaurantAuth, OrderController.getRestaurantOrders);  // 获取餐厅订单列表
router.put('/restaurant/:order_id/status', restaurantAuth, OrderController.updateOrderStatus); // 更新订单状态

module.exports = router; 
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { auth, restaurantAuth } = require('../middleware/auth');

// �û�����·��
router.post('/', auth, OrderController.createOrder);                    // ��������
router.get('/user', auth, OrderController.getUserOrders);              // ��ȡ�û������б�
router.get('/user/:order_id', auth, OrderController.getUserOrderDetail); // ��ȡ�û���������
router.put('/user/:order_id/cancel', auth, OrderController.cancelOrder); // ȡ������

// ��������·��
router.get('/restaurant', restaurantAuth, OrderController.getRestaurantOrders);  // ��ȡ���������б�
router.put('/restaurant/:order_id/status', restaurantAuth, OrderController.updateOrderStatus); // ���¶���״̬

module.exports = router; 
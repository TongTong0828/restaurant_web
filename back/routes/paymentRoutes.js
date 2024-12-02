const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// 创建支付订单
router.post('/create/:order_id', auth, paymentController.createPayment);

// 处理支付回调
router.post('/callback/:payment_id', paymentController.handleCallback);

// 查询支付状态
router.get('/status/:order_id', auth, paymentController.getPaymentStatus);

// 获取支付历史
router.get('/history', auth, paymentController.getPaymentHistory);

// 申请退款
router.post('/refund/:payment_id', auth, paymentController.refundPayment);

module.exports = router; 
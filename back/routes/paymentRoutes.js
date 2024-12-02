const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// ����֧������
router.post('/create/:order_id', auth, paymentController.createPayment);

// ����֧���ص�
router.post('/callback/:payment_id', paymentController.handleCallback);

// ��ѯ֧��״̬
router.get('/status/:order_id', auth, paymentController.getPaymentStatus);

// ��ȡ֧����ʷ
router.get('/history', auth, paymentController.getPaymentHistory);

// �����˿�
router.post('/refund/:payment_id', auth, paymentController.refundPayment);

module.exports = router; 
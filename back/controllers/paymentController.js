const Payment = require('../models/payment');
const { AppError } = require('../middleware/errorHandler');

// ����֧������
exports.createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.createPayment(orderId, req.body);
    res.status(201).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

// ����֧���ص�
exports.handleCallback = async (req, res, next) => {
  try {
    const { payment_id } = req.params;
    const result = await Payment.handleCallback(payment_id, req.body);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ��ѯ֧��״̬
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const payment = await Payment.getPaymentStatus(order_id, req.user.id);
    res.json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

// ��ȡ֧����ʷ
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.getPaymentHistory(req.user.id);
    res.json({
      status: 'success',
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

// �����˿�
exports.refundPayment = async (req, res, next) => {
  try {
    const { payment_id } = req.params;
    const result = await Payment.refundPayment(payment_id, req.body);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}; 
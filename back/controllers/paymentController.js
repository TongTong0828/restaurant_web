const Payment = require('../models/payment');
const { AppError } = require('../middleware/errorHandler');

// 创建支付订单
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

// 处理支付回调
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

// 查询支付状态
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

// 获取支付历史
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

// 申请退款
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
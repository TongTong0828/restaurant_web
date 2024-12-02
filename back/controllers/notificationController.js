const Notification = require('../models/notification');
const { AppError } = require('../middleware/errorHandler');

// 获取通知列表
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.getNotifications(
      req.user.id,
      req.user.type
    );
    res.json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

// 标记通知为已读
exports.markAsRead = async (req, res, next) => {
  try {
    const result = await Notification.markAsRead(
      req.params.notification_id,
      req.user.id,
      req.user.type
    );
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 删除通知
exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await Notification.deleteNotification(
      req.params.notification_id,
      req.user.id,
      req.user.type
    );
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 获取未读通知数量
exports.getUnreadCount = async (req, res, next) => {
  try {
    const result = await Notification.getUnreadCount(
      req.user.id,
      req.user.type
    );
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 创建订单相关通知
exports.createOrderNotification = async (req, res, next) => {
  try {
    const { order_id, type } = req.body;
    const notification = await Notification.createOrderNotification(
      order_id,
      type
    );
    res.json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// 创建预订相关通知
exports.createReservationNotification = async (req, res, next) => {
  try {
    const { reservation_id, type } = req.body;
    const notification = await Notification.createReservationNotification(
      reservation_id,
      type
    );
    res.json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
}; 
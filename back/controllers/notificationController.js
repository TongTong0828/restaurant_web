const Notification = require('../models/notification');
const { AppError } = require('../middleware/errorHandler');

// ��ȡ֪ͨ�б�
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

// ���֪ͨΪ�Ѷ�
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

// ɾ��֪ͨ
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

// ��ȡδ��֪ͨ����
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

// �����������֪ͨ
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

// ����Ԥ�����֪ͨ
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
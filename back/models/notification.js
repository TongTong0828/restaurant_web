const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const WebSocketServer = require('../utils/websocket');

class Notification {
  static async createNotification(notificationData) {
    const pool = database.getPool();
    const { userId, userType, title, message, type = 'general' } = notificationData;

    try {
      // 创建通知记录
      const [result] = await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, userType, title, message, type]
      );

      // 获取创建的通知详情
      const [notification] = await pool.query(
        'SELECT * FROM notifications WHERE id = ?',
        [result.insertId]
      );

      // 通过WebSocket发送实时通知
      const wss = global.wss;
      if (wss) {
        wss.sendNotification(userId, {
          id: notification[0].id,
          title: notification[0].title,
          message: notification[0].message,
          type: notification[0].type,
          created_at: notification[0].created_at
        });
      }

      return notification[0];
    } catch (error) {
      throw new AppError('Error creating notification', 500);
    }
  }

  static async getNotifications(userId, userType) {
    const pool = database.getPool();

    try {
      const [notifications] = await pool.query(
        `SELECT * FROM notifications 
         WHERE user_id = ? AND user_type = ?
         ORDER BY created_at DESC`,
        [userId, userType]
      );

      return notifications;
    } catch (error) {
      throw new AppError('Error fetching notifications', 500);
    }
  }

  static async markAsRead(notificationId, userId, userType) {
    const pool = database.getPool();

    try {
      const [result] = await pool.query(
        `UPDATE notifications 
         SET is_read = true 
         WHERE id = ? AND user_id = ? AND user_type = ?`,
        [notificationId, userId, userType]
      );

      if (result.affectedRows === 0) {
        throw new AppError('Notification not found', 404);
      }

      return { message: 'Notification marked as read' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error marking notification as read', 500);
    }
  }

  static async deleteNotification(notificationId, userId, userType) {
    const pool = database.getPool();

    try {
      const [result] = await pool.query(
        `DELETE FROM notifications 
         WHERE id = ? AND user_id = ? AND user_type = ?`,
        [notificationId, userId, userType]
      );

      if (result.affectedRows === 0) {
        throw new AppError('Notification not found', 404);
      }

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error deleting notification', 500);
    }
  }

  static async getUnreadCount(userId, userType) {
    const pool = database.getPool();

    try {
      const [result] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM notifications 
         WHERE user_id = ? AND user_type = ? AND is_read = false`,
        [userId, userType]
      );

      return { unread_count: result[0].count };
    } catch (error) {
      throw new AppError('Error getting unread count', 500);
    }
  }

  static async createOrderNotification(orderId, type) {
    const pool = database.getPool();

    try {
      // 获取订单信息
      const [order] = await pool.query(
        `SELECT 
          o.*,
          c.username as customer_name,
          r.restaurant_name
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN restaurants r ON o.restaurant_id = r.id
         WHERE o.id = ?`,
        [orderId]
      );

      if (order.length === 0) {
        throw new AppError('Order not found', 404);
      }

      let title, message, userId, userType;

      switch (type) {
        case 'order_placed':
          // 通知餐厅
          title = '新订单通知';
          message = `收到来自 ${order[0].customer_name} 的新订单`;
          userId = order[0].restaurant_id;
          userType = 'restaurant';
          break;

        case 'order_confirmed':
          // 通知客户
          title = '订单已确认';
          message = `${order[0].restaurant_name} 已确认您的订单`;
          userId = order[0].customer_id;
          userType = 'customer';
          break;

        case 'order_ready':
          // 通知客户
          title = '订单已准备就绪';
          message = `您在 ${order[0].restaurant_name} 的订单已准备就绪`;
          userId = order[0].customer_id;
          userType = 'customer';
          break;

        case 'order_delivered':
          // 通知客户和餐厅
          await this.createNotification({
            userId: order[0].customer_id,
            userType: 'customer',
            title: '订单已送达',
            message: `您的订单已送达，祝您用餐愉快！`,
            type: 'order'
          });

          title = '订单已送达';
          message = `订单 #${orderId} 已成功送达给客户`;
          userId = order[0].restaurant_id;
          userType = 'restaurant';
          break;

        default:
          throw new AppError('Invalid notification type', 400);
      }

      return await this.createNotification({
        userId,
        userType,
        title,
        message,
        type: 'order'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating order notification', 500);
    }
  }

  static async createReservationNotification(reservationId, type) {
    const pool = database.getPool();

    try {
      // 获取预订信息
      const [reservation] = await pool.query(
        `SELECT 
          r.*,
          c.username as customer_name,
          res.restaurant_name
         FROM reservations r
         JOIN customers c ON r.customer_id = c.id
         JOIN restaurants res ON r.restaurant_id = res.id
         WHERE r.id = ?`,
        [reservationId]
      );

      if (reservation.length === 0) {
        throw new AppError('Reservation not found', 404);
      }

      let title, message, userId, userType;

      switch (type) {
        case 'reservation_placed':
          // 通知餐厅
          title = '新预订通知';
          message = `收到来自 ${reservation[0].customer_name} 的新预订`;
          userId = reservation[0].restaurant_id;
          userType = 'restaurant';
          break;

        case 'reservation_confirmed':
          // 通知客户
          title = '预订已确认';
          message = `${reservation[0].restaurant_name} 已确认您的预订`;
          userId = reservation[0].customer_id;
          userType = 'customer';
          break;

        case 'reservation_reminder':
          // 通知客户
          title = '预订提醒';
          message = `提醒：您在 ${reservation[0].restaurant_name} 的预订时间即将到达`;
          userId = reservation[0].customer_id;
          userType = 'customer';
          break;

        default:
          throw new AppError('Invalid notification type', 400);
      }

      return await this.createNotification({
        userId,
        userType,
        title,
        message,
        type: 'reservation'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating reservation notification', 500);
    }
  }
}

module.exports = Notification; 
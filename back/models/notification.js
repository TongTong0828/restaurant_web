const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const WebSocketServer = require('../utils/websocket');

class Notification {
  static async createNotification(notificationData) {
    const pool = database.getPool();
    const { userId, userType, title, message, type = 'general' } = notificationData;

    try {
      // ����֪ͨ��¼
      const [result] = await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, userType, title, message, type]
      );

      // ��ȡ������֪ͨ����
      const [notification] = await pool.query(
        'SELECT * FROM notifications WHERE id = ?',
        [result.insertId]
      );

      // ͨ��WebSocket����ʵʱ֪ͨ
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
      // ��ȡ������Ϣ
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
          // ֪ͨ����
          title = '�¶���֪ͨ';
          message = `�յ����� ${order[0].customer_name} ���¶���`;
          userId = order[0].restaurant_id;
          userType = 'restaurant';
          break;

        case 'order_confirmed':
          // ֪ͨ�ͻ�
          title = '������ȷ��';
          message = `${order[0].restaurant_name} ��ȷ�����Ķ���`;
          userId = order[0].customer_id;
          userType = 'customer';
          break;

        case 'order_ready':
          // ֪ͨ�ͻ�
          title = '������׼������';
          message = `���� ${order[0].restaurant_name} �Ķ�����׼������`;
          userId = order[0].customer_id;
          userType = 'customer';
          break;

        case 'order_delivered':
          // ֪ͨ�ͻ��Ͳ���
          await this.createNotification({
            userId: order[0].customer_id,
            userType: 'customer',
            title: '�������ʹ�',
            message: `���Ķ������ʹף���ò���죡`,
            type: 'order'
          });

          title = '�������ʹ�';
          message = `���� #${orderId} �ѳɹ��ʹ���ͻ�`;
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
      // ��ȡԤ����Ϣ
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
          // ֪ͨ����
          title = '��Ԥ��֪ͨ';
          message = `�յ����� ${reservation[0].customer_name} ����Ԥ��`;
          userId = reservation[0].restaurant_id;
          userType = 'restaurant';
          break;

        case 'reservation_confirmed':
          // ֪ͨ�ͻ�
          title = 'Ԥ����ȷ��';
          message = `${reservation[0].restaurant_name} ��ȷ������Ԥ��`;
          userId = reservation[0].customer_id;
          userType = 'customer';
          break;

        case 'reservation_reminder':
          // ֪ͨ�ͻ�
          title = 'Ԥ������';
          message = `���ѣ����� ${reservation[0].restaurant_name} ��Ԥ��ʱ�伴������`;
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
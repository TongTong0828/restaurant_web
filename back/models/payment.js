const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Payment {
  static async createPayment(orderId, paymentData) {
    const pool = database.getPool();
    const { amount, paymentMethod } = paymentData;

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 验证订单
        const [order] = await connection.query(
          'SELECT * FROM orders WHERE id = ? AND status = "pending"',
          [orderId]
        );

        if (order.length === 0) {
          throw new AppError('Order not found or already paid', 404);
        }

        if (order[0].total_amount !== amount) {
          throw new AppError('Payment amount does not match order total', 400);
        }

        // 创建支付记录
        const [result] = await connection.query(
          'INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, "pending")',
          [orderId, amount, paymentMethod]
        );

        // 更新订单状态
        await connection.query(
          'UPDATE orders SET status = "confirmed" WHERE id = ?',
          [orderId]
        );

        await connection.commit();

        // 获取完整的支付信息
        const [payment] = await pool.query(
          `SELECT p.*, o.customer_id, o.restaurant_id, o.delivery_address
           FROM payments p
           JOIN orders o ON p.order_id = o.id
           WHERE p.id = ?`,
          [result.insertId]
        );

        return payment[0];
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating payment', 500);
    }
  }

  static async handleCallback(paymentId, callbackData) {
    const pool = database.getPool();
    const { status, transactionId } = callbackData;

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 更新支付状态
        await connection.query(
          'UPDATE payments SET status = ?, transaction_id = ? WHERE id = ?',
          [status, transactionId, paymentId]
        );

        // 获取订单信息
        const [payment] = await connection.query(
          'SELECT order_id FROM payments WHERE id = ?',
          [paymentId]
        );

        if (payment.length === 0) {
          throw new AppError('Payment not found', 404);
        }

        // 更新订单状态
        const orderStatus = status === 'completed' ? 'confirmed' : 'cancelled';
        await connection.query(
          'UPDATE orders SET status = ? WHERE id = ?',
          [orderStatus, payment[0].order_id]
        );

        await connection.commit();

        return { message: 'Payment callback processed successfully' };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error processing payment callback', 500);
    }
  }

  static async getPaymentStatus(orderId, customerId) {
    const pool = database.getPool();

    try {
      const [payment] = await pool.query(
        `SELECT p.*, o.status as order_status
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE p.order_id = ? AND o.customer_id = ?`,
        [orderId, customerId]
      );

      if (payment.length === 0) {
        throw new AppError('Payment not found', 404);
      }

      return payment[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching payment status', 500);
    }
  }

  static async getPaymentHistory(customerId) {
    const pool = database.getPool();

    try {
      const [payments] = await pool.query(
        `SELECT 
          p.*,
          o.status as order_status,
          r.restaurant_name,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', oi.id,
              'name', mi.name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) as items
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         JOIN restaurants r ON o.restaurant_id = r.id
         JOIN order_items oi ON o.id = oi.order_id
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE o.customer_id = ?
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [customerId]
      );

      return payments;
    } catch (error) {
      throw new AppError('Error fetching payment history', 500);
    }
  }

  static async refundPayment(paymentId, refundData) {
    const pool = database.getPool();
    const { reason } = refundData;

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 验证支付记录
        const [payment] = await connection.query(
          `SELECT p.*, o.status as order_status
           FROM payments p
           JOIN orders o ON p.order_id = o.id
           WHERE p.id = ? AND p.status = 'completed'`,
          [paymentId]
        );

        if (payment.length === 0) {
          throw new AppError('Payment not found or not completed', 404);
        }

        // 更新支付状态
        await connection.query(
          'UPDATE payments SET status = "refunded", refund_reason = ? WHERE id = ?',
          [reason, paymentId]
        );

        // 更新订单状态
        await connection.query(
          'UPDATE orders SET status = "cancelled" WHERE id = ?',
          [payment[0].order_id]
        );

        await connection.commit();

        return { message: 'Payment refunded successfully' };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error processing refund', 500);
    }
  }
}

module.exports = Payment; 
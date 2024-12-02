const Order = require('../models/order');
const { AppError } = require('../middleware/errorHandler');
const database = require('../config/database');

// ���ɶ����ŵĺ���
function generateOrderNumber() {
  // ���ɸ�ʽ: ORD + ������ + 6λ�����
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORD${year}${month}${day}${random}`;
}

class OrderController {
  // ��ȡ���������б�
  static async getRestaurantOrders(req, res, next) {
    const { page, limit, status } = req.query;
    const pool = database.getPool();
    
    try {
      // ��ȡ����ID
      const restaurantId = req.user.id;
      console.log('Loading orders with params:', { restaurantId, page, limit, status });
      
      const orders = await Order.getOrders(restaurantId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        role: 'restaurant'
      });
      
      console.log('Raw orders response:', orders);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      next(error);
    }
  }

  // ��ȡ�û������б�
  static async getUserOrders(req, res, next) {
    const pool = database.getPool();
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;
    
    try {
      // ������ѯ����
      let conditions = ['o.user_id = ?'];
      let params = [userId];
      
      if (status) {
        conditions.push('o.status = ?');
        params.push(status);
      }
      
      // ��ȡ��������
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM orders o WHERE ${conditions.join(' AND ')}`,
        params
      );
      const total = countResult[0].total;
      
      // ��ȡ�����б�
      const [orders] = await pool.query(
        `SELECT 
          o.id, o.order_number, o.status, o.total_amount, 
          o.delivery_info, o.payment_method, o.created_at,
          r.name as restaurant_name, r.image as restaurant_image
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );
      
      // ��ȡÿ����������Ʒ
      for (let order of orders) {
        const [items] = await pool.query(
          `SELECT 
            oi.quantity, oi.price, oi.item_name,
            oi.subtotal
          FROM order_items oi
          WHERE oi.order_id = ?`,
          [order.id]
        );
        order.items = items;
        
        // ��ȫ�ؽ���JSON�ֶΣ������Ҫ�Ļ���
        try {
          if (order.delivery_info && typeof order.delivery_info === 'string') {
            order.delivery_info = JSON.parse(order.delivery_info);
          }
        } catch (err) {
          console.error('Error parsing delivery_info:', err);
          order.delivery_info = null;
        }
      }
      
      res.json({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Error fetching user orders:', error);
      next(error);
    }
  }

  // ��ȡ������������
  static async getRestaurantOrderDetail(req, res, next) {
    const { orderId } = req.params;
    const pool = database.getPool();
    
    try {
      // ��ȡ����ID
      const restaurantId = req.user.id;
      const order = await Order.getById(orderId, restaurantId, 'restaurant');
      res.json(order);
    } catch (error) {
      console.error('Error fetching restaurant order:', error);
      next(error);
    }
  }

  // ��ȡ�û���������
  static async getUserOrderDetail(req, res, next) {
    const pool = database.getPool();
    const { order_id } = req.params;
    const userId = req.user.id;
    
    try {
      // ��ȡ����������Ϣ
      const [orders] = await pool.query(
        `SELECT 
          o.id, o.order_number, o.status, o.total_amount,
          o.delivery_info, o.payment_method, o.payment_details,
          o.created_at,
          r.name as restaurant_name, r.image as restaurant_image,
          r.address as restaurant_address, r.phone as restaurant_phone,
          r.id as restaurant_id
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.id = ? AND o.user_id = ?`,
        [order_id, userId]
      );
      
      if (!orders || orders.length === 0) {
        throw new AppError('Order not found', 404);
      }
      
      const order = orders[0];
      
      // ��ȡ������Ʒ
      const [items] = await pool.query(
        `SELECT 
          oi.id as item_id,
          oi.quantity,
          oi.price,
          oi.item_name,
          oi.subtotal,
          oi.menu_item_id
        FROM order_items oi
        WHERE oi.order_id = ?`,
        [order_id]
      );
      
      // ��ȫ�ؽ���JSON�ֶ�
      try {
        if (order.delivery_info && typeof order.delivery_info === 'string') {
          order.delivery_info = JSON.parse(order.delivery_info);
        }
        if (order.payment_details && typeof order.payment_details === 'string') {
          order.payment_details = JSON.parse(order.payment_details);
        }
      } catch (err) {
        console.error('Error parsing JSON fields:', err);
        // �������ʧ�ܣ�����ԭʼ����
      }
      
      // ������Ӧ����
      const responseData = {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        delivery_info: order.delivery_info,
        payment_method: order.payment_method,
        payment_details: order.payment_details,
        created_at: order.created_at,
        restaurant: {
          id: order.restaurant_id,
          name: order.restaurant_name,
          image: order.restaurant_image,
          address: order.restaurant_address,
          phone: order.restaurant_phone
        },
        items: items.map(item => ({
          id: item.item_id,
          menu_item_id: item.menu_item_id,
          name: item.item_name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }))
      };
      
      res.json(responseData);
      
    } catch (error) {
      console.error('Error fetching order detail:', error);
      next(error);
    }
  }

  // ���¶���״̬
  static async updateOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const { status } = req.body;
    const pool = database.getPool();

    try {
      // ��ȡ����ID
      const restaurantId = req.user.id;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      console.log('Updating order status:', { orderId, restaurantId, status });
      const order = await Order.updateStatus(orderId, restaurantId, status);
      console.log('Order status updated:', order);
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      next(error);
    }
  }

  // �����¶���
  static async createOrder(req, res, next) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { 
        restaurantId, 
        items,
        deliveryInfo,
        paymentMethod,
        paymentDetails
      } = req.body;

      // ����������֤
      if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
        throw new AppError('Invalid order data', 400);
      }
      if (!deliveryInfo || !deliveryInfo.address || !deliveryInfo.phone) {
        throw new AppError('Delivery information is required', 400);
      }
      if (!paymentMethod || !['cash', 'credit_card'].includes(paymentMethod)) {
        throw new AppError('Invalid payment method', 400);
      }

      // ��������ÿ�֧������֤֧������
      if (paymentMethod === 'credit_card' && (!paymentDetails || !paymentDetails.cardLastFour || !paymentDetails.cardHolderName)) {
        throw new AppError('Payment details are required for credit card payment', 400);
      }
      
      // ��֤����
      const [restaurants] = await connection.query(
        'SELECT id, minimum_order FROM restaurants WHERE id = ? AND status = "active"',
        [restaurantId]
      );
      
      if (restaurants.length === 0) {
        throw new AppError('Restaurant not found or not active', 404);
      }
      
      const restaurant = restaurants[0];
      
      // ��֤��Ʒ�������ܽ��
      let totalAmount = 0;
      const menuItemIds = items.map(item => item.menuItemId);
      
      const [menuItems] = await connection.query(
        'SELECT id, price, name FROM menu_items WHERE id IN (?) AND restaurant_id = ? AND is_available = TRUE',
        [menuItemIds, restaurantId]
      );
      
      if (menuItems.length !== menuItemIds.length) {
        throw new AppError('Some menu items are not available', 400);
      }
      
      // ������Ʒ�۸�ӳ��
      const menuItemMap = {};
      menuItems.forEach(item => {
        menuItemMap[item.id] = item;
      });
      
      // �����ܽ��
      items.forEach(item => {
        const menuItem = menuItemMap[item.menuItemId];
        totalAmount += menuItem.price * item.quantity;
      });

      // ��֤��Ͷ������
      if (totalAmount < restaurant.minimum_order) {
        throw new AppError(`Minimum order amount is ${restaurant.minimum_order}`, 400);
      }
      
      // ���ɶ�����
      const orderNumber = generateOrderNumber();
      
      // ��������
      const [orderResult] = await connection.query(
        `INSERT INTO orders (
          order_number, user_id, restaurant_id, total_amount,
          delivery_info, payment_method, payment_details,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          req.user.id,
          restaurantId,
          totalAmount,
          JSON.stringify(deliveryInfo),
          paymentMethod,
          paymentMethod === 'credit_card' ? JSON.stringify(paymentDetails) : null,
          'pending'
        ]
      );
      
      // ����������
      for (const item of items) {
        const menuItem = menuItemMap[item.menuItemId];
        const subtotal = menuItem.price * item.quantity;
        
        await connection.query(
          `INSERT INTO order_items (
            order_id, menu_item_id, quantity, price, subtotal, item_name
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderResult.insertId,
            item.menuItemId,
            item.quantity,
            menuItem.price,
            subtotal,
            menuItem.name
          ]
        );
      }
      
      await connection.commit();
      
      // ��չ��ﳵ
      await connection.query(
        'DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)',
        [req.user.id]
      );

      // ���ش����Ķ���
      res.status(201).json({
        message: 'Order created successfully',
        orderId: orderResult.insertId,
        orderNumber
      });
      
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  // ȡ������
  static async cancelOrder(req, res, next) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    const { order_id } = req.params;
    const userId = req.user.id;
    
    try {
      await connection.beginTransaction();
      
      // ��鶩���Ƿ���������ڵ�ǰ�û�
      const [orders] = await connection.query(
        'SELECT status FROM orders WHERE id = ? AND user_id = ?',
        [order_id, userId]
      );
      
      if (orders.length === 0) {
        throw new AppError('Order not found', 404);
      }
      
      const order = orders[0];
      
      // ��鶩���Ƿ����ȡ����ֻ��pending״̬�Ķ�������ȡ����
      if (order.status !== 'pending') {
        throw new AppError('Only pending orders can be cancelled', 400);
      }
      
      // ���¶���״̬Ϊ��ȡ��
      await connection.query(
        'UPDATE orders SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [order_id]
      );
      
      await connection.commit();
      
      res.json({
        message: 'Order cancelled successfully'
      });
      
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }
}

module.exports = OrderController; 
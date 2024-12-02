const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Order {
  // 订单状态常量
  static ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  // 有效的状态转换路径
  static STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled', 'preparing'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivering', 'delivered', 'completed', 'cancelled'],
    delivering: ['delivered', 'completed', 'cancelled'],
    delivered: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  // 验证状态转换是否有效
  static validateStatusTransition(currentStatus, newStatus) {
    console.log('Validating status transition:', { currentStatus, newStatus });
    const validNextStatuses = this.STATUS_TRANSITIONS[currentStatus] || [];
    console.log('Valid next statuses:', validNextStatuses);
    if (!validNextStatuses.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Valid next statuses are: ${validNextStatuses.join(', ')}`,
        400
      );
    }
  }

  static async getOrders(userId, { page = 1, limit = 10, status = '', role = 'user' }) {
    const pool = database.getPool();
    const offset = (page - 1) * limit;
    
    try {
      let query = `
        SELECT 
          o.*,
          r.name as restaurant_name,
          r.image as restaurant_image,
          u.name as customer_name,
          u.phone as customer_phone
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      
      // 根据角色过滤订单
      if (role === 'restaurant') {
        query += ` AND o.restaurant_id = ?`;
        params.push(userId);  // 这里的 userId 实际上是 restaurant_id
      } else {
        query += ` AND o.user_id = ?`;
        params.push(userId);
      }
      
      if (status) {
        query += ` AND o.status = ?`;
        params.push(status);
      }
      
      query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));
      
      console.log('Executing query:', query);
      console.log('With params:', params);
      
      const [orders] = await pool.query(query, params);
      console.log('Query result:', orders);
      
      // 获取总数的查询也需要根据角色调整
      const countQuery = role === 'restaurant' 
        ? 'SELECT COUNT(*) as total FROM orders WHERE restaurant_id = ?' 
        : 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
      const [countResult] = await pool.query(countQuery, [userId]);
      const total = countResult[0].total;
      console.log('Total count:', total);
      
      // 获取订单项目
      for (let order of orders) {
        const [items] = await pool.query(`
          SELECT 
            oi.*,
            COALESCE(m.name, oi.item_name) as name,
            COALESCE(m.price, oi.price) as price
          FROM order_items oi
          LEFT JOIN menu_items m ON oi.menu_item_id = m.id
          WHERE oi.order_id = ?
        `, [order.id]);
        
        order.items = items.map(item => ({
          id: item.menu_item_id,
          name: item.name || item.item_name,
          price: item.price,
          quantity: item.quantity
        }));
        
        // 根据角色返回不同的数据结构
        if (role === 'restaurant') {
          order.customer = {
            name: order.customer_name,
            phone: order.customer_phone
          };
        } else {
          order.restaurant = {
            id: order.restaurant_id,
            name: order.restaurant_name,
            image: order.restaurant_image
          };
        }
        
        // 添加订单总金额
        order.total_amount = parseFloat(order.total_amount) || 0;
        
        // 解析 delivery_info
        if (typeof order.delivery_info === 'string') {
          try {
            order.delivery_info = JSON.parse(order.delivery_info);
          } catch (e) {
            order.delivery_info = {};
          }
        }
        
        // 清理不需要的字段
        delete order.restaurant_id;
        delete order.restaurant_name;
        delete order.restaurant_image;
        delete order.customer_name;
        delete order.customer_phone;
      }
      
      return { total, orders };
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw new AppError('Error fetching orders', 500);
    }
  }
  
  static async getById(orderId, userId, role = 'user') {
    const pool = database.getPool();
    try {
      const [orders] = await pool.query(`
        SELECT 
          o.*,
          r.name as restaurant_name,
          r.image as restaurant_image,
          u.name as customer_name,
          u.phone as customer_phone
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ? AND ${role === 'restaurant' ? 'o.restaurant_id' : 'o.user_id'} = ?
      `, [orderId, userId]);
      
      if (orders.length === 0) {
        throw new AppError('Order not found', 404);
      }
      
      const order = orders[0];
      
      // 获取订单项目
      const [items] = await pool.query(`
        SELECT 
          oi.*,
          COALESCE(m.name, oi.item_name) as name,
          COALESCE(m.price, oi.price) as price
        FROM order_items oi
        LEFT JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE oi.order_id = ?
      `, [orderId]);
      
      order.items = items.map(item => ({
        id: item.menu_item_id,
        name: item.name || item.item_name,
        price: item.price,
        quantity: item.quantity
      }));
      
      // 根据角色返回不同的数据结构
      if (role === 'restaurant') {
        order.customer = {
          name: order.customer_name,
          phone: order.customer_phone
        };
      } else {
        order.restaurant = {
          id: order.restaurant_id,
          name: order.restaurant_name,
          image: order.restaurant_image
        };
      }
      
      // 添加订单总金额
      order.total_amount = parseFloat(order.total_amount) || 0;
      
      // 解析 delivery_info
      if (typeof order.delivery_info === 'string') {
        try {
          order.delivery_info = JSON.parse(order.delivery_info);
        } catch (e) {
          order.delivery_info = {};
        }
      }
      
      // 清理不需要的字段
      delete order.restaurant_id;
      delete order.restaurant_name;
      delete order.restaurant_image;
      delete order.customer_name;
      delete order.customer_phone;
      
      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching order', 500);
    }
  }
  
  static async create(userId, orderData) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { restaurantId, items, deliveryInfo, paymentMethod, mockData, totalAmount } = orderData;
      
      // Add debug logging
      console.log('Creating order with data:', {
        userId,
        restaurantId,
        items,
        deliveryInfo,
        paymentMethod,
        mockData,
        totalAmount
      });
      
      // 转换ID为整数
      const restaurantIdInt = parseInt(restaurantId, 10);
      
      // 如果是mock数据，跳过餐厅验证
      if (!mockData) {
        // 验证餐厅
        const [restaurants] = await connection.query(
          'SELECT id FROM restaurants WHERE id = ? AND status = "active"',
          [restaurantIdInt]
        );
        
        if (restaurants.length === 0) {
          throw new AppError('Restaurant not found or not active', 404);
        }
      }
      
      // Add debug logging
      console.log('Creating order record...');
      
      // 创建订单
      const [orderResult] = await connection.query(`
        INSERT INTO orders (
          user_id, restaurant_id, status, delivery_info, payment_method, total_amount
        ) VALUES (?, ?, 'pending', ?, ?, ?)
      `, [userId, restaurantIdInt, JSON.stringify(deliveryInfo), paymentMethod, parseFloat(totalAmount) || 0]);
      
      const orderId = orderResult.insertId;
      console.log('Order created with ID:', orderId);
      
      // 添加订单项目
      for (const item of items) {
        console.log('Adding order item:', item);
        if (mockData) {
          // 如果是mock数据，直接使用传入的价格
          await connection.query(`
            INSERT INTO order_items (
              order_id, menu_item_id, quantity, price, item_name
            ) VALUES (?, ?, ?, ?, ?)
          `, [
            orderId, 
            parseInt(item.menuItemId, 10) || 0, 
            parseInt(item.quantity, 10), 
            parseFloat(item.price), 
            item.name
          ]);
        } else {
          // 正常流程：验证菜品并获取价格
          const menuItemId = parseInt(item.menuItemId, 10);
          const [menuItems] = await connection.query(
            'SELECT price FROM menu_items WHERE id = ? AND restaurant_id = ?',
            [menuItemId, restaurantIdInt]
          );
          
          if (menuItems.length === 0) {
            throw new AppError(`Menu item ${menuItemId} not found`, 404);
          }
          
          await connection.query(`
            INSERT INTO order_items (
              order_id, menu_item_id, quantity, price
            ) VALUES (?, ?, ?, ?)
          `, [orderId, menuItemId, parseInt(item.quantity, 10), menuItems[0].price]);
        }
      }
      
      await connection.commit();
      console.log('Transaction committed successfully');
      
      // 如果不是mock数据，清空购物车
      if (!mockData) {
        await connection.query('DELETE FROM carts WHERE user_id = ?', [userId]);
      }
      
      const order = await this.getById(orderId, userId);
      console.log('Retrieved created order:', order);
      return order;
    } catch (error) {
      await connection.rollback();
      console.error('Error creating order:', error);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating order', 500);
    } finally {
      connection.release();
    }
  }
  
  static async cancel(orderId, userId) {
    const pool = database.getPool();
    try {
      const [orders] = await pool.query(
        'SELECT status FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      );
      
      if (orders.length === 0) {
        throw new AppError('Order not found', 404);
      }
      
      if (!['pending', 'confirmed'].includes(orders[0].status)) {
        throw new AppError('Order cannot be cancelled', 400);
      }
      
      await pool.query(
        'UPDATE orders SET status = "cancelled" WHERE id = ?',
        [orderId]
      );
      
      return await this.getById(orderId, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error cancelling order', 500);
    }
  }
  
  static async updateStatus(orderId, restaurantId, newStatus) {
    const pool = database.getPool();
    try {
      console.log('Checking order:', { orderId, restaurantId, newStatus });
      const [orders] = await pool.query(
        'SELECT status FROM orders WHERE id = ? AND restaurant_id = ?',
        [orderId, restaurantId]
      );
      
      if (orders.length === 0) {
        throw new AppError('Order not found', 404);
      }

      const currentStatus = orders[0].status;
      console.log('Current status:', currentStatus);
      
      // 验证状态转换是否有效
      this.validateStatusTransition(currentStatus, newStatus);
      console.log('Status transition validated');
      
      await pool.query(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, orderId]
      );
      console.log('Status updated in database');
      
      return await this.getById(orderId, restaurantId, 'restaurant');
    } catch (error) {
      console.error('Error in updateStatus:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating order status', 500);
    }
  }
}

module.exports = Order; 
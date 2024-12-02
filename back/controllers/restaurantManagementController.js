const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// 获取仪表盘数据
exports.getDashboardData = async (req, res, next) => {
  const pool = database.getPool();
  
  try {
    // 验证用户角色
    if (!req.user || req.user.role !== 'restaurant') {
      throw new AppError('Access forbidden. Restaurant authentication required', 403);
    }
    
    // 获取餐厅ID
    const restaurantId = req.user.id;
    
    // 1. 获取餐厅基本信息
    const [restaurantInfo] = await pool.query(
      `SELECT id, name, status, rating FROM restaurants WHERE id = ? AND status != 'deleted'`,
      [restaurantId]
    );

    if (restaurantInfo.length === 0) {
      throw new AppError('Restaurant not found', 404);
    }

    const restaurant = restaurantInfo[0];

    // 2. 获取订单统计
    const [orderStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
        SUM(CASE WHEN status = 'delivering' THEN 1 ELSE 0 END) as delivering,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders 
      WHERE restaurant_id = ?`,
      [restaurantId]
    );

    // 3. 获取收入统计
    const [revenue] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN YEARWEEK(created_at) = YEARWEEK(CURDATE()) THEN total_amount ELSE 0 END), 0) as thisWeek,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) 
            THEN total_amount ELSE 0 END), 0) as thisMonth,
        COALESCE(SUM(total_amount), 0) as total
      FROM orders 
      WHERE restaurant_id = ? AND status = 'completed'`,
      [restaurantId]
    );

    // 4. 获取热门菜品
    const [popularItems] = await pool.query(
      `SELECT 
        mi.id,
        mi.name,
        COUNT(oi.id) as orderCount,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM menu_items mi
      LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE mi.restaurant_id = ? AND o.status = 'completed'
      GROUP BY mi.id
      ORDER BY orderCount DESC
      LIMIT 5`,
      [restaurantId]
    );

    // 5. 获取最近订单
    const [recentOrders] = await pool.query(
      `SELECT 
        id, 
        status, 
        COALESCE(total_amount, 0) as total, 
        created_at
      FROM orders
      WHERE restaurant_id = ?
      ORDER BY created_at DESC
      LIMIT 5`,
      [restaurantId]
    );

    // 6. 获取营业统计
    const [statistics] = await pool.query(
      `SELECT 
        (SELECT COALESCE(AVG(total_amount), 0) 
         FROM orders 
         WHERE restaurant_id = ? AND status = 'completed') as averageOrderValue,
        (SELECT COUNT(DISTINCT user_id) 
         FROM orders 
         WHERE restaurant_id = ? AND status = 'completed') as totalCustomers,
        (SELECT COUNT(*) 
         FROM (
           SELECT user_id 
           FROM orders 
           WHERE restaurant_id = ? AND status = 'completed' 
           GROUP BY user_id 
           HAVING COUNT(*) > 1
         ) as repeat_customers) as repeatCustomers`,
      [restaurantId, restaurantId, restaurantId]
    );

    // 格式化数值，确保返回正确的数据类型
    const formattedResponse = {
      status: 'success',
      data: {
        restaurant,
        orders: {
          total: parseInt(orderStats[0].total) || 0,
          today: parseInt(orderStats[0].today) || 0,
          pending: parseInt(orderStats[0].pending) || 0,
          preparing: parseInt(orderStats[0].preparing) || 0,
          delivering: parseInt(orderStats[0].delivering) || 0,
          completed: parseInt(orderStats[0].completed) || 0,
          cancelled: parseInt(orderStats[0].cancelled) || 0
        },
        revenue: {
          today: parseFloat(revenue[0].today) || 0,
          thisWeek: parseFloat(revenue[0].thisWeek) || 0,
          thisMonth: parseFloat(revenue[0].thisMonth) || 0,
          total: parseFloat(revenue[0].total) || 0
        },
        popularItems: popularItems.map(item => ({
          id: item.id,
          name: item.name,
          orderCount: parseInt(item.orderCount) || 0,
          revenue: parseFloat(item.revenue) || 0
        })),
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          status: order.status,
          total: parseFloat(order.total) || 0,
          created_at: order.created_at.toISOString()
        })),
        statistics: {
          averageOrderValue: parseFloat(statistics[0].averageOrderValue) || 0,
          totalCustomers: parseInt(statistics[0].totalCustomers) || 0,
          repeatCustomers: parseInt(statistics[0].repeatCustomers) || 0
        }
      }
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('Dashboard Error:', error);
    next(error);
  }
};

// 获取菜单项目
exports.getMenuItems = async (req, res, next) => {
  const pool = database.getPool();
  
  try {
    const restaurantId = req.user.id;
    
    // 获取菜品列表
    const [menuItems] = await pool.query(`
      SELECT 
        m.*,
        c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = ?
      ORDER BY m.category_id, m.name
    `, [restaurantId]);

    // 获取所有分类
    const [categories] = await pool.query(`
      SELECT DISTINCT c.id, c.name
      FROM categories c
      JOIN menu_items m ON c.id = m.category_id
      WHERE m.restaurant_id = ?
    `, [restaurantId]);

    res.json({
      status: 'success',
      data: {
        categories: categories,
        items: menuItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          category: item.category_name,
          is_available: item.is_available
        }))
      }
    });
  } catch (error) {
    console.error('Error getting menu items:', error);
    next(error);
  }
};

// 添加菜单项目
exports.addMenuItem = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const restaurantId = req.user.id;
    const { name, description, price, category, image_url } = req.body;

    // 验证必填字段
    if (!name || !price || !category) {
      throw new AppError('Name, price and category are required', 400);
    }

    // 获取或创建分类
    let categoryId;
    const [existingCategory] = await connection.query(
      'SELECT id FROM categories WHERE name = ?',
      [category]
    );

    if (existingCategory.length > 0) {
      categoryId = existingCategory[0].id;
    } else {
      const [newCategory] = await connection.query(
        'INSERT INTO categories (name) VALUES (?)',
        [category]
      );
      categoryId = newCategory.insertId;
    }

    // 创建菜品
    const [result] = await connection.query(
      `INSERT INTO menu_items (
        restaurant_id, name, description, price,
        image_url, category_id, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, true)`,
      [restaurantId, name, description, price, image_url, categoryId]
    );

    await connection.commit();

    // 获取创建的菜品
    const [menuItem] = await pool.query(
      `SELECT m.*, c.name as category_name
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        item: {
          id: menuItem[0].id,
          name: menuItem[0].name,
          description: menuItem[0].description,
          price: menuItem[0].price,
          image_url: menuItem[0].image_url,
          category: menuItem[0].category_name,
          is_available: menuItem[0].is_available
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding menu item:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// 更新菜单项目
exports.updateMenuItem = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { itemId } = req.params;
    const restaurantId = req.user.id;
    const { name, description, price, category, image_url, is_available } = req.body;

    // 验证菜品是否属于该餐厅
    const [existingItem] = await connection.query(
      'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [itemId, restaurantId]
    );

    if (existingItem.length === 0) {
      throw new AppError('Menu item not found', 404);
    }

    // 如果提供了分类，获取或创建分类ID
    let categoryId;
    if (category) {
      const [existingCategory] = await connection.query(
        'SELECT id FROM categories WHERE name = ?',
        [category]
      );

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        const [newCategory] = await connection.query(
          'INSERT INTO categories (name) VALUES (?)',
          [category]
        );
        categoryId = newCategory.insertId;
      }
    }

    // 更新菜品
    await connection.query(
      `UPDATE menu_items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        image_url = COALESCE(?, image_url),
        category_id = COALESCE(?, category_id),
        is_available = COALESCE(?, is_available)
      WHERE id = ?`,
      [name, description, price, image_url, categoryId, is_available, itemId]
    );

    await connection.commit();

    // 获取更新后的菜品
    const [menuItem] = await pool.query(
      `SELECT m.*, c.name as category_name
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = ?`,
      [itemId]
    );

    res.json({
      status: 'success',
      data: {
        item: {
          id: menuItem[0].id,
          name: menuItem[0].name,
          description: menuItem[0].description,
          price: menuItem[0].price,
          image_url: menuItem[0].image_url,
          category: menuItem[0].category_name,
          is_available: menuItem[0].is_available
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating menu item:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// 删除菜单项目
exports.deleteMenuItem = async (req, res, next) => {
  const pool = database.getPool();
  
  try {
    const { itemId } = req.params;
    const restaurantId = req.user.id;

    // 验证菜品是否属于该餐厅
    const [existingItem] = await pool.query(
      'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [itemId, restaurantId]
    );

    if (existingItem.length === 0) {
      throw new AppError('Menu item not found', 404);
    }

    // 删除菜品
    await pool.query(
      'DELETE FROM menu_items WHERE id = ?',
      [itemId]
    );

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    next(error);
  }
}; 
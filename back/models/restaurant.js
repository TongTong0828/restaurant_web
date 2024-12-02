const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Restaurant {
  static async getAll({ page = 1, limit = 10, search = '', category = '', sort = '' }) {
    const pool = database.getPool();
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    try {
      let query = `
        SELECT 
          r.id,
          r.name,
          r.description,
          r.address,
          r.phone,
          r.image,
          r.rating,
          r.delivery_fee,
          r.minimum_order,
          r.opening_hours,
          r.status,
          GROUP_CONCAT(DISTINCT c.name) as categories
        FROM restaurants r
        LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
        LEFT JOIN categories c ON rc.category_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (search) {
        query += ` AND (r.name LIKE ? OR r.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (category) {
        query += ` AND c.name = ?`;
        params.push(category);
      }
      
      query += ` GROUP BY r.id`;
      
      if (sort) {
        const sortField = {
          rating: 'r.rating DESC',
          deliveryFee: 'r.delivery_fee ASC',
          minimumOrder: 'r.minimum_order ASC'
        }[sort];
        if (sortField) {
          query += ` ORDER BY ${sortField}`;
        }
      } else {
        query += ` ORDER BY r.created_at DESC`;
      }
      
      query += ` LIMIT ? OFFSET ?`;
      params.push(limitNum, offset);
      
      console.log('Restaurant Query:', query);
      console.log('Params:', params);
      
      const [restaurants] = await pool.query(query, params);
      console.log('Found restaurants:', restaurants.length);
      console.log('Restaurant data:', JSON.stringify(restaurants, null, 2));
      
      const [{ total }] = await pool.query('SELECT COUNT(DISTINCT r.id) as total FROM restaurants r');
      console.log('Total restaurants:', total);
      
      const restaurantsWithMenus = await Promise.all(restaurants.map(async (r) => {
        const [menuItems] = await pool.query(`
          SELECT 
            m.id,
            m.name,
            m.description,
            m.price,
            m.image_url,
            m.is_available,
            c.name as category_name
          FROM menu_items m
          LEFT JOIN categories c ON m.category_id = c.id
          WHERE m.restaurant_id = ?
          ORDER BY c.name, m.name
        `, [r.id]);
        
        let opening_hours = null;
        if (r.opening_hours) {
          if (typeof r.opening_hours === 'string') {
            try {
              opening_hours = JSON.parse(r.opening_hours);
            } catch (e) {
              console.warn(`Failed to parse opening_hours string for restaurant ${r.id}:`, e);
            }
          } else {
            opening_hours = r.opening_hours;
          }
        }
        
        if (!opening_hours) {
          opening_hours = {
            monday: { open: "09:00", close: "22:00" },
            tuesday: { open: "09:00", close: "22:00" },
            wednesday: { open: "09:00", close: "22:00" },
            thursday: { open: "09:00", close: "22:00" },
            friday: { open: "09:00", close: "22:00" },
            saturday: { open: "09:00", close: "22:00" },
            sunday: { open: "09:00", close: "22:00" }
          };
        }
        
        const menuByCategory = menuItems.reduce((acc, item) => {
          const category = item.category_name || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price) || 0,
            image: item.image_url,
            is_available: Boolean(item.is_available)
          });
          return acc;
        }, {});
        
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          address: r.address,
          phone: r.phone,
          image: r.image,
          status: r.status,
          categories: r.categories ? r.categories.split(',').filter(Boolean) : [],
          opening_hours,
          delivery_fee: parseFloat(r.delivery_fee) || 0,
          minimum_order: parseFloat(r.minimum_order) || 0,
          rating: parseFloat(r.rating) || 0,
          menu_items: menuByCategory
        };
      }));
      
      return {
        total,
        page: pageNum,
        limit: limitNum,
        restaurants: restaurantsWithMenus
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      throw new AppError('Error fetching restaurants', 500);
    }
  }
  
  static async getById(id) {
    const pool = database.getPool();
    try {
      // 获取餐厅基本信息
      const [restaurants] = await pool.query(`
        SELECT 
          r.*,
          GROUP_CONCAT(DISTINCT c.name) as categories
        FROM restaurants r
        LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
        LEFT JOIN categories c ON rc.category_id = c.id
        WHERE r.id = ?
        GROUP BY r.id
      `, [id]);
      
      if (restaurants.length === 0) {
        throw new AppError('Restaurant not found', 404);
      }
      
      const restaurant = restaurants[0];

      // 获取餐厅的菜品信息
      const [menuItems] = await pool.query(`
        SELECT 
          m.*,
          c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.restaurant_id = ?
        ORDER BY c.name, m.name
      `, [id]);

      // 按分类组织菜品
      const menuByCategory = menuItems.reduce((acc, item) => {
        const category = item.category_name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price) || 0,
          image_url: item.image_url,
          is_available: Boolean(item.is_available)
        });
        return acc;
      }, {});
      
      let opening_hours = null;
      if (restaurant.opening_hours) {
        if (typeof restaurant.opening_hours === 'string') {
          try {
            opening_hours = JSON.parse(restaurant.opening_hours);
          } catch (e) {
            console.warn(`Failed to parse opening_hours string for restaurant ${restaurant.id}:`, e);
          }
        } else {
          opening_hours = restaurant.opening_hours;
        }
      }
      
      if (!opening_hours) {
        opening_hours = {
          monday: { open: "09:00", close: "22:00" },
          tuesday: { open: "09:00", close: "22:00" },
          wednesday: { open: "09:00", close: "22:00" },
          thursday: { open: "09:00", close: "22:00" },
          friday: { open: "09:00", close: "22:00" },
          saturday: { open: "09:00", close: "22:00" },
          sunday: { open: "09:00", close: "22:00" }
        };
      }
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        image: restaurant.image,
        status: restaurant.status,
        categories: restaurant.categories ? restaurant.categories.split(',').filter(Boolean) : [],
        opening_hours,
        delivery_fee: parseFloat(restaurant.delivery_fee) || 0,
        minimum_order: parseFloat(restaurant.minimum_order) || 0,
        rating: parseFloat(restaurant.rating) || 0,
        menu_items: menuByCategory
      };
    } catch (error) {
      console.error('Error in getById:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching restaurant', 500);
    }
  }
  
  static async getPopular(limit = 10) {
    const pool = database.getPool();
    try {
      const limitNum = parseInt(limit) || 10;
      const [restaurants] = await pool.query(`
        SELECT 
          r.*,
          GROUP_CONCAT(DISTINCT c.name) as categories
        FROM restaurants r
        LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
        LEFT JOIN categories c ON rc.category_id = c.id
        GROUP BY r.id
        ORDER BY r.rating DESC
        LIMIT ?
      `, [limitNum]);
      
      return restaurants.map(r => {
        let opening_hours = null;
        if (r.opening_hours) {
          if (typeof r.opening_hours === 'string') {
            try {
              opening_hours = JSON.parse(r.opening_hours);
            } catch (e) {
              console.warn(`Failed to parse opening_hours string for restaurant ${r.id}:`, e);
            }
          } else {
            opening_hours = r.opening_hours;
          }
        }
        
        if (!opening_hours) {
          opening_hours = {
            monday: { open: "09:00", close: "22:00" },
            tuesday: { open: "09:00", close: "22:00" },
            wednesday: { open: "09:00", close: "22:00" },
            thursday: { open: "09:00", close: "22:00" },
            friday: { open: "09:00", close: "22:00" },
            saturday: { open: "09:00", close: "22:00" },
            sunday: { open: "09:00", close: "22:00" }
          };
        }
        
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          address: r.address,
          phone: r.phone,
          image: r.image,
          status: r.status,
          categories: r.categories ? r.categories.split(',').filter(Boolean) : [],
          opening_hours,
          delivery_fee: parseFloat(r.delivery_fee) || 0,
          minimum_order: parseFloat(r.minimum_order) || 0,
          rating: parseFloat(r.rating) || 0
        };
      });
    } catch (error) {
      console.error('Error in getPopular:', error);
      throw new AppError('Error fetching popular restaurants', 500);
    }
  }
  
  static async update(id, updateData) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { name, description, address, phone, delivery_fee, minimum_order, opening_hours } = updateData;

      // 检查餐厅是否存在
      const [existingRestaurant] = await connection.query(
        'SELECT id FROM restaurants WHERE id = ?',
        [id]
      );

      if (existingRestaurant.length === 0) {
        throw new AppError('Restaurant not found', 404);
      }

      // 更新餐厅信息
      await connection.query(
        `UPDATE restaurants 
         SET name = COALESCE(?, name),
             description = COALESCE(?, description),
             address = COALESCE(?, address),
             phone = COALESCE(?, phone),
             delivery_fee = COALESCE(?, delivery_fee),
             minimum_order = COALESCE(?, minimum_order),
             opening_hours = COALESCE(?, opening_hours)
         WHERE id = ?`,
        [name, description, address, phone, delivery_fee, minimum_order, 
         opening_hours ? JSON.stringify(opening_hours) : null, 
         id]
      );

      await connection.commit();

      // 获取更新后的餐厅信息
      return await this.getById(id);
      
    } catch (error) {
      await connection.rollback();
      console.error('Error updating restaurant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating restaurant', 500);
    } finally {
      connection.release();
    }
  }
}

module.exports = Restaurant; 
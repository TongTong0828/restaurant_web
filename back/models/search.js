const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Search {
  static async searchMenuItems(query, filters = {}) {
    const pool = database.getPool();
    const {
      restaurant_id,
      category,
      price_min,
      price_max,
      dietary
    } = filters;

    try {
      let sql = `
        SELECT m.*, r.restaurant_name, c.name as category_name
        FROM menu_items m
        JOIN restaurants r ON m.restaurant_id = r.id
        LEFT JOIN menu_categories c ON m.category_id = c.id
        WHERE m.is_available = true
      `;
      const params = [];

      if (query) {
        sql += ' AND (m.name LIKE ? OR m.description LIKE ?)';
        params.push(`%${query}%`, `%${query}%`);
      }

      if (restaurant_id) {
        sql += ' AND m.restaurant_id = ?';
        params.push(restaurant_id);
      }

      if (category) {
        sql += ' AND c.name = ?';
        params.push(category);
      }

      if (price_min !== undefined) {
        sql += ' AND m.price >= ?';
        params.push(price_min);
      }

      if (price_max !== undefined) {
        sql += ' AND m.price <= ?';
        params.push(price_max);
      }

      if (dietary && dietary.length > 0) {
        const dietaryConditions = [];
        dietary.forEach(diet => {
          switch (diet) {
            case 'vegetarian':
              dietaryConditions.push('m.is_vegetarian = true');
              break;
            case 'vegan':
              dietaryConditions.push('m.is_vegan = true');
              break;
            case 'gluten_free':
              dietaryConditions.push('m.is_gluten_free = true');
              break;
          }
        });
        if (dietaryConditions.length > 0) {
          sql += ` AND (${dietaryConditions.join(' OR ')})`;
        }
      }

      sql += ' ORDER BY r.restaurant_name, m.name';

      const [menuItems] = await pool.query(sql, params);
      return menuItems;
    } catch (error) {
      throw new AppError('Error searching menu items', 500);
    }
  }

  static async searchPolicies(query, category) {
    const pool = database.getPool();

    try {
      let sql = 'SELECT * FROM policies WHERE 1=1';
      const params = [];

      if (query) {
        sql += ' AND (title LIKE ? OR content LIKE ?)';
        params.push(`%${query}%`, `%${query}%`);
      }

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY category, created_at DESC';

      const [policies] = await pool.query(sql, params);
      return policies;
    } catch (error) {
      throw new AppError('Error searching policies', 500);
    }
  }

  static async getRestaurantRecommendations(userId, preferences = {}) {
    const pool = database.getPool();
    const { cuisine_preference, location, price_range } = preferences;

    try {
      // 获取用户的订单历史
      const [orderHistory] = await pool.query(
        `SELECT DISTINCT r.id, r.restaurant_name, r.cuisine_type,
         COUNT(o.id) as order_count
         FROM orders o
         JOIN restaurants r ON o.restaurant_id = r.id
         WHERE o.customer_id = ?
         GROUP BY r.id
         ORDER BY order_count DESC
         LIMIT 5`,
        [userId]
      );

      // 基于用户偏好的推荐
      let recommendationQuery = `
        SELECT DISTINCT r.*, 
        (
          SELECT AVG(rating)
          FROM restaurant_reviews
          WHERE restaurant_id = r.id
        ) as avg_rating
        FROM restaurants r
        WHERE r.status = 'active'
      `;
      const params = [];

      if (cuisine_preference) {
        recommendationQuery += ' AND r.cuisine_type = ?';
        params.push(cuisine_preference);
      }

      if (price_range) {
        const [min_price, max_price] = price_range.split('-').map(Number);
        recommendationQuery += ` 
          AND (
            SELECT AVG(price)
            FROM menu_items
            WHERE restaurant_id = r.id
          ) BETWEEN ? AND ?
        `;
        params.push(min_price, max_price);
      }

      if (location) {
        // 这里可以添加基于位置的筛选
        // 需要使用地理位置计算
      }

      recommendationQuery += ' ORDER BY avg_rating DESC LIMIT 10';

      const [recommendations] = await pool.query(recommendationQuery, params);

      // 合并历史订单和推荐结果
      const combinedResults = {
        based_on_history: orderHistory,
        based_on_preferences: recommendations
      };

      return combinedResults;
    } catch (error) {
      throw new AppError('Error getting restaurant recommendations', 500);
    }
  }
}

module.exports = Search; 
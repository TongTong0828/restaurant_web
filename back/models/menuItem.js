const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class MenuItem {
  static async getByRestaurantId(restaurantId, category = '') {
    const pool = database.getPool();
    try {
      let query = `
        SELECT 
          m.*,
          c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.restaurant_id = ?
      `;
      const params = [restaurantId];
      
      if (category) {
        query += ` AND c.name = ?`;
        params.push(category);
      }
      
      const [items] = await pool.query(query, params);
      const [categories] = await pool.query(`
        SELECT DISTINCT c.name
        FROM menu_items m
        JOIN categories c ON m.category_id = c.id
        WHERE m.restaurant_id = ?
      `, [restaurantId]);
      
      return {
        categories: categories.map(c => c.name),
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image_url,
          category: item.category_name,
          restaurantId: item.restaurant_id
        }))
      };
    } catch (error) {
      throw new AppError('Error fetching menu items', 500);
    }
  }
  
  static async getById(id) {
    const pool = database.getPool();
    try {
      const [items] = await pool.query(`
        SELECT 
          m.*,
          c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.id = ?
      `, [id]);
      
      if (items.length === 0) {
        throw new AppError('Menu item not found', 404);
      }
      
      const item = items[0];
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url,
        category: item.category_name,
        restaurantId: item.restaurant_id
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching menu item', 500);
    }
  }

  static async create(restaurantId, itemData) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { name, description, price, category, image_url } = itemData;
      console.log('Creating menu item:', { restaurantId, name, description, price, category, image_url });

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
      console.log('Existing category:', existingCategory);

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        const [newCategory] = await connection.query(
          'INSERT INTO categories (name) VALUES (?)',
          [category]
        );
        categoryId = newCategory.insertId;
        console.log('Created new category:', { categoryId, category });
      }

      // 创建菜品
      const [result] = await connection.query(
        `INSERT INTO menu_items (
          restaurant_id, name, description, price,
          image_url, category_id, is_available
        ) VALUES (?, ?, ?, ?, ?, ?, true)`,
        [restaurantId, name, description, price, image_url, categoryId]
      );
      console.log('Inserted menu item:', result);

      await connection.commit();

      // 获取创建的菜品
      const [menuItem] = await pool.query(
        `SELECT m.*, c.name as category_name
         FROM menu_items m
         LEFT JOIN categories c ON m.category_id = c.id
         WHERE m.id = ?`,
        [result.insertId]
      );
      console.log('Created menu item details:', menuItem[0]);

      return {
        id: menuItem[0].id,
        name: menuItem[0].name,
        description: menuItem[0].description,
        price: parseFloat(menuItem[0].price),
        image_url: menuItem[0].image_url,
        category: menuItem[0].category_name,
        is_available: Boolean(menuItem[0].is_available)
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error creating menu item:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating menu item', 500);
    } finally {
      connection.release();
    }
  }

  static async update(restaurantId, itemId, updateData) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { name, description, price, category, image_url, is_available } = updateData;

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

      return {
        id: menuItem[0].id,
        name: menuItem[0].name,
        description: menuItem[0].description,
        price: parseFloat(menuItem[0].price),
        image_url: menuItem[0].image_url,
        category: menuItem[0].category_name,
        is_available: Boolean(menuItem[0].is_available)
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error updating menu item:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating menu item', 500);
    } finally {
      connection.release();
    }
  }

  static async delete(restaurantId, itemId) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 验证菜品是否属于该餐厅
      const [existingItem] = await connection.query(
        'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [itemId, restaurantId]
      );

      if (existingItem.length === 0) {
        throw new AppError('Menu item not found', 404);
      }

      // 删除菜品
      await connection.query(
        'DELETE FROM menu_items WHERE id = ?',
        [itemId]
      );

      await connection.commit();
      
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting menu item:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error deleting menu item', 500);
    } finally {
      connection.release();
    }
  }
}

module.exports = MenuItem; 
const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Cart {
  static async getCart(userId) {
    const pool = database.getPool();
    try {
      const [carts] = await pool.query(`
        SELECT 
          c.*,
          r.id as restaurant_id,
          r.name as restaurant_name
        FROM carts c
        LEFT JOIN restaurants r ON c.restaurant_id = r.id
        WHERE c.user_id = ?
      `, [userId]);
      
      if (carts.length === 0) {
        return {
          restaurantId: null,
          items: [],
          total: 0
        };
      }
      
      const cart = carts[0];
      const [items] = await pool.query(`
        SELECT 
          ci.*,
          m.name,
          m.price
        FROM cart_items ci
        JOIN menu_items m ON ci.menu_item_id = m.id
        WHERE ci.cart_id = ?
      `, [cart.id]);
      
      return {
        restaurantId: cart.restaurant_id,
        items: items.map(item => ({
          id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
    } catch (error) {
      throw new AppError('Error fetching cart', 500);
    }
  }
  
  static async addItem(userId, menuItemId, quantity) {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 获取菜品信息和餐厅ID
      const [menuItems] = await connection.query(`
        SELECT id, restaurant_id, price FROM menu_items WHERE id = ?
      `, [menuItemId]);
      
      if (menuItems.length === 0) {
        throw new AppError('Menu item not found', 404);
      }
      
      const menuItem = menuItems[0];
      
      // 检查或创建购物车
      let [carts] = await connection.query(`
        SELECT id, restaurant_id FROM carts WHERE user_id = ?
      `, [userId]);
      
      let cartId;
      
      if (carts.length === 0) {
        // 创建新购物车
        const [result] = await connection.query(`
          INSERT INTO carts (user_id, restaurant_id) VALUES (?, ?)
        `, [userId, menuItem.restaurant_id]);
        cartId = result.insertId;
      } else {
        // 检查是否是同一家餐厅
        if (carts[0].restaurant_id !== menuItem.restaurant_id) {
          throw new AppError('Cannot add items from different restaurants', 400);
        }
        cartId = carts[0].id;
      }
      
      // 更新或插入购物车项
      const [existingItems] = await connection.query(`
        SELECT id, quantity FROM cart_items 
        WHERE cart_id = ? AND menu_item_id = ?
      `, [cartId, menuItemId]);
      
      if (existingItems.length > 0) {
        await connection.query(`
          UPDATE cart_items 
          SET quantity = quantity + ?
          WHERE id = ?
        `, [quantity, existingItems[0].id]);
      } else {
        await connection.query(`
          INSERT INTO cart_items (cart_id, menu_item_id, quantity)
          VALUES (?, ?, ?)
        `, [cartId, menuItemId, quantity]);
      }
      
      await connection.commit();
      return await this.getCart(userId);
    } catch (error) {
      await connection.rollback();
      if (error instanceof AppError) throw error;
      throw new AppError('Error adding item to cart', 500);
    } finally {
      connection.release();
    }
  }
  
  static async updateItemQuantity(userId, menuItemId, quantity) {
    const pool = database.getPool();
    try {
      if (quantity === 0) {
        return await this.removeItem(userId, menuItemId);
      }
      
      const [result] = await pool.query(`
        UPDATE cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        SET ci.quantity = ?
        WHERE c.user_id = ? AND ci.menu_item_id = ?
      `, [quantity, userId, menuItemId]);
      
      if (result.affectedRows === 0) {
        throw new AppError('Cart item not found', 404);
      }
      
      return await this.getCart(userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating cart item', 500);
    }
  }
  
  static async removeItem(userId, menuItemId) {
    const pool = database.getPool();
    try {
      await pool.query(`
        DELETE ci FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ? AND ci.menu_item_id = ?
      `, [userId, menuItemId]);
      
      // 如果购物车为空，删除购物车
      await pool.query(`
        DELETE c FROM carts c
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        WHERE c.user_id = ? AND ci.id IS NULL
      `, [userId]);
      
      return await this.getCart(userId);
    } catch (error) {
      throw new AppError('Error removing item from cart', 500);
    }
  }
  
  static async clearCart(userId) {
    const pool = database.getPool();
    try {
      await pool.query(`
        DELETE FROM carts WHERE user_id = ?
      `, [userId]);
      
      return {
        restaurantId: null,
        items: [],
        total: 0
      };
    } catch (error) {
      throw new AppError('Error clearing cart', 500);
    }
  }
}

module.exports = Cart; 
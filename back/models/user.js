const database = require('../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');

class User {
  static async registerCustomer(userData) {
    const pool = database.getPool();
    const { username, password, email, phone } = userData;

    try {
      // 检查用户名和邮箱是否已存在
      const [existingUser] = await pool.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser.length > 0) {
        throw new AppError('Username or email already exists', 400);
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const [result] = await pool.query(
        `INSERT INTO users (username, password, email, phone, type)
         VALUES (?, ?, ?, ?, 'customer')`,
        [username, hashedPassword, email, phone]
      );

      return {
        id: result.insertId,
        username,
        email,
        phone,
        type: 'customer'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating user', 500);
    }
  }

  static async registerRestaurant(restaurantData) {
    const pool = database.getPool();
    const { username, password, email, phone, restaurant_name, description, cuisine_type, address } = restaurantData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 检查用户名、邮箱和餐厅名是否已存在
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser.length > 0) {
        throw new AppError('Username or email already exists', 400);
      }

      const [existingRestaurant] = await connection.query(
        'SELECT id FROM restaurants WHERE restaurant_name = ?',
        [restaurant_name]
      );

      if (existingRestaurant.length > 0) {
        throw new AppError('Restaurant name already exists', 400);
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const [userResult] = await connection.query(
        `INSERT INTO users (username, password, email, phone, type)
         VALUES (?, ?, ?, ?, 'restaurant')`,
        [username, hashedPassword, email, phone]
      );

      // 创建餐厅
      const [restaurantResult] = await connection.query(
        `INSERT INTO restaurants (user_id, restaurant_name, description, cuisine_type, address, phone, email)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userResult.insertId, restaurant_name, description, cuisine_type, address, phone, email]
      );

      await connection.commit();

      return {
        id: userResult.insertId,
        restaurant_id: restaurantResult.insertId,
        username,
        email,
        phone,
        restaurant_name,
        description,
        cuisine_type,
        address,
        type: 'restaurant'
      };
    } catch (error) {
      await connection.rollback();
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating restaurant', 500);
    } finally {
      connection.release();
    }
  }

  static async loginCustomer(username, password) {
    const pool = database.getPool();

    try {
      // 查找用户
      const [users] = await pool.query(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND type = "customer"',
        [username, username]
      );

      if (users.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error during login', 500);
    }
  }

  static async loginRestaurant(username, password) {
    const pool = database.getPool();

    try {
      // 查找用户
      const [users] = await pool.query(
        `SELECT u.*, r.id as restaurant_id, r.restaurant_name, r.description, 
                r.cuisine_type, r.address, r.status
         FROM users u
         JOIN restaurants r ON u.id = r.user_id
         WHERE (u.username = ? OR u.email = ?) AND u.type = "restaurant"`,
        [username, username]
      );

      if (users.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // 检查餐厅状态
      if (user.status === 'suspended') {
        throw new AppError('Restaurant account is suspended', 403);
      }

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error during login', 500);
    }
  }

  static async updateCustomerProfile(userId, updateData) {
    const pool = database.getPool();
    const { email, phone } = updateData;

    try {
      if (email) {
        const [existingUsers] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );

        if (existingUsers.length > 0) {
          throw new AppError('Email already in use', 400);
        }
      }

      await pool.query(
        'UPDATE users SET email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
        [email, phone, userId]
      );

      const [updatedUser] = await pool.query(
        'SELECT id, username, email, phone, type FROM users WHERE id = ?',
        [userId]
      );

      return updatedUser[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating profile', 500);
    }
  }

  static async updateRestaurantProfile(userId, updateData) {
    const pool = database.getPool();
    const { email, phone, restaurant_name, description, cuisine_type, address } = updateData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (email) {
        const [existingUsers] = await connection.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );

        if (existingUsers.length > 0) {
          throw new AppError('Email already in use', 400);
        }
      }

      if (restaurant_name) {
        const [existingRestaurants] = await connection.query(
          'SELECT id FROM restaurants WHERE restaurant_name = ? AND user_id != ?',
          [restaurant_name, userId]
        );

        if (existingRestaurants.length > 0) {
          throw new AppError('Restaurant name already in use', 400);
        }
      }

      // 更新用户信息
      await connection.query(
        'UPDATE users SET email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
        [email, phone, userId]
      );

      // 更新餐厅信息
      await connection.query(
        `UPDATE restaurants 
         SET restaurant_name = COALESCE(?, restaurant_name),
             description = COALESCE(?, description),
             cuisine_type = COALESCE(?, cuisine_type),
             address = COALESCE(?, address),
             phone = COALESCE(?, phone),
             email = COALESCE(?, email)
         WHERE user_id = ?`,
        [restaurant_name, description, cuisine_type, address, phone, email, userId]
      );

      await connection.commit();

      const [updatedRestaurant] = await connection.query(
        `SELECT u.id, u.username, u.email, u.phone, u.type,
                r.id as restaurant_id, r.restaurant_name, r.description,
                r.cuisine_type, r.address, r.status
         FROM users u
         JOIN restaurants r ON u.id = r.user_id
         WHERE u.id = ?`,
        [userId]
      );

      return updatedRestaurant[0];
    } catch (error) {
      await connection.rollback();
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating profile', 500);
    } finally {
      connection.release();
    }
  }
}

module.exports = User; 
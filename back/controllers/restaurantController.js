const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menuItem');
const { AppError } = require('../middleware/errorHandler');
const database = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// ��ȡ�����б�
exports.getRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const pool = database.getPool();

    console.log('Restaurant Query Params:', { page, limit, offset });

    // �Ȼ�ȡ����
    const [totalResult] = await pool.query(`
      SELECT COUNT(DISTINCT r.id) as total
      FROM restaurants r
      LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
      LEFT JOIN categories c ON rc.category_id = c.id
      WHERE 1=1
    `);
    
    const total = totalResult[0].total;
    console.log('Total restaurants:', total);

    // ��ȡ�����б�
    const [restaurants] = await pool.query(`
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
      GROUP BY r.id 
      ORDER BY r.created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    console.log('Restaurant Query:', restaurants.length);
    console.log('Restaurant data:', JSON.stringify(restaurants, null, 2));

    // ��������ַ���
    const processedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      categories: restaurant.categories ? restaurant.categories.split(',') : []
    }));

    res.json({
      status: 'success',
      data: {
        restaurants: processedRestaurants,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    next(error);
  }
};

// ��ȡ���Ų���
exports.getPopularRestaurants = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const restaurants = await Restaurant.getPopular(limit);
    res.json({
      status: 'success',
      data: { restaurants }
    });
  } catch (error) {
    next(error);
  }
};

// ��ȡ��������
exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.getById(req.params.id);
    res.json({
      status: 'success',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// ��ȡ������Ʒ
exports.getRestaurantMenuItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = database.getPool();

    console.log('Getting menu items for restaurant:', id);

    // ���ȼ��menu_items���е�ԭʼ����
    const [rawMenuItems] = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ?',
      [id]
    );
    console.log('Raw menu items data:', JSON.stringify(rawMenuItems, null, 2));

    // ���categories���ԭʼ����
    const [rawCategories] = await pool.query('SELECT * FROM categories');
    console.log('Raw categories data:', JSON.stringify(rawCategories, null, 2));

    // ��ȡ���в�Ʒ������ࣨ����ϸ��Ϣ��
    const [menuItems] = await pool.query(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.image_url,
        m.is_available,
        m.category_id,
        c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = ?
      ORDER BY COALESCE(c.name, 'Uncategorized'), m.name
    `, [id]);

    console.log('Joined menu items data:', JSON.stringify(menuItems, null, 2));

    // ��������֯��Ʒ
    const menuByCategory = menuItems.reduce((acc, item) => {
      console.log('Processing menu item:', item);
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

    console.log('Organized menu items:', JSON.stringify(menuByCategory, null, 2));

    // ��ȡ���з���
    const [categories] = await pool.query(`
      SELECT DISTINCT c.name
      FROM categories c
      INNER JOIN menu_items m ON m.category_id = c.id
      WHERE m.restaurant_id = ?
    `, [id]);

    console.log('Final categories:', JSON.stringify(categories, null, 2));

    res.json({
      status: 'success',
      data: {
        menu_items: menuByCategory,
        categories: categories.map(c => c.name)
      }
    });
  } catch (error) {
    console.error('Error getting menu items:', error);
    next(error);
  }
};

// ���²�����Ϣ
exports.updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.update(id, req.body);
    res.json({
      status: 'success',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// ���²���״̬
exports.updateRestaurantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.updateStatus(id, req.body.status);
    res.json({
      status: 'success',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// ��Ӳ�Ʒ
exports.addMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Adding menu item for restaurant:', id);
    console.log('Menu item data:', req.body);

    const menuItem = await MenuItem.create(id, req.body);
    console.log('Created menu item:', menuItem);

    res.status(201).json({
      status: 'success',
      data: { menuItem }
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    next(error);
  }
};

// ���²�Ʒ
exports.updateMenuItem = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id, itemId } = req.params;
    const { name, description, price, category, image_url, is_available } = req.body;

    console.log('Updating menu item:', { id, itemId, ...req.body });

    // ��֤��Ʒ�Ƿ����ڸò���
    const [existingItem] = await connection.query(
      'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [itemId, id]
    );

    if (existingItem.length === 0) {
      throw new AppError('Menu item not found or does not belong to this restaurant', 404);
    }

    // ����ṩ�˷��࣬��ȡ�򴴽�����ID
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

    // ���²�Ʒ
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

    // ��ȡ���º�Ĳ�Ʒ
    const [menuItem] = await pool.query(
      `SELECT m.*, c.name as category_name
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = ?`,
      [itemId]
    );

    console.log('Updated menu item:', menuItem[0]);

    res.json({
      status: 'success',
      data: {
        menuItem: {
          id: menuItem[0].id,
          name: menuItem[0].name,
          description: menuItem[0].description,
          price: parseFloat(menuItem[0].price),
          image_url: menuItem[0].image_url,
          category: menuItem[0].category_name,
          is_available: Boolean(menuItem[0].is_available)
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

// ɾ����Ʒ
exports.deleteMenuItem = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id, itemId } = req.params;
    console.log('Deleting menu item:', { restaurantId: id, itemId });

    // ��֤��Ʒ�Ƿ����ڸò���
    const [existingItem] = await connection.query(
      'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [itemId, id]
    );

    if (existingItem.length === 0) {
      throw new AppError('Menu item not found or does not belong to this restaurant', 404);
    }

    // ɾ����Ʒ
    await connection.query(
      'DELETE FROM menu_items WHERE id = ?',
      [itemId]
    );

    await connection.commit();
    console.log('Menu item deleted successfully');

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting menu item:', error);
    next(error);
  } finally {
    connection.release();
  }
};

// ���²���ͼƬ
exports.updateRestaurantImage = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    // ��֤�Ƿ��ϴ���ͼƬ
    if (!req.file) {
      throw new AppError('Please upload an image', 400);
    }

    // ��ȡ��ǰ������Ϣ
    const [restaurant] = await connection.query(
      'SELECT image FROM restaurants WHERE id = ?',
      [id]
    );

    if (restaurant.length === 0) {
      throw new AppError('Restaurant not found', 404);
    }

    // ɾ����ͼƬ
    if (restaurant[0].image) {
      const oldImagePath = restaurant[0].image.split('/').pop();
      const fullPath = path.join('public/uploads', oldImagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // ������ͼƬURL
    const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // ���²���ͼƬURL
    await connection.query(
      'UPDATE restaurants SET image = ? WHERE id = ?',
      [imageUrl, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });

  } catch (error) {
    // �������ɾ���ϴ����ļ�
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  } finally {
    connection.release();
  }
};

// ��ȡ���з���
exports.getAllCategories = async (req, res, next) => {
  const pool = database.getPool();
  
  try {
    const [categories] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    
    res.json({
      status: 'success',
      data: {
        categories: categories
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    next(error);
  }
};

// ע�������������Ʒ�͹���Ա�˺ţ�
exports.registerRestaurant = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      email,
      password,
      name,
      phone,
      restaurantName,
      description = null,
      address,
      restaurantPhone = phone,
      categories = [], // ���ڽ��շ���ID����
      delivery_fee = 0,
      minimum_order = 0,
      opening_hours = null
    } = req.body;

    // ��֤�����ֶ�
    if (!email || !password || !name || !phone || !restaurantName || !address) {
      throw new AppError('Missing required fields', 400);
    }

    // ��֤�����Ƿ��Ѵ���
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new AppError('Email already exists', 400);
    }

    // ������������Ա�˺�
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password, name, phone, role) 
       VALUES (?, ?, ?, ?, 'restaurant')`,
      [email, hashedPassword, name, phone]
    );

    const userId = userResult.insertId;

    // �������ͼƬ
    let restaurantImageUrl = null;
    if (req.files?.restaurantImage?.[0]) {
      const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
      restaurantImageUrl = `${baseUrl}/uploads/${req.files.restaurantImage[0].filename}`;
    }

    // ��������
    const [restaurantResult] = await connection.query(
      `INSERT INTO restaurants (
        user_id, name, description, address, phone, image,
        delivery_fee, minimum_order, opening_hours, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        userId,
        restaurantName,
        description,
        address,
        restaurantPhone,
        restaurantImageUrl,
        delivery_fee,
        minimum_order,
        opening_hours ? JSON.stringify(opening_hours) : null
      ]
    );

    const restaurantId = restaurantResult.insertId;

    // ��Ӳ������ࣨʹ�÷���ID��
    if (categories) {
      // ���Խ���categories��������ַ���
      let categoryArray;
      if (typeof categories === 'string') {
        try {
          categoryArray = JSON.parse(categories);
        } catch (e) {
          categoryArray = [categories];
        }
      } else {
        categoryArray = Array.isArray(categories) ? categories : [categories];
      }
      
      // ȷ�����з���ID��������
      const categoryIds = categoryArray.map(id => {
        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
          throw new AppError(`Invalid category ID: ${id}`, 400);
        }
        return numId;
      });
      
      for (const categoryId of categoryIds) {
        // ��֤����ID�Ƿ����
        const [existingCategory] = await connection.query(
          'SELECT id FROM categories WHERE id = ?',
          [categoryId]
        );

        if (existingCategory.length === 0) {
          throw new AppError(`Category with ID ${categoryId} not found`, 400);
        }

        // ��Ӳ���-�������
        await connection.query(
          'INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (?, ?)',
          [restaurantId, categoryId]
        );
      }
    }

    await connection.commit();

    // ��ȡ�����Ĳ�����Ϣ
    const restaurant = await Restaurant.getById(restaurantId);
    
    // ����JWT����
    const token = generateToken({
      id: userId,
      role: 'restaurant',
      restaurant_id: restaurantId
    });

    res.status(201).json({
      status: 'success',
      data: {
        restaurant,
        user: {
          id: userId,
          email,
          name,
          phone,
          role: 'restaurant'
        },
        token
      }
    });

  } catch (error) {
    await connection.rollback();
    // ɾ�����ϴ����ļ�
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      });
    }
    next(error);
  } finally {
    connection.release();
  }
}; 